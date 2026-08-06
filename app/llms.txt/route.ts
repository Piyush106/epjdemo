import { SITE } from "@/lib/seo";
import { getJournals } from "@/lib/data";

// Served at /llms.txt. A curated, token-efficient Markdown map of the site for
// LLMs / AI answer engines (the emerging llms.txt convention). This is additive
// and non-authoritative — robots.txt + sitemap.xml remain the primary controls,
// and Google states llms.txt is not required for its AI features — but it gives
// AI retrievers a clean, high-signal overview of the publisher and its journals.
export const revalidate = 86400; // daily

export async function GET() {
  let journals: Awaited<ReturnType<typeof getJournals>> = [];
  try { journals = await getJournals(); } catch { journals = []; }

  const origin = SITE.origin;

  const journalLines = journals.length
    ? journals
        .map((j) => {
          const issn = [
            j.electronic_issn ? `e-ISSN ${j.electronic_issn}` : null,
            j.print_issn ? `p-ISSN ${j.print_issn}` : null,
          ]
            .filter(Boolean)
            .join(", ");
          const url = `${origin}/journals/${j.abbrev.toLowerCase()}`;
          return `- [${j.title} (${j.abbrev})](${url})${issn ? ` — ${issn}` : ""}${j.scope_short ? `: ${j.scope_short}` : ""}`;
        })
        .join("\n")
    : "- See the journals index for the full list.";

  const body = `# EP Journals Group

> ${SITE.defaultDescription}

EP Journals Group is an open access academic publisher operating six peer-reviewed,
double-blind journals across engineering, economics, management, natural sciences,
social sciences, and education. All articles are published under a Creative Commons
Attribution 4.0 (CC BY 4.0) licence and assigned Crossref DOIs.

## Journals

${journalLines}

## Key pages

- [Journals](${origin}/journals): all six journals with aims & scope, ISSNs, and DOI prefixes.
- [Articles](${origin}/articles): recently published, peer-reviewed open access articles.
- [For Authors](${origin}/authors): author guidelines, manuscript preparation, and submission.
- [Submit a Manuscript](${origin}/submit): submission for peer review.
- [Editorial Board](${origin}/editorial): the international editorial advisory board.
- [Indexing](${origin}/indexing): discovery and DOI coverage (subject to agency verification).
- [Publication Process](${origin}/publication-process): from submission to publication.
- [About](${origin}/about): the publisher and its governance framework.
- [Contact](${origin}/contact): editorial office contact.

## Policies & governance

- [Policies index](${origin}/policies)
- [Publication Ethics](${origin}/policies/publication-ethics)
- [Peer Review Process](${origin}/policies/peer-review-process)
- [Open Access](${origin}/policies/open-access)
- [Copyright & Licensing](${origin}/policies/copyright-licensing)
- [Corrections & Retractions](${origin}/policies/corrections-retractions)
- [Research Integrity](${origin}/policies/research-integrity)

## Knowledge Centre

- [Guides](${origin}/guides)
- [Comparisons](${origin}/comparisons)
- [Publishing](${origin}/publishing)
- [Resources](${origin}/resources)

## Notes

- Canonical article pages on this site link to each article's version of record (DOI/PDF) on the journal's site.
- Sitemap: ${origin}/sitemap.xml
- Contact: ${SITE.email}
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
