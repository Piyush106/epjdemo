import { JOURNALS } from "@/lib/editorialBoardConfig";

export interface ApplicationEmailData {
  id: string;
  full_name: string;
  email: string;
  phone?: string | null;
  country: string;
  institution: string;
  department?: string | null;
  current_position: string;
  highest_qualification: string;
  orcid?: string | null;
  scopus_id?: string | null;
  wos_id?: string | null;
  google_scholar?: string | null;
  researchgate?: string | null;
  linkedin?: string | null;
  personal_website?: string | null;
  primary_research_area: string;
  secondary_research_area?: string | null;
  keywords?: string | null;
  years_experience?: number | null;
  publication_count?: number | null;
  citation_count?: number | null;
  h_index?: number | null;
  i10_index?: number | null;
  editorial_experience?: string | null;
  motivation: string;
  preferred_journals: string[];
  review_capacity: string;
  cv_filename: string;
  cv_download_url?: string | null;
  cv_attached: boolean;
  dashboard_url: string;
  submitted_at: string; // human-readable
}

const esc = (s: unknown) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const NAVY = "#1a3c5e";

function section(title: string, inner: string): string {
  return `<tr><td style="padding:0 0 4px;">
    <p style="font-size:11px;color:#8a94a6;text-transform:uppercase;letter-spacing:0.6px;margin:18px 0 6px;font-weight:bold;">${esc(title)}</p>
  </td></tr><tr><td style="padding:0 0 4px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e0e4ea;border-radius:4px;overflow:hidden;">
      ${inner}
    </table></td></tr>`;
}

function row(label: string, value: unknown, opts: { link?: string } = {}): string {
  const v = String(value ?? "").trim();
  if (!v) return "";
  const display = opts.link
    ? `<a href="${esc(opts.link)}" style="color:${NAVY};text-decoration:underline;">${esc(v)}</a>`
    : esc(v);
  return `<tr>
    <td style="padding:8px 12px;background:#f6f7f9;border-bottom:1px solid #eef1f5;font-size:12px;color:#5a6473;width:40%;vertical-align:top;">${esc(label)}</td>
    <td style="padding:8px 12px;border-bottom:1px solid #eef1f5;font-size:13px;color:#1f2733;vertical-align:top;">${display}</td>
  </tr>`;
}

function longText(label: string, value: unknown): string {
  const v = String(value ?? "").trim();
  if (!v) return "";
  return `<tr><td style="padding:0 0 4px;">
    <p style="font-size:11px;color:#8a94a6;text-transform:uppercase;letter-spacing:0.6px;margin:18px 0 6px;font-weight:bold;">${esc(label)}</p>
    <div style="border:1px solid #e0e4ea;border-radius:4px;padding:12px 14px;font-size:13px;color:#1f2733;line-height:1.7;white-space:pre-wrap;">${esc(v)}</div>
  </td></tr>`;
}

export function buildApplicationEmail(d: ApplicationEmailData): { subject: string; html: string; text: string } {
  const orcidUrl = d.orcid ? `https://orcid.org/${d.orcid}` : undefined;
  const scopusUrl = d.scopus_id ? `https://www.scopus.com/authid/detail.uri?authorId=${d.scopus_id}` : undefined;
  const journalTitles = d.preferred_journals
    .map((a) => JOURNALS.find((j) => j.abbrev === a)?.title ?? a)
    .join(", ");

  const applicant = [
    row("Full name", d.full_name),
    row("Email", d.email, { link: `mailto:${d.email}` }),
    row("Phone", d.phone),
    row("Country", d.country),
    row("Institution", d.institution),
    row("Department", d.department),
    row("Current position", d.current_position),
    row("Highest qualification", d.highest_qualification),
  ].join("");

  const profiles = [
    row("ORCID iD", d.orcid, { link: orcidUrl }),
    row("Scopus Author ID", d.scopus_id, { link: scopusUrl }),
    row("Web of Science ResearcherID", d.wos_id),
    row("Google Scholar", d.google_scholar, { link: d.google_scholar || undefined }),
    row("ResearchGate", d.researchgate, { link: d.researchgate || undefined }),
    row("LinkedIn", d.linkedin, { link: d.linkedin || undefined }),
    row("Personal website", d.personal_website, { link: d.personal_website || undefined }),
  ].join("");

  const metrics = [
    row("Primary research area", d.primary_research_area),
    row("Secondary research area", d.secondary_research_area),
    row("Keywords", d.keywords),
    row("Years of experience", d.years_experience),
    row("Publications", d.publication_count),
    row("Citations", d.citation_count),
    row("h-index", d.h_index),
    row("i10-index", d.i10_index),
  ].join("");

  const prefs = [
    row("Preferred journal(s)", journalTitles),
    row("Monthly review capacity", d.review_capacity),
  ].join("");

  const cvRow = d.cv_attached
    ? row("CV", `${d.cv_filename} (attached to this email)`)
    : row("CV", d.cv_filename, { link: d.cv_download_url || undefined });

  const adminFooter = `<tr><td style="padding:0;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:22px;border-top:2px solid ${NAVY};">
      ${row("Submitted", d.submitted_at)}
      ${row("Application ID", d.id)}
    </table>
    <div style="text-align:center;margin:18px 0 4px;">
      <a href="${esc(d.dashboard_url)}" style="display:inline-block;background:${NAVY};color:#ffffff;text-decoration:none;font-size:13px;font-weight:bold;padding:11px 22px;border-radius:4px;">Open in Admin Dashboard</a>
    </div>
  </td></tr>`;

  const html = `<div style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;background:#eef1f5;padding:28px 12px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:640px;margin:0 auto;background:#ffffff;border-radius:6px;overflow:hidden;border:1px solid #e0e4ea;">
    <tr><td style="background:${NAVY};padding:20px 28px;">
      <p style="margin:0;color:#ffffff;font-size:18px;font-weight:bold;">New Editorial Board Application</p>
      <p style="margin:4px 0 0;color:rgba(255,255,255,0.8);font-size:13px;">${esc(d.full_name)} — EP Journals Group</p>
    </td></tr>
    <tr><td style="padding:8px 28px 28px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        ${section("Applicant information", applicant)}
        ${section("Research profiles", profiles || row("—", "No profiles provided"))}
        ${section("Research metrics", metrics || row("—", "No metrics provided"))}
        ${longText("Editorial experience", d.editorial_experience)}
        ${longText("Motivation", d.motivation)}
        ${section("Preferences", prefs)}
        ${section("Curriculum vitae", cvRow)}
        ${adminFooter}
      </table>
    </td></tr>
    <tr><td style="background:#f6f7f9;padding:14px 28px;text-align:center;border-top:1px solid #e0e4ea;">
      <p style="margin:0;font-size:11px;color:#8a94a6;">This is an automated notification from the EP Journals Group editorial board recruitment system. Reply to contact the applicant directly.</p>
    </td></tr>
  </table></div>`;

  // Plain-text fallback for accessibility / non-HTML clients.
  const text = [
    `New Editorial Board Application — ${d.full_name}`,
    ``,
    `APPLICANT`,
    `Name: ${d.full_name}`,
    `Email: ${d.email}`,
    d.phone ? `Phone: ${d.phone}` : "",
    `Country: ${d.country}`,
    `Institution: ${d.institution}`,
    d.department ? `Department: ${d.department}` : "",
    `Position: ${d.current_position}`,
    `Qualification: ${d.highest_qualification}`,
    ``,
    `PROFILES`,
    d.orcid ? `ORCID: ${d.orcid}` : "",
    d.scopus_id ? `Scopus: ${d.scopus_id}` : "",
    d.wos_id ? `WoS ResearcherID: ${d.wos_id}` : "",
    d.google_scholar ? `Google Scholar: ${d.google_scholar}` : "",
    d.researchgate ? `ResearchGate: ${d.researchgate}` : "",
    d.linkedin ? `LinkedIn: ${d.linkedin}` : "",
    d.personal_website ? `Website: ${d.personal_website}` : "",
    ``,
    `METRICS`,
    `Primary area: ${d.primary_research_area}`,
    d.secondary_research_area ? `Secondary area: ${d.secondary_research_area}` : "",
    d.keywords ? `Keywords: ${d.keywords}` : "",
    d.years_experience != null ? `Years experience: ${d.years_experience}` : "",
    d.publication_count != null ? `Publications: ${d.publication_count}` : "",
    d.citation_count != null ? `Citations: ${d.citation_count}` : "",
    d.h_index != null ? `h-index: ${d.h_index}` : "",
    d.i10_index != null ? `i10-index: ${d.i10_index}` : "",
    ``,
    `EDITORIAL EXPERIENCE`,
    d.editorial_experience || "(none provided)",
    ``,
    `MOTIVATION`,
    d.motivation,
    ``,
    `Preferred journals: ${journalTitles}`,
    `Review capacity: ${d.review_capacity}`,
    `CV: ${d.cv_filename}${d.cv_attached ? " (attached)" : d.cv_download_url ? ` — ${d.cv_download_url}` : ""}`,
    ``,
    `Submitted: ${d.submitted_at}`,
    `Application ID: ${d.id}`,
    `Dashboard: ${d.dashboard_url}`,
  ]
    .filter((l) => l !== "")
    .join("\n");

  return { subject: `New Editorial Board Application – ${d.full_name}`, html, text };
}
