export type TeamStrengths = {
  attack: number;
  midfield: number;
  defense: number;
  transitions: number;
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
