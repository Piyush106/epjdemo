import { createClient } from "@supabase/supabase-js";
import type { Article, Journal } from "@/lib/types";

/**
 * Read-only Supabase client for Server Components.
 * Uses the public anon key (RLS still applies). No session persistence —
 * each request fetches fresh data, and ISR caches the rendered page.
 */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

/** All active journals, ordered for display. */
export async function getJournals(): Promise<Journal[]> {
  const { data, error } = await supabase
    .from("journals")
    .select("*")
    .eq("status", "active")
    .order("display_order", { ascending: true });
  if (error) throw error;
  return (data as Journal[]) ?? [];
}

export async function getJournalByAbbrev(abbrev: string): Promise<Journal | null> {
  const { data } = await supabase
    .from("journals")
    .select("*")
    .eq("abbrev", abbrev)
    .maybeSingle();
  return (data as Journal | null) ?? null;
}

/** A single published article by id. */
export async function getArticle(id: string): Promise<Article | null> {
  const { data } = await supabase
    .from("articles")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  return (data as Article | null) ?? null;
}

/** Most recently published articles (powers the homepage slideshow + listings). */
export async function getRecentArticles(limit = 12): Promise<Article[]> {
  const { data, error } = await supabase
    .from("articles")
    .select("*")
    .eq("status", "published")
    .order("publication_date", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data as Article[]) ?? [];
}

/** Count of published articles (for homepage trust stats). */
export async function getPublishedArticleCount(): Promise<number> {
  const { count } = await supabase
    .from("articles")
    .select("id", { count: "exact", head: true })
    .eq("status", "published");
  return count ?? 0;
}

/** Recent published articles for one journal (for the journal landing page). */
export async function getJournalArticles(journalAbbrev: string, limit = 10): Promise<Article[]> {
  const { data } = await supabase
    .from("articles")
    .select("*")
    .eq("status", "published")
    .eq("journal_abbrev", journalAbbrev)
    .order("publication_date", { ascending: false })
    .limit(limit);
  return (data as Article[] | null) ?? [];
}

/** Other recent published articles from the same journal (for "related articles"). */
export async function getRelatedArticles(
  journalAbbrev: string,
  excludeId: string,
  limit = 5,
): Promise<Article[]> {
  const { data } = await supabase
    .from("articles")
    .select("*")
    .eq("status", "published")
    .eq("journal_abbrev", journalAbbrev)
    .neq("id", excludeId)
    .order("publication_date", { ascending: false })
    .limit(limit);
  return (data as Article[] | null) ?? [];
}

/** All article ids — used by generateStaticParams to pre-render article pages. */
export async function getAllArticleIds(): Promise<string[]> {
  const { data } = await supabase
    .from("articles")
    .select("id")
    .eq("status", "published");
  return (data as { id: string }[] | null)?.map((r) => r.id) ?? [];
}

/** Article id + publication date — powers accurate <lastmod> values in the sitemap. */
export async function getArticleSitemapRows(): Promise<{ id: string; publication_date: string | null }[]> {
  const { data } = await supabase
    .from("articles")
    .select("id, publication_date")
    .eq("status", "published");
  return (data as { id: string; publication_date: string | null }[] | null) ?? [];
}

// ---- content_pages (guides / comparisons / publishing / resources) ----------

/** A loose shape for content_pages rows (jsonb columns kept flexible). */
export interface ContentPageRow {
  id: string;
  slug: string;
  category: string;
  title: string;
  subtitle: string | null;
  summary: string | null;
  meta_title: string | null;
  meta_description: string;
  keywords: string[] | null;
  reading_time_minutes: number | null;
  body_blocks: unknown[] | null;
  body_html: string | null;
  faqs: { question: string; answer: string }[] | null;
  related_links: unknown[] | null;
  last_updated: string;
  status: string;
  created_at: string;
  updated_at: string;
}

/** A single published content page by slug + category. */
export async function getContentPage(
  slug: string,
  category: string,
): Promise<ContentPageRow | null> {
  const { data } = await supabase
    .from("content_pages")
    .select("*")
    .eq("slug", slug)
    .eq("category", category)
    .eq("status", "published")
    .maybeSingle();
  return (data as ContentPageRow | null) ?? null;
}

/** Published slugs for one category — powers generateStaticParams. */
export async function getContentSlugs(category: string): Promise<string[]> {
  const { data } = await supabase
    .from("content_pages")
    .select("slug")
    .eq("category", category)
    .eq("status", "published");
  return (data as { slug: string }[] | null)?.map((r) => r.slug) ?? [];
}

/** Row shape for a category index listing (guides / comparisons / etc.). */
export interface ContentListRow {
  slug: string;
  title: string;
  subtitle: string | null;
  summary: string | null;
  reading_time_minutes: number | null;
  updated_at: string;
}

/**
 * Published pages for one category, newest first — powers the category index
 * listings (/guides, /comparisons, /publishing, /resources). Fetched on the
 * server so the full list (and its internal links) is in the initial HTML for
 * crawlers, instead of being loaded client-side after hydration.
 */
export async function getContentPageList(category: string): Promise<ContentListRow[]> {
  const { data } = await supabase
    .from("content_pages")
    .select("slug,title,subtitle,summary,reading_time_minutes,updated_at")
    .eq("category", category)
    .eq("status", "published")
    .order("updated_at", { ascending: false });
  return (data as ContentListRow[] | null) ?? [];
}

/** A related content-page reference for cross-linking the Knowledge Centre. */
export interface RelatedContentRef {
  slug: string;
  title: string;
  category: string;
  summary: string | null;
}

/**
 * Related Knowledge Centre pages for the "Related topics" rail: up to 2 from
 * each of the other categories plus up to 2 more from the same category
 * (excluding the current page). Fetched on the server so these cross-cluster
 * internal links are in the initial HTML — reinforcing the topical cluster for
 * crawlers and AI retrievers, not just human users after hydration.
 */
export async function getRelatedContentPages(
  currentCategory: string,
  currentSlug: string,
): Promise<RelatedContentRef[]> {
  const categories = ["guide", "comparison", "publishing", "user-focused"];
  const out: RelatedContentRef[] = [];
  for (const c of categories.filter((x) => x !== currentCategory)) {
    const { data } = await supabase
      .from("content_pages")
      .select("slug,title,category,summary")
      .eq("status", "published")
      .eq("category", c)
      .order("updated_at", { ascending: false })
      .limit(2);
    if (data) out.push(...(data as RelatedContentRef[]));
  }
  const { data: same } = await supabase
    .from("content_pages")
    .select("slug,title,category,summary")
    .eq("status", "published")
    .eq("category", currentCategory)
    .neq("slug", currentSlug)
    .order("updated_at", { ascending: false })
    .limit(2);
  if (same) out.push(...(same as RelatedContentRef[]));
  return out;
}

/** All published content pages (category + slug + lastmod) — powers the sitemap. */
export async function getAllContentPages(): Promise<
  { slug: string; category: string; updated_at: string }[]
> {
  const { data } = await supabase
    .from("content_pages")
    .select("slug, category, updated_at")
    .eq("status", "published");
  return (data as { slug: string; category: string; updated_at: string }[] | null) ?? [];
}
