import type { MetadataRoute } from "next";
import { SITE } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        // All crawlers — including AI/LLM retrievers (GPTBot, ClaudeBot,
        // PerplexityBot, Google-Extended, etc.) — are welcome. Only private,
        // auth, and API paths are disallowed to avoid crawl waste; nothing that
        // should be indexed is blocked.
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/login", "/signup", "/unsubscribe", "/api/"],
      },
    ],
    sitemap: `${SITE.origin}/sitemap.xml`,
    host: SITE.origin,
  };
}
