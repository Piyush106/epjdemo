"use client";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { fetchWithRetry } from "@/lib/supabaseRetry";

interface PageRef {
  slug: string;
  title: string;
  category: string;
  summary: string | null;
}

const ROUTE_PREFIX: Record<string, string> = {
  guide: "/guides",
  comparison: "/comparisons",
  publishing: "/publishing",
  "user-focused": "/resources",
};

const LABEL: Record<string, string> = {
  guide: "Guide",
  comparison: "Comparison",
  publishing: "Publishing",
  "user-focused": "Resource",
};

interface Props {
  currentSlug: string;
  currentCategory: string;
}

const RelatedTopics = ({ currentSlug, currentCategory }: Props) => {
  const [items, setItems] = useState<PageRef[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const otherCategories = ["guide", "comparison", "publishing", "user-focused"].filter(
        (c) => c !== currentCategory,
      );
      // Fetch 2 per other category + 2 from same category (excluding current)
      const all: PageRef[] = [];
      for (const c of otherCategories) {
        const { data } = await fetchWithRetry<PageRef[]>(() =>
          supabase
            .from("content_pages")
            .select("slug,title,category,summary")
            .eq("status", "published")
            .eq("category", c)
            .order("updated_at", { ascending: false })
            .limit(2),
        );
        if (data) all.push(...data);
      }
      const { data: same } = await fetchWithRetry<PageRef[]>(() =>
        supabase
          .from("content_pages")
          .select("slug,title,category,summary")
          .eq("status", "published")
          .eq("category", currentCategory)
          .neq("slug", currentSlug)
          .order("updated_at", { ascending: false })
          .limit(2),
      );
      if (same) all.push(...same);
      if (!cancelled) setItems(all);
    })();
    return () => {
      cancelled = true;
    };
  }, [currentSlug, currentCategory]);

  if (!items.length) return null;

  return (
    <section aria-labelledby="related-topics" className="mt-6">
      <h2 id="related-topics" className="text-base font-heading font-semibold text-foreground mb-2">
        Related topics across the knowledge centre
      </h2>
      <div className="grid sm:grid-cols-2 gap-3">
        {items.map((p) => (
          <Link
            key={`${p.category}-${p.slug}`}
            to={`${ROUTE_PREFIX[p.category]}/${p.slug}`}
            className="block border border-border bg-background p-3 hover:bg-secondary transition-colors"
          >
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-0.5">
              {LABEL[p.category]}
            </p>
            <p className="text-sm font-heading font-semibold text-primary leading-snug">{p.title}</p>
            {p.summary ? (
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed line-clamp-2">
                {p.summary}
              </p>
            ) : null}
          </Link>
        ))}
      </div>
    </section>
  );
};

export default RelatedTopics;
