import { createHash, randomUUID } from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

type JsonValue = boolean | null | number | string | JsonValue[] | { [key: string]: JsonValue };

export function sha256(value: string | Uint8Array): string {
  return createHash('sha256').update(value).digest('hex');
}

export function canonicalJson(value: JsonValue): string {
  if (Array.isArray(value)) {
    return `[${value.map(canonicalJson).join(',')}]`;
  }
  if (value && typeof value === 'object') {
    return `{${Object.entries(value)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, entry]) => `${JSON.stringify(key)}:${canonicalJson(entry)}`)
      .join(',')}}`;
  }
  return JSON.stringify(value);
}

export function listFiles(root: string): string[] {
  const results: string[] = [];
  const visit = (directory: string) => {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const fullPath = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        visit(fullPath);
      } else if (entry.isFile()) {
        results.push(fullPath);
      }
    }
  };
  visit(root);
  return results.sort((left, right) => left.localeCompare(right));
}

export function hashTree(root: string): string {
  const entries = listFiles(root).map((filePath) => ({
    path: path.relative(root, filePath).replaceAll(path.sep, '/'),
    sha256: sha256(fs.readFileSync(filePath)),
  }));
  return sha256(canonicalJson(entries));
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

export type DirectoryLock = {
  release(): void;
};

export async function acquireDirectoryLock(lockPath: string, signal?: AbortSignal, timeoutMs = 120_000): Promise<DirectoryLock> {
  const deadline = Date.now() + timeoutMs;
  const ownerPath = path.join(lockPath, 'owner.json');
  const heartbeatPath = path.join(lockPath, 'heartbeat');

  while (true) {
    throwIfAborted(signal);
    try {
      fs.mkdirSync(lockPath, { recursive: false });
      atomicWriteJson(ownerPath, {
        hostname: os.hostname(),
        pid: process.pid,
        startedAt: new Date().toISOString(),
      });
      fs.writeFileSync(heartbeatPath, new Date().toISOString());
      const heartbeat = setInterval(() => {
        try {
          fs.writeFileSync(heartbeatPath, new Date().toISOString());
        } catch {
          // Release or process shutdown owns the final state.
        }
      }, 5000);
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
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'EEXIST') {
        throw error;
      }
    }

    if (canReclaimLock(ownerPath, heartbeatPath)) {
      const stalePath = `${lockPath}.stale-${Date.now()}-${randomUUID()}`;
      try {
        fs.renameSync(lockPath, stalePath);
        fs.rmSync(stalePath, { force: true, recursive: true });
        continue;
      } catch (error) {
        const code = (error as NodeJS.ErrnoException).code;
        if (code !== 'ENOENT' && code !== 'EACCES' && code !== 'EPERM') {
          throw error;
        }
      }
    }

    if (Date.now() >= deadline) {
      throw new Error(`Timed out waiting for native driver build lock "${lockPath}".`);
    }
    await delay(100);
  }
}

function canReclaimLock(ownerPath: string, heartbeatPath: string): boolean {
  try {
    const owner = readJsonFile<{ hostname?: string; pid?: number }>(ownerPath);
    const heartbeat = fs.statSync(heartbeatPath);
    return (
      owner.hostname === os.hostname() &&
      typeof owner.pid === 'number' &&
      Date.now() - heartbeat.mtimeMs > 60_000 &&
      !isProcessAlive(owner.pid)
    );
  } catch {
    return false;
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
    const error = new Error('The native driver operation was aborted.');
    error.name = 'AbortError';
    throw error;
  }
}

export function delay(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}
