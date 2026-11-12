import path from 'node:path';

import type { NativeDriverArtifact } from '../native/types';
import { FakeAuthorityHelper } from '../native/windows/fakeAuthorityHelper';
import { createWindowsPrivateStorage } from './windowsPrivateStorage';

const mockSpawn = jest.fn();
jest.mock('node:child_process', () => ({ spawn: (...args: unknown[]) => mockSpawn(...args) }));
const mockVerify = jest.fn();
jest.mock('../native/nativeDriver', () => ({ verifyNativeDriverArtifact: (...args: unknown[]) => mockVerify(...args) }));

const originalPlatform = Object.getOwnPropertyDescriptor(process, 'platform') as PropertyDescriptor;
const root = 'C:\\Users\\agent\\state';
const identity = { file: '0123456789abcdef0123456789abcdef', volume: '0123456789abcdef' };
const verifiedPath = 'C:\\verified\\furn-desktop-driver-host.exe';
const artifact = { executablePath: 'C:\\cache\\furn-desktop-driver-host.exe', provider: 'windows' } as NativeDriverArtifact;
const unsafe = 'Desktop Driver private storage is unsafe or inaccessible.';
const publicationFailed = 'Private record publication failed; unsafe storage or an existing record cannot be replaced.';
const base64 = (text: string) => Buffer.from(text, 'utf8').toString('base64');

let helper: FakeAuthorityHelper;

// The adapter is exercised through a scripted helper, so these tests run on every host.
beforeAll(() => {
  Object.defineProperty(process, 'platform', { value: 'win32' });
});
afterAll(() => {
  Object.defineProperty(process, 'platform', originalPlatform);
});
beforeEach(() => {
  helper = new FakeAuthorityHelper();
  mockSpawn.mockReset().mockImplementation(helper.spawn);
  mockVerify.mockReset().mockResolvedValue({ ...artifact, executablePath: verifiedPath });
});

const requests = () => helper.launches.map(({ request }) => JSON.parse(request) as Record<string, unknown>);

async function openStorage() {
  helper.answer({ identity, ok: true, root });
  return createWindowsPrivateStorage({ artifact, root });
}

describe('creating Windows private storage', () => {
  test('refuses another platform before verifying or launching the helper', async () => {
    Object.defineProperty(process, 'platform', { value: 'darwin' });
    try {
      await expect(createWindowsPrivateStorage({ artifact, root })).rejects.toThrow('unsupported on this platform');
    } finally {
      Object.defineProperty(process, 'platform', { value: 'win32' });
    }

    expect(mockVerify).not.toHaveBeenCalled();
    expect(helper.launches).toHaveLength(0);
  });

  test.each(['state', '', 'C:\\a\\..\\b', 'C:/a/b', 'C:\\a\\', 'C:\\\\a', '\\\\server\\share\\a', '\\\\?\\C:\\a', 'C:\\a\u0001b', 42])(
    'requires a canonical absolute drive root and refuses %p before verifying or launching',
    async (candidate) => {
      await expect(createWindowsPrivateStorage({ artifact, root: candidate as never })).rejects.toThrow(TypeError);

      expect(mockVerify).not.toHaveBeenCalled();
      expect(helper.launches).toHaveLength(0);
    },
  );

  test.each([{ executablePath: '/helper', provider: 'macos' }, undefined, null])(
    'refuses the artifact %p without launching',
    async (candidate) => {
      await expect(createWindowsPrivateStorage({ artifact: candidate as never, root })).rejects.toThrow(TypeError);
      await expect(createWindowsPrivateStorage(candidate as never)).rejects.toThrow(TypeError);

      expect(mockVerify).not.toHaveBeenCalled();
      expect(helper.launches).toHaveLength(0);
    },
  );

  test('verifies the helper once and launches the verified path to open the root', async () => {
    await openStorage();

    expect(mockVerify).toHaveBeenCalledTimes(1);
    expect(mockVerify).toHaveBeenCalledWith(artifact);
    expect(helper.launches[0]).toMatchObject({ args: ['--private-storage'], executable: verifiedPath });
    expect(requests()).toEqual([{ operation: 'open', root }]);
  });

  test('propagates a failed helper verification without launching the helper', async () => {
    mockVerify.mockRejectedValue(new Error('Native driver helper hash does not match.'));

    await expect(createWindowsPrivateStorage({ artifact, root })).rejects.toThrow('hash does not match');
    expect(helper.launches).toHaveLength(0);
  });

  test('lets the helper choose the per-user default root and then pins it', async () => {
    const defaultRoot = 'C:\\Users\\agent\\AppData\\Local\\com.microsoft.fluentui-react-native.desktop-driver';
    helper.answer({ identity, ok: true, root: defaultRoot }).answer({ found: false, ok: true });

    const storage = await createWindowsPrivateStorage({ artifact });
    await storage.read('connection.json');

    expect(requests()).toEqual([{ operation: 'open' }, { identity, name: 'connection.json', operation: 'read', root: defaultRoot }]);
  });

  test('opens a protected child namespace beneath the root selected by the helper', async () => {
    const defaultRoot = 'C:\\Users\\agent\\AppData\\Local\\com.microsoft.fluentui-react-native.desktop-driver';
    const childRoot = path.win32.join(defaultRoot, 'storybook-fixture');
    helper.answer({ identity, ok: true, root: defaultRoot }).answer({ identity, ok: true, root: childRoot }).answer({ ok: true });

    const parent = await createWindowsPrivateStorage({ artifact });
    const child = await createWindowsPrivateStorage({ artifact, root: path.win32.join(parent.root, 'storybook-fixture') });
    await child.publish('record', 'protected');

    expect(requests()).toEqual([
      { operation: 'open' },
      { operation: 'open', root: childRoot },
      { contents: base64('protected'), identity, name: 'record', operation: 'publish', root: childRoot },
    ]);
  });

  test('maps a helper refusal to the unsafe-storage failure', async () => {
    helper.answer({ detail: 'C:\\Users\\agent\\secret', ok: false, reason: 'dacl' });

    const error = await createWindowsPrivateStorage({ artifact, root }).catch((caught: Error) => caught);

    expect(error).toMatchObject({ message: unsafe, reason: 'dacl' });
    expect(String(error)).not.toContain('secret');
  });

  test.each<[string, Record<string, unknown>]>([
    ['another root', { identity, ok: true, root: 'C:\\Users\\other\\state' }],
    ['an uppercase identity', { identity: { ...identity, volume: 'ABCDEF0123456789' }, ok: true, root }],
    ['a short identity', { identity: { ...identity, file: 'abc' }, ok: true, root }],
    ['no identity', { ok: true, root }],
    ['an extra field', { extra: 1, identity, ok: true, root }],
  ])('refuses an open answer with %s', async (_description, answer) => {
    helper.answer(answer);

    await expect(createWindowsPrivateStorage({ artifact, root })).rejects.toMatchObject({ message: unsafe, reason: 'helper' });
  });

  test('refuses a default root that is not canonical', async () => {
    helper.answer({ identity, ok: true, root: '\\\\server\\share\\state' });

    await expect(createWindowsPrivateStorage({ artifact })).rejects.toMatchObject({ message: unsafe, reason: 'helper' });
  });
});

describe('Windows private storage records', () => {
  test('pins the root identity on every operation and sends records as base64', async () => {
    const contents = 'h\u00e9llo \u{1F600}';
    const storage = await openStorage();
    helper
      .answer({ ok: true })
      .answer({ contents: base64(contents), found: true, ok: true })
      .answer({ ok: true, removed: true });

    await storage.publish('connection.json', contents);
    await expect(storage.read('connection.json')).resolves.toBe(contents);
    await expect(storage.remove('connection.json', contents)).resolves.toBe(true);

    const pinned = { identity, name: 'connection.json', root };
    expect(requests().slice(1)).toEqual([
      { ...pinned, contents: base64(contents), operation: 'publish' },
      { ...pinned, operation: 'read' },
      { ...pinned, expected: base64(contents), operation: 'remove' },
    ]);
    expect(helper.launches.every(({ executable }) => executable === verifiedPath)).toBe(true);
  });

  test('reads an absent record as undefined and a record that was not removed as false', async () => {
    const storage = await openStorage();
    helper.answer({ found: false, ok: true }).answer({ ok: true, removed: false });

    await expect(storage.read('record')).resolves.toBeUndefined();
    await expect(storage.remove('record', 'other')).resolves.toBe(false);
  });

  test.each(['', '\uFEFF', '\uFEFF{"label":"agent"}', 'a\u0000b'])('returns %j exactly as published', async (contents) => {
    const storage = await openStorage();
    helper.answer({ contents: base64(contents), found: true, ok: true });

    await expect(storage.read('record')).resolves.toBe(contents);
  });

  test('checks names and contents before launching the helper', async () => {
    const storage = await openStorage();

    for (const name of ['../outside', '.hidden', 'trailing.', 'NUL', 'con.txt', '']) {
      await expect(storage.read(name)).rejects.toThrow(TypeError);
      await expect(storage.publish(name, 'x')).rejects.toThrow(TypeError);
      await expect(storage.remove(name, 'x')).rejects.toThrow(TypeError);
    }
    for (const contents of ['\ud800', 'x'.repeat(16 * 1024 + 1)]) {
      await expect(storage.publish('record', contents)).rejects.toThrow(TypeError);
      await expect(storage.remove('record', contents)).rejects.toThrow(TypeError);
    }

    expect(helper.launches).toHaveLength(1);
  });

  test.each<[string, string, (storage: Awaited<ReturnType<typeof openStorage>>) => Promise<unknown>]>([
    ['read', unsafe, (storage) => storage.read('record')],
    ['publish', publicationFailed, (storage) => storage.publish('record', 'x')],
    ['remove', unsafe, (storage) => storage.remove('record', 'x')],
  ])('maps a helper refusal on %s to a fixed message and a non-enumerable reason', async (_operation, message, act) => {
    const storage = await openStorage();
    helper.answer({ detail: 'C:\\Users\\agent\\secret\\record', ok: false, reason: 'dacl', win32: 5 });

    const error = await act(storage).catch((caught: Error) => caught);

    expect(error).toMatchObject({ message, reason: 'dacl' });
    expect(Object.keys(error as Error)).toEqual([]);
    expect(JSON.stringify(error)).toBe('{}');
  });

  test('reports an existing record as a publication failure', async () => {
    const storage = await openStorage();
    helper.answer({ ok: false, reason: 'exists' });

    await expect(storage.publish('record', 'x')).rejects.toMatchObject({ message: publicationFailed, reason: 'exists' });
  });

  test('keeps only closed lowercase refusal reasons', async () => {
    const storage = await openStorage();
    helper.answer({ ok: false, reason: 'C:\\Users\\agent' });

    await expect(storage.read('record')).rejects.toMatchObject({ message: unsafe, reason: 'unknown' });
  });

  test('treats a helper that cannot answer as unsafe storage', async () => {
    const storage = await openStorage();
    helper.output('not json').fail(new Error('spawn UNKNOWN'));

    await expect(storage.read('record')).rejects.toMatchObject({ message: unsafe, reason: 'helper' });
    await expect(storage.publish('record', 'x')).rejects.toMatchObject({ message: publicationFailed, reason: 'helper' });
  });

  test.each<[string, Record<string, unknown>]>([
    ['no found flag', { ok: true }],
    ['a found record without contents', { found: true, ok: true }],
    ['contents of an absent record', { contents: '', found: false, ok: true }],
    ['contents that are not base64', { contents: '***', found: true, ok: true }],
    ['unpadded base64', { contents: 'QQ', found: true, ok: true }],
    ['base64 with a line break', { contents: 'QUJD\n', found: true, ok: true }],
    ['URL-safe base64', { contents: '-_-_', found: true, ok: true }],
    ['contents that are not UTF-8', { contents: Buffer.from([0xff, 0xfe]).toString('base64'), found: true, ok: true }],
    ['contents over the record limit', { contents: Buffer.alloc(16 * 1024 + 1, 0x61).toString('base64'), found: true, ok: true }],
    ['an extra field', { extra: 1, found: false, ok: true }],
  ])('refuses a read answer with %s', async (_description, answer) => {
    const storage = await openStorage();
    helper.answer(answer);

    await expect(storage.read('record')).rejects.toMatchObject({ message: unsafe, reason: 'helper' });
  });

  test('refuses publish and remove answers outside the documented shape', async () => {
    const storage = await openStorage();
    helper.answer({ extra: 1, ok: true }).answer({ ok: true }).answer({ ok: true, removed: 'yes' });

    await expect(storage.publish('record', 'x')).rejects.toMatchObject({ message: publicationFailed, reason: 'helper' });
    await expect(storage.remove('record', 'x')).rejects.toMatchObject({ message: unsafe, reason: 'helper' });
    await expect(storage.remove('record', 'x')).rejects.toMatchObject({ message: unsafe, reason: 'helper' });
  });
});
