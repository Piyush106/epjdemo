import { getArticle, getArticleByIdPrefix } from "@/lib/data";
import { articlePath, articleStoragePdfUrl, parseArticleParam } from "@/lib/articleUrl";
import { SITE } from "@/lib/seo";

// Same-site PDF address (/articles/<slug>/pdf) — the citation_pdf_url that
// Google Scholar reads, so the full text sits on the same host as the article
// page. Bytes come from the Supabase Storage copy (OJS galley as fallback) and
// the response is cached at Vercel's edge for a year, so each PDF is fetched
// from the origin about once.

export const runtime = "nodejs";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const parsed = parseArticleParam(id);
  if (!parsed) return new Response("Not found", { status: 404 });
  const article = "uuid" in parsed ? await getArticle(parsed.uuid) : await getArticleByIdPrefix(parsed.prefix, id);
  if (!article || article.status !== "published") return new Response("Not found", { status: 404 });

  const sources = [articleStoragePdfUrl(article), article.pdf_url].filter((u): u is string => Boolean(u));
  for (const src of sources) {
    try {
      const upstream = await fetch(src, { cache: "no-store" });
      const type = upstream.headers.get("content-type") ?? "";
      if (!upstream.ok || !upstream.body || !/pdf|octet-stream/i.test(type)) continue;
      const headers: Record<string, string> = {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${articlePath(article).split("/").pop()}.pdf"`,
        "Cache-Control": "public, max-age=86400, s-maxage=31536000, immutable",
        Link: `<${SITE.origin}${articlePath(article)}>; rel="canonical"`,
      };
      const len = upstream.headers.get("content-length");
      if (len) headers["Content-Length"] = len;
      return new Response(upstream.body, { status: 200, headers });
    } catch {
      /* try the next source */
    }
  }
  return new Response("PDF not available", { status: 404, headers: { "Cache-Control": "public, s-maxage=3600" } });
}
