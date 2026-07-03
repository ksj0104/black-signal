# 픽셀 씬 이미지 파이프라인 전환 — 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 코드 드로잉 320×180 픽셀 씬 4종을 codex imagegen 배경(640×360) + 코드 이펙트 구조로 교체한다.

**Architecture:** Phaser 캔버스를 640×360으로 올리고, 배경 PNG를 바닥 레이어로 로드(실패 시 기존 페인터 2× 스케일 폴백). 동적 요소는 씬별 이펙트 페인터(`fx/`)가 그 위에 그린다. 배경은 codex CLI가 `docs/art-prompts/<scene>.md` 지시서를 읽어 생성하고, PowerShell 스크립트로 최근접 이웃 다운스케일한다.

**Tech Stack:** Vite 6 + TypeScript strict, React 18, Phaser 3 (CANVAS), Vitest, Playwright MCP(검증), codex-cli 0.142.3, PowerShell + .NET System.Drawing.

## Global Constraints

- 새 npm 의존성 추가 금지 (스펙: "새 의존성 없음")
- 모든 씬 콘텐츠는 허구 데이터 — 실존 브랜드/인물/기관 표기 금지
- 배경 확정본은 정확히 640×360 PNG, `public/scenes/<scene>.png`
- 원본 생성물은 `public/scenes/raw/<scene>.png`, 1280×720 이상
- 이펙트는 `env.reduced`(모션 줄이기)를 존중한다
- 4장 전부 확정되기 전에는 코드 아트 폴백을 삭제하지 않는다
- 커밋 메시지 말미: `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`

---

### Task 0: git 저장소 초기화

프로젝트가 git 저장소가 아니다. 이 계획의 커밋 체크포인트를 위해 초기화한다.

**Files:** 없음 (git 메타만)

- [ ] **Step 1: init + 베이스라인 커밋**

```powershell
git init; git add -A; git commit -m @'
chore: baseline before pixel-scene imagegen pipeline (v1.0)

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>
'@
```

`.gitignore`에 `node_modules` 포함 여부 확인(이미 있음). `dist/`, `.playwright-mcp/`, 루트의 `scene-*.png` 스크린샷은 커밋 전 `.gitignore`에 추가:

```
dist
.playwright-mcp
scene-*.png
```

- [ ] **Step 2: 확인**

Run: `git log --oneline` → 커밋 1개.

---

### Task 1: 핫스팟 라벨 UX — 펄스 상시 라벨 제거 + 라벨 박스 하단 표시

**Files:**
- Modify: `src/components/SceneScreen.tsx:32-49`
- Modify: `src/styles/global.css:338-360`

**Interfaces:**
- Produces: `.hot > .hotLabel` 마크업 (이후 태스크와 독립)

- [ ] **Step 1: SceneScreen 라벨을 span으로 감싼다**

`src/components/SceneScreen.tsx`의 버튼 내용 `{h.label}` →

```tsx
<span className="hotLabel">{h.label}</span>
```

- [ ] **Step 2: CSS — 라벨은 hover/focus에서만, 박스 하단 바깥에 표시**

`src/styles/global.css`의 `.hot` 블록(338~360행)을 다음으로 교체:

```css
.hot {
  position: absolute;
  background: transparent;
  border: 1px dashed transparent;
  border-radius: 2px;
  padding: 0;
}
.hotLabel {
  position: absolute;
  top: calc(100% + 4px);
  left: 50%;
  transform: translateX(-50%);
  white-space: nowrap;
  visibility: hidden;
  color: var(--phos);
  font-size: 0.72em;
  font-family: var(--font-px);
  letter-spacing: 0.1em;
  text-shadow: 0 0 8px rgba(126, 224, 200, 0.7);
  background: rgba(6, 12, 24, 0.82);
  padding: 2px 6px;
  border-radius: 2px;
  pointer-events: none;
}
.hot:hover, .hot:focus-visible {
  border-color: var(--phos);
  background: rgba(126, 224, 200, 0.08);
}
.hot:hover .hotLabel, .hot:focus-visible .hotLabel { visibility: visible; }
.hot.pulse {
  animation: pulse 1.6s ease-in-out infinite;
  border-color: var(--amber);
}
.hot.pulse .hotLabel { color: var(--amber); }
body.rm .hot.pulse { animation: none; }
```

(`@keyframes pulse`는 기존 그대로 유지.)

- [ ] **Step 3: 렌더 검증**

dev 서버에서 Playwright로 아파트 씬(챕터 0) 스크린샷:
펄스 박스에 라벨이 상시 표시되지 않고, hover 시 박스 아래에 라벨이 뜨는지 확인.
씬 하단 가장자리 핫스팟(승강장 `bag` 등)에서 라벨이 캔버스 밖으로 나가면
`top: calc(100% + 4px)` 대신 자동 뒤집기 없이 그대로 두되 캡션 바와 겹치지 않는지 확인.

- [ ] **Step 4: 테스트 + 커밋**

Run: `npm test -- --run` → 214개 전부 통과 (마크업 변경은 로직 테스트에 영향 없음).

```powershell
git add src/components/SceneScreen.tsx src/styles/global.css
git commit -m @'
fix(scene): show hotspot labels only on hover/focus, below the box

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>
'@
```

---

### Task 2: 캔버스 640×360 + 배경 로더 + 코드 아트 폴백

**Files:**
- Create: `src/game/phaser/bg.ts`
- Modify: `src/game/phaser/PixelScene.ts` (전면 교체)
- Modify: `src/game/PhaserHost.tsx`
- Modify: `src/components/SceneScreen.tsx:31`
- Test: `src/tests/scenes.test.ts` (bg 유닛 테스트 추가)

**Interfaces:**
- Consumes: `SCENE_ART: Record<SceneId, Painter>` (기존), `SCENE_FX` (Task 3 — 이 태스크 시점에는 빈 스텁을 함께 만든다)
- Produces:
  - `bgUrl(id: SceneId): string` — `'scenes/apartment.png'` 형태
  - `PhaserHost` props: `{ sceneId: SceneId; aria: string }` (기존 `paint` prop 제거)
  - `PixelScene.init` data: `{ sceneId: SceneId; getEnv: () => SceneEnv }`

- [ ] **Step 1: 실패하는 테스트 작성**

`src/tests/scenes.test.ts`에 추가:

```ts
import { bgUrl } from '../game/phaser/bg';

describe('배경 에셋 URL', () => {
  it('씬 id → public 경로', () => {
    expect(bgUrl('apartment')).toBe('scenes/apartment.png');
    expect(bgUrl('station')).toBe('scenes/station.png');
  });
});
```

- [ ] **Step 2: 실패 확인**

Run: `npm test -- --run scenes` → FAIL (`bg.ts` 없음).

- [ ] **Step 3: `src/game/phaser/bg.ts` 작성**

```ts
import type { SceneId } from '../../content/scenes';

/** 씬 배경 이미지의 public 경로 (Vite public/ 루트 기준) */
export const bgUrl = (id: SceneId): string => `scenes/${id}.png`;
```

- [ ] **Step 4: `PixelScene.ts` 전면 교체 — 배경 로드 + 폴백**

```ts
import Phaser from 'phaser';
import type { Mem, Painter, SceneEnv } from './art/helpers';
import type { SceneId } from '../../content/scenes';
import { SCENE_ART } from './art';
import { SCENE_FX } from './fx';
import { bgUrl } from './bg';

/** 640×360 픽셀 씬 — 생성 배경 PNG + 코드 이펙트. 배경 없으면 코드 아트 2× 폴백. */
export class PixelScene extends Phaser.Scene {
  static KEY = 'pixel';
  private g!: Phaser.GameObjects.Graphics;
  private frame = 0;
  private mem: Mem = {};
  private sceneId: SceneId = 'apartment';
  private hasBg = false;
  private getEnv: () => SceneEnv = () => ({
    chapter: 0,
    reduced: false,
    phoneRead: false,
    boardDone: false,
  });

  constructor() {
    super(PixelScene.KEY);
  }
  init(data: { sceneId?: SceneId; getEnv?: () => SceneEnv }) {
    if (data.sceneId) this.sceneId = data.sceneId;
    if (data.getEnv) this.getEnv = data.getEnv;
  }
  preload() {
    this.load.image('bg:' + this.sceneId, bgUrl(this.sceneId));
  }
  create() {
    this.hasBg = this.textures.exists('bg:' + this.sceneId);
    if (this.hasBg) this.add.image(0, 0, 'bg:' + this.sceneId).setOrigin(0, 0);
    this.g = this.add.graphics();
    if (!this.hasBg) this.g.setScale(2); // 320×180 좌표계 코드 아트 폴백
    this.mem = {};
  }
  update() {
    this.frame++;
    this.g.clear();
    const paint: Painter = this.hasBg ? SCENE_FX[this.sceneId] : SCENE_ART[this.sceneId];
    paint(this.g, this.frame, this.getEnv(), this.mem);
  }
}
```

주의: Phaser의 `load.image` 404는 예외가 아니라 텍스처 미등록으로 끝난다 —
`textures.exists` 분기로 충분하다. 콘솔의 404 로그는 전환기 동안 허용.

- [ ] **Step 5: `PhaserHost.tsx` — 640×360 + sceneId 전달**

`width: 320, height: 180` → `width: 640, height: 360`.
props `{ paint, aria }` → `{ sceneId, aria }`, `useEffect` 의존성 `[paint]` → `[sceneId]`,
`scene.add(..., { paint, getEnv })` → `{ sceneId, getEnv }`.
import에서 `Painter` 제거, `import type { SceneId } from '../content/scenes'` 추가.

- [ ] **Step 6: `SceneScreen.tsx` 호출부 교체**

```tsx
<PhaserHost key={def.id} sceneId={def.id} aria={def.aria} />
```

`SCENE_ART` import 제거.

- [ ] **Step 7: 테스트 + 렌더 검증**

Run: `npm test -- --run` → 전부 통과.
dev 서버 + Playwright: 배경 파일이 아직 없으므로 4씬 모두 폴백(기존 아트, 2× 스케일)이
이전과 동일하게 렌더되는지 스크린샷 확인. 캔버스 실제 크기 640×360 확인:
`document.querySelector('.pxHost canvas').width === 640`.

- [ ] **Step 8: 커밋**

```powershell
git add src/game src/components/SceneScreen.tsx src/tests/scenes.test.ts
git commit -m @'
feat(scene): 640x360 canvas, generated-background loader with code-art fallback

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>
'@
```

---

### Task 3: 씬별 이펙트 페인터 스캐폴드 (`fx/`)

Task 2가 import하는 `SCENE_FX`를 실제로 채운다. 좌표는 640×360 기준 초기값 —
씬별 통합 태스크(6~9)에서 생성 이미지에 맞춰 보정한다.

**Files:**
- Create: `src/game/phaser/fx/index.ts`
- Create: `src/game/phaser/fx/apartment.ts`, `fx/parents.ts`, `fx/soc.ts`, `fx/station.ts`
- Test: `src/tests/scenes.test.ts`

**Interfaces:**
- Consumes: `Painter`, `rain`, `dashRow`, `prand` (`art/helpers.ts`)
- Produces: `SCENE_FX: Record<SceneId, Painter>`

- [ ] **Step 1: 실패하는 테스트**

`scenes.test.ts`의 "모든 씬에 페인터가 등록돼 있다" 테스트에 SCENE_FX를 추가:

```ts
import { SCENE_FX } from '../game/phaser/fx';
// describe('씬 정의 무결성') 안:
it('모든 씬에 이펙트 페인터가 등록돼 있다', () => {
  for (const d of defs) expect(typeof SCENE_FX[d.id]).toBe('function');
});
```

Run: `npm test -- --run scenes` → FAIL.

- [ ] **Step 2: fx 모듈 4종 + index 작성**

`fx/index.ts`:

```ts
import type { SceneId } from '../../../content/scenes';
import type { Painter } from '../art/helpers';
import { fxApartment } from './apartment';
import { fxParents } from './parents';
import { fxSoc } from './soc';
import { fxStation } from './station';

/** 씬 id → 생성 배경 위에 얹는 640×360 이펙트 페인터 */
export const SCENE_FX: Record<SceneId, Painter> = {
  apartment: fxApartment,
  parents: fxParents,
  soc: fxSoc,
  station: fxStation,
};
```

`fx/apartment.ts` (초기 좌표 — Task 6에서 보정):

```ts
import type { Painter } from '../art/helpers';
import { rain } from '../art/helpers';

/** 아파트: 창밖 비 + 모니터 글로우 펄스 + 램프 미세 플리커 (640×360) */
export const fxApartment: Painter = (g, frame, env, mem) => {
  // 창 영역(l69~98%, t12~60% → ×6.4/×3.6)
  if (!env.reduced) rain(g, mem, 'aptRain', { x: 442, y: 43, w: 186, h: 173, n: 26, alpha: 0.3 });
  if (env.reduced) return;
  // 모니터 글로우 펄스 (듀얼 모니터 중앙 l35~55%)
  const pulse = 0.05 + 0.04 * Math.sin(frame / 24);
  g.fillStyle(0x7ee0c8, pulse);
  g.fillRect(224, 119, 130, 90);
  // 천장 램프 플리커 (드물게)
  if (frame % 173 < 3) {
    g.fillStyle(0xf2e4b0, 0.05);
    g.fillRect(400, 60, 60, 40);
  }
};
```

`fx/parents.ts`:

```ts
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
```

`fx/soc.ts`:

```ts
import type { Painter } from '../art/helpers';
import { dashRow } from '../art/helpers';

/** SOC: 상황판 틱커·차트 갱신 + 형광등 미세 플리커 (640×360) */
export const fxSoc: Painter = (g, frame, env) => {
  const t = env.reduced ? 0 : Math.floor(frame / 60);
  // 메인 상황판 틱커 (l6~95%, t7~35% 하단 라인)
  dashRow(g, 48, 118, 540, t * 3.7 + 11, 0x7ee0c8, 0.75);
  if (env.reduced) return;
  // 차트 영역 갱신 글로우
  const pulse = 0.04 + 0.03 * Math.sin(frame / 30);
  g.fillStyle(0x6fb7ff, pulse);
  g.fillRect(300, 55, 220, 60);
  // 형광등 플리커
  if (frame % 211 < 2) {
    g.fillStyle(0xdfe8f2, 0.04);
    g.fillRect(0, 0, 640, 24);
  }
};
```

`fx/station.ts`:

```ts
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
```

- [ ] **Step 3: 테스트 통과 확인 + 커밋**

Run: `npm test -- --run` → 전부 통과.

```powershell
git add src/game/phaser/fx src/tests/scenes.test.ts
git commit -m @'
feat(scene): per-scene fx painters (rain, glow, ticker, signboard) at 640x360

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>
'@
```

---

### Task 4: 다운스케일 스크립트 `scripts/downscale.ps1`

**Files:**
- Create: `scripts/downscale.ps1`

**Interfaces:**
- Produces: `powershell -File scripts/downscale.ps1 -In <raw.png> -Out <final.png>` → 640×360 최근접 이웃 PNG

- [ ] **Step 1: 스크립트 작성**

```powershell
param(
  [Parameter(Mandatory)][string]$In,
  [Parameter(Mandatory)][string]$Out,
  [int]$W = 640,
  [int]$H = 360
)
Add-Type -AssemblyName System.Drawing
$src = [System.Drawing.Image]::FromFile((Resolve-Path $In))
try {
  $dst = New-Object System.Drawing.Bitmap($W, $H)
  $gfx = [System.Drawing.Graphics]::FromImage($dst)
  $gfx.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::NearestNeighbor
  $gfx.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::Half
  $gfx.DrawImage($src, (New-Object System.Drawing.Rectangle(0, 0, $W, $H)),
    0, 0, $src.Width, $src.Height, [System.Drawing.GraphicsUnit]::Pixel)
  $gfx.Dispose()
  $dst.Save($Out, [System.Drawing.Imaging.ImageFormat]::Png)
  $dst.Dispose()
  Write-Output "OK ${W}x${H} -> $Out"
} finally { $src.Dispose() }
```

- [ ] **Step 2: 합성 이미지로 검증**

```powershell
Add-Type -AssemblyName System.Drawing
$b = New-Object System.Drawing.Bitmap(1280, 720)
$b.Save("$env:TEMP\ds-test.png", [System.Drawing.Imaging.ImageFormat]::Png); $b.Dispose()
powershell -File scripts/downscale.ps1 -In "$env:TEMP\ds-test.png" -Out "$env:TEMP\ds-out.png"
$o = [System.Drawing.Image]::FromFile("$env:TEMP\ds-out.png"); "$($o.Width)x$($o.Height)"; $o.Dispose()
```

Expected: `OK 640x360 ...` 후 `640x360`.

- [ ] **Step 3: 커밋**

```powershell
git add scripts/downscale.ps1
git commit -m @'
feat(scripts): nearest-neighbor downscale to 640x360 for generated backgrounds

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>
'@
```

---

### Task 5: 프롬프트 팩 `docs/art-prompts/` 4종

**Files:**
- Create: `docs/art-prompts/apartment.md`, `parents.md`, `soc.md`, `station.md`

**Interfaces:**
- Produces: codex 에이전트가 단독으로 읽고 실행하는 생성 지시서.
  각 파일 실행: `Get-Content docs/art-prompts/<scene>.md -Raw | codex exec -`
- 산출 계약: `public/scenes/raw/<scene>.png`, 1280×720

**공통 골격 — 4파일 모두 이 구조를 그대로 사용한다** (아래 "구도 명세"만 씬별 교체):

````markdown
# BLACK SIGNAL 배경 생성 — <씬 이름>

너는 이미지 생성 도구를 가진 에이전트다. 아래 명세대로 배경 이미지 1장을
생성해서 이 프로젝트의 `public/scenes/raw/<scene>.png` 로 저장하라.
`public/scenes/raw/` 폴더가 없으면 만들어라. 이미지 생성 외 다른 파일은
수정하지 마라.

## 출력 계약
- 파일: `public/scenes/raw/<scene>.png`
- 크기: 1280×720 (16:9). 이 크기로 생성이 안 되면 가장 가까운 16:9로 생성.
- 최종 게임에서는 640×360으로 축소되므로, 4px(1280 기준) 미만의 미세 디테일은 넣지 마라.

## 스타일 (공통 — 절대 변경 금지)
- 고해상도 픽셀아트, 사이버 누아르. 픽셀 클러스터가 또렷한 레트로 게임 배경.
- 기본 팔레트: 딥 네이비/다크 틸 배경 (#0b1020 계열), 포스포 그린(#7ee0c8)·
  앰버(#e8b54a) 액센트, 차가운 블루 림라이트. 채도는 낮게, 액센트만 선명하게.
- 조명: 광원에서 부드럽게 감쇠. 딱 떨어지는 삼각형 광선 금지. 디더링 그라데이션 권장.
- 하단 1/3에도 반드시 읽을 수 있는 디테일(바닥 반사, 텍스처, 소품)을 배치.
  화면 어디에도 "완전한 검정 덩어리" 영역을 만들지 마라.
- 모든 주요 실루엣은 배경과 명도 대비로 구분 가능해야 한다.
- 사람 없음. 텍스트/글자는 뭉갠 대시(가짜 글자)로만 — 읽을 수 있는 실제 단어 금지.
- 실존 브랜드·로고·기관 표기 금지 (전부 허구).

## 구도 명세 (좌표는 화면 % — 반드시 지켜라)
<씬별 블록>

## 품질 검수 기준 (생성 후 스스로 확인하고, 어긋나면 재생성)
- 위 구도 명세의 오브젝트가 지정 위치에 전부 존재하는가
- 하단 1/3이 비어 보이지 않는가
- 광원 경계가 자연스러운가
````

- [ ] **Step 1: `apartment.md` 작성** — 구도 명세 블록:

```markdown
새벽 2시, 비 내리는 도시의 아파트 작업실. 시점: 정면 벽을 바라보는 실내.
- 좌측 가장자리 (0~6%): 어두운 방문
- 좌상 (가로 6~24%, 세로 15~48%): 코르크 사건 게시판 — 메모지 몇 장, 붉은 실
- 중앙 (가로 35~55%, 세로 33~58%): 듀얼 모니터 워크스테이션 데스크.
  모니터에 터미널풍 대시 텍스트. 책상 다리와 의자까지 명확히 그릴 것.
- 데스크 우측 (가로 57~64%, 세로 51~59%): 책상 위 스마트폰
- 우측 (가로 69~98%, 세로 12~60%): 큰 창문 — 밖은 비 내리는 네온 도시 야경.
  창틀에 빗물 흐름. (빗줄기 자체는 게임 코드가 얹으므로 과하게 넣지 말 것)
- 상단 중앙: 갓 달린 천장 램프, 데스크를 향한 부드러운 웜 라이트
- 하단 1/3: 바닥 러그, 케이블, 책 더미, 모니터 불빛의 바닥 반사
```

- [ ] **Step 2: `parents.md` 작성** — 구도 명세 블록:

```markdown
밤 9시, 부모님 집 거실. 따뜻하지만 어딘가 불안한 공기. 웜 브라운 + 콜드 블루 창.
- 좌상 (가로 6~25%, 세로 10~25%): 벽의 가족사진 액자들
- 좌측 (가로 6~30%, 세로 25~60%): 장식장 — 위에 붉은 유선전화기 (가로 15~22%,
  세로 20~29% 위치에 명확히)
- 중좌 (가로 26~41%, 세로 36~64%): 받침대 위 TV, 화면은 어두운 뉴스 화면
  (자막 애니메이션은 게임 코드가 얹음)
- 중앙 (가로 42~70%, 세로 45~70%): 소파 — 등받이/좌면/쿠션이 구분되는 형태
- 소파 앞 (가로 47~60%, 세로 62~78%): 낮은 테이블 위 열린 노트북, 화면 글로우
- 우측 (가로 74~94%, 세로 12~55%): 창문 — 비 내리는 골목, 가로등
- 우측 끝 (가로 95~100%, 세로 18~66%): 현관문
- 하단 1/3: 카펫 텍스처, 테이블 다리, 노트북 불빛의 바닥 반사
```

- [ ] **Step 3: `soc.md` 작성** — 구도 명세 블록:

```markdown
새벽 3시, 보안관제센터(SOC) 상황실. 어둡지만 스크린 불빛으로 가득한 공간.
- 상단 (가로 6~95%, 세로 7~35%): 벽면 메인 상황판 3분할 — 네트워크 맵 /
  막대차트 / 로그 스트림 (전부 뭉갠 대시, 실제 글자 금지)
- 중좌 (가로 16~36%, 세로 57~82%): 동료의 데스크 — 서류, 머그컵, 듀얼 모니터
- 중앙 (가로 42~66%, 세로 57~85%): 주인공 콘솔 — 듀얼 모니터, 의자
- 우측 (가로 76~98%, 세로 39~77%): 유리벽 회의실 — 유리는 은은한 반사만,
  뿌연 흰 패널처럼 그리지 말 것. 내부에 화이트보드
- 좌측 끝 (가로 2~10%, 세로 52~71%): 커피 머신 — 커피 머신임을 알 수 있는 형태
- 중간 열: 빈 데스크 몇 개, 의자 포함 (비어 있어도 "덜 그린" 느낌 금지)
- 하단 1/3: 바닥 카펫 타일, 데스크 다리, 스크린 불빛 반사
```

- [ ] **Step 4: `station.md` 작성** — 구도 명세 블록:

```markdown
자정 넘은 심야 지하철 승강장. 막차가 끊긴 정적. 차가운 형광등 + 앰버 액센트.
- 상단 (가로 36~65%, 세로 14~25%): 전광판 (내용 애니메이션은 게임 코드가 얹음 —
  프레임과 어두운 패널만)
- 중앙 밴드 (가로 18~84%, 세로 26~52%): 스크린도어 — 유리 너머 터널은 완전한
  검정 금지: 희미한 레일 반사, 터널 조명 점 몇 개
- 중앙 (가로 39~58%, 세로 55~73%): 벤치 위 노트북 가방
- 우상 (가로 87~95%, 세로 12~22%): CCTV 카메라 (LED는 게임 코드가 얹음)
- 우측 (가로 89~99%, 세로 32~68%): 음료 자판기 — 은은한 내부 조명
- 좌측 (가로 2~20%, 세로 20~60%): 출구 표지판(허구 픽토그램), 노선도 패널
- 승강장 바닥: 점자블록 한 줄(승강장 끝 경계에만), 바닥 타일 반사
- 하단 1/3: 승강장 바닥이 화면 하단까지 이어짐 — 난간/선로 단면 금지
```

- [ ] **Step 5: 커밋**

```powershell
git add docs/art-prompts
git commit -m @'
docs(art): codex imagegen prompt pack for all four scene backgrounds

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>
'@
```

---

### Task 6: 아파트 씬 통합 (파일럿)

첫 씬으로 파이프라인 전체를 검증한다. 실패 지점(imagegen 미설정 등)이 있으면
여기서 드러난다.

**Files:**
- Create: `public/scenes/raw/apartment.png` (codex 생성물)
- Create: `public/scenes/apartment.png`
- Modify: `src/content/scenes.ts` (핫스팟 % 보정 — 필요한 경우만)
- Modify: `src/game/phaser/fx/apartment.ts` (좌표 보정)

- [ ] **Step 1: codex로 생성**

```powershell
Get-Content docs/art-prompts/apartment.md -Raw | codex exec -
```

`public/scenes/raw/apartment.png` 존재 + 크기 확인. 실패 시: codex 출력을 읽고
imagegen 도구 미설정이면 사용자에게 보고 후 중단. 생성물이 명세와 크게 어긋나면
프롬프트의 해당 조항을 강화해 1회 재생성(최대 3회, 그래도 안 되면 사용자 검토 요청).

- [ ] **Step 2: 다운스케일**

```powershell
powershell -File scripts/downscale.ps1 -In public/scenes/raw/apartment.png -Out public/scenes/apartment.png
```

- [ ] **Step 3: 렌더 + 검수**

dev 서버 + Playwright로 챕터 0 씬 스크린샷. 체크리스트:
배경이 로드되는가(폴백 아님) / 밝기·가독성 / 구도가 핫스팟과 맞는가.

- [ ] **Step 4: 핫스팟·이펙트 좌표 보정**

스크린샷 기준으로 `content/scenes.ts` APARTMENT 핫스팟 rect(%)와
`fx/apartment.ts` 좌표(창 rain 영역, 모니터 글로우 rect)를 실제 이미지 위치로 조정.
보정 후 재스크린샷으로 확인 (hover 라벨이 올바른 오브젝트 위에 뜨는지).

- [ ] **Step 5: 테스트 + 커밋**

Run: `npm test -- --run` → 전부 통과 (핫스팟 범위 0~100% 테스트 포함).

```powershell
git add public/scenes src/content/scenes.ts src/game/phaser/fx/apartment.ts
git commit -m @'
feat(scene): generated apartment background integrated with fx overlay

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>
'@
```

---

### Task 7: 부모님 집 씬 통합

Task 6과 동일 절차를 `parents`에 적용:

- [ ] **Step 1: 생성** — `Get-Content docs/art-prompts/parents.md -Raw | codex exec -` → `public/scenes/raw/parents.png` 확인 (실패 처리 Task 6 Step 1과 동일)
- [ ] **Step 2: 다운스케일** — `powershell -File scripts/downscale.ps1 -In public/scenes/raw/parents.png -Out public/scenes/parents.png`
- [ ] **Step 3: 렌더 검수** — 챕터 2 씬 스크린샷 (스토어 주입: `useGame.setState({ chapter: 2, screen: 'scene' })`)
- [ ] **Step 4: 보정** — `scenes.ts` PARENTS rect + `fx/parents.ts` (rain 창 영역, TV rect)
- [ ] **Step 5: 테스트 + 커밋** — `npm test -- --run` 통과 후:

```powershell
git add public/scenes src/content/scenes.ts src/game/phaser/fx/parents.ts
git commit -m @'
feat(scene): generated parents-home background integrated with fx overlay

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>
'@
```

---

### Task 8: SOC 씬 통합

- [ ] **Step 1: 생성** — `Get-Content docs/art-prompts/soc.md -Raw | codex exec -` → `public/scenes/raw/soc.png` 확인
- [ ] **Step 2: 다운스케일** — `powershell -File scripts/downscale.ps1 -In public/scenes/raw/soc.png -Out public/scenes/soc.png`
- [ ] **Step 3: 렌더 검수** — 챕터 3 씬 스크린샷. 특히 유리 회의실이 뿌연 패널로 나오지 않았는지 확인
- [ ] **Step 4: 보정** — `scenes.ts` SOC rect + `fx/soc.ts` (틱커 라인 y, 차트 글로우 rect)
- [ ] **Step 5: 테스트 + 커밋** — `npm test -- --run` 통과 후:

```powershell
git add public/scenes src/content/scenes.ts src/game/phaser/fx/soc.ts
git commit -m @'
feat(scene): generated SOC background integrated with fx overlay

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>
'@
```

---

### Task 9: 승강장 씬 통합

- [ ] **Step 1: 생성** — `Get-Content docs/art-prompts/station.md -Raw | codex exec -` → `public/scenes/raw/station.png` 확인
- [ ] **Step 2: 다운스케일** — `powershell -File scripts/downscale.ps1 -In public/scenes/raw/station.png -Out public/scenes/station.png`
- [ ] **Step 3: 렌더 검수** — 챕터 5 씬 스크린샷. 스크린도어 너머가 완전한 검정이 아닌지 확인
- [ ] **Step 4: 보정** — `scenes.ts` STATION rect + `fx/station.ts` (전광판 rect, CCTV LED 좌표, 헤드라이트 y밴드)
- [ ] **Step 5: 테스트 + 커밋** — `npm test -- --run` 통과 후:

```powershell
git add public/scenes src/content/scenes.ts src/game/phaser/fx/station.ts
git commit -m @'
feat(scene): generated station background integrated with fx overlay

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>
'@
```

---

### Task 10: 코드 아트 삭제 + 문서·테스트 마무리

4씬 전부 배경이 확정된 뒤에만 실행한다.

**Files:**
- Delete: `src/game/phaser/art/apartment.ts`, `art/parents.ts`, `art/soc.ts`, `art/station.ts`, `art/index.ts`
- Modify: `src/game/phaser/art/helpers.ts` → `src/game/phaser/fx/helpers.ts`로 이동
- Modify: `src/game/phaser/PixelScene.ts` (폴백 제거)
- Modify: `src/tests/scenes.test.ts` (SCENE_ART 테스트 제거)
- Modify: `README.md`

- [ ] **Step 1: helpers 이동 + import 경로 수정**

`art/helpers.ts` → `fx/helpers.ts` 이동. `PixelScene.ts`, `fx/*.ts`의
`'./art/helpers'` / `'../art/helpers'` import를 `'./fx/helpers'` / `'./helpers'`로 교체.

- [ ] **Step 2: PixelScene 폴백 제거**

`SCENE_ART` import·`hasBg` 분기 삭제 — `create()`에서 배경 이미지가 없으면
`console.error('[scene] missing background: ' + this.sceneId)` 후 배경 없이 진행,
`update()`는 항상 `SCENE_FX[this.sceneId]`만 그린다. `this.g.setScale(2)` 제거.

- [ ] **Step 3: art/ 삭제 + 테스트 갱신**

`src/game/phaser/art/` 디렉토리 삭제.
`scenes.test.ts`에서 `SCENE_ART` import와 "모든 씬에 페인터가 등록돼 있다" 테스트 제거
(SCENE_FX 테스트는 유지). 배경 에셋 존재 테스트 추가:

```ts
import { existsSync } from 'node:fs';
import { join } from 'node:path';

it('모든 씬의 배경 확정본이 존재한다', () => {
  for (const d of defs)
    expect(existsSync(join(process.cwd(), 'public', 'scenes', `${d.id}.png`))).toBe(true);
});
```

- [ ] **Step 4: README 갱신**

기술 스택 표의 "픽셀아트 씬" 행: "Phaser 3 (CANVAS, 320×180, 코드로 그리는 원본 아트)"
→ "Phaser 3 (CANVAS, 640×360, 원작 생성 배경 + 코드 이펙트)".
폴더 구조의 `game/` 설명과 "데이터 구동 픽셀 씬" 항목의 "320×180 픽셀아트…를 코드로 렌더"
문구를 새 구조(생성 배경 `public/scenes/` + `fx/` 이펙트)로 수정.

- [ ] **Step 5: 전체 검증 + 커밋**

Run: `npm test -- --run` → 전부 통과. `npm run build` → 성공.
Playwright로 4씬 최종 스크린샷 + 프롤로그 e2e 스모크(`npm run test:e2e`,
Playwright 브라우저 설치돼 있을 때만).

```powershell
git add -A
git commit -m @'
feat(scene)!: replace code-drawn art with generated backgrounds + fx layer

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>
'@
```

---

## Self-Review 결과

- **스펙 커버리지**: 프롬프트 팩(T5), codex 실행(T6~9), 다운스케일(T4), 배경 로더+폴백(T2), 이펙트(T3), 핫스팟 UX(T1), 재보정(T6~9 Step 4), 삭제+문서(T10) — 스펙 전 항목에 대응 태스크 존재.
- **플레이스홀더**: 보정 태스크의 "실제 이미지 위치로 조정"은 생성물에 의존하는 본질적 런타임 결정 — 절차(스크린샷 기준, 검증 방법)는 명시됨.
- **타입 일관성**: `SCENE_FX`/`bgUrl`/`PhaserHost` props가 태스크 간 동일 시그니처로 사용됨. Task 2가 import하는 `SCENE_FX`는 Task 3에서 정의 — 실행 순서상 Task 2 Step 7 검증 전에 Task 3까지 필요하므로, 실행 시 Task 2·3을 연속 수행할 것 (Task 2 커밋 시점에 fx 스텁이 없으면 컴파일 실패 — Task 2 Step 4에서 fx/index.ts를 빈 페인터 4개로 먼저 만들어도 무방).
