-- Submission infrastructure for the manuscript submit form
-- (views/SubmitManuscript.tsx). The new project was missing the table + the
-- storage upload policy, so the form failed at the file-upload/insert step.
-- Idempotent.

create table if not exists public.manuscript_submissions (
  id                    uuid primary key default gen_random_uuid(),
  journal_name          text not null,
  author_name           text not null,
  author_email          text not null,
  affiliation           text,
  country               text,
  paper_title           text not null,
  abstract              text,
  keywords              text,
  file_path             text,
  file_name             text,
  comments              text,
  declaration_confirmed boolean default false,
  status                text default 'pending',
  created_at            timestamptz default now(),
  updated_at            timestamptz default now()
);

alter table public.manuscript_submissions enable row level security;

-- Anyone (anon) may submit; nobody but service_role/admin may read (privacy —
-- submissions contain personal data). Service role bypasses RLS for the admin UI.
drop policy if exists "anon can submit manuscripts" on public.manuscript_submissions;
create policy "anon can submit manuscripts"
  on public.manuscript_submissions for insert
  to anon, authenticated
  with check (true);

-- Storage: allow uploads into the manuscript-files bucket (the form uploads the
-- manuscript client-side before invoking notify-submission). Reads stay locked.
drop policy if exists "anon can upload manuscript files" on storage.objects;
create policy "anon can upload manuscript files"
  on storage.objects for insert
  to anon, authenticated
  with check (bucket_id = 'manuscript-files');
