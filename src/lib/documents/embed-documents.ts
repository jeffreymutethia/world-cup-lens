import "server-only";

import {
  chunkText,
} from "@/lib/ai/chunk-text";
import {
  createEmbeddings,
} from "@/lib/ai/embeddings";
import {
  createAdminSupabaseClient,
} from "@/lib/supabase/admin";

type DocumentRow = {
  id: string;
  title: string;
  doc_type: string;
  body: string;
  source_url: string | null;
  team_id: string | null;
  venue_id: string | null;
  match_id: string | null;
};

export type EmbedDocumentsResult = {
  documentsProcessed: number;
  chunksEmbedded: number;
  embeddingModel: string;
};

export async function embedDocuments(): Promise<EmbedDocumentsResult> {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("documents")
    .select(
      `
      id,
      title,
      doc_type,
      body,
      source_url,
      team_id,
      venue_id,
      match_id
      `,
    )
    .order("created_at");

  if (error) {
    throw new Error(`Failed to load documents: ${error.message}`);
  }

  const documents = (data ?? []) as DocumentRow[];
  let embeddedChunkCount = 0;

  for (const document of documents) {
    const chunks = chunkText(document.body);
    const embeddings = await createEmbeddings(
      chunks.map((chunk) => chunk.content),
    );
    const rows = chunks.map((chunk, index) => ({
      document_id: document.id,
      chunk_index: chunk.index,
      content: chunk.content,
      embedding: embeddings[index],
      metadata: {
        title: document.title,
        docType: document.doc_type,
        sourceUrl: document.source_url,
        teamId: document.team_id,
        venueId: document.venue_id,
        matchId: document.match_id,
      },
    }));

    const { error: deleteError } = await supabase
      .from("document_chunks")
      .delete()
      .eq("document_id", document.id);

    if (deleteError) {
      throw new Error(
        `Failed to clear chunks for ${document.title}: ${deleteError.message}`,
      );
    }

    if (rows.length > 0) {
      const { error: insertError } = await supabase
        .from("document_chunks")
        .insert(rows);

      if (insertError) {
        throw new Error(
          `Failed to insert chunks for ${document.title}: ${insertError.message}`,
        );
      }
    }

    embeddedChunkCount += rows.length;
  }

  return {
    documentsProcessed: documents.length,
    chunksEmbedded: embeddedChunkCount,
    embeddingModel:
      process.env.OPENAI_EMBEDDING_MODEL ?? "text-embedding-3-small",
  };
}
