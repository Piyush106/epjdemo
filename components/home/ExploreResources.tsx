"use client";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { fetchWithRetry } from "@/lib/supabaseRetry";

interface PageRef {
  slug: string;
  title: string;
  category: string;
}

const PREFIX: Record<string, string> = {
  guide: "/guides",
  comparison: "/comparisons",
  publishing: "/publishing",
  "user-focused": "/resources",
};

const COLUMNS: Array<{ key: string; label: string; description: string }> = [
  {
    key: "guide",
    label: "Guides",
    description: "Step-by-step references on writing, submitting, and publishing.",
  },
  {
    key: "comparison",
    label: "Comparisons",
    description: "Neutral side-by-side analyses of common publishing choices.",
  },
  {
    key: "publishing",
    label: "Publishing by Field",
    description: "Field-specific guidance for engineering, management, law, and more.",
  },
  {
    key: "user-focused",
    label: "For Authors",
    description: "Recommendations for students, PhD scholars, and first-time authors.",
  },
];

const ExploreResources = () => {
  const [byCat, setByCat] = useState<Record<string, PageRef[]>>({});

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const result: Record<string, PageRef[]> = {};
      for (const col of COLUMNS) {
        const { data } = await fetchWithRetry<PageRef[]>(() =>
          supabase
            .from("content_pages")
            .select("slug,title,category")
            .eq("status", "published")
            .eq("category", col.key)
            .order("updated_at", { ascending: false })
            .limit(5),
        );
        result[col.key] = data || [];
      }
      if (!cancelled) setByCat(result);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="mb-8">
      <h2 className="text-lg font-heading font-semibold text-foreground mb-3 border-b border-border pb-2">
        Explore Publishing Resources
      </h2>
      <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
        The knowledge centre maintains a growing library of editorial references organised by purpose. Entries
        below are drawn dynamically from the published collection and rotate as new material is added.
      </p>
      <div className="border border-border bg-card p-4">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {COLUMNS.map((col) => {
            const items = byCat[col.key] || [];
            return (
              <div key={col.key}>
                <h3 className="text-sm font-heading font-semibold text-foreground mb-1">{col.label}</h3>
                <p className="text-xs text-muted-foreground mb-2 leading-relaxed">{col.description}</p>
                <ul className="text-xs space-y-1">
                  {items.map((p) => (
                    <li key={p.slug}>
                      <Link
                        to={`${PREFIX[col.key]}/${p.slug}`}
                        className="text-primary hover:underline"
                      >
                        {p.title}
                      </Link>
                    </li>
                  ))}
                  {items.length === 0 ? (
                    <li className="text-muted-foreground">Loading…</li>
                  ) : null}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ExploreResources;
