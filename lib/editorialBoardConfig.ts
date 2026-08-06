// Shared constants for the Editorial Board Recruitment System — imported by both
// the client form and the server API route so validation stays in lockstep.

export const JOURNALS = [
  { abbrev: "GJETR", title: "Global Journal of Engineering and Technology Research" },
  { abbrev: "JEFRR", title: "Journal of Economic, Finance Research and Review" },
  { abbrev: "JMRR", title: "Journal of Management Research and Review" },
  { abbrev: "JNSRR", title: "Journal of Natural Science Research and Review" },
  { abbrev: "JSSHRS", title: "Journal of Social Science and Human Research Studies" },
  { abbrev: "GJEFM", title: "Global Journal of Education, Finance and Management" },
] as const;

export const JOURNAL_ABBREVS = JOURNALS.map((j) => j.abbrev);

export const RESEARCH_AREAS = [
  "Engineering & Technology",
  "Computer Science & Information Systems",
  "Economics & Finance",
  "Management & Business",
  "Natural Sciences",
  "Mathematics & Statistics",
  "Social Sciences & Humanities",
  "Education",
  "Health & Medical Sciences",
  "Environmental Sciences",
  "Other",
] as const;

export const QUALIFICATIONS = [
  "PhD / Doctorate",
  "Postdoctoral",
  "Master's Degree",
  "Other",
] as const;

export const REVIEW_CAPACITY_OPTIONS = [
  "1 manuscript per month",
  "2 manuscripts per month",
  "3 manuscripts per month",
  "4 manuscripts per month",
  "5+ manuscripts per month",
] as const;

export const STATUS_OPTIONS = [
  "pending",
  "under_review",
  "shortlisted",
  "approved",
  "rejected",
] as const;
export type ApplicationStatus = (typeof STATUS_OPTIONS)[number];

export const STATUS_LABELS: Record<ApplicationStatus, string> = {
  pending: "Pending",
  under_review: "Under review",
  shortlisted: "Shortlisted",
  approved: "Approved",
  rejected: "Rejected",
};

// File upload rules (must match the storage bucket config in the migration).
export const CV_MAX_BYTES = 10 * 1024 * 1024; // 10 MB
export const CV_ALLOWED_MIME = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
export const CV_ALLOWED_EXT = [".pdf", ".doc", ".docx"];
export const CV_ACCEPT_ATTR = ".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document";

// ORCID iD: four groups of four digits, final character may be X (checksum).
// Accepts a bare iD or an orcid.org URL (the URL is normalised server-side).
export const ORCID_REGEX = /^(\d{4}-){3}\d{3}[\dX]$/;

export function normalizeOrcid(input: string): string {
  return input.trim().replace(/^https?:\/\/(www\.)?orcid\.org\//i, "").replace(/\/$/, "");
}

export const STORAGE_BUCKET = "editorial-board-cvs";
