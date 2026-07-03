import { useGame } from '../state/gameStore';
import { PhaserHost } from '../game/PhaserHost';
import { sceneForChapter, type SceneApi } from '../content/scenes';
import { sClick } from '../engine/audio/audio';

/** 데이터 구동 픽셀 씬 — 챕터에 맞는 로케이션·핫스팟·캡션을 SCENES 정의로 렌더 */
export function SceneScreen() {
  const chapter = useGame((s) => s.chapter);
  const flags = useGame((s) => s.flags);
  const boardUnlocked = useGame((s) => s.boardUnlocked);
  const openDialogue = useGame((s) => s.openDialogue);
  const setFlag = useGame((s) => s.setFlag);
  const setScreen = useGame((s) => s.setScreen);
  const saveGame = useGame((s) => s.saveGame);

  const def = sceneForChapter(chapter);
  const api: SceneApi = {
    chapter,
    flags,
    boardUnlocked: boardUnlocked[chapter],
    openDialogue,
    setFlag,
    setScreen,
    saveGame: () => saveGame(true),
  };

  return (
    <section id="scene" className="screen on">
      <div id="sceneWrap">
        <PhaserHost key={def.id} sceneId={def.id} aria={def.aria} />
        {def.hotspots.map((h) => (
          <button
            key={h.id}
            className={'hot' + (h.pulse?.(api) ? ' pulse' : '')}
            style={{
              left: h.rect.l + '%',
              top: h.rect.t + '%',
              width: h.rect.w + '%',
              height: h.rect.h + '%',
            }}
            onClick={() => {
              sClick();
              h.onClick(api);
            }}
          >
            <span className="hotLabel">{h.label}</span>
          </button>
        ))}
      </div>
      <div id="sceneCap">
        <span>
          <b className="sceneLoc">{def.name}</b>
          {' — '}
          {def.caption(api)}
        </span>
        <span>{def.clock}</span>
      </div>
    </section>
  );
}
