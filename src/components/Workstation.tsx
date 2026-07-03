import { useEffect, useLayoutEffect, useRef } from 'react';
import { useGame } from '../state/gameStore';
import { CHAPTERS } from '../content/chapters';
import { useUi } from '../state/uiStore';
import { WindowFrame } from './os/WindowFrame';
import { StatusBar } from './os/StatusBar';
import { Taskbar } from './os/Taskbar';
import { BootScreen } from './os/BootScreen';
import { NotificationStack } from './os/NotificationStack';
import { Terminal } from './terminal/Terminal';
import { EvidenceBoard } from './evidence-board/EvidenceBoard';
import { CasePane } from './CasePane';
import { MissionApp } from './os/apps/MissionApp';
import { MessengerApp } from './os/apps/MessengerApp';
import { CctvApp } from './os/apps/CctvApp';

/** AEGIS OS — 수사 파트 전체를 감싸는 가상 데스크톱 */
export function Workstation() {
  const chapter = useGame((s) => s.chapter);
  const greeted = useGame((s) => s.greeted[chapter]);
  const boardUnlocked = useGame((s) => s.boardUnlocked[chapter]);
  const dialogue = useGame((s) => s.dialogue);
  const termPrint = useGame((s) => s.termPrint);
  const openDialogue = useGame((s) => s.openDialogue);
  const laidOut = useUi((s) => s.laidOut);
  const layout = useUi((s) => s.layout);
  const openWin = useUi((s) => s.openWin);
  const deskRef = useRef<HTMLDivElement>(null);
  const prevUnlock = useRef(boardUnlocked);

  // 데스크톱 크기에 맞춘 기본 창 배치 (세션 1회)
  useLayoutEffect(() => {
    const el = deskRef.current;
    if (!el || laidOut) return;
    layout(el.clientWidth, el.clientHeight);
  }, [laidOut, layout]);

  // 챕터별 그리팅 + 오프닝 대화 (전부 챕터 데이터 기반)
  // StrictMode 의 effect 이중 실행에도 1회만 동작하도록 getState() 로 최신값을 읽는다
  useEffect(() => {
    const st = useGame.getState();
    if (st.greeted[chapter]) return;
    useGame.setState((s) => ({ greeted: { ...s.greeted, [chapter]: true } }));
    const chd = CHAPTERS[chapter];
    chd.greeting.forEach((l) => termPrint(l, 'dim'));
    if (chd.opening && chd.openedFlag && !st.flags[chd.openedFlag]) {
      st.setFlag(chd.openedFlag, true);
      openDialogue(chd.opening(st.flags));
    }
  }, [chapter, greeted]);

  // 통신 수신 → SIGNAL 창 자동 오픈
  useEffect(() => {
    if (dialogue) openWin('msg');
  }, [dialogue, openWin]);

  // 보드 해금 순간 → 증거 보드 창 자동 오픈
  useEffect(() => {
    if (boardUnlocked && !prevUnlock.current) openWin('board');
    prevUnlock.current = boardUnlocked;
  }, [boardUnlocked, openWin]);

  return (
    <section id="work" className="screen on">
      <StatusBar />
      <div id="osDesk" ref={deskRef}>
        <div className="osWall" aria-hidden />
        <WindowFrame id="term" title="AEGIS FORENSIC SHELL" icon="❯_">
          <Terminal />
        </WindowFrame>
        {boardUnlocked && (
          <WindowFrame id="board" title="EVIDENCE BOARD — 증거 보드" icon="⊛">
            <EvidenceBoard />
          </WindowFrame>
        )}
        {CHAPTERS[chapter].cctv && (
          <WindowFrame id="cctv" title="CCTV REVIEW — 증거 열람" icon="▣">
            <CctvApp />
          </WindowFrame>
        )}
        <WindowFrame id="case" title="CASE FILE — 사건 요약" icon="▤">
          <CasePane />
        </WindowFrame>
        <WindowFrame id="msg" title="SIGNAL — 보안 채널" icon="◆">
          <MessengerApp />
        </WindowFrame>
        <WindowFrame id="mission" title="MISSION" icon="◎" noClose>
          <MissionApp />
        </WindowFrame>
        <NotificationStack />
      </div>
      <Taskbar />
      <BootScreen />
    </section>
  );
}
