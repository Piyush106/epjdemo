"use client";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import InstitutionalSidebar from "@/components/InstitutionalSidebar";
import { Download, ExternalLink } from "lucide-react";
import { useJournals } from "@/hooks/useJournals";
import { templateFor, templateDownloadName } from "@/lib/templates";
import { articlePath } from "@/lib/articleUrl";
import { issueKey } from "@/lib/issues";
import type { Article, Journal } from "@/lib/types";
import PageHero from "@/components/brand/PageHero";
import { JOURNAL_ART } from "@/components/brand/Illustrations";

// Journals page: the six journals as one portfolio (3 × 2 cards on desktop),
// each card led by its newest article, fetched server-side from the articles
// table. Full journal details (ISSNs, aims and scope, subject areas, templates,
// contacts) follow in a secondary section, collapsed per journal.

/** Short discipline label for each journal (journal metadata, not article data). */
const DISCIPLINE: Record<string, string> = {
  GJETR: "Engineering & Technology",
  JEFRR: "Economics & Finance",
  JMRR: "Management",
  JNSRR: "Natural Sciences",
  JSSHRS: "Social Sciences & Humanities",
  GJEFM: "Education, Finance & Management",
};

/** Subtle per-journal accent, keyed by journals.color_token. Static class names so Tailwind keeps them. */
const ACCENT: Record<string, { bar: string; text: string }> = {
  blue: { bar: "bg-blue-800", text: "text-blue-800 dark:text-blue-300" },
  emerald: { bar: "bg-emerald-800", text: "text-emerald-800 dark:text-emerald-300" },
  amber: { bar: "bg-amber-700", text: "text-amber-800 dark:text-amber-300" },
  purple: { bar: "bg-purple-800", text: "text-purple-800 dark:text-purple-300" },
  rose: { bar: "bg-rose-800", text: "text-rose-800 dark:text-rose-300" },
  cyan: { bar: "bg-cyan-800", text: "text-cyan-800 dark:text-cyan-300" },
};
const DEFAULT_ACCENT = { bar: "bg-primary", text: "text-primary" };

const journalSite = (externalUrl: string) => externalUrl.replace(/\/index\.php\/.*$/, "");

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

/** First author, plus "et al." when there are more. */
function leadAuthor(authors: string) {
  const list = (authors ?? "").split(",").map((a) => a.trim()).filter(Boolean);
  if (!list.length) return "";
  return list.length > 1 ? `${list[0]} et al.` : list[0];
}

function JournalPortfolioCard({ journal, latest }: { journal: Journal; latest: Article | null }) {
  const accent = ACCENT[journal.color_token ?? ""] ?? DEFAULT_ACCENT;
  const base = `/journals/${journal.abbrev.toLowerCase()}`;
  const { volume, issue } = latest ? issueKey(latest) : { volume: "", issue: "" };

  return (
    <article className="flex h-full min-w-0 flex-col overflow-hidden rounded-lg border border-border bg-card shadow-sm transition-shadow hover:shadow-md">
      <div className={`h-1 ${accent.bar}`} aria-hidden="true" />

      <header className="flex items-center gap-3 border-b border-border px-4 pt-3 pb-3">
        {(() => { const Art = JOURNAL_ART[journal.abbrev as keyof typeof JOURNAL_ART]; return Art ? <span className="w-[72px] shrink-0" aria-hidden><Art className="h-auto w-full" /></span> : null; })()}
        <div className="min-w-0">
        <p className={`text-[11px] font-semibold uppercase tracking-wider ${accent.text}`}>
          {journal.abbrev}
          <span className="text-muted-foreground font-medium normal-case tracking-normal"> · {DISCIPLINE[journal.abbrev] ?? journal.scope_short}</span>
        </p>
        <h2 className="mt-0.5 font-heading text-[15px] font-semibold leading-snug text-foreground">
          <Link to={base} className="hover:text-primary">{journal.title}</Link>
        </h2>
        <p className="mt-0.5 text-[11px] text-muted-foreground">
          {[journal.electronic_issn && `e-ISSN ${journal.electronic_issn}`, journal.frequency].filter(Boolean).join(" · ")}
        </p>
        </div>
      </header>

      <div className="flex flex-1 flex-col px-4 py-3">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Latest article</p>
        {latest ? (
          <>
            <h3 className="mt-1 text-sm font-medium leading-snug text-foreground line-clamp-2">
              <Link to={articlePath(latest)} className="hover:text-primary">{latest.title}</Link>
            </h3>
            <dl className="mt-1 space-y-0.5 text-xs text-muted-foreground">
              <div><dt className="sr-only">Author</dt><dd className="truncate">{leadAuthor(latest.authors)}</dd></div>
              <div>
                <dt className="sr-only">Published</dt>
                <dd>
                  {fmtDate(latest.publication_date)}
                  {volume && issue ? ` · Vol. ${volume}, Issue ${issue}` : ""}
                </dd>
              </div>
            </dl>
            <div className="mt-auto pt-2">
              <Link to={articlePath(latest)} className="text-xs font-semibold text-primary hover:underline">
                Read the article &rarr;
              </Link>
            </div>
          </>
        ) : (
          <p className="mt-1.5 text-sm text-muted-foreground">No articles published yet.</p>
        )}
      </div>

      <footer className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-border bg-ep-cream px-4 py-2.5 text-xs">
        <a
          href={journalSite(journal.external_url)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-primary hover:underline"
        >
          Explore the journal website <ExternalLink className="h-3 w-3" aria-hidden="true" />
        </a>
        <Link to={`${base}/archive`} className="text-muted-foreground hover:underline">All issues</Link>
      </footer>
    </article>
  );
}

function JournalDetails({ journal }: { journal: Journal }) {
  const template = templateFor(journal.abbrev);
  const site = journalSite(journal.external_url);
  return (
    <details id={journal.abbrev.toLowerCase()} className="group border border-border bg-card">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3">
        <span className="min-w-0">
          <span className="block font-heading text-sm font-semibold text-foreground">{journal.title}</span>
          <span className="block text-xs text-muted-foreground">
            {journal.abbrev}
            {journal.electronic_issn ? ` · e-ISSN ${journal.electronic_issn}` : ""}
            {journal.print_issn ? ` · p-ISSN ${journal.print_issn}` : ""}
          </span>
        </span>
        <span className="shrink-0 text-xs text-primary group-open:hidden">Show details</span>
        <span className="hidden shrink-0 text-xs text-primary group-open:inline">Hide details</span>
      </summary>

      <div className="border-t border-border px-4 py-4 text-sm">
        <dl className="grid gap-x-6 gap-y-1 text-xs text-muted-foreground sm:grid-cols-2">
          <div><dt className="inline font-semibold">Abbreviation: </dt><dd className="inline">{journal.abbrev}</dd></div>
          {journal.electronic_issn && <div><dt className="inline font-semibold">Electronic ISSN: </dt><dd className="inline">{journal.electronic_issn}</dd></div>}
          {journal.print_issn && <div><dt className="inline font-semibold">Print ISSN: </dt><dd className="inline">{journal.print_issn}</dd></div>}
          <div><dt className="inline font-semibold">Publication frequency: </dt><dd className="inline">{journal.frequency}</dd></div>
          {journal.established && <div><dt className="inline font-semibold">Established: </dt><dd className="inline">{journal.established}</dd></div>}
          {journal.doi_prefix && <div><dt className="inline font-semibold">DOI prefix: </dt><dd className="inline">{journal.doi_prefix}</dd></div>}
        </dl>

        {journal.aims_and_scope && (
          <div className="prose-academic mt-4 text-foreground">
            <h3 className="mb-1.5 font-heading text-sm font-medium">Aims and Scope</h3>
            {journal.aims_and_scope.split("\n\n").map((p, i) => (
              <p key={i} className="mb-2 leading-relaxed">{p}</p>
            ))}
          </div>
        )}

        {journal.subject_areas?.length > 0 && (
          <div className="mt-3">
            <h3 className="mb-1.5 font-heading text-sm font-medium text-foreground">Subject Areas</h3>
            <ul className="grid gap-x-4 gap-y-0.5 text-xs text-muted-foreground sm:grid-cols-2">
              {journal.subject_areas.map((t, i) => (
                <li key={i} className="flex items-start"><span className="mr-1.5 text-ep-orange">•</span>{t}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-4 space-y-1 text-xs text-muted-foreground">
          {template && (
            <p>
              <a href={template.href} download={templateDownloadName(journal.abbrev)} className="inline-flex items-center gap-1 text-primary hover:underline">
                <Download className="h-3 w-3" aria-hidden="true" />
                Download manuscript template (.docx · {template.size})
              </a>
            </p>
          )}
          <p>
            <strong>Journal website:</strong>{" "}
            <a href={site} target="_blank" rel="noopener noreferrer" className="text-ep-orange hover:underline">{site}</a>
          </p>
          <p>
            <strong>Journal page &amp; recent articles:</strong>{" "}
            <Link to={`/journals/${journal.abbrev.toLowerCase()}`} className="text-ep-orange hover:underline">
              www.ep-journals.org/journals/{journal.abbrev.toLowerCase()}
            </Link>
          </p>
          <p>
            <strong>Submit a manuscript:</strong>{" "}
            <Link to="/submit" className="text-ep-orange hover:underline">Submission form</Link>
            {" "}or email{" "}
            <a href={`mailto:${journal.contact_email}`} className="text-ep-orange hover:underline">{journal.contact_email}</a>
          </p>
        </div>
      </div>
    </details>
  );
}

const Journals = ({
  initialJournals = [],
  latestByJournal = {},
}: {
  initialJournals?: Journal[];
  latestByJournal?: Record<string, Article | null>;
}) => {
  // Server-seeded so the journal list and latest articles are in the initial HTML (SEO).
  const { data, isLoading } = useJournals();
  const journals = data && data.length ? data : initialJournals;
  const loading = isLoading && journals.length === 0;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <PageHero
        illustration="journals"
        facts={[
          { label: "Journals", value: String(journals.length || 6) },
          { label: "Peer review", value: "Double-blind" },
          { label: "Frequency", value: "Monthly" },
          { label: "Licence", value: "CC BY 4.0" },
          { label: "DOIs", value: "Crossref" },
        ]}
      >
          <h1 className="mb-1 font-heading text-xl font-semibold text-foreground">Six peer-reviewed open access journals</h1>
          <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
            EP Journals Group publishes six journals, each in its own discipline. All use double-blind peer review,
            assign Crossref DOIs, publish monthly and are open access under CC BY 4.0.
          </p>
        </PageHero>

      <main className="bg-background py-6">
        <div className="container mx-auto px-4">
          <section aria-labelledby="portfolio-heading">
            <h2 id="portfolio-heading" className="sr-only">Our journals and their latest research</h2>
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading journals…</p>
            ) : journals.length === 0 ? (
              <p className="text-sm text-muted-foreground">No journals are currently active.</p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {journals.map((j) => (
                  <JournalPortfolioCard key={j.abbrev} journal={j} latest={latestByJournal[j.abbrev] ?? null} />
                ))}
              </div>
            )}
          </section>

          <div className="mt-12 grid gap-8 lg:grid-cols-[1fr_340px]">
            <div className="min-w-0">
              <section aria-labelledby="details-heading">
                <h2 id="details-heading" className="mb-1 font-heading text-base font-semibold text-foreground">Journal details</h2>
                <p className="mb-4 text-xs text-muted-foreground">
                  ISSNs, aims and scope, subject areas, manuscript templates and contacts for each journal.
                </p>
                <div className="space-y-3">
                  {journals.map((j) => <JournalDetails key={j.abbrev} journal={j} />)}
                </div>
              </section>

              <section className="mt-8 border-t border-border pt-5">
                <h2 className="mb-2 font-heading text-base font-semibold text-foreground">Manuscript Submission</h2>
                <div className="prose-academic text-sm text-foreground">
                  <p>
                    Authors wishing to submit manuscripts for consideration are encouraged to review the specific author guidelines for their target journal. General enquiries regarding manuscript submission and the editorial process may be directed to the central editorial office. All journals operate on a monthly publication schedule, ensuring timely dissemination of accepted research.
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Editorial Contact: <a href="mailto:editor@ep-journals.org" className="text-ep-orange hover:underline">editor@ep-journals.org</a>
                  </p>
                </div>
              </section>
            </div>

            <InstitutionalSidebar variant="journal" />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Journals;
