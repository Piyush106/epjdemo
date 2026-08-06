import type { Metadata } from "next";
import CategoryIndex from "@/views/CategoryIndex";
import JsonLd from "@/components/JsonLd";
import { buildMetadata, buildCollectionPageLd, buildBreadcrumbLd, SITE } from "@/lib/seo";
import { getContentPageList } from "@/lib/data";

export const revalidate = 3600;

export const metadata: Metadata = buildMetadata({
  title: "Guides",
  description:
    "Practical guides from EP Journals Group on academic publishing, peer review, manuscript preparation, formatting, and the open access publication process for authors.",
  path: "/guides",
});

export default async function Page() {
  let pages: Awaited<ReturnType<typeof getContentPageList>> = [];
  try { pages = await getContentPageList("guide"); } catch { pages = []; }

  const collectionLd = buildCollectionPageLd({
    name: "Guides",
    description:
      "Educational guides on academic publishing, peer review, manuscript preparation, and the publication process.",
    path: "/guides",
    items: pages.map((p) => ({
      name: p.title,
      description: p.summary ?? p.subtitle,
      url: `${SITE.origin}/guides/${p.slug}`,
    })),
  });
  const breadcrumbLd = buildBreadcrumbLd([
    { name: "Home", path: "" },
    { name: "Guides", path: "/guides" },
  ]);

  return (
    <>
      <JsonLd data={collectionLd} />
      <JsonLd data={breadcrumbLd} />
      <CategoryIndex category="guide" initialPages={pages} />
    </>
  );
}
