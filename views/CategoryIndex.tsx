"use client";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import InstitutionalSidebar from "@/components/InstitutionalSidebar";
import MetaTags from "@/components/MetaTags";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";

interface PageRow {
  slug: string;
  title: string;
  subtitle: string | null;
  summary: string | null;
  reading_time_minutes: number | null;
  updated_at: string;
}

type Category = "guide" | "comparison" | "publishing" | "user-focused";

const CATEGORY_META: Record<Category, {
  label: string;
  pluralLabel: string;
  pageTitle: string;
  description: string;
  routePrefix: string;
}> = {
  guide: {
    label: "Guide",
    pluralLabel: "Guides",
    pageTitle: "Guides | EP Journals Group",
    description:
      "Educational guides on academic publishing, peer review, manuscript preparation, and the publication process for authors at every career stage.",
    routePrefix: "/guides",
  },
  comparison: {
    label: "Comparison",
    pluralLabel: "Comparisons",
    pageTitle: "Comparisons | EP Journals Group",
    description:
      "Side-by-side comparisons of publishing options, journal types, licensing models, and editorial approaches to support informed publishing decisions.",
    routePrefix: "/comparisons",
  },
  publishing: {
    label: "Publishing",
    pluralLabel: "Publishing",
    pageTitle: "Publishing | EP Journals Group",
    description:
      "Field-specific publishing references covering manuscript expectations, scope alignment, and submission considerations across disciplines.",
    routePrefix: "/publishing",
  },
  "user-focused": {
    label: "Resource",
    pluralLabel: "Resources",
    pageTitle: "Resources | EP Journals Group",
    description:
      "Audience-focused resources for students, early-career researchers, and first-time authors preparing to publish their work.",
    routePrefix: "/resources",
  },
};

interface Props {
  category: Category;
}

const CategoryIndex = ({ category }: Props) => {
  const meta = CATEGORY_META[category];
  const [pages, setPages] = useState<PageRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("content_pages")
        .select("slug,title,subtitle,summary,reading_time_minutes,updated_at")
        .eq("category", category)
        .eq("status", "published")
        .order("updated_at", { ascending: false });
      if (cancelled) return;
      setPages((data as PageRow[]) || []);
      setLoading(false);
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [category]);

  // JSON-LD CollectionPage for SEO discoverability of the index itself
  useEffect(() => {
    if (loading) return;
    const url = typeof window !== "undefined" ? window.location.href : undefined;
    const ld = {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: meta.pluralLabel,
      description: meta.description,
      url,
      isPartOf: {
        "@type": "WebSite",
        name: "EP Journals Group",
        url: typeof window !== "undefined" ? window.location.origin : undefined,
      },
      hasPart: pages.map((p) => ({
        "@type": "Article",
        headline: p.title,
        description: p.summary || p.subtitle || undefined,
        url: typeof window !== "undefined"
          ? `${window.location.origin}${meta.routePrefix}/${p.slug}`
          : `${meta.routePrefix}/${p.slug}`,
      })),
    };
    const id = "ld-category-index";
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
  }, [pages, loading, meta]);

  return (
    <div className="min-h-screen bg-background">
      <MetaTags title={meta.pageTitle} description={meta.description} />
      <Header />

      <section className="py-6 bg-ep-cream border-b border-border">
        <div className="container mx-auto px-4">
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1">
            Knowledge Centre
          </p>
          <h1 className="text-xl font-heading font-semibold text-foreground mb-1">
            {meta.pluralLabel}
          </h1>
          <p className="text-muted-foreground text-sm leading-relaxed max-w-4xl">
            {meta.description}
          </p>
        </div>
      </section>

      <section className="py-8 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-[1fr_320px] gap-10">
            <div className="min-w-0">
              {loading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="border border-border bg-card p-4 animate-pulse">
                      <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                      <div className="h-3 bg-muted rounded w-1/2 mb-3" />
                      <div className="h-3 bg-muted rounded w-full mb-1" />
                      <div className="h-3 bg-muted rounded w-5/6" />
                    </div>
                  ))}
                </div>
              ) : pages.length === 0 ? (
                <div className="border border-border bg-card p-8 text-center">
                  <p className="text-muted-foreground text-sm">
                    No {meta.pluralLabel.toLowerCase()} have been published yet.
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    New entries will appear here as they are published through the editorial system.
                  </p>
                </div>
              ) : (
                <>
                  <p className="text-xs text-muted-foreground mb-4">
                    {pages.length} {pages.length === 1 ? "entry" : "entries"} · sorted by most recently updated
                  </p>
                  <div className="space-y-4">
                    {pages.map((p) => (
                      <article
                        key={p.slug}
                        className="border border-border bg-card p-4 hover:bg-muted/30 transition-colors"
                      >
                        <Link to={`${meta.routePrefix}/${p.slug}`} className="group">
                          <h2 className="text-sm font-heading font-semibold text-foreground group-hover:text-primary transition-colors leading-snug mb-1">
                            {p.title}
                          </h2>
                        </Link>
                        {(p.subtitle || p.summary) && (
                          <p className="text-xs text-foreground leading-relaxed line-clamp-3 mb-2">
                            {p.subtitle || p.summary}
                          </p>
                        )}
                        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                          <Badge variant="outline" className="text-[10px] border">
                            {meta.label}
                          </Badge>
                          {p.reading_time_minutes ? (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" /> {p.reading_time_minutes} min read
                            </span>
                          ) : null}
                          <Link
                            to={`${meta.routePrefix}/${p.slug}`}
                            className="text-primary hover:underline ml-auto"
                          >
                            Read →
                          </Link>
                        </div>
                      </article>
                    ))}
                  </div>
                </>
              )}
            </div>

            <InstitutionalSidebar variant="authors" />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default CategoryIndex;
