import type { Metadata } from "next";
import PolicyLayout from "@/components/PolicyLayout";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Copyright & Licensing",
  description: "Policy describing copyright ownership, licences granted to the publisher, and reuse conditions.",
  path: "/policies/copyright-licensing",
});

export default function Page() {
  return (
    <PolicyLayout
      title="Copyright & Licensing"
      subtitle="Policy describing copyright ownership, licences granted to the publisher, and reuse conditions."
      lastRevised="January 2026"
      policyKey="copyright-licensing"
    >
      <section aria-labelledby="cl-ownership">
        <h2 id="cl-ownership" className="text-base font-heading font-semibold text-foreground mb-2">
          Copyright ownership
        </h2>
        <p className="text-foreground leading-relaxed">
          Authors generally retain copyright in their work. Submission and acceptance constitute a grant of a non-exclusive
          right to EP Journals Group to publish, distribute, and archive the work as part of the scholarly record.
        </p>
        <p className="text-foreground leading-relaxed">
          Where co-authors exist, authors are expected to ensure that all contributors consent to publication and to the
          licensing terms. Where institutional or funder agreements apply, authors are expected to disclose relevant
          constraints.
        </p>
      </section>

      <section aria-labelledby="cl-licence" className="mt-5">
        <h2 id="cl-licence" className="text-base font-heading font-semibold text-foreground mb-2">
          Licensing for open access distribution
        </h2>
        <p className="text-foreground leading-relaxed">
          Open access distribution is typically implemented via Creative Commons licensing. Unless otherwise stated, CC BY
          4.0 is applied, permitting broad reuse subject to attribution. Alternative licensing may be used where legally
          required or where a journal states a variation.
        </p>
        <p className="text-foreground leading-relaxed">
          The applicable licence is displayed on journal and article pages. Readers and reusers are expected to consult the
          licence terms prior to reuse.
        </p>
      </section>

      <section aria-labelledby="cl-third" className="mt-5">
        <h2 id="cl-third" className="text-base font-heading font-semibold text-foreground mb-2">
          Third-party materials
        </h2>
        <p className="text-foreground leading-relaxed">
          Authors are responsible for obtaining permissions to reproduce copyrighted third-party materials where fair use or
          equivalent exceptions do not apply. Permissions must permit distribution under the article’s licence terms.
        </p>
        <p className="text-foreground leading-relaxed">
          Where third-party content cannot be licensed for open access distribution, authors should either remove it or
          replace it with an appropriate alternative.
        </p>
      </section>

      <section aria-labelledby="cl-self" className="mt-5">
        <h2 id="cl-self" className="text-base font-heading font-semibold text-foreground mb-2">
          Self-archiving and repository deposit
        </h2>
        <p className="text-foreground leading-relaxed">
          Authors are generally permitted to deposit their work in institutional repositories and personal academic pages.
          Where a DOI is assigned, authors are encouraged to cite the final published version. Repository deposit supports
          long-term access and is consistent with the monthly publication cycle.
        </p>
        <p className="text-foreground leading-relaxed">
          Where a repository requires additional metadata, authors should ensure accuracy of journal title, ISSN, and the
          article identifier.
        </p>
      </section>
    </PolicyLayout>
  );
}
