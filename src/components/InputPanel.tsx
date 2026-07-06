import type { AppState, Team } from "../types";

type StageField = "semiFinalists" | "finalists";
type BonusField = "bronzeWinner" | "champion" | "mostGoalsTeam" | "topScorer";

type InputPanelProps = {
  state: AppState;
  teamOptions: Team[];
  topScorerOptions: string[];
  onMatchWinner: (matchId: string, winner: Team | "") => void;
  onStagePick: (field: StageField, index: number, value: Team | "") => void;
  onBonusChange: (field: BonusField, value: string) => void;
  onReset: () => void;
};

function StageSlots({
  title,
  icon,
  values,
  count,
  options,
  onChange,
}: {
  title: string;
  icon: string;
  values: Team[];
  count: number;
  options: Team[];
  onChange: (index: number, value: Team | "") => void;
}) {
  return (
    <div className="input-group">
      <h3>
        {icon} {title}
      </h3>
      <div className="slot-grid">
        {Array.from({ length: count }).map((_, index) => (
          <label key={`${title}-${index}`}>
            <span>{index + 1}</span>
            <select
              value={values[index] ?? ""}
              onChange={(event) => onChange(index, event.target.value)}
            >
              <option value="">Öppen</option>
              {options.map((team) => (
                <option key={`${title}-${index}-${team}`} value={team}>
                  {team}
                </option>
              ))}
            </select>
          </label>
        ))}
      </div>
    </div>
  );
}

export function InputPanel({
  state,
  teamOptions,
  topScorerOptions,
  onMatchWinner,
  onStagePick,
  onBonusChange,
  onReset,
}: InputPanelProps) {
  const playedMatches = state.matches.filter((match) => match.winner);
  const openMatches = state.matches.filter((match) => !match.locked);

  return (
    <section className="panel input-panel">
      <div className="panel-heading compact">
        <div>
          <p className="eyebrow">⚽ Inputpanel</p>
          <h2>Resultatkontroll</h2>
        </div>
        <button className="ghost-button" type="button" onClick={onReset}>
          🔁 Nollställ
        </button>
      </div>

      <div className="input-group">
        <h3>Redan spelade</h3>
        <div className="locked-results">
          {playedMatches.map((match) => (
            <span key={match.id}>
              {match.label}: <b>{match.winner}</b>
            </span>
          ))}
        </div>
      </div>

      <div className="input-group">
        <h3>Återstående åttondelar</h3>
        <div className="match-inputs">
          {openMatches.map((match) => (
            <label key={match.id}>
              <span>{match.label}</span>
              <select
                data-testid={`match-${match.id}`}
                value={match.winner ?? ""}
                onChange={(event) => onMatchWinner(match.id, event.target.value)}
              >
                <option value="">Välj vinnare</option>
                <option value={match.teamA}>{match.teamA}</option>
                <option value={match.teamB}>{match.teamB}</option>
              </select>
            </label>
          ))}
        </div>
      </div>

      <StageSlots
        title="Semifinallag"
        icon="🔥"
        values={state.semiFinalists}
        count={4}
        options={teamOptions}
        onChange={(index, value) => onStagePick("semiFinalists", index, value)}
      />

      <StageSlots
        title="Finallag"
        icon="🏆"
        values={state.finalists}
        count={2}
        options={teamOptions}
        onChange={(index, value) => onStagePick("finalists", index, value)}
      />

      <div className="input-group">
        <h3>Bonusutfall</h3>
        <div className="bonus-input-grid">
          <label>
            <span>Bronsvinnare</span>
            <select
              data-testid="bonus-bronzeWinner"
              value={state.bronzeWinner}
              onChange={(event) => onBonusChange("bronzeWinner", event.target.value)}
            >
              <option value="">Öppen</option>
              {teamOptions.map((team) => (
                <option key={`bronze-${team}`} value={team}>
                  {team}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Världsmästare</span>
            <select
              data-testid="bonus-champion"
              value={state.champion}
              onChange={(event) => onBonusChange("champion", event.target.value)}
            >
              <option value="">Öppen</option>
              {teamOptions.map((team) => (
                <option key={`champion-${team}`} value={team}>
                  {team}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Lag med flest mål</span>
            <select
              data-testid="bonus-mostGoalsTeam"
              value={state.mostGoalsTeam}
              onChange={(event) => onBonusChange("mostGoalsTeam", event.target.value)}
            >
              <option value="">Öppen</option>
              {teamOptions.map((team) => (
                <option key={`goals-${team}`} value={team}>
                  {team}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Skyttekung</span>
            <select
              data-testid="bonus-topScorer"
              value={state.topScorer}
              onChange={(event) => onBonusChange("topScorer", event.target.value)}
            >
              <option value="">Öppen</option>
              {topScorerOptions.map((name) => (
                <option key={`topscorer-${name}`} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>
    </section>
  );
}
