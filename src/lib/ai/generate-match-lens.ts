import "server-only";

import { zodTextFormat } from "openai/helpers/zod";

import { createOpenAIClient } from "@/lib/ai/openai";
import { buildMatchLensPrompt } from "@/lib/ai/prompts";
import {
  retrieveMatchContext,
  type RetrievedChunk,
} from "@/lib/ai/retrieve-context";
import { MatchLensSchema } from "@/lib/ai/schemas";
import { hydrateLensSources } from "@/lib/ai/source-snippets";
import { proofreadMatchLens } from "@/lib/ai/proofread-match-lens";
import { normalizeGeneratedCopy } from "@/lib/ai/normalize-generated-copy";
import { validateGeneratedCopy } from "@/lib/ai/validate-generated-copy";
import type {
  Match,
  MatchLens,
  Team,
  Venue,
} from "@/lib/types";

type GenerateMatchLensArgs = {
  match: Match;
  homeTeam: Team;
  awayTeam: Team;
  venue: Venue;
  group: string;
  kickoffAt: string;
};

const MAX_GENERATION_ATTEMPTS = 2;

async function generateValidatedLens({
  args,
  retrievedContext,
  model,
}: {
  args: GenerateMatchLensArgs;
  retrievedContext: RetrievedChunk[];
  model: string;
}): Promise<MatchLens> {
  const openai = createOpenAIClient();

  let lastError: unknown;

  for (
    let attempt = 1;
    attempt <= MAX_GENERATION_ATTEMPTS;
    attempt += 1
  ) {
    try {
      const response = await openai.responses.parse({
        model,
        input: [
          {
            role: "system",
            content:
              "You are a careful football analyst and product copywriter. Use only supplied facts and retrieved source context. Produce concise, polished, schema-compliant match intelligence. Never convert regional support into literal home advantage. Proofread every field before responding and ensure words are separated correctly.",
          },
          {
            role: "user",
            content: buildMatchLensPrompt({
              homeTeam: args.homeTeam,
              awayTeam: args.awayTeam,
              venue: args.venue,
              group: args.group,
              kickoffAt: args.kickoffAt,
              retrievedContext,
            }),
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

      const parsedLens = MatchLensSchema.parse(
        response.output_parsed,
      );

      const proofreadLens =
        await proofreadMatchLens(
          parsedLens,
          model,
        );

      const lens = validateGeneratedCopy(
        normalizeGeneratedCopy(
          hydrateLensSources(
            proofreadLens,
            retrievedContext,
          ),
        ),
      );

      if (lens.sources.length === 0) {
        throw new Error(
          "The generated Match Lens did not reference any retrieved sources.",
        );
      }

      return lens;
    } catch (error) {
      lastError = error;

      console.warn(
        `[generate-match-lens] attempt ${attempt} failed:`,
        error instanceof Error
          ? error.message
          : error,
      );
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error(
        "Match Lens generation failed after retrying.",
      );
}

export async function generateMatchLens(
  args: GenerateMatchLensArgs,
) {
  const model =
    process.env.OPENAI_MATCH_LENS_MODEL ??
    "gpt-5-mini";

  const retrievedContext =
    await retrieveMatchContext({
      match: args.match,
      homeTeam: args.homeTeam,
      awayTeam: args.awayTeam,
      venue: args.venue,
    });

  if (retrievedContext.length === 0) {
    throw new Error(
      "No relevant source context was retrieved for this match.",
    );
  }

  const lens = await generateValidatedLens({
    args,
    retrievedContext,
    model,
  });

  return {
    lens,
    model,
    retrievedSources:
      retrievedContext.map((chunk) => ({
        title: chunk.title,
        docType: chunk.docType,
        similarity: chunk.similarity,
      })),
  };
}
