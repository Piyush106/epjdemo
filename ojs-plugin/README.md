# epCanonical — OJS plugin

Makes every OJS article page declare its www.ep-journals.org copy as the
canonical URL, so Google stops treating the two copies as competing originals.

It reads the map from `https://www.ep-journals.org/api/ojs-canonical?journal=<path>`
(served by this repo, `app/api/ojs-canonical/route.ts`) and caches it for six
hours under OJS's `cache/` directory. If the map can't be loaded, OJS keeps its
own canonical, so the plugin cannot break a page.

## Install (each of the six journals)

1. Build the package from the repo root: `tar -czf epCanonical.tar.gz -C ojs-plugin epCanonical`
2. In OJS: **Settings → Website → Plugins → Upload a new plugin**, choose `epCanonical.tar.gz`.
3. Enable **EP Journals canonical URLs** in the plugin list (Generic plugins).
4. In the same list, disable **Google Scholar Indexing**, so Scholar uses the
   main-site page (which carries the full citation tags and PDF) as the record.
5. Check one article: view the page source of
   `https://jefrr.ep-journals.org/index.php/jefrr/article/view/148` and confirm
   `<link rel="canonical" href="https://www.ep-journals.org/articles/…">`.

Try it on one journal first. If the canonical doesn't change, the theme may set
it differently. Disabling the plugin returns everything to how it was.
