import type { MetadataRoute } from "next";
import { SITE } from "@/lib/seo";
import { getArticleSitemapRows, getAllContentPages, getJournals } from "@/lib/data";
import { POLICIES } from "@/components/PolicyLayout";
import { CANONICAL_OVERRIDES } from "@/lib/contentRoute";

export const revalidate = 86400; // refresh sitemap daily

// content_pages.category → URL base on this site.
const CONTENT_BASE: Record<string, string> = {
  guide: "/guides",
  comparison: "/comparisons",
  publishing: "/publishing",
  "user-focused": "/resources",
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = SITE.origin;

  const staticPaths = [
    "",
    "/journals",
    "/articles",
    "/authors",
    "/templates",
    "/editorial",
    "/join-editorial-board",
    "/indexing",
    "/publication-process",
    "/about",
    "/contact",
    "/submit",
    "/publish",
    "/policies",
    "/guides",
    "/comparisons",
    "/publishing",
    "/resources",
  ];

  const staticEntries: MetadataRoute.Sitemap = staticPaths.map((p) => ({
    url: `${base}${p}`,
    lastModified: new Date(),
    changeFrequency: p === "" || p === "/articles" ? "daily" : "weekly",
    priority: p === "" ? 1 : 0.7,
  }));

  const policyEntries: MetadataRoute.Sitemap = POLICIES.map((p) => ({
    url: `${base}/policies/${p.route}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  let articleEntries: MetadataRoute.Sitemap = [];
  try {
    const rows = await getArticleSitemapRows();
    articleEntries = rows.map((r) => ({
      url: `${base}/articles/${r.id}`,
      lastModified: r.publication_date ? new Date(r.publication_date) : new Date(),
      changeFrequency: "yearly",
      priority: 0.6,
    }));
  } catch {
    articleEntries = [];
  }

  let contentEntries: MetadataRoute.Sitemap = [];
  try {
    const pages = await getAllContentPages();
    contentEntries = pages
      // Only canonical URLs belong in the sitemap — drop pages consolidated
      // into another via a canonical override.
      .filter((p) => CONTENT_BASE[p.category] && !CANONICAL_OVERRIDES[`${p.category}:${p.slug}`])
      .map((p) => ({
        url: `${base}${CONTENT_BASE[p.category]}/${p.slug}`,
        lastModified: p.updated_at ? new Date(p.updated_at) : new Date(),
        changeFrequency: "monthly",
        priority: 0.6,
      }));
  } catch {
    contentEntries = [];
  }

  let journalEntries: MetadataRoute.Sitemap = [];
  try {
    const journals = await getJournals();
    journalEntries = journals.map((j) => ({
      url: `${base}/journals/${j.abbrev.toLowerCase()}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    }));
  } catch {
    journalEntries = [];
  }

  return [...staticEntries, ...journalEntries, ...policyEntries, ...articleEntries, ...contentEntries];
}
