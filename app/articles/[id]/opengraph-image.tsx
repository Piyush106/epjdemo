import { ImageResponse } from "next/og";
import { getArticle, getArticleByIdPrefix } from "@/lib/data";
import { parseArticleParam } from "@/lib/articleUrl";

// Per-article share card (1200×630) for WhatsApp, LinkedIn, X and Google
// Discover: the title, journal and date instead of the site-wide logo card.

export const alt = "EP Journals Group article";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const revalidate = 259200; // matches the article page

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const parsed = parseArticleParam(id);
  const article = !parsed
    ? null
    : "uuid" in parsed
      ? await getArticle(parsed.uuid)
      : await getArticleByIdPrefix(parsed.prefix, decodeURIComponent(id));

  const title = article?.title ?? "EP Journals Group";
  const journal = article ? `${article.journal_name} (${article.journal_abbrev})` : "Peer-reviewed open access journals";
  const date = article
    ? new Date(article.publication_date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
    : "";
  const issue = article?.volume && article?.issue ? `Vol. ${article.volume}, Issue ${article.issue}` : "";
  const fontSize = title.length > 140 ? 40 : title.length > 90 ? 48 : 56;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          background: "#faf7f2",
          color: "#2b2118",
          borderTop: "16px solid #6b4a2e",
        }}
      >
        <div style={{ display: "flex", fontSize: 26, letterSpacing: 2, textTransform: "uppercase", color: "#6b4a2e" }}>
          {journal}
        </div>
        <div style={{ display: "flex", fontSize, fontWeight: 700, lineHeight: 1.2 }}>
          {title.length > 220 ? `${title.slice(0, 217)}…` : title}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 26, color: "#5c5045" }}>
          <span>{[date, issue].filter(Boolean).join(" · ")}</span>
          <span>EP Journals Group · Open access · CC BY 4.0</span>
        </div>
      </div>
    ),
    size,
  );
}
