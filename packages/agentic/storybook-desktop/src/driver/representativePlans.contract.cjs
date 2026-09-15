const path = require('node:path');
const { pathToFileURL } = require('node:url');

async function importFile(filePath) {
  return import(pathToFileURL(filePath).href);
}

async function main() {
  const packageRoot = path.resolve(__dirname, '..', '..');
  const projectRoot = path.resolve(packageRoot, '..', '..', '..', 'apps', 'storybook');
  const desktopDriverRoot = path.dirname(require.resolve('@fluentui-react-native/desktop-driver/package.json'));
  const [{ makeDesktopStorybookConfig }, { createDesktopStoryManifest }, testing, { runWdioStoryTests }, { NodeDesktopCommandRunner }] =
    await Promise.all([
      importFile(path.join(packageRoot, 'lib', 'config', 'index.js')),
      importFile(path.join(packageRoot, 'lib', 'driver', 'index.js')),
      importFile(path.join(desktopDriverRoot, 'lib', 'testing', 'index.js')),
      importFile(path.join(packageRoot, 'lib', 'testing', 'runWdioTests.js')),
      importFile(path.join(packageRoot, 'lib', 'cli', 'commandRunner.js')),
    ]);
  const config = makeDesktopStorybookConfig({
    projectRoot,
    storyPackages: ['@fluentui-react-native/components'],
  });
  const manifest = await createDesktopStoryManifest(config, 'windows');
  if (manifest.entries.some(({ tests }) => tests)) {
    throw new Error('The component catalog must not contain legacy desktopDriver story plans.');
  }
  const fs = require('node:fs');
  const componentsRoot = config.resolvePackage('@fluentui-react-native/components').root;
  const typedStories = JSON.parse(fs.readFileSync(path.join(componentsRoot, 'tsconfig.stories.json'), 'utf8')).include;
  for (const entry of manifest.entries.filter(({ wdio }) => wdio)) {
    if (!typedStories.includes(entry.sourcePath)) {
      throw new Error(`WDIO story is not included in test:stories: ${entry.sourcePath}`);
    }
  }
  const selectedIds = new Set(['components-button--default', 'components-checkbox--default', 'components-input--default']);
  const planned = manifest.entries.filter(({ id }) => selectedIds.has(id));
  const windowRect = { x: 0, y: 0, width: 800, height: 600 };
  const harness = await testing.createDesktopDriverStoryHarness(manifest, {
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
  try {
    const runOptions = {
      artifactsRoot: process.argv[2],
      config,
      manifest,
      platform: 'windows',
      targetId: harness.target.id,
      url: harness.server.url,
      story: 'components-{button,checkbox,input}--default',
      timeoutMs: 5000,
    };
    const runner = new NodeDesktopCommandRunner({ output: { write: () => true } });
    const result = await runWdioStoryTests(runOptions, runner);
    const repeated = await runWdioStoryTests(runOptions, runner);
    process.stdout.write(
      JSON.stringify({
        planned: planned.map(({ id, wdio }) => ({ id, tests: wdio.testNames })),
        repeated,
        result,
      }),
    );
  } finally {
    await harness.close();
  }
}

main().catch((error) => {
  process.stderr.write(error.stack ?? error.message);
  process.exitCode = 1;
});
