import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import JsonLd from "@/components/JsonLd";
import { ArchiveArticleList } from "@/components/ArchiveList";
import { getJournals, getJournalByAbbrev, getJournalArchive } from "@/lib/data";
import { buildBreadcrumbLd, buildMetadata, SITE } from "@/lib/seo";
import { articlePath } from "@/lib/articleUrl";
import { articleCount, groupByIssue, issuePath, monthYear } from "@/lib/issues";

// /journals/<abbrev>/v<volume>/i<issue> — one issue's table of contents.
// Issue TOCs are how Google Scholar and readers browse a journal, and each one
// links every article in the issue.

export const revalidate = 3600;

export async function generateStaticParams() {
  try {
    const params: { abbrev: string; vol: string; iss: string }[] = [];
    for (const j of await getJournals()) {
      for (const g of groupByIssue(await getJournalArchive(j.abbrev))) {
        params.push({ abbrev: j.abbrev.toLowerCase(), vol: `v${g.volume}`, iss: `i${g.issue}` });
      }
    }
    return params;
  } catch {
    return [];
  }
}

async function loadIssue(p: { abbrev: string; vol: string; iss: string }) {
  const vm = p.vol.match(/^v(\d+)$/i);
  const im = p.iss.match(/^i(\d+)$/i);
  if (!vm || !im) return null;
  const journal = await getJournalByAbbrev(p.abbrev.toUpperCase());
  if (!journal) return null;
  const volume = String(Number(vm[1]));
  const issue = String(Number(im[1]));
  const group = groupByIssue(await getJournalArchive(journal.abbrev)).find((g) => g.volume === volume && g.issue === issue);
  return group ? { journal, group } : null;
}

type Params = { params: Promise<{ abbrev: string; vol: string; iss: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const data = await loadIssue(await params);
  if (!data) return buildMetadata({ title: "Issue not found", description: "", noindex: true });
  const { journal, group } = data;
  return buildMetadata({
    title: `${journal.abbrev} Volume ${group.volume}, Issue ${group.issue} (${monthYear(group.published)})`,
    description: `Table of contents of ${journal.title}, Volume ${group.volume}, Issue ${group.issue}: ${group.articles.length} peer-reviewed open access articles.`,
    path: issuePath(journal.abbrev, group.volume, group.issue),
  });
}

export default async function IssuePage({ params }: Params) {
  const data = await loadIssue(await params);
  if (!data) notFound();
  const { journal, group } = data;
  const base = `/journals/${journal.abbrev.toLowerCase()}`;
  const path = issuePath(journal.abbrev, group.volume, group.issue);
  const issns = [journal.electronic_issn, journal.print_issn].filter(Boolean);

  const issueLd = {
    "@context": "https://schema.org",
    "@type": "PublicationIssue",
    "@id": `${SITE.origin}${path}#issue`,
    issueNumber: group.issue,
    datePublished: group.published,
    url: `${SITE.origin}${path}`,
    isPartOf: {
      "@type": "PublicationVolume",
      volumeNumber: group.volume,
      isPartOf: {
        "@type": "Periodical",
        name: journal.title,
        alternateName: journal.abbrev,
        ...(issns.length ? { issn: issns } : {}),
        url: `${SITE.origin}${base}`,
        publisher: { "@type": "Organization", "@id": `${SITE.origin}/#organization` },
      },
    },
    hasPart: group.articles.map((a) => ({
      "@type": "ScholarlyArticle",
      headline: a.title.slice(0, 110),
      url: `${SITE.origin}${articlePath(a)}`,
      ...(a.doi ? { identifier: { "@type": "PropertyValue", propertyID: "DOI", value: a.doi } } : {}),
    })),
  };

  return (
    <div className="min-h-screen bg-background">
      <JsonLd data={issueLd} />
      <JsonLd
        data={buildBreadcrumbLd([
          { name: "Home", path: "" },
          { name: "Journals", path: "/journals" },
          { name: journal.abbrev, path: base },
          { name: "Archive", path: `${base}/archive` },
          { name: `Vol. ${group.volume}, Issue ${group.issue}`, path },
        ])}
      />
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1">
          <Link href="/journals" className="hover:underline">Journals</Link> ·{" "}
          <Link href={base} className="hover:underline">{journal.abbrev}</Link> ·{" "}
          <Link href={`${base}/archive`} className="hover:underline">Archive</Link>
        </p>
        <h1 className="text-2xl font-heading font-semibold text-foreground">
          {journal.title}, Volume {group.volume}, Issue {group.issue}
        </h1>
        <p className="text-sm text-muted-foreground mt-1 mb-5">
          {monthYear(group.published)} · {articleCount(group.articles.length)}
          {issns.length ? ` · ISSN ${issns.join(" / ")}` : ""} · open access under CC BY 4.0
        </p>
        <ArchiveArticleList articles={group.articles} showJournal={false} />
        <p className="mt-6 text-sm">
          <Link href={`${base}/archive`} className="text-primary hover:underline">&larr; All {journal.abbrev} issues</Link>
        </p>
      </main>
      <Footer />
    </div>
  );
}
