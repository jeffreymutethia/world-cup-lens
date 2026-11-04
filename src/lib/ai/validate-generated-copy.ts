import type { MatchLens } from "@/lib/types";

const suspiciousPatterns: RegExp[] = [
  /\basdecisive\b/i,
  /\bseeksustained\b/i,
  /\bcombinationsfor\b/i,
  /\bandpatient\b/i,
  /\bwilldefend\b/i,
  /\bshapeearly\b/i,
  /\btheexpected\b/i,
  /\bseekscontrol\b/i,
  /\bcardscould\b/i,
  /\bpunishwith\b/i,
  /\bcompactlyand\b/i,
  /\bandset\b/i,
];

function collectText(lens: MatchLens) {
  return [
    lens.headline,
    lens.expectedGame,
    lens.whyItMatters,
    lens.likelyGameScript,
    lens.casualFanGuide,
    ...lens.whatToWatch,
    ...lens.uncertainty,
    ...lens.sources.flatMap((source) => [
      source.title,
      source.snippet,
    ]),
  ];
}

export function validateGeneratedCopy(
  lens: MatchLens,
): MatchLens {
  for (const text of collectText(lens)) {
    const matchedPattern =
      suspiciousPatterns.find((pattern) =>
        pattern.test(text),
      );

    if (matchedPattern) {
      throw new Error(
        "Generated copy failed quality validation",
      );
    }
  }

  return lens;
}
