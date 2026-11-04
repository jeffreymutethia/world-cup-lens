import 'server-only';
import { chunkText } from '@/lib/ai/chunk-text';
import { createEmbeddings } from '@/lib/ai/embeddings';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import { requireAuthoringContract } from '@/lib/supabase/authoring';
import { EMBEDDING_MODEL, EMBEDDING_VERSION, CHUNKER_VERSION } from '@/lib/rag/contract';
export type EmbedDocumentsResult = {
  documentsProcessed: number;
  chunksEmbedded: number;
  embeddingModel: string;
};
export async function embedDocuments(): Promise<EmbedDocumentsResult> {
  await requireAuthoringContract();
  const db = createAdminSupabaseClient();
  const { data, error } = await db.rpc('pending_embedding_documents', { p_model: EMBEDDING_MODEL, p_version: EMBEDDING_VERSION, p_chunker: CHUNKER_VERSION });
  if (error)
    throw new Error('Pending document lookup failed');
  const documents = (data ?? []) as {
    id: string;
    input_hash: string;
    body: string;
  }[];
  let count = 0;
  for (const doc of documents) {
    const chunks = chunkText(doc.body);
    if (chunks.length === 0)
      throw new Error('Document contains no embeddable text');
    const started = new Date().toISOString();
    const embeddings = await createEmbeddings(chunks.map(c => c.content));
    const completed = new Date().toISOString();
    const { error } = await db.rpc('store_document_revision', { p_document_id: doc.id, p_expected_hash: doc.input_hash, p_model: EMBEDDING_MODEL, p_version: EMBEDDING_VERSION, p_origin: 'model', p_chunker: CHUNKER_VERSION, p_started: started, p_completed: completed, p_chunks: chunks.map((c, i) => ({ content: c.content, embedding: embeddings[i], metadata: { chunkerVersion: CHUNKER_VERSION } })) });
    if (error)
      throw new Error('Document revision persistence failed');
    count += chunks.length;
  }
  return { documentsProcessed: documents.length, chunksEmbedded: count, embeddingModel: EMBEDDING_MODEL };
}
