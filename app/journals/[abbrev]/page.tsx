import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getJournals, getJournalByAbbrev, getJournalArticles } from "@/lib/data";
import { buildMetadata, SITE } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

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
      <Header />

      <section className="py-8 bg-secondary border-b border-border">
        <div className="container mx-auto px-4">
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1">
            <Link href="/journals" className="hover:underline">Journals</Link> · {journal.abbrev}
          </p>
          <h1 className="text-2xl font-heading font-semibold text-foreground">{journal.title}</h1>
          {journal.subtitle && <p className="text-sm text-muted-foreground mt-1">{journal.subtitle}</p>}
          <div className="flex flex-wrap gap-3 mt-4">
            <a href={site} target="_blank" rel="noopener noreferrer" className="inline-flex items-center bg-primary text-primary-foreground px-4 py-2 text-sm font-medium rounded-sm hover:bg-primary-hover">
              Visit journal site &rarr;
            </a>
            <Link href="/submit" className="inline-flex items-center border border-border bg-card px-4 py-2 text-sm font-medium rounded-sm hover:bg-muted">
              Submit to this journal
            </Link>
          </div>
        </div>
      </section>

      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-[1fr_300px] gap-10">
          <div className="min-w-0">
            {journal.aims_and_scope && (
              <section className="mb-8">
                <h2 className="font-heading text-lg font-semibold text-foreground mb-2 border-b border-border pb-2">Aims &amp; Scope</h2>
                <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">{journal.aims_and_scope}</p>
              </section>
            )}

            {journal.subject_areas?.length > 0 && (
              <section className="mb-8">
                <h2 className="font-heading text-lg font-semibold text-foreground mb-2 border-b border-border pb-2">Subject areas</h2>
                <div className="flex flex-wrap gap-1.5">
                  {journal.subject_areas.map((s) => (
                    <span key={s} className="inline-flex items-center rounded-sm border border-border px-2 py-1 text-xs text-foreground">{s}</span>
                  ))}
                </div>
              </section>
            )}

            <section>
              <h2 className="font-heading text-lg font-semibold text-foreground mb-3 border-b border-border pb-2">Recent articles</h2>
              {articles.length === 0 ? (
                <p className="text-sm text-muted-foreground">No published articles yet.</p>
              ) : (
                <ul className="space-y-3">
                  {articles.map((a) => (
                    <li key={a.id} className="border-b border-border pb-3 last:border-0">
                      <Link href={`/articles/${a.id}`} className="text-sm font-medium text-foreground hover:text-primary transition-colors">{a.title}</Link>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {a.authors}{a.publication_date ? ` · ${new Date(a.publication_date).toLocaleDateString("en-GB", { month: "short", year: "numeric" })}` : ""}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
              <p className="mt-4">
                <Link href={`/articles?journal=${journal.abbrev}`} className="text-primary hover:underline text-sm">
                  Browse all {journal.abbrev} articles &rarr;
                </Link>
              </p>
            </section>
          </div>

          <aside className="space-y-4">
            <div className="border border-border bg-secondary p-4">
              <h2 className="font-heading font-semibold text-foreground text-sm mb-3 border-b border-border pb-2">Journal information</h2>
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
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
}
