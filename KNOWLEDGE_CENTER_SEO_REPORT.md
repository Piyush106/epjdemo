# Knowledge Centre — Technical SEO / AEO / GEO Audit & Optimisation

**Date:** 6 August 2026
**Scope:** The EP Journals Group Knowledge Centre — the four category indexes (`/guides`, `/comparisons`, `/publishing`, `/resources`) and all **108 published detail pages** under them (`/{category}/[slug]`), plus their rendering pipeline.
**Constraint honoured:** no educational content rewritten, no pages removed, no fabricated metadata/schema.
**Validation:** `npm run build` → exit 0, 738/738 static pages; every change confirmed present in the **server HTML** of a running `next start` server.

---

## Content inventory (audited against the live database)

| Category | Published | Uses structured blocks | HTML-only body | Has FAQs | Has related links |
|---|---|---|---|---|---|
| Guides | 55 | 51 | 4 | 55 | 55 |
| Comparisons | 12 | 11 | 1 | 12 | 12 |
| Publishing | 20 | 20 | 0 | 20 | 20 |
| Resources | 21 | 21 | 0 | 21 | 21 |
| **Total** | **108** | **103** | **5** | **108** | **108** |

Every page already had: unique slug, `meta_title`, `meta_description`, `summary`, body, FAQs, related links, and reading time. The pipeline already server-rendered the body, per-page metadata, and an `@graph` of `BreadcrumbList` + `Article` + `FAQPage`. The audit therefore focused on the genuine gaps below.

---

## Phase 1 — Issues discovered

**Crawlability / rendering**
1. **`RelatedTopics` was client-only** (`useEffect` + Supabase in `components/content/RelatedTopics.tsx`). The cross-cluster "Related topics across the knowledge centre" internal links (2 per other category + 2 same-category = up to 8 links per page) were **absent from the server HTML** — invisible to crawlers and AI retrievers, weakening the topical cluster on every one of the 108 pages. **(High)**

**Duplicate content / cannibalisation**
2. **Two published guides share the exact title** "How to Write a Research Abstract":
   - `/guides/how-to-write-a-research-abstract` — 9 blocks, 3 FAQs, 3 related links.
   - `/guides/how-to-write-research-abstract` — 23 blocks, 5 FAQs, 6 related links, richer SEO title, more recently updated.
   Both self-canonical, both in the sitemap → competing for the same query. **(High)**

**Structured data (accuracy / completeness)**
3. `Article` used `updated_at` for **both** `datePublished` and `dateModified`, though a distinct `created_at` exists → publication date overstated.
4. `Article` lacked `image`, `articleSection`, and `isAccessibleForFree` (recommended/valuable for Article rich results and GEO clarity).
5. Content detail pages lacked OpenGraph **article** fields (`article:published_time`, `article:modified_time`, `article:section`).

**Semantic HTML**
6. Table headers in `BlockRenderer` had no `scope="col"`.
7. `RelatedLinks` would render an empty `<section>` (heading, no items) if a page had no related links (defensive; not currently triggered — all pages have links).

**Metadata length (editorial — flagged, not auto-changed)**
8. **97 of 108** `meta_title` values exceed ~60 characters and **72 of 108** `meta_description` values exceed ~160 characters → likely SERP truncation. These are purpose-written editorial fields; rewriting them programmatically would risk altering meaning, so they are flagged with a locator query rather than machine-edited.
9. **50 pages** have no `keywords` (20 guides, 10 publishing, 20 resources). Low impact (meta keywords are ignored by Google; used only as `Article.keywords`); not fabricated.

**No issues found for:** missing/duplicate meta descriptions (0 dupes, 0 missing), duplicate slugs (0), missing bodies (0), missing canonicals, robots blocking (Knowledge Centre is fully allowed), sitemap inclusion (all present), or heading hierarchy (one `<h1>` per page; sections use `<h2>`/`<h3>`).

---

## Phase 2–9 — Changes implemented

### Files modified
- `components/content/RelatedTopics.tsx` — accepts server-provided `initialItems`; skips the client fetch when seeded.
- `views/DynamicContentPage.tsx` — threads a new `relatedTopics` prop into `RelatedTopics`.
- `lib/contentRoute.tsx` — fetches related topics server-side; adds the **canonical-override** mechanism; enriches the `Article` JSON-LD (real `datePublished`=`created_at` / `dateModified`=`updated_at`, `image` `ImageObject`, `articleSection`, `isAccessibleForFree`); adds OpenGraph `article:*` fields.
- `lib/data.ts` — added `getRelatedContentPages()`, added `created_at` to `ContentPageRow`, and `RelatedContentRef`.
- `app/sitemap.ts` — excludes canonical-overridden duplicates (only canonical URLs in the sitemap).
- `components/content/BlockRenderer.tsx` — `scope="col"` on table headers.
- `components/guides/RelatedLinks.tsx` — returns `null` when there are no links (no empty section).

### Phase 6 — Structured data (per detail page, all server-rendered, validated)
`@graph` of:
- **BreadcrumbList** — Home › {Category} › {Title}.
- **Article** — `headline`, `@id`, `url`, `mainEntityOfPage`, `datePublished` (created_at), `dateModified` (updated_at), `inLanguage`, `isAccessibleForFree: true`, `articleSection`, `image` (ImageObject 1200×630), `author` + `publisher` (→ `#organization`), `isPartOf` (→ `#website`), `keywords` (where present).
- **FAQPage** — every page (all 108 have genuine FAQs), `Question`/`acceptedAnswer`.
Category indexes carry **CollectionPage** (+ `ItemList`) + **BreadcrumbList** (added in the prior site-wide pass).

### Phase 7 — Internal linking
- Cross-cluster **Related topics** now server-rendered on all 108 pages (verified: 10 internal links in the HTML of a sample guide, spanning guides/comparisons/publishing/resources).
- Per-page **Related reading** links (`related_links`) were already SSR'd via props; retained.
- Contextual links in the header/footer bylines (`EPContextHeader`/`EPContextFooter`) to `/about`, `/policies/peer-review-process`, `/guides/what-is-doi`, `/submit`, `/journals` are SSR'd — retained.
- Duplicate guide consolidated so link equity concentrates on the primary.

### Phase 4 (AEO) & Phase 8 (AI readability)
- FAQ content is exposed to answer engines via server-rendered **FAQPage** schema on every page (the strongest AEO signal); questions are also visible in the HTML.
- `articleSection`, `isAccessibleForFree`, real dates, consistent `@id` entity references, and BreadcrumbList give AI systems clear topic, freshness, access, and hierarchy signals.
- Structured `body_blocks` (103/108 pages) already produce clean `<h2>/<h3>`, `<ul>/<ol>`, `<table>` with `<thead>/<th scope>`, `<blockquote>` — high extractability with minimal ambiguity.

### Phase 9 — Performance & crawlability
- Primary content, metadata, and JSON-LD are all in the initial server HTML; no JS dependency for content, and (from the earlier pass) no duplicate post-hydration metadata.
- Canonical implementation clean and self-consistent (canonical == `og:url`), verified on both the primary and the consolidated duplicate.

---

## Phase 10 — Validation results (server HTML)

- **Related topics:** 10 internal links present server-side on a sample guide (previously 0). ✓
- **Article JSON-LD:** `Article` + `BreadcrumbList` + `FAQPage` + `ImageObject`; `articleSection:"Guides"`, `isAccessibleForFree:true`, `datePublished` + `dateModified` present. ✓
- **OpenGraph:** `article:published_time`, `article:modified_time`, `article:section` present. ✓
- **Duplicate consolidation:** `/guides/how-to-write-a-research-abstract` → canonical & `og:url` = `…/how-to-write-research-abstract`; primary is self-canonical; sitemap contains **only** the primary. ✓
- **Build:** exit 0, 738/738 static pages. ✓

---

## Remaining recommendations (editorial / not auto-applied)

1. **Trim long titles/descriptions.** 97 `meta_title` > ~60 chars and 72 `meta_description` > ~160 chars will truncate in SERPs. These need human editing to preserve meaning. Locator:
   ```sql
   select category, slug, length(meta_title) tl, length(meta_description) dl
   from content_pages
   where length(meta_title) > 60 or length(meta_description) > 160
   order by category, slug;
   ```
2. **Resolve the abstract duplicate at the source.** The canonical override is a safe, reversible consolidation, but the ideal fix is editorial: merge the thin `/guides/how-to-write-a-research-abstract` into the primary and 301-redirect it, or differentiate its topic/title. Change the primary by editing `CANONICAL_OVERRIDES` in `lib/contentRoute.tsx`.
3. **Add `keywords`** to the 50 pages missing them (improves `Article.keywords` / entity signals). Do not auto-generate — author-supplied only.
4. **FAQ answer visibility:** answers live in a Radix accordion (collapsed markup) but are fully present in the server-rendered **FAQPage** schema, which is what Google/Bing consume. Optional: `forceMount` the accordion content so the answer text is also in the rendered DOM for text-only AI crawlers.
5. **Author entities:** these pages are organisationally authored (`Organization`). If named subject-matter authors exist, add `Person` authors for stronger E-E-A-T.
6. Re-enable `typescript`/`eslint` build checks (currently disabled in `next.config.mjs`) after regenerating Supabase types.

---

## Manual actions after deployment

1. **Deploy** the code (the DB is unchanged by this pass; all changes are in code).
2. **Google Search Console:** resubmit `sitemap.xml`; use URL Inspection → *Request indexing* on a few Knowledge Centre pages and on the primary abstract guide; confirm the consolidated duplicate reports "Alternate page with proper canonical tag".
3. **Rich Results / Schema validators:** test a guide, a comparison, and the abstract primary through the [Rich Results Test](https://search.google.com/test/rich-results) and [Schema Markup Validator](https://validator.schema.org/) (expect Breadcrumb, Article, FAQ).
4. **Bing Webmaster / IndexNow:** resubmit the sitemap.
5. Monitor Search Console for the abstract duplicate to drop out of the index in favour of the primary over the next few crawl cycles.
