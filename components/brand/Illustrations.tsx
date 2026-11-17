// Original editorial illustrations for EP Journals Group, drawn in the site's
// own palette. Styled as hand-printed (risograph-like) artwork: muted inks,
// slightly uneven hand-drawn line work, matte paper grain, and line work set a
// touch off the colour fills, as in real print. No gradients or gloss.
// Decorative: every illustration is aria-hidden.

const B = "hsl(var(--ep-brown))";
const O = "hsl(var(--ep-orange) / 0.82)";
const OL = "hsl(var(--ep-orange-light) / 0.7)";
const C = "hsl(var(--ep-cream-dark))";
const W = "hsl(var(--card))";
const L = "hsl(var(--ep-brown) / 0.35)";
const T = "hsl(var(--ep-teal) / 0.75)";

type P = { className?: string };

/** Shared print treatment. Children are drawn twice: colour fills with grain,
 *  then ink lines with a slight hand wobble, offset like a second print pass. */
function Art({ id, className, children, vb = "0 0 320 240" }: { id: string; className?: string; children: React.ReactNode; vb?: string }) {
  const f = `ep-${id}`;
  return (
    <svg viewBox={vb} className={className ?? "h-auto w-full"} aria-hidden focusable="false" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <style>{`.${f}-fills *{stroke:none!important}.${f}-lines *{fill:none!important}`}</style>
      <defs>
        <filter id={`${f}-ink`} x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="turbulence" baseFrequency="0.018" numOctaves="1" seed="11" result="w" />
          <feDisplacementMap in="SourceGraphic" in2="w" scale="1.1" xChannelSelector="R" yChannelSelector="G" result="d" />
          <feTurbulence type="fractalNoise" baseFrequency="1.4" numOctaves="1" seed="4" result="n" />
          <feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -0.35 1.12" result="s" />
          <feComposite in="d" in2="s" operator="in" />
        </filter>
        <filter id={`${f}-grain`} x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="turbulence" baseFrequency="0.015" numOctaves="1" seed="5" result="w" />
          <feDisplacementMap in="SourceGraphic" in2="w" scale="1.2" xChannelSelector="R" yChannelSelector="G" result="d" />
          <feTurbulence type="fractalNoise" baseFrequency="1.25" numOctaves="2" seed="9" result="n" />
          <feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -0.45 1.18" result="s" />
          <feComposite in="d" in2="s" operator="in" />
        </filter>
      </defs>
      {/* paper patch */}
      <path filter={`url(#${f}-grain)`} fill={C} opacity="0.75"
        d="M34 196 C20 150 26 82 66 52 C112 18 214 22 262 48 C302 72 304 150 288 190 C276 220 226 226 160 224 C98 222 44 222 34 196 Z" />
      <g className={`${f}-fills`} filter={`url(#${f}-grain)`}>{children}</g>
      <g className={`${f}-lines`} filter={`url(#${f}-ink)`} transform="translate(0.9 -0.7)" strokeWidth="2.4">{children}</g>
    </svg>
  );
}
const Lines = ({ x, y, w, n, gap = 9, c = L }: { x: number; y: number; w: number; n: number; gap?: number; c?: string }) => (
  <>
    {Array.from({ length: n }, (_, i) => (
      <line key={i} x1={x} y1={y + i * gap} x2={x + (i === n - 1 ? w * 0.6 : w)} y2={y + i * gap} stroke={c} strokeWidth="2.6" />
    ))}
  </>
);
const Ground = () => <path d="M44 212 C110 204 210 204 276 212" stroke={B} strokeWidth="2" opacity="0.5" />;

/** Six journal volumes on a shelf, one per journal. */
export function JournalShelf({ className }: P) {
  const spines = [
    { h: 128, c: B }, { h: 140, c: O }, { h: 120, c: T }, { h: 136, c: B }, { h: 124, c: OL }, { h: 132, c: O },
  ];
  return (<Art id="journalshelf" className={className}>
    <Ground />
    <rect x="40" y="198" width="240" height="8" rx="2" fill={B} opacity="0.85" />
    {spines.map((s, i) => {
      const x = 58 + i * 34;
      return (
        <g key={i}>
          <rect x={x} y={198 - s.h} width="28" height={s.h} rx="3" fill={s.c} />
          <rect x={x + 5} y={198 - s.h + 14} width="18" height="3" rx="1.5" fill={W} opacity="0.8" />
          <rect x={x + 5} y={198 - s.h + 22} width="12" height="3" rx="1.5" fill={W} opacity="0.6" />
          <rect x={x + 5} y={186} width="18" height="4" rx="2" fill={W} opacity="0.7" />
        </g>
      );
    })}
    <circle cx="44" cy="70" r="5" fill={OL} />
  </Art>);
}

/** Manuscript passing two reviewers to an editorial decision. */
export function PeerReview({ className }: P) {
  return (<Art id="peerreview" className={className}>
    <Ground />
    <rect x="34" y="62" width="92" height="120" rx="6" fill={W} stroke={B} strokeWidth="2.6" />
    <Lines x={48} y={84} w={64} n={8} />
    <path d="M126 102 C150 90 156 80 176 78" stroke={O} strokeWidth="2.6" strokeDasharray="5 6" />
    <path d="M126 142 C150 154 156 164 176 166" stroke={O} strokeWidth="2.6" strokeDasharray="5 6" />
    {[78, 166].map((cy, i) => (
      <g key={i}>
        <circle cx="196" cy={cy} r="22" fill={W} stroke={B} strokeWidth="2.6" />
        <circle cx="196" cy={cy - 6} r="7" fill={B} />
        <path d={`M182 ${cy + 14} q14 -14 28 0`} stroke={B} strokeWidth="2.6" />
      </g>
    ))}
    <path d="M218 78 C240 84 246 100 252 116" stroke={O} strokeWidth="2.6" strokeDasharray="5 6" />
    <path d="M218 166 C240 160 246 144 252 128" stroke={O} strokeWidth="2.6" strokeDasharray="5 6" />
    <circle cx="264" cy="122" r="22" fill={O} />
    <path d="M253 122 l8 8 l14 -16" stroke={W} strokeWidth="4" />
  </Art>);
}

/** Open book with an unlocked padlock: free to read. */
export function OpenAccess({ className }: P) {
  return (<Art id="openaccess" className={className}>
    <Ground />
    <path d="M160 92 C130 76 82 74 52 84 V196 C82 186 130 188 160 204 Z" fill={W} stroke={B} strokeWidth="2.6" />
    <path d="M160 92 C190 76 238 74 268 84 V196 C238 186 190 188 160 204 Z" fill={W} stroke={B} strokeWidth="2.6" />
    <Lines x={70} y={112} w={70} n={6} gap={11} />
    <Lines x={180} y={112} w={70} n={6} gap={11} />
    <line x1="160" y1="92" x2="160" y2="204" stroke={B} strokeWidth="2.6" />
    <rect x="138" y="30" width="44" height="36" rx="5" fill={O} />
    <path d="M148 30 v-10 a12 12 0 0 1 24 0" stroke={B} strokeWidth="4" transform="rotate(-25 172 20)" />
    <circle cx="160" cy="48" r="5" fill={W} />
  </Art>);
}

/** Manuscript and pen nib: writing and submitting. */
export function Manuscript({ className }: P) {
  return (<Art id="manuscript" className={className}>
    <Ground />
    <rect x="70" y="40" width="112" height="150" rx="6" fill={C} transform="rotate(-6 126 115)" />
    <rect x="84" y="36" width="112" height="150" rx="6" fill={W} stroke={B} strokeWidth="2.6" />
    <rect x="98" y="54" width="60" height="6" rx="3" fill={B} />
    <Lines x={98} y={74} w={84} n={9} gap={10} />
    <g transform="rotate(35 238 120)">
      <rect x="226" y="40" width="24" height="96" rx="4" fill={O} />
      <path d="M226 136 h24 l-12 32 z" fill={B} />
      <circle cx="238" cy="150" r="3" fill={W} />
    </g>
    <path d="M200 176 c14 -10 24 4 36 -6" stroke={O} strokeWidth="2.6" />
  </Art>);
}

/** Editorial board: people around a shared document. */
export function EditorialBoard({ className }: P) {
  const people = [
    { x: 76, y: 92, c: B }, { x: 160, y: 62, c: O }, { x: 244, y: 92, c: T }, { x: 104, y: 168, c: OL }, { x: 216, y: 168, c: B },
  ];
  return (<Art id="editorialboard" className={className}>
    <Ground />
    {people.map((p, i) => { const dx = p.x - 160, dy = p.y - 128, d = Math.hypot(dx, dy); return <line key={`l${i}`} x1={160 + (dx / d) * 34} y1={128 + (dy / d) * 30} x2={p.x - (dx / d) * 24} y2={p.y - (dy / d) * 24} stroke={L} strokeWidth="2.6" />; })}
    <rect x="134" y="104" width="52" height="48" rx="5" fill={W} stroke={B} strokeWidth="2.6" />
    <Lines x={144} y={118} w={32} n={3} />
    {people.map((p, i) => (
      <g key={i}>
        <circle cx={p.x} cy={p.y} r="22" fill={W} stroke={B} strokeWidth="2.6" />
        <circle cx={p.x} cy={p.y - 6} r="8" fill={p.c} />
        <path d={`M${p.x - 13} ${p.y + 14} q13 -14 26 0`} stroke={p.c} strokeWidth="4" />
      </g>
    ))}
  </Art>);
}

/** Shield over a document: policies and integrity. */
export function Integrity({ className }: P) {
  return (<Art id="integrity" className={className}>
    <Ground />
    <rect x="60" y="44" width="120" height="150" rx="6" fill={W} stroke={B} strokeWidth="2.6" />
    <rect x="76" y="62" width="56" height="6" rx="3" fill={B} />
    <Lines x={76} y={82} w={88} n={9} gap={10} />
    <path d="M222 70 l48 16 v36 c0 34 -22 56 -48 66 c-26 -10 -48 -32 -48 -66 v-36 z" fill={O} />
    <path d="M222 82 l36 12 v28 c0 26 -16 43 -36 51 z" fill={OL} opacity="0.55" />
    <path d="M204 126 l12 12 l24 -26" stroke={W} strokeWidth="5" />
  </Art>);
}

/** Envelope and speech bubble: contact. */
export function Correspondence({ className }: P) {
  return (<Art id="correspondence" className={className}>
    <Ground />
    <rect x="48" y="86" width="150" height="104" rx="6" fill={W} stroke={B} strokeWidth="2.6" />
    <path d="M50 90 l73 56 l73 -56" stroke={B} strokeWidth="2.6" />
    <path d="M50 188 l52 -44 M196 188 l-52 -44" stroke={L} strokeWidth="2.6" />
    <path d="M196 40 h76 a10 10 0 0 1 10 10 v44 a10 10 0 0 1 -10 10 h-46 l-16 16 v-16 h-14 a10 10 0 0 1 -10 -10 v-44 a10 10 0 0 1 10 -10 z" fill={O} />
    <circle cx="214" cy="72" r="4" fill={W} /><circle cx="234" cy="72" r="4" fill={W} /><circle cx="254" cy="72" r="4" fill={W} />
  </Art>);
}

/** Book with a light bulb: guides and the Knowledge Centre. */
export function Knowledge({ className }: P) {
  return (<Art id="knowledge" className={className}>
    <Ground />
    <rect x="70" y="128" width="180" height="22" rx="4" fill={B} />
    <rect x="82" y="150" width="166" height="20" rx="4" fill={W} stroke={B} strokeWidth="2.6" />
    <rect x="76" y="170" width="176" height="22" rx="4" fill={O} />
    <Lines x={96} y={160} w={130} n={1} />
    <circle cx="160" cy="70" r="30" fill={OL} opacity="0.35" />
    <path d="M160 40 a26 26 0 0 1 14 48 v10 h-28 v-10 a26 26 0 0 1 14 -48 z" fill={W} stroke={B} strokeWidth="2.6" />
    <rect x="148" y="100" width="24" height="10" rx="3" fill={B} />
    <path d="M154 72 l6 8 l6 -8" stroke={O} strokeWidth="2.6" />
    {[[112, 54], [208, 54], [104, 92], [216, 92]].map(([x, y], i) => (
      <line key={i} x1={x} y1={y} x2={x < 160 ? x + 12 : x - 12} y2={y + (y < 70 ? 6 : -2)} stroke={O} strokeWidth="2.6" />
    ))}
  </Art>);
}

/** Research articles: stacked papers with a chart. */
export function Research({ className }: P) {
  return (<Art id="research" className={className}>
    <Ground />
    <rect x="52" y="58" width="130" height="140" rx="6" fill={C} transform="rotate(-5 117 128)" />
    <rect x="64" y="50" width="130" height="146" rx="6" fill={W} stroke={B} strokeWidth="2.6" />
    <rect x="78" y="66" width="70" height="6" rx="3" fill={B} />
    <Lines x={78} y={86} w={100} n={4} />
    <rect x="78" y="130" width="100" height="50" rx="4" fill={C} />
    <path d="M86 170 l18 -14 l16 8 l20 -22 l18 10" stroke={O} strokeWidth="2.6" />
    <circle cx="238" cy="88" r="30" fill={W} stroke={B} strokeWidth="2.6" />
    <path d="M238 88 v-30 a30 30 0 0 1 28 20 z" fill={O} />
    <path d="M238 88 l28 -10 a30 30 0 0 1 -8 31 z" fill={OL} />
    <path d="M200 170 h70" stroke={B} strokeWidth="2.6" />
    <rect x="206" y="146" width="12" height="24" fill={B} /><rect x="226" y="136" width="12" height="34" fill={O} /><rect x="246" y="152" width="12" height="18" fill={T} />
  </Art>);
}

/** Globe with connected points: global research community. */
export function GlobalReach({ className }: P) {
  const pts: [number, number][] = [[120, 92], [196, 82], [212, 140], [140, 156], [168, 118]];
  return (<Art id="globalreach" className={className}>
    <Ground />
    <circle cx="164" cy="118" r="78" fill={W} stroke={B} strokeWidth="2.6" />
    <ellipse cx="164" cy="118" rx="34" ry="78" stroke={L} strokeWidth="2.6" />
    <path d="M86 118 h156 M96 80 h136 M96 156 h136" stroke={L} strokeWidth="2.6" />
    {pts.map(([x, y], i) => pts.slice(i + 1).map(([x2, y2], k) => (
      <line key={`${i}-${k}`} x1={x} y1={y} x2={x2} y2={y2} stroke={O} strokeWidth="2" opacity="0.55" />
    )))}
    {pts.map(([x, y], i) => <circle key={i} cx={x} cy={y} r="7" fill={i % 2 ? B : O} stroke={W} strokeWidth="2" />)}
  </Art>);
}

export const ILLUSTRATIONS = {
  journals: JournalShelf,
  peerReview: PeerReview,
  openAccess: OpenAccess,
  manuscript: Manuscript,
  editorial: EditorialBoard,
  integrity: Integrity,
  contact: Correspondence,
  knowledge: Knowledge,
  research: Research,
  global: GlobalReach,
} as const;
export type IllustrationName = keyof typeof ILLUSTRATIONS;
