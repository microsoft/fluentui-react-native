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
    process.stdout.write(JSON.stringify({ entry, stories: config.getStorybookConfig('macos').stories, wdio: config.wdio }));
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
  });
});
