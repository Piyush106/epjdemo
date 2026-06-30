-- OAI-PMH ingestion schedule.
-- Calls the `ingest-oai` Edge Function every 3 days via pg_cron + pg_net.
-- Idempotent: safe to re-run.
--
-- One-time prerequisites (see supabase/README.md for the full checklist):
--   1. Deploy the function:   supabase functions deploy ingest-oai --no-verify-jwt
--   2. Set function secrets:  supabase secrets set INGEST_SECRET=... SITE_URL=... REVALIDATE_SECRET=...
--   3. Store the endpoint + ingest secret in Vault (statements below, run once).

create extension if not exists pg_cron;
create extension if not exists pg_net;

-- Store the function URL + shared secret in Vault so they are not hard-coded in
-- the cron command. Replace the placeholders and run these ONCE (re-running with
-- the same name errors; use vault.update_secret to change a value later).
--
--   select vault.create_secret(
--     'https://uxvukpvbznddlzpjceeo.supabase.co/functions/v1/ingest-oai',
--     'oai_ingest_url'
--   );
--   select vault.create_secret('<your-INGEST_SECRET>', 'oai_ingest_secret');

-- (Re)schedule the 3-day job.
do $$
begin
  if exists (select 1 from cron.job where jobname = 'oai-ingest-3d') then
    perform cron.unschedule('oai-ingest-3d');
  end if;
end
$$;

select cron.schedule(
  'oai-ingest-3d',
  '0 3 */3 * *',  -- 03:00 UTC on every 3rd day of the month
  $$
  select net.http_post(
    url     := (select decrypted_secret from vault.decrypted_secrets where name = 'oai_ingest_url'),
    headers := jsonb_build_object(
      'Content-Type',    'application/json',
      'x-ingest-secret', (select decrypted_secret from vault.decrypted_secrets where name = 'oai_ingest_secret')
    ),
    body    := '{}'::jsonb,
    timeout_milliseconds := 120000
  );
  $$
);
