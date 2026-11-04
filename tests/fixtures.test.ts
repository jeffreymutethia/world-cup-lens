import test from 'node:test';
import assert from 'node:assert/strict';
import {canonicalFixtureStatus,normalizeApiFootballFixture} from '../src/lib/fixtures/normalize';
import type {ApiFootballFixtureResponse} from '../src/lib/fixtures/api-football';

// Original synthetic input conforming to the provider type; no provider response was copied.
function fixture(status:string):ApiFootballFixtureResponse {
  const score={home:null,away:null};
  return {
    fixture:{id:9001,referee:null,timezone:'UTC',date:'2026-07-11T20:00:00Z',timestamp:1783800000,venue:{id:9001,name:'Fictional Test Ground',city:'Fictional City'},status:{short:status,long:'Synthetic status',elapsed:null}},
    league:{id:9001,name:'Fictional Test Cup',country:'World',logo:null,flag:null,season:2026,round:'Quarter-final',standings:false},
    teams:{home:{id:9001,name:'Synthetic Home',logo:null,winner:null},away:{id:9002,name:'Synthetic Away',logo:null,winner:null}},
    goals:score,score:{halftime:score,fulltime:score,extratime:score,penalty:score},
  };
}
test('provider statuses map to canonical categories instead of always scheduled',()=>{
  for(const [category,statuses] of Object.entries({scheduled:['TBD','NS'],live:['1H','HT','2H','ET','BT','P','SUSP','INT','LIVE'],finished:['FT','AET','PEN'],postponed:['PST'],cancelled:['CANC']})) {
    for(const status of statuses) {
      assert.equal(canonicalFixtureStatus(status),category);
      const normalized=normalizeApiFootballFixture(fixture(status));
      assert.equal(normalized.match.status,category);assert.equal(normalized.match.status_short,status);
    }
  }
});
test('unsupported and ambiguous provider statuses fail normalization before a write batch',()=>{
  for(const status of ['','unknown','ft','ABD','AWD','WO']) assert.throws(()=>normalizeApiFootballFixture(fixture(status)),/normalization policy required/);
});
test('competition country never masquerades as venue country and unknown metrics stay null',()=>{
  const normalized=normalizeApiFootballFixture(fixture('AET'));
  assert.equal(normalized.venue.country,'Unknown');assert.equal(normalized.match.group,'Quarter-final');
  assert.ok(Object.values(normalized.homeTeam.strengths).every(n=>n===null));
  assert.ok(Object.values(normalized.awayTeam.strengths).every(n=>n===null));
  assert.equal(normalized.match.home_score,null);assert.equal(normalized.match.away_score,null);
});

test('removing the unused CLI preserves its exact licensed CSS body',async()=>{
  const {readFileSync}=await import('node:fs');const {createHash}=await import('node:crypto');
  const css=readFileSync('src/app/shadcn-base.css','utf8');
  assert.ok(css.includes('Copyright (c) 2023 shadcn') && css.includes('Permission is hereby granted'));
  const body=css.slice(css.indexOf('*/\n')+3);
  assert.equal(createHash('sha256').update(body).digest('hex'),'146941ac3ff65496fdf1cb306e697255328e4dadc7c105d66e36bb031b00f6d6');
  assert.ok(readFileSync('src/app/globals.css','utf8').includes('@import "./shadcn-base.css"'));
  assert.equal(Object.hasOwn(JSON.parse(readFileSync('package.json','utf8')).dependencies,'shadcn'),false);
});

