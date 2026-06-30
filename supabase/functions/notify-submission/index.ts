// notify-submission — sends the editor notification + author confirmation email
// for a manuscript submission, via Resend. Invoked from the submit form
// (views/SubmitManuscript.tsx) through supabase.functions.invoke("notify-submission").
//
// Secrets (set via `supabase secrets set` — see supabase/README.md):
//   RESEND_API_KEY   required — Resend API key (re_...)
//   FROM_EMAIL       optional — verified sender, default "EP Journals Group <onboarding@resend.dev>"
//   EDITOR_EMAIL     optional — editor recipient, default "editor@ep-journals.org"

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface Payload {
  journal?: string;
  authorName?: string;
  email?: string;
  affiliation?: string;
  country?: string;
  paperTitle?: string;
  abstract?: string;
  keywords?: string;
  comments?: string;
  fileName?: string;
  fileBase64?: string;
  fileType?: string;
}

const esc = (s: unknown) =>
  String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

async function sendEmail(apiKey: string, body: Record<string, unknown>) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Resend ${res.status}: ${(await res.text()).slice(0, 300)}`);
  return res.json();
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  const apiKey = Deno.env.get("RESEND_API_KEY");
  if (!apiKey) {
    return Response.json({ error: "RESEND_API_KEY not configured" }, { status: 500, headers: CORS });
  }
  const from = Deno.env.get("FROM_EMAIL") ?? "EP Journals Group <onboarding@resend.dev>";
  const editor = Deno.env.get("EDITOR_EMAIL") ?? "editor@ep-journals.org";

  let p: Payload;
  try {
    p = await req.json();
  } catch {
    return Response.json({ error: "invalid JSON body" }, { status: 400, headers: CORS });
  }
  if (!p.email || !p.paperTitle) {
    return Response.json({ error: "missing email or paperTitle" }, { status: 400, headers: CORS });
  }

  const detailRows = `
    <tr><td style="padding:4px 12px 4px 0;color:#7a6a5f"><b>Journal</b></td><td>${esc(p.journal)}</td></tr>
    <tr><td style="padding:4px 12px 4px 0;color:#7a6a5f"><b>Title</b></td><td>${esc(p.paperTitle)}</td></tr>
    <tr><td style="padding:4px 12px 4px 0;color:#7a6a5f"><b>Author</b></td><td>${esc(p.authorName)}</td></tr>
    <tr><td style="padding:4px 12px 4px 0;color:#7a6a5f"><b>Email</b></td><td>${esc(p.email)}</td></tr>
    <tr><td style="padding:4px 12px 4px 0;color:#7a6a5f"><b>Affiliation</b></td><td>${esc(p.affiliation)}</td></tr>
    <tr><td style="padding:4px 12px 4px 0;color:#7a6a5f"><b>Country</b></td><td>${esc(p.country)}</td></tr>
    <tr><td style="padding:4px 12px 4px 0;color:#7a6a5f"><b>Keywords</b></td><td>${esc(p.keywords)}</td></tr>`;

  const attachments = p.fileBase64 && p.fileName
    ? [{ filename: p.fileName, content: p.fileBase64 }]
    : undefined;

  const results: Record<string, unknown> = {};
  try {
    // 1) Editor notification (with the manuscript attached, reply-to the author)
    results.editor = await sendEmail(apiKey, {
      from,
      to: [editor],
      reply_to: p.email,
      subject: `New submission — ${p.journal ?? "EP Journals"}: ${p.paperTitle}`,
      html: `<h2 style="font-family:Georgia,serif;color:#32221b">New manuscript submission</h2>
        <table style="font-family:Arial,sans-serif;font-size:14px">${detailRows}</table>
        <h3 style="font-family:Georgia,serif;color:#32221b">Abstract</h3>
        <p style="font-family:Arial,sans-serif;font-size:14px;white-space:pre-wrap">${esc(p.abstract)}</p>
        ${p.comments ? `<h3 style="font-family:Georgia,serif">Comments</h3><p>${esc(p.comments)}</p>` : ""}`,
      attachments,
    });

    // 2) Author confirmation
    results.author = await sendEmail(apiKey, {
      from,
      to: [p.email],
      subject: `Submission received — ${p.paperTitle}`,
      html: `<h2 style="font-family:Georgia,serif;color:#32221b">Thank you for your submission</h2>
        <p style="font-family:Arial,sans-serif;font-size:14px">Dear ${esc(p.authorName) || "Author"},</p>
        <p style="font-family:Arial,sans-serif;font-size:14px">We have received your manuscript
        <b>"${esc(p.paperTitle)}"</b> for <b>${esc(p.journal)}</b>. Our editorial office will acknowledge
        your submission and begin initial screening. You can expect an acknowledgement within 24 hours.</p>
        <p style="font-family:Arial,sans-serif;font-size:14px">Kind regards,<br/>EP Journals Group Editorial Office<br/>
        <a href="mailto:${editor}">${editor}</a></p>`,
    });

    return Response.json({ ok: true, results }, { headers: CORS });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("notify-submission failed:", msg);
    return Response.json({ error: msg }, { status: 502, headers: CORS });
  }
});
