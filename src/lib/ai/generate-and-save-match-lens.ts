import 'server-only';
import { z } from 'zod';
import { AuthoringMatchNotFoundError } from '@/lib/rag/errors';
import { generateStructuredLens } from '@/lib/ai/generate-match-lens';
import { proofreadMatchLens } from '@/lib/ai/proofread-match-lens';
import { retrieveVersionedContext } from '@/lib/ai/retrieve-context';
import { createEmbedding } from '@/lib/ai/embeddings';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import { runVersionedLens, type ProviderTrace } from '@/lib/rag/engine';
import { EMBEDDING_MODEL, EMBEDDING_VERSION, SnapshotSchema, cacheKey } from '@/lib/rag/contract';
export async function generateAndSaveMatchLens(viewModel: {
  match: {
    id: string;
  };
}) {
  const db = createAdminSupabaseClient();
  const { data: contract, error: contractError } = await db.rpc('backend_contract_version');
  if (contractError || contract !== 1)
    throw new Error('Backend contract v1 required; no model request made');
  const datasetVersion = process.env.WCL_AUTHORING_DATASET_VERSION?.trim();
  if (!datasetVersion)
    throw new Error('Explicit authoring dataset version required');
  const { data, error } = await db.rpc('get_authoring_input', { p_match_id: viewModel.match.id });
  if (error) throw new Error('Authoring match input unavailable');
  if (!data) throw new AuthoringMatchNotFoundError();
  const snapshot = SnapshotSchema.parse(data.snapshot);
  const fingerprint = z.string().regex(/^[a-f0-9]{64}$/).parse(data.fingerprint);
  const model = process.env.OPENAI_MATCH_LENS_MODEL ?? 'gpt-5-mini';
  const cached = async (key: string) => {
    const { data, error } = await db.rpc('get_cached_lens', { p_cache_key: key });
    if (error)
      throw new Error('Versioned cache lookup failed');
    return data ?? null;
  };
  const trace: ProviderTrace[] = [];
  const result = await runVersionedLens({ snapshot, inputFingerprint: fingerprint, datasetVersion, model, generatorKind: 'model', embeddingModel: EMBEDDING_MODEL, embeddingVersion: EMBEDDING_VERSION }, {
    embed: createEmbedding,
    retrieve: (embedding, cutoff) => retrieveVersionedContext(embedding, { teamIds: [snapshot.home.id, snapshot.away.id], venueId: snapshot.venue.id, matchId: snapshot.match.id }, cutoff),
    cached,
    generate: async (prompt) => { const result = await generateStructuredLens(prompt, model); trace.push(result.trace); return result.lens; },
    proofread: lens => proofreadMatchLens(lens, model, item => trace.push(item)),
    trace: () => trace,
    persist: async (envelope) => {
      const { error } = await db.rpc('commit_lens_generation', { p_payload: envelope });
      if (error)
        throw new Error('Versioned generation persistence failed');
      if (envelope.status === 'succeeded') {
        const winner = await cached(cacheKey(envelope.identityCanonical));
        if (winner === null)
          throw new Error('Cache confirmation failed');
        return winner;
      }
    },
  });
  return { ...result, model };
}
