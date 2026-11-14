import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import type { Journal } from "@/lib/types";
import {
  CATEGORIES, CROSSREF_MEMBER, JOURNAL_STATUS, LAST_VERIFIED, MATRIX_PLATFORMS, NEXT_REVIEW, PLATFORMS,
  SHORT_NAME, STATUS_KINDS, doiPattern, fmtLongDate, type StatusKind,
} from "@/lib/indexing";

// /indexing — journal-wise status matrix (central), platform directory by
// category, transparency note and essential publisher facts. All statuses come
// from lib/indexing.ts; journal names and ISSNs from the journals table.

const PILL: Record<StatusKind, string> = {
  listed: "border-emerald-700/40 bg-emerald-50 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200",
  doi: "border-blue-700/40 bg-blue-50 text-blue-900 dark:bg-blue-950 dark:text-blue-200",
  deposits: "border-slate-500/40 bg-slate-50 text-slate-800 dark:bg-slate-900 dark:text-slate-200",
  aggregated: "border-slate-500/40 bg-slate-50 text-slate-800 dark:bg-slate-900 dark:text-slate-200",
  pending: "border-amber-700/40 bg-amber-50 text-amber-900 dark:bg-amber-950 dark:text-amber-200",
};

function StatusPill({ kind, href, title }: { kind: StatusKind; href: string; title: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      title={title}
      className={`inline-block whitespace-nowrap rounded-sm border px-2 py-0.5 text-[11px] font-medium hover:underline ${PILL[kind]}`}
    >
      {STATUS_KINDS[kind].label}
      <span className="sr-only"> — verify on the platform (opens in a new tab)</span>
    </a>
  );
}

const policyLinks = [
  { href: "/policies/open-access", label: "Open access" },
  { href: "/policies/peer-review-process", label: "Peer review" },
  { href: "/policies/publication-ethics", label: "Publication ethics" },
  { href: "/policies/copyright-licensing", label: "Copyright and licensing" },
  { href: "/policies/archiving-preservation", label: "Archiving and preservation" },
  { href: "/policies/publisher-governance", label: "Publisher governance" },
];

const DISCIPLINES =
  "Engineering and technology; economics and finance; management; natural sciences; social sciences and humanities; education";

export default function IndexingPage({ journals }: { journals: Journal[] }) {
  const rows = journals.filter((j) => JOURNAL_STATUS[j.abbrev]);
  // Footnotes: each distinct note appears once under the matrix instead of in every cell.
  const notes = MATRIX_PLATFORMS.flatMap((p) => {
    const n = rows.map((j) => JOURNAL_STATUS[j.abbrev][p.key].note).find(Boolean);
    return n ? [{ platform: SHORT_NAME[p.key], note: n }] : [];
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* 1. Hero */}
      <section className="border-b border-border bg-ep-cream py-8">
        <div className="container mx-auto px-4">
          <h1 className="font-heading text-2xl font-semibold text-foreground">Indexing &amp; Abstracting</h1>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
            Where the six EP Journals Group journals are registered, catalogued and discoverable: ISSNs, Crossref DOIs,
            scholarly databases and open repositories. Each status links to the platform&apos;s own public record so you
            can check it yourself.
          </p>
          <p className="mt-3 text-xs text-muted-foreground">
            Crossref member {CROSSREF_MEMBER.id} · DOI prefix {CROSSREF_MEMBER.prefix} · Last verified {fmtLongDate(LAST_VERIFIED)}
          </p>
        </div>
      </section>

      <main className="container mx-auto px-4 py-8">
        {/* 3. Journal-wise matrix (central feature) */}
        <section aria-labelledby="matrix-heading">
          <h2 id="matrix-heading" className="font-heading text-lg font-semibold text-foreground">Journal-wise status</h2>
          <p className="mt-1 text-sm text-muted-foreground">Select a status to open the journal&apos;s record on that platform.</p>

          <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground" aria-label="Status key">
            {(Object.keys(STATUS_KINDS) as StatusKind[]).map((k) => (
              <li key={k} className="flex items-center gap-1.5">
                <span className={`rounded-sm border px-1.5 py-0.5 text-[11px] font-medium ${PILL[k]}`}>{STATUS_KINDS[k].label}</span>
                {STATUS_KINDS[k].meaning}
              </li>
            ))}
          </ul>

          {/* Desktop / tablet: one table */}
          <div className="mt-4 hidden overflow-x-auto border border-border bg-card md:block">
            <table className="w-full border-collapse text-left text-xs">
              <caption className="sr-only">Indexing and listing status of each journal by platform</caption>
              <thead>
                <tr className="border-b border-border bg-secondary">
                  <th scope="col" className="px-3 py-2.5 font-semibold text-foreground">Journal</th>
                  {MATRIX_PLATFORMS.map((p) => (
                    <th key={p.key} scope="col" className="px-2 py-2.5 font-semibold text-foreground">{SHORT_NAME[p.key]}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((j) => (
                  <tr key={j.abbrev} className="border-b border-border last:border-b-0 align-top">
                    <th scope="row" className="min-w-[13rem] px-3 py-3 font-normal">
                      <Link href={`/journals/${j.abbrev.toLowerCase()}`} className="font-semibold text-foreground hover:text-primary">{j.abbrev}</Link>
                      <span className="block leading-snug text-muted-foreground">{j.title}</span>
                      <span className="mt-1 block font-mono text-[10.5px] text-muted-foreground">
                        e-ISSN {j.electronic_issn ?? "—"} · p-ISSN {j.print_issn ?? "—"}
                      </span>
                      <span className="block font-mono text-[10.5px] text-muted-foreground">DOI {doiPattern(j.abbrev)}</span>
                    </th>
                    {MATRIX_PLATFORMS.map((p) => {
                      const s = JOURNAL_STATUS[j.abbrev][p.key];
                      return (
                        <td key={p.key} className="px-2 py-3">
                          <StatusPill kind={s.kind} href={s.verify} title={`${j.abbrev} on ${p.name}${s.note ? ` — ${s.note}` : ""}`} />
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile: expandable journal rows */}
          <div className="mt-4 space-y-2 md:hidden">
            {rows.map((j) => (
              <details key={j.abbrev} className="group border border-border bg-card">
                <summary className="flex cursor-pointer list-none items-start justify-between gap-3 px-4 py-3">
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-foreground">{j.abbrev}</span>
                    <span className="block text-xs leading-snug text-muted-foreground">{j.title}</span>
                  </span>
                  <span className="shrink-0 text-xs text-primary group-open:hidden">Show</span>
                  <span className="hidden shrink-0 text-xs text-primary group-open:inline">Hide</span>
                </summary>
                <div className="border-t border-border px-4 py-3">
                  <p className="font-mono text-[11px] text-muted-foreground">
                    e-ISSN {j.electronic_issn ?? "—"} · p-ISSN {j.print_issn ?? "—"}<br />DOI {doiPattern(j.abbrev)}
                  </p>
                  <dl className="mt-3 divide-y divide-border">
                    {MATRIX_PLATFORMS.map((p) => {
                      const s = JOURNAL_STATUS[j.abbrev][p.key];
                      return (
                        <div key={p.key} className="flex items-center justify-between gap-3 py-2">
                          <dt className="text-xs text-foreground">{SHORT_NAME[p.key]}</dt>
                          <dd><StatusPill kind={s.kind} href={s.verify} title={`${j.abbrev} on ${p.name}${s.note ? ` — ${s.note}` : ""}`} /></dd>
                        </div>
                      );
                    })}
                  </dl>
                </div>
              </details>
            ))}
          </div>

          {notes.length > 0 && (
            <ul className="mt-3 space-y-0.5 text-xs text-muted-foreground">
              {notes.map((n) => (
                <li key={n.platform}><strong className="font-semibold text-foreground">{n.platform}:</strong> {n.note}.</li>
              ))}
            </ul>
          )}
        </section>

        {/* 2. Platform directory */}
        <section aria-labelledby="directory-heading" className="mt-12">
          <h2 id="directory-heading" className="font-heading text-lg font-semibold text-foreground">Platform directory</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            What each platform does. These are different kinds of service and are not all indexing databases.
          </p>
          <div className="mt-5 space-y-7">
            {CATEGORIES.map((c) => {
              const items = PLATFORMS.filter((p) => p.category === c.key);
              if (!items.length) return null;
              return (
                <div key={c.key}>
                  <h3 className="font-heading text-sm font-semibold text-foreground">{c.title}</h3>
                  <p className="text-xs text-muted-foreground">{c.blurb}</p>
                  <ul className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {items.map((p) => (
                      <li key={p.key} className="flex flex-col border border-border bg-card px-4 py-3">
                        <span className="text-sm font-semibold text-foreground">{p.name}</span>
                        <span className="mt-1 flex-1 text-xs leading-relaxed text-muted-foreground">{p.role}</span>
                        <a href={p.url} target="_blank" rel="noopener noreferrer" className="mt-2 text-xs text-primary hover:underline">
                          {p.url.replace(/^https:\/\//, "").replace(/\/$/, "")}
                          <span className="sr-only"> (opens in a new tab)</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </section>

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          {/* 4. Transparency */}
          <section aria-labelledby="transparency-heading" className="border border-border bg-card p-5">
            <h2 id="transparency-heading" className="font-heading text-base font-semibold text-foreground">Transparency</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Listing and indexing status is decided by each platform under its own policies, and its official record
              always takes precedence over this page. EP Journals Group does not guarantee inclusion in any database.
              Please verify any status through the links above.
            </p>
            <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
              <div><dt className="text-muted-foreground">Last verified</dt><dd className="font-semibold text-foreground">{fmtLongDate(LAST_VERIFIED)}</dd></div>
              <div><dt className="text-muted-foreground">Next review</dt><dd className="font-semibold text-foreground">{fmtLongDate(NEXT_REVIEW)}</dd></div>
            </dl>
          </section>

          {/* 5. Publisher information */}
          <section aria-labelledby="publisher-heading" className="border border-border bg-card p-5">
            <h2 id="publisher-heading" className="font-heading text-base font-semibold text-foreground">Publisher</h2>
            <dl className="mt-2 space-y-1 text-xs text-muted-foreground">
              <div><dt className="inline font-semibold text-foreground">Publisher: </dt><dd className="inline">EP Journals Group</dd></div>
              <div>
                <dt className="inline font-semibold text-foreground">Crossref: </dt>
                <dd className="inline">
                  member <a href={CROSSREF_MEMBER.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{CROSSREF_MEMBER.id}</a>, DOI prefix {CROSSREF_MEMBER.prefix}
                </dd>
              </div>
              <div><dt className="inline font-semibold text-foreground">ISSN registration: </dt><dd className="inline">ISSN National Centre, Netherlands</dd></div>
              <div><dt className="inline font-semibold text-foreground">Disciplines: </dt><dd className="inline">{DISCIPLINES}</dd></div>
              <div>
                <dt className="inline font-semibold text-foreground">Contact: </dt>
                <dd className="inline"><a href="mailto:editor@ep-journals.org" className="text-primary hover:underline">editor@ep-journals.org</a></dd>
              </div>
            </dl>
            <p className="mt-3 text-xs font-semibold text-foreground">Policies</p>
            <ul className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs">
              {policyLinks.map((l) => (
                <li key={l.href}><Link href={l.href} className="text-primary hover:underline">{l.label}</Link></li>
              ))}
            </ul>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
