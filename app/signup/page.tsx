import type { Metadata } from "next";
import Signup from "@/views/Signup";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: 'Create account',
  description: 'Create an EP Journals Group account.',
  path: "/signup",
  noindex: true,
});

export default function Page() {
  return <Signup />;
}
