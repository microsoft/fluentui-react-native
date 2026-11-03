import type { z } from 'zod';

import type { NativeObservation, NativeObserveRequest } from '../host/types.js';
import type { JournalScalar } from './journal.js';
import type { OperationSessionState } from './sessionState.js';

/** The slice of a desktop host an operation uses. The server builds it from the session's host. */
export type OperationHost = {
  observe(request: NativeObserveRequest, signal: AbortSignal): Promise<NativeObservation>;
  releaseElements(nativeIds: readonly string[], signal: AbortSignal): Promise<number>;
};

/**
 * Whether operations may read what applications display. Element names and automation ids identify controls and are
 * always readable; `deny` withholds the content an application shows: values, text, and help.
 */
export type ContentPolicy = 'allow' | 'deny';

/** What the session's provider supports, which decides which operations are available. */
export type OperationCapabilities = {
  readonly boundedObservation: boolean;
};

/**
 * Everything an operation may touch for one request. Operations depend on this interface rather than on the server, so
 * they run unchanged under HTTP today and under an MCP adapter later, and a test can supply a plain object.
 */
export type OperationRuntime = {
  readonly capabilities: OperationCapabilities;
  readonly contentPolicy: ContentPolicy;
  readonly host: OperationHost;
  readonly state: OperationSessionState;
  /** Runs host work for this request: it ends at the native command timeout or when the caller leaves. */
  command<T>(description: string, run: (signal: AbortSignal) => Promise<T>): Promise<T>;
  /**
   * Runs host work that keeps the session correct, such as releasing records, so it still runs when the caller has
   * left. It ends at the native command timeout.
   */
  cleanup<T>(description: string, run: (signal: AbortSignal) => Promise<T>): Promise<T>;
  currentWindowId(): string | undefined;
  /** The native command timeout, which every provider deadline must fit inside. */
  nativeTimeoutMs(): number;
  /** The generation of the replaceable preview region; elements in it expire when it changes. */
  previewGeneration(): number;
  /** True while the session's target refuses mutations. Reads stay allowed. */
  quarantined(): boolean;
};

export type OperationAvailability = { available: true } | { available: false; reason: string };

export type OperationEffect = 'mutate' | 'read';

/**
 * One operation an agent can call. `Input` is what `run` receives after validation, so schema defaults are already
 * applied; `Output` is what it returns. The schemas are the contract: the catalog is generated from them and tests
 * parse real results against them.
 */
export type OperationDefinition<Input, Output> = {
  availability(capabilities: OperationCapabilities): OperationAvailability;
  readonly effect: OperationEffect;
  readonly input: z.ZodType<Input>;
  /** False for an operation that reads the journal, so reading it does not fill it. */
  readonly journaled?: boolean;
  readonly name: string;
  readonly output: z.ZodType<Output>;
  run(input: Input, runtime: OperationRuntime): Promise<Output>;
  /**
   * The scalar fields the journal may keep. `output` is absent when the operation failed. Never include anything an
   * application displayed or a caller typed.
   */
  summarize(input: Input, output: Output | undefined): Readonly<Record<string, JournalScalar>>;
  readonly summary: string;
};

/** An operation with its types erased, as the executor and catalog hold it. */
export type RegisteredOperation = OperationDefinition<unknown, unknown>;

/** Erases an operation's types for registration. The executor validates input before calling `run`. */
export function registerOperation<Input, Output>(definition: OperationDefinition<Input, Output>): RegisteredOperation {
  return definition as unknown as RegisteredOperation;
}
