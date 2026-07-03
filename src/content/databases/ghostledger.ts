import { Database } from '../../engine/query/query';

/**
 * Chapter 3 — 붕괴한 결제대행사에서 확보한 법원 인가 포렌식 DB 사본 (전부 허구 데이터).
 * 피해자의 금전적 곤경이 어떻게 스코어링·수익화되는지를 드러낸다.
 */
export const GHOSTLEDGER_DB: Database = {
  // 피해자 연계 이체 — 미러콜 인프라가 흘려보낸 자금
  transactions: {
    columns: ['id', 'victim', 'recipient', 'amount_krw', 'week'],
    rows: [
      { id: 'T-1001', victim: '박정순', recipient: 'NL-ESCROW', amount_krw: 38000000, week: '2026-W26' },
      { id: 'T-1002', victim: '조성태', recipient: 'NL-ESCROW', amount_krw: 22000000, week: '2026-W26' },
      { id: 'T-1003', victim: '윤미란', recipient: 'NL-ESCROW', amount_krw: 22000000, week: '2026-W27' },
      { id: 'T-1004', victim: '조성태', recipient: 'BLUEHARBOR LLC', amount_krw: 15000000, week: '2026-W27' },
      { id: 'T-1005', victim: '김호영', recipient: 'BLUEHARBOR LLC', amount_krw: 9000000, week: '2026-W28' },
      { id: 'T-1006', victim: '윤미란', recipient: 'GREYFOX ANALYTICS', amount_krw: 6000000, week: '2026-W28' },
    ],
  },
  // 셸컴퍼니 모법인 사다리 — NL-ESCROW → Northline → Greyfox → Orbis Vale
  shell_companies: {
    columns: ['name', 'parent', 'sector'],
    rows: [
      { name: 'NL-ESCROW', parent: 'NORTHLINE FIDUCIARY SERVICES', sector: 'escrow' },
      { name: 'NORTHLINE FIDUCIARY SERVICES', parent: 'GREYFOX ANALYTICS', sector: 'credit_info' },
      { name: 'BLUEHARBOR LLC', parent: 'GREYFOX ANALYTICS', sector: 'collections' },
      { name: 'GREYFOX ANALYTICS', parent: 'ORBIS VALE CAPITAL', sector: 'data_risk' },
      { name: 'ORBIS VALE CAPITAL', parent: '(없음)', sector: 'holding' },
    ],
  },
  // 위험 점수 — 은닉 필드 dci(Distress Conversion Index)
  risk_scores: {
    columns: ['victim', 'model', 'dci', 'class'],
    rows: [
      { victim: '박정순', model: 'GREYFOX-DCI-v3', dci: 87, class: 'high_liquidation' },
      { victim: '조성태', model: 'GREYFOX-DCI-v3', dci: 91, class: 'high_liquidation' },
      { victim: '윤미란', model: 'GREYFOX-DCI-v3', dci: 78, class: 'watch' },
      { victim: '김호영', model: 'GREYFOX-DCI-v3', dci: 64, class: 'watch' },
    ],
  },
  // 결제 라우팅 — 일부 계좌가 미러콜 릴레이 인프라를 재사용
  payment_routes: {
    columns: ['account', 'shell', 'relay_alias'],
    rows: [
      { account: 'ACCT-77-01', shell: 'NL-ESCROW', relay_alias: 'relay-b' },
      { account: 'ACCT-77-02', shell: 'NL-ESCROW', relay_alias: 'echo-relay-03' },
      { account: 'ACCT-88-05', shell: 'BLUEHARBOR LLC', relay_alias: 'relay-c' },
      { account: 'ACCT-91-03', shell: 'GREYFOX ANALYTICS', relay_alias: 'relay-b' },
    ],
  },
  // 임원 승인 기록 (정황)
  executive_messages: {
    columns: ['id', 'officer', 'subject', 'week'],
    rows: [
      { id: 'M-01', officer: '배광호', subject: 'GREYFOX-DCI 정산 파트너십 승인', week: '2026-W20' },
      { id: 'M-02', officer: '오민재', subject: '부실자산 인수 파이프라인 검토', week: '2026-W22' },
      { id: 'M-03', officer: '한서라', subject: '피해자군 데이터 브로커리지 계약', week: '2026-W24' },
    ],
  },
};
