import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';

import { loadDesktopConfig, toDesktopHostOptions, toDesktopWdioOptions } from './node.ts';
import { toStorybookStories, type DesktopProjectConfig } from './index.ts';
import { digestEntries } from '../storybook/manifest.ts';
import { createDesktopWdioConfig } from '../wdio/config-factory.ts';
import type { StoryTestManifest } from '../types.ts';

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
    const localConfig = {
      ...config,
      storybook: { ...config.storybook, stories: [{ directory: './src', files: '**/*.stories.tsx' }] },
      tests: { ...config.tests, fakeScene: undefined },
    };
    fs.writeFileSync(path.join(root, 'desktop.config.json'), JSON.stringify(localConfig), 'utf8');

    const project = await loadDesktopConfig(path.join(root, 'desktop.config.json'), {
      platform: 'macos',
      env: {},
    });

    const realRoot = fs.realpathSync(root);
    expect(project.rootDir).toBe(realRoot);
    expect(project.driver.target).toEqual({ mode: 'attach', identity: 'com.example.Sample' });
    expect(project.sources['target.identity']).toBe('application.manifest:macos.bundleIdentifier');
    expect(project.tests.generatedDirectory).toBe(path.join(realRoot, 'desktop-tests', 'generated'));
    expect(toDesktopHostOptions(project)).toMatchObject({
      configPath: path.join(realRoot, 'src'),
      manifestPath: path.join(realRoot, 'desktop-tests', 'generated', 'story-tests.manifest.json'),
      port: 7007,
    });
  });

  it('lets a declared launch environment override select launch mode', async () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'desktop-project-config-'));
    fs.mkdirSync(path.join(root, 'src'));
    fs.writeFileSync(
      path.join(root, 'app.json'),
      JSON.stringify({ displayName: 'Sample', macos: { bundleIdentifier: 'com.example.Sample' } }),
      'utf8',
    );
    const localConfig = {
      ...config,
      storybook: { ...config.storybook, stories: [{ directory: './src', files: '**/*.stories.tsx' }] },
      tests: { ...config.tests, fakeScene: undefined },
    };
    fs.writeFileSync(path.join(root, 'desktop.config.json'), JSON.stringify(localConfig), 'utf8');

    const project = await loadDesktopConfig(path.join(root, 'desktop.config.json'), {
      platform: 'windows',
      env: { DESKTOP_TEST_APP: 'C:\\Sample\\App.exe' },
    });

    expect(project.driver.target).toEqual({ mode: 'launch', app: 'C:\\Sample\\App.exe' });
    expect(project.sources['target.mode']).toBe('environment:DESKTOP_TEST_APP');
    expect(project.sources['target.app']).toBe('environment:DESKTOP_TEST_APP');
  });

  it('loads a TypeScript config and rejects unknown keys', () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'desktop-project-config-'));
    fs.mkdirSync(path.join(root, 'src'));
    fs.writeFileSync(
      path.join(root, 'app.json'),
      JSON.stringify({ displayName: 'Sample', macos: { bundleIdentifier: 'com.example.Sample' } }),
      'utf8',
    );
    const localConfig = {
      ...config,
      storybook: { ...config.storybook, stories: [{ directory: './src', files: '**/*.stories.tsx' }] },
      tests: { ...config.tests, fakeScene: undefined },
    };
    fs.writeFileSync(path.join(root, 'desktop.config.ts'), `export default ${JSON.stringify(localConfig)};\n`, 'utf8');

    expect(loadDesktopConfig(path.join(root, 'desktop.config.ts'), { platform: 'fake', env: {} }).platform).toBe('fake');
    fs.writeFileSync(path.join(root, 'desktop.config.mjs'), `export default ${JSON.stringify(localConfig)};\n`, 'utf8');
    expect(loadDesktopConfig(path.join(root, 'desktop.config.mjs'), { platform: 'windows', env: {} }).platform).toBe('windows');

    fs.writeFileSync(path.join(root, 'desktop.config.json'), JSON.stringify({ ...localConfig, unsupportedOption: true }), 'utf8');
    expect(() => loadDesktopConfig(path.join(root, 'desktop.config.json'), { platform: 'fake', env: {} })).toThrow(
      /unsupportedOption is not supported/,
    );
  });

  it('rejects external output directories and invalid channel ports', () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'desktop-project-config-'));
    fs.mkdirSync(path.join(root, 'src'));
    fs.writeFileSync(
      path.join(root, 'app.json'),
      JSON.stringify({ displayName: 'Sample', macos: { bundleIdentifier: 'com.example.Sample' } }),
      'utf8',
    );
    const invalid = {
      ...config,
      storybook: {
        ...config.storybook,
        stories: [{ directory: './src', files: '**/*.stories.tsx' }],
        channel: { port: 70_000 },
      },
      tests: { ...config.tests, fakeScene: undefined, generatedDirectory: '../generated' },
    };
    fs.writeFileSync(path.join(root, 'desktop.config.json'), JSON.stringify(invalid), 'utf8');

    expect(() => loadDesktopConfig(path.join(root, 'desktop.config.json'), { platform: 'fake', env: {} })).toThrow(
      /storybook.channel.port must be an integer|generatedDirectory must stay inside/,
    );
  });

  it('projects only generated and manifest-linked specs into WDIO', () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'desktop-project-config-'));
    fs.mkdirSync(path.join(root, 'src'));
    fs.writeFileSync(
      path.join(root, 'app.json'),
      JSON.stringify({ displayName: 'Sample', macos: { bundleIdentifier: 'com.example.Sample' } }),
      'utf8',
    );
    const localConfig = {
      ...config,
      storybook: { ...config.storybook, stories: [{ directory: './src', files: '**/*.stories.tsx' }] },
      tests: { ...config.tests, fakeScene: undefined },
    };
    fs.writeFileSync(path.join(root, 'desktop.config.json'), JSON.stringify(localConfig), 'utf8');
    const project = loadDesktopConfig(path.join(root, 'desktop.config.json'), { platform: 'fake', env: {} });
    const generated = path.join(root, 'desktop-tests', 'generated');
    fs.mkdirSync(generated, { recursive: true });
    fs.writeFileSync(path.join(generated, 'story-plans.generated.spec.ts'), '', 'utf8');
    fs.writeFileSync(path.join(root, 'src', 'button.desktop.spec.ts'), "describe('[story:button--interaction]', () => {});\n", 'utf8');
    fs.writeFileSync(path.join(root, 'src', 'unreferenced.desktop.spec.ts'), "throw new Error('must not execute');\n", 'utf8');
    fs.writeFileSync(path.join(root, 'src', 'button.stories.tsx'), '', 'utf8');
    const manifest: StoryTestManifest = {
      version: 1,
      generatedAt: new Date().toISOString(),
      configDigest: project.configFingerprint,
      digest: '',
      entries: [
        {
          storyId: 'button--default',
          title: 'Button',
          name: 'Default',
          tag: '[story:button--default]',
          spec: 'story-plans.generated.spec.ts',
          grep: '\\[story:button--default\\]',
          plan: { kind: 'inline', id: 'button-default', steps: [] },
          storyPath: '../../src/button.stories.tsx',
        },
        {
          storyId: 'button--interaction',
          title: 'Button',
          name: 'Interaction',
          tag: '[story:button--interaction]',
          spec: '../../src/button.desktop.spec.ts',
          grep: '\\[story:button--interaction\\]',
          plan: { kind: 'spec', id: 'button-interaction', spec: './button.desktop.spec.ts' },
          storyPath: '../../src/button.stories.tsx',
        },
      ],
    };
    manifest.digest = digestEntries(manifest.entries, generated, manifest.configDigest);
    fs.writeFileSync(path.join(generated, 'story-tests.manifest.json'), JSON.stringify(manifest), 'utf8');

    const options = toDesktopWdioOptions(project);
    expect(options.specs).toEqual([
      path.join(project.rootDir, 'desktop-tests', 'generated', 'story-plans.generated.spec.ts'),
      path.join(project.rootDir, 'src', 'button.desktop.spec.ts'),
    ]);
    expect(createDesktopWdioConfig(options).specs).toEqual([options.specs]);
    expect(JSON.stringify(createDesktopWdioConfig(options).specs)).not.toContain('unreferenced.desktop.spec.ts');
  });
});
