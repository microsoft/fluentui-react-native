/** The schema version of operation requests and results. A change that alters existing fields increments it. */
export const operationSchemaVersion = 1;

export type OperationBudget = {
  /** The most a caller may ask for. The service owns it; a request above it is rejected, never clamped. */
  ceiling: number;
  /** Applied when the caller does not choose. */
  default: number;
  /** The least a request may ask for, so a budget cannot be set below what the providers accept. */
  floor: number;
};

/**
 * Budgets for one observation. `maxVisited`, `maxDepth`, `maxStringLength`, and `deadlineMs` bound the native
 * traversal; `maxNodes` and `maxBytes` bound what Node returns after projection. Ceilings stay inside the native
 * contract (`native/PROTOCOL.md`), so every accepted value is also acceptable to a provider.
 */
export const observationBudgets = {
  deadlineMs: { ceiling: 15_000, default: 3_000, floor: 50 },
  maxBytes: { ceiling: 65_536, default: 12_288, floor: 1_024 },
  maxDepth: { ceiling: 64, default: 24, floor: 0 },
  maxNodes: { ceiling: 500, default: 100, floor: 1 },
  maxStringLength: { ceiling: 1_024, default: 120, floor: 16 },
  maxVisited: { ceiling: 5_000, default: 1_500, floor: 1 },
} as const satisfies Record<string, OperationBudget>;

export type ObservationBudgetName = keyof typeof observationBudgets;

/**
 * Search budgets: finding needs the whole bounded sample to prove uniqueness, but returns only a few candidates. The
 * walk defaults to the largest the provider accepts, because a search that stops early can prove only that it found
 * more than one match; `deadlineMs` is what keeps it quick.
 */
export const searchBudgets = {
  deadlineMs: { ceiling: 15_000, default: 5_000, floor: 50 },
  limit: { ceiling: 50, default: 10, floor: 1 },
  maxDepth: { ceiling: 64, default: 64, floor: 0 },
  maxStringLength: { ceiling: 1_024, default: 256, floor: 16 },
  maxVisited: { ceiling: 5_000, default: 5_000, floor: 1 },
} as const satisfies Record<string, OperationBudget>;

/** How much of the native command timeout a provider deadline may use; the rest covers transport and release. */
export const nativeDeadlineMarginMs = 1_500;

/**
 * The most element references one session retains. Older, unobserved references expire first. The floor keeps one
 * maximal observation (`observationBudgets.maxNodes.ceiling`) inside the table.
 */
export const referenceCapacity = { ceiling: 4_000, default: 2_000, floor: 512 } as const satisfies OperationBudget;

/** The most element ids one `releaseElements` call carries (`native/PROTOCOL.md`). */
export const releaseBatchSize = 1_000;

/** The most journal entries one session retains; older entries are dropped and counted. */
export const journalCapacity = { ceiling: 5_000, default: 500, floor: 16 } as const satisfies OperationBudget;

export const journalPage = { ceiling: 200, default: 50, floor: 1 } as const satisfies OperationBudget;

/** The most uniqueness proofs one session keeps; an action must cite one, so older proofs need a fresh `find`. */
export const proofCapacity = 64;

/** The most caller-chosen mutating request ids whose outcomes one session remembers for idempotent retries. */
export const outcomeCapacity = 256;

/** The longest text one `type` action sends. */
export const maxTypedTextLength = 4_096;

/** The longest accessibility action name `act` accepts. Authored action names are short labels. */
export const maxActionNameLength = 256;

/**
 * How long a `check` may wait for its expectation, in milliseconds. A wait holds the session's queue, never the
 * target's input turn; an evaluation still running when the wait ends finishes before the result is returned.
 */
export const checkWaitMs = { ceiling: 30_000, default: 0, floor: 0 } as const satisfies OperationBudget;

/**
 * Captured images a session keeps in memory: the most artifacts, their total bytes, and the largest one image may be.
 * The oldest are dropped first.
 */
export const artifactLimits = { maxBytes: 16 * 1024 * 1024, maxCount: 16, maxTotalBytes: 32 * 1024 * 1024 } as const;

/** Image bytes `capture` returns inline, and `artifact` returns per page, before base64 encoding. */
export const artifactPageBytes = { ceiling: 1024 * 1024, default: 1024 * 1024, floor: 1024 } as const satisfies OperationBudget;

/** The most steps one `sequence` runs. Its checks share one `checkWaitMs` ceiling, so it holds the queue no longer. */
export const maxSequenceSteps = 8;

/** The first and the longest pause between a waiting check's evaluations. Host events end a pause early. */
export const checkPollMs = { first: 100, longest: 1_000 } as const;

/** The longest exact name, value, or text a check compares. */
export const maxExpectedTextLength = 1_024;

/** The largest request an operation accepts, measured as serialized JSON. */
export const maxOperationRequestBytes = 65_536;

/** The longest a caller-chosen request id may be. Ids are echoed in results and journals. */
export const maxRequestIdLength = 64;

/**
 * The largest native response Node asks for. The native byte budget is a safety net, sized from the visited budget so
 * it does not trip before the node count does: a node with every fact and clipped strings stays well below this.
 */
export function nativeByteBudget(maxVisited: number, maxStringLength: number): number {
  const nativeMin = 4_096;
  const nativeMax = 4 * 1024 * 1024;
  return Math.min(nativeMax, Math.max(nativeMin, maxVisited * (700 + 4 * maxStringLength)));
}
