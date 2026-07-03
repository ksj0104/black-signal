/**
 * 격리 분석 랩 ("python") — 실제 파이썬이 아니다.
 *
 * 가이드 템플릿 "조건식 빈칸 채우기" 평가기: 플레이어는 미리 저작된 분석 골격의
 * 빈칸(임계값·필드값)만 k=v 인자로 채운다. 사용자 코드 실행·eval 이 없고,
 * 게임 소유 인메모리 CSV 테이블(전부 허구)만 계산한다. os/subprocess/socket/
 * requests/파일/네트워크/브라우저 API 는 존재 자체가 없다 — "격리 샌드박스" 설정.
 */
import { Table, QueryResult, formatResult } from '../query/query';

export interface PylabBlank {
  key: string;
  /** 빈칸 설명 (템플릿 뷰에 표시) */
  label: string;
  /** 입력 예시 (자리표시) */
  sample: string;
}

export interface PylabTemplate {
  id: string;
  title: string;
  /** 유사코드 골격. 빈칸은 «key» 표기 */
  skeleton: string[];
  blanks: PylabBlank[];
  /** 결정적 실행 — 파싱된 인자로 인메모리 테이블을 계산해 출력 텍스트를 만든다 */
  run(datasets: Record<string, Table>, answers: Record<string, string>): string;
}

export interface PylabDef {
  /** 랩 배너 (안전 고지 포함) */
  banner: string;
  datasets: Record<string, Table>;
  templates: PylabTemplate[];
}

/** Table → 터미널 표 텍스트 (query 의 CJK 폭 인지 포매터 재사용) */
export function formatTable(columns: string[], rows: Record<string, string | number>[]): string {
  const r: QueryResult = { columns, rows: rows.map((row) => columns.map((c) => row[c] ?? '')) };
  return formatResult(r);
}

/** python (인자 없음) — 랩 개요: 데이터셋 목록 + 템플릿 목록 + 사용법 */
export function labOverview(def: PylabDef): string {
  const lines = [def.banner, '', '데이터셋 (읽기 전용 · 인메모리):'];
  for (const [name, t] of Object.entries(def.datasets))
    lines.push(`  ${name} ( ${t.columns.join(', ')} )  — ${t.rows.length}행`);
  lines.push('', '분석 템플릿:');
  for (const t of def.templates) lines.push(`  python ${t.id.padEnd(8)} — ${t.title}`);
  lines.push('', '사용법: python <템플릿>            골격과 빈칸 확인');
  lines.push('        python <템플릿> k=v ...    빈칸을 채워 실행');
  return lines.join('\n');
}

/** python <템플릿> — 골격 + 빈칸 안내 */
export function templateView(def: PylabDef, id: string): string {
  const t = def.templates.find((x) => x.id === id);
  if (!t) return notFound(def, id);
  const lines = [`[TEMPLATE ${t.id}] ${t.title}`, ''];
  lines.push(...t.skeleton.map((l) => '  ' + l));
  lines.push('', '빈칸:');
  for (const b of t.blanks) lines.push(`  «${b.key}»  ${b.label}`);
  lines.push('', `실행: python ${t.id} ${t.blanks.map((b) => `${b.key}=${b.sample}`).join(' ')}`);
  return lines.join('\n');
}

/** python <템플릿> k=v ... — 빈칸 검증 후 결정적 실행 */
export function runTemplate(
  def: PylabDef,
  id: string,
  args: string[],
): { text: string; ok: boolean } {
  const t = def.templates.find((x) => x.id === id);
  if (!t) return { text: notFound(def, id), ok: false };

  const answers: Record<string, string> = {};
  for (const a of args) {
    const eq = a.indexOf('=');
    if (eq <= 0)
      return { text: `pylab: 잘못된 인자 '${a}' — k=v 형식으로 빈칸을 채운다.`, ok: false };
    const k = a.slice(0, eq).trim();
    const v = a.slice(eq + 1).trim().replace(/^["']|["']$/g, '');
    if (!t.blanks.some((b) => b.key === k))
      return {
        text: `pylab: '${t.id}' 에 «${k}» 빈칸이 없다. 빈칸: ${t.blanks.map((b) => b.key).join(', ')}`,
        ok: false,
      };
    answers[k] = v;
  }
  const missing = t.blanks.filter((b) => !(b.key in answers));
  if (missing.length)
    return {
      text:
        `pylab: 빈칸 미입력 — ${missing.map((b) => '«' + b.key + '»').join(' ')}\n` +
        `실행 예: python ${t.id} ${t.blanks.map((b) => `${b.key}=${b.sample}`).join(' ')}`,
      ok: false,
    };
  return { text: t.run(def.datasets, answers), ok: true };
}

function notFound(def: PylabDef, id: string): string {
  return (
    `pylab: 알 수 없는 템플릿 '${id}'\n` +
    `사용 가능: ${def.templates.map((t) => t.id).join(', ')}  (python 으로 개요 확인)`
  );
}
