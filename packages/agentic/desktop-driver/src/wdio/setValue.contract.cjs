const path = require('node:path');
const { pathToFileURL } = require('node:url');

const secret = 'hunter2-masked-value';

// WebdriverIO logs to stdout as well, so the result carries a marker the test can find.
const emit = (value) => process.stdout.write(`\nFURN_RESULT ${JSON.stringify(value)}\n`);

const outcome = (promise) =>
  promise.then(
    () => 'ok',
    (error) => String(error.message).split('\n')[0],
  );

async function main() {
  const moduleUrl = pathToFileURL(path.resolve(__dirname, '..', '..', 'lib', 'wdio', 'index.js')).href;
  const { attachDesktopWebdriver, connectDesktopWebdriver } = await import(moduleUrl);
  const [url, targetId, , scenario] = process.argv.slice(2);
  const connect = (options) => connectDesktopWebdriver({ logLevel: 'info', platformName: 'windows', targetId, url, ...options });

  if (scenario === 'masked' || scenario === 'unmasked') {
    const desktop = await connect();
    try {
      const input = await desktop.browser.$('~input-name');
      const result = await outcome(scenario === 'masked' ? input.setValue(secret, { mask: true }) : input.setValue(secret));
      emit({ result });
    } finally {
      await desktop.delete();
    }
    return;
  }

  if (scenario === 'partial-attach') {
    const desktop = await connect({ inputMode: 'accessible' });
    try {
      const { 'furn:inputMode': _omitted, ...partial } = desktop.browser.capabilities;
      const worker = await attachDesktopWebdriver({ capabilities: partial, sessionId: desktop.browser.sessionId, url });
      const input = await worker.browser.$('~input-name');
      emit({
        capabilityMode: worker.browser.capabilities['furn:inputMode'] ?? null,
        typed: await outcome(input.setValue('text')),
      });
    } finally {
      await desktop.delete();
    }
    return;
  }

  if (scenario === 'reload') {
    const desktop = await connect({ logLevel: 'silent' });
    try {
      const before = desktop.browser.sessionId;
      await desktop.browser.reloadSession();
      const input = await desktop.browser.$('~input-name');
      emit({
        boundToReloaded: desktop.session.id === desktop.browser.sessionId,
        changed: before !== desktop.browser.sessionId,
        input: await desktop.browser.desktopInput(),
        typed: await outcome(input.setValue('after reload')),
      });
    } finally {
      await desktop.delete();
    }
    return;
  }

  if (scenario === 'stubborn') {
    const desktop = await connect({ logLevel: 'silent' });
    try {
      const input = await desktop.browser.$('~input-name');
      emit({ typed: await outcome(input.setValue('5')) });
    } finally {
      await desktop.delete();
    }
    return;
  }

  throw new Error(`Unknown scenario ${scenario}.`);
}

main().catch((error) => {
  process.stderr.write(error.stack ?? error.message);
  process.exitCode = 1;
});
