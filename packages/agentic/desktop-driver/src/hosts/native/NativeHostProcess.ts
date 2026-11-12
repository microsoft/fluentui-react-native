import { spawn } from 'node:child_process';
import type { ChildProcessWithoutNullStreams, SpawnOptionsWithoutStdio } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { EventEmitter } from 'node:events';

import type {
  NativeDriverArtifact,
  NativeHostEventMessage,
  NativeHostHello,
  NativeHostJsonMessage,
  NativeHostResponse,
} from '../../native/types.js';
import { nativeDriverWireProtocol } from '../../native/constants.js';
import { NativeDriverError } from '../../native/NativeDriverError.js';
import { attachFailureEffect, parseMutationEffect } from '../../protocol/settlement.js';
import { encodeJsonFrame, NativeFrameDecoder } from './framing.js';
import type { NativeBinaryFrame } from './framing.js';
import { validateHelperMessage } from './helperMessage.js';
import { StderrLineDecoder } from './stderrLines.js';

export type NativeHostProcessOptions = {
  artifact: NativeDriverArtifact;
  /** How long a cancelled command may take to settle before the helper is killed. Defaults to 2000. */
  cancellationTimeoutMs?: number;
  onStderr?: (message: string) => void;
  recoverInput?: () => Promise<void>;
  /** Cancels startup: the helper is killed and `start` rejects with an `AbortError`. */
  signal?: AbortSignal;
  startupTimeoutMs?: number;
};

export type NativeHostRequestResult<T> = {
  binary?: Uint8Array;
  result: T;
};

type PendingRequest = {
  aborted: boolean;
  abortCleanup: () => void;
  binary?: Uint8Array;
  binaryId?: string;
  reject(error: unknown): void;
  resolve(value: NativeHostRequestResult<unknown>): void;
  response?: NativeHostResponse;
};

/**
 * `starting` until the validated hello arrives, then `running`. `disposing` covers the orderly shutdown request,
 * `failing` the single terminal path every failure takes, and `closed` a helper that is gone and reaped.
 */
type Lifecycle = 'closed' | 'disposing' | 'failing' | 'running' | 'starting';

export const defaultCancellationTimeoutMs = 2000;
export const minimumCancellationTimeoutMs = 100;
export const maximumCancellationTimeoutMs = 60_000;

/** How long stdio may stay open after the helper exits, for a grandchild that inherited the pipes. */
const pipeCloseGraceMs = 500;
/** How long a helper that acknowledged disposal may take to exit before it is killed. */
const disposeExitGraceMs = 2000;
/** How long a helper may take to die after each termination signal. */
const killGraceMs = 2000;
const maximumEarlyEvents = 64;

/** Returns the validated cancellation deadline, or `fallback` when none is given. Out-of-range values are rejected, never clamped. */
export function resolveCancellationTimeoutMs(value: number | undefined, fallback: number): number {
  if (value === undefined) {
    return fallback;
  }
  if (!Number.isInteger(value) || value < minimumCancellationTimeoutMs || value > maximumCancellationTimeoutMs) {
    throw new RangeError(
      `The cancellationTimeoutMs option must be an integer from ${minimumCancellationTimeoutMs} to ${maximumCancellationTimeoutMs}.`,
    );
  }
  return value;
}

/**
 * Spawn options shared by every helper process. On POSIX the helper leads its own process group, so Ctrl+C in the
 * terminal reaches Node, which cancels and disposes in order, instead of killing the helper mid-command. Lifetime
 * stays with Node: the helper ends on stdin EOF, and it is never unref'd.
 */
export function nativeHelperSpawnOptions(): SpawnOptionsWithoutStdio {
  return { detached: process.platform !== 'win32', stdio: ['pipe', 'pipe', 'pipe'], windowsHide: true };
}

export class NativeHostProcess extends EventEmitter<{
  event: [NativeHostEventMessage];
  exit: [Error];
}> {
  readonly artifact: NativeDriverArtifact;

  private readonly cancellationTimeoutMs: number;
  private readonly child: ChildProcessWithoutNullStreams;
  private readonly closed: Promise<void>;
  private readonly decoder = new NativeFrameDecoder();
  private readonly pending = new Map<string, PendingRequest>();
  private readonly pendingBinaryIds = new Map<string, string>();
  private readonly recoverInput?: () => Promise<void>;
  private readonly started: Promise<NativeHostProcess>;
  private readonly stderrLines: StderrLineDecoder;
  private activated = false;
  private disposeAcknowledged = false;
  private disposeController?: AbortController;
  private disposePromise?: Promise<void>;
  private earlyEvents: NativeHostEventMessage[] = [];
  private exitDescription = 'an unknown status';
  private helloMessage?: NativeHostHello;
  private lifecycle: Lifecycle = 'starting';
  private rejectStarted: (error: Error) => void = () => undefined;
  private resolveStarted: (process: NativeHostProcess) => void = () => undefined;
  private startupCleanup: () => void = () => undefined;
  private terminal?: Promise<Error>;

  private constructor(options: NativeHostProcessOptions, cancellationTimeoutMs: number) {
    super();
    this.artifact = options.artifact;
    this.cancellationTimeoutMs = cancellationTimeoutMs;
    this.recoverInput = options.recoverInput;
    this.stderrLines = new StderrLineDecoder((line) => {
      try {
        options.onStderr?.(line);
      } catch {
        // A throwing diagnostic sink must not take down the transport.
      }
    });
    this.started = new Promise<NativeHostProcess>((resolve, reject) => {
      this.resolveStarted = resolve;
      this.rejectStarted = reject;
    });

    const child = spawn(options.artifact.executablePath, ['--stdio'], nativeHelperSpawnOptions()) as ChildProcessWithoutNullStreams;
    this.child = child;
    this.closed = new Promise<void>((resolve) => {
      let graceTimer: NodeJS.Timeout | undefined;
      child.once('close', () => {
        clearTimeout(graceTimer);
        this.stderrLines.end();
        resolve();
      });
      child.once('exit', (code, signal) => {
        this.exitDescription = code === null ? `signal ${String(signal)}` : `code ${code}`;
        // Stdio normally closes with the helper. A grandchild that inherited the pipes holds `close` back, so
        // after a bounded wait the pipes are released and failure handling proceeds.
        graceTimer = setTimeout(() => {
          this.releasePipes();
          this.stderrLines.end();
          resolve();
        }, pipeCloseGraceMs);
      });
    });
    void this.closed.then(() => this.onHelperGone());

    this.decoder.on('json', (message) => this.onJson(message));
    this.decoder.on('binary', (frame) => this.onBinary(frame));
    this.decoder.on('error', (error) => void this.fail(error));
    child.stdout.on('data', (chunk: Buffer) => this.onStdout(chunk));
    child.stdout.on('error', (error) => void this.fail(error));
    child.stderr.on('data', (chunk: Buffer) => this.stderrLines.write(chunk));
    child.stderr.on('error', (error) => void this.fail(error));
    child.stdin.on('error', (error) => void this.fail(error));
    child.on('error', (error) => void this.fail(error));

    const startupTimeoutMs = options.startupTimeoutMs ?? 10_000;
    const timeout = setTimeout(
      () =>
        void this.fail(
          new NativeDriverError('handshake-timeout', `Native driver helper did not send hello within ${startupTimeoutMs} ms.`),
        ),
      startupTimeoutMs,
    );
    const signal = options.signal;
    const onAbort = () => void this.fail(abortError('Native driver helper startup was cancelled.'));
    signal?.addEventListener('abort', onAbort, { once: true });
    this.startupCleanup = () => {
      clearTimeout(timeout);
      signal?.removeEventListener('abort', onAbort);
    };
  }

  static async start(options: NativeHostProcessOptions): Promise<NativeHostProcess> {
    const cancellationTimeoutMs = resolveCancellationTimeoutMs(options.cancellationTimeoutMs, defaultCancellationTimeoutMs);
    if (options.signal?.aborted) {
      throw attachFailureEffect(abortError('Native driver helper startup was cancelled before it began.'), 'none');
    }
    return new NativeHostProcess(options, cancellationTimeoutMs).started;
  }

  /** The helper's validated handshake. Available once `start` has resolved. */
  get hello(): NativeHostHello {
    return this.helloMessage as NativeHostHello;
  }

  request<T>(command: string, params?: unknown, signal?: AbortSignal): Promise<NativeHostRequestResult<T>> {
    if (this.lifecycle !== 'running') {
      return Promise.reject(attachFailureEffect(new NativeDriverError('host-closed', 'Native driver helper is closed.'), 'none'));
    }
    return this.send<T>(command, params, signal);
  }

  /**
   * Asks the helper to shut down and reaps it. Disposal is terminal: when the helper cannot acknowledge, it is
   * killed, input is recovered and the original failure is rethrown. Concurrent calls share one disposal, and an
   * abort from any caller cancels it.
   */
  dispose(signal?: AbortSignal): Promise<void> {
    if (!this.disposePromise) {
      if (this.terminal) {
        return this.terminal.then(() => undefined);
      }
      if (this.lifecycle === 'closed') {
        return Promise.resolve();
      }
      const controller = new AbortController();
      this.disposeController = controller;
      this.disposePromise = this.runDispose(controller.signal).finally(() => {
        this.disposePromise = undefined;
      });
    }
    const disposal = this.disposePromise;
    if (signal) {
      const controller = this.disposeController as AbortController;
      const abort = () => controller.abort();
      if (signal.aborted) {
        abort();
      } else {
        signal.addEventListener('abort', abort, { once: true });
        const release = () => signal.removeEventListener('abort', abort);
        disposal.then(release, release);
      }
    }
    return disposal;
  }

  private async runDispose(signal: AbortSignal): Promise<void> {
    this.lifecycle = 'disposing';
    try {
      await this.send('dispose', undefined, signal);
    } catch (error) {
      const failure = await this.fail(asError(error));
      throw failure;
    }
    this.disposeAcknowledged = true;
    if (!(await settlesWithin(this.closed, disposeExitGraceMs))) {
      await this.reap();
    }
    this.lifecycle = 'closed';
    for (const [id] of this.pending) {
      this.rejectPending(id, new NativeDriverError('host-closed', 'Native driver helper closed.'));
    }
  }

  private send<T>(command: string, params: unknown, signal?: AbortSignal): Promise<NativeHostRequestResult<T>> {
    if (signal?.aborted) {
      return Promise.reject(attachFailureEffect(abortError(`Native driver command "${command}" was cancelled before dispatch.`), 'none'));
    }
    const id = randomUUID();
    let requestFrame: Buffer;
    try {
      requestFrame = encodeJsonFrame({ command, id, params, type: 'request' });
    } catch (error) {
      return Promise.reject(attachFailureEffect(asError(error), 'none'));
    }
    return new Promise<NativeHostRequestResult<T>>((resolve, reject) => {
      const pending: PendingRequest = {
        aborted: false,
        abortCleanup: () => undefined,
        reject,
        resolve: resolve as (value: NativeHostRequestResult<unknown>) => void,
      };
      this.pending.set(id, pending);
      void this.writeFrame(requestFrame).catch((error) => this.fail(asError(error)));
      if (signal) {
        const onAbort = () => {
          pending.aborted = true;
          void this.write({ id, type: 'cancel' }).catch((error) => this.fail(asError(error)));
          const timeout = setTimeout(() => {
            void this.fail(
              new NativeDriverError(
                'cancellation-timeout',
                `Native driver helper did not settle cancelled command "${command}" within ${this.cancellationTimeoutMs} ms.`,
              ),
            );
          }, this.cancellationTimeoutMs);
          timeout.unref();
          const removeAbortListener = pending.abortCleanup;
          pending.abortCleanup = () => {
            clearTimeout(timeout);
            removeAbortListener();
          };
        };
        if (signal.aborted) {
          onAbort();
        } else {
          signal.addEventListener('abort', onAbort, { once: true });
          pending.abortCleanup = () => signal.removeEventListener('abort', onAbort);
        }
      }
    });
  }

  private onStdout(chunk: Buffer): void {
    if (this.terminal) {
      return;
    }
    try {
      this.decoder.write(chunk);
    } catch (error) {
      // A listener threw, so the stream's state is unknown. Stop decoding before failing the transport.
      this.decoder.end();
      void this.fail(asError(error));
    }
  }

  private onJson(value: NativeHostJsonMessage): void {
    if (this.terminal) {
      return;
    }
    let message: NativeHostJsonMessage;
    try {
      message = validateHelperMessage(value);
    } catch (error) {
      void this.fail(asError(error));
      return;
    }
    if (this.lifecycle === 'starting') {
      this.onHello(message);
      return;
    }
    if (message.type === 'event') {
      this.onEvent(message);
      return;
    }
    if (message.type === 'cancelled') {
      const error = new Error(`Native driver command "${message.id}" was cancelled.`);
      error.name = 'AbortError';
      if (message.data) Object.assign(error, { data: message.data });
      // A provider that does not report what the cancelled command left behind cannot rule out an effect.
      this.rejectPending(message.id, attachFailureEffect(error, parseMutationEffect(message.effect) ?? 'unknown'));
      return;
    }
    if (message.type !== 'response') {
      void this.fail(new Error(`Native driver helper emitted unexpected "${message.type}" message after startup.`));
      return;
    }
    const pending = this.pending.get(message.id);
    if (!pending) {
      return;
    }
    if (pending.response) {
      void this.fail(new NativeDriverError('invalid-message', 'Native driver helper answered one request twice.'));
      return;
    }
    const binaryId = message.binary?.id;
    if (binaryId !== undefined && this.pendingBinaryIds.has(binaryId)) {
      void this.fail(new NativeDriverError('invalid-message', 'Native driver helper reused a binary payload identifier.'));
      return;
    }
    pending.response = message;
    pending.binaryId = binaryId;
    if (binaryId !== undefined) {
      this.pendingBinaryIds.set(binaryId, message.id);
    }
    this.completePending(message.id);
  }

  private onHello(message: NativeHostJsonMessage): void {
    if (message.type !== 'hello') {
      void this.fail(new NativeDriverError('handshake-failed', `Expected native helper hello, received "${message.type}".`));
      return;
    }
    try {
      validateHello(message, this.artifact);
    } catch (error) {
      void this.fail(asError(error));
      return;
    }
    this.helloMessage = message;
    this.lifecycle = 'running';
    this.startupCleanup();
    this.resolveStarted(this);
    // Frames that follow the hello in the same chunk are already being routed. Events among them wait one turn, so
    // the caller of `start` can attach its listener first.
    setImmediate(() => {
      this.activated = true;
      const early = this.earlyEvents;
      this.earlyEvents = [];
      for (const event of early) {
        this.emit('event', event);
      }
    });
  }

  private onEvent(message: NativeHostEventMessage): void {
    if (this.activated) {
      this.emit('event', message);
    } else if (this.earlyEvents.length < maximumEarlyEvents) {
      this.earlyEvents.push(message);
    }
  }

  private onBinary(frame: NativeBinaryFrame): void {
    if (this.terminal) {
      return;
    }
    const requestId = this.pendingBinaryIds.get(frame.id);
    if (!requestId) {
      void this.fail(
        new NativeDriverError('invalid-message', 'Native driver helper emitted a binary payload before declaring it in a response.'),
      );
      return;
    }
    const pending = this.pending.get(requestId);
    if (!pending) {
      return;
    }
    pending.binary = frame.data;
    this.completePending(requestId);
  }

  private onHelperGone(): void {
    if (this.terminal || this.disposeAcknowledged || this.lifecycle === 'closed') {
      return;
    }
    if (this.lifecycle === 'starting') {
      void this.fail(new NativeDriverError('handshake-failed', `Native helper exited before hello with ${this.exitDescription}.`));
    } else if (this.lifecycle === 'disposing') {
      void this.fail(new NativeDriverError('host-exited', 'Native driver helper exited before acknowledging disposal.'));
    } else {
      void this.fail(new NativeDriverError('host-exited', `Native driver helper exited unexpectedly with ${this.exitDescription}.`));
    }
  }

  private completePending(id: string): void {
    const pending = this.pending.get(id);
    const response = pending?.response;
    if (!pending || !response || (pending.binaryId && !pending.binary)) {
      return;
    }
    this.pending.delete(id);
    pending.abortCleanup();
    if (pending.binaryId) {
      this.pendingBinaryIds.delete(pending.binaryId);
    }
    if (response.error) {
      pending.reject(
        attachFailureEffect(
          new NativeDriverError(response.error.code, response.error.message, response.error.data),
          parseMutationEffect(response.error.effect),
        ),
      );
      return;
    }
    if (pending.aborted) {
      const error = new Error(`Native driver command "${id}" completed before its cancellation took effect.`);
      error.name = 'AbortError';
      // The helper finished the command instead of unwinding it, so its effect landed even though the caller gave up.
      pending.reject(attachFailureEffect(error, 'applied'));
      return;
    }
    pending.resolve({ binary: pending.binary, result: response.result });
  }

  private rejectPending(id: string, error: unknown): void {
    const pending = this.pending.get(id);
    if (!pending) {
      return;
    }
    this.pending.delete(id);
    pending.abortCleanup();
    if (pending.binaryId) {
      this.pendingBinaryIds.delete(pending.binaryId);
    }
    pending.reject(error);
  }

  private async write(message: Parameters<typeof encodeJsonFrame>[0]): Promise<void> {
    await this.writeFrame(encodeJsonFrame(message));
  }

  private async writeFrame(frame: Buffer): Promise<void> {
    if (this.child.stdin.destroyed || !this.child.stdin.writable) {
      throw new NativeDriverError('host-closed', 'Native driver helper input is closed.');
    }
    if (this.child.stdin.write(frame)) {
      return;
    }
    await new Promise<void>((resolve, reject) => {
      const cleanup = () => {
        this.child.stdin.off('drain', onDrain);
        this.child.stdin.off('error', onError);
        this.child.off('close', onClose);
      };
      const onDrain = () => {
        cleanup();
        resolve();
      };
      const onError = (error: Error) => {
        cleanup();
        reject(error);
      };
      const onClose = () => {
        cleanup();
        reject(new NativeDriverError('host-closed', 'Native driver helper closed while writing a request.'));
      };
      this.child.stdin.once('drain', onDrain);
      this.child.stdin.once('error', onError);
      this.child.once('close', onClose);
    });
  }

  /**
   * The one terminal path: kill the helper, wait for it, recover input it may have left pressed, then reject every
   * pending request once. Every failure joins the first one, and after an acknowledged disposal there is nothing
   * left to fail. Resolves to the failure the pending requests were given.
   */
  private fail(error: Error): Promise<Error> {
    if (this.terminal) {
      return this.terminal;
    }
    if (this.lifecycle === 'closed' || this.disposeAcknowledged) {
      return Promise.resolve(error);
    }
    this.lifecycle = 'failing';
    // Deferred a turn so `terminal` is set before the terminal path can re-enter `fail`.
    return (this.terminal = Promise.resolve().then(() => this.terminate(error)));
  }

  private async terminate(error: Error): Promise<Error> {
    await this.reap();
    this.startupCleanup();
    let failure = error;
    if (this.helloMessage) {
      try {
        await this.recoverInput?.();
      } catch (recoveryError) {
        failure = new AggregateError([error, recoveryError], `${error.message} Native input recovery also failed.`);
      }
    }
    this.lifecycle = 'closed';
    for (const [id] of this.pending) {
      this.rejectPending(id, failure);
    }
    if (this.helloMessage) {
      try {
        this.emit('exit', failure);
      } catch {
        // The failure is already delivered to every pending request; a throwing listener must not leave the terminal path rejected.
      }
    } else {
      this.rejectStarted(error);
    }
    return failure;
  }

  /** Stops the helper if it still runs, escalating to SIGKILL, and waits a bounded time for its stdio to close. */
  private async reap(): Promise<void> {
    if (this.isRunning()) {
      this.child.kill();
      if (!(await settlesWithin(this.closed, killGraceMs))) {
        if (this.isRunning()) {
          this.child.kill('SIGKILL');
        }
        await settlesWithin(this.closed, killGraceMs);
      }
      return;
    }
    await this.closed;
  }

  private isRunning(): boolean {
    return this.child.exitCode === null && this.child.signalCode === null;
  }

  private releasePipes(): void {
    this.child.stdout.destroy();
    this.child.stderr.destroy();
    this.child.stdin.destroy();
  }
}

function settlesWithin(promise: Promise<void>, timeoutMs: number): Promise<boolean> {
  let timer: NodeJS.Timeout | undefined;
  return Promise.race([
    promise.then(() => true),
    new Promise<false>((resolve) => {
      timer = setTimeout(() => resolve(false), timeoutMs);
    }),
  ]).finally(() => clearTimeout(timer));
}

function validateHello(hello: NativeHostHello, artifact: NativeDriverArtifact): void {
  if (
    hello.protocol.major !== nativeDriverWireProtocol.major ||
    hello.protocol.minor < nativeDriverWireProtocol.minor ||
    hello.provider !== artifact.provider ||
    hello.architecture !== artifact.architecture ||
    hello.buildId !== artifact.buildId ||
    hello.sourceDigest !== artifact.sourceDigest
  ) {
    throw new NativeDriverError('handshake-failed', 'Native helper hello does not match the selected artifact.');
  }
}

function abortError(message: string): Error {
  const error = new Error(message);
  error.name = 'AbortError';
  return error;
}

function asError(error: unknown): Error {
  return error instanceof Error ? error : new Error(String(error));
}
