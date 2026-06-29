import type { Metadata } from "next";
import Admin from "@/views/Admin";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: 'Admin',
  description: 'Editorial administration.',
  path: "/admin",
  noindex: true,
});

export default function Page() {
  return <Admin />;
}
