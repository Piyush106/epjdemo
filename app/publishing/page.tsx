import type { Metadata } from "next";
import CategoryIndex from "@/views/CategoryIndex";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: 'Publishing',
  description: 'Resources on the academic publishing process from EP Journals Group.',
  path: "/publishing",
});

export default function Page() {
  return <CategoryIndex category='publishing' />;
}
