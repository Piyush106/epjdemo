import type { Metadata } from "next";
import CategoryIndex from "@/views/CategoryIndex";
import JsonLd from "@/components/JsonLd";
import { buildMetadata, buildCollectionPageLd, buildBreadcrumbLd, SITE } from "@/lib/seo";
import { getContentPageList } from "@/lib/data";

export const revalidate = 3600;

export const metadata: Metadata = buildMetadata({
  title: "Publishing",
  description:
    "Field-specific publishing references from EP Journals Group covering manuscript expectations, scope alignment, and submission considerations across engineering, economics, management, natural and social sciences.",
  path: "/publishing",
});

export default async function Page() {
  let pages: Awaited<ReturnType<typeof getContentPageList>> = [];
  try { pages = await getContentPageList("publishing"); } catch { pages = []; }

  const collectionLd = buildCollectionPageLd({
    name: "Publishing",
    description:
      "Field-specific publishing references covering manuscript expectations, scope alignment, and submission considerations across disciplines.",
    path: "/publishing",
    items: pages.map((p) => ({
      name: p.title,
      description: p.summary ?? p.subtitle,
      url: `${SITE.origin}/publishing/${p.slug}`,
    })),
  });
  const breadcrumbLd = buildBreadcrumbLd([
    { name: "Home", path: "" },
    { name: "Publishing", path: "/publishing" },
  ]);

  return (
    <>
      <JsonLd data={collectionLd} />
      <JsonLd data={breadcrumbLd} />
      <CategoryIndex category="publishing" initialPages={pages} />
    </>
  );
}
