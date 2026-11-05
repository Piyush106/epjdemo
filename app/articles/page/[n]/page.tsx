import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import JsonLd from "@/components/JsonLd";
import { ArchiveArticleList, ArchivePager, ARCHIVE_PAGE_SIZE } from "@/components/ArchiveList";
import { getArticlesPage, getJournals } from "@/lib/data";
import { buildBreadcrumbLd, buildMetadata, SITE } from "@/lib/seo";
import { articlePath } from "@/lib/articleUrl";

// /articles/page/2 … /articles/page/N — the full article archive as plain,
// crawlable pages (page 1 is /articles). Without these, ~650 older articles
// were linked from nowhere on the site and reachable only via the sitemap.

export const revalidate = 3600;

export async function generateStaticParams() {
  try {
    const { total } = await getArticlesPage(1, 1);
    const pages = Math.ceil(total / ARCHIVE_PAGE_SIZE);
    return Array.from({ length: Math.max(0, pages - 1) }, (_, i) => ({ n: String(i + 2) }));
  } catch {
    return [];
  }
}

function pageNumber(n: string) {
  return /^\d+$/.test(n) ? Number(n) : NaN;
}

export async function generateMetadata({ params }: { params: Promise<{ n: string }> }): Promise<Metadata> {
  const n = pageNumber((await params).n);
  return buildMetadata({
    title: `Articles — page ${n}`,
    description: `Peer-reviewed open access articles from the six ${SITE.name} journals, page ${n} of the full archive, newest first.`,
    path: `/articles/page/${n}`,
  });
}

export default async function ArticlesArchivePage({ params }: { params: Promise<{ n: string }> }) {
  const n = pageNumber((await params).n);
  if (n === 1) permanentRedirect("/articles");
  if (!Number.isInteger(n) || n < 1) notFound();

  const [{ rows, total }, journals] = await Promise.all([
    getArticlesPage(n, ARCHIVE_PAGE_SIZE),
    getJournals().catch(() => []),
  ]);
  const totalPages = Math.ceil(total / ARCHIVE_PAGE_SIZE);
  if (!rows.length) notFound();

  const listLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `Articles — page ${n}`,
    url: `${SITE.origin}/articles/page/${n}`,
    isPartOf: { "@type": "WebSite", "@id": `${SITE.origin}/#website` },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: rows.length,
      itemListElement: rows.map((a, i) => ({
        "@type": "ListItem",
        position: (n - 1) * ARCHIVE_PAGE_SIZE + i + 1,
        url: `${SITE.origin}${articlePath(a)}`,
        name: a.title,
      })),
    },
  };

  return (
    <div className="min-h-screen bg-background">
      <JsonLd data={listLd} />
      <JsonLd data={buildBreadcrumbLd([{ name: "Home", path: "" }, { name: "Articles", path: "/articles" }, { name: `Page ${n}`, path: `/articles/page/${n}` }])} />
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1">
          <Link href="/articles" className="hover:underline">Articles</Link> · Page {n} of {totalPages}
        </p>
        <h1 className="text-xl font-heading font-semibold text-foreground mb-1">All articles — page {n}</h1>
        <p className="text-sm text-muted-foreground mb-4">
          {total} peer-reviewed open access articles, newest first. Browse by journal:{" "}
          {journals.map((j, i) => (
            <span key={j.abbrev}>
              {i ? " · " : ""}
              <Link href={`/journals/${j.abbrev.toLowerCase()}/archive`} className="text-primary hover:underline">{j.abbrev}</Link>
            </span>
          ))}
          .
        </p>
        <ArchiveArticleList articles={rows} />
        <ArchivePager current={n} totalPages={totalPages} />
      </main>
      <Footer />
    </div>
  );
}
