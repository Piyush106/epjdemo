import type { Metadata } from "next";
import { notFound } from "next/navigation";
import JsonLd from "@/components/JsonLd";
import DynamicContentPage from "@/views/DynamicContentPage";
import { buildMetadata, SITE } from "@/lib/seo";
import { getContentPage, getContentSlugs, type ContentPageRow } from "@/lib/data";

export type ContentCategory = "guide" | "comparison" | "publishing" | "user-focused";

// category → breadcrumb label + URL base on this site.
export const CATEGORY_META: Record<ContentCategory, { label: string; base: string }> = {
  guide: { label: "Guides", base: "/guides" },
  comparison: { label: "Comparisons", base: "/comparisons" },
  publishing: { label: "Publishing", base: "/publishing" },
  "user-focused": { label: "Resources", base: "/resources" },
};

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
  const { base, label } = CATEGORY_META[category];
  if (!page) {
    return buildMetadata({ title: `${label} — not found`, description: "", noindex: true });
  }
  const path = `${base}/${page.slug}`;
  const description = page.meta_description || page.summary || "";
  const meta = buildMetadata({ title: page.title, description, path, ogType: "article" });
  // meta_title already carries the full SEO title → use absolute so the layout's
  // "%s | EP Journals Group" template isn't applied twice.
  return {
    ...meta,
    title: page.meta_title ? { absolute: page.meta_title } : page.title,
    keywords: page.keywords && page.keywords.length ? page.keywords : undefined,
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
      // last_updated is a human string ("May 2026"); use ISO updated_at for schema dates.
      datePublished: page.updated_at,
      dateModified: page.updated_at,
      inLanguage: "en",
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
  return (
    <>
      <JsonLd data={buildJsonLd(page, category)} />
      <DynamicContentPage category={category} initialPage={page} />
    </>
  );
}
