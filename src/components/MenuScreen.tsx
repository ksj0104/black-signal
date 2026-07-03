import { useGame } from '../state/gameStore';
import { useUi } from '../state/uiStore';
import { loadRaw } from '../engine/save/save';
import { sClick } from '../engine/audio/audio';
import { CHAPTERS } from '../content/chapters';

/** 저장 데이터에서 이어하기 라벨 생성 (파싱 실패 시 기본 문구) */
function saveLabel(): string | null {
  const raw = loadRaw();
  if (!raw) return null;
  try {
    const p = JSON.parse(raw);
    const chd = CHAPTERS[p.chapter as number];
    if (!chd) return '저장 지점에서 계속';
    const name = chd.title.includes('—') ? chd.title.split('—')[1].trim() : chd.title;
    return `${chd.code} · ${name}`;
  } catch {
    return '저장 지점에서 계속';
  }
}

export function MenuScreen() {
  const newGame = useGame((s) => s.newGame);
  const loadGame = useGame((s) => s.loadGame);
  const setScreen = useGame((s) => s.setScreen);
  const setCfgOpen = useGame((s) => s.setCfgOpen);
  const setToast = useGame((s) => s.setToast);
  const save = saveLabel();

  const onContinue = () => {
    sClick();
    useUi.getState().resetUi();
    if (!loadGame()) {
      setToast('저장 데이터가 없습니다');
      return;
    }
    const s = useGame.getState();
    setToast('불러오기 완료');
    const chd = CHAPTERS[s.chapter];
    if (s.flags[chd.doneFlag]) setScreen('end');
    else if (s.chapter >= 1) setScreen('work');
    else if (s.flags.deskUnlocked) setScreen('work');
    else if (s.flags.introDone) setScreen('scene');
    else setScreen('intro');
    if (!s.cwd.startsWith(CHAPTERS[s.chapter].root))
      useGame.setState({ cwd: CHAPTERS[s.chapter].root });
  };

  return (
    <main id="menu" className="screen on">
      <div className="menuRain" aria-hidden />
      <div className="menuScan" aria-hidden />
      <div className="menuCore">
        <div className="menuEyebrow">AEGIS RESPONSE — FIELD WORKSTATION</div>
        <h1 className="menuTitle">
          BLACK
          <br />
          SIGNAL
        </h1>
        <div className="menuSub">THE ECHO PROTOCOL</div>
        <nav className="menuNav" aria-label="메인 메뉴">
          <button
            className="menuBtn primary"
            onClick={() => {
              sClick();
              useUi.getState().resetUi();
              newGame();
            }}
          >
            <span className="menuBtnKey">새 수사 시작</span>
            <span className="menuBtnSub">프롤로그 — 걸려오지 않은 전화</span>
          </button>
          <button className="menuBtn" disabled={!save} onClick={onContinue}>
            <span className="menuBtnKey">이어하기</span>
            <span className="menuBtnSub">{save ?? '저장 데이터 없음'}</span>
          </button>
          <button
            className="menuBtn"
            onClick={() => {
              sClick();
              setCfgOpen(true);
            }}
          >
            <span className="menuBtnKey">설정</span>
            <span className="menuBtnSub">글자 크기 · 고대비 · 모션 · 음량</span>
          </button>
        </nav>
      </div>
      <div className="menuFoot">
        모든 해킹·수사 활동은 허구의 데이터 위에서만 동작하는 시뮬레이션입니다 · 실제
        시스템·네트워크·인물과 무관 · Build v1.0
      </div>
    </main>
  );
}
