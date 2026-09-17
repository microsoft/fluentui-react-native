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
  const representativeStoryIds = new Set(['components-button--default', 'components-checkbox--default', 'components-input--default']);
  const representativeManifest = {
    ...manifest,
    entries: manifest.entries.filter(({ id }) => representativeStoryIds.has(id)),
  };
  const planned = representativeManifest.entries.filter(({ tests }) => tests);
  const windowRect = { x: 0, y: 0, width: 800, height: 600 };
  const harness = await testing.createDesktopDriverStoryHarness(representativeManifest, {
    windows: [
      {
        id: 'window-1',
        title: 'Representative Plans',
        elements: [
          {
            id: 'root',
            automationId: 'app-root',
            rect: windowRect,
            role: 'application',
            scope: 'application',
            windowId: 'window-1',
          },
          {
            id: 'story-root',
            automationId: 'story-root',
            name: JSON.stringify({ previewGeneration: 0, storyId: 'initial--story' }),
            parentId: 'root',
            rect: windowRect,
            role: 'group',
            scope: 'preview',
            windowId: 'window-1',
          },
          {
            id: 'button',
            automationId: 'agentic-storybook-button',
            name: 'Button',
            parentId: 'story-root',
            rect: { x: 10, y: 10, width: 120, height: 40 },
            role: 'button',
            scope: 'preview',
            windowId: 'window-1',
          },
          {
            id: 'checkbox',
            automationId: 'agentic-storybook-checkbox',
            checked: false,
            name: 'Checkbox',
            parentId: 'story-root',
            rect: { x: 10, y: 60, width: 120, height: 40 },
            role: 'checkbox',
            scope: 'preview',
            windowId: 'window-1',
          },
          {
            id: 'input',
            automationId: 'agentic-storybook-input',
            name: 'Search files',
            parentId: 'story-root',
            rect: { x: 10, y: 110, width: 200, height: 40 },
            role: 'textbox',
            scope: 'preview',
            value: '',
            windowId: 'window-1',
          },
        ],
      },
    ],
  });
  const desktop = await wdio.connectDesktopWebdriver({
    platformName: 'windows',
    targetId: harness.target.id,
    url: harness.server.url,
  });
  try {
    const runOptions = {
      artifactsRoot: process.argv[2],
      selection: { story: 'components-*--default', tag: 'desktop-e2e' },
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
