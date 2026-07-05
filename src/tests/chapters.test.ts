import { describe, expect, it } from 'vitest';
import { CHAPTERS, CHAPTER_IDS } from '../content/chapters';
import { linkKey } from '../state/gameStore';

describe('챕터 데이터 무결성', () => {
  it.each(CHAPTER_IDS)('챕터 %i: good 연결의 why 근거가 전부 정의됨', (ch) => {
    const b = CHAPTERS[ch].board;
    for (const [a, x] of b.good) expect(b.why[linkKey(a, x)], `${a}-${x}`).toBeTruthy();
  });
  it.each(CHAPTER_IDS)('챕터 %i: good 연결 노드가 실제 노드 목록에 존재', (ch) => {
    const b = CHAPTERS[ch].board;
    const ids = new Set(b.nodes.map((n) => n.id));
    for (const [a, x] of b.good) {
      expect(ids.has(a)).toBe(true);
      expect(ids.has(x)).toBe(true);
    }
  });
  it.each(CHAPTER_IDS)('챕터 %i: 힌트 3단계가 모든 목표에 존재', (ch) => {
    const c = CHAPTERS[ch];
    for (const o of c.objectives) expect(c.hints[o.key]).toHaveLength(3);
  });
  it('fileTriggers 가 실제 목표 key 를 가리킨다', () => {
    for (const ch of CHAPTER_IDS) {
      const keys = new Set(CHAPTERS[ch].objectives.map((o) => o.key));
      for (const obj of Object.values(CHAPTERS[ch].fileTriggers)) expect(keys.has(obj)).toBe(true);
    }
  });
  it.each(CHAPTER_IDS)('챕터 %i: findings 가 실제 목표 key 를 가리킨다', (ch) => {
    const keys = new Set(CHAPTERS[ch].objectives.map((o) => o.key));
    for (const k of Object.keys(CHAPTERS[ch].findings)) expect(keys.has(k), k).toBe(true);
  });
});

describe('챕터 프레임워크 일반화', () => {
  it('CHAPTER_IDS 가 오름차순으로 레지스트리를 반영한다', () => {
    expect(CHAPTER_IDS).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8]);
  });
  it.each(CHAPTER_IDS)('챕터 %i: 프레임워크 필수 데이터가 모두 존재한다', (ch) => {
    const c = CHAPTERS[ch];
    expect(c.doneFlag).toBeTruthy();
    expect(c.finale.length).toBeGreaterThan(0);
    expect(c.caseSummary.clues.length).toBeGreaterThan(0);
    expect(c.ending.doneTitle).toBeTruthy();
    expect(c.ending.choiceFlag).toBeTruthy();
  });
  it.each(CHAPTER_IDS)('챕터 %i: caseSummary/events key 가 실제 목표를 가리킨다', (ch) => {
    const c = CHAPTERS[ch];
    const keys = new Set(c.objectives.map((o) => o.key));
    for (const clue of c.caseSummary.clues) expect(keys.has(clue.key), clue.key).toBe(true);
    for (const k of Object.keys(c.events ?? {})) expect(keys.has(k), k).toBe(true);
  });
  it('doneFlag 가 챕터마다 고유하다', () => {
    const flags = CHAPTER_IDS.map((id) => CHAPTERS[id].doneFlag);
    expect(new Set(flags).size).toBe(flags.length);
  });
  it('구현된 챕터는 다음 챕터 예고에 pendingNote 없이 이어진다', () => {
    // 마지막 챕터만 pendingNote(미구현 안내)를 갖는다
    const last = CHAPTER_IDS[CHAPTER_IDS.length - 1];
    for (const id of CHAPTER_IDS) {
      const hasNext = CHAPTERS[id + 1] != null;
      if (hasNext) expect(CHAPTERS[id].ending.pendingNote, `ch${id}`).toBeUndefined();
    }
    expect(CHAPTERS[last].ending.pendingNote).toBeTruthy();
  });
});

describe('출력 스캔 — 결정적 증거 자동 확보', () => {
  it('uniq -c 집계 출력에서 발신 번호가 확보된다', () => {
    const r = CHAPTERS[0].scan('   7 CALLER=070-8112-4437', {
      number: false,
      template: false,
      relay: false,
    });
    expect(r.some((x) => x.complete === 'number' && x.msg?.includes('[단서 확보]'))).toBe(true);
  });
  it('집계 없이 번호만 보여서는 확보되지 않는다', () => {
    const r = CHAPTERS[0].scan(
      '2026-06-29 20:41:03 DISPLAY="KB은행" CALLER=070-8112-4437 ROUTE=relay-b',
      { number: false, template: false, relay: false },
    );
    expect(r.some((x) => x.complete === 'number')).toBe(false);
  });
  it('원장 내용 출력 시 ledger 와 company 가 확보된다', () => {
    const r = CHAPTERS[1].scan(
      'week,route,recipient,amount_krw\n2026-W19,relay-b,NORTHLINE FIDUCIARY SERVICES,996000000',
      { manifest: true, alias: true, ledger: false, company: false, escrow: false },
    );
    expect(r.some((x) => x.complete === 'ledger')).toBe(true);
    expect(r.some((x) => x.complete === 'company')).toBe(true);
  });
  it('escrow 는 모법인 관계가 드러나는 디코드 출력에서만 확보된다', () => {
    const csv = CHAPTERS[1].scan(
      'week,route,recipient,amount_krw\n# NL-ESCROW 주간 합산액은 매주 NORTHLINE 계정으로 재이체됨 (sweep)',
      { manifest: true, alias: true, ledger: true, company: true, escrow: false },
    );
    expect(csv.some((x) => x.complete === 'escrow')).toBe(false);
    const decoded = CHAPTERS[1].scan('NL-ESCROW :: 모법인 NORTHLINE FIDUCIARY SERVICES', {
      manifest: true, alias: true, ledger: true, company: true, escrow: false,
    });
    expect(decoded.some((x) => x.complete === 'escrow')).toBe(true);
  });
  it('챕터2: uniq -c 집계 출력에서 미등재 번호가 확보된다', () => {
    const r = CHAPTERS[2].scan('  14 SRC=0505-0311-7742', {
      intake: true, netmap: true, unlisted: false, owner: false, timeline: false,
    });
    expect(r.some((x) => x.complete === 'unlisted')).toBe(true);
  });
  it('챕터2: 가입정보 디코드 출력에서 명의가 확보된다', () => {
    const r = CHAPTERS[2].scan('개통일: 2026-03-02\n명의: 박정순 (1968년생)', {
      intake: true, netmap: true, unlisted: true, owner: false, timeline: false,
    });
    expect(r.some((x) => x.complete === 'owner')).toBe(true);
  });
  it('챕터2: 피해자 목록만 읽어서는 명의가 확보되지 않는다', () => {
    const r = CHAPTERS[2].scan('박정순 (1968년생)  2025-11  기관사칭 콜', {
      intake: true, netmap: true, unlisted: true, owner: false, timeline: false,
    });
    expect(r.some((x) => x.complete === 'owner')).toBe(false);
  });
  it('이미 확보된 단서는 다시 완료되지 않는다', () => {
    const r = CHAPTERS[0].scan('   7 CALLER=070-8112-4437\nTPL-ECHO-7', {
      number: true, template: true, relay: false,
    });
    expect(r).toHaveLength(0);
  });
});
