import type { Metadata } from "next";
import { contentMeta, contentParams, ContentRoutePage } from "@/lib/contentRoute";

export const revalidate = 259200;

export function generateStaticParams() {
  return contentParams("comparison");
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
): Promise<Metadata> {
  const { slug } = await params;
  return contentMeta("comparison", slug);
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <ContentRoutePage category="comparison" slug={slug} />;
}
