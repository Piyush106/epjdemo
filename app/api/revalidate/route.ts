import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { SITE } from "@/lib/seo";
import { articlePath } from "@/lib/articleUrl";
import { getArticleSitemapRows } from "@/lib/data";
import { submitToIndexNow } from "@/lib/indexnow";

// On-demand revalidation endpoint. The ingest-oai Supabase Edge Function calls
// this after each 3-day harvest so the cached homepage slideshow + article
// listings surface newly-ingested articles immediately (article detail pages
// already render on first request via dynamicParams + 3-day ISR).
//
// After revalidating it submits recently published article URLs to IndexNow so
// Bing (and ChatGPT search, which uses Bing) crawls them the same day. Send
// {"indexnow": "all"} once to submit every article, e.g. after a URL change.
//
// Gated by REVALIDATE_SECRET (set in Vercel env), sent as the x-revalidate-secret
// header or a ?secret= query param.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DEFAULT_PATHS = ["/", "/articles", "/sitemap.xml", "/articles/feed.xml", "/llms.txt"];
const RECENT_DAYS = 14;

export async function POST(req: Request) {
  const secret =
    req.headers.get("x-revalidate-secret") ?? new URL(req.url).searchParams.get("secret");

  if (!process.env.REVALIDATE_SECRET || secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ revalidated: false, message: "invalid secret" }, { status: 401 });
  }

  let paths = DEFAULT_PATHS;
  let indexnowAll = false;
  try {
    const body = await req.json();
    if (Array.isArray(body?.paths) && body.paths.length) {
      paths = [...new Set([...DEFAULT_PATHS, ...body.paths.filter((p: unknown): p is string => typeof p === "string")])];
    }
    indexnowAll = body?.indexnow === "all";
  } catch {
    // no/!JSON body — fall back to defaults
  }

  for (const p of paths) revalidatePath(p);
  // Archive, journal-archive and issue pages list every article, so refresh the
  // whole /articles and /journals trees (pages regenerate on their next request).
  revalidatePath("/articles", "layout");
  revalidatePath("/journals", "layout");

  let indexnow: { submitted: number; status: number } | { error: string };
  try {
    const rows = await getArticleSitemapRows();
    const cutoff = Date.now() - RECENT_DAYS * 86400_000;
    const picked = indexnowAll
      ? rows
      : rows.filter((r) => r.publication_date && new Date(r.publication_date).getTime() >= cutoff);
    const urls = [`${SITE.origin}/`, `${SITE.origin}/articles`, ...picked.map((r) => `${SITE.origin}${articlePath(r)}`)];
    indexnow = { submitted: urls.length, status: await submitToIndexNow(urls) };
  } catch (e) {
    indexnow = { error: e instanceof Error ? e.message : String(e) };
  }

  return NextResponse.json({ revalidated: true, paths, indexnow, now: new Date().toISOString() });
}
