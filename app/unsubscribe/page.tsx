import type { Metadata } from "next";
import Unsubscribe from "@/views/Unsubscribe";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: 'Unsubscribe',
  description: 'Manage your email subscription preferences.',
  path: "/unsubscribe",
  noindex: true,
});

export default function Page() {
  return <Unsubscribe />;
}
