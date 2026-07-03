import { dashRow, prand, rain, type Painter } from './helpers';

/**
 * 부모님 집 거실 (Ch2) — 밤 9시, 비 오는 골목.
 * 따뜻한 색온도의 실내 vs 차가운 창밖 대비. 자개장·브라운관 TV·뜨개 바구니·이중 잠금 현관.
 */
export const paintParents: Painter = (g, frame, env, mem) => {
  const rm = env.reduced;
  const f = rm ? 0 : frame;

  /* ---- 벽·천장·바닥 (장판) ---- */
  g.fillStyle(0x120e0c).fillRect(0, 0, 320, 10);
  g.fillStyle(0x1d1712).fillRect(0, 10, 320, 108);
  g.fillStyle(0x241c14, 0.5);
  for (let i = 0; i < 26; i++) g.fillRect(6 + i * 12, 10, 1, 108); // 벽지 줄무늬
  for (let i = 0; i < 20; i++)
    g.fillRect(12 + (i % 10) * 32, 26 + Math.floor(i / 10) * 44, 2, 2); // 벽지 모티프
  g.fillStyle(0x2a2014).fillRect(0, 118, 320, 62); // 장판
  g.fillStyle(0x342818, 0.6);
  for (let i = 0; i < 8; i++) g.fillRect(0, 126 + i * 7, 320, 1); // 장판 결
  g.fillStyle(0x1a1410).fillRect(0, 114, 320, 4); // 굽도리

  /* ---- 형광등 (가끔 깜빡) ---- */
  const flick = rm ? 1 : Math.random() < 0.008 ? 0.4 : 1;
  g.fillStyle(0x141210).fillRect(118, 6, 84, 6);
  g.fillStyle(0xf4ecd0, 0.85 * flick).fillRect(122, 8, 76, 3);
  g.fillStyle(0xf4ecd0, 0.05 * flick).fillTriangle(160, 12, 70, 118, 250, 118);

  /* ---- 가족사진 액자 (벽) ---- */
  const frames = [
    [24, 24, 16, 12],
    [46, 20, 12, 16],
    [64, 26, 14, 11],
  ] as const;
  frames.forEach(([x, y, w, h], i) => {
    g.fillStyle(0x4a3a22).fillRect(x - 1, y - 1, w + 2, h + 2);
    g.fillStyle(0xd8c8a8, 0.85).fillRect(x, y, w, h);
    g.fillStyle(0x8a7452).fillRect(x + 2, y + h - 5, w - 4, 3); // 인물 실루엣 단
    g.fillStyle(0x6a5432).fillRect(x + w / 2 - 2 + i, y + 3, 3, h - 8);
  });

  /* ---- 자개장 (좌측) ---- */
  g.fillStyle(0x3a2a18).fillRect(14, 52, 58, 64);
  g.fillStyle(0x2c2012).fillRect(16, 54, 26, 28).fillRect(44, 54, 26, 28);
  g.fillStyle(0x2c2012).fillRect(16, 86, 54, 28);
  g.lineStyle(1, 0x4e3a20, 1).strokeRect(16, 86, 54, 28);
  // 자개 무늬 (은은한 무지개 픽셀)
  for (let i = 0; i < 14; i++) {
    const cols = [0x7ee0c8, 0xb48cff, 0xe8b54a, 0xd8c8a8];
    const tw = rm ? 0.35 : 0.2 + 0.25 * Math.abs(Math.sin(f / 90 + i));
    g.fillStyle(cols[i % 4], tw);
    g.fillRect(20 + prand(i) * 44, 58 + prand(i + 31) * 20, 2, 2);
  }
  g.fillStyle(0xe8b54a, 0.7).fillRect(40, 66, 2, 3).fillRect(46, 66, 2, 3); // 손잡이
  // 장 위: 액자 + 레이스 덮개
  g.fillStyle(0xd8d0be, 0.8).fillRect(18, 49, 50, 3);
  g.fillStyle(0x4a3a22).fillRect(24, 40, 12, 10);
  g.fillStyle(0xd8c8a8).fillRect(25, 41, 10, 8);
  g.fillStyle(0x8a7452).fillRect(27, 44, 6, 4);
  // 유선 전화기 (그날의 목소리가 들어온)
  g.fillStyle(0x8a2f3e).fillRect(50, 43, 14, 6);
  g.fillStyle(0xa84a58).fillRect(49, 40, 16, 3); // 수화기
  g.fillStyle(0x5c1f2a).fillRect(52, 45, 2, 2).fillRect(56, 45, 2, 2).fillRect(60, 45, 2, 2);
  g.lineStyle(1, 0x5c1f2a, 0.9).lineBetween(64, 46, 67, 50);

  /* ---- 브라운관 TV + 뉴스 ---- */
  g.fillStyle(0x2a2014).fillRect(86, 102, 46, 14); // TV 장
  g.fillStyle(0x181410).fillRect(88, 68, 42, 34); // 본체
  const tvGlow = rm ? 0.5 : 0.4 + 0.15 * Math.abs(Math.sin(f / 16)) + (Math.random() < 0.05 ? 0.1 : 0);
  g.fillStyle(0x3a6a9a, tvGlow).fillRect(91, 71, 32, 26); // 화면
  g.fillStyle(0x0c0f16, 0.9).fillRect(91, 71, 32, 4); // 상단 어둠
  dashRow(g, 93, 90, 28, 5 + Math.floor(f / 90), 0xffffff, 0.8); // 자막
  g.fillStyle(0xe0637a, rm || f % 50 < 25 ? 0.9 : 0.3).fillRect(93, 73, 3, 3); // LIVE
  g.fillStyle(0x101010).fillRect(124, 74, 5, 20); // 조작부
  g.fillStyle(0xe8b54a, 0.6).fillRect(125, 76, 2, 2);

  /* ---- 소파 + 뜨개 바구니 ---- */
  g.fillStyle(0x4a3524).fillRect(140, 88, 70, 34);
  g.fillStyle(0x3a2a1c).fillRect(136, 84, 8, 38).fillRect(206, 84, 8, 38); // 팔걸이
  g.fillStyle(0x55402c).fillRect(144, 92, 30, 14).fillRect(176, 92, 30, 14); // 쿠션
  g.lineStyle(1, 0x3a2a1c, 1).lineBetween(175, 92, 175, 106);
  g.fillStyle(0xe8b54a, 0.5).fillRect(144, 100, 30, 3); // 담요 줄무늬
  g.fillStyle(0x2c2012).fillRect(216, 108, 16, 10); // 바구니
  g.fillStyle(0xe0637a).fillCircle(220, 108, 2);
  g.fillStyle(0x7ee0c8).fillCircle(225, 107, 2);
  g.fillStyle(0xe8b54a).fillCircle(228, 110, 2);
  g.lineStyle(1, 0xd8d0be, 0.8).lineBetween(222, 104, 230, 98); // 바늘

  /* ---- 좌탁 + 서준의 노트북 + 믹스커피 ---- */
  g.fillStyle(0x3a2a18).fillRect(148, 128, 52, 5);
  g.fillStyle(0x2c2012).fillRect(152, 133, 4, 12).fillRect(192, 133, 4, 12);
  g.fillStyle(0x10141e).fillRect(158, 118, 26, 10); // 노트북 스크린
  const lap = rm ? 0.6 : 0.5 + 0.12 * Math.sin(f / 20);
  g.fillStyle(0x7ee0c8, lap).fillRect(160, 120, 22, 7);
  for (let r = 0; r < 2; r++) dashRow(g, 161, 121 + r * 3, 18, r + Math.floor(f / 30), 0x0a1a16, 0.8);
  g.fillStyle(0x1a2030).fillRect(156, 128, 30, 2); // 키보드부
  g.fillStyle(0x8a5a2a).fillRect(190, 124, 5, 5); // 커피잔
  if (!rm)
    for (let s = 0; s < 2; s++) {
      const sy = 122 - ((f / 2.5 + s * 7) % 12);
      g.fillStyle(0xd8d0be, 0.22 - (122 - sy) * 0.015).fillRect(191 + s, sy, 1, 2);
    }

  /* ---- 창문: 골목 풍경 ---- */
  g.fillStyle(0x060a14).fillRect(238, 24, 62, 74);
  g.fillGradientStyle(0x101a30, 0x101a30, 0x1c2848, 0x1c2848, 0.9, 0.9, 0.6, 0.6);
  g.fillRect(240, 26, 58, 70);
  g.fillStyle(0x0a0f1e); // 골목 집들
  ([[242, 62, 14, 34], [258, 68, 12, 28], [272, 58, 14, 38], [288, 66, 10, 30]] as const)
    .forEach(([x, y, w, h]) => g.fillRect(x, y, w, h));
  g.fillStyle(0xe8b54a, 0.5); // 창 불빛
  ([[246, 70], [262, 74], [276, 64], [290, 72]] as const).forEach(([x, y], i) => {
    if (prand(i + Math.floor(f / 160)) > 0.3) g.fillRect(x, y, 2, 2);
  });
  // 가로등 + 광원 콘
  g.fillStyle(0x1a2340).fillRect(266, 40, 2, 24);
  const street = rm ? 0.7 : 0.55 + 0.15 * Math.abs(Math.sin(f / 45));
  g.fillStyle(0xf4d88a, street).fillRect(264, 38, 6, 3);
  g.fillStyle(0xf4d88a, 0.12 * street).fillTriangle(267, 40, 258, 64, 276, 64);
  g.lineStyle(1, 0x141c30, 1).lineBetween(240, 34, 298, 38); // 전선
  if (!rm) rain(g, mem, 'homeRain', { x: 240, y: 26, w: 58, h: 68, n: 46, alpha: 0.3 });
  // 창틀 + 화분
  g.fillStyle(0x3a2a18);
  g.fillRect(238, 24, 62, 3).fillRect(238, 95, 62, 3);
  g.fillRect(238, 24, 3, 74).fillRect(297, 24, 3, 74).fillRect(267, 24, 2, 74);
  g.fillStyle(0x2c2012).fillRect(244, 90, 8, 6).fillRect(284, 90, 8, 6);
  g.fillStyle(0x4a7a4a).fillRect(245, 85, 2, 5).fillRect(248, 83, 2, 7).fillRect(286, 84, 2, 6).fillRect(289, 86, 2, 4);

  /* ---- 현관문 (이중 잠금) ---- */
  g.fillStyle(0x241a10).fillRect(306, 34, 14, 84);
  g.lineStyle(1, 0x3a2a18, 1).strokeRect(308, 40, 10, 32);
  g.fillStyle(0xe8b54a, 0.9).fillRect(308, 78, 3, 3).fillRect(308, 86, 3, 3); // 잠금장치 2개
  g.fillStyle(0x8a94a8, 0.8).fillRect(308, 96, 4, 2); // 손잡이
  g.fillStyle(0x1a1410).fillRect(300, 110, 6, 8); // 우산꽂이
  g.lineStyle(1, 0x4a5a7a, 1).lineBetween(302, 104, 303, 110);

  /* ---- 벽시계 + 달력 ---- */
  g.fillStyle(0x241c10).fillCircle(220, 30, 8);
  g.lineStyle(1, 0x4a3a22, 1).strokeCircle(220, 30, 8);
  g.lineStyle(1, 0xd8d0be, 1).lineBetween(220, 30, 220, 25).lineBetween(220, 30, 224, 33);
  g.fillStyle(0xd8d0be, 0.9).fillRect(214, 44, 14, 18); // 달력
  g.fillStyle(0xe0637a).fillRect(214, 44, 14, 4);
  for (let r = 0; r < 3; r++) dashRow(g, 215, 51 + r * 4, 12, r + 40, 0x8a8272, 0.8);

  /* ---- 바닥 광 반사 ---- */
  g.fillStyle(0xf4ecd0, 0.05 * flick).fillRect(120, 122, 90, 30);
  g.fillStyle(0x3a6a9a, 0.06 * tvGlow).fillRect(90, 118, 44, 16);
};
