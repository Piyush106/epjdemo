import type { MetadataRoute } from "next";
import { SITE } from "@/lib/seo";

// Private/auth/API paths kept out of all crawlers; nothing indexable is blocked.
const DISALLOW = ["/admin", "/login", "/signup", "/unsubscribe", "/api/"];

// AI answer-engine and training crawlers we explicitly welcome. The content is
// CC BY 4.0 and the goal is citation + dissemination, so retrieval bots (which
// produce the citations) must never be blocked, and training bots are allowed
// per the publisher's open-access stance. Listed explicitly for robustness even
// though the "*" rule already permits them.
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
      ...AI_BOTS.map((ua) => ({ userAgent: ua, allow: "/", disallow: DISALLOW })),
    ],
    sitemap: `${SITE.origin}/sitemap.xml`,
    host: SITE.origin,
  };
}
