const path = require('node:path');
const { pathToFileURL } = require('node:url');

async function importFile(filePath) {
  return import(pathToFileURL(filePath).href);
}

async function main() {
  const packageRoot = path.resolve(__dirname, '..', '..');
  const projectRoot = path.resolve(packageRoot, '..', '..', '..', 'apps', 'storybook');
  const desktopDriverRoot = path.dirname(require.resolve('@fluentui-react-native/desktop-driver/package.json'));
  const [{ makeDesktopStorybookConfig }, { createDesktopStoryManifest }, testing, wdio] = await Promise.all([
    importFile(path.join(packageRoot, 'lib', 'config', 'index.js')),
    importFile(path.join(packageRoot, 'lib', 'driver', 'index.js')),
    importFile(path.join(desktopDriverRoot, 'lib', 'testing', 'index.js')),
    importFile(path.join(desktopDriverRoot, 'lib', 'wdio', 'index.js')),
  ]);
  const config = makeDesktopStorybookConfig({
    projectRoot,
    storyPackages: ['@fluentui-react-native/components'],
  });
  const manifest = await createDesktopStoryManifest(config, 'windows');
  const planned = manifest.entries.filter(({ tags, tests }) => tags.includes('desktop-e2e') && tests && tests.tests.length > 0);
  const harness = await testing.createDesktopDriverStoryHarness(manifest, {
    features: {
      focus: false,
      keyboard: false,
      physicalClick: false,
    },
    windows: testing.createFakeStoryWindows(manifest),
  });
  const desktop = await wdio.connectDesktopWebdriver({
    platformName: 'windows',
    targetId: harness.target.id,
    url: harness.server.url,
  });
  try {
    const runOptions = {
      artifactsRoot: process.argv[2],
      selection: { tag: 'desktop-e2e' },
    };
    const result = await desktop.runStoryTests(runOptions);
    const repeated = await desktop.runStoryTests(runOptions);
    process.stdout.write(
      JSON.stringify({
        planned: planned.map(({ id, tests }) => ({ id, tests: tests.tests.map(({ id: testId }) => testId) })),
        repeated,
        result,
      }),
    );
  } finally {
    await desktop.delete();
    await harness.close();
  }
}

main().catch((error) => {
  process.stderr.write(error.stack ?? error.message);
  process.exitCode = 1;
});
