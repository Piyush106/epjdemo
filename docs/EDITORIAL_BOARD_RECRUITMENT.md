# Editorial Board Recruitment System — Setup & Deployment

A complete, production-ready system for recruiting editorial board members:
a public landing page + application form, a secure Supabase backend, CV storage,
a Resend notification to the editorial office, and a token-gated admin dashboard.

## 1. What was built

| Area | File(s) |
|---|---|
| Landing page + form (public) | `app/join-editorial-board/page.tsx`, `views/JoinEditorialBoard.tsx` |
| Shared copy (benefits/FAQ/etc.) | `lib/editorialBoardContent.ts` |
| Shared config + validation rules | `lib/editorialBoardConfig.ts` |
| Public submission API | `app/api/editorial-board/apply/route.ts` |
| Notification email template | `lib/editorialBoardEmail.ts` |
| Service-role Supabase client (server only) | `lib/supabaseAdmin.ts` |
| Admin dashboard (UI) | `app/admin/editorial-board/page.tsx`, `views/AdminEditorialBoard.tsx` |
| Admin API (list/update/CV/export) | `app/api/admin/editorial-board/route.ts` |
| Database + storage | `supabase/migrations/20260806140000_editorial_board_applications.sql` |
| Entry points | Homepage CTA (`views/Index.tsx`), `/editorial` CTA, footer link, sitemap |

The URL of the landing page is **`/join-editorial-board`**. The homepage CTA is
labelled **“Become an Editorial Board Member”**.

## 2. Required environment variables

Add these to Vercel (Production + Preview) — see `.env.example`:

| Variable | Purpose |
|---|---|
| `SUPABASE_SERVICE_ROLE_KEY` | **Server-only.** Lets the API routes insert applications, upload/read CVs. Supabase Dashboard → Project Settings → API → `service_role`. Never expose client-side. |
| `RESEND_API_KEY` | Resend API key for the notification email. |
| `EDITORIAL_FROM_EMAIL` | Verified Resend sender, e.g. `EP Journals Group <info@ep-journals.org>`. Must be on your verified domain. |
| `EDITORIAL_NOTIFY_EMAIL` | Recipient of notifications (default `info@ep-journals.org`). |
| `ADMIN_DASHBOARD_TOKEN` | Long random secret; entered at `/admin/editorial-board` to access the dashboard. Generate e.g. `openssl rand -hex 32`. |

`NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SITE_URL` are already configured.

## 3. Database & storage (already applied)

The migration `20260806140000_editorial_board_applications.sql` creates:

- **`public.editorial_board_applications`** — all applicant fields, moderation
  columns (`status`, `admin_notes`, `ip_address`, `user_agent`), timestamps, and
  a status check constraint (`pending | under_review | shortlisted | approved | rejected`).
- **RLS enabled with no permissive policies** — `anon` and `authenticated` roles
  get **no** access. Only the service role (server routes) can read/write. This
  is the strongest posture for a table holding personal data.
- **Private storage bucket `editorial-board-cvs`** — `public = false`, 10 MB file
  cap, MIME allow-list (PDF/DOC/DOCX). No object policies: only the service role
  uploads and creates signed download URLs.

It has been applied to the live project (`uxvukpvbznddlzpjceeo`). To re-apply on
another environment, run the migration with the Supabase CLI (`supabase db push`).

## 4. Submission workflow

1. The form (`/join-editorial-board`) POSTs `multipart/form-data` to
   `POST /api/editorial-board/apply`.
2. The route (Node runtime, service role):
   - **Honeypot** (`company_website`) — if filled, silently returns success.
   - **Validates** all required fields, email format, ORCID format, journal
     selection, review capacity, and file **type (PDF/DOC/DOCX)** and **size (≤10 MB)**.
   - **Rate limits** to 5 submissions per IP per hour (counted in the DB).
   - **Duplicate protection** — rejects a second application from the same email
     within 24 hours.
   - Captures **submission timestamp, IP, and user agent**.
   - Uploads the CV to the private bucket and inserts the row (rolls back the
     upload if the insert fails).
   - Sends **one Resend email to the editorial office** with the CV **attached**
     (plus a 7-day signed link fallback and a dashboard link). **No email is sent
     to the applicant.** Email failure is logged but never loses the application.
3. The applicant sees only the on-screen confirmation (“Application Submitted
   Successfully…”).

**Email subject:** `New Editorial Board Application – {Applicant Name}`.

## 5. Admin dashboard

Visit **`/admin/editorial-board`** and enter the `ADMIN_DASHBOARD_TOKEN`. You can:

- **Review** every field of each application (expand a row).
- **Search** by name, email, institution, country, or research area.
- **Filter** by status; see live status counts.
- **Approve / reject / shortlist / mark under review** via the per-row status select.
- Add **internal notes** (saved on blur).
- **Download the CV** via a short-lived (5-minute) signed URL.
- **Export CSV** of the current (filtered) list.

The dashboard is `noindex` and lives under `/admin`, which is already blocked in
`robots.txt`. The email’s “Open in Admin Dashboard” button deep-links to the
specific application (`?id=…`).

> **Upgrade path:** to move from the shared-token gate to per-user Supabase auth,
> create the `user_roles` table + an `admin` role and swap the `authorized()`
> check in `app/api/admin/editorial-board/route.ts` for a JWT + role check.
> (The token gate is used because the project currently has no auth users or
> `user_roles` table.)

## 6. Resend domain setup

1. In Resend, verify the sending domain for `ep-journals.org` (DKIM/SPF records).
2. Set `EDITORIAL_FROM_EMAIL` to an address on that domain.
3. Set `RESEND_API_KEY`. The route retries on HTTP 429 with backoff and logs any
   permanent failure (`[editorial-apply] notification email failed …`).

## 7. Post-deployment checklist

- [ ] Set all five env vars in Vercel and redeploy.
- [ ] Verify the Resend domain and send a test application.
- [ ] Confirm the notification arrives at `info@ep-journals.org` with the CV attached.
- [ ] Open `/admin/editorial-board`, enter the token, confirm the application appears, download the CV, change status, export CSV.
- [ ] Submit the updated `sitemap.xml` (now includes `/join-editorial-board`) in Google Search Console and request indexing.
- [ ] Validate the page’s structured data (WebPage, FAQPage, BreadcrumbList) with the Rich Results Test.
