import { describe, expect, it } from 'vitest';
import { runQuery, formatResult, formatSchema, Database } from '../engine/query/query';
import { GHOSTLEDGER_DB } from '../content/databases/ghostledger';

const DB: Database = {
  t: {
    columns: ['a', 'b', 'n'],
    rows: [
      { a: 'x', b: 'p', n: 3 },
      { a: 'x', b: 'q', n: 5 },
      { a: 'y', b: 'p', n: 2 },
    ],
  },
  u: {
    columns: ['b', 'label'],
    rows: [
      { b: 'p', label: 'PEE' },
      { b: 'q', label: 'CUE' },
    ],
  },
};

describe('query 엔진 — 기본 조회', () => {
  it('SELECT * 는 모든 컬럼/행을 반환한다', () => {
    const r = runQuery('SELECT * FROM t', DB);
    expect(r.columns).toEqual(['a', 'b', 'n']);
    expect(r.rows).toHaveLength(3);
  });
  it('컬럼 선택과 별칭(AS)', () => {
    const r = runQuery('SELECT a, n AS num FROM t', DB);
    expect(r.columns).toEqual(['a', 'num']);
    expect(r.rows[0]).toEqual(['x', 3]);
  });
  it('WHERE 숫자 비교', () => {
    const r = runQuery('SELECT a FROM t WHERE n > 2', DB);
    expect(r.rows).toEqual([['x'], ['x']]);
  });
  it('WHERE 문자열은 대소문자 무시로 매칭', () => {
    const r = runQuery("SELECT n FROM t WHERE a = 'X'", DB);
    expect(r.rows.map((row) => row[0])).toEqual([3, 5]);
  });
  it('WHERE AND / OR', () => {
    const r = runQuery("SELECT b FROM t WHERE a = 'x' AND n > 4", DB);
    expect(r.rows).toEqual([['q']]);
  });
  it('LIKE 와일드카드', () => {
    const r = runQuery("SELECT label FROM u WHERE label LIKE 'P%'", DB);
    expect(r.rows).toEqual([['PEE']]);
  });
  it('IN 목록', () => {
    const r = runQuery("SELECT a FROM t WHERE b IN ('q','p') ORDER BY n DESC", DB);
    expect(r.rows[0]).toEqual(['x']);
  });
});

describe('query 엔진 — 집계/정렬/조인', () => {
  it('GROUP BY + SUM + ORDER BY DESC', () => {
    const r = runQuery('SELECT a, SUM(n) AS total FROM t GROUP BY a ORDER BY total DESC', DB);
    expect(r.columns).toEqual(['a', 'total']);
    expect(r.rows).toEqual([
      ['x', 8],
      ['y', 2],
    ]);
  });
  it('COUNT(*) 전체 집계', () => {
    const r = runQuery('SELECT COUNT(*) AS c FROM t', DB);
    expect(r.rows).toEqual([[3]]);
  });
  it('INNER JOIN ON = 조건', () => {
    const r = runQuery('SELECT t.a, u.label FROM t JOIN u ON t.b = u.b ORDER BY u.label', DB);
    expect(r.rows).toEqual([
      ['x', 'CUE'],
      ['x', 'PEE'],
      ['y', 'PEE'],
    ]);
  });
  it('LIMIT 로 행 수를 제한한다', () => {
    const r = runQuery('SELECT a FROM t LIMIT 1', DB);
    expect(r.rows).toHaveLength(1);
  });
});

describe('query 엔진 — 읽기 전용 가드', () => {
  it.each(['DELETE FROM t', 'UPDATE t SET n = 1', 'DROP TABLE t', 'INSERT INTO t VALUES (1)', 'ALTER TABLE t'])(
    '변경 구문 거부: %s',
    (sql) => {
      expect(() => runQuery(sql, DB)).toThrow(/읽기 전용|SELECT 조회/);
    },
  );
  it('여러 문 연결(;)을 거부한다', () => {
    expect(() => runQuery('SELECT * FROM t; DROP TABLE t', DB)).toThrow();
  });
  it('없는 테이블/컬럼은 명확한 오류', () => {
    expect(() => runQuery('SELECT * FROM nope', DB)).toThrow(/테이블/);
    expect(() => runQuery('SELECT zzz FROM t', DB)).toThrow(/컬럼/);
  });
});

describe('query 엔진 — Ghost Ledger 데이터', () => {
  it('피해 자금 최대 수취 셸은 NL-ESCROW (합계 8,200만)', () => {
    const r = runQuery(
      'SELECT recipient, SUM(amount_krw) AS total FROM transactions GROUP BY recipient ORDER BY total DESC',
      GHOSTLEDGER_DB,
    );
    expect(r.rows[0]).toEqual(['NL-ESCROW', 82000000]);
  });
  it('모법인 사다리가 ORBIS VALE CAPITAL 로 이어진다', () => {
    const txt = formatResult(runQuery('SELECT name, parent FROM shell_companies', GHOSTLEDGER_DB));
    expect(txt).toContain('GREYFOX ANALYTICS');
    expect(txt).toContain('ORBIS VALE CAPITAL');
  });
  it('risk_scores 에 은닉 DCI 모델이 있다', () => {
    const txt = formatResult(runQuery('SELECT * FROM risk_scores', GHOSTLEDGER_DB));
    expect(txt).toContain('GREYFOX-DCI');
  });
  it('결제 라우팅이 미러콜 릴레이(echo-relay-03)를 재사용한다', () => {
    const r = runQuery("SELECT account FROM payment_routes WHERE relay_alias = 'echo-relay-03'", GHOSTLEDGER_DB);
    expect(r.rows).toEqual([['ACCT-77-02']]);
  });
  it('JOIN 으로 피해 이체가 재사용 릴레이 계좌와 겹침을 보인다', () => {
    const txt = formatResult(
      runQuery(
        'SELECT t.victim, p.relay_alias FROM transactions t JOIN payment_routes p ON t.recipient = p.shell',
        GHOSTLEDGER_DB,
      ),
    );
    expect(txt).toContain('echo-relay-03');
  });
});

describe('query 엔진 — 포매팅', () => {
  it('formatSchema 는 테이블과 컬럼을 나열한다', () => {
    const s = formatSchema(GHOSTLEDGER_DB);
    expect(s).toContain('transactions');
    expect(s).toContain('risk_scores');
    expect(s).not.toContain('82000000'); // 스키마엔 데이터 값이 없다
  });
  it('formatResult 헤더와 행 수 표기', () => {
    const s = formatResult(runQuery('SELECT a FROM t', DB));
    expect(s).toContain('(3행)');
  });
});
