-- Reconstructed, clean-database contract. NOT a dump of the production schema.
begin;
create schema if not exists extensions;
create extension if not exists vector with schema extensions;
create extension if not exists pgcrypto with schema extensions;
revoke create on schema public from public, anon, authenticated;
revoke all on schema extensions from public, anon, authenticated;
grant usage on schema public to anon, authenticated, service_role;
grant usage on schema extensions to service_role;
alter default privileges in schema public revoke all on tables from public, anon, authenticated;
alter default privileges in schema public revoke execute on functions from public, anon, authenticated;

create table public.teams (
 id text primary key, name text not null check(length(btrim(name))>0), code text not null default '', flag text not null default '',
 group_name text not null default '', summary text not null default '',
 strength_attack smallint check(strength_attack between 0 and 100), strength_midfield smallint check(strength_midfield between 0 and 100),
 strength_defense smallint check(strength_defense between 0 and 100), strength_transitions smallint check(strength_transitions between 0 and 100),
 external_provider text, external_id text, logo_url text,
 data_origin text not null default 'unknown' check(data_origin in ('unknown','synthetic','provider')),
 publication_status text not null default 'private' check(publication_status in ('private','synthetic-public')),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 unique(external_provider,external_id), check(publication_status='private' or data_origin='synthetic')
);
create table public.venues (
 id text primary key, name text not null check(length(btrim(name))>0), city text not null default 'Unknown', country text not null default 'Unknown', summary text not null default '',
 external_provider text, external_id text,
 data_origin text not null default 'unknown' check(data_origin in ('unknown','synthetic','provider')),
 publication_status text not null default 'private' check(publication_status in ('private','synthetic-public')),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 unique(external_provider,external_id), check(publication_status='private' or data_origin='synthetic')
);
create table public.matches (
 id text primary key, home_team_id text not null constraint matches_home_team_id_fkey references public.teams(id),
 away_team_id text not null constraint matches_away_team_id_fkey references public.teams(id),
 venue_id text not null constraint matches_venue_id_fkey references public.venues(id),
 group_name text not null default '', kickoff_at timestamptz not null, signal_tags text[] not null default '{}',
 status text not null default 'scheduled' check(status in ('scheduled','live','finished','postponed','cancelled')),
 status_short text, status_long text, elapsed integer check(elapsed between 0 and 300),
 home_score integer check(home_score between 0 and 99), away_score integer check(away_score between 0 and 99),
 external_provider text, external_id text,
 known_at timestamptz, knowledge_evidence text,
 data_origin text not null default 'unknown' check(data_origin in ('unknown','synthetic','provider')),
 publication_status text not null default 'private' check(publication_status in ('private','synthetic-public')),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 unique(external_provider,external_id), check(home_team_id<>away_team_id),
 check(publication_status='private' or data_origin='synthetic'),
 check((known_at is null and knowledge_evidence is null) or (known_at is not null and coalesce(length(btrim(knowledge_evidence))>0,false)))
);
create index matches_provider_day_idx on public.matches(external_provider,kickoff_at,id);
create index matches_home_idx on public.matches(home_team_id);
create index matches_away_idx on public.matches(away_team_id);
create index matches_venue_idx on public.matches(venue_id);

create table public.documents (
 id uuid primary key default gen_random_uuid(), title text not null check(length(title) between 4 and 100), doc_type text not null,
 body text not null check(length(btrim(body))>0), source_url text, source_identity text, source_provider text,
 team_id text references public.teams(id), venue_id text references public.venues(id), match_id text references public.matches(id),
 is_global boolean not null default false, source_kind text not null default 'unknown' check(source_kind in ('unknown','synthetic','provider','editorial')),
 published_at timestamptz, captured_at timestamptz, availability_verified boolean not null default false, availability_evidence text,
 dataset_version text not null default 'legacy-unknown' check(length(btrim(dataset_version))>0),
 input_hash text not null, current_version_id uuid,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 check(not is_global or (team_id is null and venue_id is null and match_id is null)),
 check(not availability_verified or (published_at is not null and captured_at is not null and published_at<=captured_at and coalesce(length(btrim(availability_evidence))>0,false) and coalesce(length(btrim(source_identity))>0,false)))
);
create unique index documents_provider_team_idx on public.documents(source_provider,team_id) where doc_type='team_profile' and source_provider is not null and team_id is not null and venue_id is null and match_id is null;
create unique index documents_provider_venue_idx on public.documents(source_provider,venue_id) where doc_type='venue_profile' and source_provider is not null and venue_id is not null and team_id is null and match_id is null;
create index documents_match_idx on public.documents(match_id);
create function public.fingerprint_document() returns trigger language plpgsql security invoker set search_path='' set timezone='UTC' as $$
begin
 -- Content/provenance edits invalidate the previous availability review. A deliberate
 -- separate update may re-attest the exact new material after evidence review.
 if tg_op='UPDATE' and row(new.title,new.doc_type,new.body,new.source_url,new.source_identity,new.source_provider,new.team_id,new.venue_id,new.match_id,new.is_global,new.source_kind,new.published_at,new.captured_at,new.dataset_version)
   is distinct from row(old.title,old.doc_type,old.body,old.source_url,old.source_identity,old.source_provider,old.team_id,old.venue_id,old.match_id,old.is_global,old.source_kind,old.published_at,old.captured_at,old.dataset_version) then
  new.availability_verified:=false; new.availability_evidence:=null;
 end if;
 new.input_hash := pg_catalog.encode(extensions.digest(pg_catalog.jsonb_build_object(
  'title',new.title,'doc_type',new.doc_type,'body',new.body,'source_url',new.source_url,'source_identity',new.source_identity,
  'source_provider',new.source_provider,'team_id',new.team_id,'venue_id',new.venue_id,'match_id',new.match_id,'is_global',new.is_global,
  'source_kind',new.source_kind,'published_at',new.published_at,'captured_at',new.captured_at,
  'availability_verified',new.availability_verified,'availability_evidence',new.availability_evidence,'dataset_version',new.dataset_version
 )::text,'sha256'),'hex');
 new.updated_at := pg_catalog.clock_timestamp(); return new;
end $$;
create trigger documents_fingerprint before insert or update on public.documents for each row execute function public.fingerprint_document();
create table public.document_versions (
 id uuid primary key default gen_random_uuid(), document_id uuid not null references public.documents(id),
 version_key text not null check(version_key ~ '^[a-f0-9]{64}$'), input_hash text not null,
 title text not null, doc_type text not null, body text not null, source_url text, source_identity text, source_provider text, source_kind text not null,
 team_id text references public.teams(id), venue_id text references public.venues(id), match_id text references public.matches(id), is_global boolean not null,
 published_at timestamptz, captured_at timestamptz, availability_verified boolean not null, availability_evidence text, dataset_version text not null,
 embedding_model text not null, embedding_version text not null, embedding_origin text not null check(embedding_origin in ('model','synthetic')),
 chunker_version text not null, embedding_started_at timestamptz not null, embedding_completed_at timestamptz not null,
 created_at timestamptz not null default clock_timestamp(),
 unique(document_id,version_key), unique(document_id,id), check(embedding_completed_at>=embedding_started_at)
);
alter table public.documents add constraint documents_current_version_fkey foreign key(id,current_version_id) references public.document_versions(document_id,id);
create table public.document_chunks (
 id uuid primary key default gen_random_uuid(), document_id uuid not null references public.documents(id),
 document_version_id uuid, chunk_index integer not null check(chunk_index>=0), content text not null check(length(btrim(content))>0),
 content_hash text generated always as (encode(extensions.digest(content,'sha256'),'hex')) stored,
 embedding extensions.vector(1536) not null check(extensions.vector_norm(embedding)>0), metadata jsonb not null default '{}' check(jsonb_typeof(metadata)='object'),
 embedding_model text not null default 'text-embedding-3-small', embedding_version text not null default 'openai-small-1536-v1',
 created_at timestamptz not null default clock_timestamp(),
 foreign key(document_id,document_version_id) references public.document_versions(document_id,id),
 unique(document_version_id,chunk_index)
);
create unique index document_chunks_legacy_index on public.document_chunks(document_id,chunk_index) where document_version_id is null;
create index document_chunks_version_idx on public.document_chunks(document_version_id,embedding_model,embedding_version);
create function public.reject_immutable_change() returns trigger language plpgsql security invoker set search_path='' as $$
begin raise exception 'Immutable history cannot be updated or deleted' using errcode='55000'; end $$;
create trigger document_versions_immutable before update or delete on public.document_versions for each row execute function public.reject_immutable_change();
create trigger document_chunks_immutable before update or delete on public.document_chunks for each row when(old.document_version_id is not null) execute function public.reject_immutable_change();

create table public.generation_runs (
 id uuid primary key, match_id text not null references public.matches(id), cache_key text not null check(cache_key ~ '^[a-f0-9]{64}$'),
 identity jsonb not null check(jsonb_typeof(identity)='object'), submission jsonb not null check(jsonb_typeof(submission)='object'),
 dataset_version text not null, input_fingerprint text not null, input_snapshot jsonb not null check(jsonb_typeof(input_snapshot)='object'), perspective text not null check(perspective in ('retrospective','as-of')),
 historical_cutoff timestamptz, retrieved_at timestamptz not null, generation_started_at timestamptz, generation_completed_at timestamptz,
 generator_kind text not null check(generator_kind in ('model','mock')), model text not null, prompt_version text not null, schema_version text not null,
 embedding_model text not null, embedding_version text not null, embedding_dimensions integer not null check(embedding_dimensions=1536),
 query_embedding extensions.vector(1536) not null check(extensions.vector_norm(query_embedding)>0),
 context_manifest jsonb not null check(jsonb_typeof(context_manifest)='array'), status text not null check(status in ('succeeded','failed')),
 lens_json jsonb, output_hash text generated always as (encode(extensions.digest(lens_json::text,'sha256'),'hex')) stored, error_code text,
 created_at timestamptz not null default clock_timestamp(), unique(cache_key,id),
 check((perspective='retrospective' and historical_cutoff is null) or (perspective='as-of' and historical_cutoff is not null and historical_cutoff<=retrieved_at)),
 check((generation_started_at is null and generation_completed_at is null and status='failed' and error_code='empty-context') or
       (generation_started_at is not null and generation_completed_at is not null and generation_started_at>=retrieved_at and generation_completed_at>=generation_started_at)),
 check(coalesce((status='succeeded' and error_code is null and jsonb_typeof(lens_json)='object' and lens_json->>'confidence' in ('Low','Medium','High') and lens_json->>'volatility' in ('Low','Medium','High') and lens_json->'teamEdges'='[]'::jsonb) or
       (status='failed' and lens_json is null and error_code in ('empty-context','generation-failed','invalid-output')),false))
);
create trigger generation_runs_immutable before update or delete on public.generation_runs for each row execute function public.reject_immutable_change();
create index generation_runs_match_idx on public.generation_runs(match_id,created_at,id);
create table public.generation_run_chunks (
 run_id uuid not null references public.generation_runs(id), chunk_id uuid not null references public.document_chunks(id), position integer not null check(position>=0),
 primary key(run_id,chunk_id), unique(run_id,position)
);
create trigger generation_run_chunks_immutable before update or delete on public.generation_run_chunks for each row execute function public.reject_immutable_change();
create table public.lens_cache_entries (
 cache_key text primary key, generation_id uuid not null, created_at timestamptz not null default clock_timestamp(),
 foreign key(cache_key,generation_id) references public.generation_runs(cache_key,id)
);
create table public.match_lenses (
 id uuid not null default gen_random_uuid() unique, created_at timestamptz not null default now(),
 match_id text primary key references public.matches(id), lens_json jsonb not null check(jsonb_typeof(lens_json)='object'), model text,
 generation_id uuid references public.generation_runs(id), updated_at timestamptz not null default now(),
 data_origin text not null default 'unknown' check(data_origin in ('unknown','synthetic','provider')),
 publication_status text not null default 'private' check(publication_status in ('private','synthetic-public')),
 check(publication_status='private' or data_origin='synthetic')
);
create table public.qa_answers (
 id uuid not null default gen_random_uuid() unique, created_at timestamptz not null default now(), model text,
 match_id text not null references public.matches(id), question_key text not null check(question_key in ('explain-casually','tactical-edge','what-could-go-wrong')),
 answer_json jsonb not null check(jsonb_typeof(answer_json)='object'), updated_at timestamptz not null default now(),
 data_origin text not null default 'unknown' check(data_origin in ('unknown','synthetic','provider')),
 publication_status text not null default 'private' check(publication_status in ('private','synthetic-public')),
 primary key(match_id,question_key), check(publication_status='private' or data_origin='synthetic')
);

-- Explicit synthetic publication only. Provider/default rows remain private.
do $$ declare tab text; begin
 foreach tab in array array['teams','venues','matches','documents','document_versions','document_chunks','generation_runs','generation_run_chunks','lens_cache_entries','match_lenses','qa_answers'] loop
  execute format('alter table public.%I enable row level security',tab);
  execute format('revoke all on public.%I from public, anon, authenticated, service_role',tab);
  execute format('create policy operator_access on public.%I to service_role using (true) with check (true)',tab);
 end loop;
end $$;
grant select,insert,update,delete on public.teams,public.venues,public.matches,public.documents,public.match_lenses,public.qa_answers,public.lens_cache_entries to service_role;
grant select,insert on public.document_versions,public.document_chunks,public.generation_runs,public.generation_run_chunks to service_role;
grant select on public.teams,public.venues,public.matches,public.match_lenses,public.qa_answers to anon,authenticated;
create policy synthetic_read on public.teams for select to anon,authenticated using(publication_status='synthetic-public' and data_origin='synthetic');
create policy synthetic_read on public.venues for select to anon,authenticated using(publication_status='synthetic-public' and data_origin='synthetic');
create policy synthetic_read on public.matches for select to anon,authenticated using(publication_status='synthetic-public' and data_origin='synthetic' and exists(select 1 from public.teams where id=home_team_id) and exists(select 1 from public.teams where id=away_team_id) and exists(select 1 from public.venues where id=venue_id));
create policy synthetic_read on public.match_lenses for select to anon,authenticated using(publication_status='synthetic-public' and data_origin='synthetic' and exists(select 1 from public.matches where id=match_id));
create policy synthetic_read on public.qa_answers for select to anon,authenticated using(publication_status='synthetic-public' and data_origin='synthetic' and exists(select 1 from public.matches where id=match_id));
revoke all on function public.fingerprint_document(),public.reject_immutable_change() from public,anon,authenticated;
grant execute on function public.fingerprint_document(),public.reject_immutable_change() to service_role;
commit;
