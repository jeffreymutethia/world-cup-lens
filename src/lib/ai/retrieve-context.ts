import "server-only";

import {
  createEmbedding,
} from "@/lib/ai/embeddings";
import {
  createAdminSupabaseClient,
} from "@/lib/supabase/admin";
import type {
  Match,
  Team,
  Venue,
} from "@/lib/types";

export type RetrievedChunk = {
  id: string;
  documentId: string;
  title: string;
  docType: string;
  content: string;
  sourceUrl: string | null;
  similarity: number;
};

type RetrievalRow = {
  id: string;
  document_id: string;
  title: string;
  doc_type: string;
  content: string;
  source_url: string | null;
  similarity: number;
};

type RetrieveMatchContextArgs = {
  match: Match;
  homeTeam: Team;
  awayTeam: Team;
  venue: Venue;
};

export async function retrieveMatchContext({
  match,
  homeTeam,
  awayTeam,
  venue,
}: RetrieveMatchContextArgs): Promise<
  RetrievedChunk[]
> {
  const query = [
    `World Cup match analysis for ${homeTeam.name} versus ${awayTeam.name}.`,
    `Group ${match.group}.`,
    `Venue: ${venue.name}, ${venue.city}.`,
    "Retrieve team playing profiles, tactical strengths, venue context, tournament rules, and uncertainty relevant to explaining the matchup.",
  ].join(" ");

  const queryEmbedding =
    await createEmbedding(query);

  const supabase =
    createAdminSupabaseClient();

  const { data, error } =
    await supabase.rpc(
      "match_document_chunks",
      {
        query_embedding:
          queryEmbedding,
        match_threshold: 0.15,
        match_count: 8,
        filter_team_ids: [
          homeTeam.id,
          awayTeam.id,
        ],
        filter_venue_id:
          venue.id,
        filter_match_id:
          match.id,
      },
    );

  if (error) {
    throw new Error(
      `Failed to retrieve match context: ${error.message}`,
    );
  }

  return (
    (data ?? []) as RetrievalRow[]
  ).map((row) => ({
    id: row.id,
    documentId:
      row.document_id,
    title: row.title,
    docType: row.doc_type,
    content: row.content,
    sourceUrl: row.source_url,
    similarity: row.similarity,
  }));
}
