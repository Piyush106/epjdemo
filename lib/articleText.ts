/**
 * Clean article fields as they come from OJS before they reach pages and metadata.
 *
 * - Author names: authors type honorifics and degrees into the name fields
 *   ("Dr. Jane Doe", "Leo C. Naparota PhD", "Faloye Dotun. O. (Prof.)"). Google
 *   Scholar matches citation_author against author profiles, so these must be
 *   bare names. Name parts that look like titles but are not (Filipino "Ma.",
 *   Bangladeshi "Md.", the suffix "Jr.") are kept.
 * - Abstracts: a few submissions have "." as the abstract. Treat anything without
 *   real text as missing so pages fall back to a factual description.
 * - Keywords: drop entries with no letters or digits.
 */

/** Titles that only count when they lead the name. Compared without dots, lowercase. */
const LEADING_TITLES = new Set([
  "dr", "prof", "professor", "rev", "revd", "fr", "engr", "mr", "mrs", "ms", "miss", "mx",
  "assoc", "asst", "lecturer", "hon", "barr", "pastor", "sir", "ts",
]);
/** Degrees and post-nominals, removed wherever they appear. Compared without dots, lowercase. */
const DEGREES = new Set([
  "phd", "mba", "msc", "bsc", "mass", "med", "mphil", "dba", "edd", "llb", "llm",
  "fca", "aca", "cpa", "ragr", "cre",
]);

const bare = (t: string) => t.toLowerCase().replace(/\./g, "");

/** "Prof. (Dr) Jane A. Doe, PhD" → "Jane A. Doe". Returns "" when nothing is left. */
export function cleanAuthorName(raw: string): string {
  const tokens = raw
    .replace(/\([^)]*\)/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean);
  // Strip leading titles (and degrees typed first, e.g. "PhD Elvin L. Jarito").
  while (tokens.length > 1 && (LEADING_TITLES.has(bare(tokens[0])) || DEGREES.has(bare(tokens[0])))) tokens.shift();
  const kept = tokens.filter((t) => !DEGREES.has(bare(t)));
  return kept.join(" ").replace(/[,;:]+$/, "").replace(/^[,;:.\s]+/, "").trim();
}

/** Comma-separated author field → clean, de-duplicated names. */
export function cleanAuthorList(authors: string | null | undefined): string[] {
  const out: string[] = [];
  for (const part of (authors ?? "").split(",")) {
    const name = cleanAuthorName(part);
    // A lone fragment left over from "Jane Doe, PhD" is not an author.
    if (name.replace(/[^\p{L}]/gu, "").length < 2) continue;
    if (!out.some((n) => n.toLowerCase() === name.toLowerCase())) out.push(name);
  }
  return out;
}

/** True when the text holds real words, not a placeholder like "." or "-". */
export function hasText(s: string | null | undefined, min = 20): boolean {
  return (s ?? "").replace(/[^\p{L}\p{N}]/gu, "").length >= min;
}

/** Abstract, or "" when the submission only carried a placeholder. */
export function cleanAbstract(s: string | null | undefined): string {
  return hasText(s) ? (s ?? "").trim() : "";
}

export function cleanKeywords(k: (string | null)[] | null | undefined): string[] {
  return (k ?? []).map((x) => (x ?? "").trim()).filter((x) => hasText(x, 2));
}

/**
 * A factual one-paragraph description for articles without an abstract, built only
 * from the record's own fields (so search snippets never show a bare ".").
 */
export function factualDescription(a: {
  title: string; authors: string; journal_name: string; journal_abbrev: string;
  volume?: string | number | null; issue?: string | number | null; publication_date: string;
}): string {
  const names = cleanAuthorList(a.authors);
  const by = names.length ? ` by ${names.length > 2 ? `${names[0]} et al.` : names.join(" and ")}` : "";
  const where = [a.volume ? `Volume ${a.volume}` : "", a.issue ? `Issue ${a.issue}` : ""].filter(Boolean).join(", ");
  const when = new Date(a.publication_date).toLocaleDateString("en-GB", { month: "long", year: "numeric" });
  return `${a.title.replace(/[.\s]+$/, "")}: a research article${by} in ${a.journal_name} (${a.journal_abbrev})${where ? `, ${where}` : ""}, published ${when}. Open access under CC BY 4.0, with the full text available as a PDF.`;
}

/** Apply all of the above to an article row (any subset of its columns). */
export function tidyArticle<T extends { authors?: string | null; abstract?: string | null; keywords?: (string | null)[] | null }>(row: T): T {
  const out: Record<string, unknown> = { ...row };
  if ("authors" in row) out.authors = cleanAuthorList(row.authors).join(", ");
  if ("abstract" in row) out.abstract = cleanAbstract(row.abstract);
  if ("keywords" in row) out.keywords = cleanKeywords(row.keywords);
  return out as T;
}
