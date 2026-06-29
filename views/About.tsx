"use client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import InstitutionalSidebar from "@/components/InstitutionalSidebar";
import MetaTags from "@/components/MetaTags";
import SchemaOrg from "@/components/SchemaOrg";
import { Link } from "react-router-dom";
import { Separator } from "@/components/ui/separator";

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <MetaTags
        title="About EP Journals Group"
        description="EP Journals Group is an academic publishing organization focused on peer-reviewed, open access research across multiple disciplines."
      />
      <SchemaOrg type="Organization" />
      <Header />
      
      {/* Page Header */}
      <section className="py-8 bg-ep-cream border-b border-border">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl font-heading font-semibold text-foreground mb-1">
            About the Publisher
          </h1>
          <p className="text-muted-foreground text-sm">
            EP Journals Group — Academic Publishing Organisation
          </p>
        </div>
      </section>

      {/* Two-Column Academic Layout */}
      <main className="py-10 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-[1fr_320px] gap-10">
            
            {/* Left Column - Primary Content */}
            <div className="min-w-0 prose-academic text-sm">
              
              {/* Introduction */}
              <div className="mb-8">
                <h2 className="text-xl font-heading font-semibold text-foreground mb-4 border-b border-border pb-2">
                  Organisational Overview
                </h2>
                <p className="text-foreground leading-relaxed">
                  EP Journals Group is an academic publishing organisation established with the objective of advancing scholarly research and facilitating the global dissemination of knowledge. The organisation publishes a portfolio of peer-reviewed, open-access journals spanning the disciplines of Engineering and Technology, Economics and Finance, Management Studies, Natural Sciences, and Social Sciences.
                </p>
                <p className="text-foreground leading-relaxed">
                  The organisation is committed to upholding the highest standards of academic integrity and publication ethics. All journals published under the EP Journals Group imprint operate in accordance with internationally recognised guidelines for scholarly publishing, including those established by the Committee on Publication Ethics (COPE).
                </p>
                <p className="text-foreground leading-relaxed">
                  EP Journals Group serves a global community of researchers, academics, and practitioners. The organisation's publications are designed to provide a platform for rigorous academic discourse, to support the development of evidence-based knowledge, and to contribute to the resolution of contemporary challenges across multiple fields of inquiry.
                </p>
              </div>

              <Separator className="my-8" />

              {/* Mission Statement */}
              <div className="mb-8">
                <h2 className="text-xl font-heading font-semibold text-foreground mb-4 border-b border-border pb-2">
                  Mission Statement
                </h2>
                <p className="text-foreground leading-relaxed">
                  The mission of EP Journals Group is to provide a rigorous and accessible platform for the publication and dissemination of high-quality scholarly research. The organisation seeks to:
                </p>
                <div className="mt-4 space-y-3 text-foreground">
                  <p>
                    <strong>1.</strong> Support the advancement of knowledge by publishing original research that meets the highest standards of methodological rigour and scholarly contribution.
                  </p>
                  <p>
                    <strong>2.</strong> Ensure the integrity of the publication process through transparent, impartial, and ethical editorial practices.
                  </p>
                  <p>
                    <strong>3.</strong> Promote open access to research findings, thereby maximising the societal impact and global reach of published scholarship.
                  </p>
                  <p>
                    <strong>4.</strong> Foster an inclusive academic community that welcomes contributions from researchers at all stages of their careers and from all geographical regions.
                  </p>
                </div>
              </div>

              <Separator className="my-8" />

              {/* Scope and Disciplines */}
              <div className="mb-8">
                <h2 className="text-xl font-heading font-semibold text-foreground mb-4 border-b border-border pb-2">
                  Scope and Disciplines
                </h2>
                <p className="text-foreground leading-relaxed">
                  EP Journals Group publishes scholarly work across a broad range of academic disciplines. The current portfolio comprises five journals, each dedicated to a distinct field of study:
                </p>
                <div className="mt-4 space-y-3">
                  <div>
                    <h3 className="font-heading font-medium text-foreground">Engineering and Technology</h3>
                    <p className="text-muted-foreground text-xs">
                      Including mechanical, civil, electrical, chemical, and aerospace engineering; robotics; materials science; and applied technology.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-heading font-medium text-foreground">Economics and Finance</h3>
                    <p className="text-muted-foreground text-xs">
                      Including macroeconomics, microeconomics, financial markets, investment, banking, monetary policy, and economic development.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-heading font-medium text-foreground">Management Studies</h3>
                    <p className="text-muted-foreground text-xs">
                      Including strategic management, human resources, marketing, operations, organisational behaviour, and entrepreneurship.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-heading font-medium text-foreground">Natural Sciences</h3>
                    <p className="text-muted-foreground text-xs">
                      Including physics, chemistry, biology, mathematics, earth sciences, and environmental science.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-heading font-medium text-foreground">Social Sciences and Humanities</h3>
                    <p className="text-muted-foreground text-xs">
                      Including sociology, psychology, education, political science, anthropology, law, and philosophy.
                    </p>
                  </div>
                </div>
              </div>

              <Separator className="my-8" />

              {/* Editorial Standards */}
              <div className="mb-8">
                <h2 className="text-xl font-heading font-semibold text-foreground mb-4 border-b border-border pb-2">
                  Editorial Standards and Processes
                </h2>
                <p className="text-foreground leading-relaxed">
                  EP Journals Group maintains rigorous editorial standards to ensure the quality and integrity of published research. The following principles govern the editorial process across all journals:
                </p>
                
                <div className="mt-4 space-y-4">
                  <div>
                    <h3 className="font-heading font-medium text-foreground mb-2">Peer Review</h3>
                    <p className="text-foreground leading-relaxed">
                      All manuscripts submitted to EP Journals Group publications undergo double-blind peer review. Each submission is evaluated by a minimum of two independent reviewers with relevant expertise. Reviewers assess manuscripts for originality, methodological soundness, significance of contribution, and clarity of presentation. The peer review process is designed to ensure objectivity, constructive feedback, and fair treatment of all authors.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-heading font-medium text-foreground mb-2">Editorial Independence</h3>
                    <p className="text-foreground leading-relaxed">
                      Editorial decisions are based exclusively on the scholarly merit of submitted work. The organisation maintains strict separation between editorial and commercial functions. Editors are expected to act impartially and to recuse themselves from decisions in which they have a conflict of interest.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-heading font-medium text-foreground mb-2">Publication Ethics</h3>
                    <p className="text-foreground leading-relaxed">
                      EP Journals Group adheres to the guidelines established by the Committee on Publication Ethics (COPE). The organisation takes allegations of misconduct seriously and follows established procedures for investigating and responding to such concerns. Authors, reviewers, and editors are expected to uphold the highest standards of research integrity and professional conduct.
                    </p>
                  </div>
                </div>
              </div>

              <Separator className="my-8" />

              {/* Open Access Commitment */}
              <div className="mb-8">
                <h2 className="text-xl font-heading font-semibold text-foreground mb-4 border-b border-border pb-2">
                  Open Access Commitment
                </h2>
                <p className="text-foreground leading-relaxed">
                  EP Journals Group is committed to the principles of open access. All articles published in EP Journals Group journals are made freely available to readers worldwide immediately upon publication. There are no subscription or access fees for readers.
                </p>
                <p className="text-foreground leading-relaxed">
                  The organisation believes that open access maximises the impact and visibility of research, supports the democratisation of knowledge, and accelerates scientific and scholarly progress. Published articles are typically licensed under Creative Commons terms that permit sharing and reuse with appropriate attribution.
                </p>
              </div>

              <Separator className="my-8" />

              {/* Contact Information */}
              <div>
                <h2 className="text-xl font-heading font-semibold text-foreground mb-4 border-b border-border pb-2">
                  Contact Information
                </h2>
                <p className="text-foreground leading-relaxed">
                  For enquiries regarding EP Journals Group, its publications, or editorial processes, please contact the central editorial office:
                </p>
                <div className="mt-3 text-muted-foreground text-xs">
                  <p><strong>Email:</strong> <a href="mailto:editor@ep-journals.org" className="text-ep-orange hover:underline">editor@ep-journals.org</a></p>
                  <p><strong>Website:</strong> <Link to="/" className="text-ep-orange hover:underline">ep-journals.org</Link></p>
                </div>
              </div>

            </div>

            {/* Right Column - Institutional Sidebar */}
            <InstitutionalSidebar variant="about" />

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default About;
