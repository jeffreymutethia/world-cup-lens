import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const records = JSON.parse(readFileSync(new URL("../src/data/curated-records.json",import.meta.url),"utf8"));
const markup = html => html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, "").replace(/<!--[\s\S]*?-->/g, "");

// These are implementation checks against the reviewed manifest, not independent publisher verification.
export async function checkCuratedPages(page) {
  let {html,status} = await page("/");
  assert.equal(status,200);
  let visible=markup(html);
  for(const expected of ["World Cup 2026", "104", "Norway", "Switzerland", "Not affiliated with FIFA or any national association", "Browse the tournament"]) assert.ok(visible.includes(expected),expected);
  assert.equal((visible.match(/<h1\b/g)??[]).length,1);
  assert.equal((visible.match(/data-match-id="norway-england-2026-07-11"/g)??[]).length,1);
  assert.equal((visible.match(/data-match-id="argentina-switzerland-2026-07-11"/g)??[]).length,1);
  for(const forbidden of ["Fictional lab","Copper Vale",'value="archive"',"v2"]) assert.ok(!visible.includes(forbidden));
  const featured=visible.match(/href="(\/matches\/[^\"]+)"/)?.[1]?.replaceAll("&amp;","&");
  assert.equal(featured,"/matches/norway-england-2026-07-11?mode=curated&date=2026-07-11");
  const allIds=[];
  for(let n=1;n<=5;n++){
    const result=await page(`/?mode=curated&date=all&page=${n}`);
    assert.equal(result.status,200);
    const content=markup(result.html);
    assert.ok(!content.includes("Results page not found"));
    const ids=[...content.matchAll(/data-match-id="([^"]+)"/g)].map(m=>m[1]);
    assert.equal(new Set(ids).size,ids.length,"Featured match must not repeat in list");
    assert.ok(ids.length<=25,"At most 24 list cards plus featured");
    allIds.push(...ids);
  }
  assert.equal(new Set(allIds).size,104,"All records browsable across paged results");
  console.log("PASS full 104-match archive coverage, pagination, unique featured card and independent identity");
  // Bounded parallel read-only pages: works locally and on the explicitly authorized public origin.
  for(let i=0;i<records.length;i+=6) await Promise.all(records.slice(i,i+6).map(async record=>{
    const path=`/matches/${record.id}?mode=curated&date=${record.eventDate}`;
    const result=await page(path);
    assert.equal(result.status,200,path);
    const content=markup(result.html);
    for(const expected of [record.homeTeam,record.awayTeam,`${record.finalScore.home}–${record.finalScore.away}`,record.stage,record.venue,"Match Lens", "Retrospective", "Original editorial commentary", "Source and notes", "wcl-curated-2026-v3", "View match source", "Evidence and limitations", "Back to results"]) assert.ok(content.includes(expected),`${record.id}: ${expected}`);
    assert.ok(content.includes(record.sources[0].url.replaceAll("&","&amp;")),"Match-specific primary source");
    if(record.penaltyShootout) assert.ok(content.includes(`${record.penaltyShootout.home}–${record.penaltyShootout.away} on penalties`));
    else assert.ok(content.includes(record.afterExtraTime?"After extra time":"Full time"));
    assert.equal((content.match(/<h1\b/g)??[]).length,1);
    assert.ok(!content.includes("Stored questions")&&!content.includes("Fictional lab"));
  }));
  const dates=[...new Set(records.map(m=>m.eventDate))];
  for(let i=0;i<dates.length;i+=6) await Promise.all(dates.slice(i,i+6).map(async date=>{
    const result=await page(`/?mode=curated&date=${date}`);
    assert.equal(result.status,200);
    const content=markup(result.html);
    const actual=[...content.matchAll(/data-match-id="([^"]+)"/g)].map(m=>m[1]).sort();
    assert.deepEqual(actual,records.filter(m=>m.eventDate===date).map(m=>m.id).sort(),date);
  }));
  console.log("PASS all 104 detail pages, every event date, scores/shootouts, sources and editorial provenance");
  for(const [path,expected]of[
    ["/?date=2026-02-30","Invalid replay selection"],
    ["/?date=2026-07-20","Invalid replay selection"],
    ["/?date=2026-07-13","No matches for this selection"],
    ["/?date=all&q=NoSuchTeamEver","No matches for this selection"],
    ["/?date=all&stage=Invalid","Invalid replay selection"],
    ["/?date=all&team=fictional","Invalid replay selection"],
    ["/?date=all&page=99","Invalid replay selection"],
    ["/?date=all&stage=Final&page=2","Results page not found"],
    ["/matches/copper-tidal?mode=curated&date=2026-06-11","Match not found"],
  ]){const result=await page(path); assert.equal(result.status,200,path); assert.ok(markup(result.html).includes(expected),path);}
  ({html}=await page("/?date=all&stage=Quarter-final&team=england&q=Norway"));
  visible=markup(html);
  assert.ok(visible.includes("norway-england-2026-07-11"));
  assert.ok(!visible.includes('data-match-id="spain-argentina-2026-07-19"'));
  assert.ok(visible.includes("stage=Quarter-final&amp;team=england&amp;q=Norway"));
  ({html}=await page("/matches/spain-argentina-2026-07-19?mode=curated&date=2026-06-11"));
  assert.ok(markup(html).includes('data-match-id="spain-argentina-2026-07-19"') && markup(html).includes("19 July 2026"),"Canonical detail independent of return filters");
  console.log("PASS date/filter/search intersections, invalid/empty states and canonical detail navigation");
}

// Next.js may emit a meta redirect after streaming headers; both are documented redirects.
export function assertHistoricalRedirect(result) {
  if ([307,308].includes(result.status)) assert.equal(result.response.headers.get("location"),"/?mode=curated");
  else {
    assert.equal(result.status,200);
    assert.ok(/<meta[^>]*http-equiv="refresh"[^>]*content="\d+;url=\/\?mode=curated"/i.test(result.html),"Streamed response must contain the historical meta redirect");
  }
}
