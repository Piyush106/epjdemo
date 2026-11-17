-- Website search: vocabulary for spelling correction, correction function and
-- the ranked search function used by /api/search. Read-only over published data.

create or replace function public.search_json_text(j jsonb) returns text
language sql immutable parallel safe
set search_path = ''
as $$
  select coalesce(string_agg(v #>> '{}', ' '), '')
  from jsonb_path_query(coalesce(j, '[]'::jsonb), 'strict $.** ? (@.type() == "string")') as v
$$;
-- Re-evaluate the stored column with the updated function (no data change).
alter table public.content_pages alter column search_fts set expression as (
    setweight(to_tsvector('english'::regconfig, public.search_norm(coalesce(title,''))), 'A') ||
    setweight(to_tsvector('english'::regconfig, public.search_norm(coalesce(subtitle,'') || ' ' || public.search_join(keywords))), 'B') ||
    setweight(to_tsvector('english'::regconfig, public.search_norm(coalesce(summary,''))), 'B') ||
    setweight(to_tsvector('english'::regconfig, public.search_norm(left(public.search_strip_html(body_html) || ' ' || public.search_json_text(body_blocks) || ' ' || public.search_json_text(faqs), 30000))), 'C')
);

-- Vocabulary of real words on the site (titles, authors, keywords, journal
-- names and scopes, page titles). Used only to correct misspelt query words.
create materialized view if not exists public.search_vocab as
select word, ndoc
from ts_stat($q$
  select to_tsvector('simple', search_title || ' ' || search_authors || ' ' || public.search_norm(public.search_join(keywords)))
    from public.articles where status = 'published'
  union all
  select to_tsvector('simple', search_title || ' ' || public.search_norm(public.search_join(keywords)))
    from public.content_pages where status = 'published'
  union all
  select to_tsvector('simple', public.search_norm(abbrev || ' ' || title || ' ' || coalesce(scope_short,'') || ' ' || public.search_join(subject_areas)))
    from public.journals where status = 'active'
  union all
  select to_tsvector('simple', search_title) from public.site_pages
$q$)
where length(word) >= 3 and word !~ '^[0-9]+$';
create unique index if not exists search_vocab_word_idx on public.search_vocab (word);
create index if not exists search_vocab_word_trgm on public.search_vocab using gin (word extensions.gin_trgm_ops);
grant select on public.search_vocab to anon, authenticated;

-- Correct each query word that is not a known word (or the start of one) to the
-- closest known word within a small edit distance; otherwise keep it.
create or replace function public.search_correct(q text) returns text
language plpgsql stable parallel safe
set search_path = public, extensions
as $$
declare
  tok text;
  outw text[] := '{}';
  best text;
  lim int;
begin
  foreach tok in array regexp_split_to_array(coalesce(public.search_norm(q), ''), ' ') loop
    continue when tok = '';
    if length(tok) < 4 or tok ~ '[0-9]'
       or exists (select 1 from public.search_vocab where word = tok)
       or exists (select 1 from public.search_vocab where word like tok || '%') then
      outw := outw || tok;
      continue;
    end if;
    lim := case when length(tok) <= 5 then 1 when length(tok) <= 8 then 2 else 3 end;
    select v.word into best
      from public.search_vocab v
     where (v.word % tok or (left(v.word, 1) = left(tok, 1) and abs(length(v.word) - length(tok)) <= lim))
       and levenshtein_less_equal(tok, v.word, lim) <= lim
     order by levenshtein_less_equal(tok, v.word, lim), v.ndoc desc, v.word
     limit 1;
    outw := outw || coalesce(best, tok);
  end loop;
  return array_to_string(outw, ' ');
end;
$$;

create or replace function public.search_tsquery(q text, joiner text) returns tsquery
language sql immutable parallel safe
set search_path = ''
as $$
  select case when count(*) = 0 then null else
    to_tsquery('english'::regconfig, string_agg(quote_literal(t) || ':*', joiner))
  end
  from unnest(string_to_array(q, ' ')) t
  where t <> '' and length(t) >= 2
$$;

-- Ranked website search.
--   p_limit  : results to return; p_offset for paging (results page)
--   p_full   : include abstract snippets (results page) instead of short lines
-- Ranking (score 0–100): exact title > journal name/abbreviation > strong title
-- match > author > keyword/abstract > site pages > spelling-corrected matches.
create or replace function public.search_site(q text, p_limit int default 8, p_offset int default 0, p_full boolean default false)
returns jsonb
language plpgsql stable
set search_path = public, extensions
set pg_trgm.word_similarity_threshold = 0.5
set pg_trgm.similarity_threshold = 0.3
as $$
declare
  nq text := left(coalesce(public.search_norm(q), ''), 120);
  raw_compact text;
  cq text;
  fixed boolean;
  tsq tsquery;
  jabbr text;
  res jsonb;
  total int;
begin
  if length(nq) < 2 then
    return jsonb_build_object('query', q, 'results', '[]'::jsonb, 'total', 0);
  end if;
  p_limit := least(greatest(p_limit, 1), 50);
  p_offset := least(greatest(p_offset, 0), 500);
  raw_compact := replace(nq, ' ', '');
  cq := public.search_correct(nq);
  fixed := cq <> nq;

  -- Journal abbreviation typed (full or a prefix of at least 3 letters).
  select abbrev into jabbr from public.journals
   where status = 'active' and length(raw_compact) >= 3 and lower(abbrev) like raw_compact || '%'
   order by length(abbrev) limit 1;

  tsq := public.search_tsquery(cq, ' & ');
  -- Nothing matches every word: fall back to any word.
  if tsq is not null and not exists (select 1 from public.articles where status = 'published' and search_fts @@ tsq)
     and not exists (select 1 from public.content_pages where status = 'published' and search_fts @@ tsq)
     and not exists (select 1 from public.site_pages where search_fts @@ tsq) then
    tsq := public.search_tsquery(cq, ' | ');
  end if;

  with
  j as (
    select 'journal'::text kind, jn.abbrev id, jn.title, jn.abbrev || ' · ' || coalesce(jn.scope_short, '') subtitle,
           '/journals/' || lower(jn.abbrev) url, null::date dt, jn.abbrev journal,
           greatest(
             case when lower(jn.abbrev) = raw_compact then 99
                  when jabbr = jn.abbrev then 97 else 0 end,
             case when public.search_norm(jn.title) in (cq, nq) then 99 else 0 end,
             case when word_similarity(cq, public.search_norm(jn.title)) >= 0.6
                  then 60 + 35 * word_similarity(cq, public.search_norm(jn.title)) else 0 end,
             case when tsq is not null and to_tsvector('english', public.search_norm(jn.title || ' ' || coalesce(jn.scope_short,'') || ' ' || coalesce(jn.aims_and_scope,'') || ' ' || public.search_join(jn.subject_areas))) @@ tsq
                  then 50 else 0 end
           )::numeric score,
           null::text snippet
      from public.journals jn
     where jn.status = 'active'
  ),
  a as (
    select 'article'::text kind, ar.id::text id, ar.title,
           ar.journal_abbrev || ' · ' || ar.authors subtitle,
           null::text url, ar.publication_date dt, ar.journal_abbrev journal,
           (greatest(
             case when ar.search_title in (cq, nq) then 100 else 0 end,
             case when ar.doi is not null and length(nq) >= 6 and lower(ar.doi) like '%' || lower(btrim(q)) || '%' then 98 else 0 end,
             case when word_similarity(cq, ar.search_title) >= 0.5 then 40 + 50 * word_similarity(cq, ar.search_title) else 0 end,
             case when word_similarity(cq, ar.search_authors) >= 0.8 then 80 * word_similarity(cq, ar.search_authors) else 0 end,
             case when tsq is not null and ar.search_fts @@ tsq then 30 + 40 * least(ts_rank_cd(ar.search_fts, tsq, 32) * 4, 1) else 0 end,
             case when jabbr = ar.journal_abbrev then 45 else 0 end
           ) + 2 * greatest(0, 1 - (current_date - ar.publication_date) / 730.0))::numeric score,
           case when p_full and tsq is not null then
             ts_headline('english', coalesce(ar.abstract, ''), tsq, 'StartSel=<<,StopSel=>>,MaxWords=35,MinWords=20,MaxFragments=1')
           else null end snippet
      from public.articles ar
     where ar.status = 'published'
       and ( (tsq is not null and ar.search_fts @@ tsq)
          or cq <% ar.search_title
          or cq <% ar.search_authors
          or ar.journal_abbrev = jabbr
          or (ar.doi is not null and length(nq) >= 6 and lower(ar.doi) like '%' || lower(btrim(q)) || '%') )
  ),
  au as (
    select 'author'::text kind, n id, n title, count(*) || ' article' || case when count(*) > 1 then 's' else '' end subtitle,
           '/search?q=' || n url, max(ar.publication_date) dt, null::text journal,
           (78 * max(word_similarity(cq, public.search_norm(n))))::numeric score, null::text snippet
      from public.articles ar, lateral (select btrim(x) n from unnest(string_to_array(ar.authors, ',')) x) names
     where ar.status = 'published' and cq <% ar.search_authors and length(cq) >= 3
     group by n
    having max(word_similarity(cq, public.search_norm(n))) >= 0.8
  ),
  c as (
    select 'page'::text kind, cp.slug id, cp.title, coalesce(cp.summary, cp.subtitle) subtitle,
           case cp.category when 'guide' then '/guides/' when 'comparison' then '/comparisons/'
                            when 'publishing' then '/publishing/' else '/resources/' end || cp.slug url,
           null::date dt, null::text journal,
           (0.85 * greatest(
             case when cp.search_title in (cq, nq) then 95 else 0 end,
             case when word_similarity(cq, cp.search_title) >= 0.5 then 35 + 50 * word_similarity(cq, cp.search_title) else 0 end,
             case when tsq is not null and cp.search_fts @@ tsq then 25 + 40 * least(ts_rank_cd(cp.search_fts, tsq, 32) * 4, 1) else 0 end
           ))::numeric score, null::text snippet
      from public.content_pages cp
     where cp.status = 'published' and ((tsq is not null and cp.search_fts @@ tsq) or cq <% cp.search_title)
  ),
  s as (
    select 'page'::text kind, sp.path id, sp.title, sp.description subtitle, sp.path url, null::date dt, null::text journal,
           (0.85 * greatest(
             case when sp.search_title in (cq, nq) then 95 else 0 end,
             case when word_similarity(cq, sp.search_title) >= 0.5 then 35 + 50 * word_similarity(cq, sp.search_title) else 0 end,
             case when tsq is not null and sp.search_fts @@ tsq then 25 + 40 * least(ts_rank_cd(sp.search_fts, tsq, 32) * 4, 1) else 0 end
           ))::numeric score, null::text snippet
      from public.site_pages sp
     where (tsq is not null and sp.search_fts @@ tsq) or cq <% sp.search_title
  ),
  b as (
    select 'editor'::text kind, m.id::text id, m.name title, coalesce(m.credentials || ' · ', '') || coalesce(m.affiliation, '') subtitle,
           '/editorial' url, null::date dt, null::text journal,
           (75 * word_similarity(cq, public.search_norm(m.name)))::numeric score, null::text snippet
      from public.editorial_board_members m
     where m.visible and length(cq) >= 3 and word_similarity(cq, public.search_norm(m.name)) >= 0.7
  ),
  allr as (
    select * from j where score > 0
    union all select * from a where score > 0
    union all select * from au
    union all select * from c where score > 0
    union all select * from s where score > 0
    union all select * from b
  ),
  ranked as (
    select *, round(score * case when fixed then 0.92 else 1 end, 2) final
      from allr
  )
  select (select count(*) from ranked),
         coalesce(jsonb_agg(jsonb_build_object(
           'kind', kind, 'id', id, 'title', title, 'subtitle', left(subtitle, 220), 'url', url,
           'date', dt, 'journal', journal, 'score', final, 'snippet', snippet) order by final desc, dt desc nulls last), '[]'::jsonb)
    into total, res
    from (select * from ranked order by final desc, dt desc nulls last limit p_limit offset p_offset) t;

  return jsonb_build_object(
    'query', q,
    'corrected', case when fixed then cq else null end,
    'terms', to_jsonb(string_to_array(cq, ' ')),
    'total', total,
    'results', res);
end;
$$;

grant execute on function public.search_site(text, int, int, boolean) to anon, authenticated;
grant execute on function public.search_correct(text) to anon, authenticated;

-- Vocabulary refresh (called by index-site-pages and the daily cron).
create or replace function public.search_refresh_vocab() returns void
language sql security definer
set search_path = public
as $$ refresh materialized view concurrently public.search_vocab $$;
revoke execute on function public.search_refresh_vocab() from public, anon, authenticated;
grant execute on function public.search_refresh_vocab() to service_role;

-- Schedules: vocabulary daily after ingestion; static-page index weekly.
select cron.schedule('search-vocab-daily', '50 3 * * *', $$select public.search_refresh_vocab()$$);
select cron.schedule('site-pages-index-weekly', '20 4 * * 1',
  replace((select command from cron.job where jobname = 'pdf-mirror-daily'), 'mirror-pdfs', 'index-site-pages'));
