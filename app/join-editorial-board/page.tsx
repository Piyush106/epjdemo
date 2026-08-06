import type { Metadata } from "next";
import JoinEditorialBoard from "@/views/JoinEditorialBoard";
import JsonLd from "@/components/JsonLd";
import { buildMetadata, buildBreadcrumbLd, SITE } from "@/lib/seo";
import { FAQS } from "@/lib/editorialBoardContent";

export const metadata: Metadata = buildMetadata({
  title: "Join Our Editorial Board",
  description:
    "Apply to join the EP Journals Group editorial board. Qualified researchers help shape editorial standards and conduct double-blind peer review across six peer-reviewed open access journals in engineering, economics, management, natural sciences, social sciences, and education.",
  path: "/join-editorial-board",
});

const webPageLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Join the EP Journals Group Editorial Board",
  description:
    "Recruitment of editorial board members for EP Journals Group: benefits, responsibilities, eligibility, application process, and an online application form.",
  url: `${SITE.origin}/join-editorial-board`,
  inLanguage: "en",
  isPartOf: { "@type": "WebSite", "@id": `${SITE.origin}/#website` },
  about: { "@type": "Organization", "@id": `${SITE.origin}/#organization` },
  publisher: { "@type": "Organization", "@id": `${SITE.origin}/#organization` },
  significantLink: [`${SITE.origin}/editorial`, `${SITE.origin}/policies`],
};

const faqLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map((f) => ({
    "@type": "Question",
    name: f.question,
    acceptedAnswer: { "@type": "Answer", text: f.answer },
  })),
};

export default function Page() {
  const breadcrumbLd = buildBreadcrumbLd([
    { name: "Home", path: "" },
    { name: "Editorial Board", path: "/editorial" },
    { name: "Join Our Editorial Board", path: "/join-editorial-board" },
  ]);
  return (
    <>
      <JsonLd data={webPageLd} />
      <JsonLd data={faqLd} />
      <JsonLd data={breadcrumbLd} />
      <JoinEditorialBoard />
    </>
  );
}
