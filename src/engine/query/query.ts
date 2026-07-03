/**
 * 읽기 전용 SQL-유사 포렌식 콘솔 엔진.
 *
 * 인메모리 정적 테이블(전부 허구 데이터)에만 동작한다. 실제 DB·네트워크·파일 접근이 없고
 * 호스트 셸을 실행하지 않는다. SELECT 계열 조회만 허용하며 DELETE/UPDATE/DROP/ALTER/INSERT
 * 등 변경 구문은 토큰화 단계에서 거부한다. "법원 인가 포렌식 사본을 조회한다"는 설정.
 */

export type Cell = string | number;

export interface Table {
  columns: string[];
  /** 각 행은 컬럼명(bare) → 값 */
  rows: Record<string, Cell>[];
}
export type Database = Record<string, Table>;

export interface QueryResult {
  columns: string[];
  rows: Cell[][];
}

/* ---------------- 토큰화 ---------------- */

const KEYWORDS = new Set([
  'SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'ORDER', 'BY', 'GROUP', 'JOIN',
  'ON', 'AS', 'ASC', 'DESC', 'LIMIT', 'IN', 'LIKE', 'NOT', 'INNER', 'LEFT', 'OUTER',
]);
const AGGS = new Set(['COUNT', 'SUM', 'AVG', 'MIN', 'MAX']);
/** 변경·실행 구문 — 읽기 전용 콘솔에서 거부 */
const FORBIDDEN = new Set([
  'DELETE', 'UPDATE', 'DROP', 'ALTER', 'INSERT', 'CREATE', 'TRUNCATE', 'REPLACE',
  'MERGE', 'GRANT', 'REVOKE', 'EXEC', 'EXECUTE', 'ATTACH', 'PRAGMA', 'INTO',
  'SET', 'VALUES', 'CALL', 'COPY',
]);

type Tok =
  | { t: 'num'; v: number }
  | { t: 'str'; v: string }
  | { t: 'word'; v: string; u: string } // u = 대문자 정규화
  | { t: 'op'; v: string }
  | { t: 'punc'; v: string };

function tokenize(sql: string): Tok[] {
  const toks: Tok[] = [];
  let i = 0;
  while (i < sql.length) {
    const c = sql[i];
    if (/\s/.test(c)) {
      i++;
      continue;
    }
    if (c === "'") {
      let j = i + 1;
      let s = '';
      while (j < sql.length && sql[j] !== "'") s += sql[j++];
      if (j >= sql.length) throw 'query: 닫히지 않은 문자열 리터럴';
      toks.push({ t: 'str', v: s });
      i = j + 1;
      continue;
    }
    if (/[0-9]/.test(c)) {
      let j = i;
      let s = '';
      while (j < sql.length && /[0-9.]/.test(sql[j])) s += sql[j++];
      toks.push({ t: 'num', v: Number(s) });
      i = j;
      continue;
    }
    if (/[A-Za-z_]/.test(c)) {
      let j = i;
      let s = '';
      while (j < sql.length && /[A-Za-z0-9_]/.test(sql[j])) s += sql[j++];
      const u = s.toUpperCase();
      if (FORBIDDEN.has(u))
        throw `query: 읽기 전용 콘솔 — '${u}' 같은 변경 구문은 허용되지 않습니다 (SELECT 조회만 가능).`;
      toks.push({ t: 'word', v: s, u });
      i = j;
      continue;
    }
    const two = sql.slice(i, i + 2);
    if (two === '>=' || two === '<=' || two === '<>' || two === '!=') {
      toks.push({ t: 'op', v: two });
      i += 2;
      continue;
    }
    if (c === '=' || c === '>' || c === '<') {
      toks.push({ t: 'op', v: c });
      i++;
      continue;
    }
    if ('(),.*'.includes(c)) {
      toks.push({ t: 'punc', v: c });
      i++;
      continue;
    }
    if (c === ';') {
      // 세미콜론은 단일 문 끝에서만 허용 (문 연결 방지)
      if (sql.slice(i + 1).trim()) throw 'query: 한 번에 하나의 조회만 실행할 수 있습니다.';
      i++;
      continue;
    }
    throw `query: 알 수 없는 문자 '${c}'`;
  }
  return toks;
}

/* ---------------- AST ---------------- */

interface SelectItem {
  kind: 'star' | 'col' | 'agg';
  ref?: string; // col: 'a' | 't.a'
  fn?: string; // agg: COUNT|SUM|...
  arg?: string; // agg 인자 ('*' 또는 colref)
  display: string; // 출력 헤더명 (AS 별칭 또는 원문)
}
type Cond =
  | { t: 'cmp'; ref: string; op: string; val: Cell }
  | { t: 'like'; ref: string; pat: string; neg: boolean }
  | { t: 'in'; ref: string; vals: Cell[]; neg: boolean }
  | { t: 'and' | 'or'; l: Cond; r: Cond };
interface Query {
  select: SelectItem[];
  from: { table: string; alias?: string };
  join?: { table: string; alias?: string; left: string; right: string };
  where?: Cond;
  groupBy: string[];
  orderBy: { ref: string; dir: 'ASC' | 'DESC' }[];
  limit?: number;
}

/* ---------------- 파서 ---------------- */

function parse(toks: Tok[]): Query {
  let p = 0;
  const eof = () => p >= toks.length;
  const isWord = (u: string) => {
    const t = toks[p];
    return !!t && t.t === 'word' && t.u === u;
  };
  const eatWord = (u: string) => {
    if (!isWord(u)) throw `query: '${u}' 가 필요합니다`;
    p++;
  };
  const isPunc = (v: string) => {
    const t = toks[p];
    return !!t && t.t === 'punc' && t.v === v;
  };
  const isReserved = () => {
    const t = toks[p];
    return !!t && t.t === 'word' && (KEYWORDS.has(t.u) || AGGS.has(t.u));
  };
  const parseColRef = (): string => {
    const t = toks[p];
    if (!t || t.t !== 'word') throw 'query: 컬럼 이름이 필요합니다';
    let ref = t.v;
    p++;
    if (isPunc('.')) {
      p++;
      const t2 = toks[p];
      if (!t2 || t2.t !== 'word') throw 'query: 컬럼 이름이 필요합니다';
      ref += '.' + t2.v;
      p++;
    }
    return ref;
  };

  const parsePrimary = (): Cond => {
    if (isPunc('(')) {
      p++;
      const c = parseOr();
      if (!isPunc(')')) throw 'query: WHERE 괄호가 닫히지 않았습니다';
      p++;
      return c;
    }
    const ref = parseColRef();
    let neg = false;
    if (isWord('NOT')) {
      neg = true;
      p++;
    }
    if (isWord('LIKE')) {
      p++;
      const s = toks[p];
      if (!s || s.t !== 'str') throw 'query: LIKE 뒤에는 문자열이 필요합니다';
      p++;
      return { t: 'like', ref, pat: s.v, neg };
    }
    if (isWord('IN')) {
      p++;
      if (!isPunc('(')) throw 'query: IN 뒤에는 (값, …) 이 필요합니다';
      p++;
      const vals: Cell[] = [];
      for (;;) {
        const v = toks[p];
        if (v && (v.t === 'num' || v.t === 'str')) vals.push(v.v);
        else throw 'query: IN 목록에는 값만 올 수 있습니다';
        p++;
        if (isPunc(',')) {
          p++;
          continue;
        }
        break;
      }
      if (!isPunc(')')) throw 'query: IN 목록 괄호가 닫히지 않았습니다';
      p++;
      return { t: 'in', ref, vals, neg };
    }
    if (neg) throw 'query: NOT 뒤에는 LIKE 또는 IN 만 올 수 있습니다';
    const op = toks[p];
    if (!op || op.t !== 'op') throw 'query: WHERE 조건에 비교 연산자가 필요합니다';
    p++;
    const v = toks[p];
    if (!v || (v.t !== 'num' && v.t !== 'str'))
      throw 'query: 비교 대상 값(숫자 또는 문자열)이 필요합니다';
    p++;
    return { t: 'cmp', ref, op: op.v, val: v.v };
  };
  const parseAnd = (): Cond => {
    let l = parsePrimary();
    while (isWord('AND')) {
      p++;
      l = { t: 'and', l, r: parsePrimary() };
    }
    return l;
  };
  function parseOr(): Cond {
    let l = parseAnd();
    while (isWord('OR')) {
      p++;
      l = { t: 'or', l, r: parseAnd() };
    }
    return l;
  }

  if (!isWord('SELECT')) throw 'query: SELECT 조회만 지원합니다.';
  p++;

  // ---- select 목록 ----
  const select: SelectItem[] = [];
  for (;;) {
    const cur = toks[p];
    const nxt = toks[p + 1];
    if (isPunc('*')) {
      p++;
      select.push({ kind: 'star', display: '*' });
    } else if (
      cur &&
      cur.t === 'word' &&
      AGGS.has(cur.u) &&
      nxt &&
      nxt.t === 'punc' &&
      nxt.v === '('
    ) {
      const fn = cur.u;
      p += 2; // 함수명 + '('
      let arg: string;
      if (isPunc('*')) {
        arg = '*';
        p++;
      } else {
        arg = parseColRef();
      }
      if (!isPunc(')')) throw `query: ${fn}(...) 괄호가 닫히지 않았습니다`;
      p++;
      let display = `${fn}(${arg})`;
      if (isWord('AS')) {
        p++;
        const a = toks[p];
        if (!a || a.t !== 'word') throw 'query: AS 뒤에 별칭이 필요합니다';
        display = a.v;
        p++;
      }
      select.push({ kind: 'agg', fn, arg, display });
    } else {
      const ref = parseColRef();
      let display = ref;
      if (isWord('AS')) {
        p++;
        const a = toks[p];
        if (!a || a.t !== 'word') throw 'query: AS 뒤에 별칭이 필요합니다';
        display = a.v;
        p++;
      }
      select.push({ kind: 'col', ref, display });
    }
    if (isPunc(',')) {
      p++;
      continue;
    }
    break;
  }

  // ---- FROM ----
  eatWord('FROM');
  const fromT = toks[p];
  if (!fromT || fromT.t !== 'word') throw 'query: FROM 뒤에 테이블 이름이 필요합니다';
  const from: Query['from'] = { table: fromT.v };
  p++;
  if (isWord('AS')) {
    p++;
    const a = toks[p];
    if (!a || a.t !== 'word') throw 'query: AS 뒤에 별칭이 필요합니다';
    from.alias = a.v;
    p++;
  } else if (toks[p]?.t === 'word' && !isReserved()) {
    from.alias = (toks[p] as { v: string }).v;
    p++;
  }

  // ---- JOIN (단일, 내부 조인) ----
  let join: Query['join'];
  if (isWord('JOIN') || isWord('INNER')) {
    if (isWord('INNER')) p++;
    eatWord('JOIN');
    const jt = toks[p];
    if (!jt || jt.t !== 'word') throw 'query: JOIN 뒤에 테이블 이름이 필요합니다';
    join = { table: jt.v, left: '', right: '' };
    p++;
    if (toks[p]?.t === 'word' && !isReserved()) {
      join.alias = (toks[p] as { v: string }).v;
      p++;
    }
    eatWord('ON');
    join.left = parseColRef();
    const opTok = toks[p];
    if (!opTok || opTok.t !== 'op' || opTok.v !== '=')
      throw 'query: JOIN ON 은 = 조건만 지원합니다';
    p++;
    join.right = parseColRef();
  }

  // ---- WHERE ----
  let where: Cond | undefined;
  if (isWord('WHERE')) {
    p++;
    where = parseOr();
  }

  // ---- GROUP BY ----
  const groupBy: string[] = [];
  if (isWord('GROUP')) {
    p++;
    eatWord('BY');
    for (;;) {
      groupBy.push(parseColRef());
      if (isPunc(',')) {
        p++;
        continue;
      }
      break;
    }
  }

  // ---- ORDER BY ----
  const orderBy: Query['orderBy'] = [];
  if (isWord('ORDER')) {
    p++;
    eatWord('BY');
    for (;;) {
      const ref = parseColRef();
      let dir: 'ASC' | 'DESC' = 'ASC';
      if (isWord('ASC')) p++;
      else if (isWord('DESC')) {
        dir = 'DESC';
        p++;
      }
      orderBy.push({ ref, dir });
      if (isPunc(',')) {
        p++;
        continue;
      }
      break;
    }
  }

  // ---- LIMIT ----
  let limit: number | undefined;
  if (isWord('LIMIT')) {
    p++;
    const n = toks[p];
    if (!n || n.t !== 'num') throw 'query: LIMIT 뒤에 숫자가 필요합니다';
    limit = n.v;
    p++;
  }

  if (!eof()) throw 'query: 구문을 해석할 수 없습니다 (예상치 못한 토큰).';
  return { select, from, join, where, groupBy, orderBy, limit };
}

/* ---------------- 평가 ---------------- */

interface TableInPlay {
  tn: string;
  cols: string[];
}
type EvalRow = Record<string, Cell>; // key = `${tn}.${col}`

const asNum = (v: Cell): number | null => {
  if (typeof v === 'number') return v;
  const n = Number(v);
  return v !== '' && !Number.isNaN(n) ? n : null;
};
function cmpEq(a: Cell, b: Cell): boolean {
  const an = asNum(a);
  const bn = asNum(b);
  if (an != null && bn != null) return an === bn;
  return String(a).toLowerCase() === String(b).toLowerCase();
}
function cmpVals(a: Cell, b: Cell): number {
  const an = asNum(a);
  const bn = asNum(b);
  if (an != null && bn != null) return an - bn;
  const as = String(a);
  const bs = String(b);
  return as < bs ? -1 : as > bs ? 1 : 0;
}
function compare(a: Cell, op: string, b: Cell): boolean {
  if (op === '=') return cmpEq(a, b);
  if (op === '!=' || op === '<>') return !cmpEq(a, b);
  const d = cmpVals(a, b);
  if (op === '>') return d > 0;
  if (op === '<') return d < 0;
  if (op === '>=') return d >= 0;
  if (op === '<=') return d <= 0;
  throw `query: 알 수 없는 연산자 '${op}'`;
}
function likeToRegex(pat: string): RegExp {
  const esc = pat.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp('^' + esc.replace(/%/g, '.*').replace(/_/g, '.') + '$', 'i');
}

export function runQuery(sql: string, db: Database): QueryResult {
  const q = parse(tokenize(sql));

  const aliasMap: Record<string, string> = {};
  const inPlay: TableInPlay[] = [];
  const addTable = (table: string, alias?: string) => {
    const t = db[table];
    if (!t) throw `query: 테이블 '${table}' 이(가) 없습니다. (query 만 입력하면 목록 확인)`;
    aliasMap[table] = table;
    if (alias) aliasMap[alias] = table;
    inPlay.push({ tn: table, cols: t.columns });
  };
  addTable(q.from.table, q.from.alias);
  if (q.join) addTable(q.join.table, q.join.alias);

  const resolveKey = (ref: string): string => {
    if (ref.includes('.')) {
      const [qual, col] = ref.split('.');
      const tn = aliasMap[qual];
      if (!tn) throw `query: 알 수 없는 테이블/별칭 '${qual}'`;
      return `${tn}.${col}`;
    }
    const hits = inPlay.filter((t) => t.cols.includes(ref));
    if (hits.length === 0) throw `query: 알 수 없는 컬럼 '${ref}'`;
    if (hits.length > 1) throw `query: 컬럼 '${ref}' 가 여러 테이블에 있습니다. 테이블명을 붙이세요.`;
    return `${hits[0].tn}.${ref}`;
  };
  const val = (row: EvalRow, ref: string): Cell => {
    const k = resolveKey(ref);
    return k in row ? row[k] : '';
  };

  const load = (table: string): EvalRow[] =>
    db[table].rows.map((r) => {
      const er: EvalRow = {};
      for (const c of db[table].columns) er[`${table}.${c}`] = r[c] ?? '';
      return er;
    });

  // 1) 기준 행 + 2) JOIN
  let rows: EvalRow[] = load(q.from.table);
  if (q.join) {
    const right = load(q.join.table);
    const lk = resolveKey(q.join.left);
    const rk = resolveKey(q.join.right);
    const merged: EvalRow[] = [];
    for (const a of rows) for (const b of right) if (cmpEq(a[lk], b[rk])) merged.push({ ...a, ...b });
    rows = merged;
  }

  // 3) WHERE
  const test = (row: EvalRow, c: Cond): boolean => {
    switch (c.t) {
      case 'and':
        return test(row, c.l) && test(row, c.r);
      case 'or':
        return test(row, c.l) || test(row, c.r);
      case 'like': {
        const hit = likeToRegex(c.pat).test(String(val(row, c.ref)));
        return c.neg ? !hit : hit;
      }
      case 'in': {
        const v = val(row, c.ref);
        const hit = c.vals.some((x) => cmpEq(v, x));
        return c.neg ? !hit : hit;
      }
      case 'cmp':
        return compare(val(row, c.ref), c.op, c.val);
    }
  };
  if (q.where) rows = rows.filter((r) => test(r, q.where!));

  // 출력 컬럼 헤더
  const cols: string[] = q.select.flatMap((s) =>
    s.kind === 'star'
      ? inPlay.flatMap((t) => t.cols.map((c) => (inPlay.length > 1 ? `${t.tn}.${c}` : c)))
      : [s.display],
  );

  const aggregate = (fn: string, arg: string, g: EvalRow[]): Cell => {
    if (fn === 'COUNT')
      return arg === '*' ? g.length : g.filter((r) => String(val(r, arg)) !== '').length;
    const nums = g.map((r) => asNum(val(r, arg))).filter((n): n is number => n != null);
    if (fn === 'SUM') return nums.reduce((a, b) => a + b, 0);
    if (fn === 'AVG') return nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : 0;
    if (fn === 'MIN') return nums.length ? Math.min(...nums) : '';
    if (fn === 'MAX') return nums.length ? Math.max(...nums) : '';
    throw `query: 알 수 없는 집계 함수 '${fn}'`;
  };

  const orderVal = (getOut: (i: number) => Cell, getRow: (ref: string) => Cell, ref: string): Cell => {
    const ci = cols.indexOf(ref);
    return ci >= 0 ? getOut(ci) : getRow(ref);
  };

  const hasAgg = q.select.some((s) => s.kind === 'agg');
  let outRows: Cell[][];

  if (q.groupBy.length || hasAgg) {
    if (q.select.some((s) => s.kind === 'star'))
      throw 'query: 집계·GROUP BY 조회에는 * 를 쓸 수 없습니다.';
    const groups: EvalRow[][] = [];
    if (q.groupBy.length) {
      const idx = new Map<string, EvalRow[]>();
      for (const r of rows) {
        const key = q.groupBy.map((g) => String(val(r, g))).join('');
        let arr = idx.get(key);
        if (!arr) idx.set(key, (arr = []));
        arr.push(r);
      }
      groups.push(...idx.values());
    } else {
      groups.push(rows);
    }
    const project = (g: EvalRow[]): Cell[] =>
      q.select.map((s) =>
        s.kind === 'agg' ? aggregate(s.fn!, s.arg!, g) : g.length ? val(g[0], s.ref!) : '',
      );
    const keyed = groups.map((g) => ({ g, out: project(g) }));
    if (q.orderBy.length)
      keyed.sort((a, b) => {
        for (const o of q.orderBy) {
          const av = orderVal((i) => a.out[i], (ref) => val(a.g[0], ref), o.ref);
          const bv = orderVal((i) => b.out[i], (ref) => val(b.g[0], ref), o.ref);
          const d = cmpVals(av, bv);
          if (d !== 0) return o.dir === 'DESC' ? -d : d;
        }
        return 0;
      });
    outRows = keyed.map((k) => k.out);
  } else {
    const project = (r: EvalRow): Cell[] =>
      q.select.flatMap((s) =>
        s.kind === 'star'
          ? inPlay.flatMap((t) => t.cols.map((c) => r[`${t.tn}.${c}`] ?? ''))
          : [val(r, s.ref!)],
      );
    if (q.orderBy.length) {
      const keyed = rows.map((r) => ({ r, out: project(r) }));
      keyed.sort((a, b) => {
        for (const o of q.orderBy) {
          const av = orderVal((i) => a.out[i], (ref) => val(a.r, ref), o.ref);
          const bv = orderVal((i) => b.out[i], (ref) => val(b.r, ref), o.ref);
          const d = cmpVals(av, bv);
          if (d !== 0) return o.dir === 'DESC' ? -d : d;
        }
        return 0;
      });
      outRows = keyed.map((k) => k.out);
    } else {
      outRows = rows.map(project);
    }
  }

  if (q.limit != null) outRows = outRows.slice(0, q.limit);
  return { columns: cols, rows: outRows };
}

/* ---------------- 출력 포매팅 ---------------- */

/** 한글/전각 문자를 폭 2로 계산 */
function dispWidth(s: string): number {
  let w = 0;
  for (const ch of s) w += /[ᄀ-ᇿ⺀-꓏가-힣豈-﫿＀-￯]/.test(ch) ? 2 : 1;
  return w;
}
function padTo(s: string, w: number): string {
  return s + ' '.repeat(Math.max(0, w - dispWidth(s)));
}

export function formatResult(r: QueryResult): string {
  if (!r.rows.length) return '(행 없음)  ·  ' + r.columns.join(' | ');
  const widths = r.columns.map((c, i) =>
    Math.max(dispWidth(c), ...r.rows.map((row) => dispWidth(String(row[i] ?? '')))),
  );
  const line = (cells: Cell[]) => cells.map((c, i) => padTo(String(c ?? ''), widths[i])).join('  ');
  const sep = widths.map((w) => '─'.repeat(w)).join('  ');
  return [line(r.columns), sep, ...r.rows.map((row) => line(row)), `(${r.rows.length}행)`].join('\n');
}

/** 스키마 요약 (query 를 인자 없이 실행했을 때) */
export function formatSchema(db: Database): string {
  const lines = ['[FORENSIC DB — 읽기 전용 사본 · 허구 데이터]', '사용 가능한 테이블:'];
  for (const [name, t] of Object.entries(db))
    lines.push(`  ${name} ( ${t.columns.join(', ')} )  — ${t.rows.length}행`);
  lines.push('');
  lines.push(
    '예: query SELECT recipient, SUM(amount_krw) AS total FROM transactions GROUP BY recipient ORDER BY total DESC',
  );
  return lines.join('\n');
}
