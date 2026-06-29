/** Mirrors the Supabase `journals` table (from the existing useJournals hook). */
export interface Journal {
  id: string;
  abbrev: string;
  title: string;
  subtitle: string | null;
  print_issn: string | null;
  electronic_issn: string | null;
  doi_prefix: string | null;
  journal_doi: string | null;
  frequency: string;
  established: string | null;
  scope_short: string;
  aims_and_scope: string | null;
  subject_areas: string[];
  external_url: string;
  submission_url: string | null;
  contact_email: string;
  license: string;
  access_model: string;
  status: string;
  display_order: number;
  color_token: string | null;
}

/** Mirrors the Supabase `articles` table (from the existing Admin + ArticleDetail pages). */
export interface Article {
  id: string;
  title: string;
  authors: string; // comma-separated in the DB
  abstract: string;
  keywords: string[] | null;
  doi: string | null;
  journal_abbrev: string;
  journal_name: string;
  publication_date: string;
  volume: string | null;
  issue: string | null;
  pages: string | null;
  status: string;
  article_url: string | null; // OJS landing page — the version of record
  pdf_url: string | null; // OJS galley PDF
}
