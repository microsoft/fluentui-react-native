// Native contract for the Windows private-storage helper mode behind createWindowsPrivateStorage. Every case drives the real
// helper against a scratch root under the temp directory and never touches the per-user default root. It proves what the
// scripted unit tests cannot: that the adapter and the helper agree on the wire format, and that exclusive publication, the
// pinned root identity, and the owner-only checks hold on a real NTFS volume. Opt in with FURN_NATIVE_DRIVER_TEST=1 and run
// it serially: yarn test --runInBand privateStorage.contract
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import type { PrivateStorage } from '../../authority/privateStorage';
import { createWindowsPrivateStorage } from '../../authority/windowsPrivateStorage';
import { helperArtifact } from './win32FixtureSupport';

jest.setTimeout(240_000);

const windowsTest = process.platform === 'win32' && process.env.FURN_NATIVE_DRIVER_TEST === '1' ? test : test.skip;

const unsafe = 'Desktop Driver private storage is unsafe or inaccessible.';
const publicationFailed = 'Private record publication failed; unsafe storage or an existing record cannot be replaced.';
const everyone = '*S-1-1-0';

let scratch: string;

beforeEach(() => {
  scratch = fs.realpathSync.native(fs.mkdtempSync(path.join(os.tmpdir(), 'furn-private-storage-')));
});

afterEach(() => {
  fs.rmSync(scratch, { force: true, recursive: true });
});

async function open(root: string): Promise<PrivateStorage> {
  return createWindowsPrivateStorage({ artifact: await helperArtifact(), root });
}

function grantEveryoneRead(target: string): void {
  execFileSync('icacls.exe', [target, '/grant', `${everyone}:R`], { stdio: 'ignore', windowsHide: true });
}

describe('Windows private storage against the helper', () => {
  windowsTest('creates the root, round-trips a record byte for byte, and publishes exclusively', async () => {
    const root = path.join(scratch, 'state');
    const storage = await open(root);
    const text = '\uFEFF{"label":"h\u00e9llo \u{1F600}"}';

    await expect(storage.read('connection.json')).resolves.toBeUndefined();
    await storage.publish('connection.json', text);
    await expect(storage.read('connection.json')).resolves.toBe(text);
    expect(fs.readFileSync(path.join(root, 'connection.json'))).toEqual(Buffer.from(text, 'utf8'));

    await expect(storage.publish('connection.json', 'replacement')).rejects.toMatchObject({
      message: publicationFailed,
      reason: 'exists',
    });
    await expect(storage.read('connection.json')).resolves.toBe(text);

    await expect(storage.remove('connection.json', 'another record')).resolves.toBe(false);
    await expect(storage.remove('connection.json', text)).resolves.toBe(true);
    await expect(storage.remove('connection.json', text)).resolves.toBe(false);
    await expect(storage.read('connection.json')).resolves.toBeUndefined();
    expect(fs.readdirSync(root)).toEqual([]);
  });

  windowsTest('reopens an existing root and keeps its records', async () => {
    const root = path.join(scratch, 'state');
    await (await open(root)).publish('record', 'kept');

    await expect((await open(root)).read('record')).resolves.toBe('kept');
  });

  windowsTest('lets exactly one of several concurrent publishers win and leaves no temporary file', async () => {
    const root = path.join(scratch, 'state');
    const storage = await open(root);
    const writers = Array.from({ length: 6 }, (_, index) => `writer ${index}`);

    const outcomes = await Promise.allSettled(writers.map((contents) => storage.publish('race', contents)));

    const winners = writers.filter((_, index) => outcomes[index].status === 'fulfilled');
    const refusals = outcomes.flatMap((outcome) => (outcome.status === 'rejected' ? [outcome.reason as unknown] : []));
    expect(winners).toHaveLength(1);
    expect(refusals).toHaveLength(writers.length - 1);
    for (const refusal of refusals) {
      expect(refusal).toMatchObject({ message: publicationFailed, reason: 'exists' });
    }
    await expect(storage.read('race')).resolves.toBe(winners[0]);
    expect(fs.readdirSync(root)).toEqual(['race']);
  });

  windowsTest('refuses a root that was replaced after it was opened, even by a validly protected one', async () => {
    const root = path.join(scratch, 'state');
    const original = await open(root);
    await original.publish('record', 'original');

    fs.renameSync(root, path.join(scratch, 'moved'));
    const replacement = await open(root);
    await replacement.publish('record', 'replacement');

    await expect(original.read('record')).rejects.toMatchObject({ message: unsafe, reason: 'identity' });
    await expect(original.publish('another', 'x')).rejects.toMatchObject({ message: publicationFailed, reason: 'identity' });
    await expect(original.remove('record', 'replacement')).rejects.toMatchObject({ message: unsafe, reason: 'identity' });
    await expect(replacement.read('record')).resolves.toBe('replacement');
  });

  windowsTest('refuses a root that was removed after it was opened without creating it again', async () => {
    const root = path.join(scratch, 'state');
    const storage = await open(root);
    fs.rmSync(root, { recursive: true });

    await expect(storage.read('record')).rejects.toMatchObject({ message: unsafe, reason: 'identity' });
    await expect(storage.publish('record', 'x')).rejects.toMatchObject({ message: publicationFailed, reason: 'identity' });
    expect(fs.existsSync(root)).toBe(false);
  });

  windowsTest('refuses a root that is a directory junction and leaves its target alone', async () => {
    const target = path.join(scratch, 'target');
    const junction = path.join(scratch, 'junction');
    fs.mkdirSync(target);
    fs.symlinkSync(target, junction, 'junction');

    await expect(open(junction)).rejects.toMatchObject({ message: unsafe, reason: 'reparse' });
    expect(fs.readdirSync(target)).toEqual([]);
  });

  windowsTest('refuses a record that gained a second hard link', async () => {
    const root = path.join(scratch, 'state');
    const storage = await open(root);
    await storage.publish('record', 'secret');
    fs.linkSync(path.join(root, 'record'), path.join(scratch, 'alias'));

    await expect(storage.read('record')).rejects.toMatchObject({ message: unsafe, reason: 'links' });
    await expect(storage.remove('record', 'secret')).rejects.toMatchObject({ message: unsafe, reason: 'links' });
  });

  windowsTest.each(['root', 'record'] as const)('refuses a %s whose ACL grants another principal access', async (subject) => {
    const root = path.join(scratch, 'state');
    const storage = await open(root);
    await storage.publish('record', 'secret');
    await expect(storage.read('record')).resolves.toBe('secret');

    grantEveryoneRead(subject === 'root' ? root : path.join(root, 'record'));

    await expect(storage.read('record')).rejects.toMatchObject({ message: unsafe, reason: 'dacl' });
  });
});
