import { getArticle, getArticleByIdPrefix } from "@/lib/data";
import { articlePath, articleSlug, parseArticleParam } from "@/lib/articleUrl";
import { SITE } from "@/lib/seo";

// Serves each article's PDF from www.ep-journals.org, next to its landing page.
// Google Scholar expects citation_pdf_url on the same site as the version of
// record, so the galley file is streamed from OJS rather than linked across hosts.
// The CDN caches the response for a day; files rarely change after publication.

export const runtime = "nodejs";

// OJS sits behind ModSecurity, which rejects bare or unusual user agents.
const UPSTREAM_UA = "Mozilla/5.0 (compatible; EPJournalsBot/1.0; +https://www.ep-journals.org)";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const parsed = parseArticleParam(id);
  if (!parsed) return new Response("Not found", { status: 404 });
  const article = "uuid" in parsed ? await getArticle(parsed.uuid) : await getArticleByIdPrefix(parsed.prefix, id);
  if (!article?.pdf_url || article.status !== "published") return new Response("Not found", { status: 404 });

  const upstream = await fetch(article.pdf_url, { headers: { "User-Agent": UPSTREAM_UA, Accept: "application/pdf" } });
  const type = upstream.headers.get("content-type") ?? "";
  if (!upstream.ok || !upstream.body || !type.includes("pdf")) {
    return new Response("The PDF is temporarily unavailable.", { status: 502 });
  }

  return new Response(upstream.body, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${articleSlug(article)}.pdf"`,
      "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
      // Scholar must be able to read the PDF, so no noindex; the canonical header
      // tells web search the landing page is the record to rank.
      Link: `<${SITE.origin}${articlePath(article)}>; rel="canonical"`,
    },
  });
}
