import { D, F, VNode } from '../../engine/vfs/vfs';

/** Chapter 10 — 시즌 피날레 종합 (전 챕터 증거 + 봉인 설계 메모 · 전부 허구 데이터) */
export const QUIETLANDSLIDE_FS: VNode = D({
  'briefing.txt': F(`[AEGIS RESPONSE — 사건 AR-2026-1215 "THE QUIET LANDSLIDE"]
의뢰: 정식 수사 종합 · 시즌 최종 · 공개 전략 결정
대상: 시즌 전체 증거 종합 + Meridian 발주·설계 봉인 문서 (읽기 전용 사본 · 허구 데이터)
담당 분석관: 서준

배경
 회사의 이름은 나왔다 — Meridian Civic.
 그러나 회사는 얼굴이 없다. "결과 보증"을 산 사람과, 그것을 설계한 사람.
 이 마지막 사건 파일에서, 조각들을 하나의 패키지로 묶고 두 얼굴을 특정한다.

목표
 1. 종합 브리핑 확인                   cat briefing.txt
 2. 증거 패키지 조립 (6개 범주)         pkg add ...
 3. 발주 비선(결과 보증 구매자) 특정    query
 4. 설계자 개인 특정                    (봉인 설계 메모 디코드)
 5. 최종 패키지 봉인                    pkg seal

이 사건 파일이 시즌의 마지막입니다.
팁: 도구가 모두 열려 있다 — pkg 로 조립하고, query 로 발주선을 좇고,
    base64 로 봉인 문서를 연다.`),
  'convene_note.txt': F(`(분석관 메모 — 서준)
시즌의 모든 실이 여기 모인다.
 · 배부(Ch7 비트1) — 투표율 과소예측으로 깎인 투표지
 · 집계(Ch8) — ballast 목표 분포·쿼터
 · 인증(Ch9) — CERT-9917·표승우의 위조 검수
 · 법인(Ch9) — Meridian Civic
남은 두 얼굴:
 · 산 사람 — "결과 보증"을 발주한 비선.       → query guarantee_orders
 · 설계한 사람 — 봉인된 내부 메모의 전결 서명.  → base64 -d evidence/design_memo.b64`),
  evidence: D({
    'design_memo.b64': F('W01FUklESUFOIENJVklDIOKAlCDrgrTrtoAg7ISk6rOEIOuplOuqqCAo67SJ7J24KSDCtyDtl4jqtawg642w7J207YSwXQrtlITroZzsoJ3tirg6IFFVSUVUIExBTkRTTElERSAo7KGw7Jqp7ZWcIOyVleyKuSkKCuyEpOqzhCDsm5DsuZkKICLtkZzrpbwg7ZuU7LmY7KeAIOyViuuKlOuLpC4g7Jik7LCoIOuylOychCDslYjsl5DshJwg7J206riw6rKMIOunjOuTpCDrv5DsnbTri6QuIgogwrcg66qp7ZGcIOu2hO2PrOuKlCDsl6zroaDsobDsgqwg7Iug66Kw6rWs6rCEIOyViOyXkCDrkZTri6Qg4oCUIOydmOyLrOydhCDsgqzsp4Ag7JWK64qUIOuniOynhC4KIMK3IOq3nOuqqOuMgOuzhCDsoJXsiJgg7L+87YSw66GcIOq3oOyniO2ZlO2VnOuLpCDigJQg6rCc67OEIOqwnO2RnOq1rOqwgCDti7Ag64KY7KeAIOyViuqyjC4KIMK3IOuwsOu2gMK37KeR6rOEwrfqsoDsiJjrpbwg7ZWcIOyGkOyXkCDrkZTri6Qg4oCUIOuLqOydvCDsi6TtjKjsoJDsnYQg66eM65Ok7KeAIOyViuuKlOuLpC4KCuyxheyehCDshKTqs4QgLyDsoITqsrA6IOyImOyEnSDsoITrnrXqsIAg64+E7ZiE7JqwCuu5hOqzoDog67O4IOuplOuqqOuKlCDrjIDsmbgg7Jyg7LacIOyLnCDtmozsgqzsnZgg7KG066a97J2EIOychO2Yke2VnOuLpC4g7Je0656MIO2bhCDtjIzquLAg7JqU66edLg=='),
    'pkg_readme.txt': F(`[EVIDENCE PACKAGE 안내]
- pkg                       카테고리 현황·증거 보관함
- pkg add <증거> <카테고리>  범주에 배치
- pkg remove <증거>          회수
- pkg seal                  6/6 최종 확정 (미검증 항목은 신뢰도 하락)
검증본만으로 6개 범주를 채우면 "법적으로 방어 가능한" 패키지가 된다.`),
  }),
});
