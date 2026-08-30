const path = require('node:path');
const { pathToFileURL } = require('node:url');

async function main() {
  const moduleUrl = pathToFileURL(path.resolve(__dirname, '..', '..', 'lib', 'wdio', 'index.js')).href;
  const { connectDesktopWebdriver } = await import(moduleUrl);
  const [url, targetId, artifactsRoot] = process.argv.slice(2);
  const desktop = await connectDesktopWebdriver({
    platformName: 'windows',
    targetId,
    url,
  });
  try {
    const manifest = await desktop.browser.desktopListStories();
    await desktop.browser.desktopExpect({
      state: 'enabled',
      target: { testId: 'button-primary' },
      value: true,
    });
    const result = await desktop.browser.desktopRunStoryTests({ artifactsRoot });
    process.stdout.write(JSON.stringify({ manifestEntries: manifest.entries.length, result }));
  } finally {
    await desktop.delete();
  }
}

main().catch((error) => {
  process.stderr.write(error.stack ?? error.message);
  process.exitCode = 1;
});
