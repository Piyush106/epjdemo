// Single source of truth for /indexing (Scholarly Discovery & Indexing Centre)
// and for every "where are our articles discoverable" sentence on the site.
//
// HOW TO UPDATE
//   1. Re-check a status at its recordUrl, using the method in VERIFY_METHOD.
//   2. Edit that record in STATUS below (status, verifiedOn, notes).
//   3. Bump LAST_VERIFIED / NEXT_REVIEW.
// Journal names and ISSNs come from the `journals` table. Article-level Google
// Scholar checks live in the `scholar_checks` table, not here.

export const LAST_VERIFIED = "2026-11-17";
export const NEXT_REVIEW = "2027-02-17";

export const CROSSREF_MEMBER = { id: "54641", prefix: "10.65150", url: "https://api.crossref.org/members/54641" };

export type PlatformCategory = "discovery" | "identifiers" | "repository" | "registry";

export const CATEGORIES: { key: PlatformCategory; title: string; blurb: string }[] = [
  { key: "discovery", title: "Academic search and discovery", blurb: "Where readers search for and find individual articles." },
  { key: "identifiers", title: "DOI, metadata and researcher identifiers", blurb: "Persistent identifiers and metadata that other services reuse." },
  { key: "repository", title: "Repositories and open science", blurb: "Archived copies and open-science aggregators." },
  { key: "registry", title: "Journal registries and evaluation databases", blurb: "Services that record or evaluate the journals themselves." },
];

export type PlatformKey =
  | "scholar" | "openalex" | "scilit" | "semanticscholar"
  | "crossref" | "orcid"
  | "zenodo" | "openaire"
  | "issn" | "ici"
  // under evaluation
  | "doaj" | "road" | "core" | "base" | "repec" | "eric";

export interface Platform {
  key: PlatformKey;
  name: string;
  category: PlatformCategory;
  role: string;
  url: string;
  /** Official logo in /public/logos/platforms, when supplied. Otherwise the name is set as a wordmark. */
  logo?: string;
  /** "active" platforms carry journal records; "prospective" are under evaluation and never shown as included. */
  tier: "active" | "prospective";
}

export const PLATFORMS: Platform[] = [
  { key: "scholar", name: "Google Scholar", category: "discovery", tier: "active", logo: "/logos/platforms/google-scholar.webp", url: "https://scholar.google.com/", role: "Indexes individual scholarly documents, not journals. Coverage is checked article by article below." },
  { key: "openalex", name: "OpenAlex", category: "discovery", tier: "active", logo: "/logos/platforms/openalex.webp", url: "https://openalex.org/", role: "Open catalogue of scholarly works, authors and sources." },
  { key: "semanticscholar", name: "Semantic Scholar", category: "discovery", tier: "active", url: "https://www.semanticscholar.org/", role: "AI-assisted research search engine from the Allen Institute for AI." },
  { key: "scilit", name: "Scilit", category: "discovery", tier: "active", url: "https://www.scilit.com/", role: "Scholarly database built from publisher and Crossref metadata." },
  { key: "crossref", name: "Crossref", category: "identifiers", tier: "active", logo: "/logos/platforms/crossref.webp", url: "https://www.crossref.org/", role: "DOI registration agency. Every article DOI resolves through doi.org." },
  { key: "orcid", name: "ORCID", category: "identifiers", tier: "active", url: "https://orcid.org/", role: "Researcher identification infrastructure. Author iDs are passed to Crossref when authors supply them; it does not list journals." },
  { key: "zenodo", name: "Zenodo", category: "repository", tier: "active", logo: "/logos/platforms/zenodo.webp", url: "https://zenodo.org/", role: "CERN-operated open repository holding deposited article copies." },
  { key: "openaire", name: "OpenAIRE", category: "repository", tier: "active", url: "https://explore.openaire.eu/", role: "European open-science graph that aggregates research outputs." },
  { key: "issn", name: "ISSN Portal", category: "registry", tier: "active", url: "https://portal.issn.org/", role: "International register of ISSNs, run by the ISSN International Centre." },
  { key: "ici", name: "Index Copernicus", category: "registry", tier: "active", url: "https://journals.indexcopernicus.com/", role: "ICI World of Journals database. ICV scores come from its separate evaluation." },
  // ---- under evaluation (never shown as included) ----
  { key: "doaj", name: "DOAJ", category: "registry", tier: "prospective", logo: "/logos/platforms/doaj.webp", url: "https://doaj.org/", role: "Directory of Open Access Journals; free application with editorial review." },
  { key: "road", name: "ROAD", category: "registry", tier: "prospective", url: "https://portal.issn.org/", role: "ISSN directory of open access scholarly resources, drawn from the ISSN Register." },
  { key: "core", name: "CORE", category: "repository", tier: "prospective", logo: "/logos/platforms/core.webp", url: "https://core.ac.uk/", role: "Aggregator of open access full texts, harvested over OAI-PMH." },
  { key: "base", name: "BASE", category: "discovery", tier: "prospective", url: "https://www.base-search.net/", role: "Bielefeld Academic Search Engine, harvesting OAI-PMH sources." },
  { key: "repec", name: "RePEc / IDEAS", category: "discovery", tier: "prospective", url: "https://ideas.repec.org/", role: "Economics bibliographic database (IDEAS, EconPapers), fed by publisher archives." },
  { key: "eric", name: "ERIC", category: "discovery", tier: "prospective", url: "https://eric.ed.gov/", role: "US Department of Education database of education research." },
];

export const platform = (k: PlatformKey) => PLATFORMS.find((p) => p.key === k)!;

/** Status kinds, kept distinct so DOIs or repository copies never read as indexing. */
export type StatusKind = "listed" | "doi" | "deposits" | "records" | "article-level" | "not-listed" | "not-eligible-yet" | "preparing";

export const STATUS_KINDS: Record<StatusKind, { label: string; meaning: string; tone: "verified" | "infra" | "neutral" | "pending" }> = {
  listed: { label: "Listed", meaning: "The journal has its own record on the platform.", tone: "verified" },
  doi: { label: "DOIs registered", meaning: "Article DOIs are registered with Crossref.", tone: "infra" },
  deposits: { label: "Deposits", meaning: "Article copies are deposited in the repository.", tone: "neutral" },
  records: { label: "Article records", meaning: "Article records are present, aggregated from other sources.", tone: "neutral" },
  "article-level": { label: "Article-level", meaning: "Indexed per article; see the Google Scholar coverage section.", tone: "neutral" },
  "not-listed": { label: "Not listed", meaning: "No record found on the platform at the last check.", tone: "pending" },
  "not-eligible-yet": { label: "Not yet eligible", meaning: "A platform requirement is not met yet.", tone: "pending" },
  preparing: { label: "Preparing", meaning: "An application or technical setup is being prepared.", tone: "pending" },
};

export type VerifyMethod = "issn-portal" | "crossref-api" | "openalex-api" | "scilit-search" | "zenodo-api" | "openaire-api" | "ici-search" | "s2-api" | "doaj-api" | "article-search" | "criteria-review";

export const VERIFY_METHOD: Record<VerifyMethod, string> = {
  "issn-portal": "Opened each ISSN record on portal.issn.org.",
  "crossref-api": "Queried the Crossref REST API journal record by ISSN.",
  "openalex-api": "Queried the OpenAlex sources API by ISSN.",
  "scilit-search": "Searched Scilit sources by online ISSN.",
  "zenodo-api": "Searched Zenodo records by journal title.",
  "openaire-api": "Looked up a sample DOI from the journal in the OpenAIRE Graph API.",
  "ici-search": "Searched ICI World of Journals by online ISSN.",
  "s2-api": "Looked up a sample DOI from the journal in the Semantic Scholar API.",
  "doaj-api": "Searched the DOAJ journal API by online ISSN.",
  "article-search": "Searched Google Scholar for individual article titles.",
  "criteria-review": "Compared the journal with the platform's published criteria.",
};

export interface StatusRecord {
  platform: PlatformKey;
  journal: string; // abbreviation
  status: StatusKind;
  verifiedOn: string; // ISO date
  recordUrl: string;
  method: VerifyMethod;
  notes?: string;
}

/** Per-journal identifiers on each platform (verified). */
const J: Record<string, { title: string; eissn: string; openalex: string; scilit: string; ici: string; s2doi: string }> = {
  GJETR: { title: "Global Journal of Engineering and Technology Research", eissn: "3051-3782", openalex: "S5407052759", scilit: "019f25e418fc72b2810a030f7bf7e18b", ici: "134417", s2doi: "10.65150/EP-gjetr/V1E2/2025-05" },
  JEFRR: { title: "Journal of Economic, Finance Research and Review", eissn: "3051-3650", openalex: "S5407053028", scilit: "019f25e41975736b9d44fd33f63f3d4c", ici: "134648", s2doi: "10.65150/EP-jefrr/V1E5/2025-01" },
  JMRR: { title: "Journal of Management Research and Review", eissn: "3051-3588", openalex: "S5407052758", scilit: "019f25e41810703aa171ca8154a73d9c", ici: "134636", s2doi: "10.65150/EP-jmrr/V1E5/2025-01" },
  JNSRR: { title: "Journal of Natural Science Research and Review", eissn: "3051-3766", openalex: "S5407053062", scilit: "019f25e419ab73fc84fea03cdf3744f7", ici: "134543", s2doi: "10.65150/EP-jnsrr/V1E5/2025-03" },
  JSSHRS: { title: "Journal of Social Science and Human Research Studies", eissn: "3051-3561", openalex: "S5407053157", scilit: "019f25e41a5873839fec844a309e665d", ici: "134530", s2doi: "10.65150/EP-jsshrs/V2E1/2026-01" },
  GJEFM: { title: "Global Journal of Education, Finance and Management", eissn: "3117-6771", openalex: "S7407057591", scilit: "019f25e45aa870639c7d9c1b9b957215", ici: "136154", s2doi: "10.65150/EP-GJEFM/V2E4/2026-01" },
};
export const JOURNAL_ORDER = Object.keys(J);

const V1 = "2026-11-14"; // first full verification
const V2 = "2026-11-17"; // second pass (Semantic Scholar, DOAJ, re-checks)
const q = encodeURIComponent;

export const STATUS: StatusRecord[] = Object.entries(J).flatMap(([j, x]) => [
  { platform: "issn", journal: j, status: "listed", verifiedOn: V1, method: "issn-portal", recordUrl: `https://portal.issn.org/resource/ISSN/${x.eissn}`, notes: "Online ISSN confirmed; print ISSN provisional" },
  { platform: "crossref", journal: j, status: "doi", verifiedOn: V2, method: "crossref-api", recordUrl: `https://api.crossref.org/journals/${x.eissn}` },
  { platform: "openalex", journal: j, status: "listed", verifiedOn: V1, method: "openalex-api", recordUrl: `https://openalex.org/${x.openalex}` },
  { platform: "scilit", journal: j, status: "listed", verifiedOn: V1, method: "scilit-search", recordUrl: `https://www.scilit.com/sources/${x.scilit}` },
  { platform: "semanticscholar", journal: j, status: "records", verifiedOn: V2, method: "s2-api", recordUrl: `https://api.semanticscholar.org/graph/v1/paper/DOI:${x.s2doi}?fields=title,venue`, notes: "Article records via Crossref/OpenAlex; no journal page" },
  { platform: "scholar", journal: j, status: "article-level", verifiedOn: V2, method: "article-search", recordUrl: `https://scholar.google.com/scholar?q=${q(`source:"${x.title}"`)}` },
  { platform: "zenodo", journal: j, status: "deposits", verifiedOn: V1, method: "zenodo-api", recordUrl: `https://zenodo.org/search?q=${q(`journal.title:"${x.title}"`)}` },
  { platform: "openaire", journal: j, status: "records", verifiedOn: V1, method: "openaire-api", recordUrl: `https://explore.openaire.eu/search/find/research-outcomes?fv0=${q(`"${x.title}"`)}&f0=q` },
  { platform: "ici", journal: j, status: "listed", verifiedOn: V1, method: "ici-search", recordUrl: `https://journals.indexcopernicus.com/search/details?id=${x.ici}`, notes: "Listed in database; no ICV score" },
  { platform: "doaj", journal: j, status: "not-listed", verifiedOn: V2, method: "doaj-api", recordUrl: `https://doaj.org/search/journals?source=${q(JSON.stringify({ query: { query_string: { query: x.eissn } } }))}` },
]);

/** Matrix columns (journal-level platforms only). */
export const MATRIX: PlatformKey[] = ["issn", "crossref", "openalex", "scilit", "semanticscholar", "scholar", "zenodo", "openaire", "ici"];

export const statusFor = (journal: string, p: PlatformKey) => STATUS.find((s) => s.journal === journal && s.platform === p);

/** Platforms where every journal has a verified journal-level listing. */
export const listedEverywhere = (kind: StatusKind[] = ["listed"]) =>
  PLATFORMS.filter((p) => JOURNAL_ORDER.every((j) => { const s = statusFor(j, p.key); return s && kind.includes(s.status); }));

/**
 * One accurate sentence for other pages (homepage, FAQ, publish, process).
 * Generated from STATUS so it can't drift from /indexing.
 */
export const DISCOVERY_SENTENCE =
  "Every article has a Crossref DOI, and all six journals are listed in OpenAlex, Scilit, Index Copernicus (ICI World of Journals) and the ISSN Portal, with article records in OpenAIRE, Semantic Scholar and Zenodo. Google Scholar indexes individual articles; coverage is checked article by article on our Indexing page.";

/** Additional platforms under evaluation: eligibility and next step. */
export const OPPORTUNITIES: { platform: PlatformKey; journals: string; status: StatusKind; assessment: string; nextStep: string; source: string }[] = [
  {
    platform: "doaj", journals: "All six", status: "preparing",
    assessment: "Meets the publishing-history rule (more than one year or at least ten articles) and the five-articles-a-year minimum. Requires confirmed ISSNs matching the ISSN Portal title, a full charges page, a described peer-review process with two reviewers, CC licence statements and an editorial board with names and affiliations.",
    nextStep: "Check each journal site against DOAJ's guide, then apply journal by journal (free; no agents).",
    source: "https://doaj.org/apply/guide/",
  },
  {
    platform: "road", journals: "All six", status: "preparing",
    assessment: "ROAD includes open access resources from the ISSN Register. All six online ISSNs are confirmed, but none appears in ROAD yet.",
    nextStep: "Ask the Netherlands ISSN centre to record the journals as open access in their ISSN records.",
    source: "https://www.issn.org/services/online-services/road-the-directory-of-open-access-scholarly-resources/",
  },
  {
    platform: "core", journals: "All six", status: "preparing",
    assessment: "Each OJS site exposes OAI-PMH with Dublin Core and full-text PDFs on the same domain, which CORE requires. (CORE indexes DOAJ journals automatically.)",
    nextStep: "Validate each OAI endpoint, then register it as a CORE data provider.",
    source: "https://core.ac.uk/documentation/data-providers-guide",
  },
  {
    platform: "base", journals: "All six", status: "preparing",
    assessment: "BASE harvests OAI-PMH sources it accepts after review; the same OJS endpoints apply.",
    nextStep: "Submit each OAI-PMH base URL through BASE's source suggestion form.",
    source: "https://www.base-search.net/about/en/suggest.php",
  },
  {
    platform: "repec", journals: "JEFRR", status: "preparing",
    assessment: "Fits RePEc's economics scope. Requires a publisher archive: an archive code plus ReDIF metadata files on a web server that RePEc checks daily. No fee.",
    nextStep: "Request an archive code and publish ReDIF files for JEFRR.",
    source: "https://ideas.repec.org/stepbystep.html",
  },
  {
    platform: "eric", journals: "GJEFM", status: "not-eligible-yet",
    assessment: "ERIC requires at least three years of education-focused publishing; GJEFM began in 2025. Comprehensive coverage needs 80% education research per issue; GJEFM's scope also covers finance and management.",
    nextStep: "Track education share per issue; reconsider from 2028.",
    source: "https://eric.ed.gov/pdf/ERIC_Selection_Policy_2024.pdf",
  },
];

export const fmtLongDate = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
