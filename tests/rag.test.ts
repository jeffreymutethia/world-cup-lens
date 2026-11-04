import test from 'node:test';
import assert from 'node:assert/strict';
import { canonicalJson, cacheKey, safeMatchInput, validateEmbedding, validateEmbeddingBatch, EMBEDDING_DIMENSIONS, type Context, type Snapshot } from '../src/lib/rag/contract';
import { runVersionedLens, PersistenceFailure, validateFinalLens, type Dependencies, type GenerationEnvelope, type RunOptions } from '../src/lib/rag/engine';
import { providerDocumentId, documentCaptureTime, isCanonicalProviderProfile } from '../src/lib/rag/document-identity';
import { hydrateLensSources } from '../src/lib/ai/source-snippets';
import type { MatchLens } from '../src/lib/types';
const vector = [1, ...Array<number>(EMBEDDING_DIMENSIONS - 1).fill(0)];
const snapshot: Snapshot = { match: { id: 'synthetic-match', home_team_id: 'maple', away_team_id: 'harbor', venue_id: 'test-ground', kickoff_at: '2026-07-11T20:00:00Z', group_name: 'Quarter-final', known_at: '2026-07-01T00:00:00Z', knowledge_evidence: 'Fictional test schedule' }, home: { id: 'maple', name: 'Maple Eleven' }, away: { id: 'harbor', name: 'Harbor Eleven' }, venue: { id: 'test-ground', name: 'Test Ground', city: 'Fictional City', country: 'Fictional Country' } };
const context: Context = { id: '10000000-0000-4000-8000-000000000001', document_id: '00000000-0000-4000-8000-000000000001', document_version_id: '20000000-0000-4000-8000-000000000001', title: 'Maple synthetic profile', doc_type: 'team_profile', content: 'Maple Eleven is a fictional team. No measured performance data is available.', source_url: null, similarity: 1, content_hash: 'b'.repeat(64), input_hash: 'c'.repeat(64), dataset_version: 'synthetic-v1', source_identity: 'Original synthetic corpus', published_at: '2026-07-01T00:00:00.000000Z', captured_at: '2026-07-02T00:00:00.000000Z', availability_verified: true, embedding_model: 'synthetic-basis-1536', embedding_version: 'basis-v1' };
const lens: MatchLens = { headline: 'A fictional matchup for the integration corpus.', slightEdge: null, confidence: 'Low', volatility: 'Medium', expectedGame: 'The source provides no measured performance comparison.', whyItMatters: 'This original synthetic example tests the authoring pipeline safely.', likelyGameScript: 'The evidence does not establish how this fictional match will unfold.', teamEdges: [], whatToWatch: ['Source availability', 'Document identity', 'Cache versioning'], casualFanGuide: 'Read this as fictional commentary, not a historical football forecast.', uncertainty: ['No player data is supplied.', 'The scenario is entirely synthetic.'], sources: [] };
const options: RunOptions = { snapshot, inputFingerprint: 'a'.repeat(64), datasetVersion: 'synthetic-v1', model: 'deterministic-mock', generatorKind: 'mock', embeddingModel: 'synthetic-basis-1536', embeddingVersion: 'basis-v1' };
function harness(overrides: Partial<Dependencies> = {}) {
  const writes: GenerationEnvelope[] = [];
  let calls = 0;
  let prompt = '';
  const deps: Dependencies = { embed: async () => vector, retrieve: async () => [context], cached: async () => null, generate: async (p) => { calls++; prompt = p; return structuredClone(lens); }, proofread: async (value) => value, persist: async (value) => { writes.push(structuredClone(value)); }, now: () => '2026-11-04T12:00:00.000Z', newId: () => '30000000-0000-4000-8000-000000000001', ...overrides };
  return { deps, writes, calls: () => calls, prompt: () => prompt };
}
test('embedding contract rejects wrong dimensions, zero, NaN and Infinity', () => {
  assert.equal(validateEmbedding(vector), vector);
  for (const bad of [[], [1, 0], Array(1536).fill(0), [NaN, ...vector.slice(1)], [Infinity, ...vector.slice(1)]])
    assert.throws(() => validateEmbedding(bad));
});
test('canonical cache identity is stable across key order and rejects non-JSON', () => {
  assert.equal(cacheKey(canonicalJson({ b: 2, a: 1 })), cacheKey(canonicalJson({ a: 1, b: 2 })));
  for (const value of [undefined, NaN, { a: undefined }])
    assert.throws(() => canonicalJson(value));
});
test('successful mocked generation records immutable inputs, sources and real injected clock', async () => {
  const h = harness();
  const result = await runVersionedLens(options, h.deps);
  assert.equal(result.cached, false);
  assert.equal(h.calls(), 1);
  assert.equal(h.writes.length, 1);
  const run = h.writes[0];
  assert.equal(run.status, 'succeeded');
  assert.equal(run.startedAt, '2026-11-04T12:00:00.000Z');
  assert.equal(run.completedAt, run.startedAt);
  const identity = JSON.parse(run.identityCanonical);
  assert.equal(identity.generatorKind, 'mock');
  assert.equal(identity.perspective, 'retrospective');
  assert.equal(identity.context[0].document_version_id, context.document_version_id);
  assert.equal(identity.context[0].content, undefined);
  assert.deepEqual(result.lens.teamEdges, []);
  assert.equal(result.lens.sources[0].title, context.title);
  assert.ok(h.prompt().includes('NOT claim-level proof'));
  assert.ok(h.prompt().includes('never describe this as an authenticated pre-match forecast'));
  assert.ok(!h.prompt().includes('strength_attack'));
});
test('versioned cache hit avoids model and proofreading calls', async () => {
  const h = harness();
  const first = await runVersionedLens(options, h.deps);
  const hit = harness({ cached: async (key) => { assert.equal(key, first.cacheKey); return first.lens; }, proofread: async () => { throw new Error('Must not proofread cache'); } });
  const result = await runVersionedLens(options, hit.deps);
  assert.equal(result.cached, true);
  assert.equal(hit.calls(), 0);
  assert.equal(hit.writes.length, 0);
});
test('cache identity changes for source, dataset, input, model and embedding version changes', async () => {
  const base = await runVersionedLens(options, harness().deps);
  for (const changed of [{ ...options, datasetVersion: 'synthetic-v2' }, { ...options, inputFingerprint: 'd'.repeat(64) }, { ...options, model: 'mock-v2' }])
    assert.notEqual((await runVersionedLens(changed, harness().deps)).cacheKey, base.cacheKey);
  assert.notEqual((await runVersionedLens(options, harness({ retrieve: async () => [{ ...context, document_version_id: '20000000-0000-4000-8000-000000000002' }] }).deps)).cacheKey, base.cacheKey);
  assert.notEqual((await runVersionedLens({ ...options, embeddingVersion: 'basis-v2' }, harness({ retrieve: async () => [{ ...context, embedding_version: 'basis-v2' }] }).deps)).cacheKey, base.cacheKey);
});
test('empty context performs no generation and persists failed retrieval without fake generation timestamps', async () => {
  const h = harness({ retrieve: async () => [] });
  await assert.rejects(runVersionedLens(options, h.deps), /empty-context/);
  assert.equal(h.calls(), 0);
  assert.equal(h.writes[0].startedAt, null);
  assert.equal(h.writes[0].completedAt, null);
  assert.equal(h.writes[0].lens, null);
});
test('model and final transformation failures never write a successful cache', async () => {
  for (const override of [
    { generate: async () => { throw new Error('Private upstream detail'); } },
    { generate: async () => ({ ...lens, confidence: 'Certain' }) },
    { generate: async () => ({ ...lens, teamEdges: [{ label: 'Attack', homeValue: 50, awayValue: 50 }] }) },
    { generate: async () => ({ ...lens, slightEdge: 'Unknown Team' }) },
    { proofread: async () => ({ ...lens, headline: 'too short' }) },
    { proofread: async () => ({ ...lens, expectedGame: ' '.repeat(40) }) },
  ]) {
    const h = harness(override);
    await assert.rejects(runVersionedLens(options, h.deps));
    assert.equal(h.writes.length, 1);
    assert.equal(h.writes[0].status, 'failed');
    assert.equal(h.writes[0].lens, null);
    assert.ok(h.writes[0].completedAt);
  }
});
test('malformed source metadata and incompatible embeddings fail before generation', async () => {
  for (const value of [{ ...context, document_version_id: undefined }, { ...context, content_hash: 'bad' }, { ...context, embedding_version: 'wrong' }, { ...context, similarity: 0.01 }, { ...context, availability_verified: 'true' }]) {
    const h = harness({ retrieve: async () => [value] });
    await assert.rejects(runVersionedLens(options, h.deps));
    assert.equal(h.calls(), 0);
    assert.equal(h.writes.length, 0);
  }
});
test('malformed cached output fails closed without replacement generation', async () => {
  const h = harness({ cached: async () => ({ ...lens, sources: [], confidence: 'Certain' }) });
  await assert.rejects(runVersionedLens(options, h.deps));
  assert.equal(h.calls(), 0);
  assert.equal(h.writes.length, 0);
});
test('persistence failure retains a retry checkpoint without repeating model calls', async () => {
  const h = harness({ persist: async () => { throw new Error('Database failure'); } });
  let checkpoint: GenerationEnvelope | undefined;
  try {
    await runVersionedLens(options, h.deps);
    assert.fail('Expected persistence failure');
  }
  catch (error) {
    assert.ok(error instanceof PersistenceFailure);
    checkpoint = error.checkpoint;
  }
  assert.equal(checkpoint?.status, 'succeeded');
  assert.equal(h.calls(), 1);
  const recovered: GenerationEnvelope[] = [];
  await (async (envelope: GenerationEnvelope) => { recovered.push(envelope); })(checkpoint!);
  assert.equal(h.calls(), 1);
  assert.equal(recovered[0].id, checkpoint?.id);
});
test('as-of requires exact input attestation and excludes unknown or future availability', async () => {
  const cutoff = '2026-07-10T00:00:00Z';
  const attestation = { inputFingerprint: options.inputFingerprint, availableAt: '2026-07-02T00:00:00Z', evidence: 'Synthetic snapshot attestation only' };
  await assert.rejects(runVersionedLens({ ...options, historicalCutoff: cutoff }, harness().deps), /Unestablished/);
  for (const source of [{ ...context, availability_verified: false }, { ...context, published_at: null }, { ...context, captured_at: '2026-07-12T00:00:00Z' }, { ...context, source_identity: null }])
    await assert.rejects(runVersionedLens({ ...options, historicalCutoff: cutoff, inputAttestation: attestation }, harness({ retrieve: async () => [source] }).deps), /Unestablished/);
  await assert.rejects(runVersionedLens({ ...options, historicalCutoff: cutoff, inputAttestation: { ...attestation, inputFingerprint: 'f'.repeat(64) } }, harness().deps), /Unestablished/);
  const h = harness();
  await runVersionedLens({ ...options, historicalCutoff: cutoff, inputAttestation: attestation }, h.deps);
  assert.equal(JSON.parse(h.writes[0].identityCanonical).historicalCutoff, cutoff);
});
test('forecast allowlist excludes scores, summaries, strengths and current statuses', () => {
  const raw = { ...snapshot, match: { ...snapshot.match, home_score: 9, status_short: 'FT' }, home: { ...snapshot.home, summary: 'Future result', strengths: { attack: 50 } } };
  const safe = safeMatchInput(raw, null, '2026-11-04T12:00:00Z');
  const json = JSON.stringify(safe);
  for (const value of ['home_score', 'FT', 'Future result', 'attack'])
    assert.ok(!json.includes(value));
  assert.throws(() => safeMatchInput({ ...snapshot, match: { ...snapshot.match, kickoff_at: 'bad' } }, null, '2026-11-04T12:00:00Z'));
});
test('source hydration deduplicates documents, caps five excerpts and respects hard length limits', () => {
  const chunks = Array.from({ length: 8 }, (_, i) => ({ id: String(i), documentId: String(i), title: 'Synthetic source ' + i, docType: 'synthetic', content: 'x'.repeat(1000), sourceUrl: null, similarity: 1 }));
  const result = hydrateLensSources(lens, [chunks[0], ...chunks]);
  assert.equal(result.sources.length, 5);
  assert.ok(result.sources.every(s => s.snippet.length <= 180));
  validateFinalLens(result, snapshot.home.name, snapshot.away.name);
});
test('document identity and unchanged capture times make sync repeatable', () => {
  const id = providerDocumentId('team_profile', 'fictional');
  assert.equal(id, providerDocumentId('team_profile', 'fictional'));
  assert.notEqual(id, providerDocumentId('venue_profile', 'fictional'));
  assert.equal(documentCaptureTime({ body: 'same', captured_at: 'old' }, 'same', 'new'), 'old');
  assert.equal(documentCaptureTime({ body: 'old', captured_at: 'old' }, 'changed', 'new'), 'new');
});
test('mock embedding responses are ordered and reject duplicates, missing rows and malformed vectors', () => {
  assert.deepEqual(validateEmbeddingBatch([{ index: 1, embedding: vector }, { index: 0, embedding: vector }], 2), [vector, vector]);
  for (const rows of [[{ index: 0, embedding: vector }], [{ index: 0, embedding: vector }, { index: 0, embedding: vector }], [{ index: -1, embedding: vector }, { index: 1, embedding: vector }], [{ index: 0, embedding: [1, 0] }, { index: 1, embedding: vector }]])
    assert.throws(() => validateEmbeddingBatch(rows, 2));
});
test('browsing-independent synthetic generation core needs no network service', async () => {
  const original = globalThis.fetch;
  let requests = 0;
  globalThis.fetch = async () => { requests++; throw new Error('Network prohibited in deterministic test'); };
  try {
    await runVersionedLens(options, harness().deps);
    assert.equal(requests, 0);
  }
  finally {
    globalThis.fetch = original;
  }
});
test('provider sync cannot overwrite match-specific or mixed-scope profile documents', () => {
  const team = { doc_type: 'team_profile', team_id: 'maple', venue_id: null, match_id: null };
  assert.equal(isCanonicalProviderProfile(team), true);
  assert.equal(isCanonicalProviderProfile({ ...team, match_id: 'other-match' }), false);
  assert.equal(isCanonicalProviderProfile({ ...team, venue_id: 'test-ground' }), false);
  assert.equal(isCanonicalProviderProfile({ ...team, team_id: null }), false);
  const venue = { doc_type: 'venue_profile', team_id: null, venue_id: 'test-ground', match_id: null };
  assert.equal(isCanonicalProviderProfile(venue), true);
  assert.equal(isCanonicalProviderProfile({ ...venue, match_id: 'other-match' }), false);
  assert.equal(isCanonicalProviderProfile({ ...venue, team_id: 'maple' }), false);
});
test('successful persistence can return the first-winner cache output under a race', async () => {
  const winner = { ...lens, headline: 'The first successful cache attempt is retained.', sources: [{ title: context.title, snippet: context.content }] };
  const h = harness({ persist: async () => winner });
  const result = await runVersionedLens(options, h.deps);
  assert.equal(result.lens.headline, winner.headline);
});

test('embedding, retrieval and cache service failures stop before model or writes',async()=>{
 for(const override of [{embed:async()=>{throw new Error('Embedding failure');}},{retrieve:async()=>{throw new Error('Retrieval failure');}},{cached:async()=>{throw new Error('Cache read failure');}}]) {
  const h=harness(override);await assert.rejects(runVersionedLens(options,h.deps));assert.equal(h.calls(),0);assert.equal(h.writes.length,0);
 }
});
