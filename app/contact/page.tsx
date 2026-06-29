import type { Metadata } from "next";
import Contact from "@/views/Contact";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: 'Contact',
  description: 'Contact the EP Journals Group editorial office.',
  path: "/contact",
});

export default function Page() {
  return <Contact />;
}
