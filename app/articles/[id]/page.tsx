import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import type { Metadata } from "next";
import {
  getArticle,
  getArticleByIdPrefix,
  getJournalByAbbrev,
  getAllArticleIds,
  getRelatedArticles,
} from "@/lib/data";
import { buildMetadata, buildBreadcrumbLd, clampDescription, SITE } from "@/lib/seo";
import { articlePath, articleSlug, parseArticleParam } from "@/lib/articleUrl";
import JsonLd from "@/components/JsonLd";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ArticleCite from "@/components/ArticleCite";
import { isDoiRegistered } from "@/lib/doi";
import { issueKey, issuePath } from "@/lib/issues";
import type { Article } from "@/lib/types";

// Pre-render article pages and refresh every 3 days, matching the ingestion cycle.
// New articles added by the ingestion job are server-rendered on first request,
// then cached — so every article is real HTML that Google Scholar can read.
export const revalidate = 259200; // 3 days

// DECISION (2026-11-02): this page is the version of record. It is
// self-canonical, carries the full Google Scholar citation_* set, and serves the
// PDF from this domain (/articles/<slug>/pdf). Crossref DOIs are re-pointed here,
// and the OJS copy becomes the editorial-workflow mirror. (Supersedes the
// 2026-09-28 canonical-to-OJS decision.)

export async function generateStaticParams() {
  try {
    const rows = await getAllArticleIds();
    return rows.map((r) => ({ id: articleSlug(r) }));
  } catch {
    return [];
  }
}

/** Resolve the route segment to an article; legacy uuid URLs resolve too. */
async function loadArticle(param: string): Promise<Article | null> {
  const parsed = parseArticleParam(param);
  if (!parsed) return null;
  if ("uuid" in parsed) return getArticle(parsed.uuid);
  return getArticleByIdPrefix(parsed.prefix, decodeURIComponent(param));
}

function parsePages(pages: string | null): { first?: string; last?: string } {
  if (!pages) return {};
  const [first, last] = pages.split("-").map((p) => p.trim());
  return { first: first || undefined, last: last || first || undefined };
}

function authorList(authors: string): string[] {
  return authors.split(",").map((a) => a.trim()).filter(Boolean);
}

// Rows ingested before the OAI entity fix hold "p &lt; .05"; React would show
// the entity literally, so decode the common ones for display and metadata.
function decodeEntities(s: string): string {
  return s
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;/g, "'")
    .replace(/&amp;/g, "&");
}

/** First `n` sentences of an abstract — the answer-first summary AI engines quote. */
function leadSentences(text: string, n = 2): string {
  const sentences = text.match(/[^.!?]+[.!?]+(?=\s+[A-Z(]|\s*$)/g) ?? [text];
  return sentences.slice(0, n).join(" ").trim();
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> },
): Promise<Metadata> {
  const { id } = await params;
  const article = await loadArticle(id);
  if (!article) return buildMetadata({ title: "Article not found", description: "", noindex: true });

  const journal = await getJournalByAbbrev(article.journal_abbrev);
  const { first, last } = parsePages(article.pages);
  const authors = authorList(article.authors);
  const abstract = decodeEntities(article.abstract);
  const path = articlePath(article);
  const url = `${SITE.origin}${path}`;
  const scholarDate = article.publication_date.substring(0, 10).split("-").join("/");

  // Google Scholar (Highwire) tags — this page is the version of record.
  const citation: Record<string, string | string[]> = {
    citation_title: article.title,
    citation_author: authors,
    citation_journal_title: article.journal_name,
    citation_journal_abbrev: article.journal_abbrev,
    citation_publisher: SITE.name,
    citation_publication_date: scholarDate,
    citation_online_date: scholarDate,
    citation_language: "en",
    citation_abstract_html_url: url,
    citation_abstract: abstract,
  };
  const issns = [journal?.electronic_issn, journal?.print_issn].filter((x): x is string => Boolean(x));
  if (issns.length) citation.citation_issn = issns;
  if (article.volume) citation.citation_volume = article.volume;
  if (article.issue) citation.citation_issue = article.issue;
  if (first) citation.citation_firstpage = first;
  if (last) citation.citation_lastpage = last;
  if (article.doi) citation.citation_doi = article.doi;
  if (article.pdf_url) citation.citation_pdf_url = `${url}/pdf`;
  // Highwire keywords are semicolon-separated.
  if (article.keywords?.length) citation.citation_keywords = article.keywords.join("; ");

  // Scholar: the full text (PDF) is free to read without login.
  citation.citation_fulltext_world_readable = "";

  // Dublin Core and PRISM — read by library discovery systems, OpenAIRE-style
  // harvesters and some search engines alongside the Highwire set above.
  const isoDate = article.publication_date.substring(0, 10);
  const dcPrism: Record<string, string | string[]> = {
    "DC.title": article.title,
    "DC.creator": authors,
    "DC.date": isoDate,
    "DC.publisher": SITE.name,
    "DC.type": "Text.Serial.Journal",
    "DC.format": "text/html",
    "DC.language": "en",
    "DC.rights": "https://creativecommons.org/licenses/by/4.0/",
    "DC.source": article.journal_name,
    "DC.description": clampDescription(abstract, 500),
    "prism.publicationName": article.journal_name,
    "prism.publicationDate": isoDate,
    "prism.rightsAgent": SITE.email,
  };
  if (article.doi) {
    dcPrism["DC.identifier"] = `doi:${article.doi}`;
    dcPrism["prism.doi"] = article.doi;
  }
  if (keywords(article).length) dcPrism["DC.subject"] = keywords(article);
  if (issns[0]) dcPrism["prism.issn"] = issns[0];
  if (journal?.electronic_issn) dcPrism["prism.eIssn"] = journal.electronic_issn;
  if (article.volume) dcPrism["prism.volume"] = String(article.volume);
  if (article.issue) dcPrism["prism.number"] = String(article.issue);
  if (first) dcPrism["prism.startingPage"] = first;
  if (last) dcPrism["prism.endingPage"] = last;

  // Social cards show the journal and date at a glance.
  const twitterLabels = {
    "twitter:label1": "Journal",
    "twitter:data1": article.journal_abbrev,
    "twitter:label2": "Published",
    "twitter:data2": formatDate(article.publication_date),
  };

  // Title tag carries the journal and publisher so the brand shows in results.
  const meta = buildMetadata({
    title: `${article.title} | ${article.journal_abbrev}`,
    description: clampDescription(abstract, 160),
    path,
    ogType: "article",
    other: { ...citation, ...dcPrism, ...twitterLabels },
  });
  // Per-article Open Graph details. The share image comes from the sibling
  // opengraph-image.tsx; drop the site-wide card so it isn't used instead.
  const { images: _ogImages, ...og } = (meta.openGraph ?? {}) as Record<string, unknown>;
  meta.openGraph = {
    ...og,
    type: "article",
    publishedTime: isoDate,
    authors,
    section: article.journal_name,
    ...(keywords(article).length ? { tags: keywords(article) } : {}),
  } as Metadata["openGraph"];
  if (meta.twitter) {
    const { images: _twImages, ...tw } = meta.twitter as Record<string, unknown>;
    meta.twitter = tw as Metadata["twitter"];
  }
  return meta;
}

/** Trimmed, non-empty keywords. */
function keywords(article: Article): string[] {
  return (article.keywords ?? []).map((k) => (k ?? "").trim()).filter(Boolean);
}

export default async function ArticlePage(
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const article = await loadArticle(id);
  if (!article) notFound();

  // One URL per article: legacy uuid links and outdated slugs 301 to the current slug.
  const path = articlePath(article);
  if (decodeURIComponent(id) !== articleSlug(article)) permanentRedirect(path);

  const url = `${SITE.origin}${path}`;
  const journal = await getJournalByAbbrev(article.journal_abbrev);
  const issns = [journal?.electronic_issn, journal?.print_issn].filter((x): x is string => Boolean(x));
  const authors = authorList(article.authors);
  const abstract = decodeEntities(article.abstract);
  const related = await getRelatedArticles(article.journal_abbrev, article.id, 5);
  const doiLive = article.doi ? await isDoiRegistered(article.doi) : false;
  const { first, last } = parsePages(article.pages);
  const pdfPath = article.pdf_url ? `${path}/pdf` : null;
  // Journal homepage on its own subdomain, without the OJS /index.php/<path> tail.
  const journalSite = journal?.external_url ? journal.external_url.replace(/\/index\.php\/.*$/, "") : null;
  const published = formatDate(article.publication_date);
  const year = article.publication_date.slice(0, 4);
  const keywords = (article.keywords ?? []).map((k) => (k ?? "").trim()).filter(Boolean);
  const summary = leadSentences(abstract);

  const where = [
    article.journal_name,
    article.volume ? `Volume ${article.volume}` : null,
    article.issue ? `Issue ${article.issue}` : null,
    article.pages ? `pages ${article.pages}` : null,
  ].filter(Boolean).join(", ");
  const apaAuthors = authors.length > 1 ? `${authors.slice(0, -1).join(", ")}, & ${authors[authors.length - 1]}` : authors[0] ?? "";
  const apa = `${apaAuthors} (${year}). ${article.title}. ${article.journal_name}${article.volume ? `, ${article.volume}` : ""}${article.issue ? `(${article.issue})` : ""}${article.pages ? `, ${article.pages}` : ""}. ${doiLive ? `https://doi.org/${article.doi}` : url}`;

  // Question-and-answer pairs built only from the record's own fields, so every
  // answer is verifiable. Rendered on the page and as FAQPage JSON-LD.
  const faqs: { q: string; a: string }[] = [
    { q: "What is this article about?", a: summary },
    { q: "Who wrote this article?", a: authors.length ? authors.join(", ") + "." : "See the author list above." },
    { q: "Where and when was it published?", a: `In ${where}, published by ${SITE.name} on ${published}.` },
    {
      q: "Is this article free to read?",
      a: "Yes. It is open access under a Creative Commons Attribution 4.0 (CC BY 4.0) licence, so anyone can read, share and reuse it with attribution.",
    },
    ...(article.doi
      ? [{
          q: "What is the DOI of this article?",
          a: doiLive
            ? `${article.doi} (https://doi.org/${article.doi}).`
            : `${article.doi}. Registration with Crossref is in progress.`,
        }]
      : []),
    { q: "How do I cite this article?", a: `APA: ${apa}` },
  ];

  const scholarlyArticleLd = {
    "@context": "https://schema.org",
    "@type": "ScholarlyArticle",
    "@id": `${url}#article`,
    headline: article.title.slice(0, 110),
    name: article.title,
    author: authors.map((name) => ({ "@type": "Person", name })),
    datePublished: article.publication_date,
    abstract,
    description: clampDescription(abstract, 300),
    inLanguage: "en",
    license: "https://creativecommons.org/licenses/by/4.0/",
    isAccessibleForFree: true,
    genre: "Research article",
    copyrightYear: Number(year),
    // Authors keep copyright; the article is licensed CC BY 4.0.
    copyrightHolder: authors.map((name) => ({ "@type": "Person", name })),
    image: `${url}/opengraph-image`,
    // The answer-first summary and abstract are the parts to read aloud / quote.
    speakable: { "@type": "SpeakableSpecification", cssSelector: ["#article-summary", "#article-abstract"] },
    url,
    mainEntityOfPage: url,
    publisher: { "@type": "Organization", "@id": `${SITE.origin}/#organization`, name: SITE.name },
    ...(article.doi
      ? {
          identifier: { "@type": "PropertyValue", propertyID: "DOI", value: article.doi },
          ...(doiLive ? { sameAs: `https://doi.org/${article.doi}` } : {}),
        }
      : {}),
    ...(keywords.length ? { keywords: keywords.join(", ") } : {}),
    ...(first ? { pageStart: first } : {}),
    ...(last ? { pageEnd: last } : {}),
    ...(pdfPath
      ? { encoding: { "@type": "MediaObject", encodingFormat: "application/pdf", contentUrl: `${SITE.origin}${pdfPath}` } }
      : {}),
    isPartOf: {
      "@type": "PublicationIssue",
      ...(article.issue ? { issueNumber: article.issue } : {}),
      datePublished: article.publication_date,
      isPartOf: {
        "@type": "PublicationVolume",
        ...(article.volume ? { volumeNumber: article.volume } : {}),
        isPartOf: {
          "@type": "Periodical",
          name: article.journal_name,
          alternateName: article.journal_abbrev,
          ...(issns.length ? { issn: issns } : {}),
          url: `${SITE.origin}/journals/${article.journal_abbrev.toLowerCase()}`,
          publisher: { "@type": "Organization", "@id": `${SITE.origin}/#organization` },
        },
      },
    },
  };

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };

  const breadcrumbLd = buildBreadcrumbLd([
    { name: "Home", path: "" },
    { name: "Articles", path: "/articles" },
    { name: article.journal_abbrev, path: `/journals/${article.journal_abbrev.toLowerCase()}` },
    { name: article.title, path },
  ]);

  const glance: [string, React.ReactNode][] = [
    ["Journal", <Link key="j" href={`/journals/${article.journal_abbrev.toLowerCase()}`} className="text-primary hover:underline">{article.journal_name} ({article.journal_abbrev})</Link>],
    ["Published", published],
    ...(article.volume || article.issue || article.pages
      ? [[
          "Volume / issue / pages",
          <>
            {/* Links the article to its issue's table of contents. */}
            {article.volume && article.issue ? (
              <Link href={issuePath(article.journal_abbrev, issueKey(article).volume, issueKey(article).issue)} className="text-primary hover:underline">
                Vol. {article.volume}, Issue {article.issue}
              </Link>
            ) : (
              [article.volume && `Vol. ${article.volume}`, article.issue && `Issue ${article.issue}`].filter(Boolean).join(", ")
            )}
            {article.pages ? `, pp. ${article.pages}` : ""}
          </>,
        ] as [string, React.ReactNode]]
      : []),
    ...(issns.length
      ? [["ISSN", [journal?.electronic_issn && `${journal.electronic_issn} (online)`, journal?.print_issn && `${journal.print_issn} (print)`].filter(Boolean).join(" · ")] as [string, React.ReactNode]]
      : []),
    ["Licence", "CC BY 4.0 — free to read and reuse with attribution"],
    ["Peer review", "Double-blind, at least two independent reviewers"],
    ["Publisher", SITE.name],
  ];

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        <JsonLd data={scholarlyArticleLd} />
        <JsonLd data={faqLd} />
        <JsonLd data={breadcrumbLd} />
        <article className="container py-12 prose-academic">
          <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">
            {article.journal_name} ({article.journal_abbrev}) · Research article · Open access
          </p>
          <h1 className="font-heading text-2xl md:text-3xl font-semibold text-foreground">{article.title}</h1>
          <p className="text-sm text-foreground mt-3">{authors.join(", ")}</p>
          <p className="text-sm text-muted-foreground">
            {published}
            {article.volume ? ` · Vol. ${article.volume}` : ""}
            {article.issue ? `, Issue ${article.issue}` : ""}
            {article.pages ? `, pp. ${article.pages}` : ""}
          </p>
          {article.doi && (
            <p className="text-sm mt-1">
              DOI:{" "}
              {doiLive ? (
                <a className="text-primary hover:underline" href={`https://doi.org/${article.doi}`}>{article.doi}</a>
              ) : (
                <>
                  {article.doi}{" "}
                  <span className="text-xs text-muted-foreground">(registration with Crossref in progress)</span>
                </>
              )}
            </p>
          )}

          {pdfPath && (
            <p className="mt-5 flex flex-wrap gap-3">
              <a
                href={pdfPath}
                className="inline-block bg-primary text-primary-foreground px-5 py-2.5 text-sm font-semibold rounded-sm hover:bg-primary-hover"
              >
                Download full text (PDF)
              </a>
              <a href="#cite" className="inline-block border border-border px-5 py-2.5 text-sm font-medium rounded-sm hover:bg-muted">
                Cite this article
              </a>
            </p>
          )}

          {/* Answer-first summary: the lead of the abstract, quoted verbatim. */}
          <section id="article-summary" aria-labelledby="summary-heading" className="mt-8 border border-border bg-secondary p-4">
            <h2 id="summary-heading" className="font-heading text-base font-semibold text-foreground mb-1">
              What is this article about?
            </h2>
            <p className="text-foreground text-sm leading-relaxed">{summary}</p>
          </section>

          <section aria-labelledby="glance-heading" className="mt-6">
            <h2 id="glance-heading" className="font-heading text-base font-semibold text-foreground mb-2">Article at a glance</h2>
            <dl className="grid sm:grid-cols-[200px_1fr] gap-x-4 gap-y-1 text-sm">
              {glance.map(([k, v]) => (
                <div key={k} className="contents">
                  <dt className="text-muted-foreground">{k}</dt>
                  <dd className="text-foreground m-0">{v}</dd>
                </div>
              ))}
            </dl>
          </section>

          <h2 className="font-heading text-lg font-semibold text-foreground mt-8 mb-2">Abstract</h2>
          <p id="article-abstract" className="text-foreground">{abstract}</p>

          {keywords.length > 0 && (
            <p className="text-sm text-muted-foreground mt-3">
              <span className="font-medium text-foreground">Keywords:</span> {keywords.join(", ")}
            </p>
          )}

          <div id="cite">
            <ArticleCite
              title={article.title}
              authors={authors}
              journalName={article.journal_name}
              year={year}
              volume={article.volume}
              issue={article.issue}
              pages={article.pages}
              doi={doiLive ? article.doi : null}
              url={url}
            />
          </div>

          {/* Where the article lives in its journal: the journal's own site
              (OJS, where the editorial record and galleys are kept) and its
              pages on this site. */}
          <section aria-labelledby="journal-site-heading" className="mt-10 border border-border bg-secondary p-4">
            <h2 id="journal-site-heading" className="font-heading text-base font-semibold text-foreground">
              Published in {article.journal_name} ({article.journal_abbrev})
            </h2>
            {issns.length > 0 && (
              <p className="text-xs text-muted-foreground mt-0.5">
                ISSN {[journal?.electronic_issn && `${journal.electronic_issn} (online)`, journal?.print_issn && `${journal.print_issn} (print)`].filter(Boolean).join(" · ")}
              </p>
            )}
            <ul className="mt-3 grid sm:grid-cols-2 gap-2 text-sm">
              {article.article_url && (
                <li>
                  <a href={article.article_url} target="_blank" rel="noopener" className="text-primary hover:underline">
                    This article on the {article.journal_abbrev} website &rarr;
                  </a>
                </li>
              )}
              {journalSite && (
                <li>
                  <a href={journalSite} target="_blank" rel="noopener" className="text-primary hover:underline">
                    {article.journal_abbrev} journal homepage &rarr;
                  </a>
                </li>
              )}
              {article.volume && article.issue && (
                <li>
                  <Link href={issuePath(article.journal_abbrev, issueKey(article).volume, issueKey(article).issue)} className="text-primary hover:underline">
                    Contents of Vol. {article.volume}, Issue {article.issue}
                  </Link>
                </li>
              )}
              <li>
                <Link href={`/journals/${article.journal_abbrev.toLowerCase()}/archive`} className="text-primary hover:underline">
                  All {article.journal_abbrev} issues
                </Link>
              </li>
              <li>
                <Link href={`/journals/${article.journal_abbrev.toLowerCase()}`} className="text-primary hover:underline">
                  Aims, scope and editorial details
                </Link>
              </li>
              <li>
                <Link href="/submit" className="text-primary hover:underline">Submit a manuscript to {article.journal_abbrev}</Link>
              </li>
            </ul>
          </section>

          <section aria-labelledby="faq-heading" className="mt-10">
            <h2 id="faq-heading" className="font-heading text-lg font-semibold text-foreground mb-3">
              Questions about this article
            </h2>
            <div className="space-y-4">
              {faqs.slice(1).map((f) => (
                <div key={f.q}>
                  <h3 className="font-heading text-sm font-semibold text-foreground">{f.q}</h3>
                  <p className="text-sm text-foreground mt-0.5 break-words">{f.a}</p>
                </div>
              ))}
            </div>
          </section>

          {related.length > 0 && (
            <section className="mt-10" aria-labelledby="related-heading">
              <h2 id="related-heading" className="font-heading text-lg font-semibold text-foreground mb-3">
                More research from {article.journal_abbrev}
              </h2>
              <ul className="space-y-3">
                {related.map((r) => (
                  <li key={r.id} className="border-b border-border pb-3 last:border-0">
                    <Link href={articlePath(r)} className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                      {r.title}
                    </Link>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {r.authors}
                      {r.publication_date ? ` · ${new Date(r.publication_date).toLocaleDateString("en-GB", { month: "short", year: "numeric" })}` : ""}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <p className="mt-10 flex flex-wrap gap-x-6 gap-y-2 text-sm">
            <Link href="/articles" className="text-primary hover:underline">&larr; All articles</Link>
            <Link href={`/journals/${article.journal_abbrev.toLowerCase()}`} className="text-primary hover:underline">
              About {article.journal_abbrev} and how to submit
            </Link>
          </p>
        </article>
      </main>
      <Footer />
    </>
  );
}
