import type { Metadata } from "next";
import PolicyLayout from "@/components/PolicyLayout";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Author Responsibilities",
  description: "Policy outlining author duties relating to originality, disclosures, ethical approvals, and accuracy of reporting.",
  path: "/policies/author-responsibilities",
});

export default function Page() {
  return (
    <PolicyLayout
      title="Author Responsibilities"
      subtitle="Policy outlining author duties relating to originality, disclosures, ethical approvals, and accuracy of reporting."
      lastRevised="January 2026"
      policyKey="author-responsibilities"
    >
      <section aria-labelledby="ar-originality">
        <h2 id="ar-originality" className="text-base font-heading font-semibold text-foreground mb-2">
          Originality and submission conduct
        </h2>
        <p className="text-foreground leading-relaxed">
          Authors are expected to submit original work that is not under consideration elsewhere. Duplicate submission is
          treated as a breach of publication ethics. Where overlapping submissions exist, authors must disclose the overlap
          and provide relevant documentation.
        </p>
        <p className="text-foreground leading-relaxed">
          Authors should ensure that the manuscript accurately represents the work conducted. Where the work builds on prior
          publications, prior work should be cited and the novel contribution should be stated.
        </p>
      </section>

      <section aria-labelledby="ar-authorship" className="mt-5">
        <h2 id="ar-authorship" className="text-base font-heading font-semibold text-foreground mb-2">
          Authorship and contributions
        </h2>
        <p className="text-foreground leading-relaxed">
          The author list should reflect substantive intellectual contribution. All listed authors should approve the final
          manuscript and agree to submission. Any changes to authorship after submission require a documented explanation and
          acknowledgement from all authors.
        </p>
        <p className="text-foreground leading-relaxed">
          Corresponding authors are expected to coordinate communication with the editorial office and to ensure that
          co-authors receive relevant information.
        </p>
      </section>

      <section aria-labelledby="ar-ethics" className="mt-5">
        <h2 id="ar-ethics" className="text-base font-heading font-semibold text-foreground mb-2">
          Ethics approvals and consent
        </h2>
        <p className="text-foreground leading-relaxed">
          Where research involves human participants, animals, sensitive data, or regulated materials, authors must obtain
          appropriate approvals and provide relevant statements in the manuscript. Where informed consent is required,
          authors should confirm that consent was obtained.
        </p>
        <p className="text-foreground leading-relaxed">
          Where approvals cannot be obtained due to jurisdictional constraints, authors must provide an explanation. The
          organisation may require additional safeguards.
        </p>
      </section>

      <section aria-labelledby="ar-disclosures" className="mt-5">
        <h2 id="ar-disclosures" className="text-base font-heading font-semibold text-foreground mb-2">
          Disclosures and transparency
        </h2>
        <p className="text-foreground leading-relaxed">
          Authors should disclose conflicts of interest, funding sources, and any relevant relationships that may reasonably
          be perceived as influencing the work. Disclosures are treated as scholarly metadata.
        </p>
        <p className="text-foreground leading-relaxed">
          Where errors are discovered after publication, authors are expected to cooperate with correction or retraction
          procedures. Because the portfolio is published monthly, timely cooperation supports timely correction of the
          record.
        </p>
      </section>
    </PolicyLayout>
  );
}
