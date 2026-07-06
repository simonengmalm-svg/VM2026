import type { Player, Team } from "../types";
import { isTeamAlive, type TournamentState } from "../lib/scoring";

type LiveTeamsProps = {
  players: Player[];
  tournament: TournamentState;
};

const simonSpotlightTeams = [
  "Frankrike",
  "Portugal",
  "England",
  "USA",
  "Argentina",
  "Spanien",
  "Brasilien",
  "Nederländerna",
];

function uniqueTeams(player: Player) {
  return [
    ...new Set([
      ...player.picks.quarterFinalists,
      ...player.picks.semiFinalists,
      ...player.picks.finalists,
      player.picks.bronzeWinner,
      player.picks.champion,
      player.picks.mostGoalsTeam,
    ]),
  ];
}

function TeamBadge({ team, alive }: { team: Team; alive: boolean }) {
  return (
    <span className={alive ? "team-badge alive" : "team-badge dead"}>
      {alive ? "🟢" : "🔴"} {team}
    </span>
  );
}

export function LiveTeams({ players, tournament }: LiveTeamsProps) {
  return (
    <section className="panel live-teams-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">🟢 Levande lag</p>
          <h2>Radernas liv och död</h2>
        </div>
      </div>

      <div className="simon-spotlight">
        <h3>Simon extra tydligt</h3>
        <div className="team-badges">
          {simonSpotlightTeams.map((team) => (
            <TeamBadge
              key={team}
              team={team}
              alive={isTeamAlive(team, tournament)}
            />
          ))}
        </div>
      </div>

      <div className="player-team-grid">
        {players.map((player) => (
          <article className={player.focus ? "team-card focus-card" : "team-card"} key={player.id}>
            <h3>{player.name}</h3>
            <div className="team-badges">
              {uniqueTeams(player).map((team) => (
                <TeamBadge
                  key={`${player.id}-${team}`}
                  team={team}
                  alive={isTeamAlive(team, tournament)}
                />
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
