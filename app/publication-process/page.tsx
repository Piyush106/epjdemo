import type { Metadata } from "next";
import PublicationProcess from "@/views/PublicationProcess";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: 'Publication Process',
  description: 'How submissions move through double-blind peer review to publication at EP Journals Group.',
  path: "/publication-process",
});

export default function Page() {
  return <PublicationProcess />;
}
