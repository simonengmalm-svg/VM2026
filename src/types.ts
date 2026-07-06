export type Team = string;

export type KnockoutMatch = {
  id: string;
  label: string;
  stage: "round16";
  teamA: Team;
  teamB: Team;
  winner?: Team;
  locked?: boolean;
  rooting?: {
    simonSide?: Team;
    importance?: number;
    comment?: string;
  };
};

export type PlayerPicks = {
  quarterFinalists: Team[];
  semiFinalists: Team[];
  finalists: Team[];
  bronzeWinner: Team;
  champion: Team;
  mostGoalsTeam: Team;
  topScorer: string;
};

export type Player = {
  id: string;
  name: string;
  startPoints: number;
  accent: string;
  focus?: boolean;
  picks: PlayerPicks;
};

export type ResultInputs = {
  matches: KnockoutMatch[];
  baseEliminatedTeams: Team[];
  semiFinalists: Team[];
  finalists: Team[];
  bronzeWinner: Team | "";
  champion: Team | "";
  mostGoalsTeam: Team | "";
  topScorer: string | "";
};

export type ScorerStanding = {
  name: string;
  nation: Team;
  goals: number;
};

export type AppState = ResultInputs & {
  scorerTable: ScorerStanding[];
};
