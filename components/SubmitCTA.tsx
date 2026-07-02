"use client";
import { Link } from "react-router-dom";
import { trackEvent } from "@/lib/analytics";

// Submit call-to-action that records a GA4 `submit_click` event (funnel step
// between landing and the completed `submit_manuscript` conversion).
export default function SubmitCTA({
  source,
  children,
  className,
}: {
  source: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link to="/submit" className={className} onClick={() => trackEvent("submit_click", { source })}>
      {children}
    </Link>
  );
}
