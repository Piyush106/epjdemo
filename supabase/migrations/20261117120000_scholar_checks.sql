-- Article-level Google Scholar checks shown on /indexing.
-- No row = not checked. not_found = not returned by a title search on that
-- date (never a rejection). other_source = closest result is a different record.
create table if not exists public.scholar_checks (
  article_id uuid primary key references public.articles(id) on delete cascade,
  status text not null check (status in ('verified','not_found','other_source')),
  scholar_url text,
  record_url text,
  source_note text,
  checked_on date not null default current_date,
  method text not null default 'Exact-title search on scholar.google.com'
);
alter table public.scholar_checks enable row level security;
create policy "public read scholar_checks" on public.scholar_checks for select using (true);
