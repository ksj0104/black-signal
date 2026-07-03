import { ReactNode, useRef } from 'react';
import { useUi, WinId, WIN_MIN_W, WIN_MIN_H } from '../../state/uiStore';
import { sClick } from '../../engine/audio/audio';

interface Props {
  id: WinId;
  title: string;
  icon: string;
  children: ReactNode;
  /** 닫기 대신 최소화만 허용 (미션 등 상시 창) */
  noClose?: boolean;
}

/** 드래그 이동 · 우하단 리사이즈 · 포커스 z-순서를 갖는 OS 창 프레임 */
export function WindowFrame({ id, title, icon, children, noClose }: Props) {
  const win = useUi((s) => s.wins[id]);
  const zTop = useUi((s) => s.zTop);
  const focusWin = useUi((s) => s.focusWin);
  const minWin = useUi((s) => s.minWin);
  const closeWin = useUi((s) => s.closeWin);
  const moveWin = useUi((s) => s.moveWin);
  const resizeWin = useUi((s) => s.resizeWin);
  const drag = useRef<{ dx: number; dy: number } | null>(null);
  const rs = useRef<{ mx: number; my: number; w: number; h: number } | null>(null);

  if (!win.open || win.min) return null;
  const focused = win.z === zTop;

  return (
    <section
      className={'win' + (focused ? ' focus' : '')}
      style={{ left: win.x, top: win.y, width: win.w, height: win.h, zIndex: win.z }}
      role="dialog"
      aria-label={title}
      onPointerDownCapture={() => focusWin(id)}
    >
      <header
        className="winHead"
        onPointerDown={(e) => {
          if ((e.target as HTMLElement).closest('button')) return;
          drag.current = { dx: e.clientX - win.x, dy: e.clientY - win.y };
          (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
        }}
        onPointerMove={(e) => {
          if (!drag.current) return;
          moveWin(id, e.clientX - drag.current.dx, e.clientY - drag.current.dy);
        }}
        onPointerUp={() => (drag.current = null)}
      >
        <span className="winIcon" aria-hidden>
          {icon}
        </span>
        <span className="winTitle">{title}</span>
        <span className="winBtns">
          <button
            className="winBtn"
            aria-label={title + ' 최소화'}
            onClick={() => {
              sClick();
              minWin(id);
            }}
          >
            ─
          </button>
          {!noClose && (
            <button
              className="winBtn close"
              aria-label={title + ' 닫기'}
              onClick={() => {
                sClick();
                closeWin(id);
              }}
            >
              ✕
            </button>
          )}
        </span>
      </header>
      <div className="winBody">{children}</div>
      <div
        className="winResize"
        aria-hidden
        onPointerDown={(e) => {
          rs.current = { mx: e.clientX, my: e.clientY, w: win.w, h: win.h };
          (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
          e.preventDefault();
        }}
        onPointerMove={(e) => {
          if (!rs.current) return;
          resizeWin(
            id,
            Math.max(WIN_MIN_W, rs.current.w + e.clientX - rs.current.mx),
            Math.max(WIN_MIN_H, rs.current.h + e.clientY - rs.current.my),
          );
        }}
        onPointerUp={() => (rs.current = null)}
      />
    </section>
  );
}
