import { useMemo, useState } from "react";
import { BonusMap } from "./components/BonusMap";
import { InputPanel } from "./components/InputPanel";
import { Leaderboard } from "./components/Leaderboard";
import { LiveTeams } from "./components/LiveTeams";
import { MatchImpact } from "./components/MatchImpact";
import { PlayerPath } from "./components/PlayerPath";
import { RootingGuide } from "./components/RootingGuide";
import {
  beforeNorwayBrazilInputs,
  initialAppState,
  initialResultInputs,
} from "./data/matches";
import { players, scorerNations } from "./data/players";
import {
  buildRootingGuide,
  computeMatchImpact,
  deriveTournamentState,
  getFocusMetrics,
  getMatchLabel,
  scoreCompetition,
} from "./lib/scoring";
import type { AppState, ResultInputs, Team } from "./types";

type StageField = "semiFinalists" | "finalists";
type BonusField = "bronzeWinner" | "champion" | "mostGoalsTeam" | "topScorer";

function toResultInputs(state: AppState): ResultInputs {
  return {
    matches: state.matches,
    baseEliminatedTeams: state.baseEliminatedTeams,
    semiFinalists: state.semiFinalists,
    finalists: state.finalists,
    bronzeWinner: state.bronzeWinner,
    champion: state.champion,
    mostGoalsTeam: state.mostGoalsTeam,
    topScorer: state.topScorer,
  };
}

function setSlot(values: Team[], index: number, value: Team | "") {
  const next = [...values];
  next[index] = value;
  return next.filter(Boolean);
}

function collectTeamOptions(state: AppState) {
  const teams = new Set<Team>();

  state.matches.forEach((match) => {
    teams.add(match.teamA);
    teams.add(match.teamB);
    if (match.winner) teams.add(match.winner);
  });
  state.baseEliminatedTeams.forEach((team) => teams.add(team));
  state.scorerTable.forEach((scorer) => teams.add(scorer.nation));

  players.forEach((player) => {
    player.picks.quarterFinalists.forEach((team) => teams.add(team));
    player.picks.semiFinalists.forEach((team) => teams.add(team));
    player.picks.finalists.forEach((team) => teams.add(team));
    teams.add(player.picks.bronzeWinner);
    teams.add(player.picks.champion);
    teams.add(player.picks.mostGoalsTeam);
  });

  return [...teams].sort((a, b) => a.localeCompare(b, "sv"));
}

function collectTopScorerOptions(state: AppState) {
  const names = new Set<string>();
  state.scorerTable.forEach((scorer) => names.add(scorer.name));
  players.forEach((player) => names.add(player.picks.topScorer));
  return [...names].sort((a, b) => a.localeCompare(b, "sv"));
}

export function App() {
  const [state, setState] = useState<AppState>(initialAppState);
  const [lastImpact, setLastImpact] = useState({
    title: "Norge-Brasilien: Norge",
    before: beforeNorwayBrazilInputs,
  });

  const resultInputs = useMemo(() => toResultInputs(state), [state]);
  const summary = useMemo(
    () => scoreCompetition(players, resultInputs),
    [resultInputs],
  );
  const focusMetrics = useMemo(
    () => getFocusMetrics(summary.scores),
    [summary.scores],
  );
  const rootingGuide = useMemo(
    () => buildRootingGuide(players, resultInputs),
    [resultInputs],
  );
  const impact = useMemo(
    () => computeMatchImpact(players, lastImpact.before, resultInputs),
    [lastImpact.before, resultInputs],
  );
  const teamOptions = useMemo(() => collectTeamOptions(state), [state]);
  const topScorerOptions = useMemo(() => collectTopScorerOptions(state), [state]);
  const tournament = useMemo(() => deriveTournamentState(resultInputs), [resultInputs]);

  const commit = (next: AppState, title: string) => {
    setLastImpact({ title, before: resultInputs });
    setState(next);
  };

  const handleMatchWinner = (matchId: string, winner: Team | "") => {
    const match = state.matches.find((item) => item.id === matchId);
    if (!match) return;

    const nextState = {
      ...state,
      matches: state.matches.map((item) =>
        item.id === matchId ? { ...item, winner: winner || undefined } : item,
      ),
    };

    commit(nextState, getMatchLabel(match, winner));
  };

  const handleStagePick = (field: StageField, index: number, value: Team | "") => {
    const title = `${field === "semiFinalists" ? "Semifinal" : "Final"} ${index + 1}: ${
      value || "rensad"
    }`;

    commit(
      {
        ...state,
        [field]: setSlot(state[field], index, value),
      },
      title,
    );
  };

  const handleBonusChange = (field: BonusField, value: string) => {
    const labels: Record<BonusField, string> = {
      bronzeWinner: "Bronsvinnare",
      champion: "Världsmästare",
      mostGoalsTeam: "Flest mål",
      topScorer: "Skyttekung",
    };

    commit(
      {
        ...state,
        [field]: value,
      },
      `${labels[field]}: ${value || "rensad"}`,
    );
  };

  const handleScorerGoalsChange = (name: string, goals: number) => {
    setState((current) => ({
      ...current,
      scorerTable: current.scorerTable.map((scorer) =>
        scorer.name === name ? { ...scorer, goals } : scorer,
      ),
    }));
  };

  const handleReset = () => {
    setLastImpact({
      title: "Norge-Brasilien: Norge",
      before: beforeNorwayBrazilInputs,
    });
    setState(initialAppState);
  };

  const aliveTitleRace = summary.scores
    .filter((score) => score.canWin)
    .map((score) => score.player.name);
  const eliminatedTitleRace = summary.scores
    .filter((score) => !score.canWin)
    .map((score) => score.player.name);

  return (
    <div className="app-shell">
      <header className="studio-hero">
        <div className="hero-copy">
          <p className="live-tag">🏆 VM-tipset Live</p>
          <h1>VM-tipset 2026 – Live Dashboard</h1>
          <p>
            Toppspelarnas poäng, maxpoäng och Simons väg uppdateras direkt när
            resultaten matas in.
          </p>
        </div>

        <div className="hero-board">
          <div>
            <span>Leder nu</span>
            <strong>{summary.leader.player.name}</strong>
            <b>{summary.leader.score} p</b>
          </div>
          <div>
            <span>Simon till ledning</span>
            <strong>{focusMetrics.pointsToLead} p</strong>
            <b>Max {focusMetrics.focus?.maxFinal ?? 0}</b>
          </div>
          <div>
            <span>Simon till pallplats</span>
            <strong>{focusMetrics.pointsToPodium} p</strong>
            <b>Rank {focusMetrics.focus?.rank ?? "-"}</b>
          </div>
        </div>
      </header>

      <section className="race-strip">
        <div>
          <span>🟢 Kan fortfarande vinna</span>
          <strong>{aliveTitleRace.join(", ")}</strong>
        </div>
        <div>
          <span>🔴 Matematiskt utslagna</span>
          <strong>{eliminatedTitleRace.length ? eliminatedTitleRace.join(", ") : "Ingen"}</strong>
        </div>
        <div>
          <span>📈 Kvartsfinalister klara</span>
          <strong>{tournament.quarterFinalists.join(", ")}</strong>
        </div>
      </section>

      <main className="dashboard-grid">
        <div className="main-stack">
          <Leaderboard
            scores={summary.scores}
            pointsToLead={focusMetrics.pointsToLead}
            pointsToPodium={focusMetrics.pointsToPodium}
          />
          <MatchImpact title={lastImpact.title} impact={impact} />
          <LiveTeams players={players} tournament={summary.tournament} />
        </div>

        <aside className="side-stack">
          <InputPanel
            state={state}
            teamOptions={teamOptions}
            topScorerOptions={topScorerOptions}
            onMatchWinner={handleMatchWinner}
            onStagePick={handleStagePick}
            onBonusChange={handleBonusChange}
            onReset={handleReset}
          />
          <RootingGuide guide={rootingGuide} />
          <PlayerPath summary={summary} />
        </aside>
      </main>

      <div className="wide-stack">
        <BonusMap
          players={players}
          scorerTable={state.scorerTable}
          scorerNations={scorerNations}
          tournament={summary.tournament}
          onScorerGoalsChange={handleScorerGoalsChange}
        />
      </div>
    </div>
  );
}
