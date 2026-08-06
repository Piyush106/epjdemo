# EP Journals Group — Technical SEO / GEO / AEO Optimisation Report

**Date:** 6 August 2026
**Codebase:** `epjdemo` (Next.js 15 App Router + Supabase), origin `https://www.ep-journals.org`
**Scope:** Full technical SEO, Generative Engine Optimisation (GEO), Answer Engine Optimisation (AEO), structured data, crawlability, indexability, internal linking, accessibility, and performance — **without changing written content**, except the authorised ISSN correction.

**Validation:** `npm run build` completes with **exit code 0**; all routes prerender (Static/SSG). Rendered HTML was inspected on a running production server (`next start`) to confirm every change appears in the **server response** (not injected client-side).

---

## 1. Executive summary

The site was already on a strong foundation: server-rendered article pages with Google Scholar `citation_*` tags, `ScholarlyArticle` JSON-LD, canonical-to-version-of-record, self-hosted fonts, and site-wide `Organization` + `WebSite` schema. The optimisation focused on four high-impact problems and a set of enrichments:

1. **Duplicate / conflicting metadata (fixed).** Legacy client-side `MetaTags` and `SchemaOrg` components re-injected `<title>`, description, canonical, OpenGraph, Twitter, and JSON-LD **after hydration**, producing tags that duplicated — and sometimes contradicted — the authoritative server metadata, and were invisible to non-JS crawlers (Google Scholar, Bing, AI retrievers).
2. **Client-only content on key pages (fixed).** The four Knowledge-Centre index pages (`/guides`, `/comparisons`, `/publishing`, `/resources`) and the `/indexing` ISSN/DOI table rendered their primary content from a client fetch — crawlers saw a loading skeleton, not the entries.
3. **Incorrect ISSNs (fixed).** All six journals carried placeholder e-ISSNs and no print ISSNs.
4. **Structured-data gaps (fixed/enriched).** Several indexable pages had no server JSON-LD; article pages lacked breadcrumbs and publisher links.

---

## 2. The one authorised content change — ISSN correction

The only content modification permitted was the ISSN correction. ISSNs live in the Supabase `journals` table (not in code). **Before**, every journal had a placeholder `3049-69xx`/`3049-70xx` e-ISSN and a `NULL` print ISSN. Corrected to the publisher-supplied values:

| Journal | e-ISSN (was → now) | p-ISSN (was → now) |
|---|---|---|
| GJETR — Global Journal of Engineering and Technology Research | 3049-6950 → **3051-3782** | — → **3051-3774** |
| JEFRR — Journal of Economic, Finance Research and Review | 3049-6977 → **3051-3650** | — → **3051-3642** |
| JMRR — Journal of Management Research and Review | 3049-696X → **3051-3588** | — → **3051-357X** |
| JNSRR — Journal of Natural Science Research and Review | 3049-6993 → **3051-3766** | — → **3051-3758** |
| JSSHRS — Journal of Social Science and Human Research Studies | 3049-7000 → **3051-3561** | — → **3051-3553** |
| GJEFM — Global Journal of Education, Finance and Management | 3049-7019 → **3117-6771** | — → **3117-6763** |

- **Applied to the live database** (project `uxvukpvbznddlzpjceeo`) and **verified**.
- **Captured as a repeatable migration:** `supabase/migrations/20260806120000_fix_journal_issns.sql`.
- Confirmed the corrected ISSNs now appear in server HTML on `/journals`, `/journals/[abbrev]`, `/indexing`, each article's `citation_issn` + `Periodical` schema, and `/llms.txt`.

No article text, journal descriptions, or page copy were altered.

---

## 3. Files changed

### New files
- `lib/editorialBoard.ts` — editorial board extracted to a shared module so it can be rendered server-side (content identical to the previous inline array).
- `app/llms.txt/route.ts` — `/llms.txt` AI-retriever site map (see §6).
- `supabase/migrations/20260806120000_fix_journal_issns.sql` — ISSN correction migration.
- `.env.local` — local build credentials only (Supabase URL + public anon key + site origin). **Local/CI use; do not commit secrets.**
- `SEO_OPTIMIZATION_REPORT.md` — this report.

### Core libraries
- `lib/seo.ts` — added `buildCollectionPageLd()` and `buildBreadcrumbLd()` server helpers.
- `lib/data.ts` — added `getContentPageList(category)` (server-render the Knowledge-Centre lists), `getArticleSitemapRows()` (real sitemap `lastmod`), and the `ContentListRow` type.

### Components
- `components/MetaTags.tsx` — **deleted**. Was client-side head injection producing duplicate/conflicting tags; all imports/usages removed from the 18 views that referenced it.
- `components/SchemaOrg.tsx` — **deleted**. Was client-side JSON-LD injection duplicating `Organization`/`WebSite`/`Periodical`; all imports/usages removed.
- `components/PolicyLayout.tsx` — now emits server-side `Article` + `BreadcrumbList` JSON-LD (covers the policies index + all 13 policy sub-pages).
- `components/Footer.tsx` — added internal links (Articles, For Authors, Editorial Board, Submit, **Publish** [was orphaned], Contact) for crawl depth + link equity.

### Views (presentational)
- `views/CategoryIndex.tsx` — rewritten to render **server-provided `initialPages`** directly (content now in initial HTML); removed the client fetch, loading skeleton, client `MetaTags`, and client JSON-LD injection.
- `views/Indexing.tsx` — accepts server-seeded `initialJournals`; removed client `MetaTags`/`SchemaOrg`.
- `views/Editorial.tsx` — sources the board from `lib/editorialBoard.ts`; removed the client `useEffect` JSON-LD injection and client `MetaTags`.
- `views/Articles.tsx` — filter buttons now expose `aria-pressed` / `aria-label` / `role="group"` (accessibility).

### Routes (server components / metadata + JSON-LD)
- `app/guides/page.tsx`, `app/comparisons/page.tsx`, `app/publishing/page.tsx`, `app/resources/page.tsx` — server-fetch the list, pass `initialPages`, emit `CollectionPage` + `BreadcrumbList`; richer descriptions; `revalidate` added.
- `app/journals/page.tsx` — added `ItemList` (of `Periodical`) + `BreadcrumbList`; richer description.
- `app/articles/page.tsx` — added `ItemList` (of `ScholarlyArticle`) + `BreadcrumbList`; richer description.
- `app/articles/[id]/page.tsx` — added `BreadcrumbList`; enriched `ScholarlyArticle` (`publisher`, `isAccessibleForFree`, `sameAs` → DOI, `mainEntityOfPage`, publisher on `isPartOf`); added `citation_publisher` and `citation_keywords`.
- `app/authors/page.tsx` — added server `HowTo` (grounded in the page's real steps) + `BreadcrumbList`.
- `app/indexing/page.tsx` — server-seed journals + `CollectionPage` (with per-journal `Periodical`) + `BreadcrumbList`.
- `app/editorial/page.tsx` — server `ItemList` of `Person` (with ORCID/Scopus `sameAs`) + `BreadcrumbList`.
- `app/about/page.tsx` — `AboutPage` + `BreadcrumbList`; richer description.
- `app/contact/page.tsx` — `ContactPage` (with `ContactPoint`) + `BreadcrumbList`; richer description (was thin).
- `app/submit/page.tsx` — `WebPage` + `BreadcrumbList`; richer description (was thin).
- `app/policies/page.tsx` — `CollectionPage` + `BreadcrumbList`.
- `app/not-found.tsx` — added metadata with `noindex` (was missing entirely).
- `app/robots.ts` — disallow `/api/` and `/unsubscribe` (crawl-waste); documented that AI crawlers are welcome.
- `app/sitemap.ts` — article `lastModified` now uses real `publication_date` instead of "now".

---

## 4. Issues found → fixed

| # | Issue | Severity | Fix |
|---|---|---|---|
| 1 | Client-injected `MetaTags` duplicated/contradicted server `<title>`/description/canonical/OG/Twitter; invisible to non-JS crawlers | High | Neutralised `MetaTags`; server metadata is now sole source. Verified **1 `<title>`, 1 description** per page. |
| 2 | Client-injected `SchemaOrg` duplicated `Organization`/`WebSite`/`Periodical` JSON-LD | High | Neutralised `SchemaOrg`; server JSON-LD is authoritative. |
| 3 | `/guides`, `/comparisons`, `/publishing`, `/resources` list content client-only (skeleton in HTML) | High | Server-fetched + `initialPages`; now `○ Static`. Full list + links verified in HTML. |
| 4 | `/indexing` ISSN/DOI table client-only | Medium | Server-seeded journals; ISSN table now in HTML. |
| 5 | Six journals had placeholder e-ISSNs and no p-ISSNs | High (data integrity) | Corrected in DB + migration; verified everywhere. |
| 6 | Article pages missing `BreadcrumbList`; `ScholarlyArticle` missing publisher/access/sameAs | Medium | Added breadcrumb + enriched schema + `citation_publisher`/`citation_keywords`. |
| 7 | `/journals`, `/articles`, `/policies` (+13), `/about`, `/contact`, `/submit`, `/editorial`, `/authors` had no server JSON-LD | Medium | Added appropriate schema to each (see §3). |
| 8 | `not-found` had no metadata | Low | Added `noindex` metadata. |
| 9 | Thin meta descriptions on `/contact`, `/submit`, `/comparisons` | Low | Rewritten to be specific and useful (metadata only). |
| 10 | `/publish` was orphaned (no internal links) | Medium | Linked from the footer. |
| 11 | `robots.txt` allowed crawling `/api/` and `/unsubscribe` | Low | Disallowed. |
| 12 | Sitemap used "now" for article `lastmod` | Low | Uses real `publication_date`. |
| 13 | Article filter buttons had no pressed/label semantics | Low | Added `aria-pressed`/`aria-label`/`role="group"`. |

---

## 5. Structured-data coverage after the pass (all server-rendered)

- **Site-wide:** `Organization`, `WebSite` (+ `SearchAction` sitelinks search box).
- **Home:** `ItemList` of `Periodical`.
- **/journals:** `ItemList` of `Periodical` + `BreadcrumbList`.
- **/journals/[abbrev]:** `Periodical` (with ISSN) + `BreadcrumbList`.
- **/articles:** `ItemList` of `ScholarlyArticle` + `BreadcrumbList`.
- **/articles/[id]:** `ScholarlyArticle` (author `Person[]`, DOI `PropertyValue`, `sameAs`, publisher, `isAccessibleForFree`, `isPartOf` `Periodical`) + `BreadcrumbList` + 15 Google Scholar `citation_*` tags.
- **/guides, /comparisons, /publishing, /resources:** `CollectionPage` (+ `ItemList`) + `BreadcrumbList`.
- **/{category}/[slug] detail:** `@graph` of `BreadcrumbList` + `Article` (+ `FAQPage` where the row has FAQs) — pre-existing, retained.
- **/policies + 13 sub-pages:** `Article` + `BreadcrumbList`; index also `CollectionPage`.
- **/editorial:** `ItemList` of `Person` (ORCID/Scopus `sameAs`) + `BreadcrumbList`.
- **/authors:** `HowTo` + `BreadcrumbList`. **/about:** `AboutPage`. **/contact:** `ContactPage`. **/submit:** `WebPage`. **/publish:** `FAQPage` + `BreadcrumbList` (pre-existing).

No fabricated values: every schema field maps to real DB data or on-page content.

---

## 6. GEO / AEO measures

- **Server-first rendering** — the whole point for AI retrieval: every indexable page now returns its full content and structured data in the initial HTML (verified). AI crawlers and Scholar do not run JS.
- **Entity clarity** — consistent `@id` references (`/#organization`, `/#website`) let engines build a coherent knowledge graph; `Person` + ORCID/Scopus and `Periodical` + ISSN strengthen entity + author authority (E-E-A-T).
- **`/llms.txt`** — a curated, token-efficient Markdown map of the publisher, its six journals (with correct ISSNs), key pages, and policies. Note: Google states `llms.txt` is **not required** for its AI features; it is an additive, low-cost hedge for other AI tooling and does not replace `robots.txt`/`sitemap.xml`.
- **Answer-extraction structure** — `BreadcrumbList`, `CollectionPage`/`ItemList`, and `FAQPage` (where present) give answer engines clean, quotable, well-scoped units.

Sources on current best practice consulted during the pass: [Google Scholar inclusion guidelines](https://scholar.google.com/intl/en/scholar/inclusion.html), [Google Search AI-features guidance](https://developers.google.com/search/docs), [llms.txt overview](https://www.bluehost.com/blog/what-is-llms-txt/), [GEO best practices 2026](https://www.firebrand.marketing/2025/12/geo-best-practices-2026/).

---

## 7. Performance & accessibility

- **Performance (already strong, retained):** fonts self-hosted via `next/font` (no render-blocking Google Fonts); ISR/SSG prerendering across the board; `poweredByHeader:false`. First Load JS ~102 kB shared — reasonable. No regressions introduced (all changes are server-side metadata/schema or data-seeding).
- **Accessibility:** one `<h1>` per page; `<header>/<nav>/<main>/<footer>` landmarks present; the two `<img>` tags have `alt`; header logo carries `width/height/fetchPriority`. Added `aria-pressed`/`role="group"` to the article filter.

---

## 8. Remaining recommendations (not done — optional follow-ups)

1. **Restore build-time type/lint checking:** `next.config.mjs` sets `typescript.ignoreBuildErrors` and `eslint.ignoreDuringBuilds` to `true`. Refresh Supabase generated types (`supabase gen types typescript`) and re-enable both for long-term safety.
3. **`next/image`:** currently unused; the site uses one small `<img>` logo, so impact is low. Adopt `next/image` if larger imagery is introduced.
4. **Journal DOI display fallback:** `/indexing` falls back to a synthesised DOI pattern (`10.65150/EP-<abbrev>`) when `journal_doi` is null — populate `journals.journal_doi` with the real registered values to avoid displaying a placeholder.
5. **`/publication-process`** and `/publish` have similar intent to Knowledge-Centre pages; consider consolidating anchor text to avoid internal-link ambiguity.
6. **`sameAs` for the Organization:** add real external profiles (Crossref member page, ROR, social) to strengthen the entity in the Knowledge Graph.

---

## 9. Manual steps (cannot be automated here)

1. **Deploy** the updated codebase (Vercel). The ISSN DB change is already live, but the new pages/schema require a deploy to serve.
2. **Google Search Console:** submit/resubmit `https://www.ep-journals.org/sitemap.xml`; use URL Inspection → *Request indexing* on `/journals`, `/articles`, `/indexing`, `/editorial`, and the Knowledge-Centre pages so the newly server-rendered content and corrected ISSNs are recrawled.
3. **Bing Webmaster Tools:** submit the same sitemap; consider enabling **IndexNow** for faster recrawl.
4. **Rich Results / Schema validation:** run key URLs through the [Rich Results Test](https://search.google.com/test/rich-results) and [Schema Markup Validator](https://validator.schema.org/) after deploy (article, journal, guide, policy, editorial).
5. **Google Scholar:** re-fetch a few article URLs to confirm the corrected `citation_issn` and `citation_publisher` are picked up.
6. **Crossref / DOAJ / ISSN portal:** ensure the corrected ISSNs match the registered records at the ISSN International Centre and in Crossref/DOAJ metadata so identifiers are consistent across discovery services.
7. **Secrets hygiene:** `.env.local` was created for the local build; keep production env vars in Vercel and do not commit real secrets.
