import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const packageRoot = path.resolve(__dirname, '..');
const repoRoot = path.resolve(packageRoot, '../../..');
const fixtureRoot = path.join(packageRoot, 'fixtures/neutral-boundary');
const loaderPath = path.join(fixtureRoot, 'loader.mjs');
const neutralPackages = ['packages/agentic/desktop-driver', 'packages/agentic/desktop-test', 'packages/agentic/desktop-driver-mcp'];

type PackageManifest = {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  optionalDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
};

const forbiddenPackages = new Set(['react', 'react-dom', 'react-native', 'storybook', '@types/react', '@types/react-native']);

function packageName(specifier: string): string {
  const segments = specifier.split('/');
  return specifier.startsWith('@') ? segments.slice(0, 2).join('/') : segments[0];
}

function isForbiddenPackage(specifier: string): boolean {
  const name = packageName(specifier);
  return (
    forbiddenPackages.has(name) ||
    name.startsWith('@react-native/') ||
    name.startsWith('@storybook/') ||
    name.startsWith('@fluentui-react-native/storybook-') ||
    name.startsWith('storybook-')
  );
}

function declaredForbiddenPackages(manifest: PackageManifest): string[] {
  return Object.values(manifest)
    .flatMap((dependencies) => Object.keys(dependencies ?? {}))
    .filter(isForbiddenPackage)
    .sort();
}

function runNode(entry: string): ReturnType<typeof spawnSync> {
  return spawnSync(process.execPath, ['--experimental-loader', pathToFileURL(loaderPath).href, entry], {
    cwd: fixtureRoot,
    encoding: 'utf8',
  });
}

describe('application-neutral desktop package boundaries', () => {
  test.each(neutralPackages)('%s declares no React, React Native, or Storybook dependency', (relativePackage) => {
    const manifest = JSON.parse(readFileSync(path.join(repoRoot, relativePackage, 'package.json'), 'utf8')) as PackageManifest;
    expect(declaredForbiddenPackages(manifest)).toEqual([]);
  });

  test('detects prohibited package dependencies in the negative manifest fixture', () => {
    const manifest = JSON.parse(readFileSync(path.join(fixtureRoot, 'negative-dependencies/manifest.json'), 'utf8')) as PackageManifest;
    expect(declaredForbiddenPackages(manifest)).toEqual(['@storybook/react', 'react', 'react-native']);
  });

  test.each(['react', 'react-native', 'storybook'])('rejects a real %s import in the negative fixture', (packageName) => {
    const entry = path.join(fixtureRoot, `negative-imports/${packageName}.mjs`);
    const result = runNode(entry);

    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain(
      `Neutral package boundary rejected forbidden import: ${packageName === 'storybook' ? '@storybook/react' : packageName}`,
    );
  });

  test('runs a standalone consumer through public entries without Storybook', () => {
    const consumer = path.join(fixtureRoot, 'standalone-consumer.mjs');
    const result = runNode(consumer);

    expect(result.status).toBe(0);
    expect(result.stdout?.toString().trim()).toBe('standalone-consumer-ok');
    expect(result.stderr?.toString()).not.toContain('Neutral package boundary rejected');
  });
});
