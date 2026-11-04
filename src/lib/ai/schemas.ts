import { z } from "zod";

export const TeamEdgeLabelSchema = z.enum([
  "Attack",
  "Midfield Control",
  "Defense",
  "Transitions",
]);

export const MatchLensSchema = z.strictObject({
  headline: z
    .string()
    .min(12)
    .max(180),

  slightEdge: z
    .string()
    .min(1)
    .max(40)
    .nullable(),

  confidence: z.enum([
    "Low",
    "Medium",
    "High",
  ]),

  volatility: z.enum([
    "Low",
    "Medium",
    "High",
  ]),

  expectedGame: z
    .string()
    .min(20)
    .max(300),

  whyItMatters: z
    .string()
    .min(30)
    .max(500),

  likelyGameScript: z
    .string()
    .min(30)
    .max(500),

  teamEdges: z
    .array(
      z.strictObject({
        label: TeamEdgeLabelSchema,
        homeValue: z
          .number()
          .int()
          .min(0)
          .max(100),
        awayValue: z
          .number()
          .int()
          .min(0)
          .max(100),
      }),
    )
    .length(0),

  whatToWatch: z
    .array(
      z.string().min(8).max(120),
    )
    .min(3)
    .max(5),

  casualFanGuide: z
    .string()
    .min(30)
    .max(500),

  uncertainty: z
    .array(
      z.string().min(15).max(160),
    )
    .min(2)
    .max(4),

  sources: z
    .array(
      z.strictObject({
        title: z
          .string()
          .min(4)
          .max(100),
        snippet: z
          .string()
          .min(15)
          .max(180),
      }),
    )
    .min(0)
    .max(5),
});

export type GeneratedMatchLens =
  z.infer<typeof MatchLensSchema>;
