import type { EndingId, DerivedEnding } from '../engine/ending';

/** 엔딩 4종 텍스트 (DESIGN §5 캐논). body/epilogue 는 HTML. */
export interface EndingText {
  code: string;
  title: string;
  body: (d: DerivedEnding) => string;
  epilogue: (d: DerivedEnding) => string;
}

export const ENDINGS: Record<EndingId, EndingText> = {
  A: {
    code: 'ENDING A',
    title: 'The Clean Record — 깨끗한 기록',
    body: (d) =>
      `검증된 패키지가 검찰과 규제기관을 동시에 움직였다.<br>
오르비스 베일에 대한 전면 조사 착수 — 임원 사임, 자산 동결, 공청회.<br>
${
  d.allyGaShin
    ? '그리고 윤가원의 증언이 마지막 고리를 걸었다. <b class="c-phos">강윤재 — 직접 기소 확정.</b>'
    : '강윤재는 격리와 부인 뒤에 숨었지만, 그의 제국은 문서 앞에서 해체되기 시작했다.'
}<br>
사기와 투자모델을 잇던 파이프라인이 <b>기록의 무게</b>로 끊어졌다.`,
    epilogue: () =>
      `서준은 법정 증언대에 선다. 절차는 느렸지만 — 무너지지 않았다.<br><br>
한나가 복도에서 말했다. "기록이 이겼어."<br><br>
그날 밤, 서준은 어머니에게 전화를 걸었다.<br>
"이제 무섭지 않으셔도 돼요."`,
  },
  B: {
    code: 'ENDING B',
    title: 'The Leak — 유출',
    body: (d) =>
      `모든 것이 한꺼번에 터졌다. 헤드라인, 해시태그, 성명서.<br>
오르비스 베일은 공개적으로 타격을 입었다 — 그러나 그들의 로펌은
${d.recklessLeak ? '<b class="c-amber">오염 3행</b>을 정확히 찾아냈다' : '미검증 출처를 정확히 짚었다'}.<br>
"조작된 자료" — 그 한 문장이 진실의 절반을 되삼켰다.<br>
제로의 마지막 신호: <b>"신호는 갔다. 대가는 네 몫이다."</b>`,
    epilogue: () =>
      `헤드라인은 요란했고, 법정은 조용했다.<br><br>
플레어는 만족했다. 유나의 안전은 — 아직 불투명하다.<br><br>
서준은 꺼진 모니터에 비친 자신을 바라본다.<br>
내가 싸우던 자들과, 나는 얼마나 달랐나.`,
  },
  C: {
    code: 'ENDING C',
    title: 'The Silence Protocol — 침묵 프로토콜',
    body: () =>
      `조사는 착수되지 않았다. 보도는 단신에 그쳤다.<br>
오르비스 베일은 공개적으로 살아남는다 — 성명서 한 장, 꼬리 자르기 몇 번.<br>
그러나 서준의 드라이브에는 <b>한 회사보다 큰 시스템</b>을 입증하는
증거가 봉인된 채 남아 있다.<br>
침묵은 종결이 아니라 — 대기다.`,
    epilogue: () =>
      `사건 파일이 "종결" 로 분류되던 밤, 암호화 채널이 마지막으로 깜빡였다.<br><br>
"이건 시작이었다. — NW"<br><br>
그리고 화면 위에, 새 좌표 하나.`,
  },
  D: {
    code: 'ENDING D',
    title: 'Signal Returned — 되돌아온 신호',
    body: (d) =>
      `유나가 신변보호 속에 생환해 증언대에 섰다.<br>
피해자들은 "고청산확률 자산"이 아니라 <b class="c-phos">이름을 가진 사람</b>으로 법정에 섰다.<br>
법·규제·언론의 공조 — 검증된 패키지가 구조 전체를 무너뜨렸다.<br>
${
  d.allyGaShin
    ? '윤가원의 증언이 결재선의 끝을 봉인했다. <b class="c-phos">강윤재 — 기소 확정.</b>'
    : '강윤재의 이름이 수사 선상의 맨 위에 올랐다.'
}`,
    epilogue: () =>
      `유나가 서준에게 작은 봉투를 건넸다 — "종이 장부"의 마지막 조각.<br><br>
그 주말, 부모님 집. 아버지는 그날 밤 현관문을 <b>한 번만</b> 잠갔다.<br><br>
서준은 워크스테이션의 전원을 내리며 생각한다.<br>
신호는 끊기지 않았다. 이번엔 — 옳은 방향으로.`,
  },
};
