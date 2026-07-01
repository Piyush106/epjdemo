"use client";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import InstitutionalSidebar from "@/components/InstitutionalSidebar";
import MetaTags from "@/components/MetaTags";
import SchemaOrg from "@/components/SchemaOrg";
import { Separator } from "@/components/ui/separator";
import { useJournals } from "@/hooks/useJournals";
import type { Journal } from "@/lib/types";

const Journals = ({ initialJournals = [] }: { initialJournals?: Journal[] }) => {
  // Server-seeded so the full journal list is in the initial HTML (SEO).
  const { data, isLoading } = useJournals();
  const journals = data && data.length ? data : initialJournals;
  const loading = isLoading && journals.length === 0;

  return (
    <div className="min-h-screen bg-background">
      <MetaTags
        title="Open Access Journals List | Peer-Reviewed Academic Journals | EP Journals Group"
        description="Six peer-reviewed open access journals in engineering, economics, finance, management, natural sciences, social sciences, and education. Monthly publication, double-blind peer review, CrossRef DOI, CC BY 4.0."
      />
      <SchemaOrg type="Periodical" />
      <Header />

      {/* Page Header */}
      <section className="py-6 bg-ep-cream border-b border-border">
        <div className="container mx-auto px-4">
          <h1 className="text-xl font-heading font-semibold text-foreground mb-1">
            Peer-Reviewed Open Access Journals
          </h1>
          <p className="text-muted-foreground text-sm leading-relaxed max-w-3xl">
            EP Journals Group publishes six peer-reviewed open access academic journals covering engineering and
            technology, economics and finance, management research, natural sciences, social sciences and humanities,
            and education and finance. Every journal applies double-blind peer review with two independent reviewers,
            assigns CrossRef DOIs to all published articles, and releases content monthly under a Creative Commons
            Attribution 4.0 (CC BY 4.0) licence.
          </p>
        </div>
      </section>

      {/* Two-Column Academic Layout */}
      <main className="py-8 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-[1fr_340px] gap-8">

            {/* Left Column - Journals List */}
            <div className="min-w-0">
              {loading ? (
                <p className="text-sm text-muted-foreground">Loading journals…</p>
              ) : journals.length === 0 ? (
                <p className="text-sm text-muted-foreground">No journals are currently active.</p>
              ) : (
                journals.map((journal, index) => (
                  <div key={journal.abbrev} className="mb-8">
                    <article>
                      <header className="mb-3">
                        <h2 className="text-base font-heading font-semibold text-foreground mb-1.5">
                          <Link
                            to={`/journals/${journal.abbrev.toLowerCase()}`}
                            className="hover:text-ep-orange transition-colors"
                          >
                            {journal.title}
                          </Link>
                        </h2>
                        <p className="text-xs mb-1.5">
                          <Link to={`/journals/${journal.abbrev.toLowerCase()}`} className="text-primary hover:underline">
                            Journal page &amp; recent articles &rarr;
                          </Link>
                        </p>
                        <div className="text-xs text-muted-foreground space-y-0.5">
                          <p><strong>Abbreviation:</strong> {journal.abbrev}</p>
                          {(journal.print_issn || journal.electronic_issn) && (
                            <p>
                              {journal.print_issn && (<><strong>Print ISSN:</strong> {journal.print_issn}</>)}
                              {journal.print_issn && journal.electronic_issn && " | "}
                              {journal.electronic_issn && (<><strong>Electronic ISSN:</strong> {journal.electronic_issn}</>)}
                            </p>
                          )}
                          <p>
                            <strong>Publication Frequency:</strong> {journal.frequency}
                            {journal.established && (<> | <strong>Established:</strong> {journal.established}</>)}
                          </p>
                        </div>
                      </header>

                      {journal.aims_and_scope && (
                        <div className="prose-academic text-foreground text-sm mb-3">
                          <h3 className="text-sm font-heading font-medium text-foreground mb-1.5">Aims and Scope</h3>
                          {journal.aims_and_scope.split("\n\n").map((paragraph, pIndex) => (
                            <p key={pIndex} className="mb-2 leading-relaxed">{paragraph}</p>
                          ))}
                        </div>
                      )}

                      {journal.subject_areas && journal.subject_areas.length > 0 && (
                        <div className="mb-3">
                          <h3 className="text-sm font-heading font-medium text-foreground mb-1.5">Subject Areas</h3>
                          <ul className="grid sm:grid-cols-2 gap-x-4 gap-y-0.5 text-xs text-muted-foreground">
                            {journal.subject_areas.map((topic, tIndex) => (
                              <li key={tIndex} className="flex items-start">
                                <span className="mr-1.5 text-ep-orange">•</span>
                                {topic}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div className="text-xs text-muted-foreground">
                        <p>
                          <strong>Journal Website:</strong>{" "}
                          <a href={journal.external_url.replace(/\/index\.php\/.*$/, "")} target="_blank" rel="noopener noreferrer" className="text-ep-orange hover:underline">
                            {journal.external_url.replace(/\/index\.php\/.*$/, "")}
                          </a>
                        </p>
                        <p>
                          <strong>Submit Manuscript:</strong>{" "}
                          {journal.submission_url ? (
                            <>
                              <a href={journal.submission_url} target="_blank" rel="noopener noreferrer" className="text-ep-orange hover:underline">
                                Online Submission System
                              </a>
                              {" "}or email to{" "}
                            </>
                          ) : null}
                          <a href={`mailto:${journal.contact_email}`} className="text-ep-orange hover:underline">
                            {journal.contact_email}
                          </a>
                        </p>
                      </div>
                    </article>

                    {index < journals.length - 1 && (
                      <Separator className="my-6" />
                    )}
                  </div>
                ))
              )}

              {/* Submission Information */}
              <div className="mt-6 pt-5 border-t border-border">
                <h2 className="text-base font-heading font-semibold text-foreground mb-2">
                  Manuscript Submission
                </h2>
                <div className="prose-academic text-foreground text-sm">
                  <p>
                    Authors wishing to submit manuscripts for consideration are encouraged to review the specific author guidelines for their target journal. General enquiries regarding manuscript submission and the editorial process may be directed to the central editorial office. All journals operate on a monthly publication schedule, ensuring timely dissemination of accepted research.
                  </p>
                  <p className="text-muted-foreground text-xs mt-2">
                    Editorial Contact: <a href="mailto:editor@ep-journals.org" className="text-ep-orange hover:underline">editor@ep-journals.org</a>
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column - Institutional Sidebar */}
            <InstitutionalSidebar variant="journal" />

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Journals;
