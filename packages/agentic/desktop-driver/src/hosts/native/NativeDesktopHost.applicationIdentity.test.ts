import type { DesktopTarget } from '../../host/types';
import type { NativeDriverArtifact } from '../../native/types';
import { scriptNativeHelper } from '../../testing/scriptedNativeHelper';
import { NativeDesktopHost } from './NativeDesktopHost';
import { encodeJsonFrame } from './framing';

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
  features: ['inspectApplication'],
  origin: 'cache',
  provider: 'macos',
  schemaVersion: 1,
  signing: { mode: 'none' },
  sourceDigest: 'source',
  wireProtocol: { major: 1, minor: 0 },
};
const identity = { processId: 123, processStartedAt: '2026-11-12T00:00:00.123456Z' };
const windowsIdentity = {
  processId: 456,
  processStartedAt: '2026-11-12T00:00:00.1234567Z',
  executablePath: 'C:\\apps\\ReactTest.exe',
  interactiveSession: 'windows-session:2',
};
const windowsArtifact: NativeDriverArtifact = {
  ...artifact,
  architecture: 'x64',
  endpoints: ['windows', 'win32'],
  provider: 'windows',
};
const application = { leaseNonce: 'workload-nonce', leasePath: 'workload-lease.json', windowTitle: 'Storybook' };
const registration = { endpoint: 'macos', id: 'storybook', platformName: 'macos' } satisfies Omit<DesktopTarget, 'host'>;

function host() {
  return new NativeDesktopHost({ application, artifact, endpoint: 'macos' });
}

beforeEach(() => {
  mockSpawn.mockReset();
});

test('identity inspection preserves the controlling session and still excludes a foreign helper', async () => {
  let controller: number | undefined;
  const requests = [0, 1].map((owner) =>
    scriptNativeHelper(mockSpawn, (request, send) => {
      const respond = (result: unknown) => send({ id: request.id, result, type: 'response' });
      if (request.command === 'attach') {
        if (controller !== undefined) {
          send({
            error: {
              code: 'attach-failed',
              message: 'Another service controls this incarnation.',
              data: { reason: 'application-lock-busy' },
            },
            id: request.id,
            type: 'response',
          });
        } else {
          controller = owner;
          respond({ ...identity, id: `lease-${owner}`, ownership: 'attached' });
        }
      } else if (request.command === 'inspectApplication') {
        respond(identity);
      } else if (request.command === 'closeApplication') {
        controller = undefined;
        respond({});
      } else if (request.command === 'windows') {
        respond([{ id: `window-${controller}`, title: application.windowTitle, rect: { x: 0, y: 0, width: 100, height: 100 } }]);
      }
    }),
  );
  const owner = host();
  const foreign = host();
  try {
    const lease = await owner.attach({ ...registration, host: owner });
    const before = await owner.windows(lease);
    await expect(owner.inspectApplication({ ...registration, host: owner })).resolves.toEqual(identity);
    // Observation from another helper is not a controlling attachment either.
    await expect(foreign.inspectApplication({ ...registration, host: foreign })).resolves.toEqual(identity);
    await expect(foreign.attach({ ...registration, host: foreign })).rejects.toMatchObject({
      code: 'attach-failed',
      data: { reason: 'application-lock-busy' },
    });
    await expect(owner.windows(lease)).resolves.toEqual(before);
    expect(requests[0].find((request) => request.command === 'inspectApplication')?.params).toMatchObject({
      application,
      endpoint: 'macos',
      targetId: registration.id,
    });
    expect(requests[0].filter((request) => request.command === 'attach')).toHaveLength(1);
    await owner.closeApplication(lease);
    await expect(foreign.attach({ ...registration, host: foreign })).resolves.toMatchObject({ ...identity, ownership: 'attached' });
  } finally {
    await Promise.all([owner.dispose(), foreign.dispose()]);
  }
});

test.each([
  null,
  { ...identity, processId: 0 },
  { ...identity, processId: 1.5 },
  { ...identity, processId: 0x80000000 },
  { ...identity, processStartedAt: '2026-11-12T00:00:00.123Z' },
  { ...identity, processStartedAt: '2026-99-12T00:00:00.123456Z' },
  { ...identity, id: 'unexpected-controlling-lease' },
])('rejects an unverifiable identity response %j', async (result) => {
  scriptNativeHelper(mockSpawn, (request, send) => send({ id: request.id, result, type: 'response' }));
  const native = host();
  try {
    await expect(native.inspectApplication({ ...registration, host: native })).rejects.toMatchObject({
      data: { nativeCode: 'invalid-application-identity' },
    });
  } finally {
    await native.dispose();
  }
});

test.each([
  { ...windowsIdentity, processId: 0 },
  { ...windowsIdentity, executablePath: 'ReactTest.exe' },
  { ...windowsIdentity, interactiveSession: undefined },
  { ...windowsIdentity, processStartedAt: '2026-11-12T00:00:00.123456Z' },
  { ...windowsIdentity, aumid: '' },
  { ...windowsIdentity, unexpected: 'field' },
])('rejects invalid recovery authority before native dispatch %j', async (identity) => {
  const received = windowsHelper({ state: 'exited' });
  const native = new NativeDesktopHost({ application: {}, artifact: windowsArtifact, endpoint: 'windows' });
  try {
    await expect(native.recoverApplication(identity)).rejects.toMatchObject({
      data: { nativeCode: 'invalid-application-identity' },
    });
    expect(received).toHaveLength(0);
    expect(mockSpawn).not.toHaveBeenCalled();
  } finally {
    await native.dispose();
  }
});

test('exact recovery sends only the recorded incarnation and requires a native exit verdict', async () => {
  const received = windowsHelper({ state: 'exited' });
  const native = new NativeDesktopHost({ application: {}, artifact: windowsArtifact, endpoint: 'win32' });
  try {
    await expect(native.recoverApplication(windowsIdentity)).resolves.toBeUndefined();
    expect(received).toHaveLength(1);
    expect(received[0]).toMatchObject({
      command: 'recoverApplication',
      params: { endpoint: 'win32', identity: windowsIdentity },
    });
  } finally {
    await native.dispose();
  }
});

test.each([null, {}, { state: 'unknown' }, { state: 'exited', unverified: true }])(
  'an incomplete recovery verdict stays fenced %j',
  async (result) => {
    windowsHelper(result);
    const native = new NativeDesktopHost({ application: {}, artifact: windowsArtifact, endpoint: 'windows' });
    try {
      await expect(native.recoverApplication(windowsIdentity)).rejects.toMatchObject({
        data: { nativeCode: 'application-recovery-unsettled' },
      });
    } finally {
      await native.dispose();
    }
  },
);

test('does not silently replace inspection with a controlling attach on an old helper', async () => {
  const received = scriptNativeHelper(mockSpawn, (request, send) =>
    send({ error: { code: 'unsupported-operation', message: 'Unsupported command.' }, id: request.id, type: 'response' }),
  );
  const native = host();
  try {
    await expect(native.inspectApplication({ ...registration, host: native })).rejects.toMatchObject({ name: 'HostUnsupportedError' });
    expect(received.map((request) => request.command)).toEqual(['inspectApplication']);
  } finally {
    await native.dispose();
  }
});

function windowsHelper(result: unknown) {
  return scriptNativeHelper(
    mockSpawn,
    (request, send) => send({ id: request.id, result, type: 'response' }),
    ['inspectApplication', 'recoverApplication'],
    {
      greeting: () =>
        encodeJsonFrame({
          architecture: 'x64',
          buildId: 'build',
          features: ['inspectApplication', 'recoverApplication'],
          protocol: { major: 1, minor: 0 },
          provider: 'windows',
          sourceDigest: 'source',
          type: 'hello',
        }),
    },
  );
}

test.each(['windows', 'win32'] as const)('inspects exact %s process, executable and session without attaching', async (endpoint) => {
  const received = windowsHelper(windowsIdentity);
  const native = new NativeDesktopHost({ application, artifact: windowsArtifact, endpoint });
  try {
    await expect(native.inspectApplication({ ...registration, endpoint, host: native })).resolves.toEqual(windowsIdentity);
    expect(received.map(({ command }) => command)).toEqual(['inspectApplication']);
  } finally {
    await native.dispose();
  }
});

test.each([{ ...windowsIdentity, aumid: 'package_family!App' }, windowsIdentity])(
  'preserves verified packaged or unpackaged identity evidence %j',
  async (result) => {
    windowsHelper(result);
    const native = new NativeDesktopHost({ application, artifact: windowsArtifact, endpoint: 'windows' });
    try {
      await expect(native.inspectApplication({ ...registration, endpoint: 'windows', host: native })).resolves.toEqual(result);
    } finally {
      await native.dispose();
    }
  },
);

test.each([
  { ...windowsIdentity, executablePath: 'ReactTest.exe' },
  { ...windowsIdentity, executablePath: 'C:\\apps\\bad\u0000.exe' },
  { ...windowsIdentity, interactiveSession: undefined },
  { ...windowsIdentity, interactiveSession: 'macos-session:2' },
  { ...windowsIdentity, processStartedAt: '2026-11-12T00:00:00.123456Z' },
  { ...windowsIdentity, aumid: '' },
  { ...windowsIdentity, id: 'controlling-lease' },
])('rejects incomplete or ambiguous Windows inspection evidence %j', async (result) => {
  windowsHelper(result);
  const native = new NativeDesktopHost({ application, artifact: windowsArtifact, endpoint: 'windows' });
  try {
    await expect(native.inspectApplication({ ...registration, endpoint: 'windows', host: native })).rejects.toMatchObject({
      data: { nativeCode: 'invalid-application-identity' },
    });
  } finally {
    await native.dispose();
  }
});
