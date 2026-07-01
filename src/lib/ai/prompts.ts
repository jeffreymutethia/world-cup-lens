import type {
  RetrievedChunk,
} from "@/lib/ai/retrieve-context";
import type {
  Team,
  Venue,
} from "@/lib/types";

type BuildMatchLensPromptArgs = {
  homeTeam: Team;
  awayTeam: Team;
  venue: Venue;
  group: string;
  kickoffAt: string;
  retrievedContext: RetrievedChunk[];
};

export function buildMatchLensPrompt({
  homeTeam,
  awayTeam,
  venue,
  group,
  kickoffAt,
  retrievedContext,
}: BuildMatchLensPromptArgs) {
  const contextBlock = retrievedContext
    .map(
      (chunk, index) => `
SOURCE ${index + 1}
Title: ${chunk.title}
Type: ${chunk.docType}
Content:
${chunk.content}
`.trim(),
    )
    .join("\n\n");

  return `
Create a concise World Cup Match Lens for the supplied match.

Use only the information provided below.

Do not invent:
- injuries
- squad selections
- starting lineups
- recent results
- player availability
- betting odds
- exact win probabilities
- individual players
- literal home advantage unless the team is playing in its own country

OUTPUT REQUIREMENTS

1. headline
Write a useful editorial insight about the matchup.
Do not merely repeat the team names or say "Match Intelligence Brief."

2. slightEdge
Return exactly one of:
- "${homeTeam.name}"
- "${awayTeam.name}"
- null

Do not include reasoning in slightEdge.

3. confidence and volatility
Use only Low, Medium, or High.

4. teamEdges
Return exactly four entries in this exact order:
- Attack
- Midfield Control
- Defense
- Transitions

Use these supplied values exactly:

${homeTeam.name}
- Attack: ${homeTeam.strengths.attack}
- Midfield Control: ${homeTeam.strengths.midfield}
- Defense: ${homeTeam.strengths.defense}
- Transitions: ${homeTeam.strengths.transitions}

${awayTeam.name}
- Attack: ${awayTeam.strengths.attack}
- Midfield Control: ${awayTeam.strengths.midfield}
- Defense: ${awayTeam.strengths.defense}
- Transitions: ${awayTeam.strengths.transitions}

5. prose quality
- Use clean professional English.
- Keep every field concise.
- Every prose field must end with a complete sentence.
- Prefer shorter complete sentences over using the full character allowance.
- Never end a field with an unfinished clause, dangling conjunction, or partial word.
- Do not concatenate words accidentally.
- Avoid generic filler.
- Clearly acknowledge uncertainty.
- Do not overstate conclusions.

6. sources
- Sources are attached by the application after generation.
- Do not use source snippets as a place to add analysis.
- Return schema-compliant placeholder source entries only if the schema requires them.
- Source titles and snippets will be discarded and replaced deterministically.

MATCH

${homeTeam.name} vs ${awayTeam.name}
Group ${group}
Kickoff: ${kickoffAt}

HOME TEAM

${JSON.stringify(homeTeam, null, 2)}

AWAY TEAM

${JSON.stringify(awayTeam, null, 2)}

VENUE

${JSON.stringify(venue, null, 2)}

RETRIEVED SOURCE CONTEXT

${contextBlock}

GROUNDING RULES

- Use the retrieved source context when making descriptive claims.
- Do not cite a source that is not present in the retrieved context.
- Source titles in the output must match retrieved source titles exactly.
- If the retrieved context does not support a claim, omit the claim.
`.trim();
}
