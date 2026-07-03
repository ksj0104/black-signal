import Phaser from 'phaser';
import type { Mem, Painter, SceneEnv } from './art/helpers';

/** 페인터를 주입받아 매 프레임 그리는 제네릭 320×180 픽셀 씬 */
export class PixelScene extends Phaser.Scene {
  static KEY = 'pixel';
  private g!: Phaser.GameObjects.Graphics;
  private frame = 0;
  private mem: Mem = {};
  private paint: Painter = () => {};
  private getEnv: () => SceneEnv = () => ({
    chapter: 0,
    reduced: false,
    phoneRead: false,
    boardDone: false,
  });

  constructor() {
    super(PixelScene.KEY);
  }
  init(data: { paint?: Painter; getEnv?: () => SceneEnv }) {
    if (data.paint) this.paint = data.paint;
    if (data.getEnv) this.getEnv = data.getEnv;
  }
  create() {
    this.g = this.add.graphics();
    this.mem = {};
  }
  update() {
    this.frame++;
    this.g.clear();
    this.paint(this.g, this.frame, this.getEnv(), this.mem);
  }
}
