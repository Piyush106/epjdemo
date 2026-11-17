import Image from "next/image";

// Hero illustration: EP Journals Group at the centre, the six journals on an
// inner ring and the platforms that carry their records on the outer ring.
// Built from the site logo and the platforms' official logos; lines are SVG.

const JOURNALS = ["GJETR", "JEFRR", "JMRR", "JNSRR", "JSSHRS", "GJEFM"];
const OUTER: { src?: string; name: string }[] = [
  { src: "/logos/platforms/crossref.webp", name: "Crossref" },
  { src: "/logos/platforms/openalex.webp", name: "OpenAlex" },
  { src: "/logos/platforms/google-scholar.webp", name: "Google Scholar" },
  { src: "/logos/platforms/zenodo.webp", name: "Zenodo" },
  { name: "Scilit" },
  { name: "OpenAIRE" },
  { name: "ISSN Portal" },
  { name: "Index Copernicus" },
];

const pos = (i: number, n: number, r: number, offset = -90) => {
  const a = ((offset + (360 / n) * i) * Math.PI) / 180;
  return { x: 50 + r * Math.cos(a), y: 50 + r * Math.sin(a) };
};

export default function DiscoveryIllustration() {
  const inner = JOURNALS.map((_, i) => pos(i, JOURNALS.length, 23, -60));
  const outer = OUTER.map((_, i) => pos(i, OUTER.length, 37, -90));
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[460px]" aria-hidden>
      <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full">
        <circle cx="50" cy="50" r="37" fill="none" stroke="hsl(var(--ep-orange) / 0.25)" strokeWidth="0.25" strokeDasharray="1 1.2" />
        <circle cx="50" cy="50" r="23" fill="none" stroke="hsl(var(--ep-brown) / 0.2)" strokeWidth="0.25" />
        {inner.map((p, i) => (
          <line key={`c${i}`} x1="50" y1="50" x2={p.x} y2={p.y} stroke="hsl(var(--ep-brown) / 0.25)" strokeWidth="0.3" />
        ))}
        {inner.map((p, i) =>
          outer
            .filter((_, k) => (k + i) % 3 === 0)
            .map((q, k) => (
              <line key={`o${i}-${k}`} x1={p.x} y1={p.y} x2={q.x} y2={q.y} stroke="hsl(var(--ep-orange) / 0.22)" strokeWidth="0.2" />
            )),
        )}
      </svg>

      <div className="absolute left-1/2 top-1/2 flex h-[22%] w-[22%] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-card shadow-md">
        <Image src="/ep-journals-logo.png" alt="" width={56} height={60} className="h-1/2 w-auto" />
      </div>

      {JOURNALS.map((j, i) => (
        <span
          key={j}
          className="absolute -translate-x-1/2 -translate-y-1/2 rounded-sm bg-primary px-2 py-0.5 text-[10px] font-semibold tracking-wide text-primary-foreground shadow-sm sm:text-[11px]"
          style={{ left: `${inner[i].x}%`, top: `${inner[i].y}%` }}
        >
          {j}
        </span>
      ))}

      {OUTER.map((p, i) => (
        <span
          key={p.name}
          className="absolute flex h-[12%] w-[22%] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-md border border-border bg-card px-1.5 shadow-sm"
          style={{ left: `${outer[i].x}%`, top: `${outer[i].y}%` }}
        >
          {p.src ? (
            <span className="relative block h-full w-full">
              <Image src={p.src} alt="" fill sizes="110px" className="object-contain p-1" />
            </span>
          ) : (
            <span className="text-center font-heading text-[9px] font-semibold leading-tight text-ep-brown sm:text-[11px]">{p.name}</span>
          )}
        </span>
      ))}
    </div>
  );
}
