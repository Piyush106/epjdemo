import type { Metadata } from "next";
import CategoryIndex from "@/views/CategoryIndex";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: 'Comparisons',
  description: 'Comparisons to help researchers make informed publishing decisions.',
  path: "/comparisons",
});

export default function Page() {
  return <CategoryIndex category='comparison' />;
}
