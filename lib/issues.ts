// Volume/issue helpers for the journal archive and issue pages.
// URLs: /journals/<abbrev>/archive and /journals/<abbrev>/v<volume>/i<issue>
// (issue "07" and "7" are the same issue, so numbers are normalised).

import type { ArchiveArticle } from "@/lib/data";

export interface IssueGroup {
  volume: string;
  issue: string;
  articles: ArchiveArticle[];
  /** Latest publication date in the issue (ISO). */
  published: string;
}

// Some rows store volume/issue as numbers despite the string type.
const norm = (v: string | number | null | undefined) => {
  const s = String(v ?? "").trim();
  return /^\d+$/.test(s) ? String(Number(s)) : s;
};

export function issueKey(a: { volume: string | null; issue: string | null }) {
  return { volume: norm(a.volume), issue: norm(a.issue) };
}

export function issuePath(abbrev: string, volume: string, issue: string) {
  return `/journals/${abbrev.toLowerCase()}/v${volume}/i${issue}`;
}

/** Group articles by volume + issue, newest issue first; articles in page order. */
export function groupByIssue(articles: ArchiveArticle[]): IssueGroup[] {
  const map = new Map<string, IssueGroup>();
  for (const a of articles) {
    const { volume, issue } = issueKey(a);
    if (!volume || !issue) continue;
    const k = `${volume}/${issue}`;
    const g = map.get(k) ?? { volume, issue, articles: [], published: a.publication_date };
    g.articles.push(a);
    if (a.publication_date > g.published) g.published = a.publication_date;
    map.set(k, g);
  }
  const firstPage = (a: ArchiveArticle) => Number.parseInt((a.pages ?? "").split("-")[0], 10) || Number.MAX_SAFE_INTEGER;
  for (const g of map.values()) {
    g.articles.sort((x, y) => firstPage(x) - firstPage(y) || x.publication_date.localeCompare(y.publication_date));
  }
  return [...map.values()].sort(
    (x, y) => Number(y.volume) - Number(x.volume) || Number(y.issue) - Number(x.issue),
  );
}

/** "1 article" / "18 articles". */
export function articleCount(n: number) {
  return `${n} ${n === 1 ? "article" : "articles"}`;
}

/** "October 2026" style label from an ISO date. */
export function monthYear(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { month: "long", year: "numeric" });
}
