import { dashRow, prand, type Painter } from './helpers';

/**
 * 심야 지하철 승강장 (Ch4+) — 막차가 끊긴 접선 장소.
 * 스크린도어·전광판·자판기·CCTV·출구 계단. 터널 너머 신호등과 지나가는 헤드라이트.
 */
export const paintStation: Painter = (g, frame, env, mem) => {
  const rm = env.reduced;
  const f = rm ? 0 : frame;

  /* ---- 천장 + 형광등 + 배관 ---- */
  g.fillStyle(0x0a0d16).fillRect(0, 0, 320, 24);
  g.lineStyle(1, 0x141a2a, 1).lineBetween(0, 6, 320, 6).lineBetween(0, 10, 320, 10);
  for (let i = 0; i < 4; i++) {
    const lx = 24 + i * 82;
    const dying = i === 2 && !rm && Math.random() < 0.06;
    g.fillStyle(0x10141e).fillRect(lx - 2, 14, 30, 4);
    g.fillStyle(0xdce8f4, dying ? 0.2 : 0.75).fillRect(lx, 15, 26, 2);
    g.fillStyle(0xdce8f4, dying ? 0.01 : 0.045).fillTriangle(lx + 13, 18, lx - 12, 120, lx + 38, 120);
  }

  /* ---- 벽 타일 ---- */
  g.fillStyle(0x101626).fillRect(0, 24, 320, 76);
  g.lineStyle(1, 0x0b101c, 0.9);
  for (let y = 24; y <= 100; y += 10) g.lineBetween(0, y, 320, y);
  for (let x = 0; x <= 320; x += 14) g.lineBetween(x, 24, x, 100);
  g.fillStyle(0x182036).fillRect(0, 94, 320, 6); // 하단 몰딩

  /* ---- 노선 사인 + 역명판 ---- */
  g.fillStyle(0xb48cff).fillCircle(38, 38, 7);
  g.fillStyle(0x0e1120).fillCircle(38, 38, 4);
  g.fillStyle(0xd8e0ea).fillRect(37, 35, 2, 6);
  g.fillStyle(0x0c1226).fillRect(50, 32, 52, 12);
  g.lineStyle(1, 0x2a3860, 1).strokeRect(50, 32, 52, 12);
  dashRow(g, 54, 37, 44, 7, 0xd8e0ea, 0.9);
  g.fillStyle(0x7ee0c8).fillRect(50, 44, 52, 1);

  /* ---- 전광판 (막차 안내) ---- */
  g.fillStyle(0x05070d).fillRect(118, 28, 88, 16);
  g.lineStyle(1, 0x1e2946, 1).strokeRect(118, 28, 88, 16);
  const tick = rm ? true : f % 70 < 45;
  dashRow(g, 124, 33, 56, 17 + Math.floor(f / 140), 0xe8b54a, tick ? 0.95 : 0.4);
  g.fillStyle(0xe0637a, tick ? 0.95 : 0.3).fillRect(186, 32, 14, 3);
  dashRow(g, 124, 39, 74, 29, 0xe8b54a, 0.35);

  /* ---- CCTV (우상단) ---- */
  g.lineStyle(1, 0x2a3248, 1).lineBetween(292, 24, 292, 30);
  g.fillStyle(0x1a2236).fillRect(284, 30, 16, 7);
  g.fillStyle(0x0c1120).fillRect(296, 32, 5, 3); // 렌즈부
  g.fillStyle(0xe0637a, rm || f % 90 < 12 ? 0.95 : 0.15).fillRect(286, 32, 2, 2); // REC

  /* ---- 출구 계단 (좌) ---- */
  g.fillStyle(0x0a0f1c).fillRect(6, 46, 40, 74);
  for (let s = 0; s < 6; s++) g.fillStyle(0x131a2c).fillRect(8, 108 - s * 10, 36 - s * 5, 4);
  g.fillStyle(0x2a8a4a, rm ? 0.9 : 0.75 + 0.2 * Math.abs(Math.sin(f / 60))).fillRect(12, 50, 22, 8);
  g.fillStyle(0x0e1120).fillRect(15, 52, 4, 4).fillRect(21, 52, 8, 4); // EXIT 픽토
  g.lineStyle(1, 0x2a3248, 1).lineBetween(46, 46, 46, 120); // 난간

  /* ---- 스크린도어 + 터널 ---- */
  g.fillStyle(0x04060c).fillRect(54, 48, 224, 58); // 유리 너머 터널
  // 지나가는 헤드라이트 (간헐)
  const pass = rm ? -1 : (f % 480) / 480;
  if (pass > 0.82) {
    const hx = 54 + (pass - 0.82) * 1250;
    g.fillStyle(0xf4e6b8, 0.5).fillRect(hx, 66, 26, 10);
    g.fillStyle(0xf4e6b8, 0.15).fillRect(hx - 20, 62, 60, 18);
  }
  g.fillStyle(0xe0637a, rm || f % 120 < 60 ? 0.8 : 0.2).fillRect(70, 60, 2, 2); // 터널 신호등
  g.fillStyle(0x2a8a4a, rm || f % 120 >= 60 ? 0.8 : 0.2).fillRect(70, 66, 2, 2);
  g.lineStyle(1, 0x141a2a, 1).lineBetween(54, 92, 278, 92); // 터널 궤도선
  // 유리 반사 + 프레임
  g.fillStyle(0xcfe0f4, 0.05).fillRect(58, 50, 60, 54);
  g.fillStyle(0xcfe0f4, 0.03).fillRect(180, 50, 40, 54);
  for (let i = 0; i <= 4; i++) g.fillStyle(0x1c2438).fillRect(54 + i * 56, 48, 4, 58);
  g.fillStyle(0x1c2438).fillRect(54, 48, 224, 3);
  // 경고 스트라이프
  for (let x = 54; x < 278; x += 8) {
    g.fillStyle(x % 16 === 6 ? 0xe8b54a : 0x11151f, 0.9).fillRect(x, 100, 8, 5);
  }

  /* ---- 기둥 2본 ---- */
  for (const px of [104, 232] as const) {
    g.fillStyle(0x182036).fillRect(px, 24, 16, 100);
    g.fillStyle(0x101626).fillRect(px, 24, 3, 100);
    g.fillStyle(0xb48cff, 0.8).fillRect(px + 3, 58, 10, 6); // 노선 밴드
    g.fillStyle(0x0c1120).fillRect(px + 3, 70, 10, 14);
    dashRow(g, px + 4, 74, 8, px, 0x7ee0c8, 0.6);
  }

  /* ---- 자판기 (우) ---- */
  g.fillStyle(0x131c34).fillRect(288, 60, 26, 62);
  g.lineStyle(1, 0x22304e, 1).strokeRect(288, 60, 26, 62);
  const vend = rm ? 0.7 : 0.55 + 0.2 * Math.abs(Math.sin(f / 55)) + (Math.random() < 0.01 ? 0.2 : 0);
  g.fillStyle(0x7ee0c8, vend * 0.5).fillRect(291, 63, 20, 40);
  for (let r = 0; r < 3; r++)
    for (let c = 0; c < 4; c++) {
      const cols = [0xe0637a, 0xe8b54a, 0x7ee0c8, 0xb48cff];
      g.fillStyle(cols[(r * 4 + c) % 4], 0.9).fillRect(293 + c * 5, 66 + r * 11, 3, 7);
    }
  g.fillStyle(0x0a0f1c).fillRect(291, 106, 20, 12); // 배출구
  g.fillStyle(0xe8b54a, vend).fillRect(306, 84, 3, 8); // 코인 슬롯 라이트
  g.fillStyle(0x7ee0c8, 0.06 * vend).fillTriangle(300, 122, 282, 150, 318, 150); // 바닥 광

  /* ---- 벤치 + 노트북 가방 + 신문 ---- */
  g.fillStyle(0x1a2236).fillRect(126, 112, 56, 5);
  g.fillStyle(0x141a2c).fillRect(130, 117, 4, 12).fillRect(174, 117, 4, 12);
  g.lineStyle(1, 0x2a3248, 1).lineBetween(126, 108, 182, 108); // 등받이
  g.fillStyle(0x2c3550).fillRect(138, 104, 16, 9); // 가방
  g.lineStyle(1, 0x3e4a6a, 1).lineBetween(140, 104, 146, 100).lineBetween(146, 100, 152, 104);
  g.fillStyle(0x7ee0c8, rm || f % 100 < 50 ? 0.9 : 0.2).fillRect(151, 106, 2, 2); // 상태 LED
  g.fillStyle(0xd8d0be, 0.75).fillRect(162, 110, 14, 3); // 신문
  dashRow(g, 163, 111, 12, 51, 0x6a7690, 0.9);

  /* ---- 승강장 바닥 ---- */
  g.fillStyle(0x0c1120).fillRect(0, 120, 320, 34);
  for (let x = 0; x < 320; x += 12) g.fillStyle(0xe8b54a, 0.55).fillRect(x + 2, 126, 6, 3); // 점자블록
  g.fillStyle(0x182036).fillRect(0, 136, 320, 2); // 안전선
  // 선로 피트
  g.fillStyle(0x04060a).fillRect(0, 154, 320, 26);
  g.fillStyle(0x0a0e18).fillRect(0, 154, 320, 3);
  g.lineStyle(1, 0x3a4660, 0.7).lineBetween(0, 164, 320, 162);
  g.lineStyle(1, 0x2a3248, 0.6).lineBetween(0, 173, 320, 170);
  for (let x = 8; x < 320; x += 22) g.fillStyle(0x0e1322).fillRect(x, 160, 4, 14); // 침목
  // 젖은 바닥 반사
  g.fillStyle(0xdce8f4, 0.04).fillRect(20, 138, 60, 12);
  g.fillStyle(0xe8b54a, 0.05).fillRect(120, 140, 70, 10);
  g.fillStyle(0xb48cff, 0.04).fillRect(228, 138, 30, 12);

  /* ---- 부유 먼지 (조명 근처) ---- */
  if (!rm) {
    interface Mote {
      x: number;
      y: number;
      v: number;
    }
    let motes = mem.motes as Mote[] | undefined;
    if (!motes) {
      motes = Array.from({ length: 14 }, (_, i) => ({
        x: prand(i) * 320,
        y: 20 + prand(i + 5) * 90,
        v: 0.08 + prand(i + 11) * 0.12,
      }));
      mem.motes = motes;
    }
    for (const m of motes) {
      g.fillStyle(0xcfe0f4, 0.14).fillRect(m.x, m.y, 1, 1);
      m.y -= m.v;
      m.x += Math.sin((f + m.y) / 40) * 0.15;
      if (m.y < 18) {
        m.y = 110;
        m.x = Math.random() * 320;
      }
    }
  }
};
