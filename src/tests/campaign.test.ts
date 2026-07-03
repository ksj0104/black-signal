/**
 * 캠페인 통합 시뮬레이션 — 프롤로그부터 최종장까지 실제 runCommand/attemptLink 경로로
 * 완주하고, 선택 조합별로 엔딩 4종(A/B/C/D)에 실제로 도달하는지 검증한다 (밸런스 게이트).
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useGame } from '../state/gameStore';
import { CHAPTERS } from '../content/chapters';
import { DLG_MOM, DLG_CH4_GAWON } from '../content/dialogues';
import { resolveEnding } from '../engine/ending';

const G = () => useGame.getState();

/** 챕터별 정답 명령·보드 연결 (기존 챕터 테스트와 동일 캐논) */
const SOLUTIONS: Record<number, { cmds: string[]; links: [string, string][] }> = {
  0: {
    cmds: [
      'cat briefing.txt',
      'grep "CALLER" evidence/call_metadata.log | cut -d" " -f4 | sort | uniq -c',
      'grep "TEMPLATE_ID" evidence/sms_messages.txt',
      'base64 -d evidence/link_payload.b64',
    ],
    links: [
      ['phone', 'num'],
      ['num', 'relay'],
      ['tpl', 'relay'],
      ['app', 'relay'],
      ['relay', 'org'],
    ],
  },
  1: {
    cmds: [
      'cat image_manifest.txt',
      'grep "OPERATOR" srv/logs/relay_access.log | cut -d" " -f3 | sort | uniq -c',
      'cat srv/ledger/payout_routing.csv',
      'base64 -d srv/ledger/accounts.b64',
    ],
    links: [
      ['img', 'op'],
      ['img', 'bak'],
      ['bak', 'led'],
      ['led', 'esc'],
      ['esc', 'nfs'],
    ],
  },
  2: {
    cmds: [
      'cat briefing.txt',
      'map',
      'grep "SRC=" carrier/carrier_dump.log | cut -d" " -f3 | sort | uniq -c',
      'base64 -d registry/sim_registration.b64',
      'map timeline',
    ],
    links: [
      ['num', 'officers'],
      ['num', 'owner'],
      ['yuna', 'reporter'],
      ['num', 'yuna'],
      ['num', 'reporter'],
      ['num', 'designer'],
    ],
  },
  3: {
    cmds: [
      'cat briefing.txt',
      'query',
      'query SELECT recipient, SUM(amount_krw) AS total FROM transactions GROUP BY recipient ORDER BY total DESC',
      'query SELECT name, parent FROM shell_companies',
      "query SELECT * FROM risk_scores WHERE class = 'high_liquidation'",
      'query SELECT account, shell, relay_alias FROM payment_routes',
    ],
    links: [
      ['victims', 'dci'],
      ['dci', 'greyfox'],
      ['victims', 'shells'],
      ['shells', 'greyfox'],
      ['greyfox', 'orbis'],
      ['overlap', 'shells'],
    ],
  },
  4: {
    cmds: [
      'cat briefing.txt',
      'python',
      'python reuse min=60 source=MirrorCall',
      'python approve officer=배광호 week=2026-W20',
      'python verify rule=all',
      'python summary reused=4 tainted=3',
    ],
    links: [
      ['archive', 'reuse'],
      ['reuse', 'gawon'],
      ['approve', 'archive'],
      ['taint', 'archive'],
      ['taint', 'dilemma'],
      ['reuse', 'dilemma'],
    ],
  },
  5: {
    cmds: [
      'cat briefing.txt',
      'cctv sync CAM-C +47s',
      'cctv sync CAM-D -02:15',
      'cctv gaps CAM-D',
      'cctv badge',
      'cctv route',
      'cctv meta CAM-D',
    ],
    links: [
      ['yuna', 'route'],
      ['drift', 'gap'],
      ['badge', 'route'],
      ['gap', 'badge'],
      ['route', 'memo'],
      ['yuna', 'memo'],
    ],
  },
  6: {
    cmds: [
      'cat briefing.txt',
      'pkg add relay infra',
      'pkg add ledger launder',
      'pkg add ladder corp',
      'pkg add dci broker',
      'pkg add reuse target',
      'pkg add approve exec',
      'pkg add cctv witness',
      'pkg add pipeline profit',
      'query SELECT recipient, SUM(amount_krw) AS total FROM transactions GROUP BY recipient ORDER BY total DESC',
      'base64 -d evidence/paper_ledger_p12.b64',
      'pkg seal',
    ],
    links: [
      ['victims', 'mirror'],
      ['mirror', 'shells'],
      ['shells', 'greyfox'],
      ['victims', 'greyfox'],
      ['greyfox', 'orbis'],
      ['orbis', 'kang'],
      ['ceriton', 'orbis'],
    ],
  },
};

/** 챕터 퍼즐+보드 완주 후 피날레 선택 적용, 다음 챕터로 */
function playChapter(ch: number, finaleIdx: number, tainted = false) {
  const sol = SOLUTIONS[ch];
  for (let cmd of sol.cmds) {
    if (tainted && ch === 6 && cmd === 'pkg add cctv witness') cmd = 'pkg add tipoff witness';
    G().runCommand(cmd);
  }
  const done = G().objectives[ch];
  expect(Object.values(done).every(Boolean), `ch${ch} objectives: ${JSON.stringify(done)}`).toBe(
    true,
  );
  for (const [a, b] of sol.links) G().attemptLink(a, b);
  expect(G().boardDone[ch], `ch${ch} board`).toBe(true);
  const choices = CHAPTERS[ch].finale.find((b) => b.c)!.c!;
  choices[finaleIdx].fx?.(G().dialogueApi());
  G().finishChapter(ch);
  if (CHAPTERS[ch + 1]) G().startChapter(ch + 1);
}

interface Path {
  mom: number; // DLG_MOM 선택 (0 따뜻 / 1 차갑 / 2 사실정리)
  gawon: number; // 윤가원 접근 (0 설득 / 1 압박 / 2 보류)
  finales: Record<number, number>;
  tainted?: boolean; // ch6 패키지에 미검증 녹취 사용
}

function runCampaign(p: Path) {
  G().newGame();
  useGame.setState({ screen: 'work' });
  DLG_MOM.find((b) => b.c)!.c![p.mom].fx?.(G().dialogueApi());
  for (let ch = 0; ch <= 6; ch++) {
    if (ch === 4) {
      // 윤가원 접근 이벤트(approve 확보 시 큐잉)의 선택을 시뮬레이션
      playChapterWithGawon(p);
    } else {
      playChapter(ch, p.finales[ch], p.tainted);
    }
  }
  return resolveEnding(G().stats, G().flags);
}
function playChapterWithGawon(p: Path) {
  const sol = SOLUTIONS[4];
  for (const cmd of sol.cmds) G().runCommand(cmd);
  DLG_CH4_GAWON.find((b) => b.c)!.c![p.gawon].fx?.(G().dialogueApi());
  for (const [a, b] of sol.links) G().attemptLink(a, b);
  const choices = CHAPTERS[4].finale.find((b) => b.c)!.c!;
  choices[p.finales[4]].fx?.(G().dialogueApi());
  G().finishChapter(4);
  G().startChapter(5);
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.clearAllTimers();
});

describe('캠페인 완주 — 엔딩 4종 도달 경로 (밸런스 게이트)', () => {
  it('D "Signal Returned" — 가족·절차·목격자 보호의 최상 루트', () => {
    const id = runCampaign({
      mom: 0, // 따뜻 (+family)
      gawon: 0, // 윤리적 설득
      finales: { 0: 2, 1: 0, 2: 0, 3: 0, 4: 1, 5: 0, 6: 0 }, // 가족→보고→수색→이관→검증공개→신변보호→정식이관
    });
    expect(id).toBe('D');
    expect(G().stats.family).toBeGreaterThanOrEqual(55);
    expect(G().flags.ch6WitnessEvidence).toBe(true);
  });
  it('A "The Clean Record" — 제도적 승리 (가족 유대 부족으로 D 미도달)', () => {
    const id = runCampaign({
      mom: 2, // 사실정리 (family 정체)
      gawon: 0,
      finales: { 0: 0, 1: 0, 2: 0, 3: 0, 4: 1, 5: 0, 6: 0 }, // 이지스 등록 → 전부 절차 루트
    });
    expect(id).toBe('A');
    expect(G().stats.family).toBeLessThan(55);
  });
  it('B "The Leak" — 널웨이브 편중 + 무모한 공개', () => {
    const id = runCampaign({
      mom: 1, // 차갑
      gawon: 1, // 압박
      finales: { 0: 1, 1: 1, 2: 1, 3: 1, 4: 0, 5: 1, 6: 1 }, // 단독→그림자→접선→제안수락→즉시공개→은신→일제공개
    });
    expect(id).toBe('B');
    expect(G().stats.nullwave).toBeGreaterThanOrEqual(55);
    expect(G().flags.ch4Leak).toBe('now');
  });
  it('C "The Silence Protocol" — 오염 패키지가 A/D 를 봉쇄한다', () => {
    const id = runCampaign({
      mom: 2,
      gawon: 2, // 접근 보류
      finales: { 0: 0, 1: 0, 2: 2, 3: 0, 4: 1, 5: 2, 6: 2 }, // 명의보호→가족우선(목격자 경로 이탈)
      tainted: true, // 미검증 녹취로 봉인
    });
    expect(id).toBe('C');
    expect(G().flags.ch6CleanPackage).toBe(false);
  });
});
