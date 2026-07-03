import Phaser from 'phaser';
import type { Mem, Painter, SceneEnv } from './art/helpers';
import type { SceneId } from '../../content/scenes';
import { SCENE_ART } from './art';
import { SCENE_FX } from './fx';
import { bgUrl } from './bg';

/** 640×360 픽셀 씬 — 생성 배경 PNG + 코드 이펙트. 배경 없으면 코드 아트 2× 폴백. */
export class PixelScene extends Phaser.Scene {
  static KEY = 'pixel';
  private g!: Phaser.GameObjects.Graphics;
  private frame = 0;
  private mem: Mem = {};
  private sceneId: SceneId = 'apartment';
  private hasBg = false;
  private getEnv: () => SceneEnv = () => ({
    chapter: 0,
    reduced: false,
    phoneRead: false,
    boardDone: false,
  });

  constructor() {
    super(PixelScene.KEY);
  }
  init(data: { sceneId?: SceneId; getEnv?: () => SceneEnv }) {
    if (data.sceneId) this.sceneId = data.sceneId;
    if (data.getEnv) this.getEnv = data.getEnv;
  }
  preload() {
    this.load.image('bg:' + this.sceneId, bgUrl(this.sceneId));
  }
  create() {
    this.hasBg = this.textures.exists('bg:' + this.sceneId);
    if (this.hasBg) this.add.image(0, 0, 'bg:' + this.sceneId).setOrigin(0, 0);
    this.g = this.add.graphics();
    if (!this.hasBg) this.g.setScale(2); // 320×180 좌표계 코드 아트 폴백
    this.mem = {};
  }
  update() {
    this.frame++;
    this.g.clear();
    const paint: Painter = this.hasBg ? SCENE_FX[this.sceneId] : SCENE_ART[this.sceneId];
    paint(this.g, this.frame, this.getEnv(), this.mem);
  }
}
