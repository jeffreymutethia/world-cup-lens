import type { RetrievedChunk } from "@/lib/ai/retrieve-context";
import type { MatchLens } from "@/lib/types";

const MAX_SNIPPET_LENGTH = 180;

function buildSnippet(
  text: string,
  maxLength = MAX_SNIPPET_LENGTH,
) {
  const normalized = text
    .replace(/\s+/g, " ")
    .trim();

  if (normalized.length <= maxLength) {
    return normalized;
  }

  const candidate = normalized.slice(
    0,
    maxLength + 1,
  );

  const sentenceBoundary = Math.max(
    candidate.lastIndexOf(". "),
    candidate.lastIndexOf("? "),
    candidate.lastIndexOf("! "),
  );

  if (
    sentenceBoundary >=
    Math.floor(maxLength * 0.55)
  ) {
    return candidate
      .slice(0, sentenceBoundary + 1)
      .trim();
  }

  const wordBoundary =
    candidate.lastIndexOf(" ");

  if (wordBoundary > 0) {
    return `${candidate
      .slice(0, wordBoundary)
      .trim()}…`;
  }

  return `${normalized
    .slice(0, maxLength)
    .trim()}…`;
}

export function hydrateLensSources(
  lens: MatchLens,
  retrievedContext: RetrievedChunk[],
): MatchLens {
  const seenTitles = new Set<string>();

  const sources = retrievedContext.flatMap(
    (chunk) => {
      if (seenTitles.has(chunk.title)) {
        return [];
      }

      seenTitles.add(chunk.title);

      return [
        {
          title: chunk.title,
          snippet: buildSnippet(
            chunk.content,
          ),
        },
      ];
    },
  );

  return {
    ...lens,
    sources,
  };
}
