import type { MetadataRoute } from "next";
import { SITE } from "@/lib/seo";
import { getAllArticleIds } from "@/lib/data";
import { POLICIES } from "@/components/PolicyLayout";

export const revalidate = 86400; // refresh sitemap daily

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

  return [...staticEntries, ...policyEntries, ...articleEntries];
}
