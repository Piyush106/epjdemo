import Link from "next/link";
import ArticleCard, { type ArticleCardData } from "@/components/ArticleCard";

// Server-rendered article lists for the archive, journal-archive, issue,
// journal and related-article blocks. Plain <a> links in the initial HTML, so
// every article is one or two clicks from a crawlable page — not only listed
// in the sitemap.

/** Articles per archive page; /articles (page 1) shows the same number. */
export const ARCHIVE_PAGE_SIZE = 20;

export function ArchiveArticleList({
  articles,
  showJournal = true,
  numbered = false,
}: {
  articles: ArticleCardData[];
  showJournal?: boolean;
  /** Number the cards (issue tables of contents). */
  numbered?: boolean;
}) {
  return (
    <ol className="space-y-3">
      {articles.map((a, i) => (
        <li key={a.id}>
          <ArticleCard article={a} showJournal={showJournal} number={numbered ? i + 1 : undefined} />
        </li>
      ))}
    </ol>
  );
}

/** Numbered pager: /articles is page 1, /articles/page/N the rest. */
export function ArchivePager({ current, totalPages }: { current: number; totalPages: number }) {
  if (totalPages <= 1) return null;
  const href = (n: number) => (n === 1 ? "/articles" : `/articles/page/${n}`);
  return (
    <nav aria-label="Article archive pages" className="mt-6 border border-border bg-card p-3">
      <p className="text-xs text-muted-foreground mb-2">
        Page {current} of {totalPages} — every published article, newest first
      </p>
      <div className="flex flex-wrap items-center gap-1.5 text-sm">
        {current > 1 && (
          <Link href={href(current - 1)} rel="prev" className="px-2.5 py-1 border border-border hover:bg-muted">
            &larr; Newer
          </Link>
        )}
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) =>
          n === current ? (
            <span key={n} aria-current="page" className="px-2.5 py-1 border border-primary bg-primary text-primary-foreground">
              {n}
            </span>
          ) : (
            <Link key={n} href={href(n)} className="px-2.5 py-1 border border-border hover:bg-muted">
              {n}
            </Link>
          ),
        )}
        {current < totalPages && (
          <Link href={href(current + 1)} rel="next" className="px-2.5 py-1 border border-border hover:bg-muted">
            Older &rarr;
          </Link>
        )}
      </div>
    </nav>
  );
}
