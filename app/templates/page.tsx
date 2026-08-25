import type { Metadata } from "next";
import Link from "next/link";
import { Download } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import JsonLd from "@/components/JsonLd";
import { buildMetadata, buildBreadcrumbLd, SITE } from "@/lib/seo";
import { getJournals } from "@/lib/data";
import { JOURNAL_TEMPLATES, templateDownloadName, DOCX_MIME } from "@/lib/templates";

export const revalidate = 3600;

export const metadata: Metadata = buildMetadata({
  title: "Manuscript Templates",
  description:
    "Download the official Microsoft Word manuscript template for each EP Journals Group journal. Formatting your paper to the template speeds up screening and peer review across our six open access journals.",
  path: "/templates",
});

export default async function Page() {
  let journals: Awaited<ReturnType<typeof getJournals>> = [];
  try { journals = await getJournals(); } catch { journals = []; }

  // Keep display in journal order; fall back to the template map's order.
  const rows = journals
    .map((j) => ({ journal: j, tpl: JOURNAL_TEMPLATES[j.abbrev.toUpperCase()] }))
    .filter((r) => r.tpl);

  const collectionLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Manuscript Templates — EP Journals Group",
    description: "Official Word manuscript templates for each EP Journals Group journal.",
    url: `${SITE.origin}/templates`,
    inLanguage: "en",
    isPartOf: { "@type": "WebSite", "@id": `${SITE.origin}/#website` },
    publisher: { "@type": "Organization", "@id": `${SITE.origin}/#organization` },
    hasPart: rows.map((r) => ({
      "@type": "DigitalDocument",
      name: `${r.journal.title} (${r.journal.abbrev}) Manuscript Template`,
      encodingFormat: DOCX_MIME,
      contentUrl: `${SITE.origin}${r.tpl!.href}`,
      inLanguage: "en",
      publisher: { "@type": "Organization", "@id": `${SITE.origin}/#organization` },
      isPartOf: {
        "@type": "Periodical",
        name: r.journal.title,
        alternateName: r.journal.abbrev,
        ...(r.journal.electronic_issn ? { issn: r.journal.electronic_issn } : {}),
      },
    })),
  };
  const breadcrumbLd = buildBreadcrumbLd([
    { name: "Home", path: "" },
    { name: "Manuscript Templates", path: "/templates" },
  ]);

  return (
    <div className="min-h-screen bg-background">
      <JsonLd data={collectionLd} />
      <JsonLd data={breadcrumbLd} />
      <Header />

      <section className="py-6 bg-ep-cream border-b border-border">
        <div className="container mx-auto px-4">
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1">
            <Link href="/authors" className="hover:underline">For Authors</Link> · Downloads
          </p>
          <h1 className="text-xl font-heading font-semibold text-foreground mb-1">Manuscript Templates</h1>
          <p className="text-muted-foreground text-sm leading-relaxed max-w-3xl">
            Each EP Journals Group journal provides a Microsoft Word manuscript template setting out the required
            structure, headings, and reference style. Preparing your paper in the correct template helps it pass
            initial screening quickly and keeps double-blind peer review focused on the research.
          </p>
        </div>
      </section>

      <main className="container mx-auto px-4 py-8">
        <div className="grid sm:grid-cols-2 gap-4">
          {rows.map(({ journal, tpl }) => (
            <div key={journal.abbrev} className="border border-border bg-card p-4 flex flex-col">
              <h2 className="text-sm font-heading font-semibold text-foreground leading-snug">
                {journal.title} <span className="text-muted-foreground font-mono">({journal.abbrev})</span>
              </h2>
              {journal.scope_short ? (
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{journal.scope_short}</p>
              ) : null}
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <a
                  href={tpl!.href}
                  download={templateDownloadName(journal.abbrev)}
                  className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 text-sm font-medium rounded-sm hover:bg-primary-hover"
                  aria-label={`Download ${journal.title} manuscript template, Word document, ${tpl!.size}`}
                >
                  <Download className="h-4 w-4" aria-hidden="true" />
                  Download template
                </a>
                <span className="text-xs text-muted-foreground">.docx · {tpl!.size}</span>
                <Link href={`/journals/${journal.abbrev.toLowerCase()}`} className="text-primary hover:underline text-xs">
                  Journal scope &amp; ISSNs &rarr;
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 border-t border-border pt-5 text-sm text-muted-foreground max-w-3xl">
          <p>
            After formatting your manuscript in the correct template, submit it through the{" "}
            <Link href="/submit" className="text-primary hover:underline">manuscript submission form</Link>. For
            preparation guidance, see the <Link href="/authors" className="text-primary hover:underline">author guidelines</Link>.
            Templates are provided in Microsoft Word (.docx) format and can be opened in Word, Google Docs, or
            LibreOffice.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
