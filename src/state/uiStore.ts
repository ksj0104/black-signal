import { create } from 'zustand';

/**
 * AEGIS OS 표현 계층 상태 — 창 관리 · 알림 · 부트 · 메신저 로그.
 * 전부 세션 휘발(저장하지 않음). 게임 진행 상태는 gameStore 가 단일 소스.
 */

export type WinId = 'term' | 'mission' | 'msg' | 'board' | 'case' | 'cctv';

export interface WinRect {
  x: number;
  y: number;
  w: number;
  h: number;
}
export interface WinState extends WinRect {
  open: boolean;
  min: boolean;
  z: number;
}

export interface Notice {
  id: number;
  text: string;
}

export interface MsgEntry {
  id: number;
  n: string; // 표시 이름
  x: string; // 본문
  sys?: boolean;
  me?: boolean; // 서준(플레이어) 발화 → 우측 정렬
  choice?: boolean; // 선택지로 답한 발화
}

export const WIN_MIN_W = 320;
export const WIN_MIN_H = 220;

const BASE_WINS: Record<WinId, WinState> = {
  term: { open: true, min: false, x: 0, y: 0, w: 0, h: 0, z: 1 },
  mission: { open: true, min: false, x: 0, y: 0, w: 0, h: 0, z: 2 },
  msg: { open: false, min: false, x: 0, y: 0, w: 0, h: 0, z: 3 },
  board: { open: false, min: false, x: 0, y: 0, w: 0, h: 0, z: 4 },
  case: { open: false, min: false, x: 0, y: 0, w: 0, h: 0, z: 5 },
  cctv: { open: false, min: false, x: 0, y: 0, w: 0, h: 0, z: 6 },
};

/** 데스크톱 크기(vw×vh) 기준 기본 창 배치 계산 — 순수 함수 (테스트 대상) */
export function defaultLayout(vw: number, vh: number): Record<WinId, WinRect> {
  const gap = 14;
  // 좁은 화면(태블릿 세로 등): 2열 대신 터미널/미션 세로 스택, 팝업류는 거의 전면
  if (vw < 720) {
    const w = vw - gap * 2;
    const termH = Math.max(WIN_MIN_H, Math.round(vh * 0.56));
    const restY = termH + gap * 2;
    const restH = Math.max(WIN_MIN_H, vh - restY - gap);
    const full = { x: Math.round(vw * 0.02), y: Math.round(vh * 0.03), w: Math.round(vw * 0.96), h: Math.round(vh * 0.9) };
    return {
      term: { x: gap, y: gap, w, h: termH },
      mission: { x: gap, y: restY, w, h: restH },
      msg: { x: gap, y: restY, w, h: restH },
      board: full,
      case: full,
      cctv: full,
    };
  }
  const rightW = Math.max(300, Math.min(380, Math.round(vw * 0.27)));
  const termW = vw - rightW - gap * 3;
  const missionH = Math.round((vh - gap * 3) * 0.46);
  return {
    term: { x: gap, y: gap, w: termW, h: vh - gap * 2 },
    mission: { x: termW + gap * 2, y: gap, w: rightW, h: missionH },
    msg: {
      x: termW + gap * 2,
      y: missionH + gap * 2,
      w: rightW,
      h: vh - missionH - gap * 3,
    },
    board: {
      x: Math.round(vw * 0.08),
      y: Math.round(vh * 0.06),
      w: Math.round(vw * 0.68),
      h: Math.round(vh * 0.84),
    },
    case: {
      x: Math.round(vw * 0.16),
      y: Math.round(vh * 0.1),
      w: Math.min(720, Math.round(vw * 0.56)),
      h: Math.round(vh * 0.76),
    },
    cctv: {
      x: Math.round(vw * 0.1),
      y: Math.round(vh * 0.07),
      w: Math.min(920, Math.round(vw * 0.66)),
      h: Math.round(vh * 0.82),
    },
  };
}

const clampRect = (r: WinRect, vw: number, vh: number): WinRect => ({
  x: Math.max(0, Math.min(r.x, Math.max(0, vw - r.w))),
  y: Math.max(0, Math.min(r.y, Math.max(0, vh - 48))),
  w: Math.max(WIN_MIN_W, Math.min(r.w, vw)),
  h: Math.max(WIN_MIN_H, Math.min(r.h, vh)),
});

interface UiState {
  wins: Record<WinId, WinState>;
  laidOut: boolean;
  zTop: number;
  booted: boolean;
  notices: Notice[];
  msgLog: MsgEntry[];
  desktop: { w: number; h: number };
}

interface UiActions {
  layout(vw: number, vh: number): void;
  /** 데스크톱(뷰포트) 크기 변경 반영 — 창 위치를 새 경계 안으로 다시 가둔다 (배치는 보존) */
  setDesktop(w: number, h: number): void;
  openWin(id: WinId): void;
  closeWin(id: WinId): void;
  minWin(id: WinId): void;
  focusWin(id: WinId): void;
  moveWin(id: WinId, x: number, y: number): void;
  resizeWin(id: WinId, w: number, h: number): void;
  isFocused(id: WinId): boolean;
  setBooted(v: boolean): void;
  notify(text: string): void;
  dismissNotice(id: number): void;
  pushMsg(m: Omit<MsgEntry, 'id'>): void;
  resetUi(): void;
}

let seq = 0;

export const useUi = create<UiState & UiActions>()((set, get) => ({
  wins: structuredClone(BASE_WINS),
  laidOut: false,
  zTop: 6,
  booted: false,
  notices: [],
  msgLog: [],
  desktop: { w: 1280, h: 720 },

  layout(vw, vh) {
    const rects = defaultLayout(vw, vh);
    set((s) => ({
      laidOut: true,
      desktop: { w: vw, h: vh },
      wins: Object.fromEntries(
        (Object.keys(s.wins) as WinId[]).map((id) => [
          id,
          { ...s.wins[id], ...clampRect(rects[id], vw, vh) },
        ]),
      ) as Record<WinId, WinState>,
    }));
  },

  setDesktop(w, h) {
    if (w <= 0 || h <= 0) return;
    set((s) => {
      if (s.desktop.w === w && s.desktop.h === h) return s;
      return {
        desktop: { w, h },
        wins: Object.fromEntries(
          (Object.keys(s.wins) as WinId[]).map((id) => {
            const win = s.wins[id];
            return [
              id,
              {
                ...win,
                // 창 크기는 보존하되, 새 경계 밖으로 나간 창은 헤더가 잡히도록 되돌린다
                x: Math.max(0, Math.min(win.x, w - Math.min(win.w, 160))),
                y: Math.max(0, Math.min(win.y, h - 40)),
              },
            ];
          }),
        ) as Record<WinId, WinState>,
      };
    });
  },
  openWin(id) {
    const z = get().zTop + 1;
    set((s) => ({
      zTop: z,
      wins: { ...s.wins, [id]: { ...s.wins[id], open: true, min: false, z } },
    }));
  },
  closeWin(id) {
    set((s) => ({ wins: { ...s.wins, [id]: { ...s.wins[id], open: false } } }));
  },
  minWin(id) {
    set((s) => ({ wins: { ...s.wins, [id]: { ...s.wins[id], min: true } } }));
  },
  focusWin(id) {
    if (get().wins[id].z === get().zTop) return;
    const z = get().zTop + 1;
    set((s) => ({ zTop: z, wins: { ...s.wins, [id]: { ...s.wins[id], z } } }));
  },
  moveWin(id, x, y) {
    const { w: vw, h: vh } = get().desktop;
    set((s) => {
      const win = s.wins[id];
      return {
        wins: {
          ...s.wins,
          [id]: {
            ...win,
            x: Math.max(0, Math.min(x, vw - Math.min(win.w, 160))),
            y: Math.max(0, Math.min(y, vh - 40)),
          },
        },
      };
    });
  },
  resizeWin(id, w, h) {
    const { w: vw, h: vh } = get().desktop;
    set((s) => {
      const win = s.wins[id];
      return {
        wins: {
          ...s.wins,
          [id]: {
            ...win,
            w: Math.max(WIN_MIN_W, Math.min(w, vw - win.x)),
            h: Math.max(WIN_MIN_H, Math.min(h, vh - win.y)),
          },
        },
      };
    });
  },
  isFocused(id) {
    return get().wins[id].z === get().zTop;
  },

  setBooted: (booted) => set({ booted }),

  notify(text) {
    const id = ++seq;
    set((s) => ({ notices: [...s.notices.slice(-4), { id, text }] }));
    setTimeout(() => get().dismissNotice(id), 4600);
  },
  dismissNotice(id) {
    set((s) => ({ notices: s.notices.filter((n) => n.id !== id) }));
  },

  pushMsg(m) {
    set((s) => ({ msgLog: [...s.msgLog.slice(-199), { ...m, id: ++seq }] }));
  },

  resetUi() {
    set({
      wins: structuredClone(BASE_WINS),
      laidOut: false,
      zTop: 6,
      notices: [],
      msgLog: [],
    });
  },
}));
