import { D, F, VNode } from '../../engine/vfs/vfs';

/** Chapter 8 — 압수된 개표 집계 유닛 펌웨어 포렌식 + 격리 랩 문서 (전부 허구 데이터) */
export const BALLAST_FS: VNode = D({
  'briefing.txt': F(`[AEGIS RESPONSE — 사건 AR-2026-1103 "BALLAST"]
의뢰: 정식 수사 공조 (Twin Tally 후속) · 법원 압수·봉인 유닛 포렌식
대상: 한서시 제11개표구 집계 유닛 TB-11 펌웨어 이미지 (읽기 전용 사본 · 허구 데이터)
담당 분석관: 서준

배경
 재검표 논쟁 끝에, 문제의 집계 유닛 한 대가 봉인·압수됐다.
 Chapter 7 에서 우리가 이름만 봤던 것 — blst-0.9.4 "ballast".
 이제 그 본체가 여기 있다. 무엇을 하는 코드인지, 어디서 왔는지 밝힌다.

목표
 1. 브리핑 확인                       cat briefing.txt
 2. 격리 분석 랩 접속                  python
 3. ballast 목표 분포 테이블 추출      python target ...
 4. 반올림 쿼터 재현(쌍둥이 증명)      python quota ...
 5. 주입 경로 특정                     python inject ...

주의: 랩은 격리 샌드박스다. 저작된 골격의 빈칸(k=v)만 채워 실행하며
      게임 소유 인메모리 테이블만 계산한다. 외부 접근 기능 자체가 없다.`),
  'lab_readme.txt': F(`[FIRMWARE-LAB 사용 안내]
- 개요:  python                       데이터셋·템플릿 목록
- 골격:  python <템플릿>              빈칸(«») 확인
- 실행:  python <템플릿> k=v ...      빈칸을 채워 결정적 실행
- 예:    python quota total=33280
산출물이 화면에 떠야 단서로 확보된다. 막히면 hint.

팁: quota 재현은 '같은 총계'가 열쇠다. Ch7 에서 본 쌍둥이 개표구의
    공표 총계(예: 제3·11개표구)를 total 에 넣어 보라.`),
  evidence: D({
    'custody.txt': F(`[체인 오브 커스터디 — TB-11 유닛]
압수: 법원 영장 HS-2026-형-0442 · 봉인번호 SEAL-TB11-0031
이미징: 쓰기방지 장치 경유 sha256 획득 (원본 무변경 · 해시 기록 보존)
반입: AEGIS 포렌식 랩 · 열람 권한 = 본 사건 분석관 한정
비고: 유닛 6대 중 1대만 확보. 나머지는 "정기 초기화 대상"으로 이미 소거됨.`),
    'disasm_note.txt': F(`(역어셈블 메모 — 서준)
blst-0.9.4 는 mod_tally_agg(집계) 후단에 후킹돼 있다.
집계가 끝난 값을 받아, 내장 테이블의 '목표'로 덮어쓴 뒤 리포트로 넘긴다.
핵심은 두 가지 —
 · 목표 분포 테이블 (규모대별 하드코딩)          → python target
 · 그 목표를 정수 쿼터로 굳혀 개표구에 적용        → python quota
세지 않는다. 맞춘다. 그게 이 코드의 전부다.`),
    'supply_note.txt': F(`(공급 사슬 메모 — 서준)
펌웨어는 Suncrest 빌드 서버에서 서명(SC-ROOT-01)돼 나온다.
그런데 TB 유닛들은 그 서명본을 '인증 패치 미러'를 거쳐 받았다.
미러 = cert-mirror-2. 정규 채널(suncrest-cert)이 아니다.
서명이 끊긴 지점이 곧 주입 지점이다.                → python inject`),
    'mirror_reg.txt': F(`[패치 미러 등록 대장 발췌 — 허구 데이터]
채널        등록일         승인 검수확인서   서명자
suncrest-cert  (정규)       —              —
cert-mirror-2  2026-09-28   CERT-9917       (가림 · 판독 불가)

주의: cert-mirror-2 는 시범사업 기간에만 한시 등록됐다.
      승인 검수확인서 CERT-9917 의 서명자가 가려져 있다 — 인증 사슬의 끝.`),
  }),
});
