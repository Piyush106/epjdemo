import type { Metadata } from "next";
import SubmitManuscript from "@/views/SubmitManuscript";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: 'Submit a Manuscript',
  description: 'Submit your manuscript to an EP Journals Group journal.',
  path: "/submit",
});

export default function Page() {
  return <SubmitManuscript />;
}
