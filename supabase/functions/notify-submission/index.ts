// notify-submission — editor notification + author acknowledgement emails for a
// manuscript submission, via Resend. Invoked from the submit form
// (views/SubmitManuscript.tsx) through supabase.functions.invoke("notify-submission").
//
// Secrets (set via `supabase secrets set` — see supabase/README.md):
//   RESEND_API_KEY   required — Resend API key (re_...)
//   FROM_EMAIL       optional — verified sender, default "EP Journals Group <editor@ep-journals.org>"
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
  String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

// ---- shared branded shell (logo header + navy footer) -----------------------

const HEADER = `<div style="padding:20px 32px;border-bottom:1px solid #e0e4ea;">
  <img src="https://www.ep-journals.org/ep-journals-logo.png" alt="EP Journals Group" style="height:42px;" /></div>`;

const FOOTER = `<div style="background:#1a3c5e;padding:16px 32px;text-align:center;">
  <p style="font-size:12px;color:rgba(255,255,255,0.85);margin:0 0 6px;">
    <a href="https://www.ep-journals.org" style="color:#fff;text-decoration:none;margin:0 8px;">Home</a>
    <span style="color:rgba(255,255,255,0.4);">|</span>
    <a href="https://www.ep-journals.org/journals" style="color:#fff;text-decoration:none;margin:0 8px;">Journals</a>
    <span style="color:rgba(255,255,255,0.4);">|</span>
    <a href="https://www.ep-journals.org/authors" style="color:#fff;text-decoration:none;margin:0 8px;">Author Guidelines</a>
    <span style="color:rgba(255,255,255,0.4);">|</span>
    <a href="https://www.ep-journals.org/contact" style="color:#fff;text-decoration:none;margin:0 8px;">Contact</a>
  </p>
  <p style="font-size:11px;color:rgba(255,255,255,0.6);margin:0;">© 2026 EP Journals Group. All rights reserved.</p></div>`;

function shell(inner: string): string {
  return `<div style="font-family:Georgia,'Times New Roman',serif;background-color:#f6f7f9;padding:32px 16px;">
    <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:2px;overflow:hidden;border:1px solid #e0e4ea;">
      ${HEADER}
      <div style="padding:28px 32px 36px;">${inner}</div>
      ${FOOTER}
    </div></div>`;
}

function headingRow(title: string, dateStr: string): string {
  return `<table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;"><tr>
    <td><h1 style="font-size:18px;color:#1a3c5e;margin:0;font-family:Georgia,serif;">${title}</h1></td>
    <td style="text-align:right;font-size:12px;color:#999999;">${dateStr}</td></tr></table>`;
}

function summaryBox(rows: Array<[string, string]>): string {
  const items = rows
    .filter(([, v]) => v && v.trim())
    .map(([k, v]) => `<p style="font-size:13px;color:#333333;margin:0 0 6px;"><strong>${k}:</strong> ${esc(v)}</p>`)
    .join("");
  return `<div style="background:#f6f7f9;border:1px solid #e0e4ea;padding:16px 20px;margin:0 0 20px;">
    <p style="font-size:11px;color:#999999;text-transform:uppercase;letter-spacing:0.5px;margin:0 0 8px;">Submission Summary</p>
    ${items}</div>`;
}

const P = (html: string) =>
  `<p style="font-size:14px;color:#333333;line-height:1.7;margin:0 0 16px;">${html}</p>`;

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
  if (!apiKey) return Response.json({ error: "RESEND_API_KEY not configured" }, { status: 500, headers: CORS });
  const from = Deno.env.get("FROM_EMAIL") ?? "EP Journals Group <editor@ep-journals.org>";
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

  const dateStr = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  const attachments = p.fileBase64 && p.fileName ? [{ filename: p.fileName, content: p.fileBase64 }] : undefined;
  const helpBox = `<div style="background:#e8f0f8;padding:14px 18px;margin:0 0 20px;font-size:13px;color:#333333;line-height:1.6;">
    <strong>Need assistance?</strong><br/>
    Editorial enquiries: <a href="mailto:editor@ep-journals.org" style="color:#1a3c5e;">editor@ep-journals.org</a><br/>
    Technical support: <a href="mailto:support@ep-journals.org" style="color:#1a3c5e;">support@ep-journals.org</a><br/>
    Working hours: Monday–Saturday, 9:00 AM – 9:00 PM (Sundays closed)</div>`;
  const signoff = `<p style="font-size:14px;color:#333333;line-height:1.7;margin:0;">With best regards,<br/>
    <strong>The EP Journals Group Editorial Office</strong></p>`;

  // ---- author acknowledgement ----
  const authorHtml = shell(
    headingRow("Acknowledgement of Manuscript Receipt", dateStr) +
      P(`Dear ${esc(p.authorName) || "Author"},`) +
      P(`The Editorial Office of <strong>${esc(p.journal)}</strong> hereby acknowledges the receipt of your
         manuscript submitted through the EP Journals Group submission system. Your submission has been logged
         and assigned for preliminary editorial review.`) +
      summaryBox([
        ["Title", p.paperTitle ?? ""],
        ["Journal", p.journal ?? ""],
        ["Keywords", p.keywords ?? ""],
        ["File", p.fileName ?? ""],
      ]) +
      P(`All manuscripts submitted to our journals undergo an initial editorial assessment followed by
         double-blind peer review. Authors can expect an editorial decision within one to two weeks of submission.`) +
      P(`We encourage you to familiarise yourself with our
         <a href="https://www.ep-journals.org/policies" style="color:#1a3c5e;">editorial policies</a> and
         <a href="https://www.ep-journals.org/publication-process" style="color:#1a3c5e;">publication process</a>
         while your manuscript is under review.`) +
      helpBox +
      signoff,
  );

  // ---- editor notification (same shell; manuscript attached) ----
  const editorHtml = shell(
    headingRow("New Manuscript Submission", dateStr) +
      P(`A new manuscript has been submitted through the EP Journals Group submission system and assigned for
         preliminary editorial review. The full manuscript is attached to this email.`) +
      summaryBox([
        ["Title", p.paperTitle ?? ""],
        ["Journal", p.journal ?? ""],
        ["Author", p.authorName ?? ""],
        ["Email", p.email ?? ""],
        ["Affiliation", p.affiliation ?? ""],
        ["Country", p.country ?? ""],
        ["Keywords", p.keywords ?? ""],
        ["File", p.fileName ?? ""],
      ]) +
      `<p style="font-size:11px;color:#999999;text-transform:uppercase;letter-spacing:0.5px;margin:0 0 8px;">Abstract</p>` +
      `<p style="font-size:14px;color:#333333;line-height:1.7;margin:0 0 16px;white-space:pre-wrap;">${esc(p.abstract)}</p>` +
      (p.comments ? P(`<strong>Author comments:</strong> ${esc(p.comments)}`) : "") +
      P(`Reply to this email to contact the author directly.`) +
      signoff,
  );

  const results: Record<string, unknown> = {};
  try {
    results.editor = await sendEmail(apiKey, {
      from,
      to: [editor],
      reply_to: p.email,
      subject: `New submission — ${p.journal ?? "EP Journals"}: ${p.paperTitle}`,
      html: editorHtml,
      attachments,
    });
    results.author = await sendEmail(apiKey, {
      from,
      to: [p.email],
      subject: `Acknowledgement of receipt — ${p.paperTitle}`,
      html: authorHtml,
    });
    return Response.json({ ok: true, results }, { headers: CORS });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("notify-submission failed:", msg);
    return Response.json({ error: msg }, { status: 502, headers: CORS });
  }
});
