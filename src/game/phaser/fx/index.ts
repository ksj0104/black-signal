import type { SceneId } from '../../../content/scenes';
import type { Painter } from './helpers';
import { fxApartment } from './apartment';
import { fxParents } from './parents';
import { fxSoc } from './soc';
import { fxStation } from './station';
import { fxHanseo } from './hanseo';

/** 씬 id → 생성 배경 위에 얹는 640×360 이펙트 페인터 */
export const SCENE_FX: Record<SceneId, Painter> = {
  apartment: fxApartment,
  parents: fxParents,
  soc: fxSoc,
  station: fxStation,
  hanseo: fxHanseo,
};
