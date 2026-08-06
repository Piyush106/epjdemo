import type { Metadata } from "next";
import Articles from "@/views/Articles";
import JsonLd from "@/components/JsonLd";
import { buildMetadata, buildBreadcrumbLd, SITE } from "@/lib/seo";
import { getRecentArticles } from "@/lib/data";

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
    initialArticles = await getRecentArticles(20);
  } catch {
    initialArticles = [];
  }

  const itemListLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Recently published articles — EP Journals Group",
    numberOfItems: initialArticles.length,
    itemListElement: initialArticles.map((a, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${SITE.origin}/articles/${a.id}`,
      item: {
        "@type": "ScholarlyArticle",
        headline: a.title,
        url: `${SITE.origin}/articles/${a.id}`,
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
      <Articles initialArticles={initialArticles} />
    </>
  );
}
