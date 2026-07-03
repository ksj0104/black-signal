import type { Painter } from '../art/helpers';
import { rain, dashRow, prand } from '../art/helpers';

/** 부모님 집: 창밖 비 + TV 화면 애니메이션 (640×360) */
export const fxParents: Painter = (g, frame, env, mem) => {
  if (!env.reduced) rain(g, mem, 'parRain', { x: 467, y: 29, w: 102, h: 148, n: 20, alpha: 0.3 });
  // TV 화면 (l25~42%, t34~50% 유리면) — 뉴스 자막 대시가 주기적으로 바뀐다
  const seed = env.reduced ? 7 : Math.floor(frame / 90);
  g.fillStyle(0x1d3450, 0.9);
  g.fillRect(173, 122, 83, 58);
  dashRow(g, 178, 158, 73, seed * 1.3 + 1, 0xd8e6f2, 0.8);
  dashRow(g, 178, 166, 73, seed * 2.1 + 5, 0x8fb6d8, 0.6);
  if (!env.reduced && prand(Math.floor(frame / 45)) > 0.5) {
    g.fillStyle(0xcfe0ee, 0.06); // 화면 밝기 흔들림
    g.fillRect(173, 122, 83, 58);
  }
};
