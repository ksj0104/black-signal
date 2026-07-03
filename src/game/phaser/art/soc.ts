import { dashRow, prand, type Painter } from './helpers';

/**
 * 이지스 리스폰스 SOC (Ch3) — 새벽 3시 상황실.
 * 3분할 메가 스크린(지도 레이더·타임라인·로그), 데스크 2열, 유리 회의실, 배지 게이트.
 */
export const paintSoc: Painter = (g, frame, env) => {
  const rm = env.reduced;
  const f = rm ? 0 : frame;

  /* ---- 룸 셸 ---- */
  g.fillStyle(0x04070f).fillRect(0, 0, 320, 180);
  g.fillStyle(0x0a0f1e).fillRect(0, 10, 320, 88); // 뒷벽
  g.fillStyle(0x05080f).fillRect(0, 98, 320, 82); // 바닥
  // 천장 매립등
  for (let i = 0; i < 5; i++) {
    const lx = 30 + i * 64;
    g.fillStyle(0xcfe0f4, rm ? 0.5 : 0.4 + 0.1 * Math.sin(f / 50 + i)).fillRect(lx, 4, 18, 2);
  }

  /* ---- 메가 스크린 3분할 ---- */
  g.fillStyle(0x060a16).fillRect(20, 14, 284, 48);
  g.lineStyle(1, 0x1a2544, 1).strokeRect(20, 14, 284, 48);
  // (1) 관제 지도 + 레이더 스윕
  g.fillStyle(0x081020).fillRect(24, 18, 84, 40);
  g.fillStyle(0x14243e); // 대륙 실루엣
  g.fillRect(34, 26, 18, 12).fillRect(50, 32, 10, 14).fillRect(66, 24, 22, 10).fillRect(80, 36, 14, 12);
  for (let i = 0; i < 9; i++) {
    const on = prand(i + Math.floor(f / 40)) > 0.35;
    g.fillStyle(i % 4 === 0 ? 0xe0637a : 0x7ee0c8, on ? 0.9 : 0.25);
    g.fillRect(32 + prand(i * 2.3) * 70, 24 + prand(i * 4.7) * 30, 2, 2);
  }
  const ang = (f / 60) % (Math.PI * 2);
  g.lineStyle(1, 0x7ee0c8, 0.5).lineBetween(66, 38, 66 + Math.cos(ang) * 26, 38 + Math.sin(ang) * 17);
  g.lineStyle(1, 0x1e3050, 0.8).strokeCircle(66, 38, 14);
  // (2) 타임라인 차트
  g.fillStyle(0x081020).fillRect(112, 18, 96, 40);
  for (let b = 0; b < 14; b++) {
    const h = 4 + Math.floor(prand(b + Math.floor(f / 80)) * 22);
    g.fillStyle(b === 9 ? 0xe0637a : 0xe8b54a, 0.8).fillRect(116 + b * 6.5, 54 - h, 4, h);
  }
  g.lineStyle(1, 0x2a3860, 1).lineBetween(114, 54, 206, 54);
  const cursor = 116 + ((f / 4) % 88);
  g.lineStyle(1, 0x7ee0c8, 0.6).lineBetween(cursor, 20, cursor, 54);
  // (3) 스크롤 로그
  g.fillStyle(0x081020).fillRect(212, 18, 88, 40);
  for (let r = 0; r < 8; r++)
    dashRow(g, 216, 21 + r * 4.6, 78, r + Math.floor(f / 14), 0x7ee0c8, r % 4 === 3 ? 0.9 : 0.5);
  // 하단 티커
  g.fillStyle(0x0c1226).fillRect(20, 64, 284, 6);
  for (let i = 0; i < 20; i++) {
    const tx = ((((i * 16 - f * 0.8) % 276) + 276) % 276) | 0;
    g.fillStyle(0x7ee0c8, 0.55).fillRect(22 + tx, 66, 6, 2);
  }

  /* ---- 배지 게이트 + SOC 사인 (좌) ---- */
  g.fillStyle(0x10182e).fillRect(6, 76, 5, 46).fillRect(24, 76, 5, 46);
  g.fillStyle(0x7ee0c8, rm || f % 80 < 40 ? 0.9 : 0.3).fillRect(8, 80, 2, 2).fillRect(26, 80, 2, 2);
  g.fillStyle(0x0c1226).fillRect(6, 66, 24, 7);
  dashRow(g, 8, 68, 20, 77, 0x7ee0c8, 0.9);

  /* ---- 커피 머신 (좌벽) ---- */
  g.fillStyle(0x131c34).fillRect(10, 96, 18, 30);
  g.fillStyle(0xe8b54a, rm ? 0.7 : 0.5 + 0.25 * Math.abs(Math.sin(f / 35))).fillRect(13, 100, 12, 8);
  g.fillStyle(0x0a0f1e).fillRect(15, 112, 8, 8);
  g.fillStyle(0xd8d0be, 0.9).fillRect(17, 116, 4, 4); // 컵
  if (!rm)
    for (let s = 0; s < 2; s++) {
      const sy = 112 - ((f / 3 + s * 5) % 10);
      g.fillStyle(0xd8d0be, 0.2).fillRect(18 + s, sy, 1, 2);
    }

  /* ---- 데스크 뒤 열 (원경 4석) ---- */
  for (let i = 0; i < 4; i++) {
    const dx = 48 + i * 60;
    g.fillStyle(0x0e1526).fillRect(dx, 88, 40, 4);
    g.fillStyle(0x0a101e).fillRect(dx + 4, 92, 3, 10).fillRect(dx + 33, 92, 3, 10);
    const cols = [0x7ee0c8, 0xe8b54a, 0xb48cff, 0x7ea0e0];
    g.fillStyle(0x080c16).fillRect(dx + 10, 76, 12, 10);
    g.fillStyle(cols[i % 4], rm ? 0.5 : 0.4 + 0.15 * Math.sin(f / 26 + i * 2)).fillRect(dx + 11, 77, 10, 8);
    g.fillStyle(0x0e1526).fillRect(dx + 24, 78, 10, 8); // 옆 모니터 꺼짐/의자
    g.fillStyle(0x10182e).fillRect(dx + 14, 96, 8, 12); // 의자 실루엣
  }

  /* ---- 데스크 앞 열 (근경 — 한나 자리 + 서준 콘솔) ---- */
  // 한나 자리 (좌측, 데스크 램프 + 포스트잇)
  g.fillStyle(0x121a30).fillRect(52, 122, 64, 6);
  g.fillStyle(0x0c1226).fillRect(56, 128, 4, 18).fillRect(108, 128, 4, 18);
  g.fillStyle(0x080c16).fillRect(62, 104, 20, 16);
  g.fillStyle(0xe8b54a, 0.5).fillRect(63, 105, 18, 14);
  for (let r = 0; r < 3; r++) dashRow(g, 65, 107 + r * 4, 14, r + 90, 0x2a1c08, 0.9);
  g.lineStyle(1, 0x2a3860, 1).lineBetween(90, 122, 96, 112); // 램프 암
  g.fillStyle(0xf4d88a, rm ? 0.8 : 0.7 + 0.1 * Math.sin(f / 33)).fillRect(94, 110, 6, 3);
  g.fillStyle(0xf4d88a, 0.1).fillTriangle(97, 112, 86, 122, 108, 122);
  g.fillStyle(0x7ee0c8, 0.8).fillRect(84, 108, 4, 4); // 포스트잇
  g.fillStyle(0xe8b54a, 0.8).fillRect(84, 114, 4, 4);
  g.fillStyle(0xd8d0be, 0.7).fillRect(102, 118, 5, 4); // 식은 커피잔
  // 서준 콘솔 (중앙 전면, 듀얼 모니터 밝게)
  g.fillStyle(0x16203a).fillRect(136, 128, 72, 7);
  g.fillStyle(0x263252).fillRect(136, 128, 72, 1);
  g.fillStyle(0x0c1226).fillRect(140, 135, 5, 20).fillRect(199, 135, 5, 20);
  const my = rm ? 0.62 : 0.55 + 0.1 * Math.sin(f / 20);
  for (const mx of [142, 176] as const) {
    g.fillStyle(0x080c16).fillRect(mx, 106, 28, 20);
    g.fillStyle(0x7ee0c8, my).fillRect(mx + 2, 108, 24, 16);
    for (let r = 0; r < 3; r++)
      dashRow(g, mx + 4, 111 + r * 4, 20, r + mx + Math.floor(f / 18), 0x06221c, 0.9);
    g.fillStyle(0x10182e).fillRect(mx + 12, 126, 5, 2);
  }
  g.fillStyle(0x232c48).fillRect(154, 130, 34, 3); // 키보드
  g.fillStyle(0x10182e).fillRect(164, 136, 16, 4).fillRect(169, 140, 6, 12); // 의자

  /* ---- 유리 회의실 (우측) ---- */
  g.fillStyle(0x0a1122, 0.85).fillRect(242, 70, 72, 68);
  g.lineStyle(1, 0x22304e, 1).strokeRect(242, 70, 72, 68);
  for (let i = 1; i < 4; i++) g.lineStyle(1, 0x1a2544, 0.7).lineBetween(242 + i * 18, 70, 242 + i * 18, 138);
  g.fillStyle(0xcfe0f4, 0.06).fillRect(244, 72, 30, 64); // 유리 반사
  // 화이트보드 (사건 계보)
  g.fillStyle(0xd8e0ea, 0.85).fillRect(252, 78, 52, 26);
  g.lineStyle(1, 0xb48cff, 0.9);
  g.strokeRect(256, 82, 8, 6).strokeRect(272, 82, 8, 6).strokeRect(288, 82, 8, 6);
  g.lineBetween(264, 85, 272, 85).lineBetween(280, 85, 288, 85);
  g.lineBetween(292, 88, 292, 94).lineBetween(290, 94, 294, 94); // 물음표 단
  dashRow(g, 256, 96, 44, 33, 0x6a7690, 0.8);
  g.fillStyle(0x141c34).fillRect(258, 116, 40, 4); // 회의 테이블
  g.fillStyle(0x0e1526).fillRect(262, 120, 3, 10).fillRect(291, 120, 3, 10);

  /* ---- 바닥 반사 ---- */
  g.fillStyle(0x7ee0c8, 0.05).fillRect(24, 100, 280, 3);
  g.fillStyle(0x7ee0c8, 0.04 + (rm ? 0 : 0.02 * Math.sin(f / 28))).fillRect(140, 138, 66, 24);
  g.fillStyle(0xe8b54a, 0.04).fillRect(58, 130, 56, 18);
  g.fillStyle(0xcfe0f4, 0.03).fillRect(246, 140, 64, 14);
};
