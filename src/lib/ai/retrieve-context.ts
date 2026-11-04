import 'server-only';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import { EMBEDDING_MODEL, EMBEDDING_VERSION, validateEmbedding } from '@/lib/rag/contract';
// Display excerpts only; these are not claim-level citations.
export type RetrievedChunk = {
  id: string;
  documentId: string;
  title: string;
  docType: string;
  content: string;
  sourceUrl: string | null;
  similarity: number;
};
export async function retrieveVersionedContext(embedding: number[], scope: {
  teamIds: string[];
  venueId: string;
  matchId: string;
}, cutoff: string | null) {
  const { data, error } = await createAdminSupabaseClient().rpc('match_document_chunks', {
    query_embedding: validateEmbedding(embedding), match_threshold: 0.15, match_count: 8,
    filter_team_ids: scope.teamIds, filter_venue_id: scope.venueId, filter_match_id: scope.matchId, historical_cutoff: cutoff,
    filter_embedding_model: EMBEDDING_MODEL, filter_embedding_version: EMBEDDING_VERSION,
  });
  if (error)
    throw new Error('Context retrieval failed');
  return data ?? [];
}
