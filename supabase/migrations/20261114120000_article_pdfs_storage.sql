-- Article PDFs in Supabase Storage (2026-11-14).
-- The main site links PDFs from the public `article-pdfs` bucket instead of
-- streaming them from OJS through Vercel. The mirror-pdfs Edge Function copies
-- each galley once and re-copies it if the OJS galley URL changes.

alter table public.articles add column if not exists pdf_storage_path text;
alter table public.articles add column if not exists pdf_mirrored_from text;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('article-pdfs', 'article-pdfs', true, 52428800, array['application/pdf'])
on conflict (id) do update set public = true, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

-- Daily at 03:30 UTC, 30 minutes after the 3-day ingest slot, copy any new PDFs.
-- Reuses the ingest secret from Vault; the URL is the ingest URL with the
-- function name swapped. Deploy first: supabase functions deploy mirror-pdfs --no-verify-jwt
do $$
begin
  if exists (select 1 from cron.job where jobname = 'pdf-mirror-daily') then
    perform cron.unschedule('pdf-mirror-daily');
  end if;
end
$$;

select cron.schedule(
  'pdf-mirror-daily',
  '30 3 * * *',
  $$
  select net.http_post(
    url     := replace((select decrypted_secret from vault.decrypted_secrets where name = 'oai_ingest_url'), 'ingest-oai', 'mirror-pdfs'),
    headers := jsonb_build_object(
      'Content-Type',    'application/json',
      'x-ingest-secret', (select decrypted_secret from vault.decrypted_secrets where name = 'oai_ingest_secret')
    ),
    body    := '{"limit": 150}'::jsonb,
    timeout_milliseconds := 150000
  );
  $$
);
