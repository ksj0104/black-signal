import { useGame } from '../state/gameStore';
import { CHAPTERS } from '../content/chapters';

export function CasePane() {
  const chapter = useGame((s) => s.chapter);
  const obj = useGame((s) => s.objectives[chapter]);
  const unlocked = useGame((s) => s.boardUnlocked[chapter]);
  const chd = CHAPTERS[chapter];
  const cs = chd.caseSummary;
  const caseName = chd.title.includes('—') ? chd.title.split('—')[1].trim() : chd.title;
  const f = (k: string) => (obj[k] ? '확보' : '미확보');

  return (
    <div className="pane on" id="paneCase">
      <div id="casePane">
        <h3>
          {chd.code} · {caseName.toUpperCase()}
        </h3>
        <div>{cs.target}</div>
        <h3>확보 단서</h3>
        <div>
          {cs.clues.map((c) => (
            <div key={c.key}>
              · {c.label} — {f(c.key)}
            </div>
          ))}
        </div>
        <h3>현재 가설</h3>
        <div
          dangerouslySetInnerHTML={{
            __html: unlocked ? cs.hypothesis.unlocked : cs.hypothesis.locked,
          }}
        />
        <h3>안전 고지</h3>
        <div className="dimNote" dangerouslySetInnerHTML={{ __html: cs.safety }} />
      </div>
    </div>
  );
}
