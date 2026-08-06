import type { Metadata } from "next";
import Authors from "@/views/Authors";
import JsonLd from "@/components/JsonLd";
import { buildMetadata, buildBreadcrumbLd, SITE } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: 'For Authors',
  description: 'Author guidance for EP Journals Group: submission, double-blind peer review, article processing, CC BY 4.0 licensing, Crossref DOIs, and publication timelines.',
  path: "/authors",
});

// Server-rendered HowTo so the author-guidelines steps are machine-readable in
// the initial HTML (previously injected client-side and invisible to crawlers).
const howToLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to Publish a Research Paper with EP Journals Group",
  description:
    "Step-by-step author guidelines for manuscript preparation, formatting, submission, double-blind peer review, and open access publication.",
  url: `${SITE.origin}/authors`,
  inLanguage: "en",
  publisher: { "@type": "Organization", "@id": `${SITE.origin}/#organization` },
  step: [
    { "@type": "HowToStep", position: 1, name: "Choose the right journal", text: "Match your manuscript to the aims and scope of one of the six EP Journals Group titles." },
    { "@type": "HowToStep", position: 2, name: "Prepare your manuscript", text: "Format the manuscript, references, figures, and tables to the author guidelines." },
    { "@type": "HowToStep", position: 3, name: "Submit your manuscript", text: "Submit through the submission form or the journal's editorial email address." },
    { "@type": "HowToStep", position: 4, name: "Double-blind peer review", text: "Two independent reviewers assess the manuscript; authors respond to reviewer comments." },
    { "@type": "HowToStep", position: 5, name: "Publication", text: "Accepted articles are published open access under CC BY 4.0 with a Crossref DOI." },
  ],
};

export default function Page() {
  const breadcrumbLd = buildBreadcrumbLd([
    { name: "Home", path: "" },
    { name: "For Authors", path: "/authors" },
  ]);
  return (
    <>
      <JsonLd data={howToLd} />
      <JsonLd data={breadcrumbLd} />
      <Authors />
    </>
  );
}
