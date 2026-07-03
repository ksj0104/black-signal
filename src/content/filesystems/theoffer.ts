import { D, F, VNode } from '../../engine/vfs/vfs';

/** Chapter 4 — NW 가 건넨 봉인 아카이브 사본 + 격리 랩 문서 (전부 허구 데이터) */
export const THEOFFER_FS: VNode = D({
  'briefing.txt': F(`[AEGIS RESPONSE — 사건 AR-2026-0815 "THE OFFER"]  ※ 비공식 · 개인 보전 사본
상태: 경영진 '전면 보류' 지시 — 본 분석은 서준 개인 워크스테이션의 격리 랩에서 수행
대상: Orbis Vale 내부 봉인 아카이브 (출처: NW · 무결성 미검증 · 읽기 전용 사본)

배경
 회사는 멈추라 하고, 지하는 태우라 한다.
 이 아카이브가 진짜라면 — 피해자 신원이 "딜"로 재사용된 내부 증거다.
 진짜가 아니라면 — 우리를 통째로 무너뜨릴 덫이다. 답은 검증뿐이다.

목표
 1. 브리핑 확인                       cat briefing.txt
 2. 격리 분석 랩 접속                  python
 3. 피해자 신원 재사용 탐지            python reuse ...
 4. 임원 승인 상관 분석                python approve ...
 5. 아카이브 무결성 검증               python verify ...
 6. 증거 요약 생성                     python summary ...

주의: 랩은 격리 샌드박스다. 저작된 골격의 빈칸(k=v)만 채워 실행하며
      게임 소유 인메모리 테이블만 계산한다. 외부 접근 기능 자체가 없다.`),
  'lab_readme.txt': F(`[ANALYSIS-LAB 사용 안내]
- 개요:  python                       데이터셋·템플릿 목록
- 골격:  python <템플릿>              빈칸(«») 확인
- 실행:  python <템플릿> k=v ...      빈칸을 채워 결정적 실행
- 예:    python verify rule=date
산출물이 화면에 떠야 단서로 확보된다. 막히면 hint.`),
  archive: D({
    'manifest.txt': F(`[SEALED ARCHIVE — 전달 매니페스트]
구성: deal_pipeline(8) · access_logs(7) · exec_approvals(3)
      · archive_ledger(8) · court_reference(8) · shell_registry(5)
해시: 전달본 sha256 기록 보존 (원본 대조용)
경고: 전달자 스스로 "불완전하며 오염 가능"을 고지함. 검증 전 인용 금지.`),
  }),
  notes: D({
    'zero_note.txt': F(`(동봉 메모 — 발신 서명 ZERO)
"우리가 가진 것 전부다. 우리가 심은 건 없다 —
 그러나 그들이 심어 뒀을 수는 있다.
 빠르게 쓰고 싶다면 플레어에게, 오래 쓰고 싶다면 나에게.
 검증은 언제나 너의 몫."`),
    'aegis_hold_order.txt': F(`[사내 공지 사본 — 한나 전달]
제목: 특정 사안 관련 대외 활동 전면 보류
발신: 경영지원실 (법률 고문단 검토)
본문: 최근 진행 중인 OO 사안 관련 일체의 분석·보고·대외 공유를
      추후 공지 시까지 보류한다. 위반 시 인사 규정에 따른다.
(한나의 메모: "시간은 내가 번다. 네 선은 네가 지켜. — H")`),
    'gawon_profile.txt': F(`(분석관 메모 — 서준)
윤가원 — Greyfox Analytics 수석 리스크 애널리스트. DCI 모델 설계.
공개 이력: 신용리스크 논문 3편 · 금융보안 컨퍼런스 발표.
특이점: 결재 라인에는 없다. 모델을 만들었지만, 쓰임새를 결정한 적은 없다.
접근한다면 — 증거로 설득할 것인가, 서명으로 압박할 것인가.`),
  }),
});
