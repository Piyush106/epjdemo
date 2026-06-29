import type { Metadata } from "next";
import PolicyLayout from "@/components/PolicyLayout";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Corrections & Retractions",
  description: "Policy governing correction of the scholarly record, including errata, corrigenda, expressions of concern, and retractions.",
  path: "/policies/corrections-retractions",
});

export default function Page() {
  return (
    <PolicyLayout
      title="Corrections & Retractions"
      subtitle="Policy governing correction of the scholarly record, including errata, corrigenda, expressions of concern, and retractions."
      lastRevised="January 2026"
      policyKey="corrections-retractions"
    >
      <section aria-labelledby="cr-purpose">
        <h2 id="cr-purpose" className="text-base font-heading font-semibold text-foreground mb-2">
          Purpose
        </h2>
        <p className="text-foreground leading-relaxed">
          EP Journals Group treats correction of the scholarly record as a continuing responsibility. Where published content
          is found to contain substantive error or to be unreliable, the organisation may publish formal notices. The monthly
          publication frequency supports timely issuance of notices once documentation is complete.
        </p>
        <p className="text-foreground leading-relaxed">
          Corrective actions are implemented with attention to transparency and procedural fairness. Notices are linked to
          the original publication and are designed to be discoverable.
        </p>
      </section>

      <section aria-labelledby="cr-corrections" className="mt-5">
        <h2 id="cr-corrections" className="text-base font-heading font-semibold text-foreground mb-2">
          Corrections
        </h2>
        <p className="text-foreground leading-relaxed">
          Corrections may be issued where errors are identified that do not invalidate the central conclusions of the work.
          Examples include typographical errors that change meaning, errors in author affiliation, or mistakes in a figure
          that can be corrected without undermining the study.
        </p>
        <p className="text-foreground leading-relaxed">
          Where an error is limited, a correction notice may be published. Where the article requires substantial
          amendment, the organisation may apply additional measures.
        </p>
      </section>

      <section aria-labelledby="cr-eoc" className="mt-5">
        <h2 id="cr-eoc" className="text-base font-heading font-semibold text-foreground mb-2">
          Expressions of concern
        </h2>
        <p className="text-foreground leading-relaxed">
          An expression of concern may be published where credible concerns exist regarding the integrity of a publication
          and an investigation is ongoing. The purpose is to inform readers while preserving procedural fairness.
        </p>
        <p className="text-foreground leading-relaxed">
          Expressions of concern may be updated or replaced by a correction or retraction once an investigation is complete.
        </p>
      </section>

      <section aria-labelledby="cr-retractions" className="mt-5">
        <h2 id="cr-retractions" className="text-base font-heading font-semibold text-foreground mb-2">
          Retractions
        </h2>
        <p className="text-foreground leading-relaxed">
          Retractions may be issued where findings are unreliable due to misconduct or honest error, where plagiarism or
          redundant publication is identified, or where research ethics violations materially affect the work.
        </p>
        <p className="text-foreground leading-relaxed">
          Retraction notices state the reason for retraction in a factual manner. The organisation seeks author input where
          possible; however, author agreement is not required for retraction.
        </p>
      </section>

      <section aria-labelledby="cr-requests" className="mt-5">
        <h2 id="cr-requests" className="text-base font-heading font-semibold text-foreground mb-2">
          Requests and reporting
        </h2>
        <p className="text-foreground leading-relaxed">
          Requests for correction or retraction may be submitted by authors, readers, reviewers, editors, or institutions.
          Submissions should provide specific evidence or documentation. Anonymous reports may be considered where evidence is
          provided.
        </p>
        <p className="text-foreground leading-relaxed">
          The organisation may consult institutions where a formal investigation is required. Outcomes are recorded and may
          be reflected in public notices.
        </p>
      </section>
    </PolicyLayout>
  );
}
