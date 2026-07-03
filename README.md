# BLACK SIGNAL — The Echo Protocol

2D 사이버 누아르 수사 어드벤처. 화이트햇 해커 **서준**이 부모님을 노린 보이스피싱 조직
"미러콜"의 흔적을 따라가는 브라우저 게임입니다.

> 모든 해킹·수사 활동은 **허구의 데이터 위에서만 동작하는 시뮬레이션**입니다.
> 실제 공격 도구·네트워크 기능·실존 인물/기관과 무관합니다.

**현재 빌드 (v1.0) — 캠페인 완결:** 프롤로그부터 최종장까지 전 7개 사건 플레이 가능 —
프롤로그 "걸려오지 않은 전화" · Ch1 "EchoGate" · Ch2 "The Unlisted Number" ·
Ch3 "Ghost Ledger" · Ch4 "The Offer" · Ch5 "The Closed Circuit" · **Ch6 "Black Signal"**.
v1.0 에서 최종장 추가 — `pkg` 증거 패키지 조립(8개 법적 카테고리 × 검증도),
종이 장부로 설계자 특정, 공개 전략 4분기, 그리고 스탯·선택 누적으로 결정되는
**엔딩 4종 + 에필로그** (The Clean Record / The Leak / The Silence Protocol /
Signal Returned). 수사 파트는 창 기반 가상 데스크톱 **"AEGIS OS"** 로 동작하며
(부트 · 창 관리 · SIGNAL 메신저 · CCTV REVIEW), 픽셀 씬은 챕터별 로케이션으로
전환됩니다. 상세 설계: [docs/UI-REDESIGN.md](docs/UI-REDESIGN.md)

---

## 실행 방법

```bash
npm install
npm run dev        # 개발 서버 (http://localhost:5173)
npm run build      # 타입체크 + 프로덕션 빌드 → dist/
npm run preview    # 빌드 결과 로컬 서빙
npm test           # Vitest 단위/통합 테스트
npm run lint       # ESLint
npm run format     # Prettier
npm run test:e2e   # Playwright 스모크 테스트 (아래 참고)
```

Playwright는 최초 1회 브라우저 설치가 필요합니다: `npx playwright install chromium`

## 기술 스택

| 역할 | 선택 |
| --- | --- |
| 빌드 | Vite 6 + TypeScript (strict) |
| UI | React 18 — 가상 OS 데스크톱 (창 관리 uiStore + WindowFrame) |
| 폰트 | Pretendard(UI) · D2Coding(터미널) · Galmuri11(타이틀) — 전부 로컬 번들, 외부 요청 없음 |
| 픽셀아트 씬 | Phaser 3 (CANVAS, 320×180, 코드로 그리는 원본 아트) |
| 상태 | Zustand (단일 스토어, 화면 라우팅 포함) |
| 저장 | localStorage (`blacksignal.save.v3`) |
| 테스트 | Vitest(단위·통합) + Playwright(e2e 스캐폴드) |
| 품질 | ESLint(flat) + Prettier |
| 오디오 | WebAudio 생성음만 사용 (저작권 에셋 없음) |

**React Router 미사용:** 화면(메뉴/인트로/씬/워크스테이션/엔딩)은 게임 상태의 일부라
URL 라우팅보다 스토어의 `screen` 필드로 구동하는 편이 저장/복원과 일관됩니다.
(브리프의 "필요 시 도입" 조건에 따라 보류)

## 폴더 구조

```
src/
  app/App.tsx            # 화면 전환 + 설정 사이드이펙트(글자크기/고대비/모션/오디오)
  engine/                # 게임과 무관한 재사용 계층 (전부 순수 로직 → 테스트 대상)
    vfs/                 #   가상 파일시스템 + 사건 범위 가드
    terminal/            #   명령 레지스트리 + 파이프라인 실행기 (grep|cut|sort|uniq…)
    save/  audio/        #   localStorage 저장 · WebAudio 생성음
  content/               # 데이터 구동 콘텐츠 — 코드 수정 없이 챕터 추가 가능
    chapters.ts          #   목표·힌트 3단계·출력 스캔(단서 자동 확보)·증거 보드 정의
    filesystems/         #   챕터별 허구 증거 파일 트리
    dialogues/  intro.ts #   대화 비트(선택지 → 스탯 효과) · 인트로 슬라이드
  state/gameStore.ts     # Zustand 스토어: 진행/스탯/터미널 버퍼/보드/저장·로드
  game/                  # Phaser 씬(아파트) + React 호스트
  components/            # 화면·위젯 (터미널, 증거 보드, 사이드바, 대화 오버레이…)
  tests/                 # Vitest — 파이프라인·가드·단서 판정·전체 진행 시뮬레이션
```

## 구현된 시스템

- **시뮬레이션 터미널** — `pwd ls cd cat less head tail grep sort uniq cut find file
  strings base64 tr xxd history clear help man` + 게임 명령 `hint case save`.
  파이프(`|`) 지원, 사건 범위 밖 접근 차단(스포일러 방지).
  Tab 자동완성(명령어·파일·디렉토리, 사건 범위 내), ↑/↓ 명령 기록, 출력 하단 자동 스크롤.
- **단서 자동 확보** — 정답을 타이핑해 제출하는 명령 없음. 결정적 증거가 터미널 출력에
  드러나는 순간 자동 수집되며, 확보 즉시 대화 패널에 서준의 독백으로 어떤 데이터를
  얻었는지 알려준다(여러 건 동시 확보 시 순차 큐). 집계형 단서는 올바른 파이프라인
  산출물이 화면에 떠야만 확보된다. 전 단서 확보 → 증거 보드 연결 완성 →
  "사건 파일 생성" 한 번의 행동으로 다음 스테이지로 넘어간다.
- **네트워크 지도 (`map`, 챕터 2 해금)** — `map`(토폴로지)·`map graph`(관계 그래프)·
  `map timeline`(타임라인 재구성). 확보한 목표에 따라 지도가 점진적으로 채워지고,
  타임라인 재구성 자체가 챕터 2의 마지막 수사 목표.
- **DB 포렌식 콘솔 (`query`, 챕터 3 해금)** — 읽기 전용 SQL 서브셋 자체 파서·평가기
  (`SELECT/FROM/WHERE/AND·OR/LIKE/IN/JOIN...ON/GROUP BY/ORDER BY/LIMIT`,
  집계 `COUNT/SUM/AVG/MIN/MAX`). 인메모리 정적 테이블(허구)만 조회하며
  `DELETE/UPDATE/DROP/ALTER/INSERT` 등 변경 구문은 토큰화 단계에서 거부. 인자 없이
  `query` 실행 시 스키마 표시.
- **격리 분석 랩 (`python`, 챕터 4 해금)** — 실제 파이썬이 아닌 "조건식 빈칸 채우기"
  템플릿 평가기. 저작된 분석 골격의 빈칸만 `k=v` 로 채워 실행하며(사용자 코드 실행·eval
  없음), 게임 소유 인메모리 테이블(허구)만 계산한다. os/subprocess/socket/파일/네트워크
  API 는 존재 자체가 없다. `python`(개요)·`python <템플릿>`(골격)·`python <템플릿> k=v`(실행).
  봉인 아카이브의 신원 재사용·임원 승인 상관을 드러내고, **법원 사본 대조로 오염 3행을
  스스로 색출**해야 검증본이 무기가 된다.
- **CCTV 증거 리뷰 (`cctv`, 챕터 5 해금)** — 법원 인가 아카이브의 포렌식 열람(실시간
  카메라·원격 접속 없음, 전부 사전 저작 허구 데이터). 전 카메라 공통 "앵커 이벤트"로
  시계 오차를 산출해 `sync` 로 보정하고, 타임코드 점프 vs 프레임 카운터로 **편집 봉합을
  적발**(`gaps`), NTP 동기 배지 로그와 대조(`badge`)해 경로를 재구성(`route`)한다.
  AEGIS OS 의 **CCTV REVIEW 창**이 스틸(코드 렌더)·스크러버·메타를 시각적으로 보여준다.
- **증거 패키지 조립 (`pkg`, 최종장)** — 전 챕터 증거를 8개 법적 카테고리(인프라/세탁/
  자회사/브로커리지/타기팅/임원/목격자 억압/수혜)에 배치. 오배치는 근거와 함께 거부되고,
  **미검증 출처(오염 원본·익명 녹취)는 배치할 수 있지만 품질을 깎는다** — 검증본만으로
  8/8 을 봉인해야 `evidenceClean` 이 성립한다. 최종장은 query·python·cctv 전 도구가
  함께 열려 교차 검증까지 요구한다.
- **엔딩 4종 + 에필로그** — 결정적 순수 함수 `resolveEnding(stats, flags)` 가 스탯 4종과
  누적 선택(유출 방식·목격자 경로·패키지 품질·윤가원 협조)으로 판정: **D** Signal
  Returned(가족·목격자·무결 최상) → **A** The Clean Record(제도적 승리) → **B** The
  Leak(무모한 폭로의 대가) → **C** The Silence Protocol(속편형 침묵). 파생 배지
  (목격자 보호·체인 무결·협조 증언·무모한 공개)와 분기 에필로그가 함께 표시된다.
- **데이터 구동 챕터** — 목표/힌트(3단계, 사용 시 숙련도 −5)/단서 판정(출력 스캔)/파일
  트리거가 전부 `content/chapters.ts` 데이터. 새 챕터는 데이터 추가만으로 확장.
- **증거 보드** — 노드 드래그 배치 + 클릭 연결. 근거 있는 연결만 허용(사유 토스트),
  완성 시 추론 컷 → 챕터 피날레 분기 대화.
- **스토리 분기** — 스탯 4종(증거 신뢰도/공적 신뢰/널웨이브 신뢰/가족 유대),
  프롤로그 최종 선택이 챕터 1 오프닝 대사를 바꾸고, 이전 챕터 선택이 이후 오프닝·신뢰
  관계에 반영. Ch4 유출 결정 4분기(즉시 공개/검증 후 공개/한정 공유/거부)는 이후 엔딩
  조건의 핵심 입력이다.
- **데이터 구동 픽셀 씬** — 320×180 픽셀아트(비·네온 플리커·모니터 글로우)를 코드로 렌더.
  로케이션·핫스팟·캡션·플레이버 대화가 전부 `content/scenes.ts` 데이터이고, 챕터에 따라
  무대가 바뀐다(아파트 → 부모님 집 → SOC → 승강장). 핫스팟은 접근성 있는 DOM 버튼 오버레이.
- **미션 패널** — 목표는 터미널이 아닌 우측 MISSION 카드(케이스 코드·진행도·현재 목표 강조)에
  분리 표시. 터미널 출력은 명령 결과·시스템 로그만 담는다.
- **접근성/설정** — 글자 크기, 고대비, 모션 줄이기(`prefers-reduced-motion` 존중),
  **효과음/배경음 채널 분리 볼륨**·음소거, **표시 이름 선택**(기본 "서준" — 콘텐츠는 캐논
  이름을 유지하고 대화·메신저·엔딩 표시층에서만 치환), 키보드 조작(대화 Space·Enter,
  터미널 Tab 자동완성, 보드 노드 포커스+Enter). 페이지 전역 스크롤바 없음.

## 알려진 한계

- 넷맵은 터미널 ASCII 렌더 유지(v0.4 결정 — 터미널 아이덴티티 부합). 시각화 업그레이드는
  선택 항목으로 보류.
- Playwright 브라우저 바이너리는 저장소에 포함되지 않음 — `npx playwright install` 필요
  (e2e 는 Chromium·Firefox·WebKit 3종 프로젝트로 구성).
- 저장 데이터 버전은 v3 단일 지원(이전 프로토타입 세이브와 호환하지 않음).
- 데스크톱/태블릿 대상 (좁은 화면은 창 세로 스택 배치) — 폰 세로 화면은 지원 범위 밖.

## 로드맵

상세 설계·작업 단위·검증 계획: **[docs/PLAN.md](docs/PLAN.md)**

1. ~~**Ch.2 "The Unlisted Number"** — `map` 해금: 네트워크 지도·관계 그래프·타임라인 재구성~~ ✅ v0.4
2. ~~**WU-0 챕터 프레임워크 일반화** — 새 챕터를 content/ 데이터 추가만으로 확장~~ ✅
3. ~~**Ch.3 "Ghost Ledger"** — `query` DB 포렌식 (읽기 전용 SELECT 계열만), 자금 세탁 경로 추적~~ ✅ v0.5
4. ~~**Ch.4 "The Offer"** — `python` 분석 랩(격리 시뮬레이터), 유출 결정 4분기~~ ✅ v0.7
5. ~~**Ch.5 "The Closed Circuit"** — CCTV 증거 리뷰(타임라인·클록 드리프트·메타데이터)~~ ✅ v0.8
6. ~~**Ch.6 "Black Signal" + 에필로그** — 증거 패키지 조립, 스탯 기반 4개 엔딩~~ ✅ v1.0 **캠페인 완결**
7. ~~**폴리시 · QA** — 오디오 채널 분리, 표시 이름 선택, 반응형 스택 배치, e2e 프롤로그
   완주(Chromium·Firefox·WebKit), 4엔딩 스모크·밸런스~~ ✅ v1.0

**전 로드맵 완료** — 남은 것은 순수 선택 항목(넷맵 시각화·플레이 데이터 밸런스 튜닝)뿐입니다.
