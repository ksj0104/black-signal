import { PylabDef, formatTable } from '../../engine/pylab/pylab';
import { Table } from '../../engine/query/query';

/**
 * Chapter 8 — 압수된 한서시 개표 집계 유닛(TB-11)의 펌웨어 포렌식 이미지 (전부 허구 데이터).
 * 격리 랩에서 blst-0.9.4 "ballast" 모듈을 역어셈블·재현한다.
 * ballast 는 표를 세지 않는다: 규모대(band)별 '목표 분포'를 미리 정해 두고 실제 표를
 * 그 목표 쿼터로 덮어쓴다. 같은 총계의 개표구엔 같은 쿼터가 적용돼 — 쌍둥이가 태어난다.
 * 그리고 이 목표는 Suncrest 정규 빌드가 아니라 인증 패치 미러(cert-mirror-2)로 주입됐다.
 */

// ballast 내장 목표 분포 테이블 — 규모대별 하드코딩 상수 (역어셈블 산출)
const ballast_targets: Table = {
  columns: ['band', 'target_total', 'share_cha', 'share_baek', 'share_lim', 'quota_cha', 'quota_baek', 'quota_lim'],
  rows: [
    { band: 'A', target_total: 33280, share_cha: 0.456941, share_baek: 0.447476, share_lim: 0.095583, quota_cha: 15207, quota_baek: 14892, quota_lim: 3181 },
    { band: 'B', target_total: 21417, share_cha: 0.454966, share_baek: 0.441845, share_lim: 0.103189, quota_cha: 9744, quota_baek: 9463, quota_lim: 2210 },
    { band: 'C', target_total: 24368, share_cha: 0.452479, share_baek: 0.442712, share_lim: 0.10481, quota_cha: 11026, quota_baek: 10788, quota_lim: 2554 },
  ],
};

// 14개 개표구 공표 총계 (Ch7 official_tally 파생) — 같은 총계가 곧 같은 목표 쿼터
const precinct_totals: Table = {
  columns: ['precinct', 'total'],
  rows: [
    { precinct: 1, total: 28234 }, { precinct: 2, total: 19536 },
    { precinct: 3, total: 33280 }, { precinct: 4, total: 32352 },
    { precinct: 5, total: 21417 }, { precinct: 6, total: 24140 },
    { precinct: 7, total: 18117 }, { precinct: 8, total: 24368 },
    { precinct: 9, total: 21417 }, { precinct: 10, total: 31007 },
    { precinct: 11, total: 33280 }, { precinct: 12, total: 21287 },
    { precinct: 13, total: 26857 }, { precinct: 14, total: 24368 },
  ],
};

// 펌웨어 패치 공급 사슬 — 정규 빌드/서명 라인과 미러(뒷문)
const patch_chain: Table = {
  columns: ['seq', 'stage', 'host', 'signer', 'channel', 'verified'],
  rows: [
    { seq: 1, stage: 'build', host: 'suncrest-build-01', signer: 'SC-ROOT-01', channel: 'suncrest-cert', verified: 'yes' },
    { seq: 2, stage: 'sign', host: 'suncrest-ca', signer: 'SC-ROOT-01', channel: 'suncrest-cert', verified: 'yes' },
    { seq: 3, stage: 'mirror', host: 'cert-mirror-2', signer: '(없음)', channel: 'cert-mirror-2', verified: 'no' },
    { seq: 4, stage: 'deploy', host: 'TB-units(14)', signer: '(상속)', channel: 'cert-mirror-2', verified: 'no' },
  ],
};

// 유닛 적재 모듈 목록 (부팅 로그 파생) — blst 만 미러 채널 출처
const module_map: Table = {
  columns: ['module', 'version', 'sig', 'origin_channel'],
  rows: [
    { module: 'mod_tb_core', version: '2.1.0', sig: 'SC-ROOT-01', origin_channel: 'suncrest-cert' },
    { module: 'mod_tally_agg', version: '2.1.0', sig: 'SC-ROOT-01', origin_channel: 'suncrest-cert' },
    { module: 'mod_net_report', version: '1.4.0', sig: 'SC-ROOT-01', origin_channel: 'suncrest-cert' },
    { module: 'blst', version: '0.9.4', sig: '(없음)', origin_channel: 'cert-mirror-2' },
  ],
};

type Row = Record<string, string | number>;
const str = (v: string | number | undefined) => String(v ?? '');
const num = (v: string | number | undefined) => Number(v ?? 0);

/** 특정 총계를 가진 개표구 목록 (quota 재현·summary 에서 재사용) */
function precinctsWithTotal(ds: Record<string, Table>, total: number): number[] {
  return ds.precinct_totals.rows.filter((r) => num(r.total) === total).map((r) => num(r.precinct));
}

/** 미러 채널(뒷문)로 주입된 모듈 (inject·summary 에서 재사용) */
function injectedModules(ds: Record<string, Table>): Row[] {
  return ds.module_map.rows.filter((r) => str(r.origin_channel) !== 'suncrest-cert');
}

export const BALLAST_PYLAB: PylabDef = {
  banner:
    '[FIRMWARE-LAB v1.1 — 격리 샌드박스]\n' +
    '압수된 집계 유닛 TB-11 의 펌웨어 이미지를 역어셈블·재현한다.\n' +
    '실제 파이썬이 아니다. 저작된 분석 골격의 빈칸만 채워 실행하며,\n' +
    '게임 소유 인메모리 테이블(허구)만 계산한다. 파일·네트워크·호스트 접근 없음.',
  datasets: { ballast_targets, precinct_totals, patch_chain, module_map },
  templates: [
    {
      id: 'target',
      title: 'ballast 목표 분포 테이블 추출 (역어셈블 상수)',
      skeleton: [
        '# 개표기는 세는가, 아니면 맞추는가',
        'for t in ballast_targets:',
        '    if t["band"] == "«band»" or "«band»" == "all":',
        '        print(t)',
      ],
      blanks: [{ key: 'band', label: '규모대 band — A / B / C / all', sample: 'A' }],
      run(ds, a) {
        const band = a.band.toUpperCase();
        const rows =
          band === 'ALL'
            ? ds.ballast_targets.rows
            : ds.ballast_targets.rows.filter((r) => str(r.band).toUpperCase() === band);
        if (!rows.length)
          return `ValueError: band 는 A / B / C / all 중 하나다. (입력: '${a.band}')`;
        return [
          '[BALLAST 목표 분포 테이블 — blst-0.9.4 내장 상수]',
          formatTable(ds.ballast_targets.columns, rows),
          '→ 규모대(band)별 목표 득표율·정수 쿼터가 하드코딩돼 있다.',
          '  개표기는 표를 세지 않고, 이 분포로 결과를 "맞춘다".',
        ].join('\n');
      },
    },
    {
      id: 'quota',
      title: '반올림 쿼터 재현 — 쌍둥이 표의 인과 증명',
      skeleton: [
        '# 같은 총계의 개표구엔 같은 목표 쿼터가 적용된다',
        'peers = [p for p in precinct_totals if p["total"] == «total»]',
        'band  = lookup_band(«total»)          # 목표 테이블에서 총계로 밴드 조회',
        'for p in peers: assign(p, band.quota)  # 동일 쿼터를 그대로 덮어쓴다',
        'print(reproduction(peers, band))',
      ],
      blanks: [{ key: 'total', label: '재현할 개표구 총계 (같은 총계가 쌍둥이의 조건)', sample: '28234' }],
      run(ds, a) {
        const total = Number(a.total);
        if (!Number.isFinite(total)) return 'TypeError: «total» 은 숫자여야 한다.';
        const band = ds.ballast_targets.rows.find((r) => num(r.target_total) === total);
        const peers = precinctsWithTotal(ds, total);
        if (!peers.length)
          return `(재현 결과 없음) — 총계 ${total} 인 개표구가 없다. 공표 총계를 다시 확인하라.`;
        if (!band)
          return (
            `총계 ${total} · 개표구 ${peers.map((p) => '제' + p + '개표구').join(', ')}\n` +
            '→ 이 총계는 ballast 목표 테이블에 없다 (표적 밴드 아님). 덮어쓰기 흔적 없음.'
          );
        const triple = `차수완 ${band.quota_cha} · 백도현 ${band.quota_baek} · 임가려 ${band.quota_lim}`;
        const lines = [
          `[반올림 쿼터 재현 — total=${total} · band ${band.band}]`,
          `목표 쿼터: ${triple}`,
          `동일 총계 개표구: ${peers.map((p) => '제' + p + '개표구').join(', ')}`,
        ];
        if (peers.length >= 2) {
          lines.push(
            ` → 두 개표구에 동일 쿼터 적용 → 득표수 완전 일치 (쌍둥이 재현)`,
            `검증: ${band.quota_cha} + ${band.quota_baek} + ${band.quota_lim} = ${num(band.quota_cha) + num(band.quota_baek) + num(band.quota_lim)}  (합계 보존)`,
          );
        } else {
          lines.push(' → 해당 총계 개표구가 하나뿐 — 쌍둥이는 총계가 겹칠 때만 드러난다.');
        }
        return lines.join('\n');
      },
    },
    {
      id: 'inject',
      title: '주입 경로 추적 — 서명 없는 모듈은 어디서 왔나',
      skeleton: [
        '# 정규 빌드·서명 라인 밖에서 들어온 코드를 찾는다',
        'for m in module_map:',
        '    if "«module»" in m["module"] and m["origin_channel"] != "suncrest-cert":',
        '        trace(patch_chain, m)   # 공급 사슬에서 주입 지점 역추적',
      ],
      blanks: [{ key: 'module', label: '추적할 모듈 식별자 (부팅 로그의 미승인 모듈)', sample: 'mod_tally_agg' }],
      run(ds, a) {
        const key = a.module.toLowerCase();
        const hits = injectedModules(ds).filter((m) => str(m.module).toLowerCase().includes(key));
        if (!hits.length)
          return `(주입 흔적 없음) — '${a.module}' 은 정규 채널(suncrest-cert) 서명 모듈이거나 존재하지 않는다.`;
        const mirror = ds.patch_chain.rows.find((r) => str(r.verified) === 'no');
        return [
          `[주입 경로 추적 — ${hits.map((m) => str(m.module) + '-' + str(m.version)).join(', ')}]`,
          formatTable(ds.patch_chain.columns, ds.patch_chain.rows),
          `→ 주입 지점: ${str(mirror?.host)} (인증 패치 미러). 서명 없이 모듈 삽입.`,
          '  Suncrest 정규 빌드·서명 라인 밖 — 내부 소행이 아니라 "뒷문"이다.',
          '  비고: 이 미러 등록을 승인한 검수확인서 CERT-9917 — 서명자 미상 (다음 추적 대상).',
        ].join('\n');
      },
    },
  ],
};
