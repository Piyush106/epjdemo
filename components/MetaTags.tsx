"use client";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/** Data for Google Scholar citation_* meta tags on article pages. */
export interface ArticleMeta {
  title: string;
  authors: string[];
  journalTitle: string;
  issn?: string;
  volume?: string | null;
  issue?: string | null;
  firstPage?: string;
  lastPage?: string;
  publicationDate: string;
  doi?: string | null;
  pdfUrl?: string | null;
  abstractUrl?: string;
  language?: string;
}

interface MetaTagsProps {
  title: string;
  description: string;
  canonical?: string;
  ogImage?: string;
  noindex?: boolean;
  articleMeta?: ArticleMeta;
}

const CANONICAL_ORIGIN = "https://www.ep-journals.org";
const DEFAULT_OG_IMAGE = `${CANONICAL_ORIGIN}/og-image.png`;

const setMeta = (selector: string, attr: "name" | "property", attrValue: string, content: string) => {
  let el = document.querySelector(selector);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, attrValue);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
};

const setLink = (rel: string, href: string) => {
  let el = document.querySelector(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
};

const setMultiMeta = (name: string, values: string[], existingEls: Element[]) => {
  existingEls.forEach((el) => el.remove());
  values.forEach((value) => {
    const el = document.createElement("meta");
    el.setAttribute("name", name);
    el.setAttribute("content", value);
    document.head.appendChild(el);
  });
};

const MetaTags = ({ title, description, canonical, ogImage, noindex = false, articleMeta }: MetaTagsProps) => {
  const location = useLocation();

  useEffect(() => {
    const canonicalUrl = canonical || `${CANONICAL_ORIGIN}${location.pathname}`;
    const imageUrl = ogImage || DEFAULT_OG_IMAGE;

    document.title = title;

    setMeta('meta[name="description"]', "name", "description", description);
    setMeta('meta[name="robots"]', "name", "robots", noindex ? "noindex, nofollow" : "index, follow");
    setMeta('meta[name="googlebot"]', "name", "googlebot", noindex ? "noindex, nofollow" : "index, follow");

    setMeta('meta[property="og:title"]', "property", "og:title", title);
    setMeta('meta[property="og:description"]', "property", "og:description", description);
    setMeta('meta[property="og:url"]', "property", "og:url", canonicalUrl);
    setMeta('meta[property="og:type"]', "property", "og:type", articleMeta ? "article" : "website");
    setMeta('meta[property="og:image"]', "property", "og:image", imageUrl);
    setMeta('meta[property="og:site_name"]', "property", "og:site_name", "EP Journals Group");

    setMeta('meta[name="twitter:card"]', "name", "twitter:card", "summary_large_image");
    setMeta('meta[name="twitter:title"]', "name", "twitter:title", title);
    setMeta('meta[name="twitter:description"]', "name", "twitter:description", description);
    setMeta('meta[name="twitter:image"]', "name", "twitter:image", imageUrl);

    setLink("canonical", canonicalUrl);

    const removeCitationTags = (name: string) =>
      document.querySelectorAll(`meta[name="${name}"]`).forEach((el) => el.remove());

    if (articleMeta) {
      const {
        title: artTitle,
        authors,
        journalTitle,
        issn,
        volume,
        issue,
        firstPage,
        lastPage,
        publicationDate,
        doi,
        pdfUrl,
        abstractUrl,
        language = "en",
      } = articleMeta;

      setMeta('meta[name="citation_title"]', "name", "citation_title", artTitle);
      setMeta('meta[name="citation_journal_title"]', "name", "citation_journal_title", journalTitle);
      setMeta('meta[name="citation_language"]', "name", "citation_language", language);

      const dateParts = publicationDate.substring(0, 10).split("-");
      const scholarDate = dateParts.join("/");
      setMeta('meta[name="citation_publication_date"]', "name", "citation_publication_date", scholarDate);

      if (issn) setMeta('meta[name="citation_issn"]', "name", "citation_issn", issn);
      if (volume) setMeta('meta[name="citation_volume"]', "name", "citation_volume", volume);
      if (issue) setMeta('meta[name="citation_issue"]', "name", "citation_issue", issue);
      if (firstPage) setMeta('meta[name="citation_firstpage"]', "name", "citation_firstpage", firstPage);
      if (lastPage) setMeta('meta[name="citation_lastpage"]', "name", "citation_lastpage", lastPage);
      if (doi) setMeta('meta[name="citation_doi"]', "name", "citation_doi", doi);
      if (pdfUrl) setMeta('meta[name="citation_pdf_url"]', "name", "citation_pdf_url", pdfUrl);
      if (abstractUrl) setMeta('meta[name="citation_abstract_html_url"]', "name", "citation_abstract_html_url", abstractUrl);

      const existingAuthors = Array.from(document.querySelectorAll('meta[name="citation_author"]'));
      setMultiMeta("citation_author", authors, existingAuthors);
    } else {
      [
        "citation_title", "citation_journal_title", "citation_language",
        "citation_publication_date", "citation_issn", "citation_volume",
        "citation_issue", "citation_firstpage", "citation_lastpage",
        "citation_doi", "citation_pdf_url", "citation_abstract_html_url",
        "citation_author",
      ].forEach(removeCitationTags);
    }
  }, [title, description, canonical, ogImage, noindex, articleMeta, location.pathname]);

  return null;
};

export default MetaTags;
