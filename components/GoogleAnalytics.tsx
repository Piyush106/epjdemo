"use client";
import Script from "next/script";

// GA4 loader. Renders nothing unless NEXT_PUBLIC_GA_ID is set, so it's safe to
// ship and activates the moment the env var is present (e.g. in Vercel).
export default function GoogleAnalytics({ gaId }: { gaId: string }) {
  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive" />
      <Script id="ga4-init" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${gaId}', { anonymize_ip: true });`}
      </Script>
    </>
  );
}
