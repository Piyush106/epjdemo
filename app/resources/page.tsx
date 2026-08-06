import type { Metadata } from "next";
import CategoryIndex from "@/views/CategoryIndex";
import JsonLd from "@/components/JsonLd";
import { buildMetadata, buildCollectionPageLd, buildBreadcrumbLd, SITE } from "@/lib/seo";
import { getContentPageList } from "@/lib/data";

export const revalidate = 3600;

export const metadata: Metadata = buildMetadata({
  title: "Resources",
  description:
    "Audience-focused resources from EP Journals Group for students, early-career researchers, and first-time authors preparing to publish their work in open access journals.",
  path: "/resources",
});

export default async function Page() {
  let pages: Awaited<ReturnType<typeof getContentPageList>> = [];
  try { pages = await getContentPageList("user-focused"); } catch { pages = []; }

  const collectionLd = buildCollectionPageLd({
    name: "Resources",
    description:
      "Audience-focused resources for students, early-career researchers, and first-time authors preparing to publish their work.",
    path: "/resources",
    items: pages.map((p) => ({
      name: p.title,
      description: p.summary ?? p.subtitle,
      url: `${SITE.origin}/resources/${p.slug}`,
    })),
  });
  const breadcrumbLd = buildBreadcrumbLd([
    { name: "Home", path: "" },
    { name: "Resources", path: "/resources" },
  ]);

  return (
    <>
      <JsonLd data={collectionLd} />
      <JsonLd data={breadcrumbLd} />
      <CategoryIndex category="user-focused" initialPages={pages} />
    </>
  );
}
