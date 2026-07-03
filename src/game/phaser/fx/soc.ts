import type { Painter } from '../art/helpers';
import { dashRow } from '../art/helpers';

/** SOC: 상황판 틱커·차트 갱신 + 형광등 미세 플리커 (640×360) */
export const fxSoc: Painter = (g, frame, env) => {
  const t = env.reduced ? 0 : Math.floor(frame / 60);
  // 메인 상황판 틱커 (실측 wall 핫스팟 l13~71%, t6~38% 프레임 하단 라인)
  dashRow(g, 91, 128, 355, t * 3.7 + 11, 0x7ee0c8, 0.75);
  if (env.reduced) return;
  // 차트 영역 갱신 글로우 (실측 중앙 막대차트 패널, wall 3분할 중 2번째)
  const pulse = 0.04 + 0.03 * Math.sin(frame / 30);
  g.fillStyle(0x6fb7ff, pulse);
  g.fillRect(232, 28, 112, 100);
  // 형광등 플리커
  if (frame % 211 < 2) {
    g.fillStyle(0xdfe8f2, 0.04);
    g.fillRect(0, 0, 640, 24);
  }
};
