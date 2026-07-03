import { D, F, VNode } from '../../engine/vfs/vfs';

/** Chapter 3 — 붕괴 결제대행사의 법원 인가 포렌식 DB 사본 + 문서 (전부 허구 데이터) */
export const GHOSTLEDGER_FS: VNode = D({
  'briefing.txt': F(`[AEGIS RESPONSE — 사건 AR-2026-0808 "GHOST LEDGER"]
의뢰: 경찰청 사이버수사대 공조 · 법원 인가 포렌식 열람
대상: 붕괴한 결제대행사 압수 DB 사본 (읽기 전용 · 허구 데이터)
담당 분석관: 서준

배경
 어머니의 돈은 '도난'당한 게 아니다. 누군가 그 곤경을 점수로 매기고, 상품으로 팔았다.
 이 DB 는 결제 원장·피해자 프로파일·위험 점수·셸컴퍼니 관계를 담고 있다.

목표
 1. 브리핑 확인                          cat briefing.txt
 2. 포렌식 DB 스키마 확인                 query
 3. 피해 자금 최대 수취 셸 특정           (GROUP BY + SUM 집계)
 4. 모법인 사다리로 배후 지주사 도달       (셸컴퍼니 관계 조회)
 5. 은닉 위험지수 필드 발견               (위험 점수 테이블 조회)
 6. 미러콜 인프라와 겹치는 결제 라우팅     (조인 또는 라우팅 조회)

주의: 본 콘솔은 읽기 전용이다. SELECT 조회만 가능하며 원본은 변경되지 않는다.
예:  query SELECT recipient, SUM(amount_krw) AS total FROM transactions GROUP BY recipient ORDER BY total DESC`),
  'db_readme.txt': F(`[포렌식 DB 열람 안내]
- 접속:  query            (인자 없이 실행하면 테이블/컬럼 목록)
- 조회:  query SELECT ... FROM ... [WHERE ...] [GROUP BY ...] [ORDER BY ...]
- 지원:  SELECT · FROM · WHERE · AND/OR · LIKE · IN · JOIN ... ON · GROUP BY
         · ORDER BY · LIMIT · COUNT/SUM/AVG/MIN/MAX
- 금지:  DELETE · UPDATE · DROP · ALTER · INSERT (읽기 전용 사본 — 거부됨)
막히면 hint. 목표는 우측 MISSION 패널.`),
  notes: D({
    'analyst_note.txt': F(`(분석관 메모 — 서준)
유나의 마지막 말: "장부는 서버에 없다. 진짜 장부는 종이다."
이 DB 는 서버의 장부다. 하지만 서버의 장부만으로도, 패턴은 드러난다.
피해자 리스트가 '위험 점수' 테이블에 그대로 올라와 있다. 누가 이걸 만들었나.`),
    'court_authorization.txt': F(`[열람 인가 — 지방법원 2026-압-0808 (허구)]
대상: 결제대행사 '한내페이(청산)' 서버 이미지의 포렌식 사본
범위: 읽기 전용 조회 · 사본 무결성 해시 대조 일치
비고: 조회 로그는 체인 오브 커스터디에 자동 기록된다.`),
  }),
});
