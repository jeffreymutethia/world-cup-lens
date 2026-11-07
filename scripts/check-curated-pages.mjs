import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const records = JSON.parse(readFileSync(new URL("../src/data/curated-records.json",import.meta.url),"utf8"));
const extended = JSON.parse(readFileSync(new URL("../src/data/curated-lenses.json",import.meta.url),"utf8"));
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
    for(const expected of [record.homeTeam,record.awayTeam,`${record.finalScore.home}–${record.finalScore.away}`,record.stage,record.venue,extended[record.id] ? "Match analysis" : "Match context", "Retrospective", "Original editorial commentary", "Source and notes", "wcl-curated-2026-v3", "View match source", "Evidence and limitations", "Back to results"]) assert.ok(content.includes(expected),`${record.id}: ${expected}`);
    assert.ok(content.includes(record.sources[0].url.replaceAll("&","&amp;")),"Match-specific primary source");
    if(record.penaltyShootout) assert.ok(content.includes(`${record.penaltyShootout.home}–${record.penaltyShootout.away} on penalties`));
    else assert.ok(content.includes(record.afterExtraTime?"After extra time":"Full time"));
    assert.equal((content.match(/<h1\b/g)??[]).length,1);
    assert.ok(content.includes(`<title>${record.homeTeam} ${record.finalScore.home}–${record.finalScore.away} ${record.awayTeam} | World Cup Lens</title>`),"Match-specific title");
    const canonical=`https://world-cup-lens-one.vercel.app/matches/${record.id}?mode=curated&amp;date=${record.eventDate}`;
    assert.ok(content.includes(`rel="canonical" href="${canonical}"`));
    assert.ok(content.includes(`property="og:url" content="${canonical}"`));
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
  ]){const result=await page(path); assert.equal(result.status,200,path); assert.ok(markup(result.html).includes(expected),path);}
  ({html}=await page("/?date=all&stage=Quarter-final&team=england&q=Norway"));
  visible=markup(html);
  assert.ok(visible.includes("norway-england-2026-07-11"));
  assert.ok(!visible.includes('data-match-id="spain-argentina-2026-07-19"'));
  assert.ok(visible.includes("returnStage=Quarter-final&amp;returnTeam=england&amp;returnQ=Norway"));
  const missing = await page("/matches/copper-tidal?mode=curated&date=2026-06-11");
  assert.equal(missing.status,404);
  assert.ok(missing.html.includes("Match not found") || missing.html.includes('name="next-error" content="not-found"'),"Native not-found response; initial HTML may be a framework error shell");
  assert.ok(missing.html.includes('name="robots" content="noindex"'));
  const oldLink = await page("/matches/spain-argentina-2026-07-19?mode=curated&date=2026-06-11",{redirect:"manual"});
  assert.ok([307,308].includes(oldLink.status));
  const destination=new URL(oldLink.response.headers.get("location"),"https://example.test");
  assert.equal(destination.searchParams.get("date"),"2026-07-19");
  assert.equal(destination.searchParams.get("returnDate"),"2026-06-11");
  const canonical = await page("/matches/spain-argentina-2026-07-19?mode=curated&date=2026-07-19&returnDate=2026-06-11");
  assert.equal(canonical.status,200); assert.ok(markup(canonical.html).includes("19 July 2026"));
  assert.ok(markup(canonical.html).includes('href="/?mode=curated&amp;date=2026-06-11"'));
  await checkMatchNavigationAndMetadata(page);
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

export async function checkMatchNavigationAndMetadata(page) {
  const origin = "mode=curated&date=all&stage=Quarter-final&team=england&q=Norway&page=1";
  const path = "/matches/norway-england-2026-07-11?mode=curated&date=2026-07-11&returnDate=all&returnStage=Quarter-final&returnTeam=england&returnQ=Norway&returnPage=1";
  const first=await page(path);assert.equal(first.status,200);
  const rendered=markup(first.html);
  assert.ok(rendered.includes(`href="/?${origin.replaceAll("&","&amp;")}"`));
  const target=rendered.match(/href="([^"]*england-argentina-2026-07-15[^"]*)"/)?.[1]?.replaceAll("&amp;","&");
  assert.ok(target);const targetUrl=new URL(target,"https://example.test");
  assert.equal(targetUrl.searchParams.get("date"),"2026-07-15");assert.equal(targetUrl.searchParams.get("returnDate"),"all");
  const second=await page(target);assert.equal(second.status,200);const next=markup(second.html);
  assert.ok(next.includes("15 July 2026"));assert.ok(next.includes(`href="/?${origin.replaceAll("&","&amp;")}"`));
  assert.ok(next.includes('<title>England 1–2 Argentina | World Cup Lens</title>'));
  const canonical="https://world-cup-lens-one.vercel.app/matches/england-argentina-2026-07-15?mode=curated&amp;date=2026-07-15";
  assert.ok(next.includes(`rel="canonical" href="${canonical}"`));assert.ok(next.includes(`property="og:url" content="${canonical}"`));
  assert.ok(next.includes('property="og:title" content="England 1–2 Argentina | World Cup Lens"'));
  const privatePage=await page('/matches/private-metadata-marker?mode=archive');
  assert.ok(privatePage.html.includes('<title>Match unavailable | World Cup Lens</title>'));
  assert.ok(!/<title>[^<]*private-metadata-marker/.test(privatePage.html));
  const invalid=await page('/matches/norway-england-2026-07-11?mode=curated&date=2026-07-11&returnDate=bad');
  assert.equal(invalid.status,200);assert.ok(markup(invalid.html).includes('Invalid return selection'));
  console.log('PASS cross-date canonical navigation, separate return filters,404/noindex and private-safe match metadata');
}
