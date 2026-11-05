import Link from "next/link";
import type { Article, Journal } from "@/lib/types";
import { articlePath } from "@/lib/articleUrl";
import { issueKey, issuePath } from "@/lib/issues";

// Homepage block: the three newest articles from each journal, with links to
// the journal and its archive. Every journal gets equal space on the most
// crawled page of the site, and new articles are linked from it within the hour.

const fmt = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

/** First author, plus "et al." when there are more. */
function leadAuthor(authors: string) {
  const list = authors.split(",").map((a) => a.trim()).filter(Boolean);
  if (!list.length) return "";
  return list.length > 1 ? `${list[0]} et al.` : list[0];
}

export default function LatestByJournal({ journals, byJournal }: { journals: Journal[]; byJournal: Record<string, Article[]> }) {
  const withArticles = journals.filter((j) => byJournal[j.abbrev]?.length);
  if (!withArticles.length) return null;
  return (
    <section aria-labelledby="latest-by-journal" className="mb-8">
      <h2 id="latest-by-journal" className="text-lg font-heading font-semibold text-foreground mb-1 border-b border-border pb-2">
        Latest research from each journal
      </h2>
      <p className="text-xs text-muted-foreground mb-4">The three most recent articles in each of the six journals.</p>
      <div className="grid md:grid-cols-2 gap-5">
        {withArticles.map((j) => {
          const base = `/journals/${j.abbrev.toLowerCase()}`;
          return (
            <article key={j.abbrev} className="border border-border bg-card min-w-0 flex flex-col">
              <header className="px-4 py-3 bg-secondary border-b border-border">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-primary">{j.abbrev}</p>
                <h3 className="font-heading text-sm font-semibold text-foreground leading-snug">
                  <Link href={base} className="hover:text-primary">{j.title}</Link>
                </h3>
              </header>
              <ol className="divide-y divide-border flex-1">
                {byJournal[j.abbrev].map((a, i) => {
                  const { volume, issue } = issueKey(a);
                  return (
                    <li key={a.id} className="flex gap-3 px-4 py-3">
                      <span
                        aria-hidden="true"
                        className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-primary text-[11px] font-semibold text-primary"
                      >
                        {i + 1}
                      </span>
                      <div className="min-w-0">
                        <Link
                          href={articlePath(a)}
                          className="block text-[13px] font-medium text-foreground hover:text-primary leading-snug line-clamp-3"
                        >
                          {a.title}
                        </Link>
                        <p className="mt-1 text-[11px] text-muted-foreground">
                          {leadAuthor(a.authors)}
                          {leadAuthor(a.authors) ? " · " : ""}
                          {fmt(a.publication_date)}
                          {volume && issue ? (
                            <>
                              {" · "}
                              <Link href={issuePath(j.abbrev, volume, issue)} className="hover:underline">
                                Vol. {volume}, Issue {issue}
                              </Link>
                            </>
                          ) : null}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ol>
              <footer className="px-4 py-2.5 border-t border-border flex flex-wrap gap-x-4 gap-y-1 text-xs">
                <Link href={`${base}/archive`} className="text-primary hover:underline">All {j.abbrev} issues &rarr;</Link>
                <Link href={base} className="text-muted-foreground hover:underline">About the journal</Link>
              </footer>
            </article>
          );
        })}
      </div>
    </section>
  );
}
