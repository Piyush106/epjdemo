import type { Metadata } from "next";
import Editorial from "@/views/Editorial";
import JsonLd from "@/components/JsonLd";
import { buildMetadata, buildBreadcrumbLd, SITE } from "@/lib/seo";
import { EDITORIAL_BOARD } from "@/lib/editorialBoard";

export const metadata: Metadata = buildMetadata({
  title: 'Editorial Board',
  description: 'The international editorial advisory board of EP Journals Group — scholars across engineering, natural sciences, social sciences, economics, and management, with verifiable ORCID, Scopus, and ResearcherID profiles.',
  path: "/editorial",
});

// Server-rendered so board members and their scholarly identifiers are in the
// initial HTML — an E-E-A-T / entity-authority signal for search and AI engines.
const boardLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "EP Journals Group Editorial Board",
  description:
    "International editorial advisory board across engineering, natural sciences, social sciences, economics, and management.",
  url: `${SITE.origin}/editorial`,
  numberOfItems: EDITORIAL_BOARD.length,
  itemListElement: EDITORIAL_BOARD.map((m, i) => ({
    "@type": "ListItem",
    position: i + 1,
    item: {
      "@type": "Person",
      name: m.name,
      ...(m.credentials ? { description: m.credentials } : {}),
      ...(m.affiliation
        ? { affiliation: { "@type": "Organization", name: m.affiliation } }
        : {}),
      ...(() => {
        const sameAs = [
          m.orcid ? `https://orcid.org/${m.orcid}` : null,
          m.scopusId ? `https://www.scopus.com/authid/detail.uri?authorId=${m.scopusId}` : null,
        ].filter(Boolean);
        return sameAs.length ? { sameAs } : {};
      })(),
      memberOf: { "@type": "Organization", "@id": `${SITE.origin}/#organization` },
    },
  })),
};

export default function Page() {
  const breadcrumbLd = buildBreadcrumbLd([
    { name: "Home", path: "" },
    { name: "Editorial Board", path: "/editorial" },
  ]);
  return (
    <>
      <JsonLd data={boardLd} />
      <JsonLd data={breadcrumbLd} />
      <Editorial />
    </>
  );
}
