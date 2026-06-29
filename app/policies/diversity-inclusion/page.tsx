import type { Metadata } from "next";
import PolicyLayout from "@/components/PolicyLayout";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Diversity & Inclusion Statement",
  description: "Publisher-level statement regarding inclusive editorial practice and non-discrimination.",
  path: "/policies/diversity-inclusion",
});

export default function Page() {
  return (
    <PolicyLayout
      title="Diversity & Inclusion Statement"
      subtitle="Publisher-level statement regarding inclusive editorial practice and non-discrimination."
      lastRevised="January 2026"
      policyKey="diversity-inclusion"
    >
      <section aria-labelledby="di-principle">
        <h2 id="di-principle" className="text-base font-heading font-semibold text-foreground mb-2">
          Statement of principle
        </h2>
        <p className="text-foreground leading-relaxed">
          EP Journals Group recognises that scholarly publishing serves an international academic community. The organisation
          seeks to maintain editorial practices that are fair, inclusive, and consistent with academic standards. Editorial
          decisions are based on scholarly merit and alignment with scope.
        </p>
        <p className="text-foreground leading-relaxed">
          The organisation does not discriminate on the basis of nationality, race, gender, religion, disability, or other
          personal characteristics. This statement applies to authors, reviewers, and editorial participants.
        </p>
      </section>

      <section aria-labelledby="di-review" className="mt-5">
        <h2 id="di-review" className="text-base font-heading font-semibold text-foreground mb-2">
          Inclusive peer review practice
        </h2>
        <p className="text-foreground leading-relaxed">
          The portfolio applies double-blind peer review as a default model. Double-blind review is used to reduce the risk
          of bias in evaluation. Reviewers are expected to focus comments on the work and evidence presented.
        </p>
        <p className="text-foreground leading-relaxed">
          The organisation seeks to maintain reviewer pools that reflect disciplinary breadth and geographic diversity, while
          prioritising subject expertise.
        </p>
      </section>

      <section aria-labelledby="di-language" className="mt-5">
        <h2 id="di-language" className="text-base font-heading font-semibold text-foreground mb-2">
          Language and accessibility
        </h2>
        <p className="text-foreground leading-relaxed">
          The organisation recognises that many authors publish in a second language. Where language issues exist but the
          scholarly contribution is substantive, editorial guidance may focus on improving clarity rather than excluding the
          work solely due to language limitations.
        </p>
        <p className="text-foreground leading-relaxed">
          This principle does not reduce requirements for accuracy and integrity. It is an editorial approach intended to
          preserve fairness.
        </p>
      </section>

      <section aria-labelledby="di-behaviour" className="mt-5">
        <h2 id="di-behaviour" className="text-base font-heading font-semibold text-foreground mb-2">
          Professional conduct
        </h2>
        <p className="text-foreground leading-relaxed">
          Harassment, discriminatory language, or demeaning communication is not accepted. The organisation may restrict
          participation where conduct undermines the integrity of scholarly exchange.
        </p>
        <p className="text-foreground leading-relaxed">
          Reports of conduct concerns are handled as administrative matters and may result in removal from reviewer pools or
          other measures.
        </p>
      </section>
    </PolicyLayout>
  );
}
