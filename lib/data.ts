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

/** All article ids — used by generateStaticParams to pre-render article pages. */
export async function getAllArticleIds(): Promise<string[]> {
  const { data } = await supabase
    .from("articles")
    .select("id")
    .eq("status", "published");
  return (data as { id: string }[] | null)?.map((r) => r.id) ?? [];
}
