import { D, F, VNode } from '../../engine/vfs/vfs';

/** Chapter 1 — 압수 릴레이 서버 포렌식 이미지 (전부 허구 데이터) */
export const ECHOGATE_FS: VNode = D({
  'briefing.txt': F(`[AEGIS RESPONSE — 사건 AR-2026-0714 "ECHOGATE"]
의뢰: 경찰청 사이버수사대 공조 요청
대상: 압수 릴레이 서버 'echo-relay-03' 포렌식 이미지 (읽기 전용 사본)
담당 분석관: 서준

목표
 1. 이미지 매니페스트 확인               cat image_manifest.txt
 2. 반복되는 운영자 콜사인 특정           (접근 로그 집계)
 3. 결제 라우팅 원장 파일 확보            (원장 파일을 찾아 읽을 것)
 4. 최대 정산 수취 법인 특정             (원장 금액 비교)
 5. 프롤로그 이체 수취처와의 연결 확인     (계좌 기록 디코드)

결정적 증거가 화면에 드러나는 순간, 단서는 자동으로 확보된다.
팁: 백업은 지워진 줄 알았던 것을 기억한다. find 로 bak 을 찾아라.
예:  grep "OPERATOR" srv/logs/relay_access.log | cut -d" " -f3 | sort | uniq -c`),
  'image_manifest.txt': F(`[체인 오브 커스터디 — AR-2026-0714]
대상: echo-relay-03 디스크 이미지 (압수 2026-06-30)
사본 해시: 9f3a17c2…(허구) · 원본 대조: 일치
마운트: 읽기 전용 / 격리 샌드박스
담당 분석관: 서준 (Aegis Response)
* 본 이미지의 어떤 파일도 수정되지 않는다. 분석은 사본 위에서만 수행된다.`),
  srv: D({
    logs: D({
      'relay_access.log': F(`# echo-relay-03 접근 로그 (압수 사본 · 허구 데이터)
2026-05-02 03:11:07 OPERATOR=dove-9 ACTION=route_update NODE=relay-b
2026-05-02 03:40:51 OPERATOR=harbor-2 ACTION=login NODE=relay-c
2026-05-03 01:22:34 OPERATOR=dove-9 ACTION=payout_export NODE=relay-b
2026-05-04 02:05:19 OPERATOR=mule-5 ACTION=login NODE=relay-b
2026-05-04 02:18:44 OPERATOR=dove-9 ACTION=route_update NODE=relay-b
2026-05-06 04:01:02 OPERATOR=dove-9 ACTION=payout_export NODE=relay-b
2026-05-07 03:12:58 OPERATOR=harbor-2 ACTION=script_upload NODE=relay-c
2026-05-09 01:47:31 OPERATOR=dove-9 ACTION=config_backup NODE=relay-b
2026-05-10 02:33:15 OPERATOR=mule-5 ACTION=login NODE=relay-c
2026-05-11 03:58:40 OPERATOR=dove-9 ACTION=payout_export NODE=relay-b
2026-05-13 02:44:09 OPERATOR=dove-9 ACTION=route_update NODE=relay-b
# 관찰: config_backup 실행 흔적 — 백업 자동삭제가 설정되지 않았음`),
      'auth_attempts.log': F(`# 인증 시도 기록 (부분)
2026-05-09 01:46:58 user=dove-9 result=OK note=백업_후_로그_정리_예정 (하지 않음)
2026-05-14 05:12:20 user=unknown result=FAIL src=external
2026-05-14 05:12:31 user=unknown result=FAIL src=external
# 운영 메모: /srv/backup 은 임시 폴더가 아님. 정리 담당 지정 바람 (미지정)`),
    }),
    backup: D({
      'config_old.bak': F(`# echo-relay-03 라우팅 설정 (구버전 백업 — 삭제 대상이었으나 방치됨)
route_primary=relay-b
payout_sheet=/srv/ledger/payout_routing.csv
escrow_ref=/srv/ledger/accounts.b64
admin_contact=dove-9
# TODO: 백업 자동삭제 걸어두기 (안 함)`),
      'notes_dev.txt': F(`(개발 메모 — 정리 안 됨)
- 정산은 매주 금요일. 원장은 ledger 폴더, 포맷 바꾸지 말 것. "본사" 지시.
- 주간 합산액은 에스크로 거쳐서 스윕. 컨트랙트 7번 참조.
- dove-9 형이 비번 돌려쓰지 말라는데 귀찮음
- tmp 에 export 남아있으면 지울 것 (안 지움)`),
    }),
    ledger: D({
      'payout_routing.csv': F(`week,route,recipient,amount_krw
2026-W18,relay-b,NL-ESCROW,182000000
2026-W18,relay-c,BLUEHARBOR LLC,41000000
2026-W19,relay-b,NL-ESCROW,205000000
2026-W19,relay-b,NORTHLINE FIDUCIARY SERVICES,996000000
2026-W20,relay-b,NL-ESCROW,178000000
2026-W20,relay-c,BLUEHARBOR LLC,36000000
2026-W21,relay-b,NORTHLINE FIDUCIARY SERVICES,1204000000
# NL-ESCROW 주간 합산액은 매주 NORTHLINE 계정으로 재이체됨 (sweep)`),
      'accounts.b64': F(
        'TkwtRVNDUk9XIDo6IOuqqOuyleyduCBOT1JUSExJTkUgRklEVUNJQVJZIFNFUlZJQ0VTIDo6IOqzhOyVveuyiO2YuCBOTEZTLUNPTlRSQUNULTcgOjog7KO86rCEIOyKpOyclShzd2VlcCkg7J6s7J207LK0IOuMgOyDgQ==',
      ),
    }),
    tmp: D({
      'export_0412.bin': F(
        '\u0002\u0001EX\u0000\u0005sweep_target=northline\u0003NLFS-CONTRACT-7\u0001\u0004build=mc-relay\u0002week_total_ref=payout_routing\u0000',
      ),
    }),
  }),
});
