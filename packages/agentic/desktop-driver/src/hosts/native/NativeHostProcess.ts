import { spawn } from 'node:child_process';
import type { ChildProcessWithoutNullStreams } from 'node:child_process';
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
import { encodeJsonFrame, NativeFrameDecoder } from './framing.js';
import type { NativeBinaryFrame } from './framing.js';

export type NativeHostProcessOptions = {
  artifact: NativeDriverArtifact;
  cancellationTimeoutMs?: number;
  onStderr?: (message: string) => void;
  recoverInput?: () => Promise<void>;
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

export class NativeHostProcess extends EventEmitter<{
  event: [NativeHostEventMessage];
  exit: [Error];
}> {
  readonly artifact: NativeDriverArtifact;
  readonly hello: NativeHostHello;

  private readonly child: ChildProcessWithoutNullStreams;
  private readonly completed: Promise<void>;
  private readonly recoverInput?: () => Promise<void>;
  private readonly cancellationTimeoutMs: number;
  private readonly pending = new Map<string, PendingRequest>();
  private readonly pendingBinaryIds = new Map<string, string>();
  private readonly binaryFrames = new Map<string, Uint8Array>();
  private closed = false;
  private closing = false;
  private failurePromise?: Promise<void>;

  private constructor(
    child: ChildProcessWithoutNullStreams,
    artifact: NativeDriverArtifact,
    hello: NativeHostHello,
    cancellationTimeoutMs: number,
    recoverInput?: () => Promise<void>,
  ) {
    super();
    this.child = child;
    this.completed = new Promise((resolve) => child.once('close', () => resolve()));
    this.artifact = artifact;
    this.hello = hello;
    this.cancellationTimeoutMs = cancellationTimeoutMs;
    this.recoverInput = recoverInput;
  }

  static async start(options: NativeHostProcessOptions): Promise<NativeHostProcess> {
    const child = spawn(options.artifact.executablePath, ['--stdio'], {
      stdio: ['pipe', 'pipe', 'pipe'],
      windowsHide: true,
    });
    const decoder = new NativeFrameDecoder();
    child.stdout.on('data', (chunk: Buffer) => decoder.write(chunk));
    child.stderr.on('data', (chunk: Buffer) => options.onStderr?.(chunk.toString('utf8')));

    const hello = await waitForHello(child, decoder, options.startupTimeoutMs ?? 10_000);
    validateHello(hello, options.artifact);
    const process = new NativeHostProcess(child, options.artifact, hello, options.cancellationTimeoutMs ?? 2000, options.recoverInput);
    decoder.on('json', (message) => process.onJson(message));
    decoder.on('binary', (frame) => process.onBinary(frame));
    decoder.on('error', (error) => process.fail(error));
    child.once('error', (error) => process.fail(error));
    child.once('exit', (code, signal) => {
      if (!process.closed && !process.closing) {
        process.fail(
          new NativeDriverError(
            'host-exited',
            `Native driver helper exited unexpectedly with ${code === null ? `signal ${String(signal)}` : `code ${code}`}.`,
          ),
        );
      }
    });
    return process;
  }

  request<T>(command: string, params?: unknown, signal?: AbortSignal): Promise<NativeHostRequestResult<T>> {
    if (this.closed) {
      return Promise.reject(new NativeDriverError('host-closed', 'Native driver helper is closed.'));
    }
    if (signal?.aborted) {
      const error = new Error(`Native driver command "${command}" was cancelled before dispatch.`);
      error.name = 'AbortError';
      return Promise.reject(error);
    }
    const id = randomUUID();
    return new Promise<NativeHostRequestResult<T>>((resolve, reject) => {
      const pending: PendingRequest = {
        aborted: false,
        abortCleanup: () => undefined,
        reject,
        resolve: resolve as (value: NativeHostRequestResult<unknown>) => void,
      };
      this.pending.set(id, pending);
      if (signal) {
        const onAbort = () => {
          pending.aborted = true;
          void this.write({ id, type: 'cancel' });
          const timeout = setTimeout(() => {
            void this.failAfterRecovery(
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
      void this.write({ command, id, params, type: 'request' }).catch((error) => this.rejectPending(id, error));
    });
  }

  async dispose(): Promise<void> {
    if (this.closed || this.closing) {
      return;
    }
    this.closing = true;
    try {
      const disposeResult = await Promise.race([
        this.request('dispose').then(() => 'response' as const),
        this.completed.then(() => 'closed' as const),
      ]);
      if (disposeResult === 'closed') {
        throw new NativeDriverError('host-exited', 'Native driver helper exited before acknowledging disposal.');
      }
      const exited = await Promise.race([this.completed.then(() => true), delay(2000).then(() => false)]);
      if (!exited && this.child.exitCode === null && this.child.signalCode === null) {
        this.child.kill();
        await this.completed;
      }
    } finally {
      this.closed = true;
      for (const [id] of this.pending) {
        this.rejectPending(id, new NativeDriverError('host-closed', 'Native driver helper closed.'));
      }
      if (this.child.exitCode === null && this.child.signalCode === null) {
        this.child.kill();
        await this.completed;
      }
    }
  }

  private onJson(message: NativeHostJsonMessage): void {
    if (message.type === 'event') {
      this.emit('event', message);
      return;
    }
    if (message.type === 'cancelled') {
      const error = new Error(`Native driver command "${message.id}" was cancelled.`);
      error.name = 'AbortError';
      this.rejectPending(message.id, error);
      return;
    }
    if (message.type !== 'response') {
      this.fail(new Error(`Native driver helper emitted unexpected "${message.type}" message after startup.`));
      return;
    }
    const pending = this.pending.get(message.id);
    if (!pending) {
      return;
    }
    pending.response = message;
    pending.binaryId = message.binary?.id;
    if (pending.binaryId) {
      this.pendingBinaryIds.set(pending.binaryId, message.id);
      const binary = this.binaryFrames.get(pending.binaryId);
      if (binary) {
        this.binaryFrames.delete(pending.binaryId);
        pending.binary = binary;
      }
    }
    this.completePending(message.id);
  }

  private onBinary(frame: NativeBinaryFrame): void {
    const requestId = this.pendingBinaryIds.get(frame.id);
    if (!requestId) {
      this.binaryFrames.set(frame.id, frame.data);
      return;
    }
    const pending = this.pending.get(requestId);
    if (!pending) {
      return;
    }
    pending.binary = frame.data;
    this.completePending(requestId);
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
      pending.reject(new NativeDriverError(response.error.code, response.error.message, response.error.data));
      return;
    }
    if (pending.aborted) {
      const error = new Error(`Native driver command "${id}" was cancelled.`);
      error.name = 'AbortError';
      pending.reject(error);
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
    if (!this.child.stdin.write(encodeJsonFrame(message))) {
      await new Promise<void>((resolve) => this.child.stdin.once('drain', resolve));
    }
  }

  private fail(error: Error): void {
    void this.failAfterRecovery(error);
  }

  private failAfterRecovery(error: Error): Promise<void> {
    return (this.failurePromise ??= this.recoverAndFail(error));
  }

  private async recoverAndFail(error: Error): Promise<void> {
    if (this.closed || this.closing) {
      return;
    }
    this.closed = true;
    if (this.child.exitCode === null && this.child.signalCode === null) {
      this.child.kill();
    }
    await this.completed;
    let failure = error;
    try {
      await this.recoverInput?.();
    } catch (recoveryError) {
      failure = new AggregateError([error, recoveryError], `${error.message} Native input recovery also failed.`);
    }
    for (const [id] of this.pending) {
      this.rejectPending(id, failure);
    }
    this.emit('exit', failure);
  }
}

function waitForHello(child: ChildProcessWithoutNullStreams, decoder: NativeFrameDecoder, timeoutMs: number): Promise<NativeHostHello> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      cleanup();
      child.kill();
      reject(new NativeDriverError('handshake-timeout', `Native driver helper did not send hello within ${timeoutMs} ms.`));
    }, timeoutMs);
    const onJson = (message: NativeHostJsonMessage) => {
      if (message.type !== 'hello') {
        cleanup();
        child.kill();
        reject(new NativeDriverError('handshake-failed', `Expected native helper hello, received "${message.type}".`));
        return;
      }
      cleanup();
      resolve(message);
    };
    const onError = (error: Error) => {
      cleanup();
      child.kill();
      reject(error);
    };
    const onExit = (code: number | null, signal: NodeJS.Signals | null) => {
      cleanup();
      reject(
        new NativeDriverError(
          'handshake-failed',
          `Native helper exited before hello with ${code === null ? `signal ${String(signal)}` : `code ${code}`}.`,
        ),
      );
    };
    const cleanup = () => {
      clearTimeout(timeout);
      decoder.off('json', onJson);
      decoder.off('error', onError);
      child.off('exit', onExit);
    };
    decoder.once('json', onJson);
    decoder.once('error', onError);
    child.once('exit', onExit);
  });
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

function delay(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}
