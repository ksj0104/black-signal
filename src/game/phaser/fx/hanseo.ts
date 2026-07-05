import type { Painter } from './helpers';
import { dashRow, prand } from './helpers';

/** 한서 거점: 듀얼 모니터 글로우 + CRT TV 플리커 + 창밖 도시 불빛 (640×360) */
export const fxHanseo: Painter = (g, frame, env) => {
  const t = env.reduced ? 0 : Math.floor(frame / 60);
  // 듀얼 모니터 텍스트 갱신 (실측 모니터 x208~388, y122~192)
  dashRow(g, 214, 176, 76, t * 2.3 + 5, 0x7ee0c8, 0.7);
  dashRow(g, 306, 170, 74, t * 1.9 + 23, 0x7ee0c8, 0.6);
  if (env.reduced) return;
  // 모니터 글로우 펄스 — 이 방의 핵심 광원
  g.fillStyle(0x7ee0c8, 0.04 + 0.03 * Math.sin(frame / 34));
  g.fillRect(208, 122, 180, 72);
  // CRT TV 플리커 + 주사선 (실측 스크린 x64~156, y155~235)
  g.fillStyle(0x6fb7ff, 0.05 + 0.04 * Math.sin(frame / 17));
  g.fillRect(64, 156, 92, 78);
  if (frame % 173 < 2) {
    g.fillStyle(0xdfe8f2, 0.06);
    g.fillRect(64, 156 + (frame % 78), 92, 2);
  }
  // 창밖 도시 불빛 트윙클 (실측 창 내부 x400~630, y80~170)
  for (let i = 0; i < 9; i++) {
    if ((frame >> 5) % 3 === i % 3 && prand(i * 7.3) > 0.35) {
      g.fillStyle(i % 2 ? 0xe8b54a : 0x6fb7ff, 0.5);
      g.fillRect(400 + Math.floor(prand(i) * 220), 84 + Math.floor(prand(i + 11) * 80), 2, 2);
    }
  }
};
