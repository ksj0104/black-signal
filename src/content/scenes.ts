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
  DLG_HS_BOX,
  DLG_HS_MAP,
  DLG_HS_TV,
  DLG_HS_WINDOW,
  DLG_SOC_COFFEE,
  DLG_SOC_GLASS,
  DLG_SOC_HANNA,
  DLG_SOC_WALL,
  DLG_ST_CCTV,
  DLG_ST_DOOR,
  DLG_ST_SIGN,
  DLG_ST_VEND,
} from './dialogues/scenes';

export type SceneId = 'apartment' | 'parents' | 'soc' | 'station' | 'hanseo';

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
      id: 'window',
      label: '창문',
      // 좌측 경계는 실측 유리 시작점(≈56%)까지 확장. 배열 순서(렌더링/클릭 우선순위)는
      // window < desk < phone: 겹치는 구간(56~64%, 우측 모니터)에서는 desk가 배열상
      // 이후에 와서 window 위에 렌더링되어 클릭을 가져가고, phone은 desk/window 둘 다와
      // 겹치는 작은 타겟이므로 배열 맨 뒤에 두어 항상 최상단에서 클릭을 받는다.
      // board는 배열 맨 뒤(desk 이후)에 위치해, desk와의 작은 모서리 겹침
      // (x35~39%, y34~49%)에서도 board가 항상 클릭을 가져간다.
      rect: { l: 56, t: 5, w: 42, h: 52 },
      onClick: (a) => a.openDialogue(DLG_WIN),
    },
    {
      id: 'desk',
      label: '워크스테이션',
      rect: { l: 35, t: 34, w: 29, h: 26 },
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
      id: 'phone',
      label: '휴대폰',
      rect: { l: 61, t: 51, w: 6, h: 7 },
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
      id: 'board',
      label: '사건 게시판',
      rect: { l: 16, t: 17, w: 23, h: 32 },
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
      rect: { l: 1, t: 3, w: 23, h: 24 },
      onClick: (a) => a.openDialogue(DLG_HOME_PHOTO),
    },
    {
      id: 'tv',
      label: 'TV 뉴스',
      rect: { l: 25, t: 32, w: 17, h: 32 },
      onClick: (a) => a.openDialogue(DLG_HOME_TV),
    },
    {
      id: 'laptop',
      label: '노트북',
      rect: { l: 50, t: 55, w: 11, h: 18 },
      pulse: () => true,
      onClick: (a) => a.setScreen('work'),
    },
    {
      id: 'phone',
      label: '유선 전화',
      rect: { l: 14, t: 27, w: 9, h: 11 },
      onClick: (a) => a.openDialogue(DLG_HOME_PHONE),
    },
    {
      id: 'window',
      label: '창문',
      rect: { l: 70, t: 3, w: 21, h: 50 },
      onClick: (a) => a.openDialogue(DLG_HOME_WINDOW),
    },
    {
      id: 'door',
      label: '현관문',
      rect: { l: 93, t: 8, w: 7, h: 88 },
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
      // 실측: 3분할 패널 프레임이 13~71%, 6~38%. 우측 경계는 glass 핫스팟과
      // x=71%에서 정확히 맞닿는다 (겹침 없음).
      rect: { l: 13, t: 6, w: 58, h: 32 },
      onClick: (a) => a.openDialogue(DLG_SOC_WALL),
    },
    {
      id: 'hanna',
      label: '한나의 자리',
      // 실측: 데스크+듀얼모니터+의자 클러스터가 스펙보다 왼쪽/위로 치우침.
      // 좌측을 10%로 다듬어 coffee 핫스팟과의 1% 겹침을 제거.
      rect: { l: 10, t: 47, w: 24, h: 38 },
      onClick: (a) => a.openDialogue(DLG_SOC_HANNA),
    },
    {
      id: 'console',
      label: '내 콘솔',
      // 실측: 듀얼모니터+의자 클러스터가 스펙보다 위로 치우침 (모니터 상단 ≈47%).
      rect: { l: 41, t: 47, w: 24, h: 40 },
      pulse: () => true,
      onClick: (a) => a.setScreen('work'),
    },
    {
      id: 'glass',
      label: '회의실',
      // 실측: 유리벽이 스펙보다 훨씬 위(천장 인근, t≈16%)부터 시작하고
      // 좌측 경계(71%)가 wall 핫스팟 우측 경계와 정확히 맞닿는다.
      rect: { l: 71, t: 16, w: 27, h: 64 },
      onClick: (a) => a.openDialogue(DLG_SOC_GLASS),
    },
    {
      id: 'coffee',
      label: '커피 머신',
      // 실측: 머신+카운터가 화면 좌측 끝(l0)부터 시작, 스펙보다 살짝 아래(t37)/넓게(h43).
      rect: { l: 0, t: 37, w: 10, h: 43 },
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
      rect: { l: 52, t: 51, w: 9, h: 10 },
      pulse: () => true,
      onClick: (a) => a.setScreen('work'),
    },
    {
      id: 'cctv',
      label: 'CCTV',
      rect: { l: 85, t: 8, w: 9, h: 9 },
      onClick: (a) => a.openDialogue(DLG_ST_CCTV),
    },
    {
      id: 'sign',
      label: '전광판',
      rect: { l: 33, t: 7, w: 32, h: 12 },
      onClick: (a) => a.openDialogue(DLG_ST_SIGN),
    },
    {
      id: 'vend',
      label: '자판기',
      rect: { l: 84, t: 28, w: 15, h: 48 },
      onClick: (a) => a.openDialogue(DLG_ST_VEND),
    },
    {
      id: 'doors',
      label: '스크린도어',
      rect: { l: 17, t: 20, w: 65, h: 30 },
      onClick: (a) => a.openDialogue(DLG_ST_DOOR),
    },
  ],
};

const HANSEO: SceneDef = {
  id: 'hanseo',
  name: '한서 임시 거점 — 오피스텔 사무실',
  aria: '늦가을 밤, 한서시 오피스텔에 차린 임시 수사 거점',
  clock: '11:29 PM',
  caption: () => '제보자의 상자와 공표된 숫자들. 워크스테이션이 기다린다.',
  hotspots: [
    {
      id: 'window',
      label: '창문',
      // 실측: 창 프레임이 x61%부터 우측 끝까지, 창턱이 y≈49%. desk 우측 경계(61%)와
      // 정확히 맞닿는다. 배열 순서(클릭 우선순위)는 window/map < tv/desk < box:
      // 작은 타깃일수록 배열 뒤에 둔다.
      rect: { l: 61, t: 0, w: 39, h: 49 },
      onClick: (a) => a.openDialogue(DLG_HS_WINDOW),
    },
    {
      id: 'map',
      label: '개표구 지도',
      // 실측: 코르크판이 x7~38%, y4~40%. desk 와의 모서리 겹침(32~38%, 33~40%)은
      // desk 가 배열상 이후라 desk 가 가져간다.
      rect: { l: 7, t: 4, w: 31, h: 36 },
      onClick: (a) => a.openDialogue(DLG_HS_MAP),
    },
    {
      id: 'tv',
      label: 'TV',
      // 실측: CRT 본체 x8~25%, y40~69% (아래 서랍장 제외)
      rect: { l: 8, t: 40, w: 17, h: 29 },
      onClick: (a) => a.openDialogue(DLG_HS_TV),
    },
    {
      id: 'desk',
      label: '워크스테이션',
      // 실측: 듀얼 모니터+데스크 상판 x32~61%, y33~65%
      rect: { l: 32, t: 33, w: 29, h: 32 },
      pulse: () => true,
      onClick: (a) => a.setScreen('work'),
    },
    {
      id: 'box',
      label: '제보 상자',
      // 실측: 열린 종이 상자 x60~84%, y67~92%
      rect: { l: 60, t: 67, w: 24, h: 25 },
      onClick: (a) => a.openDialogue(DLG_HS_BOX),
    },
  ],
};

export const SCENES: Record<SceneId, SceneDef> = {
  apartment: APARTMENT,
  parents: PARENTS,
  soc: SOC,
  station: STATION,
  hanseo: HANSEO,
};

/** 챕터 → 로케이션. 새 챕터의 무대는 여기서만 매핑한다. */
export function sceneForChapter(chapter: number): SceneDef {
  if (chapter <= 1) return APARTMENT;
  if (chapter === 2) return PARENTS;
  if (chapter === 3) return SOC;
  if (chapter >= 7) return HANSEO;
  return STATION;
}
