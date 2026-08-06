-- Correct the ISSNs for all six EP Journals Group titles.
--
-- The `journals` table previously carried placeholder electronic ISSNs in the
-- 3049-69xx / 3049-70xx range and no print ISSNs. The values below are the
-- authoritative registered ISSNs supplied by the publisher (ISSN International
-- Centre). Each journal now carries both its electronic (E-ISSN) and print
-- (P-ISSN) identifier. Keyed by `abbrev`, which is stable and unique.
--
-- This is the ONLY content correction in the SEO/GEO/AEO optimisation pass;
-- correct ISSNs are required for Google Scholar, Crossref, DOAJ and library
-- discovery, and they flow through the site's Periodical / ScholarlyArticle
-- JSON-LD and the citation_issn scholarly meta tag.

-- Global Journal of Engineering and Technology Research
UPDATE public.journals
SET electronic_issn = '3051-3782', print_issn = '3051-3774'
WHERE abbrev = 'GJETR';

-- Journal of Economic, Finance Research and Review
UPDATE public.journals
SET electronic_issn = '3051-3650', print_issn = '3051-3642'
WHERE abbrev = 'JEFRR';

-- Journal of Management Research and Review
UPDATE public.journals
SET electronic_issn = '3051-3588', print_issn = '3051-357X'
WHERE abbrev = 'JMRR';

-- Journal of Natural Science Research and Review
UPDATE public.journals
SET electronic_issn = '3051-3766', print_issn = '3051-3758'
WHERE abbrev = 'JNSRR';

-- Journal of Social Science and Human Research Studies
UPDATE public.journals
SET electronic_issn = '3051-3561', print_issn = '3051-3553'
WHERE abbrev = 'JSSHRS';

-- Global Journal of Education, Finance and Management
UPDATE public.journals
SET electronic_issn = '3117-6771', print_issn = '3117-6763'
WHERE abbrev = 'GJEFM';
