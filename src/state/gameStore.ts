import { create } from 'zustand';
import { D, VNode } from '../engine/vfs/vfs';
import { runPipeline, BASE_MAN, CmdFn, TermCtx } from '../engine/terminal/commands';
import { loadRaw, saveRaw, wipe } from '../engine/save/save';
import { sErr, sOk } from '../engine/audio/audio';
import { Beat, Cfg, ChapterId, DialogueApi, Stats, TermLine, clamp } from '../engine/types';
import { CHAPTERS, CHAPTER_IDS } from '../content/chapters';
import { renderNetMap, renderRelationGraph, renderTimeline } from '../content/netmap';
import { runQuery, formatResult, formatSchema } from '../engine/query/query';
import { labOverview, templateView, runTemplate } from '../engine/pylab/pylab';
import {
  CctvSync,
  cctvBadge,
  cctvGaps,
  cctvMeta,
  cctvOverview,
  cctvRoute,
  cctvSyncCmd,
  cctvView,
} from '../engine/cctv/cctv';
import { PkgState, pkgAdd, pkgOverview, pkgRemove, pkgSeal } from '../engine/pkg/pkg';

/** 각 챕터의 파일시스템을 사건 폴더명(root 의 마지막 세그먼트)으로 조립한다 */
export const ROOT_FS: VNode = D({
  cases: D(
    Object.fromEntries(
      CHAPTER_IDS.map((id) => [CHAPTERS[id].root.split('/').pop()!, CHAPTERS[id].fs]),
    ),
  ),
});

export type Screen = 'menu' | 'intro' | 'scene' | 'work' | 'end';

const SAVE_VER = 3;

/** 모든 챕터 id 에 대해 동일한 초기값을 갖는 레코드 생성 (원시값 전용) */
const perChapter = <T>(v: T): Record<ChapterId, T> =>
  Object.fromEntries(CHAPTER_IDS.map((id) => [id, v])) as Record<ChapterId, T>;

export interface GameState {
  screen: Screen;
  chapter: ChapterId;
  stats: Stats;
  mastery: number;
  hintsUsed: number;
  objectives: Record<ChapterId, Record<string, boolean>>;
  links: Record<ChapterId, string[]>;
  boardUnlocked: Record<ChapterId, boolean>;
  boardDone: Record<ChapterId, boolean>;
  greeted: Record<ChapterId, boolean>;
  flags: Record<string, unknown>;
  cwd: string;
  history: string[];
  hintLv: Record<string, number>;
  cfg: Cfg;
  // 휘발 상태 (저장 안 함)
  termLines: TermLine[];
  toast: string | null;
  dialogue: { beats: Beat[]; onDone?: () => void } | null;
  dlgQueue: { beats: Beat[]; onDone?: () => void }[];
  cfgOpen: boolean;
}

export interface GameActions {
  setScreen(s: Screen): void;
  setCfgOpen(v: boolean): void;
  setCfg(p: Partial<Cfg>): void;
  setToast(m: string | null): void;
  addStat(k: keyof Stats, d: number): void;
  setFlag(k: string, v: unknown): void;
  termPrint(text: string, cls?: TermLine['cls']): void;
  termClear(): void;
  runCommand(line: string): void;
  complete(key: string): void;
  giveHint(): void;
  openDialogue(beats: Beat[], onDone?: () => void): void;
  queueDialogue(beats: Beat[], onDone?: () => void): void;
  closeDialogue(): void;
  dialogueApi(): DialogueApi;
  attemptLink(a: string, b: string): void;
  startChapter(id: ChapterId): void;
  finishChapter(id: ChapterId): void;
  newGame(): void;
  saveGame(silent?: boolean): void;
  loadGame(): boolean;
  wipeSave(): void;
}

const objInit = (): Record<ChapterId, Record<string, boolean>> =>
  Object.fromEntries(
    CHAPTER_IDS.map((id) => [id, Object.fromEntries(CHAPTERS[id].objectives.map((o) => [o.key, false]))]),
  ) as Record<ChapterId, Record<string, boolean>>;

const linksInit = (): Record<ChapterId, string[]> =>
  Object.fromEntries(CHAPTER_IDS.map((id) => [id, []])) as Record<ChapterId, string[]>;

const fresh = (): Omit<GameState, 'termLines' | 'toast' | 'dialogue' | 'dlgQueue' | 'cfgOpen'> => ({
  screen: 'menu',
  chapter: 0,
  stats: { integrity: 50, trust: 50, nullwave: 0, family: 40 },
  mastery: 100,
  hintsUsed: 0,
  objectives: objInit(),
  links: linksInit(),
  boardUnlocked: perChapter(false),
  boardDone: perChapter(false),
  greeted: perChapter(false),
  flags: {},
  cwd: CHAPTERS[0].root,
  history: [],
  hintLv: {},
  cfg: { fs: 16, hc: false, rm: false, vol: 60, amb: 50, mute: false, name: '서준' },
});

export const linkKey = (a: string, b: string) => [a, b].sort().join('-');

let toastTimer: ReturnType<typeof setTimeout> | null = null;

export const useGame = create<GameState & GameActions>()((set, get) => ({
  ...fresh(),
  termLines: [],
  toast: null,
  dialogue: null,
  dlgQueue: [],
  cfgOpen: false,

  setScreen: (screen) => set({ screen }),
  setCfgOpen: (cfgOpen) => set({ cfgOpen }),
  setCfg: (p) => set((s) => ({ cfg: { ...s.cfg, ...p } })),
  setToast: (m) => {
    set({ toast: m });
    if (toastTimer) clearTimeout(toastTimer);
    if (m) toastTimer = setTimeout(() => set({ toast: null }), 2600);
  },
  addStat: (k, d) => set((s) => ({ stats: { ...s.stats, [k]: clamp(s.stats[k] + d) } })),
  setFlag: (k, v) => set((s) => ({ flags: { ...s.flags, [k]: v } })),

  termPrint: (text, cls) =>
    set((s) => ({ termLines: [...s.termLines.slice(-499), { text, cls }] })),
  termClear: () => set({ termLines: [] }),

  complete(key) {
    const s = get();
    const ch = s.chapter;
    if (s.objectives[ch][key]) return;
    set((st) => ({
      objectives: { ...st.objectives, [ch]: { ...st.objectives[ch], [key]: true } },
      stats: { ...st.stats, integrity: clamp(st.stats.integrity + 2) },
    }));
    sOk();
    const def = CHAPTERS[ch].objectives.find((o) => o.key === key);
    get().setToast('목표 달성: ' + (def ? def.label.split('  ')[0] : key));
    // 확보한 데이터를 대화 패널로 알림 (여러 건이면 큐로 순차 표시)
    const finding = CHAPTERS[ch].findings[key];
    if (finding) get().queueDialogue([{ n: '서준 (나)', x: finding, end: true }]);
    // 목표 확보에 연동된 스토리 이벤트 (챕터 데이터 기반, 1회 발동)
    const ev = CHAPTERS[ch].events?.[key];
    if (ev && !get().flags[ev.flag]) {
      get().setFlag(ev.flag, true);
      setTimeout(() => get().queueDialogue(ev.beats), 700);
    }
    const done = get().objectives[ch];
    if (Object.values(done).every(Boolean) && !get().boardUnlocked[ch]) {
      set((st) => ({ boardUnlocked: { ...st.boardUnlocked, [ch]: true } }));
      get().termPrint(
        '\n[SYSTEM] 모든 단서 확보 — 증거 보드가 해금되었습니다.\n         [증거 보드] 앱에서 연결을 완성하면 사건이 종결됩니다.\n',
        'ok',
      );
      get().saveGame(true);
    }
  },

  giveHint() {
    const s = get();
    const chd = CHAPTERS[s.chapter];
    const key = chd.objectives.map((o) => o.key).find((k) => !s.objectives[s.chapter][k]);
    if (!key) {
      get().termPrint('모든 단서 확보 — 증거 보드에서 연결을 완성하세요.', 'ok');
      return;
    }
    const lv = Math.min(s.hintLv[key] ?? 0, 2);
    set((st) => ({
      hintLv: { ...st.hintLv, [key]: lv + 1 },
      hintsUsed: st.hintsUsed + 1,
      mastery: Math.max(0, st.mastery - 5),
    }));
    get().termPrint(`[힌트 ${lv + 1}/3] ${chd.hints[key][lv]}`, 'dim');
  },

  runCommand(line) {
    const s = get();
    const chd = CHAPTERS[s.chapter];
    const prompt = `joonseo@aegis:${s.cwd.replace(chd.root, '~/case' + String(s.chapter).padStart(2, '0'))}$`;
    get().termPrint(prompt + ' ' + line, 'cmd');
    set((st) => ({ history: [...st.history, line] }));

    const extraMan: Record<string, string> = {
      hint: 'hint — 현재 목표의 힌트 (숙련도 −5)',
      case: 'case — 목표/상태 요약',
      save: 'save — 진행 저장',
      map:
        s.chapter === 2
          ? 'map [graph|timeline] — 네트워크 지도 · 관계 그래프 · 타임라인 재구성'
          : 'map — 네트워크 지도 (챕터 2 전용)',
      query: CHAPTERS[s.chapter].db
        ? 'query [SQL] — 읽기 전용 SQL 포렌식 콘솔 (인자 없이 실행하면 스키마 표시)'
        : 'query — DB 포렌식 콘솔 (챕터 3에서 해금)',
      python: CHAPTERS[s.chapter].pylab
        ? 'python [템플릿] [k=v ...] — 격리 분석 랩 (인자 없이 실행하면 개요 표시)'
        : 'python — 분석 랩 (챕터 4에서 해금)',
      cctv: CHAPTERS[s.chapter].cctv
        ? 'cctv [view|sync|gaps|meta|badge|route] — CCTV 증거 리뷰 (인자 없이 실행하면 개요)'
        : 'cctv — CCTV 증거 리뷰 (챕터 5에서 해금)',
      pkg: CHAPTERS[s.chapter].pkg
        ? 'pkg [add <증거> <카테고리> | remove <증거> | seal] — 증거 패키지 조립 (인자 없이 현황)'
        : 'pkg — 증거 패키지 조립 (최종장에서 해금)',
    };
    const MAN = { ...BASE_MAN, ...extraMan };

    // 터미널 출력 → 챕터 스캔(결정적 증거 자동 확보). 파이프라인·query 양쪽에서 사용.
    const runScan = (txt: string) => {
      const done = get().objectives[get().chapter];
      for (const r of chd.scan(txt, done)) {
        if (r.msg) get().termPrint(r.msg, r.complete ? 'ok' : 'dim');
        if (r.complete) get().complete(r.complete);
      }
    };

    const extra: Record<string, CmdFn> = {
      help: (_a, _i, ctx) => {
        ctx.print('사용 가능: ' + Object.keys(MAN).sort().join('  '), 'dim');
        ctx.print('자세히: man <명령>', 'dim');
        return undefined;
      },
      man: (a, _i, ctx) => {
        ctx.print(MAN[a[0]] || `man: '${a[0] || ''}' 항목 없음`, 'dim');
        return undefined;
      },
      clear: () => {
        get().termClear();
        return undefined;
      },
      save: () => {
        get().saveGame();
        return undefined;
      },
      hint: () => {
        get().giveHint();
        return undefined;
      },
      case: (_a, _i, ctx) => {
        ctx.print('케이스 탭에 요약이 있습니다. 목표는 우측 패널 참고.', 'dim');
        return undefined;
      },
      map: (a, _i, ctx) => {
        if (s.chapter !== 2) {
          ctx.print(
            s.chapter < 2
              ? 'NETMAP: 접근 권한 없음 — Chapter 2 "The Unlisted Number" 에서 해금됩니다.'
              : 'NETMAP: 이 사건에는 연결된 네트워크 지도가 없습니다.',
            'dim',
          );
          return undefined;
        }
        const done = get().objectives[2];
        const sub = (a[0] || '').toLowerCase();
        if (sub === 'timeline') {
          if (!done.unlisted || !done.owner) {
            ctx.print(
              'NETMAP: 이벤트 데이터 부족 — 발신 번호와 개통 명의를 먼저 특정하세요.',
              'err',
            );
            return undefined;
          }
          ctx.print(renderTimeline(), 'ok');
          get().complete('timeline');
        } else if (sub === 'graph') {
          ctx.print(renderRelationGraph(done), 'dim');
        } else if (sub) {
          ctx.print(`map: 알 수 없는 하위 명령 '${sub}' — 사용법: map [graph|timeline]`, 'err');
          return undefined;
        } else {
          ctx.print(renderNetMap(done), 'dim');
          get().complete('netmap');
        }
        return undefined;
      },
      query: (a, _i, ctx) => {
        const db = CHAPTERS[s.chapter].db;
        if (!db) {
          ctx.print('DB-FORENSICS: 접근 권한 없음 — Chapter 3 "Ghost Ledger" 에서 해금됩니다.', 'dim');
          return undefined;
        }
        const sql = a.join(' ').trim();
        if (!sql) {
          ctx.print(formatSchema(db), 'dim');
          get().complete('schema');
          return undefined;
        }
        try {
          const txt = formatResult(runQuery(sql, db));
          ctx.print(txt, 'ok');
          runScan(txt);
        } catch (e) {
          ctx.print(String(e), 'err');
          sErr();
        }
        return undefined;
      },
      python: (a, _i, ctx) => {
        const lab = CHAPTERS[s.chapter].pylab;
        if (!lab) {
          ctx.print('ANALYSIS-LAB: 접근 권한 없음 — Chapter 4 "The Offer" 에서 해금됩니다.', 'dim');
          return undefined;
        }
        if (!a.length) {
          ctx.print(labOverview(lab), 'dim');
          get().complete('lab');
          return undefined;
        }
        const [tpl, ...rest] = a;
        if (!rest.length) {
          ctx.print(templateView(lab, tpl), 'dim');
          return undefined;
        }
        const r = runTemplate(lab, tpl, rest);
        if (r.ok) {
          ctx.print(r.text, 'ok');
          runScan(r.text);
        } else {
          ctx.print(r.text, 'err');
          sErr();
        }
        return undefined;
      },
      cctv: (a, _i, ctx) => {
        const def = CHAPTERS[s.chapter].cctv;
        if (!def) {
          ctx.print(
            'CCTV-REVIEW: 접근 권한 없음 — Chapter 5 "The Closed Circuit" 에서 해금됩니다.',
            'dim',
          );
          return undefined;
        }
        const syncKey = `cctvSync${s.chapter}`;
        const sync = (get().flags[syncKey] as CctvSync) ?? {};
        const sub = (a[0] || '').toLowerCase();
        const analyze = (txt: string) => {
          const bad = txt.startsWith('cctv:');
          ctx.print(txt, bad ? 'err' : 'ok');
          if (bad) sErr();
          else runScan(txt);
        };
        if (!sub) {
          ctx.print(cctvOverview(def, sync), 'dim');
        } else if (sub === 'view' || sub === 'gaps' || sub === 'meta') {
          if (!a[1]) {
            ctx.print(`cctv: 카메라를 지정하라 — 사용법: cctv ${sub} <cam>`, 'err');
            sErr();
            return undefined;
          }
          if (sub === 'view') ctx.print(cctvView(def, sync, a[1]), 'dim');
          else if (sub === 'gaps') analyze(cctvGaps(def, sync, a[1]));
          else analyze(cctvMeta(def, a[1]));
        } else if (sub === 'sync') {
          if (!a[1] || !a[2]) {
            ctx.print('cctv: 사용법 — cctv sync <cam> <오차>  (예: cctv sync CAM-C +47s)', 'err');
            sErr();
            return undefined;
          }
          const r = cctvSyncCmd(def, sync, a[1], a[2]);
          if (r.ok) get().setFlag(syncKey, r.sync);
          ctx.print(r.text, r.ok ? 'ok' : 'err');
          if (r.ok) runScan(r.text);
          else sErr();
        } else if (sub === 'badge') {
          analyze(cctvBadge(def, sync));
        } else if (sub === 'route') {
          analyze(cctvRoute(def, sync));
        } else {
          ctx.print(`cctv: 알 수 없는 하위 명령 '${sub}' — man cctv 참고`, 'err');
          sErr();
        }
        return undefined;
      },
      pkg: (a, _i, ctx) => {
        const def = CHAPTERS[s.chapter].pkg;
        if (!def) {
          ctx.print('PKG-BUILDER: 접근 권한 없음 — 최종장 "Black Signal" 에서 해금됩니다.', 'dim');
          return undefined;
        }
        const stateKey = `pkgState${s.chapter}`;
        const state = (get().flags[stateKey] as PkgState) ?? {};
        const sub = (a[0] || '').toLowerCase();
        if (!sub) {
          ctx.print(pkgOverview(def, state), 'dim');
        } else if (sub === 'add') {
          if (!a[1] || !a[2]) {
            ctx.print('pkg: 사용법 — pkg add <증거> <카테고리>  (예: pkg add relay infra)', 'err');
            sErr();
            return undefined;
          }
          const r = pkgAdd(def, state, a[1], a[2]);
          if (r.ok) get().setFlag(stateKey, r.state);
          ctx.print(r.text, r.ok ? 'ok' : 'err');
          if (r.ok) runScan(r.text);
          else sErr();
        } else if (sub === 'remove') {
          const r = pkgRemove(def, state, a[1] || '');
          if (r.ok) get().setFlag(stateKey, r.state);
          ctx.print(r.text, r.ok ? 'ok' : 'err');
          if (!r.ok) sErr();
        } else if (sub === 'seal') {
          const r = pkgSeal(def, state);
          ctx.print(r.text, r.ok ? 'ok' : 'err');
          if (r.ok) {
            get().setFlag('ch6CleanPackage', r.clean);
            get().setFlag('ch6WitnessEvidence', r.witness);
            runScan(r.text);
          } else sErr();
        } else {
          ctx.print(`pkg: 알 수 없는 하위 명령 '${sub}' — man pkg 참고`, 'err');
          sErr();
        }
        return undefined;
      },
    };

    const ctx: TermCtx = {
      vfs: ROOT_FS,
      cwd: get().cwd,
      caseRoot: chd.root,
      setCwd: (p) => set({ cwd: p }),
      print: (t, c) => get().termPrint(t, c),
      history: get().history,
      onFileRead: (abs) => {
        for (const [suffix, obj] of Object.entries(chd.fileTriggers))
          if (abs.endsWith(suffix)) get().complete(obj);
      },
    };
    runPipeline(line, ctx, extra, runScan);
  },

  openDialogue: (beats, onDone) => set({ dialogue: { beats, onDone } }),
  queueDialogue(beats, onDone) {
    if (get().dialogue) set((s) => ({ dlgQueue: [...s.dlgQueue, { beats, onDone }] }));
    else set({ dialogue: { beats, onDone } });
  },
  closeDialogue() {
    const d = get().dialogue;
    set({ dialogue: null });
    d?.onDone?.();
    // onDone 이 새 대화를 열지 않았다면 큐의 다음 대화를 잇는다
    if (!get().dialogue) {
      const q = get().dlgQueue;
      if (q.length) set({ dialogue: q[0], dlgQueue: q.slice(1) });
    }
  },
  dialogueApi(): DialogueApi {
    return {
      addStat: (k, d) => get().addStat(k, d),
      setFlag: (k, v) => get().setFlag(k, v),
      setNullwave: (d) => get().addStat('nullwave', d),
    };
  },

  attemptLink(a, b) {
    const s = get();
    const ch = s.chapter;
    const board = CHAPTERS[ch].board;
    const k = linkKey(a, b);
    const L = s.links[ch];
    const isGood = board.good.some(([x, y]) => linkKey(x, y) === k);
    if (L.includes(k)) {
      set((st) => ({ links: { ...st.links, [ch]: st.links[ch].filter((x) => x !== k) } }));
      get().setToast('연결 해제');
      return;
    }
    if (!isGood) {
      sErr();
      get().setToast('근거 없는 연결 — 두 단서를 잇는 기록이 없다.');
      return;
    }
    set((st) => ({ links: { ...st.links, [ch]: [...st.links[ch], k] } }));
    sOk();
    get().setToast('근거 있는 연결: ' + (board.why[k] || ''));
    // 완성 검사
    const good = get().links[ch].filter((kk) =>
      board.good.some(([x, y]) => linkKey(x, y) === kk),
    ).length;
    if (good === board.good.length && !get().boardDone[ch]) {
      set((st) => ({
        boardDone: { ...st.boardDone, [ch]: true },
        stats: { ...st.stats, integrity: clamp(st.stats.integrity + 6) },
      }));
      get().saveGame(true);
    }
  },

  startChapter(id) {
    if (!CHAPTERS[id]) return;
    set({ chapter: id, cwd: CHAPTERS[id].root, screen: 'work' });
    get().termPrint('\n────────────────────────────────────────\n', 'dim');
    get().saveGame(true);
  },
  finishChapter(id) {
    get().setFlag(CHAPTERS[id].doneFlag, true);
    set({ screen: 'end' });
    get().saveGame(true);
  },

  newGame() {
    const cfg = get().cfg;
    set({ ...fresh(), cfg, termLines: [], dialogue: null, dlgQueue: [], screen: 'intro' });
  },

  saveGame(silent) {
    const s = get();
    const data = {
      ver: SAVE_VER,
      chapter: s.chapter,
      stats: s.stats,
      mastery: s.mastery,
      hintsUsed: s.hintsUsed,
      objectives: s.objectives,
      links: s.links,
      boardUnlocked: s.boardUnlocked,
      boardDone: s.boardDone,
      greeted: s.greeted,
      flags: s.flags,
      cwd: s.cwd,
      history: s.history.slice(-100),
      hintLv: s.hintLv,
      cfg: s.cfg,
    };
    const ok = saveRaw(JSON.stringify(data));
    if (!silent) get().setToast(ok ? '저장 완료' : '저장 실패 (브라우저 저장소 접근 불가)');
  },
  loadGame() {
    const raw = loadRaw();
    if (!raw) return false;
    try {
      const p = JSON.parse(raw);
      if (!p || p.ver !== SAVE_VER) return false;
      const base = fresh();
      set({
        ...base,
        ...p,
        objectives: { ...base.objectives, ...p.objectives },
        links: { ...base.links, ...p.links },
        boardUnlocked: { ...base.boardUnlocked, ...p.boardUnlocked },
        boardDone: { ...base.boardDone, ...p.boardDone },
        greeted: { ...base.greeted, ...p.greeted },
        cfg: { ...base.cfg, ...p.cfg },
        termLines: [],
        dialogue: null,
        dlgQueue: [],
      });
      return true;
    } catch {
      return false;
    }
  },
  wipeSave() {
    wipe();
    get().setToast('저장 데이터 삭제됨');
  },
}));
