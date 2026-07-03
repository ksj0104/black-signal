import { describe, expect, it } from 'vitest';
import { labOverview, runTemplate, templateView } from '../engine/pylab/pylab';
import { THEOFFER_PYLAB as LAB } from '../content/datasets/theoffer';

const run = (id: string, ...args: string[]) => runTemplate(LAB, id, args);

describe('pylab — 격리 템플릿 평가기', () => {
  it('개요에 데이터셋과 템플릿 목록이 나온다', () => {
    const txt = labOverview(LAB);
    expect(txt).toContain('deal_pipeline');
    expect(txt).toContain('archive_ledger');
    expect(txt).toContain('python reuse');
    expect(txt).toContain('격리 샌드박스');
  });
  it('템플릿 뷰에 골격과 빈칸이 나온다', () => {
    const txt = templateView(LAB, 'reuse');
    expect(txt).toContain('for r in deal_pipeline');
    expect(txt).toContain('«min»');
    expect(txt).toContain('«source»');
  });
  it('알 수 없는 템플릿·잘못된 인자·빈칸 누락은 친절한 에러', () => {
    expect(run('nmap').ok).toBe(false);
    expect(run('nmap').text).toContain('알 수 없는 템플릿');
    expect(run('reuse', 'min60').text).toContain('k=v');
    expect(run('reuse', 'port=80').text).toContain('빈칸이 없다');
    const missing = run('reuse', 'min=60');
    expect(missing.ok).toBe(false);
    expect(missing.text).toContain('«source»');
  });
  it('실행이 데이터셋을 변경하지 않는다 (읽기 전용)', () => {
    const before = LAB.datasets.archive_ledger.rows.length;
    run('verify', 'rule=all');
    run('reuse', 'min=0', 'source=MirrorCall');
    expect(LAB.datasets.archive_ledger.rows.length).toBe(before);
  });
});

describe('pylab — The Offer 분석 정답 데이터', () => {
  it('reuse: 정답 임계(60)에서 정확히 4건 + 캐논 피해자', () => {
    const r = run('reuse', 'min=60', 'source=MirrorCall');
    expect(r.ok).toBe(true);
    expect(r.text).toContain('재사용 후보 4건');
    for (const v of ['박정순', '조성태', '윤미란', '김호영']) expect(r.text).toContain(v);
    expect(r.text).not.toContain('최도윤');
  });
  it('reuse: 임계가 낮으면 저위험 리드가 혼입되어 5건', () => {
    const r = run('reuse', 'min=40', 'source=MirrorCall');
    expect(r.text).toContain('후보 5건');
    expect(r.text).toContain('혼입');
  });
  it('reuse: 소싱 채널이 다르면 대조군만 나온다', () => {
    const r = run('reuse', 'min=60', 'source=공개매각');
    expect(r.text).toContain('후보 2건');
    expect(r.text).not.toContain('박정순');
  });
  it('approve: 배광호 × W20 에서만 결재 대조가 성립한다', () => {
    const hit = run('approve', 'officer=배광호', 'week=2026-W20');
    expect(hit.text).toContain('⇔ 결재 대조');
    expect(hit.text).toContain('BDG-0117');
    expect(hit.text).toContain('VAULT-B');
    const wrongWeek = run('approve', 'officer=배광호', 'week=2026-W24');
    expect(wrongWeek.text).toContain('상관 불성립');
    const noLog = run('approve', 'officer=김태석', 'week=2026-W20');
    expect(noLog.text).toContain('대조 결과 없음');
  });
  it('verify: 규칙별로 오염 행이 하나씩, all 에서 3건', () => {
    expect(run('verify', 'rule=date').text).toContain('AR-091');
    expect(run('verify', 'rule=date').text).not.toContain('AR-124');
    expect(run('verify', 'rule=amount').text).toContain('AR-124');
    expect(run('verify', 'rule=ref').text).toContain('AR-207');
    const all = run('verify', 'rule=all');
    expect(all.text).toContain('무결성 위반 3건');
    for (const id of ['AR-091', 'AR-124', 'AR-207']) expect(all.text).toContain(id);
    expect(all.text).not.toContain('AR-033');
    expect(run('verify', 'rule=full').text).toContain('ValueError');
  });
  it('summary: 분석 결과와 다른 숫자는 AssertionError, 정답은 요약 출력', () => {
    expect(run('summary', 'reused=5', 'tainted=3').text).toContain('AssertionError');
    const ok = run('summary', 'reused=4', 'tainted=3');
    expect(ok.text).toContain('EVIDENCE SUMMARY');
    expect(ok.text).toContain('검증 완료');
  });
});
