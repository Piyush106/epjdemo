import type { Metadata } from "next";
import Indexing from "@/views/Indexing";
import JsonLd from "@/components/JsonLd";
import { buildMetadata, buildBreadcrumbLd, SITE } from "@/lib/seo";
import { getJournals } from "@/lib/data";

export const revalidate = 3600;

export const metadata: Metadata = buildMetadata({
  title: 'Indexing',
  description: 'Where EP Journals Group articles are discoverable — including Crossref DOIs, Google Scholar, ORCID, Zenodo, and OpenAIRE — with per-journal ISSNs and DOI prefixes. Indexing claims are subject to verification by the respective agencies.',
  path: "/indexing",
});

export default async function Page() {
  let journals: Awaited<ReturnType<typeof getJournals>> = [];
  try { journals = await getJournals(); } catch { journals = []; }

  const webPageLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Indexing & Abstracting — EP Journals Group",
    description:
      "Indexing, abstracting, and DOI registration coverage for the six journals published by EP Journals Group, with per-journal ISSNs and DOI prefixes.",
    url: `${SITE.origin}/indexing`,
    inLanguage: "en",
    isPartOf: { "@type": "WebSite", "@id": `${SITE.origin}/#website` },
    publisher: { "@type": "Organization", "@id": `${SITE.origin}/#organization` },
    about: journals.map((j) => ({
      "@type": "Periodical",
      name: j.title,
      alternateName: j.abbrev,
      issn: [j.electronic_issn, j.print_issn].filter(Boolean),
      url: `${SITE.origin}/journals/${j.abbrev.toLowerCase()}`,
    })),
  };
  const breadcrumbLd = buildBreadcrumbLd([
    { name: "Home", path: "" },
    { name: "Indexing", path: "/indexing" },
  ]);

  return (
    <>
      <JsonLd data={webPageLd} />
      <JsonLd data={breadcrumbLd} />
      <Indexing initialJournals={journals} />
    </>
  );
}
