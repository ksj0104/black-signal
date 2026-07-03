import { PkgDef } from '../../engine/pkg/pkg';

/**
 * Chapter 6 — 증거 패키지 조립 정의.
 * 전 챕터에서 확보한 증거(전부 허구)를 8개 법적 카테고리에 배치한다.
 * 미검증 트랩 2종(오염 원본·익명 녹취)은 배치는 가능하나 품질을 깎는다 —
 * evidenceClean(엔딩 A 조건)은 검증본만으로 8/8 을 채웠을 때 성립.
 */
export const BLACKSIGNAL_PKG: PkgDef = {
  banner:
    '[EVIDENCE PACKAGE BUILDER — 사건 BLACK SIGNAL]\n' +
    '법적으로 방어 가능하고 대중이 이해할 수 있는 패키지를 조립한다.\n' +
    '각 범주에 검증된 증거를 배치할 것 — 미검증 출처는 반박의 문이 된다.',
  categories: [
    { id: 'infra', name: '사기 인프라' },
    { id: 'launder', name: '자금 세탁' },
    { id: 'corp', name: '자회사 구조' },
    { id: 'broker', name: '데이터 브로커리지' },
    { id: 'target', name: '피해자 타기팅' },
    { id: 'exec', name: '임원 통신' },
    { id: 'witness', name: '목격자 억압' },
    { id: 'profit', name: '금전적 수혜' },
  ],
  items: [
    {
      id: 'relay',
      label: 'echo-relay-03 인증서·링크 체인',
      cat: 'infra',
      verified: true,
      src: '프롤로그·Ch1',
      why: '표시명 위조·문자·가짜앱이 수렴하는 발신 인프라의 물증이다.',
    },
    {
      id: 'ledger',
      label: 'payout_routing 주간 정산 원장',
      cat: 'launder',
      verified: true,
      src: 'Ch1·Ch3',
      why: '피해 자금이 NL-ESCROW 로 모여 스윕되는 세탁 경로의 물증이다.',
    },
    {
      id: 'ladder',
      label: '법인 사다리 등기 체인',
      cat: 'corp',
      verified: true,
      src: 'Ch3',
      why: 'NL-ESCROW→Northline→Greyfox→Orbis Vale 지배 구조의 물증이다.',
    },
    {
      id: 'dci',
      label: 'GREYFOX-DCI-v3 모델·위험 점수',
      cat: 'broker',
      verified: true,
      src: 'Ch3',
      why: '피해자 데이터를 점수화·거래하는 브로커리지의 물증이다.',
    },
    {
      id: 'reuse',
      label: '신원 재사용 딜 파이프라인 (검증본)',
      cat: 'target',
      verified: true,
      src: 'Ch4',
      why: '미러콜 피해자 4인이 딜 소싱으로 재사용된 타기팅의 물증이다.',
    },
    {
      id: 'raw_archive',
      label: '봉인 아카이브 원본 (오염 3행 포함)',
      cat: 'target',
      verified: false,
      src: 'Ch4 · NW',
      why: '내용은 타기팅 증거지만 오염 행이 남은 원본 — 검증본으로 대체 가능.',
    },
    {
      id: 'approve',
      label: '배광호 결재 × 배지 활성 상관 기록',
      cat: 'exec',
      verified: true,
      src: 'Ch3·Ch4',
      why: 'DCI 정산 승인 주간의 임원 결재·물리 정황 상관의 물증이다.',
    },
    {
      id: 'cctv',
      label: 'CCTV 경로 재구성 + 편집 서명 감정서',
      cat: 'witness',
      verified: true,
      src: 'Ch5',
      why: '시계 조작·프레임 절삭·세리톤 배지 — 목격자 억압의 물증이다.',
    },
    {
      id: 'tipoff',
      label: '익명 제보 녹취 (출처 불명)',
      cat: 'witness',
      verified: false,
      src: '출처 불명',
      why: '내용은 억압 정황이지만 화자·경위를 입증할 수 없는 미검증 녹취다.',
    },
    {
      id: 'pipeline',
      label: '부실자산 인수 정산 기록',
      cat: 'profit',
      verified: true,
      src: 'Ch3·Ch4',
      why: '피해 하류 결과에서 수익을 회수한 금전적 수혜의 물증이다.',
    },
  ],
};
