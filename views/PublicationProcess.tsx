"use client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import InstitutionalSidebar from "@/components/InstitutionalSidebar";
import MetaTags from "@/components/MetaTags";
import { Separator } from "@/components/ui/separator";
import { Link } from "react-router-dom";

const steps = [
  {
    number: "1",
    title: "Initial Screening",
    duration: "Within 2 Days",
    description:
      "Upon receipt, each manuscript is assessed by the editorial office for completeness, formatting compliance, and relevance to the journal's scope. Submissions that do not meet minimum requirements are returned to the author with guidance. Manuscripts passing this stage are registered and assigned to a handling editor for peer review assignment.",
    details: [
      "Verification of author declarations and conflict-of-interest disclosures",
      "Preliminary plagiarism and integrity screening",
      "Confirmation of formatting against journal-specific Author Guidelines",
      "Assignment of manuscript tracking reference number",
    ],
  },
  {
    number: "2",
    title: "Peer Review",
    duration: "1–2 Weeks",
    description:
      "Manuscripts that pass initial screening are assigned to a minimum of two independent reviewers with relevant subject expertise. EP Journals Group employs a double-blind peer review model to ensure objectivity. Reviewers evaluate originality, methodological soundness, significance of contribution, and clarity of presentation.",
    details: [
      "Double-blind review: identities of authors and reviewers are withheld",
      "Minimum of two independent reviewers per manuscript",
      "Structured evaluation criteria provided to all reviewers",
      "Authors may be invited to revise and resubmit based on reviewer feedback",
    ],
  },
  {
    number: "3",
    title: "Editorial Decision",
    duration: "Immediate After Review",
    description:
      "Following receipt of all reviewer reports, the handling editor reaches a final decision. Possible outcomes include acceptance, minor revision, major revision, or rejection. Decisions are based exclusively on scholarly merit and adherence to ethical standards. Authors are notified promptly with the decision and full reviewer comments.",
    details: [
      "Decision categories: Accept, Minor Revisions, Major Revisions, Reject",
      "All decisions accompanied by detailed reviewer feedback",
      "No commercial or non-academic considerations influence editorial decisions",
      "Revised manuscripts may undergo additional review where required",
    ],
  },
  {
    number: "4",
    title: "Publication",
    duration: "Within 24 Hours After APC",
    description:
      "Upon acceptance and completion of the Article Processing Charge, manuscripts proceed immediately to production. Articles undergo professional copyediting and typesetting. Each article is assigned a Digital Object Identifier (DOI) through CrossRef and published online under open access terms (CC BY 4.0). Published articles are indexed across Google Scholar, Crossref, OpenAIRE, Zenodo, and other academic platforms.",
    details: [
      "Professional copyediting and typesetting included",
      "DOI assignment via CrossRef for permanent citation",
      "Immediate open access under CC BY 4.0 licence",
      "Indexed in Google Scholar, Crossref, OpenAIRE, Zenodo, Index Copernicus, and Scilit",
    ],
  },
];

const PublicationProcess = () => {
  return (
    <div className="min-h-screen bg-background">
      <MetaTags
        title="Peer Review Process & Publication Timeline | EP Journals Group"
        description="How peer review works at EP Journals Group: initial screening (2 days), double-blind peer review by 2 independent reviewers (1–2 weeks), editorial decision, and publication within 24 hours of acceptance."
      />
      <Header />

      <section className="py-6 bg-ep-cream border-b border-border">
        <div className="container mx-auto px-4">
          <h1 className="text-xl font-heading font-semibold text-foreground mb-1">Peer Review Process & Publication Timeline</h1>
          <p className="text-muted-foreground text-sm">
            How peer review works at EP Journals Group: initial editorial screening within 2 working days, double-blind
            peer review by two independent reviewers (1–2 weeks), an editorial decision, and publication within 24 hours
            of acceptance — with a CrossRef DOI assigned to every accepted manuscript.
          </p>
        </div>
      </section>

      <main className="py-8 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-[1fr_320px] gap-10">
            <div className="min-w-0 text-sm">
              {/* Introductory paragraph */}
              <p className="text-foreground leading-relaxed mb-3">
                EP Journals Group operates a structured editorial workflow designed to maintain scholarly rigour while
                ensuring efficient processing of submitted manuscripts. Each stage of the process is governed by defined
                timelines, enabling authors to anticipate the progression of their submission from receipt to publication.
              </p>
              <p className="text-foreground leading-relaxed mb-6">
                The workflow described below applies to all journals within the EP Journals Group portfolio. While the
                organisation is committed to timely processing, quality and integrity are not subordinated to speed.
                Every manuscript receives thorough editorial assessment and independent peer review before a publication
                decision is reached.
              </p>

              {/* Horizontal timeline summary */}
              <div className="border border-border bg-card p-4 mb-8">
                <h2 className="text-sm font-heading font-semibold text-foreground mb-3">Workflow Timeline Overview</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-0">
                  {steps.map((step, i) => (
                    <div key={step.number} className="relative flex flex-col items-center text-center px-2 py-3">
                      {/* Connector line */}
                      {i < steps.length - 1 && (
                        <div className="hidden sm:block absolute top-7 left-[calc(50%+16px)] w-[calc(100%-32px)] h-px bg-border" />
                      )}
                      <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-semibold shrink-0 relative z-10">
                        {step.number}
                      </div>
                      <p className="text-xs font-heading font-semibold text-foreground mt-2 leading-tight">{step.title}</p>
                      <p className="text-xs text-primary font-medium mt-0.5">{step.duration}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Detailed steps */}
              <div className="space-y-0">
                {steps.map((step, i) => (
                  <div key={step.number} className="flex gap-4">
                    {/* Timeline line */}
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-semibold shrink-0">
                        {step.number}
                      </div>
                      {i < steps.length - 1 && <div className="w-px flex-1 bg-border min-h-[24px]" />}
                    </div>
                    <div className="pb-6">
                      <h3 className="font-heading font-semibold text-foreground mb-0.5">{step.title}</h3>
                      <p className="text-xs text-primary font-medium mb-2">{step.duration}</p>
                      <p className="text-foreground leading-relaxed mb-2">{step.description}</p>
                      <ul className="space-y-1 text-muted-foreground">
                        {step.details.map((detail, j) => (
                          <li key={j} className="flex items-start gap-2 text-xs">
                            <span className="text-primary mt-0.5">•</span>
                            {detail}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>

              <Separator className="my-8" />

              {/* Additional governance content */}
              <div className="mb-6">
                <h2 className="text-lg font-heading font-semibold text-foreground mb-3 border-b border-border pb-2">
                  Timeline Commitments
                </h2>
                <div className="border border-border bg-card p-4">
                  <div className="grid sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <p className="font-semibold text-foreground">Initial Screening</p>
                      <p className="text-muted-foreground">Completed within 2 working days of submission</p>
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Peer Review</p>
                      <p className="text-muted-foreground">1–2 weeks from assignment to reviewer reports</p>
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Editorial Decision</p>
                      <p className="text-muted-foreground">Issued immediately upon receipt of reviewer reports</p>
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Publication</p>
                      <p className="text-muted-foreground">Within 24 hours following APC confirmation</p>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  Timelines are institutional commitments and may vary in exceptional circumstances, such as manuscripts
                  requiring additional ethical review or specialist referee input. Authors are kept informed of progress
                  throughout the process.
                </p>
              </div>

              <Separator className="my-8" />

              {/* Submission Requirements */}
              <div className="mb-6">
                <h2 className="text-lg font-heading font-semibold text-foreground mb-3 border-b border-border pb-2">
                  Submission Requirements
                </h2>
                <p className="text-foreground leading-relaxed mb-3">
                  Authors preparing manuscripts for submission to any EP Journals Group publication should ensure compliance with the following:
                </p>
                <ul className="space-y-2 text-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    Manuscripts must be original work not previously published or under consideration elsewhere.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    All authors must have made substantive intellectual contributions and approved the final version.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    Submissions should follow the formatting guidelines specified in the Author Guidelines.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    Conflict of interest and funding declarations must be included.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    Manuscripts must be submitted in PDF, DOC, or DOCX format through the online submission portal.
                  </li>
                </ul>
                <p className="text-xs text-muted-foreground mt-4">
                  For complete submission requirements, please consult the <Link to="/authors" className="text-primary hover:underline">Author Guidelines</Link> or proceed to <Link to="/submit" className="text-primary hover:underline">Submit Manuscript</Link>.
                </p>
              </div>

              <Separator className="my-8" />

              {/* Post-publication */}
              <div className="mb-6">
                <h2 className="text-lg font-heading font-semibold text-foreground mb-3 border-b border-border pb-2">
                  Post-Publication Procedures
                </h2>
                <div className="prose-academic text-foreground space-y-3">
                  <p>
                    Published articles are permanently archived and assigned a DOI through CrossRef. Authors retain
                    copyright under the CC BY 4.0 licence and are encouraged to deposit copies in institutional
                    repositories and subject-specific archives to maximise dissemination.
                  </p>
                  <p>
                    Where errors are identified after publication, the organisation follows documented procedures for
                    issuing corrections, errata, or retractions in accordance with COPE guidelines. The integrity of
                    the scholarly record is maintained through transparent post-publication governance.
                  </p>
                  <p className="text-muted-foreground">
                    Authors may direct post-publication enquiries to the editorial office at{" "}
                    <a href="mailto:editor@ep-journals.org" className="text-primary hover:underline">editor@ep-journals.org</a>.
                  </p>
                </div>
              </div>

              <Separator className="my-8" />

              {/* Quality assurance */}
              <div>
                <h2 className="text-lg font-heading font-semibold text-foreground mb-3 border-b border-border pb-2">
                  Quality Assurance & Integrity Controls
                </h2>
                <div className="prose-academic text-foreground space-y-3">
                  <p>
                    EP Journals Group applies integrity controls at every stage of the publication process. Submissions
                    undergo plagiarism screening during the initial assessment phase. Peer reviewers are selected based
                    on demonstrated expertise and are required to declare any conflicts of interest. Editorial decisions
                    are documented and auditable.
                  </p>
                  <p>
                    The organisation maintains compliance with COPE principles and publishes documented policies on
                    publication ethics, research integrity, and editorial governance. These policies are reviewed
                    periodically and updated to reflect evolving standards in scholarly publishing.
                  </p>
                  <p className="text-muted-foreground">
                    For detailed policy documentation, see the <Link to="/policies" className="text-primary hover:underline">Policy Index</Link>.
                  </p>
                </div>
              </div>
            </div>

            <InstitutionalSidebar variant="authors" />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PublicationProcess;
