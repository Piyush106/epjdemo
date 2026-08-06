import type { Metadata } from "next";
import SubmitManuscript from "@/views/SubmitManuscript";
import JsonLd from "@/components/JsonLd";
import { buildMetadata, buildBreadcrumbLd, SITE } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: 'Submit a Manuscript',
  description: 'Submit your research manuscript to an EP Journals Group journal for open access publication: double-blind peer review by two independent reviewers, Crossref DOI, and a CC BY 4.0 licence with authors retaining copyright.',
  path: "/submit",
});

const submitLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Submit a Manuscript — EP Journals Group",
  description:
    "Submit your research paper for open access publication with double-blind peer review, a Crossref DOI, and a CC BY 4.0 licence.",
  url: `${SITE.origin}/submit`,
  inLanguage: "en",
  isPartOf: { "@type": "WebSite", "@id": `${SITE.origin}/#website` },
  publisher: { "@type": "Organization", "@id": `${SITE.origin}/#organization` },
};

export default function Page() {
  const breadcrumbLd = buildBreadcrumbLd([
    { name: "Home", path: "" },
    { name: "Submit a Manuscript", path: "/submit" },
  ]);
  return (
    <>
      <JsonLd data={submitLd} />
      <JsonLd data={breadcrumbLd} />
      <SubmitManuscript />
    </>
  );
}
