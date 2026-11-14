// mirror-pdfs — copy each published article's PDF from OJS into Supabase Storage.
//
// The main site links readers and Google Scholar straight to the Storage copy
// (bucket `article-pdfs`, public), so PDF bytes never pass through Vercel.
// Each run copies up to `limit` PDFs that are missing, or whose OJS galley URL
// changed since they were copied (articles.pdf_mirrored_from != pdf_url).
//
// Runs daily via pg_cron (see supabase/migrations) shortly after ingestion, and
// can be called by hand to backfill: POST {"limit": 60}.
//
// Auth: deployed with --no-verify-jwt, gated by the same INGEST_SECRET header as
// ingest-oai. Auto-injected: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY.
// Optional: SITE_URL + REVALIDATE_SECRET to refresh the updated article pages.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const BUCKET = "article-pdfs";
// OJS sits behind ModSecurity, which rejects bare or unusual user agents.
const UPSTREAM_UA = "Mozilla/5.0 (compatible; EPJournalsBot/1.0; +https://www.ep-journals.org)";
const CONCURRENCY = 4;

interface Row {
  id: string;
  title: string;
  journal_abbrev: string;
  pdf_url: string;
  pdf_storage_path: string | null;
  pdf_mirrored_from: string | null;
}

Deno.serve(async (req: Request) => {
  const expected = Deno.env.get("INGEST_SECRET");
  if (!expected) return Response.json({ error: "INGEST_SECRET not configured" }, { status: 500 });
  if (req.headers.get("x-ingest-secret") !== expected) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  let limit = 60;
  try {
    const body = await req.json();
    if (Number.isFinite(body?.limit)) limit = Math.max(1, Math.min(150, Math.floor(body.limit)));
  } catch { /* empty body is fine */ }

  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
    auth: { persistSession: false },
  });

  const { data, error } = await supabase
    .from("articles")
    .select("id, title, journal_abbrev, pdf_url, pdf_storage_path, pdf_mirrored_from")
    .eq("status", "published")
    .not("pdf_url", "is", null)
    .order("publication_date", { ascending: false });
  if (error) return Response.json({ error: error.message }, { status: 500 });

  const todo = (data as Row[]).filter((r) => !r.pdf_storage_path || r.pdf_mirrored_from !== r.pdf_url);
  const batch = todo.slice(0, limit);
  const mirrored: string[] = [];
  const failed: { id: string; reason: string }[] = [];

  let next = 0;
  async function worker() {
    while (next < batch.length) {
      const row = batch[next++];
      try {
        const res = await fetch(row.pdf_url, {
          headers: { "User-Agent": UPSTREAM_UA, Accept: "application/pdf" },
          signal: AbortSignal.timeout(45_000),
        });
        if (!res.ok) throw new Error(`OJS returned HTTP ${res.status}`);
        const bytes = new Uint8Array(await res.arrayBuffer());
        // Accept only real PDFs: OJS sometimes answers with an HTML error page.
        if (new TextDecoder().decode(bytes.slice(0, 5)) !== "%PDF-") throw new Error("not a PDF");

        const path = `${row.journal_abbrev.toLowerCase()}/${row.id}.pdf`;
        const up = await supabase.storage.from(BUCKET).upload(path, bytes, {
          contentType: "application/pdf",
          cacheControl: "31536000",
          upsert: true,
        });
        if (up.error) throw new Error(`storage: ${up.error.message}`);

        const upd = await supabase
          .from("articles")
          .update({ pdf_storage_path: path, pdf_mirrored_from: row.pdf_url })
          .eq("id", row.id);
        if (upd.error) throw new Error(`db: ${upd.error.message}`);
        mirrored.push(row.id);
      } catch (e) {
        failed.push({ id: row.id, reason: e instanceof Error ? e.message : String(e) });
      }
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));

  // Refresh the main site's listings so article pages pick up the new PDF link.
  let revalidated = false;
  const siteUrl = Deno.env.get("SITE_URL");
  const revalidateSecret = Deno.env.get("REVALIDATE_SECRET");
  if (mirrored.length && siteUrl && revalidateSecret) {
    try {
      const r = await fetch(`${siteUrl.replace(/\/+$/, "")}/api/revalidate`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-revalidate-secret": revalidateSecret },
        body: JSON.stringify({ paths: ["/", "/articles"] }),
      });
      revalidated = r.ok;
    } catch { /* site may be unreachable; pages refresh on their own ISR cycle */ }
  }

  return Response.json({
    ok: true,
    pendingBefore: todo.length,
    mirrored: mirrored.length,
    remaining: todo.length - mirrored.length,
    failed,
    revalidated,
  });
});
