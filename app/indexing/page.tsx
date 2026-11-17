import type { Metadata } from "next";
import DiscoveryCentre from "@/components/indexing/DiscoveryCentre";
import JsonLd from "@/components/JsonLd";
import { buildMetadata, buildBreadcrumbLd, SITE } from "@/lib/seo";
import { getJournals, supabase } from "@/lib/data";
import { getScholarSummary, type ScholarSummary } from "@/lib/scholarCoverage";

export const revalidate = 3600;

export const metadata: Metadata = buildMetadata({
  title: "Indexing & Scholarly Discovery Centre",
  description: "Where EP Journals Group articles are discoverable: Crossref DOIs, OpenAlex, Scilit, Index Copernicus, ISSN Portal, OpenAIRE, Zenodo, and article-level Google Scholar coverage, each linked to a public record.",
  path: "/indexing",
});

export default async function Page() {
  let journals: Awaited<ReturnType<typeof getJournals>> = [];
  try { journals = await getJournals(); } catch { journals = []; }
  let scholar: ScholarSummary[] = [];
  let scholarLastChecked: string | null = null;
  try { ({ rows: scholar, lastChecked: scholarLastChecked } = await getScholarSummary()); } catch { /* section shows no data */ }
  const [{ count: published }, { count: withDoi }] = await Promise.all([
    supabase.from("articles").select("id", { count: "exact", head: true }).eq("status", "published"),
    supabase.from("articles").select("id", { count: "exact", head: true }).eq("status", "published").not("doi", "is", null),
  ]);
  let crossrefDois: number | null = null;
  try {
    const r = await fetch("https://api.crossref.org/members/54641", { next: { revalidate: 86400 } });
    if (r.ok) crossrefDois = (await r.json())?.message?.counts?.["total-dois"] ?? null;
  } catch { /* fall back to the database count */ }

  const webPageLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Indexing & Scholarly Discovery Centre — EP Journals Group",
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
      <DiscoveryCentre journals={journals} published={published ?? 0} withDoi={withDoi ?? 0} scholar={scholar} scholarLastChecked={scholarLastChecked} crossrefDois={crossrefDois} />
    </>
  );
}
