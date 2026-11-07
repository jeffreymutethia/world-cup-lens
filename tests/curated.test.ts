import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { curatedMatches, CURATED_DATASET_VERSION } from "../src/data/curated-history";
import { validateCuratedDataset, isCuratedMatch, validSource, loadCuratedHistory, parseCuratedFilters, selectCuratedMatches, paginateCuratedMatches, curatedNavigation, curatedHref, curatedMatchHref, curatedCanonicalPath, parseCuratedReturn, matchLensLabel, curatedResultLabel, groupRecord, teamKey, teamMonogram, matchWinner, CURATED_DATES, CURATED_TEAMS, EXPECTED_STAGE_COUNTS, tournamentStage } from "../src/lib/curated-history";
import { sourceRights } from "../src/lib/data-rights";
const match = (number: number) => curatedMatches.find(m => m.matchNumber === number)!;

test("reviewed manifest pins all 104 exact factual tuples independently of commentary", () => {
  const tuples = curatedMatches.map(m => [m.matchNumber,m.id,m.eventDate,m.homeTeam,m.awayTeam,m.homeCode,m.awayCode,m.stage,m.venue,m.finalScore,m.afterExtraTime,m.penaltyShootout,m.advancingTeam]);
  const hash=createHash("sha256").update(JSON.stringify(tuples)).digest("hex");
  assert.equal(hash,"2dba8694d3dac5f379c176c4c37f20b7a1b86e9e962acca454a4281b73d229cb"); // Reviewed Nov7 against 104 linked official PDFs; no source bodies retained.
  assert.deepEqual(validateCuratedDataset(curatedMatches),[]);
  assert.equal(curatedMatches.length,104);
  assert.deepEqual(curatedMatches.map(m=>m.matchNumber),Array.from({length:104},(_,i)=>i+1));
  for(const [stage,count]of Object.entries(EXPECTED_STAGE_COUNTS)) assert.equal(curatedMatches.filter(m=>tournamentStage(m)===stage).length,count);
});

test("all 48 team identities and codes are consistent through groups and knockouts", () => {
  assert.equal(CURATED_TEAMS.length,48);
  assert.equal(new Set(curatedMatches.flatMap(m=>[m.homeCode,m.awayCode])).size,48);
  for(const m of curatedMatches) for(const [team,code]of [[m.homeTeam,m.homeCode],[m.awayTeam,m.awayCode]]) assert.equal(teamMonogram(team),code);
  assert.equal(match(98).homeCode,"ESP"); assert.equal(match(98).awayCode,"BEL");
  const changed=curatedMatches.map(m=>m.matchNumber===98?{...m,homeCode:"BEL",awayCode:"ALT"}:m);
  assert.ok(validateCuratedDataset(changed).includes("Inconsistent team code identity."));
});

test("five original fixtures retain their exact dates, stages and results",()=>{
  for(const [id,number,date,home,away,stage,aet]of [
    ["mexico-south-africa-2026-06-11",1,"2026-06-11",2,0,"Group A",false],
    ["usa-paraguay-2026-06-12",4,"2026-06-12",4,1,"Group D",false],
    ["norway-england-2026-07-11",99,"2026-07-11",1,2,"Quarter-final",true],
    ["argentina-switzerland-2026-07-11",100,"2026-07-11",3,1,"Quarter-final",true],
    ["spain-argentina-2026-07-19",104,"2026-07-19",1,0,"Final",true],
  ]as const){const m=match(number); assert.deepEqual([m.id,m.eventDate,m.finalScore.home,m.finalScore.away,m.stage,m.afterExtraTime],[id,date,home,away,stage,aet]);}
});

test("penalty results exclude shootout kicks and knockout winners agree with separate shootout scores",()=>{
  const shootouts=curatedMatches.filter(m=>m.penaltyShootout);
  assert.equal(shootouts.length,4);
  for(const m of shootouts){assert.equal(m.finalScore.home,m.finalScore.away);assert.equal(m.afterExtraTime,true);assert.equal(matchWinner(m),m.advancingTeam);assert.match(curatedResultLabel(m),/shootout/);assert.notEqual(m.penaltyShootout!.home,m.penaltyShootout!.away);}
  assert.deepEqual(match(75).finalScore,{home:1,away:1}); assert.deepEqual(match(75).penaltyShootout,{home:2,away:3});
  assert.deepEqual(match(103).finalScore,{home:4,away:6}); assert.equal(match(103).penaltyShootout,null);
  assert.equal(isCuratedMatch({...shootouts[0],afterExtraTime:false}),false);
  assert.equal(isCuratedMatch({...shootouts[0],finalScore:{home:2,away:1}}),false);
});

test("source metadata is complete and only the scoped new editorial version is approved",()=>{
  for(const m of curatedMatches){assert.equal(m.datasetVersion,CURATED_DATASET_VERSION);assert.equal(m.source.accessMethod,"direct-pdf");assert.ok(m.source.url.endsWith(".pdf"));assert.equal(m.source.reviewedOn,"2026-11-07");assert.ok(m.sources.every(validSource));assert.ok(m.sources.some(s=>s.url.includes("match-report-hub")));}
  assert.equal(sourceRights("curated-history-2026-v3").publicGitHubDataset,"104_CURATED_RECORDS_ONLY");
  assert.equal(sourceRights("api-football-fixtures").publicationRights,"UNKNOWN");
  assert.equal(sourceRights("cached-ai-commentary").publicGitHubDataset,"NOT_APPROVED");
});

test("calendar days never acquire kickoff instants, predictions or fabricated availability clocks",()=>{
  for(const m of curatedMatches){assert.equal(m.datePrecision,"day");assert.equal(m.dateBasis,"source-local-event-day");assert.equal(m.commentaryOrigin,"authored-retrospective-editorial");assert.ok(Object.values(m.unknowns).every(x=>x===null));assert.equal("confidence"in m.editorial,false);assert.equal("teamEdges"in m.editorial,false);}
  assert.equal(match(100).eventDate,"2026-07-11");assert.equal(match(41).venue,"New York New Jersey Stadium");
  assert.match(curatedResultLabel({...match(99),afterExtraTime:null}),/unknown/);
});

test("retrospective context covers every match; exactly ten deeper Lenses have supported developments",()=>{
  const deeper=curatedMatches.filter(m=>m.editorial.depth==="extended");assert.equal(deeper.length,10);
  for(const m of curatedMatches){assert.ok(m.editorial.overview&&m.editorial.significance&&m.editorial.uncertainty.length);assert.equal(isCuratedMatch(m),true);}
  for(const m of deeper){assert.ok(m.editorial.interpretation.length>=2);assert.ok(m.editorial.developments?.length);for(const d of m.editorial.developments!)assert.ok(m.sources.some(s=>s.url===d.sourceUrl));}
  assert.ok(match(1).editorial.overview.includes("Quiñones"));assert.ok(match(99).editorial.headline.includes("Bellingham"));
});

test("date, stage, group, team and accent-insensitive search filters intersect deterministically",()=>{
  assert.equal(loadCuratedHistory("all").matches.length,104);
  assert.deepEqual(loadCuratedHistory("2026-07-11").matches.map(m=>m.matchNumber),[99,100]);
  assert.equal(loadCuratedHistory({date:"all",stage:"Group stage"}).matches.length,72);
  assert.equal(loadCuratedHistory({date:"all",stage:"Group A"}).matches.length,6);
  assert.equal(loadCuratedHistory({date:"all",team:"spain"}).matches.length,8);
  assert.deepEqual(loadCuratedHistory({date:"all",stage:"Quarter-final",team:"england",q:"Norway"}).matches.map(m=>m.matchNumber),[99]);
  assert.deepEqual(loadCuratedHistory({date:"",q:" Norway "}).matches,loadCuratedHistory({date:"all",q:"Norway"}).matches);
  const reversed=selectCuratedMatches([...curatedMatches].reverse(),{date:"all"});assert.deepEqual(reversed,curatedMatches);
  assert.equal(selectCuratedMatches(curatedMatches,{date:"all",q:"Curacao"}).length,3);
});

test("featured selection is editorial, never a live status or sorting accident",()=>{
  assert.equal(loadCuratedHistory("all").featured?.matchNumber,99);assert.equal(loadCuratedHistory("2026-07-11").featured?.matchNumber,99);
  assert.equal(loadCuratedHistory({date:"all",stage:"Final"}).featured?.matchNumber,104);
  assert.equal(loadCuratedHistory("2026-06-11").featured?.matchNumber,1);
});

test("paged results cover all secondary fixtures exactly once with useful out-of-range handling",()=>{
  const all=loadCuratedHistory("all");const others=all.matches.filter(m=>m.id!==all.featured!.id);
  const ids=[];for(let i=1;i<=5;i++){const p=paginateCuratedMatches(others,String(i));assert.equal(p.invalid,false);assert.ok(p.matches.length<=24);ids.push(...p.matches.map(m=>m.id));}
  assert.equal(new Set(ids).size,103);assert.equal(paginateCuratedMatches([match(1)],"2").invalid,true);
});

test("detail and related navigation preserve return filters while looking up canonical records",()=>{
  const filters={date:"all",stage:"Quarter-final",team:"england",q:"Norway",page:"1"};
  const url=new URL(curatedHref(filters,match(99).id),"https://example.test");assert.equal(url.searchParams.get("date"),match(99).eventDate); assert.deepEqual(parseCuratedReturn(Object.fromEntries(url.searchParams),{date:match(99).eventDate}),{ok:true,filters});
  const nav=curatedNavigation(match(99),{date:"2026-07-11"});assert.equal(nav.next?.matchNumber,100);assert.equal(nav.previous,null);
  assert.ok(nav.related.some(m=>m.matchNumber===102));assert.ok(nav.related.every(m=>m.id!==match(99).id&&[m.homeTeam,m.awayTeam].some(t=>["Norway","England"].includes(t))));
  assert.equal(curatedNavigation(match(104),{date:"2026-07-19"}).next,null);
  assert.ok(CURATED_DATES.every(day=>loadCuratedHistory(day).state==="ready"));
});

test("computed group records describe played results without inventing table rankings",()=>{
  assert.deepEqual(groupRecord(match(1),"Mexico"),{played:1,won:1,drawn:0,lost:0,points:3,goalsFor:2,goalsAgainst:0});
  assert.equal(groupRecord(match(53),"Mexico")?.points,9);assert.equal(groupRecord(match(99),"England"),null);
  assert.equal(teamKey("Curaçao"),"curacao");
});

test("invalid and empty filters remain distinct from malformed or incomplete source records",()=>{
  for(const params of [{date:"2026-02-30"},{date:"2026-07-20"},{date:["2026-07-11"]},{stage:"Group Quarter-final"},{team:"fictional"},{q:"a".repeat(81)},{page:"0"},{page:"6"}])assert.equal(parseCuratedFilters(params).ok,false);
  assert.equal(loadCuratedHistory("2026-07-13").state,"empty");assert.equal(loadCuratedHistory({date:"all",q:"NoSuchTeamEver"}).state,"empty");
  for(const records of [null,[],{},[null],curatedMatches.slice(1),[...curatedMatches,match(1)]])assert.equal(loadCuratedHistory("all",records).state,"error");
  for(const source of [null,{}, {...match(1).source,accessMethod:Object.create(null)}, {...match(1).source,accessMethod:{toString(){throw Error("coercion");}}}]) assert.equal(validSource(source),false);
  for(const patch of [{finalScore:{home:-1,away:0}},{afterExtraTime:"AET"},{source:{...match(1).source,url:"https://www.fifa.com.evil.invalid/match.pdf"}},{editorial:{...match(1).editorial,depth:Object.create(null)}},{unknowns:{...match(1).unknowns,kickoffAt:"2026-06-11T00:00:00Z"}}])assert.equal(isCuratedMatch({...match(1),...patch}),false);
});

test("conflicting bracket participants and unsupported editorial references fail closed",()=>{
  const repeated=curatedMatches.map(m=>m.matchNumber===74?{...m,homeTeam:match(73).homeTeam,homeCode:match(73).homeCode}:m);
  assert.ok(validateCuratedDataset(repeated).some(s=>s.includes("Repeated participant")));
  assert.equal(isCuratedMatch({...match(1),editorial:{...match(1).editorial,developments:[{text:"Unsupported",sourceUrl:"https://example.test/unknown"}]}}),false);
  const invalid=curatedMatches.map(m=>m.matchNumber===104?{...m,advancingTeam:"Argentina"}:m);assert.ok(validateCuratedDataset(invalid).length);
});

test("public render code neither imports synthetic content nor labels editorial recaps as model output",()=>{
  for(const path of ["src/components/match/curated-match.tsx","src/components/replay/curated-home.tsx"]){const source=readFileSync(path,"utf8");assert.doesNotMatch(source,/data\/seed|generateAndSave|openai\.responses|\.embed\(/);}
  const source=readFileSync("src/components/match/curated-match.tsx","utf8");assert.ok(source.includes("Original editorial commentary"));assert.ok(source.includes("extra-time status")||source.includes("extra time unknown"));
});

test("correct winner sets cannot conceal swapped quarter-final bracket opponents",()=>{
  const swapped=curatedMatches.map(m=>m.matchNumber===97?{...m,awayTeam:match(98).awayTeam,awayCode:match(98).awayCode}:m.matchNumber===98?{...m,awayTeam:match(97).awayTeam,awayCode:match(97).awayCode}:m);
  assert.ok(swapped.every(isCuratedMatch));
  assert.ok(validateCuratedDataset(swapped).some(issue=>issue.includes("Conflicting bracket")));
});

test("cross-date match links carry actual event days and preserve original paged result filters",()=>{
  const origin={date:"all",stage:"Group stage",team:"spain",q:"Spain",page:"2"};
  const first=new URL(curatedMatchHref(match(99),origin),"https://local.invalid");
  assert.equal(first.searchParams.get("date"),"2026-07-11");
  const next=new URL(curatedMatchHref(match(104),origin),"https://local.invalid");
  assert.equal(next.searchParams.get("date"),"2026-07-19");
  assert.equal(next.searchParams.get("returnDate"),"all");
  const parsed=parseCuratedReturn(Object.fromEntries(next.searchParams),{date:"2026-07-19"});
  assert.ok(parsed.ok);assert.deepEqual(parsed.filters,origin);
  assert.equal(curatedHref(parsed.filters),"/?mode=curated&date=all&stage=Group+stage&team=spain&q=Spain&page=2");
  assert.equal(new URL(curatedMatchHref(match(1),parsed.filters),"https://local.invalid").searchParams.get("date"),"2026-06-11");
  assert.equal(curatedCanonicalPath(match(104)),"/matches/spain-argentina-2026-07-19?mode=curated&date=2026-07-19");
});
test("return navigation validates only curated filters and does not accept arbitrary destinations",()=>{
  for(const params of [{returnDate:"https://evil.invalid"},{returnStage:"Final"},{returnDate:["all"]},{returnDate:"all",returnTeam:"unknown"},{returnDate:"all",returnPage:"99"},{returnDate:"all",returnQ:["a","b"]}])assert.equal(parseCuratedReturn(params,{date:"2026-07-11"}).ok,false);
  assert.deepEqual(parseCuratedReturn({returnTo:"https://evil.invalid"},{date:"2026-07-11"}),{ok:true,filters:{date:"2026-07-11"}});
  assert.equal(new URL(curatedMatchHref(match(104),{date:"2026-07-11"}),"https://local.invalid").searchParams.get("returnDate"),"2026-07-11");
  assert.throws(()=>curatedHref({date:"all"},"missing-match"));
});
test("analysis labels distinguish all94 contextual records and10 extended retrospectives",()=>{
  assert.equal(curatedMatches.filter(m=>matchLensLabel(m)==="Match context").length,94);
  assert.equal(curatedMatches.filter(m=>matchLensLabel(m)==="Match analysis").length,10);
});
