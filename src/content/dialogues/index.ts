import { Beat } from '../../engine/types';

/* ---------- 프롤로그 ---------- */
export const DLG_MOM: Beat[] = [
  {
    n: '엄마 (전화)',
    x: '"준아… 자다 깼지. 미안해.\n엄마가 조심했어야 했는데, 나이 들어서 이런 것도 못 알아보고…"',
  },
  {
    n: '서준 (나)',
    x: '…뭐라고 답해야 할까.',
    c: [
      {
        t: '"엄마 잘못이 아니에요. 그 사람들은 엄마의 두려움을 노린 거예요."',
        fx: (a) => {
          a.addStat('family', +12);
          a.setFlag('momChoice', 'warm');
        },
      },
      {
        t: '"왜 저한테 먼저 확인 안 했어요."',
        fx: (a) => {
          a.addStat('family', -8);
          a.setFlag('momChoice', 'cold');
        },
      },
      {
        t: '"지금은 사실만 정리할게요. 통화 기록이랑 문자, 전부 저한테 보내주세요."',
        fx: (a) => {
          a.addStat('integrity', +4);
          a.setFlag('momChoice', 'pro');
        },
      },
    ],
  },
  {
    n: '엄마 (전화)',
    x: '"…그래. 네가 하라는 대로 할게.\n은행 앱이라던 것도, 문자도, 다 남아 있어. 지우지 않았어."',
  },
  {
    n: '서준 (나)',
    x: '지우지 않았다 — 그게 최선의 판단이었다.\n증거는 감정보다 오래 남는다.\n\n부모님 폰의 기록 사본이 내 워크스테이션에 도착했다.',
    end: true,
  },
];

export const DLG_WIN: Beat[] = [
  {
    n: '서준 (나)',
    x: '창밖의 네온이 빗물에 번진다.\n이 도시 어딘가에서, 같은 대본을 읽는 목소리가\n지금도 누군가의 전화기에 닿고 있을 것이다.',
    end: true,
  },
];
export const DLG_BOARD_LOCK: Beat[] = [
  {
    n: '서준 (나)',
    x: '빈 코르크 보드. 아직 붙일 것이 없다.\n단서를 먼저 찾아야 한다 — 워크스테이션에서.',
    end: true,
  },
];
export const DLG_DESK_LOCK: Beat[] = [
  {
    n: '서준 (나)',
    x: '로그인하기 전에, 엄마의 전화부터 받아야 한다.\n(책상 위 휴대폰이 울리고 있다)',
    end: true,
  },
];
export const DLG_PHONE_DONE: Beat[] = [
  { n: '서준 (나)', x: '통화는 끝났다. 기록은 이미 워크스테이션에 있다.', end: true },
];
export const DLG_BOARD_LATER: Beat[] = [
  { n: '서준 (나)', x: '물리 보드보다, 워크스테이션의 증거 보드가 빠르다.', end: true },
];

export const DLG_PROLOGUE_FINALE: Beat[] = [
  { n: '서준 (나)', x: '증거는 모였다. 이제 결정해야 한다.\n이 사건을 — 어디로 가져갈 것인가.' },
  { n: 'SYSTEM', sys: true, x: '선택은 이후 챕터의 신뢰 관계와 증거 경로에 영향을 줍니다.' },
  {
    n: '서준 (나)',
    x: '…',
    c: [
      {
        t: '이지스 리스폰스에 정식 사건으로 등록한다. 절차대로, 합법적으로.',
        fx: (a) => {
          a.addStat('integrity', +8);
          a.addStat('trust', +6);
          a.setFlag('finalChoice', 'aegis');
        },
      },
      {
        t: '회사에 알리지 않고 혼자 조용히 추적한다. 더 빠르게, 더 깊게.',
        fx: (a) => {
          a.addStat('integrity', -6);
          a.setNullwave(+8);
          a.setFlag('finalChoice', 'solo');
        },
      },
      {
        t: '부모님과 먼저 상의한다. 이건 우리 가족의 사건이다.',
        fx: (a) => {
          a.addStat('family', +10);
          a.addStat('trust', +2);
          a.setFlag('finalChoice', 'family');
        },
      },
    ],
  },
  {
    n: '서준 (나)',
    x: '전화기 너머, 아직 잠들지 못한 어머니의 숨소리를 떠올린다.\n\n이 신호를 따라간다. 끝까지.',
    end: true,
  },
];

/* ---------- Chapter 1 ---------- */
export function dlgCh1Open(finalChoice: string | null): Beat[] {
  const first =
    finalChoice === 'solo'
      ? '"혼자 팠지. …모니터만 봐도 알아, 서준.\n다행히 방금, 이 건이 공식이 됐어."'
      : finalChoice === 'family'
        ? '"어머님 사건으로 걸어둔 경찰 공조 요청 — 방금 승인 났어."'
        : '"네가 등록한 사건, 경찰청 사이버수사대 공조로 격상됐어."';
  return [
    { n: '한나 (이지스 · IR 팀장)', x: first },
    {
      n: '한나 (이지스 · IR 팀장)',
      x: '"압수된 릴레이 서버 — echo-relay-03.\n포렌식 이미지가 방금 도착했고, 분석 담당은 너야.\n읽기 전용 사본이니까, 체인 오브 커스터디부터 확인해."',
    },
    {
      n: '서준 (나)',
      x: '놈들의 서버가, 내 책상 위에 있다.\n합법적으로. 절차대로.\n\n이번엔 흔적을 전부 끄집어낸다.',
      end: true,
    },
  ];
}

export const DLG_MOM_MESSAGE: Beat[] = [
  {
    n: '엄마 (문자)',
    x: '"준아, 뉴스에서 봤어. 보이스피싱 조직 서버가 압수됐다더라.\n혹시 네가 하는 일이니? …밥은 챙겨 먹고 하는 거지."',
  },
  {
    n: '서준 (나)',
    x: '…',
    c: [
      {
        t: '"네, 제가 맡았어요. 엄마 돈이 어디로 갔는지, 꼭 찾아낼게요."',
        fx: (a) => a.addStat('family', +8),
      },
      {
        t: '"수사 중이라 자세히 말씀 못 드려요. 걱정 마세요."',
        fx: (a) => a.addStat('integrity', +2),
      },
      { t: '(답장을 미룬다 — 지금은 로그가 먼저다)', fx: (a) => a.addStat('family', -6) },
    ],
  },
  {
    n: '엄마 (문자)',
    x: '"그래. 무리하지 말고.\n네 아빠가 요즘 밤마다 현관문을 두 번씩 확인한다."',
    end: true,
  },
];

export const DLG_CH1_FINALE: Beat[] = [
  {
    n: '한나 (이지스 · IR 팀장)',
    x: '"주간 정산 원장에, 에스크로 스윕 재이체까지.\n미러콜 수익의 종착지가 노스라인이라는 건…\n이건 더 이상 보이스피싱 사건이 아니야, 서준."',
  },
  {
    n: '서준 (나)',
    x: '노스라인 신용정보. 등기부는 깨끗하고, 임원은 전부 서류상 인물.\n이 이름을 — 어떻게 다룰 것인가.',
    c: [
      {
        t: '공조 보고서에 노스라인 연결을 전부 기재한다. 기록이 무기다.',
        fx: (a) => {
          a.addStat('integrity', +8);
          a.addStat('trust', +5);
          a.setFlag('ch1Choice', 'report');
        },
      },
      {
        t: '보고서엔 미러콜까지만. 노스라인은 내가 따로 판다.',
        fx: (a) => {
          a.addStat('integrity', -5);
          a.setNullwave(+6);
          a.setFlag('ch1Choice', 'shadow');
        },
      },
      {
        t: '부모님께 먼저 알린다 — 그 돈이 흘러간 곳을.',
        fx: (a) => {
          a.addStat('family', +8);
          a.setFlag('ch1Choice', 'family');
        },
      },
    ],
  },
  {
    n: '수신 — 암호화 채널',
    sys: true,
    x: '발신자 불명.\n\n"당신은 돈을 따라가고 있다.\n 우리는 설계자를 따라간다.\n                          — NW"',
  },
  {
    n: '서준 (나)',
    x: 'NW. 누군가, 처음부터 나를 지켜보고 있었다.\n\n신호는 아직 끊기지 않았다.',
    end: true,
  },
];

/* ---------- Chapter 2 ---------- */
export function dlgCh2Open(ch1Choice: string | null): Beat[] {
  const first =
    ch1Choice === 'shadow'
      ? '"보고서가 이상하게 깔끔하더라, 서준.\n…뭘 빼놨는지는 안 묻겠어. 대신 이건 공식 라인으로 왔다."'
      : ch1Choice === 'family'
        ? '"어머님께 먼저 말씀드렸다며. 잘했어.\n피해자 가족이 움직이니까, 위도 움직이더라."'
        : '"네 보고서가 위를 움직였어.\n노스라인 등기부 발췌와 통신영장 회신이 방금 내려왔다."';
  return [
    { n: '한나 (이지스 · IR 팀장)', x: first },
    {
      n: '한나 (이지스 · IR 팀장)',
      x: '"등기 임원 4인 — 전원 서류상 인물이야.\n고시원, 폐업 세탁소, 명의대여…\n그런데 접점 없는 네 사람이, 같은 번호의 전화를 받아."',
    },
    {
      n: '수신 — 암호화 채널',
      sys: true,
      x: '발신자 NW.\n\n"통신 피드 확장분을 얹어 뒀다. 검증은 너의 몫."\n\n(첨부: carrier_dump.log 확장분)',
    },
    {
      n: '서준 (나)',
      x: '출처 불명의 드롭. 이걸 어떻게 다룰 것인가.',
      c: [
        {
          t: '영장 회신분과 해시를 대조해 검증한 뒤에만 쓴다. 증거는 깨끗해야 한다.',
          fx: (a) => {
            a.addStat('integrity', +6);
            a.addStat('trust', +2);
            a.setFlag('ch2Drop', 'verify');
          },
        },
        {
          t: '시간이 없다. 사람이 사라지고 있다 — 바로 판다.',
          fx: (a) => {
            a.addStat('integrity', -4);
            a.setNullwave(+6);
            a.setFlag('ch2Drop', 'raw');
          },
        },
        {
          t: '한나에게 드롭의 존재를 공유하고 판단을 맡긴다.',
          fx: (a) => {
            a.addStat('trust', +6);
            a.setFlag('ch2Drop', 'share');
          },
        },
      ],
    },
    {
      n: '서준 (나)',
      x: '대조 결과: 해시 일치. 조작 흔적 없음.\n\n전화번호부에 없는 번호 — 그게 이번 사건의 이름이다.',
      end: true,
    },
  ];
}

export const DLG_NW_CONTACT: Beat[] = [
  {
    n: '수신 — 암호화 채널',
    sys: true,
    x: '발신자 NW.\n\n"그 번호, 우리도 석 달을 쫓았다.\n 회선은 잡히지 않는다 — 명의가 잡힐 뿐.\n 명의를 봐라. 그들이 누구의 이름을 쓰는지."',
  },
  {
    n: '서준 (나)',
    x: '…',
    c: [
      {
        t: '"너희는 누구지. 왜 나를 돕는 척하나." — 답을 요구한다.',
        fx: (a) => {
          a.addStat('integrity', +3);
          a.setFlag('ch2NW', 'press');
        },
      },
      {
        t: '"단서는 받아둔다." — 짧게 답하고 분석을 계속한다.',
        fx: (a) => {
          a.setNullwave(+4);
          a.setFlag('ch2NW', 'accept');
        },
      },
      {
        t: '응답하지 않는다. 검증되지 않은 채널은 채널이 아니다.',
        fx: (a) => {
          a.addStat('trust', +3);
          a.setNullwave(-3);
          a.setFlag('ch2NW', 'silent');
        },
      },
    ],
  },
  {
    n: '수신 — 암호화 채널',
    sys: true,
    x: '"질문이 많군. 좋은 신호다.\n 답은 네가 설계자에게 한 걸음 더 다가섰을 때. — NW"',
    end: true,
  },
];

export const DLG_CH2_FAMILY: Beat[] = [
  {
    n: '엄마 (문자)',
    x: '"준아, 오늘 이상한 문자가 왔어.\n내 명의로 뭐가 개통됐다는데… 이것도 사기겠지?\n네 아빠가 통신사에 가 본다고 나갔어."',
  },
  {
    n: '서준 (나)',
    x: '도용된 명의로 개통된 번호를 방금 찾아냈다.\n그리고 어머니의 신분증 사본도, 놈들의 서버에 있었다.',
    c: [
      {
        t: '"제가 지금 바로 명의보호 신청해 드릴게요. 아빠한테는 지점 가지 마시라고 전해주세요."',
        fx: (a) => a.addStat('family', +8),
      },
      {
        t: '"그 문자 그대로 캡처해서 보내주세요. 증거가 됩니다."',
        fx: (a) => a.addStat('integrity', +3),
      },
      {
        t: '(나중에 답한다 — 지금은 실종자의 시간이 먼저다)',
        fx: (a) => a.addStat('family', -6),
      },
    ],
  },
  {
    n: '엄마 (문자)',
    x: '"그래, 고마워 아들.\n…뉴스에 나온 그 없어진 상담원 아가씨, 걔도 누구네 딸일 텐데."',
    end: true,
  },
];

export const DLG_CH2_FINALE: Beat[] = [
  {
    n: '한나 (이지스 · IR 팀장)',
    x: '"임원 지시 콜, 도용 명의, 실종자와 기자의 마지막 착신 —\n전부 한 회선이야. 이건 관리 번호다, 서준.\n조직도의 맨 위와 맨 아래를 한 사람이 쥐고 있어."',
  },
  {
    n: '서준 (나)',
    x: '유나의 수첩. "장부는 서버에 없다. 진짜 장부는 종이다."\n사라진 사람이 남긴 좌표를 — 어떻게 쓸 것인가.',
    c: [
      {
        t: '실종자 수색과 기자 신변보호를 경찰에 정식 요청한다. 사람이 먼저다.',
        fx: (a) => {
          a.addStat('trust', +6);
          a.addStat('integrity', +4);
          a.setFlag('ch2Choice', 'search');
        },
      },
      {
        t: 'NW 와 접선한다. 그들은 석 달을 쫓았다 — 유나를 먼저 찾을 수 있는 건 그쪽이다.',
        fx: (a) => {
          a.setNullwave(+8);
          a.addStat('integrity', -4);
          a.setFlag('ch2Choice', 'meet');
        },
      },
      {
        t: '부모님 명의보호부터 마친다. 놈들의 서버엔 우리 가족의 사본도 있다.',
        fx: (a) => {
          a.addStat('family', +8);
          a.setFlag('ch2Choice', 'shield');
        },
      },
    ],
  },
  {
    n: '수신 — 암호화 채널',
    sys: true,
    x: '발신자 NW.\n\n"종이 장부. 그 여자가 옳았다.\n 노스라인의 회계는 두 벌이다 — 서버의 것과, 설계자의 것.\n 다음 신호에서 만나지. — NW"',
  },
  {
    n: '서준 (나)',
    x: '번호는 침묵했다. 하지만 장부는 어딘가에 있다.\n\n유령의 장부 — 그게 다음 신호다.',
    end: true,
  },
];

/* ---------- Chapter 3 ---------- */
export function dlgCh3Open(ch2Choice: string | null): Beat[] {
  const first =
    ch2Choice === 'meet'
      ? '"NW 접선 이후로 네 이름이 여기저기서 들려, 서준.\n조심해. …그래도, 이건 정식으로 내려온 자료다."'
      : ch2Choice === 'shield'
        ? '"부모님 명의보호는 잘 처리됐어.\n덕분에 피해자 데이터가 어떻게 도는지 단서가 더 붙었다."'
        : '"실종 수색 요청이 법원을 움직였어.\n붕괴한 결제대행사 서버 — 포렌식 열람 인가가 방금 떨어졌다."';
  return [
    { n: '한나 (이지스 · IR 팀장)', x: first },
    {
      n: '한나 (이지스 · IR 팀장)',
      x: '"이번 건 파일이 아니라 데이터베이스야.\n결제 원장, 피해자 프로파일, 위험 점수… 읽기 전용 사본이다.\nquery 콘솔로만 열람해. 원본은 절대 건드리지 않는다."',
    },
    {
      n: '서준 (나)',
      x: '어머니의 돈이 어디로 갔는지는 이미 안다.\n이제 알아야 할 건 다른 것 — 그들이 어머니를 어떻게 "계산"했는가.',
      end: true,
    },
  ];
}

export const DLG_CH3_DCI: Beat[] = [
  {
    n: '수신 — 암호화 채널',
    sys: true,
    x: '발신자 NW.\n\n"찾았군. Distress Conversion Index.\n 곤경을 숫자로 바꾸는 저울이다.\n 그 저울을 만든 손이 곧 설계자의 손이다. — NW"',
  },
  {
    n: '서준 (나)',
    x: '피해자가 아니라 "고청산확률 자산". 어머니가 그렇게 분류돼 있었다.',
    c: [
      {
        t: '"이건 사기보다 무겁다. 모델 설계자를 특정해야 해."',
        fx: (a) => {
          a.addStat('integrity', +4);
          a.setFlag('ch3Dci', 'pursue');
        },
      },
      {
        t: '(분노를 삼키고 조용히 다음 쿼리를 친다)',
        fx: (a) => {
          a.setNullwave(+3);
          a.setFlag('ch3Dci', 'quiet');
        },
      },
    ],
  },
  {
    n: '수신 — 암호화 채널',
    sys: true,
    x: '"곧 제안이 하나 갈 거다. 받을지는 너의 선택. — NW"',
    end: true,
  },
];

export const DLG_CH3_FINALE: Beat[] = [
  {
    n: '한나 (이지스 · IR 팀장)',
    x: '"피해 자금은 NL-ESCROW 로 모이고, 모법인 사다리는 Greyfox Analytics —\nOrbis Vale Capital 의 데이터·리스크 자회사로 이어져.\n그 자회사가 피해자를 점수 매기는 DCI 모델을 굴린다. 한 몸이야."',
  },
  {
    n: '서준 (나)',
    x: '자금과 모델과 인프라가 한 지주사 아래 모인다.\n하지만 이건 서버의 장부일 뿐 — 유나가 말한 "진짜 장부"는 아직 종이 위에 있다.',
    c: [
      {
        t: '검찰·규제기관에 포렌식 결과를 정식 이관한다. 절차가 방패다.',
        fx: (a) => {
          a.addStat('integrity', +8);
          a.addStat('trust', +5);
          a.setFlag('ch3Choice', 'refer');
        },
      },
      {
        t: 'NW 의 제안을 듣는다 — 그들은 종이 장부에 닿을 길이 있다.',
        fx: (a) => {
          a.setNullwave(+8);
          a.addStat('integrity', -4);
          a.setFlag('ch3Choice', 'offer');
        },
      },
      {
        t: '피해자 공동체에 먼저 알린다. 그들은 자산이 아니라 사람이다.',
        fx: (a) => {
          a.addStat('family', +6);
          a.addStat('trust', +3);
          a.setFlag('ch3Choice', 'victims');
        },
      },
    ],
  },
  {
    n: '수신 — 암호화 채널',
    sys: true,
    x: '발신자 NW.\n\n"우리에게 Orbis Vale 내부 봉인 아카이브가 있다.\n 불완전하고, 어쩌면 오염됐다.\n 그래도 볼 텐가? — NW"',
  },
  {
    n: '서준 (나)',
    x: '제안이 왔다. 받는 순간, 증거의 무게중심이 흔들린다.\n\n다음 신호의 이름은 — The Offer.',
    end: true,
  },
];

/* ---------- Chapter 4 ---------- */
export function dlgCh4Open(ch3Choice: string | null): Beat[] {
  const first =
    ch3Choice === 'offer'
      ? '"네가 그쪽 문을 열었다며. …그래서인지 회사가 시끄러워.\n오늘 아침, 위에서 \'전면 보류\' 지시가 내려왔다."'
      : ch3Choice === 'victims'
        ? '"피해자들이 목소리를 내기 시작했어. 기자들이 붙고 —\n그러자마자 위에서 \'전면 보류\' 가 내려왔다."'
        : '"정식 이관한 결과부터 말할게. …막혔어.\n오르비스 쪽 로펌이 움직였고, 위에서 \'전면 보류\' 가 내려왔다."';
  return [
    { n: '한나 (이지스 · IR 팀장)', x: first },
    {
      n: '한나 (이지스 · IR 팀장)',
      x: '"경영진 회의에 오르비스 베일 고문단이 들어와 앉았어.\n서준 — 나는 안에서 시간을 벌어볼게.\n그동안 네 선은, 네가 지켜."',
    },
    {
      n: '수신 — 암호화 채널',
      sys: true,
      x: '발신자 ZERO.\n\n"직접 인사는 처음이군. 제로다.\n 약속한 것 — Orbis Vale 내부 봉인 아카이브.\n 불완전하고, 어쩌면 오염됐다. 우리가 심은 게 아니라,\n 그들이 심어 뒀을 수도 있다. 검증은 언제나 너의 몫."',
    },
    {
      n: '서준 (나)',
      x: '회사는 멈추라 하고, 지하는 태우라 한다.\n내 손에는 — 진짜인지도 모를 장부 한 벌.\n\n격리 랩부터 연다.\n데이터는 거짓말을 해도, 대조는 거짓말을 못 한다.',
      end: true,
    },
  ];
}

export const DLG_CH4_CONFLICT: Beat[] = [
  {
    n: '수신 — 암호화 채널',
    sys: true,
    x: '발신자 FLARE.\n\n"오염 세 줄? 그래서 뭐. 나머지 전부가 진짜잖아.\n 지금 터뜨려. 내일이면 그들이 먼저 움직인다. — FLARE"',
  },
  {
    n: '수신 — 암호화 채널',
    sys: true,
    x: '발신자 ZERO.\n\n"플레어의 말은 빠르고, 빠른 것은 부러진다.\n 오염 행이 섞인 공개는 전부를 \'조작\' 으로 만든다.\n 네가 색출한 세 줄이 — 그들의 보험이었다. — ZERO"',
  },
  {
    n: '서준 (나)',
    x: '주입된 세 줄. 우리가 통째로 공개하기를 기다리는 덫.\n\n검증이 무기를 지킨다.',
    end: true,
  },
];

export const DLG_CH4_GAWON: Beat[] = [
  {
    n: '서준 (나)',
    x: '승인 기록의 옆자리 — Greyfox 수석 리스크 애널리스트, 윤가원.\nDCI 를 만든 손이다. 그 손에 어떻게 닿을 것인가.',
    c: [
      {
        t: '윤리적 설득 — 모델이 실제로 쓰인 기록을 보여주고 협조를 요청한다.',
        fx: (a) => {
          a.addStat('trust', +6);
          a.addStat('integrity', +4);
          a.setFlag('ch4Witness', 'persuade');
        },
      },
      {
        t: '압박 — 승인 라인에 그녀의 모델이 걸려 있다는 사실로 흔든다.',
        fx: (a) => {
          a.setNullwave(+5);
          a.addStat('integrity', -4);
          a.setFlag('ch4Witness', 'coerce');
        },
      },
      {
        t: '접근하지 않는다 — 지금은 데이터가 먼저다.',
        fx: (a) => {
          a.setNullwave(+2);
          a.setFlag('ch4Witness', 'skip');
        },
      },
    ],
  },
  {
    n: '서준 (나)',
    x: '어느 쪽이든 — 그녀는 이제 안다. 누군가 보고 있다는 걸.\n모델의 양심은 증언이 될 수도, 침묵이 될 수도 있다.',
    end: true,
  },
];

export const DLG_CH4_FINALE: Beat[] = [
  {
    n: '한나 (이지스 · IR 팀장)',
    x: '"위는 이미 결론을 냈어. 이 사건은 \'없던 일\'.\n…그러니까 지금 네 손의 그 아카이브가, 아마 마지막 기회다."',
  },
  {
    n: '수신 — 암호화 채널',
    sys: true,
    x: '두 신호가 동시에 도착했다.\n\nFLARE: "지금."\nZERO:  "깨끗하게."',
  },
  {
    n: '서준 (나)',
    x: '오염 세 줄을 아는 채로 —\n이 장부를 세상에 어떻게 내놓을 것인가.',
    c: [
      {
        t: '지금 즉시, 통째로 공개한다. 완벽을 기다릴 시간이 없다.',
        fx: (a) => {
          a.setNullwave(+10);
          a.addStat('integrity', -10);
          a.addStat('trust', -4);
          a.setFlag('ch4Leak', 'now');
        },
      },
      {
        t: '오염 행을 제거하고 해시 대조 문서를 붙여 — 검증본만 공개한다.',
        fx: (a) => {
          a.addStat('integrity', +8);
          a.addStat('trust', +6);
          a.setFlag('ch4Leak', 'verify');
        },
      },
      {
        t: '신뢰할 수 있는 기자(서지원)와 규제기관에만 한정 공유한다.',
        fx: (a) => {
          a.addStat('trust', +8);
          a.addStat('integrity', +3);
          a.setFlag('ch4Leak', 'channel');
        },
      },
      {
        t: '유출하지 않는다. 이 아카이브는 법정에서만 쓴다.',
        fx: (a) => {
          a.addStat('integrity', +5);
          a.addStat('trust', +4);
          a.setNullwave(-8);
          a.setFlag('ch4Leak', 'reject');
        },
      },
    ],
  },
  {
    n: '수신 — 암호화 채널',
    sys: true,
    x: '발신자 ZERO.\n\n"결정은 들었다. 어느 쪽이든 — 다음 신호는 사람이다.\n 유나가 마지막으로 찍힌 곳, 환승역.\n 법원 CCTV 열람 인가가 네 앞으로 갔다. — ZERO"',
  },
  {
    n: '서준 (나)',
    x: '장부는 던져졌다. 이제 사라진 사람을 찾을 차례다.\n\n닫힌 회로 — 그게 다음 신호다.',
    end: true,
  },
];

/* ---------- Chapter 5 ---------- */
export function dlgCh5Open(ch4Leak: string | null): Beat[] {
  const first =
    ch4Leak === 'now'
      ? '"그 아카이브, 인터넷에 통째로 떴더군. 위가 시끄럽다.\n…그래도 법원 인가는 살아 있다. 이번 건은 조용히, 절차대로만."'
      : ch4Leak === 'channel'
        ? '"서지원 기자 보도에 규제기관 조회까지 — 네 선이 깔끔했다.\n덕분에 법원이 빨리 움직였다."'
        : ch4Leak === 'reject'
          ? '"아카이브를 법정용으로만 묶어 뒀다지. 그 신중함이 판사를 움직였다."'
          : '"검증본이라고 들었다. 오염 행 제거에 해시 대조 문서까지 —\n덕분에 열람 인가가 하루 만에 떨어졌다."';
  return [
    { n: '연락관 (경찰청 공조)', x: first },
    {
      n: '연락관 (경찰청 공조)',
      x: '"환승역 카메라 4대, 20:30 부터 30분. 유나 씨가 마지막으로 찍힌 구간이다.\n원본은 법원 금고에 봉인했고, 너한테 간 건 열람 사본.\n…제출 전에 하청 보안업체 손을 탔다는 첩보가 있다. 무결성부터 봐라."',
    },
    {
      n: '서준 (나)',
      x: '엿새 전, 이 역에서 그녀의 신호가 끊겼다.\n\n카메라는 거짓말을 못 한다 —\n누군가 카메라의 시계를 만지지 않는 한.',
      end: true,
    },
  ];
}

export const DLG_CH5_MEMO: Beat[] = [
  {
    n: '수신 — 연락관 (경찰청 공조)',
    sys: true,
    x: '"경로 재구성 보고 잘 받았다. 그리고 — 통로 물품보관함 수색에서 유류품이 나왔다.\n 구겨진 각서 초안. 전문을 보낸다."\n\n『본인은 재직 중 취득한 회사 내부 정보 일체에 대해\n 어떠한 제3자에게도 발설하지 않을 것을 서약하며…』\n\n서명란은 비어 있다.',
  },
  {
    n: '서준 (나)',
    x: '그녀는 서명하지 않았다.\n그래서 — 옮겨졌다.\n\n침묵을 거부한 값이 이송이라면, 침묵의 값은 실종이었을 것이다.\n반드시 찾는다.',
    end: true,
  },
];

export const DLG_CH5_FINALE: Beat[] = [
  {
    n: '한나 (이지스 · IR 팀장)',
    x: '"시계 조작, 프레임 절삭, 세리톤 배지 — 전부 한 줄로 꿰였네.\n서준, 이건 이제 실종 사건이 아니라 증거인멸·감금 정황이야.\n…그리고 그 통로의 끝을 아는 사람이 아직 살아 있어."',
  },
  {
    n: '서준 (나)',
    x: '유나는 어딘가에 있다. 놈들의 손이 닿는 곳에.\n그녀를 — 어떻게 지킬 것인가.',
    c: [
      {
        t: '경찰 신변보호를 정식 요청한다. 수색영장과 보호조치 — 절차가 그녀를 지킨다.',
        fx: (a) => {
          a.addStat('trust', +7);
          a.addStat('integrity', +4);
          a.setFlag('ch5Choice', 'protect');
        },
      },
      {
        t: 'NW 의 은신 루트에 맡긴다. 그들은 절차보다 빠르다.',
        fx: (a) => {
          a.setNullwave(+8);
          a.addStat('integrity', -3);
          a.setFlag('ch5Choice', 'hide');
        },
      },
      {
        t: '부모님 신변부터 챙긴다. 놈들은 증인의 가족도 명단에 올린다.',
        fx: (a) => {
          a.addStat('family', +8);
          a.setFlag('ch5Choice', 'family');
        },
      },
    ],
  },
  {
    n: '수신 — 암호화 채널',
    sys: true,
    x: '발신자 ZERO.\n\n"세리톤의 계약서, 그레이폭스의 모델, 노스라인의 장부 —\n 전부 한 사람의 결재선으로 수렴한다.\n 특수상황 총괄, 강윤재.\n\n 다음 신호가 마지막이다. — ZERO"',
  },
  {
    n: '서준 (나)',
    x: '모든 갈래가 한 이름으로 향한다.\n\n마지막 신호의 이름은 — BLACK SIGNAL.',
    end: true,
  },
];

/* ---------- Chapter 6 ---------- */
export function dlgCh6Open(ch5Choice: string | null): Beat[] {
  const first =
    ch5Choice === 'protect'
      ? '"유나 씨 — 안전가옥에서 첫 진술을 마쳤어.\n그리고 진술과 함께, 종이 장부의 스캔이 도착했다. 그녀가 지켜낸 것."'
      : ch5Choice === 'hide'
        ? '"NW 쪽에서 연락이 왔어. 그녀는… 살아 있대. 그들의 그림자 안에.\n그리고 은신처에서 종이 장부의 스캔이 넘어왔다."'
        : '"연락관이 통로 수색 자료를 넘겼어. 그 안에서 — 종이 장부 스캔이 나왔다.\n유나 씨가 보관함에 남겨둔 마지막 보험."';
  return [
    { n: '한나 (이지스 · IR 팀장)', x: first },
    {
      n: '한나 (이지스 · IR 팀장)',
      x: '"오르비스는 부인 캠페인을 준비하고 있어. \'무관한 고립 범죄조직\' —\n우리의 조각난 증거를 기다리는 거야.\n그러니까 이번엔 조각을 주지 마, 서준. 하나의 패키지를 줘."',
    },
    {
      n: '수신 — 암호화 채널',
      sys: true,
      x: '발신자 ZERO.\n\n"마지막이다. 네가 조립하는 것이 곧 네가 보내는 신호다.\n 우리는 어느 쪽이든 받아들일 준비가 됐다. — ZERO"',
    },
    {
      n: '서준 (나)',
      x: '해킹으로 시스템을 부수지 않는다.\n기록으로 — 시스템이 스스로를 재판하게 만든다.\n\n마지막 사건 파일을 연다: BLACK SIGNAL.',
      end: true,
    },
  ];
}

export const DLG_CH6_KANG: Beat[] = [
  {
    n: '서준 (나)',
    x: '종이 장부 12페이지. 서면 승인은 배광호 — 서류상 명의.\n그러나 비고란의 한 줄: "특수상황 총괄 전결 사안".\n\n전결 서명 — 강윤재.',
  },
  {
    n: '수신 — 암호화 채널',
    sys: true,
    x: '발신자 ZERO.\n\n"찾았군. 설계자의 서명.\n 서버의 장부는 지울 수 있어도, 종이는 잉크를 기억한다. — ZERO"',
  },
  {
    n: '서준 (나)',
    x: '어머니의 밤을 조각낸 대본에서, 이 서명까지 —\n한 줄로 이어졌다.\n\n이제 패키지에 넣는다. 반박할 수 없는 형태로.',
    end: true,
  },
];

export const DLG_CH6_FINALE: Beat[] = [
  {
    n: '한나 (이지스 · IR 팀장)',
    x: '"패키지 확인했어. …십 년 일하면서 이런 건 처음 봐.\n서준, 마지막 결정이 남았어 — 이걸 어디로, 어떻게 보낼 거야."',
  },
  {
    n: '수신 — 암호화 채널',
    sys: true,
    x: '세 개의 신호가 겹쳐 도착했다.\n\nFLARE: "전부. 지금. 한꺼번에."\nZERO:  "네 신호다. 네가 정해라."\n엄마:  "준아, 저녁은 먹었니."',
  },
  {
    n: '서준 (나)',
    x: '봉인된 패키지가 전송 대기 중이다.\n\n이 신호를 — 어디로 보낼 것인가.',
    c: [
      {
        t: '검찰·규제기관 정식 이관. 제도가 움직일 수밖에 없는 형태로.',
        fx: (a) => {
          a.addStat('integrity', +8);
          a.addStat('trust', +6);
          a.setFlag('ch6Release', 'official');
        },
      },
      {
        t: 'NW 네트워크로 일제 공개. 모두가 동시에 보게 한다.',
        fx: (a) => {
          a.setNullwave(+10);
          a.addStat('integrity', -6);
          a.setFlag('ch6Release', 'blast');
        },
      },
      {
        t: '신뢰 기자 서지원 단독 — 검증 보도의 형태로 세상에 낸다.',
        fx: (a) => {
          a.addStat('trust', +6);
          a.addStat('integrity', +2);
          a.setFlag('ch6Release', 'press');
        },
      },
      {
        t: '피해자 공동체에 먼저 — 그들이 주체가 되어 공개를 결정한다.',
        fx: (a) => {
          a.addStat('family', +8);
          a.addStat('trust', +3);
          a.setFlag('ch6Release', 'victims');
        },
      },
    ],
  },
  {
    n: 'SYSTEM',
    sys: true,
    x: '전송 완료. 체인 오브 커스터디 봉인 · 해시 공증 · 수신 확인.\n\n— BLACK SIGNAL, 발신됨.',
  },
  {
    n: '서준 (나)',
    x: '어머니의 전화에서 시작된 신호가, 도시의 배관을 다 지나\n마침내 제 주인을 찾아간다.\n\n이제 — 응답을 기다린다.',
    end: true,
  },
];

/* =================== Chapter 7 — Twin Tally (시즌 2) =================== */

export function dlgCh7Open(ch6Release: string | null): Beat[] {
  const first =
    ch6Release === 'official'
      ? '청문회가 이어지는 가을. 절차는 느리지만 — 움직이고 있다.\n그리고 그 보도 이후, 내 앞으로 제보가 쌓이기 시작했다.'
      : ch6Release === 'blast'
        ? '일제 공개의 소음은 가라앉았지만 잔향은 남았다.\n"그 사람이라면 믿을 수 있다" — 제보가 쌓이기 시작했다.'
        : ch6Release === 'victims'
          ? '피해자들이 스스로 공개를 결정한 뒤로, 세상이 조금 달라졌다.\n이제 사람들은 이상한 것을 보면 — 나를 찾아온다.'
          : ch6Release === 'press'
            ? '서지원의 연속 보도가 끝난 뒤에도 편집국으로 제보가 이어졌다.\n그중 하나에, 내 이름이 지목됐다.'
            : '블랙 시그널 사건이 세상에 알려진 뒤, 제보가 쌓이기 시작했다.';
  return [
    {
      n: '서준 (나)',
      x: first + '\n\n한서시. 기차로 두 시간. 오피스텔 한 칸을 빌렸다.\n오늘의 방문자는 — 개표 사무원이었다.',
    },
    {
      n: '정다인 (제보자)',
      x: '"숫자 두 줄만 봐 주세요.\n\n 제3개표구:  15,207 · 14,892 · 3,181\n 제11개표구: 15,207 · 14,892 · 3,181\n\n …다른 동네예요. 유권자도 다르고, 투표함도 달라요.\n 그런데 왜 끝자리까지 같죠?"',
    },
    {
      n: '서준 (나)',
      x: '우연이라면 — 증명하면 된다.\n우연이 아니라면 — 증명해야 한다.\n\n사건 파일을 연다: TWIN TALLY.',
      end: true,
    },
  ];
}

export const DLG_CH7_NW: Beat[] = [
  {
    n: '수신 — 암호화 채널',
    sys: true,
    x: '발신자 ZERO.\n\n"세 쌍. 너도 봤군.\n 우리는 선거 전부터 그 시범사업을 지켜보고 있었다.\n 숫자는 거짓말을 못 한다 —\n 거짓말쟁이가 숫자를 만들 때조차. — ZERO"',
  },
  {
    n: '서준 (나)',
    x: '침묵하던 채널이 다시 깜빡인다.\n시즌이 바뀌어도, 그림자는 같은 자리에 있다.\n\n좋다. 이번에도 — 검증은 내 몫이다.',
    end: true,
  },
];

export const DLG_CH7_THREAT: Beat[] = [
  {
    n: '정다인 (제보자)',
    x: '"방금… 전화가 왔어요. 표시제한 번호로.\n\n \'세는 건 기계가 한다.\n  사람은 조용히 있으면 된다.\'\n\n …그러고 끊었어요."',
  },
  {
    n: '서준 (나)',
    x: '표시제한. 협박의 문법은 시즌이 바뀌어도 같다.\n0505 뒤에 숨던 자들의 어투 — 잊을 수 없다.\n\n그들이 움직였다는 건, 우리가 맞는 길 위에 있다는 뜻이다.',
    c: [
      {
        t: '사람 먼저 — 정다인에게 임시 거처와 연락 수칙을 안내한다.',
        fx: (a) => {
          a.addStat('family', +5);
          a.setFlag('ch7Guard', 'person');
        },
      },
      {
        t: '증거 먼저 — 통신사에 통화 기록 보전을 즉시 요청한다.',
        fx: (a) => {
          a.addStat('integrity', +5);
          a.setFlag('ch7Guard', 'evidence');
        },
      },
    ],
  },
  {
    n: '서준 (나)',
    x: '수첩에 적는다 — 협박 통화, 22:14, 표시제한.\n\n이 전화도 언젠가, 증거의 자리에 서게 될 것이다.',
    end: true,
  },
];

export const DLG_CH7_FINALE: Beat[] = [
  {
    n: '서준 (나)',
    x: '보드가 완성됐다.\n\n항의는 기록에서 지워졌고, 숫자는 복제됐고,\n일곱 번째 모듈에는 서명이 없다.\n\n기계는 표를 훔치지 않았다 — 옮겼다.',
  },
  {
    n: '정다인 (제보자)',
    x: '"…제가 미치지 않았다는 거네요.\n\n 이제 어떻게 되는 건가요? 저는, 어떻게 해야 하죠?"',
  },
  {
    n: '서준 (나)',
    x: '예비 검토는 끝났다. 다음 한 걸음이 이 사건의 방향을 정한다.',
    c: [
      {
        t: '정식 수사의뢰 — 검찰·경찰청 사이버수사대. 절차가 지켜줄 것이다.',
        fx: (a) => {
          a.addStat('integrity', +8);
          a.addStat('trust', +6);
          a.setFlag('ch7Choice', 'report');
        },
      },
      {
        t: '서지원 기자 연결 — 검증 보도가 여론의 방패가 된다.',
        fx: (a) => {
          a.addStat('trust', +6);
          a.addStat('integrity', +2);
          a.setFlag('ch7Choice', 'press');
        },
      },
      {
        t: '제보자 보호 우선 — 공개는 그 다음. 사람부터 안전하게.',
        fx: (a) => {
          a.addStat('family', +8);
          a.addStat('trust', +2);
          a.setFlag('ch7Choice', 'protect');
        },
      },
    ],
  },
  {
    n: 'SYSTEM',
    sys: true,
    x: '사건 파일 갱신 — TWIN TALLY 예비 검토 종료.\n확보 단서 5건 · 근거 연결 6건.\n미승인 모듈 blst-0.9.4 "ballast" — 본체 확보 필요.',
  },
  {
    n: '서준 (나)',
    x: '평형수(ballast). 배를 기울지 않게 하는 물.\n누군가 이 도시의 표심에 평형수를 채웠다.\n\n다음 질문은 하나다 —\n그 물을 채운 손은, 누구인가.',
    end: true,
  },
];
