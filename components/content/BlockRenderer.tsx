"use client";
import { sanitizeHtml } from "@/lib/sanitizeHtml";
import { renderInline } from "./inlineMarkdown";

export type ContentBlock =
  | { type: "heading"; level: 2 | 3; text: string; id?: string }
  | { type: "paragraph"; text: string }
  | { type: "list"; ordered?: boolean; items: string[] }
  | { type: "callout"; variant: "note" | "tip" | "warning"; text: string }
  | { type: "quote"; text: string; cite?: string }
  | { type: "table"; headers: string[]; rows: string[][] }
  | { type: "key_points"; items: string[] }
  | { type: "separator" }
  | { type: "html"; html: string };

const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

interface Props {
  blocks: ContentBlock[];
}

const BlockRenderer = ({ blocks }: Props) => {
  if (!Array.isArray(blocks) || blocks.length === 0) return null;

  return (
    <>
      {blocks.map((block, idx) => {
        switch (block.type) {
          case "heading": {
            const id = block.id || slugify(block.text);
            const cls = "text-base font-heading font-semibold text-foreground mb-2 mt-5";
            return block.level === 3 ? (
              <h3 key={idx} id={id} className="text-sm font-heading font-semibold text-foreground mb-2 mt-4">
                {block.text}
              </h3>
            ) : (
              <h2 key={idx} id={id} className={cls}>
                {block.text}
              </h2>
            );
          }
          case "paragraph":
            return (
              <p
                key={idx}
                className="text-foreground leading-relaxed mb-3"
                dangerouslySetInnerHTML={{ __html: renderInline(block.text) }}
              />
            );
          case "list": {
            const Tag = block.ordered ? "ol" : "ul";
            const cls = block.ordered
              ? "list-decimal pl-5 space-y-1 text-foreground mb-3"
              : "list-disc pl-5 space-y-1 text-foreground mb-3";
            return (
              <Tag key={idx} className={cls}>
                {block.items.map((it, i) => (
                  <li key={i} dangerouslySetInnerHTML={{ __html: renderInline(it) }} />
                ))}
              </Tag>
            );
          }
          case "key_points":
            return (
              <section key={idx} aria-labelledby={`kp-${idx}`} className="mt-5">
                <h2 id={`kp-${idx}`} className="text-base font-heading font-semibold text-foreground mb-2">
                  Key points
                </h2>
                <ul className="list-disc pl-5 space-y-1 text-foreground">
                  {block.items.map((it, i) => (
                    <li key={i} dangerouslySetInnerHTML={{ __html: renderInline(it) }} />
                  ))}
                </ul>
              </section>
            );
          case "callout": {
            const variantCls =
              block.variant === "warning"
                ? "border-l-4 border-destructive bg-destructive/5"
                : block.variant === "tip"
                ? "border-l-4 border-primary bg-primary/5"
                : "border-l-4 border-border bg-secondary";
            return (
              <aside
                key={idx}
                className={`${variantCls} px-3 py-2 my-3 text-sm text-foreground`}
                dangerouslySetInnerHTML={{ __html: renderInline(block.text) }}
              />
            );
          }
          case "quote":
            return (
              <blockquote
                key={idx}
                className="border-l-4 border-border pl-3 my-3 italic text-muted-foreground text-sm"
              >
                <span dangerouslySetInnerHTML={{ __html: renderInline(block.text) }} />
                {block.cite ? <footer className="not-italic text-xs mt-1">— {block.cite}</footer> : null}
              </blockquote>
            );
          case "table":
            return (
              <div key={idx} className="my-3 overflow-x-auto">
                <table className="w-full text-sm border border-border">
                  <thead className="bg-secondary">
                    <tr>
                      {block.headers.map((h, i) => (
                        <th key={i} className="text-left font-semibold px-2 py-1.5 border-b border-border">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {block.rows.map((row, ri) => (
                      <tr key={ri} className="border-b border-border">
                        {row.map((cell, ci) => (
                          <td key={ci} className="px-2 py-1.5 align-top">
                            <span dangerouslySetInnerHTML={{ __html: renderInline(cell) }} />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          case "separator":
            return <hr key={idx} className="my-5 border-border" />;
          case "html":
            return (
              <div
                key={idx}
                className="my-3"
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(block.html) }}
              />
            );
          default:
            return null;
        }
      })}
    </>
  );
};

export default BlockRenderer;
