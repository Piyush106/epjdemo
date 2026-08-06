"use client";
import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckCircle2, Award, Users, FileCheck, Globe, BookOpen, ArrowRight } from "lucide-react";
import {
  JOURNALS,
  RESEARCH_AREAS,
  QUALIFICATIONS,
  REVIEW_CAPACITY_OPTIONS,
  CV_ACCEPT_ATTR,
  CV_MAX_BYTES,
  CV_ALLOWED_EXT,
  ORCID_REGEX,
  normalizeOrcid,
} from "@/lib/editorialBoardConfig";
import { BENEFITS, RESPONSIBILITIES, ELIGIBILITY, PROCESS, FAQS, PRIVACY_NOTE } from "@/lib/editorialBoardContent";

const BENEFIT_ICONS = [Award, Globe, FileCheck, Users, BookOpen];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const initialValues = {
  full_name: "", email: "", phone: "", country: "", institution: "", department: "",
  current_position: "", highest_qualification: "", orcid: "", scopus_id: "", wos_id: "",
  google_scholar: "", researchgate: "", linkedin: "", personal_website: "",
  primary_research_area: "", secondary_research_area: "", keywords: "",
  years_experience: "", publication_count: "", citation_count: "", h_index: "", i10_index: "",
  editorial_experience: "", motivation: "", review_capacity: "",
};
type Values = typeof initialValues;

const JoinEditorialBoard = () => {
  const [v, setV] = useState<Values>(initialValues);
  const [journals, setJournals] = useState<string[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const honeypotRef = useRef<HTMLInputElement>(null);
  const formTopRef = useRef<HTMLDivElement>(null);

  const set = (k: keyof Values) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setV((prev) => ({ ...prev, [k]: e.target.value }));

  const toggleJournal = (abbrev: string) =>
    setJournals((prev) => (prev.includes(abbrev) ? prev.filter((x) => x !== abbrev) : [...prev, abbrev]));

  const validate = (): Record<string, string> => {
    const e: Record<string, string> = {};
    if (!v.full_name.trim()) e.full_name = "Full name is required.";
    if (!v.email.trim()) e.email = "Email is required.";
    else if (!EMAIL_RE.test(v.email.trim())) e.email = "Enter a valid email address.";
    if (!v.country.trim()) e.country = "Country is required.";
    if (!v.institution.trim()) e.institution = "Institution is required.";
    if (!v.current_position.trim()) e.current_position = "Current position is required.";
    if (!v.highest_qualification) e.highest_qualification = "Select your highest qualification.";
    if (!v.primary_research_area) e.primary_research_area = "Select your primary research area.";
    if (!v.motivation.trim()) e.motivation = "Please tell us why you would like to join.";
    else if (v.motivation.trim().length < 50) e.motivation = "Please provide at least a few sentences (50+ characters).";
    if (!v.review_capacity) e.review_capacity = "Select your monthly review capacity.";
    if (!journals.length) e.preferred_journals = "Select at least one journal.";
    if (v.orcid.trim() && !ORCID_REGEX.test(normalizeOrcid(v.orcid))) e.orcid = "ORCID must look like 0000-0000-0000-0000.";
    if (!file) e.cv = "Please upload your CV.";
    else {
      const nameLower = file.name.toLowerCase();
      if (!CV_ALLOWED_EXT.some((x) => nameLower.endsWith(x))) e.cv = "CV must be a PDF, DOC, or DOCX file.";
      else if (file.size > CV_MAX_BYTES) e.cv = "CV must be 10 MB or smaller.";
    }
    if (!consent) e.consent = "Please confirm you consent to the processing of your data.";
    return e;
  };

  const focusFirstError = (e: Record<string, string>) => {
    const first = Object.keys(e)[0];
    const el = document.getElementById(`field-${first}`) || document.getElementById(first);
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
    (el as HTMLElement | null)?.focus?.();
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setServerError("");
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) { focusFirstError(e); return; }

    const fd = new FormData();
    (Object.keys(v) as (keyof Values)[]).forEach((k) => fd.append(k, v[k].trim()));
    journals.forEach((j) => fd.append("preferred_journals", j));
    fd.append("consent", consent ? "true" : "false");
    fd.append("company_website", honeypotRef.current?.value ?? ""); // honeypot
    if (file) fd.append("cv", file);

    setSubmitting(true);
    try {
      const res = await fetch("/api/editorial-board/apply", { method: "POST", body: fd });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        setSubmitted(true);
        formTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }
      if (res.status === 422 && data.errors) {
        setErrors(data.errors);
        focusFirstError(data.errors);
      } else {
        setServerError(data.error || "Something went wrong. Please try again.");
      }
    } catch {
      setServerError("Network error. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const errText = (k: string) =>
    errors[k] ? (
      <p id={`err-${k}`} className="text-xs text-destructive mt-1">{errors[k]}</p>
    ) : null;
  const aria = (k: string) => ({
    "aria-invalid": errors[k] ? true : undefined,
    "aria-describedby": errors[k] ? `err-${k}` : undefined,
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero */}
      <section className="py-10 bg-ep-cream border-b border-border">
        <div className="container mx-auto px-4">
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-2">
            <Link href="/editorial" className="hover:underline">Editorial Board</Link> · Recruitment
          </p>
          <h1 className="text-2xl md:text-3xl font-heading font-semibold text-foreground mb-3 max-w-3xl">
            Join the EP Journals Group Editorial Board
          </h1>
          <p className="text-muted-foreground text-sm md:text-base leading-relaxed max-w-3xl">
            EP Journals Group invites qualified researchers to join the editorial board serving our six
            peer-reviewed, open access journals. Board members shape editorial standards, conduct double-blind peer
            review, and help advance rigorous, accessible scholarship across engineering, economics, management,
            natural sciences, social sciences, and education.
          </p>
          <div className="mt-5">
            <a
              href="#apply"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 text-sm font-semibold rounded-sm hover:bg-primary-hover"
            >
              Apply now <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>

      <main className="container mx-auto px-4 py-10">
        <div className="grid lg:grid-cols-[1fr_320px] gap-10">
          <div className="min-w-0">
            {/* Benefits */}
            <section aria-labelledby="benefits-h" className="mb-10">
              <h2 id="benefits-h" className="text-lg font-heading font-semibold text-foreground mb-3 border-b border-border pb-2">
                Why join our editorial board
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {BENEFITS.map((b, i) => {
                  const Icon = BENEFIT_ICONS[i % BENEFIT_ICONS.length];
                  return (
                    <div key={b.title} className="flex items-start gap-3 border border-border bg-card p-4">
                      <Icon className="h-5 w-5 text-primary shrink-0 mt-0.5" aria-hidden="true" />
                      <div>
                        <h3 className="text-sm font-heading font-semibold text-foreground">{b.title}</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">{b.text}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Responsibilities */}
            <section aria-labelledby="resp-h" className="mb-10">
              <h2 id="resp-h" className="text-lg font-heading font-semibold text-foreground mb-3 border-b border-border pb-2">
                Responsibilities
              </h2>
              <ul className="space-y-2">
                {RESPONSIBILITIES.map((r) => (
                  <li key={r} className="flex items-start gap-2 text-sm text-foreground">
                    <CheckCircle2 className="h-4 w-4 text-ep-teal shrink-0 mt-0.5" aria-hidden="true" />
                    <span className="leading-relaxed">{r}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Eligibility */}
            <section aria-labelledby="elig-h" className="mb-10">
              <h2 id="elig-h" className="text-lg font-heading font-semibold text-foreground mb-3 border-b border-border pb-2">
                Eligibility
              </h2>
              <ul className="space-y-2">
                {ELIGIBILITY.map((r) => (
                  <li key={r} className="flex items-start gap-2 text-sm text-foreground">
                    <CheckCircle2 className="h-4 w-4 text-ep-teal shrink-0 mt-0.5" aria-hidden="true" />
                    <span className="leading-relaxed">{r}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Process */}
            <section aria-labelledby="proc-h" className="mb-10">
              <h2 id="proc-h" className="text-lg font-heading font-semibold text-foreground mb-3 border-b border-border pb-2">
                How the application process works
              </h2>
              <ol className="space-y-3">
                {PROCESS.map((p, i) => (
                  <li key={p.step} className="flex items-start gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-semibold" aria-hidden="true">{i + 1}</span>
                    <div>
                      <h3 className="text-sm font-heading font-semibold text-foreground">{p.step}</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">{p.text}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </section>

            {/* ---------- Application form ---------- */}
            <section aria-labelledby="apply-h" id="apply" className="scroll-mt-24" ref={formTopRef}>
              <h2 id="apply-h" className="text-lg font-heading font-semibold text-foreground mb-3 border-b border-border pb-2">
                Editorial board application
              </h2>

              {submitted ? (
                <div role="status" aria-live="polite" className="border border-ep-teal/40 bg-ep-teal/5 p-6 rounded-sm">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 text-ep-teal shrink-0 mt-0.5" aria-hidden="true" />
                    <div>
                      <h3 className="text-base font-heading font-semibold text-foreground mb-2">Application Submitted Successfully</h3>
                      <p className="text-sm text-foreground leading-relaxed">
                        Thank you for your interest in joining the Editorial Board of EP Journals Group. Our editorial
                        team will carefully review your application. If your profile matches our current requirements,
                        we will contact you using the email address provided.
                      </p>
                      <p className="text-sm text-muted-foreground leading-relaxed mt-2">
                        Please note that due to the volume of applications, only shortlisted candidates may be contacted.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate className="space-y-8">
                  {serverError ? (
                    <div role="alert" className="border border-destructive/40 bg-destructive/5 text-sm text-destructive px-4 py-3 rounded-sm">
                      {serverError}
                    </div>
                  ) : null}

                  {/* Honeypot — visually hidden, ignored by humans */}
                  <div aria-hidden="true" className="absolute left-[-9999px] top-[-9999px] h-0 w-0 overflow-hidden">
                    <label htmlFor="company_website">Company website (leave blank)</label>
                    <input ref={honeypotRef} id="company_website" name="company_website" type="text" tabIndex={-1} autoComplete="off" />
                  </div>

                  {/* Applicant information */}
                  <fieldset className="space-y-4">
                    <legend className="text-sm font-heading font-semibold text-foreground mb-1">Applicant information</legend>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="field-full_name">Full name <span className="text-destructive">*</span></Label>
                        <Input id="field-full_name" value={v.full_name} onChange={set("full_name")} required {...aria("full_name")} />
                        {errText("full_name")}
                      </div>
                      <div>
                        <Label htmlFor="field-email">Email address <span className="text-destructive">*</span></Label>
                        <Input id="field-email" type="email" value={v.email} onChange={set("email")} required {...aria("email")} />
                        {errText("email")}
                      </div>
                      <div>
                        <Label htmlFor="field-phone">Phone number</Label>
                        <Input id="field-phone" type="tel" value={v.phone} onChange={set("phone")} />
                      </div>
                      <div>
                        <Label htmlFor="field-country">Country <span className="text-destructive">*</span></Label>
                        <Input id="field-country" value={v.country} onChange={set("country")} required {...aria("country")} />
                        {errText("country")}
                      </div>
                      <div>
                        <Label htmlFor="field-institution">Institution <span className="text-destructive">*</span></Label>
                        <Input id="field-institution" value={v.institution} onChange={set("institution")} required {...aria("institution")} />
                        {errText("institution")}
                      </div>
                      <div>
                        <Label htmlFor="field-department">Department</Label>
                        <Input id="field-department" value={v.department} onChange={set("department")} />
                      </div>
                      <div>
                        <Label htmlFor="field-current_position">Current position <span className="text-destructive">*</span></Label>
                        <Input id="field-current_position" value={v.current_position} onChange={set("current_position")} placeholder="e.g. Associate Professor" required {...aria("current_position")} />
                        {errText("current_position")}
                      </div>
                      <div>
                        <Label htmlFor="field-highest_qualification">Highest qualification <span className="text-destructive">*</span></Label>
                        <select id="field-highest_qualification" value={v.highest_qualification} onChange={set("highest_qualification")} required {...aria("highest_qualification")}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                          <option value="">Select…</option>
                          {QUALIFICATIONS.map((q) => <option key={q} value={q}>{q}</option>)}
                        </select>
                        {errText("highest_qualification")}
                      </div>
                    </div>
                  </fieldset>

                  {/* Research profiles */}
                  <fieldset className="space-y-4">
                    <legend className="text-sm font-heading font-semibold text-foreground mb-1">Research profiles</legend>
                    <p className="text-xs text-muted-foreground -mt-2">Optional, but a verifiable ORCID and/or Scopus profile strengthens your application.</p>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="field-orcid">ORCID iD</Label>
                        <Input id="field-orcid" value={v.orcid} onChange={set("orcid")} placeholder="0000-0000-0000-0000" {...aria("orcid")} />
                        {errText("orcid")}
                      </div>
                      <div>
                        <Label htmlFor="field-scopus_id">Scopus Author ID</Label>
                        <Input id="field-scopus_id" value={v.scopus_id} onChange={set("scopus_id")} />
                      </div>
                      <div>
                        <Label htmlFor="field-wos_id">Web of Science ResearcherID</Label>
                        <Input id="field-wos_id" value={v.wos_id} onChange={set("wos_id")} />
                      </div>
                      <div>
                        <Label htmlFor="field-google_scholar">Google Scholar profile</Label>
                        <Input id="field-google_scholar" type="url" value={v.google_scholar} onChange={set("google_scholar")} placeholder="https://scholar.google.com/…" />
                      </div>
                      <div>
                        <Label htmlFor="field-researchgate">ResearchGate profile</Label>
                        <Input id="field-researchgate" type="url" value={v.researchgate} onChange={set("researchgate")} />
                      </div>
                      <div>
                        <Label htmlFor="field-linkedin">LinkedIn profile</Label>
                        <Input id="field-linkedin" type="url" value={v.linkedin} onChange={set("linkedin")} />
                      </div>
                      <div className="sm:col-span-2">
                        <Label htmlFor="field-personal_website">Personal / institutional website</Label>
                        <Input id="field-personal_website" type="url" value={v.personal_website} onChange={set("personal_website")} />
                      </div>
                    </div>
                  </fieldset>

                  {/* Research metrics */}
                  <fieldset className="space-y-4">
                    <legend className="text-sm font-heading font-semibold text-foreground mb-1">Research profile &amp; metrics</legend>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="field-primary_research_area">Primary research area <span className="text-destructive">*</span></Label>
                        <select id="field-primary_research_area" value={v.primary_research_area} onChange={set("primary_research_area")} required {...aria("primary_research_area")}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                          <option value="">Select…</option>
                          {RESEARCH_AREAS.map((a) => <option key={a} value={a}>{a}</option>)}
                        </select>
                        {errText("primary_research_area")}
                      </div>
                      <div>
                        <Label htmlFor="field-secondary_research_area">Secondary research area</Label>
                        <select id="field-secondary_research_area" value={v.secondary_research_area} onChange={set("secondary_research_area")}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                          <option value="">Select…</option>
                          {RESEARCH_AREAS.map((a) => <option key={a} value={a}>{a}</option>)}
                        </select>
                      </div>
                      <div className="sm:col-span-2">
                        <Label htmlFor="field-keywords">Research keywords</Label>
                        <Input id="field-keywords" value={v.keywords} onChange={set("keywords")} placeholder="e.g. machine learning, renewable energy, health economics" />
                      </div>
                      <div>
                        <Label htmlFor="field-years_experience">Years of research experience</Label>
                        <Input id="field-years_experience" type="number" min={0} value={v.years_experience} onChange={set("years_experience")} />
                      </div>
                      <div>
                        <Label htmlFor="field-publication_count">Number of publications</Label>
                        <Input id="field-publication_count" type="number" min={0} value={v.publication_count} onChange={set("publication_count")} />
                      </div>
                      <div>
                        <Label htmlFor="field-citation_count">Citation count</Label>
                        <Input id="field-citation_count" type="number" min={0} value={v.citation_count} onChange={set("citation_count")} />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="field-h_index">h-index</Label>
                          <Input id="field-h_index" type="number" min={0} value={v.h_index} onChange={set("h_index")} />
                        </div>
                        <div>
                          <Label htmlFor="field-i10_index">i10-index</Label>
                          <Input id="field-i10_index" type="number" min={0} value={v.i10_index} onChange={set("i10_index")} />
                        </div>
                      </div>
                    </div>
                  </fieldset>

                  {/* Editorial experience & motivation */}
                  <fieldset className="space-y-4">
                    <legend className="text-sm font-heading font-semibold text-foreground mb-1">Editorial experience &amp; motivation</legend>
                    <div>
                      <Label htmlFor="field-editorial_experience">Editorial &amp; peer-review experience</Label>
                      <Textarea id="field-editorial_experience" rows={4} value={v.editorial_experience} onChange={set("editorial_experience")}
                        placeholder="Describe any editorial roles, peer-review activity, or relevant service." />
                    </div>
                    <div>
                      <Label htmlFor="field-motivation">Motivation for joining <span className="text-destructive">*</span></Label>
                      <Textarea id="field-motivation" rows={5} value={v.motivation} onChange={set("motivation")} required {...aria("motivation")}
                        placeholder="Tell us why you would like to join the editorial board and what you would contribute." />
                      {errText("motivation")}
                    </div>
                  </fieldset>

                  {/* Preferences */}
                  <fieldset className="space-y-4">
                    <legend className="text-sm font-heading font-semibold text-foreground mb-1">Preferences</legend>
                    <div>
                      <span className="text-sm font-medium text-foreground">Preferred journal(s) <span className="text-destructive">*</span></span>
                      <p className="text-xs text-muted-foreground mb-2">Select all that match your expertise. The board serves the whole portfolio.</p>
                      <div id="field-preferred_journals" className="grid sm:grid-cols-2 gap-2" role="group" aria-label="Preferred journals" {...aria("preferred_journals")}>
                        {JOURNALS.map((j) => (
                          <label key={j.abbrev} className="flex items-start gap-2 border border-border bg-card p-3 cursor-pointer hover:bg-muted/40">
                            <Checkbox checked={journals.includes(j.abbrev)} onCheckedChange={() => toggleJournal(j.abbrev)} aria-label={j.title} className="mt-0.5" />
                            <span className="text-xs text-foreground leading-snug"><strong>{j.abbrev}</strong> — {j.title}</span>
                          </label>
                        ))}
                      </div>
                      {errText("preferred_journals")}
                    </div>
                    <div>
                      <Label htmlFor="field-review_capacity">Monthly review capacity <span className="text-destructive">*</span></Label>
                      <select id="field-review_capacity" value={v.review_capacity} onChange={set("review_capacity")} required {...aria("review_capacity")}
                        className="flex h-10 w-full max-w-xs rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                        <option value="">Select…</option>
                        {REVIEW_CAPACITY_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                      </select>
                      {errText("review_capacity")}
                    </div>
                  </fieldset>

                  {/* CV upload */}
                  <fieldset className="space-y-3">
                    <legend className="text-sm font-heading font-semibold text-foreground mb-1">Curriculum vitae</legend>
                    <div>
                      <Label htmlFor="field-cv">Upload your CV <span className="text-destructive">*</span></Label>
                      <input
                        id="field-cv" name="cv" type="file" accept={CV_ACCEPT_ATTR} required {...aria("cv")}
                        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                        className="mt-1 block w-full text-sm text-foreground file:mr-3 file:rounded-sm file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-medium file:text-primary-foreground hover:file:bg-primary-hover"
                      />
                      <p className="text-xs text-muted-foreground mt-1">PDF, DOC, or DOCX. Maximum 10 MB.</p>
                      {file ? <p className="text-xs text-foreground mt-1">Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)</p> : null}
                      {errText("cv")}
                    </div>
                  </fieldset>

                  {/* Consent */}
                  <div className="border-t border-border pt-5">
                    <label className="flex items-start gap-2 cursor-pointer">
                      <Checkbox id="field-consent" checked={consent} onCheckedChange={(c) => setConsent(c === true)} aria-describedby={errors.consent ? "err-consent" : "privacy-note"} className="mt-0.5" />
                      <span className="text-xs text-foreground leading-relaxed">
                        I consent to EP Journals Group processing the information and CV I have provided for the purpose
                        of assessing my application to join the editorial board. <span className="text-destructive">*</span>
                      </span>
                    </label>
                    {errText("consent")}
                    <p id="privacy-note" className="text-xs text-muted-foreground leading-relaxed mt-3">{PRIVACY_NOTE}</p>
                  </div>

                  <div>
                    <Button type="submit" disabled={submitting} className="min-w-40">
                      {submitting ? "Submitting…" : "Submit application"}
                    </Button>
                  </div>
                </form>
              )}
            </section>

            {/* FAQ */}
            <section aria-labelledby="faq-h" className="mt-12">
              <h2 id="faq-h" className="text-lg font-heading font-semibold text-foreground mb-3 border-b border-border pb-2">
                Frequently asked questions
              </h2>
              <dl className="space-y-4">
                {FAQS.map((f) => (
                  <div key={f.question} className="border border-border bg-card p-4">
                    <dt className="text-sm font-heading font-semibold text-foreground">{f.question}</dt>
                    <dd className="text-sm text-muted-foreground leading-relaxed mt-1">{f.answer}</dd>
                  </div>
                ))}
              </dl>
            </section>
          </div>

          {/* Sidebar */}
          <aside className="space-y-4">
            <div className="border border-border bg-secondary p-4">
              <h2 className="font-heading font-semibold text-foreground text-sm mb-2">At a glance</h2>
              <ul className="text-xs text-muted-foreground space-y-1.5">
                <li>· Voluntary scholarly service (no fee to apply)</li>
                <li>· Common board across all six journals</li>
                <li>· Double-blind peer review</li>
                <li>· Recognised on ORCID &amp; Web of Science</li>
                <li>· Review from one manuscript per month</li>
              </ul>
              <a href="#apply" className="mt-3 inline-flex items-center gap-1.5 text-primary text-sm hover:underline">
                Go to application <ArrowRight className="h-3.5 w-3.5" />
              </a>
            </div>
            <div className="border border-border bg-card p-4 text-xs text-muted-foreground leading-relaxed">
              <p className="font-heading font-semibold text-foreground text-sm mb-1">Questions?</p>
              Contact the editorial office at{" "}
              <a href="mailto:info@ep-journals.org" className="text-primary hover:underline">info@ep-journals.org</a>.
              <p className="mt-3">
                See the current <Link href="/editorial" className="text-primary hover:underline">editorial board</Link>{" "}
                and our <Link href="/policies" className="text-primary hover:underline">editorial policies</Link>.
              </p>
            </div>
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default JoinEditorialBoard;
