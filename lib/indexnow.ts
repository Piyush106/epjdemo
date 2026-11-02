import { SITE } from "@/lib/seo";

// IndexNow tells Bing (which grounds ChatGPT search and Copilot), Yandex, Naver
// and Seznam that URLs are new or changed, so they are crawled within hours
// instead of waiting for the next sitemap read. Google does not use IndexNow;
// it reads the sitemap.
//
// The key is public by design: search engines verify it by fetching
// /<key>.txt from this site (public/5a82a2cad2cd5bf445a62a60d321e55c.txt).
export const INDEXNOW_KEY = "5a82a2cad2cd5bf445a62a60d321e55c";

const MAX_URLS = 10000; // IndexNow per-request limit

/** Submit absolute URLs on this host. Returns the HTTP status (200/202 = accepted). */
export async function submitToIndexNow(urls: string[]): Promise<number> {
  const host = new URL(SITE.origin).host;
  const urlList = [...new Set(urls)].filter((u) => u.startsWith(SITE.origin)).slice(0, MAX_URLS);
  if (!urlList.length) return 204;
  const res = await fetch("https://api.indexnow.org/indexnow", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({
      host,
      key: INDEXNOW_KEY,
      keyLocation: `${SITE.origin}/${INDEXNOW_KEY}.txt`,
      urlList,
    }),
  });
  return res.status;
}
