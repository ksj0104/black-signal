import { D, F, VNode } from '../../engine/vfs/vfs';

/** Chapter 6 — 종합 브리핑 + 종이 장부 스캔 (전부 허구 데이터) */
export const BLACKSIGNAL_FS: VNode = D({
  'briefing.txt': F(`[AEGIS RESPONSE — 사건 AR-2026-0901 "BLACK SIGNAL"]  ※ 최종 종합
상태: 오르비스 베일, 공개 부인 캠페인 준비 중 — "미러콜은 무관한 고립 범죄조직"
보유: 프롤로그~Ch5 전 증거 + 종이 장부 스캔(신규 입수)

배경
 증거는 모였다 — 조각난 채로. 조각난 진실은 반박당한다.
 필요한 것은 해킹이 아니라, 법적으로 방어 가능하고
 대중이 이해할 수 있는 "하나의 패키지"다.

목표
 1. 종합 브리핑 확인                cat briefing.txt
 2. 증거 패키지 조립 (8개 범주)      pkg add <증거> <카테고리>
 3. 교차 검증 (최소 1건 재확인)      query / python / cctv 재조회
 4. 설계자 특정                     종이 장부 스캔 분석 (evidence/)
 5. 최종 패키지 확정                 pkg seal → 공개 전략 선택

주의: 전 도구(query·python·cctv)가 열려 있다. 재조회 산출물이 화면에 떠야
      교차 검증으로 인정된다. pkg 는 인자 없이 실행하면 현황을 보여준다.`),
  evidence: D({
    'paper_ledger_p12.b64': F(
      'W+yiheydtCDsnqXrtoAg7Iqk7LqUIHAuMTIg4oCUIOy1nOyihSDqsrDsnqzrnoAgKOyCrOuzuCldCjIwMjYtMDMgIOu2gOyLpOyekOyCsCDsnbjsiJgg' +
        '7YyM7J207ZSE65287J24IOu2hOq4sCDsoJXsgrAK7ISc66m0IOyKueyduDog67Cw6rSR7Zi4IOuMgO2RnOydtOyCrCAo7ISc66WY7IOBIOuqheydmCkK' +
        '67mE6rOgOiAi67O4IOqxtOydgCDtirnsiJjsg4Htmakg7LSd6rSEIOyghOqysCDsgqzslYgg4oCUIOybkOu2gOuKlCDsooXsnbQg7JuQ67O466eMIOuz' +
        'tOq0gCIK7KCE6rKwIOyEnOuqhTog6rCV7Jyk7J6sIChPcmJpcyBWYWxlIO2KueyImOyDge2ZqSDstJ3qtIQp',
    ),
    'denial_campaign_memo.txt': F(`[입수 문건 사본 — 오르비스 베일 대외전략 초안 (허구)]
"미러콜 사안은 당사와 무관한 고립 범죄조직의 일탈로 프레이밍한다.
 유출 자료는 '출처 불명·조작 가능성'을 전면에 세운다.
 대응 창구는 법무로 일원화한다."
(분석관 메모: 놈들은 우리의 미검증 조각을 기다린다 — 패키지는 검증본만으로.)`),
  }),
  notes: D({
    'pressure.txt': F(`(분석관 메모 — 서준)
세 방향의 압력이 동시에 온다.
 플레어/NW  — "전부, 지금, 한꺼번에."
 한나/이지스 — "체인 오브 커스터디. 당국 공조. 절차."
 가족       — "이제 그만해도 된다. 돌아와라."
패키지의 품질이 곧 나의 대답이 될 것이다.`),
  }),
});
