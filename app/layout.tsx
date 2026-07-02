import type { Metadata } from "next";
import { Playfair_Display, Lora } from "next/font/google";
import "./globals.css";
import JsonLd from "@/components/JsonLd";
import { SITE } from "@/lib/seo";
import Providers from "@/components/Providers";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import { Suspense } from "react";

// Self-hosted via next/font — no render-blocking Google Fonts request (CWV).
const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-playfair",
  display: "swap",
});
const lora = Lora({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-lora",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.origin),
  title: {
    default: SITE.defaultTitle,
    template: "%s | EP Journals Group",
  },
  description: SITE.defaultDescription,
  alternates: { canonical: SITE.origin },
  robots: { index: true, follow: true },
  // Icons are provided by the App Router file conventions (app/favicon.ico,
  // app/icon.png, app/apple-icon.png) — Next emits the correct <link> tags.
};

const organizationLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${SITE.origin}/#organization`,
  name: SITE.name,
  url: SITE.origin,
  logo: { "@type": "ImageObject", url: `${SITE.origin}/icon-512.png`, width: 512, height: 512 },
  description:
    "EP Journals Group is an open access academic publisher operating six peer-reviewed, double-blind journals across engineering, economics, management, natural sciences, social sciences, and education. All articles are published under CC BY 4.0 and assigned Crossref DOIs.",
  email: SITE.email,
  foundingDate: "2024",
  publishingPrinciples: `${SITE.origin}/policies/publication-ethics`,
  sameAs: [SITE.origin, "https://doi.org/10.65150"],
};

const websiteLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${SITE.origin}/#website`,
  name: SITE.name,
  url: SITE.origin,
  description:
    "Peer-reviewed open access journals in engineering, economics, management, natural sciences, and social sciences.",
  publisher: { "@type": "Organization", "@id": `${SITE.origin}/#organization` },
  inLanguage: "en",
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${SITE.origin}/articles?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${playfair.variable} ${lora.variable}`}>
      <head>
        <JsonLd data={organizationLd} />
        <JsonLd data={websiteLd} />
      </head>
      <body>
        <Providers><Suspense>{children}</Suspense></Providers>
        {(process.env.NEXT_PUBLIC_GA_ID || process.env.NEXT_PUBLIC_GOOGLE_ADS_ID) && (
          <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} adsId={process.env.NEXT_PUBLIC_GOOGLE_ADS_ID} />
        )}
      </body>
    </html>
  );
}
