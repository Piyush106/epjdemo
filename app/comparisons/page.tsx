import type { Metadata } from "next";
import CategoryIndex from "@/views/CategoryIndex";
import JsonLd from "@/components/JsonLd";
import { buildMetadata, buildCollectionPageLd, buildBreadcrumbLd, SITE } from "@/lib/seo";
import { getContentPageList } from "@/lib/data";

export const revalidate = 3600;

export const metadata: Metadata = buildMetadata({
  title: "Comparisons",
  description:
    "Side-by-side comparisons from EP Journals Group of publishing options, journal types, licensing models, and editorial approaches to help researchers make informed publishing decisions.",
  path: "/comparisons",
});

export default async function Page() {
  let pages: Awaited<ReturnType<typeof getContentPageList>> = [];
  try { pages = await getContentPageList("comparison"); } catch { pages = []; }

  const collectionLd = buildCollectionPageLd({
    name: "Comparisons",
    description:
      "Side-by-side comparisons of publishing options, journal types, licensing models, and editorial approaches.",
    path: "/comparisons",
    items: pages.map((p) => ({
      name: p.title,
      description: p.summary ?? p.subtitle,
      url: `${SITE.origin}/comparisons/${p.slug}`,
    })),
  });
  const breadcrumbLd = buildBreadcrumbLd([
    { name: "Home", path: "" },
    { name: "Comparisons", path: "/comparisons" },
  ]);

  return (
    <>
      <JsonLd data={collectionLd} />
      <JsonLd data={breadcrumbLd} />
      <CategoryIndex category="comparison" initialPages={pages} />
    </>
  );
}
