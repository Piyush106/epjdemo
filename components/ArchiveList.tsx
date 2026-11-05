import Link from "next/link";
import type { ArchiveArticle } from "@/lib/data";
import { articlePath } from "@/lib/articleUrl";
import { issueKey, issuePath } from "@/lib/issues";

// Server-rendered article lists for the archive, journal-archive and issue
// pages. Plain <a> links in the initial HTML, so every article is one or two
// clicks from a crawlable page — not only listed in the sitemap.

/** Articles per archive page; /articles (page 1) shows the same number. */
export const ARCHIVE_PAGE_SIZE = 20;

const fmt = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

export function ArchiveArticleList({ articles, showJournal = true }: { articles: ArchiveArticle[]; showJournal?: boolean }) {
  return (
    <ol className="divide-y divide-border border-y border-border">
      {articles.map((a) => {
        const { volume, issue } = issueKey(a);
        return (
          <li key={a.id} className="py-3">
            <Link href={articlePath(a)} className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              {a.title}
            </Link>
            <p className="text-xs text-muted-foreground mt-0.5">{a.authors}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {showJournal && (
                <>
                  <Link href={`/journals/${a.journal_abbrev.toLowerCase()}`} className="text-primary hover:underline">
                    {a.journal_abbrev}
                  </Link>
                  {" · "}
                </>
              )}
              {volume && issue ? (
                <Link href={issuePath(a.journal_abbrev, volume, issue)} className="hover:underline">
                  Vol. {volume}, Issue {issue}
                </Link>
              ) : null}
              {a.pages ? `, pp. ${a.pages}` : ""}
              {" · "}
              {fmt(a.publication_date)}
            </p>
          </li>
        );
      })}
    </ol>
  );
}

/** Numbered pager: /articles is page 1, /articles/page/N the rest. */
export function ArchivePager({ current, totalPages }: { current: number; totalPages: number }) {
  if (totalPages <= 1) return null;
  const href = (n: number) => (n === 1 ? "/articles" : `/articles/page/${n}`);
  return (
    <nav aria-label="Article archive pages" className="mt-6 flex flex-wrap items-center gap-1.5 text-sm">
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
    </nav>
  );
}
