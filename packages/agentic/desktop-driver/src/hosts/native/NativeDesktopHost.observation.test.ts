import { EventEmitter } from 'node:events';
import { PassThrough } from 'node:stream';

import type { NativeObserveRequest } from '../../host/types';
import type { NativeDriverArtifact, NativeHostJsonMessage } from '../../native/types';
import { encodeJsonFrame, NativeFrameDecoder } from './framing';
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
  features: [],
  origin: 'cache',
  provider: 'macos',
  schemaVersion: 1,
  signing: { mode: 'none' },
  sourceDigest: 'source',
  wireProtocol: { major: 1, minor: 0 },
};

const request: NativeObserveRequest = {
  budget: { deadlineMs: 1_000, maxBytes: 65_536, maxDepth: 4, maxStringLength: 64, maxVisited: 50 },
  facts: ['enabled'],
  windowId: 'w1',
};

const sample = {
  complete: true,
  elapsedMs: 1,
  nodes: [{ childrenState: 'none', depth: 0, id: 'e1', role: 'window', scope: 'application' }],
  truncation: [],
  unsupportedFacts: [],
};

class FakeChild extends EventEmitter {
  readonly stdin = new PassThrough();
  readonly stdout = new PassThrough();
  readonly stderr = new PassThrough();
  exitCode: number | null = null;
  signalCode: NodeJS.Signals | null = null;

  kill(): boolean {
    this.finish();
    return true;
  }

  finish(): void {
    this.exitCode = 0;
    setImmediate(() => {
      this.emit('exit', 0, null);
      this.emit('close', 0, null);
    });
  }
}

type Send = (message: NativeHostJsonMessage) => void;

/** A host whose helper answers each request through `handler`; the helper acknowledges `dispose` and exits. */
function createHost(handler: (message: Extract<NativeHostJsonMessage, { type: 'request' }>, send: Send) => void) {
  const child = new FakeChild();
  const decoder = new NativeFrameDecoder();
  const received: Extract<NativeHostJsonMessage, { type: 'request' }>[] = [];
  const send: Send = (message) => void child.stdout.write(encodeJsonFrame(message));
  child.stdin.on('data', (chunk: Buffer) => decoder.write(chunk));
  decoder.on('json', (message) => {
    if (message.type !== 'request') {
      return;
    }
    if (message.command === 'dispose') {
      send({ id: message.id, result: {}, type: 'response' });
      child.finish();
      return;
    }
    received.push(message);
    handler(message, send);
  });
  mockSpawn.mockImplementationOnce(() => {
    setImmediate(() =>
      send({
        architecture: 'arm64',
        buildId: 'build',
        features: ['boundedObservation'],
        protocol: { major: 1, minor: 0 },
        provider: 'macos',
        sourceDigest: 'source',
        type: 'hello',
      }),
    );
    return child;
  });
  return { host: new NativeDesktopHost({ application: { windowTitle: 'Test App' }, artifact, endpoint: 'macos' }), received };
}

describe('NativeDesktopHost bounded observation', () => {
  beforeEach(() => {
    mockSpawn.mockReset();
  });

  test('sends the request as written and returns the helper sample', async () => {
    const { host, received } = createHost((message, send) => send({ id: message.id, result: sample, type: 'response' }));

    await expect(host.observe(request)).resolves.toEqual(sample);

    expect(received).toMatchObject([{ command: 'observe', params: request }]);
    await host.dispose();
  });

  test('rejects a request outside the contract before starting the helper', async () => {
    const { host } = createHost(() => undefined);

    await expect(host.observe({ ...request, budget: { ...request.budget, maxVisited: 0 } })).rejects.toMatchObject({
      code: 'invalid argument',
    });
    await expect(host.observe({ ...request, facts: ['enabled', 'enabled'] })).rejects.toMatchObject({ code: 'invalid argument' });
    await expect(host.releaseElements(['a', 'a'])).rejects.toMatchObject({ code: 'invalid argument' });

    expect(mockSpawn).not.toHaveBeenCalled();
  });

  test.each<[string, unknown]>([
    ['a completeness claim that contradicts its truncation', { ...sample, complete: false }],
    ['a field nobody requested', { ...sample, nodes: [{ ...sample.nodes[0], value: 'secret' }] }],
    ['a node that is not the root', { ...sample, nodes: [{ ...sample.nodes[0], depth: 1, parentId: 'e0' }] }],
    ['no nodes and no capacity limit', { ...sample, nodes: [] }],
    ['a result that is not an object', 'sample'],
  ])('fails closed on %s', async (_name, result) => {
    const { host } = createHost((message, send) => send({ id: message.id, result, type: 'response' }));

    await expect(host.observe(request)).rejects.toMatchObject({
      code: 'unknown error',
      data: { nativeCode: 'invalid-observation' },
      message: expect.stringContaining('invalid observation'),
    });
    await host.dispose();
  });

  test('reports a helper without the feature as unsupported', async () => {
    const { host } = createHost((message, send) =>
      send({ error: { code: 'unsupported-operation', message: 'Unsupported command "observe".' }, id: message.id, type: 'response' }),
    );

    await expect(host.observe(request)).rejects.toMatchObject({ name: 'HostUnsupportedError' });
    await host.dispose();
  });

  test('translates the helper failures a read can raise', async () => {
    const { host } = createHost((message, send) =>
      send({ error: { code: 'stale-element', message: 'The root is gone.' }, id: message.id, type: 'response' }),
    );

    await expect(host.observe({ ...request, rootId: 'e9' })).rejects.toMatchObject({ name: 'HostStaleError' });
    await host.dispose();
  });

  test('releases ids and returns the number the helper dropped', async () => {
    const { host, received } = createHost((message, send) => send({ id: message.id, result: { released: 1 }, type: 'response' }));

    await expect(host.releaseElements(['e1', 'e2'])).resolves.toBe(1);

    expect(received).toMatchObject([{ command: 'releaseElements', params: { ids: ['e1', 'e2'] } }]);
    await host.dispose();
  });

  test.each<[string, unknown]>([
    ['more than were asked', { released: 3 }],
    ['a negative count', { released: -1 }],
    ['a fraction', { released: 0.5 }],
    ['a missing count', {}],
  ])('fails closed on a release count of %s', async (_name, result) => {
    const { host } = createHost((message, send) => send({ id: message.id, result, type: 'response' }));

    await expect(host.releaseElements(['e1', 'e2'])).rejects.toMatchObject({ data: { nativeCode: 'invalid-release' } });
    await host.dispose();
  });
});
