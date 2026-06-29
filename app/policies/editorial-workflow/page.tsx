import type { Metadata } from "next";
import PolicyLayout from "@/components/PolicyLayout";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Editorial Workflow",
  description: "Policy describing editorial processing stages and workflow transparency across the portfolio.",
  path: "/policies/editorial-workflow",
});

export default function Page() {
  return (
    <PolicyLayout
      title="Editorial Workflow"
      subtitle="Policy describing editorial processing stages and workflow transparency across the portfolio."
      lastRevised="April 2026"
      policyKey="editorial-workflow"
    >
      <section aria-labelledby="ew-overview">
        <h2 id="ew-overview" className="text-base font-heading font-semibold text-foreground mb-2">
          Workflow overview
        </h2>
        <p className="text-foreground leading-relaxed">
          EP Journals Group maintains a structured editorial workflow with defined timelines at every stage. The
          organisation publishes monthly, and editorial processing follows a four-stage cycle: initial screening,
          peer review, editorial decision, and publication. This workflow is designed to maintain scholarly rigour
          while ensuring efficient manuscript processing.
        </p>
      </section>

      <section aria-labelledby="ew-stages" className="mt-5">
        <h2 id="ew-stages" className="text-base font-heading font-semibold text-foreground mb-2">
          Standard processing stages
        </h2>

        <div className="border border-border bg-card p-4 mb-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="text-center p-2">
              <p className="font-heading font-semibold text-foreground">1. Initial Screening</p>
              <p className="text-primary font-medium">Within 2 Days</p>
            </div>
            <div className="text-center p-2">
              <p className="font-heading font-semibold text-foreground">2. Peer Review</p>
              <p className="text-primary font-medium">1–2 Weeks</p>
            </div>
            <div className="text-center p-2">
              <p className="font-heading font-semibold text-foreground">3. Editorial Decision</p>
              <p className="text-primary font-medium">Immediate</p>
            </div>
            <div className="text-center p-2">
              <p className="font-heading font-semibold text-foreground">4. Publication</p>
              <p className="text-primary font-medium">Within 24 Hours</p>
            </div>
          </div>
        </div>

        <p className="text-foreground leading-relaxed">
          Manuscripts are received and assessed for scope, completeness, and compliance within two working days.
          Suitable manuscripts are assigned for double-blind peer review, which is typically completed within one to
          two weeks. Editorial decisions are issued immediately upon receipt of reviewer reports. Upon acceptance and
          APC confirmation, articles are published within 24 hours.
        </p>
        <p className="text-foreground leading-relaxed">
          Final decisions are recorded and communicated with full reviewer feedback. Accepted manuscripts proceed
          through professional copyediting, typesetting, DOI assignment, and open access publication. The
          organisation may publish corrections and notices post-publication where required.
        </p>
      </section>

      <section aria-labelledby="ew-transparency" className="mt-5">
        <h2 id="ew-transparency" className="text-base font-heading font-semibold text-foreground mb-2">
          Workflow transparency
        </h2>
        <p className="text-foreground leading-relaxed">
          The organisation provides public policy documentation describing review models, ethics procedures, and editorial
          governance. Where feasible, journals publish additional information about submission requirements and editorial
          contacts.
        </p>
        <p className="text-foreground leading-relaxed">
          The organisation recognises that workflow is not static. Procedures may be updated as systems evolve; however,
          updates are treated as governance changes and are documented through revision dates.
        </p>
      </section>

      <section aria-labelledby="ew-communication" className="mt-5">
        <h2 id="ew-communication" className="text-base font-heading font-semibold text-foreground mb-2">
          Communication standards
        </h2>
        <p className="text-foreground leading-relaxed">
          Communication with authors is expected to be factual and procedural. Editorial correspondence should avoid
          promotional language and should be limited to matters relevant to processing and decision-making.
        </p>
        <p className="text-foreground leading-relaxed">
          Where delays occur, authors may be informed. The organisation does not treat speed as a substitute for quality.
        </p>
      </section>
    </PolicyLayout>
  );
}
