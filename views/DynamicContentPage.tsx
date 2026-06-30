"use client";
import { useEffect, useRef, useState } from "react";
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
  /** Server-fetched page, rendered into the initial HTML (SSR/SEO). */
  initialPage?: ContentPage | null;
}

const DynamicContentPage = ({ category, initialPage = null }: Props) => {
  const { slug } = useParams<{ slug: string }>();
  const [page, setPage] = useState<ContentPage | null>(initialPage);
  const [loading, setLoading] = useState(!initialPage);
  const [notFound, setNotFound] = useState(false);
  const didMount = useRef(false);

  useEffect(() => {
    // The server already provided this slug's page; don't refetch on mount.
    if (!didMount.current) {
      didMount.current = true;
      if (initialPage && (!slug || slug === initialPage.slug)) return;
    }
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

  // JSON-LD is now emitted server-side (see lib/contentRoute.tsx) so crawlers
  // see it in the initial HTML; no client-side injection here.

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
          suppressHydrationWarning
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
