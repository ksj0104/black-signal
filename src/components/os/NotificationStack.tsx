import { useEffect, useRef } from 'react';
import { useGame } from '../../state/gameStore';
import { useUi } from '../../state/uiStore';

/**
 * gameStore.toast 를 구독해 OS 알림 카드 스택으로 변환한다.
 * (게임 로직은 그대로 두고 표현만 교체 — 알림은 uiStore 가 자체 수명 관리)
 */
export function NotificationStack() {
  const toast = useGame((s) => s.toast);
  const notices = useUi((s) => s.notices);
  const notify = useUi((s) => s.notify);
  const dismiss = useUi((s) => s.dismissNotice);
  const last = useRef<string | null>(null);

  useEffect(() => {
    if (toast && toast !== last.current) notify(toast);
    last.current = toast;
  }, [toast, notify]);

  if (!notices.length) return null;
  return (
    <div id="osNotices" aria-live="polite">
      {notices.map((n) => (
        <div key={n.id} className="notice" onClick={() => dismiss(n.id)}>
          <span className="noticeTag">SYSTEM</span>
          {n.text}
        </div>
      ))}
    </div>
  );
}
