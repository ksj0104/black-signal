import { useGame } from '../../state/gameStore';
import { CHAPTERS } from '../../content/chapters';
import { useUi, WinId } from '../../state/uiStore';
import { sClick } from '../../engine/audio/audio';

const APPS: { id: WinId; label: string; icon: string }[] = [
  { id: 'term', label: '터미널', icon: '❯_' },
  { id: 'board', label: '증거 보드', icon: '⊛' },
  { id: 'cctv', label: 'CCTV', icon: '▣' },
  { id: 'case', label: '케이스 파일', icon: '▤' },
  { id: 'msg', label: 'SIGNAL', icon: '◆' },
  { id: 'mission', label: '미션', icon: '◎' },
];

export function Taskbar() {
  const wins = useUi((s) => s.wins);
  const zTop = useUi((s) => s.zTop);
  const openWin = useUi((s) => s.openWin);
  const minWin = useUi((s) => s.minWin);
  const focusWin = useUi((s) => s.focusWin);
  const chapter = useGame((s) => s.chapter);
  const boardUnlocked = useGame((s) => s.boardUnlocked[chapter]);
  const dialogue = useGame((s) => s.dialogue);

  const onApp = (id: WinId) => {
    sClick();
    const w = wins[id];
    if (!w.open || w.min) openWin(id);
    else if (w.z === zTop) minWin(id);
    else focusWin(id);
  };

  const hasCctv = CHAPTERS[chapter].cctv != null;

  return (
    <nav id="osDock" aria-label="앱 태스크바">
      {APPS.filter((a) => a.id !== 'cctv' || hasCctv).map((a) => {
        const w = wins[a.id];
        const locked = a.id === 'board' && !boardUnlocked;
        const active = w.open && !w.min;
        const unread = a.id === 'msg' && dialogue != null && (!w.open || w.min);
        return (
          <button
            key={a.id}
            className={'dockBtn' + (active ? ' on' : '') + (active && w.z === zTop ? ' top' : '')}
            disabled={locked}
            title={locked ? '전 단서 확보 시 해금' : a.label}
            onClick={() => onApp(a.id)}
          >
            <span className="dockIcon" aria-hidden>
              {locked ? '🔒' : a.icon}
            </span>
            {a.label}
            {unread && <i className="dockDot" aria-label="새 메시지" />}
          </button>
        );
      })}
      <span className="dockHint">창은 드래그로 이동 · 모서리로 크기 조절</span>
    </nav>
  );
}
