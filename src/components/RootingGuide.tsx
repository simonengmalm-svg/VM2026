import type { buildRootingGuide } from "../lib/scoring";

type RootingItem = ReturnType<typeof buildRootingGuide>[number];

type RootingGuideProps = {
  guide: RootingItem[];
};

export function RootingGuide({ guide }: RootingGuideProps) {
  return (
    <section className="panel">
      <div className="panel-heading compact">
        <div>
          <p className="eyebrow">🔥 Rooting Guide</p>
          <h2>Hejaklacksindex</h2>
        </div>
      </div>

      <div className="rooting-list">
        {guide.map((item) => (
          <article className="rooting-item" key={item.match.id}>
            <div className="match-line">
              <strong>{item.match.label}</strong>
              <span>{item.importance}/5</span>
            </div>
            <div className="rooting-call">
              {item.recommendedTeam ? (
                <>
                  Heja på <b>{item.recommendedTeam}</b>.
                </>
              ) : (
                <b>Betydelse låg.</b>
              )}
            </div>
            <div className="importance-meter" aria-label={`Betydelse ${item.importance} av 5`}>
              {Array.from({ length: 5 }).map((_, index) => (
                <span
                  className={index < item.importance ? "filled" : ""}
                  key={`${item.match.id}-${index}`}
                />
              ))}
            </div>
            <p>{item.comment}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
