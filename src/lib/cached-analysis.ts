import type { PublicMatchLens, MatchQuestionAnswer } from "./types";

type RecordValue = Record<string, unknown>;
function record(value: unknown): value is RecordValue {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}
function strings(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}
function sources(value: unknown): boolean {
  return Array.isArray(value) && value.every((item) => record(item) &&
    typeof item.title === "string" && typeof item.snippet === "string");
}

// Validate display compatibility, not current generation-length requirements:
// older cached prose can remain useful, but missing arrays must never crash rendering.
export function isCachedLens(value: unknown): value is PublicMatchLens {
  if (!record(value)) return false;
  const textFields = ["headline", "expectedGame", "whyItMatters", "likelyGameScript", "casualFanGuide"];
  // teamEdges is excluded from PublicMatchLens: absent or malformed hidden
  // legacy metrics must not make otherwise readable qualitative copy disappear.
  return textFields.every((key) => typeof value[key] === "string") &&
    (value.slightEdge === null || typeof value.slightEdge === "string") &&
    typeof value.confidence === "string" && ["Low", "Medium", "High"].includes(value.confidence) &&
    typeof value.volatility === "string" && ["Low", "Medium", "High"].includes(value.volatility) &&
    strings(value.whatToWatch) && strings(value.uncertainty) && sources(value.sources);
}

export function isCachedAnswer(value: unknown): value is MatchQuestionAnswer {
  return record(value) &&
    typeof value.key === "string" && ["explain-casually", "tactical-edge", "what-could-go-wrong"].includes(value.key) &&
    ["question", "shortLabel", "answer"].every((key) => typeof value[key] === "string") &&
    (value.bullets === undefined || strings(value.bullets)) && sources(value.sources);
}
