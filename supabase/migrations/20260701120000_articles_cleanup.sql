-- Minor schema cleanup for the articles table. Safe/idempotent.
--   1. Give id a DB default so inserts no longer need a client-supplied UUID
--      (the ingest-oai workaround still works; this just makes it unnecessary).
--   2. Drop the legacy `journal` and `slug` columns — unused by the app
--      (which uses journal_abbrev/journal_name and routes by id).

create extension if not exists pgcrypto;  -- provides gen_random_uuid()

alter table public.articles alter column id set default gen_random_uuid();
alter table public.articles drop column if exists journal;
alter table public.articles drop column if exists slug;
