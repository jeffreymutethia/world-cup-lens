import test from "node:test";
import assert from "node:assert/strict";
import { curatedMatches } from "../src/data/curated-history";
import { historicalMatchMetadata, PUBLIC_SITE_ORIGIN } from "../src/lib/match-metadata";
import { curatedCanonicalPath } from "../src/lib/curated-history";

test("all104 public matches have distinct factual metadata and return-free canonical/OG URLs",()=>{
  const titles=new Set();
  for(const match of curatedMatches){
    const metadata=historicalMatchMetadata(match.id,{mode:"curated",date:match.eventDate,returnDate:"all",returnQ:"private search"});
    titles.add(metadata.title);assert.ok(String(metadata.title).includes(match.homeTeam));assert.ok(String(metadata.title).includes(match.awayTeam));
    assert.ok(metadata.description?.includes(match.venue));assert.ok(metadata.description?.includes("unofficial"));
    const canonical=PUBLIC_SITE_ORIGIN+curatedCanonicalPath(match);
    assert.equal(metadata.alternates?.canonical,canonical);
    assert.equal((metadata.openGraph as {url:string}).url,canonical);
    assert.ok(!JSON.stringify(metadata).includes("private search"));
  }
  assert.equal(titles.size,104);
});
test("metadata never exposes private IDs or cached prose and never authenticates a forecast",()=>{
  for(const deployment of ["demo-only","archive-enabled"]as const)for(const params of [{mode:"archive"},{mode:"invalid"},{date:"2026-02-30"},{mode:"curated",returnDate:"bad"},{mode:["curated","archive"]}]){
    const meta=historicalMatchMetadata("private-provider-secret-id",params,deployment);const text=JSON.stringify(meta);
    assert.ok(!text.includes("private-provider-secret-id"));assert.equal((meta.robots as {index:boolean}).index,false);assert.equal(meta.alternates?.canonical,null);assert.equal(meta.openGraph,null);
  }
  const unknown=historicalMatchMetadata("missing",{mode:"curated"});assert.equal((unknown.robots as {index:boolean}).index,false);
});
test("metadata uses canonical event dates even on valid legacy cross-date links",()=>{
  const meta=historicalMatchMetadata("spain-argentina-2026-07-19",{mode:"curated",date:"2026-06-11"});
  assert.ok(meta.description?.includes("19 July 2026"));assert.ok(meta.description?.includes("after extra time"));assert.ok(!String(meta.alternates?.canonical).includes("2026-06-11"));
  const shootout=historicalMatchMetadata("netherlands-morocco-2026-06-29",{mode:"curated"});assert.ok(shootout.description?.includes("shootout 2–3"));
});
