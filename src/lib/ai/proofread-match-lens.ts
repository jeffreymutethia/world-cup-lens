import "server-only";

import { z } from "zod";
import { zodTextFormat } from "openai/helpers/zod";

import {
  createOpenAIClient,
} from "@/lib/ai/openai";
import type {
  MatchLens,
} from "@/lib/types";

const ProofreadLensSchema = z.object({
  headline: z.string(),
  expectedGame: z.string(),
  whyItMatters: z.string(),
  likelyGameScript: z.string(),
  whatToWatch: z.array(z.string()),
  casualFanGuide: z.string(),
  uncertainty: z.array(z.string()),
});

type ProofreadLensText =
  z.infer<typeof ProofreadLensSchema>;

function selectText(
  lens: MatchLens,
): ProofreadLensText {
  return {
    headline: lens.headline,
    expectedGame: lens.expectedGame,
    whyItMatters: lens.whyItMatters,
    likelyGameScript:
      lens.likelyGameScript,
    whatToWatch: lens.whatToWatch,
    casualFanGuide:
      lens.casualFanGuide,
    uncertainty: lens.uncertainty,
  };
}

export async function proofreadMatchLens(
  lens: MatchLens,
  model: string,
): Promise<MatchLens> {
  const openai = createOpenAIClient();

  const response =
    await openai.responses.parse({
      model,
      input: [
        {
          role: "system",
          content:
            "Proofread the supplied football analysis. Fix missing spaces, merged words, punctuation, and obvious grammar errors only. Preserve meaning, factual claims, uncertainty, sentence count, and list structure. Do not add new football information.",
        },
        {
          role: "user",
          content: JSON.stringify(
            selectText(lens),
            null,
            2,
          ),
        },
      ],
      text: {
        format: zodTextFormat(
          ProofreadLensSchema,
          "proofread_match_lens",
        ),
      },
    });

  if (!response.output_parsed) {
    throw new Error(
      "The proofreading model returned no parsed output.",
    );
  }

  const corrected =
    ProofreadLensSchema.parse(
      response.output_parsed,
    );

  if (
    corrected.whatToWatch.length !==
      lens.whatToWatch.length ||
    corrected.uncertainty.length !==
      lens.uncertainty.length
  ) {
    throw new Error(
      "Proofreading changed the generated list structure.",
    );
  }

  return {
    ...lens,
    ...corrected,

    // Never allow proofreading to alter
    // structured or numeric fields.
    slightEdge: lens.slightEdge,
    confidence: lens.confidence,
    volatility: lens.volatility,
    teamEdges: lens.teamEdges,

    // Sources are replaced deterministically
    // after proofreading.
    sources: lens.sources,
  };
}
