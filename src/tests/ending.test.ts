import { describe, expect, it } from 'vitest';
import { deriveEnding, resolveEnding } from '../engine/ending';
import type { Stats } from '../engine/types';

const S = (p: Partial<Stats> = {}): Stats => ({
  integrity: 50,
  trust: 50,
  nullwave: 0,
  family: 40,
  ...p,
});

const D_FLAGS = {
  ch5Choice: 'protect',
  ch5RouteDone: true,
  ch6WitnessEvidence: true,
  ch4Verify: true,
  ch6CleanPackage: true,
  ch4Leak: 'verify',
};

describe('deriveEnding — 파생 플래그', () => {
  it('witnessSaved 는 (search 또는 protect) + 경로 재구성 + 목격자 증거를 요구한다', () => {
    expect(deriveEnding(D_FLAGS).witnessSaved).toBe(true);
    expect(
      deriveEnding({ ...D_FLAGS, ch5Choice: 'hide', ch2Choice: 'search' }).witnessSaved,
    ).toBe(true);
    expect(deriveEnding({ ...D_FLAGS, ch5RouteDone: false }).witnessSaved).toBe(false);
    expect(deriveEnding({ ...D_FLAGS, ch6WitnessEvidence: false }).witnessSaved).toBe(false);
    expect(deriveEnding({ ...D_FLAGS, ch5Choice: 'family' }).witnessSaved).toBe(false);
  });
  it('recklessLeak(즉시 공개)은 evidenceClean 을 무효화한다', () => {
    const d = deriveEnding({ ...D_FLAGS, ch4Leak: 'now' });
    expect(d.recklessLeak).toBe(true);
    expect(d.evidenceClean).toBe(false);
  });
  it('미검증 패키지는 evidenceClean 이 아니다', () => {
    expect(deriveEnding({ ...D_FLAGS, ch6CleanPackage: false }).evidenceClean).toBe(false);
  });
  it('allyGaShin 은 윤리적 설득에서만 성립한다', () => {
    expect(deriveEnding({ ch4Witness: 'persuade' }).allyGaShin).toBe(true);
    expect(deriveEnding({ ch4Witness: 'coerce' }).allyGaShin).toBe(false);
  });
});

describe('resolveEnding — 우선순위 판정 (D → A → B → C)', () => {
  it('D "Signal Returned": 가족·무결·목격자 보호의 최상 루트', () => {
    expect(resolveEnding(S({ family: 60, integrity: 65 }), D_FLAGS)).toBe('D');
  });
  it('D 는 A 조건을 동시에 만족해도 우선한다', () => {
    expect(resolveEnding(S({ family: 60, integrity: 70, trust: 70 }), D_FLAGS)).toBe('D');
  });
  it('A "The Clean Record": 제도적 승리 (D 미충족 시)', () => {
    expect(
      resolveEnding(S({ integrity: 70, trust: 65 }), { ...D_FLAGS, ch5Choice: 'family' }),
    ).toBe('A');
  });
  it('B "The Leak": 널웨이브 편중 + (저신뢰 또는 무모한 공개)', () => {
    expect(resolveEnding(S({ nullwave: 60, integrity: 45 }), {})).toBe('B');
    expect(
      resolveEnding(S({ nullwave: 60, integrity: 80, trust: 70 }), {
        ...D_FLAGS,
        ch4Leak: 'now',
      }),
    ).toBe('B');
  });
  it('무모한 공개는 D 를 봉쇄한다', () => {
    const r = resolveEnding(S({ family: 60, integrity: 65 }), { ...D_FLAGS, ch4Leak: 'now' });
    expect(r).not.toBe('D');
  });
  it('C "The Silence Protocol": 어느 조건도 못 채우면 침묵', () => {
    expect(resolveEnding(S(), {})).toBe('C');
    expect(resolveEnding(S({ integrity: 70, trust: 65 }), { ch6CleanPackage: false })).toBe('C');
  });
});
