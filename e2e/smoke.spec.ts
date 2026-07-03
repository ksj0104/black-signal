import { test, expect, Page } from '@playwright/test';

test('메인 메뉴 → 새 수사 → 인트로 → 아파트 씬', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /BLACK\s*SIGNAL/ })).toBeVisible();
  await page.getByRole('button', { name: /새 수사 시작/ }).click();
  await page.getByRole('button', { name: '건너뛰기' }).click();
  await expect(page.getByRole('button', { name: '휴대폰' })).toBeVisible();
  await expect(page.getByRole('button', { name: '워크스테이션' })).toBeVisible();
});

async function enableReducedMotion(page: Page) {
  // 모션 줄이기 → 타이핑/부트/메신저 자동재생이 즉시 처리되어 e2e 가 결정적이 된다
  await page.getByRole('button', { name: /설정/ }).click();
  await page.getByLabel('모션 줄이기').check();
  await page.getByRole('button', { name: '닫기' }).click();
}

test('프롤로그 완주 — 수사 → 보드 → 피날레 → 종결 → 저장/이어하기', async ({ page }) => {
  test.setTimeout(120_000);
  await page.goto('/');
  await enableReducedMotion(page);
  await page.getByRole('button', { name: /새 수사 시작/ }).click();
  await page.getByRole('button', { name: '건너뛰기' }).click();

  // 씬: 엄마의 전화 (선택 1개 포함 4비트)
  await page.getByRole('button', { name: '휴대폰' }).click();
  const dlg = page.locator('#dlg');
  await dlg.click();
  await page.locator('#dlgChoices button').first().click();
  await dlg.click();
  await dlg.click();
  await expect(dlg).toHaveCount(0);

  // 워크스테이션 (모션 줄이기 → 부트 즉시 완료)
  await page.getByRole('button', { name: '워크스테이션' }).click();
  const term = page.getByRole('textbox', { name: '터미널 명령 입력' });
  await expect(term).toBeVisible();

  // 수사: 파이프라인 4종 → 전 단서 자동 확보
  for (const cmd of [
    'cat briefing.txt',
    'grep "CALLER" evidence/call_metadata.log | cut -d" " -f4 | sort | uniq -c',
    'grep "TEMPLATE_ID" evidence/sms_messages.txt',
    'base64 -d evidence/link_payload.b64',
  ]) {
    await term.fill(cmd);
    await term.press('Enter');
  }
  await expect(page.getByText('모든 단서 확보')).toBeVisible();

  // 증거 보드: 근거 5연결 → 사건 파일 생성
  const node = (re: RegExp) => page.getByRole('button', { name: re });
  const pairs: [RegExp, RegExp][] = [
    [/어머니의 휴대폰/, /070-8112-4437/],
    [/070-8112-4437/, /echo-relay-03/],
    [/TPL-ECHO-7/, /echo-relay-03/],
    [/kb_clone_v3/, /echo-relay-03/],
    [/echo-relay-03/, /mirrorcall/],
  ];
  for (const [a, b] of pairs) {
    await node(a).click();
    await node(b).click();
  }
  await page.getByRole('button', { name: /사건 파일 생성/ }).click();

  // 피날레 (SIGNAL 메신저) → 종결 보고
  await page.getByRole('button', { name: /이지스 리스폰스에 정식 사건으로/ }).click();
  await expect(page.getByText('CASE CLOSED')).toBeVisible();
  await expect(page.getByText(/프롤로그 완료/)).toBeVisible();

  // 저장 → 새로고침 → 이어하기 복원
  await page.getByRole('button', { name: '진행 상황 저장' }).click();
  await page.reload();
  await expect(page.getByRole('button', { name: /이어하기/ })).toBeVisible();
});
