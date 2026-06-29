"use client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import InstitutionalSidebar from "@/components/InstitutionalSidebar";
import MetaTags from "@/components/MetaTags";
import SchemaOrg from "@/components/SchemaOrg";
import { Separator } from "@/components/ui/separator";

const Authors = () => {
  return (
    <div className="min-h-screen bg-background">
      <MetaTags
        title="Author Guidelines | How to Publish a Research Paper | EP Journals Group"
        description="Step-by-step author guidelines for publishing a research paper in a peer-reviewed open access journal: manuscript preparation, formatting, submission, peer review, and publication. EP Journals Group."
      />
      <SchemaOrg type="WebPage" data={{"@type":"HowTo","name":"How to Publish a Research Paper | EP Journals Group","description":"Step-by-step author guidelines for manuscript preparation, formatting, submission, peer review, and publication.","url":"https://www.ep-journals.org/authors","inLanguage":"en"}} />
      <Header />

      {/* Page Header */}
      <section className="py-6 bg-ep-cream border-b border-border">
        <div className="container mx-auto px-4">
          <h1 className="text-xl font-heading font-semibold text-foreground mb-1">
            Author Guidelines — How to Publish a Research Paper
          </h1>
          <p className="text-muted-foreground text-sm">
            Step-by-step guidance for preparing and submitting a research manuscript to a peer-reviewed open access
            journal at EP Journals Group: formatting, structure, references, manuscript submission, peer review, and
            publication. Read this before submitting your paper.
          </p>
        </div>
      </section>

      {/* Two-Column Academic Layout */}
      <main className="py-8 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-[1fr_340px] gap-8">
            
            {/* Left Column - Main Content */}
            <div className="min-w-0 prose-academic text-sm">

              {/* Introduction */}
              <div className="mb-8">
                <p className="text-foreground leading-relaxed">
                  EP Journals Group welcomes the submission of original research manuscripts, review articles, and other scholarly contributions for consideration in its peer-reviewed journals. Authors are advised to read these guidelines carefully before preparing their submissions. Adherence to these guidelines will facilitate the review process and expedite editorial decision-making. All EP Journals Group publications operate on a monthly publication schedule.
                </p>
                <p className="text-foreground leading-relaxed">
                  The following information applies generally to all EP Journals Group publications. Authors should consult the specific journal's website for any additional requirements or variations applicable to that publication.
                </p>
              </div>

              <Separator className="my-6" />

              {/* Manuscript Types */}
              <div className="mb-8">
                <h2 className="text-lg font-heading font-semibold text-foreground mb-3 border-b border-border pb-2">
                  Types of Manuscripts
                </h2>
                <p className="text-foreground leading-relaxed mb-3">
                  EP Journals Group publications consider the following types of manuscripts:
                </p>
                
                <div className="space-y-3">
                  <div>
                    <h3 className="font-heading font-medium text-foreground">Original Research Articles</h3>
                    <p className="text-muted-foreground text-xs">
                      Full-length reports of original research. Typical length: 3,000–8,000 words, excluding references, tables, and figures.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-heading font-medium text-foreground">Review Articles</h3>
                    <p className="text-muted-foreground text-xs">
                      Comprehensive, critical evaluations of the existing literature on a specific topic. Typical length: 5,000–10,000 words.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-heading font-medium text-foreground">Short Communications</h3>
                    <p className="text-muted-foreground text-xs">
                      Brief reports of significant findings or preliminary results. Typical length: 1,500–3,000 words.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-heading font-medium text-foreground">Case Studies</h3>
                    <p className="text-muted-foreground text-xs">
                      Detailed analyses of specific cases, projects, or implementations. Typical length: 2,000–4,000 words.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-heading font-medium text-foreground">Letters to the Editor</h3>
                    <p className="text-muted-foreground text-xs">
                      Brief correspondence relating to previously published articles or matters of scholarly interest. Typical length: 500–1,000 words.
                    </p>
                  </div>
                </div>
              </div>

              <Separator className="my-6" />

              {/* Manuscript Preparation */}
              <div className="mb-8">
                <h2 className="text-lg font-heading font-semibold text-foreground mb-3 border-b border-border pb-2">
                  Manuscript Preparation
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="font-heading font-medium text-foreground mb-1.5">General Formatting Requirements</h3>
                    <ul className="text-foreground space-y-1 ml-4">
                      <li className="flex items-start">
                        <span className="mr-1.5 text-ep-orange">•</span>
                        <span>Manuscripts should be prepared in Microsoft Word (.docx) or PDF format. Maximum length: 21 pages. For manuscripts exceeding 21 pages, please contact the editorial office before submission.</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-1.5 text-ep-orange">•</span>
                        <span>Text should be double-spaced throughout, including references, figure captions, and tables.</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-1.5 text-ep-orange">•</span>
                        <span>Use a standard font such as Times New Roman, 12-point size.</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-1.5 text-ep-orange">•</span>
                        <span>Margins should be at least 2.5 cm (1 inch) on all sides.</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-1.5 text-ep-orange">•</span>
                        <span>Pages should be numbered consecutively.</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-1.5 text-ep-orange">•</span>
                        <span>Line numbers are encouraged to facilitate the review process.</span>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-heading font-medium text-foreground mb-1.5">Title Page</h3>
                    <p className="text-foreground leading-relaxed">
                      The title page should include the following information:
                    </p>
                    <ul className="text-foreground space-y-1 ml-4 mt-1">
                      <li className="flex items-start">
                        <span className="mr-1.5 text-ep-orange">•</span>
                        <span>Title of the manuscript (concise and informative).</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-1.5 text-ep-orange">•</span>
                        <span>Full names of all authors.</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-1.5 text-ep-orange">•</span>
                        <span>Institutional affiliations for each author.</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-1.5 text-ep-orange">•</span>
                        <span>Contact details for the corresponding author (email address, postal address).</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-1.5 text-ep-orange">•</span>
                        <span>ORCID identifiers for all authors (where available).</span>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-heading font-medium text-foreground mb-1.5">Abstract</h3>
                    <p className="text-foreground leading-relaxed">
                      All manuscripts should include an abstract of 150–250 words. The abstract should provide a concise summary of the research objectives, methods, principal findings, and conclusions. Abstracts should be written in the third person and should not contain references or abbreviations.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-heading font-medium text-foreground mb-1.5">Keywords</h3>
                    <p className="text-foreground leading-relaxed">
                      Authors should provide 3–5 keywords that accurately reflect the content of the manuscript. Keywords should be listed alphabetically and should not duplicate words appearing in the title.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-heading font-medium text-foreground mb-1.5">Main Text Structure</h3>
                    <p className="text-foreground leading-relaxed">
                      Original research articles should generally follow the standard scientific format: Introduction, Methods, Results, and Discussion (IMRAD). Other manuscript types may adopt alternative structures appropriate to their content.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-heading font-medium text-foreground mb-1.5">References</h3>
                    <p className="text-foreground leading-relaxed">
                      References should be formatted according to the APA (7th edition) style, unless otherwise specified by the target journal. All references cited in the text must appear in the reference list, and all references in the list must be cited in the text. Authors are responsible for the accuracy of reference information.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-heading font-medium text-foreground mb-1.5">Tables and Figures</h3>
                    <p className="text-foreground leading-relaxed">
                      Tables and figures should be numbered consecutively and cited in the text. Each table and figure should have a descriptive caption. Figures should be supplied in high resolution (minimum 300 dpi) in formats such as TIFF, EPS, or high-quality JPEG.
                    </p>
                  </div>
                </div>
              </div>

              <Separator className="my-6" />

              {/* Submission Process */}
              <div className="mb-8">
                <h2 className="text-lg font-heading font-semibold text-foreground mb-3 border-b border-border pb-2">
                  Submission Process
                </h2>
                <p className="text-foreground leading-relaxed">
                  Manuscripts may be submitted through the online submission system of the target journal or by email to the central editorial office at <a href="mailto:editor@ep-journals.org" className="text-ep-orange hover:underline">editor@ep-journals.org</a>.
                </p>
                <p className="text-foreground leading-relaxed">
                  Submissions should include:
                </p>
                <ul className="text-foreground space-y-1 ml-4 mt-1">
                  <li className="flex items-start">
                    <span className="mr-1.5 text-ep-orange">1.</span>
                    <span>A cover letter addressed to the Editor, briefly describing the manuscript and its significance.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-1.5 text-ep-orange">2.</span>
                    <span>The complete manuscript file (including title page, abstract, main text, references, tables, and figures).</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-1.5 text-ep-orange">3.</span>
                    <span>Any supplementary materials, if applicable.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-1.5 text-ep-orange">4.</span>
                    <span>A declaration of any conflicts of interest.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-1.5 text-ep-orange">5.</span>
                    <span>Ethics approval documentation, if the research involved human participants or animals.</span>
                  </li>
                </ul>
              </div>

              <Separator className="my-6" />

              {/* Peer Review */}
              <div className="mb-8">
                <h2 className="text-lg font-heading font-semibold text-foreground mb-3 border-b border-border pb-2">
                  Peer Review Process
                </h2>
                <p className="text-foreground leading-relaxed">
                  All manuscripts submitted to EP Journals Group publications undergo double-blind peer review. The identities of authors and reviewers are concealed from each other throughout the review process.
                </p>
                <p className="text-foreground leading-relaxed">
                  Upon receipt of a manuscript, the editorial office will conduct an initial assessment to determine suitability for the journal's scope and adherence to submission requirements. Manuscripts that pass this initial screening are assigned to reviewers with relevant expertise.
                </p>
                <p className="text-foreground leading-relaxed">
                  Reviewers are asked to assess manuscripts for:
                </p>
                <ul className="text-foreground space-y-1 ml-4 mt-1">
                  <li className="flex items-start">
                    <span className="mr-1.5 text-ep-orange">•</span>
                    <span>Originality and significance of the contribution.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-1.5 text-ep-orange">•</span>
                    <span>Methodological soundness and rigour.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-1.5 text-ep-orange">•</span>
                    <span>Clarity and quality of presentation.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-1.5 text-ep-orange">•</span>
                    <span>Relevance to the journal's readership.</span>
                  </li>
                </ul>
                <p className="text-foreground leading-relaxed mt-3">
                  The typical review timeline is one to two weeks from submission to initial editorial decision. Authors will be notified of the outcome and provided with reviewer feedback.
                </p>
              </div>

              <Separator className="my-6" />

              {/* Publication Ethics */}
              <div className="mb-8">
                <h2 className="text-lg font-heading font-semibold text-foreground mb-3 border-b border-border pb-2">
                  Ethical Requirements
                </h2>
                <p className="text-foreground leading-relaxed">
                  Authors are expected to adhere to the highest standards of research and publication ethics. By submitting a manuscript, authors confirm that:
                </p>
                <ul className="text-foreground space-y-1 ml-4 mt-1">
                  <li className="flex items-start">
                    <span className="mr-1.5 text-ep-orange">•</span>
                    <span>The work is original and has not been published previously, nor is it under consideration elsewhere.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-1.5 text-ep-orange">•</span>
                    <span>All sources have been properly acknowledged and cited.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-1.5 text-ep-orange">•</span>
                    <span>All named authors have contributed substantively to the work and have approved the final version.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-1.5 text-ep-orange">•</span>
                    <span>Any potential conflicts of interest have been disclosed.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-1.5 text-ep-orange">•</span>
                    <span>Research involving human participants or animals has received appropriate ethical approval.</span>
                  </li>
                </ul>
              </div>

              <Separator className="my-6" />

              {/* Contact */}
              <div>
                <h2 className="text-lg font-heading font-semibold text-foreground mb-3 border-b border-border pb-2">
                  Editorial Contact
                </h2>
                <p className="text-foreground leading-relaxed">
                  For enquiries regarding manuscript submission, the review process, or author guidelines, please contact:
                </p>
                <div className="mt-3 text-muted-foreground">
                  <p><strong>Email:</strong> <a href="mailto:editor@ep-journals.org" className="text-ep-orange hover:underline">editor@ep-journals.org</a></p>
                  <p className="text-xs mt-1.5">Acknowledgement of receipt is typically provided within 24 hours of submission.</p>
                </div>
              </div>

            </div>

            {/* Right Column - Institutional Sidebar */}
            <InstitutionalSidebar variant="authors" />

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Authors;
