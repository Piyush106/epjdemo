import type { Metadata } from "next";
import PolicyLayout from "@/components/PolicyLayout";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Publisher Governance",
  description: "Publisher-level governance document describing institutional oversight, accountability, and separation of editorial decision-making.",
  path: "/policies/publisher-governance",
});

export default function Page() {
  return (
    <PolicyLayout
      title="Publisher Governance"
      subtitle="Publisher-level governance document describing institutional oversight, accountability, and separation of editorial decision-making."
      lastRevised="January 2026"
      policyKey="publisher-governance"
    >
      <section aria-labelledby="pg-overview">
        <h2 id="pg-overview" className="text-base font-heading font-semibold text-foreground mb-2">
          Governance overview
        </h2>
        <p className="text-foreground leading-relaxed">
          EP Journals Group is governed through documented policies and administrative procedures that support the integrity
          of its peer-reviewed journals. Governance is treated as an institutional requirement rather than a discretionary
          operational preference. The organisation publishes on a monthly schedule and maintains consistent portfolio-level
          oversight.
        </p>
        <p className="text-foreground leading-relaxed">
          Governance includes maintenance of policies, preservation of records, ethical oversight, and administrative support
          for journal operations. Governance does not replace editorial judgement; it is intended to protect editorial
          independence.
        </p>
      </section>

      <section aria-labelledby="pg-separation" className="mt-5">
        <h2 id="pg-separation" className="text-base font-heading font-semibold text-foreground mb-2">
          Separation of roles
        </h2>
        <p className="text-foreground leading-relaxed">
          The organisation maintains separation between administrative functions and editorial decision-making. Administrative
          processes support submission handling and publication logistics, while editorial decisions are based on peer review
          and scholarly evaluation.
        </p>
        <p className="text-foreground leading-relaxed">
          The organisation does not maintain single-person editorial hierarchies as a governance model. Editorial boards are
          treated as collective bodies with shared responsibility.
        </p>
      </section>

      <section aria-labelledby="pg-policy" className="mt-5">
        <h2 id="pg-policy" className="text-base font-heading font-semibold text-foreground mb-2">
          Policy maintenance
        </h2>
        <p className="text-foreground leading-relaxed">
          Policies are reviewed periodically and updated where required. Updates are recorded through revision dates and are
          treated as governance changes. Minor differences between journals may exist due to disciplinary conventions; such
          differences are expected to be stated at journal level.
        </p>
        <p className="text-foreground leading-relaxed">
          Where policies conflict, the more stringent integrity standard is applied pending clarification.
        </p>
      </section>

      <section aria-labelledby="pg-disclaimer" className="mt-5">
        <h2 id="pg-disclaimer" className="text-base font-heading font-semibold text-foreground mb-2">
          Compliance and indexing statements
        </h2>
        <p className="text-foreground leading-relaxed">
          Statements regarding indexing and database listings are treated as factual claims that may be verified by external
          agencies. The organisation avoids implying guaranteed inclusion. Where a claim is made, it is stated as subject to
          verification by the relevant agency.
        </p>
        <p className="text-foreground leading-relaxed">
          Governance documentation is maintained to support auditability and to demonstrate procedural seriousness to
          stakeholders, including librarians and indexing bodies.
        </p>
      </section>
    </PolicyLayout>
  );
}
