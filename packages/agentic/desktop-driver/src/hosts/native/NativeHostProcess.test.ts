import type { PassThrough } from 'node:stream';

import type { NativeDriverArtifact, NativeHostHello } from '../../native/types';
import { readFailureEffect } from '../../protocol/settlement';
import { scriptNativeHelperSession } from '../../testing/scriptedNativeHelper';
import type {
  ScriptedNativeControl,
  ScriptedNativeOptions,
  ScriptedNativeRequest,
  ScriptedNativeSend,
} from '../../testing/scriptedNativeHelper';
import { encodeBinaryFrame, encodeJsonFrame } from './framing';
import {
  defaultCancellationTimeoutMs,
  maximumCancellationTimeoutMs,
  minimumCancellationTimeoutMs,
  nativeHelperSpawnOptions,
  NativeHostProcess,
  resolveCancellationTimeoutMs,
} from './NativeHostProcess';
import type { NativeHostProcessOptions } from './NativeHostProcess';

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

type Handler = (message: ScriptedNativeRequest, send: ScriptedNativeSend, control: ScriptedNativeControl) => void;

/** Starts a host whose helper answers each request through `handler`; `dispose` is acknowledged and exits. */
async function startHost(handler: Handler, options: ScriptedNativeOptions = {}, processOptions: Partial<NativeHostProcessOptions> = {}) {
  const session = scriptNativeHelperSession(mockSpawn, handler, [], options);
  const host = await NativeHostProcess.start({ artifact, ...processOptions });
  return { host, ...session };
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
    const { host } = await startHost((message, send) => {
      send({ error: { code: 'element-not-interactable', effect: 'none', message: 'Not clickable.' }, id: message.id, type: 'response' });
    });

    const failure = await failureOf(host.request('click', { elementId: 'a' }));

    expect(failure).toMatchObject({ code: 'element-not-interactable' });
    expect(readFailureEffect(failure)).toBe('none');
    await host.dispose();
  });

  test.each([undefined, 'bogus'])('leaves an unreported or invalid effect %p absent so the failure stays indeterminate', async (effect) => {
    const { host } = await startHost((message, send) => {
      send({
        error: { code: 'operation-failed', effect: effect as never, message: 'Failed.' },
        id: message.id,
        type: 'response',
      });
    });

    expect(readFailureEffect(await failureOf(host.request('click', { elementId: 'a' })))).toBeUndefined();
    await host.dispose();
  });

  test.each([
    ['partial', 'partial'],
    ['none', 'none'],
    [undefined, 'unknown'],
  ] as const)('reports a cancelled command with effect %p as %p', async (reported, expected) => {
    const { host } = await startHost(() => undefined, {
      onCancel: (message, send) => send({ effect: reported, id: message.id, type: 'cancelled' }),
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
    const { host } = await startHost(() => undefined, {
      onCancel: (message, send) => send({ id: message.id, result: {}, type: 'response' }),
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
    const { host, received } = await startHost(() => undefined);
    const controller = new AbortController();
    controller.abort();

    const failure = await failureOf(host.request('click', { elementId: 'a' }, controller.signal));

    expect(readFailureEffect(failure)).toBe('none');
    expect(received).toEqual([]);
    await host.dispose();
  });
});

type FakeChild = { emit(event: string, ...args: unknown[]): boolean; stderr: PassThrough; stdin: PassThrough; stdout: PassThrough };

function spawnedChild(index = 0): FakeChild {
  return (mockSpawn.mock.results[index] as { value: FakeChild }).value;
}

const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/** Lets scripted I/O that is scheduled with `setImmediate` or `process.nextTick` run, under fake timers that leave both real. */
async function settleIo(): Promise<void> {
  for (let turn = 0; turn < 5; turn += 1) {
    await new Promise<void>((resolve) => setImmediate(resolve));
  }
}

const realIo: Parameters<typeof jest.useFakeTimers>[0] = { doNotFake: ['setImmediate', 'nextTick', 'queueMicrotask'] };

const validHello: NativeHostHello = {
  architecture: 'arm64',
  buildId: 'build',
  features: [],
  protocol: { major: 1, minor: 0 },
  provider: 'macos',
  sourceDigest: 'source',
  type: 'hello',
};

describe('NativeHostProcess failure paths', () => {
  beforeEach(() => {
    mockSpawn.mockReset();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('crash', () => {
    test('recovers input, then rejects every pending request once with the exit, which is reported once', async () => {
      const order: string[] = [];
      const recoverInput = jest.fn(async () => {
        order.push('recover');
      });
      const { host } = await startHost((_, __, control) => control.exit(7), {}, { recoverInput });
      const exits: Error[] = [];
      host.on('exit', (error) => exits.push(error));

      const [first, second] = await Promise.all(
        [host.request('click'), host.request('click')].map((request) =>
          failureOf(request).then((failure) => {
            order.push('reject');
            return failure;
          }),
        ),
      );

      expect(first).toMatchObject({ code: 'host-exited', message: expect.stringContaining('code 7') });
      expect(second).toBe(first);
      expect(order).toEqual(['recover', 'reject', 'reject']);
      expect(recoverInput).toHaveBeenCalledTimes(1);
      expect(exits).toHaveLength(1);
      expect(exits[0]).toBe(first);
      await expect(host.dispose()).resolves.toBeUndefined();
      expect(readFailureEffect(await failureOf(host.request('click')))).toBe('none');
    });

    test('recovers input and rejects the disposal when the helper exits instead of acknowledging it', async () => {
      const recoverInput = jest.fn(() => Promise.resolve());
      const { control, host } = await startHost(() => undefined, { dispose: 'ignore' }, { recoverInput });

      const disposal = failureOf(host.dispose());
      control.exit(1);

      expect(await disposal).toMatchObject({ code: 'host-exited', message: expect.stringContaining('before acknowledging disposal') });
      expect(recoverInput).toHaveBeenCalledTimes(1);
    });

    test('does not mistake an exit that overtakes the final acknowledgement for a crash', async () => {
      const recoverInput = jest.fn(() => Promise.resolve());
      const { control, host } = await startHost(() => undefined, { dispose: 'exit-then-acknowledge', pipeHold: 60 }, { recoverInput });
      const exits: Error[] = [];
      host.on('exit', (error) => exits.push(error));

      await expect(host.dispose()).resolves.toBeUndefined();

      expect(recoverInput).not.toHaveBeenCalled();
      expect(exits).toEqual([]);
      expect(control.signals).toEqual([]);
    });

    test('fails the transport when writing a request fails, after recovering input', async () => {
      const order: string[] = [];
      const recoverInput = jest.fn(async () => {
        order.push('recover');
      });
      const { host } = await startHost(() => undefined, {}, { recoverInput });
      spawnedChild().stdin.destroy();

      const failure = await failureOf(host.request('click'));
      order.push('reject');

      expect(failure).toMatchObject({ code: 'host-closed' });
      expect(order).toEqual(['recover', 'reject']);
    });

    test.each(['stdout', 'stderr', 'stdin', 'process'])(
      'fails the transport instead of throwing when the %s emits an error',
      async (source) => {
        const recoverInput = jest.fn(() => Promise.resolve());
        const { host } = await startHost(() => undefined, {}, { recoverInput });
        const child = spawnedChild();
        const cause = new Error('pipe broke');

        const request = failureOf(host.request('wait'));
        (source === 'process' ? child : child[source as 'stderr' | 'stdin' | 'stdout']).emit('error', cause);

        expect(await request).toBe(cause);
        expect(recoverInput).toHaveBeenCalledTimes(1);
      },
    );

    test('combines a failed input recovery with the failure it followed', async () => {
      const recoverInput = jest.fn(() => Promise.reject(new Error('release failed')));
      const { host } = await startHost((_, __, control) => control.exit(1), {}, { recoverInput });

      const failure = await failureOf(host.request('click'));

      expect(failure).toBeInstanceOf(AggregateError);
      expect((failure as AggregateError).errors).toEqual([
        expect.objectContaining({ code: 'host-exited' }),
        expect.objectContaining({ message: 'release failed' }),
      ]);
    });
  });

  describe('cancellation and disposal deadlines', () => {
    test('kills a helper that ignores cancel and rejects every pending request', async () => {
      const recoverInput = jest.fn(() => Promise.resolve());
      const { control, host } = await startHost(() => undefined, {}, { cancellationTimeoutMs: 100, recoverInput });
      const abort = new AbortController();

      const cancelled = failureOf(host.request('wait', undefined, abort.signal));
      const other = failureOf(host.request('other'));
      abort.abort();
      const failure = await cancelled;

      expect(failure).toMatchObject({ code: 'cancellation-timeout' });
      expect(await other).toBe(failure);
      expect(control.signals).toEqual(['SIGTERM']);
      expect(recoverInput).toHaveBeenCalledTimes(1);
    });

    test('escalates to SIGKILL when the helper survives SIGTERM', async () => {
      jest.useFakeTimers(realIo);
      const { control, host } = await startHost(() => undefined, { survivesSigterm: true }, { cancellationTimeoutMs: 100 });
      const abort = new AbortController();

      const cancelled = failureOf(host.request('wait', undefined, abort.signal));
      abort.abort();
      await jest.advanceTimersByTimeAsync(100);
      await settleIo();
      expect(control.signals).toEqual(['SIGTERM']);

      await jest.advanceTimersByTimeAsync(2000);
      await settleIo();
      await jest.advanceTimersByTimeAsync(1000);

      expect(control.signals).toEqual(['SIGTERM', 'SIGKILL']);
      expect(await cancelled).toMatchObject({ code: 'cancellation-timeout' });
    });

    test('settles a disposal the helper never acknowledges once its caller aborts, and shares that disposal', async () => {
      const recoverInput = jest.fn(() => Promise.resolve());
      const { control, host } = await startHost(() => undefined, { dispose: 'ignore' }, { cancellationTimeoutMs: 100, recoverInput });
      const abort = new AbortController();

      const disposal = failureOf(host.dispose(abort.signal));
      const concurrent = failureOf(host.dispose());
      let concurrentSettled = false;
      void concurrent.then(() => {
        concurrentSettled = true;
      });
      await delay(30);
      expect(concurrentSettled).toBe(false);

      abort.abort();
      const failure = await disposal;

      expect(failure).toMatchObject({ code: 'cancellation-timeout' });
      expect(await concurrent).toBe(failure);
      expect(control.signals).toEqual(['SIGTERM']);
      expect(recoverInput).toHaveBeenCalledTimes(1);
      await expect(host.dispose()).resolves.toBeUndefined();
      expect(readFailureEffect(await failureOf(host.request('click')))).toBe('none');
    });

    test('lets a concurrent caller abort the shared disposal', async () => {
      const { control, host } = await startHost(() => undefined, { dispose: 'ignore' }, { cancellationTimeoutMs: 100 });
      const abort = new AbortController();

      const disposal = failureOf(host.dispose());
      const aborted = failureOf(host.dispose(abort.signal));
      abort.abort();

      expect(await aborted).toMatchObject({ code: 'cancellation-timeout' });
      expect(await disposal).toMatchObject({ code: 'cancellation-timeout' });
      expect(control.signals).toEqual(['SIGTERM']);
    });

    test('is idempotent once the helper has closed', async () => {
      const { host } = await startHost(() => undefined);

      await host.dispose();

      await expect(host.dispose()).resolves.toBeUndefined();
      expect(readFailureEffect(await failureOf(host.request('click')))).toBe('none');
    });
  });

  describe('a grandchild holding the pipes', () => {
    test('fails a crashed helper once the pipe grace passes and releases the pipes', async () => {
      jest.useFakeTimers(realIo);
      const recoverInput = jest.fn(() => Promise.resolve());
      const { host } = await startHost((_, __, control) => control.exit(1), { pipeHold: 'held' }, { recoverInput });
      const request = failureOf(host.request('click'));
      await settleIo();

      await jest.advanceTimersByTimeAsync(499);
      expect(recoverInput).not.toHaveBeenCalled();
      await jest.advanceTimersByTimeAsync(2);

      expect(await request).toMatchObject({ code: 'host-exited' });
      expect(recoverInput).toHaveBeenCalledTimes(1);
      expect(spawnedChild().stdout.destroyed).toBe(true);
      expect(spawnedChild().stderr.destroyed).toBe(true);
    });

    test('finishes disposal once the pipe grace passes, without treating it as a crash', async () => {
      jest.useFakeTimers(realIo);
      const recoverInput = jest.fn(() => Promise.resolve());
      const { host } = await startHost(() => undefined, { pipeHold: 'held' }, { recoverInput });

      let disposed = false;
      const disposal = host.dispose().then(() => {
        disposed = true;
      });
      await settleIo();
      await jest.advanceTimersByTimeAsync(499);
      expect(disposed).toBe(false);
      await jest.advanceTimersByTimeAsync(2);
      await disposal;

      expect(recoverInput).not.toHaveBeenCalled();
    });
  });

  describe('malformed helper output', () => {
    test.each([
      ['bytes that are not a frame', () => Buffer.from('this is not a native helper frame'), 'invalid frame magic'],
      ['a message that is not a hello', () => encodeJsonFrame({ id: 'r1', result: {}, type: 'response' }), 'Expected native helper hello'],
      ['a hello with malformed fields', () => encodeJsonFrame({ ...validHello, features: 'all' } as never), 'malformed fields'],
      ['a hello for another build', () => encodeJsonFrame({ ...validHello, buildId: 'other' }), 'does not match the selected artifact'],
    ])('rejects startup after %s and stops the helper', async (_, greeting, message) => {
      const { control } = scriptNativeHelperSession(mockSpawn, () => undefined, [], { greeting });

      await expect(NativeHostProcess.start({ artifact })).rejects.toThrow(message);

      expect(control.signals).toEqual(['SIGTERM']);
    });

    test('routes frames that share a chunk with the hello', async () => {
      scriptNativeHelperSession(mockSpawn, () => undefined, [], {
        greeting: (hello) => Buffer.concat([hello, encodeJsonFrame({ event: 'ready', type: 'event' })]),
      });
      const host = await NativeHostProcess.start({ artifact });
      const events: string[] = [];
      host.on('event', (event) => events.push(event.event));

      await settleIo();

      expect(events).toEqual(['ready']);
      await host.dispose();
    });

    test('fails the transport when garbage follows the hello in the same chunk', async () => {
      const recoverInput = jest.fn(() => Promise.resolve());
      scriptNativeHelperSession(mockSpawn, () => undefined, [], { greeting: (hello) => Buffer.concat([hello, Buffer.alloc(16)]) });
      const host = await NativeHostProcess.start({ artifact, recoverInput });
      const exited = new Promise<Error>((resolve) => host.once('exit', resolve));

      expect((await exited).message).toContain('invalid frame magic');
      expect(recoverInput).toHaveBeenCalledTimes(1);
    });

    test.each([
      ['a response whose shape is wrong', { id: 7, result: {}, type: 'response' }],
      ['an unknown message type', { type: 'shutdown' }],
      ['an unexpected hello', validHello],
    ])('fails the transport on %s', async (_, message) => {
      const { host } = await startHost((_request, send) => send(message as never));

      expect(await failureOf(host.request('click'))).toBeInstanceOf(Error);
    });

    test('fails the transport when a response reuses a binary payload identifier', async () => {
      const { host } = await startHost((message, send) => send({ binary: { id: 'dup' }, id: message.id, result: {}, type: 'response' }));

      const failures = await Promise.all([failureOf(host.request('capture')), failureOf(host.request('capture'))]);

      expect(failures[0]).toMatchObject({ code: 'invalid-message' });
      expect(failures[1]).toBe(failures[0]);
    });

    test('fails the transport on a binary payload nothing declared', async () => {
      const { host } = await startHost((_, __, control) => control.writeStdout(encodeBinaryFrame('undeclared', Uint8Array.from([1]))));

      expect(await failureOf(host.request('capture'))).toMatchObject({ code: 'invalid-message' });
    });

    test('delivers a declared binary payload with its response', async () => {
      const { host } = await startHost((message, send, control) => {
        send({ binary: { id: 'image' }, id: message.id, result: { width: 1 }, type: 'response' });
        control.writeStdout(encodeBinaryFrame('image', Uint8Array.from([1, 2, 3])));
      });

      const result = await host.request<{ width: number }>('capture');

      expect(result.result).toEqual({ width: 1 });
      expect([...(result.binary as Uint8Array)]).toEqual([1, 2, 3]);
      await host.dispose();
    });
  });

  describe('helper stderr', () => {
    test('forwards whole UTF-8 lines even when a character is split between reads', async () => {
      const lines: string[] = [];
      const { control, host } = await startHost(() => undefined, {}, { onStderr: (line) => lines.push(line) });
      const bytes = Buffer.from('héllo 😀\n');

      control.writeStderr(bytes.subarray(0, 2));
      control.writeStderr(bytes.subarray(2, 9));
      control.writeStderr(bytes.subarray(9));
      await settleIo();

      expect(lines).toEqual(['héllo 😀\n']);
      await host.dispose();
    });

    test('keeps working when the diagnostic sink throws', async () => {
      const { control, host } = await startHost(
        (message, send) => send({ id: message.id, result: 'ok', type: 'response' }),
        {},
        {
          onStderr: () => {
            throw new Error('sink failed');
          },
        },
      );

      control.writeStderr('diagnostic\n');

      await expect(host.request('ping')).resolves.toMatchObject({ result: 'ok' });
      await host.dispose();
    });
  });

  describe('startup', () => {
    test('stops the helper and rejects when the startup signal aborts', async () => {
      const { control } = scriptNativeHelperSession(mockSpawn, () => undefined, [], { greeting: () => undefined });
      const controller = new AbortController();

      const starting = NativeHostProcess.start({ artifact, signal: controller.signal });
      controller.abort();

      await expect(starting).rejects.toMatchObject({ name: 'AbortError' });
      expect(control.signals).toEqual(['SIGTERM']);
    });

    test('does not spawn when the startup signal is already aborted', async () => {
      const failure = await failureOf(NativeHostProcess.start({ artifact, signal: AbortSignal.abort() }));

      expect(failure).toMatchObject({ name: 'AbortError' });
      expect(readFailureEffect(failure)).toBe('none');
      expect(mockSpawn).not.toHaveBeenCalled();
    });

    test('times out a helper that never says hello and stops it', async () => {
      const { control } = scriptNativeHelperSession(mockSpawn, () => undefined, [], { greeting: () => undefined });

      await expect(NativeHostProcess.start({ artifact, startupTimeoutMs: 30 })).rejects.toMatchObject({ code: 'handshake-timeout' });
      expect(control.signals).toEqual(['SIGTERM']);
    });

    test('rejects when the helper exits before hello', async () => {
      const { control } = scriptNativeHelperSession(mockSpawn, () => undefined, [], { greeting: () => undefined });

      const starting = NativeHostProcess.start({ artifact });
      control.exit(3);

      await expect(starting).rejects.toMatchObject({ code: 'handshake-failed', message: expect.stringContaining('code 3') });
    });
  });

  describe('cancellationTimeoutMs', () => {
    test('defaults to the documented deadline and accepts the documented range', () => {
      expect(resolveCancellationTimeoutMs(undefined, defaultCancellationTimeoutMs)).toBe(2000);
      expect(resolveCancellationTimeoutMs(minimumCancellationTimeoutMs, 2000)).toBe(100);
      expect(resolveCancellationTimeoutMs(maximumCancellationTimeoutMs, 2000)).toBe(60_000);
    });

    test.each([0, 99, 60_001, 1.5, Number.NaN, Number.POSITIVE_INFINITY, -1])('rejects %p instead of clamping it', async (value) => {
      expect(() => resolveCancellationTimeoutMs(value, 2000)).toThrow(RangeError);
      await expect(NativeHostProcess.start({ artifact, cancellationTimeoutMs: value })).rejects.toThrow(RangeError);
      expect(mockSpawn).not.toHaveBeenCalled();
    });
  });

  describe('spawning', () => {
    test.each([
      ['darwin', true],
      ['linux', true],
      ['win32', false],
    ])('puts the helper in its own process group on %s: %p', (platform, detached) => {
      const original = process.platform;
      Object.defineProperty(process, 'platform', { value: platform });
      try {
        expect(nativeHelperSpawnOptions()).toMatchObject({ detached, stdio: ['pipe', 'pipe', 'pipe'], windowsHide: true });
      } finally {
        Object.defineProperty(process, 'platform', { value: original });
      }
    });

    test('starts the helper over stdio with the shared spawn options', async () => {
      const { host } = await startHost(() => undefined);

      expect(mockSpawn).toHaveBeenCalledWith('driver', ['--stdio'], nativeHelperSpawnOptions());
      await host.dispose();
    });
  });
});
