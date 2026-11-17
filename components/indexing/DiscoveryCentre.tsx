import Image from "next/image";
import Link from "next/link";
import { Archive, BookMarked, FileCheck2, Fingerprint, Network, Search, type LucideIcon } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ScholarCoverage from "@/components/indexing/ScholarCoverage";
import DiscoveryIllustration from "@/components/indexing/DiscoveryIllustration";
import type { Journal } from "@/lib/types";
import type { ScholarSummary } from "@/lib/scholarCoverage";
import {
  CATEGORIES, CROSSREF_MEMBER, JOURNAL_ORDER, LAST_VERIFIED, MATRIX, NEXT_REVIEW, OPPORTUNITIES, PLATFORMS,
  STATUS, STATUS_KINDS, VERIFY_METHOD, fmtLongDate, platform, statusFor, type Platform, type StatusKind,
} from "@/lib/indexing";

// /indexing — Scholarly Discovery & Indexing Centre.
// Order: hero · portfolio stats · platform directory · journal matrix ·
// Google Scholar article-level coverage · platforms under evaluation ·
// methodology · publisher facts. Statuses come from lib/indexing.ts,
// Scholar checks from the scholar_checks table.

const CATEGORY_ICON: Record<string, LucideIcon> = { discovery: Search, identifiers: Fingerprint, repository: Archive, registry: BookMarked };

const FLOW: { icon: LucideIcon; title: string; text: string; logo?: string }[] = [
  { icon: FileCheck2, title: "Published", text: "Peer-reviewed article goes live on ep-journals.org with full citation metadata." },
  { icon: Fingerprint, title: "DOI registered", text: "A Crossref DOI makes it permanently citable.", logo: "/logos/platforms/crossref.webp" },
  { icon: Network, title: "Metadata shared", text: "Records flow to OpenAlex, Scilit, OpenAIRE and Semantic Scholar.", logo: "/logos/platforms/openalex.webp" },
  { icon: Search, title: "Discovered", text: "Readers find it through Google Scholar and research databases.", logo: "/logos/platforms/google-scholar.webp" },
];

const LOGO_STRIP = ["crossref", "scholar", "openalex", "zenodo"] as const;

const PILL: Record<"verified" | "infra" | "neutral" | "pending", string> = {
  verified: "border-emerald-700/40 bg-emerald-50 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200",
  infra: "border-primary/40 bg-ep-cream text-ep-brown",
  neutral: "border-border bg-card text-foreground",
  pending: "border-amber-700/30 bg-amber-50 text-amber-900 dark:bg-amber-950 dark:text-amber-200",
};

function Pill({ kind, href, title }: { kind: StatusKind; href?: string; title?: string }) {
  const k = STATUS_KINDS[kind];
  const cls = `inline-block whitespace-nowrap rounded-sm border px-2 py-0.5 text-[11px] font-medium ${PILL[k.tone]}`;
  if (!href) return <span className={cls} title={title ?? k.meaning}>{k.label}</span>;
  const external = href.startsWith("http");
  return (
    <a href={href} title={title ?? k.meaning} className={`${cls} hover:underline`} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
      {k.label}
      {external && <span className="sr-only"> (verify on the platform, opens in a new tab)</span>}
    </a>
  );
}

function Mark({ p, size = "md" }: { p: Platform; size?: "md" | "sm" }) {
  const box = size === "md" ? "h-10 w-[150px]" : "h-7 w-[110px]";
  if (p.logo)
    return (
      <span className={`relative block ${box}`}>
        <Image src={p.logo} alt={`${p.name} logo`} fill sizes="150px" className="object-contain object-left" />
      </span>
    );
  // No official logo supplied: set the name as type rather than drawing a mark.
  return (
    <span className={`flex items-center whitespace-nowrap ${size === "md" ? "h-10" : "h-7"} font-heading ${size === "md" ? "text-xl" : "text-base"} font-semibold tracking-tight text-ep-brown`}>
      {p.name}
    </span>
  );
}

function coverageLine(p: Platform): string {
  const recs = JOURNAL_ORDER.map((j) => statusFor(j, p.key)).filter(Boolean);
  if (p.key === "scholar") return "Article-level · see coverage below";
  if (p.key === "orcid") return "Author iDs in Crossref metadata";
  if (!recs.length) return "";
  const kinds = new Set(recs.map((r) => r!.status));
  const kind = [...kinds][0] as StatusKind;
  return `${STATUS_KINDS[kind].label} · ${recs.length} of ${JOURNAL_ORDER.length} journals`;
}

const policyLinks = [
  { href: "/policies/open-access", label: "Open access" },
  { href: "/policies/peer-review-process", label: "Peer review" },
  { href: "/policies/publication-ethics", label: "Publication ethics" },
  { href: "/policies/copyright-licensing", label: "Copyright and licensing" },
  { href: "/policies/archiving-preservation", label: "Archiving and preservation" },
];

export default function DiscoveryCentre({
  journals,
  published,
  withDoi,
  scholar,
  crossrefDois,
}: {
  journals: Journal[];
  published: number;
  withDoi: number;
  scholar: ScholarSummary[];
  scholarLastChecked?: string | null;
  crossrefDois: number | null;
}) {
  const byAbbrev = new Map(journals.map((j) => [j.abbrev, j]));
  const order = JOURNAL_ORDER.filter((j) => byAbbrev.has(j));
  const names = Object.fromEntries(order.map((j) => [j, byAbbrev.get(j)!.title]));
  const active = PLATFORMS.filter((p) => p.tier === "active");
  const journalLevel = active.filter((p) => order.every((j) => statusFor(j, p.key)?.status === "listed"));
  const scholarRows = order.map((j) => scholar.find((s) => s.journal === j)).filter((x): x is ScholarSummary => Boolean(x));
  const notes = [...new Set(STATUS.filter((s) => MATRIX.includes(s.platform) && s.notes).map((s) => `${platform(s.platform).name}: ${s.notes}`))];

  const stats = [
    { value: String(order.length), label: "Peer-reviewed open access journals" },
    { value: published.toLocaleString("en-GB"), label: "Published articles" },
    { value: (crossrefDois ?? withDoi).toLocaleString("en-GB"), label: crossrefDois ? "DOIs registered with Crossref" : "Articles assigned a DOI" },
    { value: String(journalLevel.length), label: "Platforms listing all six journals" },
  ];

  return (
    <div className="min-h-screen bg-card">
      <Header />

      {/* 1. Hero */}
      <section className="relative overflow-hidden border-b border-border bg-ep-cream">
        <div aria-hidden className="absolute inset-x-0 top-0 h-1 bg-ep-orange" />
        <div className="container mx-auto grid items-center gap-10 px-4 py-12 sm:py-16 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ep-orange">Indexing &amp; Scholarly Discovery Centre</p>
            <h1 className="mt-3 max-w-2xl font-heading text-3xl font-semibold leading-tight text-ep-brown sm:text-5xl">
              Research Deserves to Be Discovered.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-foreground/80">
              Where articles from the six EP Journals Group journals are found, cited and archived — from Crossref DOIs and
              Google Scholar to OpenAlex, Scilit and Zenodo. Every status links to the platform&apos;s own public record.
            </p>
            <div className="mt-7 flex flex-wrap gap-3 text-sm">
              <a href="#matrix" className="rounded-sm bg-primary px-4 py-2 font-semibold text-primary-foreground hover:bg-primary-hover">Journal-wise status</a>
              <a href="#scholar" className="rounded-sm border border-primary px-4 py-2 font-semibold text-primary hover:bg-card">Google Scholar</a>
            </div>
            <p className="mt-8 text-xs text-muted-foreground">
              Crossref member {CROSSREF_MEMBER.id} · DOI prefix {CROSSREF_MEMBER.prefix} · Last verified {fmtLongDate(LAST_VERIFIED)}
            </p>
          </div>
          <DiscoveryIllustration />
        </div>

        {/* Logo strip */}
        <div className="border-t border-border bg-card/70">
          <ul className="container mx-auto flex flex-wrap items-center justify-center gap-x-10 gap-y-4 px-4 py-5">
            {LOGO_STRIP.map((k) => {
              const p = platform(k);
              return (
                <li key={k} title={p.name} className="relative h-8 w-[120px] opacity-80 transition hover:opacity-100">
                  <Image src={p.logo!} alt={`${p.name} logo`} fill sizes="120px" className="object-contain" />
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* 2. Portfolio stats */}
      <section aria-label="Portfolio at a glance" className="border-b border-border bg-ep-cream">
        <dl className="container mx-auto grid grid-cols-2 gap-px px-4 sm:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="flex flex-col-reverse py-6 sm:px-4">
              <dt className="mt-1 text-xs leading-snug text-muted-foreground">{s.label}</dt>
              <dd className="font-heading text-3xl font-semibold text-ep-brown">{s.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <main className="container mx-auto space-y-16 px-4 py-12">
        {/* How an article becomes discoverable */}
        <section aria-labelledby="flow-heading">
          <SectionHead id="flow-heading" kicker="How it works" title="From publication to discovery" />
          <ol className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {FLOW.map((f, i) => (
              <li key={f.title} className="relative overflow-hidden rounded-lg border border-border bg-card p-5 shadow-sm">
                <span aria-hidden className="absolute right-3 top-2 font-heading text-5xl font-semibold text-ep-cream-dark">{i + 1}</span>
                <span className="relative flex h-11 w-11 items-center justify-center rounded-full bg-ep-cream text-ep-orange ring-1 ring-border">
                  <f.icon className="h-5 w-5" aria-hidden />
                </span>
                <h3 className="relative mt-4 font-heading text-base font-semibold text-ep-brown">{f.title}</h3>
                <p className="relative mt-1 text-sm leading-relaxed text-muted-foreground">{f.text}</p>
                {f.logo && (
                  <span className="relative mt-4 block h-6 w-[100px]">
                    <Image src={f.logo} alt="" fill sizes="100px" className="object-contain object-left" />
                  </span>
                )}
              </li>
            ))}
          </ol>
        </section>

        {/* 3. Platform directory */}
        <section aria-labelledby="directory-heading">
          <SectionHead id="directory-heading" kicker="Directory" title="Where our journals are recorded">
            Grouped by what each service does. A DOI or a repository copy is not the same as indexing, so each platform states its role.
          </SectionHead>
          <div className="mt-6 space-y-8">
            {CATEGORIES.map((c) => {
              const items = active.filter((p) => p.category === c.key);
              if (!items.length) return null;
              return (
                <div key={c.key}>
                  <div className="flex items-center gap-3">
                    {(() => { const Icon = CATEGORY_ICON[c.key]; return (
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ep-cream text-ep-orange ring-1 ring-border"><Icon className="h-4 w-4" aria-hidden /></span>
                    ); })()}
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">{c.title}</h3>
                      <p className="text-xs text-muted-foreground">{c.blurb}</p>
                    </div>
                  </div>
                  <ul className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {items.map((p) => (
                      <li key={p.key} className="flex flex-col rounded-lg border border-border bg-card p-4 shadow-sm">
                        <Mark p={p} />
                        <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">{p.role}</p>
                        <div className="mt-3 flex items-center justify-between gap-2 border-t border-border pt-3 text-xs">
                          <span className="font-medium text-foreground">{coverageLine(p)}</span>
                          <a href={p.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                            Visit<span className="sr-only"> {p.name} (opens in a new tab)</span>
                          </a>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </section>

        {/* 4. Journal-wise matrix */}
        <section id="matrix" aria-labelledby="matrix-heading" className="scroll-mt-24">
          <SectionHead id="matrix-heading" kicker="Journal by journal" title="Journal-wise status">
            Select a status to open the journal&apos;s record on that platform.
          </SectionHead>

          {/* Desktop/tablet: compact table */}
          <div className="relative mt-5 hidden overflow-x-auto rounded-lg border border-border md:block">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-ep-cream text-xs text-muted-foreground">
                <tr>
                  <th scope="col" className="sticky left-0 bg-ep-cream px-3 py-2 font-semibold">Journal</th>
                  {MATRIX.map((k) => (
                    <th key={k} scope="col" className="px-2 py-2 font-semibold">{platform(k).name}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {order.map((j) => {
                  const jr = byAbbrev.get(j)!;
                  return (
                    <tr key={j}>
                      <th scope="row" className="sticky left-0 bg-card px-3 py-2.5 align-top">
                        <Link href={`/journals/${j.toLowerCase()}`} className="font-semibold text-ep-brown hover:underline">{j}</Link>
                        <span className="block text-[11px] font-normal text-muted-foreground">e-ISSN {jr.electronic_issn}</span>
                      </th>
                      {MATRIX.map((k) => {
                        const s = statusFor(j, k);
                        return (
                          <td key={k} className="px-2 py-2.5 align-top">
                            {s ? <Pill kind={s.status} href={k === "scholar" ? "#scholar" : s.recordUrl} title={k === "scholar" ? "Google Scholar indexes articles, not journals" : `${STATUS_KINDS[s.status].meaning} Checked ${fmtLongDate(s.verifiedOn)}.`} /> : <span className="text-muted-foreground">—</span>}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile: one card per journal */}
          <ul className="mt-5 space-y-3 md:hidden">
            {order.map((j) => (
              <li key={j} className="rounded-lg border border-border p-4">
                <Link href={`/journals/${j.toLowerCase()}`} className="font-semibold text-ep-brown">{j}</Link>
                <p className="text-xs text-muted-foreground">{names[j]}</p>
                <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
                  {MATRIX.map((k) => {
                    const s = statusFor(j, k);
                    return (
                      <div key={k} className="flex flex-col gap-0.5">
                        <dt className="text-muted-foreground">{platform(k).name}</dt>
                        <dd>{s ? <Pill kind={s.status} href={k === "scholar" ? "#scholar" : s.recordUrl} /> : "—"}</dd>
                      </div>
                    );
                  })}
                </dl>
              </li>
            ))}
          </ul>

          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground">
            {(["listed", "doi", "records", "deposits", "article-level"] as StatusKind[]).map((k) => (
              <span key={k} className="flex items-center gap-1.5"><Pill kind={k} /> {STATUS_KINDS[k].meaning}</span>
            ))}
          </div>
          {notes.length > 0 && (
            <ul className="mt-3 space-y-0.5 text-xs text-muted-foreground">
              {notes.map((n) => <li key={n}>{n}.</li>)}
            </ul>
          )}
        </section>

        {/* 5. Google Scholar article-level coverage */}
        <section id="scholar" aria-labelledby="scholar-heading" className="scroll-mt-24">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <SectionHead id="scholar-heading" kicker="Article level" title="Google Scholar">
              Google Scholar indexes individual articles rather than journals. Choose a journal to browse its articles and
              open each one in Google Scholar.
            </SectionHead>
            <Mark p={platform("scholar")} size="sm" />
          </div>
          <div className="mt-6">
            <ScholarCoverage summary={scholarRows} names={names} />
          </div>
          <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
            Every article page carries Google Scholar citation tags (title, each author, date, journal, ISSN, volume, issue,
            pages and PDF link) in the server-rendered HTML, and the sitemap lists every article. Inclusion is decided by
            Google Scholar and can take several months after crawling.
          </p>
        </section>

        {/* 6. Platforms under evaluation */}
        <section aria-labelledby="eval-heading">
          <SectionHead id="eval-heading" kicker="Next steps" title="Platforms under evaluation">
            Not listed today. These are assessments of eligibility, not claims of inclusion. We apply directly and do not use paid indexing agents.
          </SectionHead>
          <ul className="mt-6 grid gap-4 lg:grid-cols-2">
            {OPPORTUNITIES.map((o) => {
              const p = platform(o.platform);
              return (
                <li key={o.platform} className="rounded-lg border border-dashed border-border bg-ep-cream p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="opacity-80 grayscale"><Mark p={p} size="sm" /></div>
                    <Pill kind={o.status} />
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">{p.role} · Journals: {o.journals}</p>
                  <p className="mt-3 text-sm leading-relaxed text-foreground/85">{o.assessment}</p>
                  <p className="mt-2 text-sm text-foreground/85"><span className="font-semibold">Next step:</span> {o.nextStep}</p>
                  <a href={o.source} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block text-xs text-primary hover:underline">
                    Criteria source<span className="sr-only"> for {p.name} (opens in a new tab)</span>
                  </a>
                </li>
              );
            })}
            <li className="rounded-lg border border-dashed border-border bg-ep-cream p-5">
              <div className="flex items-start justify-between gap-3">
                <p className="font-heading text-base font-semibold text-ep-brown">Index Copernicus Value (ICV)</p>
                <Pill kind="preparing" />
              </div>
              <p className="mt-3 text-sm leading-relaxed text-foreground/85">
                All six journals are listed in the ICI World of Journals database. None has an ICV (Index Copernicus Value) yet;
                the ICV comes from a separate annual evaluation.
              </p>
            </li>
          </ul>
        </section>

        {/* 7. Methodology */}
        <section aria-labelledby="method-heading" className="rounded-xl border border-border p-6">
          <SectionHead id="method-heading" kicker="Transparency" title="How we verify">
            Statuses are reviewed every three months and whenever a platform changes. Last full check {fmtLongDate(LAST_VERIFIED)}; next {fmtLongDate(NEXT_REVIEW)}.
          </SectionHead>
          <div className="mt-5 grid gap-6 md:grid-cols-2">
            <ul className="space-y-2 text-sm text-foreground/85">
              {[...new Set(STATUS.map((s) => s.method))].map((m) => (
                <li key={m} className="flex gap-2"><span aria-hidden className="mt-2 h-1 w-1 shrink-0 rounded-full bg-ep-orange" />{VERIFY_METHOD[m]}</li>
              ))}
            </ul>
            <ul className="space-y-2 text-sm text-foreground/85">
              <li>A Crossref DOI makes an article citable and its metadata reusable. It is not indexing.</li>
              <li>A Zenodo copy is an archived deposit, and OpenAIRE or Semantic Scholar records are aggregated from other sources.</li>
              <li>Google Scholar is reported per article. An article is marked &ldquo;In Google Scholar&rdquo; once we have seen its Scholar record.</li>
              <li>Platforms without a record appear only under evaluation, in grey and without a status badge of inclusion. Corrections: <a className="text-primary underline" href="mailto:editor@ep-journals.org">editor@ep-journals.org</a>.</li>
            </ul>
          </div>
        </section>

        {/* 8. Publisher facts */}
        <section aria-labelledby="publisher-heading" className="grid gap-6 border-t border-border pt-10 md:grid-cols-3">
          <div>
            <h2 id="publisher-heading" className="font-heading text-lg font-semibold text-foreground">EP Journals Group</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Open access publisher of six peer-reviewed journals. Articles are published under Creative Commons licences
              with no fee to read.
            </p>
          </div>
          <div className="text-sm">
            <h3 className="font-semibold text-foreground">Journals</h3>
            <ul className="mt-2 space-y-1">
              {order.map((j) => (
                <li key={j}><Link className="text-muted-foreground hover:underline" href={`/journals/${j.toLowerCase()}`}>{names[j]}</Link></li>
              ))}
            </ul>
          </div>
          <div className="text-sm">
            <h3 className="font-semibold text-foreground">Policies</h3>
            <ul className="mt-2 space-y-1">
              {policyLinks.map((l) => (
                <li key={l.href}><Link className="text-muted-foreground hover:underline" href={l.href}>{l.label}</Link></li>
              ))}
            </ul>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

function SectionHead({ id, kicker, title, children }: { id: string; kicker: string; title: string; children?: React.ReactNode }) {
  return (
    <div className="max-w-3xl">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ep-orange">{kicker}</p>
      <h2 id={id} className="mt-1 font-heading text-2xl font-semibold text-ep-brown">{title}</h2>
      {children && <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{children}</p>}
    </div>
  );
}
