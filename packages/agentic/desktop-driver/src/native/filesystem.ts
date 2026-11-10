import { createHash, randomUUID } from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { NativeDriverError } from './NativeDriverError.js';

type JsonValue = boolean | null | number | string | JsonValue[] | { [key: string]: JsonValue };

export function sha256(value: string | Uint8Array): string {
  return createHash('sha256').update(value).digest('hex');
}

/** Orders strings by code point. Unlike `localeCompare`, the order and every digest built from it ignore the locale. */
export function compareOrdinal(left: string, right: string): number {
  return Buffer.compare(Buffer.from(left, 'utf8'), Buffer.from(right, 'utf8'));
}

export function canonicalJson(value: JsonValue): string {
  if (Array.isArray(value)) {
    return `[${value.map(canonicalJson).join(',')}]`;
  }
  if (value && typeof value === 'object') {
    return `{${Object.entries(value)
      .sort(([left], [right]) => compareOrdinal(left, right))
      .map(([key, entry]) => `${JSON.stringify(key)}:${canonicalJson(entry)}`)
      .join(',')}}`;
  }
  return JSON.stringify(value);
}

export type ListFilesOptions = {
  /** Symbolic links are never listed. Return true for one that would be a declared input, so it fails instead of vanishing. */
  rejectSymbolicLink?: (filePath: string) => boolean;
};

export function listFiles(root: string, { rejectSymbolicLink }: ListFilesOptions = {}): string[] {
  const results: string[] = [];
  const visit = (directory: string) => {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const fullPath = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        visit(fullPath);
      } else if (entry.isFile()) {
        results.push(fullPath);
      } else if (entry.isSymbolicLink() && rejectSymbolicLink?.(fullPath)) {
        throw new NativeDriverError('build-source-missing', `Native driver source "${fullPath}" must not be a symbolic link.`);
      }
    }
  };
  visit(root);
  return results.sort(compareOrdinal);
}

/** Hashes the named files by their root-relative POSIX paths and contents, independent of host path separator and locale. */
export function hashFiles(root: string, relativePaths: readonly string[]): string {
  const entries = relativePaths
    .map((relativePath) => relativePath.replaceAll(path.sep, '/'))
    .sort(compareOrdinal)
    .map((relativePath) => ({ path: relativePath, sha256: sha256(fs.readFileSync(path.join(root, relativePath))) }));
  return sha256(canonicalJson(entries));
}

export function hashTree(root: string): string {
  return hashFiles(
    root,
    listFiles(root).map((filePath) => path.relative(root, filePath)),
  );
}

export function atomicWriteJson(filePath: string, value: unknown): void {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  const temporaryPath = `${filePath}.${process.pid}.${randomUUID()}.tmp`;
  fs.writeFileSync(temporaryPath, `${JSON.stringify(value, null, 2)}\n`);
  fs.renameSync(temporaryPath, filePath);
}

export function readJsonFile<T>(filePath: string): T {
  return JSON.parse(fs.readFileSync(filePath, 'utf8')) as T;
}

export function defaultNativeDriverCacheRoot(platform = process.platform): string {
  if (platform === 'win32') {
    const localAppData = process.env.LOCALAPPDATA;
    if (!localAppData) {
      throw new Error('LOCALAPPDATA is required to resolve the default Windows native driver cache.');
    }
    return path.join(localAppData, 'Microsoft', 'FluentUIReactNative', 'desktop-driver', 'native');
  }
  if (platform === 'darwin') {
    return path.join(os.homedir(), 'Library', 'Caches', 'com.microsoft.fluentui-react-native.desktop-driver', 'native');
  }
  return path.join(os.homedir(), '.cache', 'fluentui-react-native', 'desktop-driver', 'native');
}

/**
 * Resolves the directory that receives native build output. It must never be inside the package, `node_modules`, or a
 * pnpm store, so a conventional `node_modules/.cache` setting fails instead of writing under installed code.
 */
export function resolveNativeDriverCacheRoot(configured: string | undefined, packageRoot: string): string {
  const cacheRoot = path.resolve(configured ?? defaultNativeDriverCacheRoot());
  const packageRoots = [path.resolve(packageRoot), resolveExistingPrefix(packageRoot)];
  for (const candidate of [cacheRoot, resolveExistingPrefix(cacheRoot)]) {
    if (packageRoots.some((root) => isInsideDirectory(root, candidate)) || hasUnmanagedSegment(candidate)) {
      throw new NativeDriverError(
        'invalid-configuration',
        `The native driver cache root "${cacheRoot}" must not be inside the desktop-driver package, node_modules, or a pnpm store.`,
      );
    }
  }
  return cacheRoot;
}

const unmanagedDirectoryNames = new Set(['.pnpm', '.pnpm-store', 'node_modules', 'pnpm-store']);

function hasUnmanagedSegment(candidate: string): boolean {
  const segments = candidate.split(path.sep).map((segment) => segment.toLowerCase());
  return segments.some((segment, index) => unmanagedDirectoryNames.has(segment) || (segment === 'pnpm' && segments[index + 1] === 'store'));
}

function isInsideDirectory(root: string, candidate: string): boolean {
  const relative = path.relative(root, candidate);
  return relative === '' || (relative !== '..' && !relative.startsWith(`..${path.sep}`) && !path.isAbsolute(relative));
}

/** Resolves symbolic links in the longest existing prefix of a path that may not exist yet. */
function resolveExistingPrefix(target: string): string {
  const absolute = path.resolve(target);
  const missing: string[] = [];
  for (let current = absolute; ; current = path.dirname(current)) {
    try {
      return path.join(fs.realpathSync.native(current), ...[...missing].reverse());
    } catch (error) {
      const code = (error as NodeJS.ErrnoException).code;
      if ((code !== 'ENOENT' && code !== 'ENOTDIR') || current === path.dirname(current)) {
        return absolute;
      }
      missing.push(path.basename(current));
    }
  }
}

export type DirectoryLock = {
  release(): void;
};

export type DirectoryLockOptions = {
  /** How often the holder refreshes its heartbeat. */
  heartbeatIntervalMs?: number;
  /** The longest a waiter waits in total, even while the holder keeps heartbeating. */
  maxWaitMs?: number;
  /** A heartbeat older than this shows the holder is no longer making progress. */
  staleAfterMs?: number;
  /** How long a waiter waits for a holder that shows no live heartbeat. */
  timeoutMs?: number;
};

type LockState = 'gone' | 'held' | 'live' | 'stale';

export async function acquireDirectoryLock(
  lockPath: string,
  signal?: AbortSignal,
  { heartbeatIntervalMs = 5_000, maxWaitMs = 60 * 60_000, staleAfterMs = 60_000, timeoutMs = 120_000 }: DirectoryLockOptions = {},
): Promise<DirectoryLock> {
  const startedAt = Date.now();
  let idleDeadline = startedAt + timeoutMs;

  while (true) {
    throwIfAborted(signal);
    const lock = tryCreateLock(lockPath, heartbeatIntervalMs);
    if (lock) {
      return lock;
    }

    const state = inspectLock(lockPath, staleAfterMs);
    if (state === 'gone' || (state === 'stale' && reclaimStaleLock(lockPath))) {
      continue;
    }

    // A holder that keeps its heartbeat fresh is building, so its waiters wait on it up to the overall bound.
    const now = Date.now();
    if (state === 'live') {
      idleDeadline = Math.max(idleDeadline, now + timeoutMs);
    }
    if (now >= idleDeadline || now >= startedAt + maxWaitMs) {
      throw new Error(`Timed out waiting for native driver build lock "${lockPath}".`);
    }
    await delay(100);
  }
}

function tryCreateLock(lockPath: string, heartbeatIntervalMs: number): DirectoryLock | undefined {
  const ownerPath = path.join(lockPath, 'owner.json');
  const heartbeatPath = path.join(lockPath, 'heartbeat');
  try {
    fs.mkdirSync(lockPath, { recursive: false });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'EEXIST') {
      return undefined;
    }
    throw error;
  }
  try {
    fs.writeFileSync(ownerPath, JSON.stringify({ hostname: os.hostname(), pid: process.pid, startedAt: new Date().toISOString() }), {
      flag: 'wx',
    });
    fs.writeFileSync(heartbeatPath, new Date().toISOString(), { flag: 'wx' });
  } catch (error) {
    // A directory without its owner record could never be reclaimed by identity, so do not leave one behind.
    fs.rmSync(lockPath, { force: true, recursive: true });
    throw error;
  }
  const heartbeat = setInterval(() => {
    try {
      fs.writeFileSync(heartbeatPath, new Date().toISOString());
    } catch {
      // Release or process shutdown owns the final state.
    }
  }, heartbeatIntervalMs);
  heartbeat.unref();
  let released = false;
  return {
    release() {
      if (released) {
        return;
      }
      released = true;
      clearInterval(heartbeat);
      fs.rmSync(lockPath, { force: true, recursive: true });
    },
  };
}

/**
 * Classifies an existing lock directory. A fresh heartbeat (or, before the first one, a fresh directory) is live. A
 * stale lock with no readable owner is abandoned. One with an owner is abandoned only when that owner ran on this host
 * and its process has exited.
 */
function inspectLock(lockPath: string, staleAfterMs: number): LockState {
  let directory: fs.Stats;
  try {
    directory = fs.statSync(lockPath);
  } catch (error) {
    return (error as NodeJS.ErrnoException).code === 'ENOENT' ? 'gone' : 'held';
  }
  let lastActivityMs = directory.mtimeMs;
  try {
    lastActivityMs = fs.statSync(path.join(lockPath, 'heartbeat')).mtimeMs;
  } catch {
    // The holder has not written its first heartbeat; the directory's own age stands in for it.
  }
  if (Date.now() - lastActivityMs <= staleAfterMs) {
    return 'live';
  }
  let owner: { hostname?: unknown; pid?: unknown };
  try {
    owner = readJsonFile<{ hostname?: unknown; pid?: unknown }>(path.join(lockPath, 'owner.json'));
  } catch {
    return 'stale';
  }
  const { hostname, pid } = owner;
  return hostname === os.hostname() && typeof pid === 'number' && Number.isInteger(pid) && pid > 0 && !isProcessAlive(pid)
    ? 'stale'
    : 'held';
}

function reclaimStaleLock(lockPath: string): boolean {
  const stalePath = `${lockPath}.stale-${Date.now()}-${randomUUID()}`;
  try {
    fs.renameSync(lockPath, stalePath);
    fs.rmSync(stalePath, { force: true, recursive: true });
    return true;
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code !== 'ENOENT' && code !== 'EACCES' && code !== 'EPERM') {
      throw error;
    }
    return code === 'ENOENT';
  }
}

function isProcessAlive(pid: number): boolean {
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    return (error as NodeJS.ErrnoException).code !== 'ESRCH';
  }
}

export function throwIfAborted(signal?: AbortSignal): void {
  if (signal?.aborted) {
    throw createAbortError();
  }
}

export function createAbortError(): Error {
  const error = new Error('The native driver operation was aborted.');
  error.name = 'AbortError';
  return error;
}

export function delay(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}
