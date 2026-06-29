"use client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import InstitutionalSidebar from "@/components/InstitutionalSidebar";
import MetaTags from "@/components/MetaTags";
import { Separator } from "@/components/ui/separator";
import { Link } from "react-router-dom";

const Contact = () => {
  return (
    <div className="min-h-screen bg-background">
      <MetaTags
        title="Contact | EP Journals Group"
        description="Contact the EP Journals Group editorial office for inquiries about manuscript submissions, publications, and academic collaboration."
      />
      <Header />

      {/* Page Header */}
      <section className="py-6 bg-secondary border-b border-border">
        <div className="container mx-auto px-4">
          <h1 className="text-xl font-heading font-semibold text-foreground mb-1">Contact</h1>
          <p className="text-muted-foreground text-sm">Information for contacting the EP Journals Group editorial office.</p>
        </div>
      </section>

      {/* Two-Column Academic Layout */}
      <main className="py-8 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-[1fr_340px] gap-8">
            {/* Left Column - Main Content */}
            <div className="min-w-0">
              {/* Contact Information */}
              <div className="mb-8 prose-academic text-sm">
                <h2 className="text-lg font-heading font-semibold text-foreground mb-3 border-b border-border pb-2">
                  Editorial Office
                </h2>
                <p className="text-foreground leading-relaxed">
                  The editorial office of EP Journals Group assists authors, reviewers, and readers with enquiries relating to
                  manuscript submission, peer review procedure, publication policies, and post-publication matters.
                </p>

                <div className="mt-4 bg-muted p-4 border border-border">
                  <h3 className="font-heading font-medium text-foreground mb-3">Contact details</h3>
                  <div className="space-y-2 text-foreground">
                    <p>
                      <strong>General enquiries:</strong>
                      <br />
                      <a href="mailto:editor@ep-journals.org" className="text-primary hover:underline">
                        editor@ep-journals.org
                      </a>
                    </p>
                    <p>
                      <strong>Manuscript submissions:</strong>
                      <br />
                      <a href="mailto:editor@ep-journals.org" className="text-primary hover:underline">
                        editor@ep-journals.org
                      </a>
                    </p>
                    <p>
                      <strong>Technical support:</strong>
                      <br />
                      <a href="mailto:support@ep-journals.org" className="text-primary hover:underline">
                        support@ep-journals.org
                      </a>
                    </p>
                    <p>
                      <strong>Website:</strong>
                      <br />
                      <Link
                        to="/"
                        className="text-primary hover:underline"
                      >
                        ep-journals.org
                      </Link>
                    </p>
                  </div>
                </div>
              </div>

              <Separator className="my-6" />

              {/* Response Times */}
              <div className="mb-8 prose-academic text-sm">
                <h2 className="text-lg font-heading font-semibold text-foreground mb-3 border-b border-border pb-2">
                  Response times
                </h2>
                <p className="text-foreground leading-relaxed">
                  The editorial office endeavours to respond within the timeframes indicated below. Timeframes are indicative
                  and may vary where an enquiry requires policy consultation or integrity review.
                </p>

                <div className="mt-4 border border-border overflow-hidden">
                  <table className="w-full text-xs">
                    <thead className="bg-muted">
                      <tr>
                        <th className="text-left px-3 py-2 font-medium text-foreground">Enquiry type</th>
                        <th className="text-left px-3 py-2 font-medium text-foreground">Typical response time</th>
                      </tr>
                    </thead>
                    <tbody className="text-foreground">
                      <tr className="border-t border-border">
                        <td className="px-3 py-2">Acknowledgement of manuscript submission</td>
                        <td className="px-3 py-2">Within 24 hours</td>
                      </tr>
                      <tr className="border-t border-border">
                        <td className="px-3 py-2">Editorial enquiries</td>
                        <td className="px-3 py-2">Within 24 hours</td>
                      </tr>
                      <tr className="border-t border-border">
                        <td className="px-3 py-2">Technical support requests</td>
                        <td className="px-3 py-2">Within 24 hours</td>
                      </tr>
                      <tr className="border-t border-border">
                        <td className="px-3 py-2">Editorial decision (typical)</td>
                        <td className="px-3 py-2">1–2 weeks</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <Separator className="my-6" />

              {/* Submission Guidelines */}
              <div className="mb-8 prose-academic text-sm">
                <h2 className="text-lg font-heading font-semibold text-foreground mb-3 border-b border-border pb-2">
                  Manuscript submission
                </h2>
                <p className="text-foreground leading-relaxed">
                  Manuscripts may be submitted via the online submission systems of individual journals or by email to the
                  central editorial office. The portfolio follows a monthly publication frequency.
                </p>
                <p className="text-muted-foreground mt-3">
                  For detailed preparation requirements, consult the <Link to="/authors" className="text-primary hover:underline">Author Guidelines</Link>.
                </p>
                <p className="text-muted-foreground mt-2">
                  For policy matters, consult the <Link to="/policies" className="text-primary hover:underline">Policies & Governance</Link> index.
                </p>
              </div>

              <Separator className="my-6" />

              {/* Office Hours */}
              <div>
                <h2 className="text-lg font-heading font-semibold text-foreground mb-3 border-b border-border pb-2">Office hours</h2>
                <p className="text-foreground text-sm leading-relaxed">The editorial office operates during the following hours:</p>
                <div className="mt-3 text-muted-foreground text-sm">
                  <p>
                    <strong>Monday to Saturday:</strong> 9:00 AM – 9:00 PM (IST)
                  </p>
                  <p>
                    <strong>Sunday:</strong> Holiday
                  </p>
                  <p className="mt-3 text-xs">Enquiries received outside office hours will be addressed on the next business day.</p>
                </div>
              </div>
            </div>

            <InstitutionalSidebar variant="contact" />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Contact;

