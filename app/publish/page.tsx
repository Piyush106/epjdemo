import Link from "next/link";
import type { Metadata } from "next";
import { getJournals, getPublishedArticleCount } from "@/lib/data";
import { buildMetadata, SITE } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SubmitCTA from "@/components/SubmitCTA";

export const revalidate = 3600;

export const metadata: Metadata = buildMetadata({
  title: "Publish Your Research — Peer-Reviewed Open Access",
  description:
    "Submit to EP Journals Group: double-blind peer review, a Crossref DOI on every article, CC BY 4.0, an editorial decision typically within 1–2 weeks, and a low APC payable only on acceptance.",
  path: "/publish",
});

const FAQS = [
  { q: "How much does it cost to publish?", a: "A single, transparent article-processing charge of USD 30, payable only if your manuscript is accepted. There are no submission fees." },
  { q: "How long does review take?", a: "Initial editorial screening is completed within a few days, and an editorial decision is typically communicated within one to two weeks, following double-blind peer review by two independent reviewers." },
  { q: "Is my article indexed and citable?", a: "Every published article receives a Crossref DOI and is discoverable via Google Scholar, Crossref, OpenAIRE, Zenodo, Index Copernicus, and Scilit." },
  { q: "Do I keep copyright?", a: "Yes. Authors retain full copyright; articles are published open access under the Creative Commons Attribution 4.0 (CC BY 4.0) licence." },
];

export default async function PublishPage() {
  let journals: Awaited<ReturnType<typeof getJournals>> = [];
  try { journals = await getJournals(); } catch { journals = []; }
  let articleCount = 0;
  try { articleCount = await getPublishedArticleCount(); } catch { articleCount = 0; }

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE.origin },
      { "@type": "ListItem", position: 2, name: "Publish", item: `${SITE.origin}/publish` },
    ],
  };

  const reasons = [
    { h: "Rigorous double-blind review", p: "Two independent reviewers assess every manuscript on scholarly merit — the same standard readers and institutions expect." },
    { h: "Indexed & discoverable", p: "Google Scholar, Crossref, OpenAIRE, Zenodo, Index Copernicus, and Scilit — your work is findable and citable." },
    { h: "Crossref DOI · CC BY 4.0", p: "A permanent DOI on every article, published open access. Authors retain full copyright." },
    { h: "Fast, transparent process", p: "Initial screening in days; an editorial decision typically within one to two weeks." },
    { h: "Low, acceptance-only APC", p: "A single article-processing charge of USD 30 — payable only if your paper is accepted. No submission fees." },
    { h: "COPE-aligned ethics", p: "Documented editorial, integrity, and corrections policies, applied consistently across all journals." },
  ];

  return (
    <div className="min-h-screen bg-background">
      <JsonLd data={faqLd} />
      <JsonLd data={breadcrumbLd} />
      <Header />

      {/* Hero */}
      <section className="py-10 bg-secondary border-b border-border">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-2xl sm:text-3xl font-heading font-semibold text-foreground mb-3">
            Publish your research — peer-reviewed, open access, indexed
          </h1>
          <p className="text-sm text-foreground leading-relaxed mb-5 max-w-3xl">
            EP Journals Group publishes across six peer-reviewed, open-access journals. Every article receives a
            Crossref DOI, is published under CC BY 4.0 with authors retaining copyright, and undergoes double-blind
            review by two independent reviewers — with an editorial decision typically within one to two weeks.
          </p>
          <div className="flex flex-wrap gap-3">
            <SubmitCTA source="publish_hero" className="inline-flex items-center bg-primary text-primary-foreground px-5 py-2.5 text-sm font-medium rounded-sm hover:bg-primary-hover transition-colors">
              Submit your manuscript &rarr;
            </SubmitCTA>
            <Link href="/journals" className="inline-flex items-center border border-border bg-card px-5 py-2.5 text-sm font-medium rounded-sm hover:bg-muted transition-colors">
              Browse the journals
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-border border border-border rounded-sm overflow-hidden mt-6 max-w-2xl">
            {[
              { n: journals.length || 6, l: "Peer-reviewed journals" },
              { n: articleCount || "—", l: "Published articles" },
              { n: "USD 30", l: "APC, on acceptance only" },
              { n: "1–2 wks", l: "Typical decision time" },
            ].map((s) => (
              <div key={s.l} className="bg-card px-3 py-3 text-center">
                <div className="text-base font-heading font-semibold text-ep-orange leading-tight">{s.n}</div>
                <div className="text-[11px] text-muted-foreground leading-tight mt-0.5">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <main className="container mx-auto px-4 py-10 max-w-4xl">
        {/* Why publish */}
        <section className="mb-10">
          <h2 className="font-heading text-lg font-semibold text-foreground mb-4 border-b border-border pb-2">Why publish with EP Journals Group</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {reasons.map((r) => (
              <div key={r.h} className="border border-border bg-card p-4 rounded-sm">
                <p className="font-heading font-semibold text-foreground text-sm mb-1">{r.h}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{r.p}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Choose your journal */}
        <section className="mb-10">
          <h2 className="font-heading text-lg font-semibold text-foreground mb-4 border-b border-border pb-2">Choose your journal</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {journals.map((j) => (
              <Link key={j.abbrev} href={`/journals/${j.abbrev.toLowerCase()}`} className="group block border border-border bg-card p-4 rounded-sm hover:border-ep-orange transition-colors">
                <span className="font-heading font-semibold text-foreground text-sm group-hover:text-ep-orange transition-colors">{j.title} ({j.abbrev})</span>
                <span className="block text-xs text-muted-foreground mt-1 leading-relaxed">{j.scope_short}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section className="mb-10">
          <h2 className="font-heading text-lg font-semibold text-foreground mb-4 border-b border-border pb-2">How it works</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              ["1", "Submit", "Upload your manuscript through the online form."],
              ["2", "Screening", "Initial editorial check within a few days."],
              ["3", "Peer review", "Double-blind review by two independent reviewers."],
              ["4", "Publish", "On acceptance, pay the APC; your article goes live with a DOI."],
            ].map(([n, h, p]) => (
              <div key={n} className="border border-border bg-card p-4 rounded-sm text-center">
                <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-semibold mx-auto mb-2">{n}</div>
                <p className="font-heading font-semibold text-foreground text-xs mb-1">{h}</p>
                <p className="text-[11px] text-muted-foreground leading-relaxed">{p}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="mb-10">
          <h2 className="font-heading text-lg font-semibold text-foreground mb-4 border-b border-border pb-2">Frequently asked questions</h2>
          <div className="space-y-4">
            {FAQS.map((f) => (
              <div key={f.q}>
                <p className="font-heading font-semibold text-foreground text-sm mb-1">{f.q}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Final CTA */}
        <section className="border border-border bg-secondary rounded-sm p-6 text-center">
          <h2 className="font-heading text-lg font-semibold text-foreground mb-2">Ready to submit?</h2>
          <p className="text-sm text-muted-foreground mb-4 max-w-2xl mx-auto">
            Send your manuscript to an EP Journals Group journal. There are no submission fees — the APC applies only if your paper is accepted.
          </p>
          <SubmitCTA source="publish_footer" className="inline-flex items-center bg-primary text-primary-foreground px-6 py-3 text-sm font-medium rounded-sm hover:bg-primary-hover transition-colors">
            Submit your manuscript &rarr;
          </SubmitCTA>
        </section>
      </main>

      <Footer />
    </div>
  );
}
