# Supabase — OAI-PMH article ingestion

`ingest-oai` harvests each active journal's OJS OAI-PMH feed every 3 days and
upserts records into `articles`, then triggers Next.js revalidation so the
homepage + listings show new articles immediately.

```
supabase/
  config.toml                         # CLI config (project ref + function settings)
  functions/ingest-oai/index.ts       # the Edge Function (Deno)
  migrations/20260630120000_oai_ingestion_cron.sql   # pg_cron 3-day schedule
```

## How it works

1. Loads active rows from `journals`.
2. Derives each OAI endpoint from `external_url`
   (`<external_url>/index.php/<abbrev>/oai`, or `<external_url>/oai` when the URL
   already contains `/index.php/`).
3. Harvests `oai_dc` records, following `resumptionToken` pages (cap: 50).
4. Maps Dublin Core → `articles` columns; `article_url` = OJS landing page,
   `pdf_url` = galley when present.
5. **Dedupes on `doi`, falling back to `article_url`** — existing rows update,
   new rows insert (single upsert on the `id` primary key).
6. POSTs to `${SITE_URL}/api/revalidate` to refresh cached listings.

## Deploy checklist (one time)

> Needs the Supabase CLI and the project's **service-role** access. The CLI
> reads the service-role key itself during deploy — you do not paste it anywhere.

```bash
# 1. Link the project (from repo root)
supabase link --project-ref uxvukpvbznddlzpjceeo

# 2. Set the function's secrets (generate two long random strings first)
supabase secrets set \
  INGEST_SECRET="<random-string-A>" \
  SITE_URL="https://<your-vercel-preview-or-prod-domain>" \
  REVALIDATE_SECRET="<random-string-B>"
#   SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are auto-injected — do not set them.

# 3. Deploy the function (JWT off; it is gated by INGEST_SECRET)
supabase functions deploy ingest-oai --no-verify-jwt

# 4. Smoke-test it manually (should return JSON with a per-journal summary)
curl -s -X POST \
  -H "x-ingest-secret: <random-string-A>" \
  "https://uxvukpvbznddlzpjceeo.supabase.co/functions/v1/ingest-oai" | jq
```

Then wire up the cron:

```sql
-- 5. In the Supabase SQL editor, store the endpoint + secret in Vault (run once):
select vault.create_secret(
  'https://uxvukpvbznddlzpjceeo.supabase.co/functions/v1/ingest-oai', 'oai_ingest_url'
);
select vault.create_secret('<random-string-A>', 'oai_ingest_secret');
```

```bash
# 6. Apply the cron migration
supabase db push
```

Finally, in **Vercel → Project → Settings → Environment Variables**, add
`REVALIDATE_SECRET` = `<random-string-B>` (same value as step 2) and redeploy so
`/api/revalidate` accepts the function's calls.

## Verifying

- `select jobname, schedule, active from cron.job;` → shows `oai-ingest-3d`.
- `select * from cron.job_run_details order by start_time desc limit 5;` → run log.
- After a run, `select count(*) from articles;` should grow, and the homepage /
  `/articles` should list the new items within a few seconds (revalidation).

## Notes

- `--no-verify-jwt` + the `x-ingest-secret` header is deliberate: pg_cron calls
  the function machine-to-machine, not with an end-user JWT.
- The cron expression `0 3 */3 * *` fires at 03:00 UTC on days 1, 4, 7, … of each
  month (pg_cron has no true "every 72h"; this is the standard 3-day pattern).
- oai_dc rarely carries clean volume/issue/pages; those are best-effort parsed
  from `dc:source` and may be null. Title/authors/abstract/DOI/URLs are reliable.

---

# notify-submission (manuscript submission emails)

`supabase/functions/notify-submission/index.ts` sends the editor notification
(with the manuscript attached) + author confirmation via **Resend**. It is
invoked from the submit form via `supabase.functions.invoke("notify-submission")`,
so JWT verification stays ON (the browser sends the anon key).

## Deploy (one time)

```bash
# 1. Set the Resend secret(s)
supabase secrets set \
  RESEND_API_KEY="re_xxxxxxxxxxxxxxxxxxxx" \
  EDITOR_EMAIL="editor@ep-journals.org" \
  FROM_EMAIL="EP Journals Group <onboarding@resend.dev>"

# 2. Deploy (JWT verification ON — invoked with the anon key)
supabase functions deploy notify-submission
```

## Production sender (important)

`onboarding@resend.dev` only delivers to the Resend account owner (test mode).
For real delivery, **verify the ep-journals.org domain in Resend** (add the DNS
records it gives you), then set `FROM_EMAIL="EP Journals Group <editor@ep-journals.org>"`
and redeploy. The submit form already records the submission in
`manuscript_submissions` and uploads the file to the `manuscript-files` bucket
even if email fails, so a missing/unverified key never loses a submission.
