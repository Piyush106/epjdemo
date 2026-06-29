import type { Metadata } from "next";
import PolicyLayout from "@/components/PolicyLayout";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Archiving & Preservation",
  description: "Policy describing preservation measures intended to ensure durable access to the scholarly record.",
  path: "/policies/archiving-preservation",
});

export default function Page() {
  return (
    <PolicyLayout
      title="Archiving & Preservation"
      subtitle="Policy describing preservation measures intended to ensure durable access to the scholarly record."
      lastRevised="January 2026"
      policyKey="archiving-preservation"
    >
      <section aria-labelledby="ap-purpose">
        <h2 id="ap-purpose" className="text-base font-heading font-semibold text-foreground mb-2">
          Preservation purpose
        </h2>
        <p className="text-foreground leading-relaxed">
          EP Journals Group recognises that scholarly publication implies long-term accessibility. Preservation is treated as
          an administrative obligation, not a discretionary technical feature. The portfolio publishes on a monthly schedule,
          and preservation procedures are implemented continuously.
        </p>
        <p className="text-foreground leading-relaxed">
          Preservation measures are designed to maintain stable access, prevent loss, and support citation permanence.
          Preservation does not substitute for integrity safeguards; it supports durable availability of the record.
        </p>
      </section>

      <section aria-labelledby="ap-identifiers" className="mt-5">
        <h2 id="ap-identifiers" className="text-base font-heading font-semibold text-foreground mb-2">
          Persistent identifiers
        </h2>
        <p className="text-foreground leading-relaxed">
          Where applicable, articles are assigned Digital Object Identifiers (DOIs). Identifiers support stable linking,
          citation, and long-term discoverability. Journal-level identifiers (ISSN/e-ISSN) are maintained as part of the
          portfolio metadata.
        </p>
        <p className="text-foreground leading-relaxed">
          Identifiers are treated as an integral part of the publication record and are preserved together with article
          metadata.
        </p>
      </section>

      <section aria-labelledby="ap-backup" className="mt-5">
        <h2 id="ap-backup" className="text-base font-heading font-semibold text-foreground mb-2">
          Redundancy and backups
        </h2>
        <p className="text-foreground leading-relaxed">
          The organisation maintains redundant backups of published content and associated metadata. Backups are retained to
          support recovery in the event of technical failure or data loss. Preservation procedures may evolve as systems are
          updated.
        </p>
        <p className="text-foreground leading-relaxed">
          Readers should treat journal websites as the authoritative source for the current record, while redundancy supports
          long-term access.
        </p>
      </section>

      <section aria-labelledby="ap-repositories" className="mt-5">
        <h2 id="ap-repositories" className="text-base font-heading font-semibold text-foreground mb-2">
          Repository deposit
        </h2>
        <p className="text-foreground leading-relaxed">
          Authors and institutions are encouraged to deposit published articles in institutional repositories where
          appropriate. Repository deposit is treated as complementary to the publisher’s preservation measures.
        </p>
        <p className="text-foreground leading-relaxed">
          Where the final published version is deposited, the organisation recommends inclusion of the DOI and complete
          journal citation details.
        </p>
      </section>
    </PolicyLayout>
  );
}
