import Phaser from 'phaser';
import type { Mem, Painter, SceneEnv } from './fx/helpers';
import type { SceneId } from '../../content/scenes';
import { SCENE_FX } from './fx';
import { bgUrl } from './bg';

/** 640×360 픽셀 씬 — 생성 배경 PNG 위에 코드 이펙트 레이어를 얹는다. */
export class PixelScene extends Phaser.Scene {
  static KEY = 'pixel';
  private g!: Phaser.GameObjects.Graphics;
  private frame = 0;
  private mem: Mem = {};
  private sceneId: SceneId = 'apartment';
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
    if (this.textures.exists('bg:' + this.sceneId)) {
      this.add.image(0, 0, 'bg:' + this.sceneId).setOrigin(0, 0);
    } else {
      console.error('[scene] missing background: ' + this.sceneId);
    }
    this.g = this.add.graphics();
    this.mem = {};
  }
  update() {
    this.frame++;
    this.g.clear();
    const paint: Painter = SCENE_FX[this.sceneId];
    paint(this.g, this.frame, this.getEnv(), this.mem);
  }
}
