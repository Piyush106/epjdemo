import Link from "next/link";
import { CalendarDays, Users } from "lucide-react";
import { articlePath } from "@/lib/articleUrl";
import { issueKey, issuePath } from "@/lib/issues";

// One article, shown the same way everywhere it is listed (archive, journal,
// issue, related, /articles). Each part is visually separate: journal + date on
// top, the title, a labelled author line, then issue/pages/DOI in a footer.
// No hooks, so it renders in both server and client components.

export interface ArticleCardData {
  id: string;
  title: string;
  authors: string;
  journal_abbrev: string;
  publication_date: string;
  volume?: string | null;
  issue?: string | null;
  pages?: string | null;
  doi?: string | null;
  abstract?: string | null;
  /** Set when the DOI is confirmed to resolve; only then is it linked. */
  doi_registered?: boolean;
}

const fmt = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

export default function ArticleCard({
  article: a,
  showJournal = true,
  showAbstract = false,
  number,
}: {
  article: ArticleCardData;
  showJournal?: boolean;
  showAbstract?: boolean;
  /** Optional position, e.g. in an issue's table of contents. */
  number?: number;
}) {
  const { volume, issue } = issueKey({ volume: a.volume ?? null, issue: a.issue ?? null });
  const href = articlePath(a);
  return (
    <article className="border border-border bg-card rounded-sm transition-shadow hover:shadow-sm">
      <div className="px-4 pt-3 pb-3">
        <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground mb-2">
          {number != null && (
            <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full border border-primary px-1 text-[10px] font-semibold text-primary">
              {number}
            </span>
          )}
          {showJournal && (
            <Link
              href={`/journals/${a.journal_abbrev.toLowerCase()}`}
              className="inline-flex items-center rounded-sm bg-primary/10 px-1.5 py-0.5 font-semibold uppercase tracking-wider text-primary hover:bg-primary/15"
            >
              {a.journal_abbrev}
            </Link>
          )}
          <span className="uppercase tracking-wider">Research article</span>
          <span aria-hidden="true">·</span>
          <span className="inline-flex items-center gap-1">
            <CalendarDays className="h-3 w-3" aria-hidden="true" />
            <time dateTime={a.publication_date.slice(0, 10)}>{fmt(a.publication_date)}</time>
          </span>
        </div>

        <h3 className="font-heading text-[15px] font-semibold leading-snug text-foreground">
          <Link href={href} className="hover:text-primary transition-colors">{a.title}</Link>
        </h3>

        {a.authors && (
          <p className="mt-1.5 flex items-start gap-1.5 text-xs text-foreground/80">
            <Users className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
            <span>
              <span className="sr-only">Authors: </span>
              {a.authors}
            </span>
          </p>
        )}

        {showAbstract && a.abstract && (
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground line-clamp-3">{a.abstract}</p>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-border bg-secondary/60 px-4 py-2 text-[11px] text-muted-foreground">
        {volume && issue ? (
          <Link href={issuePath(a.journal_abbrev, volume, issue)} className="hover:text-primary hover:underline">
            Vol. {volume}, Issue {issue}
          </Link>
        ) : null}
        {a.pages ? <span>pp. {a.pages}</span> : null}
        {a.doi ? (
          a.doi_registered ? (
            <a href={`https://doi.org/${a.doi}`} target="_blank" rel="noopener noreferrer" className="hover:text-primary hover:underline">
              DOI {a.doi}
            </a>
          ) : (
            <span title="DOI registration with Crossref in progress">DOI {a.doi}</span>
          )
        ) : null}
        <Link href={href} className="ml-auto font-medium text-primary hover:underline">
          Read article &rarr;
        </Link>
      </div>
    </article>
  );
}
