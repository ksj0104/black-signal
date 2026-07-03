import { PylabDef, formatTable } from '../../engine/pylab/pylab';
import { Table } from '../../engine/query/query';

/**
 * Chapter 4 — NW 가 건넨 Orbis Vale 내부 "봉인 아카이브" 사본 (전부 허구 데이터).
 * 격리 랩에서만 열람하며, 일부 행은 의도적으로 오염(주입/변조)되어 있다 —
 * "출처 불명 자료는 검증 없이 무기가 되지 못한다"를 기계적으로 배우는 챕터.
 */

// 딜 소싱 파이프라인 — 미러콜 피해자 신원이 "부실자산 딜"로 재사용된 흔적
const deal_pipeline: Table = {
  columns: ['victim', 'dci', 'source', 'product', 'acquired_by', 'week'],
  rows: [
    { victim: '박정순', dci: 87, source: 'MirrorCall', product: '부실채권 인수', acquired_by: 'GREYFOX', week: '2026-W21' },
    { victim: '조성태', dci: 91, source: 'MirrorCall', product: '채무조정 상품', acquired_by: 'GREYFOX', week: '2026-W21' },
    { victim: '윤미란', dci: 78, source: 'MirrorCall', product: '담보 재매입', acquired_by: 'GREYFOX', week: '2026-W22' },
    { victim: '김호영', dci: 64, source: 'MirrorCall', product: '채권 추심 위탁', acquired_by: 'BLUEHARBOR', week: '2026-W23' },
    { victim: '최도윤', dci: 41, source: 'MirrorCall', product: '일반 리드(미진행)', acquired_by: '(보류)', week: '2026-W23' },
    { victim: '강민서', dci: 82, source: '공개매각', product: '부실채권 인수', acquired_by: 'GREYFOX', week: '2026-W22' },
    { victim: '이경자', dci: 58, source: '채권시장', product: '포트폴리오 매입', acquired_by: 'BLUEHARBOR', week: '2026-W21' },
    { victim: '정혜란', dci: 73, source: '공개매각', product: '담보 재매입', acquired_by: 'GREYFOX', week: '2026-W23' },
  ],
};

// 임원 배지 출입 로그 — 승인 주간의 물리적 정황
const access_logs: Table = {
  columns: ['badge', 'officer', 'area', 'week'],
  rows: [
    { badge: 'BDG-0117', officer: '배광호', area: 'NORTHLINE-지점', week: '2026-W18' },
    { badge: 'BDG-0342', officer: '오민재', area: 'NORTHLINE-지점', week: '2026-W19' },
    { badge: 'BDG-0117', officer: '배광호', area: 'GREYFOX-HQ VAULT-B', week: '2026-W20' },
    { badge: 'BDG-0342', officer: '오민재', area: 'GREYFOX-HQ 로비', week: '2026-W20' },
    { badge: 'BDG-0561', officer: '한서라', area: 'ORBIS-타워', week: '2026-W20' },
    { badge: 'BDG-0117', officer: '배광호', area: 'ORBIS-타워', week: '2026-W24' },
    { badge: 'BDG-0561', officer: '한서라', area: 'GREYFOX-HQ 로비', week: '2026-W22' },
  ],
};

// 임원 결재 기록 — Ch3 executive_messages 와 동일 캐논
const exec_approvals: Table = {
  columns: ['id', 'officer', 'subject', 'week'],
  rows: [
    { id: 'M-01', officer: '배광호', subject: 'GREYFOX-DCI 정산 파트너십 승인', week: '2026-W20' },
    { id: 'M-02', officer: '오민재', subject: '부실자산 인수 파이프라인 검토', week: '2026-W22' },
    { id: 'M-03', officer: '한서라', subject: '피해자군 데이터 브로커리지 계약', week: '2026-W24' },
  ],
};

// 아카이브 원장 — 3행이 오염(①개설 전 거래 ②금액 변조 ③존재하지 않는 셸 참조)
const archive_ledger: Table = {
  columns: ['id', 'victim', 'shell_ref', 'amount_krw', 'tx_date', 'acct_opened'],
  rows: [
    { id: 'AR-033', victim: '박정순', shell_ref: 'NL-ESCROW', amount_krw: 38000000, tx_date: '2026-06-25', acct_opened: '2026-04-11' },
    { id: 'AR-058', victim: '조성태', shell_ref: 'NL-ESCROW', amount_krw: 22000000, tx_date: '2026-06-26', acct_opened: '2026-04-11' },
    { id: 'AR-091', victim: '윤미란', shell_ref: 'NL-ESCROW', amount_krw: 22000000, tx_date: '2026-05-02', acct_opened: '2026-05-20' },
    { id: 'AR-102', victim: '조성태', shell_ref: 'BLUEHARBOR LLC', amount_krw: 15000000, tx_date: '2026-07-01', acct_opened: '2026-05-02' },
    { id: 'AR-124', victim: '김호영', shell_ref: 'BLUEHARBOR LLC', amount_krw: 90000000, tx_date: '2026-07-08', acct_opened: '2026-05-02' },
    { id: 'AR-155', victim: '윤미란', shell_ref: 'GREYFOX ANALYTICS', amount_krw: 6000000, tx_date: '2026-07-09', acct_opened: '2026-03-30' },
    { id: 'AR-188', victim: '박정순', shell_ref: 'NL-ESCROW', amount_krw: 4200000, tx_date: '2026-07-12', acct_opened: '2026-04-11' },
    { id: 'AR-207', victim: '조성태', shell_ref: 'NL-HORIZON', amount_krw: 12000000, tx_date: '2026-07-15', acct_opened: '2026-05-02' },
  ],
};

// 법원 인가 사본 대조 기준 (Ch3 포렌식 DB 파생) — 금액 정합 검증용
const court_reference: Table = {
  columns: ['id', 'amount_krw'],
  rows: [
    { id: 'AR-033', amount_krw: 38000000 },
    { id: 'AR-058', amount_krw: 22000000 },
    { id: 'AR-091', amount_krw: 22000000 },
    { id: 'AR-102', amount_krw: 15000000 },
    { id: 'AR-124', amount_krw: 9000000 },
    { id: 'AR-155', amount_krw: 6000000 },
    { id: 'AR-188', amount_krw: 4200000 },
    { id: 'AR-207', amount_krw: 12000000 },
  ],
};

// 등록 셸 목록 (Ch3 shell_companies 캐논) — 참조 유효성 검증용
const shell_registry: Table = {
  columns: ['name'],
  rows: [
    { name: 'NL-ESCROW' },
    { name: 'NORTHLINE FIDUCIARY SERVICES' },
    { name: 'BLUEHARBOR LLC' },
    { name: 'GREYFOX ANALYTICS' },
    { name: 'ORBIS VALE CAPITAL' },
  ],
};

type Row = Record<string, string | number>;
const str = (v: string | number | undefined) => String(v ?? '');

/** reuse — 재사용 후보 필터 (summary 에서도 동일 계산을 재사용) */
function reuseHits(ds: Record<string, Table>, min: number, source: string): Row[] {
  return ds.deal_pipeline.rows.filter(
    (r) => Number(r.dci) >= min && str(r.source).toLowerCase() === source.toLowerCase(),
  );
}

/** verify — 규칙별 오염 행 검출 (summary 에서도 동일 계산을 재사용) */
function taintedRows(ds: Record<string, Table>, rule: string): { row: Row; why: string }[] {
  const court = new Map(ds.court_reference.rows.map((r) => [str(r.id), Number(r.amount_krw)]));
  const shells = new Set(ds.shell_registry.rows.map((r) => str(r.name)));
  const out: { row: Row; why: string }[] = [];
  for (const r of ds.archive_ledger.rows) {
    const bad: string[] = [];
    if ((rule === 'date' || rule === 'all') && str(r.tx_date) < str(r.acct_opened))
      bad.push('계좌 개설(' + r.acct_opened + ') 전 거래');
    if ((rule === 'amount' || rule === 'all') && court.get(str(r.id)) !== Number(r.amount_krw))
      bad.push('법원 사본 금액(' + court.get(str(r.id)) + ')과 불일치');
    if ((rule === 'ref' || rule === 'all') && !shells.has(str(r.shell_ref)))
      bad.push('등록되지 않은 셸 참조');
    if (bad.length) out.push({ row: r, why: bad.join(' · ') });
  }
  return out;
}

export const THEOFFER_PYLAB: PylabDef = {
  banner:
    '[ANALYSIS-LAB v1.0 — 격리 샌드박스]\n' +
    '실제 파이썬이 아니다. 저작된 분석 골격의 빈칸만 채워 실행하며,\n' +
    '게임 소유 인메모리 테이블(허구)만 계산한다. 파일·네트워크·호스트 접근 없음.',
  datasets: { deal_pipeline, access_logs, exec_approvals, archive_ledger, court_reference, shell_registry },
  templates: [
    {
      id: 'reuse',
      title: '피해자 신원 재사용 탐지 (딜 파이프라인 필터)',
      skeleton: [
        '# 미러콜이 판 신원이 "부실자산 딜"로 재등장하는가',
        'flag = []',
        'for r in deal_pipeline:',
        '    if r["dci"] >= «min» and r["source"] == "«source»":',
        '        flag.append(r)',
        'print(table(flag))',
      ],
      blanks: [
        { key: 'min', label: 'DCI 임계값 — watch 등급 이상만 (Ch3 위험 점수 참고)', sample: '75' },
        { key: 'source', label: '신원 소싱 채널', sample: '공개매각' },
      ],
      run(ds, a) {
        const min = Number(a.min);
        if (!Number.isFinite(min)) return 'TypeError: «min» 은 숫자여야 한다.';
        const hits = reuseHits(ds, min, a.source);
        const table = formatTable(ds.deal_pipeline.columns, hits);
        const pure = hits.length && hits.every((r) => Number(r.dci) >= 60);
        return (
          table +
          `\n→ ${a.source} 소싱 · DCI ${min}+ 재사용 후보 ${hits.length}건` +
          (pure ? '' : hits.length ? '  (저위험 리드 혼입 — 임계 재검토)' : '')
        );
      },
    },
    {
      id: 'approve',
      title: '임원 승인 상관 분석 (배지 로그 × 결재 기록 조인)',
      skeleton: [
        '# 모델 승인 주간, 누가 그 방에 있었나',
        'for log in access_logs:',
        '    if log["officer"] == "«officer»" and log["week"] == "«week»":',
        '        for m in exec_approvals:',
        '            if m["officer"] == log["officer"] and m["week"] == log["week"]:',
        '                print(log, "⇔", m)',
      ],
      blanks: [
        { key: 'officer', label: '대조할 임원 (Ch3 executive_messages 참고)', sample: '오민재' },
        { key: 'week', label: '승인 주간 (예: 2026-W22)', sample: '2026-W22' },
      ],
      run(ds, a) {
        const logs = ds.access_logs.rows.filter(
          (r) => str(r.officer) === a.officer && str(r.week) === a.week,
        );
        if (!logs.length) return `(대조 결과 없음) — ${a.week} 에 '${a.officer}' 배지 기록이 없다.`;
        const lines = [formatTable(ds.access_logs.columns, logs)];
        const joined = ds.exec_approvals.rows.filter(
          (m) => str(m.officer) === a.officer && str(m.week) === a.week,
        );
        for (const m of joined)
          for (const l of logs)
            lines.push(
              `⇔ 결재 대조: ${m.id} "${m.subject}" (${m.week}) — 배지 ${l.badge} 활성 구역 ${l.area}`,
            );
        if (!joined.length) lines.push('(해당 주간의 결재 기록 없음 — 상관 불성립)');
        return lines.join('\n');
      },
    },
    {
      id: 'verify',
      title: '아카이브 무결성 검증 (법원 사본 대조)',
      skeleton: [
        '# 출처 불명 자료는 반드시 법원 인가 사본과 대조한다',
        'bad = []',
        'for r in archive_ledger:',
        '    if not reconcile(r, rule="«rule»"):   # date | amount | ref | all',
        '        bad.append(r)',
        'print(table(bad))',
      ],
      blanks: [{ key: 'rule', label: '대조 규칙 — date(개설일) / amount(금액) / ref(셸 참조) / all', sample: 'date' }],
      run(ds, a) {
        const rule = a.rule.toLowerCase();
        if (!['date', 'amount', 'ref', 'all'].includes(rule))
          return `ValueError: rule 은 date/amount/ref/all 중 하나다. (입력: '${a.rule}')`;
        const bad = taintedRows(ds, rule);
        if (!bad.length) return `(위반 없음) — rule=${rule} 기준 전 행이 법원 사본과 정합.`;
        const lines = [formatTable(ds.archive_ledger.columns, bad.map((b) => b.row))];
        for (const b of bad) lines.push(`! ${b.row.id}: ${b.why}`);
        if (rule === 'all')
          lines.push(`⇒ 무결성 위반 ${bad.length}건 — 아카이브에 주입/변조 흔적. 제거 전 공개 금지.`);
        return lines.join('\n');
      },
    },
    {
      id: 'summary',
      title: '증거 요약 생성 (분석 결과 종합)',
      skeleton: [
        '# 분석 결과를 숫자로 못 박아야 보고서가 된다',
        'assert len(reuse_hits) == «reused» and len(bad_rows) == «tainted»',
        'print(evidence_summary())',
      ],
      blanks: [
        { key: 'reused', label: '재사용 후보 수 (reuse 결과)', sample: '?' },
        { key: 'tainted', label: '오염 행 수 (verify rule=all 결과)', sample: '?' },
      ],
      run(ds, a) {
        const reused = reuseHits(ds, 60, 'MirrorCall').length;
        const tainted = taintedRows(ds, 'all').length;
        if (Number(a.reused) !== reused || Number(a.tainted) !== tainted)
          return 'AssertionError: 분석 결과와 일치하지 않는다 — reuse 와 verify rule=all 의 산출물을 다시 보라.';
        return [
          '[EVIDENCE SUMMARY — SEALED ARCHIVE 격리 분석]',
          `  1. 신원 재사용   미러콜 소싱 피해자 ${reused}건이 딜 파이프라인에 재등장 (DCI 60+)`,
          '  2. 승인 상관     배광호(BDG-0117) — DCI 정산 파트너십 승인 주간 VAULT-B 활성',
          `  3. 무결성        오염 ${tainted}행 검출·격리 (개설 전 거래 · 금액 변조 · 유령 셸 참조)`,
          '  검증 완료: 오염 행 제거본에 한해 증거 가치 성립. 원본 해시 대조 기록 보존.',
        ].join('\n');
      },
    },
  ],
};
