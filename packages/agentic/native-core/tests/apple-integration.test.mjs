import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { access, mkdir, mkdtemp, readFile, readdir, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

const exec = promisify(execFile);
const packageRoot = fileURLToPath(new URL('../', import.meta.url));
const appRoot = fileURLToPath(new URL('../../../../apps/storybook/macos/', import.meta.url));

async function compile(tool, args) {
  try {
    await exec('xcrun', [tool, ...args]);
  } catch (error) {
    throw new Error(`${tool} exited ${error.code}:\n${error.stderr ?? error.message}`);
  }
}

test(
  'Apple module and Office-style bridging-header integration',
  { skip: process.platform !== 'darwin' && 'Requires macOS and Xcode.' },
  async (t) => {
    const objects = path.join(
      appRoot,
      'DerivedData/Build/Intermediates.noindex/Pods.build/Debug/FRNNativeCore.build/Objects-normal',
      process.arch === 'arm64' ? 'arm64' : 'x86_64',
    );
    const sources = (await readFile(path.join(objects, 'FRNNativeCore.SwiftFileList'), 'utf8')).trim().split('\n');
    assert.ok(sources.length > 0, 'Build macOS Storybook before running the Apple integration probe.');
    const headers = path.join(appRoot, 'Pods/Headers/Public');
    const bridge = path.join(packageRoot, 'macos/components/Callout/paper/FRNCalloutManager.h');
    const output = await mkdtemp(path.join(tmpdir(), 'furn-apple-integration-'));
    try {
      const { stdout: sdkOutput } = await exec('xcrun', ['--sdk', 'macosx', '--show-sdk-path']);
      const sdk = sdkOutput.trim();
      const includePaths = (await readdir(headers)).filter((name) => name !== 'React').map((name) => path.join(headers, name));
      const bridgeHeaders = path.join(output, 'headers');
      await mkdir(bridgeHeaders);
      for (const include of includePaths) {
        await symlink(include, path.join(bridgeHeaders, path.basename(include)), 'dir');
      }
      await symlink(path.join(headers, 'React-Core/React'), path.join(bridgeHeaders, 'React'), 'dir');
      const includes = [bridgeHeaders, ...includePaths].flatMap((include) => ['-I', include]);
      const swift = [
        '-sdk',
        sdk,
        '-swift-version',
        '5',
        '-strict-concurrency=complete',
        '-warnings-as-errors',
        // RNmacOS 0.81.9's umbrella includes unrelated headers with these Clang diagnostics.
        '-Xcc',
        '-Wno-nullability-completeness',
        '-Xcc',
        '-Wno-property-attribute-mismatch',
        '-module-name',
        'FRNNativeCore',
        '-emit-module',
        '-emit-module-path',
        path.join(output, 'FRNNativeCore.swiftmodule'),
        '-emit-objc-header',
        '-emit-objc-header-path',
        path.join(output, 'FRNNativeCore-Swift.h'),
        ...includes,
      ];
      const clang = [
        '-isysroot',
        sdk,
        '-fobjc-arc',
        '-fmodules',
        '-Werror',
        '-Wunused-parameter',
        '-Wnonportable-include-path',
        '-Wno-nullability-completeness',
        '-fsyntax-only',
        ...includes,
        '-I',
        path.join(packageRoot, 'macos/shared'),
        '-I',
        output,
      ];
      await t.test('React module with strict Swift concurrency', async () => {
        await compile('swiftc', [
          ...swift,
          '-I',
          headers,
          '-Xcc',
          `-fmodule-map-file=${path.join(headers, 'React/React-Core.modulemap')}`,
          '-D',
          'USE_REACT_AS_MODULE',
          '-import-objc-header',
          bridge,
          ...sources,
        ]);
      });
      await t.test('No React module, emitted Swift header, and generated-type-free extern registrations', async () => {
        const moduleGuard = path.join(output, 'NoReactModule.swift');
        await writeFile(moduleGuard, '#if canImport(React)\n#error("The bridging probe must not resolve the React module.")\n#endif\n');
        await compile('swiftc', [...swift, '-import-objc-header', bridge, ...sources, moduleGuard]);
        await access(path.join(output, 'FRNNativeCore-Swift.h'));
        const headerProbe = path.join(output, 'SwiftHeader.m');
        await writeFile(headerProbe, '#import "FRNNativeCore-Swift.h"\n');
        await compile('clang', [...clang, '-include', bridge, headerProbe]);
        await compile('clang', [...clang, path.join(packageRoot, 'macos/components/Callout/paper/FRNCalloutManager.m')]);
        await compile('clang', [...clang, path.join(packageRoot, 'macos/components/FocusZone/paper/RCTFocusZoneManager.m')]);
      });
    } finally {
      await rm(output, { recursive: true, force: true });
    }
  },
);
