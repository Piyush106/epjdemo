"use client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import InstitutionalSidebar from "@/components/InstitutionalSidebar";
import MetaTags from "@/components/MetaTags";
import SchemaOrg from "@/components/SchemaOrg";
import { Link } from "react-router-dom";
import { Separator } from "@/components/ui/separator";

const Policies = () => {
  return (
    <div className="min-h-screen bg-background">
      <MetaTags
        title="Policies & Governance | EP Journals Group"
        description="Publisher-level policies governing editorial practice, peer review, research integrity, and ethical standards at EP Journals Group."
      />
      <SchemaOrg type="WebPage" data={{"name":"Policies & Governance | EP Journals Group","description":"Publisher-level policies governing editorial practice, peer review, research integrity, and ethical standards at EP Journals Group.","url":"https://www.ep-journals.org/policies","inLanguage":"en"}} />
      <Header />

      <section className="py-6 bg-secondary border-b border-border">
        <div className="container mx-auto px-4">
          <h1 className="text-xl font-heading font-semibold text-foreground mb-1">Policies & Governance</h1>
          <p className="text-muted-foreground text-sm leading-relaxed max-w-4xl">
            EP Journals Group maintains publisher-level policies governing editorial practice, peer review, research
            integrity, and correction of the scholarly record. Each policy is published as a separate document.
          </p>
        </div>
      </section>

      <section className="py-8 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-[1fr_340px] gap-8">
            <main className="min-w-0">
              <div className="prose-academic text-sm">
                <p className="text-foreground leading-relaxed">
                  Policies are applied to all journals under the EP Journals Group imprint. The portfolio operates on a
                  monthly publication frequency. Policy documents may contain controlled redundancy by design; repetition is
                  used to reduce ambiguity and to preserve administrative clarity.
                </p>

                <Separator className="my-6" />

                <section aria-labelledby="policy-index">
                  <h2 id="policy-index" className="text-base font-heading font-semibold text-foreground mb-3">
                    Policy index (publisher-level)
                  </h2>

                  <div className="grid sm:grid-cols-2 gap-x-8 gap-y-2 text-xs">
                    <Link className="text-primary hover:underline" to="/policies/publication-ethics">Publication Ethics</Link>
                    <Link className="text-primary hover:underline" to="/policies/research-integrity">Research Integrity</Link>
                    <Link className="text-primary hover:underline" to="/policies/peer-review-process">Peer Review Process</Link>
                    <Link className="text-primary hover:underline" to="/policies/editorial-policies">Editorial Policies</Link>
                    <Link className="text-primary hover:underline" to="/policies/corrections-retractions">Corrections & Retractions</Link>
                    <Link className="text-primary hover:underline" to="/policies/open-access">Open Access Policy</Link>
                    <Link className="text-primary hover:underline" to="/policies/copyright-licensing">Copyright & Licensing</Link>
                    <Link className="text-primary hover:underline" to="/policies/archiving-preservation">Archiving & Preservation</Link>
                    <Link className="text-primary hover:underline" to="/policies/author-responsibilities">Author Responsibilities</Link>
                    <Link className="text-primary hover:underline" to="/policies/reviewer-guidelines">Reviewer Guidelines</Link>
                    <Link className="text-primary hover:underline" to="/policies/editorial-workflow">Editorial Workflow</Link>
                    <Link className="text-primary hover:underline" to="/policies/diversity-inclusion">Diversity & Inclusion Statement</Link>
                    <Link className="text-primary hover:underline" to="/policies/publisher-governance">Publisher Governance</Link>
                  </div>

                  <p className="text-muted-foreground text-xs mt-4 leading-relaxed">
                    Each document contains cross-references to related policies. Where journal-level policy statements exist,
                    they are expected to remain consistent with the publisher-level framework.
                  </p>
                </section>

                <Separator className="my-6" />

                <section aria-labelledby="policy-scope">
                  <h2 id="policy-scope" className="text-base font-heading font-semibold text-foreground mb-2">
                    Scope and applicability
                  </h2>
                  <p className="text-foreground leading-relaxed">
                    These policies apply to all manuscripts and published items across the EP Journals Group portfolio. They
                    apply to authors, reviewers, editorial board members, and administrative participants. Where a policy
                    requires additional journal-specific detail, such detail is expected to be provided on the journal website.
                  </p>
                  <p className="text-foreground leading-relaxed">
                    The organisation may apply additional checks where warranted by case complexity. Where a matter involves a
                    credible allegation of misconduct, integrity procedures may take precedence over routine processing.
                  </p>
                </section>

                <Separator className="my-6" />

                <section aria-labelledby="governance-framework">
                  <h2 id="governance-framework" className="text-base font-heading font-semibold text-foreground mb-2">
                    Governance framework
                  </h2>
                  <p className="text-foreground leading-relaxed">
                    EP Journals Group operates under a documented governance framework that defines the responsibilities of the publisher, editorial boards, authors, and reviewers. The framework establishes procedures for editorial independence, conflict of interest management, and appeals processes. Governance documentation is reviewed annually and updated as required to reflect evolving best practices in scholarly publishing.
                  </p>
                  <p className="text-foreground leading-relaxed">
                    The publisher maintains administrative oversight of the portfolio while respecting the autonomy of individual journal editorial boards in matters of content selection. Editorial decisions are made on the basis of scholarly merit and peer review, without commercial or political interference.
                  </p>
                </section>

                <Separator className="my-6" />

                <section aria-labelledby="ethics-oversight">
                  <h2 id="ethics-oversight" className="text-base font-heading font-semibold text-foreground mb-2">
                    Ethics oversight and compliance
                  </h2>
                  <p className="text-foreground leading-relaxed">
                    The organisation follows the guidelines established by the Committee on Publication Ethics (COPE) and expects all participants in the publication process to adhere to these principles. Allegations of misconduct are investigated in accordance with COPE flowcharts and may result in manuscript rejection, article retraction, or notification to relevant institutions.
                  </p>
                  <p className="text-foreground leading-relaxed">
                    Authors are required to confirm that submitted work is original, has not been published elsewhere, and is not under consideration by another journal. Duplicate submission, plagiarism, data fabrication, and authorship misrepresentation are treated as serious breaches of publication ethics.
                  </p>
                  <div className="mt-4 p-4 bg-muted border border-border">
                    <h3 className="text-sm font-heading font-medium text-foreground mb-2">Key ethical requirements</h3>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      <li className="flex items-start"><span className="mr-2 text-ep-orange">•</span>Originality and proper attribution of sources</li>
                      <li className="flex items-start"><span className="mr-2 text-ep-orange">•</span>Disclosure of conflicts of interest and funding sources</li>
                      <li className="flex items-start"><span className="mr-2 text-ep-orange">•</span>Compliance with ethical approval requirements for human and animal research</li>
                      <li className="flex items-start"><span className="mr-2 text-ep-orange">•</span>Accurate representation of data and research methods</li>
                      <li className="flex items-start"><span className="mr-2 text-ep-orange">•</span>Proper acknowledgement of all contributors</li>
                    </ul>
                  </div>
                </section>

                <Separator className="my-6" />

                <section aria-labelledby="revision-history">
                  <h2 id="revision-history" className="text-base font-heading font-semibold text-foreground mb-2">
                    Policy revision and updates
                  </h2>
                  <p className="text-foreground leading-relaxed">
                    Publisher policies are reviewed on a regular basis and updated to reflect changes in best practices, regulatory requirements, and stakeholder feedback. Material changes to policies are announced through appropriate channels. The revision date is indicated on each policy document.
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    Enquiries regarding interpretation or application of these policies may be directed to the editorial office at <a href="mailto:editor@ep-journals.org" className="text-primary hover:underline">editor@ep-journals.org</a>.
                  </p>
                </section>

                <Separator className="my-6" />

                <section aria-labelledby="related-resources">
                  <h2 id="related-resources" className="text-base font-heading font-semibold text-foreground mb-2">
                    Related resources
                  </h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="p-3 bg-secondary border border-border">
                      <h3 className="text-xs font-heading font-medium text-foreground mb-1">For Authors</h3>
                      <p className="text-xs text-muted-foreground mb-2">Guidelines for manuscript preparation, submission requirements, and ethical obligations.</p>
                      <Link to="/authors" className="text-xs text-primary hover:underline">Author Guidelines →</Link>
                    </div>
                    <div className="p-3 bg-secondary border border-border">
                      <h3 className="text-xs font-heading font-medium text-foreground mb-1">For Reviewers</h3>
                      <p className="text-xs text-muted-foreground mb-2">Expectations for peer reviewers, including confidentiality and conflict of interest requirements.</p>
                      <Link to="/policies/reviewer-guidelines" className="text-xs text-primary hover:underline">Reviewer Guidelines →</Link>
                    </div>
                    <div className="p-3 bg-secondary border border-border">
                      <h3 className="text-xs font-heading font-medium text-foreground mb-1">Editorial Board</h3>
                      <p className="text-xs text-muted-foreground mb-2">Information about the editorial advisory board and editorial process.</p>
                      <Link to="/editorial" className="text-xs text-primary hover:underline">Editorial Board →</Link>
                    </div>
                    <div className="p-3 bg-secondary border border-border">
                      <h3 className="text-xs font-heading font-medium text-foreground mb-1">Contact</h3>
                      <p className="text-xs text-muted-foreground mb-2">Submit enquiries, report concerns, or request information from the editorial office.</p>
                      <Link to="/contact" className="text-xs text-primary hover:underline">Contact Us →</Link>
                    </div>
                  </div>
                </section>
              </div>
            </main>

            <InstitutionalSidebar variant="policy" />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Policies;
