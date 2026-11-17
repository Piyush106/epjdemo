import { supabase } from "@/lib/data";
import { articlePath } from "@/lib/articleUrl";

// Website search. Ranking, typo correction and journal-abbreviation handling
// happen in the database function public.search_site (see
// supabase/migrations/20261117130000_search_functions.sql).

export type SearchKind = "journal" | "article" | "author" | "page" | "editor";

export interface SearchHit {
  kind: SearchKind;
  id: string;
  title: string;
  subtitle: string | null;
  url: string;
  date: string | null;
  journal: string | null;
  score: number;
  snippet: string | null;
}

export interface SearchResponse {
  query: string;
  corrected: string | null;
  terms: string[];
  total: number;
  results: SearchHit[];
}

export const KIND_LABEL: Record<SearchKind, string> = {
  journal: "Journal",
  article: "Article",
  author: "Author",
  page: "Page",
  editor: "Editorial board",
};

export const KIND_GROUP: Record<SearchKind, string> = {
  journal: "Journals",
  article: "Articles",
  author: "Authors",
  page: "Pages & guides",
  editor: "Editorial board",
};

export async function searchSite(q: string, opts: { limit?: number; offset?: number; full?: boolean } = {}): Promise<SearchResponse> {
  const query = q.trim().slice(0, 120);
  const empty: SearchResponse = { query, corrected: null, terms: [], total: 0, results: [] };
  if (query.length < 2) return empty;
  const { data, error } = await supabase.rpc("search_site", {
    q: query,
    p_limit: opts.limit ?? 8,
    p_offset: opts.offset ?? 0,
    p_full: opts.full ?? false,
  });
  if (error || !data) return empty;
  const d = data as Omit<SearchResponse, "results"> & { results: (Omit<SearchHit, "url"> & { url: string | null })[] };
  return {
    query,
    corrected: d.corrected ?? null,
    terms: d.terms ?? [],
    total: d.total ?? 0,
    results: (d.results ?? []).map((r) => ({
      ...r,
      url: r.kind === "article" ? articlePath({ id: r.id, title: r.title }) : r.url ?? "/",
    })),
  };
}

/** Split text into plain and matched parts for highlighting (accent- and case-insensitive). */
export function highlightParts(text: string, terms: string[]): { t: string; hit: boolean }[] {
  const words = [...new Set(terms.filter((w) => w.length >= 2))].sort((a, b) => b.length - a.length);
  if (!text || !words.length) return [{ t: text, hit: false }];
  const fold = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  const folded = fold(text);
  // Folding can change length for some characters; fall back to no highlight then.
  if (folded.length !== text.length) return [{ t: text, hit: false }];
  const marks = new Array<boolean>(text.length).fill(false);
  for (const w of words) {
    let i = folded.indexOf(w);
    while (i !== -1) {
      // Match at a word start only, so "art" doesn't light up inside "start".
      if (i === 0 || !/[a-z0-9]/.test(folded[i - 1])) for (let k = i; k < i + w.length; k++) marks[k] = true;
      i = folded.indexOf(w, i + 1);
    }
  }
  const out: { t: string; hit: boolean }[] = [];
  for (let i = 0; i < text.length; i++) {
    const last = out[out.length - 1];
    if (last && last.hit === marks[i]) last.t += text[i];
    else out.push({ t: text[i], hit: marks[i] });
  }
  return out;
}
