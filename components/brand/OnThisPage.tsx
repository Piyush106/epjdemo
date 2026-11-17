"use client";

import { useEffect, useState } from "react";

// "On this page" list built from the h2 headings (with ids) inside a container.
// Progressive enhancement: renders nothing until headings are found.
export default function OnThisPage({ containerId, title = "On this page" }: { containerId: string; title?: string }) {
  const [items, setItems] = useState<{ id: string; text: string }[]>([]);
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const root = document.getElementById(containerId);
    if (!root) return;
    const hs = Array.from(root.querySelectorAll<HTMLHeadingElement>("h2[id]"));
    setItems(hs.map((h) => ({ id: h.id, text: h.textContent?.trim() ?? "" })).filter((x) => x.text));
    const io = new IntersectionObserver(
      (entries) => {
        const vis = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (vis) setActive(vis.target.id);
      },
      { rootMargin: "-100px 0px -60% 0px" },
    );
    hs.forEach((h) => io.observe(h));
    return () => io.disconnect();
  }, [containerId]);

  if (items.length < 3) return null;
  return (
    <nav aria-label={title} className="rounded-lg border border-border bg-card p-4 shadow-sm">
      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-ep-orange">{title}</p>
      <ol className="space-y-1.5 text-sm">
        {items.map((i) => (
          <li key={i.id}>
            <a href={`#${i.id}`} className={`block border-l-2 pl-3 leading-snug hover:text-primary ${active === i.id ? "border-ep-orange text-foreground" : "border-transparent text-muted-foreground"}`}>
              {i.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
