import type { KnockoutMatch, Player, ResultInputs, Team } from "../types";

export const POINTS = {
  quarterFinalist: 3,
  semiFinalist: 4,
  finalist: 6,
  bronzeWinner: 5,
  champion: 8,
  mostGoalsTeam: 5,
  topScorer: 7,
} as const;

export type TournamentState = {
  quarterFinalists: Team[];
  semiFinalists: Team[];
  finalists: Team[];
  bronzeWinner?: Team;
  champion?: Team;
  mostGoalsTeam?: Team;
  topScorer?: string;
  eliminatedTeams: Team[];
};

export type PickBreakdown = {
  category: string;
  label: string;
  pick: string;
  points: number;
  actual: boolean;
  possible: boolean;
  blocked: boolean;
  reason: string;
};

export type PlayerScore = {
  player: Player;
  rank: number;
  score: number;
  startPoints: number;
  earnedPoints: number;
  remainingPossible: number;
  maxFinal: number;
  status: string;
  canWin: boolean;
  canReachPodium: boolean;
  breakdown: PickBreakdown[];
};

export type CompetitionSummary = {
  scores: PlayerScore[];
  leader: PlayerScore;
  currentLeaderScore: number;
  topMaxFinal: number;
  podiumLine: number;
  tournament: TournamentState;
};

export type ImpactRow = {
  player: Player;
  beforeScore: number;
  afterScore: number;
  deltaScore: number;
  beforeMax: number;
  afterMax: number;
  deltaMax: number;
};

export type ImpactSummary = {
  rows: ImpactRow[];
  pointEarners: ImpactRow[];
  maxLosers: ImpactRow[];
  biggestWinners: ImpactRow[];
  biggestLosers: ImpactRow[];
};

const unique = <T,>(values: T[]) => [...new Set(values.filter(Boolean))];

export function deriveTournamentState(inputs: ResultInputs): TournamentState {
  const eliminated = new Set(inputs.baseEliminatedTeams);
  const quarterFinalists: Team[] = [];

  inputs.matches.forEach((match) => {
    if (!match.winner) return;
    quarterFinalists.push(match.winner);
    const loser = match.winner === match.teamA ? match.teamB : match.teamA;
    eliminated.add(loser);
  });

  return {
    quarterFinalists: unique(quarterFinalists),
    semiFinalists: unique(inputs.semiFinalists),
    finalists: unique(inputs.finalists),
    bronzeWinner: inputs.bronzeWinner || undefined,
    champion: inputs.champion || undefined,
    mostGoalsTeam: inputs.mostGoalsTeam || undefined,
    topScorer: inputs.topScorer || undefined,
    eliminatedTeams: [...eliminated].sort((a, b) => a.localeCompare(b, "sv")),
  };
}

export function isTeamAlive(team: Team, tournament: TournamentState) {
  return !tournament.eliminatedTeams.includes(team);
}

function stageIsComplete(stage: "quarter" | "semi" | "final", tournament: TournamentState) {
  if (stage === "quarter") return tournament.quarterFinalists.length >= 8;
  if (stage === "semi") return tournament.semiFinalists.length >= 4;
  return tournament.finalists.length >= 2;
}

function canStillReachTeamStage(
  stage: "quarter" | "semi" | "final" | "bronze" | "champion",
  team: Team,
  tournament: TournamentState,
) {
  if (!isTeamAlive(team, tournament)) return false;

  if (stage === "quarter") {
    return !stageIsComplete("quarter", tournament);
  }

  if (stage === "semi") {
    if (stageIsComplete("semi", tournament)) return false;
    if (stageIsComplete("quarter", tournament)) {
      return tournament.quarterFinalists.includes(team);
    }
    return true;
  }

  if (stage === "final" || stage === "champion") {
    if (stageIsComplete("final", tournament)) return false;
    if (stageIsComplete("semi", tournament)) {
      return tournament.semiFinalists.includes(team);
    }
    if (stageIsComplete("quarter", tournament)) {
      return tournament.quarterFinalists.includes(team);
    }
    return true;
  }

  if (tournament.finalists.length >= 2 && tournament.semiFinalists.length >= 4) {
    return tournament.semiFinalists.includes(team) && !tournament.finalists.includes(team);
  }

  if (stageIsComplete("semi", tournament)) {
    return tournament.semiFinalists.includes(team);
  }

  if (stageIsComplete("quarter", tournament)) {
    return tournament.quarterFinalists.includes(team);
  }

  return true;
}

function evaluateListPick(
  category: string,
  label: string,
  pick: Team,
  points: number,
  actualList: Team[],
  stage: "quarter" | "semi" | "final",
  tournament: TournamentState,
): PickBreakdown {
  const actual = actualList.includes(pick);
  const possible = !actual && canStillReachTeamStage(stage, pick, tournament);

  return {
    category,
    label,
    pick,
    points,
    actual,
    possible,
    blocked: !actual && !possible,
    reason: actual ? "Uppfylld" : possible ? "Kan fortfarande sitta" : "Stängd",
  };
}

function evaluateTeamBonus(
  category: string,
  label: string,
  pick: Team,
  points: number,
  actualWinner: Team | undefined,
  stage: "bronze" | "champion" | "open-team",
  tournament: TournamentState,
): PickBreakdown {
  if (actualWinner) {
    const actual = actualWinner === pick;
    return {
      category,
      label,
      pick,
      points,
      actual,
      possible: false,
      blocked: !actual,
      reason: actual ? "Uppfylld" : "Resultat fastslaget",
    };
  }

  const possible =
    stage === "open-team" ? true : canStillReachTeamStage(stage, pick, tournament);

  return {
    category,
    label,
    pick,
    points,
    actual: false,
    possible,
    blocked: !possible,
    reason: possible ? "Öppen" : "Stängd",
  };
}

function evaluateTopScorer(
  pick: string,
  actualTopScorer: string | undefined,
): PickBreakdown {
  if (actualTopScorer) {
    const actual = actualTopScorer === pick;
    return {
      category: "topScorer",
      label: "Skyttekung",
      pick,
      points: POINTS.topScorer,
      actual,
      possible: false,
      blocked: !actual,
      reason: actual ? "Uppfylld" : "Resultat fastslaget",
    };
  }

  return {
    category: "topScorer",
    label: "Skyttekung",
    pick,
    points: POINTS.topScorer,
    actual: false,
    possible: true,
    blocked: false,
    reason: "Öppen",
  };
}

export function scorePlayer(player: Player, inputs: ResultInputs): PlayerScore {
  const tournament = deriveTournamentState(inputs);

  /*
   * Poängregeln är deterministisk:
   * - actual=true ger poäng nu, men bara för resultat som finns i input.
   * - possible=true räknas bara i maxpoäng och betyder att raden inte är
   *   stängd av ett inmatat resultat eller ett utslaget lag.
   * - Bonusar för flest mål/skyttekung är öppna tills ett slutresultat matas in,
   *   eftersom en utslagen spelare eller ett utslaget lag teoretiskt kan leda
   *   sådana listor tills slutvärdet fastslås manuellt.
   */
  const breakdown: PickBreakdown[] = [
    ...player.picks.quarterFinalists.map((pick) =>
      evaluateListPick(
        "quarterFinalist",
        "Kvartsfinallag",
        pick,
        POINTS.quarterFinalist,
        tournament.quarterFinalists,
        "quarter",
        tournament,
      ),
    ),
    ...player.picks.semiFinalists.map((pick) =>
      evaluateListPick(
        "semiFinalist",
        "Semifinallag",
        pick,
        POINTS.semiFinalist,
        tournament.semiFinalists,
        "semi",
        tournament,
      ),
    ),
    ...player.picks.finalists.map((pick) =>
      evaluateListPick(
        "finalist",
        "Finallag",
        pick,
        POINTS.finalist,
        tournament.finalists,
        "final",
        tournament,
      ),
    ),
    evaluateTeamBonus(
      "bronzeWinner",
      "Bronsvinnare",
      player.picks.bronzeWinner,
      POINTS.bronzeWinner,
      tournament.bronzeWinner,
      "bronze",
      tournament,
    ),
    evaluateTeamBonus(
      "champion",
      "Världsmästare",
      player.picks.champion,
      POINTS.champion,
      tournament.champion,
      "champion",
      tournament,
    ),
    evaluateTeamBonus(
      "mostGoalsTeam",
      "Flest mål",
      player.picks.mostGoalsTeam,
      POINTS.mostGoalsTeam,
      tournament.mostGoalsTeam,
      "open-team",
      tournament,
    ),
    evaluateTopScorer(player.picks.topScorer, tournament.topScorer),
  ];

  const earnedPoints = breakdown
    .filter((item) => item.actual)
    .reduce((sum, item) => sum + item.points, 0);
  const remainingPossible = breakdown
    .filter((item) => item.possible)
    .reduce((sum, item) => sum + item.points, 0);
  const score = player.startPoints + earnedPoints;

  return {
    player,
    rank: 0,
    score,
    startPoints: player.startPoints,
    earnedPoints,
    remainingPossible,
    maxFinal: score + remainingPossible,
    status: "",
    canWin: false,
    canReachPodium: false,
    breakdown,
  };
}

export function scoreCompetition(players: Player[], inputs: ResultInputs): CompetitionSummary {
  const rawScores = players.map((player) => scorePlayer(player, inputs));
  const sorted = rawScores.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (b.maxFinal !== a.maxFinal) return b.maxFinal - a.maxFinal;
    if (b.startPoints !== a.startPoints) return b.startPoints - a.startPoints;
    return a.player.name.localeCompare(b.player.name, "sv");
  });

  const currentLeaderScore = sorted[0]?.score ?? 0;
  const topMaxFinal = Math.max(...sorted.map((score) => score.maxFinal));
  const podiumLine = sorted[2]?.score ?? currentLeaderScore;

  const scores = sorted.map((score, index) => {
    const canWin = score.maxFinal >= currentLeaderScore;
    const canReachPodium = score.maxFinal >= podiumLine;
    let status = "Kan vinna";

    if (index === 0) status = "Leder";
    if (score.maxFinal < currentLeaderScore) status = "Matematiskt ute";
    else if (score.maxFinal < topMaxFinal - 6 && index !== 0) status = "Nästan ute";
    else if (score.remainingPossible <= 8 && index !== 0) status = "Måste träffa allt";

    return {
      ...score,
      rank: index + 1,
      canWin,
      canReachPodium,
      status,
    };
  });

  return {
    scores,
    leader: scores[0],
    currentLeaderScore,
    topMaxFinal,
    podiumLine,
    tournament: deriveTournamentState(inputs),
  };
}

export function getFocusMetrics(scores: PlayerScore[], focusId = "simon-tapajos") {
  const focus = scores.find((score) => score.player.id === focusId);
  const leader = scores[0];
  const podiumTarget = scores[2] ?? leader;

  if (!focus) {
    return {
      pointsToLead: 0,
      pointsToPodium: 0,
      focus,
      leader,
      podiumTarget,
    };
  }

  return {
    pointsToLead:
      focus.rank === 1 ? 0 : Math.max(0, leader.score + 1 - focus.score),
    pointsToPodium:
      focus.rank <= 3 ? 0 : Math.max(0, podiumTarget.score + 1 - focus.score),
    focus,
    leader,
    podiumTarget,
  };
}

export function withMatchWinner(
  inputs: ResultInputs,
  matchId: string,
  winner: Team | "",
): ResultInputs {
  return {
    ...inputs,
    matches: inputs.matches.map((match) =>
      match.id === matchId
        ? { ...match, winner: winner || undefined }
        : match,
    ),
  };
}

function strategyValue(players: Player[], inputs: ResultInputs) {
  const summary = scoreCompetition(players, inputs);
  const simon = summary.scores.find((score) => score.player.id === "simon-tapajos");
  const rivals = summary.scores.filter((score) => score.player.id !== "simon-tapajos");
  if (!simon) return -Infinity;

  const bestRivalMax = Math.max(...rivals.map((score) => score.maxFinal));
  const bestRivalScore = Math.max(...rivals.map((score) => score.score));
  return simon.maxFinal - bestRivalMax + (simon.score - bestRivalScore) * 0.35;
}

function scaleImportance(diff: number) {
  if (diff >= 10) return 5;
  if (diff >= 6) return 4;
  if (diff >= 3) return 3;
  if (diff >= 1) return 2;
  return 1;
}

export function buildRootingGuide(players: Player[], inputs: ResultInputs) {
  return inputs.matches
    .filter((match) => !match.winner)
    .map((match) => {
      const valueA = strategyValue(players, withMatchWinner(inputs, match.id, match.teamA));
      const valueB = strategyValue(players, withMatchWinner(inputs, match.id, match.teamB));
      const diff = Math.abs(valueA - valueB);
      const computedTeam = valueA >= valueB ? match.teamA : match.teamB;
      const recommendedTeam = match.rooting?.simonSide ?? (diff < 1 ? "" : computedTeam);
      const importance = match.rooting?.importance ?? scaleImportance(diff);

      return {
        match,
        recommendedTeam,
        importance,
        comment:
          match.rooting?.comment ??
          (recommendedTeam
            ? `${recommendedTeam} ger bäst simulerad Simon-position utifrån kvarvarande maxpoäng.`
            : "Låg påverkan i toppstriden."),
        computedTeam,
      };
    });
}

export function computeMatchImpact(
  players: Player[],
  before: ResultInputs,
  after: ResultInputs,
): ImpactSummary {
  const beforeScores = scoreCompetition(players, before).scores;
  const afterScores = scoreCompetition(players, after).scores;

  const rows = afterScores.map((afterScore) => {
    const beforeScore = beforeScores.find(
      (score) => score.player.id === afterScore.player.id,
    );

    return {
      player: afterScore.player,
      beforeScore: beforeScore?.score ?? afterScore.score,
      afterScore: afterScore.score,
      deltaScore: afterScore.score - (beforeScore?.score ?? afterScore.score),
      beforeMax: beforeScore?.maxFinal ?? afterScore.maxFinal,
      afterMax: afterScore.maxFinal,
      deltaMax: afterScore.maxFinal - (beforeScore?.maxFinal ?? afterScore.maxFinal),
    };
  });

  const pointEarners = rows
    .filter((row) => row.deltaScore > 0)
    .sort((a, b) => b.deltaScore - a.deltaScore);
  const maxLosers = rows
    .filter((row) => row.deltaMax < 0)
    .sort((a, b) => a.deltaMax - b.deltaMax);
  const biggestWin = pointEarners[0]?.deltaScore ?? 0;
  const biggestLoss = maxLosers[0]?.deltaMax ?? 0;

  return {
    rows,
    pointEarners,
    maxLosers,
    biggestWinners: rows.filter((row) => row.deltaScore === biggestWin && biggestWin > 0),
    biggestLosers: rows.filter((row) => row.deltaMax === biggestLoss && biggestLoss < 0),
  };
}

export function getMatchLabel(match: KnockoutMatch, winner?: Team | "") {
  return winner ? `${match.label}: ${winner}` : `${match.label}: rensad`;
}
