import type { Metadata } from "next";
import Index from "@/views/Index";
import JsonLd from "@/components/JsonLd";
import { SITE, buildMetadata } from "@/lib/seo";
import { getJournals, getRecentArticles } from "@/lib/data";

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
      <Index initialJournals={journals} initialArticles={recentArticles} />
    </>
  );
}
