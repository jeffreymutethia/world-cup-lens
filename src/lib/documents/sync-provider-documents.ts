import "server-only";

import { providerDocumentId, documentCaptureTime, isCanonicalProviderProfile } from "@/lib/rag/document-identity";

import {
  createAdminSupabaseClient,
} from "@/lib/supabase/admin";

import { requireAuthoringContract } from "@/lib/supabase/authoring";

const PROVIDER = "api-football";

type ProviderTeamRow = {
  id: string;
  name: string;
  code: string;
  group_name: string;
  summary: string;
  strength_attack: number;
  strength_midfield: number;
  strength_defense: number;
  strength_transitions: number;
};

type ProviderVenueRow = {
  id: string;
  name: string;
  city: string;
  country: string;
  summary: string;
};

type ExistingDocumentRow = {
  id: string;
  doc_type: string;
  body: string;
  captured_at: string | null;
  match_id: string | null;
  team_id: string | null;
  venue_id: string | null;
};

export type SyncProviderDocumentsResult = {
  teamDocumentsSynced: number;
  venueDocumentsSynced: number;
};

function teamDocumentBody(team: ProviderTeamRow) {
  return [
    `Team profile: ${team.name}`,
    `Code: ${team.code}`,
    `Tournament group or stage: ${team.group_name}`,
    `Summary: ${team.summary}`,
    "No validated numerical performance measurements are available.",
  ].join("\n");
}

function venueDocumentBody(venue: ProviderVenueRow) {
  return [
    `Venue profile: ${venue.name}`,
    `City: ${venue.city}`,
    `Country: ${venue.country}`,
    `Summary: ${venue.summary}`,
  ].join("\n");
}

export async function syncProviderDocuments(): Promise<
  SyncProviderDocumentsResult
> {
  await requireAuthoringContract();
  const supabase = createAdminSupabaseClient();

  const [teamsResult, venuesResult, documentsResult] = await Promise.all([
    supabase
      .from("teams")
      .select(
        `
        id,
        name,
        code,
        group_name,
        summary,
        strength_attack,
        strength_midfield,
        strength_defense,
        strength_transitions
        `,
      )
      .eq("external_provider", PROVIDER)
      .order("name"),
    supabase
      .from("venues")
      .select("id, name, city, country, summary")
      .eq("external_provider", PROVIDER)
      .order("name"),
    supabase
      .from("documents")
      .select("id, doc_type, body, captured_at, team_id, venue_id, match_id")
      .eq("source_provider", PROVIDER)
      .in("doc_type", ["team_profile", "venue_profile"])
      .order("created_at"),
  ]);

  if (teamsResult.error) {
    throw new Error(
      `Failed to load provider teams: ${teamsResult.error.message}`,
    );
  }

  if (venuesResult.error) {
    throw new Error(
      `Failed to load provider venues: ${venuesResult.error.message}`,
    );
  }

  if (documentsResult.error) {
    throw new Error(
      `Failed to load existing documents: ${documentsResult.error.message}`,
    );
  }

  const teams = (teamsResult.data ?? []) as ProviderTeamRow[];
  const venues = (venuesResult.data ?? []) as ProviderVenueRow[];
  const existingDocuments =
    (documentsResult.data ?? []) as ExistingDocumentRow[];

  const teamDocumentIds = new Map<string, ExistingDocumentRow>();
  const venueDocumentIds = new Map<string, ExistingDocumentRow>();

  for (const document of existingDocuments) {
    if (!isCanonicalProviderProfile(document)) continue;
    if (document.doc_type === "team_profile" && document.team_id) {
      if (!teamDocumentIds.has(document.team_id)) {
        teamDocumentIds.set(document.team_id, document);
      }
    }

    if (document.doc_type === "venue_profile" && document.venue_id) {
      if (!venueDocumentIds.has(document.venue_id)) {
        venueDocumentIds.set(document.venue_id, document);
      }
    }
  }

  const updatedAt = new Date().toISOString();
  const teamDocuments = teams.map((team) => ({
    id: teamDocumentIds.get(team.id)?.id ?? providerDocumentId("team_profile",team.id),
    title: `${team.name} team profile`,
    doc_type: "team_profile",
    body: teamDocumentBody(team),
    source_url: null,
    source_provider: PROVIDER,
    source_identity: "API-FOOTBALL; application-authored profile template",
    source_kind: "provider",
    captured_at: documentCaptureTime(teamDocumentIds.get(team.id),teamDocumentBody(team),updatedAt),
    published_at: null,
    availability_verified: false,
    availability_evidence: null,
    dataset_version: process.env.WCL_AUTHORING_DATASET_VERSION!,
    team_id: team.id,
    venue_id: null,
    match_id: null,
    updated_at: updatedAt,
  }));

  const venueDocuments = venues.map((venue) => ({
    id: venueDocumentIds.get(venue.id)?.id ?? providerDocumentId("venue_profile",venue.id),
    title: `${venue.name} venue profile`,
    doc_type: "venue_profile",
    body: venueDocumentBody(venue),
    source_url: null,
    source_provider: PROVIDER,
    source_identity: "API-FOOTBALL; application-authored profile template",
    source_kind: "provider",
    captured_at: documentCaptureTime(venueDocumentIds.get(venue.id),venueDocumentBody(venue),updatedAt),
    published_at: null,
    availability_verified: false,
    availability_evidence: null,
    dataset_version: process.env.WCL_AUTHORING_DATASET_VERSION!,
    team_id: null,
    venue_id: venue.id,
    match_id: null,
    updated_at: updatedAt,
  }));

  if (teamDocuments.length > 0) {
    const { error } = await supabase
      .from("documents")
      .upsert(teamDocuments, { onConflict: "id" });

    if (error) {
      throw new Error(`Failed to sync team documents: ${error.message}`);
    }
  }

  if (venueDocuments.length > 0) {
    const { error } = await supabase
      .from("documents")
      .upsert(venueDocuments, { onConflict: "id" });

    if (error) {
      throw new Error(`Failed to sync venue documents: ${error.message}`);
    }
  }

  return {
    teamDocumentsSynced: teamDocuments.length,
    venueDocumentsSynced: venueDocuments.length,
  };
}
