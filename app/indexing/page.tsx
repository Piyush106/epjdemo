import type { Metadata } from "next";
import Indexing from "@/views/Indexing";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: 'Indexing',
  description: 'Where EP Journals Group articles are discoverable, including Crossref DOIs and Google Scholar. Indexing claims are subject to verification by the respective agencies.',
  path: "/indexing",
});

export default function Page() {
  return <Indexing />;
}
