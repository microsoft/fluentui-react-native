import { createHash } from 'node:crypto';

import type { OperationResponse } from './envelope.js';
import { outcomeCapacity } from './limits.js';

/** A mutating request as the ledger remembers it: what was asked, and how it ended or will end. */
export type RecordedOutcome = {
  /** Names the operation and its validated input, so a reused id with a different request is told apart. */
  key: string;
  /** Resolves to the response, or rejects with the failure the caller received. */
  settled: Promise<OperationResponse>;
};

function canonical(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(canonical);
  }
  if (typeof value === 'object' && value !== null) {
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((key) => [key, canonical((value as Record<string, unknown>)[key])]),
    );
  }
  return value;
}

/**
 * Identifies a request by its operation and a digest of its validated input. The digest stays in memory and never
 * leaves the process, so typed text in the input is not recoverable from anything a caller or the journal sees.
 */
export function outcomeKey(operation: string, input: unknown): string {
  const digest = createHash('sha256')
    .update(JSON.stringify(canonical(input)))
    .digest('base64url');
  return `${operation}:${digest}`;
}

/**
 * The outcomes of the most recent mutating requests whose ids the caller chose. A repeated id returns the recorded
 * outcome, including a failure, and never runs the operation again; that is what makes a retry after a lost response
 * safe. The ledger lives with the session, which a service restart ends, so it needs no persistence of its own.
 */
export class OutcomeLedger {
  private readonly capacity: number;
  private readonly outcomes = new Map<string, RecordedOutcome>();

  constructor(capacity: number = outcomeCapacity) {
    this.capacity = Math.max(1, Math.floor(capacity));
  }

  lookup(requestId: string): RecordedOutcome | undefined {
    return this.outcomes.get(requestId);
  }

  /** Records a request before it runs, so a repeat that arrives while it is running waits for the same outcome. */
  begin(requestId: string, key: string): { reject(error: unknown): void; resolve(response: OperationResponse): void } {
    let resolve!: (response: OperationResponse) => void;
    let reject!: (error: unknown) => void;
    const settled = new Promise<OperationResponse>((onResolve, onReject) => {
      resolve = onResolve;
      reject = onReject;
    });
    // A recorded failure is only observed by a repeat, so it must not surface as an unhandled rejection.
    settled.catch(() => undefined);
    this.outcomes.set(requestId, { key, settled });
    while (this.outcomes.size > this.capacity) {
      this.outcomes.delete(this.outcomes.keys().next().value!);
    }
    return { reject, resolve };
  }
}
