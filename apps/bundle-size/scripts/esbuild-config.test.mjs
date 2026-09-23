import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { createEsbuildOptions, externalPackages, getResolveExtensions } from './esbuild-config.mjs';

describe('getResolveExtensions', () => {
  it('prefers the requested platform, then native, then generic modules', () => {
    assert.deepEqual(getResolveExtensions('windows'), [
      '.windows.tsx',
      '.windows.ts',
      '.windows.jsx',
      '.windows.js',
      '.native.tsx',
      '.native.ts',
      '.native.jsx',
      '.native.js',
      '.tsx',
      '.ts',
      '.jsx',
      '.js',
      '.mjs',
      '.cjs',
      '.json',
    ]);
  });
});

describe('createEsbuildOptions', () => {
  it('uses React Native package conditions and externalizes runtime packages and subpaths', () => {
    const options = createEsbuildOptions({
      bundlePath: '/fixture/output.js',
      entryPath: '/fixture/input.js',
      platform: 'macos',
      workspaceRoot: '/fixture',
    });

    assert.deepEqual(options.conditions, ['react-native']);
    assert.deepEqual(options.mainFields, ['react-native', 'module', 'main']);
    assert.deepEqual(
      options.external,
      externalPackages.flatMap((packageName) => [packageName, `${packageName}/*`]),
    );
  });
});
