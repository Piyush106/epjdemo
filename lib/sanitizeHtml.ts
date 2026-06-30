import DOMPurify from "dompurify";

export const sanitizeHtml = (html: string): string => {
  // DOMPurify needs a DOM; on the server (SSR/SSG) it has no `.sanitize`.
  // content_pages.body_html is first-party (admin-authored) and therefore
  // trusted, so we pass it through server-side and let the browser sanitize
  // on hydration. Never feed user-generated HTML to this on the server.
  if (typeof window === "undefined" || typeof (DOMPurify as { sanitize?: unknown }).sanitize !== "function") {
    return html;
  }
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      "p", "br", "strong", "em", "u", "a", "ul", "ol", "li",
      "h2", "h3", "h4", "blockquote", "code", "pre",
      "table", "thead", "tbody", "tr", "th", "td", "hr", "span",
    ],
    ALLOWED_ATTR: ["href", "target", "rel", "id", "class"],
  });
};
