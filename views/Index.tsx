"use client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import InstitutionalSidebar from "@/components/InstitutionalSidebar";
import { Link } from "react-router-dom";
import RecentArticlesSlideshow from "@/components/RecentArticlesSlideshow";
import ExploreResources from "@/components/home/ExploreResources";
import HeroSearch from "@/components/home/HeroSearch";
import { JournalShelf, EditorialBoard } from "@/components/brand/Illustrations";
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
  initialArticles?: { id: string; title: string; authors: string; journal_abbrev: string; journal_name?: string | null; publication_date: string; volume?: string | null; issue?: string | null }[];
  articleCount?: number;
  exploreResources?: Record<string, { slug: string; title: string; category: string }[]>;
  /** Server-rendered "latest from each journal" block (crawlable links). */
  latestByJournal?: React.ReactNode;
}

const Index = ({ initialJournals = [], initialArticles = [], articleCount = 0, exploreResources, latestByJournal }: IndexProps) => {
  // Server passes journals so the table + links are in the initial HTML (SEO);
  // useJournals refreshes on the client. SSR render uses initialJournals.
  const { data } = useJournals();
  const journals = data && data.length ? data : initialJournals;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero — value proposition, search, primary actions. */}
      <section className="relative overflow-hidden border-b border-border bg-ep-cream">
        <div aria-hidden className="absolute inset-x-0 top-0 h-1 bg-ep-orange" />
        <div className="container mx-auto grid items-center gap-10 px-4 py-10 sm:py-14 lg:grid-cols-[1.25fr_1fr]">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ep-orange">Academic publisher · Six open access journals</p>
            <h1 className="mt-3 font-heading text-3xl font-semibold leading-tight text-ep-brown sm:text-[2.6rem] mb-4">
                  Peer-Reviewed Open Access Journals — EP Journals Group
                </h1>
            <p className="text-base text-foreground/80 leading-relaxed mb-3 max-w-2xl">
                  EP Journals Group publishes six double-blind peer-reviewed journals in engineering, economics and finance,
                  management, natural sciences, social sciences, and education. Every article is published under a Creative
                  Commons Attribution 4.0 (CC BY 4.0) licence with a Crossref DOI, and authors keep their copyright.
                </p>
            {/* Price and timeline answer authors' first two questions, so they sit in the hero. */}
                <p className="text-sm text-foreground leading-relaxed mb-6 max-w-2xl">
                  <strong>Article processing charge (APC): USD 30, payable only after acceptance.</strong> No submission fee.
                  An editorial decision is typically sent within one to two weeks of submission.{" "}
                  <Link to="/faq" className="text-primary hover:underline">Read the author FAQ</Link>.
                </p>
            <div className="flex flex-wrap gap-3 mb-6">
                  <Link to="/submit" className="inline-flex items-center bg-primary text-primary-foreground px-5 py-2.5 text-sm font-medium rounded-sm hover:bg-primary-hover transition-colors">
                    Submit a manuscript &rarr;
                  </Link>
                  <Link to="/journals" className="inline-flex items-center border border-border bg-card px-5 py-2.5 text-sm font-medium rounded-sm hover:bg-muted transition-colors">
                    Choose a journal
                  </Link>
                  <Link to="/articles" className="inline-flex items-center px-2 py-2.5 text-sm font-medium text-primary hover:underline">
                    Browse{articleCount ? ` ${articleCount}` : ""} articles
                  </Link>
                </div>
            <HeroSearch />
          </div>
          <div className="hidden lg:block">
            <JournalShelf className="mx-auto h-auto w-full max-w-[440px]" />
          </div>
        </div>
        <div className="border-t border-border bg-card/70">
          <dl className="container mx-auto grid grid-cols-2 px-4 sm:grid-cols-4">
            {[
                    { n: journals.length || 6, l: "Peer-reviewed journals" },
                    { n: articleCount || "—", l: "Published articles" },
                    { n: "USD 30", l: "APC, only after acceptance" },
                    { n: "CC BY 4.0", l: "Open access licence" },
                  ].map((s) => (
                    <div key={s.l} className="flex flex-col-reverse px-2 py-5 sm:px-4">
                      <dt className="mt-1 text-xs leading-snug text-muted-foreground">{s.l}</dt>
                      <dd className="font-heading text-2xl font-semibold leading-tight text-ep-brown">{s.n}</dd>
                    </div>
                  ))}
          </dl>
        </div>
      </section>

      {/* Recent Articles Slideshow */}
      <RecentArticlesSlideshow initialArticles={initialArticles} />

      {/* Two-Column Academic Layout. The submit and editorial-board banners that
          used to sit here pushed the H1 below the first phone screen; the submit
          action now lives in the hero and the board invitation near the end. */}
      <main className="py-8 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-[1fr_340px] gap-8">
            {/* Left Column - Primary Editorial Content */}
            <div className="min-w-0">



              <div className="mb-6 rounded-lg border border-border bg-card p-5 shadow-sm sm:p-6">
                <h2 className="text-xl font-heading font-semibold text-ep-brown mb-4 border-b border-border pb-3">
                  About the Publisher
                </h2>
                <div className="prose-academic text-foreground text-sm space-y-3">
                  <p>
                    EP Journals Group publishes six open access journals covering Engineering and Technology, Economics and
                    Finance, Management, Natural Sciences, Social Sciences, and Education. All journals publish monthly.
                  </p>
                  <p>
                    The publisher maintains written policies on editorial independence, peer review, research integrity, and
                    corrections and retractions. Each policy is published in full in the{" "}
                    <Link to="/policies" className="text-primary hover:underline">policy index</Link>.
                  </p>
                </div>
              </div>


              {/* Journals overview — one card per journal */}
              <div className="mb-6 rounded-lg border border-border bg-card p-5 shadow-sm sm:p-6">
                <h2 className="text-xl font-heading font-semibold text-ep-brown mb-4 border-b border-border pb-3">
                  Journals Published by EP Journals Group
                </h2>
                <p className="text-muted-foreground text-sm mb-4">
                  All six journals publish monthly and are overseen by the publisher&apos;s{" "}
                  <Link to="/editorial" className="text-primary hover:underline">Editorial Advisory Board</Link>.
                </p>
                
                <ul className="grid gap-4 sm:grid-cols-2">
                  {journals.map((journal) => (
                    <li key={journal.abbrev} className="flex flex-col overflow-hidden rounded-lg border border-border bg-card transition-shadow hover:shadow-md">
                      <div aria-hidden className="h-1 bg-ep-orange" />
                      <div className="flex flex-1 flex-col p-4">
                        <p className="text-xs font-semibold tracking-wide text-ep-orange">{journal.abbrev}</p>
                        <Link to={`/journals/${journal.abbrev.toLowerCase()}`} className="mt-1 font-heading text-base font-semibold leading-snug text-foreground hover:text-primary">
                          {journal.title}
                        </Link>
                        <p className="mt-2 flex-1 text-sm text-muted-foreground">{journal.scope_short}</p>
                        <dl className="mt-3 grid grid-cols-3 gap-2 border-t border-border pt-3 text-xs">
                          <div><dt className="text-muted-foreground">Print ISSN</dt><dd className="font-medium text-foreground">{journal.print_issn || "—"}</dd></div>
                          <div><dt className="text-muted-foreground">Online ISSN</dt><dd className="font-medium text-foreground">{journal.electronic_issn || "—"}</dd></div>
                          <div><dt className="text-muted-foreground">Frequency</dt><dd className="font-medium text-foreground">{journal.frequency}</dd></div>
                        </dl>
                        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs">
                          <Link to={`/journals/${journal.abbrev.toLowerCase()}`} className="font-medium text-primary hover:underline">Journal details</Link>
                          <a href={journalHomepage(journal.external_url)} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Journal website</a>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
                
                <p className="text-xs text-muted-foreground mt-3">
                  For detailed information regarding individual journal aims and scope, editorial board composition, and submission procedures, please visit the respective journal websites or consult the <Link to="/journals" className="text-ep-orange hover:underline">Journals</Link> page.
                </p>
              </div>


              {latestByJournal}

              {/* Publication Process Summary */}
              <div className="mb-6 rounded-lg border border-border bg-card p-5 shadow-sm sm:p-6">
                <h2 className="text-xl font-heading font-semibold text-ep-brown mb-4 border-b border-border pb-3">
                  Publication Process
                </h2>
                <p className="text-sm text-foreground leading-relaxed mb-3">
                  An editorial decision is typically sent within one to two weeks of submission. Accepted articles are
                  published after the APC is paid and the author has approved the final proof.
                </p>
                {/* One timeline, stated the same way everywhere. "Immediate" and "within
                    24 hours" were removed: very fast review reads as a predatory signal. */}
                <div className="mb-3">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    {[
                      { t: "Initial screening", d: "Within 2 working days" },
                      { t: "Double-blind peer review", d: "Two independent reviewers" },
                      { t: "Editorial decision", d: "Typically 1–2 weeks from submission" },
                      { t: "Publication", d: "After APC payment and proof approval" },
                    ].map((step, i) => (
                      <div key={step.t} className="rounded-md border border-border bg-ep-cream p-3 text-center">
                        <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-semibold mx-auto mb-1">{i + 1}</div>
                        <p className="font-heading font-semibold text-foreground">{step.t}</p>
                        <p className="text-primary font-medium">{step.d}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  For a detailed description of each stage, including submission requirements and post-publication procedures,
                  see the <Link to="/publication-process" className="text-primary hover:underline">Publication Process</Link> page.
                </p>
              </div>


              <div className="mb-6 rounded-lg border border-border bg-card p-5 shadow-sm sm:p-6">
                <ExploreResources initialByCat={exploreResources} />
              </div>


              {/* Editorial Governance Statement */}
              <div className="mb-6 rounded-lg border border-border bg-card p-5 shadow-sm sm:p-6">
                <h2 className="text-xl font-heading font-semibold text-ep-brown mb-4 border-b border-border pb-3">
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
                      All manuscripts submitted to EP Journals Group publications undergo double-blind peer review. A minimum of two independent reviewers with relevant subject expertise evaluate each submission. Reviewers assess manuscripts for originality, methodological soundness, clarity of presentation, and contribution to the field. An editorial decision is typically sent within one to two weeks of submission. Reviewers are expected to provide fair, constructive, and timely assessments. The double-blind model ensures that neither authors nor reviewers are aware of each other's identities, promoting objectivity and impartiality in the evaluation process.
                    </p>
                  </div>
                </div>
              </div>


              {/* Publication Standards */}
              <div className="mb-6 rounded-lg border border-border bg-card p-5 shadow-sm sm:p-6">
                <h2 className="text-xl font-heading font-semibold text-ep-brown mb-4 border-b border-border pb-3">
                  Publication Standards & Ethical Compliance
                </h2>
                
                <div className="prose-academic text-foreground text-sm space-y-4">
                  <div>
                    <h3 className="text-base font-heading font-medium text-foreground mb-2">Publication Ethics</h3>
                    <p>
                      EP Journals Group follows the guidelines established by the Committee on Publication Ethics (COPE) and expects all authors, reviewers, and editors to adhere to these principles. Allegations of misconduct, including plagiarism, data fabrication, and duplicate submission, are investigated thoroughly and may result in manuscript rejection, article retraction, or other appropriate sanctions. The publisher maintains documented procedures for handling allegations of misconduct and follows COPE flowcharts for investigating and responding to such concerns.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-base font-heading font-medium text-foreground mb-2">Open Access Policy</h3>
                    <p>
                      All articles published by EP Journals Group are made available under open access terms immediately upon publication. Published content is freely accessible to readers worldwide without subscription or access fees. This approach supports the broad dissemination of research findings and aligns with the organisation's commitment to the democratisation of knowledge. Published articles are licensed under the Creative Commons Attribution 4.0 International License (CC BY 4.0), which permits sharing, adaptation, and reuse with appropriate attribution to the original authors.
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


              {/* Open Access & Licensing */}
              <div className="mb-6 rounded-lg border border-border bg-card p-5 shadow-sm sm:p-6">
                <h2 className="text-xl font-heading font-semibold text-ep-brown mb-4 border-b border-border pb-3">
                  Open Access & Licensing Framework
                </h2>
                
                <div className="prose-academic text-foreground text-sm space-y-4">
                  <p>
                    EP Journals Group operates on a fully open access model. All published articles are made freely available to readers immediately upon publication, with no embargo period or access restrictions. This approach is consistent with the Budapest Open Access Initiative and reflects the organisation's commitment to maximising the visibility, accessibility, and impact of scholarly research.
                  </p>
                  <p>
                    Authors retain copyright of their published work. Upon acceptance, authors grant EP Journals Group a non-exclusive licence to publish, distribute, and archive the article. Published articles are licensed under the Creative Commons Attribution 4.0 International License (CC BY 4.0), which permits:
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


              {/* Archiving & Preservation */}
              <div className="mb-6 rounded-lg border border-border bg-card p-5 shadow-sm sm:p-6">
                <h2 className="text-xl font-heading font-semibold text-ep-brown mb-4 border-b border-border pb-3">
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


              {/* Why Publish With EP Journals */}
              <div className="mb-6 rounded-lg border border-border bg-card p-5 shadow-sm sm:p-6">
                <h2 className="text-xl font-heading font-semibold text-ep-brown mb-4 border-b border-border pb-3">
                  Why Publish With EP Journals Group
                </h2>
                <div className="prose-academic text-foreground text-sm space-y-3">
                  <p>
                    What authors receive from every EP journal:
                  </p>
                  <div className="grid sm:grid-cols-2 gap-4 mt-4">
                    <div className="rounded-md border border-border bg-ep-cream p-4">
                      <p className="font-heading font-semibold text-ep-brown text-sm mb-1">Free to Read</p>
                      <p className="text-xs text-muted-foreground">All articles are free to read worldwide under CC BY 4.0, with no embargo.</p>
                    </div>
                    <div className="rounded-md border border-border bg-ep-cream p-4">
                      <p className="font-heading font-semibold text-ep-brown text-sm mb-1">Double-Blind Peer Review</p>
                      <p className="text-xs text-muted-foreground">Each manuscript is reviewed by at least two independent reviewers who do not know the authors' identities.</p>
                    </div>
                    <div className="rounded-md border border-border bg-ep-cream p-4">
                      <p className="font-heading font-semibold text-ep-brown text-sm mb-1">Permanent DOI Assignment</p>
                      <p className="text-xs text-muted-foreground">Every published article receives a CrossRef DOI for reliable, permanent citation and discoverability.</p>
                    </div>
                    <div className="rounded-md border border-border bg-ep-cream p-4">
                      <p className="font-heading font-semibold text-ep-brown text-sm mb-1">Discoverable and Verifiable</p>
                      <p className="text-xs text-muted-foreground">
                        Crossref DOIs for every article; journals listed in OpenAlex, Scilit, Index Copernicus and the ISSN Portal.{" "}
                        <Link to="/indexing" className="text-primary hover:underline">Check each listing</Link>.
                      </p>
                    </div>
                    <div className="rounded-md border border-border bg-ep-cream p-4">
                      <p className="font-heading font-semibold text-ep-brown text-sm mb-1">USD 30 APC, Only After Acceptance</p>
                      <p className="text-xs text-muted-foreground">No submission fee. The article processing charge is invoiced only once your manuscript is accepted.</p>
                    </div>
                    <div className="rounded-md border border-border bg-ep-cream p-4">
                      <p className="font-heading font-semibold text-ep-brown text-sm mb-1">Ethical Standards</p>
                      <p className="text-xs text-muted-foreground">Follows COPE guidance, with written procedures for handling misconduct allegations.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Editorial board invitation — moved here from above the hero. */}
              <section className="mb-8 flex flex-col items-start justify-between gap-4 rounded-lg border border-border bg-ep-cream p-5 sm:flex-row sm:items-center">
                <EditorialBoard className="hidden h-20 w-auto shrink-0 sm:block" />
                <div className="flex-1">
                  <h2 className="text-base font-heading font-semibold text-ep-brown">Join the Editorial Advisory Board</h2>
                  <p className="text-xs text-muted-foreground">Researchers with a PhD and a publication record can apply to review and advise for EP journals.</p>
                </div>
                <Link to="/join-editorial-board" className="inline-flex items-center px-4 py-2 text-sm font-medium border border-primary text-primary bg-card hover:bg-primary hover:text-primary-foreground transition-colors">
                  Apply to the board &rarr;
                </Link>
              </section>

              <div className="mb-6 rounded-lg border border-border bg-card p-5 shadow-sm sm:p-6">
                <h2 className="text-xl font-heading font-semibold text-ep-brown mb-4 border-b border-border pb-3">
                  Contact Information
                </h2>
                <div className="prose-academic text-foreground text-sm">
                  <p>
                    For enquiries regarding manuscript submission, editorial processes, or publication policies, please contact the editorial office:
                  </p>
                  <div className="mt-3 rounded-md border border-border bg-ep-cream p-4">
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
