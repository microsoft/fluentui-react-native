import type { NativeObservation, NativeObservedNode, NativeObserveFact, NativeObserveRequest } from '../host/types.js';
import { toWebDriverError } from '../protocol/errors.js';
import { operationError } from './envelope.js';
import { nativeByteBudget, nativeDeadlineMarginMs, observationBudgets } from './limits.js';
import type { ProjectionRefs } from './projection.js';
import { referenceFailureError, staleReferenceError } from './refs.js';
import type { OperationRuntime } from './runtime.js';
import type { OperationWarning, SampleInfo } from './shapes.js';

/** The limits that shape the provider's walk. The size limits that shape the answer belong to each operation. */
export type WalkLimits = {
  deadlineMs: number;
  maxDepth: number;
  maxStringLength: number;
  maxVisited: number;
};

export type SamplingRequest = {
  facts: readonly NativeObserveFact[];
  limits: WalkLimits;
  /** A reference to observe inside. Omitted, the sample covers the session's current window. */
  within?: string;
};

export type SamplingContext = {
  /** Issues the element's reference, or returns the one it already has. */
  issue(node: NativeObservedNode): string;
  observation: NativeObservation;
  /** References for a projection, which asks for them only for the nodes it emits. */
  refs: ProjectionRefs;
};

export type Sampled<T> = {
  /** The deadline the provider was given, which is the request's clamped to the native command timeout. */
  deadlineMs: number;
  sample: Omit<SampleInfo, 'root'>;
  value: T;
  warnings: OperationWarning[];
};

type Target = {
  rootId?: string;
  scope: 'element' | 'window';
  windowId: string;
  within?: string;
};

/** The provider's deadline ends before the native command timeout, so a slow walk returns a partial sample, not an error. */
export function nativeDeadline(requestedMs: number, nativeTimeoutMs: number): number {
  const latest = Math.max(observationBudgets.deadlineMs.floor, nativeTimeoutMs - nativeDeadlineMarginMs);
  return Math.min(requestedMs, latest);
}

function resolveTarget(runtime: OperationRuntime, within: string | undefined): Target {
  if (within === undefined) {
    const windowId = runtime.currentWindowId();
    if (windowId === undefined) {
      throw operationError('no such window', 'no-window', 'The session has no window to observe.');
    }
    return { scope: 'window', windowId };
  }
  const resolution = runtime.state.refs.resolve(within, runtime.previewGeneration());
  if (resolution.ok === false) {
    throw referenceFailureError(resolution.failure, within);
  }
  // A reference pins its own window, so it keeps working while another window is current.
  return { rootId: resolution.entry.nativeId, scope: 'element', windowId: resolution.entry.windowId, within };
}

/**
 * Turns a provider failure into what the caller can act on, and forgets what the failure proved gone. The provider
 * rejected the reference's element or window, so Node stops offering it instead of waiting for the next rejection.
 */
function interpretFailure(runtime: OperationRuntime, target: Target, error: unknown): unknown {
  const failure = toWebDriverError(error);
  const { ledger, refs } = runtime.state;
  if (failure.code === 'no such window') {
    ledger.queue(refs.dropWindow(target.windowId));
    return operationError('no such window', 'window-closed', 'The window is no longer open.');
  }
  if (target.within !== undefined && (failure.code === 'stale element reference' || failure.code === 'no such element')) {
    const nativeId = refs.drop(target.within);
    if (nativeId !== undefined) {
      ledger.queue([nativeId]);
    }
    return staleReferenceError(target.within);
  }
  return error;
}

async function observeNative(runtime: OperationRuntime, target: Target, request: NativeObserveRequest): Promise<NativeObservation> {
  try {
    return await runtime.command('Observing the application', (signal) => runtime.host.observe(request, signal));
  } catch (error) {
    throw interpretFailure(runtime, target, error);
  }
}

/** Releases what the session no longer retains. A failure leaves the ids pending and warns; it never fails the operation. */
async function flushLedger(runtime: OperationRuntime): Promise<OperationWarning[]> {
  const { ledger } = runtime.state;
  if (ledger.pendingCount === 0) {
    return [];
  }
  const flushed = await ledger.flush((nativeIds) =>
    runtime.cleanup('Releasing observed elements', (signal) => runtime.host.releaseElements(nativeIds, signal)),
  );
  return flushed.failed ? [{ code: 'release-failed', pending: flushed.pending }] : [];
}

/**
 * Takes one bounded sample of the application and keeps the session's records consistent around it, so no operation
 * can leak provider records or reference table entries however it ends:
 *
 * - `use` issues references only for the elements it returns;
 * - references beyond the table's capacity are evicted, oldest and stale-region first;
 * - every other element the provider read is queued for release, and the queue is flushed on a command that does not
 *   end when the caller leaves, whether `use` succeeded or threw.
 *
 * What the provider recorded for an observation that never returned cannot be released, because Node never learned the
 * ids. It stays until the window or application closes.
 */
export async function sampleTree<T>(
  runtime: OperationRuntime,
  request: SamplingRequest,
  use: (context: SamplingContext) => T,
): Promise<Sampled<T>> {
  const { state } = runtime;
  const target = resolveTarget(runtime, request.within);
  const deadlineMs = nativeDeadline(request.limits.deadlineMs, runtime.nativeTimeoutMs());
  const nativeRequest: NativeObserveRequest = {
    budget: {
      deadlineMs,
      maxBytes: nativeByteBudget(request.limits.maxVisited, request.limits.maxStringLength),
      maxDepth: request.limits.maxDepth,
      maxStringLength: request.limits.maxStringLength,
      maxVisited: request.limits.maxVisited,
    },
    facts: request.facts,
    ...(target.rootId === undefined ? {} : { rootId: target.rootId }),
    windowId: target.windowId,
  };
  const sequence = state.nextSample();
  const observation = await observeNative(runtime, target, nativeRequest);
  const capturedAt = new Date().toISOString();
  const previewGeneration = runtime.previewGeneration();

  const issue = (node: NativeObservedNode): string =>
    state.refs.issue({ nativeId: node.id, previewGeneration, scope: node.scope, windowId: target.windowId }, sequence);
  const refs: ProjectionRefs = {
    assign: (nodes) => nodes.map(issue),
    maxLength: (count) => state.refs.maxLength(count),
  };

  let value: T | undefined;
  let failure: { error: unknown } | undefined;
  try {
    value = use({ issue, observation, refs });
    state.ledger.queue(state.refs.evict(sequence, previewGeneration));
  } catch (error) {
    failure = { error };
  }
  state.ledger.queue(observation.nodes.map((node) => node.id));
  const warnings = await flushLedger(runtime);
  if (failure) {
    throw failure.error;
  }

  return {
    deadlineMs,
    sample: {
      capturedAt,
      elapsedMs: Math.round(observation.elapsedMs),
      epoch: { incarnation: state.incarnation, region: previewGeneration },
      id: `o${sequence}`,
      scope: target.scope,
      window: target.windowId,
    },
    value: value as T,
    warnings,
  };
}
