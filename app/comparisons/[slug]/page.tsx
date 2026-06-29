import type { Metadata } from "next";
import DynamicContentPage from "@/views/DynamicContentPage";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: 'Comparisons',
  description: 'Comparisons to help researchers make informed publishing decisions.',
});

export default function Page() {
  return <DynamicContentPage category='comparison' />;
}
