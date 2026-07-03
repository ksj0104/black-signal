# BLACK SIGNAL — 개발 계획 (v0.4 기준 재설계)

원본 브리프("Project Brief: Browser-Based 2D Pixel-Art Cybersecurity Investigation Game")를
기준으로, 현재 구현 상태를 진단하고 남은 캠페인(Ch.3~6 + 엔딩)까지의 단계·작업 단위·
검증 계획을 재정의한 문서. 갱신일: 2026-07-02.

> **스토리·퍼즐 전체 설계(프롤로그~6챕터·에필로그·4엔딩)는 [DESIGN.md](DESIGN.md) 참조.**
> 이 문서(PLAN)는 엔지니어링 작업 단위·검증을, DESIGN 은 서사·퍼즐·정답 데이터를 다룬다.

---

## 1. 비전 요약 (불변)

- 사이버 누아르 수사 어드벤처. 보이스피싱 피해(부모님)에서 시작해 금융 커글로머릿
  Orbis Vale Capital 의 음모를 **증거·내부고발·법적 폭로**로 무너뜨린다.
- 모든 해킹·수사 활동은 **허구 데이터 위 시뮬레이션**. 실제 공격 기능·외부 네트워크·
  호스트 셸 접근은 절대 구현하지 않는다 (브리프 §3의 금지 목록 준수).
- 4대 스탯(증거 신뢰도 / 공적 신뢰 / 널웨이브 신뢰 / 가족 유대)이 분기와 엔딩 4종을 결정.
- 데스크톱 브라우저 우선, 백엔드 없음, localStorage 저장.

## 2. 확정된 설계 결정 (브리프와 다른 점)

| 브리프 | 확정 결정 | 근거 |
| --- | --- | --- |
| `submit` 명령으로 정답 제출 | **submit 없음.** 결정적 증거가 터미널 출력에 드러나면 자동 확보 + 대화 패널로 서준의 독백 알림. 집계형 단서는 올바른 파이프라인 산출물이 떠야만 확보 | 사용자 결정 (2026-07-02). "수집 → 보드 연결 → 사건 파일 생성" 단일 전진 행동이 더 자연스러움 |
| React Router | 미사용 — 화면은 스토어 `screen` 필드로 구동 | 저장/복원 일관성 (README 기록) |
| 네트워크 지도 = 시각적 맵 | v0.4는 터미널 ASCII 렌더(`map`). 시각화 업그레이드는 폴리시 단계 선택 항목 | 터미널 중심 아이덴티티와 부합, 조기 비용 절감 |
| 난이도 다단계 | 힌트 3단계(숙련도 −5)로 대체. 별도 난이도 옵션은 보류 | 서사 진행이 퍼즐에 막히지 않게 하는 목적은 동일 |

## 3. 현재 상태 진단 (v0.4)

### 완료 (플레이 가능)
- **프롤로그 + Ch.1 EchoGate + Ch.2 The Unlisted Number** — 전 퍼즐 체인·보드·피날레 분기.
- **엔진**: 가상 FS + 사건 범위 가드, 파이프라인 터미널(19개 명령), Tab 자동완성,
  ↑/↓ 기록, 출력 스캔 단서 자동 확보, 대화 큐, 힌트 3단계, 저장 v3.
- **시스템**: 증거 보드(드래그+연결+추론), `map`(지도/관계 그래프/타임라인), 미션 카드
  사이드바, 스탯 4종 + 스토리 이벤트(엄마 문자·NW 접촉 등), 스페이스/Enter 대화 진행.
- **표현**: Phaser 아파트 씬(320×180), CRT/네온 테마, 접근성(글자 크기·고대비·모션 축소),
  WebAudio 생성음. Vitest 64 tests + Playwright 스캐폴드.

### 미구현 (브리프 갭)
| 항목 | 브리프 위치 | 계획 |
| --- | --- | --- |
| Ch.3 Ghost Ledger — `query` DB 포렌식 콘솔 | §7, §9.5 | WU-1 |
| Ch.4 The Offer — `python` 분석 랩 + 유출 4지선다 | §7, §9.6 | WU-2 |
| Ch.5 The Closed Circuit — CCTV 증거 리뷰 | §7, §9.7 | WU-3 |
| Ch.6 Black Signal — 증거 패키지 조립 + 엔딩 4종 + 에필로그 | §7 | WU-4 |
| 챕터 추가 비용 절감(레지스트리 일반화) | §15 "data-driven" | WU-0 |
| 로케이션 씬 확장(부모님 집·SOC·지하철 등 10곳) | §11 | WU-5 |
| 오디오 채널 분리(음악/효과), 표시 이름 선택 | §12, §4 | WU-5 |
| e2e 시나리오·브라우저 호환·밸런스 | §16 M5 | WU-6 |

## 4. 마일스톤 재정의

브리프의 M1(수직 슬라이스)·M2(코어 시스템)는 **완료**. 남은 단계:

- **M3 — 캠페인 완성** (WU-0 → WU-1 → WU-2 → WU-3 → WU-4)
  챕터마다 신규 시스템 1개 이상: query(3), python(4), CCTV(5), 패키지 조립+엔딩(6).
- **M4 — 폴리시** (WU-5): 씬·오디오·UI·반응형·(선택) 넷맵 시각화.
- **M5 — QA** (WU-6): e2e·호환성·밸런스·콘솔 에러 0·빌드 검증.

## 5. 작업 단위 (Work Units)

### WU-0. 챕터 프레임워크 일반화 — 규모 S~M ✅ **완료 (2026-07-02)**
새 챕터를 "데이터 추가만으로" 붙일 수 있게 하드코딩 제거.
- ✅ `ChapterId = number`, 실사용 id 는 `CHAPTER_IDS`(레지스트리 파생)로. `objInit`/
  `linksInit`/`perChapter()` 가 `CHAPTER_IDS` 순회로 초기화.
- ✅ `startChapter1/2` → `startChapter(id)`, `finishPrologue/Ch1/Ch2` → `finishChapter(id)`.
- ✅ `CasePane`·`EndScreen` 전면 데이터 구동 (`caseSummary`·`ending` 필드 신설). `Sidebar`·
  `MenuScreen`(이어하기)·`Workstation`(오프닝) 챕터 하드코딩 제거.
- ✅ 피날레(`finale`)·오프닝(`opening`/`openedFlag`)·스토리 이벤트(`events`)·파일시스템
  (`fs`) 전부 `ChapterDef` 데이터로. `ROOT_FS` 는 `CHAPTERS` 에서 조립. `momMessage`/
  `nwContact`/`ch2Family` 및 EvidenceBoard/store 의 챕터 분기 제거.
- ✅ 세이브 v3 호환 유지(플래그명 `doneFlag` 로 데이터화). 검증: 73 tests 그린(+9
  프레임워크 회귀), lint·build 클린.

**결과 — 새 챕터 추가 시 수정 범위:**
- 기존 메커니즘만 쓰는 챕터: `content/` 만 (filesystems + dialogues + chapters.ts 항목 1개).
  store·컴포넌트·types 무수정.
- 신규 도구(query/python/CCTV) 챕터: 위 + `engine/` 신규 모듈 + store `runCommand` 의
  명령 주입 1곳. (도구별 해금 배선은 각 WU 고유 작업)

### WU-1. Chapter 3 "Ghost Ledger" — 규모 L ✅ **완료 (2026-07-02)**
법원 인가 포렌식 DB 사본에서 "Distress Conversion Index"를 발견하는 챕터.
- ✅ **엔진** [engine/query/query.ts]: 읽기 전용 SQL 서브셋 자체 파서·평가기
  (SELECT/FROM/WHERE/AND·OR/LIKE/IN/JOIN...ON/GROUP BY/ORDER BY/LIMIT + COUNT/SUM/
  AVG/MIN/MAX). DELETE/UPDATE/DROP/ALTER/INSERT 등은 토큰화 단계 거부. CJK 폭 인지
  테이블 포매터 + 스키마 출력.
- ✅ **콘텐츠** [content/databases/ghostledger.ts, filesystems/ghostledger.ts]:
  transactions·shell_companies·risk_scores·payment_routes·executive_messages.
  발견: NL-ESCROW 최대 수취(8,200만) → 모법인 사다리 → Greyfox(오르비스 자회사) →
  DCI 모델 → 미러콜 인프라(echo-relay-03) 재사용.
- ✅ **배선**: `ChapterDef.db` 신설 → query 는 `CHAPTERS[ch].db` 로 해금. query 출력도
  `runScan` 경유(집계 결과 자동 확보). 6목표·6연결 보드·오프닝/DCI 이벤트/피날레 분기.
- ✅ 검증: query 단위 25 + 진행 시뮬레이션 7, 총 110 tests 그린. lint·build 클린.
  변경 파일: `content/`(신규 3) + `engine/query/`(신규) + store 배선 1곳 + types `db` 필드.

### WU-2. Chapter 4 "The Offer" — 규모 L ✅ **완료 (2026-07-03)**
널웨이브의 미검증 아카이브와 이지스의 수사 중단 압박 사이의 선택.
- ✅ **엔진** [engine/pylab/pylab.ts]: "조건식 빈칸 채우기" 템플릿 평가기(권장안 채택).
  사용자 코드 실행·eval 없음 — 저작된 골격의 빈칸만 `k=v` 로 채워 결정적 실행, 게임 소유
  인메모리 Table(허구)만 계산. os/subprocess/socket/파일/네트워크 API 부재. `labOverview`
  (개요)·`templateView`(골격)·`runTemplate`(검증 후 실행). 출력은 `runScan` 경유 자동 확보.
- ✅ **콘텐츠** [content/datasets/theoffer.ts, filesystems/theoffer.ts]: 6데이터셋
  (deal_pipeline·access_logs·exec_approvals·archive_ledger·court_reference·shell_registry),
  템플릿 4종(reuse/approve/verify/summary). 오염 3행(개설 전 거래·금액 변조·유령 셸)을
  `verify rule=all` 로 색출 → `ch4Verify` 플래그. 6목표·6연결 보드·오프닝/갈등/윤가원 이벤트/피날레.
- ✅ **배선**: `ChapterDef.pylab` 신설 → python 은 `CHAPTERS[ch].pylab` 로 해금. 유출 결정
  4분기(now/verify/channel/reject)가 스탯을 크게 움직임 — 엔딩 조건의 핵심 입력.
- ✅ 검증: pylab 단위 10 + 진행 시뮬레이션(챕터4) 7, 총 154 tests 그린. lint·build 클린,
  브라우저 전체 루프(랩 분석→보드 6연결→윤가원 설득→검증 후 공개→엔딩) 실플레이 검증.
  변경: `content/`(신규 2) + `engine/pylab/`(신규) + store 배선 1곳 + types `pylab` 필드.

### WU-3. Chapter 5 "The Closed Circuit" — 규모 L ✅ **완료 (2026-07-03)**
사라진 목격자의 경로를 CCTV 아카이브로 재구성.
- ✅ **엔진** [engine/cctv/cctv.ts]: 카메라 피드 = 데이터(프레임 이벤트 + 클록 오프셋 +
  메타). 앵커 이벤트 대조 시계 보정(`sync`, 오답 시 잔존 오차 피드백 → 정합 시 마스터
  타임라인), 타임코드 점프 vs 프레임 카운터 편집 봉합 적발(`gaps`), NTP 배지 로그
  대조(`badge`, 보정 선행 게이트), 경로 재구성(`route`), 편집 서명(`meta`). 전부 순수
  함수 — 실시간 카메라·원격 접속 없음.
- ✅ **UI** [components/os/apps/CctvApp.tsx]: AEGIS OS "CCTV REVIEW" 창 — 카메라 탭(보정
  상태 배지) + 코드 렌더 픽셀 스틸(캔버스: 노이즈·스캔라인·비네트·타임스탬프·인물 실루엣)
  + 이벤트 스크러버 + 메타 패널. 시각 보조 전용, 확보는 터미널 `cctv` 의 runScan 경유.
- ✅ **콘텐츠** [content/cctv/closedcircuit.ts, filesystems/closedcircuit.ts]: 4캠(드리프트
  +47s/−02:15) · 결손 02:18 · 배지 SEC-CERITON-04(도경식) · 서명 ceriton-mux. 6목표·6연결
  보드 · 오프닝 dlgCh5Open(ch4Leak 변주) · 각서 이벤트(route→ch5RouteDone) · 피날레
  ch5Choice(protect/hide/family — Ending D witnessSaved 입력).
- ✅ 검증: cctv 단위 13 + 진행 시뮬레이션(챕터5) 7, 총 180 tests 그린. lint·build 클린,
  브라우저 전체 루프(보정→결손→배지→경로→보드 6연결→신변보호→엔딩) 실플레이 검증.
  변경: `content/`(신규 2) + `engine/cctv/`(신규) + `components/os/apps/CctvApp` +
  store 배선 1곳 + types `cctv` 필드 + uiStore/Taskbar 창 1종.

### WU-4. Chapter 6 "Black Signal" + 엔딩 — 규모 L ✅ **완료 (2026-07-03) — 캠페인 완결**
- ✅ **증거 패키지 조립** [engine/pkg/pkg.ts, content/pkg/blacksignal.ts]: 8개 카테고리 ×
  검증도. 오배치는 근거와 함께 거부, 미검증 트랩 2종(오염 원본·익명 녹취)은 배치 가능하나
  경고 + 품질 하락. `pkg add/remove/seal` — seal 이 `ch6CleanPackage`·`ch6WitnessEvidence`
  파생 플래그를 산출(엔딩 입력).
- ✅ **최종장 데이터** [content/filesystems/blacksignal.ts]: 종합 브리핑 + 종이 장부 스캔
  (base64 — 프롤로그 기법 회귀, 전결 서명 강윤재) + 부인 캠페인 문건. 전 도구 개방
  (db·pylab·cctv 재부착)으로 교차 검증 목표. 5목표 · 마스터 그래프 7노드/7연결 보드 ·
  오프닝 dlgCh6Open(ch5Choice 변주) · 설계자 특정 이벤트 · 피날레 ch6Release 4분기.
- ✅ **엔딩 4종** [engine/ending.ts, content/endings.ts]: 순수 함수 `resolveEnding(stats,
  flags)` — witnessSaved/evidenceClean/allyGaShin/recklessLeak 파생 후 D→A→B→C 우선순위
  판정(DESIGN §2). EndScreen `finalEnding` 분기가 엔딩 코드·본문·파생 배지·분기 에필로그
  렌더(allyGaShin 시 강윤재 기소 확정 변주).
- ✅ 검증: ending 단위 10 + pkg 단위 8 + 진행 시뮬레이션(챕터6) 5, 총 209 tests 그린.
  lint·build 클린. 브라우저 실플레이: 조립→교차 검증→종이 장부→봉인→마스터 그래프
  7연결→정식 이관→**ENDING D "Signal Returned"** 도달 확인(배지 3종 + 에필로그).

### WU-5. 폴리시 — 규모 M ✅ **핵심 완료 (2026-07-03)**
- ✅ 로케이션 씬 4종(아파트 리모델링·부모님 집·SOC·승강장) — UI 재설계 P3 에서 선반영.
- ✅ 오디오 채널 분리 [engine/audio]: 효과음(fxBus)/배경음(ambBus) 버스 분리, 설정에
  효과음·배경음 슬라이더. 빗소리 앰비언트는 배경음 채널로 라우팅.
- ✅ 표시 이름 선택 [engine/persona.ts]: 설정 텍스트 입력(기본 "서준", 마크업 문자 정제).
  콘텐츠 데이터는 캐논 이름을 유지하고 대화 오버레이·SIGNAL 메신저·엔딩 표시층에서만
  치환. 세이브 v3 호환(cfg 병합).
- ✅ 반응형/태블릿: 좁은 화면(<720px)은 창을 세로 스택으로 기본 배치(defaultLayout 분기 +
  단위 테스트), 태블릿 세로(820×1180)·소형 랜드스케이프(1024×600)·640px 스택 배치를
  브라우저 스크린샷으로 검증.
- 잔여(선택): 넷맵 시각화 업그레이드 (v0.4 결정 — 터미널 ASCII 유지가 아이덴티티에 부합).

### WU-6. QA — 규모 M ✅ **핵심 완료 (2026-07-03)**
- ✅ Playwright e2e [e2e/smoke.spec.ts]: 메뉴→인트로→씬 스모크 + **프롤로그 완주**
  (수사 4명령→보드 5연결→피날레→종결 보고→저장→새로고침→이어하기). 모션 줄이기
  설정으로 결정적 실행.
- ✅ 브라우저 호환 매트릭스: chromium/firefox/webkit 3 프로젝트 × 2 스펙 = **6 passed**
  (프롤로그 완주 포함 · playwright.config projects).
- ✅ 4엔딩 스모크 + 밸런스 패스 [tests/campaign.test.ts]: 프롤로그~최종장을 실제
  runCommand/attemptLink 경로로 4회 완주 — 선택 조합별로 A/B/C/D 각각 실도달 검증
  (D 의 family≥55, B 의 nullwave≥55 임계 포함).
- ✅ 콘솔 에러 0(favicon 인라인 SVG), README 최종화.

## 6. 챕터 공통 작업 리듬 (WU-1~4 내부 순서)

1. `content/filesystems/`(또는 db/cctv 데이터) — 허구 증거 저작 (스포일러 오발 검사 포함)
2. 신규 엔진 모듈 (`engine/` 이하, 순수 로직 — 단위 테스트 우선)
3. `content/chapters.ts` 챕터 정의 (목표/힌트/scan/findings/보드/피날레)
4. 스토어 배선 (명령 해금, 이벤트 트리거)
5. UI (신규 패널 컴포넌트, 기존 아이덴티티 유지)
6. `content/dialogues/` 오프닝·이벤트·피날레
7. 테스트 (데이터 무결성 + 전체 진행 시뮬레이션) → lint → build
8. README/PLAN 갱신

**공통 완료 기준**: `npm test`/`lint`/`build` 그린, 신규 명령·데이터에 실제 공격 기능
없음(안전 경계 재확인), 이전 세이브 로드 시 크래시 없음.

## 7. 다음 작업

> **전 마일스톤(M3 캠페인 / M4 폴리시 / M5 QA) 완료 — v1.0 캠페인 완결.**
> 남은 것은 진짜 선택 항목뿐: 넷맵 시각화 업그레이드(터미널 ASCII 유지가 기본 결정) ·
> 플레이 데이터 기반 밸런스 튜닝 · 신규 콘텐츠(사이드 케이스 · 속편 훅 "새 좌표").
