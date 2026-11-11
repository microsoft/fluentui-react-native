import { EventEmitter } from 'node:events';
import { PassThrough } from 'node:stream';

import { encodeJsonFrame, NativeFrameDecoder } from '../hosts/native/framing.js';
import type { NativeHostJsonMessage } from '../native/types.js';

export type ScriptedNativeRequest = Extract<NativeHostJsonMessage, { type: 'request' }>;
export type ScriptedNativeCancel = Extract<NativeHostJsonMessage, { type: 'cancel' }>;
export type ScriptedNativeSend = (message: NativeHostJsonMessage) => void;

export type ScriptedNativeControl = {
  /** Closes the pipes a lingering grandchild was holding open. */
  closePipes(): void;
  /** Ends the helper as if it exited on its own. */
  exit(code?: number | null, signal?: NodeJS.Signals | null): void;
  /** The signals the supervisor sent, in order. */
  readonly signals: readonly NodeJS.Signals[];
  /** Writes raw bytes to the helper's stderr. */
  writeStderr(bytes: Uint8Array | string): void;
  /** Writes raw bytes to the helper's stdout, bypassing frame encoding. */
  writeStdout(bytes: Uint8Array | string): void;
};

export type ScriptedNativeOptions = {
  /**
   * What the helper does with `dispose`. `acknowledge` replies and exits. `exit-then-acknowledge` exits first and
   * replies a moment later, as a helper whose exit overtakes its final output. `ignore` never replies.
   */
  dispose?: 'acknowledge' | 'exit-then-acknowledge' | 'ignore';
  /** The bytes sent at startup, given the encoded hello. Return nothing to stay silent. */
  greeting?: (hello: Buffer) => Uint8Array | undefined;
  /** Called for each `cancel`. Without it the helper ignores cancellation. */
  onCancel?: (message: ScriptedNativeCancel, send: ScriptedNativeSend, control: ScriptedNativeControl) => void;
  /**
   * How long stdio stays open after the helper exits, as for a grandchild that inherited the pipes. A number is a
   * delay in milliseconds; `held` keeps the pipes open until `control.closePipes()` or the supervisor destroys them.
   */
  pipeHold?: number | 'held';
  /** The helper ignores SIGTERM and only SIGKILL ends it. */
  survivesSigterm?: boolean;
};

class ScriptedNativeChild extends EventEmitter {
  readonly stdin = new PassThrough();
  readonly stdout = new PassThrough();
  readonly stderr = new PassThrough();
  readonly signals: NodeJS.Signals[] = [];
  exitCode: number | null = null;
  signalCode: NodeJS.Signals | null = null;

  private readonly options: ScriptedNativeOptions;
  private closeEmitted = false;
  private exitEmitted = false;
  private exitScheduled = false;
  private streamsClosed = 0;

  constructor(options: ScriptedNativeOptions) {
    super();
    this.options = options;
    for (const stream of [this.stdin, this.stdout, this.stderr]) {
      stream.once('close', () => {
        this.streamsClosed += 1;
        this.maybeClose();
      });
    }
  }

  kill(signal: NodeJS.Signals | number = 'SIGTERM'): boolean {
    const name = typeof signal === 'string' ? signal : 'SIGTERM';
    this.signals.push(name);
    if (this.exitScheduled) {
      return false;
    }
    if (name === 'SIGTERM' && this.options.survivesSigterm) {
      return true;
    }
    this.exit(null, name);
    return true;
  }

  /** Like a real child, `exit` and `close` are separate events in separate ticks, and `close` waits for the pipes. */
  exit(code: number | null, signal: NodeJS.Signals | null = null): void {
    if (this.exitScheduled) {
      return;
    }
    this.exitScheduled = true;
    setImmediate(() => {
      this.exitCode = code;
      this.signalCode = signal;
      this.exitEmitted = true;
      this.emit('exit', code, signal);
      const hold = this.options.pipeHold;
      if (hold !== 'held') {
        setTimeout(() => this.releasePipes(), hold ?? 0);
      }
    });
  }

  releasePipes(): void {
    for (const stream of [this.stdin, this.stdout, this.stderr]) {
      stream.destroy();
    }
  }

  private maybeClose(): void {
    if (this.exitEmitted && !this.closeEmitted && this.streamsClosed === 3) {
      this.closeEmitted = true;
      this.emit('close', this.exitCode, this.signalCode);
    }
  }
}

function writeTo(stream: PassThrough, bytes: Uint8Array | string): void {
  if (!stream.destroyed) {
    stream.write(bytes);
  }
}

export type ScriptedNativeSession = {
  control: ScriptedNativeControl;
  /** The requests the helper received, excluding `dispose`. */
  received: ScriptedNativeRequest[];
};

/**
 * Scripts the next native helper a host spawns. The helper says hello with `features`, answers each request through
 * `handler`, and acknowledges `dispose` and exits. Pass the test's mocked `spawn`; the returned list collects requests.
 */
export function scriptNativeHelper(
  spawn: { mockImplementationOnce(implementation: () => unknown): unknown },
  handler: (message: ScriptedNativeRequest, send: ScriptedNativeSend, control: ScriptedNativeControl) => void,
  features: readonly string[] = [],
  options: ScriptedNativeOptions = {},
): ScriptedNativeRequest[] {
  return scriptNativeHelperSession(spawn, handler, features, options).received;
}

/** Like `scriptNativeHelper`, and also returns `control` for crashing the helper, writing raw output and reading the signals it received. */
export function scriptNativeHelperSession(
  spawn: { mockImplementationOnce(implementation: () => unknown): unknown },
  handler: (message: ScriptedNativeRequest, send: ScriptedNativeSend, control: ScriptedNativeControl) => void,
  features: readonly string[] = [],
  options: ScriptedNativeOptions = {},
): ScriptedNativeSession {
  const child = new ScriptedNativeChild(options);
  const decoder = new NativeFrameDecoder();
  const send: ScriptedNativeSend = (message) => writeTo(child.stdout, encodeJsonFrame(message));
  const control: ScriptedNativeControl = {
    closePipes: () => child.releasePipes(),
    exit: (code = 1, signal = null) => child.exit(code, signal),
    signals: child.signals,
    writeStderr: (bytes) => writeTo(child.stderr, bytes),
    writeStdout: (bytes) => writeTo(child.stdout, bytes),
  };
  const received: ScriptedNativeRequest[] = [];
  const acknowledgeDispose = (id: string) => {
    const mode = options.dispose ?? 'acknowledge';
    if (mode === 'acknowledge') {
      send({ id, result: {}, type: 'response' });
      child.exit(0);
    } else if (mode === 'exit-then-acknowledge') {
      child.exit(0);
      setTimeout(() => send({ id, result: {}, type: 'response' }), 5);
    }
  };
  child.stdin.on('data', (chunk: Buffer) => decoder.write(chunk));
  decoder.on('json', (message) => {
    if (message.type === 'cancel') {
      options.onCancel?.(message, send, control);
      return;
    }
    if (message.type !== 'request') {
      return;
    }
    if (message.command === 'dispose') {
      acknowledgeDispose(message.id);
      return;
    }
    received.push(message);
    handler(message, send, control);
  });
  spawn.mockImplementationOnce(() => {
    setImmediate(() => {
      const hello = encodeJsonFrame({
        architecture: 'arm64',
        buildId: 'build',
        features: [...features],
        protocol: { major: 1, minor: 0 },
        provider: 'macos',
        sourceDigest: 'source',
        type: 'hello',
      });
      const greeting = options.greeting ? options.greeting(hello) : hello;
      if (greeting) {
        control.writeStdout(greeting);
      }
    });
    return child;
  });
  return { control, received };
}
