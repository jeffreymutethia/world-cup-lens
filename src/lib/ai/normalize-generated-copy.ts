import type { MatchLens } from "@/lib/types";

const observedSpacingRepairs: ReadonlyArray<
  readonly [RegExp, string]
> = [
  [/\basdecisive\b/gi, "as decisive"],
];

function normalizeText(text: string) {
  return observedSpacingRepairs
    .reduce(
      (result, [pattern, replacement]) =>
        result.replace(pattern, replacement),
      text,
    )
    .replace(/\s+/g, " ")
    .trim();
}

export function normalizeGeneratedCopy(
  lens: MatchLens,
): MatchLens {
  return {
    ...lens,
    headline: normalizeText(lens.headline),
    expectedGame: normalizeText(lens.expectedGame),
    whyItMatters: normalizeText(lens.whyItMatters),
    likelyGameScript: normalizeText(lens.likelyGameScript),
    casualFanGuide: normalizeText(lens.casualFanGuide),
    whatToWatch: lens.whatToWatch.map(normalizeText),
    uncertainty: lens.uncertainty.map(normalizeText),
    sources: lens.sources.map((source) => ({
      title: normalizeText(source.title),
      snippet: normalizeText(source.snippet),
    })),
  };
}
