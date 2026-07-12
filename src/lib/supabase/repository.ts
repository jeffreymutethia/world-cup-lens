import "server-only";

import type {
  Match,
  MatchLens,
  MatchQuestionAnswer,
  Team,
  Venue,
} from "@/lib/types";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type TeamRow = {
  id: string;
  name: string;
  code: string;
  flag: string;
  group_name: string;
  summary: string;
  strength_attack: number;
  strength_midfield: number;
  strength_defense: number;
  strength_transitions: number;
};

type VenueRow = {
  id: string;
  name: string;
  city: string;
  country: string;
  summary: string;
};

type MatchRow = {
  id: string;
  home_team_id: string;
  away_team_id: string;
  venue_id: string;
  group_name: string;
  kickoff_at: string;
  signal_tags: string[];
  home_score?: number | null;
  away_score?: number | null;
  status_short?: string | null;
  status_long?: string | null;
  elapsed?: number | null;
};

type ProviderMatchRow = MatchRow & {
  home_team: TeamRow | TeamRow[];
  away_team: TeamRow | TeamRow[];
  venue: VenueRow | VenueRow[];
};

type MatchLensRow = {
  match_id: string;
  lens_json: MatchLens;
};

type QaAnswerRow = {
  match_id: string;
  question_key: string;
  answer_json: MatchQuestionAnswer;
};

export type MatchViewModel = {
  match: Match;
  homeTeam: Team;
  awayTeam: Team;
  venue: Venue;
  lens: MatchLens | null;
};

function mapTeam(row: TeamRow): Team {
  return {
    id: row.id,
    name: row.name,
    code: row.code,
    flag: row.flag,
    group: row.group_name,
    summary: row.summary,
    strengths: {
      attack: row.strength_attack,
      midfield: row.strength_midfield,
      defense: row.strength_defense,
      transitions: row.strength_transitions,
    },
  };
}

function mapVenue(row: VenueRow): Venue {
  return {
    id: row.id,
    name: row.name,
    city: row.city,
    country: row.country,
    summary: row.summary,
  };
}

function mapMatch(row: MatchRow): Match {
  return {
    id: row.id,
    homeTeamId: row.home_team_id,
    awayTeamId: row.away_team_id,
    venueId: row.venue_id,
    group: row.group_name,
    kickoffAt: row.kickoff_at,
    signalTags: row.signal_tags ?? [],
    homeScore: row.home_score ?? null,
    awayScore: row.away_score ?? null,
    statusShort: row.status_short ?? null,
    statusLong: row.status_long ?? null,
    elapsed: row.elapsed ?? null,
  };
}

function mapMatchLens(row: MatchLensRow) {
  return row.lens_json;
}

const LIVE_STATUSES = new Set([
  "1H",
  "HT",
  "2H",
  "ET",
  "BT",
  "P",
  "LIVE",
]);

const UPCOMING_STATUSES = new Set(["NS", "TBD"]);
const FINISHED_STATUSES = new Set(["FT", "AET", "PEN"]);

function statusBucket(status: string | null | undefined) {
  if (status && LIVE_STATUSES.has(status)) return 0;
  if (status && UPCOMING_STATUSES.has(status)) return 1;
  if (status && FINISHED_STATUSES.has(status)) return 2;
  return 3;
}

function firstRelation<T>(relation: T | T[]) {
  return Array.isArray(relation) ? relation[0] : relation;
}

function localDateKey(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((item) => item.type === type)?.value;

  return `${part("year")}-${part("month")}-${part("day")}`;
}

function nextDateKey(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);
  const next = new Date(Date.UTC(year, month - 1, day + 1));
  return next.toISOString().slice(0, 10);
}

function localMidnightUtc(dateKey: string, timeZone: string) {
  const [year, month, day] = dateKey.split("-").map(Number);
  const desired = Date.UTC(year, month - 1, day);
  let candidate = desired;
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const parts = formatter.formatToParts(new Date(candidate));
    const value = (type: Intl.DateTimeFormatPartTypes) =>
      Number(parts.find((item) => item.type === type)?.value);
    const represented = Date.UTC(
      value("year"),
      value("month") - 1,
      value("day"),
      value("hour"),
      value("minute"),
      value("second"),
    );
    candidate += desired - represented;
  }

  return new Date(candidate).toISOString();
}

export async function getProviderMatchesForLocalDate(
  targetDate = new Date(),
  timeZone = "America/Los_Angeles",
): Promise<MatchViewModel[]> {
  const dateKey = localDateKey(targetDate, timeZone);
  const start = localMidnightUtc(dateKey, timeZone);
  const end = localMidnightUtc(nextDateKey(dateKey), timeZone);
  const supabase = createServerSupabaseClient();

  const { data, error } = await supabase
    .from("matches")
    .select(
      `
      id,
      home_team_id,
      away_team_id,
      venue_id,
      group_name,
      kickoff_at,
      signal_tags,
      home_score,
      away_score,
      status_short,
      status_long,
      elapsed,
      home_team:teams!matches_home_team_id_fkey(
        id, name, code, flag, group_name, summary,
        strength_attack, strength_midfield, strength_defense, strength_transitions
      ),
      away_team:teams!matches_away_team_id_fkey(
        id, name, code, flag, group_name, summary,
        strength_attack, strength_midfield, strength_defense, strength_transitions
      ),
      venue:venues!matches_venue_id_fkey(id, name, city, country, summary)
      `,
    )
    .eq("external_provider", "api-football")
    .gte("kickoff_at", start)
    .lt("kickoff_at", end)
    .order("kickoff_at", { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch today's provider matches: ${error.message}`);
  }

  const providerRows = (data ?? []) as ProviderMatchRow[];

  if (providerRows.length === 0) {
    return [];
  }

  const { data: lensData, error: lensError } = await supabase
    .from("match_lenses")
    .select("match_id, lens_json")
    .in(
      "match_id",
      providerRows.map((row) => row.id),
    );

  if (lensError) {
    throw new Error(
      `Failed to fetch today's cached Match Lenses: ${lensError.message}`,
    );
  }

  const lensesByMatchId = new Map(
    ((lensData ?? []) as MatchLensRow[]).map((row) => [
      row.match_id,
      mapMatchLens(row),
    ]),
  );

  return providerRows
    .flatMap((row) => {
      const homeTeam = firstRelation(row.home_team);
      const awayTeam = firstRelation(row.away_team);
      const venue = firstRelation(row.venue);

      if (!homeTeam || !awayTeam || !venue) return [];

      return [{
        match: mapMatch(row),
        homeTeam: mapTeam(homeTeam),
        awayTeam: mapTeam(awayTeam),
        venue: mapVenue(venue),
        lens: lensesByMatchId.get(row.id) ?? null,
      }];
    })
    .sort((left, right) =>
      statusBucket(left.match.statusShort) -
        statusBucket(right.match.statusShort) ||
      left.match.kickoffAt.localeCompare(right.match.kickoffAt),
    );
}

export async function getTeams(): Promise<Team[]> {
  const supabase = createServerSupabaseClient();

  const { data, error } = await supabase
    .from("teams")
    .select(
      `
      id,
      name,
      code,
      flag,
      group_name,
      summary,
      strength_attack,
      strength_midfield,
      strength_defense,
      strength_transitions
      `,
    )
    .order("name");

  if (error) {
    throw new Error(`Failed to fetch teams: ${error.message}`);
  }

  return (data as TeamRow[]).map(mapTeam);
}

export async function getVenues(): Promise<Venue[]> {
  const supabase = createServerSupabaseClient();

  const { data, error } = await supabase
    .from("venues")
    .select("id, name, city, country, summary")
    .order("name");

  if (error) {
    throw new Error(`Failed to fetch venues: ${error.message}`);
  }

  return (data as VenueRow[]).map(mapVenue);
}

export async function getMatches(): Promise<Match[]> {
  const supabase = createServerSupabaseClient();

  const { data, error } = await supabase
    .from("matches")
    .select(
      `
      id,
      home_team_id,
      away_team_id,
      venue_id,
      group_name,
      kickoff_at,
      signal_tags
      `,
    )
    .order("kickoff_at");

  if (error) {
    throw new Error(`Failed to fetch matches: ${error.message}`);
  }

  return (data as MatchRow[]).map(mapMatch);
}

export async function getMatchLens(
  matchId: string,
): Promise<MatchLens | null> {
  const supabase = createServerSupabaseClient();

  const { data, error } = await supabase
    .from("match_lenses")
    .select("match_id, lens_json")
    .eq("match_id", matchId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch match lens: ${error.message}`);
  }

  if (!data) {
    return null;
  }

  return mapMatchLens(data as MatchLensRow);
}

export async function getCachedAnswersForMatch(
  matchId: string,
): Promise<MatchQuestionAnswer[]> {
  const supabase = createServerSupabaseClient();

  const { data, error } = await supabase
    .from("qa_answers")
    .select("match_id, question_key, answer_json")
    .eq("match_id", matchId)
    .order("question_key");

  if (error) {
    throw new Error(`Failed to fetch cached answers: ${error.message}`);
  }

  return (data as QaAnswerRow[]).map((row) => row.answer_json);
}

export async function getAllMatchViewModels(): Promise<MatchViewModel[]> {
  const [matches, teams, venues] = await Promise.all([
    getMatches(),
    getTeams(),
    getVenues(),
  ]);

  const teamsById = new Map(teams.map((team) => [team.id, team]));
  const venuesById = new Map(venues.map((venue) => [venue.id, venue]));

  const lensEntries = await Promise.all(
    matches.map(async (match) => [
      match.id,
      await getMatchLens(match.id),
    ] as const),
  );

  const lensesByMatchId = new Map(lensEntries);

  return matches.flatMap((match) => {
    const homeTeam = teamsById.get(match.homeTeamId);
    const awayTeam = teamsById.get(match.awayTeamId);
    const venue = venuesById.get(match.venueId);

    if (!homeTeam || !awayTeam || !venue) {
      return [];
    }

    return [
      {
        match,
        homeTeam,
        awayTeam,
        venue,
        lens: lensesByMatchId.get(match.id) ?? null,
      },
    ];
  });
}

export async function getFeaturedMatchViewModel() {
  const viewModels = await getAllMatchViewModels();
  return viewModels[0] ?? null;
}

export async function getMatchViewModel(
  matchId: string,
): Promise<MatchViewModel | null> {
  const supabase = createServerSupabaseClient();

  const { data: matchData, error: matchError } = await supabase
    .from("matches")
    .select(
      `
      id,
      home_team_id,
      away_team_id,
      venue_id,
      group_name,
      kickoff_at,
      signal_tags
      `,
    )
    .eq("id", matchId)
    .maybeSingle();

  if (matchError) {
    throw new Error(`Failed to fetch match: ${matchError.message}`);
  }

  if (!matchData) {
    return null;
  }

  const match = mapMatch(matchData as MatchRow);

  const [
    { data: homeData, error: homeError },
    { data: awayData, error: awayError },
    { data: venueData, error: venueError },
    lens,
  ] = await Promise.all([
    supabase.from("teams").select("*").eq("id", match.homeTeamId).single(),
    supabase.from("teams").select("*").eq("id", match.awayTeamId).single(),
    supabase.from("venues").select("*").eq("id", match.venueId).single(),
    getMatchLens(match.id),
  ]);

  if (homeError) {
    throw new Error(`Failed to fetch home team: ${homeError.message}`);
  }

  if (awayError) {
    throw new Error(`Failed to fetch away team: ${awayError.message}`);
  }

  if (venueError) {
    throw new Error(`Failed to fetch venue: ${venueError.message}`);
  }

  return {
    match,
    homeTeam: mapTeam(homeData as TeamRow),
    awayTeam: mapTeam(awayData as TeamRow),
    venue: mapVenue(venueData as VenueRow),
    lens,
  };
}
