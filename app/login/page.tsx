import type { Metadata } from "next";
import Login from "@/views/Login";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: 'Sign in',
  description: 'Sign in to the EP Journals Group editorial portal.',
  path: "/login",
  noindex: true,
});

export default function Page() {
  return <Login />;
}
