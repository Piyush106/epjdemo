"use client";
import { Link } from "react-router-dom";
import type { PolicyKey } from "@/components/PolicyLayout";
import KnowledgeNavBlocks from "@/components/sidebar/KnowledgeNavBlocks";
import { useJournals } from "@/hooks/useJournals";

const journalHomepage = (externalUrl: string) => externalUrl.replace(/\/index\.php\/.*$/, "");

interface SidebarProps {
  variant?: "homepage" | "journal" | "policy" | "about" | "authors" | "editorial" | "contact";
  activePolicy?: PolicyKey;
  lastRevised?: string;
  scope?: string;
}

const policyLinks: Array<{ key: PolicyKey; to: string; label: string }> = [
  { key: "publication-ethics", to: "/policies/publication-ethics", label: "Publication Ethics" },
  { key: "research-integrity", to: "/policies/research-integrity", label: "Research Integrity" },
  { key: "peer-review", to: "/policies/peer-review-process", label: "Peer Review Process" },
  { key: "editorial-policies", to: "/policies/editorial-policies", label: "Editorial Policies" },
  { key: "corrections-retractions", to: "/policies/corrections-retractions", label: "Corrections & Retractions" },
  { key: "open-access", to: "/policies/open-access", label: "Open Access Policy" },
  { key: "copyright-licensing", to: "/policies/copyright-licensing", label: "Copyright & Licensing" },
  { key: "archiving-preservation", to: "/policies/archiving-preservation", label: "Archiving & Preservation" },
  { key: "author-responsibilities", to: "/policies/author-responsibilities", label: "Author Responsibilities" },
  { key: "reviewer-guidelines", to: "/policies/reviewer-guidelines", label: "Reviewer Guidelines" },
  { key: "editorial-workflow", to: "/policies/editorial-workflow", label: "Editorial Workflow" },
  { key: "diversity-inclusion", to: "/policies/diversity-inclusion", label: "Diversity & Inclusion" },
  { key: "publisher-governance", to: "/policies/publisher-governance", label: "Publisher Governance" },
];

const InstitutionalSidebar = ({
  variant = "homepage",
  activePolicy,
  lastRevised = "January 2026",
  scope = "All EP Journals Group journals",
}: SidebarProps) => {
  const { data: journals = [] } = useJournals();
  return (
    <aside className="space-y-4">
      {(variant === "homepage" || variant === "about") && (
        <div className="border border-border bg-secondary p-4">
          <h3 className="font-heading font-semibold text-foreground text-sm mb-3 border-b border-border pb-2">
            Publisher Information
          </h3>
          <div className="text-xs text-muted-foreground space-y-1.5">
            <p>
              <strong>Organisation:</strong> EP Journals Group
            </p>
            <p>
              <strong>Type:</strong> Academic Publisher
            </p>
            <p>
              <strong>Publishing Model:</strong> Open Access
            </p>
            <p>
              <strong>Publication Frequency:</strong> Monthly
            </p>
            <p>
              <strong>Disciplines:</strong> Engineering; Economics & Finance; Management; Natural Sciences; Social Sciences
            </p>
            <p>
              <strong>Peer Review:</strong> Double-blind
            </p>
          </div>
        </div>
      )}

      {(variant === "homepage" || variant === "journal" || variant === "authors") && (
        <div className="border border-border bg-background p-4">
          <h3 className="font-heading font-semibold text-foreground text-sm mb-3 border-b border-border pb-2">
            Publication Standards
          </h3>
          <div className="text-xs text-muted-foreground space-y-1.5">
            <p>
              <strong>Review model:</strong> Double-blind peer review
            </p>
            <p>
              <strong>Minimum reviewers:</strong> 2 per manuscript
            </p>
            <p>
              <strong>Frequency:</strong> Monthly
            </p>
            <p>
              <strong>Integrity checks:</strong> Editorial screening where required
            </p>
            <p>
              <strong>Open access:</strong> Immediate (portfolio-level)
            </p>
          </div>
        </div>
      )}

      <div className="border border-border bg-background p-4">
        <h3 className="font-heading font-semibold text-foreground text-sm mb-3 border-b border-border pb-2">Quick Access</h3>
        <ul className="text-xs space-y-1.5">
          <li>
            <Link to="/journals" className="text-primary hover:underline">
              Journals list
            </Link>
          </li>
          <li>
            <Link to="/indexing" className="text-primary hover:underline">
              Indexing & Abstracting
            </Link>
          </li>
          <li>
            <Link to="/authors" className="text-primary hover:underline">
              Author guidelines
            </Link>
          </li>
          <li>
            <Link to="/editorial" className="text-primary hover:underline">
              Editorial board
            </Link>
          </li>
          <li>
            <Link to="/policies" className="text-primary hover:underline">
              Policies & governance
            </Link>
          </li>
          <li>
            <Link to="/contact" className="text-primary hover:underline">
              Contact / submissions
            </Link>
          </li>
        </ul>
      </div>

      {(variant === "homepage" || variant === "about" || variant === "editorial") && (
        <div className="border border-border bg-secondary p-4">
          <h3 className="font-heading font-semibold text-foreground text-sm mb-3 border-b border-border pb-2">
            Editorial Independence
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Editorial decisions are made on scholarly merit and peer review. The publisher maintains administrative oversight
            while preserving editorial autonomy. Editorial boards are treated as collective bodies without hierarchical
            designation.
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed mt-2">
            The organisation publishes monthly and maintains policy documentation to demonstrate procedural seriousness.
          </p>
        </div>
      )}

      {variant === "policy" && (
        <>
          <div className="border border-border bg-secondary p-4">
            <h3 className="font-heading font-semibold text-foreground text-sm mb-3 border-b border-border pb-2">Policy index</h3>
            <ul className="text-xs space-y-1.5">
              {policyLinks.map((p) => {
                const isActive = activePolicy === p.key;
                return (
                  <li key={p.key}>
                    <Link
                      to={p.to}
                      className={isActive ? "text-foreground underline" : "text-primary hover:underline"}
                    >
                      {p.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
            <div className="mt-4 pt-3 border-t border-border">
              <p className="text-xs text-muted-foreground">
                <strong>Last revised:</strong> {lastRevised}
              </p>
              <p className="text-xs text-muted-foreground">
                <strong>Scope:</strong> {scope}
              </p>
              <p className="text-xs text-muted-foreground">
                <strong>Cross-references:</strong> Policies are to be read together.
              </p>
            </div>
          </div>
          <div className="border border-border bg-background p-4">
            <h3 className="font-heading font-semibold text-foreground text-sm mb-3 border-b border-border pb-2">
              COPE Compliance
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              EP Journals Group follows guidelines established by the Committee on Publication Ethics (COPE). Allegations of misconduct are investigated in accordance with COPE flowcharts.
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed mt-2">
              The publisher maintains documented procedures for responding to ethical concerns.
            </p>
          </div>
        </>
      )}

      {variant === "journal" && (
        <>
          <div className="border border-border bg-secondary p-4">
            <h3 className="font-heading font-semibold text-foreground text-sm mb-3 border-b border-border pb-2">Journal metadata</h3>
            <div className="text-xs text-muted-foreground space-y-1.5">
              <p>
                <strong>Frequency:</strong> Monthly
              </p>
              <p>
                <strong>Review model:</strong> Double-blind
              </p>
              <p>
                <strong>Access model:</strong> Open access
              </p>
              <p>
                <strong>Archiving:</strong> Policy-controlled preservation measures
              </p>
            </div>
          </div>
          <div className="border border-border bg-background p-4">
            <h3 className="font-heading font-semibold text-foreground text-sm mb-3 border-b border-border pb-2">Submission Info</h3>
            <div className="text-xs text-muted-foreground space-y-1.5">
              <p>
                <strong>Format:</strong> PDF, DOCX
              </p>
              <p>
                <strong>Length:</strong> Up to 21 pages; contact editorial office if exceeding
              </p>
              <p>
                <strong>Review time:</strong> 1–2 weeks typical
              </p>
              <p>
                <strong>APC:</strong> 30 USD
              </p>
            </div>
          </div>
        </>
      )}

      {variant === "authors" && (
        <div className="border border-border bg-secondary p-4">
          <h3 className="font-heading font-semibold text-foreground text-sm mb-3 border-b border-border pb-2">Submission Checklist</h3>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li className="flex items-start"><span className="mr-1.5 text-ep-orange">•</span>Title page with author details</li>
            <li className="flex items-start"><span className="mr-1.5 text-ep-orange">•</span>Blinded manuscript file</li>
            <li className="flex items-start"><span className="mr-1.5 text-ep-orange">•</span>Abstract (150–300 words)</li>
            <li className="flex items-start"><span className="mr-1.5 text-ep-orange">•</span>Keywords (4–6)</li>
            <li className="flex items-start"><span className="mr-1.5 text-ep-orange">•</span>References in required format</li>
            <li className="flex items-start"><span className="mr-1.5 text-ep-orange">•</span>Figures and tables</li>
            <li className="flex items-start"><span className="mr-1.5 text-ep-orange">•</span>Conflict of interest statement</li>
          </ul>
        </div>
      )}

      {variant === "contact" && (
        <>
          <div className="border border-border bg-secondary p-4">
            <h3 className="font-heading font-semibold text-foreground text-sm mb-3 border-b border-border pb-2">Contact summary</h3>
            <div className="text-xs text-muted-foreground space-y-1.5">
              <p>
                <strong>Editorial office:</strong>
              </p>
              <p>
                <a href="mailto:editor@ep-journals.org" className="text-primary hover:underline">
                  editor@ep-journals.org
                </a>
              </p>
              <p className="mt-2">
                <strong>Editorial enquiries:</strong>
              </p>
              <p>Within 24 hours</p>
              <p className="mt-2">
                <strong>Editorial decision:</strong>
              </p>
              <p>1–2 weeks</p>
            </div>
          </div>
          <div className="border border-border bg-background p-4">
            <h3 className="font-heading font-semibold text-foreground text-sm mb-3 border-b border-border pb-2">Office Hours</h3>
            <div className="text-xs text-muted-foreground space-y-1">
              <p><strong>Monday–Saturday:</strong> 9:00 AM – 9:00 PM (IST)</p>
              <p><strong>Sunday:</strong> Holiday</p>
              <p className="mt-2 text-muted-foreground/80">Responses outside office hours may be delayed.</p>
            </div>
          </div>
        </>
      )}

      {variant === "editorial" && (
        <div className="border border-border bg-secondary p-4">
          <h3 className="font-heading font-semibold text-foreground text-sm mb-3 border-b border-border pb-2">Board Structure</h3>
          <div className="text-xs text-muted-foreground space-y-1.5">
            <p>
              <strong>Model:</strong> Collective editorial body
            </p>
            <p>
              <strong>Hierarchy:</strong> Non-hierarchical
            </p>
            <p>
              <strong>Disciplines:</strong> Multi-disciplinary coverage
            </p>
            <p>
              <strong>Geographic spread:</strong> International
            </p>
          </div>
        </div>
      )}

      <div className="border border-border bg-muted p-4">
        <h3 className="font-heading font-semibold text-foreground text-sm mb-3 border-b border-border pb-2">
          Indexing & compliance
        </h3>
        <p className="text-xs text-muted-foreground leading-relaxed mb-2">
          Indexing and database claims are treated as subject to verification by the respective agencies. The publisher does
          not guarantee inclusion in any specific index.
        </p>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Ethics procedures and correction notices are maintained to support the reliability of the scholarly record.
        </p>
      </div>

      {(variant === "homepage" || variant === "about") && (
        <div className="border border-border bg-background p-4">
          <h3 className="font-heading font-semibold text-foreground text-sm mb-3 border-b border-border pb-2">
            Transparency statement
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            The organisation publishes policy documentation, describes peer review models, and maintains administrative
            records intended to support accountability. Where a matter requires integrity review, procedural steps may extend
            beyond routine processing.
          </p>
        </div>
      )}

      {/* Journal abbreviations block - shows on all variants */}
      <div className="border border-border bg-secondary p-4">
        <h3 className="font-heading font-semibold text-foreground text-sm mb-3 border-b border-border pb-2">
          Portfolio Journals
        </h3>
        <ul className="text-xs text-muted-foreground space-y-1">
          {journals.map((j) => (
            <li key={j.abbrev}>
              <a
                href={journalHomepage(j.external_url)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                {j.abbrev}
              </a>
              {" – "}{j.scope_short}
            </li>
          ))}
        </ul>
        <p className="text-xs text-muted-foreground mt-2">All journals: Monthly frequency</p>
      </div>

      {/* Knowledge centre nav blocks — Popular Guides, Publish by Field, Quick Comparisons.
          Renders on every variant except 'contact' so the right-side column carries useful
          navigation across homepage, journal pages, policy pages, editorial, and authors. */}
      {variant !== "contact" && <KnowledgeNavBlocks />}

      {/* Contact block - shows on most variants */}
      {variant !== "contact" && (
        <div className="border border-border bg-background p-4">
          <h3 className="font-heading font-semibold text-foreground text-sm mb-3 border-b border-border pb-2">
            Editorial Contact
          </h3>
          <p className="text-xs text-muted-foreground">
            <a href="mailto:editor@ep-journals.org" className="text-primary hover:underline">editor@ep-journals.org</a>
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Response: Within 24 hours
          </p>
        </div>
      )}
    </aside>
  );
};

export default InstitutionalSidebar;
