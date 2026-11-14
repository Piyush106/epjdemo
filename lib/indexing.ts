// Single source of truth for the /indexing page: which discovery and metadata
// platforms EP Journals Group uses, and each journal's verified status on them.
//
// HOW TO UPDATE: re-check each status at its `verify` link, edit the entry below,
// then set LAST_VERIFIED / NEXT_REVIEW. Journal names and ISSNs come from the
// `journals` table, not from this file. Only record a status you have seen on
// the platform itself.

export const LAST_VERIFIED = "2026-11-14";
export const NEXT_REVIEW = "2027-02-14";

/** Crossref member record for the publisher (prefix 10.65150). */
export const CROSSREF_MEMBER = { id: "54641", prefix: "10.65150", url: "https://api.crossref.org/members/54641" };

export type PlatformCategory = "discovery" | "metadata" | "repository" | "journal-info";

export const CATEGORIES: { key: PlatformCategory; title: string; blurb: string }[] = [
  { key: "discovery", title: "Academic discovery platforms", blurb: "Search engines and scholarly databases where readers find articles." },
  { key: "metadata", title: "DOI and metadata infrastructure", blurb: "Persistent identifiers and the metadata that other services reuse." },
  { key: "repository", title: "Research repositories and open science", blurb: "Archived copies and open-science aggregators." },
  { key: "journal-info", title: "Journal information and evaluation databases", blurb: "Registries that record or evaluate the journals themselves." },
];

export type PlatformKey =
  | "issn" | "crossref" | "orcid" | "openalex" | "scilit" | "scholar" | "zenodo" | "openaire" | "ici";

export interface Platform {
  key: PlatformKey;
  name: string;
  category: PlatformCategory;
  /** One-line description of what the platform does (not a claim about our status). */
  role: string;
  url: string;
  /** Shown as a matrix column. Platforms without journal-level status (ORCID) are directory-only. */
  inMatrix: boolean;
}

export const PLATFORMS: Platform[] = [
  { key: "scholar", name: "Google Scholar", category: "discovery", role: "Web search engine for scholarly literature.", url: "https://scholar.google.com/", inMatrix: true },
  { key: "openalex", name: "OpenAlex", category: "discovery", role: "Open catalogue of scholarly works, authors and sources.", url: "https://openalex.org/", inMatrix: true },
  { key: "scilit", name: "Scilit", category: "discovery", role: "Scholarly database built from publisher and Crossref metadata.", url: "https://www.scilit.com/", inMatrix: true },
  { key: "crossref", name: "Crossref", category: "metadata", role: "DOI registration agency; every DOI resolves through doi.org.", url: "https://www.crossref.org/", inMatrix: true },
  { key: "orcid", name: "ORCID", category: "metadata", role: "Author identifiers. Included in DOI metadata when authors supply an iD.", url: "https://orcid.org/", inMatrix: false },
  { key: "zenodo", name: "Zenodo", category: "repository", role: "CERN-operated open repository holding deposited article copies.", url: "https://zenodo.org/", inMatrix: true },
  { key: "openaire", name: "OpenAIRE", category: "repository", role: "European open-science graph that aggregates research outputs.", url: "https://explore.openaire.eu/", inMatrix: true },
  { key: "issn", name: "ISSN Portal", category: "journal-info", role: "International register of ISSNs, run by the ISSN International Centre.", url: "https://portal.issn.org/", inMatrix: true },
  { key: "ici", name: "Index Copernicus (ICI World of Journals)", category: "journal-info", role: "Journal database; the separate ICI Journals Master List assigns ICV scores.", url: "https://journals.indexcopernicus.com/", inMatrix: true },
];

/**
 * Status kinds, kept deliberately distinct so a DOI registration or repository
 * copy is never presented as an indexing claim.
 */
export type StatusKind = "listed" | "doi" | "deposits" | "aggregated" | "pending";

export const STATUS_KINDS: Record<StatusKind, { label: string; meaning: string }> = {
  listed: { label: "Listed", meaning: "The journal has its own record on the platform." },
  doi: { label: "DOIs registered", meaning: "Article DOIs are registered with Crossref." },
  deposits: { label: "Deposits", meaning: "Article copies are deposited in the repository." },
  aggregated: { label: "Records", meaning: "Article records are aggregated from other sources." },
  pending: { label: "Not yet", meaning: "No record from the journal's own website yet." },
};

export interface JournalStatus {
  kind: StatusKind;
  /** Optional short qualifier, e.g. "e-ISSN confirmed; print ISSN provisional". */
  note?: string;
  /** Public page where anyone can check this status. */
  verify: string;
}

const scholarCheck = (title: string) =>
  `https://scholar.google.com/scholar?q=${encodeURIComponent(`source:"${title}"`)}`;
const zenodoCheck = (title: string) =>
  `https://zenodo.org/search?q=${encodeURIComponent(`journal.title:"${title}"`)}`;
const openaireCheck = (title: string) =>
  `https://explore.openaire.eu/search/find/research-outcomes?fv0=${encodeURIComponent(`"${title}"`)}&f0=q`;
const crossrefCheck = (issn: string) => `https://api.crossref.org/journals/${issn}`;
const issnCheck = (issn: string) => `https://portal.issn.org/resource/ISSN/${issn}`;

const ISSN_NOTE = "Online ISSN confirmed; print ISSN provisional";
const ICI_NOTE = "Listed in database; no ICV score";
const SCHOLAR_NOTE = "Not yet indexed from the journal website";

/** Verified 2026-11-14. Keyed by journal abbreviation. */
export const JOURNAL_STATUS: Record<string, Record<Exclude<PlatformKey, "orcid">, JournalStatus>> = {
  GJETR: {
    issn: { kind: "listed", note: ISSN_NOTE, verify: issnCheck("3051-3782") },
    crossref: { kind: "doi", verify: crossrefCheck("3051-3782") },
    openalex: { kind: "listed", verify: "https://openalex.org/S5407052759" },
    scilit: { kind: "listed", verify: "https://www.scilit.com/sources/019f25e418fc72b2810a030f7bf7e18b" },
    scholar: { kind: "pending", note: SCHOLAR_NOTE, verify: scholarCheck("Global Journal of Engineering and Technology Research") },
    zenodo: { kind: "deposits", verify: zenodoCheck("Global Journal of Engineering and Technology Research") },
    openaire: { kind: "aggregated", verify: openaireCheck("Global Journal of Engineering and Technology Research") },
    ici: { kind: "listed", note: ICI_NOTE, verify: "https://journals.indexcopernicus.com/search/details?id=134417" },
  },
  JEFRR: {
    issn: { kind: "listed", note: ISSN_NOTE, verify: issnCheck("3051-3650") },
    crossref: { kind: "doi", verify: crossrefCheck("3051-3650") },
    openalex: { kind: "listed", verify: "https://openalex.org/S5407053028" },
    scilit: { kind: "listed", verify: "https://www.scilit.com/sources/019f25e41975736b9d44fd33f63f3d4c" },
    scholar: { kind: "pending", note: SCHOLAR_NOTE, verify: scholarCheck("Journal of Economic, Finance Research and Review") },
    zenodo: { kind: "deposits", verify: zenodoCheck("Journal of Economic, Finance Research and Review") },
    openaire: { kind: "aggregated", verify: openaireCheck("Journal of Economic, Finance Research and Review") },
    ici: { kind: "listed", note: ICI_NOTE, verify: "https://journals.indexcopernicus.com/search/details?id=134648" },
  },
  JMRR: {
    issn: { kind: "listed", note: ISSN_NOTE, verify: issnCheck("3051-3588") },
    crossref: { kind: "doi", verify: crossrefCheck("3051-3588") },
    openalex: { kind: "listed", verify: "https://openalex.org/S5407052758" },
    scilit: { kind: "listed", verify: "https://www.scilit.com/sources/019f25e41810703aa171ca8154a73d9c" },
    scholar: { kind: "pending", note: SCHOLAR_NOTE, verify: scholarCheck("Journal of Management Research and Review") },
    zenodo: { kind: "deposits", verify: zenodoCheck("Journal of Management Research and Review") },
    openaire: { kind: "aggregated", verify: openaireCheck("Journal of Management Research and Review") },
    ici: { kind: "listed", note: ICI_NOTE, verify: "https://journals.indexcopernicus.com/search/details?id=134636" },
  },
  JNSRR: {
    issn: { kind: "listed", note: ISSN_NOTE, verify: issnCheck("3051-3766") },
    crossref: { kind: "doi", verify: crossrefCheck("3051-3766") },
    openalex: { kind: "listed", verify: "https://openalex.org/S5407053062" },
    scilit: { kind: "listed", verify: "https://www.scilit.com/sources/019f25e419ab73fc84fea03cdf3744f7" },
    scholar: { kind: "pending", note: SCHOLAR_NOTE, verify: scholarCheck("Journal of Natural Science Research and Review") },
    zenodo: { kind: "deposits", verify: zenodoCheck("Journal of Natural Science Research and Review") },
    openaire: { kind: "aggregated", verify: openaireCheck("Journal of Natural Science Research and Review") },
    ici: { kind: "listed", note: ICI_NOTE, verify: "https://journals.indexcopernicus.com/search/details?id=134543" },
  },
  JSSHRS: {
    issn: { kind: "listed", note: ISSN_NOTE, verify: issnCheck("3051-3561") },
    crossref: { kind: "doi", verify: crossrefCheck("3051-3561") },
    openalex: { kind: "listed", verify: "https://openalex.org/S5407053157" },
    scilit: { kind: "listed", verify: "https://www.scilit.com/sources/019f25e41a5873839fec844a309e665d" },
    scholar: { kind: "pending", note: SCHOLAR_NOTE, verify: scholarCheck("Journal of Social Science and Human Research Studies") },
    zenodo: { kind: "deposits", verify: zenodoCheck("Journal of Social Science and Human Research Studies") },
    openaire: { kind: "aggregated", verify: openaireCheck("Journal of Social Science and Human Research Studies") },
    ici: { kind: "listed", note: ICI_NOTE, verify: "https://journals.indexcopernicus.com/search/details?id=134530" },
  },
  GJEFM: {
    issn: { kind: "listed", note: ISSN_NOTE, verify: issnCheck("3117-6771") },
    crossref: { kind: "doi", verify: crossrefCheck("3117-6771") },
    openalex: { kind: "listed", verify: "https://openalex.org/S7407057591" },
    scilit: { kind: "listed", verify: "https://www.scilit.com/sources/019f25e45aa870639c7d9c1b9b957215" },
    scholar: { kind: "pending", note: SCHOLAR_NOTE, verify: scholarCheck("Global Journal of Education, Finance and Management") },
    zenodo: { kind: "deposits", verify: zenodoCheck("Global Journal of Education, Finance and Management") },
    openaire: { kind: "aggregated", verify: openaireCheck("Global Journal of Education, Finance and Management") },
    ici: { kind: "listed", note: ICI_NOTE, verify: "https://journals.indexcopernicus.com/search/details?id=136154" },
  },
};

/** Matrix column order: registers and identifiers first, then discovery, then repositories. */
const MATRIX_ORDER: Exclude<PlatformKey, "orcid">[] = ["issn", "crossref", "openalex", "scilit", "scholar", "zenodo", "openaire", "ici"];
export const MATRIX_PLATFORMS = MATRIX_ORDER.map((k) => PLATFORMS.find((p) => p.key === k)!) as (Platform & { key: Exclude<PlatformKey, "orcid"> })[];

/** Short column headings for the matrix. */
export const SHORT_NAME: Record<Exclude<PlatformKey, "orcid">, string> = {
  issn: "ISSN Portal", crossref: "Crossref", openalex: "OpenAlex", scilit: "Scilit",
  scholar: "Google Scholar", zenodo: "Zenodo", openaire: "OpenAIRE", ici: "Index Copernicus",
};

/** Journal-level DOI pattern; all six share the publisher prefix. */
export const doiPattern = (abbrev: string) => `${CROSSREF_MEMBER.prefix}/EP-${abbrev.toLowerCase()}/…`;

export const fmtLongDate = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
