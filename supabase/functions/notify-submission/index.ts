// notify-submission — editor notification + author acknowledgement emails for a
// manuscript submission, via Resend. Invoked from the submit form
// (views/SubmitManuscript.tsx) through supabase.functions.invoke("notify-submission").
//
// The AUTHOR email is randomly chosen from 3 branded templates on each submission;
// the EDITOR email is a consistent notification with the manuscript attached.
//
// Secrets (see supabase/README.md):
//   RESEND_API_KEY (required), FROM_EMAIL, EDITOR_EMAIL

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface Payload {
  reference?: string;
  journal?: string; authorName?: string; email?: string; affiliation?: string;
  country?: string; paperTitle?: string; abstract?: string; keywords?: string;
  comments?: string; fileName?: string; fileBase64?: string; fileType?: string;
}

const esc = (s: unknown) =>
  String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

// ---- shared building blocks -------------------------------------------------

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

const HELP = `<div style="background:#e8f0f8;padding:14px 18px;margin:0 0 20px;font-size:13px;color:#333333;line-height:1.6;">
  <strong>Need assistance?</strong><br/>
  Editorial enquiries: <a href="mailto:editor@ep-journals.org" style="color:#1a3c5e;">editor@ep-journals.org</a><br/>
  Technical support: <a href="mailto:support@ep-journals.org" style="color:#1a3c5e;">support@ep-journals.org</a><br/>
  Working hours: Monday–Saturday, 9:00 AM – 9:00 PM (Sundays closed)</div>`;

const SIGNOFF = `<p style="font-size:14px;color:#333333;line-height:1.7;margin:0;">With best regards,<br/>
  <strong>The EP Journals Group Editorial Office</strong></p>`;

const P = (html: string) => `<p style="font-size:14px;color:#333333;line-height:1.7;margin:0 0 16px;">${html}</p>`;

function shell(inner: string, borderStyle: string): string {
  return `<div style="font-family:Georgia,'Times New Roman',serif;background-color:#f6f7f9;padding:32px 16px;">
    <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:2px;overflow:hidden;${borderStyle}">
      ${HEADER}<div style="padding:28px 32px 36px;">${inner}</div>${FOOTER}
    </div></div>`;
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

// ---- three author acknowledgement templates (random pick per submission) ----

function tplAcknowledgement(p: Payload, date: string) {
  const name = esc(p.authorName) || "Author";
  return {
    subject: `Acknowledgement of receipt — ${p.paperTitle}`,
    html: shell(
      `<table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;"><tr>
        <td><h1 style="font-size:18px;color:#1a3c5e;margin:0;font-family:Georgia,serif;">Acknowledgement of Manuscript Receipt</h1></td>
        <td style="text-align:right;font-size:12px;color:#999999;">${date}</td></tr></table>` +
        P(`Dear ${name},`) +
        P(`The Editorial Office of <strong>${esc(p.journal)}</strong> hereby acknowledges the receipt of your
           manuscript submitted through the EP Journals Group submission system. Your submission has been logged
           and assigned for preliminary editorial review.`) +
        summaryBox([["Reference", p.reference ?? ""], ["Title", p.paperTitle ?? ""], ["Journal", p.journal ?? ""], ["Keywords", p.keywords ?? ""], ["File", p.fileName ?? ""]]) +
        P(`All manuscripts submitted to our journals undergo an initial editorial assessment followed by
           double-blind peer review. Authors can expect an editorial decision within one to two weeks of submission.`) +
        P(`We encourage you to familiarise yourself with our
           <a href="https://www.ep-journals.org/policies" style="color:#1a3c5e;">editorial policies</a> and
           <a href="https://www.ep-journals.org/publication-process" style="color:#1a3c5e;">publication process</a>
           while your manuscript is under review.`) +
        HELP + SIGNOFF,
      "border:1px solid #e0e4ea;",
    ),
  };
}

function tplReceived(p: Payload, _date: string) {
  const name = esc(p.authorName) || "Author";
  const stats = `<table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 20px;"><tr>
    <td style="width:33%;text-align:center;padding:12px 4px;">
      <div style="font-size:18px;color:#1a3c5e;font-weight:bold;">1–3</div>
      <div style="font-size:11px;color:#666666;margin-top:2px;">Days<br/>Initial Screening</div></td>
    <td style="width:33%;text-align:center;padding:12px 4px;border-left:1px solid #e0e4ea;border-right:1px solid #e0e4ea;">
      <div style="font-size:18px;color:#1a3c5e;font-weight:bold;">1–2</div>
      <div style="font-size:11px;color:#666666;margin-top:2px;">Weeks<br/>Peer Review</div></td>
    <td style="width:33%;text-align:center;padding:12px 4px;">
      <div style="font-size:18px;color:#1a3c5e;font-weight:bold;">24h</div>
      <div style="font-size:11px;color:#666666;margin-top:2px;">Response Time<br/>Technical Support</div></td></tr></table>`;
  return {
    subject: `Manuscript submission received — ${p.paperTitle}`,
    html: shell(
      `<h1 style="font-size:20px;color:#1a3c5e;margin:0 0 20px;font-family:Georgia,serif;">Manuscript Submission Received</h1>` +
        P(`Dear ${name},`) +
        P(`Thank you for choosing <strong>${esc(p.journal)}</strong> as the venue for your scholarly work.
           We are pleased to confirm that your manuscript has been successfully received and registered in our
           editorial management system.`) +
        summaryBox([["Reference", p.reference ?? ""], ["Title", p.paperTitle ?? ""], ["Journal", p.journal ?? ""], ["Keywords", p.keywords ?? ""], ["File", p.fileName ?? ""]]) +
        stats +
        P(`Our editorial team will conduct an initial assessment and, if appropriate, forward your manuscript for
           peer review. You will receive further correspondence at this email address regarding the status of your submission.`) +
        HELP + SIGNOFF,
      "border-top:4px solid #1a3c5e;",
    ),
  };
}

function tplWelcome(p: Payload, _date: string) {
  const name = esc(p.authorName) || "Author";
  const nextBox = `<div style="background:#e8f0f8;padding:16px 20px;border-left:3px solid #1a3c5e;margin:0 0 20px;">
    <p style="font-size:13px;color:#1a3c5e;margin:0;font-weight:bold;">What happens next?</p>
    <ol style="font-size:13px;color:#333333;line-height:1.8;margin:8px 0 0;padding-left:18px;">
      <li>Initial editorial screening (1–3 business days)</li>
      <li>Assignment to qualified peer reviewers</li>
      <li>Editorial decision communicated within 1–2 weeks</li></ol></div>`;
  return {
    subject: `Welcome to EP Journals — submission received (${p.paperTitle})`,
    html: shell(
      `<h1 style="font-size:22px;color:#1a3c5e;margin:0 0 6px;font-family:Georgia,serif;">Welcome, ${name}!</h1>
       <p style="font-size:13px;color:#c0922e;font-style:italic;margin:0 0 20px;">Your contribution to open-access research matters.</p>` +
        P(`We are delighted to confirm the receipt of your manuscript submitted to
           <strong>${esc(p.journal)}</strong>. Your work is now part of our editorial pipeline and will be reviewed
           with the rigour and care it deserves.`) +
        summaryBox([["Reference", p.reference ?? ""], ["Title", p.paperTitle ?? ""], ["Journal", p.journal ?? ""], ["Keywords", p.keywords ?? ""], ["File", p.fileName ?? ""]]) +
        nextBox + HELP + SIGNOFF,
      "border-top:4px solid #c0922e;",
    ),
  };
}

const AUTHOR_TEMPLATES = [tplAcknowledgement, tplReceived, tplWelcome];

// ---- editor notification (consistent; manuscript attached) ------------------

function editorEmail(p: Payload, date: string): string {
  return shell(
    `<table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;"><tr>
      <td><h1 style="font-size:18px;color:#1a3c5e;margin:0;font-family:Georgia,serif;">New Manuscript Submission</h1></td>
      <td style="text-align:right;font-size:12px;color:#999999;">${date}</td></tr></table>` +
      P(`A new manuscript has been submitted through the EP Journals Group submission system and assigned for
         preliminary editorial review. The full manuscript is attached to this email.`) +
      summaryBox([
        ["Reference", p.reference ?? ""], ["Title", p.paperTitle ?? ""], ["Journal", p.journal ?? ""], ["Author", p.authorName ?? ""],
        ["Email", p.email ?? ""], ["Affiliation", p.affiliation ?? ""], ["Country", p.country ?? ""],
        ["Keywords", p.keywords ?? ""], ["File", p.fileName ?? ""],
      ]) +
      `<p style="font-size:11px;color:#999999;text-transform:uppercase;letter-spacing:0.5px;margin:0 0 8px;">Abstract</p>
       <p style="font-size:14px;color:#333333;line-height:1.7;margin:0 0 16px;white-space:pre-wrap;">${esc(p.abstract)}</p>` +
      (p.comments ? P(`<strong>Author comments:</strong> ${esc(p.comments)}`) : "") +
      P(`Reply to this email to contact the author directly.`) + SIGNOFF,
    "border-top:4px solid #1a3c5e;",
  );
}

// Resolve the journal-specific editor address from the journals table
// (contact_email), matching the submitted journal by title or abbrev.
async function editorRecipientFor(journal: string | undefined, fallback: string): Promise<string> {
  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key || !journal) return fallback;
  try {
    const res = await fetch(`${url}/rest/v1/journals?select=abbrev,title,contact_email`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
    });
    if (!res.ok) return fallback;
    const rows = (await res.json()) as { abbrev: string; title: string; contact_email: string | null }[];
    const j = rows.find(
      (r) => r.title === journal || r.abbrev === journal || r.abbrev?.toLowerCase() === journal.toLowerCase(),
    );
    return (j && j.contact_email) || fallback;
  } catch {
    return fallback;
  }
}

async function sendEmail(apiKey: string, body: Record<string, unknown>) {
  // Resend allows ~2 requests/second; retry on 429 with a short backoff so a
  // burst (each submission sends 2 emails) never drops one.
  for (let attempt = 0; attempt < 4; attempt++) {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) return res.json();
    if (res.status === 429 && attempt < 3) {
      await new Promise((r) => setTimeout(r, 700 * (attempt + 1)));
      continue;
    }
    throw new Error(`Resend ${res.status}: ${(await res.text()).slice(0, 300)}`);
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  const apiKey = Deno.env.get("RESEND_API_KEY");
  if (!apiKey) return Response.json({ error: "RESEND_API_KEY not configured" }, { status: 500, headers: CORS });
  const from = Deno.env.get("FROM_EMAIL") ?? "EP Journals Group <editor@ep-journals.org>";
  const fallbackEditor = Deno.env.get("EDITOR_EMAIL") ?? "editor@ep-journals.org";

  let p: Payload;
  try {
    p = await req.json();
  } catch {
    return Response.json({ error: "invalid JSON body" }, { status: 400, headers: CORS });
  }
  if (!p.email || !p.paperTitle) {
    return Response.json({ error: "missing email or paperTitle" }, { status: 400, headers: CORS });
  }

  const date = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  const attachments = p.fileBase64 && p.fileName ? [{ filename: p.fileName, content: p.fileBase64 }] : undefined;

  // Randomly pick one of the three author acknowledgement templates.
  const idx = Math.floor(Math.random() * AUTHOR_TEMPLATES.length);
  const author = AUTHOR_TEMPLATES[idx](p, date);
  const editor = await editorRecipientFor(p.journal, fallbackEditor);

  const results: Record<string, unknown> = { authorTemplate: idx + 1, editorTo: editor };
  try {
    results.editor = await sendEmail(apiKey, {
      from, to: [editor], reply_to: p.email,
      subject: `New submission — ${p.journal ?? "EP Journals"}: ${p.paperTitle}`,
      html: editorEmail(p, date), attachments,
    });
    results.author = await sendEmail(apiKey, {
      from, to: [p.email], subject: author.subject, html: author.html,
    });
    return Response.json({ ok: true, results }, { headers: CORS });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("notify-submission failed:", msg);
    return Response.json({ error: msg }, { status: 502, headers: CORS });
  }
});
