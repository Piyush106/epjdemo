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
  // OJS landing page (version of record) is .../article/view/<articleId> —
  // one numeric segment. Two segments (.../view/<a>/<g>) is a galley, not the landing.
  const landing = identifiers.find((id) => /^https?:\/\/.*\/article\/view\/\d+\/?$/.test(id));
  if (landing) return landing.replace(/\/$/, "");
  const anyView = identifiers.find((id) => /^https?:\/\/.*\/article\/view\//.test(id));
  return anyView ? anyView.replace(/\/$/, "") : null;
}

function extractPdfUrl(identifiers: string[], relations: string[]): string | null {
  const candidates = [...relations, ...identifiers];
  // Direct file: .../article/download/<a>/<g> or a .pdf URL.
  const direct = candidates.find(
    (u) => /^https?:\/\//.test(u) && (/\/article\/download\//.test(u) || /\.pdf($|\?)/i.test(u)),
  );
  if (direct) return direct;
  // OJS exposes the galley as a view URL (.../article/view/<a>/<g>); the direct
  // file is the same path with /view/ → /download/. That is the galley PDF.
  const galley = candidates.find((u) => /^https?:\/\/.*\/article\/view\/\d+\/\d+\/?$/.test(u));
  if (galley) return galley.replace("/article/view/", "/article/download/").replace(/\/$/, "");
  return null;
}

function extractKeywords(subjects: string[]): string[] | null {
  // OJS may emit one comma/semicolon-separated dc:subject, or several elements.
  const out: string[] = [];
  for (const s of subjects) {
    for (const part of s.split(/[;,]/)) {
      const k = part.trim();
      if (k) out.push(k);
    }
  }
  return out.length ? Array.from(new Set(out)) : null;
}

function parseVolumeIssuePages(sources: string[]): { volume: string | null; issue: string | null; pages: string | null } {
  // The citation source carries the issue info + page range; sibling dc:source
  // values are bare ISSNs (e.g. "3051-3782") — exclude them so they aren't read
  // as a page range. The citation one contains ';' (or "Vol").
  const citation = sources.find((s) => s.includes(";") || /vol/i.test(s)) ?? "";
  const volume = citation.match(/\bVol(?:ume)?\.?\s*([\w]+)/i)?.[1] ?? null;
  const issue = citation.match(/\b(?:No|Issue)\.?\s*([\w]+)/i)?.[1] ?? null;
  // Pages live in the segment after the last ';', e.g. "...; 1-7".
  const tail = citation.split(";").pop() ?? "";
  const pages = tail.match(/(\d+\s*[-–]\s*\d+)/)?.[1]?.replace(/\s+/g, "") ?? null;
  return { volume, issue, pages };
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
        keywords: extractKeywords(dcValues(rec, "subject")),
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
