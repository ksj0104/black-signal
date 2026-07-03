import { describe, expect, it } from 'vitest';
import {
  cctvBadge,
  cctvGaps,
  cctvMeta,
  cctvOverview,
  cctvRoute,
  cctvSyncCmd,
  cctvView,
  fmtOffset,
  parseOffset,
} from '../engine/cctv/cctv';
import { CLOSEDCIRCUIT_CCTV as DEF } from '../content/cctv/closedcircuit';

const SYNCED = { 'CAM-C': 47, 'CAM-D': -135 };

describe('cctv — 시각/오차 유틸', () => {
  it('오차 표기를 초로 해석한다 (+47s, -02:15, 135)', () => {
    expect(parseOffset('+47s')).toBe(47);
    expect(parseOffset('-02:15')).toBe(-135);
    expect(parseOffset('135')).toBe(135);
    expect(parseOffset('abc')).toBeNull();
  });
  it('초를 표기로 되돌린다', () => {
    expect(fmtOffset(47)).toBe('+47s');
    expect(fmtOffset(-135)).toBe('-02:15');
  });
});

describe('cctv — 열람과 시계 보정', () => {
  it('개요에 카메라 4대와 보정 상태가 나온다', () => {
    const txt = cctvOverview(DEF, { 'CAM-C': 47 });
    expect(txt).toContain('CAM-A');
    expect(txt).toContain('CAM-D');
    expect(txt).toContain('보정 +47s');
    expect(txt).toContain('미보정');
  });
  it('view: 앵커 이벤트가 표시되고 보정 시 보정 시각이 병기된다', () => {
    const raw = cctvView(DEF, {}, 'CAM-C');
    expect(raw).toContain('◈');
    expect(raw).toContain('20:40:57');
    const corr = cctvView(DEF, SYNCED, 'CAM-C');
    expect(corr).toContain('20:40:57 → 20:40:10'); // 방송 앵커가 기준과 정합
  });
  it('sync: 틀린 오차는 잔존 불일치를 알려주고 마스터 타임라인이 생기지 않는다', () => {
    const r = cctvSyncCmd(DEF, {}, 'CAM-C', '+30s');
    expect(r.ok).toBe(true);
    expect(r.sync['CAM-C']).toBe(30);
    expect(r.text).toContain('앵커 불일치 잔존');
    expect(r.text).toContain('+17s');
    expect(r.text).not.toContain('MASTER TIMELINE');
  });
  it('sync: 두 카메라 모두 정합하면 마스터 타임라인이 출력된다', () => {
    const r1 = cctvSyncCmd(DEF, {}, 'CAM-C', '+47s');
    expect(r1.text).toContain('앵커 정합');
    expect(r1.text).not.toContain('MASTER TIMELINE'); // CAM-D 남음
    const r2 = cctvSyncCmd(DEF, r1.sync, 'CAM-D', '-02:15');
    expect(r2.text).toContain('[MASTER TIMELINE — 전 카메라 시계 보정 완료]');
    expect(r2.text).toContain('20:47:10'); // 도어 개방 보정 시각
  });
});

describe('cctv — 결손·배지·경로·메타', () => {
  it('gaps: CAM-D 에서 02:18 결손과 카운터 봉합을 적발한다', () => {
    const txt = cctvGaps(DEF, SYNCED, 'CAM-D');
    expect(txt).toContain('CAM-D 결손 02:18');
    expect(txt).toContain('프레임 카운터는 연속');
    expect(txt).toContain('20:49:29'); // 보정 재개 시각
  });
  it('gaps: 원본 카메라는 결손이 없다', () => {
    expect(cctvGaps(DEF, {}, 'CAM-A')).toContain('결손 없음');
  });
  it('badge: CAM-D 미보정이면 대조를 거부한다', () => {
    expect(cctvBadge(DEF, {})).toContain('보정되지 않았다');
    expect(cctvBadge(DEF, { 'CAM-D': -60 })).toContain('보정되지 않았다');
  });
  it('badge: 보정 후 세리톤 배지가 도어 개방과 일치한다', () => {
    const txt = cctvBadge(DEF, SYNCED);
    expect(txt).toContain('SEC-CERITON-04');
    expect(txt).toContain('도경식');
    expect(txt).toContain('✓ 일치');
    const decoy = txt.split('\n').find((l) => l.includes('BDG-CLN-11'))!;
    expect(decoy).not.toContain('일치'); // 시간대가 다른 배지는 일치 표시가 없다
  });
  it('route: 전 카메라 보정 전에는 거부, 후에는 이송 결론', () => {
    expect(cctvRoute(DEF, { 'CAM-C': 47 })).toContain('보정이 필요');
    const txt = cctvRoute(DEF, SYNCED);
    expect(txt).toContain('경로 재구성');
    expect(txt).toContain('탑승 기록 없음');
    expect(txt).toContain('사설 통로 경유 이송');
    expect(txt.indexOf('대합실 진입')).toBeLessThan(txt.indexOf('서비스 도어 개방'));
  });
  it('meta: 편집 서명(ceriton-mux)과 주체 대조가 나온다', () => {
    const txt = cctvMeta(DEF, 'CAM-D');
    expect(txt).toContain('ceriton-mux');
    expect(txt).toContain('세리톤 시큐리티');
    expect(cctvMeta(DEF, 'CAM-A')).toContain('원본');
  });
  it('알 수 없는 카메라는 친절한 에러', () => {
    expect(cctvView(DEF, {}, 'CAM-Z')).toContain('알 수 없는 카메라');
  });
});
