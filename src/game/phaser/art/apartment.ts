import { dashRow, prand, rain, type Painter } from './helpers';

/**
 * 서준의 아파트 작업실 (프롤로그·Ch1) — 새벽 2시, 비.
 * 고밀도 리모델링: 조명 콘·책장·서버랙·러그·머그 스팀·3중 스카이라인.
 */
export const paintApartment: Painter = (g, frame, env, mem) => {
  const rm = env.reduced;
  const f = rm ? 0 : frame;

  /* ---- 벽·천장·바닥 ---- */
  g.fillStyle(0x080c16).fillRect(0, 0, 320, 12); // 천장
  g.fillStyle(0x0b1020).fillRect(0, 12, 320, 104); // 벽
  g.fillGradientStyle(0x0d1226, 0x0d1226, 0x0b1020, 0x0b1020, 0.7, 0.7, 0, 0);
  g.fillRect(0, 12, 320, 40); // 벽 상단 음영
  g.fillStyle(0x0e1428).fillRect(0, 116, 320, 4); // 굽도리
  g.fillStyle(0x080c18).fillRect(0, 120, 320, 60); // 바닥
  g.fillStyle(0x0a0f20, 0.8);
  for (let i = 0; i < 40; i++) g.fillRect(prand(i) * 320, 124 + prand(i + 9) * 52, 2, 1); // 바닥 디더

  /* ---- 펜던트 조명 + 광원 콘 ---- */
  g.lineStyle(1, 0x1e2946, 1).lineBetween(166, 0, 166, 20);
  g.fillStyle(0x141a2e).fillRect(160, 20, 12, 5);
  const lampPulse = rm ? 0.05 : 0.045 + 0.01 * Math.sin(f / 40);
  g.fillStyle(0xe8d9a0, lampPulse).fillTriangle(166, 24, 112, 118, 224, 118);
  g.fillStyle(0xf4e6b8, 0.9).fillRect(163, 24, 6, 2); // 전구

  /* ---- 현관문 (좌측) ---- */
  g.fillStyle(0x131a30).fillRect(0, 42, 16, 78);
  g.lineStyle(1, 0x1a2340, 1);
  g.strokeRect(2, 48, 11, 30);
  g.strokeRect(2, 84, 11, 30);
  g.fillStyle(0xe8b54a, 0.8).fillRect(12, 80, 2, 3); // 손잡이

  /* ---- 코르크 사건 보드 ---- */
  g.fillStyle(0x2a2118).fillRect(20, 28, 58, 58);
  g.fillStyle(0x3a2e20).fillRect(22, 30, 54, 54);
  const notes = [
    [28, 38, 10, 8],
    [48, 36, 12, 9],
    [64, 44, 9, 10],
    [32, 56, 11, 8],
    [52, 60, 10, 9],
    [40, 72, 12, 8],
  ] as const;
  notes.forEach(([x, y, w, h], i) => {
    g.fillStyle(i % 2 ? 0xb9b09a : 0xcfc6ae).fillRect(x, y, w, h);
    g.fillStyle(0x8a8272);
    g.fillRect(x + 2, y + 2, w - 4, 1).fillRect(x + 2, y + 5, w - 5, 1);
    g.fillStyle(i % 3 ? 0xe0637a : 0xe8b54a).fillRect(x + w / 2 - 1, y - 1, 2, 2); // 핀
  });
  if (env.boardDone) {
    g.lineStyle(1, 0x7ee0c8, 0.7);
    g.lineBetween(33, 42, 54, 40).lineBetween(54, 40, 68, 48).lineBetween(37, 60, 46, 76);
    g.lineBetween(57, 64, 68, 48);
  } else {
    g.lineStyle(1, 0xe0637a, 0.35).lineBetween(33, 42, 54, 40);
  }

  /* ---- 포스터 (네온 위상) ---- */
  const posterGlow = rm ? 0.55 : 0.4 + 0.2 * Math.abs(Math.sin(f / 70)) + (Math.random() < 0.006 ? 0.3 : 0);
  g.fillStyle(0x16102a).fillRect(84, 26, 24, 32);
  g.lineStyle(1, 0xb48cff, posterGlow * 0.8).strokeRect(84, 26, 24, 32);
  g.fillStyle(0xb48cff, posterGlow).fillRect(88, 32, 16, 3);
  dashRow(g, 88, 40, 16, 3, 0xb48cff, posterGlow * 0.6);
  dashRow(g, 88, 46, 16, 11, 0x7ee0c8, posterGlow * 0.4);

  /* ---- 벽시계 (02:41) ---- */
  g.fillStyle(0x0e1428).fillCircle(130, 32, 7);
  g.lineStyle(1, 0x2a3860, 1).strokeCircle(130, 32, 7);
  g.lineStyle(1, 0x9fb4d8, 1).lineBetween(130, 32, 129, 27); // 시침(≈2시 반대편 새벽 감성)
  g.lineBetween(130, 32, 134, 34); // 분침

  /* ---- 책장 ---- */
  g.fillStyle(0x171e38).fillRect(84, 64, 26, 52);
  g.fillStyle(0x0d1224).fillRect(86, 66, 22, 14).fillRect(86, 82, 22, 14).fillRect(86, 98, 22, 16);
  const spines = [0x3a4a7a, 0x6a3a4a, 0x3a6a5a, 0x8a6a3a, 0x4a3a6a, 0x2f4a6a];
  for (let s = 0; s < 3; s++) {
    let bx = 87;
    for (let i = 0; i < 5 && bx < 105; i++) {
      const bw = 3 + Math.floor(prand(s * 7 + i) * 2);
      const bh = 9 + Math.floor(prand(s * 13 + i) * 4);
      g.fillStyle(spines[(s * 5 + i) % spines.length]);
      g.fillRect(bx, 80 + s * 16 - bh + (s === 2 ? 2 : 0), bw, bh);
      bx += bw + 1;
    }
  }

  /* ---- 책상 + 다리 + 서버 랙 ---- */
  g.fillStyle(0x1a2238).fillRect(112, 96, 100, 6);
  g.fillStyle(0x263252).fillRect(112, 96, 100, 1); // 상판 하이라이트
  g.fillStyle(0x141a2e).fillRect(116, 102, 6, 26).fillRect(202, 102, 6, 26);
  g.fillStyle(0x0d1224).fillRect(124, 104, 24, 24); // 랙 본체
  g.lineStyle(1, 0x1a2340, 1).strokeRect(124, 104, 24, 24);
  for (let i = 0; i < 6; i++) {
    const on = rm ? i % 2 === 0 : prand(i + Math.floor(f / 17)) > 0.4;
    g.fillStyle(on ? (i % 3 === 0 ? 0xe8b54a : 0x7ee0c8) : 0x1a2340);
    g.fillRect(128 + (i % 2) * 9, 108 + Math.floor(i / 2) * 6, 2, 2);
  }
  g.lineStyle(1, 0x1e2946, 1); // 케이블
  g.lineBetween(150, 102, 152, 110).lineBetween(152, 110, 148, 120).lineBetween(148, 120, 148, 128);

  /* ---- 모니터 2대 (스크롤 로그 + 차트) ---- */
  const glow = rm ? 0.5 : 0.45 + 0.1 * Math.sin(f / 22);
  for (const [mx, kind] of [
    [118, 'log'],
    [160, 'chart'],
  ] as const) {
    g.fillStyle(0x0a0e1a).fillRect(mx, 62, 38, 28);
    g.fillStyle(0x7ee0c8, glow * 0.35).fillRect(mx + 2, 64, 34, 24);
    if (kind === 'log') {
      for (let r = 0; r < 5; r++)
        dashRow(g, mx + 4, 67 + r * 4, 28, r + Math.floor(f / 24), 0x7ee0c8, 0.75);
    } else {
      for (let b = 0; b < 7; b++) {
        const h = 3 + Math.floor(prand(b + Math.floor(f / 60)) * 14);
        g.fillStyle(b === 4 ? 0xe0637a : 0xe8b54a, 0.8).fillRect(mx + 5 + b * 4, 86 - h, 3, h);
      }
    }
    const sweep = rm ? 6 : (f * 0.5) % 24;
    g.fillStyle(0xffffff, 0.05).fillRect(mx + 2, 64 + sweep, 34, 1); // 스캔 스윕
    g.fillStyle(0x141a2e).fillRect(mx + 16, 90, 6, 6); // 스탠드
  }

  /* ---- 키보드·마우스·휴대폰·머그 ---- */
  g.fillStyle(0x232c48).fillRect(138, 98, 36, 4);
  g.fillStyle(0x2e3a5e);
  for (let k = 0; k < 8; k++) g.fillRect(140 + k * 4, 99, 2, 2);
  g.fillStyle(0x1a2340).fillRect(178, 98, 4, 5);
  g.fillStyle(0x101626).fillRect(186, 96, 10, 5); // 휴대폰
  const blink = rm ? true : f % 60 < 30;
  if (!env.phoneRead && env.chapter === 0 && blink) g.fillStyle(0xe8b54a).fillRect(188, 97, 6, 3);
  g.fillStyle(0x24304e).fillRect(200, 90, 6, 6); // 머그
  g.lineStyle(1, 0x24304e, 1).strokeCircle(207, 93, 2);
  if (!rm)
    for (let s = 0; s < 3; s++) {
      const sy = 88 - ((f / 2 + s * 6) % 14);
      g.fillStyle(0xcfd8ea, 0.25 - (88 - sy) * 0.014).fillRect(201 + (s % 2), sy, 1, 2);
    }

  /* ---- 의자 + 러그 ---- */
  g.fillStyle(0x161d34).fillRect(148, 90, 5, 22); // 등받이
  g.fillStyle(0x1a2340).fillRect(146, 112, 24, 5); // 좌판
  g.fillStyle(0x141a2e).fillRect(156, 117, 4, 10);
  g.fillStyle(0x10162a).fillRect(150, 127, 16, 2);
  g.fillStyle(0x0c1226).fillRect(118, 132, 92, 20); // 러그
  g.lineStyle(1, 0x141c36, 1).strokeRect(118, 132, 92, 20);
  dashRow(g, 124, 140, 80, 21, 0x141c36, 0.9);

  /* ---- 창문: 3중 스카이라인 + 비 ---- */
  g.fillStyle(0x060a14).fillRect(222, 22, 92, 86);
  const dawn = env.chapter >= 1;
  const neon = rm
    ? 0.5
    : 0.35 + 0.25 * Math.abs(Math.sin(f / 50)) + (Math.random() < 0.01 ? 0.3 : 0);
  g.fillGradientStyle(
    dawn ? 0x24365e : 0x1e2d5a,
    dawn ? 0x24365e : 0x1e2d5a,
    dawn ? 0x6a4a8e : 0x583c96,
    0x7ee0c8,
    0.9,
    0.9,
    neon * 0.5,
    neon * 0.35,
  );
  g.fillRect(224, 24, 88, 82);
  // 원경
  g.fillStyle(0x090e1e);
  ([[228, 44, 8], [238, 36, 6], [246, 50, 10], [258, 40, 7], [268, 54, 9], [280, 42, 8], [292, 48, 10], [304, 56, 8]] as const)
    .forEach(([x, y, w]) => g.fillRect(x, y, w, 106 - y));
  // 중경 + 항공등
  g.fillStyle(0x0c1330);
  ([[232, 56, 14], [250, 46, 12], [266, 62, 16], [286, 52, 13], [302, 68, 10]] as const)
    .forEach(([x, y, w]) => g.fillRect(x, y, w, 106 - y));
  if (rm || f % 90 < 10) g.fillStyle(0xe0637a, 0.9).fillRect(255, 44, 2, 2);
  // 창문 불빛 (느린 토글)
  for (let i = 0; i < 16; i++) {
    if (prand(i + Math.floor(f / 140)) < 0.45) continue;
    const x = 232 + Math.floor(prand(i * 3.1) * 76);
    const y = 52 + Math.floor(prand(i * 5.7) * 44);
    g.fillStyle(i % 5 === 0 ? 0x7ee0c8 : 0xe8b54a, 0.5 * neon + 0.2).fillRect(x, y, 2, 2);
  }
  g.fillStyle(0xb48cff, 0.7 * neon).fillRect(230, 62, 12, 3); // 네온 간판
  g.fillStyle(0xb48cff, 0.25 * neon).fillRect(230, 66, 12, 1); // 간판 반사
  // 근경 옥상 실루엣 + 급수탑
  g.fillStyle(0x0f1836).fillRect(224, 92, 88, 14);
  g.fillRect(238, 84, 10, 8).fillRect(276, 86, 8, 6);
  g.fillStyle(0x131c3e).fillRect(240, 80, 6, 4);
  if (!rm) rain(g, mem, 'aptRain', { x: 224, y: 24, w: 88, h: 80, n: 80 });
  // 유리 물줄기
  if (!rm) {
    const gx = 226 + ((f / 3) % 84);
    g.lineStyle(1, 0xcfd8ea, 0.12).lineBetween(gx, 26, gx, 104);
  }
  // 창틀
  g.fillStyle(0x1a2544);
  g.fillRect(222, 22, 92, 3).fillRect(222, 105, 92, 3);
  g.fillRect(222, 22, 3, 86).fillRect(311, 22, 3, 86).fillRect(266, 22, 3, 86);
  g.fillRect(222, 62, 92, 2);

  /* ---- 바닥 반사광 ---- */
  g.fillStyle(0x7ee0c8, 0.06 + (rm ? 0 : 0.03 * Math.sin(f / 30))).fillRect(120, 128, 88, 28);
  g.fillStyle(0x583c96, 0.05 * neon).fillRect(230, 122, 76, 22);
};
