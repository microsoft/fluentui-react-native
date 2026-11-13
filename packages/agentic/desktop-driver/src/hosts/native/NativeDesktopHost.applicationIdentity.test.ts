import type { DesktopTarget } from '../../host/types';
import type { NativeDriverArtifact } from '../../native/types';
import { scriptNativeHelper } from '../../testing/scriptedNativeHelper';
import { NativeDesktopHost } from './NativeDesktopHost';

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

test.each(['windows', 'win32'] as const)('reports inspection as unsupported on %s without spawning a helper', async (endpoint) => {
  const native = new NativeDesktopHost({
    application,
    artifact: { ...artifact, endpoints: ['windows', 'win32'], provider: 'windows' },
    endpoint,
  });
  await expect(native.inspectApplication({ ...registration, endpoint, host: native })).rejects.toMatchObject({
    name: 'HostUnsupportedError',
  });
  expect(mockSpawn).not.toHaveBeenCalled();
});
