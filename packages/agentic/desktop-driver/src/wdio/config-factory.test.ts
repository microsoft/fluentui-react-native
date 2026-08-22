import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';

import { assertSharedSpecs, readStoryManifestDigest } from './config-factory.ts';
import { digestEntries } from '../storybook/manifest.ts';
import type { StoryTestManifest } from '../types.ts';

describe('desktop WebdriverIO configuration', () => {
  it('expands shared-spec globs before rejecting platform-specific files', () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'desktop-driver-config-'));
    fs.mkdirSync(path.join(root, 'specs', 'windows'), { recursive: true });
    fs.writeFileSync(path.join(root, 'specs', 'button.desktop.spec.ts'), '', 'utf8');
    fs.writeFileSync(path.join(root, 'specs', 'windows', 'button.desktop.spec.ts'), '', 'utf8');

    expect(() => assertSharedSpecs(['specs/**/*.desktop.spec.ts'], root)).toThrow(/specs\/windows\/button.desktop.spec.ts/);
  });

  it.each(['windows', 'macos', 'darwin', 'win32'])('ignores platform names in the checkout path: %s', (platformName) => {
    const parent = fs.mkdtempSync(path.join(os.tmpdir(), `desktop-driver-${platformName}-`));
    const root = path.join(parent, 'project');
    fs.mkdirSync(path.join(root, 'specs'), { recursive: true });
    fs.writeFileSync(path.join(root, 'specs', 'button.desktop.spec.ts'), '', 'utf8');

    expect(() => assertSharedSpecs([path.join(root, 'specs', '*.desktop.spec.ts')], root)).not.toThrow();
  });

  it('verifies manifest executable content before returning its digest', () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'desktop-driver-config-'));
    const spec = path.join(root, 'button.desktop.spec.ts');
    fs.writeFileSync(spec, "describe('[story:button--default]', () => { it('works', () => undefined); });\n", 'utf8');
    const manifest: StoryTestManifest = {
      version: 1,
      generatedAt: new Date().toISOString(),
      digest: '',
      entries: [
        {
          storyId: 'button--default',
          title: 'Button',
          name: 'Default',
          tag: '[story:button--default]',
          spec,
          grep: '\\[story:button--default\\]',
          plan: { kind: 'spec', id: 'button-default', spec: './button.desktop.spec.ts' },
          storyPath: path.join(root, 'button.stories.tsx'),
        },
      ],
    };
    manifest.digest = digestEntries(manifest.entries);
    const manifestPath = path.join(root, 'manifest.json');
    fs.writeFileSync(manifestPath, JSON.stringify(manifest), 'utf8');

    expect(readStoryManifestDigest(manifestPath)).toBe(manifest.digest);
    fs.appendFileSync(spec, '// tampered\n', 'utf8');
    expect(() => readStoryManifestDigest(manifestPath)).toThrow(/Stale or tampered/);
  });
});
