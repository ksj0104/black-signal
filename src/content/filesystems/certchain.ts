import { D, F, VNode } from '../../engine/vfs/vfs';

/** Chapter 9 — 한서시 시범사업 인증·검수 기록 포렌식 (전부 허구 데이터) */
export const CERTCHAIN_FS: VNode = D({
  'briefing.txt': F(`[AEGIS RESPONSE — 사건 AR-2026-1128 "THE CHAIN OF CERTIFICATION"]
의뢰: 정식 수사 공조 (Ballast 후속) · 인증·검수 기록 정보공개·제출본
대상: 한서시 시범사업 검수확인서·검수 보고서·계약 대장 (읽기 전용 사본 · 허구 데이터)
담당 분석관: 서준

배경
 Ch8 에서 우리는 뒷문을 찾았다 — cert-mirror-2.
 그 문을 '합법'으로 만든 종이가 하나 있다 — 검수확인서 CERT-9917.
 서명자는 가려져 있었다. 이제 그 가림막을 벗긴다.

목표
 1. 브리핑 확인                       cat briefing.txt
 2. CERT-9917 서명자 특정              (인증 서명 레지스트리 조회 — query)
 3. 위조 검수 보고서 색출              (검수관 vs 정식 명단 대조)
 4. 배후 컨설팅펌 접점 특정            (계약 대장 조회)
 5. 투표지 부족의 기원 회수            (투표율 예측 모델 대조)

결정적 증거가 화면에 드러나는 순간, 단서는 자동으로 확보된다.
팁: 인증 기록은 포렌식 DB 에 적재됐다. 인자 없이 query 부터.`),
  'analyst_note.txt': F(`(분석관 메모 — 서준)
뒷문(cert-mirror-2)은 '검수 통과'라는 도장으로 포장돼 있었다.
그런데 도장을 찍은 손이 —
 · 정식 검수 권한이 없는 사람이거나 (위조)
 · 검수 대상이 존재하기도 전에 찍혔다면 (소급)
그 도장은 인증이 아니라 알리바이다.

두 개의 이름을 쫓는다: CERT-9917 을 서명한 자, 미러를 '검수'한 자.
그리고 그 둘이 같은 지붕 아래라면 — 사슬의 끝이 보인다.`),
  refs: D({
    'cert_scheme.txt': F(`[검수·인증 체계 안내 — 허구 데이터]
정규 절차: 정식 기술심의관(선관 소속)의 검수 보고서 → 검수확인서 서명 → 인증
DB 테이블:
 cert_registry       검수확인서 서명 기록 (누가·무엇에)
 inspection_reports  검수 보고서 (대상·결과·검수관·제출일)
 inspector_registry  정식 검수 권한 명단 (여기 없으면 무권한)
 pilot_staff         시범사업단 인력·소속
 meridian_contracts  Meridian Civic 계약 (범위·연도)
 turnout_model       투표율 예측 vs 실제 (배부 산정 근거)

대조 예: query SELECT report_id, target, inspector FROM inspection_reports`),
    'mirror_timeline.txt': F(`[패치 미러 등록 타임라인 — Ch8 파생 · 허구 데이터]
2026-09-15  검수 보고서 RPT-9917 "cert-mirror-2 패치 무결성 PASS" 제출  (?)
2026-09-27  검수확인서 CERT-9917 서명 — 미러 등록 승인
2026-09-28  cert-mirror-2 실제 등록·가동
2026-10-01  검수 보고서 RPT-9931 "cert-mirror-2 재검 PASS" 제출

의문: 미러가 09-28 에 생겼는데, 무결성 검수(RPT-9917)는 09-15 에 통과됐다.
      존재하지 않는 것을 검수할 수는 없다. → 소급·위조 정황.`),
  }),
});
