export type TextChunk = {
  index: number;
  content: string;
};

const DEFAULT_MAX_CHARACTERS = 1_200;
const DEFAULT_OVERLAP_CHARACTERS = 180;

export function chunkText(
  text: string,
  maxCharacters = DEFAULT_MAX_CHARACTERS,
  overlapCharacters = DEFAULT_OVERLAP_CHARACTERS,
): TextChunk[] {
  const normalized = text
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+/g, " ")
    .trim();

  if (!normalized) {
    return [];
  }

  if (normalized.length <= maxCharacters) {
    return [
      {
        index: 0,
        content: normalized,
      },
    ];
  }

  const chunks: TextChunk[] = [];
  let start = 0;

  while (start < normalized.length) {
    let end = Math.min(
      start + maxCharacters,
      normalized.length,
    );

    if (end < normalized.length) {
      const paragraphBreak =
        normalized.lastIndexOf("\n", end);

      const sentenceBreak =
        normalized.lastIndexOf(". ", end);

      const preferredBreak = Math.max(
        paragraphBreak,
        sentenceBreak,
      );

      if (
        preferredBreak >
        start + Math.floor(maxCharacters * 0.6)
      ) {
        end = preferredBreak + 1;
      }
    }

    const content = normalized
      .slice(start, end)
      .trim();

    if (content) {
      chunks.push({
        index: chunks.length,
        content,
      });
    }

    if (end >= normalized.length) {
      break;
    }

    start = Math.max(
      end - overlapCharacters,
      start + 1,
    );
  }

  return chunks;
}
