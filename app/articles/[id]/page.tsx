import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getArticle, getJournalByAbbrev, getAllArticleIds } from "@/lib/data";
import { buildMetadata, SITE } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

// Pre-render article pages and refresh every 3 days, matching the ingestion cycle.
// New articles added by the ingestion job are server-rendered on first request,
// then cached — so every article is real HTML that Google Scholar can read.
export const revalidate = 259200; // 3 days

export async function generateStaticParams() {
  try {
    const ids = await getAllArticleIds();
    return ids.map((id) => ({ id }));
  } catch {
    return [];
  }
}

function parsePages(pages: string | null): { first?: string; last?: string } {
  if (!pages) return {};
  const [first, last] = pages.split("-").map((p) => p.trim());
  return { first: first || undefined, last: last || first || undefined };
}

function authorList(authors: string): string[] {
  return authors.split(",").map((a) => a.trim()).filter(Boolean);
}

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> },
): Promise<Metadata> {
  const { id } = await params;
  const article = await getArticle(id);
  if (!article) return buildMetadata({ title: "Article not found", description: "", noindex: true });

  const journal = await getJournalByAbbrev(article.journal_abbrev);
  const issn = journal?.electronic_issn ?? journal?.print_issn ?? undefined;
  const { first, last } = parsePages(article.pages);
  const authors = authorList(article.authors);

  // DECISION (locked): canonical points to the OJS version of record — the page
  // that holds the DOI and the PDF — so scholarly authority concentrates there
  // and this page serves as discovery without duplicate-content dilution.
  const versionOfRecord = article.article_url ?? `${SITE.origin}/articles/${article.id}`;
  const scholarDate = article.publication_date.substring(0, 10).split("-").join("/");

  // Google Scholar citation_* tags — rendered server-side in <head>.
  const citation: Record<string, string | string[]> = {
    citation_title: article.title,
    citation_author: authors,
    citation_journal_title: article.journal_name,
    citation_publication_date: scholarDate,
    citation_language: "en",
    citation_abstract_html_url: versionOfRecord,
  };
  if (issn) citation.citation_issn = issn;
  if (article.volume) citation.citation_volume = article.volume;
  if (article.issue) citation.citation_issue = article.issue;
  if (first) citation.citation_firstpage = first;
  if (last) citation.citation_lastpage = last;
  if (article.doi) citation.citation_doi = article.doi;
  if (article.pdf_url) citation.citation_pdf_url = article.pdf_url;

  return buildMetadata({
    title: article.title,
    description: (article.abstract ?? "").slice(0, 200),
    canonical: versionOfRecord,
    ogType: "article",
    other: citation,
  });
}

export default async function ArticlePage(
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const article = await getArticle(id);
  if (!article) notFound();

  const journal = await getJournalByAbbrev(article.journal_abbrev);
  const authors = authorList(article.authors);
  const { first, last } = parsePages(article.pages);
  const fullTextUrl = article.article_url ?? article.pdf_url ?? undefined;
  const pubDate = new Date(article.publication_date);
  const formatted = pubDate.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

  const scholarlyArticleLd = {
    "@context": "https://schema.org",
    "@type": "ScholarlyArticle",
    headline: article.title,
    name: article.title,
    author: authors.map((name) => ({ "@type": "Person", name })),
    datePublished: article.publication_date,
    abstract: article.abstract,
    description: (article.abstract ?? "").slice(0, 300),
    inLanguage: "en",
    license: "https://creativecommons.org/licenses/by/4.0/",
    url: fullTextUrl ?? `${SITE.origin}/articles/${article.id}`,
    ...(article.doi
      ? { identifier: { "@type": "PropertyValue", propertyID: "DOI", value: article.doi } }
      : {}),
    ...(article.keywords?.length ? { keywords: article.keywords.join(", ") } : {}),
    ...(first ? { pageStart: first } : {}),
    ...(last ? { pageEnd: last } : {}),
    isPartOf: {
      "@type": "Periodical",
      name: article.journal_name,
      alternateName: article.journal_abbrev,
      ...(journal?.electronic_issn ? { issn: journal.electronic_issn } : {}),
    },
  };

  return (
    <>
      <Header />
    <main className="min-h-screen bg-background">
      <JsonLd data={scholarlyArticleLd} />
      <article className="container py-12 prose-academic">
        <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">
          {article.journal_name} ({article.journal_abbrev})
        </p>
        <h1 className="font-heading text-2xl md:text-3xl font-semibold text-foreground">
          {article.title}
        </h1>
        <p className="text-sm text-foreground mt-3">{authors.join(", ")}</p>
        <p className="text-sm text-muted-foreground">
          {formatted}
          {article.volume ? ` · Vol. ${article.volume}` : ""}
          {article.issue ? `, Issue ${article.issue}` : ""}
          {article.pages ? `, pp. ${article.pages}` : ""}
        </p>
        {article.doi && (
          <p className="text-sm mt-1">
            DOI:{" "}
            <a className="text-primary hover:underline" href={`https://doi.org/${article.doi}`}>
              {article.doi}
            </a>
          </p>
        )}

        <h2 className="font-heading text-lg font-semibold text-foreground mt-8 mb-2">Abstract</h2>
        <p className="text-foreground">{article.abstract}</p>

        {fullTextUrl && (
          <p className="mt-8">
            <a
              href={fullTextUrl}
              className="inline-block bg-primary text-primary-foreground px-5 py-2.5 text-sm font-semibold rounded-sm hover:bg-primary-hover"
            >
              Read the full text on {article.journal_name} &rarr;
            </a>
            <span className="block text-xs text-muted-foreground mt-2">
              The full peer-reviewed article and PDF are hosted on the journal&apos;s site (the version of record).
            </span>
          </p>
        )}

        <p className="mt-10">
          <Link href="/articles" className="text-primary hover:underline text-sm">
            &larr; Back to all articles
          </Link>
        </p>
      </article>
    </main>
      <Footer />
    </>
  );
}
