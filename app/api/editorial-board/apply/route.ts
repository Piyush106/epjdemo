import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { buildApplicationEmail } from "@/lib/editorialBoardEmail";
import { SITE } from "@/lib/seo";
import {
  JOURNAL_ABBREVS,
  RESEARCH_AREAS,
  QUALIFICATIONS,
  REVIEW_CAPACITY_OPTIONS,
  CV_MAX_BYTES,
  CV_ALLOWED_MIME,
  CV_ALLOWED_EXT,
  ORCID_REGEX,
  normalizeOrcid,
  STORAGE_BUCKET,
} from "@/lib/editorialBoardConfig";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Spam / abuse thresholds (enforced against the DB so they hold across
// serverless instances).
const RATE_LIMIT_WINDOW_MIN = 60;
const RATE_LIMIT_MAX = 5; // max applications per IP per window
const DUPLICATE_WINDOW_HOURS = 24;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function clientIp(req: Request): string | null {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return req.headers.get("x-real-ip") || null;
}

function str(v: FormDataEntryValue | null): string {
  return typeof v === "string" ? v.trim() : "";
}

function intOrNull(v: FormDataEntryValue | null): number | null {
  const s = str(v);
  if (!s) return null;
  const n = Number(s);
  return Number.isFinite(n) && n >= 0 ? Math.floor(n) : null;
}

function safeName(name: string): string {
  const dot = name.lastIndexOf(".");
  const base = (dot >= 0 ? name.slice(0, dot) : name).replace(/[^a-zA-Z0-9._-]+/g, "_").slice(0, 80) || "cv";
  const ext = dot >= 0 ? name.slice(dot).toLowerCase() : "";
  return `${base}${ext}`;
}

async function sendResend(body: Record<string, unknown>): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("RESEND_API_KEY not configured");
  let lastErr = "";
  for (let attempt = 0; attempt < 4; attempt++) {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) return;
    lastErr = `Resend ${res.status}: ${(await res.text()).slice(0, 300)}`;
    if (res.status === 429 && attempt < 3) {
      await new Promise((r) => setTimeout(r, 700 * (attempt + 1)));
      continue;
    }
    break;
  }
  throw new Error(lastErr || "Resend send failed");
}

export async function POST(req: Request) {
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid form submission." }, { status: 400 });
  }

  // 1) Honeypot — a hidden field real users never fill. If populated, pretend
  //    success so bots don't learn they were caught, and do nothing.
  if (str(form.get("company_website"))) {
    return NextResponse.json({ ok: true });
  }

  // 2) Collect + normalise fields
  const full_name = str(form.get("full_name"));
  const email = str(form.get("email")).toLowerCase();
  const phone = str(form.get("phone"));
  const country = str(form.get("country"));
  const institution = str(form.get("institution"));
  const department = str(form.get("department"));
  const current_position = str(form.get("current_position"));
  const highest_qualification = str(form.get("highest_qualification"));

  let orcid = str(form.get("orcid"));
  const scopus_id = str(form.get("scopus_id"));
  const wos_id = str(form.get("wos_id"));
  const google_scholar = str(form.get("google_scholar"));
  const researchgate = str(form.get("researchgate"));
  const linkedin = str(form.get("linkedin"));
  const personal_website = str(form.get("personal_website"));

  const primary_research_area = str(form.get("primary_research_area"));
  const secondary_research_area = str(form.get("secondary_research_area"));
  const keywords = str(form.get("keywords"));
  const years_experience = intOrNull(form.get("years_experience"));
  const publication_count = intOrNull(form.get("publication_count"));
  const citation_count = intOrNull(form.get("citation_count"));
  const h_index = intOrNull(form.get("h_index"));
  const i10_index = intOrNull(form.get("i10_index"));

  const editorial_experience = str(form.get("editorial_experience"));
  const motivation = str(form.get("motivation"));
  const preferred_journals = form.getAll("preferred_journals").map((v) => String(v)).filter(Boolean);
  const review_capacity = str(form.get("review_capacity"));
  const consent = str(form.get("consent"));
  const cv = form.get("cv");

  // 3) Server-side validation
  const errors: Record<string, string> = {};
  if (!full_name) errors.full_name = "Full name is required.";
  if (!email) errors.email = "Email is required.";
  else if (!EMAIL_RE.test(email)) errors.email = "Enter a valid email address.";
  if (!country) errors.country = "Country is required.";
  if (!institution) errors.institution = "Institution is required.";
  if (!current_position) errors.current_position = "Current position is required.";
  if (!highest_qualification) errors.highest_qualification = "Highest qualification is required.";
  else if (!QUALIFICATIONS.includes(highest_qualification as (typeof QUALIFICATIONS)[number]))
    errors.highest_qualification = "Select a valid qualification.";
  if (!primary_research_area) errors.primary_research_area = "Primary research area is required.";
  else if (!RESEARCH_AREAS.includes(primary_research_area as (typeof RESEARCH_AREAS)[number]))
    errors.primary_research_area = "Select a valid research area.";
  if (!motivation) errors.motivation = "A motivation statement is required.";
  else if (motivation.length < 50) errors.motivation = "Please provide at least a few sentences (50+ characters).";
  if (!review_capacity) errors.review_capacity = "Select your review capacity.";
  else if (!REVIEW_CAPACITY_OPTIONS.includes(review_capacity as (typeof REVIEW_CAPACITY_OPTIONS)[number]))
    errors.review_capacity = "Select a valid review capacity.";
  if (!preferred_journals.length) errors.preferred_journals = "Select at least one journal.";
  else if (!preferred_journals.every((j) => JOURNAL_ABBREVS.includes(j as (typeof JOURNAL_ABBREVS)[number])))
    errors.preferred_journals = "Invalid journal selection.";
  if (consent !== "true") errors.consent = "Please confirm you consent to the processing of your data.";

  if (orcid) {
    orcid = normalizeOrcid(orcid);
    if (!ORCID_REGEX.test(orcid)) errors.orcid = "ORCID must look like 0000-0000-0000-0000.";
  }

  // File validation
  if (!(cv instanceof File) || cv.size === 0) {
    errors.cv = "A CV file is required.";
  } else {
    const nameLower = cv.name.toLowerCase();
    const extOk = CV_ALLOWED_EXT.some((e) => nameLower.endsWith(e));
    const mimeOk = CV_ALLOWED_MIME.includes(cv.type) || cv.type === ""; // some browsers omit type
    if (cv.size > CV_MAX_BYTES) errors.cv = "CV must be 10 MB or smaller.";
    else if (!extOk || !mimeOk) errors.cv = "CV must be a PDF, DOC, or DOCX file.";
  }

  if (Object.keys(errors).length) {
    return NextResponse.json({ ok: false, errors }, { status: 422 });
  }

  const cvFile = cv as File;
  const ip = clientIp(req);
  const userAgent = req.headers.get("user-agent") || null;

  let admin;
  try {
    admin = getSupabaseAdmin();
  } catch (e) {
    console.error("[editorial-apply] service role not configured:", e);
    return NextResponse.json(
      { ok: false, error: "The application service is temporarily unavailable. Please try again later." },
      { status: 503 },
    );
  }

  // 4) Rate limiting (per IP) + duplicate protection (per email), via the DB.
  try {
    if (ip) {
      const since = new Date(Date.now() - RATE_LIMIT_WINDOW_MIN * 60_000).toISOString();
      const { count } = await admin
        .from("editorial_board_applications")
        .select("id", { count: "exact", head: true })
        .eq("ip_address", ip)
        .gte("created_at", since);
      if ((count ?? 0) >= RATE_LIMIT_MAX) {
        return NextResponse.json(
          { ok: false, error: "Too many applications from this network. Please try again later." },
          { status: 429 },
        );
      }
    }
    const dupSince = new Date(Date.now() - DUPLICATE_WINDOW_HOURS * 3_600_000).toISOString();
    const { data: dup } = await admin
      .from("editorial_board_applications")
      .select("id")
      .eq("email", email)
      .gte("created_at", dupSince)
      .limit(1);
    if (dup && dup.length) {
      return NextResponse.json(
        { ok: false, error: "We already have a recent application from this email address." },
        { status: 409 },
      );
    }
  } catch (e) {
    console.error("[editorial-apply] pre-check failed:", e);
    // Non-fatal — continue to insert.
  }

  // 5) Upload CV to the private bucket
  const id = crypto.randomUUID();
  const cleanName = safeName(cvFile.name);
  const cvPath = `applications/${id}/${cleanName}`;
  const bytes = Buffer.from(await cvFile.arrayBuffer());
  const contentType = cvFile.type || "application/octet-stream";

  const { error: upErr } = await admin.storage
    .from(STORAGE_BUCKET)
    .upload(cvPath, bytes, { contentType, upsert: false });
  if (upErr) {
    console.error("[editorial-apply] CV upload failed:", upErr);
    return NextResponse.json(
      { ok: false, error: "We could not store your CV. Please check the file and try again." },
      { status: 500 },
    );
  }

  // 6) Insert the application row
  const record = {
    id,
    full_name, email, phone: phone || null, country, institution,
    department: department || null, current_position, highest_qualification,
    orcid: orcid || null, scopus_id: scopus_id || null, wos_id: wos_id || null,
    google_scholar: google_scholar || null, researchgate: researchgate || null,
    linkedin: linkedin || null, personal_website: personal_website || null,
    primary_research_area, secondary_research_area: secondary_research_area || null,
    keywords: keywords || null, years_experience, publication_count, citation_count,
    h_index, i10_index, editorial_experience: editorial_experience || null, motivation,
    preferred_journals, review_capacity, cv_path: cvPath, cv_filename: cleanName,
    cv_size: cvFile.size, cv_mime: contentType, status: "pending",
    ip_address: ip, user_agent: userAgent,
  };

  const { error: insErr } = await admin.from("editorial_board_applications").insert(record);
  if (insErr) {
    console.error("[editorial-apply] insert failed:", insErr);
    // Roll back the orphaned CV upload.
    await admin.storage.from(STORAGE_BUCKET).remove([cvPath]).catch(() => {});
    return NextResponse.json(
      { ok: false, error: "We could not record your application. Please try again." },
      { status: 500 },
    );
  }

  // 7) Notify the editorial office (NO applicant email is ever sent).
  //    Email failure must not lose the stored application — log and continue.
  try {
    const notifyTo = process.env.EDITORIAL_NOTIFY_EMAIL || "info@ep-journals.org";
    const from = process.env.EDITORIAL_FROM_EMAIL || process.env.FROM_EMAIL || "EP Journals Group <info@ep-journals.org>";

    // Attach the CV when within Resend's limits (our cap is 10 MB — always fine),
    // and also provide a 7-day signed link as a fallback for the record.
    const attachable = cvFile.size <= CV_MAX_BYTES;
    let signedUrl: string | null = null;
    try {
      const { data: signed } = await admin.storage
        .from(STORAGE_BUCKET)
        .createSignedUrl(cvPath, 60 * 60 * 24 * 7);
      signedUrl = signed?.signedUrl ?? null;
    } catch { /* link is a fallback only */ }

    const { subject, html, text } = buildApplicationEmail({
      ...record,
      cv_download_url: signedUrl,
      cv_attached: attachable,
      dashboard_url: `${SITE.origin}/admin/editorial-board?id=${id}`,
      submitted_at: new Date().toLocaleString("en-GB", {
        day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit", timeZoneName: "short",
      }),
    });

    await sendResend({
      from,
      to: [notifyTo],
      reply_to: email,
      subject,
      html,
      text,
      ...(attachable
        ? { attachments: [{ filename: cleanName, content: bytes.toString("base64") }] }
        : {}),
    });
  } catch (e) {
    console.error("[editorial-apply] notification email failed (application WAS saved):", e);
  }

  return NextResponse.json({ ok: true, id });
}
