import type { Match, MatchLens, Team, Venue } from "@/lib/types";

export const teams: Team[] = [
  {
    id: "mexico",
    name: "Mexico",
    code: "MEX",
    flag: "🇲🇽",
    group: "A",
    summary:
      "Host-region side with technical midfield quality, strong support, and a possession-oriented profile.",
    strengths: {
      attack: 56,
      midfield: 61,
      defense: 52,
      transitions: 45,
    },
  },
  {
    id: "south-africa",
    name: "South Africa",
    code: "RSA",
    flag: "🇿🇦",
    group: "A",
    summary:
      "Athletic side with counterattacking pace, wide threat, and a compact defensive profile.",
    strengths: {
      attack: 44,
      midfield: 39,
      defense: 48,
      transitions: 55,
    },
  },
  {
    id: "south-korea",
    name: "South Korea",
    code: "KOR",
    flag: "🇰🇷",
    group: "A",
    summary:
      "Organized, high-work-rate side with pressing intensity and quick attacking combinations.",
    strengths: {
      attack: 53,
      midfield: 57,
      defense: 55,
      transitions: 58,
    },
  },
  {
    id: "czechia",
    name: "Czechia",
    code: "CZE",
    flag: "🇨🇿",
    group: "A",
    summary:
      "Structured European side with physicality, set-piece threat, and disciplined defensive shape.",
    strengths: {
      attack: 50,
      midfield: 54,
      defense: 58,
      transitions: 46,
    },
  },
  {
    id: "canada",
    name: "Canada",
    code: "CAN",
    flag: "🇨🇦",
    group: "B",
    summary:
      "Host nation with pace, athleticism, and strong transition potential in wide areas.",
    strengths: {
      attack: 55,
      midfield: 50,
      defense: 49,
      transitions: 60,
    },
  },
  {
    id: "bosnia-herzegovina",
    name: "Bosnia & Herzegovina",
    code: "BIH",
    flag: "🇧🇦",
    group: "B",
    summary:
      "Technically capable side with central quality and a measured possession profile.",
    strengths: {
      attack: 52,
      midfield: 56,
      defense: 48,
      transitions: 47,
    },
  },
  {
    id: "usa",
    name: "USA",
    code: "USA",
    flag: "🇺🇸",
    group: "D",
    summary:
      "Host nation with athletic midfielders, pressing potential, and strong home-region support.",
    strengths: {
      attack: 57,
      midfield: 58,
      defense: 53,
      transitions: 59,
    },
  },
  {
    id: "paraguay",
    name: "Paraguay",
    code: "PAR",
    flag: "🇵🇾",
    group: "D",
    summary:
      "Combative South American side with defensive resilience and direct attacking phases.",
    strengths: {
      attack: 48,
      midfield: 49,
      defense: 56,
      transitions: 52,
    },
  },
];

export const venues: Venue[] = [
  {
    id: "riverside-arena",
    name: "Riverside Arena",
    city: "Los Angeles",
    country: "USA",
    summary:
      "Large West Coast venue expected to create a loud, mixed crowd and energetic opening-match atmosphere.",
  },
  {
    id: "harbor-stadium",
    name: "Harbor Stadium",
    city: "San Diego",
    country: "USA",
    summary:
      "Coastal venue with a compact matchday feel and conditions that could suit high-tempo play.",
  },
  {
    id: "maple-leaf-field",
    name: "Maple Leaf Field",
    city: "Toronto",
    country: "Canada",
    summary:
      "Canadian host venue likely to provide strong support for Canada and a tournament-stage atmosphere.",
  },
  {
    id: "bayview-stadium",
    name: "Bayview Stadium",
    city: "Houston",
    country: "USA",
    summary:
      "Warm-weather venue where tempo management and substitutions may matter late in matches.",
  },
];

export const matches: Match[] = [
  {
    id: "mexico-south-africa",
    homeTeamId: "mexico",
    awayTeamId: "south-africa",
    venueId: "riverside-arena",
    group: "A",
    kickoffAt: "2026-06-11T12:00:00-07:00",
    signalTags: ["Opener", "High volatility", "Watch transitions"],
  },
  {
    id: "south-korea-czechia",
    homeTeamId: "south-korea",
    awayTeamId: "czechia",
    venueId: "harbor-stadium",
    group: "A",
    kickoffAt: "2026-06-11T19:00:00-07:00",
    signalTags: ["High variance", "Press vs structure"],
  },
  {
    id: "canada-bosnia-herzegovina",
    homeTeamId: "canada",
    awayTeamId: "bosnia-herzegovina",
    venueId: "maple-leaf-field",
    group: "B",
    kickoffAt: "2026-06-12T12:00:00-04:00",
    signalTags: ["Host watch", "Midfield test"],
  },
  {
    id: "usa-paraguay",
    homeTeamId: "usa",
    awayTeamId: "paraguay",
    venueId: "bayview-stadium",
    group: "D",
    kickoffAt: "2026-06-12T18:00:00-05:00",
    signalTags: ["Host watch", "Physical matchup"],
  },
];

export const cachedLenses: Record<string, MatchLens> = {
  "mexico-south-africa": {
    headline: "Mexico slight edge, but South Africa can make it chaotic.",
    slightEdge: "Mexico",
    confidence: "Medium",
    volatility: "High",
    expectedGame: "Mexico possession, South Africa transition threat.",
    whyItMatters:
      "A strong opening result can define Group A. Mexico will want control early, while South Africa can punish mistakes if the match becomes stretched.",
    likelyGameScript:
      "Mexico should have more of the ball and look to build through midfield. South Africa will likely defend compactly and attack quickly into wide spaces.",
    teamEdges: [
      { label: "Attack", homeValue: 56, awayValue: 44 },
      { label: "Midfield Control", homeValue: 61, awayValue: 39 },
      { label: "Defense", homeValue: 52, awayValue: 48 },
      { label: "Transitions", homeValue: 45, awayValue: 55 },
    ],
    whatToWatch: [
      "South Africa counters down the wings",
      "Mexico set pieces and second balls",
      "Midfield pressure versus composure",
      "Whether an early goal opens the match",
    ],
    casualFanGuide:
      "Mexico will likely look more organized in possession. South Africa may be most dangerous when they win the ball and attack quickly before Mexico resets.",
    uncertainty: [
      "Opening matches can be cautious or chaotic.",
      "Lineups and fitness may change the tactical balance.",
      "An early goal or red card would heavily distort the expected game script.",
    ],
    sources: [
      {
        title: "Team profile: Mexico",
        snippet:
          "Host-region advantage, technical midfield, possession-oriented setup.",
      },
      {
        title: "Team profile: South Africa",
        snippet: "Transition threat, wide pace, and compact defensive approach.",
      },
      {
        title: "Tournament format",
        snippet:
          "Group-stage results shape qualification and tiebreak scenarios.",
      },
    ],
  },
};
