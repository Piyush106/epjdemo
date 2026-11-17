import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Download } from "lucide-react";
import { getJournals, getJournalByAbbrev, getJournalArticles } from "@/lib/data";
import { buildMetadata, SITE } from "@/lib/seo";
import { templateFor, templateDownloadName, DOCX_MIME } from "@/lib/templates";
import JsonLd from "@/components/JsonLd";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ArchiveArticleList } from "@/components/ArchiveList";
import PageHero from "@/components/brand/PageHero";
import { issueKey, issuePath } from "@/lib/issues";

export const revalidate = 3600;

const journalHomepage = (u: string) => u.replace(/\/index\.php\/.*$/, "");

export async function generateStaticParams() {
  try {
    return (await getJournals()).map((j) => ({ abbrev: j.abbrev.toLowerCase() }));
  } catch {
    return [];
  }
}

export async function generateMetadata(
  { params }: { params: Promise<{ abbrev: string }> },
): Promise<Metadata> {
  const { abbrev } = await params;
  const journal = await getJournalByAbbrev(abbrev.toUpperCase());
  if (!journal) return buildMetadata({ title: "Journal not found", description: "", noindex: true });
  return buildMetadata({
    title: `${journal.title} (${journal.abbrev})`,
    description: journal.scope_short || journal.aims_and_scope?.slice(0, 200) || "",
    path: `/journals/${journal.abbrev.toLowerCase()}`,
  });
}

export default async function JournalPage({ params }: { params: Promise<{ abbrev: string }> }) {
  const { abbrev } = await params;
  const journal = await getJournalByAbbrev(abbrev.toUpperCase());
  if (!journal) notFound();

  const articles = await getJournalArticles(journal.abbrev, 10);
  const site = journalHomepage(journal.external_url);
  const issn = journal.electronic_issn ?? journal.print_issn ?? undefined;
  const tpl = templateFor(journal.abbrev);
  const latest = articles.find((a) => a.volume && a.issue);
  const current = latest ? issueKey(latest) : null;
  const ojsBase = journal.external_url.replace(/\/+$/, "");

  const templateLd = tpl
    ? {
        "@context": "https://schema.org",
        "@type": "DigitalDocument",
        name: `${journal.title} (${journal.abbrev}) Manuscript Template`,
        encodingFormat: DOCX_MIME,
        contentUrl: `${SITE.origin}${tpl.href}`,
        inLanguage: "en",
        publisher: { "@type": "Organization", "@id": `${SITE.origin}/#organization` },
        isPartOf: { "@type": "Periodical", name: journal.title, alternateName: journal.abbrev, ...(issn ? { issn } : {}) },
      }
    : null;

  const periodicalLd = {
    "@context": "https://schema.org",
    "@type": "Periodical",
    name: journal.title,
    alternateName: journal.abbrev,
    ...(issn ? { issn } : {}),
    ...(journal.aims_and_scope ? { description: journal.aims_and_scope } : {}),
    url: `${SITE.origin}/journals/${journal.abbrev.toLowerCase()}`,
    inLanguage: "en",
    publisher: { "@type": "Organization", "@id": `${SITE.origin}/#organization`, name: SITE.name },
  };
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE.origin },
      { "@type": "ListItem", position: 2, name: "Journals", item: `${SITE.origin}/journals` },
      { "@type": "ListItem", position: 3, name: journal.abbrev, item: `${SITE.origin}/journals/${journal.abbrev.toLowerCase()}` },
    ],
  };

  const Meta = ({ label, value }: { label: string; value?: string | null }) =>
    value ? (
      <div>
        <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</dt>
        <dd className="text-sm text-foreground">{value}</dd>
      </div>
    ) : null;

  return (
    <div className="min-h-screen bg-background">
      <JsonLd data={periodicalLd} />
      <JsonLd data={breadcrumbLd} />
      {templateLd ? <JsonLd data={templateLd} /> : null}
      <Header />

      <PageHero illustration="journals">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-ep-orange">
            <Link href="/journals" className="hover:underline">Journals</Link> · {journal.abbrev}
          </p>
          <h1 className="text-2xl font-heading font-semibold text-foreground">{journal.title}</h1>
          {journal.subtitle && <p className="text-sm text-muted-foreground mt-1">{journal.subtitle}</p>}
          <p className="mt-2 text-sm text-muted-foreground">
            {[journal.electronic_issn && `e-ISSN ${journal.electronic_issn}`, journal.print_issn && `p-ISSN ${journal.print_issn}`, journal.frequency, "Open access · CC BY 4.0"].filter(Boolean).join(" · ")}
          </p>
          <div className="flex flex-wrap gap-3 mt-4">
            <a href={site} target="_blank" rel="noopener noreferrer" className="inline-flex items-center bg-primary text-primary-foreground px-4 py-2 text-sm font-medium rounded-sm hover:bg-primary-hover">
              Visit journal site &rarr;
            </a>
            <Link href="/submit" className="inline-flex items-center border border-border bg-card px-4 py-2 text-sm font-medium rounded-sm hover:bg-muted">
              Submit to this journal
            </Link>
            <Link href={`/journals/${journal.abbrev.toLowerCase()}/archive`} className="inline-flex items-center border border-border bg-card px-4 py-2 text-sm font-medium rounded-sm hover:bg-muted">
              Archive: all issues
            </Link>
            {tpl ? (
              <a
                href={tpl.href}
                download={templateDownloadName(journal.abbrev)}
                className="inline-flex items-center gap-2 border border-border bg-card px-4 py-2 text-sm font-medium rounded-sm hover:bg-muted"
                aria-label={`Download ${journal.title} manuscript template, Word document, ${tpl.size}`}
              >
                <Download className="h-4 w-4" aria-hidden="true" />
                Manuscript template
                <span className="text-xs text-muted-foreground">(.docx · {tpl.size})</span>
              </a>
            ) : null}
          </div>
        </PageHero>

      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-[1fr_300px] gap-10">
          <div className="min-w-0">
            {journal.aims_and_scope && (
              <section className="mb-8">
                <h2 className="font-heading text-xl font-semibold text-ep-brown mb-3 border-b border-border pb-2">Aims &amp; Scope</h2>
                <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">{journal.aims_and_scope}</p>
              </section>
            )}

            {journal.subject_areas?.length > 0 && (
              <section className="mb-8">
                <h2 className="font-heading text-xl font-semibold text-ep-brown mb-3 border-b border-border pb-2">Subject areas</h2>
                <div className="flex flex-wrap gap-1.5">
                  {journal.subject_areas.map((s) => (
                    <span key={s} className="inline-flex items-center rounded-sm border border-border bg-ep-cream px-2.5 py-1 text-xs text-foreground">{s}</span>
                  ))}
                </div>
              </section>
            )}

            {current && (
              <section className="mb-8 flex flex-col gap-3 rounded-lg border border-border bg-ep-cream p-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ep-orange">Current issue</p>
                  <p className="mt-1 font-heading text-lg font-semibold text-ep-brown">Volume {current.volume}, Issue {current.issue}</p>
                </div>
                <div className="flex flex-wrap gap-2 text-sm">
                  <Link href={issuePath(journal.abbrev, current.volume, current.issue)} className="rounded-sm bg-primary px-4 py-2 font-medium text-primary-foreground hover:bg-primary-hover">Read the current issue</Link>
                  <Link href={`/journals/${journal.abbrev.toLowerCase()}/archive`} className="rounded-sm border border-border bg-card px-4 py-2 font-medium hover:border-primary">Archives</Link>
                </div>
              </section>
            )}

            <section>
              <h2 className="font-heading text-xl font-semibold text-ep-brown mb-3 border-b border-border pb-2">Latest published research</h2>
              {articles.length === 0 ? (
                <p className="text-sm text-muted-foreground">No published articles yet.</p>
              ) : (
                <ArchiveArticleList articles={articles} showJournal={false} />
              )}
              <p className="mt-4">
                <Link href={`/journals/${journal.abbrev.toLowerCase()}/archive`} className="text-primary hover:underline text-sm">
                  Browse every {journal.abbrev} issue and article &rarr;
                </Link>
              </p>
            </section>
          </div>

          <aside className="space-y-4">
            <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
              <h2 className="font-heading font-semibold text-ep-brown text-base mb-3 border-b border-border pb-2">Journal information</h2>
              <dl className="space-y-2">
                <Meta label="Print ISSN" value={journal.print_issn} />
                <Meta label="Electronic ISSN" value={journal.electronic_issn} />
                <Meta label="DOI prefix" value={journal.doi_prefix} />
                <Meta label="Frequency" value={journal.frequency} />
                <Meta label="Established" value={journal.established} />
                <Meta label="Access model" value={journal.access_model} />
                <Meta label="Licence" value={journal.license} />
                <Meta label="Contact" value={journal.contact_email} />
              </dl>
            </div>

            <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
              <h2 className="font-heading font-semibold text-ep-brown text-base mb-3 border-b border-border pb-2">Submission information</h2>
              <ul className="space-y-1.5 text-sm text-foreground">
                <li>Double-blind peer review by at least two reviewers</li>
                <li>Editorial decision typically within 1–2 weeks</li>
                <li>APC USD 30, payable only after acceptance; no submission fee</li>
                <li>Published under CC BY 4.0; authors keep copyright</li>
              </ul>
              <div className="mt-4 flex flex-col gap-2 text-sm">
                <Link href="/submit" className="rounded-sm bg-primary px-4 py-2 text-center font-medium text-primary-foreground hover:bg-primary-hover">Submit a manuscript</Link>
                <Link href="/authors" className="text-primary hover:underline">Author guidelines</Link>
                <Link href="/publication-process" className="text-primary hover:underline">Peer review and publication process</Link>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
              <h2 className="font-heading font-semibold text-ep-brown text-base mb-3 border-b border-border pb-2">Editorial board</h2>
              <p className="text-sm text-muted-foreground">
                {journal.abbrev} is overseen by the EP Journals Group Editorial Advisory Board and its own editorial team.
              </p>
              <div className="mt-3 flex flex-col gap-1.5 text-sm">
                <Link href="/editorial" className="text-primary hover:underline">Editorial Advisory Board</Link>
                <a href={`${ojsBase}/about/editorialTeam`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{journal.abbrev} editorial team (journal site)</a>
                <Link href="/join-editorial-board" className="text-primary hover:underline">Join the board</Link>
              </div>
            </div>
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
}
