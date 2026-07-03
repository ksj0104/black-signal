# BLACK SIGNAL — UI/UX 전면 재설계 (v1 "AEGIS OS")

갱신일: 2026-07-02. 사용자 결정: "그래픽·UX/UI·폰트를 기존 구현에 얽매이지 말고
재설계해 실제 게임처럼 자연스럽게 동작하게 할 것."

## 0. 확정 결정

| 항목 | 결정 |
| --- | --- |
| 비주얼 컨셉 | **하이브리드** — 서사 구간은 픽셀아트 씬, 수사 구간은 "가상 OS 데스크톱" |
| 폰트 | 오픈소스 번들 (npm): **Pretendard**(UI) · **D2Coding**(터미널/데이터) · **Galmuri**(픽셀/타이틀) |
| 픽셀 씬 | 씬 프레임워크 + 핵심 씬 단계 확장 (아파트 리모델링 → 부모님 집·SOC·역사) |
| 엔진 | vfs/terminal/query/save/스토어 로직은 유지 — **표현 계층만 전면 교체** |

## 1. 컨셉 — "AEGIS Field Workstation OS"

게임의 수사 파트 전체가 서준의 포렌식 워크스테이션 OS가 된다.
플레이어는 탭을 누르는 게 아니라 **앱 창을 열고, 끌고, 배치한다**.

- **부팅/로그인**: 새 세션 첫 진입 시 짧은 부트 시퀀스(스킵 가능) → 데스크톱.
- **창(Window)**: 터미널 / 증거 보드 / 케이스 파일 / 메신저 / 미션. 드래그 이동,
  포커스 z-순서, 최소화, 닫기. 태스크바(하단)에서 복원.
- **메신저(SIGNAL)**: 워크스테이션에서의 대화(한나·NW·엄마 문자)는 전부 채팅 앱으로
  수신. 선택지는 말풍선 버튼. 씬/엔딩 화면의 대화는 기존처럼 시네마틱 자막 오버레이.
- **알림 센터**: 단서 확보·목표 달성은 우상단 슬라이드 알림 카드(+생성음).
- **상태 표시줄**: 케이스 코드, 시계(게임 내 날짜), 스탯 요약 아이콘.

## 2. 디자인 시스템

### 색 (누아르 팔레트 유지, 계층 재정의)
- 바탕 `#05070d` → 데스크톱 월페이퍼(미묘한 노이즈+비 스트릭 그라디언트).
- 패널 `#0b0f1acc`(반투명+blur) — 창 배경. 포커스 창은 테두리 `--phos`, 비포커스는 `--line`.
- 액센트: phos `#7ee0c8`(시스템/성공) · amber `#e8b54a`(경고/인물) · violet `#b48cff`(조직/NW)
  · alert `#e0637a`(오류). 기존 의미 체계 유지.

### 타이포그래피
- 타이틀/로고: **Galmuri11** (픽셀 감성, letter-spacing 넓게)
- UI 본문/버튼/메신저: **Pretendard** (17px 기준, 1.6 행간)
- 터미널/데이터/코드: **D2Coding** (한글 폭 2:1 고정 — 기존 CJK 표 포매터와 호환)
- 폰트 크기 설정(접근성)은 root `--fs` 스케일 유지.

### 모션
- 창 열기/닫기 120ms scale+fade, 알림 슬라이드 240ms, 부트 타이핑 효과.
- `prefers-reduced-motion`/설정 시 전부 무효 (기존 body.rm 패턴 유지).

## 3. 아키텍처

```
src/
  styles/            tokens.css(변수·리셋) + os.css(데스크톱) + scene.css + menu.css
  state/uiStore.ts   창 관리(열림/위치/z/최소화) · 알림 큐 · 부트 상태 (비저장 휘발)
  components/os/     Desktop, WindowFrame, Taskbar, StatusBar, BootScreen,
                     NotificationStack, apps/ (TerminalApp, BoardApp, CaseApp,
                     MessengerApp, MissionApp)
  components/scene/  씬 프레임워크(데이터 구동 핫스팟) + 시네마틱 대화 오버레이
```

- `gameStore` 공개 API(runCommand/complete/attemptLink/…)는 그대로.
  `dialogue`는 화면에 따라 메신저(work) 또는 자막 오버레이(scene/end)로 라우팅.
- 창 상태는 저장하지 않는다(세션 휘발). 기본 레이아웃: 터미널(좌 60%),
  미션(우 상단), 메신저는 수신 시 자동 오픈.

## 4. 화면 플로우

메뉴(재설계: 풀블리드 타이틀 + 비 이펙트) → 인트로(필름 슬라이드) →
픽셀 씬(챕터 서사) → **AEGIS OS**(수사) → 챕터 엔딩(케이스 클로즈 리포트 연출) → 반복.

## 5. 단계 (구현 순서)

1. ✅ **P1 — 디자인 시스템 + OS 셸** (2026-07-02 완료): 폰트 번들(필요 woff2 만
   `styles/fonts.css` 로 선별 — dist 비대화 방지), tokens(global.css)/os.css,
   WindowFrame/Taskbar/StatusBar/NotificationStack/BootScreen. 터미널·보드·케이스 창 이식.
2. ✅ **P2 — 앱 완성** (2026-07-02 완료): SIGNAL 메신저(work 화면 대화 자동 라우팅·
   자동 재생·선택지 대기·세션 로그), 미션 앱, 메뉴/인트로/엔딩 재설계.
   프롤로그 전체 루프(메뉴→인트로→씬→OS→보드→피날레→엔딩) 브라우저 검증 완료.
3. ✅ **P3 — 씬** (2026-07-03 완료): 씬 프레임워크 데이터화
   (`content/scenes.ts` SceneDef/HotspotDef + `sceneForChapter`, 제네릭 `PixelScene`
   + 씬별 페인터 `game/phaser/art/`), 아파트 고밀도 리모델링(조명 콘·책장·서버랙·
   3중 스카이라인), 신규 씬 3종 — 부모님 집(Ch2)·이지스 SOC(Ch3)·심야 승강장(Ch4+
   게이트) + 씬별 플레이버 대화. 4개 씬 브라우저 렌더/핫스팟 검증 완료.
   부수 수정: Ch1+ 에서 프롤로그 핫스팟이 그대로 노출되던 연속성 버그 해소,
   인라인 SVG favicon 추가(404 제거).

## 6. 완료 기준

- `npm test` 전부 그린(엔진 회귀 없음) + 신규 uiStore/윈도우 로직 단위 테스트.
- `npm run lint` / `npm run build` 클린.
- 키보드: 창 포커스 순환, 메신저 선택지 Enter, 기존 접근성 설정(글자/고대비/모션) 동작.
- 외부 네트워크 요청 0 (폰트는 로컬 번들 self-host).
