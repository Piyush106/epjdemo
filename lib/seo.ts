import type { Metadata } from "next";

/** Single source of truth for site-wide SEO constants. */
export const SITE = {
  origin: process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.ep-journals.org",
  name: "EP Journals Group",
  defaultTitle: "EP Journals Group | Peer-Reviewed Open Access Academic Journals",
  defaultDescription:
    "EP Journals Group publishes peer-reviewed open access journals in engineering, economics, management, natural sciences, social sciences, and education. Double-blind review, Crossref DOIs, CC BY 4.0.",
  ogImage: "/og-image.png",
  email: "editor@ep-journals.org",
} as const;

interface BuildMetaArgs {
  title: string;
  description: string;
  /** Path on the main site, e.g. "/about". Used to build the canonical URL. */
  path?: string;
  /** Override the canonical URL entirely (e.g. point an article to its OJS version of record). */
  canonical?: string;
  ogImage?: string;
  noindex?: boolean;
  ogType?: "website" | "article";
  /** Arbitrary extra <meta> tags rendered server-side in <head> (e.g. Google Scholar citation_* tags). */
  other?: Metadata["other"];
}

/**
 * Build a fully-formed Next.js Metadata object for a route.
 * Everything here is server-rendered into the initial HTML — the whole point of
 * the migration. This replaces the old client-side MetaTags.tsx DOM injection,
 * which crawlers that don't run JS (notably Google Scholar) never saw.
 */
export function buildMetadata({
  title,
  description,
  path = "/",
  canonical,
  ogImage = SITE.ogImage,
  noindex = false,
  ogType = "website",
  other,
}: BuildMetaArgs): Metadata {
  const canonicalUrl = canonical ?? `${SITE.origin}${path}`;
  const imageUrl = ogImage.startsWith("http") ? ogImage : `${SITE.origin}${ogImage}`;

  return {
    title,
    description,
    alternates: { canonical: canonicalUrl },
    robots: noindex
      ? { index: false, follow: false }
      : { index: true, follow: true },
    openGraph: {
      type: ogType,
      siteName: SITE.name,
      locale: "en_US",
      url: canonicalUrl,
      title,
      description,
      images: [{ url: imageUrl, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
    ...(other ? { other } : {}),
  };
}

/**
 * Produce a clean meta/OG description from a longer text (e.g. an abstract):
 * collapses whitespace, trims to <= max chars on a WORD boundary (never
 * mid-word), strips trailing punctuation, and appends an ellipsis when cut.
 * Google renders ~155-160 chars, so max defaults to 160.
 */
export function clampDescription(text: string | null | undefined, max = 160): string {
  const s = (text ?? "").replace(/\s+/g, " ").trim();
  if (s.length <= max) return s;
  const cut = s.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  const base = (lastSpace > 40 ? cut.slice(0, lastSpace) : cut).replace(/[\s.,;:!?\-–—]+$/, "");
  return `${base}…`;
}

/**
 * Build a CollectionPage JSON-LD object for a listing page (e.g. a Knowledge
 * Centre category index). `items` are the entries, each becoming an Article
 * node under `hasPart`. Rendered server-side so the collection and every item
 * URL are crawlable in the initial HTML.
 */
export function buildCollectionPageLd({
  name,
  description,
  path,
  items,
}: {
  name: string;
  description: string;
  path: string;
  items: { name: string; description?: string | null; url: string }[];
}) {
  const url = `${SITE.origin}${path}`;
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name,
    description,
    url,
    isPartOf: { "@type": "WebSite", "@id": `${SITE.origin}/#website` },
    publisher: { "@type": "Organization", "@id": `${SITE.origin}/#organization` },
    inLanguage: "en",
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: items.length,
      itemListElement: items.map((it, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: it.url,
        item: {
          "@type": "Article",
          headline: it.name,
          ...(it.description ? { description: it.description } : {}),
          url: it.url,
        },
      })),
    },
  };
}

/** Build a BreadcrumbList JSON-LD object from an ordered list of crumbs. */
export function buildBreadcrumbLd(crumbs: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: `${SITE.origin}${c.path}`,
    })),
  };
}
