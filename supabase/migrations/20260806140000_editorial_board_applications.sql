-- Editorial Board Recruitment System
-- Stores public applications to join the EP Journals Group editorial board and
-- the uploaded CV files. Everything is written and read exclusively through the
-- Next.js server API routes using the Supabase SERVICE ROLE key:
--   * POST /api/editorial-board/apply   (public submission — validated server-side)
--   * /api/admin/editorial-board         (admin dashboard — ADMIN_DASHBOARD_TOKEN)
-- The public anon key therefore has NO access to applicant PII or CVs.
-- Idempotent.

create table if not exists public.editorial_board_applications (
  id                      uuid primary key default gen_random_uuid(),
  -- Applicant information
  full_name               text not null,
  email                   text not null,
  phone                   text,
  country                 text not null,
  institution             text not null,
  department              text,
  current_position        text not null,
  highest_qualification   text not null,
  -- Research profiles
  orcid                   text,
  scopus_id               text,
  wos_id                  text,
  google_scholar          text,
  researchgate            text,
  linkedin                text,
  personal_website        text,
  -- Research metrics
  primary_research_area   text not null,
  secondary_research_area text,
  keywords                text,
  years_experience        integer,
  publication_count       integer,
  citation_count          integer,
  h_index                 integer,
  i10_index               integer,
  -- Narrative
  editorial_experience    text,
  motivation              text not null,
  -- Preferences
  preferred_journals      text[] not null default '{}',
  review_capacity         text not null,
  -- CV (stored in the private editorial-board-cvs bucket)
  cv_path                 text not null,
  cv_filename             text not null,
  cv_size                 integer,
  cv_mime                 text,
  -- Moderation / workflow
  status                  text not null default 'pending'
                            check (status in ('pending','under_review','shortlisted','approved','rejected')),
  admin_notes             text,
  ip_address              text,
  user_agent              text,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);

comment on table public.editorial_board_applications is
  'Public applications to join the EP Journals Group editorial board. Contains PII; access only via service-role server routes.';

create index if not exists ebapp_created_idx  on public.editorial_board_applications (created_at desc);
create index if not exists ebapp_status_idx   on public.editorial_board_applications (status);
create index if not exists ebapp_email_idx    on public.editorial_board_applications (lower(email));
create index if not exists ebapp_ip_recent_idx on public.editorial_board_applications (ip_address, created_at desc);

-- keep updated_at fresh
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

drop trigger if exists ebapp_set_updated_at on public.editorial_board_applications;
create trigger ebapp_set_updated_at before update on public.editorial_board_applications
  for each row execute function public.set_updated_at();

-- RLS: enabled with NO permissive policies → anon & authenticated get nothing.
-- The service_role key used by the server API routes bypasses RLS. This is the
-- strongest posture for a table holding personal data.
alter table public.editorial_board_applications enable row level security;
revoke all on public.editorial_board_applications from anon, authenticated;

-- Private storage bucket for CVs (10 MB cap, PDF/DOC/DOCX only). Not public;
-- downloads are served through short-lived signed URLs created by the admin API.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'editorial-board-cvs',
  'editorial-board-cvs',
  false,
  10485760,
  array[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- No storage.objects policies are added for this bucket: only the service role
-- (server routes) may upload or create signed URLs.
