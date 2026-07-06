import type { ImpactSummary } from "../lib/scoring";

type MatchImpactProps = {
  title: string;
  impact: ImpactSummary;
};

function signed(value: number) {
  if (value > 0) return `+${value}`;
  return `${value}`;
}

export function MatchImpact({ title, impact }: MatchImpactProps) {
  const noChange = impact.pointEarners.length === 0 && impact.maxLosers.length === 0;

  return (
    <section className="panel impact-panel">
      <div className="panel-heading compact">
        <div>
          <p className="eyebrow">📉 Matchens effekt</p>
          <h2>{title}</h2>
        </div>
      </div>

      {noChange ? (
        <p className="empty-state">Inga faktiska poäng eller maxpoäng ändrades.</p>
      ) : (
        <>
          <div className="impact-kpis">
            <div>
              <span>Största vinnare</span>
              <strong>
                {impact.biggestWinners.map((row) => row.player.name).join(", ") || "-"}
              </strong>
              <small>
                {impact.biggestWinners[0]
                  ? `${signed(impact.biggestWinners[0].deltaScore)} faktisk poäng`
                  : "0"}
              </small>
            </div>
            <div>
              <span>Största förlorare</span>
              <strong>
                {impact.biggestLosers.map((row) => row.player.name).join(", ") || "-"}
              </strong>
              <small>
                {impact.biggestLosers[0]
                  ? `${signed(impact.biggestLosers[0].deltaMax)} maxpoäng`
                  : "0"}
              </small>
            </div>
          </div>

          <div className="impact-columns">
            <div>
              <h3>Vem fick poäng?</h3>
              {impact.pointEarners.length ? (
                <ul className="impact-list">
                  {impact.pointEarners.map((row) => (
                    <li key={`${row.player.id}-points`}>
                      <span>{row.player.name}</span>
                      <b>{signed(row.deltaScore)} p</b>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="muted">Ingen fick faktisk poäng.</p>
              )}
            </div>
            <div>
              <h3>Vem tappade maxpoäng?</h3>
              {impact.maxLosers.length ? (
                <ul className="impact-list">
                  {impact.maxLosers.map((row) => (
                    <li key={`${row.player.id}-max`}>
                      <span>{row.player.name}</span>
                      <b>{signed(row.deltaMax)} p</b>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="muted">Ingen tappade maxpoäng.</p>
              )}
            </div>
          </div>
        </>
      )}
    </section>
  );
}
