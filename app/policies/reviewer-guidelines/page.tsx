import type { Metadata } from "next";
import PolicyLayout from "@/components/PolicyLayout";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Reviewer Guidelines",
  description: "Policy describing reviewer responsibilities, confidentiality expectations, and standards for constructive evaluation.",
  path: "/policies/reviewer-guidelines",
});

export default function Page() {
  return (
    <PolicyLayout
      title="Reviewer Guidelines"
      subtitle="Policy describing reviewer responsibilities, confidentiality expectations, and standards for constructive evaluation."
      lastRevised="January 2026"
      policyKey="reviewer-guidelines"
    >
      <section aria-labelledby="rg-role">
        <h2 id="rg-role" className="text-base font-heading font-semibold text-foreground mb-2">
          Reviewer role
        </h2>
        <p className="text-foreground leading-relaxed">
          Peer review supports editorial decision-making and contributes to the quality of the scholarly record. Reviewers
          are expected to evaluate submissions impartially and with due care. EP Journals Group publishes monthly; reviewers
          are therefore asked to submit reports within the agreed timeframe where feasible.
        </p>
        <p className="text-foreground leading-relaxed">
          Reviewers should comment on originality, methodological adequacy, clarity, and the relevance of conclusions to the
          evidence presented. Reports should be sufficiently detailed to support an informed editorial decision.
        </p>
      </section>

      <section aria-labelledby="rg-confidential" className="mt-5">
        <h2 id="rg-confidential" className="text-base font-heading font-semibold text-foreground mb-2">
          Confidentiality
        </h2>
        <p className="text-foreground leading-relaxed">
          Manuscripts are confidential. Reviewers must not share, distribute, or use manuscript content for personal
          advantage. Where a reviewer believes specialist consultation is required, they should seek permission from the
          editorial office before involving another person.
        </p>
        <p className="text-foreground leading-relaxed">
          Reviewers should not attempt to identify authors under the double-blind model. If author identity is discovered,
          reviewers should notify the editorial office.
        </p>
      </section>

      <section aria-labelledby="rg-coi" className="mt-5">
        <h2 id="rg-coi" className="text-base font-heading font-semibold text-foreground mb-2">
          Conflicts of interest
        </h2>
        <p className="text-foreground leading-relaxed">
          Reviewers should decline review where they have a conflict of interest, including recent collaboration, direct
          competition, institutional relationships, or financial interests. Where uncertainty exists, reviewers should
          disclose the relationship and seek editorial guidance.
        </p>
        <p className="text-foreground leading-relaxed">
          Where a reviewer is unable to provide an objective report, the organisation prefers non-participation rather than
          compromised review.
        </p>
      </section>

      <section aria-labelledby="rg-tone" className="mt-5">
        <h2 id="rg-tone" className="text-base font-heading font-semibold text-foreground mb-2">
          Report tone and content
        </h2>
        <p className="text-foreground leading-relaxed">
          Reports should be professional, evidence-based, and focused on the work. Personal remarks are not acceptable.
          Where substantial concerns exist, reviewers should explain concerns clearly and indicate what evidence supports the
          concern.
        </p>
        <p className="text-foreground leading-relaxed">
          Reviewers may suggest additional references where appropriate; however, citation suggestions should not be used to
          inflate citations. Recommendations should be tied to scholarly necessity.
        </p>
      </section>
    </PolicyLayout>
  );
}
