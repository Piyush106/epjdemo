import type { Metadata } from "next";
import Articles from "@/views/Articles";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: 'Articles',
  description: 'Recently published peer-reviewed articles across the EP Journals Group portfolio.',
  path: "/articles",
});

export default function Page() {
  return <Articles />;
}
