import type { NativeDriverArtifact } from '../native/types';
import { FakeAuthorityHelper } from '../native/windows/fakeAuthorityHelper';
import { createMacOSApplicationProbe } from './macosApplicationProbe';

const mockSpawn = jest.fn();
jest.mock('node:child_process', () => ({ spawn: (...args: unknown[]) => mockSpawn(...args) }));
const mockVerify = jest.fn();
jest.mock('../native/nativeDriver', () => ({ verifyNativeDriverArtifact: (...args: unknown[]) => mockVerify(...args) }));

const originalPlatform = Object.getOwnPropertyDescriptor(process, 'platform') as PropertyDescriptor;
const verifiedPath = '/verified/furn-desktop-driver-host';
const artifact = { executablePath: '/cache/furn-desktop-driver-host', provider: 'macos' } as NativeDriverArtifact;
const incarnation = { processId: 4321, processStartedAt: '2026-11-03T21:00:00.123Z' };

let helper: FakeAuthorityHelper;

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

describe('createMacOSApplicationProbe', () => {
  test('asks the verified helper about the exact incarnation and returns its state', async () => {
    helper.answer({ ok: true, state: 'exited' }).answer({ ok: true, state: 'running' });
    const probe = createMacOSApplicationProbe({ artifact });

    await expect(probe(incarnation)).resolves.toBe('exited');
    await expect(probe(incarnation)).resolves.toBe('running');

    expect(mockVerify).toHaveBeenCalledTimes(1);
    expect(helper.launches[0]).toMatchObject({ args: ['--application-incarnation'], executable: verifiedPath });
    expect(JSON.parse(helper.launches[0].request)).toEqual({ pid: 4321, startedAt: incarnation.processStartedAt });
  });

  test('answers unknown for an incarnation it cannot ask about or the helper cannot read', async () => {
    helper.answer({ ok: false, reason: 'request' });
    const probe = createMacOSApplicationProbe({ artifact });

    await expect(probe({ processId: 0, processStartedAt: incarnation.processStartedAt })).resolves.toBe('unknown');
    await expect(probe({ processId: 1, processStartedAt: '' })).resolves.toBe('unknown');
    expect(helper.launches).toHaveLength(0);
    await expect(probe(incarnation)).resolves.toBe('unknown');
  });

  test('rejects rather than guessing when the helper answers outside the contract', async () => {
    helper.answer({ ok: true, state: 'gone' }).answer({ extra: 1, ok: true, state: 'exited' });
    const probe = createMacOSApplicationProbe({ artifact });

    await expect(probe(incarnation)).rejects.toThrow('The macOS application probe is unavailable.');
    await expect(probe(incarnation)).rejects.toThrow('The macOS application probe is unavailable.');
  });

  test('refuses another platform or a Windows artifact', () => {
    expect(() => createMacOSApplicationProbe({ artifact: { ...artifact, provider: 'windows' } })).toThrow(TypeError);
    Object.defineProperty(process, 'platform', { value: 'win32' });
    try {
      expect(() => createMacOSApplicationProbe({ artifact })).toThrow('unsupported on this platform');
    } finally {
      Object.defineProperty(process, 'platform', { value: 'darwin' });
    }
  });
});
