import DOMPurify from "dompurify";

export const sanitizeHtml = (html: string): string =>
  DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      "p", "br", "strong", "em", "u", "a", "ul", "ol", "li",
      "h2", "h3", "h4", "blockquote", "code", "pre",
      "table", "thead", "tbody", "tr", "th", "td", "hr", "span",
    ],
    ALLOWED_ATTR: ["href", "target", "rel", "id", "class"],
  });
