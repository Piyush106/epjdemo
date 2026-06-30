import type { Metadata } from "next";
import Articles from "@/views/Articles";
import { buildMetadata } from "@/lib/seo";
import { getRecentArticles } from "@/lib/data";

// Refresh hourly; also revalidated on demand by the ingest-oai function after a
// harvest, so newly-ingested articles surface in this list immediately.
export const revalidate = 3600;

export const metadata: Metadata = buildMetadata({
  title: 'Articles',
  description: 'Recently published peer-reviewed articles across the EP Journals Group portfolio.',
  path: "/articles",
});

// Server-render the first page so every article (and its link) is in the initial
// HTML for crawlers; the client component keeps the journal filter + "load more".
export default async function Page() {
  let initialArticles: Awaited<ReturnType<typeof getRecentArticles>> = [];
  try {
    initialArticles = await getRecentArticles(20);
  } catch {
    initialArticles = [];
  }
  return <Articles initialArticles={initialArticles} />;
}
