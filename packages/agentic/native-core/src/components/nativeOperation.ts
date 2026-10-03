export type NativeOperationStatus =
  | 'confirmed'
  | 'cancelled'
  | 'not-mounted'
  | 'not-ready'
  | 'not-focusable'
  | 'inactive-window'
  | 'stale'
  | 'refused'
  | 'unsupported'
  | 'timed-out';

export interface NativeOperationOutcome {
  status: NativeOperationStatus;
}

export interface NativeOperationOptions {
  signal?: AbortSignal;
  timeoutMs?: number;
}

export interface NativeOperationResult {
  generation: number;
  requestId: number;
  status: string;
}

let nextGeneration = 0;
export function allocateGeneration(): number {
  if (nextGeneration === 2147483647) throw new Error('Native-core exhausted its command generation space.');
  return ++nextGeneration;
}

const statuses: readonly string[] = [
  'confirmed',
  'cancelled',
  'not-mounted',
  'not-ready',
  'not-focusable',
  'inactive-window',
  'stale',
  'refused',
  'unsupported',
  'timed-out',
];
function isStatus(value: string): value is NativeOperationStatus {
  return statuses.includes(value);
}

interface Pending {
  finish(outcome: NativeOperationOutcome): void;
  fail(error: Error): void;
}

export function createOperationChannel() {
  let generation: number | undefined;
  let nextRequest = 0;
  const pending = new Map<number, Pending>();
  const cancel = () => {
    generation = undefined;
    Array.from(pending.values()).forEach((request) => request.finish({ status: 'cancelled' }));
  };
  return {
    activate(value: number) {
      if (generation !== value) {
        cancel();
        generation = value;
      }
    },
    cancel,
    receive(result: NativeOperationResult) {
      if (result.generation !== generation) return;
      const request = pending.get(result.requestId);
      if (!request) return;
      if (!isStatus(result.status)) {
        const error = new Error(`Native-core received an invalid operation status: ${result.status}`);
        request.fail(error);
        throw error;
      }
      request.finish({ status: result.status });
    },
    request(
      dispatch: (generation: number, requestId: number) => void,
      options: NativeOperationOptions = {},
      isCurrent: () => boolean = () => true,
    ): Promise<NativeOperationOutcome> {
      const timeout = options.timeoutMs ?? 5000;
      if (!Number.isFinite(timeout) || timeout <= 0) throw new RangeError('Native operation timeoutMs must be positive and finite.');
      if (options.signal?.aborted) return Promise.resolve({ status: 'cancelled' });
      if (generation === undefined) return Promise.resolve({ status: 'not-mounted' });
      if (nextRequest === 2147483647) throw new Error('Native-core exhausted its request ID space.');
      const requestId = ++nextRequest;
      const capturedGeneration = generation;
      return new Promise((resolve, reject) => {
        const cleanup = () => {
          clearTimeout(timer);
          options.signal?.removeEventListener('abort', abort);
          pending.delete(requestId);
        };
        const finish = (outcome: NativeOperationOutcome) => {
          if (!pending.has(requestId)) return;
          cleanup();
          resolve(isCurrent() ? outcome : { status: 'cancelled' });
        };
        const abort = () => finish({ status: 'cancelled' });
        const timer = setTimeout(() => finish({ status: 'timed-out' }), timeout);
        pending.set(requestId, {
          finish,
          fail(error) {
            cleanup();
            reject(error);
          },
        });
        options.signal?.addEventListener('abort', abort, { once: true });
        try {
          dispatch(capturedGeneration, requestId);
        } catch (error) {
          cleanup();
          reject(error);
        }
      });
    },
  };
}
