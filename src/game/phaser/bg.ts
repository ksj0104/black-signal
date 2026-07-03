import type { SceneId } from '../../content/scenes';

/** 씬 배경 이미지의 public 경로 (Vite public/ 루트 기준) */
export const bgUrl = (id: SceneId): string => `scenes/${id}.png`;
