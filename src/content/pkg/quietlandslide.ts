import { PkgDef } from '../../engine/pkg/pkg';

/**
 * Chapter 10 — 시즌2 증거 패키지 조립 정의 (전부 허구).
 * 시즌 전체 증거를 6개 범주에 배치한다. 미검증 트랩 2종(익명 녹취·원시 덤프)은
 * 배치는 가능하나 품질을 깎는다 — "검증본만이 무기"라는 시즌1 교훈의 재확인.
 */
export const QUIETLANDSLIDE_PKG: PkgDef = {
  banner:
    '[EVIDENCE PACKAGE BUILDER — 사건 TWIN TALLY (시즌 피날레)]\n' +
    '배부·집계·검수·법인까지, 시즌 전체 증거를 하나의 패키지로 묶는다.\n' +
    '각 범주에 검증된 증거를 배치할 것 — 미검증 출처는 반박의 문이 된다.',
  caseLabel: '사건: TWIN TALLY / 대상: MERIDIAN CIVIC',
  categories: [
    { id: 'alloc', name: '배부 조작' },
    { id: 'tally', name: '집계 조작' },
    { id: 'twins', name: '쌍둥이 물증' },
    { id: 'inject', name: '주입 경로' },
    { id: 'cert', name: '위조 인증' },
    { id: 'corp', name: '배후 법인' },
  ],
  items: [
    {
      id: 'turnout',
      label: '투표율 과소예측 모델(MC-02) 대조',
      cat: 'alloc',
      verified: true,
      src: 'Ch9',
      why: '예측 대비 실제 초과분만큼 배부가 깎인 투표지 부족의 물증이다.',
    },
    {
      id: 'target',
      label: 'ballast 목표 분포 테이블 (역어셈블)',
      cat: 'tally',
      verified: true,
      src: 'Ch8',
      why: '규모대별 득표율을 하드코딩해 결과를 덮어쓴 집계 조작의 물증이다.',
    },
    {
      id: 'raw_fw',
      label: 'TB-11 원시 펌웨어 덤프 (무결성 미검증)',
      cat: 'tally',
      verified: false,
      src: 'Ch8 · 원본',
      why: '내용은 집계 조작이지만 해시 대조 전 원시 덤프 — 검증본으로 대체 가능.',
    },
    {
      id: 'twin',
      label: '쌍둥이 개표구 3쌍 공표치 + 수기 검산 대조',
      cat: 'twins',
      verified: true,
      src: 'Ch7',
      why: '같은 총계에 같은 득표수 — 조작의 손버릇이 남긴 결정적 물증이다.',
    },
    {
      id: 'mirror',
      label: 'cert-mirror-2 패치 공급 사슬',
      cat: 'inject',
      verified: true,
      src: 'Ch8',
      why: '서명 라인 밖 뒷문으로 모듈이 주입된 경로의 물증이다.',
    },
    {
      id: 'cert',
      label: 'CERT-9917 서명 + 표승우 위조 검수',
      cat: 'cert',
      verified: true,
      src: 'Ch9',
      why: '무권한 검수가 뒷문을 "합법"으로 도장 찍은 위조 인증의 물증이다.',
    },
    {
      id: 'meridian',
      label: 'Meridian 파견·계약 + 자금 관로',
      cat: 'corp',
      verified: true,
      src: 'Ch9·Ch10',
      why: '서명자·검수자 파견과 결과 보증 상품을 잇는 배후 법인의 물증이다.',
    },
    {
      id: 'anon',
      label: '익명 내부고발 녹취 (출처 불명)',
      cat: 'corp',
      verified: false,
      src: '출처 불명',
      why: '내용은 배후 정황이지만 화자·경위를 입증할 수 없는 미검증 녹취다.',
    },
  ],
};
