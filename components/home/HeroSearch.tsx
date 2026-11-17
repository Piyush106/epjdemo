"use client";

import { Search } from "lucide-react";

// Hero search field. Typing here opens the site search (with suggestions)
// pre-filled with what was typed; the header's search dialog does the work.
export default function HeroSearch() {
  const open = (q = "") => window.dispatchEvent(new CustomEvent("ep:open-search", { detail: q }));
  return (
    <form
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        const q = new FormData(e.currentTarget).get("q");
        window.location.href = `/search?q=${encodeURIComponent(String(q ?? ""))}`;
      }}
      className="flex w-full max-w-xl items-center gap-2 rounded-md border border-border bg-card px-3 shadow-sm focus-within:border-primary"
    >
      <Search className="h-5 w-5 shrink-0 text-ep-orange" aria-hidden />
      <input
        name="q"
        aria-label="Search journals, articles, authors and policies"
        placeholder="Search journals, articles, authors, DOIs…"
        className="h-12 min-w-0 flex-1 bg-transparent text-base text-foreground outline-none placeholder:text-muted-foreground sm:text-sm"
        autoComplete="off"
        enterKeyHint="search"
        onChange={(e) => {
          if (e.target.value.length >= 1) {
            open(e.target.value);
            e.target.value = "";
          }
        }}
      />
      <span className="hidden rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground sm:inline">Ctrl K</span>
    </form>
  );
}
