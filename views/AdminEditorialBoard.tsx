"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Download, FileDown, LogOut, Search, RefreshCw, ExternalLink } from "lucide-react";
import { STATUS_OPTIONS, STATUS_LABELS, JOURNALS, type ApplicationStatus } from "@/lib/editorialBoardConfig";

interface Application {
  id: string;
  full_name: string; email: string; phone: string | null; country: string;
  institution: string; department: string | null; current_position: string; highest_qualification: string;
  orcid: string | null; scopus_id: string | null; wos_id: string | null; google_scholar: string | null;
  researchgate: string | null; linkedin: string | null; personal_website: string | null;
  primary_research_area: string; secondary_research_area: string | null; keywords: string | null;
  years_experience: number | null; publication_count: number | null; citation_count: number | null;
  h_index: number | null; i10_index: number | null;
  editorial_experience: string | null; motivation: string;
  preferred_journals: string[]; review_capacity: string;
  cv_filename: string; cv_size: number | null;
  status: ApplicationStatus; admin_notes: string | null;
  created_at: string; updated_at: string;
}

const TOKEN_KEY = "eb_admin_token";
const journalTitle = (a: string) => JOURNALS.find((j) => j.abbrev === a)?.title ?? a;

const STATUS_BADGE: Record<ApplicationStatus, string> = {
  pending: "bg-muted text-foreground",
  under_review: "bg-amber-100 text-amber-800 border-amber-200",
  shortlisted: "bg-blue-100 text-blue-800 border-blue-200",
  approved: "bg-green-100 text-green-800 border-green-200",
  rejected: "bg-red-100 text-red-800 border-red-200",
};

function csvEscape(v: unknown): string {
  const s = String(v ?? "");
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

const AdminEditorialBoard = ({ highlightId }: { highlightId?: string }) => {
  const { toast } = useToast();
  const [token, setToken] = useState<string>("");
  const [tokenInput, setTokenInput] = useState("");
  const [authed, setAuthed] = useState(false);
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | ApplicationStatus>("");
  const [openId, setOpenId] = useState<string | undefined>(highlightId);
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    const saved = typeof window !== "undefined" ? sessionStorage.getItem(TOKEN_KEY) : null;
    if (saved) { setToken(saved); setAuthed(true); }
  }, []);

  const load = useCallback(async (tok: string, opts?: { q?: string; status?: string }) => {
    setLoading(true);
    const params = new URLSearchParams();
    if (opts?.q) params.set("q", opts.q);
    if (opts?.status) params.set("status", opts.status);
    try {
      const res = await fetch(`/api/admin/editorial-board?${params.toString()}`, {
        headers: { "x-admin-token": tok },
      });
      if (res.status === 401) {
        setAuthed(false);
        sessionStorage.removeItem(TOKEN_KEY);
        toast({ title: "Access denied", description: "Invalid admin token.", variant: "destructive" });
        return;
      }
      const data = await res.json();
      if (data.ok) setApps(data.applications as Application[]);
      else toast({ title: "Error", description: data.error || "Failed to load.", variant: "destructive" });
    } catch {
      toast({ title: "Network error", description: "Could not reach the server.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (authed && token) load(token);
  }, [authed, token, load]);

  const submitToken = (e: React.FormEvent) => {
    e.preventDefault();
    const t = tokenInput.trim();
    if (!t) return;
    sessionStorage.setItem(TOKEN_KEY, t);
    setToken(t);
    setAuthed(true);
    setTokenInput("");
  };

  const signOut = () => {
    sessionStorage.removeItem(TOKEN_KEY);
    setToken("");
    setAuthed(false);
    setApps([]);
  };

  const runSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    load(token, { q, status: statusFilter });
  };

  const updateApp = async (id: string, patch: { status?: ApplicationStatus; admin_notes?: string }) => {
    setSavingId(id);
    try {
      const res = await fetch("/api/admin/editorial-board", {
        method: "PATCH",
        headers: { "x-admin-token": token, "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...patch }),
      });
      const data = await res.json();
      if (data.ok) {
        setApps((prev) => prev.map((a) => (a.id === id ? { ...a, ...patch } : a)));
        toast({ title: "Saved" });
      } else {
        toast({ title: "Error", description: data.error || "Update failed.", variant: "destructive" });
      }
    } catch {
      toast({ title: "Network error", variant: "destructive" });
    } finally {
      setSavingId(null);
    }
  };

  const downloadCv = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/editorial-board?action=cv&id=${id}`, { headers: { "x-admin-token": token } });
      const data = await res.json();
      if (data.ok && data.url) window.open(data.url, "_blank", "noopener");
      else toast({ title: "Error", description: "Could not generate a download link.", variant: "destructive" });
    } catch {
      toast({ title: "Network error", variant: "destructive" });
    }
  };

  const exportCsv = () => {
    const cols: (keyof Application)[] = [
      "created_at", "status", "full_name", "email", "phone", "country", "institution", "department",
      "current_position", "highest_qualification", "orcid", "scopus_id", "wos_id", "google_scholar",
      "researchgate", "linkedin", "personal_website", "primary_research_area", "secondary_research_area",
      "keywords", "years_experience", "publication_count", "citation_count", "h_index", "i10_index",
      "review_capacity", "preferred_journals", "editorial_experience", "motivation", "admin_notes", "cv_filename", "id",
    ];
    const header = cols.join(",");
    const rows = filtered.map((a) =>
      cols.map((c) => csvEscape(Array.isArray(a[c]) ? (a[c] as string[]).join("; ") : a[c])).join(","),
    );
    const blob = new Blob([[header, ...rows].join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `editorial-board-applications-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Client-side filtering layered on top of the server query (instant refine).
  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return apps.filter((a) => {
      if (statusFilter && a.status !== statusFilter) return false;
      if (!needle) return true;
      return [a.full_name, a.email, a.institution, a.country, a.primary_research_area]
        .some((f) => (f || "").toLowerCase().includes(needle));
    });
  }, [apps, q, statusFilter]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: apps.length };
    for (const s of STATUS_OPTIONS) c[s] = apps.filter((a) => a.status === s).length;
    return c;
  }, [apps]);

  // ---- token gate ----
  if (!authed) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-16">
          <div className="max-w-sm mx-auto border border-border bg-card p-6">
            <h1 className="text-lg font-heading font-semibold text-foreground mb-1">Editorial Board — Admin</h1>
            <p className="text-xs text-muted-foreground mb-4">Enter the admin access token to review applications.</p>
            <form onSubmit={submitToken} className="space-y-3">
              <div>
                <Label htmlFor="admin-token">Admin token</Label>
                <Input id="admin-token" type="password" value={tokenInput} onChange={(e) => setTokenInput(e.target.value)} autoFocus />
              </div>
              <Button type="submit" className="w-full">Continue</Button>
            </form>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <section className="py-5 bg-ep-cream border-b border-border">
        <div className="container mx-auto px-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-lg font-heading font-semibold text-foreground">Editorial Board Applications</h1>
            <p className="text-xs text-muted-foreground">{counts.all} total · {counts.pending} pending · {counts.shortlisted} shortlisted · {counts.approved} approved</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => load(token, { q, status: statusFilter })}><RefreshCw className="h-4 w-4 mr-1" /> Refresh</Button>
            <Button variant="outline" size="sm" onClick={exportCsv} disabled={!filtered.length}><FileDown className="h-4 w-4 mr-1" /> Export CSV</Button>
            <Button variant="ghost" size="sm" onClick={signOut}><LogOut className="h-4 w-4 mr-1" /> Sign out</Button>
          </div>
        </div>
      </section>

      <main className="container mx-auto px-4 py-6">
        {/* Filters */}
        <form onSubmit={runSearch} className="flex flex-wrap items-end gap-3 mb-5">
          <div className="flex-1 min-w-[220px]">
            <Label htmlFor="q">Search (name, email, institution, country, area)</Label>
            <div className="flex gap-2">
              <Input id="q" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search applications…" />
              <Button type="submit" variant="outline"><Search className="h-4 w-4" /></Button>
            </div>
          </div>
          <div>
            <Label htmlFor="status">Status</Label>
            <select
              id="status" value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as "" | ApplicationStatus)}
              className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">All statuses</option>
              {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]} ({counts[s] ?? 0})</option>)}
            </select>
          </div>
        </form>

        {loading ? (
          <p className="text-sm text-muted-foreground">Loading applications…</p>
        ) : filtered.length === 0 ? (
          <div className="border border-border bg-card p-8 text-center">
            <p className="text-sm text-muted-foreground">No applications found.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((a) => {
              const open = openId === a.id;
              return (
                <div key={a.id} className={`border bg-card ${highlightId === a.id ? "border-primary" : "border-border"}`}>
                  <div className="p-4 flex items-start justify-between gap-4">
                    <button onClick={() => setOpenId(open ? undefined : a.id)} className="min-w-0 flex-1 text-left" aria-expanded={open}>
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <Badge variant="outline" className={`text-[10px] border ${STATUS_BADGE[a.status]}`}>{STATUS_LABELS[a.status]}</Badge>
                        <span className="text-[11px] text-muted-foreground">{new Date(a.created_at).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                      </div>
                      <h2 className="text-sm font-heading font-semibold text-foreground leading-snug">{a.full_name}</h2>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {a.current_position} · {a.institution}, {a.country} · {a.primary_research_area}
                      </p>
                    </button>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <select
                        value={a.status}
                        onChange={(e) => updateApp(a.id, { status: e.target.value as ApplicationStatus })}
                        disabled={savingId === a.id}
                        className="h-8 rounded-md border border-input bg-background px-2 text-xs"
                        aria-label={`Status for ${a.full_name}`}
                      >
                        {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                      </select>
                      <Button variant="outline" size="sm" onClick={() => downloadCv(a.id)}><Download className="h-3.5 w-3.5 mr-1" /> CV</Button>
                    </div>
                  </div>

                  {open ? (
                    <div className="border-t border-border p-4 grid md:grid-cols-2 gap-x-8 gap-y-4 text-xs">
                      <dl className="space-y-1.5">
                        <Row k="Email"><a className="text-primary hover:underline" href={`mailto:${a.email}`}>{a.email}</a></Row>
                        <Row k="Phone">{a.phone}</Row>
                        <Row k="Department">{a.department}</Row>
                        <Row k="Qualification">{a.highest_qualification}</Row>
                        <Row k="ORCID">{a.orcid ? <a className="text-primary hover:underline" href={`https://orcid.org/${a.orcid}`} target="_blank" rel="noopener noreferrer">{a.orcid}</a> : null}</Row>
                        <Row k="Scopus">{a.scopus_id}</Row>
                        <Row k="WoS ResearcherID">{a.wos_id}</Row>
                        <Row k="Google Scholar">{a.google_scholar ? <Ext href={a.google_scholar} /> : null}</Row>
                        <Row k="ResearchGate">{a.researchgate ? <Ext href={a.researchgate} /> : null}</Row>
                        <Row k="LinkedIn">{a.linkedin ? <Ext href={a.linkedin} /> : null}</Row>
                        <Row k="Website">{a.personal_website ? <Ext href={a.personal_website} /> : null}</Row>
                      </dl>
                      <dl className="space-y-1.5">
                        <Row k="Secondary area">{a.secondary_research_area}</Row>
                        <Row k="Keywords">{a.keywords}</Row>
                        <Row k="Experience">{a.years_experience != null ? `${a.years_experience} yrs` : null}</Row>
                        <Row k="Publications">{a.publication_count}</Row>
                        <Row k="Citations">{a.citation_count}</Row>
                        <Row k="h-index">{a.h_index}</Row>
                        <Row k="i10-index">{a.i10_index}</Row>
                        <Row k="Review capacity">{a.review_capacity}</Row>
                        <Row k="Preferred journals">{a.preferred_journals.map(journalTitle).join("; ")}</Row>
                        <Row k="CV">{a.cv_filename}{a.cv_size ? ` (${(a.cv_size / 1024 / 1024).toFixed(2)} MB)` : ""}</Row>
                      </dl>
                      {a.editorial_experience ? (
                        <div className="md:col-span-2">
                          <p className="font-semibold text-foreground mb-1">Editorial experience</p>
                          <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">{a.editorial_experience}</p>
                        </div>
                      ) : null}
                      <div className="md:col-span-2">
                        <p className="font-semibold text-foreground mb-1">Motivation</p>
                        <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">{a.motivation}</p>
                      </div>
                      <div className="md:col-span-2">
                        <Label htmlFor={`notes-${a.id}`}>Internal notes</Label>
                        <Textarea
                          id={`notes-${a.id}`} rows={2} defaultValue={a.admin_notes ?? ""}
                          onBlur={(e) => { if (e.target.value !== (a.admin_notes ?? "")) updateApp(a.id, { admin_notes: e.target.value }); }}
                          placeholder="Notes are saved when you click away."
                        />
                      </div>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

function Row({ k, children }: { k: string; children: React.ReactNode }) {
  const empty = children == null || children === "" || (typeof children === "number" && Number.isNaN(children));
  if (empty) return null;
  return (
    <div className="flex gap-2">
      <dt className="text-muted-foreground w-32 shrink-0">{k}</dt>
      <dd className="text-foreground min-w-0 break-words">{children}</dd>
    </div>
  );
}

function Ext({ href }: { href: string }) {
  return (
    <a className="text-primary hover:underline inline-flex items-center gap-1" href={href} target="_blank" rel="noopener noreferrer">
      Link <ExternalLink className="h-3 w-3" />
    </a>
  );
}

export default AdminEditorialBoard;
