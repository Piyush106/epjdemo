// Manuscript (paper) templates, one per journal. Files live in
// public/templates/<slug>-manuscript-template.docx and serve from the site root
// at /templates/<slug>-manuscript-template.docx. To update a template, replace
// the file in public/templates and refresh the size label here.

export interface JournalTemplate {
  /** Journal abbreviation (matches journals.abbrev). */
  abbrev: string;
  /** Public URL of the .docx (relative to site root). */
  href: string;
  /** Human-readable file size for display. */
  size: string;
}

const FILE = (slug: string) => `/templates/${slug}-manuscript-template.docx`;

export const JOURNAL_TEMPLATES: Record<string, JournalTemplate> = {
  GJETR: { abbrev: "GJETR", href: FILE("gjetr"), size: "232 KB" },
  JEFRR: { abbrev: "JEFRR", href: FILE("jefrr"), size: "702 KB" },
  JMRR: { abbrev: "JMRR", href: FILE("jmrr"), size: "637 KB" },
  JNSRR: { abbrev: "JNSRR", href: FILE("jnsrr"), size: "989 KB" },
  JSSHRS: { abbrev: "JSSHRS", href: FILE("jsshrs"), size: "146 KB" },
  GJEFM: { abbrev: "GJEFM", href: FILE("gjefm"), size: "449 KB" },
};

/** Download filename presented to the user (descriptive, journal-specific). */
export function templateDownloadName(abbrev: string): string {
  return `EP-Journals-${abbrev.toUpperCase()}-Manuscript-Template.docx`;
}

export function templateFor(abbrev: string | null | undefined): JournalTemplate | undefined {
  return abbrev ? JOURNAL_TEMPLATES[abbrev.toUpperCase()] : undefined;
}

export const DOCX_MIME = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
