const path = require('node:path');
const { pathToFileURL } = require('node:url');

async function main() {
  const moduleUrl = pathToFileURL(path.resolve(__dirname, '..', '..', 'lib', 'wdio', 'index.js')).href;
  const { attachDesktopWebdriver, connectDesktopWebdriver } = await import(moduleUrl);
  const [url, targetId, , scenario] = process.argv.slice(2);
  const options = { platformName: 'windows', targetId, url };
  let desktop;
  try {
    desktop = await connectDesktopWebdriver(options);
    if (scenario !== 'launch') {
      const client =
        scenario === 'attached'
          ? await attachDesktopWebdriver({ capabilities: desktop.browser.capabilities, sessionId: desktop.browser.sessionId, url })
          : desktop;
      await (await client.browser.$('~button-primary')).click();
    }
  } catch (error) {
    if (!(error instanceof Error)) throw error;
    const data = 'data' in error ? error.data : undefined;
    process.stdout.write(`\nFURN_RESULT ${JSON.stringify({ name: error.name, message: error.message, data })}\n`);
    return;
  } finally {
    await desktop?.delete();
  }
  throw new Error(`Expected the ${scenario} operation to fail.`);
}

main().catch((error) => {
  process.stderr.write(error.stack ?? error.message);
  process.exitCode = 1;
});
