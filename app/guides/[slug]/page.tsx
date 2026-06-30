import type { Metadata } from "next";
import { contentMeta, contentParams, ContentRoutePage } from "@/lib/contentRoute";

// Pre-render every guide; refresh every 3 days.
export const revalidate = 259200;

export function generateStaticParams() {
  return contentParams("guide");
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
): Promise<Metadata> {
  const { slug } = await params;
  return contentMeta("guide", slug);
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <ContentRoutePage category="guide" slug={slug} />;
}
