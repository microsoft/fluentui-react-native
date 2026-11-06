import { validateDesktopCaseOptions } from '@fluentui-react-native/desktop-driver/authoring';
import type { DesktopStoryManifest } from '@fluentui-react-native/desktop-driver';

import { missingRequirements, resolveCaseClickMode, selectWdioCases, selectWdioStories } from './runWdioTests.js';

describe('WDIO input lane selection', () => {
  const manifest: DesktopStoryManifest = {
    endpoint: 'win32',
    entries: [
      {
        id: 'button',
        name: 'Button',
        packageName: 'components',
        sourcePath: 'button.stories.tsx',
        tags: ['story'],
        title: 'Button',
        wdio: {
          digest: 'digest',
          exportName: 'Default',
          testNames: ['adaptive', 'accessible', 'win32-only'],
          cases: [
            { name: 'adaptive', options: validateDesktopCaseOptions({ requires: ['click'] }) },
            { name: 'accessible', options: validateDesktopCaseOptions({ requires: ['accessibility-click'] }) },
            { name: 'win32-only', options: validateDesktopCaseOptions({ platforms: ['win32'] }) },
          ],
        },
      },
    ],
    platformManifestDigest: 'digest',
    portablePlanDigest: 'digest',
    schemaVersion: 1,
  };

  test('selects by modality and target platform', () => {
    expect(selectWdioStories(manifest, { input: 'accessible' }, 'win32').map(({ id }) => id)).toEqual(['button']);
    expect(selectWdioCases(manifest.entries[0], { input: 'accessible' }, 'win32')?.map(({ name }) => name)).toEqual([
      'adaptive',
      'accessible',
      'win32-only',
    ]);
    expect(selectWdioCases(manifest.entries[0], {}, 'macos')?.map(({ name }) => name)).toEqual(['adaptive', 'accessible']);
    expect(selectWdioCases(manifest.entries[0], { input: 'physical' }, 'win32')?.map(({ name }) => name)).toEqual([
      'adaptive',
      'win32-only',
    ]);
    expect(selectWdioCases(manifest.entries[0], { input: 'physical', test: 'accessible' }, 'macos')).toEqual([]);
    expect(selectWdioCases(manifest.entries[0], { input: 'physical', test: 'win32-only' }, 'macos')).toEqual([]);
  });

  test('rejects legacy callback entries in a lane', () => {
    const legacy = {
      ...manifest,
      entries: [{ ...manifest.entries[0], wdio: { digest: 'legacy', exportName: 'Default', testNames: ['legacy'] } }],
    } satisfies DesktopStoryManifest;
    expect(() => selectWdioStories(legacy, { input: 'physical' }, 'win32')).toThrow('declare it with desktopIt');
  });

  test('adapts click requirements to each lane without fallback', () => {
    const descriptor = validateDesktopCaseOptions({ requires: ['click'] });
    const accessibleMode = resolveCaseClickMode(descriptor, 'auto', 'accessible');
    const physicalMode = resolveCaseClickMode(descriptor, 'auto', 'physical');
    expect(accessibleMode).toBe('accessibility');
    expect(physicalMode).toBe('physical');
    expect(missingRequirements(descriptor, { accessibilityClick: true, physicalClick: false }, physicalMode)).toEqual(['click']);
    expect(missingRequirements(descriptor, { accessibilityClick: false, physicalClick: true }, accessibleMode)).toEqual(['click']);
    expect(missingRequirements(descriptor, { accessibilityClick: true }, accessibleMode)).toEqual([]);
  });
});
