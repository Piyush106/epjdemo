import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { timingSafeEqual } from "crypto";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Manage the published editorial board (public /editorial). Token-gated with the
// same ADMIN_DASHBOARD_TOKEN as the applications dashboard; all access via the
// service role. Every mutation revalidates /editorial so changes appear at once.

function authorized(req: Request): boolean {
  const expected = process.env.ADMIN_DASHBOARD_TOKEN;
  if (!expected) return false;
  const a = Buffer.from(req.headers.get("x-admin-token") || "");
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  try { return timingSafeEqual(a, b); } catch { return false; }
}

const COLS = "id, name, credentials, affiliation, orcid, scopus_id, wos_id, sinta_id, display_order, visible, source_application_id, created_at, updated_at";
const TABLE = "editorial_board_members";
const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");
const nn = (v: unknown) => { const s = str(v); return s || null; };

export async function GET(req: Request) {
  if (!authorized(req)) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  let admin;
  try { admin = getSupabaseAdmin(); } catch { return NextResponse.json({ ok: false, error: "service unavailable" }, { status: 503 }); }
  const { data, error } = await admin.from(TABLE).select(COLS).order("display_order", { ascending: true });
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, members: data ?? [] });
}

export async function POST(req: Request) {
  if (!authorized(req)) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return NextResponse.json({ ok: false, error: "invalid body" }, { status: 400 }); }

  let admin;
  try { admin = getSupabaseAdmin(); } catch { return NextResponse.json({ ok: false, error: "service unavailable" }, { status: 503 }); }

  // next display_order = max + 1
  const { data: last } = await admin.from(TABLE).select("display_order").order("display_order", { ascending: false }).limit(1);
  const nextOrder = ((last?.[0]?.display_order as number) ?? 0) + 1;

  // Mode A: publish from an existing application.
  if (body.fromApplicationId) {
    const appId = String(body.fromApplicationId);
    // Avoid duplicate publishes of the same application.
    const { data: existing } = await admin.from(TABLE).select("id").eq("source_application_id", appId).limit(1);
    if (existing && existing.length) {
      return NextResponse.json({ ok: false, error: "This applicant is already on the board." }, { status: 409 });
    }
    const { data: app, error: appErr } = await admin
      .from("editorial_board_applications")
      .select("full_name, current_position, institution, country, highest_qualification, primary_research_area, orcid, scopus_id, wos_id")
      .eq("id", appId)
      .maybeSingle();
    if (appErr || !app) return NextResponse.json({ ok: false, error: "application not found" }, { status: 404 });

    const credentials = [app.highest_qualification, app.primary_research_area].filter(Boolean).join(", ");
    const affiliation = [app.current_position, app.institution, app.country].filter(Boolean).join(", ");
    const record = {
      name: app.full_name, credentials, affiliation,
      orcid: app.orcid || null, scopus_id: app.scopus_id || null, wos_id: app.wos_id || null, sinta_id: null,
      display_order: nextOrder, visible: true, source_application_id: appId,
    };
    const { data: inserted, error } = await admin.from(TABLE).insert(record).select(COLS).maybeSingle();
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    revalidatePath("/editorial");
    return NextResponse.json({ ok: true, member: inserted });
  }

  // Mode B: create a member from supplied fields.
  const name = str(body.name), credentials = str(body.credentials), affiliation = str(body.affiliation);
  if (!name || !credentials || !affiliation) {
    return NextResponse.json({ ok: false, error: "Name, credentials, and affiliation are required." }, { status: 422 });
  }
  const record = {
    name, credentials, affiliation,
    orcid: nn(body.orcid), scopus_id: nn(body.scopus_id), wos_id: nn(body.wos_id), sinta_id: nn(body.sinta_id),
    display_order: nextOrder, visible: body.visible === false ? false : true,
  };
  const { data: inserted, error } = await admin.from(TABLE).insert(record).select(COLS).maybeSingle();
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  revalidatePath("/editorial");
  return NextResponse.json({ ok: true, member: inserted });
}

export async function PATCH(req: Request) {
  if (!authorized(req)) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return NextResponse.json({ ok: false, error: "invalid body" }, { status: 400 }); }
  const id = str(body.id);
  if (!id) return NextResponse.json({ ok: false, error: "missing id" }, { status: 400 });

  let admin;
  try { admin = getSupabaseAdmin(); } catch { return NextResponse.json({ ok: false, error: "service unavailable" }, { status: 503 }); }

  // Reorder: swap display_order with the adjacent member.
  if (body.move === "up" || body.move === "down") {
    const { data: cur } = await admin.from(TABLE).select("id, display_order").eq("id", id).maybeSingle();
    if (!cur) return NextResponse.json({ ok: false, error: "not found" }, { status: 404 });
    const asc = body.move === "down";
    const { data: neighbor } = await admin
      .from(TABLE)
      .select("id, display_order")
      .filter("display_order", asc ? "gt" : "lt", cur.display_order)
      .order("display_order", { ascending: asc })
      .limit(1)
      .maybeSingle();
    if (!neighbor) return NextResponse.json({ ok: true, noop: true }); // already at the edge
    await admin.from(TABLE).update({ display_order: neighbor.display_order }).eq("id", cur.id);
    await admin.from(TABLE).update({ display_order: cur.display_order }).eq("id", neighbor.id);
    revalidatePath("/editorial");
    return NextResponse.json({ ok: true });
  }

  // Field / visibility update.
  const patch: Record<string, unknown> = {};
  for (const k of ["name", "credentials", "affiliation"] as const) if (body[k] !== undefined) patch[k] = str(body[k]);
  for (const k of ["orcid", "scopus_id", "wos_id", "sinta_id"] as const) if (body[k] !== undefined) patch[k] = nn(body[k]);
  if (body.visible !== undefined) patch.visible = !!body.visible;
  if (!Object.keys(patch).length) return NextResponse.json({ ok: false, error: "nothing to update" }, { status: 400 });

  const { error } = await admin.from(TABLE).update(patch).eq("id", id);
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  revalidatePath("/editorial");
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  if (!authorized(req)) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ ok: false, error: "missing id" }, { status: 400 });
  let admin;
  try { admin = getSupabaseAdmin(); } catch { return NextResponse.json({ ok: false, error: "service unavailable" }, { status: 503 }); }
  const { error } = await admin.from(TABLE).delete().eq("id", id);
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  revalidatePath("/editorial");
  return NextResponse.json({ ok: true });
}
