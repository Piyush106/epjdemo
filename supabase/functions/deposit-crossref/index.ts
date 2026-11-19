// deposit-crossref — register every published article's DOI with Crossref.
//
// OJS has no registration agency configured, so DOIs printed on new articles
// were never deposited and resolved to "DOI not found" (109 by 19 Nov 2026).
// This function finds published articles whose DOI does not resolve at doi.org
// and deposits them in one Crossref 5.3.1 batch, with the www.ep-journals.org
// article page as the resolution URL (the version of record), the abstract,
// the CC BY 4.0 licence and the same-site PDF for Similarity Check/text mining.
//
// Runs daily via pg_cron after ingestion (see supabase/migrations). Re-running
// is safe: registered DOIs are skipped, and a repeat deposit only overwrites.
//
// Request body (all optional):
//   { "dry_run": true }        build and return the XML without depositing
//   { "dois": ["10.65150/…"] }  deposit only these DOIs (also forces re-deposit
//                               of registered ones, e.g. to correct metadata)
//   { "limit": 200 }            cap on records per batch
//
// Auth: deployed with --no-verify-jwt, gated by the same INGEST_SECRET header as
// ingest-oai. Secrets: CROSSREF_LOGIN_ID (e.g. "user/role" or "user"),
// CROSSREF_PASSWORD, optional CROSSREF_DEPOSITOR_EMAIL. Without the Crossref
// secrets the function always behaves as a dry run.
// Auto-injected: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SITE = "https://www.ep-journals.org";
const DEPOSIT_URL = "https://doi.crossref.org/servlet/deposit";
const CHECK_CONCURRENCY = 16;

interface Article {
  id: string; title: string; authors: string; abstract: string; doi: string;
  journal_abbrev: string; publication_date: string;
  volume: string | number | null; issue: string | number | null; pages: string | null;
}
interface Journal { abbrev: string; title: string; electronic_issn: string | null; print_issn: string | null }

// ---- URLs: must match lib/articleUrl.ts on the website ---------------------

function slugify(title: string): string {
  return title.normalize("NFKD").replace(/[̀-ͯ]/g, "").toLowerCase()
    .replace(/&/g, " and ").replace(/[^a-z0-9]+/g, " ").trim().split(/\s+/).slice(0, 10).join("-");
}
function articleUrl(a: { id: string; title: string }): string {
  const s = slugify(a.title);
  const short = a.id.slice(0, 8).toLowerCase();
  return `${SITE}/articles/${s ? `${s}-${short}` : short}`;
}

// ---- XML helpers ------------------------------------------------------------

const x = (s: unknown) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const decode = (s: string) => s.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#0?39;|&apos;/g, "'").replace(/&amp;/g, "&");
const norm = (v: unknown) => (/^\d+$/.test(String(v ?? "").trim()) ? String(Number(v)) : String(v ?? "").trim());

const HONORIFIC = /^(dr|prof|professor|assoc|asst|mr|mrs|ms|engr|eng)\.?\s+/i;
const DEGREE = /\b(ph\.?\s?d|m\.?\s?sc|b\.?\s?sc|mba|m\.?a|mass|ragr|cre|m\.?ed|m\.?phil)\.?\b/gi;
/** "Dr. Jane A. Doe, PhD" → { given: "Jane A.", surname: "Doe" }; one word → surname only. */
function person(raw: string): { given?: string; surname: string } | null {
  let n = raw.replace(/\([^)]*\)/g, " ").replace(DEGREE, " ").replace(/\s+/g, " ").trim();
  while (HONORIFIC.test(n)) n = n.replace(HONORIFIC, "");
  n = n.replace(/[.,;]+$/, "").trim();
  if (!n) return null;
  const parts = n.split(" ");
  return parts.length === 1 ? { surname: parts[0] } : { given: parts.slice(0, -1).join(" "), surname: parts[parts.length - 1] };
}

function dateXml(iso: string, ind: string): string {
  const [y, m, d] = iso.slice(0, 10).split("-");
  return `${ind}<publication_date media_type="online">\n${ind}  <month>${m}</month>\n${ind}  <day>${d}</day>\n${ind}  <year>${y}</year>\n${ind}</publication_date>`;
}

function articleXml(a: Article): string {
  const authors = a.authors.split(",").map((s) => person(s.trim())).filter((p): p is NonNullable<typeof p> => p !== null);
  const [fp, lp] = String(a.pages ?? "").split("-").map((p) => p.trim());
  const url = articleUrl(a);
  const pdf = `${url}/pdf`;
  const people = authors.map((p, i) =>
    `          <person_name sequence="${i ? "additional" : "first"}" contributor_role="author">\n` +
    (p.given ? `            <given_name>${x(p.given)}</given_name>\n` : "") +
    `            <surname>${x(p.surname)}</surname>\n          </person_name>`).join("\n");
  return `      <journal_article publication_type="full_text" language="en">
        <titles>
          <title>${x(decode(a.title))}</title>
        </titles>
        <contributors>
${people}
        </contributors>
        <jats:abstract>
          <jats:p>${x(decode(a.abstract ?? ""))}</jats:p>
        </jats:abstract>
${dateXml(a.publication_date, "        ")}
${fp ? `        <pages>\n          <first_page>${x(fp)}</first_page>\n${lp ? `          <last_page>${x(lp)}</last_page>\n` : ""}        </pages>` : ""}
        <ai:program name="AccessIndicators">
          <ai:free_to_read/>
          <ai:license_ref applies_to="vor">https://creativecommons.org/licenses/by/4.0/</ai:license_ref>
        </ai:program>
        <doi_data>
          <doi>${x(a.doi)}</doi>
          <resource>${x(url)}</resource>
          <collection property="crawler-based">
            <item crawler="iParadigms">
              <resource>${x(pdf)}</resource>
            </item>
          </collection>
          <collection property="text-mining">
            <item>
              <resource mime_type="application/pdf">${x(pdf)}</resource>
            </item>
          </collection>
        </doi_data>
      </journal_article>`;
}

/** One batch; one <journal> block per journal issue. */
function batchXml(articles: Article[], journals: Map<string, Journal>, email: string, batchId: string): string {
  const groups = new Map<string, Article[]>();
  for (const a of articles) {
    const k = `${a.journal_abbrev}|${norm(a.volume)}|${norm(a.issue)}`;
    groups.set(k, [...(groups.get(k) ?? []), a]);
  }
  const blocks = [...groups.entries()].sort(([p], [q]) => p.localeCompare(q)).map(([k, arts]) => {
    const [abbrev, vol, iss] = k.split("|");
    const j = journals.get(abbrev);
    arts.sort((p, q) => (parseInt(p.pages ?? "") || 0) - (parseInt(q.pages ?? "") || 0));
    const first = arts.map((a) => a.publication_date).sort()[0];
    return `  <journal>
    <journal_metadata language="en">
      <full_title>${x(j?.title ?? abbrev)}</full_title>
      <abbrev_title>${x(abbrev)}</abbrev_title>
${j?.electronic_issn ? `      <issn media_type="electronic">${x(j.electronic_issn)}</issn>\n` : ""}${j?.print_issn ? `      <issn media_type="print">${x(j.print_issn)}</issn>\n` : ""}    </journal_metadata>
    <journal_issue>
${dateXml(first, "      ")}
      <journal_volume>
        <volume>${x(vol)}</volume>
      </journal_volume>
      <issue>${x(iss)}</issue>
    </journal_issue>
${arts.map(articleXml).join("\n")}
  </journal>`;
  });
  const stamp = new Date().toISOString().replace(/\D/g, "").slice(0, 14);
  return `<?xml version="1.0" encoding="UTF-8"?>
<doi_batch version="5.3.1" xmlns="http://www.crossref.org/schema/5.3.1"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xmlns:jats="http://www.ncbi.nlm.nih.gov/JATS1"
  xmlns:ai="http://www.crossref.org/AccessIndicators.xsd"
  xsi:schemaLocation="http://www.crossref.org/schema/5.3.1 https://www.crossref.org/schemas/crossref5.3.1.xsd">
  <head>
    <doi_batch_id>${x(batchId)}</doi_batch_id>
    <timestamp>${stamp}</timestamp>
    <depositor>
      <depositor_name>EP Journals Group</depositor_name>
      <email_address>${x(email)}</email_address>
    </depositor>
    <registrant>EP-Journals</registrant>
  </head>
  <body>
${blocks.join("\n")}
  </body>
</doi_batch>
`;
}

/** DOIs from `dois` that do not resolve at doi.org (HTTP 404 from the Handle API). */
async function unregistered(dois: string[]): Promise<Set<string>> {
  const missing = new Set<string>();
  let i = 0;
  await Promise.all(Array.from({ length: CHECK_CONCURRENCY }, async () => {
    while (i < dois.length) {
      const d = dois[i++];
      try {
        const r = await fetch(`https://doi.org/api/handles/${encodeURIComponent(d)}`);
        if (r.status === 404) missing.add(d);
      } catch {
        // network trouble: skip this DOI this run rather than risk a bad deposit
      }
    }
  }));
  return missing;
}

Deno.serve(async (req: Request) => {
  const expected = Deno.env.get("INGEST_SECRET");
  if (!expected) return Response.json({ error: "INGEST_SECRET not configured" }, { status: 500 });
  if (req.headers.get("x-ingest-secret") !== expected) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: { dry_run?: boolean; dois?: string[]; limit?: number } = {};
  try { body = await req.json(); } catch { /* no body */ }
  const loginId = Deno.env.get("CROSSREF_LOGIN_ID");
  const password = Deno.env.get("CROSSREF_PASSWORD");
  const email = Deno.env.get("CROSSREF_DEPOSITOR_EMAIL") ?? "editor@ep-journals.org";
  const dryRun = body.dry_run === true || !loginId || !password;
  const limit = Math.min(Math.max(body.limit ?? 300, 1), 1000);

  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
    auth: { persistSession: false },
  });

  const { data: rows, error } = await supabase
    .from("articles")
    .select("id, title, authors, abstract, doi, journal_abbrev, publication_date, volume, issue, pages")
    .eq("status", "published")
    .not("doi", "is", null);
  if (error) return Response.json({ error: error.message }, { status: 500 });
  const { data: jrows } = await supabase.from("journals").select("abbrev, title, electronic_issn, print_issn");
  const journals = new Map(((jrows ?? []) as Journal[]).map((j) => [j.abbrev, j]));

  const all = (rows ?? []) as Article[];
  let picked: Article[];
  if (body.dois?.length) {
    const want = new Set(body.dois.map((d) => d.toLowerCase()));
    picked = all.filter((a) => want.has(a.doi.toLowerCase()));
  } else {
    const missing = await unregistered(all.map((a) => a.doi));
    picked = all.filter((a) => missing.has(a.doi));
  }
  // Records the deposit can't describe properly are reported, not sent.
  const incomplete = picked.filter((a) => !a.title || !a.authors || !a.publication_date || !a.volume || !a.issue);
  picked = picked.filter((a) => !incomplete.includes(a)).slice(0, limit);

  if (!picked.length) {
    return Response.json({ ok: true, dryRun, deposited: 0, incomplete: incomplete.map((a) => a.doi), note: "nothing to deposit" });
  }

  const batchId = `epj-auto-${Date.now()}`;
  const xml = batchXml(picked, journals, email, batchId);
  const dois = picked.map((a) => a.doi);

  if (dryRun) {
    return Response.json({ ok: true, dryRun: true, count: dois.length, dois, incomplete: incomplete.map((a) => a.doi), xml });
  }

  const form = new FormData();
  form.append("operation", "doMDUpload");
  form.append("login_id", loginId!);
  form.append("login_passwd", password!);
  form.append("fname", new Blob([xml], { type: "application/xml" }), `${batchId}.xml`);
  const res = await fetch(DEPOSIT_URL, { method: "POST", body: form });
  const text = await res.text();
  // Crossref replies with an HTML acknowledgement; processing is asynchronous and
  // the result is emailed to the depositor address.
  const accepted = res.ok && /SUCCESS/i.test(text);
  if (!accepted) console.error(`Crossref deposit HTTP ${res.status}: ${text.slice(0, 500)}`);
  return Response.json(
    { ok: accepted, batchId, count: dois.length, dois, incomplete: incomplete.map((a) => a.doi), crossref: { status: res.status, reply: text.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 400) } },
    { status: accepted ? 200 : 502 },
  );
});
