// Article URLs on the main site — the version of record.
//
// Format: /articles/<title-slug>-<first 8 hex of the uuid>
//   e.g. /articles/understanding-green-purchase-intention-in-the-digital-era-02dd25f7
// The trailing id fragment makes the URL stable if a title is corrected (the
// page redirects to the current slug), and the title words help search.
// Legacy /articles/<full-uuid> URLs 301 to this form.

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const SLUG_ID_RE = /^(?:(.*)-)?([0-9a-f]{8})$/i;
const MAX_SLUG_WORDS = 10;

export function slugify(title: string): string {
  return title
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .split(/\s+/)
    .slice(0, MAX_SLUG_WORDS)
    .join("-");
}

export function articleSlug(a: { id: string; title: string }): string {
  const s = slugify(a.title);
  const short = a.id.slice(0, 8).toLowerCase();
  return s ? `${s}-${short}` : short;
}

/** Site-relative path of an article page. */
export function articlePath(a: { id: string; title: string }): string {
  return `/articles/${articleSlug(a)}`;
}

/** Parse the [id] route segment: a legacy full uuid, or a slug ending in an 8-hex id prefix. */
export function parseArticleParam(param: string): { uuid: string } | { prefix: string } | null {
  const p = decodeURIComponent(param);
  if (UUID_RE.test(p)) return { uuid: p.toLowerCase() };
  const m = p.match(SLUG_ID_RE);
  return m ? { prefix: m[2].toLowerCase() } : null;
}
