import type { MetadataRoute } from "next";
import { SITE } from "@/lib/seo";
import { getAllArticleIds, getAllContentPages } from "@/lib/data";
import { POLICIES } from "@/components/PolicyLayout";

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
    "/editorial",
    "/indexing",
    "/publication-process",
    "/about",
    "/contact",
    "/submit",
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
    const ids = await getAllArticleIds();
    articleEntries = ids.map((id) => ({
      url: `${base}/articles/${id}`,
      lastModified: new Date(),
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
      .filter((p) => CONTENT_BASE[p.category])
      .map((p) => ({
        url: `${base}${CONTENT_BASE[p.category]}/${p.slug}`,
        lastModified: p.updated_at ? new Date(p.updated_at) : new Date(),
        changeFrequency: "monthly",
        priority: 0.6,
      }));
  } catch {
    contentEntries = [];
  }

  return [...staticEntries, ...policyEntries, ...articleEntries, ...contentEntries];
}
