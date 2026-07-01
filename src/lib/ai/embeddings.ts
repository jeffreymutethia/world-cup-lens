import "server-only";

import { createOpenAIClient } from "@/lib/ai/openai";

export async function createEmbedding(
  text: string,
): Promise<number[]> {
  const openai = createOpenAIClient();

  const model =
    process.env.OPENAI_EMBEDDING_MODEL ??
    "text-embedding-3-small";

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

  return embedding;
}

export async function createEmbeddings(
  texts: string[],
): Promise<number[][]> {
  if (texts.length === 0) {
    return [];
  }

  const openai = createOpenAIClient();

  const model =
    process.env.OPENAI_EMBEDDING_MODEL ??
    "text-embedding-3-small";

  const response =
    await openai.embeddings.create({
      model,
      input: texts,
      encoding_format: "float",
    });

  const ordered = [...response.data]
    .sort((a, b) => a.index - b.index)
    .map((item) => item.embedding);

  if (ordered.length !== texts.length) {
    throw new Error(
      "Embedding response count did not match input count.",
    );
  }

  return ordered;
}
