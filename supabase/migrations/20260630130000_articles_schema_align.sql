-- Align the live `articles` table with the schema the app + ingestion expect.
-- The live table predates the OJS-discovery model: it has legacy `journal`/`slug`
-- columns but lacks journal_abbrev/journal_name/publication_date/pages/article_url
-- (which lib/data.ts, the article pages, the sitemap, and ingest-oai all require).
-- Idempotent; safe to re-run.

alter table public.articles
  add column if not exists journal_abbrev   text,
  add column if not exists journal_name     text,
  add column if not exists publication_date date,
  add column if not exists pages            text,
  add column if not exists article_url      text;

-- Legacy `journal` is unused by the app and never set by the loader/ingestion;
-- relax NOT NULL so inserts that populate journal_abbrev/journal_name succeed.
alter table public.articles alter column journal drop not null;

-- Indexes for the listing query (order by date), journal filter, and the
-- ingestion dedupe-by-article_url lookup.
create index if not exists articles_pubdate_idx        on public.articles (publication_date desc);
create index if not exists articles_journal_abbrev_idx on public.articles (journal_abbrev);
create index if not exists articles_article_url_idx    on public.articles (article_url);
