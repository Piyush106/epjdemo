import { NextResponse } from "next/server";
import { getRecentArticles, getAllContentPages } from "@/lib/data";

// TEMPORARY diagnostic — reports what the Vercel runtime sees. No secrets:
// only the project ref (public) + counts + any error. Remove after debugging.
export const dynamic = "force-dynamic";

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "(unset)";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
  // decode the JWT "ref" claim without verifying (public info)
  let keyRef = "(none)";
  let keyRole = "(none)";
  try {
    const payload = JSON.parse(Buffer.from(key.split(".")[1] ?? "", "base64").toString());
    keyRef = payload.ref ?? "(no ref)";
    keyRole = payload.role ?? "(no role)";
  } catch { keyRef = key ? "(non-JWT key, e.g. sb_publishable)" : "(empty)"; }

  let articleCount: number | null = null;
  let contentCount: number | null = null;
  let error: string | null = null;
  try {
    articleCount = (await getRecentArticles(5)).length;
    contentCount = (await getAllContentPages()).length;
  } catch (e) {
    error = e instanceof Error ? e.message : String(e);
  }

  return NextResponse.json({
    runtimeSupabaseUrl: url,
    anonKeyRef: keyRef,
    anonKeyRole: keyRole,
    articleSample: articleCount,
    contentPages: contentCount,
    error,
  });
}
