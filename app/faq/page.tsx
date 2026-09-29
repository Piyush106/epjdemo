import Link from "next/link";
import type { Metadata } from "next";
import { getJournals } from "@/lib/data";
import { buildMetadata, buildBreadcrumbLd } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

// Answers the questions people actually type into Google and AI assistants about
// the publisher (taken from Search Console query data, Sep 2026): "is it Scopus
// indexed", "is it reputable", "how much is the APC", "SINTA berapa / terindeks
// apa", "where is it based". Each answer is short, factual and verifiable, so
// AI Overviews / ChatGPT / Perplexity can quote it directly.
//
// RULE: only state facts the publisher can prove. Anything not yet confirmed
// (e.g. founder, registered country) stays out until it is filled in below.

export const revalidate = 86400;

export const metadata: Metadata = buildMetadata({
  title: "FAQ — Indexing, APC, Scopus, Peer Review & Legitimacy",
  description:
    "Straight answers about EP Journals Group: which databases index the journals (and which do not), the USD 30 acceptance-only APC, peer review, DOIs, ISSNs and how to verify every claim yourself.",
  path: "/faq",
});

const DOI_PREFIX = "10.65150";

type Faq = { q: string; a: string; links?: { href: string; label: string }[] };

const FAQS: Faq[] = [
  {
    q: "Is EP Journals Group indexed in Scopus or Web of Science?",
    a: "No. EP Journals Group journals are not currently indexed in Scopus or Web of Science. They are indexed or listed in Google Scholar, Crossref, OpenAIRE, Zenodo, Index Copernicus and Scilit. We will update this answer only when an index confirms inclusion.",
    links: [{ href: "/indexing", label: "Full indexing table" }],
  },
  {
    q: "Where are EP Journals Group journals indexed?",
    a: "Google Scholar, Crossref (DOI registration), OpenAIRE, Zenodo, Index Copernicus and Scilit. Each journal's ISSNs and DOI prefix are listed below so you can check the records yourself.",
    links: [{ href: "/indexing", label: "Indexing & abstracting" }],
  },
  {
    q: "Is EP Journals Group a legitimate, reputable publisher?",
    a: `You can verify it independently rather than take our word for it: every journal has a registered ISSN (check on portal.issn.org), articles carry Crossref DOIs under the prefix ${DOI_PREFIX} (check on doi.org or search.crossref.org), manuscripts go through double-blind peer review by two reviewers, and the editorial, ethics and corrections policies are public and COPE-aligned.`,
    links: [
      { href: "/policies", label: "Editorial & ethics policies" },
      { href: "/editorial", label: "Editorial board" },
    ],
  },
  {
    q: "How much does it cost to publish (APC)?",
    a: "A single article processing charge (APC) of USD 30, payable only after your manuscript is accepted. There is no submission fee and no fee for readers — all articles are free to read.",
    links: [{ href: "/publish", label: "Publishing with us" }],
  },
  {
    q: "Is EP Journals Group indexed in SINTA or Garuda?",
    a: "No. SINTA and Garuda index journals published in Indonesia, and EP Journals Group journals are international journals that are not listed there. Indonesian authors can cite the Crossref DOI and Google Scholar record of each article.",
  },
  {
    q: "How long does peer review take?",
    a: "Initial editorial screening takes a few days. An editorial decision after double-blind review by two independent reviewers is typically sent within one to two weeks.",
    links: [{ href: "/publication-process", label: "Publication process" }],
  },
  {
    q: "Does every article get a DOI?",
    a: `Yes. Articles are assigned Crossref DOIs under the prefix ${DOI_PREFIX}. If a DOI link for an article does not resolve, contact the editorial office and it will be corrected.`,
  },
  {
    q: "Who owns the copyright?",
    a: "Authors keep full copyright. Articles are published open access under the Creative Commons Attribution 4.0 (CC BY 4.0) licence.",
    links: [{ href: "/policies/open-access", label: "Open access policy" }],
  },
  {
    q: "Which journals does EP Journals Group publish?",
    a: "Six peer-reviewed, open-access journals: GJETR (engineering and technology), JMRR (management), JEFRR (economics and finance), JNSRR (natural sciences), JSSHRS (social sciences and humanities) and GJEFM. Each journal runs on its own submission and publishing site.",
    links: [{ href: "/journals", label: "All journals" }],
  },
];

export default async function FaqPage() {
  let journals: Awaited<ReturnType<typeof getJournals>> = [];
  try { journals = await getJournals(); } catch { journals = []; }

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
  const breadcrumbLd = buildBreadcrumbLd([
    { name: "Home", path: "" },
    { name: "FAQ", path: "/faq" },
  ]);

  return (
    <div className="min-h-screen bg-background">
      <JsonLd data={faqLd} />
      <JsonLd data={breadcrumbLd} />
      <Header />

      <section className="py-10 bg-secondary border-b border-border">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-2xl sm:text-3xl font-heading font-semibold text-foreground mb-3">
            EP Journals Group — frequently asked questions
          </h1>
          <p className="text-sm text-foreground leading-relaxed max-w-3xl">
            Direct answers about indexing, fees, peer review and legitimacy — with the ISSNs and DOI prefix you
            need to check every claim yourself.
          </p>
        </div>
      </section>

      <main className="container mx-auto px-4 py-10 max-w-4xl">
        <section className="mb-10 space-y-6">
          {FAQS.map((f) => (
            <div key={f.q} className="border-b border-border pb-5 last:border-0">
              <h2 className="font-heading font-semibold text-foreground text-base mb-1.5">{f.q}</h2>
              <p className="text-sm text-foreground leading-relaxed">{f.a}</p>
              {f.links?.length ? (
                <p className="text-xs mt-2 space-x-4">
                  {f.links.map((l) => (
                    <Link key={l.href} href={l.href} className="text-primary hover:underline">
                      {l.label} &rarr;
                    </Link>
                  ))}
                </p>
              ) : null}
            </div>
          ))}
        </section>

        {journals.length > 0 && (
          <section className="mb-10">
            <h2 className="font-heading text-lg font-semibold text-foreground mb-4 border-b border-border pb-2">
              Verify a journal: ISSNs and DOI prefix
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-border">
                <thead className="bg-secondary">
                  <tr>
                    <th className="text-left p-2 font-medium">Journal</th>
                    <th className="text-left p-2 font-medium">Print ISSN</th>
                    <th className="text-left p-2 font-medium">e-ISSN</th>
                    <th className="text-left p-2 font-medium">DOI prefix</th>
                  </tr>
                </thead>
                <tbody>
                  {journals.map((j) => (
                    <tr key={j.abbrev} className="border-t border-border">
                      <td className="p-2">
                        <Link href={`/journals/${j.abbrev.toLowerCase()}`} className="text-primary hover:underline">
                          {j.title} ({j.abbrev})
                        </Link>
                      </td>
                      <td className="p-2">{j.print_issn ?? "—"}</td>
                      <td className="p-2">{j.electronic_issn ?? "—"}</td>
                      <td className="p-2">{DOI_PREFIX}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
