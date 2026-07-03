import type { SceneId } from '../../../content/scenes';
import type { Painter } from './helpers';
import { paintApartment } from './apartment';
import { paintParents } from './parents';
import { paintSoc } from './soc';
import { paintStation } from './station';

/** 씬 id → 코드 드로잉 페인터. 새 로케이션은 페인터 추가 + scenes.ts 정의로 확장. */
export const SCENE_ART: Record<SceneId, Painter> = {
  apartment: paintApartment,
  parents: paintParents,
  soc: paintSoc,
  station: paintStation,
};
