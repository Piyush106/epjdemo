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
