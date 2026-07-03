import { describe, expect, it } from 'vitest';
import { TermCtx, autocomplete, runPipeline } from '../engine/terminal/commands';
import { ROOT_FS } from '../state/gameStore';

function makeCtx(cwd: string, caseRoot: string) {
  const out: { text: string; cls?: string }[] = [];
  const ctx: TermCtx = {
    vfs: ROOT_FS,
    cwd,
    caseRoot,
    setCwd: (p) => (ctx.cwd = p),
    print: (text, cls) => out.push({ text, cls }),
    history: [],
  };
  return { ctx, out };
}
const P = '/cases/00_prologue';
const C1 = '/cases/01_echo_gate';

describe('터미널 파이프라인', () => {
  it('grep | cut | sort | uniq -c 로 반복 발신 번호를 센다', () => {
    const { ctx, out } = makeCtx(P, P);
    runPipeline('grep "CALLER" evidence/call_metadata.log | cut -d" " -f4 | sort | uniq -c', ctx);
    expect(out[0].text).toMatch(/^\s*7 CALLER=070-8112-4437$/m);
  });
  it('grep -c 는 매칭 줄 수를 반환한다', () => {
    const { ctx, out } = makeCtx(P, P);
    runPipeline('grep -c "TPL-ECHO-7" evidence/sms_messages.txt', ctx);
    expect(out[0].text).toBe('3');
  });
  it('base64 -d 가 링크 페이로드를 디코드한다', () => {
    const { ctx, out } = makeCtx(P, P);
    runPipeline('base64 -d evidence/link_payload.b64', ctx);
    expect(out[0].text).toContain('echo-relay-03');
    expect(out[0].text).toContain('mirrorcall');
  });
  it('strings 가 바이너리에서 인증서 발급자를 추출한다', () => {
    const { ctx, out } = makeCtx(P, P);
    runPipeline('strings evidence/app.bin', ctx);
    expect(out[0].text).toContain('cert.issuer=echo-relay-03');
  });
  it('head/tail -n 이 줄 수를 제한한다', () => {
    const { ctx, out } = makeCtx(P, P);
    runPipeline('head -n 2 evidence/call_metadata.log', ctx);
    expect(out[0].text.split('\n')).toHaveLength(2);
    runPipeline('tail -n 3 evidence/call_metadata.log', ctx);
    expect(out[1].text.split('\n')).toHaveLength(3);
  });
  it('tr 이 파이프 입력의 문자를 치환한다', () => {
    const { ctx, out } = makeCtx(P, P);
    runPipeline('cat evidence/link_payload.b64 | tr = _', ctx);
    expect(out[0].text.endsWith('_')).toBe(true);
  });
  it('cd + 상대경로 cat 이 동작한다', () => {
    const { ctx, out } = makeCtx(P, P);
    runPipeline('cd evidence', ctx);
    expect(ctx.cwd).toBe(P + '/evidence');
    runPipeline('cat transfer_receipt.txt', ctx);
    expect(out.at(-1)!.text).toContain('NL-ESCROW');
  });
  it('알 수 없는 명령은 에러를 출력한다', () => {
    const { ctx, out } = makeCtx(P, P);
    runPipeline('rm -rf /', ctx);
    expect(out[0].cls).toBe('err');
    expect(out[0].text).toContain('명령을 찾을 수 없음');
  });
});

describe('사건 범위 가드', () => {
  it('프롤로그에서 챕터1 파일 접근을 차단한다', () => {
    const { ctx, out } = makeCtx(P, P);
    runPipeline('cat /cases/01_echo_gate/briefing.txt', ctx);
    expect(out[0].cls).toBe('err');
    expect(out[0].text).toContain('접근 제한');
  });
  it('find 는 현재 사건 루트만 검색한다', () => {
    const { ctx, out } = makeCtx(C1, C1);
    runPipeline('find bak', ctx);
    expect(out[0].text).toContain('config_old.bak');
    expect(out[0].text).not.toContain('00_prologue');
  });
  it('cd 로 사건 루트 밖 이동이 불가하다', () => {
    const { ctx, out } = makeCtx(C1, C1);
    runPipeline('cd /cases', ctx);
    expect(out[0].cls).toBe('err');
    expect(ctx.cwd).toBe(C1);
  });
});

describe('탭 자동완성', () => {
  const C2 = '/cases/02_unlisted';
  const ac = (line: string, cwd = C2, caseRoot = C2) =>
    autocomplete(line, { vfs: ROOT_FS, cwd, caseRoot });

  it('명령어 접두어를 유일 후보로 완성한다', () => {
    expect(ac('gr').value).toBe('grep ');
  });
  it('명령어 후보가 여럿이면 공통 접두어까지 완성하고 목록을 준다', () => {
    const r = ac('s');
    expect(r.candidates.length).toBeGreaterThan(1);
    expect(r.candidates).toContain('sort');
    expect(r.candidates).toContain('strings');
    expect(r.candidates).toContain('save');
  });
  it('파일명을 완성한다', () => {
    expect(ac('cat brief').value).toBe('cat briefing.txt ');
  });
  it('디렉토리는 슬래시로 완성해 이어 입력하게 한다', () => {
    expect(ac('cd reg').value).toBe('cd registry/');
  });
  it('디렉토리 내부 경로를 완성한다', () => {
    expect(ac('grep SRC carrier/car').value).toBe('grep SRC carrier/carrier_dump.log ');
  });
  it('빈 인자 위치에서는 현재 디렉토리 항목을 후보로 나열한다', () => {
    const r = ac('ls registry/');
    expect(r.candidates).toContain('sim_registration.b64');
    expect(r.candidates).toContain('northline_officers.txt');
  });
  it('사건 범위 밖 경로는 완성하지 않는다', () => {
    const r = ac('cat ../');
    expect(r.value).toBe('cat ../');
    expect(r.candidates).toHaveLength(0);
  });
  it('일치하는 후보가 없으면 입력을 그대로 둔다', () => {
    expect(ac('cat zzz').value).toBe('cat zzz');
  });
});

describe('챕터 1 핵심 파이프라인', () => {
  it('운영자 콜사인 dove-9 가 7회로 최다', () => {
    const { ctx, out } = makeCtx(C1, C1);
    runPipeline('grep "OPERATOR" srv/logs/relay_access.log | cut -d" " -f3 | sort | uniq -c', ctx);
    expect(out[0].text).toMatch(/^\s*7 OPERATOR=dove-9$/m);
    expect(out[0].text).toMatch(/^\s*2 OPERATOR=harbor-2$/m);
  });
  it('accounts.b64 디코드에 모법인 관계가 담겨 있다', () => {
    const { ctx, out } = makeCtx(C1, C1);
    runPipeline('base64 -d srv/ledger/accounts.b64', ctx);
    expect(out[0].text).toContain('NL-ESCROW');
    expect(out[0].text).toContain('NORTHLINE FIDUCIARY SERVICES');
    expect(out[0].text).toContain('모법인');
  });
  it('xxd 가 바이너리를 16진으로 덤프한다', () => {
    const { ctx, out } = makeCtx(C1, C1);
    runPipeline('xxd srv/tmp/export_0412.bin', ctx);
    expect(out[0].text).toMatch(/^0000: /);
  });
});
