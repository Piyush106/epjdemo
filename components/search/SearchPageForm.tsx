"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search, X } from "lucide-react";

export default function SearchPageForm({ initial }: { initial: string }) {
  const router = useRouter();
  const [q, setQ] = useState(initial);
  return (
    <form
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        if (q.trim().length >= 2) router.push(`/search?q=${encodeURIComponent(q.trim())}`);
      }}
      className="flex items-center gap-2 rounded-md border border-border bg-card px-3 shadow-sm focus-within:border-primary"
    >
      <Search className="h-5 w-5 shrink-0 text-ep-orange" aria-hidden />
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        name="q"
        aria-label="Search the website"
        placeholder="Journals, articles, authors, DOIs, policies…"
        className="h-12 min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground"
        autoComplete="off"
        enterKeyHint="search"
      />
      {q && (
        <button type="button" onClick={() => setQ("")} aria-label="Clear search" className="rounded-sm p-1 text-muted-foreground hover:bg-muted">
          <X className="h-4 w-4" />
        </button>
      )}
      <button type="submit" className="rounded-sm bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover">
        Search
      </button>
    </form>
  );
}
