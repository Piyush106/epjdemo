import type { Metadata } from "next";
import PolicyLayout from "@/components/PolicyLayout";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Publication Ethics",
  description: "Publisher-level policy describing ethical expectations and procedures applicable to all EP Journals Group journals.",
  path: "/policies/publication-ethics",
});

export default function Page() {
  return (
    <PolicyLayout
      title="Publication Ethics"
      subtitle="Publisher-level policy describing ethical expectations and procedures applicable to all EP Journals Group journals."
      lastRevised="January 2026"
      policyKey="publication-ethics"
    >
      <section aria-labelledby="ethics-principles">
        <h2 id="ethics-principles" className="text-base font-heading font-semibold text-foreground mb-2">
          Ethical principles
        </h2>
        <p className="text-foreground leading-relaxed">
          EP Journals Group maintains a publication ethics framework aligned with widely recognised international norms in
          scholarly publishing, including guidance produced by the Committee on Publication Ethics (COPE). The ethical
          framework is applied consistently across the portfolio, and it is treated as part of the editorial governance of
          the organisation rather than as a discretionary matter.
        </p>
        <p className="text-foreground leading-relaxed">
          Ethical standards apply to authors, reviewers, editors, and administrative staff. Where a conflict is identified
          between convenience and integrity, integrity is treated as the controlling consideration. The policy is applied to
          all manuscript categories and all publication stages, including pre-publication checks and post-publication
          assessments.
        </p>
      </section>

      <section aria-labelledby="ethics-misconduct" className="mt-5">
        <h2 id="ethics-misconduct" className="text-base font-heading font-semibold text-foreground mb-2">
          Misconduct and ethical concerns
        </h2>
        <p className="text-foreground leading-relaxed">
          Misconduct may include plagiarism, duplicate submission, redundant publication, inappropriate image manipulation,
          fabrication or falsification of data, citation manipulation, undisclosed conflicts of interest, and unethical
          research practice. Concerns may also arise where authorship is not correctly attributed or where contributions are
          misrepresented.
        </p>
        <p className="text-foreground leading-relaxed">
          Where an allegation is raised, the organisation may undertake preliminary checks, request supporting materials, and
          seek clarification from authors. Where necessary, institutions or funders may be informed in accordance with due
          process. The organisation may apply COPE-style procedural steps when evaluating and documenting outcomes.
        </p>
      </section>

      <section aria-labelledby="ethics-authorship" className="mt-5">
        <h2 id="ethics-authorship" className="text-base font-heading font-semibold text-foreground mb-2">
          Authorship and contributorship
        </h2>
        <p className="text-foreground leading-relaxed">
          Authors are expected to ensure that the author list accurately reflects substantive scholarly contribution.
          Guest, gift, and ghost authorship are treated as ethical violations. Authorship disputes may require additional
          documentation and may delay editorial processing. Where disputes arise after publication, published corrections may
          be issued or other measures taken.
        </p>
        <p className="text-foreground leading-relaxed">
          Where applicable, the organisation encourages the use of persistent identifiers (e.g., ORCID) to reduce ambiguity.
          The presence of an identifier does not by itself validate authorship; it is treated as supporting metadata.
        </p>
      </section>

      <section aria-labelledby="ethics-coi" className="mt-5">
        <h2 id="ethics-coi" className="text-base font-heading font-semibold text-foreground mb-2">
          Conflicts of interest
        </h2>
        <p className="text-foreground leading-relaxed">
          Conflicts of interest should be disclosed in a manner that is specific and sufficiently detailed to allow readers to
          understand potential influences. Financial relationships, advisory roles, employment relationships, or personal
          relationships that could reasonably be perceived as influencing the work should be declared.
        </p>
        <p className="text-foreground leading-relaxed">
          Where conflicts are disclosed, the editorial process may proceed with safeguards, including assignment of
          independent reviewers and editorial oversight. Where conflicts are concealed or materially misrepresented, the
          organisation may reject a submission or correct or retract an article.
        </p>
      </section>

      <section aria-labelledby="ethics-complaints" className="mt-5">
        <h2 id="ethics-complaints" className="text-base font-heading font-semibold text-foreground mb-2">
          Complaints and appeals
        </h2>
        <p className="text-foreground leading-relaxed">
          Authors may submit an appeal where they believe an editorial decision was made on the basis of a factual error or
          demonstrable procedural irregularity. Appeals are expected to be substantive and documented. Reconsideration is not
          guaranteed.
        </p>
        <p className="text-foreground leading-relaxed">
          Complaints regarding ethical concerns may be submitted by any stakeholder. The organisation records complaints,
          maintains internal notes on actions taken, and may publish post-publication notices where required.
        </p>
      </section>
    </PolicyLayout>
  );
}
