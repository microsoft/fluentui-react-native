import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';

import { loadDesktopConfig, toDesktopHostOptions } from './node.ts';
import { toStorybookStories, type DesktopProjectConfig } from './index.ts';

const config: DesktopProjectConfig = {
  schemaVersion: 1,
  application: { manifest: './app.json', readyTestId: 'app-ready' },
  storybook: {
    configDir: './src',
    stories: [{ directory: '../../packages/components/src', files: '**/*.stories.?(ts|tsx)' }],
    channel: { port: 7007 },
  },
  tests: {
    generatedDirectory: './desktop-tests/generated',
    fakeScene: './desktop-tests/fake-scene.json',
    artifactsDirectory: './artifacts',
    runner: { command: 'yarn', args: ['wdio', 'run', 'wdio.conf.ts'] },
  },
  platforms: {
    fake: { backend: 'fake', target: { defaultMode: 'attach', attach: { identity: 'fake' } } },
    macos: {
      backend: 'mac2',
      target: { defaultMode: 'attach', attach: { identityFromApplicationManifest: 'macos.bundleIdentifier' } },
    },
    windows: {
      backend: 'novawindows',
      target: { defaultMode: 'attach', attach: { titleFromApplicationManifest: 'displayName' } },
    },
  },
};

describe('desktop project config', () => {
  it('projects story globs relative to the Storybook config directory', () => {
    expect(toStorybookStories(config)).toEqual(['../../../packages/components/src/**/*.stories.?(ts|tsx)']);
  });

  it('resolves paths from the config file and application identities from app.json', async () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'desktop-project-config-'));
    fs.mkdirSync(path.join(root, 'src'));
    fs.writeFileSync(
      path.join(root, 'app.json'),
      JSON.stringify({ displayName: 'Sample Storybook', macos: { bundleIdentifier: 'com.example.Sample' } }),
      'utf8',
    );
    fs.writeFileSync(path.join(root, 'desktop.config.json'), JSON.stringify(config), 'utf8');

    const project = await loadDesktopConfig(path.join(root, 'desktop.config.json'), {
      platform: 'macos',
      env: {},
    });

    expect(project.rootDir).toBe(root);
    expect(project.driver.target).toEqual({ mode: 'attach', identity: 'com.example.Sample' });
    expect(project.tests.generatedDirectory).toBe(path.join(root, 'desktop-tests', 'generated'));
    expect(toDesktopHostOptions(project)).toMatchObject({
      configPath: path.join(root, 'src'),
      manifestPath: path.join(root, 'desktop-tests', 'generated', 'story-tests.manifest.json'),
      port: 7007,
    });
  });

  it('lets a declared launch environment override select launch mode', async () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'desktop-project-config-'));
    fs.writeFileSync(path.join(root, 'app.json'), JSON.stringify({ displayName: 'Sample' }), 'utf8');
    fs.writeFileSync(path.join(root, 'desktop.config.json'), JSON.stringify(config), 'utf8');

    const project = await loadDesktopConfig(path.join(root, 'desktop.config.json'), {
      platform: 'windows',
      env: { DESKTOP_TEST_APP: 'C:\\Sample\\App.exe' },
    });

    expect(project.driver.target).toEqual({ mode: 'launch', app: 'C:\\Sample\\App.exe' });
  });
});
