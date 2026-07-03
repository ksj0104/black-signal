import type { Beat } from '../engine/types';
import {
  DLG_BOARD_LATER,
  DLG_BOARD_LOCK,
  DLG_DESK_LOCK,
  DLG_MOM,
  DLG_PHONE_DONE,
  DLG_WIN,
} from './dialogues';
import {
  DLG_APT_PHONE_LATER,
  DLG_HOME_DOOR,
  DLG_HOME_PHONE,
  DLG_HOME_PHOTO,
  DLG_HOME_TV,
  DLG_HOME_WINDOW,
  DLG_SOC_COFFEE,
  DLG_SOC_GLASS,
  DLG_SOC_HANNA,
  DLG_SOC_WALL,
  DLG_ST_CCTV,
  DLG_ST_DOOR,
  DLG_ST_SIGN,
  DLG_ST_VEND,
} from './dialogues/scenes';

export type SceneId = 'apartment' | 'parents' | 'soc' | 'station';

/** 핫스팟 클릭/캡션이 게임 상태에 접근하는 좁은 창구 (표현 계층 전용) */
export interface SceneApi {
  chapter: number;
  flags: Record<string, unknown>;
  boardUnlocked: boolean;
  openDialogue(beats: Beat[], onDone?: () => void): void;
  setFlag(k: string, v: unknown): void;
  setScreen(s: 'work'): void;
  saveGame(): void;
}

export interface HotspotDef {
  id: string;
  label: string;
  /** 씬 위 배치 (% 단위: left/top/width/height) */
  rect: { l: number; t: number; w: number; h: number };
  /** 강조 펄스 여부 (진행 유도) */
  pulse?: (api: SceneApi) => boolean;
  onClick(api: SceneApi): void;
}

export interface SceneDef {
  id: SceneId;
  /** 캡션 바에 표시되는 로케이션 명 */
  name: string;
  /** 캔버스 aria-label */
  aria: string;
  /** 게임 내 시각 표기 */
  clock: string;
  caption(api: SceneApi): string;
  hotspots: HotspotDef[];
}

const APARTMENT: SceneDef = {
  id: 'apartment',
  name: '서준의 아파트 — 작업실',
  aria: '비 내리는 새벽, 서준의 아파트 작업실',
  clock: '02:41 AM',
  caption: (a) =>
    a.chapter >= 1
      ? '사건은 공식이 됐다. 워크스테이션이 기다린다.'
      : !a.flags.phoneRead
        ? '책상 위 휴대폰이 조용히 진동하고 있다.'
        : '워크스테이션이 로그인 대기 중이다.',
  hotspots: [
    {
      id: 'phone',
      label: '휴대폰',
      rect: { l: 57, t: 51, w: 7, h: 8 },
      pulse: (a) => a.chapter === 0 && !a.flags.phoneRead,
      onClick(a) {
        if (a.chapter >= 1) {
          a.openDialogue(DLG_APT_PHONE_LATER);
          return;
        }
        if (a.flags.phoneRead) {
          a.openDialogue(DLG_PHONE_DONE);
          return;
        }
        a.openDialogue(DLG_MOM, () => {
          a.setFlag('phoneRead', true);
          a.setFlag('deskUnlocked', true);
          a.saveGame();
        });
      },
    },
    {
      id: 'desk',
      label: '워크스테이션',
      rect: { l: 35, t: 33, w: 20, h: 25 },
      pulse: (a) =>
        a.chapter >= 1 || (!!a.flags.deskUnlocked && !a.flags.prologueDone),
      onClick(a) {
        if (a.chapter === 0 && !a.flags.deskUnlocked) {
          a.openDialogue(DLG_DESK_LOCK);
          return;
        }
        a.setScreen('work');
      },
    },
    {
      id: 'window',
      label: '창문',
      rect: { l: 69, t: 12, w: 29, h: 48 },
      onClick: (a) => a.openDialogue(DLG_WIN),
    },
    {
      id: 'board',
      label: '사건 게시판',
      rect: { l: 6, t: 15, w: 18, h: 33 },
      onClick: (a) => a.openDialogue(a.boardUnlocked ? DLG_BOARD_LATER : DLG_BOARD_LOCK),
    },
  ],
};

const PARENTS: SceneDef = {
  id: 'parents',
  name: '부모님 집 — 거실',
  aria: '밤의 부모님 집 거실, 창밖에는 비 내리는 골목',
  clock: '09:17 PM',
  caption: () => '오늘은 여기서 원격으로 접속한다. 부모님 곁에서.',
  hotspots: [
    {
      id: 'photo',
      label: '가족사진',
      rect: { l: 6, t: 10, w: 19, h: 15 },
      onClick: (a) => a.openDialogue(DLG_HOME_PHOTO),
    },
    {
      id: 'tv',
      label: 'TV 뉴스',
      rect: { l: 26, t: 36, w: 15, h: 28 },
      onClick: (a) => a.openDialogue(DLG_HOME_TV),
    },
    {
      id: 'laptop',
      label: '노트북',
      rect: { l: 47, t: 62, w: 13, h: 16 },
      pulse: () => true,
      onClick: (a) => a.setScreen('work'),
    },
    {
      id: 'phone',
      label: '유선 전화',
      rect: { l: 15, t: 20, w: 7, h: 9 },
      onClick: (a) => a.openDialogue(DLG_HOME_PHONE),
    },
    {
      id: 'window',
      label: '창문',
      rect: { l: 74, t: 12, w: 20, h: 43 },
      onClick: (a) => a.openDialogue(DLG_HOME_WINDOW),
    },
    {
      id: 'door',
      label: '현관문',
      rect: { l: 95, t: 18, w: 5, h: 48 },
      onClick: (a) => a.openDialogue(DLG_HOME_DOOR),
    },
  ],
};

const SOC: SceneDef = {
  id: 'soc',
  name: '이지스 리스폰스 — SOC 상황실',
  aria: '새벽의 이지스 리스폰스 보안관제센터',
  clock: '03:12 AM',
  caption: () => '포렌식 열람 인가가 떨어진 밤. 상황실은 아직 깨어 있다.',
  hotspots: [
    {
      id: 'wall',
      label: '메인 상황판',
      rect: { l: 6, t: 7, w: 89, h: 28 },
      onClick: (a) => a.openDialogue(DLG_SOC_WALL),
    },
    {
      id: 'hanna',
      label: '한나의 자리',
      rect: { l: 16, t: 57, w: 20, h: 25 },
      onClick: (a) => a.openDialogue(DLG_SOC_HANNA),
    },
    {
      id: 'console',
      label: '내 콘솔',
      rect: { l: 42, t: 57, w: 24, h: 28 },
      pulse: () => true,
      onClick: (a) => a.setScreen('work'),
    },
    {
      id: 'glass',
      label: '회의실',
      rect: { l: 76, t: 39, w: 22, h: 38 },
      onClick: (a) => a.openDialogue(DLG_SOC_GLASS),
    },
    {
      id: 'coffee',
      label: '커피 머신',
      rect: { l: 2, t: 52, w: 8, h: 19 },
      onClick: (a) => a.openDialogue(DLG_SOC_COFFEE),
    },
  ],
};

const STATION: SceneDef = {
  id: 'station',
  name: '심야 승강장 — 접선 좌표',
  aria: '막차가 끊긴 심야 지하철 승강장',
  clock: '00:47 AM',
  caption: () => 'NW 가 지정한 접선 좌표. 막차는 이미 끊겼다.',
  hotspots: [
    {
      id: 'bag',
      label: '노트북 가방',
      rect: { l: 39, t: 55, w: 19, h: 18 },
      pulse: () => true,
      onClick: (a) => a.setScreen('work'),
    },
    {
      id: 'cctv',
      label: 'CCTV',
      rect: { l: 87, t: 12, w: 8, h: 10 },
      onClick: (a) => a.openDialogue(DLG_ST_CCTV),
    },
    {
      id: 'sign',
      label: '전광판',
      rect: { l: 36, t: 14, w: 29, h: 11 },
      onClick: (a) => a.openDialogue(DLG_ST_SIGN),
    },
    {
      id: 'vend',
      label: '자판기',
      rect: { l: 89, t: 32, w: 10, h: 36 },
      onClick: (a) => a.openDialogue(DLG_ST_VEND),
    },
    {
      id: 'doors',
      label: '스크린도어',
      rect: { l: 18, t: 26, w: 66, h: 26 },
      onClick: (a) => a.openDialogue(DLG_ST_DOOR),
    },
  ],
};

export const SCENES: Record<SceneId, SceneDef> = {
  apartment: APARTMENT,
  parents: PARENTS,
  soc: SOC,
  station: STATION,
};

/** 챕터 → 로케이션. 새 챕터의 무대는 여기서만 매핑한다. */
export function sceneForChapter(chapter: number): SceneDef {
  if (chapter <= 1) return APARTMENT;
  if (chapter === 2) return PARENTS;
  if (chapter === 3) return SOC;
  return STATION;
}
