"use client";
import { useState, useRef } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MetaTags from "@/components/MetaTags";
import SchemaOrg from "@/components/SchemaOrg";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileText, BookOpen, Users, ClipboardList, Library, CheckCircle2, Loader2 } from "lucide-react";
import { useJournals } from "@/hooks/useJournals";

const ACCEPTED_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

const SubmitManuscript = () => {
  const { toast } = useToast();
  const { data: journals = [] } = useJournals();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [refId, setRefId] = useState("");
  const [dragActive, setDragActive] = useState(false);

  const [journal, setJournal] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [email, setEmail] = useState("");
  const [affiliation, setAffiliation] = useState("");
  const [country, setCountry] = useState("");
  const [paperTitle, setPaperTitle] = useState("");
  const [abstract, setAbstract] = useState("");
  const [keywords, setKeywords] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [comments, setComments] = useState("");
  const [declaration, setDeclaration] = useState(false);
  // Anti-spam: honeypot field (bots fill it; humans never see it) + form-open time.
  const [website, setWebsite] = useState("");
  const mountedAt = useRef<number>(Date.now());

  const validateFile = (f: File): string | null => {
    if (!ACCEPTED_TYPES.includes(f.type) && !f.name.match(/\.(pdf|docx)$/i)) {
      return "Please upload a PDF or DOCX file.";
    }
    if (f.size > MAX_FILE_SIZE) {
      return "File size must be under 20 MB.";
    }
    return null;
  };

  const handleFileChange = (f: File | null) => {
    if (!f) return;
    const err = validateFile(f);
    if (err) {
      toast({ title: "Invalid file", description: err, variant: "destructive" });
      return;
    }
    setFile(f);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) handleFileChange(e.dataTransfer.files[0]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Anti-spam: silently drop bot submissions (honeypot filled, or submitted
    // implausibly fast). Show success so bots get no signal; nothing is recorded.
    if (website || Date.now() - mountedAt.current < 3000) {
      setSubmitted(true);
      return;
    }

    if (!journal || !authorName || !email || !affiliation || !paperTitle || !abstract || !file || !declaration) {
      toast({ title: "Missing fields", description: "Please complete all required fields.", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      // Upload file
      const fileExt = file.name.split(".").pop();
      const filePath = `${Date.now()}-${crypto.randomUUID()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("manuscript-files")
        .upload(filePath, file);

      if (uploadError) throw new Error("File upload failed: " + uploadError.message);

      // Insert submission record
      const submissionId = crypto.randomUUID();
      const reference = `EP-${submissionId.slice(0, 8).toUpperCase()}`;
      setRefId(reference);
      const { error: insertError } = await supabase
        .from("manuscript_submissions")
        .insert({
          id: submissionId,
          journal_name: journal,
          author_name: authorName,
          author_email: email,
          affiliation,
          country: country || null,
          paper_title: paperTitle,
          abstract,
          keywords: keywords || null,
          file_path: filePath,
          file_name: file.name,
          comments: comments || null,
          declaration_confirmed: true,
        });

      if (insertError) throw new Error("Submission failed: " + insertError.message);

      // Read file as base64 for email attachment
      const fileBase64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result.split(",")[1]); // strip data:...;base64, prefix
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      // Send emails via Resend (editor notification + author confirmation)
      try {
        await supabase.functions.invoke("notify-submission", {
          body: {
            reference,
            journal,
            authorName,
            email,
            affiliation,
            country,
            paperTitle,
            abstract,
            keywords,
            comments,
            fileName: file.name,
            fileBase64,
            fileType: file.type,
          },
        });
      } catch {
        console.warn("Email notification failed, submission was still recorded.");
      }

      setSubmitted(true);
    } catch (err: any) {
      toast({ title: "Submission error", description: err.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background">
        <MetaTags title="Submission Received – EP Journals Group" description="Your manuscript has been submitted successfully." />
        <Header />
        <main className="container mx-auto px-4 py-12 max-w-2xl text-center">
          <CheckCircle2 className="h-16 w-16 text-primary mx-auto mb-4" />
          <h1 className="text-2xl font-heading font-semibold text-foreground mb-3">Manuscript Submitted Successfully</h1>
          {refId && (
            <p className="text-sm text-foreground mb-3">
              Your reference number: <span className="font-mono font-semibold text-primary">{refId}</span>
              <span className="block text-xs text-muted-foreground mt-1">Please quote this in any correspondence.</span>
            </p>
          )}
          <p className="text-sm text-muted-foreground leading-relaxed mb-6">
            Your manuscript has been received and will be reviewed by our editorial team.
            A confirmation has been sent to your email address. You will be contacted regarding
            the status of your submission in due course.
          </p>
          <Separator className="my-6" />
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button variant="outline" asChild><Link to="/">Return to Homepage</Link></Button>
            <Button asChild><Link to="/articles">Browse Articles</Link></Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <MetaTags
        title="Manuscript Submission | Submit Paper to Open Access Journal | EP Journals Group"
        description="Submit your research paper for peer review and open access publication. Fast double-blind peer review (1–2 weeks), CrossRef DOI on acceptance, CC BY 4.0 licence. Submit a manuscript to EP Journals Group."
      />
      <SchemaOrg type="WebPage" data={{"name":"Submit a Manuscript | EP Journals Group","description":"Submit your research paper for open access publication. Double-blind peer review, CrossRef DOI, CC BY 4.0 licence.","url":"https://www.ep-journals.org/submit","inLanguage":"en"}} />
      <Header />

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Introduction */}
        <section className="mb-8">
          <h1 className="text-xl font-heading font-semibold text-foreground mb-3">Submit Your Research Paper</h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Submit a manuscript to one of EP Journals Group's six peer-reviewed open access journals. Double-blind
            peer review in 1–2 weeks, CrossRef DOI on acceptance, published under CC BY 4.0.
          </p>
        </section>

        {/* Submission Form */}
        <section className="mb-8">
          <h2 className="text-base font-heading font-semibold text-foreground mb-1">Submission Form</h2>
          <p className="text-xs text-muted-foreground mb-6">Fields marked with * are required.</p>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Honeypot — hidden from real users; bots that fill it are silently dropped. */}
            <input
              type="text"
              name="website"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              style={{ position: "absolute", left: "-9999px", width: 1, height: 1, opacity: 0 }}
            />
            {/* A. Journal Selection */}
            <fieldset className="space-y-3">
              <legend className="text-sm font-heading font-semibold text-foreground border-b border-border pb-1 w-full mb-2">
                A. Journal Selection
              </legend>
              <div>
                <Label htmlFor="journal">Target Journal *</Label>
                <Select value={journal} onValueChange={setJournal}>
                  <SelectTrigger id="journal" className="mt-1">
                    <SelectValue placeholder="Select a journal" />
                  </SelectTrigger>
                  <SelectContent>
                    {journals.map((j) => (
                      <SelectItem key={j.abbrev} value={j.title}>
                        {j.title} ({j.abbrev})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </fieldset>

            {/* B. Author Details */}
            <fieldset className="space-y-3">
              <legend className="text-sm font-heading font-semibold text-foreground border-b border-border pb-1 w-full mb-2">
                B. Author Details
              </legend>
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="authorName">Full Name *</Label>
                  <Input id="authorName" value={authorName} onChange={(e) => setAuthorName(e.target.value)} className="mt-1" maxLength={200} />
                </div>
                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1" maxLength={255} />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="affiliation">Affiliation / Institution *</Label>
                  <Input id="affiliation" value={affiliation} onChange={(e) => setAffiliation(e.target.value)} className="mt-1" maxLength={300} />
                </div>
                <div>
                  <Label htmlFor="country">Country</Label>
                  <Input id="country" value={country} onChange={(e) => setCountry(e.target.value)} className="mt-1" maxLength={100} />
                </div>
              </div>
            </fieldset>

            {/* C. Manuscript Details */}
            <fieldset className="space-y-3">
              <legend className="text-sm font-heading font-semibold text-foreground border-b border-border pb-1 w-full mb-2">
                C. Manuscript Details
              </legend>
              <div>
                <Label htmlFor="paperTitle">Paper Title *</Label>
                <Input id="paperTitle" value={paperTitle} onChange={(e) => setPaperTitle(e.target.value)} className="mt-1" maxLength={500} />
              </div>
              <div>
                <Label htmlFor="abstract">Abstract *</Label>
                <Textarea id="abstract" value={abstract} onChange={(e) => setAbstract(e.target.value)} className="mt-1 min-h-[140px]" maxLength={5000} />
              </div>
              <div>
                <Label htmlFor="keywords">Keywords</Label>
                <Input id="keywords" value={keywords} onChange={(e) => setKeywords(e.target.value)} className="mt-1" placeholder="e.g., machine learning, data analysis, optimization" maxLength={500} />
              </div>
            </fieldset>

            {/* D. File Upload */}
            <fieldset className="space-y-3">
              <legend className="text-sm font-heading font-semibold text-foreground border-b border-border pb-1 w-full mb-2">
                D. Manuscript File Upload
              </legend>
              <div
                className={`border-2 border-dashed rounded p-6 text-center transition-colors cursor-pointer ${
                  dragActive ? "border-primary bg-accent" : "border-border hover:border-primary/50"
                }`}
                onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                onDragLeave={() => setDragActive(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx"
                  className="hidden"
                  onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                />
                {file ? (
                  <div className="flex items-center justify-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    <span className="text-sm text-foreground font-medium">{file.name}</span>
                    <span className="text-xs text-muted-foreground">({(file.size / 1024 / 1024).toFixed(1)} MB)</span>
                  </div>
                ) : (
                  <>
                    <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Drag and drop your manuscript here, or <span className="text-primary underline">browse files</span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">Accepted formats: PDF, DOCX · Max 20 MB · Max 21 pages (contact editorial office if exceeding)</p>
                  </>
                )}
              </div>
              {file && (
                <Button type="button" variant="ghost" size="sm" onClick={() => setFile(null)} className="text-xs">
                  Remove file
                </Button>
              )}
            </fieldset>

            {/* E. Comments */}
            <fieldset className="space-y-3">
              <legend className="text-sm font-heading font-semibold text-foreground border-b border-border pb-1 w-full mb-2">
                E. Additional Information
              </legend>
              <div>
                <Label htmlFor="comments">Additional Comments (optional)</Label>
                <Textarea id="comments" value={comments} onChange={(e) => setComments(e.target.value)} className="mt-1" maxLength={2000} placeholder="Any additional information for the editorial team" />
              </div>
            </fieldset>

            {/* F. Declaration */}
            <fieldset className="space-y-3">
              <legend className="text-sm font-heading font-semibold text-foreground border-b border-border pb-1 w-full mb-2">
                F. Declaration
              </legend>
              <div className="flex items-start gap-3 p-3 border border-border bg-card">
                <Checkbox
                  id="declaration"
                  checked={declaration}
                  onCheckedChange={(checked) => setDeclaration(checked === true)}
                  className="mt-0.5"
                />
                <Label htmlFor="declaration" className="text-sm leading-relaxed cursor-pointer">
                  I confirm that this manuscript is original, has not been published previously, and is not
                  currently under consideration for publication elsewhere. I agree to the publication ethics
                  and policies of EP Journals Group.
                </Label>
              </div>
            </fieldset>

            <Separator />

            {/* G. Submit */}
            <div className="flex justify-end">
              <Button type="submit" disabled={submitting} className="min-w-[200px]">
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Submitting…
                  </>
                ) : (
                  "Submit Manuscript"
                )}
              </Button>
            </div>
          </form>
        </section>

        <Separator className="mb-8" />

        {/* Why EP Journals Group */}
        <section className="mb-8">
          <h2 className="text-base font-heading font-semibold text-foreground mb-3">Why Publish with EP Journals Group</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                icon: "⏱",
                label: "Fast Peer Review",
                desc: "Initial editorial decision within 2 working days. Full double-blind peer review completed within 1–2 weeks.",
              },
              {
                icon: "🔓",
                label: "Immediate Open Access",
                desc: "All accepted articles are published immediately under CC BY 4.0 — free to read, share, and reuse by anyone.",
              },
              {
                icon: "🔗",
                label: "CrossRef DOI",
                desc: "Every accepted article receives a CrossRef Digital Object Identifier (DOI), ensuring permanent, citable access.",
              },
              {
                icon: "📅",
                label: "Monthly Publication",
                desc: "Articles are published on a rolling basis and compiled into monthly issues, minimising delay between acceptance and publication.",
              },
              {
                icon: "📑",
                label: "Indexing & Discoverability",
                desc: "Articles are submitted to CrossRef (enabling Google Scholar indexation), with DOAJ listing underway for all six journals.",
              },
              {
                icon: "✅",
                label: "Rigorous Ethics",
                desc: "All journals follow COPE guidelines for publication ethics. Plagiarism checking, conflict of interest disclosure, and data transparency are required.",
              },
            ].map((item) => (
              <div key={item.label} className="border border-border bg-card p-4">
                <div className="text-2xl mb-2">{item.icon}</div>
                <p className="text-sm font-semibold text-foreground mb-1">{item.label}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <Separator className="mb-8" />

        {/* Quick Links */}
        <section className="mb-8">
          <h2 className="text-base font-heading font-semibold text-foreground mb-3">Before You Submit</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              { to: "/authors", icon: BookOpen, label: "Author Guidelines", desc: "Formatting and submission requirements" },
              { to: "/editorial", icon: Users, label: "Editorial Board", desc: "Meet our editors and reviewers" },
              { to: "/publication-process", icon: ClipboardList, label: "Publication Process", desc: "From submission to publication" },
              { to: "/journals", icon: Library, label: "Journals List", desc: "Browse all available journals" },
            ].map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="flex items-start gap-3 p-3 border border-border bg-card hover:bg-muted transition-colors"
              >
                <link.icon className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <div>
                  <span className="text-sm font-medium text-foreground">{link.label}</span>
                  <p className="text-xs text-muted-foreground">{link.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default SubmitManuscript;
