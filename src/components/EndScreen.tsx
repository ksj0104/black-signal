import { useGame } from '../state/gameStore';
import { CHAPTERS } from '../content/chapters';
import { deriveEnding, resolveEnding } from '../engine/ending';
import { ENDINGS } from '../content/endings';
import { withName } from '../engine/persona';
import { sClick } from '../engine/audio/audio';

const STAT_ROWS: ['integrity' | 'trust' | 'nullwave' | 'family', string][] = [
  ['integrity', '증거 신뢰도'],
  ['trust', '공적 신뢰'],
  ['nullwave', '널웨이브 신뢰'],
  ['family', '가족 유대'],
];

/** 최종장 전용 — 엔딩 결정 함수(A~D)와 에필로그 렌더 */
function FinalEnding() {
  const stats = useGame((s) => s.stats);
  const flags = useGame((s) => s.flags);
  const pname = useGame((s) => s.cfg.name);
  const id = resolveEnding(stats, flags);
  const d = deriveEnding(flags);
  const E = ENDINGS[id];
  const marks = [
    d.witnessSaved && '목격자 보호 성공',
    d.evidenceClean && '증거 체인 무결',
    d.allyGaShin && '윤가원 협조 증언',
    d.recklessLeak && '무모한 공개',
  ].filter(Boolean) as string[];

  return (
    <div className="endFinal">
      <div className="endingCode">{E.code}</div>
      <h3 className="endingTitle">{E.title}</h3>
      <p className="endingBody" dangerouslySetInnerHTML={{ __html: withName(E.body(d), pname) }} />
      {marks.length > 0 && (
        <div className="endingMarks">
          {marks.map((m) => (
            <span key={m} className={'endingMark' + (m === '무모한 공개' ? ' bad' : '')}>
              {m}
            </span>
          ))}
        </div>
      )}
      <div className="endingEpi">
        <b>에필로그</b>
        <p dangerouslySetInnerHTML={{ __html: withName(E.epilogue(d), pname) }} />
      </div>
      <div className="dimNote">· BLACK SIGNAL — 캠페인 완결 · 다른 선택은 다른 엔딩으로 이어집니다 ·</div>
    </div>
  );
}

export function EndScreen() {
  const s = useGame();
  const chd = CHAPTERS[s.chapter];
  const e = chd.ending;
  const nextId = s.chapter + 1;
  const hasNext = CHAPTERS[nextId] != null;
  const pick = e.choices[s.flags[e.choiceFlag] as string] ?? '';

  return (
    <section id="end" className="screen on">
      <div className="endFrame">
        <div className="endStamp" aria-hidden>
          CASE CLOSED
        </div>
        <div className="endEyebrow">{chd.code} — 사건 종결 보고</div>
        <h2 className="endTitle">{e.doneTitle}</h2>
        <div className="endSummary">{e.summary}</div>
        {pick && (
          <div className="endChoice">
            결정 기록 — <b>{pick}</b>
          </div>
        )}

        <div className="endStats">
          {STAT_ROWS.map(([k, label]) => (
            <div className="endStat" key={k}>
              <span className="endStatLbl">{label}</span>
              <span className="endStatVal">{s.stats[k]}</span>
            </div>
          ))}
          <div className="endStat">
            <span className="endStatLbl">숙련도 (힌트 {s.hintsUsed}회)</span>
            <span className="endStatVal">{s.mastery}</span>
          </div>
        </div>

        {e.finalEnding && <FinalEnding />}
        {/* 최종장이라도 다음 시즌 챕터가 구현돼 있으면 에필로그 아래에 예고·시작 버튼을 노출 */}
        {(!e.finalEnding || hasNext) && (
          <div className="endNext">
            <b>{e.nextTitle}</b>
            <p dangerouslySetInnerHTML={{ __html: e.nextBody }} />
            {hasNext ? (
              <>
                {e.nextNote && <div className="dimNote">{e.nextNote}</div>}
                <button
                  className="primary endGo"
                  onClick={() => {
                    sClick();
                    s.startChapter(nextId);
                  }}
                >
                  CHAPTER {nextId} 시작 ▸
                </button>
              </>
            ) : (
              e.pendingNote && <div className="dimNote">{e.pendingNote}</div>
            )}
          </div>
        )}

        <div className="endBtns">
          <button
            onClick={() => {
              sClick();
              s.saveGame();
            }}
          >
            진행 상황 저장
          </button>
          <button
            onClick={() => {
              sClick();
              s.setScreen('menu');
            }}
          >
            메인 메뉴
          </button>
        </div>
      </div>
    </section>
  );
}
