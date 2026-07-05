import { Database } from '../../engine/query/query';

/**
 * Chapter 9 — 한서시 시범사업 인증·검수 기록 포렌식 DB 사본 (전부 허구 데이터).
 * Ch8 이 남긴 검수확인서 CERT-9917 의 가려진 서명자를 벗기고, 위조된 검수 보고서와
 * 시범사업단 내부 협력자, 그리고 그 뒤의 Meridian Civic 을 드러낸다.
 * 반전: '투표지 부족'(Ch7 비트1)의 배부 산정에 Meridian 의 투표율 과소예측 모델이 쓰였다 —
 * 행정 실수처럼 보였던 첫 실이, 같은 몸통으로 이어진다.
 */
export const CERTCHAIN_DB: Database = {
  // 인증 서명 레지스트리 — 누가 어떤 검수확인서에 서명했나
  cert_registry: {
    columns: ['cert_id', 'subject', 'signer', 'org', 'signed_date'],
    rows: [
      { cert_id: 'CERT-8801', subject: 'TB fw 2.1.0-p4 정규 인증', signer: '한도경', org: '한서시 선관 기술심의', signed_date: '2026-08-05' },
      { cert_id: 'CERT-9917', subject: 'cert-mirror-2 패치 미러 등록 승인', signer: '남기협', org: '시범사업단(Meridian 파견)', signed_date: '2026-09-27' },
      { cert_id: 'CERT-9950', subject: '집계 정확도 확인', signer: '한도경', org: '한서시 선관 기술심의', signed_date: '2026-08-24' },
    ],
  },
  // 검수 보고서 — 일부는 무권한 검수관이 서명한 위조본
  inspection_reports: {
    columns: ['report_id', 'target', 'result', 'inspector', 'filed_date'],
    rows: [
      { report_id: 'RPT-2201', target: 'TB 정규 빌드 서명 검증', result: 'PASS', inspector: '한도경', filed_date: '2026-08-04' },
      { report_id: 'RPT-2208', target: '집계 정확도 표본 검증', result: 'PASS', inspector: '유상혁', filed_date: '2026-08-23' },
      { report_id: 'RPT-9917', target: 'cert-mirror-2 패치 무결성', result: 'PASS', inspector: '표승우', filed_date: '2026-09-15' },
      { report_id: 'RPT-9931', target: 'cert-mirror-2 재검', result: 'PASS', inspector: '표승우', filed_date: '2026-10-01' },
    ],
  },
  // 정식 검수 권한 명단 — 여기에 없는 서명은 무권한(위조)
  inspector_registry: {
    columns: ['inspector', 'authority'],
    rows: [
      { inspector: '한도경', authority: '한서시 선관 기술심의관 (정식)' },
      { inspector: '유상혁', authority: '한서시 선관 기술심의관 (정식)' },
    ],
  },
  // 시범사업단 인력 — 소속을 따라가면 파견 라인이 드러난다
  pilot_staff: {
    columns: ['staff_id', 'name', 'org', 'role'],
    rows: [
      { staff_id: 'PS-01', name: '남기협', org: '시범사업단(Meridian 파견)', role: '기술심의관' },
      { staff_id: 'PS-02', name: '표승우', org: '시범사업단(Meridian 파견)', role: '검수 위탁' },
      { staff_id: 'PS-03', name: '한도경', org: '한서시 선관 기술심의', role: '검수관' },
      { staff_id: 'PS-04', name: '유상혁', org: '한서시 선관 기술심의', role: '검수관' },
    ],
  },
  // Meridian Civic 계약 — "결과 보증"을 상품으로 파는 컨설팅펌
  meridian_contracts: {
    columns: ['contract_id', 'party', 'scope', 'year'],
    rows: [
      { contract_id: 'MC-01', party: 'Meridian Civic', scope: '결과 보증 컨설팅', year: 2026 },
      { contract_id: 'MC-02', party: 'Meridian Civic', scope: '투표율 예측 모델 납품', year: 2026 },
      { contract_id: 'MC-03', party: 'Meridian Civic', scope: '검수·심의 인력 파견 (남기협·표승우)', year: 2026 },
    ],
  },
  // 투표율 예측 vs 실제 — 배부 산정의 근거와 '투표지 부족'의 기원
  turnout_model: {
    columns: ['precinct', 'meridian_pred', 'allotted', 'actual', 'note'],
    rows: [
      { precinct: 3, meridian_pred: '69%', allotted: 33800, actual: '71%', note: '정상' },
      { precinct: 4, meridian_pred: '58%', allotted: 29500, actual: '74%', note: 'MC-02 과소예측 → 투표지 부족' },
      { precinct: 7, meridian_pred: '60%', allotted: 18600, actual: '75%', note: 'MC-02 과소예측 → 투표지 부족' },
      { precinct: 11, meridian_pred: '70%', allotted: 33900, actual: '72%', note: '정상' },
    ],
  },
};
