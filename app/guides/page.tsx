import type { Metadata } from "next";
import CategoryIndex from "@/views/CategoryIndex";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: 'Guides',
  description: 'Practical guides on scholarly publishing from EP Journals Group.',
  path: "/guides",
});

export default function Page() {
  return <CategoryIndex category='guide' />;
}
