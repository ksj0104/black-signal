import { useEffect, useRef, useState } from 'react';
import { useGame } from '../../../state/gameStore';
import { useUi } from '../../../state/uiStore';
import { sClick, sType } from '../../../engine/audio/audio';
import { withName } from '../../../engine/persona';

const isMe = (n: string) => n.includes('서준');

/**
 * SIGNAL — 보안 메신저. 워크스테이션에서의 모든 대화(gameStore.dialogue)를
 * 채팅 스레드로 수신한다. 비트는 자동 재생되고 선택지에서만 입력을 기다린다.
 */
export function MessengerApp() {
  const dlg = useGame((s) => s.dialogue);
  const closeDialogue = useGame((s) => s.closeDialogue);
  const dialogueApi = useGame((s) => s.dialogueApi);
  const rm = useGame((s) => s.cfg.rm);
  const pname = useGame((s) => s.cfg.name);
  const log = useUi((s) => s.msgLog);
  const pushMsg = useUi((s) => s.pushMsg);
  const [idx, setIdx] = useState(0);
  const [typing, setTyping] = useState<string | null>(null); // 타이핑 중인 화자 이름
  const listRef = useRef<HTMLDivElement>(null);

  const beat = dlg?.beats[idx];
  const reduced = rm;

  // 새 대화 도착 → 처음부터
  useEffect(() => {
    setIdx(0);
  }, [dlg]);

  // 비트 자동 재생: 타이핑 표시 → 메시지 게시 → (선택지 대기 | 다음 | 종료)
  useEffect(() => {
    if (!dlg || !beat) return;
    let t2: ReturnType<typeof setTimeout> | null = null;
    setTyping(beat.sys ? null : beat.n);
    const delay = reduced ? 30 : Math.min(1900, 380 + beat.x.length * 13);
    const t1 = setTimeout(() => {
      pushMsg({ n: beat.n, x: beat.x, sys: beat.sys, me: isMe(beat.n) });
      if (!reduced) sType();
      setTyping(null);
      if (beat.c) return; // 선택지 — 플레이어 입력 대기
      t2 = setTimeout(
        () => {
          if (beat.end) closeDialogue();
          else setIdx((i) => i + 1);
        },
        reduced ? 30 : 600,
      );
    }, delay);
    return () => {
      clearTimeout(t1);
      if (t2) clearTimeout(t2);
      setTyping(null);
    };
  }, [dlg, idx]);

  // 새 메시지·타이핑 표시마다 하단으로
  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [log, typing, beat]);

  const choose = (i: number) => {
    if (!beat?.c) return;
    sClick();
    pushMsg({ n: '서준 (나)', x: beat.c[i].t, me: true, choice: true });
    beat.c[i].fx?.(dialogueApi());
    if (beat.end) closeDialogue();
    else setIdx(idx + 1);
  };

  const waitingChoice = !typing && beat?.c;

  return (
    <div className="msgr">
      <div className="msgrList" ref={listRef} aria-live="polite">
        {log.length === 0 && !typing && (
          <div className="msgrEmpty">
            보안 채널 대기 중.
            <br />
            수사 중 수신되는 통신은 이 창에 기록됩니다.
          </div>
        )}
        {log.map((m, i) => {
          const prev = log[i - 1];
          const cont = prev && prev.n === m.n && !m.sys && !prev.sys;
          if (m.sys)
            return (
              <div key={m.id} className="msgSys">
                {withName(m.x, pname)}
              </div>
            );
          return (
            <div key={m.id} className={'msgRow' + (m.me ? ' me' : '')}>
              {!cont && <div className="msgName">{withName(m.n, pname)}</div>}
              <div className={'msgBubble' + (m.choice ? ' choice' : '')}>{withName(m.x, pname)}</div>
            </div>
          );
        })}
        {typing && (
          <div className={'msgRow' + (isMe(typing) ? ' me' : '')}>
            <div className="msgName">{withName(typing, pname)}</div>
            <div className="msgBubble typing" aria-label={typing + ' 입력 중'}>
              <i />
              <i />
              <i />
            </div>
          </div>
        )}
      </div>
      {waitingChoice && beat.c && (
        <div className="msgrChoices">
          {beat.c.map((c, i) => (
            <button key={i} onClick={() => choose(i)} autoFocus={i === 0}>
              {withName(c.t, pname)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
