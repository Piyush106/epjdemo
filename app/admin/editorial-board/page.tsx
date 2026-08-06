import type { Metadata } from "next";
import AdminEditorialBoard from "@/views/AdminEditorialBoard";

// Admin-only; never indexed. /admin is also disallowed in robots.txt.
export const metadata: Metadata = {
  title: "Editorial Board Applications — Admin",
  robots: { index: false, follow: false },
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id } = await searchParams;
  return <AdminEditorialBoard highlightId={id} />;
}
