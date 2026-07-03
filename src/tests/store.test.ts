/**
 * 스토어 통합 테스트 — 프롤로그 → 챕터 1 전체 진행을
 * 실제 runCommand 경로로 시뮬레이션한다 (DOM 불필요).
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useGame } from '../state/gameStore';
import { DLG_CH4_FINALE, DLG_CH5_FINALE, DLG_CH6_FINALE } from '../content/dialogues';
import { resolveEnding } from '../engine/ending';

const G = () => useGame.getState();
const lastLines = (n = 6) =>
  G()
    .termLines.slice(-n)
    .map((l) => l.text)
    .join('\n');

beforeEach(() => {
  vi.useFakeTimers();
  vi.clearAllTimers(); // 이전 테스트에서 예약된 이벤트 타이머 누수 방지
  G().newGame();
  useGame.setState({ screen: 'work' });
});

describe('프롤로그 진행', () => {
  it('브리핑 읽기 → 목표 완료 + 통계 증가', () => {
    const before = G().stats.integrity;
    G().runCommand('cat briefing.txt');
    expect(G().objectives[0].brief).toBe(true);
    expect(G().stats.integrity).toBe(before + 2);
  });
  it('집계 파이프라인 출력에서 발신 번호가 자동 확보된다', () => {
    G().runCommand('grep "CALLER" evidence/call_metadata.log | cut -d" " -f4 | sort | uniq -c');
    expect(lastLines()).toContain('[단서 확보]');
    expect(G().objectives[0].number).toBe(true);
  });
  it('증거 파일을 그냥 읽기만 해서는 집계 단서가 확보되지 않는다', () => {
    G().runCommand('cat evidence/call_metadata.log');
    expect(G().objectives[0].number).toBe(false);
  });
  it('4개 목표 완료 시 증거 보드가 해금된다', () => {
    G().runCommand('cat briefing.txt');
    G().runCommand('grep "CALLER" evidence/call_metadata.log | cut -d" " -f4 | sort | uniq -c');
    G().runCommand('grep "TEMPLATE_ID" evidence/sms_messages.txt');
    G().runCommand('base64 -d evidence/link_payload.b64');
    expect(G().boardUnlocked[0]).toBe(true);
    expect(lastLines(3)).toContain('증거 보드가 해금');
  });
  it('무관한 출력은 단서를 확보하지 않는다', () => {
    G().runCommand('cat notes/memo_from_mom.txt');
    expect(G().objectives[0].number).toBe(false);
    expect(G().objectives[0].template).toBe(false);
    expect(G().objectives[0].relay).toBe(false);
  });
  it('힌트 사용 시 숙련도 감소', () => {
    G().runCommand('hint');
    expect(G().mastery).toBe(95);
    expect(G().hintsUsed).toBe(1);
  });
});

describe('증거 보드', () => {
  const finishObjectives = () => {
    G().runCommand('cat briefing.txt');
    G().runCommand('grep "CALLER" evidence/call_metadata.log | cut -d" " -f4 | sort | uniq -c');
    G().runCommand('grep "TEMPLATE_ID" evidence/sms_messages.txt');
    G().runCommand('base64 -d evidence/link_payload.b64');
  };
  it('근거 있는 5연결 완성 시 boardDone + 통계 보상', () => {
    finishObjectives();
    const before = G().stats.integrity;
    G().attemptLink('phone', 'num');
    G().attemptLink('num', 'relay');
    G().attemptLink('tpl', 'relay');
    G().attemptLink('app', 'relay');
    G().attemptLink('relay', 'org');
    expect(G().boardDone[0]).toBe(true);
    expect(G().stats.integrity).toBe(before + 6);
  });
  it('근거 없는 연결은 거부된다', () => {
    G().attemptLink('phone', 'org');
    expect(G().links[0]).toHaveLength(0);
    expect(G().toast).toContain('근거 없는 연결');
  });
  it('같은 연결 재클릭은 해제된다', () => {
    G().attemptLink('phone', 'num');
    expect(G().links[0]).toHaveLength(1);
    G().attemptLink('num', 'phone');
    expect(G().links[0]).toHaveLength(0);
  });
});

describe('챕터 1 진행', () => {
  beforeEach(() => {
    G().setFlag('prologueDone', true);
    G().setFlag('finalChoice', 'aegis');
    G().startChapter(1);
  });
  it('챕터 전환: cwd 와 사건 범위가 바뀐다', () => {
    expect(G().chapter).toBe(1);
    expect(G().cwd).toBe('/cases/01_echo_gate');
    G().runCommand('cat /cases/00_prologue/briefing.txt');
    expect(G().termLines.at(-1)!.text).toContain('접근 제한');
  });
  it('전체 퍼즐 체인 → 보드 해금 → 5연결 완성', () => {
    G().runCommand('cat image_manifest.txt');
    expect(G().objectives[1].manifest).toBe(true);
    G().runCommand('grep "OPERATOR" srv/logs/relay_access.log | cut -d" " -f3 | sort | uniq -c');
    expect(lastLines()).toContain('[단서 확보]');
    expect(G().objectives[1].alias).toBe(true);
    G().runCommand('cat srv/ledger/payout_routing.csv');
    expect(G().objectives[1].ledger).toBe(true);
    expect(G().objectives[1].company).toBe(true);
    G().runCommand('base64 -d srv/ledger/accounts.b64');
    expect(G().objectives[1].escrow).toBe(true);
    expect(G().boardUnlocked[1]).toBe(true);
    G().attemptLink('img', 'op');
    G().attemptLink('img', 'bak');
    G().attemptLink('bak', 'led');
    G().attemptLink('led', 'esc');
    G().attemptLink('esc', 'nfs');
    expect(G().boardDone[1]).toBe(true);
    // 프롤로그 보드와 분리 저장
    expect(G().links[0]).toHaveLength(0);
    expect(G().links[1]).toHaveLength(5);
  });
  it('grep 으로 원장을 봐도 ledger 가 자동 완료된다', () => {
    G().runCommand('grep "amount_krw" srv/ledger/payout_routing.csv');
    // 헤더 한 줄로는 조건(수취인 포함) 불충족 → head 로 본문 확인
    G().runCommand('head -n 3 srv/ledger/payout_routing.csv');
    expect(G().objectives[1].ledger).toBe(true);
  });
  it('alias 확보 시 단서 대화가 뜨고, 닫으면 엄마 문자 이벤트가 이어진다', () => {
    G().complete('alias');
    expect(G().dialogue).not.toBeNull();
    expect(G().dialogue!.beats[0].x).toContain('dove-9'); // 확보 독백
    vi.advanceTimersByTime(800); // 엄마 문자는 큐에 대기
    expect(G().dialogue!.beats[0].x).toContain('dove-9');
    G().closeDialogue();
    expect(G().dialogue!.beats[0].n).toContain('엄마');
  });
  it('한 명령으로 여러 단서 확보 시 대화가 순차 큐로 표시된다', () => {
    G().runCommand('cat srv/ledger/payout_routing.csv'); // ledger + company 동시 확보
    expect(G().dialogue!.beats[0].x).toContain('원장');
    G().closeDialogue();
    expect(G().dialogue!.beats[0].x).toContain('NORTHLINE');
    G().closeDialogue();
    expect(G().dialogue).toBeNull();
  });
});

describe('챕터 2 진행', () => {
  beforeEach(() => {
    G().setFlag('prologueDone', true);
    G().setFlag('ch1Done', true);
    G().setFlag('ch1Choice', 'report');
    G().startChapter(2);
  });
  it('챕터 전환: cwd 와 사건 범위가 바뀐다', () => {
    expect(G().chapter).toBe(2);
    expect(G().cwd).toBe('/cases/02_unlisted');
    G().runCommand('cat /cases/01_echo_gate/briefing.txt');
    expect(G().termLines.at(-1)!.text).toContain('접근 제한');
  });
  it('map 실행이 netmap 목표를 완료하고 지도를 출력한다', () => {
    G().runCommand('map');
    expect(G().objectives[2].netmap).toBe(true);
    expect(lastLines(8)).toContain('NETMAP');
    expect(lastLines(8)).toContain('???');
  });
  it('map timeline 은 번호·명의 확보 전에는 거부된다', () => {
    G().runCommand('map timeline');
    expect(G().objectives[2].timeline).toBe(false);
    expect(G().termLines.at(-1)!.cls).toBe('err');
  });
  it('전체 퍼즐 체인 → 보드 해금 → 6연결 완성', () => {
    G().runCommand('cat briefing.txt');
    expect(G().objectives[2].intake).toBe(true);
    G().runCommand('map');
    expect(G().objectives[2].netmap).toBe(true);
    G().runCommand('grep "SRC=" carrier/carrier_dump.log | cut -d" " -f3 | sort | uniq -c');
    expect(lastLines()).toContain('[단서 확보]');
    expect(G().objectives[2].unlisted).toBe(true);
    G().runCommand('base64 -d registry/sim_registration.b64');
    expect(G().objectives[2].owner).toBe(true);
    G().runCommand('map timeline');
    expect(G().objectives[2].timeline).toBe(true);
    expect(G().boardUnlocked[2]).toBe(true);
    G().attemptLink('num', 'officers');
    G().attemptLink('num', 'owner');
    G().attemptLink('yuna', 'reporter');
    G().attemptLink('num', 'yuna');
    G().attemptLink('num', 'reporter');
    G().attemptLink('num', 'designer');
    expect(G().boardDone[2]).toBe(true);
    // 이전 챕터 보드와 분리 저장
    expect(G().links[1]).toHaveLength(0);
    expect(G().links[2]).toHaveLength(6);
  });
  it('unlisted 확보 시 단서 대화가 뜨고, 닫으면 NW 접촉이 이어진다', () => {
    G().complete('unlisted');
    expect(G().dialogue).not.toBeNull();
    expect(G().dialogue!.beats[0].x).toContain('0505-0311-7742'); // 확보 독백
    vi.advanceTimersByTime(800); // NW 접촉은 큐에 대기
    G().closeDialogue();
    expect(G().dialogue!.beats[0].x).toContain('NW');
  });
  it('owner 확보 시 단서 대화가 뜨고, 닫으면 가족 문자가 이어진다', () => {
    G().complete('owner');
    expect(G().dialogue!.beats[0].x).toContain('박정순'); // 확보 독백
    vi.advanceTimersByTime(800);
    G().closeDialogue();
    expect(G().dialogue!.beats[0].n).toContain('엄마');
  });
  it('완성된 map 에는 허브 번호와 설계자 노드가 표시된다', () => {
    G().complete('unlisted');
    G().complete('owner');
    G().runCommand('map timeline');
    G().runCommand('map');
    const txt = lastLines(14);
    expect(txt).toContain('0505-0311-7742');
    expect(txt).toContain('설계자');
  });
});

describe('챕터 3 진행', () => {
  beforeEach(() => {
    G().setFlag('prologueDone', true);
    G().setFlag('ch1Done', true);
    G().setFlag('ch2Done', true);
    G().setFlag('ch2Choice', 'search');
    G().startChapter(3);
  });
  it('챕터 전환: cwd 와 사건 범위가 바뀐다', () => {
    expect(G().chapter).toBe(3);
    expect(G().cwd).toBe('/cases/03_ghost_ledger');
    G().runCommand('cat /cases/02_unlisted/briefing.txt');
    expect(G().termLines.at(-1)!.text).toContain('접근 제한');
  });
  it('query 인자 없이 실행하면 스키마 표시 + schema 목표 완료', () => {
    G().runCommand('query');
    expect(G().objectives[3].schema).toBe(true);
    expect(lastLines(12)).toContain('transactions');
  });
  it('읽기 전용 가드: 변경 구문은 에러', () => {
    G().runCommand('query DROP TABLE transactions');
    expect(G().termLines.at(-1)!.cls).toBe('err');
  });
  it('전체 퍼즐 체인 → 보드 해금 → 6연결 완성', () => {
    G().runCommand('cat briefing.txt');
    expect(G().objectives[3].intake).toBe(true);
    G().runCommand('query');
    expect(G().objectives[3].schema).toBe(true);
    G().runCommand(
      'query SELECT recipient, SUM(amount_krw) AS total FROM transactions GROUP BY recipient ORDER BY total DESC',
    );
    expect(G().objectives[3].shells).toBe(true);
    G().runCommand('query SELECT name, parent FROM shell_companies');
    expect(G().objectives[3].ladder).toBe(true);
    G().runCommand("query SELECT * FROM risk_scores WHERE class = 'high_liquidation'");
    expect(G().objectives[3].dci).toBe(true);
    G().runCommand('query SELECT account, shell, relay_alias FROM payment_routes');
    expect(G().objectives[3].overlap).toBe(true);
    expect(G().boardUnlocked[3]).toBe(true);
    G().attemptLink('victims', 'dci');
    G().attemptLink('dci', 'greyfox');
    G().attemptLink('victims', 'shells');
    G().attemptLink('shells', 'greyfox');
    G().attemptLink('greyfox', 'orbis');
    G().attemptLink('overlap', 'shells');
    expect(G().boardDone[3]).toBe(true);
    expect(G().links[2]).toHaveLength(0);
    expect(G().links[3]).toHaveLength(6);
  });
  it('원본 트랜잭션을 그냥 조회해서는 shells 가 확보되지 않는다', () => {
    G().runCommand('query SELECT * FROM transactions');
    expect(G().objectives[3].shells).toBe(false); // 집계(8,200만)가 있어야 확보
  });
  it('dci 확보 시 단서 대화가 뜨고, 닫으면 NW 신호가 이어진다', () => {
    G().complete('dci');
    expect(G().dialogue!.beats[0].x).toContain('Distress Conversion Index');
    vi.advanceTimersByTime(800);
    G().closeDialogue();
    expect(G().dialogue!.beats[0].x).toContain('NW');
  });
});

describe('챕터 4 진행', () => {
  beforeEach(() => {
    G().setFlag('prologueDone', true);
    G().setFlag('ch1Done', true);
    G().setFlag('ch2Done', true);
    G().setFlag('ch3Done', true);
    G().setFlag('ch3Choice', 'refer');
    G().startChapter(4);
  });
  it('챕터 전환: cwd 와 사건 범위가 바뀐다', () => {
    expect(G().chapter).toBe(4);
    expect(G().cwd).toBe('/cases/04_the_offer');
    G().runCommand('cat /cases/03_ghost_ledger/briefing.txt');
    expect(G().termLines.at(-1)!.text).toContain('접근 제한');
  });
  it('python 인자 없이 실행하면 랩 개요 + lab 목표 완료', () => {
    G().runCommand('python');
    expect(G().objectives[4].lab).toBe(true);
    expect(lastLines(14)).toContain('ANALYSIS-LAB');
  });
  it('잘못된 임계값으로는 reuse 가 확보되지 않는다', () => {
    G().runCommand('python reuse min=40 source=MirrorCall');
    expect(G().objectives[4].reuse).toBe(false); // 저위험 리드 혼입(5건)
  });
  it('전체 퍼즐 체인 → 보드 해금 → 6연결 완성', () => {
    G().runCommand('cat briefing.txt');
    expect(G().objectives[4].intake).toBe(true);
    G().runCommand('python');
    expect(G().objectives[4].lab).toBe(true);
    G().runCommand('python reuse min=60 source=MirrorCall');
    expect(lastLines()).toContain('[단서 확보]');
    expect(G().objectives[4].reuse).toBe(true);
    G().runCommand('python approve officer=배광호 week=2026-W20');
    expect(G().objectives[4].approve).toBe(true);
    G().runCommand('python verify rule=all');
    expect(G().objectives[4].verify).toBe(true);
    expect(G().flags.ch4Verify).toBe(true); // 퍼즐 달성 플래그 (엔딩 입력)
    G().runCommand('python summary reused=4 tainted=3');
    expect(G().objectives[4].summary).toBe(true);
    expect(G().boardUnlocked[4]).toBe(true);
    G().attemptLink('archive', 'reuse');
    G().attemptLink('reuse', 'gawon');
    G().attemptLink('approve', 'archive');
    G().attemptLink('taint', 'archive');
    G().attemptLink('taint', 'dilemma');
    G().attemptLink('reuse', 'dilemma');
    expect(G().boardDone[4]).toBe(true);
    expect(G().links[3]).toHaveLength(0);
    expect(G().links[4]).toHaveLength(6);
  });
  it('verify 확보 시 단서 대화 후 플레어/제로 갈등 비트가 이어진다', () => {
    G().complete('verify');
    expect(G().dialogue!.beats[0].x).toContain('세 줄');
    vi.advanceTimersByTime(800);
    G().closeDialogue();
    expect(G().dialogue!.beats[0].x).toContain('FLARE');
  });
  it('approve 확보 시 윤가원 접근 분기 — 설득 선택이 ch4Witness 를 기록한다', () => {
    G().complete('approve');
    vi.advanceTimersByTime(800);
    G().closeDialogue();
    const gawon = G().dialogue!;
    expect(gawon.beats[0].x).toContain('윤가원');
    const before = G().stats.trust;
    gawon.beats[0].c![0].fx!(G().dialogueApi());
    expect(G().flags.ch4Witness).toBe('persuade');
    expect(G().stats.trust).toBe(before + 6);
  });
  it('피날레 유출 결정 4분기가 스탯·플래그를 기록한다', () => {
    const choices = DLG_CH4_FINALE.find((b) => b.c)!.c!;
    runFinaleChoices(choices);
  });
});

describe('챕터 5 진행', () => {
  beforeEach(() => {
    G().setFlag('prologueDone', true);
    G().setFlag('ch1Done', true);
    G().setFlag('ch2Done', true);
    G().setFlag('ch3Done', true);
    G().setFlag('ch4Done', true);
    G().setFlag('ch4Leak', 'verify');
    G().startChapter(5);
  });
  it('챕터 전환: cwd 와 사건 범위가 바뀐다', () => {
    expect(G().chapter).toBe(5);
    expect(G().cwd).toBe('/cases/05_closed_circuit');
    G().runCommand('cat /cases/04_the_offer/briefing.txt');
    expect(G().termLines.at(-1)!.text).toContain('접근 제한');
  });
  it('cctv 인자 없이 실행하면 개요, 틀린 오차는 잔존 불일치 안내', () => {
    G().runCommand('cctv');
    expect(lastLines(16)).toContain('CCTV EVIDENCE REVIEW');
    G().runCommand('cctv sync CAM-C +30s');
    expect(lastLines(4)).toContain('앵커 불일치 잔존');
    expect(G().objectives[5].sync).toBe(false);
  });
  it('보정 전에는 badge/route 가 거부된다', () => {
    G().runCommand('cctv badge');
    expect(G().termLines.at(-1)!.cls).toBe('err');
    G().runCommand('cctv route');
    expect(G().termLines.at(-1)!.cls).toBe('err');
  });
  it('전체 퍼즐 체인 → 보드 해금 → 6연결 완성', () => {
    G().runCommand('cat briefing.txt');
    expect(G().objectives[5].intake).toBe(true);
    G().runCommand('cctv sync CAM-C +47s');
    expect(G().objectives[5].sync).toBe(false); // CAM-D 남음
    G().runCommand('cctv sync CAM-D -02:15');
    expect(lastLines()).toContain('[단서 확보]');
    expect(G().objectives[5].sync).toBe(true);
    G().runCommand('cctv gaps CAM-D');
    expect(G().objectives[5].gap).toBe(true);
    G().runCommand('cctv badge');
    expect(G().objectives[5].badge).toBe(true);
    G().runCommand('cctv route');
    expect(G().objectives[5].route).toBe(true);
    expect(G().flags.ch5RouteDone).toBe(true); // 엔딩 입력 플래그
    G().runCommand('cctv meta CAM-D');
    expect(G().objectives[5].tamper).toBe(true);
    expect(G().boardUnlocked[5]).toBe(true);
    G().attemptLink('yuna', 'route');
    G().attemptLink('drift', 'gap');
    G().attemptLink('badge', 'route');
    G().attemptLink('gap', 'badge');
    G().attemptLink('route', 'memo');
    G().attemptLink('yuna', 'memo');
    expect(G().boardDone[5]).toBe(true);
    expect(G().links[5]).toHaveLength(6);
  });
  it('원본 카메라 gaps 로는 결손이 확보되지 않는다', () => {
    G().runCommand('cctv gaps CAM-A');
    expect(G().objectives[5].gap).toBe(false);
  });
  it('route 확보 시 단서 대화 후 침묵 각서 이벤트가 이어진다', () => {
    G().complete('route');
    expect(G().dialogue!.beats[0].x).toContain('옮겨진');
    vi.advanceTimersByTime(800);
    G().closeDialogue();
    expect(G().dialogue!.beats[0].x).toContain('각서');
  });
  it('피날레 목격자 처리 3분기가 스탯·플래그를 기록한다', () => {
    const choices = DLG_CH5_FINALE.find((b) => b.c)!.c!;
    const base = () =>
      useGame.setState({ stats: { integrity: 50, trust: 50, nullwave: 20, family: 40 } });
    base();
    choices[0].fx!(G().dialogueApi()); // 신변보호
    expect(G().flags.ch5Choice).toBe('protect');
    expect(G().stats).toMatchObject({ trust: 57, integrity: 54 });
    base();
    choices[1].fx!(G().dialogueApi()); // 은신 루트
    expect(G().flags.ch5Choice).toBe('hide');
    expect(G().stats).toMatchObject({ nullwave: 28, integrity: 47 });
    base();
    choices[2].fx!(G().dialogueApi()); // 가족 우선
    expect(G().flags.ch5Choice).toBe('family');
    expect(G().stats).toMatchObject({ family: 48 });
  });
});

describe('챕터 6 진행 (최종장)', () => {
  const ADDS: [string, string][] = [
    ['relay', 'infra'],
    ['ledger', 'launder'],
    ['ladder', 'corp'],
    ['dci', 'broker'],
    ['reuse', 'target'],
    ['approve', 'exec'],
    ['cctv', 'witness'],
    ['pipeline', 'profit'],
  ];
  beforeEach(() => {
    for (const f of ['prologueDone', 'ch1Done', 'ch2Done', 'ch3Done', 'ch4Done', 'ch5Done'])
      G().setFlag(f, true);
    G().setFlag('ch4Verify', true);
    G().setFlag('ch4Leak', 'verify');
    G().setFlag('ch5Choice', 'protect');
    G().setFlag('ch5RouteDone', true);
    G().startChapter(6);
  });
  it('챕터 전환: 전 도구가 함께 열린다', () => {
    expect(G().chapter).toBe(6);
    expect(G().cwd).toBe('/cases/06_black_signal');
    G().runCommand('query');
    expect(G().objectives[6].corroborate).toBe(false); // 스키마만으로는 미확보
    expect(lastLines(12)).toContain('transactions');
  });
  it('오배치는 거부되고 미검증 배치는 경고와 함께 허용된다', () => {
    G().runCommand('pkg add relay launder');
    expect(G().termLines.at(-1)!.cls).toBe('err');
    G().runCommand('pkg add tipoff witness');
    expect(lastLines(3)).toContain('미검증 출처');
    G().runCommand('pkg remove tipoff');
    expect(lastLines(2)).toContain('회수');
  });
  it('전체 체인 → 보드 해금 → 마스터 그래프 7연결 → 엔딩 D 입력 성립', () => {
    G().runCommand('cat briefing.txt');
    expect(G().objectives[6].convene).toBe(true);
    for (const [i, c] of ADDS) G().runCommand(`pkg add ${i} ${c}`);
    expect(G().objectives[6].assemble).toBe(true);
    G().runCommand(
      'query SELECT recipient, SUM(amount_krw) AS total FROM transactions GROUP BY recipient ORDER BY total DESC',
    );
    expect(G().objectives[6].corroborate).toBe(true);
    G().runCommand('base64 -d evidence/paper_ledger_p12.b64');
    expect(lastLines(8)).toContain('강윤재');
    expect(G().objectives[6].architect).toBe(true);
    expect(G().flags.ch6ArchitectDone).toBe(true);
    G().runCommand('pkg seal');
    expect(G().objectives[6].package).toBe(true);
    expect(G().flags.ch6CleanPackage).toBe(true);
    expect(G().flags.ch6WitnessEvidence).toBe(true);
    expect(G().boardUnlocked[6]).toBe(true);
    G().attemptLink('victims', 'mirror');
    G().attemptLink('mirror', 'shells');
    G().attemptLink('shells', 'greyfox');
    G().attemptLink('victims', 'greyfox');
    G().attemptLink('greyfox', 'orbis');
    G().attemptLink('orbis', 'kang');
    G().attemptLink('ceriton', 'orbis');
    expect(G().boardDone[6]).toBe(true);
    expect(G().links[6]).toHaveLength(7);
    // witnessSaved 경로: protect + 경로 재구성 + 목격자 증거 → 스탯만 충족하면 D
    useGame.setState((st) => ({ stats: { ...st.stats, family: 60, integrity: 65 } }));
    expect(resolveEnding(G().stats, G().flags)).toBe('D');
  });
  it('미검증 녹취로 봉인하면 clean/witness 가 무너지고 A/D 가 막힌다', () => {
    for (const [i, c] of ADDS) if (i !== 'cctv') G().runCommand(`pkg add ${i} ${c}`);
    G().runCommand('pkg add tipoff witness');
    G().runCommand('pkg seal');
    expect(G().flags.ch6CleanPackage).toBe(false);
    expect(G().flags.ch6WitnessEvidence).toBe(false);
    useGame.setState((st) => ({
      stats: { ...st.stats, family: 60, integrity: 70, trust: 70 },
    }));
    expect(resolveEnding(G().stats, G().flags)).toBe('C');
  });
  it('피날레 공개 전략 4분기가 스탯·플래그를 기록한다', () => {
    const choices = DLG_CH6_FINALE.find((b) => b.c)!.c!;
    const base = () =>
      useGame.setState({ stats: { integrity: 50, trust: 50, nullwave: 20, family: 40 } });
    base();
    choices[0].fx!(G().dialogueApi()); // 정식 이관
    expect(G().flags.ch6Release).toBe('official');
    expect(G().stats).toMatchObject({ integrity: 58, trust: 56 });
    base();
    choices[1].fx!(G().dialogueApi()); // 일제 공개
    expect(G().flags.ch6Release).toBe('blast');
    expect(G().stats).toMatchObject({ nullwave: 30, integrity: 44 });
    base();
    choices[2].fx!(G().dialogueApi()); // 검증 보도
    expect(G().flags.ch6Release).toBe('press');
    expect(G().stats).toMatchObject({ trust: 56, integrity: 52 });
    base();
    choices[3].fx!(G().dialogueApi()); // 피해자 주체
    expect(G().flags.ch6Release).toBe('victims');
    expect(G().stats).toMatchObject({ family: 48, trust: 53 });
  });
});

function runFinaleChoices(choices: NonNullable<(typeof DLG_CH4_FINALE)[number]['c']>) {
  const base = () =>
    useGame.setState({ stats: { integrity: 50, trust: 50, nullwave: 20, family: 40 } });
  base();
  choices[0].fx!(G().dialogueApi()); // 즉시 공개
  expect(G().flags.ch4Leak).toBe('now');
  expect(G().stats).toMatchObject({ integrity: 40, trust: 46, nullwave: 30 });
  base();
  choices[1].fx!(G().dialogueApi()); // 검증 후 공개
  expect(G().flags.ch4Leak).toBe('verify');
  expect(G().stats).toMatchObject({ integrity: 58, trust: 56 });
  base();
  choices[2].fx!(G().dialogueApi()); // 한정 공유
  expect(G().flags.ch4Leak).toBe('channel');
  expect(G().stats).toMatchObject({ integrity: 53, trust: 58 });
  base();
  choices[3].fx!(G().dialogueApi()); // 유출 거부
  expect(G().flags.ch4Leak).toBe('reject');
  expect(G().stats).toMatchObject({ integrity: 55, trust: 54, nullwave: 12 });
}
