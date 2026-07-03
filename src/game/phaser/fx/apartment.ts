import type { Painter } from '../art/helpers';
import { rain } from '../art/helpers';

/** 아파트: 창밖 비 + 모니터 글로우 펄스 + 램프 미세 플리커 (640×360) */
export const fxApartment: Painter = (g, frame, env, mem) => {
  // 창 영역(l69~98%, t12~60% → ×6.4/×3.6)
  rain(g, mem, 'aptRain', { x: 442, y: 43, w: 186, h: 173, n: 26, alpha: 0.3 });
  if (env.reduced) return;
  // 모니터 글로우 펄스 (듀얼 모니터 중앙 l35~55%)
  const pulse = 0.05 + 0.04 * Math.sin(frame / 24);
  g.fillStyle(0x7ee0c8, pulse);
  g.fillRect(224, 119, 130, 90);
  // 천장 램프 플리커 (드물게)
  if (frame % 173 < 3) {
    g.fillStyle(0xf2e4b0, 0.05);
    g.fillRect(400, 60, 60, 40);
  }
};
