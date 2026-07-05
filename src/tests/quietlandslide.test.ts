import { describe, expect, it } from 'vitest';
import { CHAPTERS } from '../content/chapters';
import { QUIETLANDSLIDE_DB } from '../content/databases/quietlandslide';
import { QUIETLANDSLIDE_PKG } from '../content/pkg/quietlandslide';
import { ENDINGS2 } from '../content/endings2';
import { pkgAdd, pkgSeal, type PkgState } from '../engine/pkg/pkg';
import { formatResult, runQuery } from '../engine/query/query';
import { nodeAt } from '../engine/vfs/vfs';

const ch = CHAPTERS[10];
const none = {
  convene: false,
  assemble: false,
  buyer: false,
  architect: false,
  package: false,
};

/** 검증본 6종을 각자 올바른 범주에 배치한 상태를 만든다 */
function assembleClean(): PkgState {
  const verified = QUIETLANDSLIDE_PKG.items.filter((i) => i.verified);
  let state: PkgState = {};
  for (const i of verified) {
    const r = pkgAdd(QUIETLANDSLIDE_PKG, state, i.id, i.cat);
    expect(r.ok, `${i.id}→${i.cat}`).toBe(true);
    state = r.state;
  }
  return state;
}

describe('Chapter 10 — 패키지 정합', () => {
  it('6개 범주가 각각 검증본을 하나씩 갖는다 (봉인 시 clean 가능)', () => {
    for (const c of QUIETLANDSLIDE_PKG.categories)
      expect(
        QUIETLANDSLIDE_PKG.items.some((i) => i.cat === c.id && i.verified),
        c.id,
      ).toBe(true);
  });

  it('검증본만으로 6/6 조립 → assemble 확보 · 봉인 시 clean', () => {
    const verified = QUIETLANDSLIDE_PKG.items.filter((i) => i.verified);
    let state: PkgState = {};
    let text = '';
    for (const i of verified) {
      const r = pkgAdd(QUIETLANDSLIDE_PKG, state, i.id, i.cat);
      state = r.state;
      text = r.text;
    }
    expect(text).toContain('패키지 조립 완료 — 6/6');
    expect(ch.scan(text, { ...none }).some((x) => x.complete === 'assemble')).toBe(true);
    const sealed = pkgSeal(QUIETLANDSLIDE_PKG, state);
    expect(sealed.ok).toBe(true);
    expect(sealed.clean).toBe(true);
  });

  it('봉인 헤더에 시즌2 사건 라벨(MERIDIAN CIVIC)이 찍힌다', () => {
    const sealed = pkgSeal(QUIETLANDSLIDE_PKG, assembleClean());
    expect(sealed.text).toContain('EVIDENCE PACKAGE — FINAL');
    expect(sealed.text).toContain('MERIDIAN CIVIC');
    expect(ch.scan(sealed.text, { ...none }).some((x) => x.complete === 'package')).toBe(true);
  });

  it('오배치는 근거 불일치로 거부된다', () => {
    const r = pkgAdd(QUIETLANDSLIDE_PKG, {}, 'turnout', 'cert');
    expect(r.ok).toBe(false);
  });

  it('미검증 트랩 포함 봉인은 clean 이 아니다', () => {
    // corp 를 미검증(anon)으로 채우고 나머지는 검증본
    let state: PkgState = {};
    for (const [item, cat] of [
      ['turnout', 'alloc'],
      ['target', 'tally'],
      ['twin', 'twins'],
      ['mirror', 'inject'],
      ['cert', 'cert'],
      ['anon', 'corp'],
    ] as const) {
      state = pkgAdd(QUIETLANDSLIDE_PKG, state, item, cat).state;
    }
    const sealed = pkgSeal(QUIETLANDSLIDE_PKG, state);
    expect(sealed.ok).toBe(true);
    expect(sealed.clean).toBe(false);
  });
});

describe('Chapter 10 — 발주 비선 · 설계자 · 시즌1 카메오', () => {
  const out = (sql: string) => formatResult(runQuery(sql, QUIETLANDSLIDE_DB));

  it('guarantee_orders 조회로 buyer 가 확보된다', () => {
    const r = ch.scan(out('SELECT * FROM guarantee_orders'), { ...none });
    expect(r.some((x) => x.complete === 'buyer')).toBe(true);
  });

  it('자금 관로에 시즌1 Orbis Vale 잔당 카메오가 있다', () => {
    const t = out('SELECT * FROM funding_trace');
    expect(t).toContain('Orbis Vale');
    expect(t).toContain('Meridian Civic');
  });

  it('봉인 설계 메모 디코드로 architect(도현우 전결) 가 확보된다', () => {
    const node = nodeAt(ch.fs, 'evidence/design_memo.b64');
    const b64 = node && node.t === 'f' ? node.c : '';
    const decoded = new TextDecoder().decode(
      Uint8Array.from(atob(b64), (c) => c.charCodeAt(0)),
    );
    expect(decoded).toContain('도현우');
    expect(decoded).toContain('전결');
    expect(decoded).toContain('QUIET LANDSLIDE');
    expect(ch.scan(decoded, { ...none }).some((x) => x.complete === 'architect')).toBe(true);
  });

  it('종합 브리핑을 읽어도 어떤 단서도 조기 확보되지 않는다', () => {
    const node = nodeAt(ch.fs, 'briefing.txt');
    const text = node && node.t === 'f' ? node.c : '';
    expect(text).toContain('THE QUIET LANDSLIDE');
    expect(ch.scan(text, { ...none })).toHaveLength(0);
  });
});

describe('Chapter 10 — 시즌2 피날레 엔딩', () => {
  it('finalEndingV2 플래그가 켜져 있다', () => {
    expect(ch.ending.finalEndingV2).toBe(true);
  });
  it('4개 최종 선택이 모두 ENDINGS2 에 대응한다', () => {
    for (const key of Object.keys(ch.ending.choices)) {
      expect(ENDINGS2[key], key).toBeTruthy();
      expect(ENDINGS2[key].epilogue.length).toBeGreaterThan(0);
    }
  });
});
