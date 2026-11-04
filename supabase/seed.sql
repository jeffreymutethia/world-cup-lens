-- Original synthetic integration corpus. Not a provider export or historical evidence.
insert into public.teams(id,name,code,data_origin,publication_status) values
 ('maple','Maple Eleven','MAP','synthetic','synthetic-public'),('harbor','Harbor Eleven','HBR','synthetic','synthetic-public'),
 ('other','Other Eleven','OTH','synthetic','private');
insert into public.venues(id,name,data_origin,publication_status) values('test-ground','Test Ground','synthetic','synthetic-public');
insert into public.matches(id,home_team_id,away_team_id,venue_id,group_name,kickoff_at,known_at,knowledge_evidence,data_origin,publication_status) values
 ('synthetic-match','maple','harbor','test-ground','Quarter-final','2026-07-11T20:00:00Z','2026-07-01T00:00:00Z','Fictional test schedule v1','synthetic','synthetic-public'),
 ('other-match','maple','other','test-ground','Group X','2026-07-12T20:00:00Z',null,null,'synthetic','private');
insert into public.documents(id,title,doc_type,body,team_id,match_id,is_global,source_kind,source_identity,published_at,captured_at,availability_verified,availability_evidence,dataset_version) values
 ('00000000-0000-4000-8000-000000000001','Maple synthetic profile','team_profile','Maple Eleven is a fictional team. No measured performance data is available.', 'maple',null,false,'synthetic','Original test corpus','2026-07-01Z','2026-07-02Z',true,'Synthetic availability scenario, not real historical evidence','synthetic-v1'),
 ('00000000-0000-4000-8000-000000000002','Unrelated match note','match_preview','This original synthetic document concerns a different match.', 'maple','other-match',false,'synthetic','Original test corpus','2026-07-01Z','2026-07-02Z',true,'Synthetic test','synthetic-v1'),
 ('00000000-0000-4000-8000-000000000003','Unknown availability','team_profile','This fictional source has no established publication or capture time.', 'harbor',null,false,'synthetic','Original test corpus',null,null,false,null,'synthetic-v1'),
 ('00000000-0000-4000-8000-000000000004','Later synthetic source','team_profile','This fictional source was captured after the historical cutoff.', 'harbor',null,false,'synthetic','Original test corpus','2026-07-10Z','2026-07-12Z',true,'Synthetic test','synthetic-v1'),
 ('00000000-0000-4000-8000-000000000005','Global synthetic guide','tournament_rules','This is an original fictional guide, not official competition regulations.',null,null,true,'synthetic','Original test corpus','2026-07-01Z','2026-07-02Z',true,'Synthetic test','synthetic-v1');
-- Basis vector [1,0,...], independently constructed; never attributed to an embedding model.
select public.store_document_revision(id,input_hash,'synthetic-basis-1536','basis-v1','synthetic','paragraph-v1',clock_timestamp(),clock_timestamp(),
 jsonb_build_array(jsonb_build_object('content',body,'metadata',jsonb_build_object('synthetic',true),'embedding',to_jsonb(array[1.0]||array_fill(0.0,array[1535]))))) from public.documents order by id;
insert into public.qa_answers(match_id,question_key,answer_json,data_origin,publication_status) values
 ('synthetic-match','explain-casually','{"key":"explain-casually","question":"What does this example show?","shortLabel":"Overview","answer":"This fictional example demonstrates cached answers without a model request.","sources":[]}', 'synthetic','synthetic-public');
