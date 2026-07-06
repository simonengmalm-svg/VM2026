import { isTeamAlive, type CompetitionSummary } from "../lib/scoring";

type PlayerPathProps = {
  summary: CompetitionSummary;
};

const pathKeys = [
  {
    label: "Frankrike måste gå långt/vinna",
    team: "Frankrike",
    icon: "🏆",
  },
  {
    label: "Mbappé behöver vinna skytteligan",
    team: "Frankrike",
    icon: "⚽",
  },
  {
    label: "Portugal bör slå Spanien",
    team: "Portugal",
    icon: "🔥",
  },
  {
    label: "USA som differentierare mot Belgien",
    team: "USA",
    icon: "📈",
  },
  {
    label: "England bör slå Mexiko",
    team: "England",
    icon: "🟢",
  },
];

export function PlayerPath({ summary }: PlayerPathProps) {
  const simon = summary.scores.find((score) => score.player.id === "simon-tapajos");

  return (
    <section className="panel path-panel">
      <div className="panel-heading compact">
        <div>
          <p className="eyebrow">📈 Simon Tapajos</p>
          <h2>Vägen till 7 000 kr</h2>
        </div>
      </div>

      {simon && (
        <div className="path-scoreline">
          <span>Nu {simon.score} p</span>
          <span>Max {simon.maxFinal} p</span>
          <span>{simon.status}</span>
        </div>
      )}

      <div className="path-list">
        {pathKeys.map((key) => {
          const alive = isTeamAlive(key.team, summary.tournament);
          return (
            <div className="path-row" key={key.label}>
              <span className="path-icon">{key.icon}</span>
              <span>{key.label}</span>
              <b className={alive ? "alive-text" : "dead-text"}>
                {alive ? "🟢 Lever" : "🔴 Stängd"}
              </b>
            </div>
          );
        })}
      </div>
    </section>
  );
}
