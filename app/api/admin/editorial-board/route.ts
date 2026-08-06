import { NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { STATUS_OPTIONS, STORAGE_BUCKET, type ApplicationStatus } from "@/lib/editorialBoardConfig";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Admin dashboard API. Gated by a shared ADMIN_DASHBOARD_TOKEN (sent as the
// x-admin-token header), mirroring the codebase's REVALIDATE_SECRET pattern.
// All data access uses the service role, so applicant PII never touches the
// public anon key. This is intentionally independent of the (currently
// unconfigured) Supabase-auth admin so the dashboard works out of the box.

function authorized(req: Request): boolean {
  const expected = process.env.ADMIN_DASHBOARD_TOKEN;
  if (!expected) return false;
  const provided = req.headers.get("x-admin-token") || "";
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  try {
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

const SELECT_COLS =
  "id, full_name, email, phone, country, institution, department, current_position, highest_qualification, orcid, scopus_id, wos_id, google_scholar, researchgate, linkedin, personal_website, primary_research_area, secondary_research_area, keywords, years_experience, publication_count, citation_count, h_index, i10_index, editorial_experience, motivation, preferred_journals, review_capacity, cv_path, cv_filename, cv_size, cv_mime, status, admin_notes, created_at, updated_at";

export async function GET(req: Request) {
  if (!authorized(req)) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });

  let admin;
  try {
    admin = getSupabaseAdmin();
  } catch {
    return NextResponse.json({ ok: false, error: "service unavailable" }, { status: 503 });
  }

  const url = new URL(req.url);
  const action = url.searchParams.get("action");

  // Generate a short-lived signed URL to download a CV.
  if (action === "cv") {
    const id = url.searchParams.get("id");
    if (!id) return NextResponse.json({ ok: false, error: "missing id" }, { status: 400 });
    const { data: row } = await admin
      .from("editorial_board_applications")
      .select("cv_path")
      .eq("id", id)
      .maybeSingle();
    if (!row?.cv_path) return NextResponse.json({ ok: false, error: "not found" }, { status: 404 });
    const { data: signed, error } = await admin.storage
      .from(STORAGE_BUCKET)
      .createSignedUrl(row.cv_path, 300); // 5 minutes
    if (error || !signed) return NextResponse.json({ ok: false, error: "could not sign" }, { status: 500 });
    return NextResponse.json({ ok: true, url: signed.signedUrl });
  }

  // List with optional filters (search + status). Sorting newest-first.
  const status = url.searchParams.get("status") || "";
  const q = (url.searchParams.get("q") || "").trim();

  let query = admin.from("editorial_board_applications").select(SELECT_COLS).order("created_at", { ascending: false });
  if (status && STATUS_OPTIONS.includes(status as ApplicationStatus)) query = query.eq("status", status);
  if (q) {
    const like = `%${q.replace(/[%_]/g, "")}%`;
    query = query.or(
      `full_name.ilike.${like},email.ilike.${like},institution.ilike.${like},country.ilike.${like},primary_research_area.ilike.${like}`,
    );
  }
  const { data, error } = await query.limit(1000);
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, applications: data ?? [] });
}

export async function PATCH(req: Request) {
  if (!authorized(req)) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });

  let body: { id?: string; status?: string; admin_notes?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid body" }, { status: 400 });
  }
  if (!body.id) return NextResponse.json({ ok: false, error: "missing id" }, { status: 400 });

  const patch: Record<string, unknown> = {};
  if (body.status !== undefined) {
    if (!STATUS_OPTIONS.includes(body.status as ApplicationStatus)) {
      return NextResponse.json({ ok: false, error: "invalid status" }, { status: 400 });
    }
    patch.status = body.status;
  }
  if (body.admin_notes !== undefined) patch.admin_notes = String(body.admin_notes).slice(0, 5000);
  if (!Object.keys(patch).length) return NextResponse.json({ ok: false, error: "nothing to update" }, { status: 400 });

  let admin;
  try {
    admin = getSupabaseAdmin();
  } catch {
    return NextResponse.json({ ok: false, error: "service unavailable" }, { status: 503 });
  }

  const { error } = await admin.from("editorial_board_applications").update(patch).eq("id", body.id);
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
