import { ChapterDef } from '../engine/types';
import { PROLOGUE_FS } from './filesystems/prologue';
import { ECHOGATE_FS } from './filesystems/echogate';
import { UNLISTED_FS } from './filesystems/unlisted';
import { GHOSTLEDGER_FS } from './filesystems/ghostledger';
import { GHOSTLEDGER_DB } from './databases/ghostledger';
import { THEOFFER_FS } from './filesystems/theoffer';
import { THEOFFER_PYLAB } from './datasets/theoffer';
import { CLOSEDCIRCUIT_FS } from './filesystems/closedcircuit';
import { CLOSEDCIRCUIT_CCTV } from './cctv/closedcircuit';
import { BLACKSIGNAL_FS } from './filesystems/blacksignal';
import { BLACKSIGNAL_PKG } from './pkg/blacksignal';
import { TWINTALLY_FS } from './filesystems/twintally';
import { TWINTALLY_DB } from './databases/twintally';
import { BALLAST_FS } from './filesystems/ballast';
import { BALLAST_PYLAB } from './datasets/ballast';
import { CERTCHAIN_FS } from './filesystems/certchain';
import { CERTCHAIN_DB } from './databases/certchain';
import {
  DLG_PROLOGUE_FINALE,
  DLG_CH1_FINALE,
  DLG_CH2_FINALE,
  DLG_CH3_FINALE,
  DLG_CH4_FINALE,
  DLG_MOM_MESSAGE,
  DLG_NW_CONTACT,
  DLG_CH2_FAMILY,
  DLG_CH3_DCI,
  DLG_CH4_CONFLICT,
  DLG_CH4_GAWON,
  DLG_CH5_FINALE,
  DLG_CH5_MEMO,
  DLG_CH6_FINALE,
  DLG_CH6_KANG,
  DLG_CH7_NW,
  DLG_CH7_THREAT,
  DLG_CH7_FINALE,
  DLG_CH8_MODEL,
  DLG_CH8_TAIL,
  DLG_CH8_FINALE,
  DLG_CH9_MERIDIAN,
  DLG_CH9_THREAT,
  DLG_CH9_FINALE,
  dlgCh1Open,
  dlgCh2Open,
  dlgCh3Open,
  dlgCh4Open,
  dlgCh5Open,
  dlgCh6Open,
  dlgCh7Open,
  dlgCh8Open,
  dlgCh9Open,
} from './dialogues';

export const CHAPTERS: Record<number, ChapterDef> = {
  0: {
    id: 0,
    code: 'CASE 00',
    title: '프롤로그 — 걸려오지 않은 전화',
    root: '/cases/00_prologue',
    fs: PROLOGUE_FS,
    doneFlag: 'prologueDone',
    objectives: [
      { key: 'brief', label: '브리핑 읽기  (cat briefing.txt)' },
      { key: 'number', label: '반복 발신 번호 특정  (발신 기록 집계)' },
      { key: 'template', label: '재사용 문자 템플릿 특정  (문자 사본 분석)' },
      { key: 'relay', label: '릴레이 호스트 특정  (앱·링크 역추적)' },
    ],
    fileTriggers: { '00_prologue/briefing.txt': 'brief' },
    hints: {
      brief: ['모든 수사는 브리핑에서 시작한다.', 'ls 로 파일을 확인하고 cat 으로 읽는다.', 'cat briefing.txt'],
      number: [
        '표시 이름은 거짓말을 해도, 발신 경로의 번호는 반복된다.',
        'grep 으로 CALLER 줄만 추린 뒤, cut 으로 4번째 필드를 뽑아 sort | uniq -c 로 세어 보라.',
        'grep "CALLER" evidence/call_metadata.log | cut -d" " -f4 | sort | uniq -c',
      ],
      template: [
        '같은 대본은 같은 도장 자국을 남긴다.',
        '문자 사본에서 TEMPLATE_ID 를 grep 하라.',
        'grep "TEMPLATE_ID" evidence/sms_messages.txt',
      ],
      relay: [
        '가짜 앱과 문자 링크는 결국 같은 곳으로 전화를 건다.',
        'file 로 유형을 보고, 바이너리면 strings, 인코딩 텍스트면 base64 -d.',
        'strings evidence/app.bin  또는  base64 -d evidence/link_payload.b64',
      ],
    },
    scan(txt, done) {
      const out: { msg?: string; complete?: string }[] = [];
      if (!done.number && /070-8112-4437/.test(txt) && /^\s*\d+\s/m.test(txt))
        out.push({
          msg: '[단서 확보] 070-8112-4437 — 표시명 6종 뒤에 숨은 단일 발신원.',
          complete: 'number',
        });
      if (!done.template && /TPL-ECHO-7/.test(txt))
        out.push({
          msg: '[단서 확보] TPL-ECHO-7 — 발신자만 바꿔 재사용된 공포 유발 대본.',
          complete: 'template',
        });
      if (!done.relay && /echo-relay-03/.test(txt))
        out.push({
          msg: '[단서 확보] echo-relay-03 — 가짜 앱 인증서와 문자 링크가 같은 호스트를 가리킴.',
          complete: 'relay',
        });
      return out;
    },
    findings: {
      number:
        '표시명은 여섯 번 바뀌었지만, 발신원은 하나였다.\n070-8112-4437 — 이 번호가 어머니의 밤을 조각냈다.\n\n(데이터 확보: 반복 발신 번호)',
      template:
        '문자 세 통. 발신자만 다르고, 도장 자국은 같다.\nTPL-ECHO-7 — 대량 발송 도구의 지문이다.\n\n(데이터 확보: 재사용 문자 템플릿)',
      relay:
        '가짜 앱의 인증서도, 문자 속 링크도 같은 곳을 가리킨다.\necho-relay-03 — 개인이 아니라, 인프라다.\n\n(데이터 확보: 릴레이 호스트)',
    },
    board: {
      nodes: [
        { id: 'phone', k: '기기', t: '어머니의 휴대폰', cls: 'person', x: 6, y: 12 },
        { id: 'num', k: '발신번호', t: '070-8112-4437', cls: 'item', x: 34, y: 6 },
        { id: 'tpl', k: '문자 템플릿', t: 'TPL-ECHO-7', cls: 'item', x: 34, y: 44 },
        { id: 'app', k: '가짜 앱', t: 'kb_clone_v3 (사칭 앱)', cls: 'item', x: 10, y: 64 },
        { id: 'relay', k: '서버', t: 'echo-relay-03', cls: 'server', x: 62, y: 26 },
        { id: 'org', k: '조직?', t: '"mirrorcall" — 정체불명', cls: 'org', x: 80, y: 62 },
        { id: 'money', k: '자금', t: '3,800만원 → NL-ESCROW', cls: 'item', x: 62, y: 74 },
      ],
      good: [
        ['phone', 'num'],
        ['num', 'relay'],
        ['tpl', 'relay'],
        ['app', 'relay'],
        ['relay', 'org'],
      ],
      why: {
        'num-phone': '통화 기록 11건 중 7건이 이 번호에서 발신됨.',
        'num-relay': '해당 통화의 ROUTE 필드가 전부 relay-b — 릴레이 경유 흔적.',
        'relay-tpl': '문자 링크(base64)가 echo-relay-03 호스트를 가리킴.',
        'app-relay': '가짜 앱 인증서 발급자가 echo-relay-03.',
        'org-relay': '호스트명과 앱 패키지에 동일 문자열 "mirrorcall" 이 반복됨.',
      },
      deduce: `이건 우발적 사기가 아니다.<br><br>
· 표시명 위조 발신 <b>070-8112-4437</b><br>
· 재사용 협박 대본 <b>TPL-ECHO-7</b><br>
· 은행 사칭 앱 <b>kb_clone_v3</b><br><br>
세 갈래의 흔적이 전부 <b class="c-phos">echo-relay-03</b> 한 지점으로 모인다.<br>
그리고 그 호스트의 이름에 박힌 단어 — <b class="c-violet">"mirrorcall"</b>.<br><br>
어머니는 표적이었다. 그리고 표적을 고른 것은, 조직이다.`,
    },
    greeting: [
      'AEGIS FORENSIC SHELL v3.1 — 격리 샌드박스 (허구 데이터 전용)',
      '압수·제출 사본만을 다룹니다. 외부 네트워크 기능 없음.',
      '목표는 우측 MISSION 패널 · 막히면 hint · ls 로 시작.\n',
    ],
    finale: DLG_PROLOGUE_FINALE,
    caseSummary: {
      target: '피해자: 어머니 · 피해액 3,800만 원 · 수법: 기관 사칭 보이스피싱',
      clues: [
        { key: 'number', label: '반복 발신 번호' },
        { key: 'template', label: '문자 템플릿 TPL-ECHO-7' },
        { key: 'relay', label: '릴레이 호스트 echo-relay-03' },
      ],
      hypothesis: {
        locked: '단서 부족. 터미널에서 evidence 폴더를 분석할 것.',
        unlocked:
          '표시명 위조·대량 문자 도구·가짜 앱이 <b class="c-phos">동일 인프라(echo-relay-03)</b>를 공유한다.<br>단독범이 아닌 조직 — 증거 보드에서 연결을 완성할 것.',
      },
      safety:
        '본 워크스테이션의 모든 대상은 압수·제출된 사본의 <b>포렌식 이미지</b>다.<br>라이브 시스템 접속·공격 도구는 존재하지 않는다.',
    },
    ending: {
      doneTitle: '프롤로그 완료 — 걸려오지 않은 전화',
      summary: '핵심 단서 4건 확보 · 근거 연결 5건 완성',
      choiceFlag: 'finalChoice',
      choices: {
        aegis: '정식 등록 — 절차와 증거 보전을 택했다.',
        solo: '단독 추적 — 속도를 위해 그림자로 들어갔다.',
        family: '가족 우선 — 피해자의 목소리를 중심에 뒀다.',
      },
      nextTitle: 'CHAPTER 1 해금 — "EchoGate"',
      nextBody:
        '압수된 mirrorcall 릴레이 서버의 포렌식 이미지가 도착했다.<br>허술한 로그 관리, 반복된 내부 별칭, 지워지지 않은 결제 스프레드시트.<br>그리고 그 안에서 처음 등장하는 이름 — <b class="c-violet">Northline Fiduciary Services</b>.',
    },
  },
  1: {
    id: 1,
    code: 'CASE AR-2026-0714',
    title: 'Chapter 1 — EchoGate',
    root: '/cases/01_echo_gate',
    fs: ECHOGATE_FS,
    doneFlag: 'ch1Done',
    objectives: [
      { key: 'manifest', label: '이미지 매니페스트 확인  (cat image_manifest.txt)' },
      { key: 'alias', label: '반복 운영자 콜사인 특정  (접근 로그 집계)' },
      { key: 'ledger', label: '결제 라우팅 원장 확보  (원장 파일을 읽을 것)' },
      { key: 'company', label: '최대 정산 수취 법인 특정  (원장 금액 비교)' },
      { key: 'escrow', label: '프롤로그 수취처와 연결  (계좌 기록 디코드)' },
    ],
    fileTriggers: {
      'image_manifest.txt': 'manifest',
      'payout_routing.csv': 'ledger',
    },
    hints: {
      manifest: [
        '수사는 사본의 무결성 확인에서 시작한다.',
        '최상위 폴더를 ls 하고 매니페스트를 읽어라.',
        'cat image_manifest.txt',
      ],
      alias: [
        '운영자들은 서로를 콜사인으로 부른다. 접근 로그의 OPERATOR 필드.',
        'grep 으로 OPERATOR 줄을 추리고, cut -f3 로 콜사인만 뽑아 세어 보라.',
        'grep "OPERATOR" srv/logs/relay_access.log | cut -d" " -f3 | sort | uniq -c',
      ],
      ledger: [
        '지워졌어야 할 백업이, 지도의 역할을 한다.',
        'find bak 으로 백업을 찾고, 그 안의 payout_sheet 경로를 따라가라.',
        'cat srv/backup/config_old.bak  →  cat srv/ledger/payout_routing.csv',
      ],
      company: [
        '원장의 숫자 중 압도적으로 큰 줄이 있다.',
        'payout_routing.csv 에서 recipient 별 금액을 비교하라. grep NORTHLINE 도 좋다.',
        'grep "NORTHLINE" srv/ledger/payout_routing.csv',
      ],
      escrow: [
        '에스크로는 경유지일 뿐. 어디로 스윕되는가?',
        '.b64 확장자는 인코딩된 텍스트다. base64 -d 로 풀어라.',
        'base64 -d srv/ledger/accounts.b64',
      ],
    },
    scan(txt, done) {
      const out: { msg?: string; complete?: string }[] = [];
      if (!done.alias && /dove-9/.test(txt) && /^\s*\d+\s/m.test(txt))
        out.push({
          msg: '[단서 확보] dove-9 — 라우팅 변경·정산 내보내기·백업 실행의 핵심 운영자.',
          complete: 'alias',
        });
      if (!done.ledger && /amount_krw/.test(txt) && /NORTHLINE|NL-ESCROW/.test(txt))
        out.push({ complete: 'ledger' });
      if (!done.company && /NORTHLINE FIDUCIARY/.test(txt) && /\d{9,}/.test(txt))
        out.push({
          msg: '[단서 확보] NORTHLINE FIDUCIARY SERVICES — 주간 정산의 최대 수취 법인.',
          complete: 'company',
        });
      if (!done.escrow && /NL-ESCROW/.test(txt) && /모법인/.test(txt))
        out.push({
          msg: '[단서 확보] NL-ESCROW ↔ Northline — 어머니의 수취처가 스윕 관로 위에 있다.',
          complete: 'escrow',
        });
      return out;
    },
    findings: {
      alias:
        '로그 곳곳에 같은 콜사인 — dove-9.\n라우팅 변경, 정산 내보내기, 백업 실행. 전부 한 사람의 손이다.\n\n(데이터 확보: 핵심 운영자 콜사인)',
      ledger:
        '지워졌어야 할 백업이 원장의 위치를 알려줬다.\npayout_routing.csv — 돈의 지도를 손에 넣었다.\n\n(데이터 확보: 결제 라우팅 원장)',
      company:
        '주간 정산의 수취인 중 자릿수가 다른 이름 하나.\nNORTHLINE FIDUCIARY SERVICES — 9억, 그리고 12억.\n\n(데이터 확보: 최대 수취 법인)',
      escrow:
        'NL-ESCROW 의 모법인이 노스라인이라는 기록.\n어머니의 3,800만 원이 흘러간 관로가, 지금 눈앞에 있다.\n\n(데이터 확보: 에스크로 연결 고리)',
    },
    board: {
      nodes: [
        { id: 'img', k: '포렌식 이미지', t: 'echo-relay-03 (압수 사본)', cls: 'server', x: 6, y: 10 },
        { id: 'op', k: '운영자', t: '콜사인 dove-9', cls: 'person', x: 40, y: 4 },
        { id: 'bak', k: '방치된 백업', t: 'config_old.bak', cls: 'item', x: 8, y: 52 },
        { id: 'led', k: '결제 원장', t: 'payout_routing.csv', cls: 'item', x: 36, y: 62 },
        { id: 'esc', k: '경유 법인', t: 'NL-ESCROW (에스크로)', cls: 'org', x: 64, y: 30 },
        { id: 'nfs', k: '수취 법인', t: 'Northline Fiduciary Services', cls: 'org', x: 72, y: 66 },
      ],
      good: [
        ['img', 'op'],
        ['img', 'bak'],
        ['bak', 'led'],
        ['led', 'esc'],
        ['esc', 'nfs'],
      ],
      why: {
        'img-op': '라우팅 변경·정산 내보내기·백업 실행 — 접근 로그의 dove-9 흔적 7건.',
        'bak-img': '삭제됐어야 할 구버전 설정 백업이 이미지 안에 그대로 방치됨.',
        'bak-led': '백업의 payout_sheet 항목이 원장 파일 경로를 직접 가리킴.',
        'esc-led': '원장의 주간 정산 수취인에 NL-ESCROW 가 반복 기재됨.',
        'esc-nfs': 'accounts.b64 — NL-ESCROW 의 모법인이 Northline, 주간 스윕 재이체 대상.',
      },
      deduce: `수익의 관로가 드러났다.<br><br>
릴레이 수익 → 주간 정산 → <b>NL-ESCROW</b> → <b class="c-violet">NORTHLINE FIDUCIARY SERVICES</b> 로 스윕.<br><br>
어머니의 3,800만 원 수취처가, 정확히 이 관로 위에 있다.<br>
서류상 미러콜과 무관한 '신용정보' 법인 — 등기 임원은 전부 이름뿐인 사람들.<br><br>
다음 질문은 하나다. <b class="c-phos">노스라인의 주인은 누구인가.</b>`,
    },
    greeting: [
      'EVIDENCE MOUNT: /cases/01_echo_gate — 압수 이미지 (읽기 전용 · 허구 데이터)',
      '새 명령 해금: cut  (man cut 참고)',
      '목표는 우측 MISSION 패널 · 막히면 hint.\n',
    ],
    openedFlag: 'ch1Opened',
    opening: (flags) => dlgCh1Open((flags.finalChoice as string) ?? null),
    events: {
      alias: { flag: 'momMsgDone', beats: DLG_MOM_MESSAGE },
    },
    finale: DLG_CH1_FINALE,
    caseSummary: {
      target: '대상: 압수 릴레이 서버 echo-relay-03 포렌식 이미지 · 경찰청 공조',
      clues: [
        { key: 'manifest', label: '체인 오브 커스터디' },
        { key: 'alias', label: '핵심 운영자 dove-9' },
        { key: 'ledger', label: '결제 라우팅 원장' },
        { key: 'company', label: '최대 수취 법인 Northline' },
        { key: 'escrow', label: 'NL-ESCROW 연결' },
      ],
      hypothesis: {
        locked: '허술한 운영 흔적(방치된 백업·재사용 콜사인)을 파고들 것.',
        unlocked:
          '미러콜 수익이 <b class="c-phos">주간 정산 → NL-ESCROW → Northline 스윕</b> 관로를 따라 흐른다.<br>어머니의 이체 수취처가 이 관로 위에 있다 — 증거 보드에서 연결을 완성할 것.',
      },
      safety:
        '본 이미지는 법적 절차로 압수된 <b>읽기 전용 사본</b>이다.<br>원본은 어떤 방식으로도 변경되지 않는다.',
    },
    ending: {
      doneTitle: 'CHAPTER 1 완료 — EchoGate',
      summary: '압수 이미지 분석 완료 · 정산 관로 5연결 완성',
      choiceFlag: 'ch1Choice',
      choices: {
        report: '정식 보고 — 노스라인 연결을 기록에 남겼다.',
        shadow: '그림자 추적 — 보고서 밖에서 따로 판다.',
        family: '가족 공유 — 그 돈이 흘러간 곳을 먼저 알렸다.',
      },
      nextTitle: 'CHAPTER 2 예고 — "The Unlisted Number"',
      nextBody:
        '노스라인의 등기 임원은 전부 서류상 인물.<br>사라진 전직 미러콜 상담원, 연락이 끊긴 기자,<br>그리고 피해자들의 신원이 재사용된 금융 상품들.<br>암호화 채널의 <b class="c-violet">NW</b> 가 다시 신호를 보낸다 —<br>"당신은 돈을 따라가고 있다. 우리는 설계자를 따라간다."',
      nextNote: '새 도구 해금: map (네트워크 지도 · 관계 그래프 · 타임라인)',
    },
  },
  2: {
    id: 2,
    code: 'CASE AR-2026-0731',
    title: 'Chapter 2 — The Unlisted Number',
    root: '/cases/02_unlisted',
    fs: UNLISTED_FS,
    doneFlag: 'ch2Done',
    objectives: [
      { key: 'intake', label: '브리핑 읽기  (cat briefing.txt)' },
      { key: 'netmap', label: '네트워크 지도 동기화  (map)' },
      { key: 'unlisted', label: '미등재 공통 발신 번호 특정  (착신 기록 집계)' },
      { key: 'owner', label: '번호 개통 명의(도용) 특정  (가입정보 디코드·대조)' },
      { key: 'timeline', label: '실종 전후 타임라인 재구성  (map timeline)' },
    ],
    fileTriggers: { '02_unlisted/briefing.txt': 'intake' },
    hints: {
      intake: [
        '모든 수사는 브리핑에서 시작한다.',
        'ls 로 파일을 확인하고 cat 으로 읽는다.',
        'cat briefing.txt',
      ],
      netmap: [
        'NW 의 드롭은 이미 워크스테이션 도구에 동기화됐다.',
        '새로 해금된 도구를 실행해 보라. (man map 참고)',
        'map  → 네트워크 지도가 열린다',
      ],
      unlisted: [
        '서로 모르는 네 사람이, 같은 번호의 전화를 받는다.',
        'carrier/carrier_dump.log 에서 SRC 필드를 추출해 세어 보라.',
        'grep "SRC=" carrier/carrier_dump.log | cut -d" " -f3 | sort | uniq -c',
      ],
      owner: [
        '미등재 번호에도 개통 서류는 남는다.',
        'registry 의 .b64 를 base64 -d 로 풀고, victims/victim_ref.txt 와 대조하라.',
        'base64 -d registry/sim_registration.b64',
      ],
      timeline: [
        '조각난 날짜들은 도구가 이어 붙인다.',
        '번호와 명의를 확보했다면 netmap 이 시간 축을 재구성할 수 있다.',
        'map timeline',
      ],
    },
    scan(txt, done) {
      const out: { msg?: string; complete?: string }[] = [];
      if (!done.unlisted && /0505-0311-7742/.test(txt) && /^\s*\d+\s/m.test(txt))
        out.push({
          msg: '[단서 확보] 0505-0311-7742 — 임원 4인·실종자·기자를 모두 잇는 미등재 발신원.',
          complete: 'unlisted',
        });
      if (!done.owner && /명의: 박정순/.test(txt))
        out.push({
          msg: '[단서 확보] 개통 명의 박정순 — 유출된 피해자 신분증 사본으로 개통된 도용 회선.',
          complete: 'owner',
        });
      if (done.unlisted && done.owner && !done.timeline && /siren-11|서지원/.test(txt))
        out.push({ msg: '[분석] 시간 축이 조각나 있습니다. → map timeline 으로 재구성 가능.' });
      return out;
    },
    findings: {
      unlisted:
        '접점 없는 네 명의 유령이, 한 번호의 전화를 받는다.\n0505-0311-7742 — 번호부 어디에도 없는 지휘 회선.\n\n(데이터 확보: 미등재 공통 발신원)',
      owner:
        '개통 명의: 박정순. 피해자 목록에 있던 이름이다.\n훔친 신원으로 회선을 만들고, 그 회선으로 다음 피해자를 만든다.\n\n(데이터 확보: 도용 개통 명의)',
      timeline:
        '흩어져 있던 날짜들이 자리를 찾았다.\n제보선이 노출될 때마다 — 번호가 먼저 움직였다.\n\n(데이터 확보: 타임라인 재구성)',
    },
    board: {
      nodes: [
        { id: 'officers', k: '서류상 임원', t: '노스라인 등기 임원 4인', cls: 'org', x: 6, y: 8 },
        { id: 'num', k: '미등재 번호', t: '0505-0311-7742', cls: 'item', x: 40, y: 34 },
        { id: 'owner', k: '도용 명의', t: '박정순 — 피해자 신원 재사용', cls: 'person', x: 70, y: 6 },
        { id: 'yuna', k: '실종', t: "전 상담원 '유나' (siren-11)", cls: 'person', x: 6, y: 62 },
        { id: 'reporter', k: '기자', t: '서지원 — 연락 두절', cls: 'person', x: 38, y: 76 },
        { id: 'designer', k: '설계자?', t: '??? — 회선의 주인', cls: 'server', x: 72, y: 56 },
      ],
      good: [
        ['num', 'officers'],
        ['num', 'owner'],
        ['yuna', 'reporter'],
        ['num', 'yuna'],
        ['num', 'reporter'],
        ['num', 'designer'],
      ],
      why: {
        'num-officers': '매주 목요일 21시대, 접점 없는 임원 4인에게 순차 발신 — 지시 콜 패턴.',
        'num-owner': '통신사 가입정보 — 개통 명의가 피해자 박정순, 신분증 사본 위조 의심.',
        'reporter-yuna': '기자 취재 메모 — siren-11 제보 인터뷰 기록 (05-19 첫 접촉).',
        'num-yuna': '잠적 전날 밤 22:41, 183초 착신 — 다음 날 연락 두절.',
        'num-reporter': '연락 두절 직전 마지막 착신 94초 — "기사 내리면 제보자는 산다".',
        'designer-num': '임원(위장)과 제보자(위협)를 한 회선이 관리한다 — 회선의 주인이 설계자.',
      },
      deduce: `전화번호부 어디에도 없는 번호 하나가, 전부를 잇는다.<br><br>
· 서류상 임원 4인 — <b>매주 같은 시각의 지시 콜</b><br>
· 피해자 박정순 — <b>도용된 개통 명의</b><br>
· 실종된 siren-11 과 침묵한 기자 — <b>노출 직후의 착신</b><br><br>
<b class="c-phos">0505-0311-7742</b> 는 도구가 아니라 지휘 회선이다.<br>
그리고 회선의 주인 — <b class="c-violet">설계자</b>는 아직 이름이 없다.<br><br>
유나가 남긴 마지막 메모: <b>"진짜 장부는 종이다."</b>`,
    },
    greeting: [
      'EVIDENCE MOUNT: /cases/02_unlisted — 등기부·통신영장 회신·NW 드롭 병합 (허구 데이터)',
      '새 도구 해금: map  (map | map graph | map timeline — man map 참고)',
      '목표는 우측 MISSION 패널 · 막히면 hint.\n',
    ],
    openedFlag: 'ch2Opened',
    opening: (flags) => dlgCh2Open((flags.ch1Choice as string) ?? null),
    events: {
      unlisted: { flag: 'nwContactDone', beats: DLG_NW_CONTACT },
      owner: { flag: 'ch2FamilyDone', beats: DLG_CH2_FAMILY },
    },
    finale: DLG_CH2_FINALE,
    caseSummary: {
      target: '대상: 노스라인 등기부 + 통신영장 회신 + NW 드롭 병합 자료 · 경찰청 공조',
      clues: [
        { key: 'intake', label: '사건 브리핑' },
        { key: 'netmap', label: '네트워크 지도 동기화' },
        { key: 'unlisted', label: '미등재 발신 번호 0505-0311-7742' },
        { key: 'owner', label: '도용 개통 명의 박정순' },
        { key: 'timeline', label: '실종 전후 타임라인' },
      ],
      hypothesis: {
        locked: '접점 없는 임원 4인의 공통 착신원을 특정할 것. map 으로 지도를 열어라.',
        unlocked:
          '번호부에 없는 <b class="c-phos">단일 회선</b>이 서류상 임원(위장)과 제보자(위협)를 함께 관리한다.<br>회선의 주인이 <b class="c-violet">설계자</b>다 — 증거 보드에서 연결을 완성할 것.',
      },
      safety:
        '본 자료는 법적 절차로 회신·제출된 <b>읽기 전용 사본</b>이다.<br>실존 번호·인물·기관과 무관한 허구 데이터만을 다룬다.',
    },
    ending: {
      doneTitle: 'CHAPTER 2 완료 — The Unlisted Number',
      summary: '네트워크 지도 동기화 · 미등재 회선 특정 · 타임라인 재구성 · 근거 연결 6건 완성',
      choiceFlag: 'ch2Choice',
      choices: {
        search: '공식 수색 — 실종자와 기자의 안전을 절차에 맡겼다.',
        meet: 'NW 접선 — 유나를 먼저 찾기 위해 그림자와 손잡았다.',
        shield: '가족 보호 — 도용된 명의부터 지켰다.',
      },
      nextTitle: 'CHAPTER 3 예고 — "Ghost Ledger"',
      nextBody:
        '유나가 남긴 마지막 메모 — "장부는 서버에 없다. 진짜 장부는 종이다."<br>노스라인의 회계는 두 벌이다. 서버의 것과, 설계자의 것.<br>압수 문서고의 스캔 사본이 DB 콘솔에 적재된다 —<br><b class="c-violet">query</b> 가 해금되고, 자금 세탁의 관로가 열린다.',
      nextNote: '새 도구 해금: query (읽기 전용 SQL 포렌식 콘솔)',
    },
  },
  3: {
    id: 3,
    code: 'CASE AR-2026-0808',
    title: 'Chapter 3 — Ghost Ledger',
    root: '/cases/03_ghost_ledger',
    fs: GHOSTLEDGER_FS,
    db: GHOSTLEDGER_DB,
    doneFlag: 'ch3Done',
    objectives: [
      { key: 'intake', label: '브리핑 읽기  (cat briefing.txt)' },
      { key: 'schema', label: '포렌식 DB 스키마 확인  (query)' },
      { key: 'shells', label: '피해 자금 최대 수취 셸 특정  (GROUP BY + SUM)' },
      { key: 'ladder', label: '모법인 사다리로 배후 지주사 도달  (셸컴퍼니 조회)' },
      { key: 'dci', label: '은닉 위험지수 필드 발견  (위험 점수 조회)' },
      { key: 'overlap', label: '미러콜 인프라와 겹치는 결제 라우팅  (조인/라우팅 조회)' },
    ],
    fileTriggers: { '03_ghost_ledger/briefing.txt': 'intake' },
    hints: {
      intake: [
        '모든 수사는 브리핑에서 시작한다.',
        'ls 로 파일을 확인하고 cat 으로 읽는다.',
        'cat briefing.txt',
      ],
      schema: [
        '어떤 테이블이 있는지부터 봐야 한다.',
        'query 를 인자 없이 실행하면 테이블·컬럼 목록이 나온다.',
        'query',
      ],
      shells: [
        '피해 자금이 어디로 가장 많이 모이는가?',
        'transactions 를 recipient 로 묶고 amount_krw 를 합산해 큰 순으로 정렬하라.',
        'query SELECT recipient, SUM(amount_krw) AS total FROM transactions GROUP BY recipient ORDER BY total DESC',
      ],
      ladder: [
        '셸은 홀로 서지 않는다. 모법인을 따라 올라가라.',
        'shell_companies 의 name 과 parent 를 조회해 사다리 끝을 확인하라.',
        'query SELECT name, parent FROM shell_companies',
      ],
      dci: [
        '피해자가 "점수"로 매겨져 있다. 어떤 모델이 그랬나?',
        'risk_scores 테이블을 조회하라. class 가 high_liquidation 인 행을 보라.',
        "query SELECT * FROM risk_scores WHERE class = 'high_liquidation'",
      ],
      overlap: [
        '자금 관로가 미러콜의 릴레이 인프라를 재사용했는가?',
        'payment_routes 의 relay_alias 를 보거나, transactions 와 조인하라.',
        "query SELECT account, shell, relay_alias FROM payment_routes WHERE relay_alias = 'echo-relay-03'",
      ],
    },
    scan(txt, done) {
      const out: { msg?: string; complete?: string }[] = [];
      if (!done.shells && /NL-ESCROW/.test(txt) && /82000000/.test(txt))
        out.push({
          msg: '[단서 확보] NL-ESCROW — 피해 자금이 압도적으로 모이는 최대 수취 셸(주간 합산 8,200만).',
          complete: 'shells',
        });
      if (!done.ladder && /GREYFOX ANALYTICS/.test(txt) && /ORBIS VALE CAPITAL/.test(txt))
        out.push({
          msg: '[단서 확보] 모법인 사다리 — NL-ESCROW→Northline→Greyfox→ORBIS VALE CAPITAL.',
          complete: 'ladder',
        });
      if (!done.dci && /GREYFOX-DCI/.test(txt))
        out.push({
          msg: '[단서 확보] Distress Conversion Index — Greyfox 의 위험 모델이 피해자를 "청산 확률"로 점수화.',
          complete: 'dci',
        });
      if (!done.overlap && /echo-relay-03/.test(txt) && /ACCT-/.test(txt))
        out.push({
          msg: '[단서 확보] 결제 라우팅이 미러콜 릴레이(echo-relay-03)를 재사용 — 사기와 투자모델이 한 몸.',
          complete: 'overlap',
        });
      return out;
    },
    findings: {
      shells:
        '피해 자금은 흩어지지 않았다. 한 곳으로 모인다.\nNL-ESCROW — 주간 8,200만 원. 어머니의 돈도 이 강으로 흘렀다.\n\n(데이터 확보: 최대 수취 셸)',
      ladder:
        '셸을 타고 올라가니 사다리 끝에 이름이 있다.\nGreyfox Analytics — 그리고 그 위, ORBIS VALE CAPITAL.\n\n(데이터 확보: 배후 지주사 사다리)',
      dci:
        '피해자마다 붙은 숫자 — Distress Conversion Index.\n곤경을 "청산 확률"로 환산하는 모델. 어머니는 87점이었다.\n\n(데이터 확보: 은닉 위험지수 DCI)',
      overlap:
        '결제 계좌가 echo-relay-03 을 다시 쓴다.\n사기 인프라와 "투자 모델"이 같은 배관을 공유한다 — 한 몸이었다.\n\n(데이터 확보: 인프라 재사용)',
    },
    events: {
      dci: { flag: 'ch3DciDone', beats: DLG_CH3_DCI },
    },
    board: {
      nodes: [
        { id: 'victims', k: '피해자군', t: '피해자 프로파일 (DCI 대상)', cls: 'person', x: 6, y: 12 },
        { id: 'dci', k: '위험 모델', t: 'Distress Conversion Index', cls: 'item', x: 34, y: 8 },
        { id: 'shells', k: '수취 사다리', t: 'NL-ESCROW → Northline', cls: 'org', x: 10, y: 60 },
        { id: 'greyfox', k: '데이터 자회사', t: 'Greyfox Analytics', cls: 'org', x: 48, y: 42 },
        { id: 'orbis', k: '지주사', t: 'ORBIS VALE CAPITAL', cls: 'org', x: 80, y: 20 },
        { id: 'overlap', k: '인프라 재사용', t: '결제 라우팅 ↔ echo-relay-03', cls: 'server', x: 52, y: 74 },
      ],
      good: [
        ['victims', 'dci'],
        ['dci', 'greyfox'],
        ['victims', 'shells'],
        ['shells', 'greyfox'],
        ['greyfox', 'orbis'],
        ['overlap', 'shells'],
      ],
      why: {
        'dci-victims': 'risk_scores — 피해자 전원이 GREYFOX-DCI 모델로 청산확률 점수화됨.',
        'dci-greyfox': '모델명 GREYFOX-DCI-v3 — 운영 주체가 Greyfox Analytics.',
        'shells-victims': 'transactions — 피해 자금이 NL-ESCROW 로 최대 유입(주간 8,200만).',
        'greyfox-shells': 'shell_companies — 수취 사다리(NL-ESCROW→Northline)의 상위가 Greyfox.',
        'greyfox-orbis': 'shell_companies — Greyfox Analytics 의 모법인이 ORBIS VALE CAPITAL.',
        'overlap-shells': 'payment_routes — 셸 계좌가 미러콜 릴레이 echo-relay-03 재사용.',
      },
      deduce: `피해자는 두 번 사용됐다. 한 번은 털렸고, 한 번은 <b>계산</b>됐다.<br><br>
· 자금은 <b class="c-phos">NL-ESCROW</b> 로 모여 사다리를 타고 오르고<br>
· 같은 피해자는 <b>Distress Conversion Index</b> 로 "청산 확률"이 매겨지며<br>
· 결제 라우팅은 미러콜의 <b>echo-relay-03</b> 을 그대로 재사용한다.<br><br>
세 갈래가 전부 한 지붕 아래로 모인다 — <b class="c-violet">ORBIS VALE CAPITAL</b>.<br>
사기와 투자모델은 두 사업이 아니라, 하나의 파이프라인이었다.<br><br>
그러나 이건 서버의 장부다. 유나가 말한 <b>진짜 장부</b>는 아직 종이 위에 있다.`,
    },
    greeting: [
      'EVIDENCE MOUNT: /cases/03_ghost_ledger — 법원 인가 포렌식 DB 사본 (읽기 전용 · 허구 데이터)',
      '새 도구 해금: query  (인자 없이 실행 → 스키마 · man query 참고)',
      '목표는 우측 MISSION 패널 · 막히면 hint.\n',
    ],
    openedFlag: 'ch3Opened',
    opening: (flags) => dlgCh3Open((flags.ch2Choice as string) ?? null),
    finale: DLG_CH3_FINALE,
    caseSummary: {
      target: '대상: 붕괴 결제대행사 압수 DB 사본 · 법원 인가 포렌식 열람 · 경찰청 공조',
      clues: [
        { key: 'intake', label: '사건 브리핑' },
        { key: 'schema', label: 'DB 스키마' },
        { key: 'shells', label: '최대 수취 셸 NL-ESCROW' },
        { key: 'ladder', label: '지주사 사다리 → Orbis Vale' },
        { key: 'dci', label: '은닉 위험지수 DCI' },
        { key: 'overlap', label: '미러콜 인프라 재사용' },
      ],
      hypothesis: {
        locked: 'query 콘솔로 결제 원장·위험 점수를 조회할 것. 인자 없이 query 로 스키마부터.',
        unlocked:
          '피해자가 <b class="c-phos">DCI 로 점수화</b>되고 자금이 <b class="c-phos">사다리로 상납</b>되며, 둘 다 <b class="c-violet">Orbis Vale</b> 산하 Greyfox 로 수렴한다.<br>증거 보드에서 관계를 완성할 것.',
      },
      safety:
        '본 DB 는 법원 인가로 열람하는 <b>읽기 전용 포렌식 사본</b>이다.<br>SELECT 조회만 가능하며 원본·라이브 시스템에는 접근하지 않는다.',
    },
    ending: {
      doneTitle: 'CHAPTER 3 완료 — Ghost Ledger',
      summary: 'DB 포렌식 완료 · DCI 모델 적발 · 지주사 사다리 · 근거 연결 6건 완성',
      choiceFlag: 'ch3Choice',
      choices: {
        refer: '정식 이관 — 검찰·규제기관에 포렌식 결과를 넘겼다.',
        offer: '제안 수락 — NW 의 봉인 아카이브로 향한다.',
        victims: '피해자 우선 — 사람에게 먼저 알렸다.',
      },
      nextTitle: 'CHAPTER 4 예고 — "The Offer"',
      nextBody:
        'NW 가 Orbis Vale 내부의 봉인 아카이브를 내민다. 불완전하고, 어쩌면 오염됐다.<br>이지스는 수사 중단을 압박하고, 가족은 종결을 원한다.<br><b class="c-violet">python</b> 분석 랩이 열리고 — 유출의 윤리가 시험대에 오른다.',
      nextNote: '· 새 도구 해금: python 격리 분석 랩 ·',
    },
  },
  4: {
    id: 4,
    code: 'CASE AR-2026-0815',
    title: 'Chapter 4 — The Offer',
    root: '/cases/04_the_offer',
    fs: THEOFFER_FS,
    pylab: THEOFFER_PYLAB,
    doneFlag: 'ch4Done',
    objectives: [
      { key: 'intake', label: '브리핑 읽기  (cat briefing.txt)' },
      { key: 'lab', label: '격리 분석 랩 접속  (python)' },
      { key: 'reuse', label: '피해자 신원 재사용 탐지  (python reuse)' },
      { key: 'approve', label: '임원 승인 상관 분석  (python approve)' },
      { key: 'verify', label: '아카이브 무결성 검증  (python verify)' },
      { key: 'summary', label: '증거 요약 생성  (python summary)' },
    ],
    fileTriggers: { '04_the_offer/briefing.txt': 'intake' },
    hints: {
      intake: [
        '모든 수사는 브리핑에서 시작한다.',
        'ls 로 파일을 확인하고 cat 으로 읽는다.',
        'cat briefing.txt',
      ],
      lab: [
        '새 도구는 언제나 인자 없이 먼저.',
        'python 을 인자 없이 실행하면 데이터셋·템플릿 목록이 나온다.',
        'python',
      ],
      reuse: [
        '미러콜이 판 신원이 "딜 파이프라인"에 다시 나타난다.',
        'python reuse 로 골격을 보라. 소싱 채널은 미러콜, 임계는 watch 등급 경계(Ch3 위험 점수).',
        'python reuse min=60 source=MirrorCall',
      ],
      approve: [
        '모델 승인 주간에, 누가 그 방에 있었나.',
        'Ch3 executive_messages 를 떠올려라 — GREYFOX-DCI 정산 파트너십 승인은 누가, 몇 주차였나.',
        'python approve officer=배광호 week=2026-W20',
      ],
      verify: [
        '출처 불명 자료는 반드시 법원 사본과 대조한다.',
        'rule 을 date / amount / ref 로 하나씩 검증하고, 전부 보려면 all.',
        'python verify rule=all',
      ],
      summary: [
        '분석 결과를 숫자로 못 박아야 보고서가 된다.',
        'reuse 의 후보 건수와 verify rule=all 의 위반 건수를 그대로 넣어라.',
        'python summary reused=4 tainted=3',
      ],
    },
    scan(txt, done) {
      const out: { msg?: string; complete?: string }[] = [];
      if (
        !done.reuse &&
        /재사용 후보 4건/.test(txt) &&
        /박정순/.test(txt) &&
        /조성태/.test(txt) &&
        /윤미란/.test(txt) &&
        /김호영/.test(txt)
      )
        out.push({
          msg: '[단서 확보] 신원 재사용 — 미러콜 소싱 피해자 4인이 부실자산 딜 파이프라인에 재등장.',
          complete: 'reuse',
        });
      if (!done.approve && /⇔ 결재 대조/.test(txt) && /BDG-0117/.test(txt) && /배광호/.test(txt))
        out.push({
          msg: '[단서 확보] 승인 상관 — 배광호 배지가 DCI 정산 승인 주간 VAULT-B 에서 활성.',
          complete: 'approve',
        });
      if (!done.verify && /무결성 위반 3건/.test(txt) && /AR-207/.test(txt))
        out.push({
          msg: '[단서 확보] 오염 3행 — 개설 전 거래 · 금액 변조 · 유령 셸 참조. 주입된 덫이다.',
          complete: 'verify',
        });
      if (!done.summary && /EVIDENCE SUMMARY/.test(txt) && /검증 완료/.test(txt))
        out.push({
          msg: '[단서 확보] 증거 요약 — 검증본 확정. 이제 이 장부는 무기다.',
          complete: 'summary',
        });
      return out;
    },
    findings: {
      reuse:
        '네 사람. 어머니와 같은 목록에 있던 이름들이\n이번엔 "딜 파이프라인"에 올라 있다.\n피해자는 두 번 팔렸다 — 한 번은 사기에, 한 번은 상품에.\n\n(데이터 확보: 신원 재사용 4건)',
      approve:
        '우연이 아니다. 승인 주간, 그 금고동, 그 배지.\n배광호 — 서류상 대표의 배지가 실제로 움직였다.\n서류 뒤에, 손이 있다.\n\n(데이터 확보: 임원 승인 상관)',
      verify:
        '세 줄. 개설 전 거래, 부풀린 금액, 유령 셸.\n누군가 이 아카이브가 통째로 불타길 바랐다.\n검증 없이 터뜨렸다면 — 우리가 불쏘시개였다.\n\n(데이터 확보: 오염 3행 색출)',
      summary:
        '재사용 4건. 승인 상관. 오염 3행 격리.\n이제 이 장부는 소문이 아니라 — 검증된 무기다.\n\n(데이터 확보: 증거 요약)',
    },
    events: {
      verify: { flag: 'ch4Verify', beats: DLG_CH4_CONFLICT },
      approve: { flag: 'ch4GawonMet', beats: DLG_CH4_GAWON },
    },
    board: {
      nodes: [
        { id: 'archive', k: '봉인 아카이브', t: 'Orbis Vale 내부 사본 (NW 전달)', cls: 'server', x: 42, y: 8 },
        { id: 'reuse', k: '신원 재사용', t: '미러콜 피해자 4인 → 딜 파이프라인', cls: 'person', x: 8, y: 32 },
        { id: 'approve', k: '임원 승인', t: '배광호 배지 · DCI 정산 승인(W20)', cls: 'org', x: 78, y: 18 },
        { id: 'gawon', k: 'DCI 설계자', t: '윤가원 (Greyfox 리스크)', cls: 'person', x: 10, y: 70 },
        { id: 'taint', k: '오염 3행', t: 'AR-091 · AR-124 · AR-207 (주입)', cls: 'item', x: 72, y: 56 },
        { id: 'dilemma', k: '유출 딜레마', t: '공개 방식 = 증거와 사람의 운명', cls: 'item', x: 42, y: 78 },
      ],
      good: [
        ['archive', 'reuse'],
        ['reuse', 'gawon'],
        ['approve', 'archive'],
        ['taint', 'archive'],
        ['taint', 'dilemma'],
        ['reuse', 'dilemma'],
      ],
      why: {
        'archive-reuse': 'deal_pipeline — 미러콜 소싱 피해자 4인의 신원이 아카이브 딜 목록에 재등장.',
        'gawon-reuse': '재사용 대상 선별 기준이 GREYFOX-DCI 점수 — 모델 설계자는 윤가원.',
        'approve-archive': 'access_logs × 결재 — 배광호 배지가 승인 주간(W20) VAULT-B 에서 활성.',
        'archive-taint': '법원 사본 대조 — 3행이 불일치(개설 전 거래·금액 변조·유령 셸). 주입 흔적.',
        'dilemma-taint': '오염 행을 제거하지 않은 공개는 전체 증거를 "조작"으로 만든다 — 심어진 덫.',
        'dilemma-reuse': '공개 방식에 따라 피해자 신원이 다시 노출된다 — 공개의 윤리 문제.',
      },
      deduce: `내부 문서는 진실을 담았다. 그러나 누군가 그 안에 <b>거짓 세 줄</b>을 심었다.<br><br>
· 미러콜 소싱 피해자 4인이 <b class="c-phos">딜 파이프라인</b>에 재등장하고<br>
· <b>배광호</b>의 배지가 DCI 정산 승인 주간의 VAULT-B 에서 활성이며<br>
· 세 행(AR-091·124·207)은 법원 사본과 <b class="c-amber">불일치</b> — 공개를 기다리는 덫이다.<br><br>
검증 없이는, 진실조차 무기가 되지 못한다.<br>
이제 결정해야 한다 — 이 장부를 세상에 어떻게 내놓을 것인가.`,
    },
    greeting: [
      'EVIDENCE MOUNT: /cases/04_the_offer — NW 제공 봉인 아카이브 사본 (격리 랩 · 허구 데이터 · 무결성 미검증)',
      '새 도구 해금: python  (인자 없이 실행 → 랩 개요 · man python 참고)',
      '사내 상태: 전면 보류 — 본 분석은 개인 보전 사본으로 진행됩니다.\n',
    ],
    openedFlag: 'ch4Opened',
    opening: (flags) => dlgCh4Open((flags.ch3Choice as string) ?? null),
    finale: DLG_CH4_FINALE,
    caseSummary: {
      target: '대상: Orbis Vale 봉인 아카이브 사본 · 출처 NW(무결성 미검증) · 사내 상태: 전면 보류',
      clues: [
        { key: 'intake', label: '사건 브리핑' },
        { key: 'lab', label: '격리 랩 접속' },
        { key: 'reuse', label: '신원 재사용 4건' },
        { key: 'approve', label: '임원 승인 상관 (배광호)' },
        { key: 'verify', label: '오염 3행 색출' },
        { key: 'summary', label: '검증된 증거 요약' },
      ],
      hypothesis: {
        locked: 'python 랩에서 재사용 → 승인 상관 → 무결성 순으로 검증할 것. 인자 없이 python 부터.',
        unlocked:
          '아카이브는 <b class="c-phos">진짜</b>다 — 재사용 4건·승인 상관이 법원 사본과 정합한다.<br>단, <b class="c-amber">오염 3행</b>이 심겨 있다. 검증본만이 무기가 된다 — 증거 보드에서 관계를 완성할 것.',
      },
      safety:
        '봉인 아카이브는 격리 랩에서만 여는 <b>읽기 전용 사본</b>이다.<br>랩은 저작된 분석 골격의 빈칸만 계산하며 침투·접속·실제 코드 실행이 없다.',
    },
    ending: {
      doneTitle: 'CHAPTER 4 완료 — The Offer',
      summary: '격리 랩 분석 완료 · 오염 3행 색출 · 유출 결정 기록 · 근거 연결 6건 완성',
      choiceFlag: 'ch4Leak',
      choices: {
        now: '즉시 공개 — 검증을 기다리지 않고 통째로 세상에 던졌다.',
        verify: '검증 후 공개 — 오염을 제거한 검증본만 내놓았다.',
        channel: '한정 공유 — 신뢰 기자와 규제기관의 손에 맡겼다.',
        reject: '유출 거부 — 이 아카이브는 법정에서만 쓴다.',
      },
      nextTitle: 'CHAPTER 5 예고 — "The Closed Circuit"',
      nextBody:
        '유나가 마지막으로 찍힌 환승역 — 법원 인가 CCTV 증거 패키지가 도착한다.<br>카메라 사이의 시계는 어긋나 있고, 몇 개의 프레임은 지워져 있다.<br><b class="c-violet">cctv</b> 증거 리뷰가 열리고 — 사라진 사람의 경로를 재구성한다.',
      nextNote: '· 새 도구 해금: cctv 증거 리뷰 + CCTV REVIEW 창 ·',
    },
  },
  5: {
    id: 5,
    code: 'CASE AR-2026-0822',
    title: 'Chapter 5 — The Closed Circuit',
    root: '/cases/05_closed_circuit',
    fs: CLOSEDCIRCUIT_FS,
    cctv: CLOSEDCIRCUIT_CCTV,
    doneFlag: 'ch5Done',
    objectives: [
      { key: 'intake', label: '브리핑 읽기  (cat briefing.txt)' },
      { key: 'sync', label: '카메라 시계 동기화  (cctv sync — 앵커 이벤트 대조)' },
      { key: 'gap', label: '결손 프레임 탐지  (cctv gaps)' },
      { key: 'badge', label: '배지 로그 대조  (cctv badge)' },
      { key: 'route', label: '유나 경로 재구성  (cctv route)' },
      { key: 'tamper', label: '편집(조작) 주체 특정  (cctv meta)' },
    ],
    fileTriggers: { '05_closed_circuit/briefing.txt': 'intake' },
    hints: {
      intake: [
        '모든 수사는 브리핑에서 시작한다.',
        'ls 로 파일을 확인하고 cat 으로 읽는다.',
        'cat briefing.txt',
      ],
      sync: [
        '같은 사건은 모든 카메라에 같은 순간 찍힌다 — 시계가 정직하다면.',
        'cctv view 로 역내 방송(20:40:10)과 조명 플리커(20:43:55)의 로컬 시각을 카메라끼리 대조하라. 차이가 곧 오차다.',
        'cctv sync CAM-C +47s  그리고  cctv sync CAM-D -02:15',
      ],
      gap: [
        '잘라낸 영상도 프레임 카운터는 이어 붙는다.',
        '타임코드 점프와 프레임 카운터를 비교하라 — 사설 통로 카메라가 수상하다.',
        'cctv gaps CAM-D',
      ],
      badge: [
        '배지 시스템의 시계는 정확하다. 카메라를 그 시계에 맞춰라.',
        'CAM-D 를 보정한 뒤, 도어 개방 시각과 배지 스와이프를 대조하라.',
        'cctv badge',
      ],
      route: [
        '보정된 시간 위에서만 사람의 동선이 이어진다.',
        '전 카메라 보정 후 유나의 목격 이벤트를 시간순으로 재구성하라.',
        'cctv route',
      ],
      tamper: [
        '편집 도구는 파일에 서명을 남긴다.',
        '결손이 있는 클립의 메타데이터에서 최종 기록 도구를 확인하라.',
        'cctv meta CAM-D',
      ],
    },
    scan(txt, done) {
      const out: { msg?: string; complete?: string }[] = [];
      if (!done.sync && /MASTER TIMELINE/.test(txt) && /보정 완료/.test(txt))
        out.push({
          msg: '[단서 확보] 시계 동기화 — CAM-C +47s · CAM-D −02:15. 오차는 우연이 아니라 은폐다.',
          complete: 'sync',
        });
      if (!done.gap && /CAM-D 결손 02:18/.test(txt))
        out.push({
          msg: '[단서 확보] 결손 프레임 — 도어 개방 직후 02:18 이 잘려 나갔다. 카운터는 봉합됐다.',
          complete: 'gap',
        });
      if (!done.badge && /SEC-CERITON-04/.test(txt) && /도경식/.test(txt) && /일치/.test(txt))
        out.push({
          msg: '[단서 확보] 배지 대조 — 도어 개방 2초 전, 세리톤 배지(도경식) 스와이프.',
          complete: 'badge',
        });
      if (
        !done.route &&
        /경로 재구성/.test(txt) &&
        /탑승 기록 없음/.test(txt) &&
        /사설 통로 경유 이송/.test(txt)
      )
        out.push({
          msg: '[단서 확보] 경로 재구성 — A→B→C(미탑승)→D 사설 통로. 자발 이탈이 아니다.',
          complete: 'route',
        });
      if (!done.tamper && /ceriton-mux/.test(txt) && /세리톤 시큐리티/.test(txt))
        out.push({
          msg: '[단서 확보] 편집 주체 — 클립 서명 ceriton-mux, 세리톤 시큐리티(도경식).',
          complete: 'tamper',
        });
      return out;
    },
    findings: {
      sync:
        '초침 두 개가 거짓말을 하고 있었다.\n승강장은 47초 빠르게, 통로는 2분 15초 느리게 —\n핸드오프의 앞뒤를 서로 못 잇게 만드는 오차다.\n\n(데이터 확보: 시계 드리프트 보정)',
      gap:
        '2분 18초. 도어가 열린 직후부터.\n프레임 카운터는 아무 일 없다는 듯 이어져 있다.\n잘라내고, 꿰맨 것이다.\n\n(데이터 확보: 결손 구간 특정)',
      badge:
        '20:47:08 — SEC-CERITON-04.\n도어가 열리기 2초 전, 도경식의 배지가 그 문을 열었다.\n통로를 연 손은 외부인이 아니었다.\n\n(데이터 확보: 배지 대조)',
      route:
        '그녀는 승강장까지 갔다. 그리고 열차에 타지 않았다.\n대신 — 사설 통로의 문이 열렸다.\n사라진 게 아니라, 옮겨진 것이다.\n\n(데이터 확보: 경로 재구성)',
      tamper:
        'ceriton-mux. 편집 도구가 제 이름을 서명해 뒀다.\n세리톤 시큐리티 — 오르비스 베일의 보안 하청.\n증거를 자른 손까지 같은 지붕 아래다.\n\n(데이터 확보: 조작 주체 특정)',
    },
    events: {
      route: { flag: 'ch5RouteDone', beats: DLG_CH5_MEMO },
    },
    board: {
      nodes: [
        { id: 'yuna', k: '목격자', t: '유나 (siren-11) — 최종 목격', cls: 'person', x: 8, y: 12 },
        { id: 'drift', k: '시계 조작', t: '드리프트 +47s / −02:15', cls: 'item', x: 42, y: 6 },
        { id: 'gap', k: '결손 구간', t: 'CAM-D 02:18 절삭 (봉합)', cls: 'item', x: 76, y: 16 },
        { id: 'badge', k: '배지 기록', t: 'SEC-CERITON-04 · 도경식', cls: 'org', x: 74, y: 56 },
        { id: 'route', k: '사설 이송로', t: '서비스 통로 — 부축 진입 후 공백', cls: 'server', x: 38, y: 44 },
        { id: 'memo', k: '침묵 각서', t: '서명란이 빈 각서 초안', cls: 'item', x: 10, y: 72 },
      ],
      good: [
        ['yuna', 'route'],
        ['drift', 'gap'],
        ['badge', 'route'],
        ['gap', 'badge'],
        ['route', 'memo'],
        ['yuna', 'memo'],
      ],
      why: {
        'route-yuna': '경로 재구성 — 미탑승 직후 사설 통로 도어 개방, 부축 형태 진입.',
        'drift-gap': '시계 오차가 결손 구간의 앞뒤 대조를 막는다 — 절삭을 숨기는 은폐 장치.',
        'badge-route': '도어 개방 2초 전 세리톤 배지 스와이프 — 통로를 연 주체.',
        'badge-gap': '결손 클립의 편집 서명(ceriton-mux)과 배지 소속이 같은 회사 — 세리톤.',
        'memo-route': '통로 물품보관함 유류품 — 이송 직전까지 서명을 강요당한 정황.',
        'memo-yuna': '각서의 "본인"은 유나 — 서명 거부가 이송의 동기다.',
      },
      deduce: `그녀는 사라진 게 아니라 <b>옮겨졌다</b>.<br><br>
· 카메라의 시계를 비틀고(<b class="c-amber">+47s / −02:15</b>)<br>
· 도어가 열린 직후 <b>02:18</b> 을 잘라 봉합했으며<br>
· 그 문을 연 배지도, 영상을 자른 서명도 — <b class="c-violet">세리톤 시큐리티(도경식)</b> 다.<br><br>
카메라의 시간을 조작한 손과 그녀를 통로로 민 손은 <b>같은 회사</b>의 것이다.<br>
그리고 그 회사의 계약서는, 오르비스 베일의 결재선으로 이어진다.`,
    },
    greeting: [
      'EVIDENCE MOUNT: /cases/05_closed_circuit — 법원 인가 CCTV 열람 사본 (허구 데이터 · 원본 봉인)',
      '새 도구 해금: cctv  (인자 없이 실행 → 카메라 목록 · man cctv 참고)',
      '태스크바의 CCTV REVIEW 창에서 스틸·메타를 시각적으로 열람할 수 있습니다.\n',
    ],
    openedFlag: 'ch5Opened',
    opening: (flags) => dlgCh5Open((flags.ch4Leak as string) ?? null),
    finale: DLG_CH5_FINALE,
    caseSummary: {
      target: '대상: 환승역 CCTV 4대 (20:30–21:00) · 법원 인가 열람 사본 · 유나 최종 목격 구간',
      clues: [
        { key: 'intake', label: '사건 브리핑' },
        { key: 'sync', label: '시계 드리프트 보정' },
        { key: 'gap', label: 'CAM-D 결손 02:18' },
        { key: 'badge', label: '세리톤 배지 대조' },
        { key: 'route', label: '유나 경로 재구성' },
        { key: 'tamper', label: '편집 서명 ceriton-mux' },
      ],
      hypothesis: {
        locked:
          '앵커 이벤트(방송·조명)로 카메라별 시계 오차부터 산출할 것. 인자 없이 cctv 로 시작.',
        unlocked:
          '유나는 <b class="c-phos">승강장까지 갔고 열차에 타지 않았다</b>.<br>시계 조작·프레임 절삭·배지 기록이 전부 <b class="c-violet">세리톤(도경식)</b> 을 가리킨다 — 증거 보드에서 관계를 완성할 것.',
      },
      safety:
        '본 패키지는 법원 인가로 열람하는 <b>사전 확보 아카이브 사본</b>이다.<br>실시간 카메라·원격 접속 기능은 존재하지 않으며, 퍼즐은 전부 무결성 검증(시간·메타 대조)이다.',
    },
    ending: {
      doneTitle: 'CHAPTER 5 완료 — The Closed Circuit',
      summary: '시계 조작 적발 · 결손 02:18 특정 · 이송 경로 재구성 · 근거 연결 6건 완성',
      choiceFlag: 'ch5Choice',
      choices: {
        protect: '신변보호 요청 — 절차와 영장이 그녀를 지킨다.',
        hide: '은신 루트 — NW 의 그림자에 맡겼다.',
        family: '가족 우선 — 증인의 가족부터 지켰다.',
      },
      nextTitle: 'CHAPTER 6 예고 — "Black Signal"',
      nextBody:
        '증거는 모였다 — 조각난 채로. 오르비스 베일은 부인 캠페인을 준비한다.<br>이제 전 챕터의 증거를 <b class="c-violet">법적으로 방어 가능한 패키지</b>로 조립하고,<br>공개 전략을 선택한다. 종이 장부의 마지막 장 — <b>강윤재</b>.',
      nextNote: '· 최종장 — 전 도구 개방 · pkg 증거 패키지 조립 ·',
    },
  },
  6: {
    id: 6,
    code: 'CASE AR-2026-0901',
    title: 'Chapter 6 — Black Signal',
    root: '/cases/06_black_signal',
    fs: BLACKSIGNAL_FS,
    db: GHOSTLEDGER_DB,
    pylab: THEOFFER_PYLAB,
    cctv: CLOSEDCIRCUIT_CCTV,
    pkg: BLACKSIGNAL_PKG,
    doneFlag: 'ch6Done',
    objectives: [
      { key: 'convene', label: '종합 브리핑 읽기  (cat briefing.txt)' },
      { key: 'assemble', label: '증거 패키지 조립 — 8개 범주  (pkg add)' },
      { key: 'corroborate', label: '교차 검증 — 핵심 증거 1건 재확인  (query/python/cctv)' },
      { key: 'architect', label: '설계자 특정 — 종이 장부 분석  (evidence/)' },
      { key: 'package', label: '최종 패키지 확정  (pkg seal)' },
    ],
    fileTriggers: { '06_black_signal/briefing.txt': 'convene' },
    hints: {
      convene: [
        '마지막 수사도 브리핑에서 시작한다.',
        'ls 로 파일을 확인하고 cat 으로 읽는다.',
        'cat briefing.txt',
      ],
      assemble: [
        '조각난 진실은 반박당한다 — 범주를 채워 하나로 묶어라.',
        'pkg 로 보관함을 보고, 각 증거를 맞는 범주에 배치하라. 미검증 출처는 피할 것.',
        '예: pkg add relay infra  ·  pkg add cctv witness  (8개 범주 전부)',
      ],
      corroborate: [
        '패키지의 핵심 수치는 제출 직전에 다시 확인한다.',
        '전 도구가 열려 있다 — Ch3 의 집계 쿼리나 Ch4 의 verify 를 재실행하라.',
        'query SELECT recipient, SUM(amount_krw) AS total FROM transactions GROUP BY recipient ORDER BY total DESC',
      ],
      architect: [
        '유나가 지켜낸 종이 장부 — 잉크는 지워지지 않는다.',
        'evidence/ 의 스캔 파일은 인코딩되어 있다. 프롤로그에서 배운 그 방법.',
        'base64 -d evidence/paper_ledger_p12.b64',
      ],
      package: [
        '전 범주가 채워졌다면, 봉인만 남았다.',
        '미검증 항목이 있으면 pkg remove 로 교체한 뒤 확정하라.',
        'pkg seal',
      ],
    },
    scan(txt, done) {
      const out: { msg?: string; complete?: string }[] = [];
      if (!done.assemble && /패키지 조립 완료 — 8\/8/.test(txt))
        out.push({
          msg: '[단서 확보] 패키지 조립 — 8개 범주가 하나의 서사로 묶였다.',
          complete: 'assemble',
        });
      if (
        !done.corroborate &&
        ((/NL-ESCROW/.test(txt) && /82000000/.test(txt)) ||
          /무결성 위반 3건/.test(txt) ||
          (/⇔ 결재 대조/.test(txt) && /BDG-0117/.test(txt)))
      )
        out.push({
          msg: '[교차 검증] 핵심 증거 재확인 — 제출 직전 수치가 원본과 정합한다.',
          complete: 'corroborate',
        });
      if (!done.architect && /강윤재/.test(txt) && /전결/.test(txt))
        out.push({
          msg: '[단서 확보] 설계자 특정 — 종이 장부의 전결 서명, 강윤재.',
          complete: 'architect',
        });
      if (!done.package && /EVIDENCE PACKAGE — FINAL/.test(txt))
        out.push({
          msg: '[단서 확보] 최종 패키지 봉인 — 남은 것은 공개 전략이다.',
          complete: 'package',
        });
      return out;
    },
    findings: {
      assemble:
        '여덟 개의 방. 인프라, 세탁, 사다리, 모델, 타기팅, 결재, 억압, 수혜.\n조각이 아니라 — 구조가 보인다.\n\n(데이터 확보: 패키지 조립)',
      corroborate:
        '제출 직전, 숫자를 다시 확인했다. 원본과 일치한다.\n반박의 문을 하나씩 닫는다.\n\n(데이터 확보: 교차 검증)',
      architect:
        '서류상 대표들 뒤, 비고란의 한 줄.\n"특수상황 총괄 전결" — 강윤재.\n종이는 잉크를 기억한다.\n\n(데이터 확보: 설계자 특정)',
      package:
        '봉인 완료. 해시 공증, 체인 오브 커스터디.\n이건 더 이상 조각이 아니다 — 신호다.\n\n(데이터 확보: 최종 패키지)',
    },
    events: {
      architect: { flag: 'ch6ArchitectDone', beats: DLG_CH6_KANG },
    },
    board: {
      nodes: [
        { id: 'victims', k: '피해자', t: '어머니 · 피해자군 (사람)', cls: 'person', x: 6, y: 14 },
        { id: 'mirror', k: '앞단 조직', t: 'MirrorCall (소모용 레이어)', cls: 'org', x: 30, y: 6 },
        { id: 'shells', k: '셸 사다리', t: 'NL-ESCROW → Northline', cls: 'org', x: 56, y: 12 },
        { id: 'greyfox', k: '데이터 자회사', t: 'Greyfox (DCI 모델)', cls: 'org', x: 40, y: 44 },
        { id: 'orbis', k: '지주사', t: 'ORBIS VALE CAPITAL', cls: 'org', x: 74, y: 36 },
        { id: 'kang', k: '설계자', t: '강윤재 — 특수상황 총괄 전결', cls: 'person', x: 82, y: 70 },
        { id: 'ceriton', k: '목격자 억압', t: '세리톤 (CCTV 편집·이송)', cls: 'server', x: 12, y: 66 },
      ],
      good: [
        ['victims', 'mirror'],
        ['mirror', 'shells'],
        ['shells', 'greyfox'],
        ['victims', 'greyfox'],
        ['greyfox', 'orbis'],
        ['orbis', 'kang'],
        ['ceriton', 'orbis'],
      ],
      why: {
        'mirror-victims': '프롤로그·Ch1 — 표시명 위조·대본·가짜앱이 피해자를 노린 앞단.',
        'mirror-shells': 'Ch1·Ch3 — 미러콜 수익이 NL-ESCROW 로 정산·스윕.',
        'greyfox-shells': 'Ch3 — 셸 사다리의 상위 수취가 Greyfox.',
        'greyfox-victims': 'Ch3·Ch4 — 같은 피해자가 DCI 로 점수화·딜 소싱 재사용.',
        'greyfox-orbis': 'Ch3 — Greyfox 의 모법인이 Orbis Vale Capital.',
        'kang-orbis': 'Ch6 — 종이 장부 전결 서명: 특수상황 총괄 강윤재.',
        'ceriton-orbis': 'Ch5 — CCTV 편집·이송 하청 세리톤의 계약선이 오르비스.',
      },
      deduce: `미러콜은 미끼였다.<br>
진짜 사업은 — <b>사람을 부실자산으로 바꾸는 것</b>이었다.<br><br>
· 앞단이 피해자를 만들고, 셸이 자금을 올리고<br>
· 모델이 같은 사람을 다시 점수 매겨 <b class="c-phos">상품</b>으로 팔았으며<br>
· 목격자는 같은 지붕 아래의 하청이 지웠다.<br><br>
서버의 장부는 여기까지. 그리고 종이 장부의 마지막 장에,<br>
한 사람의 서명이 있다 — <b class="c-violet">강윤재</b>.`,
    },
    greeting: [
      'EVIDENCE MOUNT: /cases/06_black_signal — 최종 종합 (전 챕터 증거 + 종이 장부 스캔 · 허구 데이터)',
      '전 도구 개방: query · python · cctv  +  새 도구: pkg (증거 패키지 조립)',
      '이번 사건 파일이 마지막입니다. 목표는 우측 MISSION 패널.\n',
    ],
    openedFlag: 'ch6Opened',
    opening: (flags) => dlgCh6Open((flags.ch5Choice as string) ?? null),
    finale: DLG_CH6_FINALE,
    caseSummary: {
      target: '대상: ORBIS VALE CAPITAL — 전 챕터 종합 · 공개 부인 캠페인 대응 · 최종 패키지',
      clues: [
        { key: 'convene', label: '종합 브리핑' },
        { key: 'assemble', label: '패키지 8범주 조립' },
        { key: 'corroborate', label: '교차 검증' },
        { key: 'architect', label: '설계자 강윤재 특정' },
        { key: 'package', label: '최종 패키지 봉인' },
      ],
      hypothesis: {
        locked: 'pkg 로 전 챕터 증거를 8개 범주에 조립할 것. 미검증 출처는 반박의 문이 된다.',
        unlocked:
          '패키지는 완성됐다 — <b class="c-phos">사람 → 미끼 → 셸 → 모델 → 지주사</b>, 그리고 <b class="c-violet">강윤재의 전결</b>.<br>증거 보드에서 마스터 그래프를 완성하고 신호를 보낼 것.',
      },
      safety:
        '최종장 역시 <b>확보된 사본과 인메모리 데이터</b>만 다룬다.<br>시스템을 해킹으로 파괴하지 않는다 — 기록으로 시스템이 스스로를 재판하게 만든다.',
    },
    ending: {
      doneTitle: 'FINAL — Black Signal',
      summary: '전 챕터 종합 · 패키지 봉인 · 설계자 특정 · 마스터 그래프 7연결 완성',
      choiceFlag: 'ch6Release',
      choices: {
        official: '정식 이관 — 제도가 움직일 수밖에 없는 형태로 보냈다.',
        blast: '일제 공개 — 모두가 동시에 보게 했다.',
        press: '검증 보도 — 신뢰 기자의 손으로 세상에 냈다.',
        victims: '피해자 주체 — 그들이 공개를 결정했다.',
      },
      nextTitle: 'SEASON 2 — 새 신호',
      nextBody:
        '캠페인은 끝났다. 그러나 채널은 닫히지 않았다.<br>기차로 두 시간 — 한서시. 보궐선거의 개표 숫자가 이상하다.<br>서로 닿지 않는 개표구들이 <b class="c-violet">끝자리까지 같은 표수</b>를 냈다.',
      nextNote: '· SEASON 2 시작 — TWIN TALLY ·',
      finalEnding: true,
    },
  },
  7: {
    id: 7,
    code: 'CASE AR-2026-1016',
    title: 'Chapter 7 — Twin Tally (시즌 2)',
    root: '/cases/07_twin_tally',
    fs: TWINTALLY_FS,
    db: TWINTALLY_DB,
    doneFlag: 'ch7Done',
    objectives: [
      { key: 'intake', label: '브리핑 읽기  (cat briefing.txt)' },
      { key: 'complaint', label: '항의 묵살 정황 확정  (수기 대장 디코드·전산 대조)' },
      { key: 'twins', label: '쌍둥이 개표구 특정  (공표치 집계 — query)' },
      { key: 'recount', label: '수기 검산 대조  (hand_tally 와 공표치 JOIN)' },
      { key: 'module', label: '미승인 모듈 특정  (감사 로그·매니페스트 대조)' },
    ],
    fileTriggers: { '07_twin_tally/briefing.txt': 'intake' },
    hints: {
      intake: [
        '새 시즌의 수사도 브리핑에서 시작한다.',
        'ls 로 파일을 확인하고 cat 으로 읽는다.',
        'cat briefing.txt',
      ],
      complaint: [
        '항의는 종이에 적혔다. 전산에 없을 뿐.',
        'ledger 의 .b64 스캔을 base64 -d 로 풀고, 전산 내보내기와 대조하라.',
        'base64 -d ledger/complaint_ledger.b64  →  cat ledger/complaint_sys_export.txt',
      ],
      twins: [
        '14개 개표구 중, 같은 숫자 조합이 두 번 나온 곳이 있는가?',
        '후보 3인 득표 튜플로 GROUP BY 하고 COUNT 로 세어 보라.',
        'query SELECT cha_suwan, baek_dohyun, lim_garyeo, COUNT(*) AS dup FROM official_tally GROUP BY cha_suwan, baek_dohyun, lim_garyeo ORDER BY dup DESC',
      ],
      recount: [
        '같은 개표구의 두 숫자를 한 화면에 놓아야 차이가 증거가 된다.',
        'official_tally 와 hand_tally 를 precinct 로 JOIN 하라.',
        'query SELECT o.precinct, o.baek_dohyun, h.baek_dohyun, o.lim_garyeo, h.lim_garyeo FROM official_tally o JOIN hand_tally h ON o.precinct = h.precinct',
      ],
      module: [
        '기계가 어떤 부품으로 부팅됐는지는 감사 로그가 안다.',
        '부팅 로그의 모듈 목록을 인증 매니페스트와 대조하라 — 서명 없는 로드가 있다.',
        'cat audit/tallybridge_boot.log  →  cat audit/cert_manifest.txt',
      ],
    },
    scan(txt, done) {
      const out: { msg?: string; complete?: string }[] = [];
      if (!done.complaint && (txt.match(/투표지 부족/g) ?? []).length >= 4 && /미부여/.test(txt))
        out.push({
          msg: '[단서 확보] 묵살된 항의 4건 — 수기 대장에는 있고, 전산에는 없다.',
          complete: 'complaint',
        });
      const twice = (v: string) => new RegExp(`${v}[\\s\\S]+${v}`).test(txt);
      if (
        !done.twins &&
        /15207/.test(txt) &&
        /9744/.test(txt) &&
        /11026/.test(txt) &&
        (/COUNT\(|\bdup\b/i.test(txt) || (twice('15207') && twice('9744') && twice('11026')))
      )
        out.push({
          msg: '[단서 확보] 쌍둥이 3쌍 — 제3·11, 5·9, 8·14 개표구의 후보별 득표수가 완전히 동일.',
          complete: 'twins',
        });
      if (!done.recount && /14892/.test(txt) && /14678/.test(txt))
        out.push({
          msg: '[단서 확보] 수기 검산 대조 — 기호2 +214 · 기호3 −214, 총투표수는 그대로.',
          complete: 'recount',
        });
      if (!done.module && /blst-0\.9\.4/.test(txt) && /ballast/.test(txt))
        out.push({
          msg: '[단서 확보] 미승인 모듈 blst-0.9.4 "ballast" — 서명 없음, 집계 후처리에 후킹.',
          complete: 'module',
        });
      return out;
    },
    findings: {
      complaint:
        '네 번. 같은 말이 네 번 적혔다 — 투표지 부족.\n그리고 전산에는, 한 건도 없다.\n항의는 사라진 게 아니라, 기록되지 않은 것이다.\n\n(데이터 확보: 묵살된 항의 4건)',
      twins:
        '서로 닿지도 않는 동네 여섯 곳이, 세 쌍의 같은 숫자를 냈다.\n우연의 확률은 0에 수렴한다.\n이건 통계가 아니라 — 서명이다.\n\n(데이터 확보: 쌍둥이 개표구 3쌍)',
      recount:
        '정다인은 세 번 셌다고 했다. 수기 14,678 — 공표 14,892.\n기호3은 정확히 그만큼 줄었다. 합계는 그대로.\n표는 늘지 않았다. 옮겨졌다.\n\n(데이터 확보: 수기 검산 대조)',
      module:
        '여섯 개의 모듈에는 서명이 있다. 일곱 번째에는 없다.\nblst-0.9.4 — 스스로를 "ballast"라 부른다.\n평형수. 배를 기울지 않게 하는 물.\n무엇을 기울지 않게 했나 — 표를.\n\n(데이터 확보: 미승인 모듈 ballast)',
    },
    events: {
      twins: { flag: 'ch7NwDone', beats: DLG_CH7_NW },
      module: { flag: 'ch7ThreatDone', beats: DLG_CH7_THREAT },
    },
    board: {
      nodes: [
        { id: 'daein', k: '제보자', t: '정다인 — 제11개표구 개표 사무원', cls: 'person', x: 6, y: 10 },
        { id: 'complaints', k: '묵살된 항의', t: "'투표지 부족' 4건 — 전산 부재", cls: 'item', x: 8, y: 56 },
        { id: 'twins', k: '쌍둥이 표', t: '3·11 / 5·9 / 8·14 — 동일 득표', cls: 'item', x: 34, y: 8 },
        { id: 'recount', k: '수기 대조', t: '기호2 +214 · 기호3 −214 (합계 보존)', cls: 'item', x: 36, y: 66 },
        { id: 'tb', k: '시범 시스템', t: 'TALLYBRIDGE (Suncrest 납품)', cls: 'server', x: 64, y: 32 },
        { id: 'blst', k: '미승인 모듈', t: 'blst-0.9.4 "ballast" — 서명 없음', cls: 'server', x: 82, y: 66 },
      ],
      good: [
        ['daein', 'complaints'],
        ['daein', 'recount'],
        ['twins', 'tb'],
        ['recount', 'tb'],
        ['blst', 'tb'],
        ['blst', 'twins'],
      ],
      why: {
        'complaints-daein': '참관인 수기 대장 스캔 — 정다인이 보전한 4건이 전산 민원 내보내기에 부재.',
        'daein-recount': '제11개표구 수기 검산표 — 정다인 작성, 공표치와 214표 차이.',
        'tb-twins': '쌍둥이 3쌍 전부 TALLYBRIDGE 디지털 집계 산출 — 수기 개표에서는 나올 수 없는 패턴.',
        'recount-tb': '수기와 공표치의 차이는 집계·전송 단계에서만 생긴다 — 그 단계가 TALLYBRIDGE.',
        'blst-tb': '부팅 감사 로그 — 매니페스트에 없는 blst-0.9.4 가 집계 모듈에 후킹된 채 로드됨.',
        'blst-twins': '득표율을 목표 분포로 "평형"시키는 반올림 쿼터 — 그 버릇이 쌍둥이를 찍어냈다.',
      },
      deduce: `기계는 표를 훔치지 않았다. <b>옮겼다</b>.<br><br>
· 투표소의 항의 4건은 <b class="c-amber">기록에서 지워졌고</b><br>
· 여섯 개표구는 <b class="c-phos">세 쌍의 같은 숫자</b>를 냈으며<br>
· 수기 검산과 공표치의 차이는 정확히 <b>214표</b> — 합계는 그대로다.<br><br>
그리고 집계 유닛 안에, 서명 없는 일곱 번째 모듈 —<br>
<b class="c-violet">blst-0.9.4 "ballast"</b>.<br><br>
옮기던 손버릇이 쌍둥이를 남겼다. 이제 이 모듈의 본체를 열어야 한다.`,
    },
    greeting: [
      'EVIDENCE MOUNT: /cases/07_twin_tally — 공표 개표상황표 DB + 제보 스캔 (읽기 전용 · 허구 데이터)',
      '도구: 터미널 + query  (공표치·수기 검산이 포렌식 DB 로 적재됨)',
      '목표는 우측 MISSION 패널 · 막히면 hint.\n',
    ],
    openedFlag: 'ch7Opened',
    opening: (flags) => dlgCh7Open((flags.ch6Release as string) ?? null),
    finale: DLG_CH7_FINALE,
    caseSummary: {
      target: '대상: 한서시장 보궐선거(가상) 공표 개표상황표 + 제보 스캔 + 감사 로그 발췌 · 예비 검토',
      clues: [
        { key: 'intake', label: '사건 브리핑' },
        { key: 'complaint', label: '묵살된 항의 4건' },
        { key: 'twins', label: '쌍둥이 개표구 3쌍' },
        { key: 'recount', label: '수기 검산 대조 (+214/−214)' },
        { key: 'module', label: '미승인 모듈 ballast' },
      ],
      hypothesis: {
        locked:
          '공표치는 DB 에 적재됐다. 인자 없이 query 로 스키마부터 — 같은 숫자가 두 번 나오는 곳을 찾아라.',
        unlocked:
          '집계 단계에서 표가 <b class="c-phos">옮겨졌다</b> (합계 보존 · 쌍둥이 3쌍).<br>집계 유닛 안의 미승인 모듈 <b class="c-violet">ballast</b> 가 유력하다 — 증거 보드에서 연결을 완성할 것.',
      },
      safety:
        '본 사건의 선거·기관·지명·인물은 <b>전부 허구</b>이며, 실존 선거 제도·기관과 무관하다.<br>분석 대상은 공표·제출·정보공개로 확보된 <b>읽기 전용 사본</b>뿐이다.',
    },
    ending: {
      doneTitle: 'CHAPTER 7 완료 — Twin Tally',
      summary: '예비 검토 완료 · 쌍둥이 3쌍 확정 · 미승인 모듈 특정 · 근거 연결 6건 완성',
      choiceFlag: 'ch7Choice',
      choices: {
        report: '정식 수사의뢰 — 절차의 힘을 택했다.',
        press: '검증 보도 — 여론의 방패를 세웠다.',
        protect: '제보자 보호 — 사람을 먼저 지켰다.',
      },
      nextTitle: 'CHAPTER 8 예고 — "Ballast"',
      nextBody:
        '재검표 논쟁 속에, 문제의 집계 유닛 한 대가 봉인·압수된다.<br>펌웨어 포렌식 이미지가 도착한다 — 서명 없는 모듈의 본체.<br>목표 득표율 테이블, 반올림 쿼터, 그리고 패치가 흘러들어온 길 —<br><b class="c-violet">cert-mirror-2</b>.',
      nextNote: '· 새 도구 재개방: python 펌웨어 격리 분석 랩 ·',
    },
  },
  8: {
    id: 8,
    code: 'CASE AR-2026-1103',
    title: 'Chapter 8 — Ballast (시즌 2)',
    root: '/cases/08_ballast',
    fs: BALLAST_FS,
    pylab: BALLAST_PYLAB,
    doneFlag: 'ch8Done',
    objectives: [
      { key: 'intake', label: '브리핑 읽기  (cat briefing.txt)' },
      { key: 'lab', label: '격리 분석 랩 접속  (python)' },
      { key: 'target', label: 'ballast 목표 분포 테이블 추출  (python target ...)' },
      { key: 'quota', label: '반올림 쿼터 재현 — 쌍둥이 증명  (python quota ...)' },
      { key: 'inject', label: '주입 경로 특정  (python inject ...)' },
    ],
    fileTriggers: { '08_ballast/briefing.txt': 'intake' },
    hints: {
      intake: [
        '펌웨어 포렌식도 브리핑에서 시작한다.',
        'ls 로 파일을 확인하고 cat 으로 읽는다.',
        'cat briefing.txt',
      ],
      lab: [
        '새 도구는 언제나 인자 없이 먼저.',
        'python 을 인자 없이 실행하면 데이터셋·템플릿 목록이 나온다.',
        'python',
      ],
      target: [
        '개표기가 표를 세는지, 결과를 맞추는지 — 내장 상수를 보면 안다.',
        'target 템플릿으로 규모대별 목표 분포를 추출하라. band 는 A/B/C/all.',
        'python target band=all',
      ],
      quota: [
        '쌍둥이는 "같은 총계"에서 태어난다. Ch7 의 쌍둥이 개표구 총계를 떠올려라.',
        'quota 템플릿에 쌍둥이 개표구의 공표 총계를 넣어 재현하라. (제3·11개표구 = 33280)',
        'python quota total=33280',
      ],
      inject: [
        '서명이 끊긴 지점이 곧 주입 지점이다.',
        'inject 템플릿으로 부팅 로그의 미승인 모듈을 추적하라. module=blst.',
        'python inject module=blst',
      ],
    },
    scan(txt, done) {
      const out: { msg?: string; complete?: string }[] = [];
      if (!done.target && /BALLAST 목표 분포 테이블/.test(txt) && /blst-0\.9\.4/.test(txt))
        out.push({
          msg: '[단서 확보] ballast 목표 분포 — 규모대별 득표율이 하드코딩된 조작 상수.',
          complete: 'target',
        });
      if (!done.quota && /쌍둥이 재현/.test(txt) && /제3개표구/.test(txt) && /제11개표구/.test(txt))
        out.push({
          msg: '[단서 확보] 반올림 쿼터 재현 — 같은 총계에 같은 쿼터, 쌍둥이의 인과를 증명.',
          complete: 'quota',
        });
      if (!done.inject && /주입 지점/.test(txt) && /cert-mirror-2/.test(txt))
        out.push({
          msg: '[단서 확보] 주입 지점 cert-mirror-2 — 서명 없는 뒷문. 납품사 내부 소행이 아니다.',
          complete: 'inject',
        });
      return out;
    },
    findings: {
      target:
        '규모대마다 득표율이 미리 박혀 있다.\n개표기는 세지 않았다 — 결과를 "맞췄다".\n숫자가 표를 따른 게 아니라, 표가 숫자를 따랐다.\n\n(데이터 확보: 목표 분포 테이블)',
      quota:
        '같은 총계엔 같은 쿼터. 제3·11개표구는 같은 물을 부은 그릇이었다.\n15,207 · 14,892 · 3,181 — 우연이 아니라 복제였다.\n쌍둥이의 인과가, 코드로 증명됐다.\n\n(데이터 확보: 반올림 쿼터 재현)',
      inject:
        '서명은 Suncrest 빌드에서 시작해 미러에서 끊긴다.\ncert-mirror-2 — 정규 채널이 아닌 뒷문.\n납품사 결함이 아니라, 심어진 것이다.\n\n(데이터 확보: 주입 경로)',
    },
    events: {
      target: { flag: 'ch8ModelDone', beats: DLG_CH8_MODEL },
      inject: { flag: 'ch8TailDone', beats: DLG_CH8_TAIL },
    },
    board: {
      nodes: [
        { id: 'fw', k: '펌웨어 이미지', t: 'TB-11 압수 사본', cls: 'server', x: 6, y: 12 },
        { id: 'blst', k: '조작 모듈', t: 'blst-0.9.4 "ballast"', cls: 'server', x: 8, y: 62 },
        { id: 'target', k: '목표 분포', t: '규모대별 득표율 상수', cls: 'item', x: 38, y: 8 },
        { id: 'quota', k: '반올림 쿼터', t: '정수 쿼터 = 덮어쓰기', cls: 'item', x: 40, y: 60 },
        { id: 'twins', k: '쌍둥이 표', t: '3·11 / 5·9 / 8·14', cls: 'item', x: 70, y: 34 },
        { id: 'mirror', k: '주입 지점', t: 'cert-mirror-2 (뒷문)', cls: 'server', x: 80, y: 72 },
      ],
      good: [
        ['fw', 'blst'],
        ['blst', 'target'],
        ['target', 'quota'],
        ['quota', 'twins'],
        ['blst', 'mirror'],
        ['mirror', 'fw'],
      ],
      why: {
        'blst-fw': '압수 이미지 부팅·모듈 맵 — 서명 없는 blst-0.9.4 가 이미지 안에 존재.',
        'blst-target': '역어셈블 — blst 가 규모대별 목표 분포 테이블을 내장(하드코딩).',
        'quota-target': 'target → 정수 쿼터로 동결 — 목표 분포가 덮어쓰기용 쿼터로 굳어짐.',
        'quota-twins': 'quota 재현 — 같은 총계(예 33280)의 개표구에 동일 쿼터 → 완전 일치.',
        'blst-mirror': 'inject 추적 — blst 의 출처 채널이 cert-mirror-2 (서명 없음).',
        'fw-mirror': '패치 사슬 — 미러가 서명본을 우회해 유닛 펌웨어로 배포.',
      },
      deduce: `ballast 는 표를 세지 않는다. <b>맞춘다</b>.<br><br>
· 규모대별 <b class="c-phos">목표 분포</b>를 미리 정해 두고<br>
· 그 목표를 <b>정수 쿼터</b>로 굳혀 개표구에 덮어쓴다.<br>
· 같은 총계의 개표구엔 같은 쿼터 — 그래서 <b class="c-phos">쌍둥이</b>가 태어났다.<br><br>
그리고 이 목표를 심은 문은 Suncrest 정문이 아니라 —<br>
<b class="c-violet">cert-mirror-2</b> 라는 뒷문이었다.<br><br>
코드가 무엇을 했는지는 밝혔다. 남은 질문은 — 누가 목표를 주었는가.`,
    },
    greeting: [
      'EVIDENCE MOUNT: /cases/08_ballast — TB-11 펌웨어 포렌식 이미지 (읽기 전용 · 허구 데이터)',
      '도구 재개방: python  (펌웨어 격리 분석 랩 · 인자 없이 실행하면 개요)',
      '목표는 우측 MISSION 패널 · 막히면 hint.\n',
    ],
    openedFlag: 'ch8Opened',
    opening: (flags) => dlgCh8Open((flags.ch7Choice as string) ?? null),
    finale: DLG_CH8_FINALE,
    caseSummary: {
      target: '대상: 압수 집계 유닛 TB-11 펌웨어 이미지 · 법원 봉인 사본 · 정식 수사 공조',
      clues: [
        { key: 'intake', label: '사건 브리핑' },
        { key: 'lab', label: '격리 랩 접속' },
        { key: 'target', label: '목표 분포 테이블' },
        { key: 'quota', label: '반올림 쿼터 재현' },
        { key: 'inject', label: '주입 경로 cert-mirror-2' },
      ],
      hypothesis: {
        locked:
          'python 랩에서 target → quota → inject 순으로 재현할 것. 인자 없이 python 부터.',
        unlocked:
          'ballast 는 <b class="c-phos">목표 분포로 표를 덮어쓴다</b> — 같은 총계엔 같은 쿼터(쌍둥이의 인과).<br>그 코드는 <b class="c-violet">cert-mirror-2</b> 뒷문으로 주입됐다 — 증거 보드에서 관계를 완성할 것.',
      },
      safety:
        '본 사건의 선거·기관·지명·인물은 <b>전부 허구</b>이며, 실존 선거 제도·기관과 무관하다.<br>펌웨어는 격리 랩에서만 여는 <b>읽기 전용 사본</b>이며, 랩은 저작된 골격의 빈칸만 계산한다.',
    },
    ending: {
      doneTitle: 'CHAPTER 8 완료 — Ballast',
      summary: '펌웨어 포렌식 완료 · 목표 분포 추출 · 쌍둥이 인과 증명 · 근거 연결 6건 완성',
      choiceFlag: 'ch8Choice',
      choices: {
        escalate: '감정 신청 — 법원 포렌식 감정으로 재검표를 강제했다.',
        expose: '기술 검증 공개 — 재현 절차를 열어 누구나 검증하게 했다.',
        trace: '배후 우선 — 인증 사슬(CERT-9917)부터 조용히 당겼다.',
      },
      nextTitle: 'CHAPTER 9 예고 — "인증의 사슬"',
      nextBody:
        '주입은 밝혔다. 그러나 그 뒷문을 인증한 손은 아직 가려져 있다.<br>검수확인서 CERT-9917 의 서명자, 위조된 검수 보고서,<br>그리고 시범사업단 안의 협력자 — 사슬을 끝까지 당기면<br><b class="c-violet">Meridian Civic</b> 의 그림자가 드러난다.',
      nextNote: '· 도구: query 인증 기록 포렌식 콘솔 ·',
    },
  },
  9: {
    id: 9,
    code: 'CASE AR-2026-1128',
    title: 'Chapter 9 — The Chain of Certification (시즌 2)',
    root: '/cases/09_cert_chain',
    fs: CERTCHAIN_FS,
    db: CERTCHAIN_DB,
    doneFlag: 'ch9Done',
    objectives: [
      { key: 'intake', label: '브리핑 읽기  (cat briefing.txt)' },
      { key: 'signer', label: 'CERT-9917 서명자 특정  (서명 레지스트리 조회 — query)' },
      { key: 'forgery', label: '위조 검수 보고서 색출  (검수관 vs 정식 명단 대조)' },
      { key: 'meridian', label: 'Meridian Civic 접점 특정  (파견·계약 조회)' },
      { key: 'turnout', label: '투표지 부족의 기원 회수  (투표율 예측 모델 대조)' },
    ],
    fileTriggers: { '09_cert_chain/briefing.txt': 'intake' },
    hints: {
      intake: [
        '인증 포렌식도 브리핑에서 시작한다.',
        'ls 로 파일을 확인하고 cat 으로 읽는다.',
        'cat briefing.txt',
      ],
      signer: [
        '가려진 서명은 레지스트리에 그대로 남아 있다.',
        'cert_registry 에서 CERT-9917 행을 조회하라.',
        "query SELECT cert_id, subject, signer, org FROM cert_registry WHERE cert_id = 'CERT-9917'",
      ],
      forgery: [
        '도장을 찍은 손이 권한자 명단에 있는가?',
        'inspection_reports 의 검수관을 inspector_registry(정식 명단)와 대조하라.',
        'query SELECT report_id, target, inspector FROM inspection_reports',
      ],
      meridian: [
        '두 이름(남기협·표승우)이 실제로 어디 소속인지 계약이 말한다.',
        'meridian_contracts 를 조회해 파견·납품 범위를 보라.',
        'query SELECT * FROM meridian_contracts',
      ],
      turnout: [
        '투표지 부족(Ch7 비트1)은 행정 실수였나, 설계였나?',
        'turnout_model 에서 예측과 실제, 그리고 note 를 대조하라.',
        'query SELECT precinct, meridian_pred, actual, note FROM turnout_model',
      ],
    },
    scan(txt, done) {
      const out: { msg?: string; complete?: string }[] = [];
      if (!done.signer && /CERT-9917/.test(txt) && /남기협/.test(txt))
        out.push({
          msg: '[단서 확보] CERT-9917 서명자 남기협 — 시범사업단(Meridian 파견) 기술심의관.',
          complete: 'signer',
        });
      if (!done.forgery && /표승우/.test(txt) && /cert-mirror-2/.test(txt))
        out.push({
          msg: '[단서 확보] 위조 검수 — 무권한 검수관 표승우가 cert-mirror-2 를 "검수 통과" 처리.',
          complete: 'forgery',
        });
      if (!done.meridian && /Meridian Civic/.test(txt) && /파견/.test(txt))
        out.push({
          msg: '[단서 확보] Meridian Civic — 서명자·검수자를 파견하고 "결과 보증"을 판 배후 법인.',
          complete: 'meridian',
        });
      if (!done.turnout && /MC-02 과소예측/.test(txt) && /투표지 부족/.test(txt))
        out.push({
          msg: '[단서 확보] 투표지 부족의 기원 — Meridian 투표율 과소예측 모델(MC-02)이 배부를 깎았다.',
          complete: 'turnout',
        });
      return out;
    },
    findings: {
      signer:
        '가림막 뒤의 이름 — 남기협.\n시범사업단 기술심의관. 그러나 소속 뒤에 괄호가 있다.\n"(Meridian 파견)". 서명자는 안에 있으면서, 밖에서 왔다.\n\n(데이터 확보: CERT-9917 서명자)',
      forgery:
        '표승우. 정식 검수 명단 어디에도 없는 이름.\n그런 그가 cert-mirror-2 를 "무결성 PASS" 처리했다.\n게다가 미러가 생기기도 전에. 검수가 아니라 알리바이였다.\n\n(데이터 확보: 위조 검수 보고서)',
      meridian:
        '남기협도 표승우도, 급여는 한 곳에서 나온다.\nMeridian Civic — "결과 보증"을 상품으로 파는 회사.\n개표기도, 검수도, 그 회사의 손이 닿아 있었다.\n\n(데이터 확보: Meridian Civic 접점)',
      turnout:
        '첫 실을 다시 당긴다 — "투표지가 부족했다"는 그 항의.\n예측 58%, 실제 74%. 과소예측만큼 배부가 깎였다.\n그 예측 모델을 판 것도 — Meridian 이었다. 실수가 아니라 설계다.\n\n(데이터 확보: 투표지 부족의 기원)',
    },
    events: {
      meridian: { flag: 'ch9MeridianDone', beats: DLG_CH9_MERIDIAN },
      turnout: { flag: 'ch9ThreatDone', beats: DLG_CH9_THREAT },
    },
    board: {
      nodes: [
        { id: 'cert', k: '검수확인서', t: 'CERT-9917 — 미러 등록 승인', cls: 'item', x: 8, y: 12 },
        { id: 'signer', k: '서명자', t: '남기협 (기술심의관)', cls: 'person', x: 10, y: 62 },
        { id: 'forgery', k: '위조 검수', t: '표승우 — 무권한 검수 PASS', cls: 'item', x: 40, y: 8 },
        { id: 'pilot', k: '시범사업단', t: '검수·심의 조직', cls: 'org', x: 40, y: 66 },
        { id: 'meridian', k: '배후 법인', t: 'Meridian Civic', cls: 'org', x: 78, y: 32 },
        { id: 'turnout', k: '배부 조작', t: '투표율 과소예측 → 투표지 부족', cls: 'item', x: 74, y: 74 },
      ],
      good: [
        ['cert', 'signer'],
        ['signer', 'pilot'],
        ['cert', 'forgery'],
        ['signer', 'meridian'],
        ['forgery', 'meridian'],
        ['meridian', 'turnout'],
      ],
      why: {
        'cert-signer': 'cert_registry — CERT-9917 의 서명자가 남기협.',
        'pilot-signer': 'pilot_staff — 남기협은 시범사업단 기술심의관(파견).',
        'cert-forgery': 'mirror_timeline — CERT-9917 이 승인한 미러를, 표승우의 위조 검수가 뒷받침.',
        'meridian-signer': 'meridian_contracts MC-03 — 남기협은 Meridian Civic 파견 인력.',
        'forgery-meridian': 'meridian_contracts MC-03 — 표승우도 Meridian Civic 파견 검수 인력.',
        'meridian-turnout': 'turnout_model — 투표지 부족은 Meridian 투표율 예측 모델(MC-02)의 과소예측 산물.',
      },
      deduce: `뒷문에는 "검수 통과"라는 도장이 찍혀 있었다.<br>그 도장을 <b class="c-amber">위조</b>한 손을 따라가면 —<br><br>
· CERT-9917 을 서명한 <b>남기협</b>과 미러를 "검수"한 <b>표승우</b>는<br>
· 둘 다 <b class="c-violet">Meridian Civic</b> 파견 인력이고<br>
· 같은 회사의 투표율 과소예측 모델이 <b class="c-phos">투표지 부족</b>까지 만들었다.<br><br>
개표기(Ch8) · 검수(Ch9) · 배부(Ch7 비트1) — 세 갈래가 한 회사로 모인다.<br>
행정 실수처럼 보였던 첫 실이, 같은 몸통이었다.<br><br>
회사의 이름은 나왔다. 남은 건 — 그것을 산 사람과, 설계한 사람.`,
    },
    greeting: [
      'EVIDENCE MOUNT: /cases/09_cert_chain — 시범사업 인증·검수 기록 (읽기 전용 · 허구 데이터)',
      '도구: query  (인증 기록이 포렌식 DB 로 적재됨 · 인자 없이 실행하면 스키마)',
      '목표는 우측 MISSION 패널 · 막히면 hint.\n',
    ],
    openedFlag: 'ch9Opened',
    opening: (flags) => dlgCh9Open((flags.ch8Choice as string) ?? null),
    finale: DLG_CH9_FINALE,
    caseSummary: {
      target: '대상: 한서시 시범사업 인증·검수·계약 기록 · 정보공개·제출 사본 · 정식 수사 공조',
      clues: [
        { key: 'intake', label: '사건 브리핑' },
        { key: 'signer', label: 'CERT-9917 서명자 남기협' },
        { key: 'forgery', label: '위조 검수 (표승우)' },
        { key: 'meridian', label: 'Meridian Civic 접점' },
        { key: 'turnout', label: '투표지 부족의 기원' },
      ],
      hypothesis: {
        locked:
          '인증 기록은 DB 에 적재됐다. 인자 없이 query 로 스키마부터 — CERT-9917 의 서명자를 벗겨라.',
        unlocked:
          '위조 검수가 뒷문을 인증했고, 서명자·검수자는 둘 다 <b class="c-violet">Meridian Civic</b> 파견이다.<br>같은 회사의 모델이 <b class="c-phos">투표지 부족</b>까지 설계했다 — 증거 보드에서 사슬을 완성할 것.',
      },
      safety:
        '본 사건의 선거·기관·지명·인물은 <b>전부 허구</b>이며, 실존 선거 제도·기관과 무관하다.<br>대상은 정보공개·제출로 확보된 <b>읽기 전용 사본</b>이며 query 는 SELECT 조회만 가능하다.',
    },
    ending: {
      doneTitle: 'CHAPTER 9 완료 — The Chain of Certification',
      summary: '인증 사슬 추적 완료 · 위조 검수 색출 · 배후 법인 특정 · 근거 연결 6건 완성',
      choiceFlag: 'ch9Choice',
      choices: {
        indict: '인적 고리 기소 — 위조·파견 라인을 검찰에 넘겼다.',
        follow: '법인 추적 — Meridian 계약 구조를 파고들었다.',
        shield: '증인 방패 — 제보자·증인 보호를 최우선했다.',
      },
      nextTitle: 'CHAPTER 10 예고 — "조용한 압승"',
      nextBody:
        '"표를 훔치지 않는다. 오차 범위 안에서 이기게 만들 뿐."<br>Meridian 의 \'결과 보증\' 상품은 누가 샀는가 — 발주 비선(秘線).<br>그리고 그 모든 것을 설계한 개인. 시즌의 마지막 신호가<br>가장 조용한 승리의 방을 연다.',
      pendingNote: '· SEASON 2 — 다음 신호를 기다리는 중 ·',
    },
  },
};

/** CHAPTERS 에 등록된 실제 챕터 id 목록 (오름차순). 새 챕터는 여기 자동 반영된다. */
export const CHAPTER_IDS: number[] = Object.keys(CHAPTERS)
  .map(Number)
  .sort((a, b) => a - b);
