import type { Metadata } from "next";
import DynamicContentPage from "@/views/DynamicContentPage";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: 'Guides',
  description: 'Practical guides on scholarly publishing from EP Journals Group.',
});

export default function Page() {
  return <DynamicContentPage category='guide' />;
}
