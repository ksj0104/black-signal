import { D, F, VNode } from '../../engine/vfs/vfs';

/** Chapter 7 — 한서시장 보궐선거(가상) 제보 검토 자료 (전부 허구 데이터) */
export const TWINTALLY_FS: VNode = D({
  'briefing.txt': F(`[AEGIS RESPONSE — 사건 AR-2026-1016 "TWIN TALLY"]
의뢰: 개인 제보 (개표 사무원 정다인) · 사내 상태: 예비 검토
대상: 한서시장 보궐선거(2026-10-14) 공표 개표상황표 + 제보자 제출 스캔
      + 시범 시스템 감사 로그 발췌 (전부 읽기 전용 사본 · 허구 데이터)
담당 분석관: 서준

배경
 한서시는 이번 보궐선거에 '디지털 개표 집계 시범사업'(TALLYBRIDGE,
 Suncrest Systems 납품)을 처음 적용했다. 종이 투표는 그대로 —
 집계와 전송만 기계가 했다. 그리고 그 기계의 숫자가, 이상하다.

제보 요지
 1. 선거 당일 제4투표소 — 투표지 부족 항의가 접수조차 되지 않았다
 2. 제11개표구와 제3개표구 — 세 후보의 득표수가 끝자리까지 같다

목표
 1. 브리핑 확인                          cat briefing.txt
 2. 항의 묵살 정황 확정                   (수기 대장 디코드 · 전산 대조)
 3. 쌍둥이 개표구 특정                    (공표치 집계 — query)
 4. 수기 검산 대조                        (hand_tally 와 공표치 JOIN)
 5. 미승인 모듈 특정                      (감사 로그 · 매니페스트 대조)

결정적 증거가 화면에 드러나는 순간, 단서는 자동으로 확보된다.
팁: 공표 개표상황표는 포렌식 DB 에 적재됐다. 인자 없이 query 부터.`),
  'daein_note.txt': F(`[제보 메모 — 정다인 (제11개표구 개표 사무원)]
"이상한 걸 이상하다고 말했더니, 다들 저를 이상하게 보더군요.

 저는 개표 사무원이었어요. 새벽에 100매 묶음으로 수기 검산을 했고,
 제가 센 숫자를 아직 갖고 있어요. 공표된 숫자와 달라요. 세 번 셌어요.

 투표소에서 투표지가 부족했다는 항의는 참관인 친구가 겪었어요.
 그 친구가 현장 수기 대장을 스캔해 뒀는데 — 전산에는 그 네 건이 없대요.

 그리고 이건 제가 찾은 게 아니라, 숫자가 저를 찾아온 건데요.
 옆 개표구랑 우리 개표구랑, 세 후보 득표수가… 똑같아요. 끝자리까지.

 제가 미친 게 아니라는 걸, 숫자로 증명해 주세요."

첨부: ledger/ (항의 대장 스캔·전산 내보내기) · tally/ (수기 검산표 스캔)
      audit/ (시범 시스템 감사 로그 발췌 — 출처: 정보공개 청구 회신)`),
  ledger: D({
    'complaint_ledger.b64': F('W+2VnOyEnOyLnCDsoJw07Yis7ZGc7IaMIOKAlCDtmITsnqUg66+87JuQIOyImOq4sCDrjIDsnqUg7Iqk7LqUIOyCrOuzuCAo7LC46rSA7J24IOuztOq0gOuzuCDCtyDtl4jqtawg642w7J207YSwKV0KMjAyNi0xMC0xNCDtlZzshJzsi5zsnqUg67O06raQ7ISg6rGwIOuLueydvAoKMTc6MDUgIO2IrO2RnOyngCDrtoDsobEg4oCUIOyelOyXrCDtiKztkZzsp4Ag7IaM7KeEIOyehOuwlSDrs7Tqs6AsIOuMgOq4sOyXtCAyN+uqhS4g7KCR7IiY67KI7Zi4OiAo66+467aA7JesKSDCtyDqtazrkZAg7LKY66asCjE4OjEyICDtiKztkZzsp4Ag67aA7KGxIOKAlCDstpTqsIAg7IiY66C5IOyngOyXsCDrrLjsnZguIOygkeyImOuyiO2YuDogKOuvuOu2gOyXrCkgwrcgIuuzuOyGjCDtmozsi6Ag64yA6riwIgoxOTowMyAg7Yis7ZGc7KeAIOu2gOyhsSDigJQg7Jyg6raM7J6QIO2VreydmCwg7Yis7ZGcIO2PrOq4sCDqt4DqsIAgM+uqhSDtmZXsnbguIOygkeyImOuyiO2YuDogKOuvuOu2gOyXrCkgwrcg6riw7J6sIOyXhuydjAoxOTo0OCAg7Yis7ZGc7KeAIOu2gOyhsSDigJQg7LC46rSA7J24IOqzteyLnSDsnbTsnZgg7KCc6riwIOyalOq1rC4g7KCR7IiY67KI7Zi4OiAo66+467aA7JesKSDCtyAi7IOB7ZmpIOyiheujjCIg7LKY66asCgrsl7DtlYQg66mU66qoKOyXrOuwsSk6IOuwsOu2gCDsiJjrn4kg7IKw7KCVIOq3vOqxsOulvCDrrLzsl4jrjZTri4gg4oCUICLsmbjrtoAg7JiI7LihIOuqqOuNuCDssLjsobAi652864qUIOuLteuzgOu/kC4K6re4IOuqqOuNuOydtCDrrZTsp4DripQg7JWE66y064+EIOuqqOuluOuLpC4='),
    'complaint_sys_export.txt': F(`[한서시 민원 전산 내보내기 — 2026-10-14 (선거일) · 제4투표소 관련 · 허구 데이터]
17:22  투표소 앞 주차 안내 요청     접수번호 HS-1014-0412  처리 완료
18:40  확성기 소음 신고            접수번호 HS-1014-0459  처리 완료
19:15  안내 표지 미흡              접수번호 HS-1014-0473  처리 완료
20:02  개표 방송 문의              접수번호 HS-1014-0481  처리 완료

# 검색 조건: '투표지' — 해당 접수 0건
# 현장 수기 대장은 스캔본만 존재 → ledger/complaint_ledger.b64 (base64 -d)`),
  }),
  tally: D({
    'hand_tally_p11.b64': F('W+ygnDEx6rCc7ZGc6rWsIOyImOq4sCDqsoDsgrDtkZwg4oCUIOyKpOy6lCDsgqzrs7ggKOqwnO2RnCDsgqzrrLTsm5Ag7KCV64uk7J24IOyekeyEsSDCtyDtl4jqtawg642w7J207YSwKV0K6rCc7ZGc7J28IOyDiOuyvSwgMTAw66ekIOustuydjCDri6jsnIQg7IiY6riwIOqygOyCsCAo6rCc7ZGc7IOB7Zmp7ZGcIOu2gOyGjSDsmqnsp4ApCgrquLDtmLgxIOywqOyImOyZhCAgIDE1LDIwNwrquLDtmLgyIOuwseuPhO2YhCAgIDE0LDY3OArquLDtmLgzIOyehOqwgOugpCAgICAzLDM5NQrtlanqs4QgICAgICAgICAgMzMsMjgwCgrrqZTrqqg6IOqzte2RnOy5mOyZgCDsiKvsnpDqsIAg64uk66W064ukLiDrgrTqsIAg7IS8IOqyjCDrp57ri6QuIOyEuCDrsogg7IWM64ukLgrsoITsgrAg7KCB7J6s67O46rO8IOuMgOyhsO2VoCDqsoMg4oCUIO2PrOugjOyLnSDsvZjshpTsnZggaGFuZF90YWxseSDthYzsnbTruJQu'),
    'readme.txt': F(`[적재 안내]
공표 개표상황표(14개 개표구)와 정다인 수기 검산표는 포렌식 DB 에 적재됨.
 - official_tally : 공표치 (TALLYBRIDGE 산출)
 - hand_tally     : 수기 검산 (제11개표구 표본)
 - precinct_meta  : 개표구별 집계 유닛·펌웨어·패치 채널

같은 개표구의 두 숫자를 한 화면에 놓고 싶다면 — JOIN.
예: query SELECT o.precinct, o.baek_dohyun, h.baek_dohyun FROM official_tally o JOIN hand_tally h ON o.precinct = h.precinct`),
  }),
  audit: D({
    'tallybridge_boot.log': F(`# TALLYBRIDGE 집계 유닛 부팅 감사 로그 발췌 — unit TB-11 (제11개표구) · 허구 데이터
[BOOT] fw 2.1.0-p4 · unit TB-11 · 2026-10-14 20:31:04
[LOAD] mod_tb_core      2.1.0   sig=SC-ROOT-01   VERIFY=OK
[LOAD] mod_scan_io      1.8.2   sig=SC-ROOT-01   VERIFY=OK
[LOAD] mod_ocr_kr       3.0.1   sig=SC-ROOT-01   VERIFY=OK
[LOAD] mod_tally_agg    2.1.0   sig=SC-ROOT-01   VERIFY=OK
[LOAD] mod_net_report   1.4.0   sig=SC-ROOT-01   VERIFY=OK
[LOAD] mod_selftest     1.2.0   sig=SC-ROOT-01   VERIFY=OK
[LOAD] blst-0.9.4       -       sig=(없음)       VERIFY=SKIP   ident="ballast"
[HOOK] blst-0.9.4 -> mod_tally_agg (집계 후처리 후킹)
[SYNC] patch_channel=cert-mirror-2 · last_patch=2026-10-02 04:11 (인증 패치 미러)
[OK]   READY · 개표 세션 시작 20:47:19

# 분석관 메모: VERIFY=SKIP 은 서명 검증을 '건너뛴' 로드다.
# 승인 목록과 대조할 것 → audit/cert_manifest.txt`),
    'cert_manifest.txt': F(`[SUNCREST SYSTEMS — TALLYBRIDGE fw 2.1.0-p4 인증 모듈 매니페스트 (검수 확정본 사본 · 허구 데이터)]
승인 모듈 (6):
 mod_tb_core     2.1.0   SC-ROOT-01
 mod_scan_io     1.8.2   SC-ROOT-01
 mod_ocr_kr      3.0.1   SC-ROOT-01
 mod_tally_agg   2.1.0   SC-ROOT-01
 mod_net_report  1.4.0   SC-ROOT-01
 mod_selftest    1.2.0   SC-ROOT-01

주의: 본 매니페스트 외 모듈이 로드된 유닛은 인증 무효.
패치 유통: 공식 채널 'suncrest-cert' 한정. 미러 채널은 인증 범위 밖임.`),
  }),
  press: D({
    'wire_recap.txt': F(`[통신사 기사 발췌 — 2026-10-21 (허구 데이터)]
"한서시장 보궐선거 '쌍둥이 득표수' 논란 확산 —
 시 선관위 '단순 우연, 재검표 사유 없음' 일축"

한서시선거관리위원회(가상)는 21일 성명을 내고 "디지털 집계 시범사업은
검증된 인증 절차를 거쳤으며, 일부 개표구의 득표수 일치는 통계적으로
가능한 우연"이라고 밝혔다. 당선자 백도현 측은 "근거 없는 의혹"이라며
법적 대응을 예고했다. 낙선자 차수완 캠프는 재검표 청구를 검토 중이다.

한편 선거 당일 일부 투표소의 '투표지 부족' 항의가 접수되지 않았다는
주장에 대해 시 선관위는 "확인된 바 없다"고 답했다.`),
  }),
});
