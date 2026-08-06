"use client";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import InstitutionalSidebar from "@/components/InstitutionalSidebar";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";
import type { ContentListRow } from "@/lib/data";

type Category = "guide" | "comparison" | "publishing" | "user-focused";

export const CATEGORY_META: Record<Category, {
  label: string;
  pluralLabel: string;
  description: string;
  routePrefix: string;
}> = {
  guide: {
    label: "Guide",
    pluralLabel: "Guides",
    description:
      "Educational guides on academic publishing, peer review, manuscript preparation, and the publication process for authors at every career stage.",
    routePrefix: "/guides",
  },
  comparison: {
    label: "Comparison",
    pluralLabel: "Comparisons",
    description:
      "Side-by-side comparisons of publishing options, journal types, licensing models, and editorial approaches to support informed publishing decisions.",
    routePrefix: "/comparisons",
  },
  publishing: {
    label: "Publishing",
    pluralLabel: "Publishing",
    description:
      "Field-specific publishing references covering manuscript expectations, scope alignment, and submission considerations across disciplines.",
    routePrefix: "/publishing",
  },
  "user-focused": {
    label: "Resource",
    pluralLabel: "Resources",
    description:
      "Audience-focused resources for students, early-career researchers, and first-time authors preparing to publish their work.",
    routePrefix: "/resources",
  },
};

interface Props {
  category: Category;
  /**
   * Server-fetched list — present in the initial HTML so crawlers and AI
   * retrievers see every entry and its internal link, not a loading skeleton.
   */
  initialPages?: ContentListRow[];
}

const CategoryIndex = ({ category, initialPages = [] }: Props) => {
  const meta = CATEGORY_META[category];
  const pages = initialPages;

  return (
    <div className="min-h-screen bg-background">
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
              {pages.length === 0 ? (
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
