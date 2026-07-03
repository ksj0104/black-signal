import { describe, expect, it, vi } from 'vitest';
import { SCENES, sceneForChapter, type SceneApi } from '../content/scenes';
import { SCENE_ART } from '../game/phaser/art';
import { SCENE_FX } from '../game/phaser/fx';
import { bgUrl } from '../game/phaser/bg';
import { DLG_MOM, DLG_DESK_LOCK, DLG_PHONE_DONE } from '../content/dialogues';
import { DLG_APT_PHONE_LATER } from '../content/dialogues/scenes';

function mockApi(over: Partial<SceneApi> = {}): SceneApi {
  return {
    chapter: 0,
    flags: {},
    boardUnlocked: false,
    openDialogue: vi.fn(),
    setFlag: vi.fn(),
    setScreen: vi.fn(),
    saveGame: vi.fn(),
    ...over,
  };
}

describe('sceneForChapter — 챕터별 로케이션 매핑', () => {
  it('프롤로그·Ch1 은 아파트', () => {
    expect(sceneForChapter(0).id).toBe('apartment');
    expect(sceneForChapter(1).id).toBe('apartment');
  });
  it('Ch2 는 부모님 집, Ch3 는 SOC, Ch4 이후는 승강장', () => {
    expect(sceneForChapter(2).id).toBe('parents');
    expect(sceneForChapter(3).id).toBe('soc');
    expect(sceneForChapter(4).id).toBe('station');
    expect(sceneForChapter(9).id).toBe('station');
  });
});

describe('배경 에셋 URL', () => {
  it('씬 id → public 경로', () => {
    expect(bgUrl('apartment')).toBe('scenes/apartment.png');
    expect(bgUrl('station')).toBe('scenes/station.png');
  });
});

describe('씬 정의 무결성', () => {
  const defs = Object.values(SCENES);
  it('모든 씬에 페인터가 등록돼 있다', () => {
    for (const d of defs) expect(typeof SCENE_ART[d.id]).toBe('function');
  });
  it('모든 씬에 이펙트 페인터가 등록돼 있다', () => {
    for (const d of defs) expect(typeof SCENE_FX[d.id]).toBe('function');
  });
  it('핫스팟 id 는 씬 내에서 유일하고 라벨이 있다', () => {
    for (const d of defs) {
      const ids = d.hotspots.map((h) => h.id);
      expect(new Set(ids).size).toBe(ids.length);
      for (const h of d.hotspots) expect(h.label.length).toBeGreaterThan(0);
    }
  });
  it('핫스팟 배치는 씬(0~100%) 안에 있다', () => {
    for (const d of defs)
      for (const h of d.hotspots) {
        expect(h.rect.l).toBeGreaterThanOrEqual(0);
        expect(h.rect.t).toBeGreaterThanOrEqual(0);
        expect(h.rect.l + h.rect.w).toBeLessThanOrEqual(100);
        expect(h.rect.t + h.rect.h).toBeLessThanOrEqual(100);
      }
  });
  it('모든 씬은 워크스테이션으로 들어가는 핫스팟을 하나 이상 가진다', () => {
    for (const d of defs) {
      const api = mockApi({ chapter: 5, flags: { deskUnlocked: true } });
      d.hotspots.forEach((h) => h.onClick(api));
      expect(api.setScreen).toHaveBeenCalledWith('work');
    }
  });
  it('캡션은 항상 문자열을 돌려준다', () => {
    for (const d of defs) expect(typeof d.caption(mockApi())).toBe('string');
  });
});

describe('아파트 씬 — 프롤로그 흐름', () => {
  const apt = SCENES.apartment;
  const hot = (id: string) => apt.hotspots.find((h) => h.id === id)!;

  it('휴대폰: 첫 통화가 phoneRead/deskUnlocked 를 세팅하고 저장한다', () => {
    const api = mockApi();
    hot('phone').onClick(api);
    const [beats, onDone] = (api.openDialogue as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(beats).toBe(DLG_MOM);
    onDone();
    expect(api.setFlag).toHaveBeenCalledWith('phoneRead', true);
    expect(api.setFlag).toHaveBeenCalledWith('deskUnlocked', true);
    expect(api.saveGame).toHaveBeenCalled();
  });
  it('휴대폰: 통화 후 재클릭은 완료 대사, Ch1 부터는 회상 대사', () => {
    const done = mockApi({ flags: { phoneRead: true } });
    hot('phone').onClick(done);
    expect(done.openDialogue).toHaveBeenCalledWith(DLG_PHONE_DONE);
    const later = mockApi({ chapter: 1 });
    hot('phone').onClick(later);
    expect(later.openDialogue).toHaveBeenCalledWith(DLG_APT_PHONE_LATER);
  });
  it('워크스테이션: 통화 전엔 잠김, 해금 후엔 work 로 전환', () => {
    const locked = mockApi();
    hot('desk').onClick(locked);
    expect(locked.openDialogue).toHaveBeenCalledWith(DLG_DESK_LOCK);
    expect(locked.setScreen).not.toHaveBeenCalled();
    const open = mockApi({ flags: { deskUnlocked: true } });
    hot('desk').onClick(open);
    expect(open.setScreen).toHaveBeenCalledWith('work');
  });
  it('휴대폰 펄스는 프롤로그의 통화 전에만 켜진다', () => {
    expect(hot('phone').pulse!(mockApi())).toBe(true);
    expect(hot('phone').pulse!(mockApi({ flags: { phoneRead: true } }))).toBe(false);
    expect(hot('phone').pulse!(mockApi({ chapter: 1 }))).toBe(false);
  });
});
