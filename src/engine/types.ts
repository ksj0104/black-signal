/** 게임 전역 공용 타입. 모든 데이터는 허구이며 인메모리에서만 동작한다. */
import type { VNode } from './vfs/vfs';
import type { Database } from './query/query';
import type { PylabDef } from './pylab/pylab';
import type { CctvDef } from './cctv/cctv';
import type { PkgDef } from './pkg/pkg';

/** 챕터 식별자. 실제 사용되는 id 목록은 CHAPTERS 레지스트리에서 파생된다. */
export type ChapterId = number;

export interface Stats {
  integrity: number; // 증거 신뢰도
  trust: number; // 공적 신뢰
  nullwave: number; // 널웨이브 신뢰
  family: number; // 가족 유대
}

export interface Cfg {
  fs: number;
  hc: boolean;
  rm: boolean;
  /** 효과음 볼륨 (0–100) */
  vol: number;
  /** 배경음(앰비언트) 볼륨 (0–100) */
  amb: number;
  mute: boolean;
  /** 표시 이름 (기본 "서준") — 대화·엔딩 표시층에서만 치환 */
  name: string;
}

export type TermCls = 'cmd' | 'err' | 'ok' | 'dim' | undefined;
export interface TermLine {
  text: string;
  cls?: TermCls;
}

export interface BoardNode {
  id: string;
  k: string; // 카테고리 라벨
  t: string; // 표시 텍스트
  cls: 'person' | 'server' | 'org' | 'item';
  x: number; // 초기 위치(%)
  y: number;
}

export interface BoardDef {
  nodes: BoardNode[];
  good: [string, string][];
  why: Record<string, string>;
  deduce: string; // 추론 완료 HTML
}

export interface ObjectiveDef {
  key: string;
  label: string;
}

/** 케이스 탭에 표시되는 사건 요약 (모두 데이터) */
export interface CaseSummary {
  target: string; // 대상/피해자 한 줄
  clues: { key: string; label: string }[]; // 확보 단서 목록 (목표 key → 표시 라벨)
  hypothesis: { locked: string; unlocked: string }; // 현재 가설 (HTML, 보드 해금 전/후)
  safety: string; // 안전 고지 (HTML)
}

/** 챕터 완료 화면(엔딩) 데이터 */
export interface EndingDef {
  doneTitle: string; // 완료 헤더 (예: "CHAPTER 1 완료 — EchoGate")
  summary: string; // 완료 요약 한 줄
  choiceFlag: string; // 피날레 선택이 저장된 플래그
  choices: Record<string, string>; // 선택값 → 요약 라벨
  nextTitle: string; // 다음 챕터 예고 제목
  nextBody: string; // 다음 챕터 예고 본문 (HTML)
  nextNote?: string; // 시작 버튼 위 안내 (다음 챕터가 구현된 경우)
  pendingNote?: string; // 다음 챕터 미구현 시 안내
  /** 최종 챕터 — EndScreen 이 엔딩 결정 함수(A~D)와 에필로그를 렌더한다 (시즌1) */
  finalEnding?: boolean;
  /** 시즌2 피날레 — EndScreen 이 ch10Release 선택별 에필로그(ENDINGS2)를 렌더한다 */
  finalEndingV2?: boolean;
}

/** 목표 확보 시 1회 발동하는 스토리 이벤트 */
export interface ChapterEvent {
  flag: string; // 재발동 방지 플래그
  beats: Beat[];
}

export interface ChapterDef {
  id: ChapterId;
  code: string;
  title: string;
  root: string;
  /** 이 챕터의 가상 파일시스템 (ROOT_FS 는 CHAPTERS 에서 조립됨) */
  fs: VNode;
  /** 이 챕터에서 query 콘솔로 열람하는 읽기 전용 포렌식 DB (있으면 query 해금) */
  db?: Database;
  /** 이 챕터의 격리 분석 랩 데이터셋·템플릿 (있으면 python 해금) */
  pylab?: PylabDef;
  /** 이 챕터의 CCTV 증거 패키지 (있으면 cctv 명령 + CCTV REVIEW 창 해금) */
  cctv?: CctvDef;
  /** 이 챕터의 증거 패키지 조립 정의 (있으면 pkg 명령 해금 — Ch6) */
  pkg?: PkgDef;
  /** 완료 플래그 이름 (예: 'prologueDone' | 'ch1Done' …) — 세이브 호환 유지 */
  doneFlag: string;
  objectives: ObjectiveDef[];
  hints: Record<string, [string, string, string]>;
  /** 파일 절대경로 suffix → 완료되는 목표 key (cat/less 로 읽었을 때) */
  fileTriggers: Record<string, string>;
  /** 터미널 출력 스캔 — 결정적 증거가 화면에 드러나면 단서 자동 확보 */
  scan(
    txt: string,
    done: Record<string, boolean>,
  ): { msg?: string; complete?: string }[];
  /** 목표 key → 확보 순간 대화 패널에 띄울 서준의 독백 (문서 열람형 목표는 생략 가능) */
  findings: Record<string, string>;
  /** 목표 key → 확보 후 발동하는 스토리 이벤트 (선택) */
  events?: Record<string, ChapterEvent>;
  board: BoardDef;
  greeting: string[];
  /** 워크스테이션 첫 진입 시 오프닝 대화 (선택) */
  openedFlag?: string;
  opening?: (flags: Record<string, unknown>) => Beat[];
  /** 증거 보드 완성 후 사건 파일 생성 시 재생되는 피날레 */
  finale: Beat[];
  /** 케이스 탭 요약 */
  caseSummary: CaseSummary;
  /** 완료 화면 데이터 */
  ending: EndingDef;
}

/* ---- 대화 시스템 ---- */
export interface DialogueApi {
  addStat(k: keyof Stats, d: number): void;
  setFlag(k: string, v: unknown): void;
  setNullwave(d: number): void;
}
export interface Choice {
  t: string;
  fx?: (api: DialogueApi) => void;
}
export interface Beat {
  n: string;
  x: string;
  sys?: boolean;
  c?: Choice[];
  end?: boolean;
}

export const clamp = (v: number): number => Math.max(0, Math.min(100, v));
