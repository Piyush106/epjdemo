"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { ScholarRow, ScholarSummary } from "@/lib/scholarCoverage";

// Journal selector + article list with a Google Scholar link per article.
// A badge is shown only for articles confirmed in Google Scholar
// (scholar_checks.status = 'verified'); other articles carry no status label.

const PAGE = 15;
const fmt = (iso: string) =>
  iso ? new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }) : "";

export default function ScholarCoverage({ summary, names }: { summary: ScholarSummary[]; names: Record<string, string> }) {
  const [journal, setJournal] = useState(summary[0]?.journal ?? "GJETR");
  const [rows, setRows] = useState<ScholarRow[] | null>(null);
  const [error, setError] = useState(false);
  const [shown, setShown] = useState(PAGE);

  useEffect(() => {
    let live = true;
    setRows(null);
    setError(false);
    setShown(PAGE);
    fetch(`/api/scholar-coverage?journal=${journal}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d: { rows: ScholarRow[] }) => {
        if (!live) return;
        // Confirmed articles first, then newest first.
        const v = d.rows.filter((r) => r.status === "verified");
        const rest = d.rows.filter((r) => r.status !== "verified").sort((a, b) => b.date.localeCompare(a.date));
        setRows([...v, ...rest]);
      })
      .catch(() => live && setError(true));
    return () => {
      live = false;
    };
  }, [journal]);

  const sourceQuery = `https://scholar.google.com/scholar?hl=en&q=${encodeURIComponent(`source:"${names[journal] ?? journal}"`)}`;

  return (
    <div>
      <div role="tablist" aria-label="Choose a journal" className="flex flex-wrap gap-2">
        {summary.map((x) => (
          <button
            key={x.journal}
            role="tab"
            aria-selected={x.journal === journal}
            onClick={() => setJournal(x.journal)}
            className={`rounded-md border px-3 py-1.5 text-sm font-medium transition-colors ${
              x.journal === journal
                ? "border-primary bg-primary text-white"
                : "border-border bg-card text-foreground/85 hover:border-primary"
            }`}
          >
            {x.journal}
          </button>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-sm font-semibold text-foreground">{names[journal] ?? journal}</p>
        <a href={sourceQuery} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">
          Search this journal on Google Scholar<span className="sr-only"> (opens in a new tab)</span>
        </a>
      </div>

      {error && <p className="mt-3 text-sm text-muted-foreground">The article list could not be loaded. Please reload the page.</p>}
      {!rows && !error && <p className="mt-3 text-sm text-muted-foreground">Loading articles…</p>}

      {rows && (
        <ul className="mt-3 divide-y divide-border rounded-lg border border-border bg-card">
          {rows.slice(0, shown).map((r) => (
            <li key={r.id} className="p-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <Link href={r.path} className="font-medium leading-snug text-foreground hover:underline">
                    {r.title}
                  </Link>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {r.authors} · {fmt(r.date)}
                  </p>
                </div>
                {r.status === "verified" && (
                  <span className="shrink-0 self-start whitespace-nowrap rounded-sm border border-emerald-700/40 bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200">
                    In Google Scholar
                  </span>
                )}
              </div>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs">
                <a
                  href={r.status === "verified" && r.recordUrl ? r.recordUrl : r.scholarSearch}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  {r.status === "verified" ? "Google Scholar record" : "Search on Google Scholar"}
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
                <Link href={r.path} className="text-primary hover:underline">
                  Article on ep-journals.org
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}

      {rows && rows.length > shown && (
        <button
          onClick={() => setShown((n) => n + PAGE * 2)}
          className="mt-3 w-full rounded-md border border-border py-2 text-sm font-medium text-foreground/85 hover:border-primary"
        >
          Show more ({rows.length - shown} remaining)
        </button>
      )}
    </div>
  );
}
