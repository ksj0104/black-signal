import { describe, expect, it } from 'vitest';
import { CHAPTERS } from '../content/chapters';
import { TWINTALLY_DB } from '../content/databases/twintally';
import { TWINTALLY_FS } from '../content/filesystems/twintally';
import { nodeAt } from '../engine/vfs/vfs';
import { formatResult, runQuery } from '../engine/query/query';

const ch = CHAPTERS[7];
const none = { intake: false, complaint: false, twins: false, recount: false, module: false };

/** 힌트 3단(정답 명령)에서 query 접두어를 떼고 실행한 포맷 출력 */
const hintOut = (key: 'twins' | 'recount'): string =>
  formatResult(runQuery(ch.hints[key][2].replace(/^query\s+/, ''), TWINTALLY_DB));

const fileText = (path: string): string => {
  const n = nodeAt(TWINTALLY_FS, path);
  if (!n || n.t !== 'f') throw new Error(`missing file: ${path}`);
  return n.c;
};

describe('Chapter 7 — 개표 데이터 정합', () => {
  const rows = TWINTALLY_DB.official_tally.rows;
  const tuple = (r: Record<string, unknown>) =>
    `${r.cha_suwan}|${r.baek_dohyun}|${r.lim_garyeo}`;

  it('쌍둥이 3쌍(3·11, 5·9, 8·14)만 동일 튜플이고 그 외 중복은 없다', () => {
    const byP = Object.fromEntries(rows.map((r) => [r.precinct as number, tuple(r)]));
    expect(byP[3]).toBe(byP[11]);
    expect(byP[5]).toBe(byP[9]);
    expect(byP[8]).toBe(byP[14]);
    const counts = new Map<string, number>();
    for (const r of rows) counts.set(tuple(r), (counts.get(tuple(r)) ?? 0) + 1);
    expect([...counts.values()].filter((n) => n === 2)).toHaveLength(3);
    expect([...counts.values()].every((n) => n <= 2)).toBe(true);
  });

  it('전 개표구에서 total = 후보 3인 합 (표는 만들어지지 않는다)', () => {
    for (const r of rows)
      expect(
        (r.cha_suwan as number) + (r.baek_dohyun as number) + (r.lim_garyeo as number),
        `precinct ${r.precinct}`,
      ).toBe(r.total);
  });

  it('수기 검산 대조 — 기호2 +214 / 기호3 −214, 합계·기호1 보존', () => {
    const h = TWINTALLY_DB.hand_tally.rows[0];
    const o = rows.find((r) => r.precinct === 11)!;
    expect((o.baek_dohyun as number) - (h.baek_dohyun as number)).toBe(214);
    expect((o.lim_garyeo as number) - (h.lim_garyeo as number)).toBe(-214);
    expect(o.cha_suwan).toBe(h.cha_suwan);
    expect(o.total).toBe(h.total);
  });
});

describe('Chapter 7 — 출력 스캔 트리거 정합', () => {
  it('힌트의 GROUP BY 집계 출력에서 twins 가 확보된다', () => {
    const r = ch.scan(hintOut('twins'), { ...none });
    expect(r.some((x) => x.complete === 'twins')).toBe(true);
  });
  it('공표치 전체 나열(SELECT *)에서도 쌍둥이가 드러난다', () => {
    const out = formatResult(runQuery('SELECT * FROM official_tally', TWINTALLY_DB));
    expect(ch.scan(out, { ...none }).some((x) => x.complete === 'twins')).toBe(true);
  });
  it('힌트의 JOIN 출력에서 recount 가 확보된다', () => {
    expect(ch.scan(hintOut('recount'), { ...none }).some((x) => x.complete === 'recount')).toBe(
      true,
    );
  });
  it('수기 검산 단독 조회로는 recount 가 확보되지 않는다 (대조가 필요)', () => {
    const out = formatResult(runQuery('SELECT * FROM hand_tally', TWINTALLY_DB));
    expect(ch.scan(out, { ...none }).some((x) => x.complete === 'recount')).toBe(false);
  });
  it('수기 대장 디코드 출력에서 complaint 가 확보된다', () => {
    const decoded = new TextDecoder().decode(
      Uint8Array.from(atob(fileText('ledger/complaint_ledger.b64')), (c) => c.charCodeAt(0)),
    );
    expect(ch.scan(decoded, { ...none }).some((x) => x.complete === 'complaint')).toBe(true);
  });
  it('전산 내보내기만 읽어서는 complaint 가 확보되지 않는다', () => {
    const sys = fileText('ledger/complaint_sys_export.txt');
    expect(ch.scan(sys, { ...none }).some((x) => x.complete === 'complaint')).toBe(false);
  });
  it('부팅 감사 로그 출력에서 module 이 확보된다', () => {
    const log = fileText('audit/tallybridge_boot.log');
    expect(ch.scan(log, { ...none }).some((x) => x.complete === 'module')).toBe(true);
  });
  it('인증 매니페스트만 읽어서는 module 이 확보되지 않는다', () => {
    const man = fileText('audit/cert_manifest.txt');
    expect(ch.scan(man, { ...none }).some((x) => x.complete === 'module')).toBe(false);
  });
  it('이미 확보된 단서는 다시 완료되지 않는다', () => {
    const r = ch.scan(hintOut('twins'), { ...none, twins: true });
    expect(r.some((x) => x.complete === 'twins')).toBe(false);
  });
});
