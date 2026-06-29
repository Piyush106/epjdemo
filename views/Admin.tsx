"use client";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MetaTags from "@/components/MetaTags";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Trash2, Edit, Plus, LogOut, Key } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ContentPagesManager from "@/components/admin/ContentPagesManager";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useJournals, buildJournalMap, journalBadgeClass } from "@/hooks/useJournals";

interface Article {
  id: string;
  title: string;
  authors: string;
  abstract: string;
  keywords: string[];
  doi: string | null;
  journal_abbrev: string;
  journal_name: string;
  publication_date: string;
  volume: string | null;
  issue: string | null;
  pages: string | null;
  status: string;
  article_url: string | null;
  pdf_url: string | null;
}


const emptyForm = {
  title: "",
  authors: "",
  abstract: "",
  keywords: "",
  doi: "",
  journal_abbrev: "GJETR",
  publication_date: new Date().toISOString().split("T")[0],
  volume: "",
  issue: "",
  pages: "",
  status: "published",
  article_url: "",
  pdf_url: "",
};

const Admin = () => {
  const { user, isAdmin, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: journalsData = [] } = useJournals();
  // Lightweight shape used by this file's existing code paths.
  const journalOptions = journalsData.map((j) => ({ abbrev: j.abbrev, name: j.title }));
  const journalColorMap = buildJournalMap(journalsData);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [filterJournal, setFilterJournal] = useState("");
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const PAGE_SIZE = 30;
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (user && isAdmin) fetchArticles();
  }, [user, isAdmin]);

  const fetchArticles = async (append = false) => {
    if (append) setLoadingMore(true); else setLoading(true);
    const from = append ? articles.length : 0;
    const query = supabase
      .from("articles" as any)
      .select("id, title, authors, journal_abbrev, journal_name, publication_date, volume, issue, pages, status, doi, article_url, pdf_url")
      .order("publication_date", { ascending: false })
      .range(from, from + PAGE_SIZE - 1);
    const { data } = await query;
    const newData = (data as any) || [];
    if (append) {
      setArticles((prev) => [...prev, ...newData]);
    } else {
      setArticles(newData);
    }
    setHasMore(newData.length === PAGE_SIZE);
    setLoading(false);
    setLoadingMore(false);
  };

  const handleSave = async () => {
    const journalName = journalOptions.find((j) => j.abbrev === form.journal_abbrev)?.name || "";
    const payload = {
      title: form.title,
      authors: form.authors,
      abstract: form.abstract,
      keywords: form.keywords.split(",").map((k: string) => k.trim()).filter(Boolean),
      doi: form.doi || null,
      journal_abbrev: form.journal_abbrev,
      journal_name: journalName,
      publication_date: form.publication_date,
      volume: form.volume || null,
      issue: form.issue || null,
      pages: form.pages || null,
      status: form.status,
      created_by: user?.id,
      article_url: form.article_url || null,
      pdf_url: form.pdf_url || null,
    };

    let error;
    if (editingId) {
      ({ error } = await supabase.from("articles" as any).update(payload).eq("id", editingId));
    } else {
      ({ error } = await supabase.from("articles" as any).insert(payload));
    }

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: editingId ? "Article updated" : "Article created" });
      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);
      fetchArticles();
    }
  };

  const handleEdit = (article: Article) => {
    setEditingId(article.id);
    setForm({
      title: article.title,
      authors: article.authors,
      abstract: article.abstract,
      keywords: article.keywords?.join(", ") || "",
      doi: article.doi || "",
      journal_abbrev: article.journal_abbrev,
      publication_date: article.publication_date,
      volume: article.volume || "",
      issue: article.issue || "",
      pages: article.pages || "",
      status: article.status,
      article_url: article.article_url || "",
      pdf_url: article.pdf_url || "",
    });
    setShowForm(true);
  };

  const handleChangePassword = async () => {
    if (newPassword.length < 6) {
      toast({ title: "Error", description: "Password must be at least 6 characters.", variant: "destructive" });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: "Error", description: "Passwords do not match.", variant: "destructive" });
      return;
    }
    setChangingPassword(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setChangingPassword(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Password updated successfully" });
      setNewPassword("");
      setConfirmPassword("");
      setShowPasswordForm(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this article?")) return;
    const { error } = await supabase.from("articles" as any).delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Article deleted" });
      fetchArticles();
    }
  };

  if (authLoading) return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-muted-foreground text-sm">Checking authentication...</p>
      </div>
      <Footer />
    </div>
  );

  if (!user) return null; // Will redirect to /login via useEffect

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-xl font-heading font-semibold text-foreground mb-2">Access Denied</h1>
          <p className="text-muted-foreground text-sm">You do not have administrative privileges. Please contact the editorial office.</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <MetaTags title="Admin Panel – EP Journals Group" description="Administrative panel for managing articles." noindex />
      <Header />

      <section className="py-6 bg-ep-cream border-b border-border">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-heading font-semibold text-foreground">Article Management</h1>
            <p className="text-muted-foreground text-sm">Administrative panel — manage published articles across all journals.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => { setShowForm(true); setEditingId(null); setForm(emptyForm); }}>
              <Plus className="h-4 w-4 mr-1" /> New Article
            </Button>
            <Button variant="outline" size="sm" onClick={() => setShowPasswordForm(!showPasswordForm)}>
              <Key className="h-4 w-4 mr-1" /> Change Password
            </Button>
            <Button variant="ghost" size="sm" onClick={signOut}>
              <LogOut className="h-4 w-4 mr-1" /> Sign Out
            </Button>
          </div>
        </div>
      </section>

      <section className="py-8 bg-background">
        <div className="container mx-auto px-4">
          <Tabs defaultValue="articles" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="articles">Articles</TabsTrigger>
              <TabsTrigger value="content-pages">Content Pages</TabsTrigger>
            </TabsList>
            <TabsContent value="content-pages">
              <ContentPagesManager />
            </TabsContent>
            <TabsContent value="articles">

          {/* Change Password Form */}
          {showPasswordForm && (
            <div className="border border-border bg-card p-6 mb-8 max-w-md">
              <h2 className="text-base font-heading font-semibold text-foreground mb-4">Change Password</h2>
              <div className="space-y-3">
                <div>
                  <Label>New Password</Label>
                  <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Min 6 characters" />
                </div>
                <div>
                  <Label>Confirm New Password</Label>
                  <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleChangePassword} disabled={changingPassword}>
                    {changingPassword ? "Updating..." : "Update Password"}
                  </Button>
                  <Button variant="outline" onClick={() => { setShowPasswordForm(false); setNewPassword(""); setConfirmPassword(""); }}>Cancel</Button>
                </div>
              </div>
            </div>
          )}

          {/* Article Form */}
          {showForm && (
            <div className="border border-border bg-card p-6 mb-8">
              <h2 className="text-base font-heading font-semibold text-foreground mb-4">
                {editingId ? "Edit Article" : "Create New Article"}
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <Label>Title</Label>
                  <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                </div>
                <div className="sm:col-span-2">
                  <Label>Authors</Label>
                  <Input value={form.authors} onChange={(e) => setForm({ ...form, authors: e.target.value })} placeholder="e.g. A. Smith, B. Jones" />
                </div>
                <div className="sm:col-span-2">
                  <Label>Abstract</Label>
                  <Textarea value={form.abstract} onChange={(e) => setForm({ ...form, abstract: e.target.value })} rows={5} />
                </div>
                <div>
                  <Label>Journal</Label>
                  <Select value={form.journal_abbrev} onValueChange={(v) => setForm({ ...form, journal_abbrev: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {journalOptions.map((j) => (
                        <SelectItem key={j.abbrev} value={j.abbrev}>{j.abbrev} — {j.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Publication Date</Label>
                  <Input type="date" value={form.publication_date} onChange={(e) => setForm({ ...form, publication_date: e.target.value })} />
                </div>
                <div>
                  <Label>DOI</Label>
                  <Input value={form.doi} onChange={(e) => setForm({ ...form, doi: e.target.value })} placeholder="10.65150/EP-..." />
                </div>
                <div>
                  <Label>Keywords (comma-separated)</Label>
                  <Input value={form.keywords} onChange={(e) => setForm({ ...form, keywords: e.target.value })} />
                </div>
                <div>
                  <Label>Volume</Label>
                  <Input value={form.volume} onChange={(e) => setForm({ ...form, volume: e.target.value })} />
                </div>
                <div>
                  <Label>Issue</Label>
                  <Input value={form.issue} onChange={(e) => setForm({ ...form, issue: e.target.value })} />
                </div>
                <div>
                  <Label>Pages</Label>
                  <Input value={form.pages} onChange={(e) => setForm({ ...form, pages: e.target.value })} placeholder="e.g. 1-15" />
                </div>
                <div>
                  <Label>Status</Label>
                  <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="retracted">Retracted</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="sm:col-span-2">
                  <Label>Article URL (Read Online link)</Label>
                  <Input value={form.article_url} onChange={(e) => setForm({ ...form, article_url: e.target.value })} placeholder="https://journal.ep-journals.org/.../view/..." />
                </div>
                <div className="sm:col-span-2">
                  <Label>PDF URL (Direct PDF link)</Label>
                  <Input value={form.pdf_url} onChange={(e) => setForm({ ...form, pdf_url: e.target.value })} placeholder="https://journal.ep-journals.org/.../view/.../..." />
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Button onClick={handleSave}>{editingId ? "Update" : "Create"}</Button>
                <Button variant="outline" onClick={() => { setShowForm(false); setEditingId(null); setForm(emptyForm); }}>Cancel</Button>
              </div>
            </div>
          )}

          {/* Journal filter for admin */}
          <div className="flex flex-wrap gap-2 mb-4">
            {[{ abbrev: "", label: "All Journals" }, ...journalOptions.map(j => ({ abbrev: j.abbrev, label: j.abbrev }))].map((f) => (
              <button
                key={f.abbrev}
                onClick={() => setFilterJournal(f.abbrev)}
                className={`px-3 py-1.5 text-xs border transition-colors ${
                  filterJournal === f.abbrev
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card text-foreground border-border hover:bg-muted"
                }`}
              >
                {f.label}
              </button>
            ))}
            <span className="ml-auto text-xs text-muted-foreground self-center">
              {articles.filter(a => !filterJournal || a.journal_abbrev === filterJournal).length} shown
            </span>
          </div>

          {/* Article list */}
          {loading ? (
            <p className="text-muted-foreground text-sm">Loading articles...</p>
          ) : articles.length === 0 ? (
            <div className="border border-border bg-card p-8 text-center">
              <p className="text-muted-foreground text-sm">No articles yet. Click "New Article" to add the first one.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {articles.filter(a => !filterJournal || a.journal_abbrev === filterJournal).map((article) => (
                <div key={article.id} className="border border-border bg-card p-4 flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className={`text-[10px] border ${journalBadgeClass(journalColorMap[article.journal_abbrev]?.color_token)}`}>{article.journal_abbrev}</Badge>
                      <Badge variant={article.status === "published" ? "default" : "secondary"} className="text-[10px]">
                        {article.status}
                      </Badge>
                    </div>
                    <h3 className="text-sm font-heading font-semibold text-foreground leading-snug">{article.title}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{article.authors} · {article.publication_date}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(article)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(article.id)} className="text-destructive hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Load More */}
          {!loading && hasMore && articles.length > 0 && (
            <div className="mt-4 text-center">
              <Button variant="outline" onClick={() => fetchArticles(true)} disabled={loadingMore}>
                {loadingMore ? "Loading..." : "Load More Articles"}
              </Button>
            </div>
          )}

          {!loading && !hasMore && articles.length > 0 && (
            <p className="mt-4 text-center text-xs text-muted-foreground">All {articles.length} articles loaded</p>
          )}
            </TabsContent>
          </Tabs>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Admin;
