import { NativeDesktopHost, NativeDriverError } from '@fluentui-react-native/desktop-driver';
import type { NativeDriverArtifact } from '@fluentui-react-native/desktop-driver';
import { describeMacOSService } from '@fluentui-react-native/desktop-driver/authority';
import { verifyNativeDriverArtifact } from '@fluentui-react-native/desktop-driver/native';

import { createDesktopMacOSApplicationInspector } from './macosApplicationInspector';

jest.mock('@fluentui-react-native/desktop-driver', () => ({
  ...jest.requireActual('@fluentui-react-native/desktop-driver'),
  NativeDesktopHost: jest.fn(),
}));
jest.mock('@fluentui-react-native/desktop-driver/authority', () => ({
  ...jest.requireActual('@fluentui-react-native/desktop-driver/authority'),
  describeMacOSService: jest.fn(),
}));
jest.mock('@fluentui-react-native/desktop-driver/native', () => ({
  ...jest.requireActual('@fluentui-react-native/desktop-driver/native'),
  verifyNativeDriverArtifact: jest.fn(),
}));

const artifact: NativeDriverArtifact = {
  architecture: 'arm64',
  artifactId: 'fixture',
  artifactRoot: '/private/fixture',
  buildFingerprint: 'fixture',
  buildId: 'fixture',
  compatibilityKey: 'fixture',
  configuration: 'release',
  endpoints: ['macos'],
  executablePath: '/private/fixture/driver',
  features: ['inspectApplication'],
  origin: 'cache',
  provider: 'macos',
  schemaVersion: 1,
  signing: { mode: 'adhoc' },
  sourceDigest: 'fixture',
  wireProtocol: { major: 1, minor: 0 },
};
const selector = { bundleIdentifier: 'com.example.storybook', windowTitle: 'Storybook' };
const identity = { processId: 123, processStartedAt: '2026-11-12T00:00:00.123456Z' };
const described = {
  platform: 'macos' as const,
  pid: identity.processId,
  startedAt: identity.processStartedAt,
  executablePath: '/Applications/Storybook.app/Contents/MacOS/Storybook',
  interactiveSession: 'macos-session:1',
};

describe('verified macOS application inspection', () => {
  const verify = jest.mocked(verifyNativeDriverArtifact);
  const describe = jest.mocked(describeMacOSService);
  const createHost = jest.mocked(NativeDesktopHost);
  const host = {
    inspectApplication: jest.fn(async () => identity),
    dispose: jest.fn(async () => undefined),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    host.inspectApplication.mockReset().mockResolvedValue(identity);
    host.dispose.mockReset().mockResolvedValue(undefined);
    verify.mockResolvedValue(artifact);
    describe.mockResolvedValue(described);
    createHost.mockImplementation(() => host as unknown as NativeDesktopHost);
  });

  test('verifies the helper and observes the same native incarnation before and after describing its executable', async () => {
    const inspector = await createDesktopMacOSApplicationInspector({ artifact, selector, targetId: 'storybook' });
    const signal = new AbortController().signal;
    await expect(inspector.inspect(signal)).resolves.toEqual({ ...identity, executablePath: described.executablePath });
    expect(verify).toHaveBeenCalledWith(artifact);
    expect(createHost).toHaveBeenCalledWith(expect.objectContaining({ application: selector, artifact, endpoint: 'macos' }));
    expect(host.inspectApplication).toHaveBeenCalledTimes(2);
    expect(host.inspectApplication).toHaveBeenCalledWith(
      expect.objectContaining({ endpoint: 'macos', host, id: 'storybook', launchModes: ['attach'] }),
      signal,
    );
    expect(describe).toHaveBeenCalledWith({ artifact, pid: identity.processId });
    await inspector.close();
    expect(host.dispose).toHaveBeenCalledTimes(1);
  });

  test.each(['described', 'confirmed'])('rejects an incarnation changed during %s inspection', async (stage) => {
    if (stage === 'described') describe.mockResolvedValue({ ...described, startedAt: '2026-11-12T00:00:00.123457Z' });
    else host.inspectApplication.mockResolvedValueOnce(identity).mockResolvedValueOnce({ ...identity, processId: 456 });
    const inspector = await createDesktopMacOSApplicationInspector({ artifact, selector, targetId: 'storybook' });
    await expect(inspector.inspect(new AbortController().signal)).rejects.toThrow('changed during identity inspection');
    await inspector.close();
  });

  test('distinguishes no running application from an ambiguous or unverifiable observation', async () => {
    const inspector = await createDesktopMacOSApplicationInspector({ artifact, selector, targetId: 'storybook' });
    host.inspectApplication.mockRejectedValueOnce(
      new NativeDriverError('attach-failed', 'No application', { reason: 'no-matching-application' }),
    );
    await expect(inspector.inspect(new AbortController().signal)).resolves.toBeUndefined();
    host.inspectApplication.mockRejectedValueOnce(new NativeDriverError('ambiguous-target', 'Multiple windows'));
    await expect(inspector.inspect(new AbortController().signal)).rejects.toMatchObject({ code: 'ambiguous-target' });
    expect(describe).not.toHaveBeenCalled();
    await inspector.close();
  });

  test('refuses a selector that contains a legacy lease before verifying or starting the helper', async () => {
    await expect(
      createDesktopMacOSApplicationInspector({
        artifact,
        targetId: 'storybook',
        selector: { ...selector, leasePath: '/private/lease.json' } as typeof selector,
      }),
    ).rejects.toThrow('lease-free');
    expect(verify).not.toHaveBeenCalled();
    expect(createHost).not.toHaveBeenCalled();
  });
});
