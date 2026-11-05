import Link from "next/link";
import type { Article, Journal } from "@/lib/types";
import { articlePath } from "@/lib/articleUrl";

// Homepage block: the three newest articles from each journal, with links to
// the journal and its archive. Every journal gets equal space on the most
// crawled page of the site, and new articles are linked from it within the hour.

export default function LatestByJournal({ journals, byJournal }: { journals: Journal[]; byJournal: Record<string, Article[]> }) {
  const withArticles = journals.filter((j) => byJournal[j.abbrev]?.length);
  if (!withArticles.length) return null;
  return (
    <section aria-labelledby="latest-by-journal" className="mb-8">
      <h2 id="latest-by-journal" className="text-lg font-heading font-semibold text-foreground mb-3 border-b border-border pb-2">
        Latest research from each journal
      </h2>
      <div className="grid md:grid-cols-2 gap-4">
        {withArticles.map((j) => {
          const base = `/journals/${j.abbrev.toLowerCase()}`;
          return (
            <div key={j.abbrev} className="border border-border bg-card p-4 min-w-0">
              <h3 className="font-heading text-sm font-semibold text-foreground">
                <Link href={base} className="hover:text-primary">{j.title} ({j.abbrev})</Link>
              </h3>
              <ul className="mt-2 space-y-2">
                {byJournal[j.abbrev].map((a) => (
                  <li key={a.id}>
                    <Link href={articlePath(a)} className="text-xs text-foreground hover:text-primary leading-snug line-clamp-2">
                      {a.title}
                    </Link>
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-xs">
                <Link href={`${base}/archive`} className="text-primary hover:underline">All {j.abbrev} issues &rarr;</Link>
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
