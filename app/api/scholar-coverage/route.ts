import { NextResponse } from "next/server";
import { getScholarArticles } from "@/lib/scholarCoverage";

// Article list for the Google Scholar coverage section on /indexing.
export const revalidate = 3600;
const JOURNALS = new Set(["GJETR", "JEFRR", "JMRR", "JNSRR", "JSSHRS", "GJEFM"]);

export async function GET(req: Request) {
  const j = new URL(req.url).searchParams.get("journal")?.toUpperCase() ?? "";
  if (!JOURNALS.has(j)) return NextResponse.json({ error: "Unknown journal" }, { status: 400 });
  const rows = await getScholarArticles(j);
  return NextResponse.json(
    { journal: j, rows },
    { headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" } },
  );
}
