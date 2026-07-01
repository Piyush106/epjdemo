// Lightweight GA4 event helper. Safe no-op when GA isn't loaded (no NEXT_PUBLIC_GA_ID,
// SSR, or ad-blockers). Fire these on meaningful actions so ad ROI is measurable.

declare global {
  interface Window {
    gtag?: (command: string, ...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

export function trackEvent(name: string, params: Record<string, unknown> = {}): void {
  if (typeof window !== "undefined" && typeof window.gtag === "function") {
    window.gtag("event", name, params);
  }
}
