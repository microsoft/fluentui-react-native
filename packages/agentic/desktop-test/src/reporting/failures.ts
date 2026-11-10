import { randomUUID } from 'node:crypto';

import { DesktopReportedError, isDesktopIncompleteError, serializeReportError } from './protocol.js';
import type { FailureKind, ReportFailure } from './protocol.js';

/**
 * The one place an error becomes a `ReportFailure`, shared by the collector and a delegated producer so both identify,
 * deduplicate, and sanitize a failure the same way. Failures are sanitized as decoded values, never as encoded text.
 */
export class DesktopFailureRegistry {
  private readonly ids = new WeakMap<object, string>();
  private readonly acknowledged = new Set<string>();
  private readonly sanitize: <T>(value: T) => T;
  /** Every failure recorded so far, by id. The collector passes the map its result is built from. */
  readonly recorded: Map<string, ReportFailure>;

  constructor(sanitize: <T>(value: T) => T, recorded = new Map<string, ReportFailure>()) {
    this.sanitize = sanitize;
    this.recorded = recorded;
  }

  failure(error: unknown, kind: FailureKind = 'infrastructure'): ReportFailure {
    if (error instanceof DesktopReportedError) return this.sanitize(error.failure);
    const object = typeof error === 'object' && error !== null ? error : undefined;
    let failureId = object ? this.ids.get(object) : undefined;
    if (!failureId && error instanceof Error && error.cause instanceof DesktopReportedError) return this.sanitize(error.cause.failure);
    if (!failureId && error instanceof Error && error.cause && typeof error.cause === 'object') failureId = this.ids.get(error.cause);
    if (!failureId) {
      failureId = randomUUID();
      if (object) this.ids.set(object, failureId);
    }
    return this.recorded.get(failureId) ?? this.sanitize({ failureId, kind, error: serializeReportError(error) });
  }

  /**
   * Records `error` once and returns its failure. `onFailure` receives each newly recorded failure. An incomplete-run
   * verdict is offered once to `onIncomplete`, which returns true when the run's status already carries it; the error is
   * then not a failure. If it returns false, the error is recorded as a failure like any other.
   */
  fail(
    error: unknown,
    kind: FailureKind,
    onFailure: (failure: ReportFailure) => void,
    onIncomplete: (failure: ReportFailure) => boolean,
  ): ReportFailure {
    if (error instanceof AggregateError && error.errors.length) {
      const children: unknown[] = error.errors;
      return children.map((child) => this.fail(child, kind, onFailure, onIncomplete))[0];
    }
    if (error instanceof Error && error.cause instanceof AggregateError) return this.fail(error.cause, kind, onFailure, onIncomplete);
    const failure = this.failure(error, kind);
    if (isDesktopIncompleteError(error)) {
      if (this.acknowledged.has(failure.failureId)) return failure;
      if (onIncomplete(failure)) {
        this.acknowledged.add(failure.failureId);
        return failure;
      }
    }
    if (this.recorded.has(failure.failureId)) return failure;
    this.recorded.set(failure.failureId, failure);
    onFailure(failure);
    return failure;
  }
}
