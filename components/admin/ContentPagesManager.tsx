"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Edit, Trash2, Plus, ExternalLink } from "lucide-react";

type Category = "guide" | "comparison" | "publishing" | "user-focused";

const categoryToPath: Record<Category, string> = {
  guide: "guides",
  comparison: "comparisons",
  publishing: "publishing",
  "user-focused": "resources",
};

interface ContentPageRow {
  id: string;
  slug: string;
  category: Category;
  title: string;
  status: string;
  reading_time_minutes: number | null;
  updated_at: string;
}

interface FormState {
  slug: string;
  category: Category;
  title: string;
  subtitle: string;
  summary: string;
  meta_title: string;
  meta_description: string;
  keywords: string; // comma separated
  last_updated: string;
  status: "published" | "draft";
  body_blocks_json: string; // JSON edited as text
  faqs_json: string;
  related_links_json: string;
}

const emptyForm: FormState = {
  slug: "",
  category: "guide",
  title: "",
  subtitle: "",
  summary: "",
  meta_title: "",
  meta_description: "",
  keywords: "",
  last_updated: new Date().toLocaleString("en-GB", { month: "long", year: "numeric" }),
  status: "published",
  body_blocks_json: "[]",
  faqs_json: "[]",
  related_links_json: "[]",
};

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const estimateReadingTime = (blocksJson: string): number => {
  try {
    const blocks = JSON.parse(blocksJson);
    let words = 0;
    const collect = (b: any) => {
      if (b?.text) words += String(b.text).split(/\s+/).length;
      if (Array.isArray(b?.items)) words += b.items.join(" ").split(/\s+/).length;
      if (Array.isArray(b?.rows)) b.rows.forEach((r: string[]) => words += r.join(" ").split(/\s+/).length);
    };
    if (Array.isArray(blocks)) blocks.forEach(collect);
    return Math.max(1, Math.round(words / 200));
  } catch {
    return 1;
  }
};

const ContentPagesManager = () => {
  const { toast } = useToast();
  const [pages, setPages] = useState<ContentPageRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [filterCategory, setFilterCategory] = useState<string>("");

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("content_pages" as any)
      .select("id, slug, category, title, status, reading_time_minutes, updated_at")
      .order("updated_at", { ascending: false });
    if (error) {
      toast({ title: "Error loading pages", description: error.message, variant: "destructive" });
    }
    setPages(((data as any) || []) as ContentPageRow[]);
    setLoading(false);
  };

  const openNew = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = async (id: string) => {
    const { data, error } = await supabase
      .from("content_pages" as any)
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error || !data) {
      toast({ title: "Error", description: error?.message || "Not found", variant: "destructive" });
      return;
    }
    const d: any = data;
    setEditingId(id);
    setForm({
      slug: d.slug,
      category: d.category,
      title: d.title,
      subtitle: d.subtitle || "",
      summary: d.summary || "",
      meta_title: d.meta_title || "",
      meta_description: d.meta_description || "",
      keywords: (d.keywords || []).join(", "),
      last_updated: d.last_updated,
      status: d.status,
      body_blocks_json: JSON.stringify(d.body_blocks || [], null, 2),
      faqs_json: JSON.stringify(d.faqs || [], null, 2),
      related_links_json: JSON.stringify(d.related_links || [], null, 2),
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    let body_blocks: unknown, faqs: unknown, related_links: unknown;
    try {
      body_blocks = JSON.parse(form.body_blocks_json || "[]");
      faqs = JSON.parse(form.faqs_json || "[]");
      related_links = JSON.parse(form.related_links_json || "[]");
    } catch (e: any) {
      toast({ title: "Invalid JSON", description: e.message, variant: "destructive" });
      return;
    }

    const payload = {
      slug: form.slug || slugify(form.title),
      category: form.category,
      title: form.title,
      subtitle: form.subtitle || null,
      summary: form.summary || null,
      meta_title: form.meta_title || null,
      meta_description: form.meta_description,
      keywords: form.keywords.split(",").map((k) => k.trim()).filter(Boolean),
      reading_time_minutes: estimateReadingTime(form.body_blocks_json),
      body_blocks,
      faqs,
      related_links,
      last_updated: form.last_updated,
      status: form.status,
    };

    const { error } = editingId
      ? await supabase.from("content_pages" as any).update(payload).eq("id", editingId)
      : await supabase.from("content_pages" as any).insert(payload);

    if (error) {
      toast({ title: "Error saving page", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: editingId ? "Page updated" : "Page created" });
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
    fetchPages();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this content page?")) return;
    const { error } = await supabase.from("content_pages" as any).delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Page deleted" });
      fetchPages();
    }
  };

  const filtered = pages.filter((p) => !filterCategory || p.category === filterCategory);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-heading font-semibold text-foreground">Content Pages</h2>
          <p className="text-xs text-muted-foreground">
            Manage knowledge-platform pages (guides, comparisons, publishing, user-focused). Pages render dynamically at <code className="text-xs">/{`{category}`}/{`{slug}`}</code>.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={openNew}>
          <Plus className="h-4 w-4 mr-1" /> New Content Page
        </Button>
      </div>

      {showForm && (
        <div className="border border-border bg-card p-6 mb-6">
          <h3 className="text-sm font-heading font-semibold text-foreground mb-4">
            {editingId ? "Edit content page" : "Create new content page"}
          </h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Label>Title</Label>
              <Input
                value={form.title}
                onChange={(e) => {
                  const t = e.target.value;
                  setForm((f) => ({ ...f, title: t, slug: f.slug || slugify(t) }));
                }}
              />
            </div>
            <div>
              <Label>Slug</Label>
              <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: slugify(e.target.value) })} />
            </div>
            <div>
              <Label>Category</Label>
              <Select value={form.category} onValueChange={(v: Category) => setForm({ ...form, category: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="guide">Guide (/guides/)</SelectItem>
                  <SelectItem value="comparison">Comparison (/comparisons/)</SelectItem>
                  <SelectItem value="publishing">Publishing (/publishing/)</SelectItem>
                  <SelectItem value="user-focused">User-Focused (/resources/)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="sm:col-span-2">
              <Label>Subtitle</Label>
              <Input value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} />
            </div>
            <div className="sm:col-span-2">
              <Label>Summary (≤300 chars)</Label>
              <Textarea
                value={form.summary}
                rows={2}
                maxLength={300}
                onChange={(e) => setForm({ ...form, summary: e.target.value })}
              />
            </div>
            <div className="sm:col-span-2">
              <Label>Meta description (used for SEO)</Label>
              <Textarea
                value={form.meta_description}
                rows={2}
                onChange={(e) => setForm({ ...form, meta_description: e.target.value })}
              />
            </div>
            <div>
              <Label>Meta title (optional)</Label>
              <Input value={form.meta_title} onChange={(e) => setForm({ ...form, meta_title: e.target.value })} />
            </div>
            <div>
              <Label>Keywords (comma-separated)</Label>
              <Input value={form.keywords} onChange={(e) => setForm({ ...form, keywords: e.target.value })} />
            </div>
            <div>
              <Label>Last updated (display string)</Label>
              <Input value={form.last_updated} onChange={(e) => setForm({ ...form, last_updated: e.target.value })} />
            </div>
            <div>
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v: "published" | "draft") => setForm({ ...form, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="sm:col-span-2">
              <Separator className="my-2" />
              <Label>Body blocks (JSON array)</Label>
              <p className="text-xs text-muted-foreground mb-1">
                Block types: heading, paragraph, list, callout, quote, table, key_points, separator, html. Inline markdown in text: <code>**bold**</code>, <code>*italic*</code>, <code>[label](url)</code>.
              </p>
              <Textarea
                value={form.body_blocks_json}
                rows={14}
                className="font-mono text-xs"
                onChange={(e) => setForm({ ...form, body_blocks_json: e.target.value })}
              />
            </div>

            <div className="sm:col-span-2">
              <Label>FAQs (JSON array of {`{question, answer}`})</Label>
              <Textarea
                value={form.faqs_json}
                rows={6}
                className="font-mono text-xs"
                onChange={(e) => setForm({ ...form, faqs_json: e.target.value })}
              />
            </div>

            <div className="sm:col-span-2">
              <Label>Related links (JSON array of {`{to, label, description?, external?}`})</Label>
              <Textarea
                value={form.related_links_json}
                rows={5}
                className="font-mono text-xs"
                onChange={(e) => setForm({ ...form, related_links_json: e.target.value })}
              />
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <Button onClick={handleSave}>{editingId ? "Update" : "Create"}</Button>
            <Button variant="outline" onClick={() => { setShowForm(false); setEditingId(null); setForm(emptyForm); }}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2 mb-4">
        {[
          { v: "", label: "All Categories" },
          { v: "guide", label: "Guides" },
          { v: "comparison", label: "Comparisons" },
          { v: "publishing", label: "Publishing" },
          { v: "user-focused", label: "User-Focused" },
        ].map((f) => (
          <button
            key={f.v}
            onClick={() => setFilterCategory(f.v)}
            className={`px-3 py-1.5 text-xs border transition-colors ${
              filterCategory === f.v
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card text-foreground border-border hover:bg-muted"
            }`}
          >
            {f.label}
          </button>
        ))}
        <span className="ml-auto text-xs text-muted-foreground self-center">{filtered.length} shown</span>
      </div>

      {loading ? (
        <p className="text-muted-foreground text-sm">Loading content pages...</p>
      ) : filtered.length === 0 ? (
        <div className="border border-border bg-card p-8 text-center">
          <p className="text-muted-foreground text-sm">No content pages yet. Click "New Content Page" to add one.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((p) => {
            const path = `/${categoryToPath[p.category]}/${p.slug}`;
            return (
              <div key={p.id} className="border border-border bg-card p-3 flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="text-[10px]">{p.category}</Badge>
                    <Badge variant={p.status === "published" ? "default" : "secondary"} className="text-[10px]">
                      {p.status}
                    </Badge>
                    {p.reading_time_minutes ? (
                      <span className="text-[10px] text-muted-foreground">{p.reading_time_minutes} min</span>
                    ) : null}
                  </div>
                  <h3 className="text-sm font-heading font-semibold text-foreground leading-snug">{p.title}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    <a href={path} target="_blank" rel="noopener noreferrer" className="hover:underline inline-flex items-center gap-1">
                      {path} <ExternalLink className="h-3 w-3" />
                    </a>
                    {" · updated "}{new Date(p.updated_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button variant="ghost" size="sm" onClick={() => openEdit(p.id)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(p.id)} className="text-destructive hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ContentPagesManager;
