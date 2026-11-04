import type {
  ApiFootballFixtureResponse,
} from "@/lib/fixtures/api-football";

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function groupFromRound(round: string) {
  const match =
    round.match(/group\s+([a-z])/i);

  return match
    ? match[1].toUpperCase()
    : null;
}

function positiveExternalId(
  value: number | null,
) {
  return typeof value === "number" &&
    Number.isFinite(value) &&
    value > 0
    ? String(value)
    : null;
}

function safeVenueSlug(
  fixture: ApiFootballFixtureResponse,
) {
  const venueName =
    fixture.fixture.venue.name ??
    "Unknown Venue";

  const venueCity =
    fixture.fixture.venue.city ??
    "Unknown City";

  const externalId =
    fixture.fixture.venue.id;

  if (positiveExternalId(externalId)) {
    return `api-football-venue-${externalId}`;
  }

  return slugify(
    `${venueName}-${venueCity}`,
  );
}

function safeTeamSlug(
  team: {
    id: number;
    name: string;
  },
) {
  return slugify(team.name) ||
    `api-football-team-${team.id}`;
}

// Canonical states describe the provider category, not evidence of a currently live event.
// Ambiguous awarded/abandoned results need a separate policy; never guess "scheduled".
export function canonicalFixtureStatus(status: string): "scheduled" | "live" | "finished" | "postponed" | "cancelled" {
  if (["TBD", "NS"].includes(status)) return "scheduled";
  if (["1H", "HT", "2H", "ET", "BT", "P", "SUSP", "INT", "LIVE"].includes(status)) return "live";
  if (["FT", "AET", "PEN"].includes(status)) return "finished";
  if (status === "PST") return "postponed";
  if (status === "CANC") return "cancelled";
  throw new Error("Unsupported provider fixture status; normalization policy required");
}

export function normalizeApiFootballFixture(
  fixture: ApiFootballFixtureResponse,
) {
  const homeTeamId =
    safeTeamSlug(fixture.teams.home);

  const awayTeamId =
    safeTeamSlug(fixture.teams.away);

  const venueId =
    safeVenueSlug(fixture);

  const matchId =
    `api-football-fixture-${fixture.fixture.id}`;

  const venueName =
    fixture.fixture.venue.name ??
    "Unknown Venue";

  const venueCity =
    fixture.fixture.venue.city ??
    "Unknown City";

  const group =
    groupFromRound(fixture.league.round) ??
    fixture.league.round;

  return {
    homeTeam: {
      id: homeTeamId,
      name: fixture.teams.home.name,
      flag: null,
      fifaRanking: null,
      form: null,
      story: null,
      strengths: {
        attack: null,
        midfield: null,
        defense: null,
        transitions: null,
      },
      external_provider: "api-football",
      external_id:
        String(fixture.teams.home.id),
      logo_url:
        fixture.teams.home.logo,
      updated_at:
        new Date().toISOString(),
    },
    awayTeam: {
      id: awayTeamId,
      name: fixture.teams.away.name,
      flag: null,
      fifaRanking: null,
      form: null,
      story: null,
      strengths: {
        attack: null,
        midfield: null,
        defense: null,
        transitions: null,
      },
      external_provider: "api-football",
      external_id:
        String(fixture.teams.away.id),
      logo_url:
        fixture.teams.away.logo,
      updated_at:
        new Date().toISOString(),
    },
    venue: {
      id: venueId,
      name: venueName,
      city: venueCity,
      // This fixture response has no venue-country field. Competition country is not geography.
      country: "Unknown",
      capacity: null,
      story: null,
      external_provider: "api-football",
      external_id: positiveExternalId(
        fixture.fixture.venue.id,
      ),
      updated_at:
        new Date().toISOString(),
    },
    match: {
      id: matchId,
      homeTeamId,
      awayTeamId,
      venueId,
      group,
      kickoffAt:
        fixture.fixture.date,
      status: canonicalFixtureStatus(fixture.fixture.status.short),
      external_provider: "api-football",
      external_id:
        String(fixture.fixture.id),
      status_short:
        fixture.fixture.status.short,
      status_long:
        fixture.fixture.status.long,
      elapsed:
        fixture.fixture.status.elapsed,
      home_score:
        fixture.goals.home,
      away_score:
        fixture.goals.away,
      updated_at:
        new Date().toISOString(),
    },
  };
}
