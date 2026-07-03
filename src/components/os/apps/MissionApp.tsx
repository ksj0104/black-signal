import { useGame } from '../../../state/gameStore';
import { CHAPTERS } from '../../../content/chapters';

const STAT_DEF: [key: 'integrity' | 'trust' | 'nullwave' | 'family', label: string, cls: string][] =
  [
    ['integrity', '증거 신뢰도', 'phos'],
    ['trust', '공적 신뢰', 'amber'],
    ['nullwave', '널웨이브 신뢰', 'violet'],
    ['family', '가족 유대', 'red'],
  ];

export function MissionApp() {
  const chapter = useGame((s) => s.chapter);
  const objectives = useGame((s) => s.objectives[chapter]);
  const stats = useGame((s) => s.stats);
  const mastery = useGame((s) => s.mastery);
  const chd = CHAPTERS[chapter];

  const objs = chd.objectives;
  const doneCount = objs.filter((o) => objectives[o.key]).length;
  const total = objs.length;
  const curIdx = objs.findIndex((o) => !objectives[o.key]);
  const caseName = chd.title.includes('—') ? chd.title.split('—')[1].trim() : chd.title;

  return (
    <div className="missionApp">
      <div className="mHead">
        <span className="eyebrow">ACTIVE CASE</span>
        <span className="mProg">
          {doneCount}
          <span className="mProgTot"> / {total}</span>
        </span>
      </div>
      <div className="mCode">{chd.code}</div>
      <div className="mTitle">{caseName}</div>
      <div className="mBarTrack">
        <i style={{ width: (doneCount / total) * 100 + '%' }} />
      </div>
      <div className="mObjs">
        {objs.map((o, i) => {
          const done = objectives[o.key];
          const cur = !done && i === curIdx;
          return (
            <div key={o.key} className={'obj' + (done ? ' done' : cur ? ' cur' : '')}>
              <span className="bx">{done ? '■' : cur ? '▸' : '·'}</span>
              <span>{o.label}</span>
            </div>
          );
        })}
      </div>
      {curIdx === -1 && <div className="mDone">전 목표 확보 — 증거 보드에서 연결을 완성하세요.</div>}

      <h4 className="mSection">수사 상태</h4>
      {STAT_DEF.map(([k, label, cls]) => (
        <div className="statRow" key={k}>
          <div className="lbl">
            <span>{label}</span>
            <span>{stats[k]}</span>
          </div>
          <div className={'bar ' + cls}>
            <i style={{ width: stats[k] + '%' }} />
          </div>
        </div>
      ))}
      <div className="statRow">
        <div className="lbl">
          <span>수사관 숙련도</span>
          <span>{mastery}</span>
        </div>
        <div className="bar phos">
          <i style={{ width: mastery + '%' }} />
        </div>
      </div>

      <h4 className="mSection">막혔다면</h4>
      <div className="dimNote">
        터미널에 <b className="c-phos">hint</b> (숙련도 −5) · <b className="c-phos">Tab</b> 자동완성
        · <b className="c-phos">↑↓</b> 기록 · <b className="c-phos">man &lt;명령&gt;</b>
      </div>
    </div>
  );
}
