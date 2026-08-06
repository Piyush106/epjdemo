import type { Metadata } from "next";
import About from "@/views/About";
import JsonLd from "@/components/JsonLd";
import { buildMetadata, buildBreadcrumbLd, SITE } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: 'About',
  description: 'EP Journals Group is an open access publisher of six peer-reviewed journals in engineering, economics, management, natural sciences, social sciences, and education, operating under a documented governance framework with double-blind review and Crossref DOIs.',
  path: "/about",
});

const aboutLd = {
  "@context": "https://schema.org",
  "@type": "AboutPage",
  name: "About EP Journals Group",
  url: `${SITE.origin}/about`,
  inLanguage: "en",
  isPartOf: { "@type": "WebSite", "@id": `${SITE.origin}/#website` },
  mainEntity: { "@type": "Organization", "@id": `${SITE.origin}/#organization` },
};

export default function Page() {
  const breadcrumbLd = buildBreadcrumbLd([
    { name: "Home", path: "" },
    { name: "About", path: "/about" },
  ]);
  return (
    <>
      <JsonLd data={aboutLd} />
      <JsonLd data={breadcrumbLd} />
      <About />
    </>
  );
}
