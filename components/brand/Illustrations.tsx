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

/* ---------- Journal themes ---------- */

/** GJETR — engineering & technology: gear, circuit trace. */
export function Engineering({ className }: P) {
  const teeth = Array.from({ length: 8 }, (_, k) => k * 45);
  return (<Art id="engineering" className={className}>
    <Ground />
    <g transform="translate(128 120)">
      {teeth.map((a) => <rect key={a} x="-11" y="-74" width="22" height="24" rx="3" fill={B} transform={`rotate(${a})`} />)}
      <circle r="56" fill={B} />
      <circle r="24" fill={W} stroke={B} strokeWidth="2.6" />
    </g>
    <g transform="translate(222 92)">
      {teeth.map((a) => <rect key={a} x="-7" y="-42" width="14" height="14" rx="2" fill={O} transform={`rotate(${a + 22})`} />)}
      <circle r="32" fill={O} />
      <circle r="12" fill={W} />
    </g>
    <path d="M200 170 h40 v-24 h36" stroke={T} strokeWidth="3" />
    <circle cx="200" cy="170" r="5" fill={T} /><circle cx="276" cy="146" r="5" fill={T} />
  </Art>);
}

/** JEFRR — economics & finance: rising bars, coins, trend line. */
export function Finance({ className }: P) {
  return (<Art id="finance" className={className}>
    <Ground />
    <path d="M60 196 h200" stroke={B} strokeWidth="2.6" />
    {[[78, 64], [116, 92], [154, 78], [192, 118]].map(([x, h], i) => (
      <rect key={i} x={x} y={196 - h} width="26" height={h} rx="2" fill={i % 2 ? O : B} />
    ))}
    <path d="M78 122 L120 96 L160 108 L210 62" stroke={T} strokeWidth="3.2" />
    <path d="M196 60 l16 0 l-2 16" stroke={T} strokeWidth="3.2" />
    {[0, 1, 2].map((k) => <ellipse key={k} cx="252" cy={186 - k * 12} rx="22" ry="8" fill={k === 2 ? OL : O} stroke={B} strokeWidth="2.6" />)}
  </Art>);
}

/** JMRR — management: organisation chart. */
export function Management({ className }: P) {
  const box = (x: number, y: number, c: string, key: string) => (
    <g key={key}><rect x={x} y={y} width="56" height="34" rx="5" fill={W} stroke={B} strokeWidth="2.6" /><rect x={x + 10} y={y + 10} width="20" height="5" rx="2.5" fill={c} /><rect x={x + 10} y={y + 20} width="34" height="4" rx="2" fill={L} /></g>
  );
  return (<Art id="management" className={className}>
    <Ground />
    <path d="M160 82 v22 M76 104 h168 M76 104 v22 M160 104 v22 M244 104 v22" stroke={B} strokeWidth="2.6" />
    <rect x="124" y="44" width="72" height="40" rx="6" fill={O} />
    <rect x="138" y="56" width="44" height="6" rx="3" fill={W} /><rect x="138" y="68" width="30" height="5" rx="2.5" fill={W} opacity="0.7" />
    {[box(48, 126, B, "a"), box(132, 126, T, "b"), box(216, 126, OL, "c")]}
    <path d="M76 160 v18 M160 160 v18 M244 160 v18" stroke={L} strokeWidth="2.6" />
    {[60, 144, 228].map((x) => <circle key={x} cx={x + 16} cy="186" r="7" fill={C} stroke={B} strokeWidth="2.4" />)}
  </Art>);
}

/** JNSRR — natural sciences: flask, leaf, atom. */
export function NaturalScience({ className }: P) {
  return (<Art id="naturalscience" className={className}>
    <Ground />
    <path d="M110 52 h40 M118 52 v44 l-38 78 a12 12 0 0 0 11 18 h78 a12 12 0 0 0 11 -18 l-38 -78 v-44" fill={W} stroke={B} strokeWidth="2.6" />
    <path d="M92 152 h96 l12 22 a12 12 0 0 1 -11 18 h-78 a12 12 0 0 1 -11 -18 z" fill={T} />
    <circle cx="124" cy="168" r="5" fill={W} /><circle cx="148" cy="160" r="4" fill={W} /><circle cx="160" cy="176" r="3" fill={W} />
    <path d="M232 196 c-36 -18 -36 -70 8 -96 c26 34 24 76 -8 96 z" fill={O} />
    <path d="M232 196 c2 -30 4 -54 8 -94" stroke={B} strokeWidth="2.4" />
    <g transform="translate(246 62)">
      <ellipse rx="26" ry="9" stroke={B} strokeWidth="2.2" />
      <ellipse rx="26" ry="9" stroke={B} strokeWidth="2.2" transform="rotate(60)" />
      <ellipse rx="26" ry="9" stroke={B} strokeWidth="2.2" transform="rotate(-60)" />
      <circle r="4.5" fill={O} />
    </g>
  </Art>);
}

/** JSSHRS — social sciences & humanities: people in conversation. */
export function SocialScience({ className }: P) {
  const person = (x: number, c: string, k: string) => (
    <g key={k}><circle cx={x} cy="134" r="17" fill={c} /><path d={`M${x - 30} 198 c0 -34 12 -44 30 -44 c18 0 30 10 30 44 z`} fill={c} /></g>
  );
  return (<Art id="socialscience" className={className}>
    <Ground />
    {[person(92, B, "a"), person(160, O, "b"), person(228, T, "c")]}
    <path d="M60 48 h70 a8 8 0 0 1 8 8 v26 a8 8 0 0 1 -8 8 h-40 l-12 12 v-12 h-18 a8 8 0 0 1 -8 -8 v-26 a8 8 0 0 1 8 -8 z" fill={W} stroke={B} strokeWidth="2.6" />
    <Lines x={70} y={62} w={52} n={2} gap={10} />
    <path d="M186 40 h70 a8 8 0 0 1 8 8 v26 a8 8 0 0 1 -8 8 h-18 v12 l-12 -12 h-40 a8 8 0 0 1 -8 -8 v-26 a8 8 0 0 1 8 -8 z" fill={OL} />
    <circle cx="204" cy="62" r="4" fill={W} /><circle cx="220" cy="62" r="4" fill={W} /><circle cx="236" cy="62" r="4" fill={W} />
  </Art>);
}

/** GJEFM — education, finance & management: mortarboard on books, coin. */
export function Education({ className }: P) {
  return (<Art id="education" className={className}>
    <Ground />
    <rect x="70" y="164" width="150" height="24" rx="4" fill={B} />
    <rect x="80" y="142" width="136" height="22" rx="4" fill={W} stroke={B} strokeWidth="2.6" />
    <rect x="74" y="120" width="146" height="22" rx="4" fill={T} />
    <path d="M145 52 l78 30 l-78 30 l-78 -30 z" fill={B} />
    <path d="M111 96 v22 c0 10 68 10 68 0 v-22" fill={B} stroke={B} strokeWidth="2.6" />
    <path d="M223 82 v34" stroke={O} strokeWidth="3" /><circle cx="223" cy="120" r="6" fill={O} />
    <circle cx="258" cy="168" r="24" fill={O} stroke={B} strokeWidth="2.6" />
    <circle cx="258" cy="168" r="14" stroke={W} strokeWidth="2.6" /><path d="M252 168 h12" stroke={W} strokeWidth="2.6" />
  </Art>);
}

/* ---------- Policy themes ---------- */

/** Publication ethics: balance scales. */
export function Ethics({ className }: P) {
  return (<Art id="ethics" className={className}>
    <Ground />
    <path d="M160 52 v136 M120 196 h80" stroke={B} strokeWidth="3" />
    <path d="M86 78 h148" stroke={B} strokeWidth="3" />
    <circle cx="160" cy="70" r="9" fill={O} />
    <path d="M86 78 l-28 60 h56 z M234 78 l-28 60 h56 z" stroke={L} strokeWidth="2.4" />
    <path d="M52 138 h68 a34 18 0 0 1 -68 0 z" fill={O} />
    <path d="M200 138 h68 a34 18 0 0 1 -68 0 z" fill={T} />
  </Art>);
}

/** Research integrity: magnifier over a checked document. */
export function IntegrityCheck({ className }: P) {
  return (<Art id="integritycheck" className={className}>
    <Ground />
    <rect x="70" y="44" width="116" height="148" rx="6" fill={W} stroke={B} strokeWidth="2.6" />
    <Lines x={88} y={70} w={80} n={8} gap={11} />
    <circle cx="198" cy="126" r="40" fill={C} stroke={B} strokeWidth="3" />
    <path d="M180 126 l12 12 l24 -26" stroke={O} strokeWidth="5" />
    <path d="M228 156 l34 34" stroke={B} strokeWidth="9" />
  </Art>);
}

/** Corrections and retractions: document with a correction mark and pencil. */
export function Corrections({ className }: P) {
  return (<Art id="corrections" className={className}>
    <Ground />
    <rect x="66" y="40" width="124" height="152" rx="6" fill={W} stroke={B} strokeWidth="2.6" />
    <Lines x={84} y={64} w={88} n={3} gap={12} />
    <rect x="82" y="98" width="92" height="14" rx="3" fill={OL} />
    <path d="M80 105 h96" stroke={B} strokeWidth="2.6" />
    <Lines x={84} y={128} w={88} n={4} gap={12} />
    <g transform="rotate(40 232 112)">
      <rect x="222" y="40" width="22" height="104" rx="4" fill={O} />
      <rect x="222" y="40" width="22" height="16" rx="4" fill={B} />
      <path d="M222 144 h22 l-11 26 z" fill={C} stroke={B} strokeWidth="2.4" />
    </g>
  </Art>);
}

/** Archiving and preservation: archive box with files. */
export function Archive({ className }: P) {
  return (<Art id="archive" className={className}>
    <Ground />
    <rect x="96" y="54" width="70" height="80" rx="4" fill={W} stroke={B} strokeWidth="2.6" transform="rotate(-8 131 94)" />
    <rect x="146" y="48" width="70" height="80" rx="4" fill={C} stroke={B} strokeWidth="2.6" transform="rotate(7 181 88)" />
    <rect x="70" y="110" width="180" height="86" rx="6" fill={O} />
    <rect x="62" y="98" width="196" height="24" rx="5" fill={B} />
    <rect x="132" y="140" width="56" height="18" rx="9" fill={W} opacity="0.85" />
  </Art>);
}

/** Copyright and licensing: certificate with a seal. */
export function Licence({ className }: P) {
  return (<Art id="licence" className={className}>
    <Ground />
    <rect x="58" y="52" width="176" height="128" rx="6" fill={W} stroke={B} strokeWidth="2.6" />
    <rect x="76" y="70" width="90" height="7" rx="3.5" fill={B} />
    <Lines x={76} y={94} w={110} n={4} gap={12} />
    <path d="M226 150 l-12 46 l18 -10 l12 16 l6 -48 z" fill={T} />
    <path d="M256 150 l12 46 l-18 -10 l-12 16 l-6 -48 z" fill={T} />
    <circle cx="240" cy="144" r="30" fill={O} stroke={B} strokeWidth="2.6" />
    <circle cx="240" cy="144" r="16" stroke={W} strokeWidth="3" />
  </Art>);
}

/** Editorial policies: clipboard with a checklist. */
export function Checklist({ className }: P) {
  return (<Art id="checklist" className={className}>
    <Ground />
    <rect x="92" y="46" width="136" height="150" rx="8" fill={W} stroke={B} strokeWidth="2.6" />
    <rect x="128" y="36" width="64" height="22" rx="6" fill={B} />
    {[80, 112, 144].map((y, i) => (
      <g key={y}>
        <rect x="110" y={y} width="20" height="20" rx="4" fill={i < 2 ? O : C} />
        {i < 2 && <path d={`M114 ${y + 10} l5 5 l9 -10`} stroke={W} strokeWidth="3" />}
        <rect x="142" y={y + 6} width="66" height="6" rx="3" fill={L} />
      </g>
    ))}
  </Art>);
}

/** Editorial workflow: connected stages. */
export function Workflow({ className }: P) {
  const nodes: [number, number, string][] = [[70, 90, B], [140, 150, O], [210, 90, T], [262, 160, OL]];
  return (<Art id="workflow" className={className}>
    <Ground />
    <path d="M86 102 C110 140 116 150 124 150 M156 146 C176 120 186 104 194 100 M226 100 C246 120 252 136 256 146" stroke={B} strokeWidth="2.6" strokeDasharray="6 6" />
    {nodes.map(([x, y, c], i) => (
      <g key={i}>
        <rect x={x - 22} y={y - 22} width="44" height="44" rx="10" fill={c} />
        <text x={x} y={y + 6} textAnchor="middle" fontSize="18" fontFamily="Georgia, serif" fill="hsl(var(--card))">{i + 1}</text>
      </g>
    ))}
  </Art>);
}

/** Publisher governance: institution with columns. */
export function Governance({ className }: P) {
  return (<Art id="governance" className={className}>
    <Ground />
    <path d="M160 40 l100 44 h-200 z" fill={B} />
    <rect x="66" y="86" width="188" height="12" rx="2" fill={O} />
    {[84, 124, 164, 204].map((x) => <rect key={x} x={x} y="104" width="18" height="70" rx="2" fill={W} stroke={B} strokeWidth="2.4" />)}
    <rect x="58" y="176" width="204" height="12" rx="2" fill={B} />
    <circle cx="160" cy="66" r="7" fill={W} />
  </Art>);
}

/** Diversity and inclusion: different people in a circle. */
export function Inclusion({ className }: P) {
  const ppl: [number, number, string][] = [[160, 70, O], [222, 112, T], [196, 176, B], [124, 176, OL], [98, 112, B]];
  return (<Art id="inclusion" className={className}>
    <Ground />
    <circle cx="160" cy="126" r="58" stroke={L} strokeWidth="2.6" strokeDasharray="4 7" />
    {ppl.map(([x, y, c], i) => (
      <g key={i}><circle cx={x} cy={y - 8} r="11" fill={c} /><path d={`M${x - 18} ${y + 22} q18 -30 36 0 z`} fill={c} /></g>
    ))}
    <path d="M150 124 c0 -8 10 -10 10 -2 c0 -8 10 -6 10 2 c0 8 -10 14 -10 16 c0 -2 -10 -8 -10 -16 z" fill={O} />
  </Art>);
}

/** Reviewer guidelines: reviewer with a marked-up page. */
export function Reviewer({ className }: P) {
  return (<Art id="reviewer" className={className}>
    <Ground />
    <circle cx="96" cy="94" r="26" fill={C} stroke={B} strokeWidth="2.6" />
    <circle cx="96" cy="88" r="10" fill={B} />
    <path d="M80 108 q16 -16 32 0" stroke={B} strokeWidth="3" />
    <path d="M58 196 q38 -70 76 0" fill={B} />
    <rect x="148" y="52" width="112" height="144" rx="6" fill={W} stroke={B} strokeWidth="2.6" />
    <Lines x={164} y={76} w={78} n={8} gap={13} />
    <path d="M162 99 h40" stroke={O} strokeWidth="4" opacity="0.8" />
    <path d="M236 140 l8 8 l14 -16" stroke={O} strokeWidth="4" />
  </Art>);
}

export const JOURNAL_ART = {
  GJETR: Engineering,
  JEFRR: Finance,
  JMRR: Management,
  JNSRR: NaturalScience,
  JSSHRS: SocialScience,
  GJEFM: Education,
} as const;

/** Illustration per policy route. */
export const POLICY_ART: Record<string, (p: P) => React.ReactElement> = {
  "publication-ethics": Ethics,
  "research-integrity": IntegrityCheck,
  "corrections-retractions": Corrections,
  "diversity-inclusion": Inclusion,
  "archiving-preservation": Archive,
  "copyright-licensing": Licence,
  "editorial-policies": Checklist,
  "editorial-workflow": Workflow,
  "reviewer-guidelines": Reviewer,
  "author-responsibilities": Manuscript,
  "publisher-governance": Governance,
  "open-access": OpenAccess,
  "peer-review-process": PeerReview,
};

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
  engineering: Engineering,
  finance: Finance,
  management: Management,
  naturalScience: NaturalScience,
  socialScience: SocialScience,
  education: Education,
  ethics: Ethics,
  integrityCheck: IntegrityCheck,
  corrections: Corrections,
  archive: Archive,
  licence: Licence,
  checklist: Checklist,
  workflow: Workflow,
  governance: Governance,
  inclusion: Inclusion,
  reviewer: Reviewer,
} as const;
export type IllustrationName = keyof typeof ILLUSTRATIONS;
