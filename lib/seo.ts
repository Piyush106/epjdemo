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
