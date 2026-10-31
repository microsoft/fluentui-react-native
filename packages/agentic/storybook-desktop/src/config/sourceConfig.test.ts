import { spawnSync } from 'node:child_process';
import path from 'node:path';

test('loads the source config through the CommonJS prebuild fallback without emitted JavaScript', () => {
  const projectRoot = path.resolve(__dirname, '../../../../../apps/storybook');
  const result = spawnSync(
    process.execPath,
    [
      '-e',
      `
    const { createRequire } = require('node:module');
    const path = require('node:path');
    const projectRoot = process.argv[1];
    const requireFromProject = createRequire(path.join(projectRoot, 'package.json'));
    const requireFromStorybook = createRequire(requireFromProject.resolve('@storybook/react-native'));
    requireFromStorybook('esbuild-register/dist/node').register({
      target: 'node22',
      format: 'cjs',
      hookIgnoreNodeModules: true,
    });
    const entry = requireFromProject.resolve('@fluentui-react-native/storybook-desktop/config');
    const { makeDesktopStorybookConfig } = requireFromProject('@fluentui-react-native/storybook-desktop/config');
    const config = makeDesktopStorybookConfig({
      projectRoot,
      platforms: ['macos'],
      storyPackages: ['@fluentui-react-native/components'],
      wdio: { test: '*activation*' },
    });
    const application = requireFromProject('./src/main.ts').default;
    process.stdout.write(JSON.stringify({ entry, stories: config.getStorybookConfig('macos').stories, wdio: config.wdio, application }));
  `,
      projectRoot,
    ],
    { cwd: projectRoot, encoding: 'utf8', timeout: 10_000 },
  );

  if (result.status !== 0) {
    throw new Error(result.stderr || result.error?.message || `Source config loader exited with ${result.status}.`);
  }
  expect(JSON.parse(result.stdout)).toMatchObject({
    entry: path.resolve(__dirname, 'index.ts'),
    stories: ['../../../packages/agentic/components/src/**/*.stories.?(ts|tsx)'],
    wdio: { test: '*activation*', timeoutMs: 30_000, reporter: 'spec', clickMode: 'auto' },
    application: { stories: expect.arrayContaining([expect.stringContaining('packages/agentic/components')]) },
  });
});

test('the canonical Storybook config resolves target commands and identity without a second schema', () => {
  const projectRoot = path.resolve(__dirname, '../../../../../apps/storybook');
  const result = spawnSync(
    process.execPath,
    [
      '--input-type=module',
      '-e',
      `
    import { loadDesktopConfig, selectDesktopRenderer } from '@fluentui-react-native/desktop-test/config';
    import { getStorybookIntegration } from '@fluentui-react-native/storybook-desktop/config';
    const desktop = await loadDesktopConfig();
    const config = getStorybookIntegration(desktop.config).configure(desktop.projectRoot, desktop);
    const win32 = config.getPlatformOptions('win32');
    process.stdout.write(JSON.stringify({
      target: config.getDesktopTarget('win32'),
      run: win32.run,
      windowTitle: win32.nativeDriver.application.windowTitle,
      fabricId: desktop.targets.macos.id,
      paper: selectDesktopRenderer(desktop.targets.macos, 'paper'),
    }));
  `,
    ],
    { cwd: projectRoot, encoding: 'utf8', timeout: 10_000 },
  );
  if (result.status !== 0) throw new Error(result.stderr || result.error?.message || `Canonical config exited with ${result.status}.`);
  const value = JSON.parse(result.stdout);
  expect(value).toMatchObject({
    target: { endpoint: 'win32', host: { kind: 'rex', renderer: 'paper' } },
    run: { command: process.execPath },
    windowTitle: 'Agentic Components Storybook (Win32)',
    paper: { endpoint: 'macos', host: { renderer: 'paper' } },
  });
  expect(value.target.id).toContain('win32');
  expect(value.paper.id).not.toBe(value.fabricId);
});
