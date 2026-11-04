/* eslint-disable @microsoft/sdl/no-insecure-url -- The protected service protocol is loopback HTTP, not remote HTTPS. */
import type { NativeDriverArtifact } from '../native/types';
import { FakeAuthorityHelper } from '../native/windows/fakeAuthorityHelper';
import type { DesktopServiceIdentity } from './connectionDescriptor';
import { createMacOSServiceVerifier, describeMacOSService } from './macosServiceIdentity';

const mockSpawn = jest.fn();
jest.mock('node:child_process', () => ({ spawn: (...args: unknown[]) => mockSpawn(...args) }));
const mockVerify = jest.fn();
jest.mock('../native/nativeDriver', () => ({ verifyNativeDriverArtifact: (...args: unknown[]) => mockVerify(...args) }));

const originalPlatform = Object.getOwnPropertyDescriptor(process, 'platform') as PropertyDescriptor;
const verifiedPath = '/verified/furn-desktop-driver-host';
const artifact = { executablePath: '/cache/furn-desktop-driver-host', provider: 'macos' } as NativeDriverArtifact;
const identity = {
  executablePath: '/opt/homebrew/bin/node',
  interactiveSession: 'macos-session:100021',
  pid: 4321,
  platform: 'macos',
  startedAt: '2026-11-03T21:00:00.123456Z',
} as const;
const claim: DesktopServiceIdentity = { ...identity, incarnation: 'inc_0123456789abcdef01234567' };
const url = 'http://127.0.0.1:49152';
const undescribed = 'The macOS service identity could not be determined.';
const unavailable = 'The macOS Desktop Driver service verifier is unavailable.';

let helper: FakeAuthorityHelper;

// The adapters are exercised through a scripted helper, so these tests run on every host.
beforeAll(() => {
  Object.defineProperty(process, 'platform', { value: 'darwin' });
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

describe('describeMacOSService', () => {
  test('describes a process through the verified macOS helper', async () => {
    helper.answer({ identity, ok: true });

    await expect(describeMacOSService({ artifact, pid: 4321 })).resolves.toEqual(identity);

    expect(mockVerify).toHaveBeenCalledWith(artifact);
    expect(helper.launches[0]).toMatchObject({ args: ['--service-identity'], executable: verifiedPath });
    expect(requests()).toEqual([{ operation: 'describe', pid: 4321 }]);
  });

  test('refuses another platform or a Windows artifact before launching the helper', async () => {
    Object.defineProperty(process, 'platform', { value: 'win32' });
    try {
      await expect(describeMacOSService({ artifact, pid: 4321 })).rejects.toThrow('unsupported on this platform');
    } finally {
      Object.defineProperty(process, 'platform', { value: 'darwin' });
    }
    await expect(describeMacOSService({ artifact: { ...artifact, provider: 'windows' }, pid: 4321 })).rejects.toThrow(
      'A macOS native driver artifact is required.',
    );

    expect(mockVerify).not.toHaveBeenCalled();
    expect(helper.launches).toHaveLength(0);
  });

  test.each<[string, Record<string, unknown>]>([
    ['a Windows platform', { ...identity, platform: 'windows' }],
    ['a start time with 100 ns precision', { ...identity, startedAt: '2026-11-03T21:00:00.1234567Z' }],
    ['a Windows session label', { ...identity, interactiveSession: 'windows-session:2' }],
    ['a Windows executable path', { ...identity, executablePath: 'C:\\node.exe' }],
    ['a control character in the executable path', { ...identity, executablePath: '/bin/node\u0000' }],
  ])('refuses an answer with %s', async (_description, described) => {
    helper.answer({ identity: described, ok: true });

    await expect(describeMacOSService({ artifact, pid: 4321 })).rejects.toMatchObject({ message: undescribed, reason: 'helper' });
  });

  test('maps a helper refusal to a fixed message and a non-enumerable reason', async () => {
    helper.answer({ detail: '/Users/agent/secret', ok: false, reason: 'session' });

    const error = await describeMacOSService({ artifact, pid: 4321 }).catch((caught: Error) => caught);

    expect(error).toMatchObject({ message: undescribed, reason: 'session' });
    expect(Object.keys(error as Error)).toEqual([]);
    expect(String(error)).not.toContain('secret');
  });
});

describe('createMacOSServiceVerifier', () => {
  const verdict = (answer: Record<string, unknown>) => {
    helper.answer(answer);
    return createMacOSServiceVerifier({ artifact })(claim, url);
  };

  test('refuses a Windows artifact when created', () => {
    expect(() => createMacOSServiceVerifier({ artifact: { ...artifact, provider: 'windows' } })).toThrow(TypeError);
  });

  test('resolves true only when the helper verified the claim, and sends only the identity fields', async () => {
    helper.answer({ ok: true, verified: true });

    await expect(createMacOSServiceVerifier({ artifact })({ ...claim, grant: 'fdg1.secret' } as never, url)).resolves.toBe(true);

    expect(requests()).toEqual([{ operation: 'verify', service: claim, url }]);
    expect(helper.launches[0].request).not.toContain('secret');
  });

  test.each<[string, Record<string, unknown>]>([
    ['a shared listener', { ok: true, reason: 'listener', verified: false }],
    ['a claim the helper cannot read', { ok: false, reason: 'request' }],
  ])('resolves false for %s', async (_description, answer) => {
    await expect(verdict(answer)).resolves.toBe(false);
  });

  test('resolves false for a Windows claim without launching the helper', async () => {
    await expect(createMacOSServiceVerifier({ artifact })({ ...claim, platform: 'windows' }, url)).resolves.toBe(false);

    expect(mockVerify).not.toHaveBeenCalled();
    expect(helper.launches).toHaveLength(0);
  });

  test.each<[string, Record<string, unknown>]>([
    ['a verdict with unexpected fields', { extra: 1, ok: true, verified: true }],
    ['a refusal other than a malformed request', { ok: false, reason: 'io' }],
  ])('rejects, and never resolves true, for %s', async (_description, answer) => {
    await expect(verdict(answer)).rejects.toMatchObject({ message: unavailable, reason: 'helper' });
  });

  test('rejects when the helper cannot answer', async () => {
    helper.output('{"ok":true,"verified":true}', 1);

    await expect(createMacOSServiceVerifier({ artifact })(claim, url)).rejects.toMatchObject({ message: unavailable, reason: 'helper' });
  });
});
