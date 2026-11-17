-- Website search foundation (applied 2026-11-17 in parts): extensions,
-- normaliser and helper functions, site_pages table, and generated search
-- columns + indexes on articles and content_pages. Additive only.
create extension if not exists pg_trgm with schema extensions;
create extension if not exists unaccent with schema extensions;
create extension if not exists fuzzystrmatch with schema extensions;

create or replace function public.search_norm(t text) returns text
language sql immutable parallel safe strict set search_path = '' as $$
  select btrim(regexp_replace(regexp_replace(lower(extensions.unaccent('extensions.unaccent'::regdictionary, t)), '[^a-z0-9]+', ' ', 'g'), '\s+', ' ', 'g'))
$$;
create or replace function public.search_join(a text[]) returns text
language sql immutable parallel safe set search_path = '' as $$ select coalesce(array_to_string(a, ' '), '') $$;
create or replace function public.search_strip_html(t text) returns text
language sql immutable parallel safe set search_path = '' as $$ select regexp_replace(coalesce(t,''), '<[^>]+>', ' ', 'g') $$;

create table if not exists public.site_pages (
  path text primary key, title text not null, description text, body text, section text,
  indexed_at timestamptz not null default now(),
  search_title text generated always as (public.search_norm(title)) stored,
  search_fts tsvector generated always as (
    setweight(to_tsvector('english', public.search_norm(title)), 'A') ||
    setweight(to_tsvector('english', public.search_norm(coalesce(description,''))), 'B') ||
    setweight(to_tsvector('english', public.search_norm(left(coalesce(body,''), 30000))), 'C')) stored
);
alter table public.site_pages enable row level security;
create policy "public read site_pages" on public.site_pages for select using (true);
create index if not exists site_pages_search_fts_idx on public.site_pages using gin (search_fts);

alter table public.articles add column if not exists search_title text generated always as (public.search_norm(coalesce(title,''))) stored;
alter table public.articles add column if not exists search_authors text generated always as (public.search_norm(coalesce(authors,''))) stored;
alter table public.articles add column if not exists search_fts tsvector generated always as (
  setweight(to_tsvector('english'::regconfig, public.search_norm(coalesce(title,''))), 'A') ||
  setweight(to_tsvector('simple'::regconfig, public.search_norm(coalesce(authors,''))), 'B') ||
  setweight(to_tsvector('english'::regconfig, public.search_norm(public.search_join(keywords))), 'B') ||
  setweight(to_tsvector('simple'::regconfig, public.search_norm(coalesce(doi,''))), 'B') ||
  setweight(to_tsvector('english'::regconfig, public.search_norm(coalesce(left(abstract, 6000),''))), 'C')) stored;
create index if not exists articles_search_fts_idx on public.articles using gin (search_fts);
create index if not exists articles_search_title_trgm on public.articles using gin (search_title extensions.gin_trgm_ops);
create index if not exists articles_search_authors_trgm on public.articles using gin (search_authors extensions.gin_trgm_ops);

alter table public.content_pages add column if not exists search_title text generated always as (public.search_norm(coalesce(title,''))) stored;
alter table public.content_pages add column if not exists search_fts tsvector generated always as (
  setweight(to_tsvector('english'::regconfig, public.search_norm(coalesce(title,''))), 'A')) stored;  -- expression replaced in 20261117130000
create index if not exists content_pages_search_fts_idx on public.content_pages using gin (search_fts);
create index if not exists content_pages_search_title_trgm on public.content_pages using gin (search_title extensions.gin_trgm_ops);
