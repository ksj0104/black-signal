import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { PixelScene } from './phaser/PixelScene';
import type { SceneEnv } from './phaser/art/helpers';
import type { SceneId } from '../content/scenes';
import { useGame } from '../state/gameStore';

/** 씬 id를 주입받아 640×360 픽셀 씬을 React 생명주기에 마운트 */
export function PhaserHost({ sceneId, aria }: { sceneId: SceneId; aria: string }) {
  const host = useRef<HTMLDivElement>(null);
  const game = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    if (!host.current || game.current) return;
    const getEnv = (): SceneEnv => {
      const s = useGame.getState();
      return {
        chapter: s.chapter,
        phoneRead: !!s.flags.phoneRead,
        boardDone: s.boardDone[s.chapter],
        reduced: s.cfg.rm || window.matchMedia('(prefers-reduced-motion: reduce)').matches,
      };
    };
    game.current = new Phaser.Game({
      type: Phaser.CANVAS,
      parent: host.current,
      width: 640,
      height: 360,
      pixelArt: true,
      backgroundColor: '#0b1020',
      scale: { mode: Phaser.Scale.NONE },
      banner: false,
    });
    game.current.scene.add(PixelScene.KEY, PixelScene, true, { sceneId, getEnv });
    return () => {
      game.current?.destroy(true);
      game.current = null;
    };
  }, [sceneId]);

  return <div ref={host} className="pxHost" aria-label={aria} />;
}
