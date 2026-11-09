const path = require('node:path');
const { pathToFileURL } = require('node:url');

async function main() {
  const moduleUrl = pathToFileURL(path.resolve(__dirname, '..', '..', 'lib', 'wdio', 'index.js')).href;
  const { attachDesktopWebdriver, connectDesktopWebdriver } = await import(moduleUrl);
  const [url, targetId] = process.argv.slice(2);
  const desktop = await connectDesktopWebdriver({ inputMode: 'accessible', platformName: 'windows', targetId, url });
  try {
    const worker = await attachDesktopWebdriver({ url, sessionId: desktop.browser.sessionId, capabilities: desktop.browser.capabilities });
    await (await worker.browser.$('~button-primary')).desktopPerformAccessibilityAction('Increment');
    const input = await worker.browser.$('~input-name');
    await input.clearValue();
    const typed = await input.setValue('text').then(
      () => 'typed',
      (error) => error.message,
    );
    process.stdout.write(
      JSON.stringify({
        attachedInputMode: worker.browser.capabilities['furn:inputMode'],
        input: await worker.browser.desktopInput(),
        inputMode: desktop.browser.capabilities['furn:inputMode'],
        typed,
      }),
    );
  } finally {
    await desktop.delete();
  }
}

main().catch((error) => {
  process.stderr.write(error.stack ?? error.message);
  process.exitCode = 1;
});
