import type { Metadata } from "next";
import Journals from "@/views/Journals";
import { buildMetadata } from "@/lib/seo";
import { getJournals } from "@/lib/data";

export const revalidate = 3600;

export const metadata: Metadata = buildMetadata({
  title: 'Journals',
  description: 'The six peer-reviewed open access journals published by EP Journals Group, with scope, ISSNs, and submission details.',
  path: "/journals",
});

export default async function Page() {
  let journals: Awaited<ReturnType<typeof getJournals>> = [];
  try { journals = await getJournals(); } catch { journals = []; }
  return <Journals initialJournals={journals} />;
}
