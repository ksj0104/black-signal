/**
 * NETMAP — 챕터 2 에서 해금되는 map 명령의 렌더러.
 * 확보한 목표(done)에 따라 지도·그래프·타임라인이 점진적으로 채워진다.
 */

type Done = Record<string, boolean>;

export function renderNetMap(done: Done): string {
  const hub = done.unlisted ? '0505-0311-7742' : '???  (미확인 허브)';
  const ownerLine = done.owner
    ? '│  개통 명의: 박정순 — 피해자 신원 도용'
    : '│  개통 명의: 미확인  (registry 폴더 대조 필요)';
  const tail = done.timeline
    ? `│
├─(착신 183s · 잠적 전날)──[ 유나 / siren-11 ]  실종
├─(착신 94s · 두절 직전)──[ 서지원 기자 ]  연락 두절
└─(회선의 주인)──[ ??? "설계자" ]  ← 다음 추적 대상`
    : `│
└─ 시간 축 미정렬 — 'map timeline' 으로 재구성 (번호·명의 확보 후)`;
  return `NETMAP v0.9 — AR-2026-0731 (NW 드롭 동기화 · 허구 데이터 시각화)

            [ NORTHLINE FIDUCIARY ]
                    │ 등기
     ┌─────────┬────┴────┬─────────┐
 [배광호]   [오민재]   [한서라]   [김태석]     서류상 임원 4인
     └─────────┴────┬────┴─────────┘
             착신 공통 발신원 (매주 목 21시대)
                    │
            [ ${hub} ]   번호부 등재 없음
${ownerLine}
${tail}`;
}

export function renderRelationGraph(done: Done): string {
  const rows = [
    'RELATION GRAPH — 확보된 근거만 표시 (허구 데이터)',
    '',
    'NORTHLINE ──(등기 임원)── 임원 4인            [registry/northline_officers.txt]',
    "유나(siren-11) ──(제보 인터뷰)── 서지원 기자    [missing/reporter_memo.txt]",
  ];
  if (done.unlisted) {
    rows.push(
      '0505-0311-7742 ──(주간 지시 콜)── 임원 4인    [carrier/carrier_dump.log]',
      '0505-0311-7742 ──(잠적 전날 착신)── 유나       [carrier + missing/siren11_note.txt]',
      '0505-0311-7742 ──(두절 직전 착신)── 서지원      [carrier + missing/reporter_memo.txt]',
    );
  } else {
    rows.push('???  ──(공통 발신원)── 임원 4인             ← SRC 필드를 집계해 특정할 것');
  }
  if (done.owner)
    rows.push('0505-0311-7742 ──(도용 개통)── 박정순 명의   [registry/sim_registration.b64]');
  if (done.timeline)
    rows.push('??? "설계자" ──(회선 소유)── 0505-0311-7742  [타임라인 재구성 결과]');
  return rows.join('\n');
}

export function renderTimeline(): string {
  return `NETMAP :: TIMELINE RECONSTRUCTION — 0505-0311-7742 (허구 데이터)

2026-03-02  번호 개통 — 명의: 박정순 (도용 · 2025-11 피해자)
2026-05-19  유나(siren-11) → 서지원 기자: 첫 제보 접촉
2026-06-04~ 매주 목 21시대 — 임원 4인 순차 발신 (지시 콜 패턴)
2026-06-19  22:41 유나 착신 183초 — 다음 날 잠적
2026-06-21  21:12 서지원 기자 착신 94초 — "기사 내리면 제보자는 산다"
2026-06-25  임원 정기 콜 마지막 발신 — 이후 회선 침묵

[분석] 제보선이 노출될 때마다, 이 번호가 먼저 움직였다.
       임원(위장)과 제보자(위협)를 한 회선이 관리한다 — 회선의 주인이 설계자다.`;
}
