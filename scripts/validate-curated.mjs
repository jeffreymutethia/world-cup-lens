import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const read=name=>JSON.parse(readFileSync(new URL(`../src/data/${name}`,import.meta.url),"utf8"));
const records=read("curated-records.json"), lenses=read("curated-lenses.json");
assert.equal(records.length,104);assert.equal(new Set(records.map(m=>m.id)).size,104);
assert.deepEqual(records.map(m=>m.matchNumber),Array.from({length:104},(_,i)=>i+1));
const counts={"Group stage":72,"Round of 32":16,"Round of 16":8,"Quarter-final":4,"Semi-final":2,"Third-place":1,Final:1};
for(const [stage,count]of Object.entries(counts))assert.equal(records.filter(m=>(m.stage.startsWith("Group ")?"Group stage":m.stage)===stage).length,count);
const codes=new Map(), names=new Map();
for(const m of records){
 for(const [name,code]of [[m.homeTeam,m.homeCode],[m.awayTeam,m.awayCode]]){assert.match(code,/^[A-Z]{3}$/);if(codes.has(name))assert.equal(codes.get(name),code);if(names.has(code))assert.equal(names.get(code),name);codes.set(name,code);names.set(code,name);}
 assert.match(m.eventDate,/^2026-(06|07)-\d{2}$/);assert.ok(m.eventDate>="2026-06-11"&&m.eventDate<="2026-07-19");
 for(const score of Object.values(m.finalScore))assert.ok(Number.isInteger(score)&&score>=0);
 assert.ok(m.sources.length>=3);assert.equal(m.sources[0].accessMethod,"direct-pdf");
 for(const source of m.sources){const url=new URL(source.url);assert.equal(url.protocol,"https:");assert.equal(url.username+url.password,"");assert.equal(source.reviewedOn,"2026-11-07");}
 if(m.penaltyShootout){assert.equal(m.finalScore.home,m.finalScore.away);assert.equal(m.afterExtraTime,true);assert.notEqual(m.penaltyShootout.home,m.penaltyShootout.away);}
 if(lenses[m.id]) for(const d of lenses[m.id].developments??[])assert.ok(lenses[m.id].sources.some(s=>s.url===d.sourceUrl));
}
const winner=m=>{const score=m.penaltyShootout??m.finalScore;return score.home>score.away?m.homeTeam:score.home<score.away?m.awayTeam:null;};
const feeders={89:[74,77],90:[73,75],91:[76,78],92:[79,80],93:[83,84],94:[81,82],95:[86,88],96:[85,87],97:[89,90],98:[93,94],99:[91,92],100:[95,96],101:[97,98],102:[99,100],104:[101,102]};
for(const [number,inputs]of Object.entries(feeders)){const destination=records.find(m=>m.matchNumber===Number(number));assert.deepEqual(inputs.map(n=>winner(records.find(m=>m.matchNumber===n))).sort(),[destination.homeTeam,destination.awayTeam].sort());}
assert.equal(codes.size,48);assert.equal(Object.keys(lenses).length,10);assert.ok(Object.keys(lenses).every(id=>records.some(m=>m.id===id)));
console.log("PASS 104 unique numbered records, 72/16/8/4/2/1/1 stages, 48 consistent team codes, primary metadata, separate shootouts and ten editorial Lenses");
console.log("Offline integrity only; publisher fact checking and scoped publication evidence: docs/curated-history-review.md");
