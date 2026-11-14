import { getArticle, getArticleByIdPrefix } from "@/lib/data";
import { articlePdfUrl, parseArticleParam } from "@/lib/articleUrl";

// Old PDF address (/articles/<slug>/pdf). PDFs are now served from Supabase
// Storage so their bytes never pass through Vercel; this route only redirects
// links and crawlers that still use the old address. The redirect itself is
// cached at the edge for a day.

export const runtime = "nodejs";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const parsed = parseArticleParam(id);
  if (!parsed) return new Response("Not found", { status: 404 });
  const article = "uuid" in parsed ? await getArticle(parsed.uuid) : await getArticleByIdPrefix(parsed.prefix, id);
  const target = article && article.status === "published" ? articlePdfUrl(article) : null;
  if (!target) return new Response("Not found", { status: 404 });

  return new Response(null, {
    status: 308,
    headers: {
      Location: target,
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
