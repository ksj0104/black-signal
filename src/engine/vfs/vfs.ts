/**
 * 가상 파일시스템 — 정적 인메모리 트리.
 * 호스트 파일시스템·네트워크와 어떤 연결도 없다.
 */
export type VNode = { t: 'f'; c: string } | { t: 'd'; ch: Record<string, VNode> };

export const F = (c: string): VNode => ({ t: 'f', c });
export const D = (ch: Record<string, VNode>): VNode => ({ t: 'd', ch });

export function resolvePath(cwd: string, path?: string): string {
  if (!path) return cwd;
  const parts = (path.startsWith('/') ? path : cwd + '/' + path).split('/').filter(Boolean);
  const out: string[] = [];
  for (const p of parts) {
    if (p === '.') continue;
    if (p === '..') {
      out.pop();
      continue;
    }
    out.push(p);
  }
  return '/' + out.join('/');
}

export function nodeAt(root: VNode, path: string): VNode | null {
  let n: VNode = root;
  for (const p of path.split('/').filter(Boolean)) {
    if (n.t !== 'd' || !n.ch[p]) return null;
    n = n.ch[p];
  }
  return n;
}

/** 현재 사건 루트 밖 접근 차단 (챕터 스포일러 방지) */
export function guard(p: string, caseRoot: string): void {
  if (!(p + '/').startsWith(caseRoot + '/')) throw '접근 제한: 현재 사건 범위 밖입니다';
}

export function readFile(root: VNode, cwd: string, path: string, caseRoot: string): string {
  const p = resolvePath(cwd, path);
  guard(p, caseRoot);
  const n = nodeAt(root, p);
  if (!n) throw `파일 없음: ${path}`;
  if (n.t === 'd') throw `${path}: 디렉터리입니다`;
  return n.c;
}
