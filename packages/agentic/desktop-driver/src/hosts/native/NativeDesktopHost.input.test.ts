import type { DesktopHostFeatures } from '../../host/types';
import type { NativeDriverArtifact } from '../../native/types';
import { readFailureEffect } from '../../protocol/settlement';
import { scriptNativeHelper } from '../../testing/scriptedNativeHelper';
import type { ScriptedNativeRequest } from '../../testing/scriptedNativeHelper';
import { FURN_DESKTOP_DRIVER_DISABLED_INPUT_FEATURES, NativeDesktopHost } from './NativeDesktopHost';
import type { NativeDisabledInputFeature } from './NativeDesktopHost';

const mockSpawn = jest.fn();
jest.mock('node:child_process', () => ({ spawn: (...args: unknown[]) => mockSpawn(...args) }));

const artifact: NativeDriverArtifact = {
  architecture: 'arm64',
  artifactId: 'artifact',
  artifactRoot: 'artifact-root',
  buildFingerprint: 'build',
  buildId: 'build',
  compatibilityKey: 'compatibility',
  configuration: 'release',
  endpoints: ['macos'],
  executablePath: 'driver',
  features: [],
  origin: 'cache',
  provider: 'macos',
  schemaVersion: 1,
  signing: { mode: 'none' },
  sourceDigest: 'source',
  wireProtocol: { major: 1, minor: 0 },
};

const features: DesktopHostFeatures = {
  accessibilityClick: true,
  elementScreenshot: true,
  focus: true,
  keyboard: true,
  physicalClick: true,
  screenshot: true,
  setWindowRect: true,
  wheel: true,
};

/** A probed host whose helper clears with the mechanism it was asked for, or reports none when it predates strict clear. */
async function probedHost(strictClear: boolean, disabledInputFeatures: readonly NativeDisabledInputFeature[] = []) {
  const received = scriptNativeHelper(mockSpawn, (message: ScriptedNativeRequest, send) => {
    const params = message.params as { mechanism?: string } | undefined;
    const result =
      message.command === 'probe'
        ? {
            endpoint: 'macos',
            features: { ...features, ...(strictClear ? { strictClear } : {}) },
            platformName: 'macos',
            protocolVersion: 1,
          }
        : message.command === 'clear'
          ? strictClear
            ? { mechanism: params?.mechanism ?? 'semantic' }
            : {}
          : {};
    send({ id: message.id, result, type: 'response' });
  });
  const host = new NativeDesktopHost({ application: { windowTitle: 'Test App' }, artifact, disabledInputFeatures, endpoint: 'macos' });
  await host.probe();
  return { host, received };
}

describe('NativeDesktopHost input delivery', () => {
  beforeEach(() => {
    jest.replaceProperty(process, 'env', { ...process.env, [FURN_DESKTOP_DRIVER_DISABLED_INPUT_FEATURES]: '' });
    mockSpawn.mockReset();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('asks a strict helper for the mechanism, and returns the one it used', async () => {
    const { host, received } = await probedHost(true);

    await expect(host.clear('e1', undefined, 'keyboard')).resolves.toBe('keyboard');
    await expect(host.clear('e1')).resolves.toBe('semantic');

    expect(received.filter((message) => message.command === 'clear')).toMatchObject([
      { params: { elementId: 'e1', mechanism: 'keyboard' } },
      { params: { elementId: 'e1' } },
    ]);
    expect(received[2].params).not.toHaveProperty('mechanism');
    await host.dispose();
  });

  test('clears semantically where the keyboard is masked, and only when the helper can promise to', async () => {
    const strict = await probedHost(true, ['keyboard', 'physicalClick', 'wheel']);
    await expect(strict.host.clear('e1')).resolves.toBe('semantic');
    const keyboard = await strict.host.clear('e1', undefined, 'keyboard').catch((error: unknown) => error);
    expect(keyboard).toMatchObject({ name: 'HostUnsupportedError' });
    expect(readFailureEffect(keyboard)).toBe('none');
    expect(strict.received.filter((message) => message.command === 'clear')).toMatchObject([
      { params: { elementId: 'e1', mechanism: 'semantic' } },
    ]);
    await strict.host.dispose();

    const legacy = await probedHost(false, ['keyboard', 'physicalClick', 'wheel']);
    for (const attempt of [legacy.host.clear('e1'), legacy.host.clear('e1', undefined, 'semantic')]) {
      const failure = await attempt.catch((error: unknown) => error);
      expect(failure).toMatchObject({ name: 'HostUnsupportedError' });
      expect(readFailureEffect(failure)).toBe('none');
    }
    expect(legacy.received.some((message) => message.command === 'clear')).toBe(false);
    await legacy.host.dispose();
  });

  test('leaves a clear unattributed when the helper does not say how it cleared', async () => {
    const { host } = await probedHost(false);

    await expect(host.clear('e1')).resolves.toBeUndefined();
    await host.dispose();
  });

  test('lets a masked target pause, because a pause delivers nothing', async () => {
    const { host, received } = await probedHost(true, ['keyboard', 'physicalClick', 'wheel']);
    const pause = [{ actions: [{ duration: 0, type: 'pause' as const }], id: 'keys', type: 'key' as const }];

    await host.performActions(pause);
    await expect(host.performActions([{ actions: [{ type: 'keyDown', value: 'a' }], id: 'keys', type: 'key' }])).rejects.toMatchObject({
      name: 'HostUnsupportedError',
    });

    expect(received.filter((message) => message.command === 'performActions')).toMatchObject([{ params: { actions: pause } }]);
    await host.dispose();
  });
});
