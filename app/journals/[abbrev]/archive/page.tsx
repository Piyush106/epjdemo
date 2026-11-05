import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import JsonLd from "@/components/JsonLd";
import { ArchiveArticleList } from "@/components/ArchiveList";
import { getJournals, getJournalByAbbrev, getJournalArchive } from "@/lib/data";
import { buildBreadcrumbLd, buildMetadata, SITE } from "@/lib/seo";
import { groupByIssue, issuePath, monthYear } from "@/lib/issues";

// /journals/<abbrev>/archive — every issue of one journal with every article,
// server-rendered. Gives each journal its own indexable showcase and puts each
// article one link away from a page Google crawls often.

export const revalidate = 3600;

export async function generateStaticParams() {
  try {
    return (await getJournals()).map((j) => ({ abbrev: j.abbrev.toLowerCase() }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: { params: Promise<{ abbrev: string }> }): Promise<Metadata> {
  const journal = await getJournalByAbbrev((await params).abbrev.toUpperCase());
  if (!journal) return buildMetadata({ title: "Journal not found", description: "", noindex: true });
  return buildMetadata({
    title: `${journal.abbrev} archive — all issues and articles`,
    description: `Every issue and article published in ${journal.title} (${journal.abbrev}), ${SITE.name}. Open access under CC BY 4.0 with Crossref DOIs.`,
    path: `/journals/${journal.abbrev.toLowerCase()}/archive`,
  });
}

export default async function JournalArchivePage({ params }: { params: Promise<{ abbrev: string }> }) {
  const journal = await getJournalByAbbrev((await params).abbrev.toUpperCase());
  if (!journal) notFound();

  const articles = await getJournalArchive(journal.abbrev);
  const issues = groupByIssue(articles);
  const base = `/journals/${journal.abbrev.toLowerCase()}`;
  const issns = [journal.electronic_issn, journal.print_issn].filter(Boolean);

  const archiveLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${journal.title} — archive`,
    url: `${SITE.origin}${base}/archive`,
    about: {
      "@type": "Periodical",
      name: journal.title,
      alternateName: journal.abbrev,
      ...(issns.length ? { issn: issns } : {}),
      url: `${SITE.origin}${base}`,
      publisher: { "@type": "Organization", "@id": `${SITE.origin}/#organization` },
      hasPart: issues.map((g) => ({
        "@type": "PublicationIssue",
        issueNumber: g.issue,
        url: `${SITE.origin}${issuePath(journal.abbrev, g.volume, g.issue)}`,
        isPartOf: { "@type": "PublicationVolume", volumeNumber: g.volume },
      })),
    },
  };

  return (
    <div className="min-h-screen bg-background">
      <JsonLd data={archiveLd} />
      <JsonLd
        data={buildBreadcrumbLd([
          { name: "Home", path: "" },
          { name: "Journals", path: "/journals" },
          { name: journal.abbrev, path: base },
          { name: "Archive", path: `${base}/archive` },
        ])}
      />
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1">
          <Link href="/journals" className="hover:underline">Journals</Link> ·{" "}
          <Link href={base} className="hover:underline">{journal.abbrev}</Link> · Archive
        </p>
        <h1 className="text-2xl font-heading font-semibold text-foreground">{journal.title}: archive</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {articles.length} articles in {issues.length} issues
          {issns.length ? ` · ISSN ${issns.join(" / ")}` : ""} · open access under CC BY 4.0.{" "}
          <Link href="/submit" className="text-primary hover:underline">Submit to {journal.abbrev}</Link>
        </p>

        {/* Issue index first, so every issue page is linked near the top. */}
        <nav aria-label={`${journal.abbrev} issues`} className="mt-6 border border-border bg-secondary p-4">
          <h2 className="font-heading text-sm font-semibold text-foreground mb-2">Issues</h2>
          <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-1 text-sm">
            {issues.map((g) => (
              <li key={`${g.volume}-${g.issue}`}>
                <Link href={issuePath(journal.abbrev, g.volume, g.issue)} className="text-primary hover:underline">
                  Volume {g.volume}, Issue {g.issue}
                </Link>{" "}
                <span className="text-muted-foreground">({monthYear(g.published)}, {g.articles.length} articles)</span>
              </li>
            ))}
          </ul>
        </nav>

        {issues.map((g) => (
          <section key={`${g.volume}-${g.issue}`} className="mt-8" aria-labelledby={`v${g.volume}i${g.issue}`}>
            <h2 id={`v${g.volume}i${g.issue}`} className="font-heading text-lg font-semibold text-foreground mb-2">
              <Link href={issuePath(journal.abbrev, g.volume, g.issue)} className="hover:text-primary">
                Volume {g.volume}, Issue {g.issue}
              </Link>{" "}
              <span className="text-sm font-normal text-muted-foreground">· {monthYear(g.published)}</span>
            </h2>
            <ArchiveArticleList articles={g.articles} showJournal={false} />
          </section>
        ))}
      </main>
      <Footer />
    </div>
  );
}
