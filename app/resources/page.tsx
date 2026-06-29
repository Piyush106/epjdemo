import type { Metadata } from "next";
import CategoryIndex from "@/views/CategoryIndex";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: 'Resources',
  description: 'Author and reader resources from EP Journals Group.',
  path: "/resources",
});

export default function Page() {
  return <CategoryIndex category='user-focused' />;
}
