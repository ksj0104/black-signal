import { Database } from '../../engine/query/query';

/**
 * Chapter 10 — 시즌 피날레 종합 DB (전부 허구 데이터).
 * Meridian 의 '결과 보증' 상품을 누가 샀는가(발주 비선)와, 그 자금이 어디서 왔는가
 * (시즌1 Orbis Vale 잔당 셸의 카메오)를 드러낸다.
 */
export const QUIETLANDSLIDE_DB: Database = {
  // 결과 보증 발주 기록 — 상품을 산 쪽
  guarantee_orders: {
    columns: ['order_id', 'buyer', 'product', 'tier', 'year'],
    rows: [
      { order_id: 'GO-1401', buyer: '한서 도시전략 비선(秘線) TF', product: '결과 보증 — 한서시장 보궐선거', tier: '특수', year: 2026 },
      { order_id: 'GO-0907', buyer: '(타 광역 사전 문의)', product: '결과 보증 — 사전 견적', tier: '표준', year: 2026 },
    ],
  },
  // 자금 관로 — Meridian 초기 투자금에 시즌1 잔당 셸이 카메오로 등장
  funding_trace: {
    columns: ['seq', 'from_entity', 'to_entity', 'note'],
    rows: [
      { seq: 1, from_entity: 'NL-계열 셸 (舊 Orbis Vale 잔당)', to_entity: 'Meridian Civic', note: '초기 투자금 — 시즌1 관로 잔재' },
      { seq: 2, from_entity: 'Meridian Civic', to_entity: 'QUIET LANDSLIDE 운영', note: '결과 보증 상품화 자금' },
      { seq: 3, from_entity: '한서 도시전략 비선 TF', to_entity: 'Meridian Civic', note: 'GO-1401 발주 대금' },
    ],
  },
};
