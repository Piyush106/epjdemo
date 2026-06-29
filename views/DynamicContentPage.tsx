"use client";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import GuidePage from "@/pages/guides/GuidePage";
import BlockRenderer, { type ContentBlock } from "@/components/content/BlockRenderer";
import GuideFAQ, { type FAQItem } from "@/components/guides/GuideFAQ";
import RelatedTopics from "@/components/content/RelatedTopics";
import EPContextHeader from "@/components/content/EPContextHeader";
import EPContextFooter from "@/components/content/EPContextFooter";
import NotFound from "@/pages/NotFound";
import { sanitizeHtml } from "@/lib/sanitizeHtml";
import type { RelatedLink } from "@/components/guides/RelatedLinks";
import { fetchWithRetry } from "@/lib/supabaseRetry";

interface ContentPage {
  id: string;
  slug: string;
  category: string;
  title: string;
  subtitle: string | null;
  summary: string | null;
  meta_title: string | null;
  meta_description: string;
  keywords: string[];
  reading_time_minutes: number | null;
  body_blocks: ContentBlock[];
  body_html: string | null;
  faqs: FAQItem[] | null;
  related_links: RelatedLink[] | null;
  last_updated: string;
  status: string;
  updated_at: string;
}

const categoryLabel: Record<string, string> = {
  guide: "Guide",
  comparison: "Comparison",
  publishing: "Publishing",
  "user-focused": "Resource",
};

interface Props {
  category: "guide" | "comparison" | "publishing" | "user-focused";
}

const DynamicContentPage = ({ category }: Props) => {
  const { slug } = useParams<{ slug: string }>();
  const [page, setPage] = useState<ContentPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setNotFound(false);
      const { data, error } = await fetchWithRetry<ContentPage>(() =>
        supabase
          .from("content_pages")
          .select("*")
          .eq("slug", slug)
          .eq("category", category)
          .eq("status", "published")
          .maybeSingle() as unknown as PromiseLike<{
            data: ContentPage | null;
            error: { message?: string } | null;
          }>,
      );
      if (cancelled) return;
      if (error || !data) {
        setNotFound(true);
        setPage(null);
      } else {
        setPage(data);
      }
      setLoading(false);
    };
    if (slug) load();
    return () => {
      cancelled = true;
    };
  }, [slug, category]);

  // JSON-LD injection
  useEffect(() => {
    if (!page) return;
    const origin = typeof window !== "undefined" ? window.location.origin : "https://www.ep-journals.org";
    const url = typeof window !== "undefined" ? window.location.href : undefined;
    const isFAQ = Array.isArray(page.faqs) && page.faqs.length > 0;

    // Category label + path for breadcrumb
    const categoryPath: Record<string, { label: string; path: string }> = {
      guide:         { label: "Guides",      path: "/guides" },
      comparison:    { label: "Comparisons", path: "/comparisons" },
      publishing:    { label: "Publishing",  path: "/publishing" },
      "user-focused":{ label: "Resources",   path: "/resources" },
    };
    const cat = categoryPath[page.category] ?? { label: "Knowledge Centre", path: "/" };

    const graph: any[] = [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home",    item: origin },
          { "@type": "ListItem", position: 2, name: cat.label, item: `${origin}${cat.path}` },
          { "@type": "ListItem", position: 3, name: page.title },
        ],
      },
      {
        "@type": "WebPage",
        "@id": url ? `${url}#webpage` : undefined,
        name: page.title,
        headline: page.title,
        description: page.meta_description,
        url,
        dateModified: page.updated_at,
        inLanguage: "en",
        isPartOf: { "@type": "WebSite", "@id": `${origin}/#website`, name: "EP Journals Group", url: origin },
        publisher: { "@type": "Organization", "@id": `${origin}/#organization`, name: "EP Journals Group" },
        about: page.summary || page.meta_description,
      },
    ];
    if (isFAQ) {
      graph.push({
        "@type": "FAQPage",
        mainEntity: page.faqs!.map((f) => ({
          "@type": "Question",
          name: f.question,
          acceptedAnswer: { "@type": "Answer", text: f.answer },
        })),
      });
    }
    const ld = { "@context": "https://schema.org", "@graph": graph };
    const id = "ld-content-page";
    let el = document.getElementById(id) as HTMLScriptElement | null;
    if (!el) {
      el = document.createElement("script");
      el.id = id;
      el.type = "application/ld+json";
      document.head.appendChild(el);
    }
    el.textContent = JSON.stringify(ld);
    return () => {
      el?.remove();
    };
  }, [page]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading…</p>
      </div>
    );
  }

  if (notFound || !page) return <NotFound />;

  const readingTime = page.reading_time_minutes
    ? ` · ${page.reading_time_minutes} min read`
    : "";

  return (
    <GuidePage
      title={page.title}
      metaTitle={page.meta_title || `${page.title} | EP Journals Group`}
      metaDescription={page.meta_description}
      subtitle={page.subtitle || page.summary || undefined}
      lastUpdated={`${page.last_updated}${readingTime}`}
      category={categoryLabel[page.category] || "Article"}
      relatedLinks={page.related_links || []}
    >
      <EPContextHeader category={category} />

      {page.body_blocks && page.body_blocks.length > 0 ? (
        <BlockRenderer blocks={page.body_blocks} />
      ) : page.body_html ? (
        <div
          className="prose-academic"
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(page.body_html) }}
        />
      ) : null}

      {page.faqs && page.faqs.length > 0 ? (
        <section className="mt-5">
          <GuideFAQ items={page.faqs} />
        </section>
      ) : null}

      <EPContextFooter />

      <RelatedTopics currentSlug={page.slug} currentCategory={page.category} />
    </GuidePage>
  );
};

export default DynamicContentPage;
