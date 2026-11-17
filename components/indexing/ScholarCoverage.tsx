"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { ScholarRow, ScholarStatus, ScholarSummary } from "@/lib/scholarCoverage";

const LABEL: Record<ScholarStatus, string> = {
  verified: "Found in Scholar",
  other_source: "Other record only",
  not_found: "Not found yet",
  not_checked: "Not checked",
};
const TONE: Record<ScholarStatus, string> = {
  verified: "border-emerald-700/40 bg-emerald-50 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200",
  other_source: "border-slate-400/50 bg-slate-50 text-slate-700 dark:bg-slate-900 dark:text-slate-300",
  not_found: "border-amber-700/30 bg-amber-50 text-amber-900 dark:bg-amber-950 dark:text-amber-200",
  not_checked: "border-slate-300 bg-white text-slate-600 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-400",
};
const PAGE = 15;

const fmt = (iso: string | null) =>
  iso ? new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }) : "";

export default function ScholarCoverage({
  summary,
  names,
}: {
  summary: ScholarSummary[];
  names: Record<string, string>;
}) {
  const [journal, setJournal] = useState(summary[0]?.journal ?? "GJETR");
  const [rows, setRows] = useState<ScholarRow[] | null>(null);
  const [error, setError] = useState(false);
  const [filter, setFilter] = useState<"all" | "checked">("checked");
  const [shown, setShown] = useState(PAGE);

  useEffect(() => {
    let live = true;
    setRows(null);
    setError(false);
    setShown(PAGE);
    fetch(`/api/scholar-coverage?journal=${journal}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => live && setRows(d.rows))
      .catch(() => live && setError(true));
    return () => {
      live = false;
    };
  }, [journal]);

  const s = summary.find((x) => x.journal === journal);
  const visible = useMemo(
    () => (rows ?? []).filter((r) => filter === "all" || r.status !== "not_checked"),
    [rows, filter],
  );

  return (
    <div>
      {/* Journal selector */}
      <div role="tablist" aria-label="Choose a journal" className="flex flex-wrap gap-2">
        {summary.map((x) => (
          <button
            key={x.journal}
            role="tab"
            aria-selected={x.journal === journal}
            onClick={() => setJournal(x.journal)}
            className={`rounded-md border px-3 py-1.5 text-sm font-medium transition-colors ${
              x.journal === journal
                ? "border-[#0b1f3a] bg-[#0b1f3a] text-white"
                : "border-slate-300 bg-white text-slate-700 hover:border-[#0b1f3a] dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
            }`}
          >
            {x.journal}
          </button>
        ))}
      </div>

      {s && (
        <div className="mt-5 rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{names[journal] ?? journal}</p>
          <dl className="mt-3 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
            <Stat label="Published articles" value={s.published} />
            <Stat label="Searched so far" value={s.checked} />
            <Stat label="Verified in Scholar" value={s.verified} />
            <Stat
              label="Verified coverage"
              value={s.checked ? `${s.verified} of ${s.published}` : "Not measured"}
              hint={s.checked ? `${Math.round((s.verified / s.published) * 100)}% of published` : undefined}
            />
          </dl>
          <p className="mt-3 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
            Coverage counts only articles we have searched and found. Unchecked articles are not assumed absent, and
            &ldquo;not found yet&rdquo; is not a rejection.
          </p>
        </div>
      )}

      <div className="mt-5 flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          {rows ? `${visible.length} article${visible.length === 1 ? "" : "s"}` : error ? "" : "Loading articles…"}
        </p>
        <div className="flex gap-1 text-xs">
          {(["checked", "all"] as const).map((f) => (
            <button
              key={f}
              onClick={() => {
                setFilter(f);
                setShown(PAGE);
              }}
              aria-pressed={filter === f}
              className={`rounded border px-2 py-1 ${
                filter === f ? "border-[#0b1f3a] text-[#0b1f3a] dark:border-slate-300 dark:text-slate-100" : "border-slate-200 text-slate-500 dark:border-slate-800"
              }`}
            >
              {f === "checked" ? "Searched articles" : "All articles"}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <p className="mt-3 text-sm text-slate-600">The article list could not be loaded. Please reload the page.</p>
      )}

      <ul className="mt-3 divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-950">
        {visible.slice(0, shown).map((r) => (
          <li key={r.id} className="p-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <Link href={r.path} className="font-medium leading-snug text-slate-900 hover:underline dark:text-slate-100">
                  {r.title}
                </Link>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  {r.authors} · {fmt(r.date)}
                </p>
                {r.note && <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{r.note}</p>}
              </div>
              <span
                title={r.checkedOn ? `Checked ${fmt(r.checkedOn)}` : undefined}
                className={`shrink-0 self-start whitespace-nowrap rounded-sm border px-2 py-0.5 text-[11px] font-medium ${TONE[r.status]}`}
              >
                {LABEL[r.status]}
                {r.checkedOn && <span className="font-normal opacity-75"> · {fmt(r.checkedOn)}</span>}
              </span>
            </div>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs">
              <a href={r.scholarSearch} target="_blank" rel="noopener noreferrer" className="text-[#1d4ed8] hover:underline dark:text-blue-300">
                Search Google Scholar<span className="sr-only"> for this title (opens in a new tab)</span>
              </a>
              <Link href={r.path} className="text-[#1d4ed8] hover:underline dark:text-blue-300">
                Article on ep-journals.org
              </Link>
              {r.recordUrl && (
                <a href={r.recordUrl} target="_blank" rel="noopener noreferrer nofollow" className="text-slate-500 hover:underline">
                  {r.status === "verified" ? "Scholar record" : "Result returned"}
                </a>
              )}
            </div>
          </li>
        ))}
        {rows && visible.length === 0 && (
          <li className="p-4 text-sm text-slate-600 dark:text-slate-400">
            No articles from this journal have been searched yet. Use &ldquo;All articles&rdquo; to search any title yourself.
          </li>
        )}
      </ul>

      {visible.length > shown && (
        <button
          onClick={() => setShown((n) => n + PAGE * 2)}
          className="mt-3 w-full rounded-md border border-slate-300 py-2 text-sm font-medium text-slate-700 hover:border-[#0b1f3a] dark:border-slate-700 dark:text-slate-200"
        >
          Show more ({visible.length - shown} remaining)
        </button>
      )}
    </div>
  );
}

function Stat({ label, value, hint }: { label: string; value: number | string; hint?: string }) {
  return (
    <div>
      <dt className="text-xs text-slate-500 dark:text-slate-400">{label}</dt>
      <dd className="mt-0.5 text-lg font-semibold text-slate-900 dark:text-slate-100">{value}</dd>
      {hint && <dd className="text-xs text-slate-500">{hint}</dd>}
    </div>
  );
}
