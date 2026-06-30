import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

// On-demand revalidation endpoint. The ingest-oai Supabase Edge Function calls
// this after each 3-day harvest so the cached homepage slideshow + article
// listings surface newly-ingested articles immediately (article detail pages
// already render on first request via dynamicParams + 3-day ISR).
//
// Gated by REVALIDATE_SECRET (set in Vercel env), sent as the x-revalidate-secret
// header or a ?secret= query param.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DEFAULT_PATHS = ["/", "/articles"];

export async function POST(req: Request) {
  const secret =
    req.headers.get("x-revalidate-secret") ?? new URL(req.url).searchParams.get("secret");

  if (!process.env.REVALIDATE_SECRET || secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ revalidated: false, message: "invalid secret" }, { status: 401 });
  }

  let paths = DEFAULT_PATHS;
  try {
    const body = await req.json();
    if (Array.isArray(body?.paths) && body.paths.length) {
      paths = body.paths.filter((p: unknown): p is string => typeof p === "string");
    }
  } catch {
    // no/!JSON body — fall back to defaults
  }

  for (const p of paths) revalidatePath(p);

  return NextResponse.json({ revalidated: true, paths, now: new Date().toISOString() });
}
