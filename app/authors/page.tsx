import type { Metadata } from "next";
import Authors from "@/views/Authors";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: 'For Authors',
  description: 'Author guidance for EP Journals Group: submission, peer review, article processing, licensing, and publication timelines.',
  path: "/authors",
});

export default function Page() {
  return <Authors />;
}
