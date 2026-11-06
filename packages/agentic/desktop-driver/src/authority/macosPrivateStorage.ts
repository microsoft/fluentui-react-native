import { execFile } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { constants } from 'node:fs';
import type { Stats } from 'node:fs';
import { link, lstat, mkdir, open, unlink } from 'node:fs/promises';
import { homedir } from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';

import { assertPrivateRecordContents, assertPrivateRecordName, privateRecordMaxBytes } from './privateStorage.js';
import type { PrivateStorage } from './privateStorage.js';

const execFileAsync = promisify(execFile);

/**
 * Opens the macOS owner-only state root. Windows requires its native ownership adapter; POSIX modes are not a DACL.
 * The parent must already exist. Existing roots are validated, never repaired.
 */
export async function createMacOSPrivateStorage(
  root = path.join(homedir(), 'Library', 'Application Support', 'com.microsoft.fluentui-react-native.desktop-driver'),
): Promise<PrivateStorage> {
  if (process.platform !== 'darwin' || !process.getuid) {
    throw new Error('macOS private storage is unsupported on this platform; use a validated native ownership adapter.');
  }
  if (!path.isAbsolute(root) || path.resolve(root) !== root || /\p{Cc}/u.test(root)) {
    throw new TypeError('Private storage requires a canonical absolute root path.');
  }
  const uid = process.getuid();
  await validateAncestors(path.dirname(root), uid);
  try {
    await mkdir(root, { mode: 0o700 });
  } catch (error) {
    if (!hasCode(error, 'EEXIST')) throw unsafeStorage();
  }
  const identity = await validateRoot(root, uid);

  const checkRoot = async () => {
    await validateAncestors(path.dirname(root), uid);
    const current = await validateRoot(root, uid);
    if (!sameFile(identity, current)) throw unsafeStorage();
  };

  const readRecord = async (name: string): Promise<{ contents: string; identity: Stats } | undefined> => {
    assertPrivateRecordName(name);
    await checkRoot();
    const filename = path.join(root, name);
    let handle;
    try {
      handle = await open(filename, constants.O_RDONLY | constants.O_NOFOLLOW | constants.O_NONBLOCK);
    } catch (error) {
      if (hasCode(error, 'ENOENT')) return undefined;
      throw unsafeStorage();
    }
    try {
      const before = await handle.stat();
      validateFile(before, uid);
      await rejectACL(filename);
      if (!sameFile(before, await lstat(filename))) throw unsafeStorage();
      const buffer = Buffer.alloc(privateRecordMaxBytes + 1);
      let length = 0;
      while (length < buffer.length) {
        const { bytesRead } = await handle.read(buffer, length, buffer.length - length, null);
        if (bytesRead === 0) break;
        length += bytesRead;
      }
      const after = await handle.stat();
      validateFile(after, uid);
      if (length > privateRecordMaxBytes || length !== before.size || before.mtimeMs !== after.mtimeMs) throw unsafeStorage();
      await checkRoot();
      return { contents: new TextDecoder('utf-8', { fatal: true }).decode(buffer.subarray(0, length)), identity: after };
    } catch {
      throw unsafeStorage();
    } finally {
      await handle.close();
    }
  };

  return {
    async read(name) {
      return (await readRecord(name))?.contents;
    },
    async publish(name, contents) {
      assertPrivateRecordName(name);
      assertPrivateRecordContents(contents);
      await checkRoot();
      const temporary = path.join(root, `.publish-${randomUUID()}`);
      const handle = await open(temporary, constants.O_WRONLY | constants.O_CREAT | constants.O_EXCL | constants.O_NOFOLLOW, 0o600);
      try {
        validateFile(await handle.stat(), uid);
        await rejectACL(temporary);
        await handle.writeFile(contents, 'utf8');
        await handle.sync();
        await checkRoot();
        // A hard link publishes the complete inode without rename's overwrite behavior.
        await link(temporary, path.join(root, name));
      } catch {
        throw new Error('Private record publication failed; unsafe storage or an existing record cannot be replaced.');
      } finally {
        await handle.close();
        await unlink(temporary);
      }
    },
    async remove(name, expectedContents) {
      assertPrivateRecordContents(expectedContents);
      const record = await readRecord(name);
      if (!record || record.contents !== expectedContents) return false;
      await checkRoot();
      const filename = path.join(root, name);
      if (!sameFile(record.identity, await lstat(filename))) throw unsafeStorage();
      await unlink(filename);
      return true;
    },
  };
}

async function validateRoot(root: string, uid: number): Promise<Stats> {
  const info = await lstat(root);
  if (!info.isDirectory() || info.uid !== uid || (info.mode & 0o7777) !== 0o700) throw unsafeStorage();
  await rejectACL(root);
  return info;
}

async function validateAncestors(directory: string, uid: number): Promise<void> {
  for (let current = directory; ; current = path.dirname(current)) {
    const info = await lstat(current);
    const rootOwnedSticky = info.uid === 0 && (info.mode & 0o1000) !== 0;
    if (!info.isDirectory() || (info.uid !== uid && info.uid !== 0) || ((info.mode & 0o022) !== 0 && !rootOwnedSticky)) {
      throw unsafeStorage();
    }
    await rejectACL(current, true);
    if (current === path.dirname(current)) break;
  }
}

async function rejectACL(filename: string, allowDenyEntries = false): Promise<void> {
  // Node's stat mode does not reveal macOS ACL grants. Never infer privacy from 0700/0600 alone.
  const { stdout } = await execFileAsync('/bin/ls', ['-lde', filename], {
    env: { ...process.env, LC_ALL: 'C' },
    maxBuffer: 16 * 1024,
    timeout: 5_000,
  });
  const [metadata, ...entries] = stdout.trimEnd().split('\n');
  if (
    !/^[d-][rwxStTs-]{9}[+@]?\s/.test(metadata) ||
    entries.some((entry) => !allowDenyEntries || !/^\s*\d+: (user|group):\S+ deny [a-z_,]+$/.test(entry))
  ) {
    throw unsafeStorage();
  }
}

function validateFile(info: Stats, uid: number): void {
  if (!info.isFile() || info.uid !== uid || (info.mode & 0o7777) !== 0o600 || info.nlink !== 1 || info.size > privateRecordMaxBytes) {
    throw unsafeStorage();
  }
}

function sameFile(a: Stats, b: Stats): boolean {
  return a.dev === b.dev && a.ino === b.ino;
}

function hasCode(error: unknown, code: string): boolean {
  return typeof error === 'object' && error !== null && 'code' in error && error.code === code;
}

function unsafeStorage(): Error {
  return new Error('Desktop Driver private storage is unsafe or inaccessible.');
}
