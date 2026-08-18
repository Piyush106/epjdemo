import type { Metadata } from "next";
import { notFound } from "next/navigation";
import JsonLd from "@/components/JsonLd";
import DynamicContentPage from "@/views/DynamicContentPage";
import { buildMetadata, SITE } from "@/lib/seo";
import {
  getContentPage,
  getContentSlugs,
  getRelatedContentPages,
  type ContentPageRow,
} from "@/lib/data";

export type ContentCategory = "guide" | "comparison" | "publishing" | "user-focused";

// category → breadcrumb label + URL base on this site.
export const CATEGORY_META: Record<ContentCategory, { label: string; base: string }> = {
  guide: { label: "Guides", base: "/guides" },
  comparison: { label: "Comparisons", base: "/comparisons" },
  publishing: { label: "Publishing", base: "/publishing" },
  "user-focused": { label: "Resources", base: "/resources" },
};

/**
 * Canonical consolidation for known duplicates. Keyed by `${category}:${slug}`,
 * value is the canonical path the page should point at. Used to resolve exact
 * title/topic duplicates (keyword cannibalisation) without deleting any page:
 * the weaker duplicate keeps working but points its canonical + OpenGraph URL at
 * the stronger page, and is excluded from the sitemap. Reversible — edit or
 * remove an entry to change the primary.
 */
export const CANONICAL_OVERRIDES: Record<string, string> = {
  // Three published guides cover the same intent ("how to write an abstract").
  // `how-to-write-research-abstract` is the fullest page (23 structured body
  // blocks, 5 FAQs, most complete) → the single primary. The other two keep
  // working but canonicalise to it and are dropped from the sitemap.
  "guide:how-to-write-a-research-abstract": "/guides/how-to-write-research-abstract",
  "guide:how-to-write-an-abstract": "/guides/how-to-write-research-abstract",
};

export function canonicalOverridePath(category: ContentCategory, slug: string): string | undefined {
  return CANONICAL_OVERRIDES[`${category}:${slug}`];
}

/** generateStaticParams: pre-render every published slug in a category. */
export async function contentParams(category: ContentCategory): Promise<{ slug: string }[]> {
  try {
    return (await getContentSlugs(category)).map((slug) => ({ slug }));
  } catch {
    return [];
  }
}

/** Per-slug metadata sourced from the row's purpose-built SEO columns. */
export async function contentMeta(category: ContentCategory, slug: string): Promise<Metadata> {
  const page = await getContentPage(slug, category);
  // Unknown slug → real 404 (via the not-found boundary), NOT a soft-404
  // (HTTP 200 + noindex). generateMetadata and the page both call notFound(),
  // so Google gets a clean 404 for mistyped/nonexistent slugs instead of an
  // "Excluded by noindex" 200.
  if (!page) notFound();
  const { base, label } = CATEGORY_META[category];
  const path = `${base}/${page.slug}`;
  const overridePath = canonicalOverridePath(category, page.slug);
  const canonical = overridePath ? `${SITE.origin}${overridePath}` : undefined;
  const description = page.meta_description || page.summary || "";
  const meta = buildMetadata({ title: page.title, description, path, canonical, ogType: "article" });
  // meta_title already carries the full SEO title → use absolute so the layout's
  // "%s | EP Journals Group" template isn't applied twice.
  return {
    ...meta,
    title: page.meta_title ? { absolute: page.meta_title } : page.title,
    keywords: page.keywords && page.keywords.length ? page.keywords : undefined,
    openGraph: {
      ...meta.openGraph,
      type: "article",
      publishedTime: page.created_at,
      modifiedTime: page.updated_at,
      section: label,
      ...(page.keywords?.length ? { tags: page.keywords } : {}),
    },
  };
}

function buildJsonLd(page: ContentPageRow, category: ContentCategory) {
  const { base, label } = CATEGORY_META[category];
  const url = `${SITE.origin}${base}/${page.slug}`;
  const graph: Record<string, unknown>[] = [
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE.origin },
        { "@type": "ListItem", position: 2, name: label, item: `${SITE.origin}${base}` },
        { "@type": "ListItem", position: 3, name: page.title, item: url },
      ],
    },
    {
      "@type": "Article",
      "@id": `${url}#article`,
      headline: page.title,
      name: page.title,
      description: page.meta_description || page.summary || undefined,
      url,
      mainEntityOfPage: url,
      // created_at = first publication; updated_at = last edit. Both real ISO timestamps.
      datePublished: page.created_at,
      dateModified: page.updated_at,
      inLanguage: "en",
      isAccessibleForFree: true,
      articleSection: label,
      image: {
        "@type": "ImageObject",
        url: `${SITE.origin}${SITE.ogImage}`,
        width: 1200,
        height: 630,
      },
      author: { "@type": "Organization", "@id": `${SITE.origin}/#organization`, name: SITE.name },
      publisher: { "@type": "Organization", "@id": `${SITE.origin}/#organization` },
      ...(page.keywords?.length ? { keywords: page.keywords.join(", ") } : {}),
      isPartOf: { "@type": "WebSite", "@id": `${SITE.origin}/#website` },
    },
  ];
  if (Array.isArray(page.faqs) && page.faqs.length) {
    graph.push({
      "@type": "FAQPage",
      mainEntity: page.faqs.map((f) => ({
        "@type": "Question",
        name: f.question,
        acceptedAnswer: { "@type": "Answer", text: f.answer },
      })),
    });
  }
  return { "@context": "https://schema.org", "@graph": graph };
}

/** The server component each content route renders: SSR body + server JSON-LD. */
export async function ContentRoutePage({
  category,
  slug,
}: {
  category: ContentCategory;
  slug: string;
}) {
  const page = await getContentPage(slug, category);
  if (!page) notFound();
  let related: Awaited<ReturnType<typeof getRelatedContentPages>> = [];
  try {
    related = await getRelatedContentPages(category, page.slug);
  } catch {
    related = [];
  }
  return (
    <>
      <JsonLd data={buildJsonLd(page, category)} />
      <DynamicContentPage category={category} initialPage={page} relatedTopics={related} />
    </>
  );
}
