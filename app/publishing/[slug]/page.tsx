import type { Metadata } from "next";
import DynamicContentPage from "@/views/DynamicContentPage";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: 'Publishing',
  description: 'Resources on the academic publishing process from EP Journals Group.',
});

export default function Page() {
  return <DynamicContentPage category='publishing' />;
}
