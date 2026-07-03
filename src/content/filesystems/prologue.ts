import { D, F, VNode } from '../../engine/vfs/vfs';

/** 프롤로그 증거 폴더 — 전부 허구 데이터 */
export const PROLOGUE_FS: VNode = D({
  'briefing.txt': F(`[AEGIS RESPONSE — 개인 메모 / 비공식]
사건: 미등록 · 작성자: 서준

2026-06-29 저녁, 어머니가 '은행 사기조사팀'을 사칭한 전화를 받고
3,800만 원을 이른바 '안전계좌'로 이체했다.
부모님 휴대폰에서 확보한 기록 사본이 ./evidence 에 있다.

목표
 1. 이 브리핑을 읽는다.                     (완료)
 2. 반복된 실제 발신 번호를 찾는다.          (발신 기록 집계)
 3. 재사용된 문자 템플릿 ID를 찾는다.        (문자 사본 분석)
 4. 사기 인프라(릴레이 호스트) 단서를 찾는다. (앱·링크 역추적)

결정적 증거가 화면에 드러나는 순간, 단서는 자동으로 확보된다.
팁: 표시 이름(DISPLAY)은 위조할 수 있어도, 경로에는 흔적이 남는다.
예:  grep "CALLER" evidence/call_metadata.log | cut -d" " -f4 | sort | uniq -c
막히면 hint 를 입력할 것.`),
  evidence: D({
    'call_metadata.log': F(`# 통신사 발신 메타데이터 사본 (수사 협조용 · 허구 데이터)
2026-06-29 19:12:40 DISPLAY="스팸의심" CALLER=070-4419-2201 DUR=00:00:12 ROUTE=pub
2026-06-29 20:41:03 DISPLAY="KB은행_고객센터" CALLER=070-8112-4437 DUR=00:04:12 ROUTE=relay-b
2026-06-29 20:47:55 DISPLAY="여론조사" CALLER=070-7712-0091 DUR=00:00:31 ROUTE=pub
2026-06-29 20:58:19 DISPLAY="서울지방검찰청" CALLER=070-8112-4437 DUR=00:07:03 ROUTE=relay-b
2026-06-29 21:14:02 DISPLAY="금융감독원" CALLER=070-8112-4437 DUR=00:05:44 ROUTE=relay-b
2026-06-29 21:22:37 DISPLAY="배송안내" CALLER=070-3301-8874 DUR=00:00:09 ROUTE=pub
2026-06-29 21:36:10 DISPLAY="KB은행_사기대응팀" CALLER=070-8112-4437 DUR=00:09:51 ROUTE=relay-b
2026-06-29 21:59:48 DISPLAY="서울지방경찰청" CALLER=070-8112-4437 DUR=00:06:27 ROUTE=relay-b
2026-06-29 22:13:05 DISPLAY="엄마친구" CALLER=010-5522-7716 DUR=00:01:40 ROUTE=pub
2026-06-29 22:31:22 DISPLAY="KB은행_고객센터" CALLER=070-8112-4437 DUR=00:03:18 ROUTE=relay-b
2026-06-29 23:02:51 DISPLAY="금융감독원_조사관" CALLER=070-8112-4437 DUR=00:11:02 ROUTE=relay-b
# 관찰: DISPLAY 는 매번 다르지만, 특정 발신 번호가 반복됨`),
    'sms_messages.txt': F(`# 수신 문자 사본
[20:43] FROM="KB안내" TEMPLATE_ID=TPL-ECHO-7
  "고객님 계좌에서 이상 거래가 감지되었습니다. 즉시 본인확인 바랍니다."
[21:16] FROM="금감원" TEMPLATE_ID=TPL-ECHO-7
  "귀하의 계좌가 범죄에 연루되었습니다. 조사관 배지번호 7741."
[21:38] FROM="KB보안" TEMPLATE_ID=TPL-ECHO-7
  "안전계좌 이체 후 링크에서 접수번호를 확인하십시오."
# 첨부 링크 원문(인코딩됨): evidence/link_payload.b64
# 동일 TEMPLATE_ID 가 발신자만 바꿔 반복 사용됨 — 대량 발송 도구의 흔적`),
    'link_payload.b64': F(
      'aHh4cDovL2tiLXZlcmlmeS5lY2hvLXJlbGF5LTAzLm1pcnJvcmNhbGwuZXhhbXBsZS9jb25maXJtP2lkPTc3NDE=',
    ),
    'app.bin': F(
      '\u0001\u0002MZ\u0000\u0007pkg=com.mirrorcall.overlay\u0003\u0001\u0005cert.issuer=echo-relay-03\u0002\u0004MC-BUILD-2214\u0001\u0006ui.skin=kb_clone_v3\u0000\u0002grant=SMS_READ,CALL_REDIRECT\u0001',
    ),
    'transfer_receipt.txt': F(`[이체 확인 — ○○저축은행 (허구)]
2026-06-29 21:52  금액: 38,000,000원
수취인: 엔엘에스크로 주식회사 (NL-ESCROW)
메모: 안전계좌-7741
* 접수번호 7741 이 문자 링크의 id 와 일치함`),
    'voice_transcript.txt': F(`[부분 녹취 전사 — 어머니 휴대폰 자동녹음]
남성: 어머님, 지금 시간이 없습니다. 계좌가 동결되기 전에…
남성: 저는 조사관 배지번호 7741, 금감원 파견입니다.
남성: 가족에게 알리시면 수사 방해로 함께 조사받게 됩니다.
(배경음: 동일한 안내 멘트가 겹쳐 들림 — 콜센터 환경으로 추정)`),
  }),
  notes: D({
    'memo_from_mom.txt': F(`준아, 엄마가 폰에 있는 건 하나도 안 지웠어.
네가 보라고 하면 다 보여줄게.
밥은 먹고 다니니. — 엄마`),
  }),
});
