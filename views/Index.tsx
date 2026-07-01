"use client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import InstitutionalSidebar from "@/components/InstitutionalSidebar";
import MetaTags from "@/components/MetaTags";
import SchemaOrg from "@/components/SchemaOrg";
import { Link } from "react-router-dom";
import RecentArticlesSlideshow from "@/components/RecentArticlesSlideshow";
import ExploreResources from "@/components/home/ExploreResources";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { useJournals } from "@/hooks/useJournals";
import type { Journal } from "@/lib/types";

// Strip OJS /index.php/<slug> path so links go to the bare journal subdomain
// (e.g. https://gjetr.ep-journals.org) instead of the OJS-internal URL.
// The bare subdomain is the canonical journal homepage; Brave Mobile and some
// in-app browsers flag links whose visible text is the abbrev but href has a
// long /index.php/<slug> tail as misdirection. This avoids that warning and
// removes one client-side redirect hop on mobile.
const journalHomepage = (externalUrl: string) =>
  externalUrl.replace(/\/index\.php\/.*$/, "");

interface IndexProps {
  initialJournals?: Journal[];
  initialArticles?: { id: string; title: string; authors: string; journal_abbrev: string; publication_date: string }[];
  articleCount?: number;
}

const Index = ({ initialJournals = [], initialArticles = [], articleCount = 0 }: IndexProps) => {
  // Server passes journals so the table + links are in the initial HTML (SEO);
  // useJournals refreshes on the client. SSR render uses initialJournals.
  const { data } = useJournals();
  const journals = data && data.length ? data : initialJournals;

  return (
    <div className="min-h-screen bg-background">
      <MetaTags
        title="Open Access Journals | Peer-Reviewed Research | EP Journals Group"
        description="Publish in peer-reviewed open access journals across engineering, economics, management, natural and social sciences. Free to read, CC BY 4.0, CrossRef DOI, double-blind peer review. Submit your manuscript to EP Journals Group."
      />
      <SchemaOrg type="Organization" />
      <SchemaOrg type="WebSite" />
      <SchemaOrg type="Periodical" />
      <Header />

      {/* Recent Articles Slideshow */}
      <RecentArticlesSlideshow initialArticles={initialArticles} />

      {/* Submit Manuscript CTA */}
      <section className="border-b border-border bg-accent">
        <div className="container mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <p className="text-sm font-heading font-semibold text-foreground">Ready to publish your research?</p>
            <p className="text-xs text-muted-foreground">Submit your manuscript to any of our peer-reviewed journals.</p>
          </div>
          <Link to="/submit" className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-primary text-primary-foreground hover:opacity-90 transition-opacity">
            Submit Paper →
          </Link>
        </div>
      </section>

      {/* Two-Column Academic Layout */}
      <main className="py-8 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-[1fr_340px] gap-8">
            {/* Left Column - Primary Editorial Content */}
            <div className="min-w-0">
              {/* Hero — institutional value proposition, primary actions, and live trust stats. */}
              <header className="mb-6">
                <h1 className="text-2xl sm:text-3xl font-heading font-semibold text-foreground mb-3">
                  Peer-Reviewed Open Access Journals — EP Journals Group
                </h1>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  EP Journals Group is an open access publisher of six peer-reviewed academic journals covering engineering,
                  economics and finance, management, natural sciences, social sciences, and education. Every published article
                  is freely available under a Creative Commons Attribution 4.0 (CC BY 4.0) licence, undergoes double-blind peer
                  review by two independent reviewers, and receives a CrossRef DOI for permanent citation. Authors retain full copyright.
                </p>
                <div className="flex flex-wrap gap-3 mb-5">
                  <Link to="/articles" className="inline-flex items-center bg-primary text-primary-foreground px-5 py-2.5 text-sm font-medium rounded-sm hover:bg-primary-hover transition-colors">
                    Browse{articleCount ? ` ${articleCount}` : ""} articles &rarr;
                  </Link>
                  <Link to="/submit" className="inline-flex items-center border border-border bg-card px-5 py-2.5 text-sm font-medium rounded-sm hover:bg-muted transition-colors">
                    Submit a manuscript
                  </Link>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-border border border-border rounded-sm overflow-hidden">
                  {[
                    { n: journals.length || 6, l: "Peer-reviewed journals" },
                    { n: articleCount || "—", l: "Published articles" },
                    { n: "CC BY 4.0", l: "Open access licence" },
                    { n: "Crossref", l: "DOI on every article" },
                  ].map((s) => (
                    <div key={s.l} className="bg-card px-3 py-3 text-center">
                      <div className="text-base font-heading font-semibold text-ep-orange leading-tight">{s.n}</div>
                      <div className="text-[11px] text-muted-foreground leading-tight mt-0.5">{s.l}</div>
                    </div>
                  ))}
                </div>
              </header>

              {/* Dense navigation hub (policy + journal quick access) */}
              <section aria-labelledby="control-centre" className="mb-6">
                <h2 id="control-centre" className="text-base font-heading font-semibold text-foreground mb-2 border-b border-border pb-2">
                  Publisher navigation (policies, journals, administrative references)
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  This homepage is maintained as a working index for policy documents and journal access routes. It is intended
                  to be read as an administrative overview rather than as a promotional summary.
                </p>

                <div className="mt-3 border border-border bg-card p-4">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-sm font-heading font-semibold text-foreground mb-2">Policy navigation</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-1 gap-x-6 text-xs">
                        <Link className="text-primary hover:underline" to="/policies/publication-ethics">Publication Ethics</Link>
                        <Link className="text-primary hover:underline" to="/policies/peer-review-process">Peer Review</Link>
                        <Link className="text-primary hover:underline" to="/policies/editorial-policies">Editorial Policies</Link>
                        <Link className="text-primary hover:underline" to="/policies/research-integrity">Research Integrity</Link>
                        <Link className="text-primary hover:underline" to="/policies/corrections-retractions">Retractions</Link>
                        <Link className="text-primary hover:underline" to="/policies/open-access">Open Access</Link>
                        <Link className="text-primary hover:underline" to="/policies/copyright-licensing">Copyright</Link>
                        <Link className="text-primary hover:underline" to="/policies/archiving-preservation">Archiving</Link>
                        <Link className="text-primary hover:underline" to="/authors">Author Guidelines</Link>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        See the <Link to="/policies" className="text-primary hover:underline">policy index</Link> for the complete list.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-sm font-heading font-semibold text-foreground mb-2">Journal quick access</h3>
                      {/* Abbreviations as separated pills so they never run together;
                          title gives the full journal name on hover. */}
                      <div className="flex flex-wrap gap-1.5">
                        {journals.map((j) => (
                          <a
                            key={j.abbrev}
                            className="inline-flex items-center rounded-sm border border-border px-2 py-1 text-xs font-medium text-primary hover:bg-muted transition-colors"
                            href={journalHomepage(j.external_url)}
                            target="_blank"
                            rel="noopener noreferrer"
                            title={j.title}
                          >
                            {j.abbrev}
                          </a>
                        ))}
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
                        <Link className="text-primary hover:underline" to="/journals">Publisher journals list</Link>
                        <span className="text-muted-foreground" aria-hidden="true">·</span>
                        <Link className="text-primary hover:underline" to="/contact">Editorial office</Link>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                        Journal archives and current issues are maintained on the respective journal websites. Links above open
                        the journal sites directly.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Trust Signals */}
              <div className="mb-6 border border-border bg-secondary p-4">
                <div className="grid sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <p className="font-heading font-semibold text-foreground mb-0.5">Peer-Reviewed</p>
                    <p className="text-muted-foreground">All journals employ double-blind peer review with a minimum of two independent reviewers per manuscript.</p>
                  </div>
                  <div>
                    <p className="font-heading font-semibold text-foreground mb-0.5">DOI via CrossRef</p>
                    <p className="text-muted-foreground">Published articles are assigned Digital Object Identifiers through CrossRef for permanent citation.</p>
                  </div>
                  <div>
                    <p className="font-heading font-semibold text-foreground mb-0.5">Open Access</p>
                    <p className="text-muted-foreground">All content is freely available immediately upon publication under CC BY 4.0 licence terms.</p>
                  </div>
                </div>
              </div>

              <Separator className="my-6" />

              <div className="mb-8">
                <h2 className="text-lg font-heading font-semibold text-foreground mb-3 border-b border-border pb-2">
                  About the Publisher
                </h2>
                <div className="prose-academic text-foreground text-sm space-y-3">
                  <p>
                    EP Journals Group is an academic publishing organisation dedicated to the dissemination of peer-reviewed
                    scholarship across multiple disciplines. The organisation publishes a portfolio of open-access journals
                    covering Engineering and Technology, Economics and Finance, Management Studies, Natural Sciences, and Social
                    Sciences. All journals are published on a monthly basis.
                  </p>
                  <p>
                    The publisher maintains a documented governance framework supporting editorial independence, peer review
                    integrity, research integrity controls, and procedures for correcting the scholarly record. The organisation
                    recognises that credibility is demonstrated through policy clarity, record-keeping, and consistent
                    application.
                  </p>
                  <p className="text-muted-foreground">
                    The text on this site is intentionally document-like and administrative. Where redundancy appears, it is used
                    to reduce ambiguity and to support institutional clarity.
                  </p>
                </div>
              </div>

              <Separator className="my-6" />

              {/* Journals Overview - Table Format */}
              <div className="mb-8">
                <h2 className="text-lg font-heading font-semibold text-foreground mb-3 border-b border-border pb-2">
                  Journals Published by EP Journals Group
                </h2>
                <p className="text-muted-foreground text-sm mb-4">
                  The following table provides an overview of all journals currently published under the EP Journals Group imprint. Each journal maintains its own editorial board and operates in accordance with established standards of scholarly publishing. All journals follow a monthly publication schedule.
                </p>
                
                <div className="border border-border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted">
                        <TableHead className="font-semibold text-foreground text-xs">Journal Title</TableHead>
                        <TableHead className="font-semibold text-foreground text-xs">ISSN (Print / Electronic)</TableHead>
                        <TableHead className="font-semibold text-foreground text-xs">Frequency</TableHead>
                        <TableHead className="font-semibold text-foreground text-xs">Scope</TableHead>
                        <TableHead className="font-semibold text-foreground text-xs">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {journals.map((journal) => (
                        <TableRow key={journal.abbrev} className="hover:bg-muted/50">
                          <TableCell className="text-xs">
                            <a
                              href={journalHomepage(journal.external_url)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-ep-orange hover:underline font-medium"
                            >
                              {journal.title}
                            </a>
                            <span className="block text-muted-foreground font-mono text-xs mt-0.5">
                              ({journal.abbrev})
                            </span>
                          </TableCell>
                          <TableCell className="text-xs">
                            {journal.print_issn ? <span className="block">p-{journal.print_issn}</span> : null}
                            {journal.electronic_issn ? <span className="block">e-{journal.electronic_issn}</span> : null}
                          </TableCell>
                          <TableCell className="text-xs font-medium">{journal.frequency}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">{journal.scope_short}</TableCell>
                          <TableCell className="text-xs">
                            <span className="text-ep-teal font-medium capitalize">{journal.status}</span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                
                <p className="text-xs text-muted-foreground mt-3">
                  For detailed information regarding individual journal aims and scope, editorial board composition, and submission procedures, please visit the respective journal websites or consult the <Link to="/journals" className="text-ep-orange hover:underline">Journals</Link> page.
                </p>
              </div>

              <Separator className="my-6" />

              {/* Publication Process Summary */}
              <div className="mb-8">
                <h2 className="text-lg font-heading font-semibold text-foreground mb-3 border-b border-border pb-2">
                  Publication Process
                </h2>
                <p className="text-sm text-foreground leading-relaxed mb-3">
                  EP Journals Group operates a structured editorial workflow with defined timelines at every stage. The process
                  is designed to maintain scholarly rigour while ensuring efficient manuscript processing.
                </p>
                <div className="border border-border bg-card p-4 mb-3">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="text-center p-2 border border-border bg-background">
                      <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-semibold mx-auto mb-1">1</div>
                      <p className="font-heading font-semibold text-foreground">Initial Screening</p>
                      <p className="text-primary font-medium">Within 2 Days</p>
                    </div>
                    <div className="text-center p-2 border border-border bg-background">
                      <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-semibold mx-auto mb-1">2</div>
                      <p className="font-heading font-semibold text-foreground">Peer Review</p>
                      <p className="text-primary font-medium">1–2 Weeks</p>
                    </div>
                    <div className="text-center p-2 border border-border bg-background">
                      <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-semibold mx-auto mb-1">3</div>
                      <p className="font-heading font-semibold text-foreground">Editorial Decision</p>
                      <p className="text-primary font-medium">Immediate</p>
                    </div>
                    <div className="text-center p-2 border border-border bg-background">
                      <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-semibold mx-auto mb-1">4</div>
                      <p className="font-heading font-semibold text-foreground">Publication</p>
                      <p className="text-primary font-medium">Within 24 Hours</p>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  For a detailed description of each stage, including submission requirements and post-publication procedures,
                  see the <Link to="/publication-process" className="text-primary hover:underline">Publication Process</Link> page.
                </p>
              </div>

              <Separator className="my-6" />

              <ExploreResources />

              <Separator className="my-6" />

              {/* Editorial Governance Statement */}
              <div className="mb-8">
                <h2 className="text-lg font-heading font-semibold text-foreground mb-3 border-b border-border pb-2">
                  Editorial Governance & Standards
                </h2>
                
                <div className="prose-academic text-foreground text-sm space-y-4">
                  <div>
                    <h3 className="text-base font-heading font-medium text-foreground mb-2">Editorial Independence</h3>
                    <p>
                      EP Journals Group maintains strict editorial independence in all publication decisions. Editorial decisions are based solely on the academic merit, originality, and scholarly contribution of submitted manuscripts. The organisation does not permit commercial or political considerations to influence editorial judgements. Editors act impartially and recuse themselves from decisions in which they have a conflict of interest. The publisher does not intervene in editorial decisions and respects the autonomy of journal editors in matters of content selection.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-base font-heading font-medium text-foreground mb-2">Editorial Board Structure</h3>
                    <p>
                      Each journal within the EP Journals Group portfolio is supported by an Editorial Board comprising scholars with demonstrated expertise in the relevant discipline. All board members are accorded equal standing and participate collectively in upholding the standards of their respective journals. The organisation does not employ hierarchical editorial structures that concentrate decision-making authority in a single individual. This approach ensures that editorial decisions benefit from diverse perspectives and collective scholarly judgement.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-base font-heading font-medium text-foreground mb-2">Peer Review Process</h3>
                    <p>
                      All manuscripts submitted to EP Journals Group publications undergo rigorous double-blind peer review. A minimum of two independent reviewers with relevant subject expertise evaluate each submission. Reviewers assess manuscripts for originality, methodological soundness, clarity of presentation, and contribution to the field. The review process typically requires four to six weeks from initial submission to editorial decision. Reviewers are expected to provide fair, constructive, and timely assessments. The double-blind model ensures that neither authors nor reviewers are aware of each other's identities, promoting objectivity and impartiality in the evaluation process.
                    </p>
                  </div>
                </div>
              </div>

              <Separator className="my-6" />

              {/* Publication Standards */}
              <div className="mb-8">
                <h2 className="text-lg font-heading font-semibold text-foreground mb-3 border-b border-border pb-2">
                  Publication Standards & Ethical Compliance
                </h2>
                
                <div className="prose-academic text-foreground text-sm space-y-4">
                  <div>
                    <h3 className="text-base font-heading font-medium text-foreground mb-2">Publication Ethics</h3>
                    <p>
                      EP Journals Group is committed to maintaining the highest standards of publication ethics. The organisation follows the guidelines established by the Committee on Publication Ethics (COPE) and expects all authors, reviewers, and editors to adhere to these principles. Allegations of misconduct, including plagiarism, data fabrication, and duplicate submission, are investigated thoroughly and may result in manuscript rejection, article retraction, or other appropriate sanctions. The publisher maintains documented procedures for handling allegations of misconduct and follows COPE flowcharts for investigating and responding to such concerns.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-base font-heading font-medium text-foreground mb-2">Open Access Policy</h3>
                    <p>
                      All articles published by EP Journals Group are made available under open access terms immediately upon publication. Published content is freely accessible to readers worldwide without subscription or access fees. This approach supports the broad dissemination of research findings and aligns with the organisation's commitment to the democratisation of knowledge. Published articles are typically licensed under Creative Commons Attribution 4.0 International License (CC BY 4.0), which permits sharing, adaptation, and reuse with appropriate attribution to the original authors.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-base font-heading font-medium text-foreground mb-2">Transparency & Disclosure</h3>
                    <p>
                      Authors are required to disclose any potential conflicts of interest that may influence the interpretation or presentation of their research. Funding sources and sponsorships must be acknowledged in submitted manuscripts. EP Journals Group publishes transparent policies regarding article processing, review timelines, and any applicable publication fees. The organisation is committed to providing clear and accurate information about its publishing practices to all stakeholders.
                    </p>
                  </div>
                </div>
              </div>

              <Separator className="my-6" />

              {/* Open Access & Licensing */}
              <div className="mb-8">
                <h2 className="text-lg font-heading font-semibold text-foreground mb-3 border-b border-border pb-2">
                  Open Access & Licensing Framework
                </h2>
                
                <div className="prose-academic text-foreground text-sm space-y-4">
                  <p>
                    EP Journals Group operates on a fully open access model. All published articles are made freely available to readers immediately upon publication, with no embargo period or access restrictions. This approach is consistent with the Budapest Open Access Initiative and reflects the organisation's commitment to maximising the visibility, accessibility, and impact of scholarly research.
                  </p>
                  <p>
                    Authors retain copyright of their published work. Upon acceptance, authors grant EP Journals Group a non-exclusive licence to publish, distribute, and archive the article. Published articles are typically licensed under the Creative Commons Attribution 4.0 International License (CC BY 4.0), which permits:
                  </p>
                  <ul className="space-y-1 ml-4">
                    <li className="flex items-start">
                      <span className="mr-2 text-ep-orange">•</span>
                      Sharing and redistribution of the material in any medium or format
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2 text-ep-orange">•</span>
                      Adaptation, remixing, transformation, and building upon the material
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2 text-ep-orange">•</span>
                      Commercial and non-commercial use, provided appropriate credit is given
                    </li>
                  </ul>
                  <p className="text-muted-foreground">
                    Authors are encouraged to deposit their published articles in institutional repositories, subject-specific archives, and personal academic websites to maximise dissemination.
                  </p>
                </div>
              </div>

              <Separator className="my-6" />

              {/* Archiving & Preservation */}
              <div className="mb-8">
                <h2 className="text-lg font-heading font-semibold text-foreground mb-3 border-b border-border pb-2">
                  Archiving & Digital Preservation
                </h2>
                
                <div className="prose-academic text-foreground text-sm space-y-3">
                  <p>
                    EP Journals Group is committed to the long-term preservation and accessibility of published scholarly content. The organisation employs multiple strategies to ensure that published articles remain permanently accessible to readers and researchers.
                  </p>
                  <p>
                    All published articles are assigned Digital Object Identifiers (DOIs) through CrossRef, providing permanent, stable links to published content. DOIs ensure that articles can be located and cited reliably, even if the journal's web address changes in the future. The organisation maintains redundant backups of all published content and works with digital preservation services to ensure long-term archival access.
                  </p>
                  <p className="text-muted-foreground">
                    Authors and institutions are encouraged to deposit copies of published articles in appropriate repositories as an additional preservation measure. The open access licensing terms employed by EP Journals Group facilitate such archival practices.
                  </p>
                </div>
              </div>

              <Separator className="my-6" />

              {/* Why Publish With EP Journals */}
              <div className="mb-8">
                <h2 className="text-lg font-heading font-semibold text-foreground mb-3 border-b border-border pb-2">
                  Why Publish With EP Journals Group
                </h2>
                <div className="prose-academic text-foreground text-sm space-y-3">
                  <p>
                    EP Journals Group provides a structured and transparent publishing environment for researchers across multiple disciplines. The organisation's commitment to open access, rigorous peer review, and ethical publishing practices supports the broad dissemination and impact of scholarly work.
                  </p>
                  <div className="grid sm:grid-cols-2 gap-4 mt-4">
                    <div className="border border-border p-3 bg-card">
                      <p className="font-heading font-semibold text-foreground text-xs mb-1">Global Accessibility</p>
                      <p className="text-xs text-muted-foreground">All articles are freely available worldwide under CC BY 4.0, ensuring maximum readership and citation potential.</p>
                    </div>
                    <div className="border border-border p-3 bg-card">
                      <p className="font-heading font-semibold text-foreground text-xs mb-1">Rigorous Peer Review</p>
                      <p className="text-xs text-muted-foreground">Double-blind review by a minimum of two independent experts ensures quality and scholarly integrity.</p>
                    </div>
                    <div className="border border-border p-3 bg-card">
                      <p className="font-heading font-semibold text-foreground text-xs mb-1">Permanent DOI Assignment</p>
                      <p className="text-xs text-muted-foreground">Every published article receives a CrossRef DOI for reliable, permanent citation and discoverability.</p>
                    </div>
                    <div className="border border-border p-3 bg-card">
                      <p className="font-heading font-semibold text-foreground text-xs mb-1">Indexed Across Platforms</p>
                      <p className="text-xs text-muted-foreground">Articles are indexed in Google Scholar, Crossref, OpenAIRE, Zenodo, Index Copernicus, and Scilit.</p>
                    </div>
                    <div className="border border-border p-3 bg-card">
                      <p className="font-heading font-semibold text-foreground text-xs mb-1">Structured Workflow</p>
                      <p className="text-xs text-muted-foreground">A clearly defined publication process from submission to publication, with transparent timelines at each stage.</p>
                    </div>
                    <div className="border border-border p-3 bg-card">
                      <p className="font-heading font-semibold text-foreground text-xs mb-1">Ethical Standards</p>
                      <p className="text-xs text-muted-foreground">Full compliance with COPE guidelines and documented procedures for handling misconduct allegations.</p>
                    </div>
                  </div>
                </div>
              </div>

              <Separator className="my-6" />
              <div className="mb-6">
                <h2 className="text-lg font-heading font-semibold text-foreground mb-3 border-b border-border pb-2">
                  Contact Information
                </h2>
                <div className="prose-academic text-foreground text-sm">
                  <p>
                    For enquiries regarding manuscript submission, editorial processes, or publication policies, please contact the editorial office:
                  </p>
                  <div className="mt-3 p-4 bg-muted border border-border">
                    <p className="text-sm">
                      <strong>Editorial Office:</strong>{" "}
                      <a href="mailto:editor@ep-journals.org" className="text-ep-orange hover:underline">
                        editor@ep-journals.org
                      </a>
                    </p>
                    <p className="text-sm mt-1">
                      <strong>Manuscript Submissions:</strong>{" "}
                      <a href="mailto:editor@ep-journals.org" className="text-ep-orange hover:underline">
                        editor@ep-journals.org
                      </a>
                    </p>
                    <p className="text-sm mt-1">
                      <strong>Website:</strong>{" "}
                      <Link to="/" className="text-ep-orange hover:underline">
                        ep-journals.org
                      </Link>
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Acknowledgement of enquiries is typically provided within 24 hours. Response times may vary during periods of high volume.
                    </p>
                  </div>
                </div>
              </div>

            </div>

            {/* Right Column - Institutional Sidebar */}
            <InstitutionalSidebar variant="homepage" />

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
