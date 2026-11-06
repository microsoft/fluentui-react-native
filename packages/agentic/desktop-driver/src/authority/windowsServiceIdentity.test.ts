/* eslint-disable @microsoft/sdl/no-insecure-url -- The protected service protocol is loopback HTTP, not remote HTTPS. */
import type { NativeDriverArtifact } from '../native/types';
import { FakeAuthorityHelper } from '../native/windows/fakeAuthorityHelper';
import type { DesktopServiceIdentity } from './connectionDescriptor';
import { createWindowsServiceVerifier, describeWindowsService } from './windowsServiceIdentity';

const mockSpawn = jest.fn();
jest.mock('node:child_process', () => ({ spawn: (...args: unknown[]) => mockSpawn(...args) }));
const mockVerify = jest.fn();
jest.mock('../native/nativeDriver', () => ({ verifyNativeDriverArtifact: (...args: unknown[]) => mockVerify(...args) }));

const originalPlatform = Object.getOwnPropertyDescriptor(process, 'platform') as PropertyDescriptor;
const verifiedPath = 'C:\\verified\\furn-desktop-driver-host.exe';
const artifact = { executablePath: 'C:\\cache\\furn-desktop-driver-host.exe', provider: 'windows' } as NativeDriverArtifact;
const identity = {
  executablePath: 'C:\\Program Files\\nodejs\\node.exe',
  interactiveSession: 'windows-session:2',
  pid: 4321,
  platform: 'windows',
  startedAt: '2026-11-03T21:00:00.1234567Z',
} as const;
const claim: DesktopServiceIdentity = { ...identity, incarnation: 'inc_0123456789abcdef01234567' };
const url = 'http://127.0.0.1:49152';
const undescribed = 'The Windows service identity could not be determined.';
const unavailable = 'The Windows Desktop Driver service verifier is unavailable.';

let helper: FakeAuthorityHelper;

// The adapters are exercised through a scripted helper, so these tests run on every host.
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

async function withPlatform<T>(value: string, body: () => Promise<T> | T): Promise<T> {
  Object.defineProperty(process, 'platform', { value });
  try {
    return await body();
  } finally {
    Object.defineProperty(process, 'platform', { value: 'win32' });
  }
}

describe('describeWindowsService', () => {
  test('describes a process through the verified helper and freezes the identity', async () => {
    helper.answer({ identity, ok: true });

    const described = await describeWindowsService({ artifact, pid: 4321 });

    expect(described).toEqual(identity);
    expect(Object.isFrozen(described)).toBe(true);
    expect(mockVerify).toHaveBeenCalledWith(artifact);
    expect(helper.launches[0]).toMatchObject({ args: ['--service-identity'], executable: verifiedPath });
    expect(requests()).toEqual([{ operation: 'describe', pid: 4321 }]);
  });

  test('refuses another platform before verifying or launching the helper', async () => {
    await expect(withPlatform('darwin', () => describeWindowsService({ artifact, pid: 4321 }))).rejects.toThrow(
      'unsupported on this platform',
    );

    expect(mockVerify).not.toHaveBeenCalled();
    expect(helper.launches).toHaveLength(0);
  });

  test.each([0, -1, 1.5, 2 ** 31, Number.NaN, '4321', undefined])(
    'requires a positive 31-bit integer process id and refuses %p',
    async (pid) => {
      await expect(describeWindowsService({ artifact, pid: pid as never })).rejects.toThrow(TypeError);
      await expect(describeWindowsService(undefined as never)).rejects.toThrow(TypeError);

      expect(mockVerify).not.toHaveBeenCalled();
      expect(helper.launches).toHaveLength(0);
    },
  );

  test('maps a helper refusal to a fixed message and a non-enumerable reason', async () => {
    helper.answer({ detail: 'C:\\Users\\agent\\secret', ok: false, reason: 'session' });

    const error = await describeWindowsService({ artifact, pid: 4321 }).catch((caught: Error) => caught);

    expect(error).toMatchObject({ message: undescribed, reason: 'session' });
    expect(Object.keys(error as Error)).toEqual([]);
    expect(String(error)).not.toContain('secret');
  });

  test.each<[string, Record<string, unknown>]>([
    ['another process id', { ...identity, pid: 4322 }],
    ['a macOS platform', { ...identity, platform: 'macos' }],
    ['a start time without 100 ns precision', { ...identity, startedAt: '2026-11-03T21:00:00Z' }],
    ['a session label for another platform', { ...identity, interactiveSession: 'uid:501' }],
    ['a relative executable path', { ...identity, executablePath: 'node.exe' }],
    ['a control character in the executable path', { ...identity, executablePath: 'C:\\node\u0000.exe' }],
    ['an empty executable path', { ...identity, executablePath: '' }],
    ['an incarnation the helper cannot know', { ...identity, incarnation: 'inc_0123456789abcdef01234567' }],
  ])('refuses an answer with %s', async (_description, described) => {
    helper.answer({ identity: described, ok: true });

    await expect(describeWindowsService({ artifact, pid: 4321 })).rejects.toMatchObject({ message: undescribed, reason: 'helper' });
  });

  test('treats a helper that cannot answer as an unknown identity', async () => {
    helper.output('not json');

    await expect(describeWindowsService({ artifact, pid: 4321 })).rejects.toMatchObject({ message: undescribed, reason: 'helper' });
  });
});

describe('createWindowsServiceVerifier', () => {
  const verdict = (answer: Record<string, unknown>) => {
    helper.answer(answer);
    return createWindowsServiceVerifier({ artifact })(claim, url);
  };

  test('refuses another platform or an artifact for another provider when created', async () => {
    await withPlatform('darwin', () => {
      expect(() => createWindowsServiceVerifier({ artifact })).toThrow('unsupported on this platform');
    });
    for (const candidate of [{ executablePath: '/helper', provider: 'macos' }, undefined, null]) {
      expect(() => createWindowsServiceVerifier({ artifact: candidate as never })).toThrow(TypeError);
    }
    expect(() => createWindowsServiceVerifier(undefined as never)).toThrow(TypeError);

    expect(mockVerify).not.toHaveBeenCalled();
    expect(helper.launches).toHaveLength(0);
  });

  test('resolves true only when the helper verified the claim, and sends the claim and the address', async () => {
    await expect(verdict({ ok: true, verified: true })).resolves.toBe(true);

    expect(helper.launches[0]).toMatchObject({ args: ['--service-identity'], executable: verifiedPath });
    expect(requests()).toEqual([{ operation: 'verify', service: claim, url }]);
  });

  test('sends only the identity fields of the claim', async () => {
    helper.answer({ ok: true, verified: true });

    await createWindowsServiceVerifier({ artifact })({ ...claim, grant: 'fdg1.secret' } as never, url);

    expect(requests()).toEqual([{ operation: 'verify', service: claim, url }]);
    expect(helper.launches[0].request).not.toContain('secret');
  });

  test.each<[string, Record<string, unknown>]>([
    ['a refused listener', { ok: true, reason: 'listener', verified: false }],
    ['a refused start time', { detail: 'The process start time differs from the claim.', ok: true, reason: 'start', verified: false }],
    ['a claim the helper cannot read', { ok: false, reason: 'request' }],
  ])('resolves false for %s', async (_description, answer) => {
    await expect(verdict(answer)).resolves.toBe(false);
  });

  test.each<[string, DesktopServiceIdentity | string]>([
    ['a macOS identity', { ...claim, platform: 'macos' }],
    ['a process id that is not an integer', { ...claim, pid: 1.5 }],
    ['a missing start time', { ...claim, startedAt: undefined as never }],
    ['a missing incarnation', { ...claim, incarnation: undefined as never }],
    ['an identity that is not an object', 'C:\\node.exe'],
  ])('resolves false without launching the helper for %s', async (_description, service) => {
    await expect(createWindowsServiceVerifier({ artifact })(service as never, url)).resolves.toBe(false);
    await expect(createWindowsServiceVerifier({ artifact })(claim, 8080 as never)).resolves.toBe(false);

    expect(mockVerify).not.toHaveBeenCalled();
    expect(helper.launches).toHaveLength(0);
  });

  test.each<[string, Record<string, unknown>]>([
    ['an answer without a verdict', { ok: true }],
    ['a verdict that is not a boolean', { ok: true, verified: 'yes' }],
    ['a verdict with unexpected fields', { extra: 1, ok: true, verified: true }],
    ['a refusal other than a malformed request', { ok: false, reason: 'io' }],
  ])('rejects, and never resolves true, for %s', async (_description, answer) => {
    await expect(verdict(answer)).rejects.toMatchObject({ message: unavailable, reason: 'helper' });
  });

  test('rejects when the helper cannot answer', async () => {
    const verify = createWindowsServiceVerifier({ artifact });
    helper.output('not json').fail(new Error('spawn UNKNOWN C:\\secret')).output('{"ok":true,"verified":true}', 1);

    for (let attempt = 0; attempt < 3; attempt += 1) {
      const error = await verify(claim, url).catch((caught: Error) => caught);
      expect(error).toMatchObject({ message: unavailable, reason: 'helper' });
      expect(String(error)).not.toContain('secret');
    }
  });

  test('verifies the helper on first use, only once, and again after a failed verification', async () => {
    const verify = createWindowsServiceVerifier({ artifact });
    expect(mockVerify).not.toHaveBeenCalled();

    mockVerify.mockRejectedValueOnce(new Error('Native driver helper hash does not match.'));
    await expect(verify(claim, url)).rejects.toThrow('hash does not match');
    expect(helper.launches).toHaveLength(0);

    helper.answer({ ok: true, verified: true }).answer({ ok: true, verified: false, reason: 'start' });
    await expect(verify(claim, url)).resolves.toBe(true);
    await expect(verify(claim, url)).resolves.toBe(false);

    expect(mockVerify).toHaveBeenCalledTimes(2);
    expect(helper.launches).toHaveLength(2);
  });
});
