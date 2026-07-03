import { describe, expect, it } from 'vitest';
import { PkgState, pkgAdd, pkgOverview, pkgRemove, pkgSeal } from '../engine/pkg/pkg';
import { BLACKSIGNAL_PKG as DEF } from '../content/pkg/blacksignal';

/** 검증본 8종을 전부 올바르게 배치한 상태 */
const CLEAN: PkgState = {
  relay: 'infra',
  ledger: 'launder',
  ladder: 'corp',
  dci: 'broker',
  reuse: 'target',
  approve: 'exec',
  cctv: 'witness',
  pipeline: 'profit',
};

describe('pkg — 증거 패키지 조립', () => {
  it('개요에 8개 범주와 보관함(미검증 표기 포함)이 나온다', () => {
    const txt = pkgOverview(DEF, {});
    expect(txt).toContain('카테고리 (0/8)');
    expect(txt).toContain('사기 인프라');
    expect(txt).toContain('raw_archive');
    expect(txt).toContain('미검증');
  });
  it('오배치는 근거와 함께 거부된다', () => {
    const r = pkgAdd(DEF, {}, 'relay', 'launder');
    expect(r.ok).toBe(false);
    expect(r.text).toContain('근거 불일치');
    expect(r.text).toContain('발신 인프라');
  });
  it('알 수 없는 증거/카테고리는 친절한 에러', () => {
    expect(pkgAdd(DEF, {}, 'nuke', 'infra').text).toContain('알 수 없는 증거');
    expect(pkgAdd(DEF, {}, 'relay', 'x').text).toContain('알 수 없는 카테고리');
  });
  it('미검증 출처는 배치되지만 경고한다', () => {
    const r = pkgAdd(DEF, {}, 'tipoff', 'witness');
    expect(r.ok).toBe(true);
    expect(r.text).toContain('미검증 출처');
  });
  it('8번째 범주가 채워지는 순간 조립 완료가 출력된다', () => {
    const partial = { ...CLEAN };
    delete partial.pipeline;
    const r = pkgAdd(DEF, partial, 'pipeline', 'profit');
    expect(r.text).toContain('패키지 조립 완료 — 8/8');
  });
  it('remove 는 배치를 회수한다', () => {
    const r = pkgRemove(DEF, { relay: 'infra' }, 'relay');
    expect(r.ok).toBe(true);
    expect(r.state.relay).toBeUndefined();
    expect(pkgRemove(DEF, {}, 'relay').ok).toBe(false);
  });
  it('seal: 범주가 비면 거부, 검증본 8/8 이면 clean·witness 성립', () => {
    expect(pkgSeal(DEF, {}).ok).toBe(false);
    const r = pkgSeal(DEF, CLEAN);
    expect(r.ok).toBe(true);
    expect(r.text).toContain('EVIDENCE PACKAGE — FINAL');
    expect(r.text).toContain('법적으로 방어 가능');
    expect(r.clean).toBe(true);
    expect(r.witness).toBe(true);
  });
  it('seal: 미검증 녹취로 채운 목격자 범주는 witness·clean 이 무너진다', () => {
    const tainted: PkgState = { ...CLEAN, tipoff: 'witness' };
    delete tainted.cctv;
    const r = pkgSeal(DEF, tainted);
    expect(r.ok).toBe(true);
    expect(r.clean).toBe(false);
    expect(r.witness).toBe(false);
    expect(r.text).toContain('미검증 1건');
  });
});
