/**
 * 증거 패키지 조립 엔진 (Ch6) — 전 챕터에서 확보한 증거를 8개 법적 카테고리에
 * 배치하는 분류/매칭 퍼즐. 순수 함수 + 인메모리 데이터만 사용한다.
 *
 * 품질 = 채운 카테고리 × 검증도. 미검증 출처(오염 원본·익명 녹취)도 배치할 수는
 * 있지만 패키지 신뢰도를 깎는다 — "법적으로 방어 가능한 증거만이 무기"라는 교훈.
 */

export interface PkgCategory {
  id: string;
  name: string;
}

export interface PkgItem {
  id: string;
  label: string;
  /** 이 증거가 속하는 올바른 카테고리 */
  cat: string;
  /** 검증된 증거인가 (미검증 = 품질 하락) */
  verified: boolean;
  /** 출처 표기 (챕터) */
  src: string;
  /** 오배치 시 알려줄 근거 한 줄 */
  why: string;
}

export interface PkgDef {
  banner: string;
  categories: PkgCategory[];
  items: PkgItem[];
}

/** 배치 상태: itemId → categoryId (gameStore flags 에 저장) */
export type PkgState = Record<string, string>;

const cat = (def: PkgDef, id: string) => def.categories.find((c) => c.id === id);
const item = (def: PkgDef, id: string) => def.items.find((i) => i.id === id);

function filledCats(def: PkgDef, state: PkgState): Set<string> {
  return new Set(Object.values(state));
}
/** 카테고리에 배치된 아이템들 */
function inCat(def: PkgDef, state: PkgState, catId: string): PkgItem[] {
  return Object.entries(state)
    .filter(([, c]) => c === catId)
    .map(([i]) => item(def, i)!)
    .filter(Boolean);
}

/** pkg (인자 없음) — 카테고리 현황 + 증거 보관함 */
export function pkgOverview(def: PkgDef, state: PkgState): string {
  const filled = filledCats(def, state);
  const lines = [def.banner, '', `카테고리 (${filled.size}/${def.categories.length}):`];
  for (const c of def.categories) {
    const placed = inCat(def, state, c.id);
    const mark = placed.length ? '■' : '·';
    const detail = placed.length
      ? placed.map((i) => i.label + (i.verified ? '' : ' ⚠미검증')).join(' · ')
      : '(비어 있음)';
    lines.push(`  ${mark} ${c.id.padEnd(8)} ${c.name.padEnd(12)} ${detail}`);
  }
  lines.push('', '증거 보관함 (전 챕터 확보분):');
  for (const i of def.items) {
    const placed = state[i.id];
    lines.push(
      `  ${placed ? '▸' : ' '} ${i.id.padEnd(12)} ${i.label}  [${i.src}${i.verified ? '' : ' · 미검증'}]${
        placed ? `  → ${placed}` : ''
      }`,
    );
  }
  lines.push('', '사용법: pkg add <증거> <카테고리> · pkg remove <증거> · pkg seal (8/8 확정)');
  return lines.join('\n');
}

/** pkg add <item> <category> */
export function pkgAdd(
  def: PkgDef,
  state: PkgState,
  itemId: string,
  catId: string,
): { text: string; state: PkgState; ok: boolean } {
  const i = item(def, itemId);
  if (!i)
    return {
      text: `pkg: 알 수 없는 증거 '${itemId}' — pkg 로 보관함을 확인하라.`,
      state,
      ok: false,
    };
  const c = cat(def, catId);
  if (!c)
    return {
      text: `pkg: 알 수 없는 카테고리 '${catId}' — 사용 가능: ${def.categories.map((x) => x.id).join(', ')}`,
      state,
      ok: false,
    };
  if (i.cat !== c.id)
    return {
      text: `pkg: 근거 불일치 — ${i.label} 은(는) 이 범주의 증거가 아니다.\n     (${i.why})`,
      state,
      ok: false,
    };
  const next = { ...state, [i.id]: c.id };
  const lines = [`배치: ${i.label} → [${c.name}]`];
  if (!i.verified)
    lines.push('⚠ 미검증 출처 — 반박당하면 패키지 전체의 신뢰가 흔들린다. (pkg remove 로 회수 가능)');
  const filled = filledCats(def, next);
  if (filled.size === def.categories.length) {
    const verifiedCats = def.categories.filter((cc) =>
      inCat(def, next, cc.id).some((x) => x.verified),
    ).length;
    lines.push('', `[패키지 조립 완료 — ${filled.size}/${def.categories.length}]  검증 범주 ${verifiedCats}/${def.categories.length}`);
    lines.push('pkg seal 로 최종 확정하라. 미검증 항목이 있다면 지금이 마지막 교체 기회다.');
  }
  return { text: lines.join('\n'), state: next, ok: true };
}

/** pkg remove <item> */
export function pkgRemove(
  def: PkgDef,
  state: PkgState,
  itemId: string,
): { text: string; state: PkgState; ok: boolean } {
  const i = item(def, itemId);
  if (!i || !state[i.id])
    return { text: `pkg: '${itemId}' 은(는) 배치되어 있지 않다.`, state, ok: false };
  const next = { ...state };
  delete next[i.id];
  return { text: `회수: ${i.label} — 보관함으로 되돌렸다.`, state: next, ok: true };
}

/** pkg seal — 8/8 최종 확정. clean/witness 파생 플래그 산출. */
export function pkgSeal(
  def: PkgDef,
  state: PkgState,
): { text: string; ok: boolean; clean: boolean; witness: boolean } {
  const filled = filledCats(def, state);
  if (filled.size < def.categories.length)
    return {
      text: `pkg: 아직 ${def.categories.length - filled.size}개 범주가 비어 있다 — 전 범주를 채워야 확정할 수 있다.`,
      ok: false,
      clean: false,
      witness: false,
    };
  const placed = Object.keys(state).map((i) => item(def, i)!);
  const unverified = placed.filter((i) => !i.verified);
  const clean = unverified.length === 0;
  const witness = inCat(def, state, 'witness').some((i) => i.verified);
  const lines = ['[EVIDENCE PACKAGE — FINAL]  사건: BLACK SIGNAL / 대상: ORBIS VALE CAPITAL'];
  for (const c of def.categories)
    lines.push(`  ■ ${c.name.padEnd(12)} ${inCat(def, state, c.id).map((i) => i.label).join(' · ')}`);
  lines.push('');
  lines.push(
    clean
      ? '  무결성: 전 항목 검증 완료 — 해시·체인 오브 커스터디 첨부. 법적으로 방어 가능하다.'
      : `  무결성: ⚠ 미검증 ${unverified.length}건 포함 (${unverified.map((i) => i.id).join(', ')}) — 반박 지점이 남았다.`,
  );
  lines.push('  패키지가 봉인되었다. 남은 것은 — 공개 전략이다.');
  return { text: lines.join('\n'), ok: true, clean, witness };
}
