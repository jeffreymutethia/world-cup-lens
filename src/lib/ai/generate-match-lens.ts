import "server-only";

import { zodTextFormat } from "openai/helpers/zod";

import { createOpenAIClient } from "@/lib/ai/openai";
import { buildMatchLensPrompt } from "@/lib/ai/prompts";
import { MatchLensSchema } from "@/lib/ai/schemas";
import type {
  Team,
  Venue,
} from "@/lib/types";

type GenerateMatchLensArgs = {
  homeTeam: Team;
  awayTeam: Team;
  venue: Venue;
  group: string;
  kickoffAt: string;
};

export async function generateMatchLens(
  args: GenerateMatchLensArgs,
) {
  const openai = createOpenAIClient();

  const model =
    process.env.OPENAI_MATCH_LENS_MODEL ??
    "gpt-5-mini";

  const response =
    await openai.responses.parse({
      model,
      input: [
        {
          role: "system",
          content:
            "You are a careful football analyst and product copywriter. Use only supplied facts. Produce concise, polished, schema-compliant match intelligence. Never convert regional support into literal home advantage.",
        },
        {
          role: "user",
          content:
            buildMatchLensPrompt(args),
        },
      ],
      text: {
        format: zodTextFormat(
          MatchLensSchema,
          "world_cup_match_lens",
        ),
      },
    });

  if (!response.output_parsed) {
    throw new Error(
      "The model did not return a parsed Match Lens.",
    );
  }

  const lens = MatchLensSchema.parse(
    response.output_parsed,
  );

  return {
    lens,
    model,
  };
}
