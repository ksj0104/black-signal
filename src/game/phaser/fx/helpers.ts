import type Phaser from 'phaser';

export type G = Phaser.GameObjects.Graphics;

/** 페인터가 매 프레임 받는 게임 상태 스냅샷 */
export interface SceneEnv {
  chapter: number;
  reduced: boolean;
  phoneRead: boolean;
  boardDone: boolean;
}

/** 페인터 간 프레임 상태(빗방울·먼지 등) — PixelScene 이 씬 수명 동안 유지 */
export type Mem = Record<string, unknown>;

/** 640×360 생성 배경 위에 얹는 코드 이펙트 페인터. Graphics 로만 그린다. */
export type Painter = (g: G, frame: number, env: SceneEnv, mem: Mem) => void;

interface Drop {
  x: number;
  y: number;
  v: number;
}

/** 사각 영역에 내리는 빗줄기 (방울 상태는 mem[key] 에 유지) */
export function rain(
  g: G,
  mem: Mem,
  key: string,
  o: { x: number; y: number; w: number; h: number; n: number; wind?: number; alpha?: number },
): void {
  let drops = mem[key] as Drop[] | undefined;
  if (!drops) {
    drops = Array.from({ length: o.n }, () => ({
      x: o.x + Math.random() * o.w,
      y: o.y + Math.random() * o.h,
      v: 2 + Math.random() * 2,
    }));
    mem[key] = drops;
  }
  const wind = o.wind ?? -0.4;
  g.lineStyle(1, 0xa0bee6, o.alpha ?? 0.35);
  for (const d of drops) {
    g.lineBetween(d.x, d.y, d.x + wind * 2.5, d.y + 4);
    d.y += d.v;
    d.x += wind;
    if (d.y > o.y + o.h || d.x < o.x || d.x > o.x + o.w) {
      d.y = o.y;
      d.x = o.x + Math.random() * o.w;
    }
  }
}

/** 결정적 의사난수 [0,1) — 프레임과 무관하게 고정된 레이아웃/토글에 사용 */
export const prand = (i: number): number => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

/** 글자 흉내 대시 행 — 모니터·전광판·문서 텍스트 표현 (seed 로 패턴 고정) */
export function dashRow(
  g: G,
  x: number,
  y: number,
  w: number,
  seed: number,
  color: number,
  alpha = 1,
): void {
  g.fillStyle(color, alpha);
  let cx = x;
  let i = seed;
  while (cx < x + w - 3) {
    const len = 2 + Math.floor(prand(i) * 6);
    g.fillRect(cx, y, Math.min(len, x + w - cx), 2);
    cx += len + 2 + Math.floor(prand(i + 57) * 3);
    i += 1.37;
  }
}
