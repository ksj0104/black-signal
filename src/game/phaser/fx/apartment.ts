import type { Painter } from '../art/helpers';
import { rain } from '../art/helpers';

/** 아파트: 창밖 비 + 모니터 글로우 펄스 + 램프 미세 플리커 (640×360) */
export const fxApartment: Painter = (g, frame, env, mem) => {
  // 창 유리 영역(모니터 오른쪽~창틀, 640×360 px 실측)
  if (!env.reduced) rain(g, mem, 'aptRain', { x: 408, y: 20, w: 220, h: 175, n: 26, alpha: 0.3 });
  if (env.reduced) return;
  // 모니터 글로우 펄스 (듀얼 모니터 화면)
  const pulse = 0.05 + 0.04 * Math.sin(frame / 24);
  g.fillStyle(0x7ee0c8, pulse);
  g.fillRect(232, 128, 172, 80);
  // 천장 램프 플리커 (드물게)
  if (frame % 173 < 3) {
    g.fillStyle(0xf2e4b0, 0.05);
    g.fillRect(270, 35, 60, 45);
  }
};
