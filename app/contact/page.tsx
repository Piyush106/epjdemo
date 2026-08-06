import type { Metadata } from "next";
import Contact from "@/views/Contact";
import JsonLd from "@/components/JsonLd";
import { buildMetadata, buildBreadcrumbLd, SITE } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: 'Contact',
  description: 'Contact the EP Journals Group editorial office for enquiries about manuscript submission, peer review, editorial decisions, indexing, and publication across our six open access journals.',
  path: "/contact",
});

const contactLd = {
  "@context": "https://schema.org",
  "@type": "ContactPage",
  name: "Contact — EP Journals Group",
  url: `${SITE.origin}/contact`,
  inLanguage: "en",
  isPartOf: { "@type": "WebSite", "@id": `${SITE.origin}/#website` },
  about: {
    "@type": "Organization",
    "@id": `${SITE.origin}/#organization`,
    email: SITE.email,
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "editorial office",
      email: SITE.email,
      availableLanguage: "en",
    },
  },
};

export default function Page() {
  const breadcrumbLd = buildBreadcrumbLd([
    { name: "Home", path: "" },
    { name: "Contact", path: "/contact" },
  ]);
  return (
    <>
      <JsonLd data={contactLd} />
      <JsonLd data={breadcrumbLd} />
      <Contact />
    </>
  );
}
