import fs from 'node:fs';
import path from 'node:path';

const { desktopIt } = await import(process.env.FURN_NATIVE_HANDOFF_JASMINE_MODULE);
const root = process.env.FURN_NATIVE_HANDOFF_RUN_ROOT;
const recordSession = () =>
  fs.writeFileSync(path.join(root, 'worker.session.json'), JSON.stringify({ pid: process.pid, sessionId: browser.sessionId }));

describe('native scoped runner', () => {
  if (process.env.FURN_NATIVE_HANDOFF_MODE === 'worker-crash') {
    desktopIt('leaves its native session for parent drain', async () => {
      expect((await browser.getWindowHandles()).length).toBeGreaterThan(0);
      recordSession();
      process.exit(17);
    });
    return;
  }
  desktopIt('holds exclusive control without requiring physical input', async () => {
    expect((await browser.getWindowHandles()).length).toBeGreaterThan(0);
    recordSession();
    for (const name of ['DESKTOP_WDIO_BROKER_URL', 'DESKTOP_WDIO_BROKER_TOKEN', 'DESKTOP_WDIO_WORKER_TOKEN']) {
      expect(Object.hasOwn(process.env, name)).toBeFalse();
    }
    const grant = /fdg1\.[0-9a-f]{32}\.[A-Za-z0-9_-]{43}/;
    expect(grant.test(JSON.stringify(browser.options))).toBeFalse();
    expect(grant.test(JSON.stringify(browser.capabilities))).toBeFalse();
    fs.writeFileSync(path.join(root, 'worker.ready'), 'ready');
    await browser.waitUntil(() => fs.existsSync(path.join(root, 'worker.continue')), { timeout: 30_000 });
  });
  desktopIt('uses accessibility input when supported', { requires: ['accessibility-click'] }, async () => {
    const count = await browser.$(`~${process.env.FURN_NATIVE_HANDOFF_STATUS_ID}`);
    const before = await count.getText();
    await (await browser.$(`~${process.env.FURN_NATIVE_HANDOFF_ACTIVATE_ID}`)).click();
    await browser.waitUntil(async () => (await count.getText()) !== before, { timeout: 10_000 });
  });
});
