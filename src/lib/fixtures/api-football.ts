import "server-only";

export type ApiFootballFixtureResponse = {
  fixture: {
    id: number;
    referee: string | null;
    timezone: string;
    date: string;
    timestamp: number;
    venue: {
      id: number | null;
      name: string | null;
      city: string | null;
    };
    status: {
      long: string;
      short: string;
      elapsed: number | null;
    };
  };
  league: {
    id: number;
    name: string;
    country: string;
    logo: string | null;
    flag: string | null;
    season: number;
    round: string;
    standings: boolean;
  };
  teams: {
    home: {
      id: number;
      name: string;
      logo: string | null;
      winner: boolean | null;
    };
    away: {
      id: number;
      name: string;
      logo: string | null;
      winner: boolean | null;
    };
  };
  goals: {
    home: number | null;
    away: number | null;
  };
  score: {
    halftime: {
      home: number | null;
      away: number | null;
    };
    fulltime: {
      home: number | null;
      away: number | null;
    };
    extratime: {
      home: number | null;
      away: number | null;
    };
    penalty: {
      home: number | null;
      away: number | null;
    };
  };
};

type ApiFootballFixturesPayload = {
  get: string;
  parameters: Record<string, string>;
  errors: unknown;
  results: number;
  paging: {
    current: number;
    total: number;
  };
  response: ApiFootballFixtureResponse[];
};

function getApiFootballConfig() {
  const baseUrl =
    process.env.API_FOOTBALL_BASE_URL ??
    "https://v3.football.api-sports.io";

  const apiKey =
    process.env.API_FOOTBALL_KEY;

  const leagueId =
    process.env.API_FOOTBALL_WORLD_CUP_LEAGUE_ID ??
    "1";

  const season =
    process.env.API_FOOTBALL_WORLD_CUP_SEASON ??
    "2026";

  if (!apiKey) {
    throw new Error(
      "Missing API_FOOTBALL_KEY in environment.",
    );
  }

  return {
    baseUrl,
    apiKey,
    leagueId,
    season,
  };
}

export async function fetchWorldCupFixtures(): Promise<
  ApiFootballFixtureResponse[]
> {
  const {
    baseUrl,
    apiKey,
    leagueId,
    season,
  } = getApiFootballConfig();

  const url = new URL(
    "/fixtures",
    baseUrl,
  );

  url.searchParams.set(
    "league",
    leagueId,
  );
  url.searchParams.set(
    "season",
    season,
  );

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "x-apisports-key": apiKey,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const body = await response.text();

    throw new Error(
      `API-FOOTBALL fixtures request failed: ${response.status} ${body}`,
    );
  }

  const payload =
    (await response.json()) as ApiFootballFixturesPayload;

  if (
    payload.errors &&
    Array.isArray(payload.errors) === false &&
    Object.keys(payload.errors).length > 0
  ) {
    throw new Error(
      `API-FOOTBALL returned errors: ${JSON.stringify(payload.errors)}`,
    );
  }

  return payload.response;
}
