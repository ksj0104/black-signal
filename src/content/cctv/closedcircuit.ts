import { CctvDef } from '../../engine/cctv/cctv';

/**
 * Chapter 5 — 환승역 CCTV 증거 패키지 (법원 인가 열람 사본 · 전부 허구 데이터).
 * 유나가 마지막으로 목격된 20:30–21:00 구간. CAM-C/CAM-D 의 시계가 조작되어 있고
 * CAM-D 사설 통로 클립은 02:18 이 잘려 나갔다 — 핸드오프(이송)를 숨기기 위해.
 *
 * 정답 캐논: CAM-C 오차 +47s · CAM-D 오차 −02:15 · 결손 02:18 ·
 *            세리톤 배지 SEC-CERITON-04(도경식) · 편집 서명 ceriton-mux.
 */
export const CLOSEDCIRCUIT_CCTV: CctvDef = {
  banner:
    '[CCTV EVIDENCE REVIEW — 법원 인가 열람 사본]\n' +
    '환승역 4개 카메라 · 기록 구간 20:30–21:00 · 원본 봉인(해시 대조 기록 보존).\n' +
    '실시간 접속이 아니다 — 사전 확보된 아카이브의 포렌식 열람만 수행한다.',
  cams: [
    {
      id: 'CAM-A',
      name: '대합실',
      drift: 0,
      meta: { codec: 'MJPG · 1fps', editor: '(원본)', frames: 1800, expected: 1800, window: '20:30–21:00' },
      events: [
        { t: '20:39:02', frame: 542, desc: '개찰구 — 퇴근 인파 통과' },
        { t: '20:40:10', frame: 610, desc: '역내 방송 — 막차 지연 안내 (스피커 점등)', tag: 'anchor' },
        { t: '20:41:12', frame: 672, desc: '유나 — 대합실 진입 (모자·백팩, 북측 개찰구)', tag: 'yuna' },
        { t: '20:43:55', frame: 835, desc: '조명 플리커 — 역사 전체 순간 감광', tag: 'anchor' },
        { t: '20:45:30', frame: 930, desc: '역무 순찰 — 대합실 남측' },
      ],
    },
    {
      id: 'CAM-B',
      name: '동측 통로',
      drift: 0,
      meta: { codec: 'MJPG · 1fps', editor: '(원본)', frames: 1800, expected: 1800, window: '20:30–21:00' },
      events: [
        { t: '20:40:10', frame: 610, desc: '역내 방송 — 막차 지연 안내 (스피커 점등)', tag: 'anchor' },
        { t: '20:43:05', frame: 785, desc: '유나 — 동측 통로 이동 (걸음 빠름, 두 차례 뒤돌아봄)', tag: 'yuna' },
        { t: '20:43:55', frame: 835, desc: '조명 플리커 — 역사 전체 순간 감광', tag: 'anchor' },
      ],
    },
    {
      id: 'CAM-C',
      name: '2번 승강장',
      drift: 47,
      meta: { codec: 'MJPG · 1fps', editor: '(원본)', frames: 1800, expected: 1800, window: '20:30–21:00 (로컬)' },
      events: [
        { t: '20:40:57', frame: 657, desc: '역내 방송 — 막차 지연 안내 (스피커 점등)', tag: 'anchor' },
        { t: '20:44:42', frame: 882, desc: '조명 플리커 — 역사 전체 순간 감광', tag: 'anchor' },
        { t: '20:45:12', frame: 912, desc: '유나 — 승강장 진입, 스크린도어 앞 대기', tag: 'yuna' },
        { t: '20:45:47', frame: 947, desc: '막차 진입 (2번 승강장)' },
        { t: '20:46:32', frame: 992, desc: '막차 출발 — 유나 탑승 확인 안 됨 (승강장 잔류)', tag: 'yuna' },
      ],
    },
    {
      id: 'CAM-D',
      name: '사설 서비스 통로',
      drift: -135,
      meta: { codec: 'MJPG · 1fps', editor: 'ceriton-mux v2.4', frames: 1662, expected: 1800, window: '20:30–21:00 (로컬)' },
      events: [
        { t: '20:41:40', frame: 700, desc: '조명 플리커 — 역사 전체 순간 감광', tag: 'anchor' },
        { t: '20:44:55', frame: 895, desc: '서비스 도어 개방 — 성인 2인 + 1인(부축 형태) 진입', tag: 'door' },
        { t: '20:47:14', frame: 896, desc: '영상 재개 — 통로 비어 있음', tag: 'resume' },
      ],
    },
  ],
  badges: [
    { t: '20:12:40', badge: 'BDG-CLN-11', holder: '미화팀', door: 'CLN-ROOM' },
    { t: '20:47:08', badge: 'SEC-CERITON-04', holder: '도경식', door: 'SVC-DOOR-2' },
    { t: '21:02:19', badge: 'STA-DUTY-02', holder: '역무', door: 'STAFF-GATE' },
  ],
};
