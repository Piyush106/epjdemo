"use client";
import { useEffect, useState, useCallback, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import InstitutionalSidebar from "@/components/InstitutionalSidebar";
import MetaTags from "@/components/MetaTags";
import SchemaOrg from "@/components/SchemaOrg";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarDays, FileText } from "lucide-react";
import { useJournals, buildJournalMap, journalBadgeClass } from "@/hooks/useJournals";
import { fetchWithRetry } from "@/lib/supabaseRetry";

interface Article {
  id: string;
  title: string;
  authors: string;
  abstract: string;
  doi: string | null;
  journal_abbrev: string;
  journal_name: string;
  publication_date: string;
}

const PAGE_SIZE = 20;

const Articles = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const activeJournal = searchParams.get("journal") || "";

  const { data: journals = [] } = useJournals();
  const journalMap = useMemo(() => buildJournalMap(journals), [journals]);
  const journalFilters = useMemo(
    () => [{ abbrev: "", label: "All Journals" }, ...journals.map((j) => ({ abbrev: j.abbrev, label: j.abbrev }))],
    [journals],
  );

  const fetchArticles = useCallback(async (append = false, currentArticles: Article[] = []) => {
    if (append) setLoadingMore(true); else setLoading(true);
    const from = append ? currentArticles.length : 0;

    const { data } = await fetchWithRetry<Article[]>(() => {
      let query = supabase
        .from("articles" as any)
        .select("id, title, authors, abstract, doi, journal_abbrev, journal_name, publication_date")
        .eq("status", "published")
        .order("publication_date", { ascending: false })
        .range(from, from + PAGE_SIZE - 1);
      if (activeJournal) {
        query = query.eq("journal_abbrev", activeJournal);
      }
      return query as unknown as PromiseLike<{ data: Article[] | null; error: { message?: string } | null }>;
    });
    const newData = data || [];

    if (append) {
      setArticles((prev) => [...prev, ...newData]);
    } else {
      setArticles(newData);
    }
    setHasMore(newData.length === PAGE_SIZE);
    setLoading(false);
    setLoadingMore(false);
  }, [activeJournal]);

  useEffect(() => {
    setArticles([]);
    setHasMore(true);
    fetchArticles(false, []);
  }, [activeJournal]);

  return (
    <div className="min-h-screen bg-background">
      <MetaTags
        title="Peer-Reviewed Articles | Open Access Research | EP Journals Group"
        description="Browse peer-reviewed research articles in open access journals covering engineering, economics, management, natural sciences, and social sciences. Free full-text PDFs, CrossRef DOI, CC BY 4.0 licence."
      />
      <SchemaOrg type="WebPage" data={{
        "@type": "CollectionPage",
        name: "Peer-Reviewed Articles | Open Access Research | EP Journals Group",
        description: "Browse peer-reviewed research articles in open access journals covering engineering, economics, management, natural sciences, and social sciences.",
        url: "https://www.ep-journals.org/articles",
        inLanguage: "en",
      }} />
      <Header />

      <section className="py-6 bg-ep-cream border-b border-border">
        <div className="container mx-auto px-4">
          <h1 className="text-xl font-heading font-semibold text-foreground mb-1">Peer-Reviewed Research Articles</h1>
          <p className="text-muted-foreground text-sm">
            Browse open access, peer-reviewed journal articles across all six EP Journals Group publications. Every
            article is free to read, citable via a CrossRef DOI, and licensed under Creative Commons Attribution 4.0
            (CC BY 4.0).
          </p>
        </div>
      </section>

      <main className="py-8 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-[1fr_320px] gap-10">
            <div className="min-w-0">

              {/* Journal filter */}
              <div className="flex flex-wrap gap-2 mb-6">
                {journalFilters.map((f) => (
                  <button
                    key={f.abbrev}
                    onClick={() => setSearchParams(f.abbrev ? { journal: f.abbrev } : {})}
                    className={`px-3 py-1.5 text-xs border transition-colors ${
                      activeJournal === f.abbrev
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-card text-foreground border-border hover:bg-muted"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {loading ? (
                <div className="space-y-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="border border-border bg-card p-4 animate-pulse">
                      <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                      <div className="h-3 bg-muted rounded w-1/2 mb-3" />
                      <div className="h-3 bg-muted rounded w-full mb-1" />
                      <div className="h-3 bg-muted rounded w-5/6" />
                    </div>
                  ))}
                </div>
              ) : articles.length === 0 ? (
                <div className="border border-border bg-card p-8 text-center">
                  <p className="text-muted-foreground text-sm">No published articles found{activeJournal ? ` for ${activeJournal}` : ""}.</p>
                  <p className="text-xs text-muted-foreground mt-2">Articles will appear here once they are published through the editorial system.</p>
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    {articles.map((article) => (
                      <article key={article.id} className="border border-border bg-card p-4 hover:bg-muted/30 transition-colors">
                        <Link to={`/articles/${article.id}`} className="group">
                          <h3 className="text-sm font-heading font-semibold text-foreground group-hover:text-primary transition-colors leading-snug mb-1">
                            {article.title}
                          </h3>
                        </Link>
                        <p className="text-xs text-muted-foreground mb-2">{article.authors}</p>
                        <p className="text-xs text-foreground leading-relaxed line-clamp-3 mb-3">
                          {article.abstract}
                        </p>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                          <Badge variant="outline" className={`text-[10px] border ${journalBadgeClass(journalMap[article.journal_abbrev]?.color_token)}`}>{article.journal_abbrev}</Badge>
                          <span className="flex items-center gap-1">
                            <CalendarDays className="h-3 w-3" />
                            {new Date(article.publication_date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                          </span>
                          {article.doi && (
                            <span className="flex items-center gap-1">
                              <FileText className="h-3 w-3" />
                              <a href={`https://doi.org/${article.doi}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline" onClick={(e) => e.stopPropagation()}>
                                {article.doi}
                              </a>
                            </span>
                          )}
                          <Link to={`/articles/${article.id}`} className="text-primary hover:underline ml-auto">View Article →</Link>
                        </div>
                      </article>
                    ))}
                  </div>

                  {hasMore && (
                    <div className="mt-6 text-center">
                      <Button variant="outline" onClick={() => fetchArticles(true, articles)} disabled={loadingMore}>
                        {loadingMore ? "Loading..." : "Load More Articles"}
                      </Button>
                    </div>
                  )}

                  {!hasMore && (
                    <p className="mt-6 text-center text-xs text-muted-foreground">All {articles.length} articles loaded</p>
                  )}
                </>
              )}
            </div>

            <InstitutionalSidebar variant="journal" />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Articles;
