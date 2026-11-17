import { supabase } from "@/lib/data";
import { articlePath } from "@/lib/articleUrl";

// Article-level Google Scholar coverage. Checks are recorded in the
// `scholar_checks` table (one row per article checked). An article without a
// row has not been checked. "not_found" means a title search on that date did
// not return the article: it is not a rejection by Google Scholar.

export type ScholarStatus = "verified" | "not_found" | "other_source" | "not_checked";

export const SCHOLAR_STATUS: Record<ScholarStatus, { label: string; meaning: string }> = {
  verified: { label: "Found in Scholar", meaning: "Google Scholar returned this article, linked to an EP Journals address." },
  other_source: { label: "Other record only", meaning: "The closest Scholar result is a different record, not this article on our site." },
  not_found: { label: "Not found yet", meaning: "Not returned by an exact-title search on the date shown. Not a rejection." },
  not_checked: { label: "Not checked", meaning: "This article has not been searched yet." },
};

export interface ScholarRow {
  id: string;
  title: string;
  authors: string;
  date: string;
  path: string;
  status: ScholarStatus;
  checkedOn: string | null;
  scholarSearch: string;
  recordUrl: string | null;
  note: string | null;
}

export interface ScholarSummary {
  journal: string;
  published: number;
  checked: number;
  verified: number;
  notFound: number;
  otherSource: number;
}

export const scholarSearchUrl = (title: string) =>
  `https://scholar.google.com/scholar?hl=en&q=${encodeURIComponent(`"${title}"`)}`;

type Check = { article_id: string; status: Exclude<ScholarStatus, "not_checked">; checked_on: string; record_url: string | null; source_note: string | null };

async function allChecks(): Promise<Check[]> {
  const { data } = await supabase.from("scholar_checks").select("article_id,status,checked_on,record_url,source_note");
  return (data as Check[] | null) ?? [];
}

export async function getScholarSummary(): Promise<{ rows: ScholarSummary[]; lastChecked: string | null }> {
  const [{ data: arts }, checks] = await Promise.all([
    supabase.from("articles").select("id,journal_abbrev").eq("status", "published").limit(5000),
    allChecks(),
  ]);
  const byId = new Map(checks.map((c) => [c.article_id, c]));
  const m = new Map<string, ScholarSummary>();
  for (const a of (arts as { id: string; journal_abbrev: string }[] | null) ?? []) {
    const s = m.get(a.journal_abbrev) ?? { journal: a.journal_abbrev, published: 0, checked: 0, verified: 0, notFound: 0, otherSource: 0 };
    s.published++;
    const c = byId.get(a.id);
    if (c) {
      s.checked++;
      if (c.status === "verified") s.verified++;
      else if (c.status === "not_found") s.notFound++;
      else s.otherSource++;
    }
    m.set(a.journal_abbrev, s);
  }
  const lastChecked = checks.map((c) => c.checked_on).sort().at(-1) ?? null;
  return { rows: [...m.values()], lastChecked };
}

export async function getScholarArticles(journal: string): Promise<ScholarRow[]> {
  const [{ data: arts }, checks] = await Promise.all([
    supabase
      .from("articles")
      .select("id,title,authors,publication_date")
      .eq("status", "published")
      .eq("journal_abbrev", journal)
      .order("publication_date", { ascending: false })
      .limit(2000),
    allChecks(),
  ]);
  const byId = new Map(checks.map((c) => [c.article_id, c]));
  const rank: Record<ScholarStatus, number> = { verified: 0, other_source: 1, not_found: 2, not_checked: 3 };
  return ((arts as { id: string; title: string; authors: string; publication_date: string }[] | null) ?? [])
    .map((a) => {
      const c = byId.get(a.id);
      return {
        id: a.id,
        title: a.title,
        authors: a.authors,
        date: a.publication_date?.slice(0, 10) ?? "",
        path: articlePath(a),
        status: c?.status ?? "not_checked",
        checkedOn: c?.checked_on ?? null,
        scholarSearch: scholarSearchUrl(a.title),
        recordUrl: c?.record_url ?? null,
        note: c?.source_note ?? null,
      } satisfies ScholarRow;
    })
    .sort((x, y) => rank[x.status] - rank[y.status]);
}
