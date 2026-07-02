"use client";
import Script from "next/script";

// Loads Google's gtag.js once and configures GA4 (NEXT_PUBLIC_GA_ID) and/or
// Google Ads (NEXT_PUBLIC_GOOGLE_ADS_ID). Renders nothing unless at least one id
// is set, so it's safe to ship and activates when the env vars are present.
export default function GoogleAnalytics({ gaId, adsId }: { gaId?: string; adsId?: string }) {
  const primary = gaId || adsId;
  if (!primary) return null;
  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${primary}`} strategy="afterInteractive" />
      <Script id="gtag-init" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
${gaId ? `gtag('config', '${gaId}', { anonymize_ip: true });\n` : ""}${adsId ? `gtag('config', '${adsId}');` : ""}`}
      </Script>
    </>
  );
}
