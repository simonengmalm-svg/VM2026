import type { PlayerScore } from "../lib/scoring";

type LeaderboardProps = {
  scores: PlayerScore[];
  pointsToLead: number;
  pointsToPodium: number;
};

const statusClass = (status: string) => {
  if (status === "Leder") return "status status-leads";
  if (status === "Matematiskt ute") return "status status-out";
  if (status === "Nästan ute") return "status status-warning";
  return "status status-live";
};

export function Leaderboard({
  scores,
  pointsToLead,
  pointsToPodium,
}: LeaderboardProps) {
  const simon = scores.find((score) => score.player.id === "simon-tapajos");

  return (
    <section className="panel leaderboard-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">🏆 Aktuell topplista</p>
          <h2>Live-tabell</h2>
        </div>
        {simon && (
          <div className="simon-mini">
            <span>🔥 Simon</span>
            <strong>{simon.score} p</strong>
            <small>Till ledning {pointsToLead} p</small>
            <small>Till pall {pointsToPodium} p</small>
          </div>
        )}
      </div>

      <div className="table-wrap">
        <table className="leaderboard-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Deltagare</th>
              <th>Poäng</th>
              <th>Max</th>
              <th>Kvar</th>
              <th>Pall</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {scores.map((score) => (
              <tr
                key={score.player.id}
                data-testid={`leaderboard-${score.player.id}`}
                className={score.player.focus ? "focus-row" : ""}
                style={{ "--player-accent": score.player.accent } as React.CSSProperties}
              >
                <td className="rank-cell">{score.rank}</td>
                <td>
                  <div className="player-cell">
                    <span className="player-dot" />
                    <span>{score.player.name}</span>
                    {score.player.focus && <b>Simon</b>}
                  </div>
                </td>
                <td className="score-cell">{score.score}</td>
                <td>{score.maxFinal}</td>
                <td>{score.remainingPossible}</td>
                <td>{score.canReachPodium ? "🟢 Ja" : "🔴 Nej"}</td>
                <td>
                  <span className={statusClass(score.status)}>{score.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
