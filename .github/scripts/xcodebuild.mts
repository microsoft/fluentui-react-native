#!/usr/bin/env node
import { $ } from 'zx';
import path from 'node:path';
import { parseArgs } from 'node:util';

$.verbose = true;

const { positionals } = parseArgs({ allowPositionals: true });
const [workspace, sdk, scheme, action, ...extra] = positionals;

if (!workspace || !sdk || !scheme || !action) {
  console.error('Usage: xcodebuild.mts <workspace> <sdk> <scheme> <action> [...args]');
  process.exit(1);
}

async function getDestination(): Promise<string[]> {
  const isTest = action === 'test' || action === 'test-without-building';

  if (sdk === 'iphoneos' || sdk === 'iphonesimulator') {
    if (isTest) {
      const devices = (await $`xcrun simctl list devices iPhone available`).stdout;
      const match = devices.match(/iPhone \d+ \(([-0-9A-Fa-f]+)\)/);
      if (!match) throw new Error('No available iPhone simulator found');
      return ['-destination', `platform=iOS Simulator,id=${match[1]}`];
    }
    return ['-destination', 'generic/platform=iOS Simulator'];
  }

  if (sdk === 'macosx') {
    return [];
  }

  if (sdk === 'xros' || sdk === 'xrsimulator') {
    if (isTest) {
      const devices = (await $`xcrun simctl list devices visionOS available`).stdout;
      const match = devices.match(/Apple Vision Pro \(([-0-9A-Fa-f]+)\)/);
      if (!match) throw new Error('No available visionOS simulator found');
      return ['-destination', `platform=visionOS Simulator,id=${match[1]}`];
    }
    return ['-destination', 'generic/platform=visionOS Simulator'];
  }

  throw new Error(`Cannot detect sdk: ${sdk}`);
}

async function setupCcache(): Promise<void> {
  if (!(await $`command -v ccache`.nothrow()).stdout) {
    await $`brew install ccache`;
  }

  const ccachePath = (await $`which ccache`).stdout.trim();
  const ccacheHome = path.join(path.dirname(path.dirname(ccachePath)), 'opt', 'ccache');
  const repoRoot = (await $`git rev-parse --show-toplevel`).stdout.trim();

  process.env.CCACHE_DIR = path.join(repoRoot, '.ccache');
  process.env.CC = path.join(ccacheHome, 'libexec', 'clang');
  process.env.CXX = path.join(ccacheHome, 'libexec', 'clang++');
  process.env.CMAKE_C_COMPILER_LAUNCHER = ccachePath;
  process.env.CMAKE_CXX_COMPILER_LAUNCHER = ccachePath;

  await $`ccache --zero-stats`.quiet();
}

const destination = await getDestination();
const derivedDataPath = path.join(path.dirname(workspace), 'build');
const useCcache = process.env.CCACHE_DISABLE !== '1';

if (useCcache) {
  await setupCcache();
}

if (!(await $`command -v xcbeautify`.nothrow()).stdout) {
  await $`brew install xcbeautify`;
}

const xcodebuildArgs = [
  '-workspace',
  workspace,
  '-scheme',
  scheme,
  '-sdk',
  sdk,
  ...destination,
  '-derivedDataPath',
  derivedDataPath,
  'CODE_SIGNING_ALLOWED=NO',
  'COMPILER_INDEX_STORE_ENABLE=NO',
  action,
  ...extra,
];

// Pipe xcodebuild through xcbeautify
await $`xcodebuild ${xcodebuildArgs} | xcbeautify --report junit`;

if (useCcache) {
  await $`ccache --show-stats --verbose`;
}
