const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { attach } = require('webdriverio');

async function capture(browser, artifactsRoot, mode) {
  const element = await browser.$('~button-primary');
  const window = await browser.takeScreenshot();
  const filename = path.join(artifactsRoot, `${mode}.png`);
  if (!browser.capabilities['furn:features'].elementScreenshot) {
    await assert.rejects(() => element.takeScreenshot(), /does not support element screenshots/);
    await assert.rejects(() => element.saveScreenshot(filename), /does not support element screenshots/);
    return { window, element: 'unsupported', savedElement: 'unsupported' };
  }
  const image = await element.takeScreenshot();
  const saved = await element.saveScreenshot(filename);
  assert.deepEqual(await fs.readFile(filename), saved);
  return { window, element: image, savedElement: saved.toString('base64') };
}

async function main() {
  const moduleUrl = pathToFileURL(path.resolve(__dirname, '..', '..', 'lib', 'wdio', 'index.js')).href;
  const { attachDesktopWebdriver, connectDesktopWebdriver, installDesktopWebdriverCommands } = await import(moduleUrl);
  const [url, targetId, artifactsRoot] = process.argv.slice(2);
  const desktop = await connectDesktopWebdriver({ platformName: 'windows', targetId, url });
  try {
    const connected = await capture(desktop.browser, artifactsRoot, 'connected');
    const attachment = { url, sessionId: desktop.browser.sessionId, capabilities: desktop.browser.capabilities };
    const worker = await attachDesktopWebdriver(attachment);
    const attached = await capture(worker.browser, artifactsRoot, 'attached');
    const address = new URL(url);
    const browser = await attach({
      hostname: address.hostname,
      port: Number(address.port),
      path: '/',
      sessionId: attachment.sessionId,
      capabilities: attachment.capabilities,
      options: { logLevel: 'silent' },
    });
    installDesktopWebdriverCommands(browser, url);
    installDesktopWebdriverCommands(browser, url);
    const managed = await capture(browser, artifactsRoot, 'managed');
    process.stdout.write(JSON.stringify({ connected, attached, managed }));
  } finally {
    await desktop.delete();
  }
}

main().catch((error) => {
  process.stderr.write(error.stack ?? error.message);
  process.exitCode = 1;
});
