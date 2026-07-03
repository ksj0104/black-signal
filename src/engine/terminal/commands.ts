/**
 * 시뮬레이션 터미널 — 가상 파일시스템 전용.
 * 호스트 셸을 절대 실행하지 않으며 외부 네트워크 기능이 없다.
 */
import { VNode, guard, nodeAt, readFile, resolvePath } from '../vfs/vfs';

export interface TermCtx {
  vfs: VNode;
  cwd: string;
  caseRoot: string;
  setCwd(p: string): void;
  print(text: string, cls?: 'cmd' | 'err' | 'ok' | 'dim'): void;
  /** cat/less 로 파일을 읽었을 때 (목표 트리거) */
  onFileRead?(absPath: string): void;
  history: string[];
}

/** 문자열 반환 = stdout (파이프 가능), undefined = 자체 출력 처리, throw string = 에러 */
export type CmdFn = (args: string[], stdin: string | null, ctx: TermCtx) => string | undefined;

export const BASE_MAN: Record<string, string> = {
  pwd: 'pwd — 현재 디렉터리 경로 출력',
  ls: 'ls [경로] — 디렉터리 내용 나열',
  cd: 'cd <경로> — 디렉터리 이동 (.. 은 상위)',
  cat: 'cat <파일> — 파일 내용 출력',
  less: 'less <파일> — cat 과 동일(간이 구현)',
  head: 'head [-n N] <파일> — 앞 N줄(기본 10)',
  tail: 'tail [-n N] <파일> — 뒤 N줄(기본 10)',
  grep: 'grep [-i] [-c] <패턴> [파일] — 패턴이 포함된 줄 검색. 파이프 입력 가능',
  sort: 'sort — 줄 정렬. 파이프와 함께 사용',
  uniq: 'uniq [-c] — 연속 중복 제거, -c 는 횟수 표시 (sort 후 사용)',
  cut: 'cut -d<구분자> -f<번호> — 필드 추출. 파이프와 함께 사용',
  find: 'find <이름조각> — 이름에 조각이 포함된 파일 검색 (현재 사건 범위)',
  file: 'file <파일> — 파일 유형 추정',
  strings: 'strings <파일> — 바이너리에서 읽을 수 있는 문자열 추출',
  base64: 'base64 -d <파일> — Base64 디코드',
  tr: 'tr <a> <b> — 파이프 입력의 문자 치환',
  xxd: 'xxd <파일> — 16진 덤프(앞부분)',
  history: 'history — 명령 기록',
  clear: 'clear — 화면 지우기',
  help: 'help — 명령 목록',
};

const lines = (x: string) => x.split('\n');
const unq = (s: string) => s.replace(/^["']|["']$/g, '');

function b64decode(t: string): string {
  // 브라우저 atob / Node(vitest) Buffer 둘 다 지원
  const g = globalThis as { atob?: (s: string) => string; Buffer?: { from(s: string, e: string): { toString(e: string): string } } };
  const bin = g.atob ? g.atob(t) : g.Buffer!.from(t, 'base64').toString('binary');
  const bytes = Uint8Array.from(bin, (c: string) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export const FS_COMMANDS: Record<string, CmdFn> = {
  pwd(_a, _i, ctx) {
    return ctx.cwd;
  },
  ls(a, _i, ctx) {
    const p = resolvePath(ctx.cwd, a[0] || '.');
    guard(p, ctx.caseRoot);
    const n = nodeAt(ctx.vfs, p);
    if (!n) throw `ls: ${a[0]}: 없음`;
    if (n.t === 'f') return a[0];
    return Object.keys(n.ch)
      .map((k) => (n.ch[k].t === 'd' ? k + '/' : k))
      .join('   ');
  },
  cd(a, _i, ctx) {
    const p = resolvePath(ctx.cwd, a[0] || ctx.caseRoot);
    guard(p, ctx.caseRoot);
    const n = nodeAt(ctx.vfs, p);
    if (!n || n.t !== 'd') throw `cd: ${a[0]}: 디렉터리가 아님`;
    ctx.setCwd(p);
    return undefined;
  },
  cat(a, stdin, ctx) {
    if (stdin != null) return stdin;
    const t = readFile(ctx.vfs, ctx.cwd, a[0], ctx.caseRoot);
    ctx.onFileRead?.(resolvePath(ctx.cwd, a[0]));
    return t;
  },
  less(a, stdin, ctx) {
    return FS_COMMANDS.cat(a, stdin, ctx);
  },
  head(a, stdin, ctx) {
    let n = 10;
    if (a[0] === '-n') {
      n = +a[1] || 10;
      a = a.slice(2);
    }
    const t = stdin != null ? stdin : readFile(ctx.vfs, ctx.cwd, a[0], ctx.caseRoot);
    return lines(t).slice(0, n).join('\n');
  },
  tail(a, stdin, ctx) {
    let n = 10;
    if (a[0] === '-n') {
      n = +a[1] || 10;
      a = a.slice(2);
    }
    const t = stdin != null ? stdin : readFile(ctx.vfs, ctx.cwd, a[0], ctx.caseRoot);
    return lines(t).slice(-n).join('\n');
  },
  grep(a, stdin, ctx) {
    let ci = false,
      cnt = false;
    while (a[0] && a[0].startsWith('-')) {
      if (a[0].includes('i')) ci = true;
      if (a[0].includes('c')) cnt = true;
      a = a.slice(1);
    }
    const pat = unq(a[0] || '');
    if (!pat) throw 'grep: 패턴 필요';
    const t = stdin != null ? stdin : readFile(ctx.vfs, ctx.cwd, a[1], ctx.caseRoot);
    const P = ci ? pat.toLowerCase() : pat;
    const hits = lines(t).filter((l) => (ci ? l.toLowerCase() : l).includes(P));
    return cnt ? String(hits.length) : hits.join('\n');
  },
  sort(a, stdin, ctx) {
    const t = stdin != null ? stdin : readFile(ctx.vfs, ctx.cwd, a[0], ctx.caseRoot);
    return lines(t).slice().sort().join('\n');
  },
  uniq(a, stdin, ctx) {
    const c = a[0] === '-c';
    if (c) a = a.slice(1);
    const t = stdin != null ? stdin : readFile(ctx.vfs, ctx.cwd, a[0], ctx.caseRoot);
    const L = lines(t);
    const out: string[] = [];
    let prev: string | null = null,
      n = 0;
    const flush = () => {
      if (prev !== null) out.push(c ? String(n).padStart(4) + ' ' + prev : prev);
    };
    for (const l of L) {
      if (l === prev) n++;
      else {
        flush();
        prev = l;
        n = 1;
      }
    }
    flush();
    return out.join('\n');
  },
  cut(a, stdin, ctx) {
    let d = ' ',
      f: string | null = null;
    while (a.length && a[0].startsWith('-')) {
      if (a[0] === '-d') {
        d = unq(a[1] || ' ');
        a = a.slice(2);
      } else if (a[0].startsWith('-d')) {
        d = unq(a[0].slice(2));
        a = a.slice(1);
      } else if (a[0] === '-f') {
        f = a[1];
        a = a.slice(2);
      } else if (a[0].startsWith('-f')) {
        f = a[0].slice(2);
        a = a.slice(1);
      } else break;
    }
    if (!f) throw '사용법: cut -d" " -f4 (구분자 d 로 나눈 f 번째 필드)';
    const n = parseInt(f);
    if (!n) throw 'cut: 필드 번호가 올바르지 않음';
    const t = stdin != null ? stdin : readFile(ctx.vfs, ctx.cwd, a[0], ctx.caseRoot);
    return lines(t)
      .map((l) => l.split(d)[n - 1] ?? '')
      .filter((l) => l !== '')
      .join('\n');
  },
  find(a, _i, ctx) {
    if (!a[0]) throw 'find: 이름 조각 필요';
    const res: string[] = [];
    const root = ctx.caseRoot;
    const walk = (n: VNode, p: string) => {
      if (n.t === 'f') {
        if (p.includes(a[0])) res.push(p);
        return;
      }
      for (const k in n.ch) walk(n.ch[k], p + '/' + k);
    };
    const rootNode = nodeAt(ctx.vfs, root);
    if (rootNode) walk(rootNode, root);
    return res.length ? res.join('\n') : '(없음)';
  },
  file(a, _i, ctx) {
    const t = readFile(ctx.vfs, ctx.cwd, a[0], ctx.caseRoot);
    // eslint-disable-next-line no-control-regex
    return /[\u0000-\u0008]/.test(t)
      ? `${a[0]}: data (바이너리 추정 — strings 를 써 볼 것)`
      : `${a[0]}: 텍스트`;
  },
  strings(a, _i, ctx) {
    const t = readFile(ctx.vfs, ctx.cwd, a[0], ctx.caseRoot);
    const m = t.match(/[\x20-\x7E가-힣=.,_\-:/]{4,}/g) || [];
    return m.join('\n');
  },
  base64(a, _i, ctx) {
    if (a[0] !== '-d') throw '사용법: base64 -d <파일>';
    const t = readFile(ctx.vfs, ctx.cwd, a[1], ctx.caseRoot).trim();
    try {
      return b64decode(t);
    } catch {
      throw 'base64: 디코드 실패';
    }
  },
  tr(a, stdin) {
    if (stdin == null) throw 'tr: 파이프 입력 필요';
    if (a.length < 2) throw '사용법: … | tr <a> <b>';
    return stdin.split(unq(a[0])).join(unq(a[1]));
  },
  xxd(a, _i, ctx) {
    const t = readFile(ctx.vfs, ctx.cwd, a[0], ctx.caseRoot);
    let s = '';
    for (let i = 0; i < Math.min(t.length, 96); i += 8) {
      let hex = '',
        asc = '';
      for (let j = i; j < i + 8 && j < t.length; j++) {
        const c = t.charCodeAt(j);
        hex += c.toString(16).padStart(2, '0') + ' ';
        asc += c >= 32 && c < 127 ? t[j] : '.';
      }
      s += i.toString(16).padStart(4, '0') + ': ' + hex.padEnd(24) + ' ' + asc + '\n';
    }
    return s.trimEnd() + (t.length > 96 ? '\n… (이하 생략)' : '');
  },
  history(_a, _i, ctx) {
    return ctx.history.slice(-20).join('\n') || '(비어 있음)';
  },
};

export function tokenize(stage: string): string[] {
  return stage.match(/(?:[^\s"']+|"[^"]*"|'[^']*')+/g) || [];
}

/* ---- 탭 자동완성 ---- */
/** 게임 레벨 명령(터미널 실행기에서 주입되는 것들) */
export const GAME_COMMANDS = [
  'case',
  'cctv',
  'clear',
  'help',
  'hint',
  'man',
  'map',
  'pkg',
  'python',
  'query',
  'save',
];
/** 자동완성 후보가 되는 전체 명령 목록 */
export const ALL_COMMANDS = Array.from(
  new Set([...Object.keys(FS_COMMANDS), ...GAME_COMMANDS]),
).sort();

function commonPrefix(items: string[]): string {
  if (!items.length) return '';
  let p = items[0];
  for (const s of items) {
    let i = 0;
    while (i < p.length && i < s.length && p[i] === s[i]) i++;
    p = p.slice(0, i);
    if (!p) break;
  }
  return p;
}

export interface Completion {
  /** 자동완성이 적용된 새 입력값 (변화 없으면 원본과 동일) */
  value: string;
  /** 후보가 둘 이상일 때 표시용 목록 (디렉토리는 / 접미사) */
  candidates: string[];
}

/**
 * 현재 입력줄에 대한 탭 자동완성 계산.
 * - 첫 토큰: 명령어 완성
 * - 이후 토큰: 현재 사건 범위 내 파일/디렉토리 경로 완성
 */
export function autocomplete(
  line: string,
  ctx: { vfs: VNode; cwd: string; caseRoot: string },
): Completion {
  const lead = line.match(/^\s*/)![0];
  const body = line.slice(lead.length);
  const endsWithSpace = body === '' || /\s$/.test(body);
  const toks = body.split(/\s+/).filter(Boolean);
  const head = endsWithSpace ? toks : toks.slice(0, -1);
  const frag = endsWithSpace ? '' : (toks[toks.length - 1] ?? '');

  // 명령어 자동완성 (첫 토큰)
  if (head.length === 0) {
    const cands = ALL_COMMANDS.filter((c) => c.startsWith(frag));
    if (!cands.length) return { value: line, candidates: [] };
    const filled = cands.length === 1 ? cands[0] + ' ' : commonPrefix(cands);
    return { value: lead + filled, candidates: cands.length > 1 ? cands : [] };
  }

  // 경로 자동완성 (파일/디렉토리)
  const slash = frag.lastIndexOf('/');
  const dirPart = slash >= 0 ? frag.slice(0, slash + 1) : '';
  const base = slash >= 0 ? frag.slice(slash + 1) : frag;
  let names: string[] = [];
  try {
    const dirAbs = resolvePath(ctx.cwd, dirPart || '.');
    guard(dirAbs, ctx.caseRoot);
    const node = nodeAt(ctx.vfs, dirAbs);
    if (node && node.t === 'd')
      names = Object.keys(node.ch)
        .filter((k) => k.startsWith(base))
        .map((k) => (node.ch[k].t === 'd' ? k + '/' : k))
        .sort();
  } catch {
    names = [];
  }
  if (!names.length) return { value: line, candidates: [] };

  let filledBase: string;
  if (names.length === 1) {
    // 디렉토리면 슬래시로 끝나 이어 완성 가능, 파일이면 공백으로 마무리
    filledBase = names[0].endsWith('/') ? names[0] : names[0] + ' ';
  } else {
    filledBase = commonPrefix(names.map((n) => (n.endsWith('/') ? n.slice(0, -1) : n)));
  }
  const value = lead + [...head, dirPart + filledBase].join(' ');
  return { value, candidates: names.length > 1 ? names : [] };
}

/**
 * 파이프라인 실행. extra 로 게임 레벨 명령(hint/map/…)을 주입한다.
 * 마지막 스테이지 stdout 은 print 되고 onOutput(스캔)으로 전달된다.
 */
export function runPipeline(
  line: string,
  ctx: TermCtx,
  extra: Record<string, CmdFn> = {},
  onOutput?: (txt: string) => void,
): void {
  const stages = line
    .split('|')
    .map((s) => s.trim())
    .filter(Boolean);
  if (!stages.length) return;
  const cmds = { ...FS_COMMANDS, ...extra };
  let stdin: string | null = null;
  try {
    for (let i = 0; i < stages.length; i++) {
      const tok = tokenize(stages[i]);
      const cmd = tok[0];
      if (!cmds[cmd]) throw `명령을 찾을 수 없음: ${cmd}  (help 참고)`;
      const r = cmds[cmd](tok.slice(1), stdin, ctx);
      stdin = typeof r === 'string' ? r : null;
      if (i === stages.length - 1 && typeof r === 'string') {
        ctx.print(r);
        onOutput?.(r);
      }
    }
  } catch (e) {
    ctx.print(String(e), 'err');
  }
}
