// DOI registration check. A DOI is shown as a link only once it resolves:
// linking an unregistered DOI sends readers to doi.org's "DOI not found" page,
// which is the quickest way to lose an author's or librarian's trust.
//
// Uses the doi.org Handle API (HTTP 200 = registered, 404 = not yet deposited),
// cached for 6 hours so a new Crossref deposit shows up the same day.

export async function isDoiRegistered(doi: string): Promise<boolean> {
  try {
    const res = await fetch(`https://doi.org/api/handles/${encodeURIComponent(doi)}`, {
      next: { revalidate: 60 * 60 * 6 },
    });
    if (res.status === 404) return false;
    return true;
  } catch {
    // Network failure: don't hide a DOI we cannot check.
    return true;
  }
}

/** The subset of `dois` that resolve at doi.org (null/empty DOIs are skipped). */
export async function registeredDois(dois: (string | null | undefined)[]): Promise<Set<string>> {
  const unique = [...new Set(dois.filter((d): d is string => Boolean(d)))];
  const results = await Promise.all(unique.map(async (d) => [d, await isDoiRegistered(d)] as const));
  return new Set(results.filter(([, ok]) => ok).map(([d]) => d));
}
