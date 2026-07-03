import { beforeEach, describe, expect, it } from 'vitest';
import { defaultLayout, useUi, WIN_MIN_H, WIN_MIN_W, WinId } from '../state/uiStore';

const U = () => useUi.getState();

beforeEach(() => {
  U().resetUi();
});

describe('기본 창 배치', () => {
  it('모든 창의 사각형이 화면 안에 들어온다', () => {
    const vw = 1280,
      vh = 660;
    const rects = defaultLayout(vw, vh);
    for (const id of Object.keys(rects) as WinId[]) {
      const r = rects[id];
      expect(r.x).toBeGreaterThanOrEqual(0);
      expect(r.y).toBeGreaterThanOrEqual(0);
      expect(r.x + r.w).toBeLessThanOrEqual(vw);
      expect(r.y + r.h).toBeLessThanOrEqual(vh);
      expect(r.w).toBeGreaterThanOrEqual(WIN_MIN_W);
      expect(r.h).toBeGreaterThanOrEqual(WIN_MIN_H);
    }
  });

  it('좁은 화면(<720px)에서는 세로 스택으로 배치되고 화면 안에 들어온다', () => {
    const vw = 680,
      vh = 900;
    const rects = defaultLayout(vw, vh);
    for (const id of Object.keys(rects) as WinId[]) {
      const r = rects[id];
      expect(r.x + r.w, id).toBeLessThanOrEqual(vw);
      expect(r.y + r.h, id).toBeLessThanOrEqual(vh);
      expect(r.w, id).toBeGreaterThanOrEqual(WIN_MIN_W);
      expect(r.h, id).toBeGreaterThanOrEqual(WIN_MIN_H);
    }
    // 터미널과 미션이 겹치지 않는 세로 스택
    expect(rects.mission.y).toBeGreaterThanOrEqual(rects.term.y + rects.term.h);
  });

  it('layout() 은 laidOut 을 세우고 열림 상태를 보존한다', () => {
    expect(U().laidOut).toBe(false);
    U().layout(1280, 660);
    expect(U().laidOut).toBe(true);
    expect(U().wins.term.open).toBe(true);
    expect(U().wins.msg.open).toBe(false);
  });
});

describe('창 관리', () => {
  beforeEach(() => U().layout(1280, 660));

  it('openWin 은 창을 열고 최상위 포커스를 준다', () => {
    U().openWin('msg');
    expect(U().wins.msg.open).toBe(true);
    expect(U().wins.msg.min).toBe(false);
    expect(U().isFocused('msg')).toBe(true);
  });

  it('focusWin 은 z-순서만 끌어올린다', () => {
    U().openWin('msg');
    U().focusWin('term');
    expect(U().isFocused('term')).toBe(true);
    expect(U().wins.msg.open).toBe(true);
  });

  it('minWin 후 openWin 으로 복원된다', () => {
    U().minWin('term');
    expect(U().wins.term.min).toBe(true);
    U().openWin('term');
    expect(U().wins.term.min).toBe(false);
  });

  it('moveWin 은 데스크톱 경계로 클램프된다', () => {
    U().moveWin('term', -500, -500);
    expect(U().wins.term.x).toBe(0);
    expect(U().wins.term.y).toBe(0);
    U().moveWin('term', 99999, 99999);
    expect(U().wins.term.x).toBeLessThanOrEqual(1280);
    expect(U().wins.term.y).toBeLessThanOrEqual(660 - 40);
  });

  it('resizeWin 은 최소 크기를 지킨다', () => {
    U().resizeWin('term', 10, 10);
    expect(U().wins.term.w).toBeGreaterThanOrEqual(WIN_MIN_W);
    expect(U().wins.term.h).toBeGreaterThanOrEqual(WIN_MIN_H);
  });
});

describe('알림 · 메신저 로그', () => {
  it('notify 는 최대 5개까지 유지한다', () => {
    for (let i = 0; i < 8; i++) U().notify('알림 ' + i);
    expect(U().notices.length).toBeLessThanOrEqual(5);
    expect(U().notices.at(-1)!.text).toBe('알림 7');
  });

  it('pushMsg 는 로그에 순서대로 쌓인다', () => {
    U().pushMsg({ n: 'NW', x: '신호를 보냈다.' });
    U().pushMsg({ n: '서준 (나)', x: '수신 확인.', me: true });
    expect(U().msgLog.length).toBe(2);
    expect(U().msgLog[1].me).toBe(true);
  });

  it('resetUi 는 로그·알림·배치를 초기화한다', () => {
    U().layout(1280, 660);
    U().pushMsg({ n: 'NW', x: 'x' });
    U().resetUi();
    expect(U().msgLog.length).toBe(0);
    expect(U().laidOut).toBe(false);
  });
});
