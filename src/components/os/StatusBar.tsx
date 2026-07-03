import { useGame } from '../../state/gameStore';
import { CHAPTERS } from '../../content/chapters';
import { sClick } from '../../engine/audio/audio';

/** 케이스 코드에서 게임 내 날짜 유도 (예: AR-2026-0731 → 2026-07-31) */
function caseDate(code: string): string {
  const m = code.match(/(\d{4})-(\d{2})(\d{2})/);
  return m ? `${m[1]}-${m[2]}-${m[3]}` : '2026-06-30';
}

export function StatusBar() {
  const chapter = useGame((s) => s.chapter);
  const setScreen = useGame((s) => s.setScreen);
  const setCfgOpen = useGame((s) => s.setCfgOpen);
  const chd = CHAPTERS[chapter];
  const caseName = chd.title.includes('—') ? chd.title.split('—')[1].trim() : chd.title;

  return (
    <header id="osBar">
      <span className="osBrand">
        <i className="osDot" aria-hidden />
        AEGIS<b>OS</b>
      </span>
      <span className="osCase">
        {chd.code} <em>·</em> {caseName}
      </span>
      <span className="osRight">
        <span className="osClock" aria-label="게임 내 시각">
          {caseDate(chd.code)} <b>02:41</b>
        </span>
        <button
          className="osBarBtn"
          onClick={() => {
            sClick();
            setCfgOpen(true);
          }}
        >
          설정
        </button>
        <button
          className="osBarBtn"
          onClick={() => {
            sClick();
            setScreen('scene');
          }}
        >
          ◂ 데스크 이탈
        </button>
      </span>
    </header>
  );
}
