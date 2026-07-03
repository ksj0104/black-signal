import { useEffect, useRef, useState } from 'react';
import { useGame } from '../../state/gameStore';
import { useUi } from '../../state/uiStore';
import { sType } from '../../engine/audio/audio';

const BOOT_LINES = [
  'AEGIS SECURE BOOT v3.1 — 격리 파티션 검증 중',
  'kernel: forensic-sandbox 5.2  [OK]',
  'mount: /cases (읽기 전용 증거 볼륨)  [OK]',
  'net: 외부 네트워크 인터페이스 없음 — 오프라인 모드  [OK]',
  'audit: 체인 오브 커스터디 로거 활성  [OK]',
  'user: joonseo — 생체 인증 완료',
  '',
  'BLACK SIGNAL // FIELD WORKSTATION',
];

/** 세션 첫 워크스테이션 진입 시 1회 재생되는 부트 시퀀스 (클릭/키로 스킵) */
export function BootScreen() {
  const booted = useUi((s) => s.booted);
  const setBooted = useUi((s) => s.setBooted);
  const rm = useGame((s) => s.cfg.rm);
  const [n, setN] = useState(0);
  const done = useRef(false);

  const finish = () => {
    if (done.current) return;
    done.current = true;
    setBooted(true);
  };

  useEffect(() => {
    if (booted) return;
    const reduced = rm || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      finish();
      return;
    }
    const iv = setInterval(() => {
      setN((v) => {
        const next = v + 1;
        if (next <= BOOT_LINES.length) sType();
        if (next > BOOT_LINES.length) {
          clearInterval(iv);
          setTimeout(finish, 420);
        }
        return next;
      });
    }, 230);
    const onKey = () => finish();
    window.addEventListener('keydown', onKey);
    return () => {
      clearInterval(iv);
      window.removeEventListener('keydown', onKey);
    };
  }, [booted, rm]);

  if (booted) return null;

  return (
    <div id="osBoot" onClick={finish} role="status" aria-label="부팅 중 — 클릭으로 건너뛰기">
      <div className="bootBox">
        {BOOT_LINES.slice(0, n).map((l, i) =>
          l === 'BLACK SIGNAL // FIELD WORKSTATION' ? (
            <div key={i} className="bootLogo">
              BLACK SIGNAL <span>// FIELD WORKSTATION</span>
            </div>
          ) : (
            <div key={i} className="bootLine">
              {l || ' '}
            </div>
          ),
        )}
        <div className="bootSkip">클릭 또는 아무 키 — 건너뛰기</div>
      </div>
    </div>
  );
}
