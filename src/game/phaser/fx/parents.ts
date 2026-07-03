import type { Painter } from '../art/helpers';
import { rain, dashRow, prand } from '../art/helpers';

/** 부모님 집: 창밖 비 + TV 화면 애니메이션 (640×360) */
export const fxParents: Painter = (g, frame, env, mem) => {
  if (!env.reduced) rain(g, mem, 'parRain', { x: 474, y: 43, w: 128, h: 155, n: 20, alpha: 0.3 });
  // TV 화면 (l26~41%, t36~64%) — 뉴스 자막 대시가 주기적으로 바뀐다
  const seed = env.reduced ? 7 : Math.floor(frame / 90);
  g.fillStyle(0x1d3450, 0.9);
  g.fillRect(172, 133, 86, 92);
  dashRow(g, 178, 200, 74, seed * 1.3 + 1, 0xd8e6f2, 0.8);
  dashRow(g, 178, 208, 74, seed * 2.1 + 5, 0x8fb6d8, 0.6);
  if (!env.reduced && prand(Math.floor(frame / 45)) > 0.5) {
    g.fillStyle(0xcfe0ee, 0.06); // 화면 밝기 흔들림
    g.fillRect(172, 133, 86, 92);
  }
};
