import type { Metadata } from "next";
import Editorial from "@/views/Editorial";
import JsonLd from "@/components/JsonLd";
import { buildMetadata, buildBreadcrumbLd, SITE } from "@/lib/seo";
import { getEditorialBoardMembers, type BoardMemberRow } from "@/lib/data";
import { EDITORIAL_BOARD } from "@/lib/editorialBoard";

// ISR + on-demand revalidation: the admin API calls revalidatePath('/editorial')
// after any board change, so edits appear immediately without a redeploy.
export const revalidate = 3600;

export const metadata: Metadata = buildMetadata({
  title: 'Editorial Board',
  description: 'The international editorial advisory board of EP Journals Group — scholars across engineering, natural sciences, social sciences, economics, and management, with verifiable ORCID, Scopus, and ResearcherID profiles.',
  path: "/editorial",
});

// Fallback to the seed list only if the DB is unreachable, so the page is never
// empty. In normal operation the board comes from editorial_board_members.
function fallbackMembers(): BoardMemberRow[] {
  return EDITORIAL_BOARD.map((m, i) => ({
    id: `seed-${i}`,
    name: m.name,
    credentials: m.credentials,
    affiliation: m.affiliation,
    orcid: m.orcid ?? null,
    scopus_id: m.scopusId ?? null,
    wos_id: m.wos ?? null,
    sinta_id: m.sinta ?? null,
    display_order: i + 1,
    visible: true,
  }));
}

export default async function Page() {
  let members: BoardMemberRow[] = [];
  try { members = await getEditorialBoardMembers(); } catch { members = []; }
  if (!members.length) members = fallbackMembers();

  // Server-rendered so members + scholarly identifiers are in the initial HTML —
  // an E-E-A-T / entity-authority signal for search and AI engines.
  const boardLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "EP Journals Group Editorial Board",
    description:
      "International editorial advisory board across engineering, natural sciences, social sciences, economics, and management.",
    url: `${SITE.origin}/editorial`,
    numberOfItems: members.length,
    itemListElement: members.map((m, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "Person",
        name: m.name,
        ...(m.credentials ? { description: m.credentials } : {}),
        ...(m.affiliation ? { affiliation: { "@type": "Organization", name: m.affiliation } } : {}),
        ...(() => {
          const sameAs = [
            m.orcid ? `https://orcid.org/${m.orcid}` : null,
            m.scopus_id ? `https://www.scopus.com/authid/detail.uri?authorId=${m.scopus_id}` : null,
          ].filter(Boolean);
          return sameAs.length ? { sameAs } : {};
        })(),
        memberOf: { "@type": "Organization", "@id": `${SITE.origin}/#organization` },
      },
    })),
  };

  const breadcrumbLd = buildBreadcrumbLd([
    { name: "Home", path: "" },
    { name: "Editorial Board", path: "/editorial" },
  ]);
  return (
    <>
      <JsonLd data={boardLd} />
      <JsonLd data={breadcrumbLd} />
      <Editorial members={members} />
    </>
  );
}
