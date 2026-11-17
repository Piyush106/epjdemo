import { NextResponse } from "next/server";
import { searchSite } from "@/lib/search";

// Search suggestions for the header search box. Server-side only (anon key,
// read-only RPC over published records). Responses are cached at the edge per
// query; a small per-instance rate limit blunts scripted abuse.

export const runtime = "nodejs";

const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 90;
const hits = new Map<string, { n: number; t: number }>();

function limited(ip: string): boolean {
  const now = Date.now();
  const h = hits.get(ip);
  if (!h || now - h.t > WINDOW_MS) {
    hits.set(ip, { n: 1, t: now });
    if (hits.size > 5000) hits.clear();
    return false;
  }
  h.n++;
  return h.n > MAX_PER_WINDOW;
}

export async function GET(req: Request) {
  const ip = (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || "anon";
  if (limited(ip)) return NextResponse.json({ error: "Too many requests" }, { status: 429, headers: { "Retry-After": "30" } });

  const url = new URL(req.url);
  const q = (url.searchParams.get("q") ?? "").slice(0, 120);
  const limit = Math.min(Math.max(Number(url.searchParams.get("limit")) || 12, 1), 20);
  const data = await searchSite(q, { limit });
  return NextResponse.json(data, {
    headers: { "Cache-Control": "public, s-maxage=600, stale-while-revalidate=3600" },
  });
}
