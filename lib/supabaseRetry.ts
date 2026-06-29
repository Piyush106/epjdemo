/**
 * Retry wrapper for Supabase queries.
 *
 * The Supabase JS v2 client (v2.90.x) intermittently throws
 * `AbortError: signal is aborted without reason` in dev mode and occasionally
 * in production. Wrapping queries in this helper retries on abort errors only,
 * leaving real errors (RLS, network, validation) to surface immediately.
 *
 * Usage:
 *   const { data, error } = await fetchWithRetry(() =>
 *     supabase.from("articles").select("*").limit(10)
 *   );
 */
export async function fetchWithRetry<T>(
  query: () => PromiseLike<{ data: T | null; error: { message?: string } | null }>,
  attempts = 3,
): Promise<{ data: T | null; error: { message?: string } | null }> {
  let lastResult: { data: T | null; error: { message?: string } | null } = {
    data: null,
    error: null,
  };
  for (let i = 0; i < attempts; i++) {
    try {
      lastResult = await query();
      const msg = lastResult.error?.message ?? "";
      if (!msg.toLowerCase().includes("abort")) return lastResult;
      // Otherwise loop and retry
    } catch (e) {
      const msg = (e as { message?: string })?.message ?? String(e);
      if (!msg.toLowerCase().includes("abort")) {
        return { data: null, error: { message: msg } };
      }
      lastResult = { data: null, error: { message: msg } };
    }
    // Brief backoff before retry
    await new Promise((resolve) => setTimeout(resolve, 200 * (i + 1)));
  }
  return lastResult;
}
