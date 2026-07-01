import Link from "next/link";
import type { ReactNode } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export type PolicyKey =
  | "publication-ethics"
  | "research-integrity"
  | "peer-review"
  | "editorial-policies"
  | "corrections-retractions"
  | "open-access"
  | "copyright-licensing"
  | "archiving-preservation"
  | "author-responsibilities"
  | "reviewer-guidelines"
  | "editorial-workflow"
  | "diversity-inclusion"
  | "publisher-governance";

// policyKey -> { route, label, description }
const POLICIES: { key: PolicyKey; route: string; label: string; description: string }[] = [
  { key: "publication-ethics", route: "publication-ethics", label: "Publication Ethics", description: "COPE-aligned standards on misconduct, plagiarism, and authorship." },
  { key: "research-integrity", route: "research-integrity", label: "Research Integrity", description: "Expectations for data, methods, and the integrity of the record." },
  { key: "peer-review", route: "peer-review-process", label: "Peer Review Process", description: "Double-blind review by a minimum of two independent reviewers." },
  { key: "editorial-policies", route: "editorial-policies", label: "Editorial Policies", description: "How editorial decisions are made and independence is preserved." },
  { key: "corrections-retractions", route: "corrections-retractions", label: "Corrections & Retractions", description: "How the record is corrected, retracted, or flagged with concern." },
  { key: "open-access", route: "open-access", label: "Open Access", description: "Immediate open access under CC BY 4.0, with authors retaining copyright." },
  { key: "copyright-licensing", route: "copyright-licensing", label: "Copyright & Licensing", description: "Author copyright and the terms of the CC BY 4.0 licence." },
  { key: "archiving-preservation", route: "archiving-preservation", label: "Archiving & Preservation", description: "Long-term preservation and DOI-based permanent access." },
  { key: "author-responsibilities", route: "author-responsibilities", label: "Author Responsibilities", description: "What authors must confirm on originality, ethics, and disclosure." },
  { key: "reviewer-guidelines", route: "reviewer-guidelines", label: "Reviewer Guidelines", description: "What reviewers assess and the conduct expected of them." },
  { key: "editorial-workflow", route: "editorial-workflow", label: "Editorial Workflow", description: "The stages a manuscript passes through, with typical timelines." },
  { key: "diversity-inclusion", route: "diversity-inclusion", label: "Diversity & Inclusion", description: "Non-discrimination and inclusive editorial practice across the portfolio." },
  { key: "publisher-governance", route: "publisher-governance", label: "Publisher Governance", description: "How the publisher is administered and editorial autonomy is maintained." },
];

interface PolicyLayoutProps {
  title: string;
  subtitle?: string;
  lastRevised: string;
  policyKey: PolicyKey;
  children: ReactNode;
}

export default function PolicyLayout({ title, subtitle, lastRevised, policyKey, children }: PolicyLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <section className="py-6 bg-secondary border-b border-border">
        <div className="container mx-auto px-4">
          <h1 className="text-xl font-heading font-semibold text-foreground mb-1">{title}</h1>
          {subtitle ? <p className="text-muted-foreground text-sm leading-relaxed max-w-4xl">{subtitle}</p> : null}
        </div>
      </section>

      <section className="py-8 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-[1fr_340px] gap-8">
            <main className="min-w-0">
              <div className="prose-academic text-sm">
                <p className="text-foreground leading-relaxed">
                  The following document constitutes a formal policy of EP Journals Group. It is intended to be read together
                  with related policies and guidance notes published by the organisation. This policy applies to all journals
                  under the EP Journals Group imprint and is implemented across the organisation on a continuing basis.
                </p>
                <p className="text-foreground leading-relaxed">
                  Publication frequency across the portfolio is monthly. Where timelines are referenced, they are stated as
                  typical timeframes and may vary by discipline, submission volume, and the requirements of the peer review
                  process. The organisation retains the right to apply additional checks where warranted by a specific case.
                </p>

                <hr className="my-6 border-border" />

                {children}

                <hr className="my-6 border-border" />

                <section aria-labelledby="policy-enquiries">
                  <h2 id="policy-enquiries" className="text-base font-heading font-semibold text-foreground mb-2">
                    Policy enquiries
                  </h2>
                  <p className="text-foreground leading-relaxed">
                    Enquiries regarding interpretation or application of this policy may be directed to the editorial office.
                    Correspondence should identify the relevant journal (if applicable), the manuscript or article identifier
                    (if applicable), and a concise description of the issue.
                  </p>
                  <p className="text-muted-foreground text-xs">
                    Email: <a className="text-primary hover:underline" href="mailto:editor@ep-journals.org">editor@ep-journals.org</a>
                  </p>
                </section>
              </div>
            </main>

            <aside className="lg:border-l lg:border-border lg:pl-6">
              <div className="border border-border bg-card p-4 rounded-sm mb-4 text-xs text-muted-foreground">
                <p><span className="text-foreground font-semibold">Last revised:</span> {lastRevised}</p>
                <p className="mt-1">
                  <span className="text-foreground font-semibold">Scope:</span> All EP Journals Group journals (monthly publication frequency)
                </p>
              </div>
              <nav aria-label="Policies">
                <p className="font-heading font-semibold text-foreground text-sm mb-2">Policies &amp; governance</p>
                <ul className="space-y-1 text-sm">
                  {POLICIES.map((p) => (
                    <li key={p.route}>
                      <Link
                        href={`/policies/${p.route}`}
                        className={`hover:text-primary ${p.key === policyKey ? "text-primary font-semibold" : "text-muted-foreground"}`}
                      >
                        {p.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </aside>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export { POLICIES };
