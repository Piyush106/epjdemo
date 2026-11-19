-- Daily Crossref deposit of unregistered article DOIs.
-- Calls the `deposit-crossref` Edge Function at 05:30 UTC, after the OAI
-- ingestion and PDF mirroring jobs. Idempotent: safe to re-run.
--
-- One-time prerequisites:
--   1. Deploy the function:   supabase functions deploy deposit-crossref --no-verify-jwt
--   2. Set function secrets:  supabase secrets set CROSSREF_LOGIN_ID=... CROSSREF_PASSWORD=...
--      (INGEST_SECRET is shared with ingest-oai and already set.)
--      Without the Crossref secrets the function only reports what it would deposit.
--   3. Store the endpoint in Vault (run once):
--        select vault.create_secret(
--          'https://uxvukpvbznddlzpjceeo.supabase.co/functions/v1/deposit-crossref',
--          'crossref_deposit_url'
--        );

create extension if not exists pg_cron;
create extension if not exists pg_net;

do $$
begin
  if exists (select 1 from cron.job where jobname = 'crossref-deposit-daily') then
    perform cron.unschedule('crossref-deposit-daily');
  end if;
end
$$;

select cron.schedule(
  'crossref-deposit-daily',
  '30 5 * * *',
  $$
  select net.http_post(
    url     := (select decrypted_secret from vault.decrypted_secrets where name = 'crossref_deposit_url'),
    headers := jsonb_build_object(
      'Content-Type',    'application/json',
      'x-ingest-secret', (select decrypted_secret from vault.decrypted_secrets where name = 'oai_ingest_secret')
    ),
    body    := '{}'::jsonb,
    timeout_milliseconds := 120000
  );
  $$
);
