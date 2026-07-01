"use client";
import { useState } from "react";
import { Check, Copy } from "lucide-react";

interface Props {
  title: string;
  authors: string[];
  journalName: string;
  year: string;
  volume?: string | null;
  issue?: string | null;
  pages?: string | null;
  doi?: string | null;
  url: string; // version-of-record URL
}

// "Last, F., Last, F., & Last, F." style author list for APA.
function apaAuthors(authors: string[]): string {
  if (!authors.length) return "";
  if (authors.length === 1) return authors[0];
  return authors.slice(0, -1).join(", ") + ", & " + authors[authors.length - 1];
}

const ArticleCite = ({ title, authors, journalName, year, volume, issue, pages, doi, url }: Props) => {
  const [copied, setCopied] = useState<string | null>(null);

  const doiUrl = doi ? `https://doi.org/${doi}` : url;
  const vol = volume ? `, ${volume}` : "";
  const iss = issue ? `(${issue})` : "";
  const pp = pages ? `, ${pages}` : "";
  const apa = `${apaAuthors(authors)} (${year}). ${title}. ${journalName}${vol}${iss}${pp}. ${doiUrl}`;

  const bibKey = (authors[0]?.split(/[ ,]/)[0] || "ref").replace(/[^a-zA-Z]/g, "") + year;
  const bibtex = `@article{${bibKey},
  title   = {${title}},
  author  = {${authors.join(" and ")}},
  journal = {${journalName}},
  year    = {${year}},${volume ? `\n  volume  = {${volume}},` : ""}${issue ? `\n  number  = {${issue}},` : ""}${pages ? `\n  pages   = {${pages}},` : ""}${doi ? `\n  doi     = {${doi}},` : ""}
  url     = {${doiUrl}}
}`;

  const copy = async (text: string, which: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(which);
      setTimeout(() => setCopied(null), 2000);
    } catch { /* clipboard unavailable */ }
  };

  const Block = ({ label, text }: { label: string; text: string }) => (
    <div className="border border-border rounded-sm bg-muted/30">
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-border bg-muted/50">
        <span className="text-[11px] font-heading font-semibold uppercase tracking-wide text-muted-foreground">{label}</span>
        <button
          onClick={() => copy(text, label)}
          className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
          aria-label={`Copy ${label} citation`}
        >
          {copied === label ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          {copied === label ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="px-3 py-2 text-xs text-foreground whitespace-pre-wrap break-words font-sans leading-relaxed">{text}</pre>
    </div>
  );

  return (
    <section className="mt-10" aria-labelledby="cite-heading">
      <h2 id="cite-heading" className="font-heading text-lg font-semibold text-foreground mb-3">Cite this article</h2>
      <div className="space-y-3">
        <Block label="APA" text={apa} />
        <Block label="BibTeX" text={bibtex} />
      </div>
    </section>
  );
};

export default ArticleCite;
