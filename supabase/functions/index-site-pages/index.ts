// index-site-pages — copy the text of the site's static public pages (policies,
// FAQ, about, author guidelines, indexing, publication process…) into
// public.site_pages so the website search can find them.
//
// Reads the live sitemap, skips URLs whose content already lives in the
// database (articles, Knowledge Centre pages, journal archives/issues), fetches
// each remaining page and stores its <title>, meta description and main text.
// Pages that disappear from the sitemap are removed from the index.
//
// Runs weekly via pg_cron and can be called by hand: POST {}.
// Auth: --no-verify-jwt, gated by INGEST_SECRET (x-ingest-secret header).
// Env: SITE_URL (default https://www.ep-journals.org), SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SKIP = [
  /^\/articles\//, /^\/guides\/./, /^\/comparisons\/./, /^\/publishing\/./, /^\/resources\/./,
  /^\/journals\/[^/]+\/(archive|v\d+)/, /^\/journals\/[^/]+$/, /^\/login/, /^\/signup/, /^\/admin/, /^\/unsubscribe/, /^\/search/,
];

const decode = (s: string) =>
  s.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#x27;|&#39;/g, "'").replace(/&nbsp;/g, " ")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)));

function extract(html: string) {
  const title = decode((html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? "").trim()).replace(/\s*\|\s*EP Journals Group\s*$/i, "");
  const description = decode(html.match(/<meta[^>]+name="description"[^>]+content="([^"]*)"/i)?.[1] ?? "");
  let body = html.match(/<main[\s\S]*?<\/main>/i)?.[0] ?? html.match(/<body[\s\S]*?<\/body>/i)?.[0] ?? "";
  body = body
    .replace(/<(script|style|noscript|svg|nav|header|footer)[\s\S]*?<\/\1>/gi, " ")
    .replace(/<[^>]+>/g, " ");
  body = decode(body).replace(/\s+/g, " ").trim().slice(0, 60000);
  const h1 = decode((html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1] ?? "").replace(/<[^>]+>/g, "").trim());
  return { title: title || h1, description, body };
}

Deno.serve(async (req: Request) => {
  const expected = Deno.env.get("INGEST_SECRET");
  if (!expected || req.headers.get("x-ingest-secret") !== expected) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }
  const site = (Deno.env.get("SITE_URL") ?? "https://www.ep-journals.org").replace(/\/+$/, "");
  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
    auth: { persistSession: false },
  });

  const xml = await (await fetch(`${site}/sitemap.xml`)).text();
  const paths = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)]
    .map((m) => new URL(m[1].trim()).pathname.replace(/\/+$/, "") || "/")
    .filter((p) => p !== "/" && !SKIP.some((r) => r.test(p)));
  const unique = [...new Set(paths)];

  const rows: { path: string; title: string; description: string | null; body: string; section: string; indexed_at: string }[] = [];
  const failed: string[] = [];
  for (let i = 0; i < unique.length; i += 6) {
    await Promise.all(unique.slice(i, i + 6).map(async (p) => {
      try {
        const r = await fetch(site + p, { headers: { "User-Agent": "EPJournalsSearchIndexer/1.0" } });
        if (!r.ok) { failed.push(`${p} ${r.status}`); return; }
        const { title, description, body } = extract(await r.text());
        if (!title || /not found/i.test(title)) { failed.push(`${p} no-title`); return; }
        rows.push({ path: p, title, description: description || null, body, section: p.split("/")[1] || "home", indexed_at: new Date().toISOString() });
      } catch (e) {
        failed.push(`${p} ${e instanceof Error ? e.message : e}`);
      }
    }));
  }

  if (rows.length) {
    const { error } = await supabase.from("site_pages").upsert(rows, { onConflict: "path" });
    if (error) return Response.json({ error: error.message }, { status: 500 });
  }
  // Drop pages no longer in the sitemap (only when the crawl itself succeeded).
  let removed = 0;
  if (rows.length > 5) {
    const { data } = await supabase.from("site_pages").select("path");
    const stale = (data ?? []).map((r: { path: string }) => r.path).filter((p: string) => !unique.includes(p));
    if (stale.length) {
      await supabase.from("site_pages").delete().in("path", stale);
      removed = stale.length;
    }
  }
  // Refresh the spelling vocabulary so new words are recognised.
  await supabase.rpc("search_refresh_vocab");

  return Response.json({ ok: true, indexed: rows.length, removed, failed });
});
