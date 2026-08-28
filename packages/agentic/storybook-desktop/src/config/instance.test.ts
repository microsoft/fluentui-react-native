import path from 'node:path';

import { createDesktopStorybookInstance } from './instance';

const storybookRoot = path.resolve(__dirname, '../../../../../apps/storybook');
const packageRoot = path.resolve(__dirname, '../..');

describe('createDesktopStorybookInstance', () => {
  test('creates a stable identity for the canonical project root', () => {
    const first = createDesktopStorybookInstance({
      projectRoot: storybookRoot,
      bundleIdentifierPrefix: 'com.microsoft.fluentui.agenticstorybook',
    });
    const second = createDesktopStorybookInstance({
      projectRoot: path.join(storybookRoot, '.'),
      bundleIdentifierPrefix: 'com.microsoft.fluentui.agenticstorybook',
    });

    expect(first).toEqual(second);
    expect(first.bundleIdentifier).toBe(`com.microsoft.fluentui.agenticstorybook.i${first.id}`);
    expect(first.id).toMatch(/^[a-f0-9]{10}$/);
    expect(first.storybookPort).toBeGreaterThanOrEqual(17_000);
    expect(first.storybookPort).toBeLessThan(27_000);
    expect(first.metroPort).toBeGreaterThanOrEqual(27_000);
    expect(first.metroPort).toBeLessThan(37_000);
    expect(first.driverPort).toBeGreaterThanOrEqual(37_000);
    expect(first.driverPort).toBeLessThan(47_000);
  });

  test('disambiguates separate project roots', () => {
    const storybookInstance = createDesktopStorybookInstance({ projectRoot: storybookRoot });
    const packageInstance = createDesktopStorybookInstance({ projectRoot: packageRoot });

    expect(storybookInstance.id).not.toBe(packageInstance.id);
    expect(storybookInstance.bundleIdentifier).not.toBe(packageInstance.bundleIdentifier);
    expect([storybookInstance.storybookPort, storybookInstance.metroPort, storybookInstance.driverPort]).not.toEqual([
      packageInstance.storybookPort,
      packageInstance.metroPort,
      packageInstance.driverPort,
    ]);
  });

  test('rejects invalid bundle identifier prefixes', () => {
    expect(() =>
      createDesktopStorybookInstance({
        projectRoot: storybookRoot,
        bundleIdentifierPrefix: 'not a bundle identifier',
      }),
    ).toThrow('Invalid macOS bundle identifier prefix');
  });
});
