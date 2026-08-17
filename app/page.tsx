import type { Metadata } from "next";
import Index from "@/views/Index";
import JsonLd from "@/components/JsonLd";
import { SITE, buildMetadata } from "@/lib/seo";
import { getJournals, getRecentArticles, getPublishedArticleCount, getContentPageList } from "@/lib/data";

// Categories shown in the homepage "Explore Publishing Resources" block.
const EXPLORE_CATEGORIES = ["guide", "comparison", "publishing", "user-focused"] as const;

export const revalidate = 3600;

export const metadata: Metadata = buildMetadata({
  title: SITE.defaultTitle,
  description: SITE.defaultDescription,
  path: "/",
});

export default async function HomePage() {
  let journals: Awaited<ReturnType<typeof getJournals>> = [];
  try { journals = await getJournals(); } catch { journals = []; }

  let recentArticles: Awaited<ReturnType<typeof getRecentArticles>> = [];
  try { recentArticles = await getRecentArticles(10); } catch { recentArticles = []; }

  let articleCount = 0;
  try { articleCount = await getPublishedArticleCount(); } catch { articleCount = 0; }

  // Server-fetch the Knowledge Centre lists so the homepage links are in the
  // prerendered HTML (crawlers/AI retrievers), not a client-only "Loading…".
  const exploreResources: Record<string, { slug: string; title: string; category: string }[]> = {};
  await Promise.all(
    EXPLORE_CATEGORIES.map(async (c) => {
      try {
        const rows = await getContentPageList(c);
        exploreResources[c] = rows.slice(0, 5).map((r) => ({ slug: r.slug, title: r.title, category: c }));
      } catch {
        exploreResources[c] = [];
      }
    }),
  );

  const itemListLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "EP Journals Group Journals",
    numberOfItems: journals.length,
    itemListElement: journals.map((j, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "Periodical",
        name: j.title,
        alternateName: j.abbrev,
        issn: [j.electronic_issn, j.print_issn].filter(Boolean),
        url: j.external_url,
        publisher: { "@type": "Organization", "@id": `${SITE.origin}/#organization` },
      },
    })),
  };

  return (
    <>
      <JsonLd data={itemListLd} />
      <Index initialJournals={journals} initialArticles={recentArticles} articleCount={articleCount} exploreResources={exploreResources} />
    </>
  );
}
