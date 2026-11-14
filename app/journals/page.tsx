import type { Metadata } from "next";
import Journals from "@/views/Journals";
import JsonLd from "@/components/JsonLd";
import { buildMetadata, buildBreadcrumbLd, SITE } from "@/lib/seo";
import { getJournals, getJournalArticles } from "@/lib/data";
import type { Article } from "@/lib/types";

export const revalidate = 3600;

export const metadata: Metadata = buildMetadata({
  title: 'Journals',
  description: 'The six peer-reviewed open access journals published by EP Journals Group and the latest article in each, with aims and scope, ISSNs, DOI prefixes and submission details across engineering, economics, management, natural sciences, social sciences and education.',
  path: "/journals",
});

export default async function Page() {
  let journals: Awaited<ReturnType<typeof getJournals>> = [];
  try { journals = await getJournals(); } catch { journals = []; }

  // Newest published article per journal, checked to belong to that journal:
  // same journal abbreviation, and its OJS page on that journal's own site.
  const latestByJournal: Record<string, Article | null> = {};
  await Promise.all(
    journals.map(async (j) => {
      try {
        const [a] = await getJournalArticles(j.abbrev, 1);
        const host = (u: string | null) => { try { return u ? new URL(u).host : ""; } catch { return ""; } };
        const ok = a && a.journal_abbrev === j.abbrev && (!a.article_url || host(a.article_url) === host(j.external_url));
        latestByJournal[j.abbrev] = ok ? a : null;
      } catch {
        latestByJournal[j.abbrev] = null;
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
      url: `${SITE.origin}/journals/${j.abbrev.toLowerCase()}`,
      item: {
        "@type": "Periodical",
        name: j.title,
        alternateName: j.abbrev,
        issn: [j.electronic_issn, j.print_issn].filter(Boolean),
        url: `${SITE.origin}/journals/${j.abbrev.toLowerCase()}`,
        publisher: { "@type": "Organization", "@id": `${SITE.origin}/#organization` },
      },
    })),
  };
  const breadcrumbLd = buildBreadcrumbLd([
    { name: "Home", path: "" },
    { name: "Journals", path: "/journals" },
  ]);

  return (
    <>
      <JsonLd data={itemListLd} />
      <JsonLd data={breadcrumbLd} />
      <Journals initialJournals={journals} latestByJournal={latestByJournal} />
    </>
  );
}
