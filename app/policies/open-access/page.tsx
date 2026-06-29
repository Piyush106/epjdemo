import type { Metadata } from "next";
import PolicyLayout from "@/components/PolicyLayout";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Open Access Policy",
  description: "Policy describing open access conditions applicable to all EP Journals Group publications.",
  path: "/policies/open-access",
});

export default function Page() {
  return (
    <PolicyLayout
      title="Open Access Policy"
      subtitle="Policy describing open access conditions applicable to all EP Journals Group publications."
      lastRevised="January 2026"
      policyKey="open-access"
    >
      <section aria-labelledby="oa-model">
        <h2 id="oa-model" className="text-base font-heading font-semibold text-foreground mb-2">
          Open access model
        </h2>
        <p className="text-foreground leading-relaxed">
          EP Journals Group publishes open access journals. Articles are made freely available to readers immediately upon
          publication, without subscription barriers. The open access approach is applied across the portfolio on a monthly
          publication schedule.
        </p>
        <p className="text-foreground leading-relaxed">
          The organisation treats open access as a scholarly communication policy and not as a marketing feature. Open access
          improves access for readers and supports dissemination, while the integrity of publication is maintained through
          editorial governance and peer review.
        </p>
      </section>

      <section aria-labelledby="oa-licensing" className="mt-5">
        <h2 id="oa-licensing" className="text-base font-heading font-semibold text-foreground mb-2">
          Licensing
        </h2>
        <p className="text-foreground leading-relaxed">
          Unless otherwise stated by a journal or a specific article, published content is typically distributed under a
          Creative Commons Attribution licence (CC BY 4.0). This permits reuse, adaptation, and redistribution, provided that
          the original work is properly cited.
        </p>
        <p className="text-foreground leading-relaxed">
          Licensing terms are stated on the article and journal pages where applicable. Where third-party material is
          included, authors are responsible for ensuring that permissions are obtained or that reuse is lawful.
        </p>
      </section>

      <section aria-labelledby="oa-reader" className="mt-5">
        <h2 id="oa-reader" className="text-base font-heading font-semibold text-foreground mb-2">
          Reader access and reuse expectations
        </h2>
        <p className="text-foreground leading-relaxed">
          Readers may access and use published material consistent with the applicable licence. Citation should follow
          established scholarly norms. Where reuse could cause confusion regarding the published record, reusers are expected
          to provide clear notice of modifications.
        </p>
        <p className="text-foreground leading-relaxed">
          The organisation expects that open access content will be used responsibly and in a manner consistent with academic
          integrity.
        </p>
      </section>

      <section aria-labelledby="oa-archiving" className="mt-5">
        <h2 id="oa-archiving" className="text-base font-heading font-semibold text-foreground mb-2">
          Preservation and permanence
        </h2>
        <p className="text-foreground leading-relaxed">
          Open access requires durable access. The organisation maintains preservation procedures described in the Archiving
          & Preservation policy, including stable identifiers and redundancy measures.
        </p>
        <p className="text-foreground leading-relaxed">
          Open access does not imply absence of standards. Editorial processes remain rigorous and are applied uniformly.
        </p>
      </section>
    </PolicyLayout>
  );
}
