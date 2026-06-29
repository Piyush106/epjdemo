import type { Metadata } from "next";
import DynamicContentPage from "@/views/DynamicContentPage";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: 'Resources',
  description: 'Author and reader resources from EP Journals Group.',
});

export default function Page() {
  return <DynamicContentPage category='user-focused' />;
}
