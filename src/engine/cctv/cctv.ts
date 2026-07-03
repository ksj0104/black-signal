/**
 * CCTV 증거 리뷰 엔진 — "법원 인가 아카이브의 포렌식 열람".
 *
 * 실제 카메라·스트림 접속이 아니다. 카메라 피드는 전부 사전 저작된 허구 데이터
 * (프레임 이벤트 배열 + 클록 오프셋 + 메타)이며, 퍼즐 로직은 타임스탬프/메타데이터
 * 비교뿐이다. 시계 조작 적발·무결성 검증이라는 방어적 사고를 가르친다.
 */

export interface CctvEvent {
  /** 카메라 로컬 시각 HH:MM:SS (로컬 시계 = 실제 + drift) */
  t: string;
  /** 프레임 카운터 (1fps 저장) — 편집 봉합 탐지용 */
  frame: number;
  desc: string;
  tag?: 'yuna' | 'anchor' | 'door' | 'resume';
}

export interface CctvCam {
  id: string;
  name: string;
  /** 초 단위 실제 시계 오차(로컬 − 실제). 플레이어가 앵커 이벤트로 산출한다. */
  drift: number;
  events: CctvEvent[];
  meta: { codec: string; editor: string; frames: number; expected: number; window: string };
}

export interface BadgeSwipe {
  /** 실제 시각 (배지 시스템은 NTP 동기) */
  t: string;
  badge: string;
  holder: string;
  door: string;
}

export interface CctvDef {
  banner: string;
  cams: CctvCam[];
  badges: BadgeSwipe[];
}

/** 카메라별 적용된 보정 오프셋(초) — gameStore flags 에 저장된다 */
export type CctvSync = Record<string, number>;

/* ---------- 시각 유틸 ---------- */

export const toSec = (t: string): number => {
  const [h, m, s] = t.split(':').map(Number);
  return h * 3600 + m * 60 + (s || 0);
};
export const fmtT = (sec: number): string => {
  const s = ((sec % 86400) + 86400) % 86400;
  const p = (n: number) => String(n).padStart(2, '0');
  return `${p(Math.floor(s / 3600))}:${p(Math.floor((s % 3600) / 60))}:${p(s % 60)}`;
};
/** '+47s' · '-02:15' · '135' → 초 (실패 시 null) */
export function parseOffset(raw: string): number | null {
  const m1 = raw.match(/^([+-]?)(\d{1,2}):(\d{2})$/);
  if (m1) return (m1[1] === '-' ? -1 : 1) * (Number(m1[2]) * 60 + Number(m1[3]));
  const m2 = raw.match(/^([+-]?)(\d+)s?$/);
  if (m2) return (m2[1] === '-' ? -1 : 1) * Number(m2[2]);
  return null;
}
export const fmtOffset = (sec: number): string => {
  const sign = sec < 0 ? '-' : '+';
  const a = Math.abs(sec);
  return a >= 60
    ? `${sign}${String(Math.floor(a / 60)).padStart(2, '0')}:${String(a % 60).padStart(2, '0')}`
    : `${sign}${a}s`;
};

const cam = (def: CctvDef, id: string): CctvCam | undefined =>
  def.cams.find((c) => c.id.toLowerCase() === id.toLowerCase());
/** 보정 시각(초): 로컬 − 적용 오프셋 */
const corr = (e: CctvEvent, off: number): number => toSec(e.t) - off;
const allSynced = (def: CctvDef, sync: CctvSync): boolean =>
  def.cams.every((c) => c.drift === 0 || sync[c.id] === c.drift);

function unknownCam(def: CctvDef, id: string): string {
  return `cctv: 알 수 없는 카메라 '${id}' — 사용 가능: ${def.cams.map((c) => c.id).join(', ')}`;
}

/* ---------- 명령 구현 ---------- */

/** cctv (인자 없음) — 패키지 개요 */
export function cctvOverview(def: CctvDef, sync: CctvSync): string {
  const lines = [def.banner, '', '카메라 (아카이브 사본):'];
  for (const c of def.cams) {
    const st = sync[c.id] != null ? `보정 ${fmtOffset(sync[c.id])}` : '미보정';
    lines.push(`  ${c.id}  ${c.name.padEnd(10)} 이벤트 ${c.events.length}건 · ${st}`);
  }
  lines.push('');
  lines.push('사용법: cctv view <cam>            프레임 이벤트 열람');
  lines.push('        cctv sync <cam> <오차>     시계 보정 (예: +47s, -02:15)');
  lines.push('        cctv gaps <cam>            타임코드/프레임 연속성 검사');
  lines.push('        cctv meta <cam>            메타데이터 (편집 서명)');
  lines.push('        cctv badge                 배지 로그 대조 (보정 후)');
  lines.push('        cctv route                 유나 경로 재구성 (전 카메라 보정 후)');
  lines.push('※ 앵커 이벤트(역내 방송·조명 플리커)는 전 카메라 공통 — 시계 오차 산출 기준.');
  return lines.join('\n');
}

/** cctv view <cam> — 이벤트 로그 (보정 적용 시 보정 시각 병기) */
export function cctvView(def: CctvDef, sync: CctvSync, id: string): string {
  const c = cam(def, id);
  if (!c) return unknownCam(def, id);
  const off = sync[c.id];
  const lines = [
    `[${c.id} — ${c.name}]  기록 구간 ${c.meta.window} (로컬 시계)` +
      (off != null ? `  ·  보정 ${fmtOffset(off)} 적용` : '  ·  미보정'),
  ];
  for (const e of c.events) {
    const mark = e.tag === 'anchor' ? '◈' : e.tag === 'yuna' ? '●' : e.tag ? '▸' : ' ';
    const t = off != null ? `${e.t} → ${fmtT(corr(e, off))}` : e.t;
    lines.push(`  ${mark} ${t}  f${String(e.frame).padStart(4, '0')}  ${e.desc}`);
  }
  lines.push('  (◈ 앵커 이벤트 · ● 대상 인물)');
  return lines.join('\n');
}

/** cctv sync <cam> <오차> — 산출한 시계 오차 적용. 정합하면 마스터 타임라인 생성. */
export function cctvSyncCmd(
  def: CctvDef,
  sync: CctvSync,
  id: string,
  offsetRaw: string,
): { text: string; sync: CctvSync; ok: boolean } {
  const c = cam(def, id);
  if (!c) return { text: unknownCam(def, id), sync, ok: false };
  const off = parseOffset(offsetRaw);
  if (off == null)
    return {
      text: `cctv: 오차 형식 오류 '${offsetRaw}' — 예: +47s, -02:15`,
      sync,
      ok: false,
    };
  const next = { ...sync, [c.id]: off };
  const lines = [`${c.id} 시계 보정 적용: ${fmtOffset(off)}  (보정 시각 = 로컬 − 오차)`];
  const residual = c.drift - off;
  if (residual !== 0) {
    lines.push(
      `! 앵커 불일치 잔존 — 보정 후에도 공통 이벤트가 기준 카메라와 ${fmtOffset(residual)} 어긋난다.`,
    );
    lines.push('  (역내 방송·조명 플리커의 시각을 기준 카메라와 다시 대조하라)');
    return { text: lines.join('\n'), sync: next, ok: true };
  }
  lines.push('✓ 앵커 정합 — 공통 이벤트가 기준 카메라와 일치한다.');
  if (allSynced(def, next)) {
    lines.push('', '[MASTER TIMELINE — 전 카메라 시계 보정 완료]');
    const merged = def.cams
      .flatMap((cc) =>
        cc.events.map((e) => ({
          t: corr(e, cc.drift === 0 ? 0 : next[cc.id]),
          cam: cc.id,
          e,
        })),
      )
      .sort((a, b) => a.t - b.t);
    for (const m of merged)
      lines.push(`  ${fmtT(m.t)}  ${m.cam}  ${m.e.desc}${m.e.tag === 'anchor' ? '  ◈' : ''}`);
  }
  return { text: lines.join('\n'), sync: next, ok: true };
}

/** cctv gaps <cam> — 타임코드 점프 vs 프레임 카운터 (편집 봉합 탐지) */
export function cctvGaps(def: CctvDef, sync: CctvSync, id: string): string {
  const c = cam(def, id);
  if (!c) return unknownCam(def, id);
  const lines = [`[${c.id} — 연속성 검사]  저장 프레임 ${c.meta.frames} / 기대 ${c.meta.expected} (1fps)`];
  let found = false;
  for (let i = 1; i < c.events.length; i++) {
    const a = c.events[i - 1];
    const b = c.events[i];
    const dt = toSec(b.t) - toSec(a.t);
    const df = b.frame - a.frame;
    if (dt - df >= 30) {
      found = true;
      const missing = dt - df;
      const off = sync[c.id];
      const span =
        off != null && off === c.drift
          ? `로컬 ${a.t} → ${b.t} (보정 ${fmtT(corr(a, off))} → ${fmtT(corr(b, off))})`
          : `로컬 ${a.t} → ${b.t}`;
      lines.push(`! ${c.id} 결손 ${fmtOffset(missing).slice(1)} — ${span}`);
      lines.push(
        `  타임코드는 ${missing + df}s 점프했지만 프레임 카운터는 연속(f${a.frame}→f${b.frame}) — 잘라낸 뒤 봉합한 편집 흔적.`,
      );
    }
  }
  if (!found) lines.push('결손 없음 — 타임코드·프레임 카운터 연속.');
  else if (c.meta.expected - c.meta.frames > 0)
    lines.push(`  저장본에서 ${c.meta.expected - c.meta.frames}프레임 소실 — 메타데이터(cctv meta)를 확인하라.`);
  return lines.join('\n');
}

/** cctv meta <cam> — 클립 메타데이터 (편집 서명 대조) */
export function cctvMeta(def: CctvDef, id: string): string {
  const c = cam(def, id);
  if (!c) return unknownCam(def, id);
  const m = c.meta;
  const lines = [
    `[${c.id} — 클립 메타데이터]`,
    `  코덱/저장   ${m.codec}`,
    `  기록 구간   ${m.window}`,
    `  프레임 수   ${m.frames} / 기대 ${m.expected}`,
    `  최종 기록   ${m.editor === '(원본)' ? '(원본 — 재인코딩 흔적 없음)' : m.editor}`,
  ];
  if (m.editor !== '(원본)') {
    lines.push(`! 편집 서명 검출: ${m.editor}`);
    lines.push('  서명 주체 대조: 세리톤 시큐리티 (Orbis Vale 보안 하청 · 현장 책임 도경식)');
    lines.push('  → 법원 제출 전 원본이 제3자에 의해 재인코딩·절삭됐다.');
  }
  return lines.join('\n');
}

/** cctv badge — 보정 시각과 배지 로그 대조 (CAM-D 보정 선행) */
export function cctvBadge(def: CctvDef, sync: CctvSync): string {
  const d = def.cams.find((c) => c.events.some((e) => e.tag === 'door'));
  if (!d) return 'cctv: 대조할 도어 이벤트가 없다.';
  if (sync[d.id] !== d.drift)
    return `cctv: ${d.id} 시계가 보정되지 않았다 — 배지 로그(실제 시각)와 대조하려면 보정이 먼저다.`;
  const door = d.events.find((e) => e.tag === 'door')!;
  const doorT = corr(door, sync[d.id]);
  const lines = [
    `[배지 로그 대조]  기준: ${d.id} 서비스 도어 개방 — 보정 시각 ${fmtT(doorT)}`,
    '  시각      배지             소지자   도어         Δ기준',
  ];
  for (const b of def.badges) {
    const dt = toSec(b.t) - doorT;
    const hit = Math.abs(dt) <= 120;
    lines.push(
      `  ${b.t}  ${b.badge.padEnd(15)}  ${b.holder.padEnd(6)} ${b.door.padEnd(11)}  ${
        hit ? `${fmtOffset(dt)} ✓ 일치` : fmtOffset(dt)
      }`,
    );
  }
  lines.push('→ 도어 개방 직전, 세리톤 배지 스와이프 — 통로를 연 손은 외부인이 아니다.');
  return lines.join('\n');
}

/** cctv route — 유나 경로 재구성 (전 카메라 보정 선행) */
export function cctvRoute(def: CctvDef, sync: CctvSync): string {
  if (!allSynced(def, sync))
    return 'cctv: 경로 재구성에는 전 카메라 시계 보정이 필요하다 — 앵커 이벤트로 오차부터 산출하라.';
  const rows: { t: number; cam: string; desc: string }[] = [];
  for (const c of def.cams) {
    const off = c.drift === 0 ? 0 : sync[c.id];
    for (const e of c.events)
      if (e.tag === 'yuna' || e.tag === 'door' || e.tag === 'resume')
        rows.push({ t: corr(e, off), cam: c.id, desc: e.desc });
  }
  rows.sort((a, b) => a.t - b.t);
  const lines = ['[경로 재구성 — 유나 · 보정 시각 기준]'];
  for (const r of rows) lines.push(`  ${fmtT(r.t)}  ${r.cam}  ${r.desc}`);
  lines.push('');
  lines.push('결론: 승강장까지 이동했으나 막차 탑승 기록 없음 —');
  lines.push('      직후 사설 서비스 통로 도어가 열리고, 결손 02:18 뒤 통로는 비어 있다.');
  lines.push('      자발적 이탈이 아니라 사설 통로 경유 이송이다.');
  return lines.join('\n');
}
