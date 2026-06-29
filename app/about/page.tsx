import type { Metadata } from "next";
import About from "@/views/About";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: 'About',
  description: 'EP Journals Group is an open access publisher of six peer-reviewed journals operating under a documented governance framework.',
  path: "/about",
});

export default function Page() {
  return <About />;
}
