"use client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import InstitutionalSidebar from "@/components/InstitutionalSidebar";
import MetaTags from "@/components/MetaTags";
import { Separator } from "@/components/ui/separator";
import RelatedLinks, { type RelatedLink } from "@/components/guides/RelatedLinks";
import type { ReactNode } from "react";

interface GuidePageProps {
  title: string;
  metaTitle?: string;
  metaDescription: string;
  subtitle?: string;
  lastUpdated: string;
  category?: string;
  relatedLinks: RelatedLink[];
  children: ReactNode;
}

const GuidePage = ({
  title,
  metaTitle,
  metaDescription,
  subtitle,
  lastUpdated,
  category = "Guide",
  relatedLinks,
  children,
}: GuidePageProps) => {
  return (
    <div className="min-h-screen bg-background">
      <MetaTags title={metaTitle ?? `${title} | EP Journals Group`} description={metaDescription} />
      <Header />

      <section className="py-6 bg-secondary border-b border-border">
        <div className="container mx-auto px-4">
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1">
            Knowledge Centre · {category}
          </p>
          <h1 className="text-xl font-heading font-semibold text-foreground mb-1">{title}</h1>
          {subtitle ? (
            <p className="text-muted-foreground text-sm leading-relaxed max-w-4xl">{subtitle}</p>
          ) : null}
        </div>
      </section>

      <section className="py-8 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-[1fr_340px] gap-8">
            <main className="min-w-0">
              <div className="prose-academic text-sm">
                <p className="text-xs text-muted-foreground mb-4">
                  <strong>Last updated:</strong> {lastUpdated} · <strong>Audience:</strong> Authors, students,
                  early-career researchers · <strong>Reading level:</strong> Introductory
                </p>

                <Separator className="my-6" />

                {children}

                <Separator className="my-6" />

                <RelatedLinks links={relatedLinks} />

                <Separator className="my-6" />

                <section aria-labelledby="guide-enquiries">
                  <h2 id="guide-enquiries" className="text-base font-heading font-semibold text-foreground mb-2">
                    Editorial enquiries
                  </h2>
                  <p className="text-foreground leading-relaxed">
                    Questions about this guide or about preparing a manuscript for submission may be directed to the
                    editorial office. Where a query relates to a specific journal in the portfolio, please indicate the
                    journal abbreviation in your message.
                  </p>
                  <p className="text-muted-foreground text-xs">
                    Email:{" "}
                    <a className="text-primary hover:underline" href="mailto:editor@ep-journals.org">
                      editor@ep-journals.org
                    </a>
                  </p>
                </section>
              </div>
            </main>

            <InstitutionalSidebar variant="authors" />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default GuidePage;
