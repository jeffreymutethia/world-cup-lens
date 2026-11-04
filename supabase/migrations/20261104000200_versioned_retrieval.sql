begin;
-- New local contract v1; not a recreation of the unseen production function body.
create function public.backend_contract_version() returns integer language sql immutable security invoker set search_path='' as $$ select 1 $$;
create function public.match_document_chunks(
 query_embedding extensions.vector, match_threshold double precision default 0.15, match_count integer default 8,
 filter_team_ids text[] default null, filter_venue_id text default null, filter_match_id text default null,
 historical_cutoff timestamptz default null,
 filter_embedding_model text default 'text-embedding-3-small', filter_embedding_version text default 'openai-small-1536-v1'
) returns table(id uuid,document_id uuid,title text,doc_type text,content text,source_url text,similarity double precision,
 document_version_id uuid,content_hash text,input_hash text,dataset_version text,source_identity text,
 published_at text,captured_at text,availability_verified boolean,embedding_model text,embedding_version text)
 language plpgsql stable security invoker set search_path='' as $$
begin
 if query_embedding is null or extensions.vector_dims(query_embedding)<>1536 or extensions.vector_norm(query_embedding)<=0
    or match_threshold is null or not(match_threshold between -1 and 1) or match_count is null or match_count not between 1 and 50
    or nullif(filter_embedding_model,'') is null or nullif(filter_embedding_version,'') is null then
  raise exception 'Invalid retrieval parameters' using errcode='22023';
 end if;
 return query select c.id,c.document_id,v.title,v.doc_type,c.content,v.source_url,
   1-(c.embedding operator(extensions.<=>) query_embedding),v.id,c.content_hash,v.input_hash,v.dataset_version,v.source_identity,
   to_char(v.published_at at time zone 'UTC','YYYY-MM-DD"T"HH24:MI:SS.US"Z"'),to_char(v.captured_at at time zone 'UTC','YYYY-MM-DD"T"HH24:MI:SS.US"Z"'),v.availability_verified,v.embedding_model,v.embedding_version
 from public.document_chunks c join public.document_versions v on v.id=c.document_version_id
 join public.documents d on d.id=v.document_id and d.current_version_id=v.id and d.input_hash=v.input_hash
 where c.embedding_model=filter_embedding_model and c.embedding_version=filter_embedding_version
   and v.embedding_model=filter_embedding_model and v.embedding_version=filter_embedding_version
   and (v.team_id is null or v.team_id=any(coalesce(filter_team_ids,'{}')))
   and (v.venue_id is null or v.venue_id=filter_venue_id)
   and (v.match_id is null or v.match_id=filter_match_id)
   and (v.is_global or v.team_id is not null or v.venue_id is not null or v.match_id is not null)
   and (historical_cutoff is null or (v.availability_verified and v.published_at<=historical_cutoff and v.captured_at<=historical_cutoff))
   and 1-(c.embedding operator(extensions.<=>) query_embedding)>=match_threshold
 order by 1-(c.embedding operator(extensions.<=>) query_embedding) desc,c.id asc limit match_count;
end $$;

create function public.pending_embedding_documents(p_model text,p_version text,p_chunker text)
 returns setof public.documents language sql stable security invoker set search_path='' as $$
 select d.* from public.documents d left join public.document_versions v on v.id=d.current_version_id
 where v.id is null or v.input_hash<>d.input_hash or v.embedding_model<>p_model or v.embedding_version<>p_version or v.chunker_version<>p_chunker
 order by d.created_at,d.id limit 50
$$;

create function public.store_document_revision(p_document_id uuid,p_expected_hash text,p_model text,p_version text,p_origin text,
 p_chunker text,p_started timestamptz,p_completed timestamptz,p_chunks jsonb)
 returns uuid language plpgsql security invoker set search_path='' as $$
declare d public.documents; vid uuid; fingerprint text; c jsonb; idx integer:=0;
begin
 select * into strict d from public.documents where id=p_document_id for update;
 if d.input_hash is distinct from p_expected_hash then raise exception 'Document changed during embedding' using errcode='40001'; end if;
 if jsonb_typeof(p_chunks) is distinct from 'array' or jsonb_array_length(p_chunks) not between 1 and 1000
   or nullif(p_model,'') is null or nullif(p_version,'') is null or nullif(p_chunker,'') is null
   or p_started is null or p_completed is null or p_completed<p_started or p_origin is null or p_origin not in ('model','synthetic') then
  raise exception 'Invalid document revision' using errcode='22023';
 end if;
 fingerprint:=encode(extensions.digest(jsonb_build_array(d.input_hash,p_model,p_version,p_origin,p_chunker,p_chunks)::text,'sha256'),'hex');
 select id into vid from public.document_versions where document_id=d.id and version_key=fingerprint;
 if vid is null then
  insert into public.document_versions(document_id,version_key,input_hash,title,doc_type,body,source_url,source_identity,source_provider,source_kind,team_id,venue_id,match_id,is_global,
    published_at,captured_at,availability_verified,availability_evidence,dataset_version,embedding_model,embedding_version,embedding_origin,chunker_version,embedding_started_at,embedding_completed_at)
   values(d.id,fingerprint,d.input_hash,d.title,d.doc_type,d.body,d.source_url,d.source_identity,d.source_provider,d.source_kind,d.team_id,d.venue_id,d.match_id,d.is_global,
    d.published_at,d.captured_at,d.availability_verified,d.availability_evidence,d.dataset_version,p_model,p_version,p_origin,p_chunker,p_started,p_completed) returning id into vid;
  for c in select value from jsonb_array_elements(p_chunks) loop
   if jsonb_typeof(c) is distinct from 'object' or jsonb_typeof(c->'embedding') is distinct from 'array'
     or jsonb_typeof(c->'metadata') is distinct from 'object' or jsonb_typeof(c->'content') is distinct from 'string' then
    raise exception 'Malformed chunk' using errcode='22023';
   end if;
   insert into public.document_chunks(document_id,document_version_id,chunk_index,content,embedding,metadata,embedding_model,embedding_version)
    values(d.id,vid,idx,c->>'content',(c->'embedding')::text::extensions.vector(1536),c->'metadata',p_model,p_version);
   idx:=idx+1;
  end loop;
 end if;
 update public.documents set current_version_id=vid where id=d.id;
 return vid;
end $$;

-- Single snapshot; no application-side mixed-read fingerprint.
create function public.authoring_match_input(p_match_id text) returns jsonb language sql stable security invoker set search_path='' set timezone='UTC' as $$
 select jsonb_build_object('match',to_jsonb(m)-'updated_at'-'created_at','home',to_jsonb(h)-'updated_at'-'created_at',
 'away',to_jsonb(a)-'updated_at'-'created_at','venue',to_jsonb(v)-'updated_at'-'created_at')
 from public.matches m join public.teams h on h.id=m.home_team_id join public.teams a on a.id=m.away_team_id join public.venues v on v.id=m.venue_id where m.id=p_match_id
$$;
create function public.authoring_input_fingerprint(p_match_id text) returns text language sql stable security invoker set search_path='' as $$
 select encode(extensions.digest(public.authoring_match_input(p_match_id)::text,'sha256'),'hex')
$$;

create table public.authoring_input_attestations (
 match_id text not null references public.matches(id), input_fingerprint text not null check(input_fingerprint ~ '^[a-f0-9]{64}$'),
 available_at timestamptz not null, evidence text not null check(length(btrim(evidence))>0),
 recorded_at timestamptz not null default clock_timestamp(), primary key(match_id,input_fingerprint)
);
alter table public.authoring_input_attestations enable row level security;
revoke all on public.authoring_input_attestations from public,anon,authenticated;
grant select,insert on public.authoring_input_attestations to service_role;
create policy operator_access on public.authoring_input_attestations to service_role using(true) with check(true);
create trigger attestations_immutable before update or delete on public.authoring_input_attestations for each row execute function public.reject_immutable_change();
create function public.get_authoring_input(p_match_id text) returns jsonb language sql stable security invoker set search_path='' as $$
 select jsonb_build_object('snapshot',public.authoring_match_input(p_match_id),'fingerprint',public.authoring_input_fingerprint(p_match_id))
 where public.authoring_match_input(p_match_id) is not null
$$;

create function public.valid_lens_json(l jsonb) returns boolean language plpgsql immutable security invoker set search_path='' as $$
declare k text; v jsonb; n integer; lo integer; hi integer;
begin
 if jsonb_typeof(l) is distinct from 'object' or (select count(*) from jsonb_object_keys(l))<>12
  or not l ?& array['headline','slightEdge','confidence','volatility','expectedGame','whyItMatters','likelyGameScript','teamEdges','whatToWatch','casualFanGuide','uncertainty','sources'] then return false; end if;
 if (l->>'confidence') is null or (l->>'confidence') not in ('Low','Medium','High') or (l->>'volatility') is null or (l->>'volatility') not in ('Low','Medium','High')
  or l->'teamEdges' is distinct from '[]'::jsonb or jsonb_typeof(l->'slightEdge') not in ('null','string') then return false; end if;
 if jsonb_typeof(l->'slightEdge')='string' and length(l->>'slightEdge') not between 1 and 40 then return false; end if;
 foreach k in array array['headline','expectedGame','whyItMatters','likelyGameScript','casualFanGuide'] loop
  lo:=case k when 'headline' then 12 when 'expectedGame' then 20 else 30 end;
  hi:=case k when 'headline' then 180 when 'expectedGame' then 300 else 500 end;
  if jsonb_typeof(l->k) is distinct from 'string' or length(l->>k) not between lo and hi then return false; end if;
 end loop;
 foreach k in array array['whatToWatch','uncertainty','sources'] loop
  if jsonb_typeof(l->k) is distinct from 'array' then return false; end if;
  n:=jsonb_array_length(l->k);
  if (k='whatToWatch' and n not between 3 and 5) or (k='uncertainty' and n not between 2 and 4) or (k='sources' and n not between 1 and 5) then return false; end if;
  for v in select value from jsonb_array_elements(l->k) loop
   if k='sources' then
    if jsonb_typeof(v) is distinct from 'object' or (select count(*) from jsonb_object_keys(v))<>2 or jsonb_typeof(v->'title') is distinct from 'string' or length(v->>'title') not between 4 and 100 or jsonb_typeof(v->'snippet') is distinct from 'string' or length(v->>'snippet') not between 15 and 180 then return false; end if;
   elsif jsonb_typeof(v) is distinct from 'string' or length(v#>>'{}') not between (case k when 'whatToWatch' then 8 else 15 end) and (case k when 'whatToWatch' then 120 else 160 end) then return false;
   end if;
  end loop;
 end loop;
 return true;
end $$;

alter table public.generation_runs add constraint generated_lens_shape check(status<>'succeeded' or public.valid_lens_json(lens_json));

create function public.commit_lens_generation(p_payload jsonb) returns uuid language plpgsql security invoker set search_path='' set timezone='UTC' as $$
declare i jsonb; mid text; rid uuid; key text; existing public.generation_runs; winner uuid; ctx jsonb; scope public.matches; entry record;
begin
 if jsonb_typeof(p_payload) is distinct from 'object' or jsonb_typeof(p_payload->'identityCanonical') is distinct from 'string' then
  raise exception 'Malformed generation envelope' using errcode='22023';
 end if;
 i:=(p_payload->>'identityCanonical')::jsonb; rid:=(p_payload->>'id')::uuid; mid:=i->>'matchId';
 key:=encode(extensions.digest(p_payload->>'identityCanonical','sha256'),'hex');
 -- Byte-for-byte semantic retry, including timestamps and output: no model rerun required.
 select * into existing from public.generation_runs where id=rid;
 if found then
  if existing.submission<>p_payload then raise exception 'Generation ID conflict' using errcode='23505'; end if;
  return rid;
 end if;
 select * into strict scope from public.matches where id=mid for no key update;
 select * into existing from public.generation_runs where id=rid;
 if found then
  if existing.submission<>p_payload then raise exception 'Generation ID conflict' using errcode='23505'; end if;
  return rid;
 end if;
 perform 1 from public.teams where id in (scope.home_team_id,scope.away_team_id) order by id for share;
 perform 1 from public.venues where id=scope.venue_id for share;
 if i->>'inputFingerprint' is distinct from public.authoring_input_fingerprint(mid) then
  raise exception 'Match input changed' using errcode='40001';
 end if;
 if i->>'contractVersion' is distinct from '1' or coalesce(i->>'perspective','') not in ('retrospective','as-of')
   or nullif(i->>'datasetVersion','') is null or nullif(i->>'promptVersion','') is null or nullif(i->>'schemaVersion','') is null
   or nullif(i->>'model','') is null or coalesce(i->>'generatorKind','') not in ('mock','model') then
  raise exception 'Invalid generation identity' using errcode='22023';
 end if;
 if i->>'perspective'='as-of' and (scope.known_at is null or scope.knowledge_evidence is null
   or nullif(i->>'historicalCutoff','') is null or scope.known_at>(i->>'historicalCutoff')::timestamptz
   or (i->>'historicalCutoff')::timestamptz>=scope.kickoff_at
   or not exists(select 1 from public.authoring_input_attestations a where a.match_id=mid and a.input_fingerprint=i->>'inputFingerprint' and a.available_at<=(i->>'historicalCutoff')::timestamptz
      and i->'inputAttestation'->>'inputFingerprint'=a.input_fingerprint and (i->'inputAttestation'->>'availableAt')::timestamptz=a.available_at and i->'inputAttestation'->>'evidence'=a.evidence)) then
  raise exception 'Unestablished historical match input' using errcode='22023';
 end if;
 -- Recheck selected heads and retrieval at the persistence snapshot. No phantom-free corpus guarantee.
 perform 1 from public.documents d where d.id in (select (value->>'document_id')::uuid from jsonb_array_elements(i->'context')) order by d.id for share;
 select coalesce(jsonb_agg(to_jsonb(r)-'content' order by r.similarity desc,r.id),'[]'::jsonb) into ctx
 from public.match_document_chunks((i->'queryEmbedding')::text::extensions.vector,(i->>'threshold')::float8,(i->>'count')::int,
   array[scope.home_team_id,scope.away_team_id],scope.venue_id,mid,(i->>'historicalCutoff')::timestamptz,i->>'embeddingModel',i->>'embeddingVersion') r;
 if ctx is distinct from i->'context' then raise exception 'Retrieval changed before persistence' using errcode='40001'; end if;
 if (p_payload->>'status'='succeeded' and jsonb_array_length(ctx)=0)
   or (p_payload->>'errorCode'='empty-context' and jsonb_array_length(ctx)<>0) then
  raise exception 'Invalid empty-context outcome' using errcode='22023';
 end if;
 if p_payload->>'status'='succeeded' and not public.valid_lens_json(p_payload->'lens') then raise exception 'Invalid Lens shape' using errcode='22023'; end if;
 if p_payload->>'status'='succeeded' and (p_payload->'lens'->>'slightEdge' is not null and p_payload->'lens'->>'slightEdge' not in
   (select name from public.teams where id in(scope.home_team_id,scope.away_team_id))) then
  raise exception 'Invalid team identity' using errcode='22023';
 end if;
 insert into public.generation_runs(id,match_id,cache_key,identity,submission,dataset_version,input_fingerprint,input_snapshot,perspective,historical_cutoff,retrieved_at,
 generation_started_at,generation_completed_at,generator_kind,model,prompt_version,schema_version,embedding_model,embedding_version,embedding_dimensions,query_embedding,context_manifest,status,lens_json,error_code)
 values(rid,mid,key,i,p_payload,i->>'datasetVersion',i->>'inputFingerprint',public.authoring_match_input(mid),i->>'perspective',(i->>'historicalCutoff')::timestamptz,(p_payload->>'retrievedAt')::timestamptz,
 (p_payload->>'startedAt')::timestamptz,(p_payload->>'completedAt')::timestamptz,i->>'generatorKind',i->>'model',i->>'promptVersion',i->>'schemaVersion',
 i->>'embeddingModel',i->>'embeddingVersion',1536,(i->'queryEmbedding')::text::extensions.vector(1536),ctx,p_payload->>'status',nullif(p_payload->'lens','null'::jsonb),p_payload->>'errorCode');
 for entry in select value,ordinality from jsonb_array_elements(ctx) with ordinality loop
  insert into public.generation_run_chunks values(rid,(entry.value->>'id')::uuid,entry.ordinality-1);
 end loop;
 if p_payload->>'status'='succeeded' then
  insert into public.lens_cache_entries(cache_key,generation_id) values(key,rid) on conflict(cache_key) do nothing;
  select generation_id into winner from public.lens_cache_entries where cache_key=key;
  -- Legacy read adapter remains retrospective. New as-of experiments never replace it.
  if i->>'perspective'='retrospective' then
   insert into public.match_lenses(match_id,lens_json,model,generation_id)
    select mid,g.lens_json,g.model,g.id from public.generation_runs g where g.id=winner
    on conflict(match_id) do update set lens_json=excluded.lens_json,model=excluded.model,generation_id=excluded.generation_id,updated_at=clock_timestamp(),publication_status='private',data_origin='unknown';
  end if;
 end if;
 return rid;
end $$;
create function public.get_cached_lens(p_cache_key text) returns jsonb language sql stable security invoker set search_path='' as $$
 select g.lens_json from public.lens_cache_entries c join public.generation_runs g on g.id=c.generation_id and g.cache_key=c.cache_key where c.cache_key=p_cache_key and g.status='succeeded'
$$;
-- No caller can point a cache to a failed run, even through direct privileged table writes.
create function public.validate_cache_pointer() returns trigger language plpgsql security invoker set search_path='' as $$
begin
 if not exists(select 1 from public.generation_runs where id=new.generation_id and cache_key=new.cache_key and status='succeeded') then
  raise exception 'Cache requires successful generation' using errcode='23514';
 end if; return new;
end $$;
create trigger cache_pointer before insert or update on public.lens_cache_entries for each row execute function public.validate_cache_pointer();
revoke update,delete on public.lens_cache_entries from service_role;
-- All functions are privileged, invoker, fully qualified. No elevated SECURITY DEFINER.
do $$ declare f record; begin
 for f in select p.oid::regprocedure as sig from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' loop
  execute format('revoke all on function %s from public,anon,authenticated',f.sig);
  execute format('grant execute on function %s to service_role',f.sig);
 end loop;
end $$;
commit;
