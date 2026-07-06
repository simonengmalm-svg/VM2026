import type { Player, ScorerStanding, Team } from "../types";
import { isTeamAlive, type TournamentState } from "../lib/scoring";

type BonusMapProps = {
  players: Player[];
  scorerTable: ScorerStanding[];
  scorerNations: Record<string, Team>;
  tournament: TournamentState;
  onScorerGoalsChange: (name: string, goals: number) => void;
};

function LiveBadge({ alive }: { alive: boolean }) {
  return <span className={alive ? "live-badge" : "dead-badge"}>{alive ? "🟢 Lever" : "🔴 Ute"}</span>;
}

export function BonusMap({
  players,
  scorerTable,
  scorerNations,
  tournament,
  onScorerGoalsChange,
}: BonusMapProps) {
  const sortedScorers = [...scorerTable].sort((a, b) => b.goals - a.goals || a.name.localeCompare(b.name, "sv"));

  return (
    <section className="panel bonus-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">⚽ Bonuskarta</p>
          <h2>Skyttekung, mål-lag och mästare</h2>
        </div>
      </div>

      <div className="bonus-layout">
        <div className="bonus-table-group">
          <h3>Skyttekungstips</h3>
          <table className="mini-table">
            <tbody>
              {players.map((player) => {
                const nation = scorerNations[player.picks.topScorer];
                return (
                  <tr key={`${player.id}-topscorer`}>
                    <td>{player.name}</td>
                    <td>{player.picks.topScorer}</td>
                    <td>{nation ? <LiveBadge alive={isTeamAlive(nation, tournament)} /> : "Öppen"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="bonus-table-group">
          <h3>Flest mål</h3>
          <table className="mini-table">
            <tbody>
              {players.map((player) => (
                <tr key={`${player.id}-goals`}>
                  <td>{player.name}</td>
                  <td>{player.picks.mostGoalsTeam}</td>
                  <td>
                    <LiveBadge alive={isTeamAlive(player.picks.mostGoalsTeam, tournament)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bonus-table-group">
          <h3>Världsmästare</h3>
          <table className="mini-table">
            <tbody>
              {players.map((player) => (
                <tr key={`${player.id}-champion`}>
                  <td>{player.name}</td>
                  <td>{player.picks.champion}</td>
                  <td>
                    <LiveBadge alive={isTeamAlive(player.picks.champion, tournament)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bonus-table-group scorer-editor">
          <h3>Aktuell skyttekungsliga</h3>
          <div className="scorer-list">
            {sortedScorers.map((scorer) => (
              <label className="scorer-row" key={scorer.name}>
                <span>
                  <b>{scorer.name}</b>
                  <small>{scorer.nation}</small>
                </span>
                <input
                  type="number"
                  min="0"
                  value={scorer.goals}
                  onChange={(event) =>
                    onScorerGoalsChange(scorer.name, Number(event.target.value))
                  }
                />
              </label>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
