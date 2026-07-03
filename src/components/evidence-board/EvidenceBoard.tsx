import { useLayoutEffect, useRef, useState } from 'react';
import { useGame, linkKey } from '../../state/gameStore';
import { CHAPTERS } from '../../content/chapters';
import { sClick } from '../../engine/audio/audio';

interface Pos {
  x: number;
  y: number;
}

export function EvidenceBoard() {
  const chapter = useGame((s) => s.chapter);
  const links = useGame((s) => s.links[chapter]);
  const boardDone = useGame((s) => s.boardDone[chapter]);
  const attemptLink = useGame((s) => s.attemptLink);
  const openDialogue = useGame((s) => s.openDialogue);
  const finishChapter = useGame((s) => s.finishChapter);
  const chd = CHAPTERS[chapter];
  const board = chd.board;

  const boardRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [pos, setPos] = useState<Record<string, Pos>>({});
  const [sel, setSel] = useState<string | null>(null);
  const [segs, setSegs] = useState<{ x1: number; y1: number; x2: number; y2: number }[]>([]);
  const [deduceOpen, setDeduceOpen] = useState(false);
  const drag = useRef<{ id: string; dx: number; dy: number; moved: boolean } | null>(null);
  const prevDone = useRef(boardDone);

  // 챕터 전환 시 초기 배치
  useLayoutEffect(() => {
    const bd = boardRef.current;
    if (!bd) return;
    const p: Record<string, Pos> = {};
    board.nodes.forEach((n) => {
      p[n.id] = { x: (n.x / 100) * bd.clientWidth, y: (n.y / 100) * bd.clientHeight };
    });
    setPos(p);
    setSel(null);
    setDeduceOpen(false);
  }, [chapter]);

  // 링크 선분 계산
  useLayoutEffect(() => {
    const out: typeof segs = [];
    for (const k of links) {
      const [a, b] = k.split('-');
      const A = nodeRefs.current[a],
        B = nodeRefs.current[b];
      const pa = pos[a],
        pb = pos[b];
      if (!A || !B || !pa || !pb) continue;
      out.push({
        x1: pa.x + A.offsetWidth / 2,
        y1: pa.y + A.offsetHeight / 2,
        x2: pb.x + B.offsetWidth / 2,
        y2: pb.y + B.offsetHeight / 2,
      });
    }
    setSegs(out);
  }, [links, pos]);

  // 보드 완성 → 추론 오버레이
  useLayoutEffect(() => {
    if (boardDone && !prevDone.current) setDeduceOpen(true);
    prevDone.current = boardDone;
  }, [boardDone]);

  const goodCount = links.filter((k) =>
    board.good.some(([x, y]) => linkKey(x, y) === k),
  ).length;
  const linked = new Set(links.flatMap((k) => k.split('-')));

  const onCaseFile = () => {
    sClick();
    setDeduceOpen(false);
    openDialogue(chd.finale, () => finishChapter(chapter));
  };

  return (
    <div className="pane on" id="paneBoard">
      <div id="board" ref={boardRef}>
        <svg id="boardSvg">
          {segs.map((s, i) => (
            <line
              key={i}
              x1={s.x1}
              y1={s.y1}
              x2={s.x2}
              y2={s.y2}
              stroke="#7ee0c8"
              strokeWidth={1.5}
              strokeDasharray="4 3"
              opacity={0.7}
            />
          ))}
        </svg>
        {board.nodes.map((n) => (
          <div
            key={chapter + '-' + n.id}
            ref={(el) => {
              nodeRefs.current[n.id] = el;
            }}
            className={
              'node ' + n.cls + (sel === n.id ? ' sel' : '') + (linked.has(n.id) ? ' linked' : '')
            }
            style={{ left: pos[n.id]?.x ?? 0, top: pos[n.id]?.y ?? 0 }}
            tabIndex={0}
            role="button"
            aria-pressed={sel === n.id}
            onPointerDown={(e) => {
              drag.current = {
                id: n.id,
                dx: e.clientX - (pos[n.id]?.x ?? 0),
                dy: e.clientY - (pos[n.id]?.y ?? 0),
                moved: false,
              };
              (e.target as HTMLElement).setPointerCapture(e.pointerId);
            }}
            onPointerMove={(e) => {
              const d = drag.current;
              const bd = boardRef.current;
              const el = nodeRefs.current[n.id];
              if (!d || d.id !== n.id || !bd || !el) return;
              const nx = e.clientX - d.dx,
                ny = e.clientY - d.dy;
              const cur = pos[n.id];
              if (cur && Math.abs(nx - cur.x) + Math.abs(ny - cur.y) > 3) d.moved = true;
              setPos((p) => ({
                ...p,
                [n.id]: {
                  x: Math.max(0, Math.min(bd.clientWidth - el.offsetWidth, nx)),
                  y: Math.max(0, Math.min(bd.clientHeight - el.offsetHeight, ny)),
                },
              }));
            }}
            onPointerUp={() => {
              const d = drag.current;
              drag.current = null;
              if (d && !d.moved) clickNode(n.id);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                clickNode(n.id);
              }
            }}
          >
            <span className="k">{n.k}</span>
            {n.t}
          </div>
        ))}
        {deduceOpen && (
          <div id="deduce" className="on" role="dialog" aria-label="추론 결과">
            <h3>추론 완료 — 연결된 신호</h3>
            <div dangerouslySetInnerHTML={{ __html: board.deduce }} />
            <div style={{ marginTop: '1rem', textAlign: 'right' }}>
              <button className="primary" onClick={onCaseFile}>
                사건 파일 생성 ▸
              </button>
            </div>
          </div>
        )}
      </div>
      <div id="boardBar">
        <span>노드를 드래그해 배치하고, 한 노드를 클릭한 뒤 다른 노드를 클릭해 연결하세요.</span>
        <span id="linkCount">
          {goodCount} / {board.good.length}
        </span>
      </div>
    </div>
  );

  function clickNode(id: string) {
    sClick();
    if (!sel) {
      setSel(id);
      return;
    }
    if (sel === id) {
      setSel(null);
      return;
    }
    attemptLink(sel, id);
    setSel(null);
  }
}
