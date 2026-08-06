import type { Metadata } from "next";
import Journals from "@/views/Journals";
import JsonLd from "@/components/JsonLd";
import { buildMetadata, buildBreadcrumbLd, SITE } from "@/lib/seo";
import { getJournals } from "@/lib/data";

export const revalidate = 3600;

export const metadata: Metadata = buildMetadata({
  title: 'Journals',
  description: 'The six peer-reviewed open access journals published by EP Journals Group, with aims and scope, ISSNs, DOI prefixes, and submission details across engineering, economics, management, natural sciences, social sciences, and education.',
  path: "/journals",
});

export default async function Page() {
  let journals: Awaited<ReturnType<typeof getJournals>> = [];
  try { journals = await getJournals(); } catch { journals = []; }

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
      <Journals initialJournals={journals} />
    </>
  );
}
