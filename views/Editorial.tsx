"use client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import InstitutionalSidebar from "@/components/InstitutionalSidebar";
import { Separator } from "@/components/ui/separator";
import { EDITORIAL_BOARD } from "@/lib/editorialBoard";

const Editorial = () => {
  const editorialBoard = EDITORIAL_BOARD;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Page Header */}
      <section className="py-6 bg-ep-cream border-b border-border">
        <div className="container mx-auto px-4">
          <h1 className="text-xl font-heading font-semibold text-foreground mb-1">
            Editorial Board
          </h1>
          <p className="text-muted-foreground text-sm">
            EP Journals Group Editorial Advisory Board — International scholars supporting rigorous peer review.
          </p>
          <a
            href="/join-editorial-board"
            className="mt-3 inline-flex items-center gap-2 border border-primary text-primary bg-card px-4 py-2 text-sm font-medium rounded-sm hover:bg-primary hover:text-primary-foreground transition-colors"
          >
            Become an Editorial Board Member →
          </a>
        </div>
      </section>

      {/* Two-Column Academic Layout */}
      <main className="py-8 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-[1fr_340px] gap-8">

            {/* Left Column - Editorial Board */}
            <div className="min-w-0">

              {/* Introduction */}
              <div className="mb-6">
                <h2 className="text-lg font-heading font-semibold text-foreground mb-3 border-b border-border pb-2">
                  Editorial Advisory Board
                </h2>
                <div className="prose-academic text-foreground text-sm">
                  <p>
                    The Editorial Advisory Board of EP Journals Group comprises distinguished scholars and researchers from institutions across the globe. Board members contribute expertise spanning engineering, natural sciences, social sciences, economics, management, and humanities. All members are accorded equal standing and participate collectively in upholding the standards of EP Journals Group publications.
                  </p>
                  <p className="text-muted-foreground">
                    The organisation does not employ hierarchical editorial structures. Editorial decisions are made collectively based on peer review recommendations and scholarly merit. Board members provide guidance on editorial policy, assist with peer review, and support the development of their respective journals.
                  </p>
                </div>
              </div>

              <Separator className="my-6" />

              {/* Editorial Board Members Table */}
              <div className="mb-6">
                <h2 className="text-lg font-heading font-semibold text-foreground mb-3 border-b border-border pb-2">
                  Board Members
                </h2>

                <div className="space-y-4">
                  {editorialBoard.map((member, index) => (
                    <div key={index} className="border border-border p-4 bg-background">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                        <div className="flex-1">
                          <h3 className="font-heading font-medium text-foreground text-sm">
                            {member.name}
                          </h3>
                          <p className="text-xs text-ep-orange font-medium">{member.credentials}</p>
                          <p className="text-xs text-muted-foreground mt-1">{member.affiliation}</p>
                        </div>

                        {/* Research Identifiers */}
                        <div className="text-xs space-y-0.5 sm:text-right sm:shrink-0">
                          {member.orcid && (
                            <a
                              href={`https://orcid.org/${member.orcid}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-ep-orange hover:underline block"
                            >
                              ORCID: {member.orcid}
                            </a>
                          )}
                          {member.scopusId && (
                            <a
                              href={`https://www.scopus.com/authid/detail.uri?authorId=${member.scopusId}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-ep-orange hover:underline block"
                            >
                              Scopus: {member.scopusId}
                            </a>
                          )}
                          {member.wos && (
                            <p className="text-muted-foreground">Web of Science: {member.wos}</p>
                          )}
                          {member.sinta && (
                            <p className="text-muted-foreground">SINTA ID: {member.sinta}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Separator className="my-6" />

              {/* Editorial Process */}
              <div className="mb-6">
                <h2 className="text-lg font-heading font-semibold text-foreground mb-3 border-b border-border pb-2">
                  Editorial Process
                </h2>
                <div className="prose-academic text-foreground text-sm">
                  <p>
                    All manuscripts submitted to EP Journals Group publications undergo rigorous double-blind peer review. The editorial process is designed to ensure objectivity, fairness, and scholarly quality.
                  </p>

                  <div className="mt-4 space-y-3">
                    <div>
                      <h3 className="font-heading font-medium text-foreground mb-1">1. Initial Screening</h3>
                      <p className="text-muted-foreground text-xs">
                        Manuscripts are reviewed for scope, quality, and adherence to journal guidelines. Submissions that do not meet basic requirements may be returned to authors without peer review.
                      </p>
                    </div>
                    <div>
                      <h3 className="font-heading font-medium text-foreground mb-1">2. Peer Assignment</h3>
                      <p className="text-muted-foreground text-xs">
                        Papers are assigned to expert reviewers in the relevant field for thorough evaluation. A minimum of two independent reviewers evaluate each submission.
                      </p>
                    </div>
                    <div>
                      <h3 className="font-heading font-medium text-foreground mb-1">3. Quality Assessment</h3>
                      <p className="text-muted-foreground text-xs">
                        Reviewers evaluate methodology, significance, originality, and contribution to the field. Reviewers provide constructive feedback to support author revisions.
                      </p>
                    </div>
                    <div>
                      <h3 className="font-heading font-medium text-foreground mb-1">4. Editorial Decision</h3>
                      <p className="text-muted-foreground text-xs">
                        Final decision based on reviewer feedback and editorial assessment. Decisions may include acceptance, minor revision, major revision, or rejection.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <Separator className="my-6" />

              {/* Contact */}
              <div>
                <h2 className="text-lg font-heading font-semibold text-foreground mb-3 border-b border-border pb-2">
                  Contact the Editorial Office
                </h2>
                <div className="prose-academic text-foreground text-sm">
                  <p>
                    For enquiries regarding the editorial process, peer review, or editorial board matters, please contact:
                  </p>
                  <div className="mt-3 p-4 bg-muted border border-border">
                    <p className="text-sm">
                      <strong>Editorial Office:</strong>{" "}
                      <a href="mailto:editor@ep-journals.org" className="text-ep-orange hover:underline">
                        editor@ep-journals.org
                      </a>
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Response time: Within 24 hours
                    </p>
                  </div>
                </div>
              </div>

            </div>

            {/* Right Column - Institutional Sidebar */}
            <InstitutionalSidebar variant="editorial" />

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Editorial;
