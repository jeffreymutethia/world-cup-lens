import "server-only";

import { EMBEDDING_MODEL, validateEmbedding, validateEmbeddingBatch } from "@/lib/rag/contract";
import { createOpenAIClient } from "@/lib/ai/openai";

export async function createEmbedding(
  text: string,
): Promise<number[]> {
  const model =
    process.env.OPENAI_EMBEDDING_MODEL ??
    EMBEDDING_MODEL;
  if (model !== EMBEDDING_MODEL) throw new Error("Unsupported embedding model for contract v1");
  const openai = createOpenAIClient();

  const response =
    await openai.embeddings.create({
      model,
      input: text,
      encoding_format: "float",
    });

  const embedding =
    response.data[0]?.embedding;

  if (!embedding) {
    throw new Error(
      "OpenAI did not return an embedding.",
    );
  }

  return validateEmbedding(embedding);
}

export async function createEmbeddings(
  texts: string[],
): Promise<number[][]> {
  if (texts.length === 0) {
    return [];
  }

  const model =
    process.env.OPENAI_EMBEDDING_MODEL ??
    EMBEDDING_MODEL;
  if (model !== EMBEDDING_MODEL) throw new Error("Unsupported embedding model for contract v1");
  const openai = createOpenAIClient();

  const response =
    await openai.embeddings.create({
      model,
      input: texts,
      encoding_format: "float",
    });

  return validateEmbeddingBatch(response.data,texts.length);
}
