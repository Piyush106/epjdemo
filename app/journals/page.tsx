import type { Metadata } from "next";
import Journals from "@/views/Journals";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: 'Journals',
  description: 'The six peer-reviewed open access journals published by EP Journals Group, with scope, ISSNs, and submission details.',
  path: "/journals",
});

export default function Page() {
  return <Journals />;
}
