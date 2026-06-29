"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useJournals, buildJournalMap, journalTextClass } from "@/hooks/useJournals";
import { fetchWithRetry } from "@/lib/supabaseRetry";

interface Article {
  id: string;
  title: string;
  authors: string;
  journal_abbrev: string;
  publication_date: string;
}

const RecentArticlesSlideshow = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const { data: journals = [] } = useJournals();
  const journalMap = useMemo(() => buildJournalMap(journals), [journals]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error: queryError } = await fetchWithRetry<Article[]>(() =>
        supabase
          .from("articles")
          .select("id, title, authors, journal_abbrev, publication_date")
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
  const date = new Date(article.publication_date).toLocaleDateString("en-GB", { month: "short", year: "numeric" });

  return (
    <section
      className="py-4 bg-secondary border-b border-border"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-3">
          <span className="hidden sm:inline-flex shrink-0 text-[10px] font-heading font-semibold uppercase tracking-wider text-muted-foreground bg-muted px-2 py-1 rounded">
            Recently Published
          </span>

          <button
            onClick={prev}
            className="shrink-0 p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Previous article"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <div className="min-w-0 flex-1 flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <Link
                to={`/articles/${article.id}`}
                className="group flex items-start gap-1.5"
              >
                <p className="text-xs font-medium text-foreground leading-snug truncate group-hover:text-primary transition-colors">
                  {article.title}
                </p>
              </Link>
              <p className="text-[11px] text-muted-foreground leading-snug mt-0.5 truncate">
                {article.authors} — <span className={`font-medium ${journalTextClass(journalMap[article.journal_abbrev]?.color_token)}`}>{article.journal_abbrev}</span> · {date}
              </p>
            </div>
          </div>

          <button
            onClick={next}
            className="shrink-0 p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Next article"
          >
            <ChevronRight className="h-4 w-4" />
          </button>

          <div className="hidden md:flex items-center gap-1 shrink-0">
            {articles.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === current ? "w-4 bg-primary" : "w-1.5 bg-border hover:bg-muted-foreground"
                }`}
                aria-label={`Go to article ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default RecentArticlesSlideshow;
