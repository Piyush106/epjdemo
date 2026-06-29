import type { Metadata } from "next";
import PolicyLayout from "@/components/PolicyLayout";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Research Integrity",
  description: "Policy describing expectations for integrity of research reporting, data accuracy, and the handling of integrity concerns.",
  path: "/policies/research-integrity",
});

export default function Page() {
  return (
    <PolicyLayout
      title="Research Integrity"
      subtitle="Policy describing expectations for integrity of research reporting, data accuracy, and the handling of integrity concerns."
      lastRevised="January 2026"
      policyKey="research-integrity"
    >
      <section aria-labelledby="ri-core">
        <h2 id="ri-core" className="text-base font-heading font-semibold text-foreground mb-2">
          Scope and purpose
        </h2>
        <p className="text-foreground leading-relaxed">
          EP Journals Group publishes peer-reviewed scholarly work on a monthly basis across multiple disciplines. Research
          integrity is treated as a continuing obligation that applies before submission, during peer review, and after
          publication. The purpose of this policy is to formalise the expectations placed on authors and to define how
          integrity concerns are assessed.
        </p>
        <p className="text-foreground leading-relaxed">
          Integrity concerns may involve data integrity, methodological transparency, ethical approvals, reporting
          completeness, or the reliability of findings. The organisation recognises that honest error is distinct from
          misconduct; however, both may require correction of the literature.
        </p>
      </section>

      <section aria-labelledby="ri-data" className="mt-5">
        <h2 id="ri-data" className="text-base font-heading font-semibold text-foreground mb-2">
          Data and reproducibility expectations
        </h2>
        <p className="text-foreground leading-relaxed">
          Authors are expected to retain underlying data, analysis outputs, and relevant methodological materials for a
          reasonable period following publication. Where data cannot be shared due to confidentiality, legal restrictions, or
          safety concerns, authors should provide an explanation and, where feasible, a mechanism for controlled access.
        </p>
        <p className="text-foreground leading-relaxed">
          Manuscripts should provide sufficient methodological detail to allow informed assessment by reviewers and, where
          appropriate, to support replication. Where specialised software or proprietary methods are used, authors should
          state this clearly.
        </p>
      </section>

      <section aria-labelledby="ri-screening" className="mt-5">
        <h2 id="ri-screening" className="text-base font-heading font-semibold text-foreground mb-2">
          Editorial screening and checks
        </h2>
        <p className="text-foreground leading-relaxed">
          The editorial office may undertake checks for plagiarism, duplicate submission indicators, unusual citation
          patterns, and obvious inconsistencies in figures or reported results. Checks may occur at submission, during
          revision, and prior to publication.
        </p>
        <p className="text-foreground leading-relaxed">
          Screening is used as an integrity safeguard and does not substitute for peer review. Screening outcomes may lead to
          requests for clarification, additional documentation, or rejection.
        </p>
      </section>

      <section aria-labelledby="ri-concerns" className="mt-5">
        <h2 id="ri-concerns" className="text-base font-heading font-semibold text-foreground mb-2">
          Handling integrity concerns
        </h2>
        <p className="text-foreground leading-relaxed">
          Where concerns arise, the organisation may request raw data, ethics approvals, lab notebooks, or other supporting
          records. Authors are expected to respond within a reasonable timeframe. Where authors do not respond or where the
          response is inadequate, editorial action may be taken.
        </p>
        <p className="text-foreground leading-relaxed">
          Outcomes may include rejection, publication of a correction, publication of an expression of concern, or
          retraction. The organisation may contact institutions where a formal investigation is required.
        </p>
      </section>

      <section aria-labelledby="ri-post" className="mt-5">
        <h2 id="ri-post" className="text-base font-heading font-semibold text-foreground mb-2">
          Post-publication integrity
        </h2>
        <p className="text-foreground leading-relaxed">
          Publication is not treated as the end of integrity oversight. Readers may submit substantive concerns at any time.
          Where warranted, the organisation will evaluate concerns and publish formal notices.
        </p>
        <p className="text-foreground leading-relaxed">
          Because the portfolio is published monthly, updates to the record may be issued promptly once documentation is
          complete. Where a case is complex, notices may be delayed to preserve procedural fairness.
        </p>
      </section>
    </PolicyLayout>
  );
}
