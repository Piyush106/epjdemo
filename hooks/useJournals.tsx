"use client";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Journal {
  id: string;
  abbrev: string;
  title: string;
  subtitle: string | null;
  print_issn: string | null;
  electronic_issn: string | null;
  doi_prefix: string | null;
  journal_doi: string | null;
  frequency: string;
  established: string | null;
  scope_short: string;
  aims_and_scope: string | null;
  subject_areas: string[];
  external_url: string;
  submission_url: string | null;
  contact_email: string;
  license: string;
  access_model: string;
  status: string;
  display_order: number;
  color_token: string | null;
}

// Color token → Tailwind class mapping for journal badges and label text.
// Defined here once so every component renders the same colour for a given journal.
const COLOR_MAP: Record<string, { badge: string; text: string }> = {
  blue:    { badge: "bg-blue-100 text-blue-800 border-blue-300",         text: "text-blue-700"    },
  emerald: { badge: "bg-emerald-100 text-emerald-800 border-emerald-300", text: "text-emerald-700" },
  amber:   { badge: "bg-amber-100 text-amber-800 border-amber-300",       text: "text-amber-700"   },
  purple:  { badge: "bg-purple-100 text-purple-800 border-purple-300",     text: "text-purple-700"  },
  rose:    { badge: "bg-rose-100 text-rose-800 border-rose-300",           text: "text-rose-700"    },
  cyan:    { badge: "bg-cyan-100 text-cyan-800 border-cyan-300",           text: "text-cyan-700"    },
};

const FALLBACK = { badge: "bg-gray-100 text-gray-800 border-gray-300", text: "text-primary" };

/** Fetch all active journals, sorted by display_order. Cached for 5 minutes. */
export function useJournals() {
  return useQuery({
    queryKey: ["journals"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("journals")
        .select("*")
        .eq("status", "active")
        .order("display_order", { ascending: true });
      if (error) throw error;
      return (data as Journal[]) || [];
    },
    staleTime: 5 * 60 * 1000,
  });
}

/** abbrev → Journal lookup map */
export function buildJournalMap(journals: Journal[]): Record<string, Journal> {
  return Object.fromEntries(journals.map((j) => [j.abbrev, j]));
}

/** Tailwind badge classes (background + text + border) for a journal's colour token. */
export function journalBadgeClass(colorToken: string | null | undefined): string {
  if (!colorToken) return FALLBACK.badge;
  return COLOR_MAP[colorToken]?.badge ?? FALLBACK.badge;
}

/** Tailwind text-only class for a journal's colour token. */
export function journalTextClass(colorToken: string | null | undefined): string {
  if (!colorToken) return FALLBACK.text;
  return COLOR_MAP[colorToken]?.text ?? FALLBACK.text;
}
