import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import {
  acquireDirectoryLock,
  canonicalJson,
  compareOrdinal,
  defaultNativeDriverCacheRoot,
  hashFiles,
  hashTree,
  listFiles,
  resolveNativeDriverCacheRoot,
} from './filesystem';

let scratch: string;

beforeEach(() => {
  scratch = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'furn-native-filesystem-')));
});

afterEach(() => {
  jest.restoreAllMocks();
  fs.rmSync(scratch, { force: true, maxRetries: 10, recursive: true, retryDelay: 50 });
});

function ageLock(lockPath: string, ageMs = 10 * 60_000): void {
  const old = new Date(Date.now() - ageMs);
  for (const name of ['heartbeat', 'owner.json']) {
    if (fs.existsSync(path.join(lockPath, name))) {
      fs.utimesSync(path.join(lockPath, name), old, old);
    }
  }
  fs.utimesSync(lockPath, old, old);
}

function writeOwner(lockPath: string, owner: { hostname: string; pid: number }): void {
  fs.mkdirSync(lockPath);
  fs.writeFileSync(path.join(lockPath, 'owner.json'), JSON.stringify(owner));
  fs.writeFileSync(path.join(lockPath, 'heartbeat'), 'old');
  ageLock(lockPath);
}

describe('directory lock', () => {
  test('reclaims an ownerless lock directory once it is stale', async () => {
    const lockPath = path.join(scratch, 'lock');
    fs.mkdirSync(lockPath);
    ageLock(lockPath);

    const lock = await acquireDirectoryLock(lockPath, undefined, { timeoutMs: 1_000 });
    expect(fs.existsSync(path.join(lockPath, 'owner.json'))).toBe(true);
    lock.release();
    expect(fs.existsSync(lockPath)).toBe(false);
  });

  test('does not reclaim a fresh ownerless directory that a holder is still initializing', async () => {
    const lockPath = path.join(scratch, 'lock');
    fs.mkdirSync(lockPath);

    await expect(acquireDirectoryLock(lockPath, undefined, { maxWaitMs: 300 })).rejects.toThrow(/Timed out/);
    expect(fs.existsSync(lockPath)).toBe(true);
  });

  test('removes the lock directory when its owner record cannot be written', async () => {
    const lockPath = path.join(scratch, 'lock');
    jest.spyOn(fs, 'writeFileSync').mockImplementationOnce(() => {
      throw Object.assign(new Error('disk full'), { code: 'ENOSPC' });
    });

    await expect(acquireDirectoryLock(lockPath)).rejects.toThrow('disk full');
    expect(fs.existsSync(lockPath)).toBe(false);

    const lock = await acquireDirectoryLock(lockPath);
    lock.release();
  });

  test('keeps waiting on a holder that heartbeats beyond the idle timeout, then acquires', async () => {
    const lockPath = path.join(scratch, 'lock');
    const holder = await acquireDirectoryLock(lockPath, undefined, { heartbeatIntervalMs: 25 });
    const release = setTimeout(() => holder.release(), 1_000);
    try {
      const lock = await acquireDirectoryLock(lockPath, undefined, { staleAfterMs: 500, timeoutMs: 300 });
      lock.release();
    } finally {
      clearTimeout(release);
      holder.release();
    }
  });

  test('bounds the total wait even while the holder stays live', async () => {
    const lockPath = path.join(scratch, 'lock');
    const holder = await acquireDirectoryLock(lockPath, undefined, { heartbeatIntervalMs: 25 });
    try {
      await expect(acquireDirectoryLock(lockPath, undefined, { maxWaitMs: 400, staleAfterMs: 5_000, timeoutMs: 100 })).rejects.toThrow(
        /Timed out/,
      );
    } finally {
      holder.release();
    }
  });

  test('stops waiting when aborted', async () => {
    const lockPath = path.join(scratch, 'lock');
    const holder = await acquireDirectoryLock(lockPath);
    try {
      const controller = new AbortController();
      const waiting = acquireDirectoryLock(lockPath, controller.signal);
      setTimeout(() => controller.abort(), 100);
      await expect(waiting).rejects.toMatchObject({ name: 'AbortError' });
    } finally {
      holder.release();
    }
  });

  test('reclaims a stale lock whose owner process has exited on this host', async () => {
    const lockPath = path.join(scratch, 'lock');
    const exited = spawnSync(process.execPath, ['-e', '']);
    expect(exited.pid).toBeGreaterThan(0);
    writeOwner(lockPath, { hostname: os.hostname(), pid: exited.pid });

    const lock = await acquireDirectoryLock(lockPath, undefined, { timeoutMs: 1_000 });
    lock.release();
  });

  test.each([
    ['a live process on this host', os.hostname()],
    ['another host', 'another-host.invalid'],
  ])('does not reclaim a stale lock held by %s', async (_label, hostname) => {
    const lockPath = path.join(scratch, 'lock');
    writeOwner(lockPath, { hostname, pid: process.pid });

    await expect(acquireDirectoryLock(lockPath, undefined, { maxWaitMs: 400, timeoutMs: 200 })).rejects.toThrow(/Timed out/);
    expect(fs.existsSync(path.join(lockPath, 'owner.json'))).toBe(true);
  });
});

describe('ordinal ordering and hashing', () => {
  test('orders by code point, independent of locale', () => {
    expect(['b', 'B', 'a', 'é', 'Z'].sort(compareOrdinal)).toEqual(['B', 'Z', 'a', 'b', 'é']);
    expect(compareOrdinal('\u{1F600}', '\uFFFD')).toBeGreaterThan(0);
    expect(canonicalJson({ b: 1, B: 2, a: 3 })).toBe('{"B":2,"a":3,"b":1}');
  });

  test('hashes named files independent of listing order and lists in code-point order', () => {
    fs.mkdirSync(path.join(scratch, 'src'));
    fs.writeFileSync(path.join(scratch, 'a.txt'), 'a');
    fs.writeFileSync(path.join(scratch, 'B.txt'), 'b');
    fs.writeFileSync(path.join(scratch, 'src', 'c.txt'), 'c');

    expect(hashFiles(scratch, ['src/c.txt', 'a.txt', 'B.txt'])).toBe(hashFiles(scratch, ['B.txt', 'a.txt', 'src/c.txt']));
    expect(hashTree(scratch)).toBe(hashFiles(scratch, ['B.txt', 'a.txt', 'src/c.txt']));
    expect(listFiles(scratch).map((filePath) => path.relative(scratch, filePath))).toEqual(['B.txt', 'a.txt', path.join('src', 'c.txt')]);
  });

  test('fails on a symbolic link that would be a declared input and skips the rest', () => {
    fs.writeFileSync(path.join(scratch, 'real.swift'), 'real');
    fs.symlinkSync(path.join(scratch, 'missing'), path.join(scratch, '.#editor-lock'));
    expect(listFiles(scratch, { rejectSymbolicLink: (filePath) => filePath.endsWith('.swift') })).toEqual([
      path.join(scratch, 'real.swift'),
    ]);

    fs.symlinkSync(path.join(scratch, 'real.swift'), path.join(scratch, 'alias.swift'));
    expect(() => listFiles(scratch, { rejectSymbolicLink: (filePath) => filePath.endsWith('.swift') })).toThrow(/symbolic link/);
  });
});

describe('native driver cache root', () => {
  const codeOf = (action: () => unknown): unknown => {
    try {
      action();
    } catch (error) {
      return (error as { code?: unknown }).code;
    }
    return undefined;
  };

  test.each([
    ['the package root', () => ''],
    ['a directory inside the package', () => path.join('build', 'native')],
  ])('rejects %s', (_label, relative) => {
    const packageRoot = path.join(scratch, 'package');
    fs.mkdirSync(packageRoot);
    expect(codeOf(() => resolveNativeDriverCacheRoot(path.join(packageRoot, relative()), packageRoot))).toBe('invalid-configuration');
  });

  test.each([
    ['node_modules', path.join('project', 'node_modules', '.cache', 'native')],
    ['a pnpm virtual store', path.join('project', 'node_modules', '.pnpm', 'native')],
    ['a pnpm store', path.join('home', '.pnpm-store', 'v3')],
    ['a pnpm data directory store', path.join('home', 'pnpm', 'store', 'v3')],
  ])('rejects a root inside %s', (_label, relative) => {
    expect(codeOf(() => resolveNativeDriverCacheRoot(path.join(scratch, relative), path.join(scratch, 'package')))).toBe(
      'invalid-configuration',
    );
  });

  test('rejects a root that reaches node_modules or the package through a link', () => {
    const packageRoot = path.join(scratch, 'package');
    fs.mkdirSync(path.join(packageRoot, 'node_modules'), { recursive: true });
    fs.symlinkSync(path.join(packageRoot, 'node_modules'), path.join(scratch, 'link'), 'junction');

    expect(codeOf(() => resolveNativeDriverCacheRoot(path.join(scratch, 'link', 'cache'), packageRoot))).toBe('invalid-configuration');
    expect(codeOf(() => resolveNativeDriverCacheRoot(path.join(scratch, 'link'), path.join(scratch, 'elsewhere')))).toBe(
      'invalid-configuration',
    );
  });

  test('accepts a sibling whose name merely starts like the package and the default root', () => {
    const packageRoot = path.join(scratch, 'package');
    fs.mkdirSync(packageRoot);
    const sibling = path.join(scratch, 'package-cache', 'native');

    expect(resolveNativeDriverCacheRoot(sibling, packageRoot)).toBe(sibling);
    expect(resolveNativeDriverCacheRoot(undefined, packageRoot)).toBe(path.resolve(defaultNativeDriverCacheRoot()));
  });
});
