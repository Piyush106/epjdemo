import type { Metadata } from "next";
import PolicyLayout from "@/components/PolicyLayout";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Peer Review Process",
  description: "Policy describing the peer review model applied across the EP Journals Group portfolio (monthly publication frequency).",
  path: "/policies/peer-review-process",
});

export default function Page() {
  return (
    <PolicyLayout
      title="Peer Review Process"
      subtitle="Policy describing the peer review model applied across the EP Journals Group portfolio (monthly publication frequency)."
      lastRevised="January 2026"
      policyKey="peer-review"
    >
      <section aria-labelledby="pr-model">
        <h2 id="pr-model" className="text-base font-heading font-semibold text-foreground mb-2">
          Review model
        </h2>
        <p className="text-foreground leading-relaxed">
          EP Journals Group applies a double-blind peer review model as the default standard for all journals, unless a
          journal states a discipline-specific variation on its journal website. Under the double-blind model, author and
          reviewer identities are withheld from one another during the evaluation process.
        </p>
        <p className="text-foreground leading-relaxed">
          The peer review process supports editorial decision-making. Peer review does not guarantee correctness; it is a
          structured assessment aimed at evaluating scholarly merit, methodological adequacy, and contribution to the field.
        </p>
      </section>

      <section aria-labelledby="pr-stages" className="mt-5">
        <h2 id="pr-stages" className="text-base font-heading font-semibold text-foreground mb-2">
          Stages of review
        </h2>
        <p className="text-foreground leading-relaxed">
          Upon receipt, submissions may be screened for scope alignment and basic compliance with author guidelines.
          Submissions may be returned to authors for technical correction prior to formal review. Manuscripts suitable for
          peer review are assigned to reviewers selected for subject expertise.
        </p>
        <p className="text-foreground leading-relaxed">
          As a general standard, a minimum of two independent reviewer reports are sought. Where reports materially
          conflict, additional reports may be requested. Editorial decisions are informed by reports and by editorial
          assessment of the manuscript.
        </p>
      </section>

      <section aria-labelledby="pr-timelines" className="mt-5">
        <h2 id="pr-timelines" className="text-base font-heading font-semibold text-foreground mb-2">
          Timelines and monthly publication cycle
        </h2>
        <p className="text-foreground leading-relaxed">
          The portfolio follows a monthly publication frequency. Typical review timelines are described as operational
          targets and may vary. Where revisions are required, the total processing time may extend beyond a single month.
          The monthly publication schedule refers to issue cadence and publishing capacity, not to a guaranteed acceptance
          timeline.
        </p>
        <p className="text-foreground leading-relaxed">
          Where delays occur due to reviewer availability or complex integrity checks, authors may be informed. Review is
          conducted as a scholarly process rather than as a time-bound service.
        </p>
      </section>

      <section aria-labelledby="pr-confidentiality" className="mt-5">
        <h2 id="pr-confidentiality" className="text-base font-heading font-semibold text-foreground mb-2">
          Confidentiality and reviewer conduct
        </h2>
        <p className="text-foreground leading-relaxed">
          Reviewers are expected to treat manuscripts as confidential documents and to refrain from using unpublished
          material for personal advantage. Reviewers should declare conflicts of interest and decline review where
          impartiality cannot be maintained.
        </p>
        <p className="text-foreground leading-relaxed">
          Reviewer reports should be written in a professional tone. Criticism should be evidence-based and focused on the
          work rather than the author. Where inappropriate language is used, the editorial office may redact material before
          forwarding reports.
        </p>
      </section>
    </PolicyLayout>
  );
}
