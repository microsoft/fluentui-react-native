import { EventEmitter } from 'node:events';
import { PassThrough } from 'node:stream';

import type { NativeDriverArtifact, NativeHostJsonMessage } from '../../native/types';
import { readFailureEffect } from '../../protocol/settlement';
import { encodeJsonFrame, NativeFrameDecoder } from './framing';
import { NativeHostProcess } from './NativeHostProcess';

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

/** Starts a host whose helper answers each frame through `handler`; `dispose` is acknowledged and exits. */
async function startHost(handler: (message: NativeHostJsonMessage, send: Send) => void): Promise<NativeHostProcess> {
  const child = new FakeChild();
  const decoder = new NativeFrameDecoder();
  const send: Send = (message) => void child.stdout.write(encodeJsonFrame(message));
  child.stdin.on('data', (chunk: Buffer) => decoder.write(chunk));
  decoder.on('json', (message) => {
    if (message.type === 'request' && message.command === 'dispose') {
      send({ id: message.id, result: {}, type: 'response' });
      child.finish();
      return;
    }
    handler(message, send);
  });
  mockSpawn.mockImplementationOnce(() => {
    setImmediate(() =>
      send({
        architecture: 'arm64',
        buildId: 'build',
        features: [],
        protocol: { major: 1, minor: 0 },
        provider: 'macos',
        sourceDigest: 'source',
        type: 'hello',
      }),
    );
    return child;
  });
  return NativeHostProcess.start({ artifact });
}

async function failureOf(request: Promise<unknown>): Promise<unknown> {
  return request.then(
    () => {
      throw new Error('Expected the request to fail.');
    },
    (error: unknown) => error,
  );
}

describe('NativeHostProcess mutation effects', () => {
  beforeEach(() => {
    mockSpawn.mockReset();
  });

  test('carries the effect a provider reports on an error response', async () => {
    const host = await startHost((message, send) => {
      if (message.type === 'request') {
        send({ error: { code: 'element-not-interactable', effect: 'none', message: 'Not clickable.' }, id: message.id, type: 'response' });
      }
    });

    const failure = await failureOf(host.request('click', { elementId: 'a' }));

    expect(failure).toMatchObject({ code: 'element-not-interactable' });
    expect(readFailureEffect(failure)).toBe('none');
    await host.dispose();
  });

  test.each([undefined, 'bogus'])('leaves an unreported or invalid effect %p absent so the failure stays indeterminate', async (effect) => {
    const host = await startHost((message, send) => {
      if (message.type === 'request') {
        send({
          error: { code: 'operation-failed', effect: effect as never, message: 'Failed.' },
          id: message.id,
          type: 'response',
        });
      }
    });

    expect(readFailureEffect(await failureOf(host.request('click', { elementId: 'a' })))).toBeUndefined();
    await host.dispose();
  });

  test.each([
    ['partial', 'partial'],
    ['none', 'none'],
    [undefined, 'unknown'],
  ] as const)('reports a cancelled command with effect %p as %p', async (reported, expected) => {
    const host = await startHost((message, send) => {
      if (message.type === 'cancel') {
        send({ effect: reported, id: message.id, type: 'cancelled' });
      }
    });
    const controller = new AbortController();

    const request = host.request('performActions', { actions: [] }, controller.signal);
    controller.abort();
    const failure = await failureOf(request);

    expect(failure).toMatchObject({ name: 'AbortError' });
    expect(readFailureEffect(failure)).toBe(expected);
    await host.dispose();
  });

  test('treats a command that completes after its cancellation as applied', async () => {
    const host = await startHost((message, send) => {
      if (message.type === 'cancel') {
        send({ id: message.id, result: {}, type: 'response' });
      }
    });
    const controller = new AbortController();

    const request = host.request('click', { elementId: 'a' }, controller.signal);
    controller.abort();
    const failure = await failureOf(request);

    expect(failure).toMatchObject({ name: 'AbortError' });
    expect(readFailureEffect(failure)).toBe('applied');
    await host.dispose();
  });

  test('reports a command cancelled before dispatch as having no effect and sends nothing', async () => {
    const received: NativeHostJsonMessage[] = [];
    const host = await startHost((message) => {
      received.push(message);
    });
    const controller = new AbortController();
    controller.abort();

    const failure = await failureOf(host.request('click', { elementId: 'a' }, controller.signal));

    expect(readFailureEffect(failure)).toBe('none');
    expect(received).toEqual([]);
    await host.dispose();
  });
});
