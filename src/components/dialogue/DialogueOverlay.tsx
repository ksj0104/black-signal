import { useEffect, useRef, useState } from 'react';
import { useGame } from '../../state/gameStore';
import { sClick, sType } from '../../engine/audio/audio';
import { withName } from '../../engine/persona';
import { Beat } from '../../engine/types';

export function DialogueOverlay() {
  const dlg = useGame((s) => s.dialogue);
  const closeDialogue = useGame((s) => s.closeDialogue);
  const dialogueApi = useGame((s) => s.dialogueApi);
  const rm = useGame((s) => s.cfg.rm);
  const pname = useGame((s) => s.cfg.name);
  const [idx, setIdx] = useState(0);
  const [shown, setShown] = useState('');
  const [typing, setTyping] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const advanceRef = useRef<() => void>(() => {});
  const beat: Beat | undefined = dlg?.beats[idx];

  useEffect(() => {
    setIdx(0);
  }, [dlg]);

  // 전역 키 입력: Space / Enter 로 진행 (포커스 위치와 무관하게 동작)
  useEffect(() => {
    if (!dlg) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== ' ' && e.key !== 'Enter') return;
      // 선택지 버튼에 포커스가 있으면 버튼 기본 동작에 맡긴다
      if ((e.target as HTMLElement)?.closest?.('#dlgChoices')) return;
      // 캡처 단계에서 뒤의 터미널 입력 등으로 전파되는 것을 막는다
      e.preventDefault();
      e.stopPropagation();
      advanceRef.current();
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [dlg]);

  useEffect(() => {
    if (!beat) return;
    if (timer.current) clearInterval(timer.current);
    const text = withName(beat.x, pname);
    const reduced = rm || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      setShown(text);
      setTyping(false);
      return;
    }
    setShown('');
    setTyping(true);
    let i = 0;
    timer.current = setInterval(() => {
      i++;
      setShown(text.slice(0, i));
      if (i % 3 === 0) sType();
      if (i >= text.length) {
        if (timer.current) clearInterval(timer.current);
        setTyping(false);
      }
    }, 22);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [beat, rm, pname]);

  if (!dlg || !beat) return null;

  const advance = () => {
    if (typing) {
      if (timer.current) clearInterval(timer.current);
      setShown(withName(beat.x, pname));
      setTyping(false);
      return;
    }
    if (beat.c) return; // 선택지 대기
    if (beat.end) {
      closeDialogue();
      return;
    }
    setIdx(idx + 1);
  };
  const choose = (i: number) => {
    sClick();
    beat.c?.[i].fx?.(dialogueApi());
    if (beat.end) closeDialogue();
    else setIdx(idx + 1);
  };
  advanceRef.current = advance;

  return (
    <div
      id="dlg"
      className="on"
      aria-live="polite"
      onClick={(e) => {
        if ((e.target as HTMLElement).closest('#dlgChoices')) return;
        advance();
      }}
      tabIndex={-1}
    >
      <div id="dlgBox">
        <div id="dlgName" className={beat.sys ? 'sys' : ''}>
          {withName(beat.n, pname)}
        </div>
        <div id="dlgText">{shown}</div>
        {!typing && beat.c && (
          <div id="dlgChoices">
            {beat.c.map((ch, i) => (
              <button key={i} onClick={() => choose(i)} autoFocus={i === 0}>
                {withName(ch.t, pname)}
              </button>
            ))}
          </div>
        )}
        {!beat.c && (
          <div id="dlgNext">
            <span className="blink">▸</span> Space · Enter · 클릭으로 계속
          </div>
        )}
      </div>
    </div>
  );
}
