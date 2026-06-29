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

const ROUTE_PREFIX: Record<string, string> = {
  guide: "/guides",
  comparison: "/comparisons",
  publishing: "/publishing",
  "user-focused": "/resources",
};

const PREFERRED: Record<string, string[]> = {
  guide: [
    "how-to-publish-a-research-paper",
    "free-vs-paid-journals",
    "how-peer-review-works",
    "what-is-doi",
  ],
  publishing: [
    "publish-research-paper-in-engineering",
    "publish-research-paper-in-artificial-intelligence",
    "publish-research-paper-in-management",
    "publish-research-paper-in-commerce",
  ],
  comparison: [
    "open-access-vs-subscription-journals",
    "high-apc-vs-low-apc-journals",
    "indexed-vs-non-indexed-journals",
  ],
};

const orderByPreferred = (rows: PageRef[], preferred: string[]) => {
  const map = new Map(rows.map((r) => [r.slug, r]));
  const ordered: PageRef[] = [];
  preferred.forEach((s) => {
    const m = map.get(s);
    if (m) ordered.push(m);
  });
  // Append anything else, capped
  rows.forEach((r) => {
    if (!preferred.includes(r.slug) && ordered.length < preferred.length) ordered.push(r);
  });
  return ordered;
};

const Block = ({
  title,
  pages,
  bg = "bg-secondary",
}: {
  title: string;
  pages: PageRef[];
  bg?: string;
}) => {
  if (!pages.length) return null;
  return (
    <div className={`border border-border ${bg} p-4`}>
      <h3 className="font-heading font-semibold text-foreground text-sm mb-3 border-b border-border pb-2">
        {title}
      </h3>
      <ul className="text-xs space-y-1.5">
        {pages.map((p) => (
          <li key={`${p.category}-${p.slug}`}>
            <Link
              to={`${ROUTE_PREFIX[p.category]}/${p.slug}`}
              className="text-primary hover:underline"
            >
              {p.title}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

const KnowledgeNavBlocks = () => {
  const [rows, setRows] = useState<PageRef[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const allSlugs = [
        ...PREFERRED.guide,
        ...PREFERRED.publishing,
        ...PREFERRED.comparison,
      ];
      const { data } = await fetchWithRetry<PageRef[]>(() =>
        supabase
          .from("content_pages")
          .select("slug,title,category")
          .eq("status", "published")
          .in("slug", allSlugs),
      );
      if (!cancelled && data) setRows(data);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const guides = orderByPreferred(
    rows.filter((r) => r.category === "guide"),
    PREFERRED.guide,
  );
  const publishing = orderByPreferred(
    rows.filter((r) => r.category === "publishing"),
    PREFERRED.publishing,
  );
  const comparisons = orderByPreferred(
    rows.filter((r) => r.category === "comparison"),
    PREFERRED.comparison,
  );

  return (
    <>
      <Block title="Popular Guides" pages={guides} bg="bg-background" />
      <Block title="Publish by Field" pages={publishing} bg="bg-secondary" />
      <Block title="Quick Comparisons" pages={comparisons} bg="bg-background" />
    </>
  );
};

export default KnowledgeNavBlocks;
