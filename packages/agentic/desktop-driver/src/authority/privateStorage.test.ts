import { execFileSync } from 'node:child_process';
import { chmod, link, lstat, mkdir, mkdtemp, readFile, readdir, realpath, rename, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

import { createMacOSPrivateStorage } from './macosPrivateStorage.js';
import { privateRecordMaxBytes } from './privateStorage.js';

const macosDescribe = process.platform === 'darwin' ? describe : describe.skip;

macosDescribe('owner-validated macOS private storage', () => {
  let parent: string;
  let root: string;

  beforeEach(async () => {
    parent = await mkdtemp(path.join(await realpath(tmpdir()), 'furn-private-storage-'));
    root = path.join(parent, 'state');
  });
  afterEach(async () => {
    await rm(parent, { force: true, recursive: true });
  });

  test('publishes complete private records without overwriting and removes only matching records', async () => {
    const storage = await createMacOSPrivateStorage(root);
    expect(await storage.read('connection.json')).toBeUndefined();
    await storage.publish('connection.json', '{"label":"agent"}');
    expect((await lstat(root)).mode & 0o777).toBe(0o700);
    expect((await lstat(path.join(root, 'connection.json'))).mode & 0o777).toBe(0o600);
    await expect(storage.publish('connection.json', 'replacement')).rejects.toThrow();
    expect(await storage.remove('connection.json', 'replacement')).toBe(false);
    expect(await storage.read('connection.json')).toBe('{"label":"agent"}');
    expect(await storage.remove('connection.json', '{"label":"agent"}')).toBe(true);
    expect(await storage.remove('connection.json', '{"label":"agent"}')).toBe(false);
    expect(await readdir(root)).toEqual([]);
  });

  test('rejects traversal, oversized writes, and concurrent publication collisions', async () => {
    const storage = await createMacOSPrivateStorage(root);
    await expect(storage.read('../outside')).rejects.toThrow(TypeError);
    await expect(storage.publish('record', '\u00e9'.repeat(privateRecordMaxBytes))).rejects.toThrow(TypeError);
    await expect(storage.publish('record', '\ud800')).rejects.toThrow(TypeError);
    const results = await Promise.allSettled([storage.publish('record', 'one'), storage.publish('record', 'two')]);
    expect(results.filter(({ status }) => status === 'fulfilled')).toHaveLength(1);
    expect(['one', 'two']).toContain(await storage.read('record'));
    expect(await readdir(root)).toEqual(['record']);
  });

  test('does not repair an unsafe root and revalidates root identity on every operation', async () => {
    await mkdir(root, { mode: 0o755 });
    await expect(createMacOSPrivateStorage(root)).rejects.toThrow();
    expect((await lstat(root)).mode & 0o777).toBe(0o755);
    await chmod(root, 0o700);
    const storage = await createMacOSPrivateStorage(root);
    await storage.publish('record', 'original');
    await rename(root, path.join(parent, 'moved'));
    await mkdir(root, { mode: 0o700 });
    await expect(storage.read('record')).rejects.toThrow();
    await expect(storage.publish('record', 'replacement')).rejects.toThrow();
  });

  test('rejects symlink roots and ancestors', async () => {
    const real = path.join(parent, 'real');
    await mkdir(real, { mode: 0o700 });
    await symlink(real, root);
    await expect(createMacOSPrivateStorage(root)).rejects.toThrow();
    await expect(createMacOSPrivateStorage(path.join(root, 'nested'))).rejects.toThrow();
    expect(await readdir(real)).toEqual([]);
  });

  test.each(['symlink', 'hardlink', 'permissions', 'directory', 'oversized', 'invalid-utf8'] as const)(
    'rejects an unsafe record (%s) without removing it',
    async (kind) => {
      const storage = await createMacOSPrivateStorage(root);
      const filename = path.join(root, 'record');
      const outside = path.join(parent, 'outside');
      await writeFile(outside, 'content', { mode: 0o600 });
      if (kind === 'symlink') await symlink(outside, filename);
      if (kind === 'hardlink') await link(outside, filename);
      if (kind === 'permissions') await writeFile(filename, 'content', { mode: 0o644 });
      if (kind === 'directory') await mkdir(filename, { mode: 0o700 });
      if (kind === 'oversized') await writeFile(filename, 'x'.repeat(privateRecordMaxBytes + 1), { mode: 0o600 });
      if (kind === 'invalid-utf8') await writeFile(filename, Buffer.from([0xff]), { mode: 0o600 });
      await expect(storage.read('record')).rejects.toThrow();
      await expect(storage.remove('record', 'content')).rejects.toThrow();
      expect(await readFile(outside, 'utf8')).toBe('content');
      expect(await lstat(filename)).toBeDefined();
    },
  );

  test('rejects a file ACL even when its POSIX mode remains 0600', async () => {
    const storage = await createMacOSPrivateStorage(root);
    await storage.publish('record', 'content');
    const filename = path.join(root, 'record');
    execFileSync('/bin/chmod', ['+a', 'everyone allow read', filename]);
    expect((await lstat(filename)).mode & 0o777).toBe(0o600);
    await expect(storage.read('record')).rejects.toThrow();
  });

  test('rechecks root and ancestor ACLs even when their POSIX modes remain 0700', async () => {
    const storage = await createMacOSPrivateStorage(root);
    execFileSync('/bin/chmod', ['+a', 'everyone allow search', root]);
    expect((await lstat(root)).mode & 0o777).toBe(0o700);
    await expect(storage.read('absent')).rejects.toThrow();
    execFileSync('/bin/chmod', ['-N', root]);
    execFileSync('/bin/chmod', ['+a', 'everyone allow add_file', parent]);
    expect((await lstat(parent)).mode & 0o777).toBe(0o700);
    await expect(storage.publish('record', 'content')).rejects.toThrow();
  });
});

(process.platform === 'darwin' ? test.skip : test)('does not treat POSIX modes as a Windows ownership implementation', async () => {
  await expect(createMacOSPrivateStorage()).rejects.toThrow('unsupported');
});
