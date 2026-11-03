export type TeamStrengths = {
  attack: number | null;
  midfield: number | null;
  defense: number | null;
  transitions: number | null;
};

export type Team = {
  id: string;
  name: string;
  code: string;
  flag: string;
  group: string;
  summary: string;
  strengths: TeamStrengths;
};

export type Venue = {
  id: string;
  name: string;
  city: string;
  country: string;
  summary: string;
};

export type Match = {
  id: string;
  homeTeamId: string;
  awayTeamId: string;
  venueId: string;
  group: string;
  kickoffAt: string;
  signalTags: string[];
  homeScore?: number | null;
  awayScore?: number | null;
  statusShort?: string | null;
  statusLong?: string | null;
  elapsed?: number | null;
};

export type MatchLens = {
  headline: string;
  slightEdge: string | null;
  confidence: "Low" | "Medium" | "High";
  volatility: "Low" | "Medium" | "High";
  expectedGame: string;
  whyItMatters: string;
  likelyGameScript: string;
  teamEdges: {
    label: string;
    homeValue: number;
    awayValue: number;
  }[];
  whatToWatch: string[];
  casualFanGuide: string;
  uncertainty: string[];
  sources: {
    title: string;
    snippet: string;
  }[];
};

// Public commentary deliberately excludes unsupported numerical comparisons.
export type PublicMatchLens = Omit<MatchLens, "teamEdges">;

export type PresetQuestionKey =
  | "explain-casually"
  | "tactical-edge"
  | "what-could-go-wrong";

export type MatchQuestionAnswer = {
  key: PresetQuestionKey;
  question: string;
  shortLabel: string;
  answer: string;
  bullets?: string[];
  sources: {
    title: string;
    snippet: string;
  }[];
};

export type MatchViewModel = {
  match: Match;
  homeTeam: Team;
  awayTeam: Team;
  venue: Venue;
  lens: PublicMatchLens | null;
  lensCacheUpdatedAt?: string | null;
  lensState?: "available" | "missing" | "invalid" | "unavailable";
};
