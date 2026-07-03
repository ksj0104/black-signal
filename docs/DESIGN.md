# BLACK SIGNAL — 게임 설계서 (스토리 + 퍼즐)

전체 캠페인(프롤로그 + 6챕터 + 에필로그 + 엔딩 4종)의 서사·퍼즐·분기·정답 데이터를
확정하는 단일 설계 문서. 엔지니어링 계획·작업 단위는 [PLAN.md](PLAN.md) 참조.

- **상태 범례:** ✅ 구현됨(캐논 확정) · ✍️ 설계 완료(미구현) · 이 문서는 설계만 다룬다.
- **안전 원칙(전 챕터 불변):** 모든 기술 행위는 허구 데이터 위 시뮬레이션. 실제 공격·네트워크·
  호스트 셸·자격증명 탈취·악성코드 없음. 프레이밍은 "법적으로 확보한 사본에 대한 포렌식 분석".
- 갱신일: 2026-07-02.

---

## 0. 테마 (설계의 나침반)

> **사람을 숫자로 바꾸는 시스템 vs. 숫자를 다시 사람으로 되돌리는 수사.**

이 게임의 악은 얼굴을 찡그린 악당이 아니라 **곤경을 자산으로 환산하는 구조**다. Ch3에서
드러나는 Distress Conversion Index(DCI, 곤경 환산 지수)가 그 상징 — 피해자는 두 번
사용된다. 한 번은 털리고, 한 번은 "청산 확률"로 점수화되어 상품이 된다.

유나(siren-11)가 남긴 문장이 6챕터를 관통하는 열쇠다:
> **"장부는 서버에 없다. 진짜 장부는 종이다."**

서준의 여정은 세 가지 긴장 사이의 선택이다 — **제도(이지스·법)** / **지하(널웨이브)** /
**가족**. 승리는 시스템을 해킹으로 파괴하는 게 아니라, **증거·내부고발·법적 폭로**로
사람을 자산 취급하던 구조를 무너뜨리는 것이다.

---

## 1. 캐릭터 바이블

### 주역
- **서준 (Joon Seo)** — 플레이어. 10년차 화이트햇·IR 전문가(Aegis Response). 냉정·직업적
  거리감. 부모 피해로 직업윤리와 사적 복수 사이에서 흔들린다. **아크:** 거리감 → 분노 →
  "어떤 수사관/자식이 될 것인가"의 선택. 플레이어 스탯이 곧 그의 내면.
- **한나 (Hanna) — 이지스 IR 팀장.** 제도의 양심. 체인 오브 커스터디·절차를 신봉하지만
  회사는 거물 고객·변호사에 묶여 있다. **아크:** Ch4에서 경영진의 수사 중단 압박과
  충돌 → 플레이어의 integrity/trust가 높으면 그녀가 내부에서 방패가 되어 준다(Ending A/D
  조력). 낮으면 회사 라인에 굴복해 서준이 고립된다.

### 널웨이브 (지하)
- **제로 (ZERO) — 널웨이브 접촉책.** 암호화 채널에서 "NW"로 서명. 신중하고 목적지향적.
  Orbis Vale를 독자 추적 중. Ch4에서 대면(가면/아바타). **동기:** 제도는 스스로를 규제할
  수 없다고 믿음. 서준을 이용하려는 건지, 진짜 동맹인지 끝까지 회색.
- **플레어 (FLARE) — 널웨이브 강경파.** "지금 다 태워라(즉시 공개)"를 밀어붙이는 목소리.
  Ch4 유출 결정에서 즉시-공개 압력의 인간 얼굴. 내부 갈등(제로 vs 플레어)이 "검증 후 공개"
  선택에 무게를 준다.

### 피해자·증인 (게임의 심장)
- **어머니 / 아버지** — 프롤로그 피해자. 어머니는 3,800만 원 피해·명의 도용까지. 아버지는
  밤마다 현관문을 두 번 확인한다(불안). family 스탯의 정서적 앵커.
- **유나 (siren-11)** — 전 미러콜 콜센터 상담원 → 내부고발자 → 실종. 중반부의 인간적 핵심.
  "진짜 장부는 종이" 메모의 주인. **생존 여부는 경로에 따라 분기**(Ch2 search / Ch5 보호
  경로 / Ch6) → Ending D의 핵심 조건.
- **서지원** — 약탈적 대출 취재 기자. 협박 후 연락 두절. "신뢰 기자에게만 공유" 채널의 얼굴.
- **박정순·조성태·윤미란·김호영** — 피해자군(신원 재사용·DCI 점수 대상). 캐논 유지.

### 오르비스 베일 (안타고니스트)
- **강윤재 (Kang Yoon-jae) — Orbis Vale 특수상황(부실자산) 총괄, "설계자".** 공적으로는
  존경받는 턴어라운드 투자자, 사적으로는 DCI 모델을 발주하고 피해자를 딜 소싱 파이프라인으로
  다루는 설계자. CEO가 아니라 격리·부인 가능한 위치(현실성). Ch2의 "회선의 주인 = 설계자"의
  정체. Ch6에서 대면(대면=물리 폭력이 아니라 증거·법정·공개의 대결).
- **윤가원 (Greyfox 수석 리스크 애널리스트) — DCI 설계자(양심).** "리스크 관리"인 줄 알고
  모델을 만들었다가 용도를 깨닫고 두려워하는 인물. **조력 분기:** 서준이 윤리적으로
  접근(integrity/trust 高)하면 협조 증인이 됨 → 강윤재의 책임을 잇는 마지막 고리.
- **도경식 — 오르비스 베일 하청 보안(세리톤 시큐리티) 책임.** 유나를 사적 채널로 이송하고
  CCTV를 조작한 실행자. Ch5의 적. "억압"의 물리적 얼굴.
- **서류상 임원 4인(캐논):** 배광호(대표)·오민재(이사)·한서라(이사)·김태석(감사) — 전원 명의뿐.

### 기관
- **Aegis Response** — 서준의 고용주. 합법 접근·도구·동료·증거 절차 제공. 그러나 계약·정치·
  변호사·거물 고객에 제약. 자원이자 족쇄.
- **MirrorCall** — 보이스피싱 조직. 소모용 앞단 레이어(나중에 밝혀짐).
- **Orbis Vale Capital** — 최종 안타고니스트 지주사. 사기 자체를 운영하지 않고, 그 하류
  결과(부실자산 인수·부채 매입·신원 데이터 수익화·사기보험 조작)에서 수익.
- **Greyfox Analytics** — Orbis Vale 데이터/리스크 자회사. DCI 모델 운영.
- **Northline Fiduciary Services / NL-ESCROW / BLUEHARBOR LLC** — 셸/경유 법인 사다리.

---

## 2. 스탯 & 분기 시스템 (전 챕터 단일 소스)

### 스탯 4종 (+ 숙련도)
| 스탯 | 의미 | 초기값 |
| --- | --- | --- |
| integrity | 증거 신뢰도(합법·검증·체인) | 50 |
| trust | 공적 신뢰(기자·규제·동료·대중) | 50 |
| nullwave | 널웨이브 신뢰 | 0 |
| family | 가족 유대 | 40 |
| mastery | 수사관 숙련도(힌트 −5) | 100 |

모두 0–100 클램프. mastery는 엔딩 게이트에 미포함(칭호·연출용).

### 추적 플래그 (분기 입력)
- **선택 플래그:** momChoice, finalChoice(프롤로그), ch1Choice, ch2Drop, ch2NW, ch2Choice,
  ch3Dci, ch3Choice, **ch4Leak, ch4Verify, ch5Choice, ch6Release**(신규).
- **상태 플래그(파생):**
  - `witnessSaved` — 유나 보호 성공. 조건: `ch2Choice==='search'` **또는** Ch5에서 경로
    재구성 완료 + Ch5 선택이 'protect', 그리고 Ch6에서 목격자 억압 증거를 패키지에 포함.
  - `evidenceClean` — 체인 무결. 조건: Ch2 `ch2Drop==='verify'` 계열 + Ch4 `ch4Verify`
    완료(오염 행 제거) + Ch6에서 미검증 증거를 패키지에 넣지 않음.
  - `recklessLeak` — 무모한 공개. 조건: `ch4Leak==='now'`(검증 없이 즉시 공개).

### 기존 선택 델타 (Ch0–3, 구현 캐논)
| 지점 | 선택 → (스탯) [플래그] |
| --- | --- |
| 프롤로그 엄마 통화 | 따뜻(family+12)[warm] · 차갑(family−8)[cold] · 사실정리(integrity+4)[pro] |
| 프롤로그 피날레 finalChoice | 이지스등록(int+8,trust+6)[aegis] · 단독(int−6,nw+8)[solo] · 가족(family+10,trust+2)[family] |
| Ch1 피날레 ch1Choice | 정식보고(int+8,trust+5)[report] · 그림자(int−5,nw+6)[shadow] · 가족(family+8)[family] |
| Ch1 엄마 문자 | 맡음(family+8) · 수사중(int+2) · 미룸(family−6) |
| Ch2 드롭 ch2Drop | 검증(int+6,trust+2)[verify] · 즉시(int−4,nw+6)[raw] · 공유(trust+6)[share] |
| Ch2 NW ch2NW | 추궁(int+3)[press] · 수용(nw+4)[accept] · 무시(trust+3,nw−3)[silent] |
| Ch2 가족 문자 | 명의보호(family+8) · 증거화(int+3) · 미룸(family−6) |
| Ch2 피날레 ch2Choice | 수색(trust+6,int+4)[search] · 접선(nw+8,int−4)[meet] · 명의보호(family+8)[shield] |
| Ch3 DCI ch3Dci | 추적(int+4)[pursue] · 침묵(nw+3)[quiet] |
| Ch3 피날레 ch3Choice | 이관(int+8,trust+5)[refer] · 제안수락(nw+8,int−4)[offer] · 피해자우선(family+6,trust+3)[victims] |

### 신규 선택 델타 (Ch4–6, 설계)
| 지점 | 선택 → (스탯) [플래그] |
| --- | --- |
| Ch4 유출 결정 ch4Leak | **즉시 공개**(nw+10,int−10,trust−4)[now] · **검증 후 공개**(int+8,trust+6)[verify] · **기자/규제 한정 공유**(trust+8,int+3)[channel] · **유출 거부**(int+5,trust+4,nw−8)[reject] |
| Ch4 윤가원 접근 ch4Witness | **윤리적 설득**(trust+6,int+4)[persuade] · **압박/폭로 협박**(nw+5,int−4)[coerce] · **접근 안 함**(nw+2)[skip] |
| Ch5 목격자 처리 ch5Choice | **경찰 신변보호 요청**(trust+7,int+4)[protect] · **NW 은신 루트**(nw+8,int−3)[hide] · **가족부터**(family+8)[family] |
| Ch6 공개 전략 ch6Release | **검찰·규제 정식 이관**(int+8,trust+6)[official] · **일제 공개(NW)**(nw+10,int−6)[blast] · **신뢰 기자 단독**(trust+6,int+2)[press] · **피해자 공동체 우선**(family+8,trust+3)[victims] |

`ch4Verify`(오염 행 검출·제거 완료 여부)는 선택이 아니라 **퍼즐 달성 플래그**. `ch4Leak==='now'`
인데 `ch4Verify` 미완료면 `recklessLeak=true`.

### 엔딩 결정 함수 (결정적, 우선순위 순)
Ch6 완료 시 아래 순서로 첫 만족 엔딩 확정. (임계값은 WU-6 밸런스에서 미세조정 가능.)

```
witnessSaved  = (ch2Choice==='search' || ch5Choice==='protect') && ch5RouteDone && ch6HasWitnessEvidence
evidenceClean = ch4Verify && !recklessLeak && ch6NoUnverifiedInPackage
allyGaShin    = ch4Witness==='persuade'   // 윤가원 협조

D "Signal Returned"   if  family>=55 && integrity>=60 && witnessSaved && !recklessLeak
A "The Clean Record"  if  integrity>=65 && trust>=60 && evidenceClean
B "The Leak"          if  nullwave>=55 && (integrity<50 || recklessLeak)
C "The Silence Protocol"  otherwise
```

설계 의도: D는 "증거도 사람도 지킨" 최상 루트(가족·목격자·무결성 동시). A는 "제도적 승리"
(절차·공적 신뢰). B는 "일부 진실은 터졌지만 무모함의 대가". C는 "회사는 살아남고 더 큰
구조의 씨앗만 남는" 속편형. `allyGaShin`은 A/D에서 폭로 강도를 높이는 보너스(엔딩 텍스트에
'강윤재 기소'까지 확정 여부로 반영).

---

## 3. 도구 해금 & 퍼즐 문법 진행

| 챕터 | 해금 도구 | 가르치는 사고 |
| --- | --- | --- |
| 프롤로그 | `pwd ls cd cat less head tail grep sort uniq` | 파일 탐색·패턴·집계의 기초 |
| Ch1 | `cut` (+ 파이프라인 심화) | 필드 추출·집계로 반복 패턴 추적 |
| Ch2 | `map` (지도/그래프/타임라인) | 관계·시간축 재구성 |
| Ch3 | `query` (읽기 전용 SQL) | 관계형 조회·집계·조인으로 자금/모델 추적 |
| Ch4 | `python` (격리 분석 랩) | 필터·중복탐지·상관 = 분석적 논리 |
| Ch5 | `cctv` (증거 리뷰) | 시간동기·메타데이터 무결성·경로 재구성 |
| Ch6 | 전 도구 + `pkg`(증거 패키지) | 종합·분류·법적 서사 구성 |

**단서 확보 규칙(캐논):** 정답 제출 명령 없음. 결정적 증거가 화면 출력에 드러나는 순간
자동 확보 + 대화 패널 독백 알림. 집계·분석형은 올바른 산출물이 화면에 떠야만 확보(원본을
그냥 열람하면 미확보). 전 단서 확보 → 증거 보드 연결 완성 → "사건 파일 생성" 1행동으로 전진.

---

## 4. 챕터별 설계

각 챕터: **스토리 비트 / 목표(퍼즐) / 정답 데이터 / 증거 보드 / 대화·분기 / 다음 훅.**

### 프롤로그 "The Call That Wasn't — 걸려오지 않은 전화" ✅
- **비트:** 심야 전화, 어머니의 3,800만 원 이체, 죄책감·분노 → 사본 분석 착수.
- **목표:** brief(cat) · number(070-8112-4437) · template(TPL-ECHO-7) · relay(echo-relay-03).
- **보드 5연결:** 표시명 위조·문자·가짜앱이 echo-relay-03 로 수렴 → "mirrorcall" 조직.
- **분기:** momChoice, finalChoice(aegis/solo/family). **훅:** 릴레이 서버 압수 → Ch1.

### Ch1 "EchoGate" ✅
- **비트:** 압수 릴레이 이미지 포렌식. 허술한 운영 → NL-ESCROW → Northline 최초 등장.
- **목표:** manifest · alias(dove-9) · ledger(payout_routing.csv) · company(Northline) · escrow(NL-ESCROW).
- **보드 5연결:** 이미지→운영자→백업→원장→에스크로→수취법인.
- **분기:** ch1Choice(report/shadow/family) + 엄마 문자. **훅:** "노스라인의 주인은?" → Ch2.

### Ch2 "The Unlisted Number" ✅
- **비트:** 서류상 임원 4인이 같은 미등재 번호의 지시 콜을 받음. 실종된 유나·침묵한 기자.
  NW 첫 접촉.
- **목표:** intake · netmap(map) · unlisted(0505-0311-7742) · owner(박정순) · timeline(map timeline).
- **보드 6연결:** 미등재 회선이 임원(위장)과 제보자(위협)를 함께 관리 → "설계자".
- **분기:** ch2Drop, ch2NW, ch2 가족, ch2Choice(search/meet/shield). **훅:** "진짜 장부는 종이" → Ch3.

### Ch3 "Ghost Ledger" ✅
- **비트:** 법원 인가 포렌식 DB. 피해자가 '도난'이 아니라 '계산'됐음을 발견. DCI.
- **목표:** intake · schema(query) · shells(NL-ESCROW 8,200만) · ladder(→Orbis Vale) ·
  dci(GREYFOX-DCI-v3) · overlap(echo-relay-03 재사용).
- **보드 6연결:** 피해자→DCI→Greyfox / 피해자→셸→Greyfox→Orbis / 결제라우팅↔인프라 재사용.
- **분기:** ch3Dci, ch3Choice(refer/offer/victims). **훅:** NW의 봉인 아카이브 제안 → Ch4.

---

### Ch4 "The Offer" ✅ — `python` 분석 랩

**스토리 비트**
1. NW(제로)와 대면(암호화 아바타). 그들은 Orbis Vale 내부 **봉인 아카이브**를 내민다 —
   불완전하고, **일부 오염(주입/변조)** 가능성 있음.
2. 이지스 경영진이 거물 고객 압박으로 **수사 중단**을 지시. 한나가 중간에서 흔들린다.
3. 서준은 봉인 아카이브를 `python` 랩에서 분석 — 피해자 신원 재사용·임원 승인 상관관계를
   드러내되, **동시에 데이터의 무결성을 스스로 검증**해야 한다(오염 행 색출).
4. 내부 갈등: 제로(신중) vs 플레어(즉시 공개). 유출 결정이 엔딩의 축을 만든다.
5. 곁가지: DCI 설계자 **윤가원** 접근(협조 증인 확보 분기).

**안전한 python 랩 설계 (결정적·격리)**
- 실제 파이썬 아님. **가이드 템플릿 "조건식 빈칸 채우기"** 방식(권장). 플레이어는 미리
  주어진 루프/필터 골격에서 임계값·필드값·비교연산자만 선택/입력한다. `os/subprocess/
  socket/requests`·브라우저·파일·네트워크 API 일절 없음. 게임 소유 CSV(인메모리)만 대상.
- 엔진: `engine/pylab/` — 템플릿 평가기. 각 템플릿은 `{ id, skeleton, blanks[], solve(rows,
  answers)→rows|number, revealPattern }`. 산출물 텍스트가 `runScan` 을 거쳐 단서 자동 확보
  (다른 도구와 동일 파이프라인). `ChapterDef.dataset`(CSV 테이블) 필드 신설로 데이터 구동.

**목표(퍼즐) 6종**
| key | 목표 | 템플릿(빈칸) | 정답/확보 트리거 |
| --- | --- | --- | --- |
| intake | 브리핑 (cat briefing.txt) | — | 파일 트리거 |
| lab | 분석 랩 접속 (python) | 인자 없이 `python` → 데이터셋/템플릿 목록 | schema류 완료 |
| reuse | 피해자 신원 재사용 탐지 | `flag = filter(deals, r → r["dci"] >= [80] and r["source"] == ["MirrorCall"])` | 재사용 피해자 4인 목록 출력 → 확보 |
| approve | 임원 승인 상관 | `join(access_logs, exec_msgs) where badge active on approval week` (승인 주차 빈칸) | 배광호 배지가 DCI 파트너십 승인 시각에 활성 → 확보 |
| verify | 아카이브 무결성 검증 | `bad = filter(archive, r → reconcile(r) == [False])` (대조 기준 빈칸) | **오염 3행** 검출 → `ch4Verify=true` |
| summary | 증거 요약 생성 | 상단 결과 종합 템플릿 | 요약표 출력 → 확보 |

**정답 데이터셋 (허구)**
- `deal_pipeline` (victim_id, dci, source, product, acquired_by, week):
  MirrorCall 소싱 + 고DCI 행 4건(박정순·조성태·윤미란·김호영) = 재사용 대상.
  일반 소싱 행 다수(대조군).
- `access_logs` (badge, officer, area, ts): 배광호 배지가 Ch3 executive_messages 의
  "GREYFOX-DCI 정산 파트너십 승인"(2026-W20) 시각·구역에 활성.
- `archive_rows` (id, amount, date, ref): 대부분 Ch3 court DB와 정합. **오염 3행:**
  ① 계좌 개설일보다 앞선 거래일 ② court DB와 8자리 금액 불일치 ③ 존재하지 않는 셸 참조.
  → `verify` 퍼즐이 이 3행을 색출. 이 발견이 "즉시 공개"의 위험(오염 데이터로 신뢰 붕괴)을
  **기계적으로** 정당화한다.

**증거 보드 (6노드/6연결, 안)**
- nodes: 봉인아카이브 / 재사용피해자군 / 임원승인(배광호) / DCI설계자(윤가원) / 오염행(변조) / 유출딜레마
- links: 아카이브→재사용 · 재사용→DCI설계자 · 승인→아카이브 · 오염행→아카이브 ·
  윤가원→(협조 시)강윤재 · 재사용→유출딜레마.
- deduce: "내부 문서는 진실을 담았지만, 누군가 그 안에 거짓 세 줄을 심었다. 검증 없이는
  진실조차 무기가 되지 못한다."

**대화·분기**
- 오프닝 `dlgCh4Open(ch3Choice)`: refer→"정식 이관했더니 위가 막았다" / offer→"네가 문을
  열었으니 자료가 왔다" / victims→"피해자들이 목소리를 내기 시작했다".
- 이벤트: `verify` 확보 시 플레어의 "지금 터뜨려" 압박 vs 제로의 "검증해" (ch4 내부 갈등 비트).
- 윤가원 접근 `ch4Witness`(persuade/coerce/skip) — persuade 시 그녀가 "모델은 리스크 관리로
  만들었다. 이렇게 쓰일 줄 몰랐다"며 협조 약속(→ A/D 보너스).
- 피날레 `ch4Leak`(now/verify/channel/reject) — 4분기. now+미검증 → recklessLeak.
- **훅:** 핵심 증인(유나)이 마지막으로 목격된 환승역 CCTV 인가 → Ch5.

**안전 프레이밍:** "봉인 아카이브"는 NW가 건넨 파일 사본을 격리 랩에서 읽기 전용 분석. 침투·
접속 행위 없음. 오염 검증 자체가 "출처 불명 자료를 함부로 쓰지 말라"는 교훈.

---

### Ch5 "The Closed Circuit" ✅ — `cctv` 증거 리뷰

**스토리 비트**
1. 법 집행 연락관을 통해 **법원 인가 CCTV 증거 패키지**(환승역, 유나 마지막 목격) 확보.
   실제 카메라 접속이 아니라 사전 저작 허구 푸티지의 포렌식 열람.
2. 카메라 간 시계 오차(clock drift)·결손 프레임·메타데이터 불일치를 바로잡아 유나의 경로를
   재구성.
3. 오르비스 베일 하청 보안 **도경식(세리톤)** 이 사설 서비스 통로 구간을 **편집**했음을 적발.
4. 발견: 유나는 자발적 이탈이 아니라 **사적 보안 채널로 이송·침묵 각서 강요**. 오르비스 베일이
   단지 사기를 이용하는 게 아니라 **증거를 능동적으로 억압**한다.

**cctv 리뷰 설계 (데이터 구동)**
- 엔진: `engine/cctv/` — 카메라 피드는 데이터(카메라별 프레임 이벤트 배열 + 클록 오프셋 +
  메타). 픽셀아트 패널은 코드 렌더(정적 프레임), 퍼즐 로직은 **타임스탬프/메타데이터 비교**.
- UI 컴포넌트 `components/cctv-review/` (다른 탭처럼 워크스테이션 통합). 타임라인 스크러버 +
  카메라 목록 + 메타 패널 + 경로 재구성 보드.
- 확보는 동일 `runScan` 패턴(정정된 타임라인/적발 결과 텍스트 → 자동 확보).

**목표(퍼즐) 6종**
| key | 목표 | 조작/정답 |
| --- | --- | --- |
| intake | 브리핑 (cat) | 파일 트리거 |
| sync | 카메라 시계 동기 | CAM-C **+47s**, CAM-D **−02:15** 오프셋 산출·보정 |
| gap | 결손 프레임 탐지 | CAM-D 서비스 통로 **02:18 구간 결손**(편집) 발견 |
| badge | 배지 로그 대조 | 보정 시각에 **세리톤 배지(도경식)** 서비스 도어 스와이프 일치 |
| route | 경로 재구성 | A(20:41)→B(20:43)→C(미탑승)→D(사설통로) 이송 경로 확정 |
| tamper | 조작 주체 특정 | 편집 메타데이터 서명 → 세리톤 시큐리티/도경식 |

**정답 데이터 (허구)**
- 카메라: CAM-A(대합실)·CAM-B(동문)·CAM-C(2번 승강장)·CAM-D(사설 서비스 통로).
- 드리프트: CAM-C +47s, CAM-D −02:15 (핸드오프 은폐용). 나머지 0.
- 유나 경로: A 20:41 진입 → B 20:43 → C 승강장에 **탑승 기록 없음** → (보정 후) D 통로에서
  20:47 사설 도어 개방 → 결손 02:18 → 이후 신호 없음.
- 배지 로그: `SEC-CERITON-04`(도경식)가 보정 시각 D 도어 스와이프.
- 편집 흔적: CAM-D 클립 메타 `editor=ceriton-mux` + 프레임 카운트 불연속.

**증거 보드 (6노드/6연결, 안)**
- nodes: 유나 / CAM-D 결손구간 / 시계 드리프트 / 세리톤 배지(도경식) / 침묵 각서 / 사설 이송로
- links: 유나→사설이송로 · 드리프트→결손구간(은폐) · 배지→사설이송로 · 결손구간→배지 ·
  사설이송로→침묵각서 · 침묵각서→(강윤재 지시 정황).
- deduce: "그녀는 사라진 게 아니라 옮겨졌다. 카메라의 시간을 조작한 손과, 그녀를 통로로
  민 손은 같은 회사의 것이다."

**대화·분기**
- 오프닝 `dlgCh5Open(ch4Leak)`: 유출 선택에 따라 연락관 신뢰도/자료 접근 톤 변주.
- 이벤트: `route` 확보 시 유나의 침묵 각서 초안 발견 → 정서 비트.
- 피날레 `ch5Choice`(protect/hide/family): protect+route완료 → `witnessSaved` 성립 경로.
  hide는 nw 상승·유나 생존 가능하나 법적 증거력 하락. family는 부모 신변 우선.
- **훅:** 모든 갈래가 강윤재로 향한다 → Ch6 종합.

**안전 프레이밍:** "법원 인가 아카이브 리뷰". 원격 카메라 접속·실시간 감시 전무. 전부 사전
저작 허구 푸티지. 퍼즐은 무결성 검증(시간 조작 적발)이라는 방어적 사고를 가르친다.

---

### Ch6 "Black Signal" ✅ — 종합 + 증거 패키지 + 피날레

**스토리 비트**
1. 서준은 Orbis Vale를 폭로할 만큼의 증거를 모았다. 그러나 조각나 있고, 정치적으로 민감하며,
   허위정보에 취약하다.
2. 오르비스 베일이 **공개 부인 캠페인** 준비 — 미러콜을 "무관한 고립 범죄조직"으로 프레이밍.
3. 삼자 압력: 플레어/NW(일제 공개) vs 한나/이지스(체인 오브 커스터디·당국 공조) vs 가족(종결).
4. 서준은 **법적으로 방어 가능하고 대중이 이해할 수 있는 증거 패키지**를 조립하고 공개 전략을
   선택한다. (시스템을 해킹으로 파괴하지 않는다.)

**증거 패키지 조립 설계 (분류/매칭 퍼즐)**
- 엔진: 기존 데이터 재사용. `pkg` 콘솔/보드에서 **확보 증거 노드**를 8개 카테고리에 배치.
  각 카테고리는 1–2개의 **검증된** 증거를 요구. 미검증/오배치 → 패키지 품질 하락.
- 8 카테고리 ↔ 증거 출처:
  1. 사기 인프라 — echo-relay-03 / TPL-ECHO-7 (프롤로그·Ch1)
  2. 자금 세탁 — payout_routing / NL-ESCROW 스윕 (Ch1·Ch3)
  3. 기업 자회사 구조 — 모법인 사다리→Orbis Vale (Ch3)
  4. 데이터 브로커리지 — DCI 모델(GREYFOX-DCI-v3) (Ch3·Ch4)
  5. 피해자 타기팅 — 신원 재사용·고DCI (Ch2·Ch3·Ch4)
  6. 임원 통신 — 배광호 승인·access_logs (Ch3·Ch4)
  7. 목격자 억압 — CCTV 편집·세리톤 이송 (Ch5)
  8. 금전적 수혜 — 부실자산 인수 파이프라인 (Ch3·Ch4)
- **품질 점수 = 채운 카테고리 수 × 검증도.** `evidenceClean`·`allyGaShin`·`witnessSaved`가
  가산. 이 점수와 스탯이 엔딩 함수 입력.

**목표(퍼즐)**
| key | 목표 |
| --- | --- |
| convene | 종합 브리핑 (cat) |
| assemble | 8 카테고리 증거 패키지 조립 (전부 검증 배치 시 최고 품질) |
| corroborate | 교차 검증 — query/python/cctv 재조회로 최소 1건 재확인 |
| architect | 설계자 특정 — 강윤재 (윤가원 협조 시 직접 연결 고리 완성) |
| package | 최종 패키지 확정 → 공개 전략 선택 |

**증거 보드 = 마스터 그래프**
- 전 챕터 핵심 노드를 한 화면에: 어머니/피해자군 → MirrorCall(앞단) → 셸 사다리 →
  Greyfox(DCI) → Orbis Vale/강윤재 ← 목격자 억압(세리톤) ← 봉인 아카이브.
- 완성 시 deduce: "미러콜은 미끼였다. 진짜 사업은 사람을 부실자산으로 바꾸는 것이었다.
  서버의 장부는 여기까지. 그리고 종이 장부의 마지막 장에, 한 사람의 서명이 있다 — 강윤재."

**피날레 분기 `ch6Release`** (official/blast/press/victims) → 엔딩 함수와 결합.

---

## 5. 엔딩 4종 + 에필로그 ✅

각 엔딩은 §2 결정 함수로 확정. 아래는 텍스트/에필로그 설계.

### A. "The Clean Record — 깨끗한 기록"
- **조건:** integrity≥65 & trust≥60 & evidenceClean.
- **결말:** 오르비스 베일 조사 착수·임원 사임·형사 기소·자산 동결·공청회 → 구조적 붕괴.
  `allyGaShin`이면 강윤재 직접 기소까지 확정.
- **에필로그:** 서준이 법정 증언대에 선다. 절차가 느렸지만 무너지지 않았다. 한나: "기록이
  이겼어." 어머니에게 "이제 무섭지 않으셔도 돼요."

### B. "The Leak — 유출"
- **조건:** nullwave≥55 & (integrity<50 || recklessLeak).
- **결말:** 기업은 공개적으로 타격받지만 오염/미검증분이 반박당함. 진실 일부는 드러나나
  서준이 무모한 폭로자로 비난받음. 제로: "신호는 갔다. 대가는 네 몫이다."
- **에필로그:** 헤드라인은 요란하고 법정은 조용하다. 플레어는 만족하고, 유나의 안전은 불투명.
  서준은 자신이 싸우던 자들과 얼마나 달랐는지 자문한다.

### C. "The Silence Protocol — 침묵 프로토콜"
- **조건:** 위 미충족(약한 증거/낮은 신뢰/놓친 경로).
- **결말:** 오르비스 베일은 공개적으로 살아남는다. 그러나 서준은 이것이 한 회사보다 큰
  시스템임을 입증하는 증거를 손에 쥔다. 속편 여지.
- **에필로그:** 사건은 종결 처리되고, 암호화 채널에 마지막 신호: "이건 시작이었다. — NW."
  서준의 화면에 새 좌표 하나.

### D. "Signal Returned — 되돌아온 신호"
- **조건:** family≥55 & integrity≥60 & witnessSaved & !recklessLeak. (최상)
- **결말:** 유나가 신변보호로 생환·증언, 피해자들이 자산이 아닌 주체로 회복. 법·규제·공개의
  공조로 구조가 무너진다. 서준은 목적을 되찾고 보안 일로 복귀.
- **에필로그:** 유나가 "종이 장부"의 마지막 조각을 건넨다. 아버지가 더는 현관문을 두 번
  확인하지 않는 밤. 서준: "신호는 끊기지 않았다. 이번엔 옳은 방향으로."

---

## 6. 연속성 캐논 시트 (전 게임 고정 명칭)

- **번호/인프라:** 070-8112-4437(프롤로그 발신) · 0505-0311-7742(Ch2 미등재 지시선) ·
  echo-relay-03 / relay-b / relay-c(릴레이) · TPL-ECHO-7(문자 템플릿) · kb_clone_v3(가짜앱).
- **콜사인:** dove-9(핵심 운영자) · harbor-2 · mule-5 · siren-11(유나) / NW: 제로·플레어.
- **법인 사다리:** NL-ESCROW → Northline Fiduciary Services → Greyfox Analytics →
  Orbis Vale Capital. 곁: BLUEHARBOR LLC.
- **모델:** Distress Conversion Index (DCI) / GREYFOX-DCI-v3.
- **인물:** 서준 · 한나 · 어머니·아버지 · 유나(siren-11) · 서지원(기자) · 박정순·조성태·
  윤미란·김호영(피해자) · 강윤재(설계자) · 윤가원(DCI 설계자·양심) · 도경식(세리톤 보안) ·
  배광호·오민재·한서라·김태석(서류상 임원).
- **케이스 코드:** 00 프롤로그 · AR-2026-0714(Ch1) · AR-2026-0731(Ch2) · AR-2026-0808(Ch3)
  · **AR-2026-0815(Ch4)** · **AR-2026-0822(Ch5)** · **AR-2026-0901(Ch6)**(신규 제안).
- **사건 루트:** /cases/04_the_offer · /cases/05_closed_circuit · /cases/06_black_signal.

---

## 7. 구현 매핑 (설계 → 엔진, 참고)

WU-0 이후 챕터는 데이터 구동. 각 신규 챕터의 수정 범위:
- **Ch4:** `engine/pylab/`(신규 템플릿 평가기) + `content/datasets/theoffer.ts` +
  `content/filesystems/theoffer.ts` + `chapters.ts` 항목 + `dialogues` + store `python` 배선 1곳
  + `ChapterDef.dataset` 필드. UI: 결과는 터미널 출력으로 충분(신규 패널 불필요).
- **Ch5:** `engine/cctv/`(신규) + `content/cctv/closedcircuit.ts` + `components/cctv-review/`
  (신규 탭) + `chapters.ts` + `dialogues` + store `cctv` 배선. `ChapterDef.cctv` 필드.
- **Ch6:** 신규 엔진 최소화(기존 데이터 종합) + `components/package/`(분류 보드) +
  `chapters.ts` + `dialogues` + 엔딩 함수(`engine/ending.ts`) + EndScreen 엔딩 분기 확장.
- **엔딩 함수:** `engine/ending.ts` — 순수 함수 `resolveEnding(stats, flags)` → 단위 테스트.
- 전 챕터: 단서 확보는 기존 `scan`/`runScan` 재사용, 스토리 이벤트는 `ChapterDef.events`.

세부 작업 순서·완료 기준은 [PLAN.md](PLAN.md) WU-2/3/4 참조.
