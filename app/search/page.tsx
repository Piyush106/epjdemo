import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SearchPageForm from "@/components/search/SearchPageForm";
import { getJournals, getRecentArticles } from "@/lib/data";
import { articlePath } from "@/lib/articleUrl";
import { highlightParts, KIND_GROUP, KIND_LABEL, searchSite, type SearchKind } from "@/lib/search";
import { SITE } from "@/lib/seo";

// Full search results. Rendered on the server; not indexed by search engines.

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Search",
  description: "Search EP Journals Group journals, articles, authors, DOIs, policies and guides.",
  robots: { index: false, follow: true },
  alternates: { canonical: `${SITE.origin}/search` },
};

const PER_PAGE = 20;
const TYPES: SearchKind[] = ["journal", "article", "author", "page", "editor"];

function Hl({ text, terms }: { text: string; terms: string[] }) {
  return (
    <>
      {highlightParts(text, terms).map((p, i) =>
        p.hit ? <mark key={i} className="rounded-[2px] bg-ep-orange/15 text-inherit">{p.t}</mark> : <span key={i}>{p.t}</span>,
      )}
    </>
  );
}

// ts_headline marks matches with << >>.
function Snippet({ text }: { text: string }) {
  const parts = text.split(/(<<[^>]*>>)/g).filter(Boolean);
  return (
    <>
      {parts.map((p, i) =>
        p.startsWith("<<") ? <mark key={i} className="rounded-[2px] bg-ep-orange/15 text-inherit">{p.slice(2, -2)}</mark> : <span key={i}>{p}</span>,
      )}
    </>
  );
}

export default async function SearchPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const q = (typeof sp.q === "string" ? sp.q : "").trim().slice(0, 120);
  const page = Math.max(1, Number(sp.page) || 1);
  const type = TYPES.includes(sp.type as SearchKind) ? (sp.type as SearchKind) : null;

  // Fetch a generous ranked window, then filter by type and paginate here so
  // the type counts stay accurate.
  const data = q.length >= 2 ? await searchSite(q, { limit: 50, full: true }) : null;
  const all = data?.results ?? [];
  const counts = Object.fromEntries(TYPES.map((t) => [t, all.filter((r) => r.kind === t).length])) as Record<SearchKind, number>;
  const filtered = type ? all.filter((r) => r.kind === type) : all;
  const pageRows = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const pages = Math.ceil(filtered.length / PER_PAGE);
  const terms = data?.terms ?? [];

  const noResults = q.length >= 2 && all.length === 0;
  const [journals, recent] = noResults || q.length < 2 ? await Promise.all([getJournals().catch(() => []), getRecentArticles(4).catch(() => [])]) : [[], []];
  const categories = [...new Set(journals.flatMap((j) => j.subject_areas ?? []))].slice(0, 18);

  const href = (o: { type?: SearchKind | null; page?: number; q?: string }) => {
    const p = new URLSearchParams();
    p.set("q", o.q ?? q);
    if (o.type ?? type) p.set("type", (o.type === null ? "" : o.type ?? type) as string);
    if (o.page && o.page > 1) p.set("page", String(o.page));
    if (!p.get("type")) p.delete("type");
    return `/search?${p.toString()}`;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <section className="border-b border-border bg-ep-cream">
        <div className="container mx-auto px-4 py-8">
          <h1 className="font-heading text-2xl font-semibold text-ep-brown sm:text-3xl">Search</h1>
          <div className="mt-4 max-w-2xl">
            <SearchPageForm initial={q} />
          </div>
        </div>
      </section>

      <main className="container mx-auto px-4 py-8">
        {q.length >= 2 && data && (
          <>
            {data.corrected && all.length > 0 && (
              <p className="mb-4 text-sm text-muted-foreground">
                Showing results for <span className="font-semibold text-foreground">{data.corrected}</span>.{" "}
                <span className="text-xs">Searched for &ldquo;{q}&rdquo;.</span>
              </p>
            )}

            {all.length > 0 && (
              <nav aria-label="Filter results" className="mb-5 flex flex-wrap gap-2 text-sm">
                <Link href={href({ type: null, page: 1 })} className={`rounded-sm border px-3 py-1 ${!type ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-primary"}`}>
                  All <span className="opacity-70">{all.length}</span>
                </Link>
                {TYPES.filter((t) => counts[t]).map((t) => (
                  <Link key={t} href={href({ type: t, page: 1 })} className={`rounded-sm border px-3 py-1 ${type === t ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-primary"}`}>
                    {KIND_GROUP[t]} <span className="opacity-70">{counts[t]}</span>
                  </Link>
                ))}
              </nav>
            )}

            {pageRows.length > 0 && (
              <ol className="divide-y divide-border rounded-lg border border-border bg-card">
                {pageRows.map((r) => (
                  <li key={`${r.kind}-${r.id}`} className="p-4 sm:p-5">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ep-orange">
                      {r.kind === "article" && r.journal ? `Article · ${r.journal}` : KIND_LABEL[r.kind]}
                      {r.date ? <span className="font-normal normal-case tracking-normal text-muted-foreground"> · {new Date(r.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span> : null}
                    </p>
                    <Link href={r.url} className="mt-1 block font-heading text-lg font-semibold leading-snug text-foreground hover:text-primary">
                      <Hl text={r.title} terms={terms} />
                    </Link>
                    {r.subtitle && <p className="mt-1 text-sm text-muted-foreground"><Hl text={r.subtitle} terms={terms} /></p>}
                    {r.snippet && <p className="mt-2 text-sm leading-relaxed text-foreground/80"><Snippet text={r.snippet} /></p>}
                  </li>
                ))}
              </ol>
            )}

            {pages > 1 && (
              <nav aria-label="Result pages" className="mt-6 flex items-center justify-center gap-2 text-sm">
                {page > 1 && <Link href={href({ page: page - 1 })} className="rounded-sm border border-border px-3 py-1 hover:border-primary">Previous</Link>}
                <span className="text-muted-foreground">Page {page} of {pages}</span>
                {page < pages && <Link href={href({ page: page + 1 })} className="rounded-sm border border-border px-3 py-1 hover:border-primary">Next</Link>}
              </nav>
            )}
          </>
        )}

        {(noResults || q.length < 2) && (
          <div className="space-y-10">
            {noResults && (
              <div className="rounded-lg border border-border bg-card p-6">
                <h2 className="font-heading text-lg font-semibold text-foreground">No matches for &ldquo;{q}&rdquo;</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  We also checked for spelling mistakes, partial words and journal abbreviations. Try fewer or broader words, or browse below.
                </p>
              </div>
            )}
            <section aria-labelledby="sj">
              <h2 id="sj" className="font-heading text-lg font-semibold text-ep-brown">Our journals</h2>
              <ul className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {journals.map((j) => (
                  <li key={j.abbrev}>
                    <Link href={`/journals/${j.abbrev.toLowerCase()}`} className="block h-full rounded-lg border border-border bg-card p-4 hover:border-primary">
                      <span className="text-xs font-semibold text-ep-orange">{j.abbrev}</span>
                      <span className="mt-1 block text-sm font-medium text-foreground">{j.title}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
            {categories.length > 0 && (
              <section aria-labelledby="sc">
                <h2 id="sc" className="font-heading text-lg font-semibold text-ep-brown">Research areas</h2>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {categories.map((c) => (
                    <li key={c}>
                      <Link href={`/search?q=${encodeURIComponent(c)}`} className="inline-block rounded-sm border border-border bg-card px-3 py-1 text-sm text-foreground hover:border-primary">{c}</Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}
            {recent.length > 0 && (
              <section aria-labelledby="sr">
                <h2 id="sr" className="font-heading text-lg font-semibold text-ep-brown">Latest articles</h2>
                <ul className="mt-3 divide-y divide-border rounded-lg border border-border bg-card">
                  {recent.map((a) => (
                    <li key={a.id} className="p-4">
                      <span className="text-[11px] font-semibold text-ep-orange">{a.journal_abbrev}</span>
                      <Link href={articlePath(a)} className="mt-0.5 block text-sm font-medium text-foreground hover:text-primary">{a.title}</Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
