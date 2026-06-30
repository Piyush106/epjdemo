// ingest-oai — OAI-PMH article ingestion for EP Journals.
//
// Runs on a 3-day pg_cron schedule (see supabase/migrations). For each active
// journal it derives the OJS OAI-PMH endpoint from `external_url`, harvests the
// `oai_dc` records (following resumptionToken pages), maps them to `articles`
// columns, and upserts — deduping on `doi`, falling back to `article_url`.
// After ingestion it pings the Next.js on-demand revalidation route so the
// homepage slideshow + article listings pick up new articles immediately.
//
// Auth: deployed with --no-verify-jwt, so it is gated by a shared secret in the
// `x-ingest-secret` header (env INGEST_SECRET). The cron job sends it from Vault.
//
// Env (set via `supabase secrets set`):
//   INGEST_SECRET       required — shared secret guarding this function
//   SITE_URL            required — deployed site origin, e.g. https://www.ep-journals.org
//   REVALIDATE_SECRET   required — shared secret for the Next.js /api/revalidate route
// Auto-injected by Supabase: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ---- types --------------------------------------------------------------

interface Journal {
  abbrev: string;
  title: string;
  external_url: string;
  status: string;
}

interface ArticleRow {
  id?: string;
  title: string;
  authors: string;
  abstract: string;
  keywords: string[] | null;
  doi: string | null;
  journal_abbrev: string;
  journal_name: string;
  publication_date: string;
  volume: string | null;
  issue: string | null;
  pages: string | null;
  status: string;
  article_url: string | null;
  pdf_url: string | null;
}

// ---- tiny OAI oai_dc parser (dependency-free) ---------------------------
// Deno's edge runtime has no built-in XML DOM. oai_dc is flat and regular, so
// we scope-extract per <record> then pull repeated Dublin Core fields. This is
// a targeted OAI parser, not a general XML parser.

function decodeEntities(s: string): string {
  return s
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#x27;/gi, "'")
    .replace(/&#39;/g, "'")
    .replace(/&#x2F;/gi, "/")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&amp;/g, "&"); // last, so we don't double-decode
}

/** All values of a repeated `dc:<tag>` within a record block, trimmed + decoded. */
function dcValues(recordXml: string, tag: string): string[] {
  const re = new RegExp(`<dc:${tag}\\b[^>]*>([\\s\\S]*?)<\\/dc:${tag}>`, "g");
  const out: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(recordXml)) !== null) {
    const v = decodeEntities(m[1]).replace(/\s+/g, " ").trim();
    if (v) out.push(v);
  }
  return out;
}

function dcFirst(recordXml: string, tag: string): string | null {
  const all = dcValues(recordXml, tag);
  return all.length ? all[0] : null;
}

const DOI_RE = /\b(10\.\d{4,9}\/[^\s"'<>]+)/;

function extractDoi(identifiers: string[]): string | null {
  for (const id of identifiers) {
    const m = id.match(DOI_RE);
    if (m) return m[1].replace(/[.,;]+$/, ""); // strip trailing punctuation
  }
  return null;
}

function extractArticleUrl(identifiers: string[]): string | null {
  // OJS landing page is the version of record: .../article/view/<id>
  const landing = identifiers.find((id) => /\/article\/view\/[^/]+\/?$/.test(id) || /\/article\/view\/\d+$/.test(id));
  if (landing) return landing;
  // fall back to any article/view URL even with a galley segment
  const anyView = identifiers.find((id) => /\/article\/view\//.test(id) && /^https?:\/\//.test(id));
  return anyView ?? null;
}

function extractPdfUrl(identifiers: string[], relations: string[]): string | null {
  const candidates = [...identifiers, ...relations];
  // OJS galley download: .../article/download/<id>/<galley>  or a .pdf URL
  const pdf = candidates.find((u) => /^https?:\/\//.test(u) && (/\/article\/download\//.test(u) || /\.pdf($|\?)/i.test(u)));
  return pdf ?? null;
}

function parseVolumeIssuePages(sources: string[]): { volume: string | null; issue: string | null; pages: string | null } {
  const src = sources.join(" ; ");
  // e.g. "Journal of X; Vol 12 No 3 (2025); 45-58"
  const vol = src.match(/\bVol(?:ume)?\.?\s*([\w]+)/i)?.[1] ?? null;
  const iss = src.match(/\b(?:No|Issue)\.?\s*([\w]+)/i)?.[1] ?? null;
  const pages = src.match(/\b(\d+\s*[-–]\s*\d+)\b/)?.[1]?.replace(/\s+/g, "") ?? null;
  return { volume: vol, issue: iss, pages };
}

function normalizeDate(raw: string | null, fallback: string): string {
  if (!raw) return fallback;
  // OJS dc:date is often a full ISO timestamp; keep YYYY-MM-DD.
  const m = raw.match(/\d{4}-\d{2}-\d{2}/);
  if (m) return m[0];
  const yr = raw.match(/\b(19|20)\d{2}\b/);
  return yr ? `${yr[0]}-01-01` : fallback;
}

function splitRecords(xml: string): string[] {
  const re = /<record\b[\s\S]*?<\/record>/g;
  return xml.match(re) ?? [];
}

function isDeleted(recordXml: string): boolean {
  return /<header\b[^>]*\bstatus="deleted"/.test(recordXml);
}

function extractResumptionToken(xml: string): string | null {
  const m = xml.match(/<resumptionToken\b[^>]*>([\s\S]*?)<\/resumptionToken>/);
  const tok = m?.[1]?.trim();
  return tok && tok.length ? tok : null;
}

// ---- endpoint + harvest -------------------------------------------------

function oaiEndpoint(journal: Journal): string {
  const base = journal.external_url.replace(/\/+$/, "");
  // external_url may already include the OJS path (.../index.php/<abbrev>)
  if (/\/index\.php\//.test(base)) return `${base}/oai`;
  return `${base}/index.php/${journal.abbrev.toLowerCase()}/oai`;
}

const MAX_PAGES = 50; // safety cap against runaway resumption loops

async function harvestJournal(journal: Journal, today: string): Promise<ArticleRow[]> {
  const endpoint = oaiEndpoint(journal);
  const rows: ArticleRow[] = [];
  let token: string | null = null;
  let pages = 0;

  do {
    const url = token
      ? `${endpoint}?verb=ListRecords&resumptionToken=${encodeURIComponent(token)}`
      : `${endpoint}?verb=ListRecords&metadataPrefix=oai_dc`;

    const res = await fetch(url, { headers: { Accept: "application/xml" } });
    if (!res.ok) {
      console.error(`[${journal.abbrev}] OAI HTTP ${res.status} at ${url}`);
      break;
    }
    const xml = await res.text();

    if (/<error\b[^>]*code="noRecordsMatch"/.test(xml)) break;
    const errMatch = xml.match(/<error\b[^>]*code="([^"]+)"/);
    if (errMatch) {
      console.error(`[${journal.abbrev}] OAI error: ${errMatch[1]}`);
      break;
    }

    for (const rec of splitRecords(xml)) {
      if (isDeleted(rec)) continue;
      const title = dcFirst(rec, "title");
      if (!title) continue; // skip malformed records

      const identifiers = dcValues(rec, "identifier");
      const relations = dcValues(rec, "relation");
      const sources = dcValues(rec, "source");
      const { volume, issue, pages: pp } = parseVolumeIssuePages(sources);
      const headerDate = rec.match(/<datestamp>([\s\S]*?)<\/datestamp>/)?.[1] ?? null;

      rows.push({
        title,
        authors: dcValues(rec, "creator").join(", "),
        abstract: dcValues(rec, "description").sort((a, b) => b.length - a.length)[0] ?? "",
        keywords: dcValues(rec, "subject").length ? dcValues(rec, "subject") : null,
        doi: extractDoi(identifiers),
        journal_abbrev: journal.abbrev,
        journal_name: journal.title,
        publication_date: normalizeDate(dcFirst(rec, "date") ?? headerDate, today),
        volume,
        issue,
        pages: pp,
        status: "published",
        article_url: extractArticleUrl(identifiers),
        pdf_url: extractPdfUrl(identifiers, relations),
      });
    }

    token = extractResumptionToken(xml);
    pages += 1;
  } while (token && pages < MAX_PAGES);

  if (pages >= MAX_PAGES) console.warn(`[${journal.abbrev}] hit MAX_PAGES (${MAX_PAGES}); harvest may be truncated`);
  return rows;
}

// ---- main handler -------------------------------------------------------

Deno.serve(async (req: Request) => {
  // gate: shared secret (function deployed with --no-verify-jwt)
  const expected = Deno.env.get("INGEST_SECRET");
  if (!expected) {
    return Response.json({ error: "INGEST_SECRET not configured" }, { status: 500 });
  }
  if (req.headers.get("x-ingest-secret") !== expected) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

  const today = new Date().toISOString().slice(0, 10);

  const { data: journals, error: jErr } = await supabase
    .from("journals")
    .select("abbrev, title, external_url, status")
    .eq("status", "active");

  if (jErr) return Response.json({ error: `journals query failed: ${jErr.message}` }, { status: 500 });

  const summary: Record<string, { harvested: number; inserted: number; updated: number; error?: string }> = {};

  for (const journal of (journals ?? []) as Journal[]) {
    try {
      const harvested = await harvestJournal(journal, today);

      // Existing rows for this journal → dedupe maps (doi primary, article_url fallback).
      const { data: existing } = await supabase
        .from("articles")
        .select("id, doi, article_url")
        .eq("journal_abbrev", journal.abbrev);

      const byDoi = new Map<string, string>();
      const byUrl = new Map<string, string>();
      for (const e of (existing ?? []) as { id: string; doi: string | null; article_url: string | null }[]) {
        if (e.doi) byDoi.set(e.doi, e.id);
        if (e.article_url) byUrl.set(e.article_url, e.id);
      }

      let inserted = 0;
      let updated = 0;
      const toUpsert: ArticleRow[] = [];
      for (const row of harvested) {
        const matchId = (row.doi && byDoi.get(row.doi)) || (row.article_url && byUrl.get(row.article_url)) || null;
        if (matchId) {
          toUpsert.push({ ...row, id: matchId });
          updated += 1;
        } else {
          toUpsert.push(row);
          inserted += 1;
        }
      }

      // Single upsert on the primary key: rows with `id` update, rows without insert.
      for (let i = 0; i < toUpsert.length; i += 500) {
        const chunk = toUpsert.slice(i, i + 500);
        const { error: upErr } = await supabase.from("articles").upsert(chunk, { onConflict: "id" });
        if (upErr) throw new Error(upErr.message);
      }

      summary[journal.abbrev] = { harvested: harvested.length, inserted, updated };
      console.log(`[${journal.abbrev}] harvested ${harvested.length} (insert ${inserted}, update ${updated})`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      summary[journal.abbrev] = { harvested: 0, inserted: 0, updated: 0, error: msg };
      console.error(`[${journal.abbrev}] FAILED: ${msg}`);
    }
  }

  // Trigger Next.js on-demand revalidation so listings show new articles now.
  const siteUrl = Deno.env.get("SITE_URL");
  const revalidateSecret = Deno.env.get("REVALIDATE_SECRET");
  let revalidated = false;
  if (siteUrl && revalidateSecret) {
    try {
      const r = await fetch(`${siteUrl.replace(/\/+$/, "")}/api/revalidate`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-revalidate-secret": revalidateSecret },
        body: JSON.stringify({ paths: ["/", "/articles"] }),
      });
      revalidated = r.ok;
      if (!r.ok) console.error(`revalidate returned HTTP ${r.status}`);
    } catch (e) {
      console.error(`revalidate call failed: ${e instanceof Error ? e.message : String(e)}`);
    }
  } else {
    console.warn("SITE_URL / REVALIDATE_SECRET unset — skipping revalidation");
  }

  return Response.json({ ok: true, ranAt: new Date().toISOString(), revalidated, summary });
});
