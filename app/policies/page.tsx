import Link from "next/link";
import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { POLICIES } from "@/components/PolicyLayout";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Policies & Governance",
  description:
    "The complete policy and governance framework of EP Journals Group: publication ethics, peer review, open access, copyright, corrections, archiving, and more.",
  path: "/policies",
});

export default function PoliciesIndex() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <section className="py-6 bg-secondary border-b border-border">
        <div className="container mx-auto px-4">
          <h1 className="text-xl font-heading font-semibold text-foreground mb-1">Policies &amp; Governance</h1>
          <p className="text-muted-foreground text-sm max-w-4xl">
            The formal policy framework applied across every EP Journals Group journal. Each policy is maintained as a
            single canonical document and reviewed on a continuing basis.
          </p>
        </div>
      </section>
      <section className="container mx-auto px-4 py-8">
        <div className="grid gap-3 md:grid-cols-2">
          {POLICIES.map((p) => (
            <Link
              key={p.route}
              href={`/policies/${p.route}`}
              className="block border border-border bg-card p-4 rounded-sm hover:shadow-card transition-shadow"
            >
              <span className="font-heading font-semibold text-foreground">{p.label}</span>
            </Link>
          ))}
        </div>
      </section>
      <Footer />
    </div>
  );
}
