import { EventEmitter } from 'node:events';
import { PassThrough } from 'node:stream';

import type { DesktopHostEvent } from '../../host/types';
import type { NativeDriverArtifact } from '../../native/types';
import { readFailureEffect } from '../../protocol/settlement';
import { scriptNativeHelperSession } from '../../testing/scriptedNativeHelper';
import { encodeJsonFrame } from './framing';
import { FURN_DESKTOP_DRIVER_DISABLED_INPUT_FEATURES, NativeDesktopHost } from './NativeDesktopHost';
import { nativeHelperSpawnOptions } from './NativeHostProcess';

const mockSpawn = jest.fn();
jest.mock('node:child_process', () => ({ spawn: (...args: unknown[]) => mockSpawn(...args) }));

const macArtifact: NativeDriverArtifact = {
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

const windowsArtifact: NativeDriverArtifact = { ...macArtifact, endpoints: ['windows'], provider: 'windows' };

const windowsGreeting = () =>
  encodeJsonFrame({
    architecture: 'arm64',
    buildId: 'build',
    features: [],
    protocol: { major: 1, minor: 0 },
    provider: 'windows',
    sourceDigest: 'source',
    type: 'hello',
  });

const realIo: Parameters<typeof jest.useFakeTimers>[0] = { doNotFake: ['setImmediate', 'nextTick', 'queueMicrotask'] };

/** Lets scripted I/O that is scheduled with `setImmediate` or `process.nextTick` run, under fake timers that leave both real. */
async function settleIo(): Promise<void> {
  for (let turn = 0; turn < 5; turn += 1) {
    await new Promise<void>((resolve) => setImmediate(resolve));
  }
}

function macHost(options: { cancellationTimeoutMs?: number } = {}) {
  return new NativeDesktopHost({ application: { windowTitle: 'Test App' }, artifact: macArtifact, endpoint: 'macos', ...options });
}

type ReleaseInputOptions = { code?: number; hold?: boolean; stderr?: string; stdout?: string };

/** Scripts the next `--release-input` process: it reads the pressed inputs from stdin, answers, and exits. */
function scriptReleaseInput(options: ReleaseInputOptions = {}): { input: () => string } {
  const code = options.code ?? 0;
  const child = Object.assign(new EventEmitter(), {
    kill: jest.fn(),
    stderr: new PassThrough(),
    stdin: new PassThrough(),
    stdout: new PassThrough(),
  });
  const chunks: Buffer[] = [];
  let exited = false;
  let closed = 0;
  for (const stream of [child.stdin, child.stdout, child.stderr]) {
    stream.once('close', () => {
      closed += 1;
      if (exited && closed === 3) {
        child.emit('close', code, null);
      }
    });
  }
  child.stdin.on('data', (chunk: Buffer) => chunks.push(chunk));
  child.stdin.once('end', () => {
    setImmediate(() => {
      exited = true;
      child.emit('exit', code, null);
      if (options.hold) {
        // A grandchild that inherited the pipes keeps them open after the helper exits.
        child.stdout.write(options.stdout ?? '{}');
        return;
      }
      child.stdout.end(options.stdout ?? '{}');
      child.stderr.end(options.stderr ?? '');
    });
  });
  mockSpawn.mockImplementationOnce(() => child);
  return { input: () => Buffer.concat(chunks).toString('utf8') };
}

describe('NativeDesktopHost cancellationTimeoutMs', () => {
  beforeEach(() => {
    mockSpawn.mockReset();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test.each([0, 99, 60_001, 1.5, Number.NaN, -1])('rejects %p when the host is created, instead of clamping it', (value) => {
    expect(() => macHost({ cancellationTimeoutMs: value })).toThrow(RangeError);
  });

  test.each([
    ['macOS', macArtifact, undefined, undefined, 2000],
    ['Windows', windowsArtifact, windowsGreeting, undefined, 10_000],
    ['macOS with an explicit deadline', macArtifact, undefined, 300, 300],
    ['Windows with an explicit deadline', windowsArtifact, windowsGreeting, 5000, 5000],
  ])('kills a helper that ignores cancel after the %s deadline', async (_, artifact, greeting, cancellationTimeoutMs, expectedMs) => {
    jest.useFakeTimers(realIo);
    const { control, received } = scriptNativeHelperSession(mockSpawn, () => undefined, [], { greeting });
    const host = new NativeDesktopHost({
      application: { windowTitle: 'Test App' },
      artifact,
      cancellationTimeoutMs,
      endpoint: artifact.endpoints[0] as 'macos' | 'windows',
    });
    const abort = new AbortController();

    const probing = host.probe(abort.signal).catch((error: unknown) => error);
    await settleIo();
    expect(received).toHaveLength(1);
    abort.abort();
    await jest.advanceTimersByTimeAsync(expectedMs - 1);
    await settleIo();
    expect(control.signals).toEqual([]);
    await jest.advanceTimersByTimeAsync(1);
    await settleIo();
    expect(control.signals).toEqual(['SIGTERM']);

    await jest.advanceTimersByTimeAsync(1000);
    expect(await probing).toMatchObject({ code: 'cancellation-timeout' });
  });
});

describe('NativeDesktopHost lifecycle', () => {
  beforeEach(() => {
    mockSpawn.mockReset();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('disposes cleanly after a helper that failed to start', async () => {
    scriptNativeHelperSession(mockSpawn, () => undefined, [], { greeting: () => Buffer.from('this is not a native helper frame') });
    const host = macHost();

    await expect(host.probe()).rejects.toThrow('invalid frame magic');

    await expect(host.dispose()).resolves.toBeUndefined();
  });

  test('starts no helper once disposed, for a request or a subscription', async () => {
    const host = macHost();
    await host.dispose();

    const failure = await host.probe().then(
      () => undefined,
      (error: unknown) => error,
    );
    const unsubscribe = host.subscribe(() => undefined);

    expect(failure).toMatchObject({ code: 'host-closed' });
    expect(readFailureEffect(failure)).toBe('none');
    expect(() => unsubscribe()).not.toThrow();
    expect(mockSpawn).not.toHaveBeenCalled();
  });

  test('kills a helper that is still starting when the host is disposed', async () => {
    const { control } = scriptNativeHelperSession(mockSpawn, () => undefined, [], { greeting: () => undefined });
    const host = macHost();

    const probing = host.probe().catch((error: unknown) => error);
    await new Promise<void>((resolve) => setImmediate(resolve));
    await expect(host.dispose()).resolves.toBeUndefined();

    expect(await probing).toMatchObject({ name: 'AbortError' });
    expect(control.signals).toEqual(['SIGTERM']);
  });

  test('stops one caller waiting for startup without stopping the helper', async () => {
    const { control } = scriptNativeHelperSession(mockSpawn, () => undefined, [], { greeting: () => undefined });
    const host = macHost();
    const abort = new AbortController();

    const probing = host.probe(abort.signal).then(
      () => undefined,
      (error: unknown) => error,
    );
    abort.abort();
    const failure = await probing;

    expect(failure).toMatchObject({ name: 'AbortError' });
    expect(readFailureEffect(failure)).toBe('none');
    expect(control.signals).toEqual([]);
    await host.dispose();
  });

  test('delivers helper events to subscribers, including one that arrives with the hello', async () => {
    scriptNativeHelperSession(mockSpawn, () => undefined, [], {
      greeting: (hello) => Buffer.concat([hello, encodeJsonFrame({ event: 'window-opened', payload: { windowId: 'w1' }, type: 'event' })]),
    });
    const host = macHost();
    const events: DesktopHostEvent[] = [];
    host.subscribe((event) => events.push(event));

    await new Promise<void>((resolve) => setTimeout(resolve, 20));

    expect(events).toEqual([{ type: 'window-opened', windowId: 'w1' }]);
    await host.dispose();
    host.subscribe(() => undefined);
    expect(mockSpawn).toHaveBeenCalledTimes(1);
  });
});

describe('NativeDesktopHost input recovery', () => {
  const pressKeyA = [{ actions: [{ type: 'keyDown' as const, value: 'a' }], id: 'keys', type: 'key' as const }];
  const pressButton = [{ actions: [{ button: 0, type: 'pointerDown' as const }], id: 'pointer', type: 'pointer' as const }];

  // The operator's input mask (hosted CI sets it) would refuse the key press before it reaches the scripted helper.
  let environment: ReturnType<typeof jest.replaceProperty>;

  beforeEach(() => {
    environment = jest.replaceProperty(process, 'env', { ...process.env, [FURN_DESKTOP_DRIVER_DISABLED_INPUT_FEATURES]: '' });
    mockSpawn.mockReset();
  });

  afterEach(() => {
    environment.restore();
    jest.useRealTimers();
  });

  test('releases pressed input in its own process group before the failing command is rejected', async () => {
    scriptNativeHelperSession(mockSpawn, (_, __, control) => control.exit(1), [], {});
    const release = scriptReleaseInput();
    const host = macHost();
    const order: string[] = [];

    await host.performActions(pressKeyA).catch(() => order.push('reject'));

    expect(JSON.parse(release.input())).toEqual({ buttons: [], keys: ['a'] });
    expect(mockSpawn).toHaveBeenNthCalledWith(2, 'driver', ['--release-input'], nativeHelperSpawnOptions());
    expect(order).toEqual(['reject']);
  });

  test('retains the input ledger when release fails and the helper subsequently exits', async () => {
    scriptNativeHelperSession(mockSpawn, (message, send, control) => {
      if (message.command === 'probe') {
        control.exit(1);
      } else if (message.command === 'releaseActions') {
        send({ error: { code: 'input-failed', effect: 'unknown', message: 'release failed' }, id: message.id, type: 'response' });
      } else {
        send({ id: message.id, result: {}, type: 'response' });
      }
    });
    const release = scriptReleaseInput();
    const host = macHost();

    await host.performActions([...pressKeyA, ...pressButton]);
    await expect(host.releaseActions()).rejects.toThrow('release failed');
    await expect(host.probe()).rejects.toMatchObject({ code: 'host-exited' });

    expect(JSON.parse(release.input())).toEqual({ buttons: [0], keys: ['a'] });
  });

  test.each([
    ['actions', (host: NativeDesktopHost) => host.performActions([...pressKeyA, ...pressButton]), { buttons: [0], keys: ['a'] }],
    ['typing', (host: NativeDesktopHost) => host.sendKeys('element', 'a'), { buttons: [], keys: ['a'] }],
    ['clicking', (host: NativeDesktopHost) => host.click('element', 'physical'), { buttons: [0], keys: [] }],
  ])('retains possibly depressed input after failed %s until the helper exits', async (_, act, expected) => {
    scriptNativeHelperSession(mockSpawn, (message, send, control) => {
      if (message.command === 'probe') {
        control.exit(1);
      } else {
        send({ error: { code: 'input-failed', effect: 'unknown', message: 'cleanup failed' }, id: message.id, type: 'response' });
      }
    });
    const release = scriptReleaseInput();
    const host = macHost();

    await expect(act(host)).rejects.toThrow('cleanup failed');
    await expect(host.probe()).rejects.toMatchObject({ code: 'host-exited' });

    expect(JSON.parse(release.input())).toEqual(expected);
  });

  test('preserves uncertain input across later successful commands without adding their completed presses', async () => {
    scriptNativeHelperSession(mockSpawn, (message, send, control) => {
      if (message.command === 'probe') {
        control.exit(1);
      } else if (message.command === 'performActions') {
        send({ error: { code: 'input-failed', effect: 'unknown', message: 'cleanup failed' }, id: message.id, type: 'response' });
      } else {
        send({ id: message.id, result: {}, type: 'response' });
      }
    });
    const release = scriptReleaseInput();
    const host = macHost();

    await expect(host.performActions(pressKeyA)).rejects.toThrow('cleanup failed');
    await host.sendKeys('element', 'b');
    await expect(host.probe()).rejects.toMatchObject({ code: 'host-exited' });

    expect(JSON.parse(release.input())).toEqual({ buttons: [], keys: ['a'] });
  });

  test('forgets uncertain input only after a successful release', async () => {
    let attempts = 0;
    scriptNativeHelperSession(mockSpawn, (message, send, control) => {
      if (message.command === 'probe') {
        control.exit(1);
      } else if (message.command === 'performActions' || (message.command === 'releaseActions' && attempts++ === 0)) {
        send({ error: { code: 'input-failed', effect: 'unknown', message: 'cleanup failed' }, id: message.id, type: 'response' });
      } else {
        send({ id: message.id, result: {}, type: 'response' });
      }
    });
    const host = macHost();

    await expect(host.performActions(pressKeyA)).rejects.toThrow('cleanup failed');
    await expect(host.releaseActions()).rejects.toThrow('cleanup failed');
    await expect(host.releaseActions()).resolves.toBeUndefined();
    await expect(host.probe()).rejects.toMatchObject({ code: 'host-exited' });

    expect(mockSpawn).toHaveBeenCalledTimes(1);
  });

  test('does not recover input from a command rejected before dispatch', async () => {
    scriptNativeHelperSession(mockSpawn, (message, send, control) => {
      if (message.command === 'probe') {
        control.exit(1);
      } else {
        send({ error: { code: 'invalid-params', effect: 'none', message: 'refused' }, id: message.id, type: 'response' });
      }
    });
    const host = macHost();

    await expect(host.performActions(pressKeyA)).rejects.toThrow('refused');
    await expect(host.probe()).rejects.toMatchObject({ code: 'host-exited' });

    expect(mockSpawn).toHaveBeenCalledTimes(1);
  });

  test('retains previously held input when a later command is rejected before dispatch', async () => {
    let actions = 0;
    scriptNativeHelperSession(mockSpawn, (message, send, control) => {
      if (message.command === 'probe') {
        control.exit(1);
      } else if (actions++ === 0) {
        send({ id: message.id, result: {}, type: 'response' });
      } else {
        send({ error: { code: 'invalid-params', effect: 'none', message: 'refused' }, id: message.id, type: 'response' });
      }
    });
    const release = scriptReleaseInput();
    const host = macHost();

    await host.performActions(pressKeyA);
    await expect(host.performActions([{ ...pressKeyA[0], actions: [{ type: 'keyDown', value: 'b' }] }])).rejects.toThrow('refused');
    await expect(host.probe()).rejects.toMatchObject({ code: 'host-exited' });

    expect(JSON.parse(release.input())).toEqual({ buttons: [], keys: ['a'] });
  });

  test('keeps only a bounded amount of a failed recovery’s stderr', async () => {
    scriptNativeHelperSession(mockSpawn, (_, __, control) => control.exit(1), [], {});
    scriptReleaseInput({ code: 1, stderr: 'x'.repeat(1024 * 1024) });
    const host = macHost();

    const failure = await host.performActions(pressKeyA).then(
      () => undefined,
      (error: unknown) => error,
    );

    const recovery = (failure as AggregateError).errors.find(
      (error: Error) => (error as { code?: string }).code === 'input-recovery-failed',
    );
    expect(recovery.message.length).toBe(16 * 1024);
  });

  test('does not wait on a grandchild that holds the recovery process’s pipes', async () => {
    jest.useFakeTimers(realIo);
    scriptNativeHelperSession(mockSpawn, (_, __, control) => control.exit(1), [], {});
    scriptReleaseInput({ hold: true });
    const host = macHost();

    let settled = false;
    const performing = host
      .performActions(pressKeyA)
      .catch(() => undefined)
      .then(() => {
        settled = true;
      });
    await settleIo();
    await jest.advanceTimersByTimeAsync(499);
    await settleIo();
    expect(settled).toBe(false);
    await jest.advanceTimersByTimeAsync(2);
    await settleIo();
    await jest.advanceTimersByTimeAsync(1000);
    await performing;

    expect(settled).toBe(true);
  });
});
