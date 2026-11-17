"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, BookOpen, FileText, Loader2, Search, User, Users, X, Library } from "lucide-react";
import { Dialog, DialogOverlay, DialogPortal, DialogTitle } from "@/components/ui/dialog";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { highlightParts, KIND_GROUP, KIND_LABEL, type SearchHit, type SearchKind, type SearchResponse } from "@/lib/search";

// Predictive, typo-tolerant site search (header search button / Ctrl+K).
// Suggestions come from /api/search, which ranks journals, articles, authors,
// pages and editorial board members from the database. Enter with nothing
// selected opens the full results page.

const ORDER: SearchKind[] = ["journal", "article", "author", "page", "editor"];
const ICON: Record<SearchKind, typeof Search> = { journal: Library, article: FileText, author: User, page: BookOpen, editor: Users };
const DEBOUNCE_MS = 250;

function Highlight({ text, terms }: { text: string; terms: string[] }) {
  return (
    <>
      {highlightParts(text, terms).map((p, i) =>
        p.hit ? (
          <mark key={i} className="rounded-[2px] bg-ep-orange/15 px-0 text-inherit">
            {p.t}
          </mark>
        ) : (
          <span key={i}>{p.t}</span>
        ),
      )}
    </>
  );
}

interface GlobalSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function GlobalSearch({ open, onOpenChange }: GlobalSearchProps) {
  const router = useRouter();
  const listId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [data, setData] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(-1);
  const reqId = useRef(0);

  // Debounced fetch; stale responses are ignored.
  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setData(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    const id = ++reqId.current;
    const t = setTimeout(async () => {
      try {
        const r = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
        const d = (await r.json()) as SearchResponse;
        if (id === reqId.current) {
          setData(r.ok ? d : null);
          setActive(-1);
        }
      } catch {
        if (id === reqId.current) setData(null);
      } finally {
        if (id === reqId.current) setLoading(false);
      }
    }, DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setData(null);
      setActive(-1);
    }
  }, [open]);

  // Ctrl/Cmd+K or "/" opens search from anywhere.
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const typing = /^(input|textarea|select)$/i.test((e.target as HTMLElement)?.tagName ?? "");
      if (((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") || (e.key === "/" && !typing)) {
        e.preventDefault();
        onOpenChange(true);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onOpenChange]);

  // Group in a fixed category order; keyboard navigation follows display order.
  const groups = useMemo(() => {
    const res = data?.results ?? [];
    return ORDER.map((k) => ({ kind: k, items: res.filter((r) => r.kind === k) })).filter((g) => g.items.length);
  }, [data]);
  const flat = useMemo(() => groups.flatMap((g) => g.items), [groups]);
  const terms = data?.terms ?? [];

  const go = useCallback(
    (href: string) => {
      onOpenChange(false);
      router.push(href);
    },
    [onOpenChange, router],
  );
  const allResults = () => go(`/search?q=${encodeURIComponent(query.trim())}`);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, flat.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (active >= 0 && flat[active]) go(flat[active].url);
      else if (query.trim().length >= 2) allResults();
    }
  };

  // Keep the active option in view.
  useEffect(() => {
    if (active < 0) return;
    document.getElementById(`${listId}-opt-${active}`)?.scrollIntoView({ block: "nearest" });
  }, [active, listId]);

  const q = query.trim();
  let idx = -1;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay />
        <DialogPrimitive.Content
          aria-describedby={undefined}
          onOpenAutoFocus={(e) => {
            e.preventDefault();
            inputRef.current?.focus();
          }}
          className="fixed left-1/2 top-3 z-50 flex max-h-[calc(100dvh-1.5rem)] w-[calc(100vw-1.5rem)] max-w-[680px] -translate-x-1/2 flex-col overflow-hidden rounded-lg border border-border bg-background shadow-2xl sm:top-[10vh] sm:max-h-[75vh]"
        >
          <DialogTitle className="sr-only">Search EP Journals Group</DialogTitle>

          <div className="flex items-center gap-3 border-b border-border bg-ep-cream px-4 py-3">
            <Search className="h-5 w-5 shrink-0 text-ep-orange" aria-hidden />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Search journals, articles, authors, DOIs, policies…"
              className="h-10 min-w-0 flex-1 bg-transparent text-base text-foreground outline-none placeholder:text-muted-foreground sm:text-sm"
              role="combobox"
              aria-expanded={flat.length > 0}
              aria-controls={listId}
              aria-autocomplete="list"
              aria-activedescendant={active >= 0 ? `${listId}-opt-${active}` : undefined}
              aria-label="Search the website"
              autoComplete="off"
              spellCheck={false}
              enterKeyHint="search"
            />
            {loading && <Loader2 className="h-4 w-4 shrink-0 animate-spin text-muted-foreground" aria-label="Searching" />}
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  inputRef.current?.focus();
                }}
                className="shrink-0 rounded-sm px-1.5 py-1 text-xs text-muted-foreground hover:bg-muted"
              >
                Clear
              </button>
            )}
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-sm hover:bg-muted"
              aria-label="Close search"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain" aria-live="polite">
            {q.length < 2 && (
              <div className="px-6 py-8 text-center text-muted-foreground">
                <p className="text-sm font-medium text-foreground">Search the whole site</p>
                <p className="mt-1 text-xs">Journal names or abbreviations, article titles, authors, keywords, DOIs, policies and guides. Spelling mistakes are fine.</p>
                <p className="mt-4 hidden text-[11px] sm:block">
                  <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono">↑</kbd>{" "}
                  <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono">↓</kbd> to move ·{" "}
                  <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono">Enter</kbd> to open ·{" "}
                  <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono">Esc</kbd> to close
                </p>
              </div>
            )}

            {q.length >= 2 && data?.corrected && flat.length > 0 && (
              <p className="border-b border-border px-4 py-2 text-xs text-muted-foreground">
                Showing results for <span className="font-semibold text-foreground">{data.corrected}</span>
              </p>
            )}

            {q.length >= 2 && !loading && data && flat.length === 0 && (
              <div className="px-6 py-8 text-center">
                <p className="text-sm text-foreground">Nothing matched &ldquo;{q}&rdquo;.</p>
                <button type="button" onClick={allResults} className="mt-2 text-xs font-medium text-primary hover:underline">
                  See journals and suggestions
                </button>
              </div>
            )}

            {flat.length > 0 && (
              <div id={listId} role="listbox" aria-label="Search suggestions" className="py-1">
                {groups.map((g) => (
                  <div key={g.kind} role="group" aria-label={KIND_GROUP[g.kind]}>
                    <p className="px-4 pb-1 pt-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-ep-orange">{KIND_GROUP[g.kind]}</p>
                    {g.items.map((r: SearchHit) => {
                      idx++;
                      const i = idx;
                      const Icon = ICON[r.kind];
                      return (
                        <a
                          key={`${r.kind}-${r.id}`}
                          id={`${listId}-opt-${i}`}
                          role="option"
                          aria-selected={i === active}
                          href={r.url}
                          onClick={(e) => {
                            e.preventDefault();
                            go(r.url);
                          }}
                          onMouseMove={() => setActive(i)}
                          className={`flex items-start gap-3 px-4 py-2.5 text-left transition-colors ${i === active ? "bg-ep-cream" : ""}`}
                        >
                          <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                          <span className="min-w-0 flex-1">
                            <span className="line-clamp-2 text-sm font-medium leading-snug text-foreground">
                              <Highlight text={r.title} terms={terms} />
                            </span>
                            {r.subtitle && (
                              <span className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                                <Highlight text={r.subtitle} terms={terms} />
                              </span>
                            )}
                          </span>
                          <span className="hidden shrink-0 rounded-sm border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground sm:inline">
                            {r.kind === "article" && r.journal ? r.journal : KIND_LABEL[r.kind]}
                          </span>
                        </a>
                      );
                    })}
                  </div>
                ))}
              </div>
            )}
          </div>

          {q.length >= 2 && (
            <button
              type="button"
              onClick={allResults}
              className="flex items-center justify-between gap-2 border-t border-border bg-ep-cream px-4 py-2.5 text-sm font-medium text-primary hover:bg-ep-cream-dark"
            >
              <span>
                See all results for &ldquo;{q}&rdquo;
                {data?.total ? <span className="font-normal text-muted-foreground"> · {data.total}</span> : null}
              </span>
              <ArrowRight className="h-4 w-4" aria-hidden />
            </button>
          )}
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
}
