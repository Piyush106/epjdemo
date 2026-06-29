import { createClient, processLock } from "@supabase/supabase-js";
import type { Database } from "./types";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const SUPABASE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

// Strip AbortSignal so supabase-js + React Query don't throw spurious
// "AbortError: signal is aborted without reason" on data fetches.
const noAbortFetch: typeof fetch = (input, init) => {
  const { signal: _signal, ...rest } = init || {};
  return fetch(input, rest);
};

// SSR-safe: localStorage only exists in the browser.
const browserStorage = typeof window !== "undefined" ? window.localStorage : undefined;

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: browserStorage,
    persistSession: typeof window !== "undefined",
    autoRefreshToken: typeof window !== "undefined",
    lock: processLock,
  },
  global: {
    fetch: noAbortFetch,
  },
});
