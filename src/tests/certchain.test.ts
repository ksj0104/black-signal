import { describe, expect, it } from 'vitest';
import { CHAPTERS } from '../content/chapters';
import { CERTCHAIN_DB } from '../content/databases/certchain';
import { formatResult, runQuery } from '../engine/query/query';

const ch = CHAPTERS[9];
const none = {
  intake: false,
  signer: false,
  forgery: false,
  meridian: false,
  turnout: false,
};

/** 힌트 3단(정답 쿼리)에서 query 접두어를 떼고 실행한 포맷 출력 */
const hintOut = (key: 'signer' | 'forgery' | 'meridian' | 'turnout'): string =>
  formatResult(runQuery(ch.hints[key][2].replace(/^query\s+/, ''), CERTCHAIN_DB));

const out = (sql: string) => formatResult(runQuery(sql, CERTCHAIN_DB));

describe('Chapter 9 — 인증 기록 정합', () => {
  it('CERT-9917 의 서명자는 남기협이며 Meridian 파견 소속이다', () => {
    const r = CERTCHAIN_DB.cert_registry.rows.find((x) => x.cert_id === 'CERT-9917')!;
    expect(r.signer).toBe('남기협');
    expect(String(r.org)).toContain('Meridian');
  });

  it('위조 검수관(표승우)은 정식 검수 명단에 없다', () => {
    const authorized = new Set(CERTCHAIN_DB.inspector_registry.rows.map((r) => r.inspector));
    const mirrorReports = CERTCHAIN_DB.inspection_reports.rows.filter((r) =>
      String(r.target).includes('cert-mirror-2'),
    );
    expect(mirrorReports.length).toBeGreaterThan(0);
    for (const r of mirrorReports) {
      expect(authorized.has(r.inspector), `${r.inspector} 권한자 아님`).toBe(false);
      expect(r.inspector).toBe('표승우');
    }
  });

  it('CERT-9917 서명자와 위조 검수관이 모두 Meridian 계약(MC-03)에 있다', () => {
    const mc03 = CERTCHAIN_DB.meridian_contracts.rows.find((r) => r.contract_id === 'MC-03')!;
    expect(String(mc03.scope)).toContain('남기협');
    expect(String(mc03.scope)).toContain('표승우');
    expect(mc03.party).toBe('Meridian Civic');
  });

  it('투표지 부족 개표구는 Meridian 과소예측(MC-02) 표식을 갖는다', () => {
    const shortage = CERTCHAIN_DB.turnout_model.rows.filter((r) =>
      String(r.note).includes('투표지 부족'),
    );
    expect(shortage.length).toBeGreaterThan(0);
    for (const r of shortage) expect(String(r.note)).toContain('MC-02 과소예측');
  });
});

describe('Chapter 9 — 출력 스캔 트리거 정합', () => {
  it('CERT-9917 조회로 signer 가 확보된다', () => {
    expect(ch.scan(hintOut('signer'), { ...none }).some((x) => x.complete === 'signer')).toBe(true);
  });
  it('검수 보고서 조회로 forgery 가 확보된다', () => {
    expect(ch.scan(hintOut('forgery'), { ...none }).some((x) => x.complete === 'forgery')).toBe(
      true,
    );
  });
  it('Meridian 계약 조회로 meridian 이 확보된다', () => {
    expect(ch.scan(hintOut('meridian'), { ...none }).some((x) => x.complete === 'meridian')).toBe(
      true,
    );
  });
  it('투표율 모델 조회로 turnout 이 확보된다', () => {
    expect(ch.scan(hintOut('turnout'), { ...none }).some((x) => x.complete === 'turnout')).toBe(
      true,
    );
  });

  it('서명 레지스트리만 봐서는 forgery/meridian 이 트리거되지 않는다', () => {
    const r = ch.scan(out('SELECT * FROM cert_registry'), { ...none });
    expect(r.some((x) => x.complete === 'forgery')).toBe(false);
    // cert_registry.org 의 "Meridian 파견"은 'Meridian Civic' 가 아니므로 meridian 미트리거
    expect(r.some((x) => x.complete === 'meridian')).toBe(false);
  });

  it('정식 검수 보고서(정규 빌드)만으로는 forgery 가 트리거되지 않는다', () => {
    const r = ch.scan(out("SELECT * FROM inspection_reports WHERE inspector = '한도경'"), {
      ...none,
    });
    expect(r.some((x) => x.complete === 'forgery')).toBe(false);
  });

  it('이미 확보된 단서는 다시 완료되지 않는다', () => {
    const r = ch.scan(hintOut('signer'), { ...none, signer: true });
    expect(r.some((x) => x.complete === 'signer')).toBe(false);
  });

  it('브리핑을 읽어도 어떤 단서도 조기 확보되지 않는다', () => {
    const brief = CHAPTERS[9].fs;
    const node = brief.t === 'd' ? brief.ch['briefing.txt'] : null;
    const text = node && node.t === 'f' ? node.c : '';
    expect(text).toContain('THE CHAIN OF CERTIFICATION');
    expect(ch.scan(text, { ...none })).toHaveLength(0);
  });
});
