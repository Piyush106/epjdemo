import type { Metadata } from "next";
import { contentMeta, contentParams, ContentRoutePage } from "@/lib/contentRoute";

export const revalidate = 259200;

export function generateStaticParams() {
  return contentParams("publishing");
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
): Promise<Metadata> {
  const { slug } = await params;
  return contentMeta("publishing", slug);
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <ContentRoutePage category="publishing" slug={slug} />;
}
