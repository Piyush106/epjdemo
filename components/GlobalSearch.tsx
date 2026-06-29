"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Search, FileText, User, Calendar, BookOpen, X } from "lucide-react";
import { Dialog, DialogOverlay, DialogPortal } from "@/components/ui/dialog";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { useJournals, buildJournalMap, journalBadgeClass } from "@/hooks/useJournals";
import { fetchWithRetry } from "@/lib/supabaseRetry";

// Discriminated union: search results are either articles or content pages.
interface ArticleResult {
  kind: "article";
  id: string;
  title: string;
  authors: string;
  journal_abbrev: string;
  journal_name: string;
  publication_date: string;
  volume: string | null;
  issue: string | null;
  doi: string | null;
}

interface ContentResult {
  kind: "content";
  slug: string;
  category: string; // 'guide' | 'comparison' | 'publishing' | 'user-focused'
  title: string;
  summary: string | null;
  subtitle: string | null;
}

type SearchResult = ArticleResult | ContentResult;

const ROUTE_PREFIX: Record<string, string> = {
  guide: "/guides",
  comparison: "/comparisons",
  publishing: "/publishing",
  "user-focused": "/resources",
};

const CATEGORY_LABEL: Record<string, string> = {
  guide: "Guide",
  comparison: "Comparison",
  publishing: "Publishing",
  "user-focused": "Resource",
};

interface GlobalSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const GlobalSearch = ({ open, onOpenChange }: GlobalSearchProps) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const navigate = useNavigate();
  const { data: journals = [] } = useJournals();
  const journalMap = useMemo(() => buildJournalMap(journals), [journals]);

  const search = useCallback(async (term: string) => {
    if (term.trim().length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    const searchTerm = `%${term.trim()}%`;

    const [articlesRes, contentRes] = await Promise.all([
      fetchWithRetry<Omit<ArticleResult, "kind">[]>(() =>
        supabase
          .from("articles")
          .select("id, title, authors, journal_abbrev, journal_name, publication_date, volume, issue, doi")
          .or(
            `title.ilike.${searchTerm},authors.ilike.${searchTerm},journal_name.ilike.${searchTerm},journal_abbrev.ilike.${searchTerm},doi.ilike.${searchTerm}`,
          )
          .eq("status", "published")
          .order("publication_date", { ascending: false })
          .limit(10),
      ),
      fetchWithRetry<Omit<ContentResult, "kind">[]>(() =>
        supabase
          .from("content_pages")
          .select("slug, category, title, summary, subtitle")
          .or(`title.ilike.${searchTerm},summary.ilike.${searchTerm},subtitle.ilike.${searchTerm}`)
          .eq("status", "published")
          .order("updated_at", { ascending: false })
          .limit(8),
      ),
    ]);

    // Knowledge Centre results first (usually higher intent than article browsing),
    // then articles. Keyboard navigation walks through the combined array in order.
    const combined: SearchResult[] = [
      ...((contentRes.data || []) as Omit<ContentResult, "kind">[]).map((c) => ({
        kind: "content" as const,
        ...c,
      })),
      ...((articlesRes.data || []) as Omit<ArticleResult, "kind">[]).map((a) => ({
        kind: "article" as const,
        ...a,
      })),
    ];
    setResults(combined);
    setSelectedIndex(-1);
    setLoading(false);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => search(query), 300);
    return () => clearTimeout(timer);
  }, [query, search]);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setResults([]);
      setSelectedIndex(-1);
    }
  }, [open]);

  // Ctrl/Cmd+K to open from anywhere
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        onOpenChange(true);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onOpenChange]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, -1));
    } else if (e.key === "Enter" && selectedIndex >= 0) {
      e.preventDefault();
      handleSelect(results[selectedIndex]);
    }
  };

  const handleSelect = (result: SearchResult) => {
    onOpenChange(false);
    if (result.kind === "article") {
      navigate(`/articles/${result.id}`);
    } else {
      const prefix = ROUTE_PREFIX[result.category] ?? "/guides";
      navigate(`${prefix}/${result.slug}`);
    }
  };

  const contentResults = results.filter((r): r is ContentResult => r.kind === "content");
  const articleResults = results.filter((r): r is ArticleResult => r.kind === "article");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay />
        <DialogPrimitive.Content
          className="fixed left-[50%] top-[50%] z-50 w-full max-w-[640px] translate-x-[-50%] translate-y-[-50%] rounded-xl border border-border bg-background shadow-2xl duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] overflow-hidden"
          onKeyDown={handleKeyDown}
        >
          {/* Search input header */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-muted/30">
            <Search className="h-5 w-5 text-muted-foreground shrink-0" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search articles, guides, comparisons…"
              className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 h-10 text-sm bg-transparent px-0"
              autoFocus
            />
            <button
              onClick={() => onOpenChange(false)}
              className="shrink-0 flex items-center justify-center h-7 w-7 rounded-md bg-muted hover:bg-muted-foreground/10 transition-colors"
              aria-label="Close search"
            >
              <X className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          </div>

          {/* Results area */}
          <div className="max-h-[400px] overflow-y-auto">
            {query.trim().length < 2 && (
              <div className="px-6 py-10 text-center text-muted-foreground">
                <Search className="h-10 w-10 mx-auto mb-3 opacity-20" />
                <p className="text-sm font-medium">Search across articles, guides, and comparisons</p>
                <p className="text-xs mt-1.5 opacity-60">
                  Try a topic, author name, journal abbreviation, or DOI
                </p>
                <div className="flex items-center justify-center gap-2 mt-4">
                  <kbd className="inline-flex h-6 items-center rounded border border-border bg-muted px-2 font-mono text-[10px] text-muted-foreground">
                    Ctrl+K
                  </kbd>
                  <span className="text-xs text-muted-foreground opacity-60">to toggle search</span>
                </div>
              </div>
            )}

            {loading && query.trim().length >= 2 && (
              <div className="px-4 py-8 text-center">
                <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="h-4 w-4 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin" />
                  Searching…
                </div>
              </div>
            )}

            {!loading && query.trim().length >= 2 && results.length === 0 && (
              <div className="px-4 py-8 text-center text-muted-foreground">
                <p className="text-sm">
                  No results for "<span className="font-medium text-foreground">{query}</span>"
                </p>
                <p className="text-xs mt-1 opacity-60">Try different keywords or check spelling</p>
              </div>
            )}

            {/* Knowledge Centre section */}
            {contentResults.length > 0 && (
              <>
                <p className="px-4 pt-3 pb-1 text-[10px] font-heading font-semibold uppercase tracking-wider text-muted-foreground">
                  Knowledge Centre · {contentResults.length}
                </p>
                {contentResults.map((c, idxInGroup) => {
                  const globalIdx = idxInGroup;
                  const selected = globalIdx === selectedIndex;
                  return (
                    <button
                      key={`content-${c.slug}`}
                      onClick={() => handleSelect(c)}
                      className={`w-full text-left px-4 py-3 transition-colors border-b border-border/30 last:border-0 outline-none ${
                        selected ? "bg-accent" : "hover:bg-accent/50"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <BookOpen className="h-4 w-4 mt-1 text-muted-foreground shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-foreground line-clamp-2 leading-snug">
                            {c.title}
                          </p>
                          {(c.summary || c.subtitle) && (
                            <p className="text-xs text-muted-foreground line-clamp-1 mt-1">
                              {c.summary || c.subtitle}
                            </p>
                          )}
                          <Badge variant="outline" className="mt-1.5 text-[10px] px-1.5 py-0">
                            {CATEGORY_LABEL[c.category] || "Article"}
                          </Badge>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </>
            )}

            {/* Articles section */}
            {articleResults.length > 0 && (
              <>
                <p className="px-4 pt-3 pb-1 text-[10px] font-heading font-semibold uppercase tracking-wider text-muted-foreground">
                  Articles · {articleResults.length}
                </p>
                {articleResults.map((article, idxInGroup) => {
                  const globalIdx = contentResults.length + idxInGroup;
                  const selected = globalIdx === selectedIndex;
                  return (
                    <button
                      key={`article-${article.id}`}
                      onClick={() => handleSelect(article)}
                      className={`w-full text-left px-4 py-3 transition-colors border-b border-border/30 last:border-0 outline-none ${
                        selected ? "bg-accent" : "hover:bg-accent/50"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <FileText className="h-4 w-4 mt-1 text-muted-foreground shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-foreground line-clamp-2 leading-snug">
                            {article.title}
                          </p>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5">
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                              <User className="h-3 w-3" />
                              <span className="line-clamp-1">{article.authors}</span>
                            </span>
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              {new Date(article.publication_date).toLocaleDateString("en-US", { year: "numeric", month: "short" })}
                            </span>
                          </div>
                          <Badge
                            variant="outline"
                            className={`mt-1.5 text-[10px] px-1.5 py-0 ${journalBadgeClass(journalMap[article.journal_abbrev]?.color_token)}`}
                          >
                            {article.journal_abbrev}
                          </Badge>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </>
            )}
          </div>

          {/* Footer */}
          {results.length > 0 && (
            <div className="border-t border-border px-4 py-2 bg-muted/30 text-xs text-muted-foreground flex items-center justify-between">
              <span>
                {results.length} result{results.length !== 1 ? "s" : ""}
              </span>
              <div className="hidden sm:flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <kbd className="inline-flex h-5 items-center rounded border border-border bg-muted px-1 font-mono text-[10px]">↑</kbd>
                  <kbd className="inline-flex h-5 items-center rounded border border-border bg-muted px-1 font-mono text-[10px]">↓</kbd>
                  navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="inline-flex h-5 items-center rounded border border-border bg-muted px-1 font-mono text-[10px]">↵</kbd>
                  open
                </span>
              </div>
            </div>
          )}
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
};

export default GlobalSearch;
