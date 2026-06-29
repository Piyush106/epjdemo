"use client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import InstitutionalSidebar from "@/components/InstitutionalSidebar";
import MetaTags from "@/components/MetaTags";
import SchemaOrg from "@/components/SchemaOrg";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2 } from "lucide-react";
import { useJournals } from "@/hooks/useJournals";

const indexingPlatforms = [
  "Google Scholar",
  "Crossref (DOI Registered)",
  "ORCID Integration",
  "Zenodo",
  "OpenAIRE",
  "Index Copernicus",
  "Scilit",
];

const visibilityPlatforms = ["Academia.edu", "LinkedIn"];

// Display the journal_doi from the DB; if not set, fall back to the publisher's
// expected pattern based on the GJEFM-confirmed prefix 10.65150.
const journalDoiDisplay = (j: { journal_doi: string | null; abbrev: string }) =>
  j.journal_doi || `10.65150/EP-${j.abbrev.toLowerCase()}`;

const Indexing = () => {
  const { data: journals = [] } = useJournals();
  return (
    <div className="min-h-screen bg-background">
      <MetaTags
        title="Indexing & Abstracting | EP Journals"
        description="View indexing and abstracting information for EP Journals across academic databases and research platforms."
      />
      <SchemaOrg type="WebPage" data={{"name":"Indexing & Abstracting | EP Journals","description":"View indexing and abstracting information for EP Journals across academic databases and research platforms.","url":"https://www.ep-journals.org/indexing","inLanguage":"en"}} />
      <Header />

      <section className="py-6 bg-ep-cream border-b border-border">
        <div className="container mx-auto px-4">
          <h1 className="text-xl font-heading font-semibold text-foreground mb-1">
            Indexing & Abstracting
          </h1>
          <p className="text-muted-foreground text-sm leading-relaxed max-w-3xl">
            A transparent overview of indexing, abstracting, and visibility coverage for all journals published by EP Journals Group.
          </p>
        </div>
      </section>

      <main className="py-8 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-[1fr_340px] gap-8">
            <div className="min-w-0">

              {/* Common Indexing Platforms */}
              <div className="mb-6">
                <h2 className="text-base font-heading font-semibold text-foreground mb-3 border-b border-border pb-2">
                  Common Indexing & Discovery Platforms
                </h2>
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                  All journals published by EP Journals Group are indexed and abstracted in the following academic platforms:
                </p>
                <div className="grid sm:grid-cols-2 gap-x-6 gap-y-1.5 mb-4">
                  {indexingPlatforms.map((p) => (
                    <div key={p} className="flex items-center gap-2 text-sm text-foreground">
                      <CheckCircle2 className="h-4 w-4 text-ep-teal shrink-0" />
                      {p}
                    </div>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mb-2 font-medium">
                  Visibility & Dissemination Platforms
                </p>
                <div className="grid sm:grid-cols-2 gap-x-6 gap-y-1.5">
                  {visibilityPlatforms.map((p) => (
                    <div key={p} className="flex items-center gap-2 text-sm text-foreground">
                      <CheckCircle2 className="h-4 w-4 text-muted-foreground shrink-0" />
                      {p}
                    </div>
                  ))}
                </div>
              </div>

              <Separator className="my-6" />

              {/* Journal-wise Table */}
              <div className="mb-6">
                <h2 className="text-base font-heading font-semibold text-foreground mb-3 border-b border-border pb-2">
                  Journal-Wise Indexing Overview
                </h2>
                <div className="border border-border bg-card overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="text-xs font-semibold text-foreground">Journal</TableHead>
                        <TableHead className="text-xs font-semibold text-foreground">Print ISSN</TableHead>
                        <TableHead className="text-xs font-semibold text-foreground">Online ISSN</TableHead>
                        <TableHead className="text-xs font-semibold text-foreground">DOI Prefix</TableHead>
                        <TableHead className="text-xs font-semibold text-foreground text-center">Access</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {journals.map((j) => (
                        <TableRow key={j.abbrev}>
                          <TableCell className="text-xs">
                            <span className="font-medium text-foreground">{j.abbrev}</span>
                            <span className="block text-muted-foreground mt-0.5 leading-tight">{j.title}</span>
                          </TableCell>
                          <TableCell className="text-xs font-mono">{j.print_issn || "—"}</TableCell>
                          <TableCell className="text-xs font-mono">{j.electronic_issn || "—"}</TableCell>
                          <TableCell className="text-xs font-mono">{journalDoiDisplay(j)}</TableCell>
                          <TableCell className="text-center">
                            <Badge variant="outline" className="text-xs font-normal bg-ep-teal/15 text-ep-teal border-ep-teal/30">
                              {j.access_model || "Open Access"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              <Separator className="my-6" />

              {/* Per-journal indexing detail cards */}
              <div className="mb-6">
                <h2 className="text-base font-heading font-semibold text-foreground mb-3 border-b border-border pb-2">
                  Detailed Indexing by Journal
                </h2>
                <div className="space-y-4">
                  {journals.map((journal) => (
                    <div key={journal.abbrev} className="border border-border bg-card">
                      <div className="p-4 bg-secondary border-b border-border">
                        <h3 className="text-sm font-heading font-semibold text-foreground">
                          {journal.title}
                          <span className="text-muted-foreground font-mono ml-2">({journal.abbrev})</span>
                        </h3>
                        <div className="text-xs text-muted-foreground mt-1 flex flex-wrap gap-x-4 gap-y-0.5">
                          {journal.print_issn && <span>Print ISSN: {journal.print_issn}</span>}
                          {journal.electronic_issn && <span>Online ISSN: {journal.electronic_issn}</span>}
                          <span>DOI: {journalDoiDisplay(journal)}</span>
                        </div>
                      </div>
                      <div className="p-4">
                        <p className="text-xs font-medium text-foreground mb-2">Indexing & Abstracting</p>
                        <div className="grid sm:grid-cols-2 gap-x-6 gap-y-1 mb-3">
                          {indexingPlatforms.map((p) => (
                            <div key={p} className="flex items-center gap-2 text-xs text-foreground">
                              <CheckCircle2 className="h-3.5 w-3.5 text-ep-teal shrink-0" />
                              {p}
                            </div>
                          ))}
                        </div>
                        <p className="text-xs font-medium text-muted-foreground mb-2">Visibility & Dissemination</p>
                        <div className="grid sm:grid-cols-2 gap-x-6 gap-y-1">
                          {visibilityPlatforms.map((p) => (
                            <div key={p} className="flex items-center gap-2 text-xs text-muted-foreground">
                              <CheckCircle2 className="h-3.5 w-3.5 text-muted-foreground/60 shrink-0" />
                              {p}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Separator className="my-6" />

              {/* Disclaimer */}
              <div className="mb-6">
                <h2 className="text-base font-heading font-semibold text-foreground mb-3 border-b border-border pb-2">
                  Disclaimer
                </h2>
                <div className="prose-academic text-sm text-muted-foreground space-y-2">
                  <p>
                    Indexing and database listings are subject to the policies and evaluation criteria of the respective agencies. EP Journals Group does not guarantee inclusion in any specific index or database. The information presented on this page reflects the publisher's best understanding of current status and is updated periodically.
                  </p>
                  <p>
                    Researchers and institutions are advised to verify indexing claims independently through the relevant database or agency websites.
                  </p>
                </div>
              </div>

              <div className="p-4 bg-muted border border-border text-xs text-muted-foreground">
                <p><strong>Last updated:</strong> April 2026</p>
                <p><strong>Next scheduled review:</strong> July 2026</p>
              </div>
            </div>

            <InstitutionalSidebar variant="homepage" />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Indexing;
