import type { Painter } from '../art/helpers';
import { dashRow, prand } from '../art/helpers';

/** 승강장: 전광판 스크롤 + CCTV LED 점멸 + 터널 헤드라이트 (640×360) */
export const fxStation: Painter = (g, frame, env) => {
  // 전광판 (l36~65%, t14~25%) — 스크롤 대시
  const off = env.reduced ? 0 : (frame / 2) % 40;
  g.fillStyle(0x131a2a, 0.95);
  g.fillRect(230, 50, 186, 26);
  dashRow(g, 236 - off + 40, 58, 140, 3.3, 0xe8b54a, 0.9);
  dashRow(g, 236, 68, 174, 8.1, 0xe8b54a, 0.5);
  if (env.reduced) return;
  // CCTV LED (l87~95%, t12~22%)
  if (frame % 90 < 45) {
    g.fillStyle(0xff5d5d, 0.9);
    g.fillRect(590, 52, 3, 3);
  }
  // 드물게 터널 헤드라이트 스윕
  const sweep = (frame % 900) / 900;
  if (sweep > 0.92 && prand(Math.floor(frame / 900)) > 0.4) {
    const x = 640 * ((sweep - 0.92) / 0.08);
    g.fillStyle(0xdfe8f2, 0.08);
    g.fillRect(x - 30, 90, 60, 100);
  }
};
