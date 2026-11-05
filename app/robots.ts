import type { MetadataRoute } from "next";
import { SITE } from "@/lib/seo";

// Private/auth/API paths kept out of all crawlers; nothing indexable is blocked
// (articles, PDFs, archives, issue pages, /_next assets needed for rendering).
const DISALLOW = ["/admin", "/login", "/signup", "/unsubscribe", "/api/"];

// Search crawlers, listed explicitly so no future "*" rule can shut them out.
// Google Scholar crawls as Googlebot.
const SEARCH_BOTS = [
  "Googlebot", "Googlebot-Image", "Googlebot-News", // Google Search, Images, News/Discover, Scholar
  "Bingbot",                                        // Bing (also grounds ChatGPT search and Copilot)
  "DuckDuckBot", "Applebot", "YandexBot",
];

// AI answer-engine and training crawlers we explicitly welcome. The content is
// CC BY 4.0 and the goal is citation + dissemination, so retrieval bots (which
// produce the citations) must never be blocked, and training bots are allowed
// per the publisher's open-access stance.
const AI_BOTS = [
  "OAI-SearchBot", "ChatGPT-User", "GPTBot",        // OpenAI — ChatGPT search + training
  "PerplexityBot", "Perplexity-User",               // Perplexity
  "Google-Extended",                                // Google AI Overviews / Gemini grounding
  "ClaudeBot", "Claude-SearchBot", "Claude-User",   // Anthropic
  "CCBot",                                          // Common Crawl (feeds many models)
  "Applebot-Extended",                              // Apple Intelligence
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: DISALLOW },
      ...[...SEARCH_BOTS, ...AI_BOTS].map((ua) => ({ userAgent: ua, allow: "/", disallow: DISALLOW })),
    ],
    // The RSS feed doubles as a sitemap of the newest articles; search engines
    // re-read feeds more often than full sitemaps, so new papers surface sooner.
    sitemap: [`${SITE.origin}/sitemap.xml`, `${SITE.origin}/articles/feed.xml`],
  };
}
