import "server-only";
import { requireAuthoringContract } from "@/lib/supabase/authoring";

import {
  fetchWorldCupFixtures,
} from "@/lib/fixtures/api-football";
import {
  normalizeApiFootballFixture,
} from "@/lib/fixtures/normalize";
import {
  createAdminSupabaseClient,
} from "@/lib/supabase/admin";

type SyncFixturesResult = {
  fetchedFixtures: number;
  teamsUpserted: number;
  venuesUpserted: number;
  matchesUpserted: number;
};

const TEAM_CODE_OVERRIDES: Record<string, string> = {
  Argentina: "ARG",
  Australia: "AUS",
  Austria: "AUT",
  Belgium: "BEL",
  Brazil: "BRA",
  Canada: "CAN",
  Colombia: "COL",
  Croatia: "CRO",
  Denmark: "DEN",
  Ecuador: "ECU",
  Egypt: "EGY",
  England: "ENG",
  France: "FRA",
  Germany: "GER",
  Ghana: "GHA",
  Italy: "ITA",
  Japan: "JPN",
  Mexico: "MEX",
  Morocco: "MAR",
  Netherlands: "NED",
  Norway: "NOR",
  Paraguay: "PAR",
  Portugal: "POR",
  Senegal: "SEN",
  Spain: "ESP",
  Sweden: "SWE",
  Switzerland: "SUI",
  "South Africa": "RSA",
  "United States": "USA",
  USA: "USA",
  "DR Congo": "COD",
  "Congo DR": "COD",
  "Ivory Coast": "CIV",
  "Côte d'Ivoire": "CIV",
  "Bosnia and Herzegovina": "BIH",
  "Cape Verde": "CPV",
};

const FLAG_OVERRIDES: Record<string, string> = {
  Argentina: "🇦🇷",
  Australia: "🇦🇺",
  Austria: "🇦🇹",
  Belgium: "🇧🇪",
  Brazil: "🇧🇷",
  Canada: "🇨🇦",
  Colombia: "🇨🇴",
  Croatia: "🇭🇷",
  Denmark: "🇩🇰",
  Ecuador: "🇪🇨",
  Egypt: "🇪🇬",
  England: "🏴",
  France: "🇫🇷",
  Germany: "🇩🇪",
  Ghana: "🇬🇭",
  Italy: "🇮🇹",
  Japan: "🇯🇵",
  Mexico: "🇲🇽",
  Morocco: "🇲🇦",
  Netherlands: "🇳🇱",
  Norway: "🇳🇴",
  Paraguay: "🇵🇾",
  Portugal: "🇵🇹",
  Senegal: "🇸🇳",
  Spain: "🇪🇸",
  Sweden: "🇸🇪",
  Switzerland: "🇨🇭",
  "South Africa": "🇿🇦",
  "United States": "🇺🇸",
  USA: "🇺🇸",
  "DR Congo": "🇨🇩",
  "Congo DR": "🇨🇩",
  "Ivory Coast": "🇨🇮",
  "Côte d'Ivoire": "🇨🇮",
  "Bosnia and Herzegovina": "🇧🇦",
  "Cape Verde": "🇨🇻",
};

function deriveTeamCode(
  name: string,
  externalId: string,
) {
  const base =
    TEAM_CODE_OVERRIDES[name] ??
    (name
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^A-Za-z]/g, "")
      .toUpperCase()
      .slice(0, 3) || "TM");

  return `${base}-${externalId}`;
}

function deriveFlag(name: string) {
  return FLAG_OVERRIDES[name] ?? "🏳️";
}

function buildTeamSummary(name: string) {
  return `${name} enters this fixture as a provider-synced World Cup team. Tactical strengths are placeholder values until enriched team profiles are added.`;
}

function buildVenueSummary(
  name: string,
  city: string,
  country: string,
) {
  return `${name} is a provider-synced World Cup venue in ${city}, ${country}. Detailed venue context can be enriched later through source documents.`;
}

function uniqueById<T extends { id: string }>(
  rows: T[],
) {
  return Array.from(
    new Map(
      rows.map((row) => [row.id, row]),
    ).values(),
  );
}

export async function syncWorldCupFixtures(): Promise<
  SyncFixturesResult
> {
  await requireAuthoringContract();
  const fixtures =
    await fetchWorldCupFixtures();

  const normalized =
    fixtures.map(
      normalizeApiFootballFixture,
    );

  const teams = uniqueById(
    normalized.flatMap((item) => [
      {
        ...item.homeTeam,
        group: item.match.group,
      },
      {
        ...item.awayTeam,
        group: item.match.group,
      },
    ]),
  ).map((team) => ({
    id: team.id,
    name: team.name,
    code: deriveTeamCode(
      team.name,
      team.external_id,
    ),
    flag: deriveFlag(team.name),
    group_name: team.group,
    summary: buildTeamSummary(team.name),
    strength_attack: null,
    strength_midfield: null,
    strength_defense: null,
    strength_transitions: null,
    data_origin: "provider",
    external_provider:
      team.external_provider,
    external_id: team.external_id,
    logo_url: team.logo_url,
    updated_at: team.updated_at,
  }));

  const venues = uniqueById(
    normalized.map((item) => item.venue),
  ).map((venue) => ({
    id: venue.id,
    name: venue.name,
    city: venue.city,
    country: venue.country,
    summary: buildVenueSummary(
      venue.name,
      venue.city,
      venue.country,
    ),
    data_origin: "provider",
    external_provider:
      venue.external_provider,
    external_id: venue.external_id,
    updated_at: venue.updated_at,
  }));

  const matches = uniqueById(
    normalized.map((item) => item.match),
  ).map((match) => ({
    id: match.id,
    home_team_id: match.homeTeamId,
    away_team_id: match.awayTeamId,
    venue_id: match.venueId,
    group_name: match.group,
    kickoff_at: match.kickoffAt,
    signal_tags: [],
    // The database status constraint uses the app's canonical state, while
    // API-FOOTBALL's provider-specific value is retained in status_short.
    status: match.status,
    data_origin: "provider",
    external_provider:
      match.external_provider,
    external_id: match.external_id,
    status_short: match.status_short,
    status_long: match.status_long,
    elapsed: match.elapsed,
    home_score: match.home_score,
    away_score: match.away_score,
    updated_at: match.updated_at,
  }));

  const supabase =
    createAdminSupabaseClient();

  if (teams.length > 0) {
    const { error } = await supabase
      .from("teams")
      .upsert(teams, {
        onConflict: "id",
      });

    if (error) {
      throw new Error(
        `Failed to upsert teams: ${error.message}`,
      );
    }
  }

  if (venues.length > 0) {
    const { error } = await supabase
      .from("venues")
      .upsert(venues, {
        onConflict: "id",
      });

    if (error) {
      throw new Error(
        `Failed to upsert venues: ${error.message}`,
      );
    }
  }

  if (matches.length > 0) {
    const { error } = await supabase
      .from("matches")
      .upsert(matches, {
        onConflict: "id",
      });

    if (error) {
      throw new Error(
        `Failed to upsert matches: ${error.message}`,
      );
    }
  }

  return {
    fetchedFixtures:
      fixtures.length,
    teamsUpserted:
      teams.length,
    venuesUpserted:
      venues.length,
    matchesUpserted:
      matches.length,
  };
}
