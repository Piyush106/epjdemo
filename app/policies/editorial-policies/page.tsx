import type { Metadata } from "next";
import PolicyLayout from "@/components/PolicyLayout";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Editorial Policies",
  description: "Publisher-level editorial policies describing editorial independence, decision-making, and governance controls.",
  path: "/policies/editorial-policies",
});

export default function Page() {
  return (
    <PolicyLayout
      title="Editorial Policies"
      subtitle="Publisher-level editorial policies describing editorial independence, decision-making, and governance controls."
      lastRevised="January 2026"
      policyKey="editorial-policies"
    >
      <section aria-labelledby="ed-independence">
        <h2 id="ed-independence" className="text-base font-heading font-semibold text-foreground mb-2">
          Editorial independence
        </h2>
        <p className="text-foreground leading-relaxed">
          EP Journals Group maintains editorial independence as a foundational governance requirement. Editorial decisions
          are based on scholarly merit, relevance to scope, methodological quality, and contribution to the academic record.
          Commercial, political, or reputational considerations are not treated as legitimate grounds for editorial
          acceptance.
        </p>
        <p className="text-foreground leading-relaxed">
          The organisation does not designate hierarchical editorial titles that concentrate authority. Editorial boards are
          treated as collective bodies. Editorial responsibility is distributed and documented through routine editorial
          procedures.
        </p>
      </section>

      <section aria-labelledby="ed-decisions" className="mt-5">
        <h2 id="ed-decisions" className="text-base font-heading font-semibold text-foreground mb-2">
          Decision-making and documentation
        </h2>
        <p className="text-foreground leading-relaxed">
          Decisions may include rejection, major revision, minor revision, or acceptance. Decisions are typically based on
          reviewer reports and editorial assessment. Where a decision departs from reviewer recommendations, an internal note
          may be recorded to document the rationale.
        </p>
        <p className="text-foreground leading-relaxed">
          The organisation recognises that editorial judgement may differ across disciplines. Variations in emphasis are
          accepted where they remain within the boundaries of transparency and integrity.
        </p>
      </section>

      <section aria-labelledby="ed-coi" className="mt-5">
        <h2 id="ed-coi" className="text-base font-heading font-semibold text-foreground mb-2">
          Editorial conflicts of interest
        </h2>
        <p className="text-foreground leading-relaxed">
          Editors should not handle manuscripts where they have a conflict of interest. Conflicts may be financial,
          institutional, collaborative, competitive, or personal. Where a conflict exists, another qualified editor should be
          assigned.
        </p>
        <p className="text-foreground leading-relaxed">
          Where an editor is an author on a submission, the organisation applies additional safeguards to preserve fairness.
          Editorial handling is reassigned and documented.
        </p>
      </section>

      <section aria-labelledby="ed-complaints" className="mt-5">
        <h2 id="ed-complaints" className="text-base font-heading font-semibold text-foreground mb-2">
          Complaints, appeals, and procedural review
        </h2>
        <p className="text-foreground leading-relaxed">
          Complaints about editorial handling are evaluated on the basis of procedure, documentation, and substantive
          evidence. Appeals are reviewed where a material procedural deficiency is credibly alleged. The organisation may
          consult additional editors or reviewers when reassessing a decision.
        </p>
        <p className="text-foreground leading-relaxed">
          Editorial reconsideration is not treated as an entitlement. The organisation preserves the right to maintain a
          decision where due process was followed and where the scholarly judgement was reasonable.
        </p>
      </section>
    </PolicyLayout>
  );
}
