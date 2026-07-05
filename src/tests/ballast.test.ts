import { describe, expect, it } from 'vitest';
import { CHAPTERS } from '../content/chapters';
import { BALLAST_PYLAB } from '../content/datasets/ballast';
import { TWINTALLY_DB } from '../content/databases/twintally';
import { runTemplate } from '../engine/pylab/pylab';

const ch = CHAPTERS[8];
const none = { intake: false, lab: false, target: false, quota: false, inject: false };

/** 템플릿 실행 결과 텍스트 (성공했는지 함께 반환) */
const run = (id: string, ...args: string[]) => runTemplate(BALLAST_PYLAB, id, args);

describe('Chapter 8 — ballast 데이터 정합', () => {
  it('목표 쿼터 합이 밴드 총계와 일치한다 (표는 만들어지지 않는다)', () => {
    for (const t of BALLAST_PYLAB.datasets.ballast_targets.rows)
      expect(
        Number(t.quota_cha) + Number(t.quota_baek) + Number(t.quota_lim),
        `band ${t.band}`,
      ).toBe(Number(t.target_total));
  });

  it('목표 쿼터가 Ch7 쌍둥이 개표구 공표치와 정확히 일치한다', () => {
    const off = TWINTALLY_DB.official_tally.rows;
    const byTotal = new Map(
      BALLAST_PYLAB.datasets.ballast_targets.rows.map((t) => [Number(t.target_total), t]),
    );
    // 쌍둥이 쌍: 총계가 겹치는 개표구
    for (const [a, b] of [
      [3, 11],
      [5, 9],
      [8, 14],
    ]) {
      const ra = off.find((r) => r.precinct === a)!;
      const t = byTotal.get(Number(ra.total))!;
      expect(t, `총계 ${ra.total} 목표 없음`).toBeTruthy();
      expect(ra.cha_suwan).toBe(t.quota_cha);
      expect(ra.baek_dohyun).toBe(t.quota_baek);
      expect(ra.lim_garyeo).toBe(t.quota_lim);
      // 쌍둥이 짝도 동일 총계 → 동일 쿼터
      expect(off.find((r) => r.precinct === b)!.total).toBe(ra.total);
    }
  });

  it('밴드 목표 share 를 총계에 곱해 반올림하면 저장된 정수 쿼터가 된다', () => {
    for (const t of BALLAST_PYLAB.datasets.ballast_targets.rows) {
      const tot = Number(t.target_total);
      expect(Math.round(Number(t.share_cha) * tot), `${t.band} cha`).toBe(Number(t.quota_cha));
      expect(Math.round(Number(t.share_baek) * tot), `${t.band} baek`).toBe(Number(t.quota_baek));
      expect(Math.round(Number(t.share_lim) * tot), `${t.band} lim`).toBe(Number(t.quota_lim));
    }
  });

  it('precinct_totals 가 Ch7 공표 총계와 동일하다', () => {
    const off = new Map(
      TWINTALLY_DB.official_tally.rows.map((r) => [r.precinct, r.total]),
    );
    for (const r of BALLAST_PYLAB.datasets.precinct_totals.rows)
      expect(Number(r.total), `precinct ${r.precinct}`).toBe(off.get(Number(r.precinct)));
  });
});

describe('Chapter 8 — 템플릿 실행 · 스캔 트리거', () => {
  it('target: 목표 분포 추출이 target 단서를 확보시킨다', () => {
    const r = run('target', 'band=all');
    expect(r.ok).toBe(true);
    expect(ch.scan(r.text, { ...none }).some((x) => x.complete === 'target')).toBe(true);
  });

  it('quota total=33280: 제3·11개표구 쌍둥이 재현으로 quota 확보', () => {
    const r = run('quota', 'total=33280');
    expect(r.ok).toBe(true);
    expect(r.text).toContain('쌍둥이 재현');
    expect(ch.scan(r.text, { ...none }).some((x) => x.complete === 'quota')).toBe(true);
  });

  it('quota 재현 삼각형이 Ch7 제11개표구 공표치와 일치한다', () => {
    const r = run('quota', 'total=33280');
    expect(r.text).toContain('15207');
    expect(r.text).toContain('14892');
    expect(r.text).toContain('3181');
  });

  it('quota: 쌍둥이가 아닌 총계(28234)는 재현되지 않는다', () => {
    const r = run('quota', 'total=28234');
    expect(r.ok).toBe(true);
    expect(r.text).not.toContain('쌍둥이 재현');
    expect(ch.scan(r.text, { ...none }).some((x) => x.complete === 'quota')).toBe(false);
  });

  it('inject module=blst: cert-mirror-2 주입 지점으로 inject 확보', () => {
    const r = run('inject', 'module=blst');
    expect(r.ok).toBe(true);
    expect(r.text).toContain('cert-mirror-2');
    expect(ch.scan(r.text, { ...none }).some((x) => x.complete === 'inject')).toBe(true);
  });

  it('inject: 정규 서명 모듈(mod_tb_core)은 주입 흔적이 없다', () => {
    const r = run('inject', 'module=mod_tb_core');
    expect(ch.scan(r.text, { ...none }).some((x) => x.complete === 'inject')).toBe(false);
  });

  it('이미 확보된 단서는 다시 완료되지 않는다', () => {
    const r = run('quota', 'total=33280');
    expect(ch.scan(r.text, { ...none, quota: true }).some((x) => x.complete === 'quota')).toBe(
      false,
    );
  });
});
