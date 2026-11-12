// Test-only support for the Windows native contracts. It builds the plain Win32 fixture in fixtures/win32 on demand into
// the external native cache (never at install time) and resolves the Windows helper those contracts drive.
import { execFile } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { promisify } from 'node:util';

import { resolveDisabledInputFeatures } from '../../hosts/native/NativeDesktopHost.js';
import type { NativeDisabledInputFeature } from '../../hosts/native/NativeDesktopHost.js';
import { acquireDirectoryLock, delay, hashTree, resolveNativeDriverCacheRoot, sha256 } from '../filesystem.js';
import { buildNativeDesktopDriver, FURN_DESKTOP_DRIVER_CACHE_ROOT } from '../nativeDriver.js';
import { nativeDriverPackageRoot } from '../packageRoot.cjs';
import type { NativeDriverArtifact } from '../types.js';
import { probeWindowsToolchain } from './buildWindowsDriver.js';

const execFileAsync = promisify(execFile);
const fixtureRoot = path.join(nativeDriverPackageRoot, 'fixtures', 'win32');
const megabyte = 1024 * 1024;

let helperArtifactPromise: Promise<NativeDriverArtifact> | undefined;
let fixtureExecutablePromise: Promise<string> | undefined;

const disabledInputFeatures = resolveDisabledInputFeatures();

/**
 * Selects `test` for a Windows native contract scenario, or `test.skip` when this runner cannot host it. Scenarios run
 * only on Windows with FURN_NATIVE_DRIVER_TEST=1. A runner that disables input features through the host policy
 * (GitHub-hosted CI) skips scenarios needing them. Such a runner has no interactive desktop, and Windows Graphics
 * Capture cannot create a capture item there, so `capture` scenarios skip when the policy disables any input feature.
 */
export function windowsContractTest(...requirements: (NativeDisabledInputFeature | 'capture')[]): jest.It {
  if (process.platform !== 'win32' || process.env.FURN_NATIVE_DRIVER_TEST !== '1') {
    return test.skip;
  }
  const unavailable = requirements.some((requirement) =>
    requirement === 'capture' ? disabledInputFeatures.size > 0 : disabledInputFeatures.has(requirement),
  );
  return unavailable ? test.skip : test;
}

export function helperArtifact(): Promise<NativeDriverArtifact> {
  helperArtifactPromise ??= buildNativeDesktopDriver({ platform: 'windows' });
  return helperArtifactPromise;
}

export function fixtureExecutable(): Promise<string> {
  fixtureExecutablePromise ??= buildFixture();
  return fixtureExecutablePromise;
}

async function buildFixture(): Promise<string> {
  const toolchain = await probeWindowsToolchain();
  const cacheRoot = resolveNativeDriverCacheRoot(process.env[FURN_DESKTOP_DRIVER_CACHE_ROOT], nativeDriverPackageRoot);
  const digest = sha256(`${hashTree(fixtureRoot)}:${toolchain.fingerprint}`).slice(0, 20);
  const publishedRoot = path.join(cacheRoot, 'v1', 'fixtures', 'win32', digest);
  const executable = path.join(publishedRoot, 'furn-win32-fixture.exe');
  if (fs.existsSync(executable)) {
    return executable;
  }

  const lockRoot = path.join(cacheRoot, 'v1', 'locks');
  const stagingParent = path.join(cacheRoot, 'v1', 'staging');
  fs.mkdirSync(lockRoot, { recursive: true });
  fs.mkdirSync(stagingParent, { recursive: true });
  const lock = await acquireDirectoryLock(path.join(lockRoot, `fixture-win32-${digest}`));
  try {
    if (!fs.existsSync(executable)) {
      // MSBuild's tracking files still use MAX_PATH on long-path hosts, so the staging path stays short.
      const stagingRoot = fs.mkdtempSync(path.join(stagingParent, `fixture-${digest.slice(0, 8)}-`));
      try {
        const outputRoot = path.join(stagingRoot, 'bin');
        fs.mkdirSync(outputRoot);
        await runMsbuild(toolchain.msbuildPath, [
          path.join(fixtureRoot, 'Win32Fixture.vcxproj'),
          '-nologo',
          '-m',
          '-restore:false',
          '-v:minimal',
          '/p:Configuration=Release',
          '/p:Platform=x64',
          `/p:PlatformToolset=${toolchain.platformToolset}`,
          `/p:WindowsTargetPlatformVersion=${toolchain.sdkVersion}`,
          `/p:OutDir=${outputRoot}${path.sep}`,
          `/p:IntDir=${path.join(stagingRoot, 'obj')}${path.sep}`,
        ]);
        fs.mkdirSync(path.dirname(publishedRoot), { recursive: true });
        fs.rmSync(publishedRoot, { force: true, recursive: true });
        fs.renameSync(outputRoot, publishedRoot);
      } finally {
        fs.rmSync(stagingRoot, { force: true, recursive: true });
      }
    }
  } finally {
    lock.release();
  }
  if (!fs.existsSync(executable)) {
    throw new Error(`Building the Win32 fixture did not produce "${executable}".`);
  }
  return executable;
}

async function runMsbuild(msbuildPath: string, args: string[]): Promise<void> {
  try {
    await execFileAsync(msbuildPath, args, { maxBuffer: 32 * megabyte, timeout: 10 * 60 * 1000, windowsHide: true });
  } catch (error) {
    const output = (error as { stdout?: string }).stdout ?? '';
    throw new Error(`MSBuild failed to build the Win32 fixture.\n${output}`.trim(), { cause: error });
  }
}

export function required<T>(value: T | undefined, description: string): T {
  if (value === undefined) {
    throw new Error(`Expected ${description}.`);
  }
  return value;
}

export async function waitFor<T>(
  description: string,
  read: () => Promise<T | false | undefined>,
  { intervalMs = 10, timeoutMs = 5_000 }: { intervalMs?: number; timeoutMs?: number } = {},
): Promise<T> {
  const deadline = Date.now() + timeoutMs;
  for (;;) {
    const value = await read();
    if (value) {
      return value;
    }
    if (Date.now() >= deadline) {
      throw new Error(`Timed out after ${timeoutMs} ms waiting for ${description}.`);
    }
    await delay(intervalMs);
  }
}
