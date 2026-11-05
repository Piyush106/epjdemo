import { NextResponse } from "next/server";
import { supabase } from "@/lib/data";
import { SITE } from "@/lib/seo";
import { articlePath } from "@/lib/articleUrl";

// GET /api/ojs-canonical?journal=jefrr → { "148": "https://www.ep-journals.org/articles/…", … }
//
// Read by the epCanonical OJS plugin (ojs-plugin/epCanonical) so each OJS
// article page declares its www.ep-journals.org copy as canonical. That stops
// the two copies competing in Google. Public data only; CDN-cached for an hour.

export const revalidate = 3600;

export async function GET(req: Request) {
  const journal = (new URL(req.url).searchParams.get("journal") ?? "").toUpperCase();
  if (!/^[A-Z]{3,10}$/.test(journal)) {
    return NextResponse.json({ error: "journal must be a journal abbreviation, e.g. jefrr" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("articles")
    .select("id, title, article_url")
    .eq("status", "published")
    .eq("journal_abbrev", journal)
    .not("article_url", "is", null);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const map: Record<string, string> = {};
  for (const r of (data as { id: string; title: string; article_url: string }[] | null) ?? []) {
    const ojsId = r.article_url.match(/\/article\/view\/([^/?#]+)/)?.[1];
    if (ojsId) map[ojsId] = `${SITE.origin}${articlePath(r)}`;
  }

  return NextResponse.json(map, {
    headers: { "Cache-Control": "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400" },
  });
}
