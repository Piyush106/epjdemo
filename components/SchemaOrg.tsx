"use client";
import { useMemo } from "react";
import { useJournals } from "@/hooks/useJournals";

interface SchemaOrgProps {
  type: "Organization" | "Periodical" | "WebPage" | "ScholarlyArticle" | "WebSite";
  data?: Record<string, unknown>;
}

const journalHomepage = (externalUrl: string) => externalUrl.replace(/\/index\.php\/.*$/, "");

const SchemaOrg = ({ type, data }: SchemaOrgProps) => {
  const origin = typeof window !== "undefined" ? window.location.origin : "https://www.ep-journals.org";
  const { data: journals = [] } = useJournals();

  const publisherRef = useMemo(() => ({ "@type": "Organization" as const, "@id": `${origin}/#organization`, name: "EP Journals Group", url: origin }), [origin]);

  const organizationSchema = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "Organization" as const,
    "@id": `${origin}/#organization`,
    name: "EP Journals Group",
    url: origin,
    logo: {
      "@type": "ImageObject",
      url: `${origin}/icon-512.png`,
      width: 512,
      height: 512,
    },
    description: "EP Journals Group publishes peer-reviewed open access journals in engineering, economics, management, natural sciences, and social sciences.",
    email: "editor@ep-journals.org",
    foundingDate: "2024",
    publishingPrinciples: `${origin}/policies`,
    knowsAbout: [
      "Engineering",
      "Technology",
      "Economics",
      "Finance",
      "Management",
      "Natural Sciences",
      "Social Sciences",
      "Humanities",
      "Open Access Publishing",
      "Academic Peer Review",
    ],
    sameAs: [
      origin,
      "https://doi.org/10.65150",
    ],
  }), [origin]);

  const webSiteSchema = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "WebSite" as const,
    "@id": `${origin}/#website`,
    name: "EP Journals Group",
    url: origin,
    description: "Open access peer-reviewed journals in engineering, economics, management, natural sciences, and social sciences.",
    publisher: {
      "@type": "Organization",
      "@id": `${origin}/#organization`,
    },
    inLanguage: "en",
  }), [origin]);

  const periodicalSchemas = useMemo(() => journals.map((j) => ({
    "@context": "https://schema.org",
    "@type": "Periodical" as const,
    name: j.title,
    alternateName: j.abbrev,
    issn: [j.print_issn, j.electronic_issn].filter(Boolean) as string[],
    url: journalHomepage(j.external_url),
    publisher: publisherRef,
    description: j.scope_short
      ? `Peer-reviewed, open-access journal publishing original research in ${j.scope_short.toLowerCase()}.`
      : "Peer-reviewed, open-access journal.",
  })), [journals, publisherRef]);

  const getSchema = (): Record<string, unknown> | Record<string, unknown>[] | null => {
    switch (type) {
      case "Organization":
        return organizationSchema;
      case "WebSite":
        return webSiteSchema;
      case "Periodical":
        return periodicalSchemas;
      case "WebPage":
        return {
          "@context": "https://schema.org",
          "@type": "WebPage",
          ...data,
          publisher: { "@type": "Organization", "@id": `${origin}/#organization` },
        };
      case "ScholarlyArticle":
        return {
          "@context": "https://schema.org",
          "@type": "ScholarlyArticle",
          ...data,
          publisher: { "@type": "Organization", "@id": `${origin}/#organization` },
        };
      default:
        return null;
    }
  };

  const schema = getSchema();
  if (!schema) return null;

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
};

export default SchemaOrg;