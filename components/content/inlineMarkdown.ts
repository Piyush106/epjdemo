"use client";
// Tiny safe inline markdown parser. Supports **bold**, *italic*, [text](url).
// Escapes HTML first to prevent injection.
const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export const renderInline = (input: string): string => {
  let s = escapeHtml(input);
  // links [text](url) — only http/https/mailto/relative
  s = s.replace(/\[([^\]]+)\]\(((?:https?:|mailto:|\/)[^\s)]+)\)/g, (_m, text, url) => {
    const isExternal = /^https?:/.test(url);
    const attrs = isExternal ? ' target="_blank" rel="noopener noreferrer"' : "";
    return `<a href="${url}" class="text-primary hover:underline"${attrs}>${text}</a>`;
  });
  // bold **text**
  s = s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  // italic *text*
  s = s.replace(/(^|[^*])\*([^*\n]+)\*/g, "$1<em>$2</em>");
  return s;
};
