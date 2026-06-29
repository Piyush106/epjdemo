import type { Metadata } from "next";
import Editorial from "@/views/Editorial";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: 'Editorial Board',
  description: 'The editorial advisory board of EP Journals Group, with verifiable scholarly profiles.',
  path: "/editorial",
});

export default function Page() {
  return <Editorial />;
}
