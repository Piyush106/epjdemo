import { NextResponse, type NextRequest } from "next/server";
import { articlePath } from "@/lib/articleUrl";

// Legacy article URLs (/articles/<full-uuid>) → permanent 308 to the slug URL.
// The page itself can only issue a client-side redirect once it is cached, and
// search engines already know ~760 of these URLs, so they need a real HTTP
// redirect to pass their ranking to the new address. One indexed lookup per hit.

const UUID_PATH = /^\/articles\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})(\/pdf)?\/?$/i;

export async function middleware(req: NextRequest) {
  const m = req.nextUrl.pathname.match(UUID_PATH);
  if (!m) return NextResponse.next();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return NextResponse.next();

  try {
    const res = await fetch(`${url}/rest/v1/articles?select=id,title&id=eq.${m[1].toLowerCase()}&limit=1`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
    });
    const rows = (await res.json()) as { id: string; title: string }[];
    if (!rows?.[0]) return NextResponse.next(); // page renders the 404
    const dest = req.nextUrl.clone();
    dest.pathname = articlePath(rows[0]) + (m[2] ?? "");
    return NextResponse.redirect(dest, 308);
  } catch {
    return NextResponse.next(); // fall back to the page's own redirect
  }
}

export const config = { matcher: "/articles/:path*" };
