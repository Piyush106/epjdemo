import type { Metadata } from "next";
import Articles from "@/views/Articles";
import JsonLd from "@/components/JsonLd";
import { buildMetadata, buildBreadcrumbLd, SITE } from "@/lib/seo";
import { getArticlesPage, getRecentArticles } from "@/lib/data";
import { ArchivePager, ARCHIVE_PAGE_SIZE } from "@/components/ArchiveList";
import { registeredDois } from "@/lib/doi";
import { articlePath } from "@/lib/articleUrl";

// Refresh hourly; also revalidated on demand by the ingest-oai function after a
// harvest, so newly-ingested articles surface in this list immediately.
export const revalidate = 3600;

export const metadata: Metadata = buildMetadata({
  title: 'Articles',
  description: 'Recently published peer-reviewed, open access articles across the EP Journals Group portfolio, with abstracts, authors, DOIs, and links to each version of record.',
  path: "/articles",
});

// Server-render the first page so every article (and its link) is in the initial
// HTML for crawlers; the client component keeps the journal filter + "load more".
export default async function Page() {
  let initialArticles: Awaited<ReturnType<typeof getRecentArticles>> = [];
  try {
    initialArticles = await getRecentArticles(ARCHIVE_PAGE_SIZE);
  } catch {
    initialArticles = [];
  }
  const liveDois = await registeredDois(initialArticles.map((a) => a.doi));
  let totalPages = 1;
  try { totalPages = Math.ceil((await getArticlesPage(1, 1)).total / ARCHIVE_PAGE_SIZE); } catch { totalPages = 1; }
  const listed = initialArticles.map((a) => ({ ...a, doi_registered: a.doi ? liveDois.has(a.doi) : false }));

  const itemListLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Recently published articles — EP Journals Group",
    numberOfItems: initialArticles.length,
    itemListElement: initialArticles.map((a, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${SITE.origin}${articlePath(a)}`,
      item: {
        "@type": "ScholarlyArticle",
        headline: a.title,
        url: `${SITE.origin}${articlePath(a)}`,
        datePublished: a.publication_date,
        isPartOf: { "@type": "Periodical", name: a.journal_name, alternateName: a.journal_abbrev },
      },
    })),
  };
  const breadcrumbLd = buildBreadcrumbLd([
    { name: "Home", path: "" },
    { name: "Articles", path: "/articles" },
  ]);

  return (
    <>
      <JsonLd data={itemListLd} />
      <JsonLd data={breadcrumbLd} />
      <Articles initialArticles={listed} archiveNav={<ArchivePager current={1} totalPages={totalPages} />} />
    </>
  );
}
