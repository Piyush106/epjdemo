"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import { ChevronLeft, ChevronRight, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useJournals, buildJournalMap, journalTextClass } from "@/hooks/useJournals";
import { fetchWithRetry } from "@/lib/supabaseRetry";
import { articlePath } from "@/lib/articleUrl";

interface Article {
  id: string;
  title: string;
  authors: string;
  journal_abbrev: string;
  journal_name?: string | null;
  publication_date: string;
  volume?: string | null;
  issue?: string | null;
}

const RecentArticlesSlideshow = ({ initialArticles = [] }: { initialArticles?: Article[] }) => {
  const [articles, setArticles] = useState<Article[]>(initialArticles);
  const [loading, setLoading] = useState(initialArticles.length === 0);
  const [error, setError] = useState<string | null>(null);
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const { data: journals = [] } = useJournals();
  const journalMap = useMemo(() => buildJournalMap(journals), [journals]);

  useEffect(() => {
    // Server already provided the recent articles → no client refetch needed.
    if (initialArticles.length > 0) return;
    let cancelled = false;
    (async () => {
      const { data, error: queryError } = await fetchWithRetry<Article[]>(() =>
        supabase
          .from("articles")
          .select("id, title, authors, journal_abbrev, journal_name, publication_date, volume, issue")
          .eq("status", "published")
          .order("publication_date", { ascending: false })
          .limit(10),
      );
      if (cancelled) return;
      if (queryError) {
        console.error("RecentArticlesSlideshow fetch failed:", queryError);
        setError(queryError.message ?? "Unknown error");
      } else if (data) {
        setArticles(data);
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const next = useCallback(() => {
    if (articles.length === 0) return;
    setCurrent((prev) => (prev + 1) % articles.length);
  }, [articles.length]);

  const prev = useCallback(() => {
    if (articles.length === 0) return;
    setCurrent((prev) => (prev - 1 + articles.length) % articles.length);
  }, [articles.length]);

  useEffect(() => {
    if (isPaused || articles.length === 0) return;
    const interval = setInterval(next, 5000);
    return () => clearInterval(interval);
  }, [isPaused, next, articles.length]);

  // Loading state — render the bar so users see something is coming, not a blank slot
  if (loading) {
    return (
      <section className="py-4 bg-secondary border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex shrink-0 text-[10px] font-heading font-semibold uppercase tracking-wider text-muted-foreground bg-muted px-2 py-1 rounded">
              Recently Published
            </span>
            <p className="text-xs text-muted-foreground">Loading recent articles…</p>
          </div>
        </div>
      </section>
    );
  }

  // Error state — visible so we know something is wrong, with the error message available in console
  if (error) {
    return (
      <section className="py-4 bg-secondary border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex shrink-0 text-[10px] font-heading font-semibold uppercase tracking-wider text-destructive bg-destructive/10 px-2 py-1 rounded">
              Recently Published
            </span>
            <p className="text-xs text-muted-foreground">
              Unable to load recent articles. See browser console for details.
            </p>
          </div>
        </div>
      </section>
    );
  }

  // No articles state — DB is empty for some reason
  if (articles.length === 0) {
    return (
      <section className="py-4 bg-secondary border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex shrink-0 text-[10px] font-heading font-semibold uppercase tracking-wider text-muted-foreground bg-muted px-2 py-1 rounded">
              Recently Published
            </span>
            <p className="text-xs text-muted-foreground">
              No published articles yet. <Link to="/articles" className="text-primary hover:underline">Browse the archive</Link>
            </p>
          </div>
        </div>
      </section>
    );
  }

  const article = articles[current];
  const date = new Date(article.publication_date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  const issueLabel = article.volume && article.issue ? `Vol. ${article.volume}, Issue ${article.issue}` : null;

  // Boxed card with labelled parts, so the journal, the title and the authors
  // read as separate things: header bar (label, position, controls), journal +
  // date line, title, author line, then progress dots and the read link.
  return (
    <section
      className="py-3 bg-secondary border-b border-border"
      aria-label="Recently published articles"
      aria-roledescription="carousel"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
    >
      <div className="container mx-auto px-4">
        <div className="border border-border bg-card rounded-sm">
          <div className="flex items-center gap-3 border-b border-border px-4 py-1.5">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-heading font-semibold uppercase tracking-wider text-primary">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden="true" />
              Recently published
            </span>
            <span className="text-[11px] text-muted-foreground" aria-live="polite">
              {current + 1} of {articles.length}
            </span>
            <div className="ml-auto flex items-center gap-1">
              <button
                onClick={prev}
                className="p-1 rounded-sm border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Previous article"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={next}
                className="p-1 rounded-sm border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Next article"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          <div className="px-4 py-2.5" aria-roledescription="slide" aria-label={`${current + 1} of ${articles.length}`}>
            <p className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-muted-foreground">
              <span className={`inline-flex items-center rounded-sm bg-primary/10 px-1.5 py-0.5 font-semibold uppercase tracking-wider ${journalTextClass(journalMap[article.journal_abbrev]?.color_token)}`}>
                {article.journal_abbrev}
              </span>
              {article.journal_name && <span className="hidden md:inline">{article.journal_name}</span>}
              <span aria-hidden="true">·</span>
              <time dateTime={article.publication_date.slice(0, 10)}>{date}</time>
              {issueLabel && (
                <>
                  <span aria-hidden="true" className="hidden sm:inline">·</span>
                  <span className="hidden sm:inline">{issueLabel}</span>
                </>
              )}
            </p>
            <Link
              to={articlePath(article)}
              className="mt-1 block font-heading text-sm sm:text-[15px] font-semibold leading-snug text-foreground hover:text-primary transition-colors line-clamp-2"
            >
              {article.title}
            </Link>
            <p className="mt-1 flex items-center gap-1.5 text-[11px] text-muted-foreground min-w-0">
              <Users className="h-3 w-3 shrink-0" aria-hidden="true" />
              <span className="shrink-0 font-medium text-foreground/70">Authors:</span>
              <span className="truncate">{article.authors}</span>
            </p>
          </div>

          <div className="flex items-center gap-3 border-t border-border px-4 py-1.5">
            <div className="hidden sm:flex items-center gap-1">
              {articles.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === current ? "w-4 bg-primary" : "w-1.5 bg-border hover:bg-muted-foreground"
                  }`}
                  aria-label={`Show article ${i + 1}`}
                  aria-current={i === current ? "true" : undefined}
                />
              ))}
            </div>
            <Link to={articlePath(article)} className="ml-auto text-[11px] font-medium text-primary hover:underline">
              Read article &rarr;
            </Link>
            <Link to="/articles" className="text-[11px] text-muted-foreground hover:underline">
              All articles
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RecentArticlesSlideshow;
