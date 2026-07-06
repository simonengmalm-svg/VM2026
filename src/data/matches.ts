import type { AppState, KnockoutMatch, ResultInputs, ScorerStanding } from "../types";

export const baseEliminatedTeams = [
  "Nederländerna",
  "Tyskland",
  "Uruguay",
  "Senegal",
];

export const initialMatches: KnockoutMatch[] = [
  {
    id: "frankrike-paraguay",
    label: "Frankrike-Paraguay",
    stage: "round16",
    teamA: "Frankrike",
    teamB: "Paraguay",
    winner: "Frankrike",
    locked: true,
  },
  {
    id: "marocko-kanada",
    label: "Marocko-Kanada",
    stage: "round16",
    teamA: "Marocko",
    teamB: "Kanada",
    winner: "Marocko",
    locked: true,
  },
  {
    id: "norge-brasilien",
    label: "Norge-Brasilien",
    stage: "round16",
    teamA: "Norge",
    teamB: "Brasilien",
    winner: "Norge",
    locked: true,
  },
  {
    id: "mexiko-england",
    label: "Mexiko-England",
    stage: "round16",
    teamA: "Mexiko",
    teamB: "England",
    rooting: {
      simonSide: "England",
      importance: 3,
      comment: "England ger Simon en säker kvartspoäng och håller toppfältet mer stabilt.",
    },
  },
  {
    id: "portugal-spanien",
    label: "Portugal-Spanien",
    stage: "round16",
    teamA: "Portugal",
    teamB: "Spanien",
    rooting: {
      simonSide: "Portugal",
      importance: 5,
      comment: "Om Portugal vinner lever Simons finalrad vidare och Anders Spanien-spår skadas.",
    },
  },
  {
    id: "usa-belgien",
    label: "USA-Belgien",
    stage: "round16",
    teamA: "USA",
    teamB: "Belgien",
    rooting: {
      simonSide: "USA",
      importance: 4,
      comment: "USA är Simons differentierare och ger poäng där nästan ingen annan får betalt.",
    },
  },
  {
    id: "argentina-egypten",
    label: "Argentina-Egypten",
    stage: "round16",
    teamA: "Argentina",
    teamB: "Egypten",
    rooting: {
      simonSide: "Argentina",
      importance: 3,
      comment: "Argentina finns i Simons kvartslinje, men flera rivaler har också tung Argentina-exponering.",
    },
  },
  {
    id: "schweiz-colombia",
    label: "Schweiz-Colombia",
    stage: "round16",
    teamA: "Schweiz",
    teamB: "Colombia",
    rooting: {
      importance: 1,
      comment: "Låg påverkan i toppstriden eftersom inget av lagen bär toppspelarnas huvudpoäng.",
    },
  },
];

export const initialScorerTable: ScorerStanding[] = [
  { name: "Kylian Mbappé", nation: "Frankrike", goals: 7 },
  { name: "Lionel Messi", nation: "Argentina", goals: 7 },
  { name: "Harry Kane", nation: "England", goals: 5 },
  { name: "Erling Haaland", nation: "Norge", goals: 5 },
  { name: "Vinicius", nation: "Brasilien", goals: 4 },
  { name: "Ousmane Dembélé", nation: "Frankrike", goals: 4 },
  { name: "Mikel Oyarzabal", nation: "Spanien", goals: 4 },
];

export const initialResultInputs: ResultInputs = {
  matches: initialMatches,
  baseEliminatedTeams,
  semiFinalists: [],
  finalists: [],
  bronzeWinner: "",
  champion: "",
  mostGoalsTeam: "",
  topScorer: "",
};

export const initialAppState: AppState = {
  ...initialResultInputs,
  scorerTable: initialScorerTable,
};

export const beforeNorwayBrazilInputs: ResultInputs = {
  ...initialResultInputs,
  matches: initialMatches.map((match) =>
    match.id === "norge-brasilien"
      ? { ...match, winner: undefined, locked: true }
      : match,
  ),
};
