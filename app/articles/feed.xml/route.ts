import { SITE, clampDescription } from "@/lib/seo";
import { getRecentArticles } from "@/lib/data";
import { articlePath } from "@/lib/articleUrl";

// RSS 2.0 feed of the latest articles at /articles/feed.xml. Feed readers,
// research aggregators and AI crawlers poll feeds to find new papers quickly.

export const revalidate = 3600;

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export async function GET() {
  let articles: Awaited<ReturnType<typeof getRecentArticles>> = [];
  try { articles = await getRecentArticles(50); } catch { articles = []; }

  const items = articles
    .map((a) => {
      const url = `${SITE.origin}${articlePath(a)}`;
      return `    <item>
      <title>${esc(a.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${new Date(a.publication_date).toUTCString()}</pubDate>
      <dc:creator>${esc(a.authors)}</dc:creator>
      <category>${esc(a.journal_name)}</category>
      <description>${esc(clampDescription(a.abstract, 500))}</description>${a.doi ? `\n      <dc:identifier>doi:${esc(a.doi)}</dc:identifier>` : ""}
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>${SITE.name} — latest articles</title>
    <link>${SITE.origin}/articles</link>
    <atom:link href="${SITE.origin}/articles/feed.xml" rel="self" type="application/rss+xml" />
    <description>New peer-reviewed open access articles from the six ${SITE.name} journals.</description>
    <language>en</language>
${items}
  </channel>
</rss>
`;

  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
}
