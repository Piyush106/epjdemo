import type { Metadata } from "next";
import { contentMeta, contentParams, ContentRoutePage } from "@/lib/contentRoute";

export const revalidate = 259200;

export function generateStaticParams() {
  return contentParams("user-focused");
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
): Promise<Metadata> {
  const { slug } = await params;
  return contentMeta("user-focused", slug);
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <ContentRoutePage category="user-focused" slug={slug} />;
}
