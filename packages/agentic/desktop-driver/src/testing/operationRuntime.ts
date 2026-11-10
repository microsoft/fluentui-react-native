import type { NativeObservation, NativeObserveRequest } from '../host/types.js';
import type { ContentPolicy, OperationCapabilities, OperationHost, OperationRuntime, OperationStories } from '../operations/runtime.js';
import { OperationSessionState } from '../operations/sessionState.js';
import { HostUnsupportedError } from '../protocol/errors.js';
import { attachMutationReport, createMutationReport } from '../protocol/settlement.js';
import { withCommandTimeout } from '../protocol/timeouts.js';
import { buildSample } from './observationSample.js';

export type StubRuntimeOptions = {
  capabilities?: Partial<OperationCapabilities>;
  contentPolicy?: ContentPolicy;
  /** Replaces host commands, such as `click`, that the stub otherwise refuses. */
  host?: Partial<OperationHost>;
  nativeTimeoutMs?: number;
  /** The sample every `observe` returns. Use `observe` for one that depends on the request or the call. */
  observation?: NativeObservation;
  observe?: (request: NativeObserveRequest, signal: AbortSignal, call: number) => NativeObservation | Promise<NativeObservation>;
  /** Ends the request's commands, the way a disconnected client does. */
  signal?: AbortSignal;
  state?: OperationSessionState;
  /** The target's Storybook stories. Supplying them makes the `stories` capability true. */
  stories?: OperationStories;
  /** The session's current window, or `null` for none. Defaults to `w1`. */
  windowId?: string | null;
};

export type StubRuntime = {
  /** Values a test changes between calls, the way the session does. */
  control: { previewGeneration: number; quarantined: boolean; releaseError?: Error; windowId: string | undefined };
  /** Every request the host received. */
  observed: NativeObserveRequest[];
  /** Every release batch the host received, including batches that failed. */
  released: string[][];
  runtime: OperationRuntime;
  state: OperationSessionState;
};

/** An `OperationRuntime` over a recording host, bound to the real command timeout so cancellation behaves as served. */
export function stubRuntime(options: StubRuntimeOptions = {}): StubRuntime {
  const state = options.state ?? new OperationSessionState();
  const nativeTimeoutMs = options.nativeTimeoutMs ?? 10_000;
  const control: StubRuntime['control'] = {
    previewGeneration: 1,
    quarantined: false,
    windowId: options.windowId === null ? undefined : (options.windowId ?? 'w1'),
  };
  const observed: NativeObserveRequest[] = [];
  const released: string[][] = [];
  const unsupported = (): never => {
    throw new HostUnsupportedError('The stub runtime does not act on elements.');
  };
  const host: OperationHost = {
    activate: async () => unsupported(),
    captureElement: async () => unsupported(),
    captureWindow: async () => unsupported(),
    clear: async () => unsupported(),
    click: async () => unsupported(),
    hitTest: async () => unsupported(),
    listAccessibilityActions: async () => unsupported(),
    performAccessibilityAction: async () => unsupported(),
    sendKeys: async () => unsupported(),
    snapshot: async () => unsupported(),
    async observe(request, signal) {
      observed.push(request);
      if (options.observe) {
        return options.observe(request, signal, observed.length);
      }
      return options.observation ?? buildSample({ role: 'window' });
    },
    async releaseElements(nativeIds) {
      released.push([...nativeIds]);
      if (control.releaseError) {
        throw control.releaseError;
      }
      return nativeIds.length;
    },
    ...options.host,
  };
  const runtime: OperationRuntime = {
    capabilities: {
      accessibilityActions: false,
      accessibilityClick: false,
      boundedObservation: true,
      clear: true,
      elementCapture: false,
      keyboard: false,
      physicalClick: false,
      stories: options.stories !== undefined,
      windowCapture: false,
      ...options.capabilities,
    },
    cleanup: (description, run) => withCommandTimeout(run, nativeTimeoutMs, description),
    command: (description, run) => withCommandTimeout(run, nativeTimeoutMs, description, { signal: options.signal }),
    contentPolicy: options.contentPolicy ?? 'allow',
    currentWindowId: () => control.windowId,
    host,
    input: (run) => run(),
    mutate: (description, run) =>
      withCommandTimeout(run, nativeTimeoutMs, description).catch((error: unknown) => {
        throw attachMutationReport(error instanceof Error ? error : new Error(String(error)), createMutationReport(error, false));
      }),
    nativeTimeoutMs: () => nativeTimeoutMs,
    previewGeneration: () => control.previewGeneration,
    quarantined: () => control.quarantined,
    signal: options.signal ?? new AbortController().signal,
    state,
    ...(options.stories ? { stories: options.stories } : {}),
  };
  return { control, observed, released, runtime, state };
}
