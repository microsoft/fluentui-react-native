import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import { z } from 'zod';

import { DesktopRunQueryError, DesktopRunQueryService } from './reporting/runQueries.js';
import type { DesktopRunQuery, DesktopRunQueryResponse } from './reporting/runQueries.js';
import type { TestStatus } from './reporting/protocol.js';
import type { DesktopReportWriter } from './reporting/collector.js';

const workloadId = z.string().regex(/^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$/);
const storyId = z.string().regex(/^[A-Za-z0-9][A-Za-z0-9_-]{0,255}$/);
const requestId = z.string().regex(/^[A-Za-z0-9][A-Za-z0-9._:-]{0,63}$/);
const runHandle = z.string().regex(/^dwr_[0-9a-f]{32}$/);
const opaqueId = z.string().uuid();
const lane = z.enum(['accessible', 'physical']);
const actions = ['catalog', 'run', 'status', 'cancel', 'results', 'artifact'] as const;

/** The fixed management-tool schema. The service also validates the fields allowed for each action. */
export const desktopWorkloadInputSchema = z
  .strictObject({
    action: z.enum(actions),
    workload: workloadId.optional(),
    storyId: storyId.optional(),
    lane: lane.optional(),
    requestId: requestId.optional(),
    handle: runHandle.optional(),
    waitMs: z.number().int().min(0).max(10_000).optional(),
    category: z.enum(['status', 'tests', 'work', 'failures', 'artifacts']).optional(),
    limit: z.number().int().min(1).max(25).optional(),
    cursor: opaqueId.optional(),
    artifactId: opaqueId.optional(),
  })
  .superRefine((input, context) => {
    const allowed: Record<(typeof actions)[number], readonly string[]> = {
      catalog: ['action'],
      run: ['action', 'workload', 'storyId', 'lane', 'requestId'],
      status: ['action', 'handle', 'requestId', 'waitMs'],
      cancel: ['action', 'handle'],
      results: ['action', 'handle', 'category', 'limit', 'cursor'],
      artifact: ['action', 'handle', 'artifactId'],
    };
    const has = (key: keyof typeof input) => input[key] !== undefined;
    if (
      Object.keys(input).some((key) => !allowed[input.action].includes(key)) ||
      (input.action === 'run' && (!has('workload') || !has('lane') || !has('requestId'))) ||
      (input.action === 'status' && has('handle') && has('requestId')) ||
      (input.action === 'status' && has('waitMs') && !has('handle') && !has('requestId')) ||
      (input.action === 'cancel' && !has('handle')) ||
      (input.action === 'results' && (!has('handle') || !has('category'))) ||
      (input.action === 'results' && input.category === 'status' && (has('limit') || has('cursor'))) ||
      (input.action === 'artifact' && (!has('handle') || !has('artifactId')))
    ) {
      context.addIssue({ code: 'custom', message: 'Fields do not match the selected workload action.' });
    }
  });

export type DesktopWorkloadInput = z.infer<typeof desktopWorkloadInputSchema>;
export type DesktopWorkloadLane = z.infer<typeof lane>;
export type DesktopWorkloadScope = 'workload-read' | 'workload-run' | 'workload-cancel-own';

const catalogEntry = z
  .strictObject({
    id: workloadId,
    kind: z.enum(['wdio', 'csf-wdio']),
    lanes: z.array(lane).max(2),
    unavailable: z.enum(['host-input', 'runner-unavailable']).optional(),
  })
  .refine((value) => new Set(value.lanes).size === value.lanes.length)
  .refine((value) => (value.lanes.length === 0) === (value.unavailable !== undefined));

export type DesktopWorkloadCatalogEntry = Readonly<Omit<z.infer<typeof catalogEntry>, 'lanes'>> & {
  readonly lanes: readonly DesktopWorkloadLane[];
};
export type DesktopWorkloadRun = {
  handle: string;
  requestId: string;
  workload: string;
  storyId?: string;
  lane: DesktopWorkloadLane;
  phase: 'queued' | 'running' | 'settled';
  cancellation: 'none' | 'requested';
  outcome: 'pending' | TestStatus;
  cleanup: 'pending' | 'settled' | 'failed';
};
export type DesktopWorkloadAvailability = 'available' | 'busy' | 'capacity' | 'fenced' | 'closing';
type WithoutRunId<T> = T extends DesktopRunQueryResponse ? Omit<T, 'runId'> : never;
export type DesktopWorkloadResponse =
  | { schemaVersion: 1; availability: DesktopWorkloadAvailability; catalog: readonly DesktopWorkloadCatalogEntry[] }
  | { schemaVersion: 1; availability: DesktopWorkloadAvailability; run?: DesktopWorkloadRun }
  | ({ handle: string } & WithoutRunId<DesktopRunQueryResponse>);

export const desktopWorkloadErrorCodes = ['unavailable', 'invalid-request', 'busy', 'capacity', 'conflict', 'stale-cursor'] as const;
export type DesktopWorkloadErrorCode = (typeof desktopWorkloadErrorCodes)[number];
const errorMessages: Record<DesktopWorkloadErrorCode, string> = {
  unavailable: 'Desktop workload management is unavailable or unauthorized.',
  'invalid-request': 'Invalid desktop workload request.',
  busy: 'Another desktop workload is active or has not drained.',
  capacity: 'Desktop workload management capacity is exhausted.',
  conflict: 'The request ID already names a different desktop workload.',
  'stale-cursor': 'The desktop workload result cursor is stale or unauthorized.',
};

/** Public failures never contain producer exceptions, credentials, or local paths. */
export class DesktopWorkloadError extends Error {
  readonly code: DesktopWorkloadErrorCode;

  constructor(code: DesktopWorkloadErrorCode) {
    super(errorMessages[code]);
    this.name = 'DesktopWorkloadError';
    this.code = code;
  }
}

/**
 * One isolated run created by trusted supervisor code. `finish` must drain every worker and reservation, finalize the
 * report, and reject if cleanup is not confirmed. It is called even when execution or registration fails.
 */
export type DesktopWorkloadExecution = {
  runId: string;
  root: string;
  textArtifacts?: readonly string[];
  run(signal: AbortSignal): Promise<void>;
  finish(failure?: unknown): Promise<void>;
};

export type DesktopWorkloadServiceOptions = {
  catalog: readonly DesktopWorkloadCatalogEntry[];
  /** The trusted host maps the selected catalog ID to a declared suite; no executable inputs come from the client. */
  prepare(input: {
    workload: string;
    storyId?: string;
    lane: DesktopWorkloadLane;
    signal: AbortSignal;
    /** Bind the new reporter before preparation uses or records any credential. */
    bindReporter(reporter: Pick<DesktopReportWriter, 'addSecret' | 'emit'>): void;
    addSecret(secret: string): void;
  }): Promise<DesktopWorkloadExecution>;
  /** The published root delegates no authority outside this static supervisor policy. */
  scopes?: readonly DesktopWorkloadScope[];
  addSecret?(secret: string): void;
  /** Bounds explicit connection disposal and host shutdown; a timeout permanently fences the authority. */
  drainTimeoutMs?: number;
};

/** A connection may narrow, but never expand, the host's scopes and catalog. */
export type DesktopWorkloadAttenuation = {
  scopes?: readonly DesktopWorkloadScope[];
  workloads?: readonly { id: string; lanes: readonly DesktopWorkloadLane[] }[];
};

const attenuationSchema = z.strictObject({
  scopes: z
    .array(z.enum(['workload-read', 'workload-run', 'workload-cancel-own']))
    .max(3)
    .optional(),
  workloads: z
    .array(z.strictObject({ id: workloadId, lanes: z.array(lane).max(2) }))
    .max(64)
    .optional(),
});

type Principal = {
  key: string;
  scopes: ReadonlySet<DesktopWorkloadScope>;
  catalog: readonly DesktopWorkloadCatalogEntry[];
  requests: Map<string, { handle: string; workload: string; lane: DesktopWorkloadLane; storyId?: string }>;
  closing: boolean;
  disposal?: Promise<void>;
};
type RunRecord = DesktopWorkloadRun & {
  principal: Principal;
  controller: AbortController;
  execution?: DesktopWorkloadExecution;
  reporter?: Pick<DesktopReportWriter, 'addSecret' | 'emit'>;
  reportUncertain: boolean;
  queryGrant?: string;
  completedAt?: number;
  waiters: Set<() => void>;
  dispatched: boolean;
  executionFinished: boolean;
  interrupted: boolean;
  done: Promise<void>;
};

const maxCatalog = 64;
const maxPrincipals = 32;
const maxRetained = 64;
const maxRequestsPerPrincipal = 128;
const maxSecrets = 4096;
const maxWaiters = 32;
const retentionMs = 60 * 60 * 1000;
const queryExpiry = Number.MAX_SAFE_INTEGER;
const allScopes: readonly DesktopWorkloadScope[] = ['workload-read', 'workload-run', 'workload-cancel-own'];

/**
 * A host-owned, in-process workload authority. Transport loss never cancels a run; only explicit cancellation,
 * principal disposal, or host shutdown does. The host supplies the run factory and retains ownership of its resources.
 */
export class DesktopWorkloadService {
  readonly incarnation = `inc_${randomBytes(12).toString('hex')}`;
  /** Private root credential for verified descriptor publication, never a tool result. */
  readonly credential: string;
  private readonly credentialHash: Buffer;
  private readonly options: DesktopWorkloadServiceOptions;
  private readonly catalog: readonly DesktopWorkloadCatalogEntry[];
  private readonly scopes: ReadonlySet<DesktopWorkloadScope>;
  private readonly drainTimeoutMs: number;
  private readonly principals = new Map<string, Principal>();
  private readonly runs = new Map<string, RunRecord>();
  private readonly queries = new DesktopRunQueryService();
  private readonly secrets = new Set<string>();
  private active?: RunRecord;
  private fenced = false;
  private closing = false;
  private closePromise?: Promise<void>;
  private waiterCount = 0;

  constructor(options: DesktopWorkloadServiceOptions) {
    this.options = options;
    const catalog = z.array(catalogEntry).max(maxCatalog).parse(options.catalog);
    if (new Set(catalog.map(({ id }) => id)).size !== catalog.length) throw new TypeError('Duplicate desktop workload catalog ID.');
    this.catalog = Object.freeze(catalog.map((entry) => Object.freeze({ ...entry, lanes: Object.freeze([...entry.lanes]) })));
    const scopes = options.scopes ?? allScopes;
    if (scopes.some((scope) => !allScopes.includes(scope)) || new Set(scopes).size !== scopes.length) {
      throw new TypeError('Invalid desktop workload authority scope.');
    }
    this.scopes = new Set(scopes);
    this.drainTimeoutMs = options.drainTimeoutMs ?? 60_000;
    if (!Number.isSafeInteger(this.drainTimeoutMs) || this.drainTimeoutMs < 1 || this.drainTimeoutMs > 120_000) {
      throw new TypeError('Invalid desktop workload drain deadline.');
    }
    this.credential = createCredential('dmg');
    this.credentialHash = hash(this.credential);
    this.addSecret(this.credential);
  }

  /** Authenticate only the descriptor root; it cannot query or run work. */
  authenticate(credential: string): boolean {
    return !this.closing && validCredential(credential, 'dmg') && timingSafeEqual(hash(credential), this.credentialHash);
  }

  /** The caller retains this connection credential privately until its explicit, drain-confirmed disposal. */
  connect(credential: string, attenuation: DesktopWorkloadAttenuation = {}): string {
    if (!this.authenticate(credential)) throw new DesktopWorkloadError('unavailable');
    if (this.principals.size >= maxPrincipals) throw new DesktopWorkloadError('capacity');
    const parsed = attenuationSchema.safeParse(attenuation);
    if (!parsed.success) throw new DesktopWorkloadError('unavailable');
    const scopes = parsed.data.scopes ?? [...this.scopes];
    if (new Set(scopes).size !== scopes.length || scopes.some((scope) => !this.scopes.has(scope))) {
      throw new DesktopWorkloadError('unavailable');
    }
    let catalog = this.catalog;
    if (parsed.data.workloads !== undefined) {
      const selected: DesktopWorkloadCatalogEntry[] = [];
      const seen = new Set<string>();
      for (const selection of parsed.data.workloads) {
        const entry = this.catalog.find(({ id }) => id === selection.id);
        if (
          !entry ||
          seen.has(selection.id) ||
          new Set(selection.lanes).size !== selection.lanes.length ||
          selection.lanes.some((input) => !entry.lanes.includes(input))
        ) {
          throw new DesktopWorkloadError('unavailable');
        }
        seen.add(selection.id);
        if (selection.lanes.length || entry.unavailable) {
          selected.push(Object.freeze({ ...entry, lanes: Object.freeze([...selection.lanes]) }));
        }
      }
      catalog = Object.freeze(selected);
    }
    const token = createCredential('dmp');
    const key = hash(token).toString('hex');
    this.addSecret(token);
    this.principals.set(key, { key, scopes: new Set(scopes), catalog, requests: new Map(), closing: false });
    return token;
  }

  async request(credential: string, value: unknown, signal?: AbortSignal): Promise<DesktopWorkloadResponse> {
    const principal = this.principal(credential);
    const parsed = desktopWorkloadInputSchema.safeParse(value);
    if (!parsed.success) throw new DesktopWorkloadError('invalid-request');
    const input = parsed.data;
    this.expire();
    switch (input.action) {
      case 'catalog':
        this.requireScope(principal, 'workload-read');
        return { schemaVersion: 1, availability: this.availability(principal), catalog: principal.catalog };
      case 'run':
        this.requireScope(principal, 'workload-run');
        return this.admit(principal, input.workload!, input.lane!, input.requestId!, input.storyId);
      case 'status': {
        this.requireScope(principal, 'workload-read');
        if (!input.handle && !input.requestId) return { schemaVersion: 1, availability: this.availability(principal) };
        const handle = input.handle ?? principal.requests.get(input.requestId!)?.handle;
        const run = this.ownRun(principal, handle);
        if (input.waitMs && run.phase !== 'settled') await this.wait(run, input.waitMs, signal);
        return this.present(run);
      }
      case 'cancel': {
        this.requireScope(principal, 'workload-cancel-own');
        const run = this.ownRun(principal, input.handle);
        this.cancel(run);
        return this.present(run);
      }
      case 'results': {
        this.requireScope(principal, 'workload-read');
        const run = this.ownRun(principal, input.handle);
        const operation = input.category!;
        return this.query(run, {
          operation,
          runId: run.execution?.runId ?? '',
          ...(input.limit === undefined ? {} : { limit: input.limit }),
          ...(input.cursor === undefined ? {} : { cursor: input.cursor }),
        } as DesktopRunQuery);
      }
      case 'artifact': {
        this.requireScope(principal, 'workload-read');
        const run = this.ownRun(principal, input.handle);
        return this.query(run, { operation: 'artifact', runId: run.execution?.runId ?? '', artifactId: input.artifactId! });
      }
    }
  }

  /** Fence the connection first, then cancel and await all of its accepted runs and their cleanup. */
  dispose(credential: string): Promise<void> {
    const principal = this.principal(credential, true);
    principal.closing = true;
    return (principal.disposal ??= (async () => {
      const runs = [...this.runs.values()].filter((run) => run.principal === principal);
      for (const run of runs) this.cancel(run);
      await this.drain(runs);
      if (runs.some((run) => run.cleanup === 'failed')) throw new DesktopWorkloadError('unavailable');
      for (const run of runs) this.forget(run);
      this.principals.delete(principal.key);
    })());
  }

  /** Stops admissions and drains every connection's work; failed cleanup remains fenced for the owning supervisor. */
  close(): Promise<void> {
    this.closing = true;
    return (this.closePromise ??= (async () => {
      const runs = [...this.runs.values()];
      for (const principal of this.principals.values()) principal.closing = true;
      for (const run of runs) this.cancel(run);
      await this.drain(runs);
      if (this.fenced || runs.some((run) => run.cleanup === 'failed')) throw new DesktopWorkloadError('unavailable');
      this.principals.clear();
    })());
  }

  private admit(principal: Principal, workload: string, input: DesktopWorkloadLane, id: string, storyId?: string): DesktopWorkloadResponse {
    const previous = principal.requests.get(id);
    if (previous) {
      if (previous.workload !== workload || previous.lane !== input || previous.storyId !== storyId)
        throw new DesktopWorkloadError('conflict');
      return this.present(this.ownRun(principal, previous.handle));
    }
    if (this.closing || this.fenced) throw new DesktopWorkloadError('unavailable');
    const entry = principal.catalog.find((candidate) => candidate.id === workload);
    if (!entry || !entry.lanes.includes(input)) throw new DesktopWorkloadError('unavailable');
    if (storyId !== undefined && entry.kind !== 'csf-wdio') throw new DesktopWorkloadError('invalid-request');
    if (this.active) throw new DesktopWorkloadError('busy');
    if (principal.requests.size >= maxRequestsPerPrincipal || this.runs.size >= maxRetained || this.secrets.size >= maxSecrets) {
      throw new DesktopWorkloadError('capacity');
    }
    const run: RunRecord = {
      handle: `dwr_${randomBytes(16).toString('hex')}`,
      requestId: id,
      workload,
      ...(storyId === undefined ? {} : { storyId }),
      lane: input,
      phase: 'queued',
      cancellation: 'none',
      outcome: 'pending',
      cleanup: 'pending',
      principal,
      controller: new AbortController(),
      waiters: new Set(),
      dispatched: false,
      executionFinished: false,
      interrupted: false,
      reportUncertain: false,
      done: Promise.resolve(),
    };
    principal.requests.set(id, { handle: run.handle, workload, lane: input, ...(storyId === undefined ? {} : { storyId }) });
    this.runs.set(run.handle, run);
    this.active = run;
    // Admission and request-ID binding are recorded synchronously before any work can dispatch.
    run.done = Promise.resolve().then(() => this.execute(run));
    return this.present(run);
  }

  private async execute(run: RunRecord): Promise<void> {
    let failure: unknown;
    if (!run.controller.signal.aborted) {
      try {
        const execution = await this.options.prepare({
          workload: run.workload,
          ...(run.storyId === undefined ? {} : { storyId: run.storyId }),
          lane: run.lane,
          signal: run.controller.signal,
          bindReporter: (reporter) => {
            if (run.reporter || typeof reporter?.addSecret !== 'function' || typeof reporter.emit !== 'function') {
              throw new Error('Desktop workload requires one reporter.');
            }
            run.reporter = reporter;
            for (const secret of this.secrets) reporter.addSecret(secret);
          },
          addSecret: (secret) => this.addSecret(secret),
        });
        run.execution = execution;
        if (!run.reporter) throw new Error('Desktop workload requires a reporter before preparation.');
        this.queries.registerRun({
          runId: execution.runId,
          root: execution.root,
          expiresAt: queryExpiry,
          textArtifacts: execution.textArtifacts,
        });
        run.queryGrant = this.queries.issueGrant({ runIds: [execution.runId], expiresAt: queryExpiry, artifacts: true });
        this.addSecret(run.queryGrant);
        if (!run.controller.signal.aborted) {
          run.phase = 'running';
          run.dispatched = true;
          this.notify(run);
          try {
            await execution.run(run.controller.signal);
          } finally {
            run.executionFinished = true;
          }
        }
      } catch (error) {
        failure = error === undefined ? new Error('Desktop workload execution failed.') : error;
      }
    }
    if (run.execution) {
      try {
        await run.execution.finish(failure);
        run.cleanup = 'settled';
      } catch {
        run.cleanup = 'failed';
        this.fenced = true;
      }
    } else if (failure !== undefined) {
      // A failed factory cannot prove that a partially acquired resource was released.
      run.cleanup = 'failed';
      this.fenced = true;
    } else {
      run.cleanup = 'settled';
    }

    let reportStatus: TestStatus | undefined;
    let reportTerminal = false;
    if (run.execution && run.queryGrant) {
      try {
        const status = this.queries.query(run.queryGrant, { operation: 'status', runId: run.execution.runId });
        if ('counts' in status) {
          reportStatus = status.status;
          reportTerminal = status.terminal;
        }
      } catch {
        // A missing or unreadable report can never certify a successful run.
      }
    }
    if (reportStatus === 'failed' || (failure !== undefined && !isCancellation(failure, run.controller.signal))) {
      run.outcome = 'failed';
    } else if (!run.dispatched && run.cancellation === 'requested') {
      run.outcome = 'cancelled';
    } else if (run.interrupted || failure !== undefined || !reportTerminal || reportStatus === undefined) {
      run.outcome = 'incomplete';
    } else {
      run.outcome = reportStatus;
    }
    run.phase = 'settled';
    run.completedAt = Date.now();
    if (this.active === run) this.active = undefined;
    this.notify(run);
  }

  private query(run: RunRecord, query: DesktopRunQuery): DesktopWorkloadResponse {
    if (!run.queryGrant || !run.execution || run.reportUncertain) throw new DesktopWorkloadError('unavailable');
    try {
      const { runId: _runId, ...result } = this.queries.query(run.queryGrant, query);
      return { handle: run.handle, ...result };
    } catch (error) {
      throw new DesktopWorkloadError(
        error instanceof DesktopRunQueryError && error.code === 'stale-cursor' ? 'stale-cursor' : 'unavailable',
      );
    }
  }

  private cancel(run: RunRecord): void {
    if (run.phase === 'settled' || run.cancellation === 'requested') return;
    run.cancellation = 'requested';
    if (run.dispatched && !run.executionFinished) {
      run.interrupted = true;
      try {
        run.reporter!.emit(
          { kind: 'scope-start', payload: { label: 'Workload interrupted before completion', category: 'phase' } },
          `interrupted-${run.handle.slice(4)}`,
        );
      } catch {
        run.reportUncertain = true;
      }
    }
    run.controller.abort(new WorkloadCancelled());
    this.notify(run);
  }

  private present(run: RunRecord): DesktopWorkloadResponse {
    const { handle, requestId, workload, storyId, lane, phase, cancellation, outcome, cleanup } = run;
    return {
      schemaVersion: 1,
      availability: this.availability(run.principal),
      run: { handle, requestId, workload, ...(storyId === undefined ? {} : { storyId }), lane, phase, cancellation, outcome, cleanup },
    };
  }

  private availability(principal: Principal): DesktopWorkloadAvailability {
    if (this.closing) return 'closing';
    if (this.fenced) return 'fenced';
    if (this.active) return 'busy';
    if (this.secrets.size >= maxSecrets || this.runs.size >= maxRetained || principal.requests.size >= maxRequestsPerPrincipal) {
      return 'capacity';
    }
    return 'available';
  }

  private principal(credential: string, includeClosing = false): Principal {
    if (!validCredential(credential, 'dmp')) throw new DesktopWorkloadError('unavailable');
    const principal = this.principals.get(hash(credential).toString('hex'));
    if (!principal || (principal.closing && !includeClosing) || this.closing) throw new DesktopWorkloadError('unavailable');
    return principal;
  }

  private ownRun(principal: Principal, handle?: string): RunRecord {
    const run = handle ? this.runs.get(handle) : undefined;
    if (!run || run.principal !== principal) throw new DesktopWorkloadError('unavailable');
    return run;
  }

  private requireScope(principal: Principal, scope: DesktopWorkloadScope): void {
    if (!principal.scopes.has(scope)) throw new DesktopWorkloadError('unavailable');
  }

  /** Registers a trusted credential with host, run, and query redactors before it is used. */
  addSecret(secret: string): void {
    if (!secret) return;
    if (!this.secrets.has(secret)) {
      if (this.secrets.size >= maxSecrets) throw new DesktopWorkloadError('capacity');
      this.secrets.add(secret);
    }
    this.queries.addSecret(secret);
    this.options.addSecret?.(secret);
    for (const run of this.runs.values()) run.reporter?.addSecret(secret);
  }

  private expire(): void {
    const now = Date.now();
    for (const run of this.runs.values()) {
      if (run.cleanup !== 'settled' || run.completedAt === undefined || run.completedAt + retentionMs > now) continue;
      this.forget(run);
      // Keep the principal's bounded request-ID tombstone; an expired admission must never be replayed.
    }
  }

  private forget(run: RunRecord): void {
    this.runs.delete(run.handle);
    if (run.queryGrant) this.queries.revokeGrant(run.queryGrant);
    if (run.execution) this.queries.forgetRun(run.execution.runId);
  }

  private async drain(runs: readonly RunRecord[]): Promise<void> {
    let timer: NodeJS.Timeout | undefined;
    try {
      await Promise.race([
        Promise.all(runs.map((run) => run.done)),
        new Promise<never>((_resolve, reject) => {
          timer = setTimeout(() => reject(new DesktopWorkloadError('unavailable')), this.drainTimeoutMs);
          timer.unref();
        }),
      ]);
    } catch {
      this.fenced = true;
      throw new DesktopWorkloadError('unavailable');
    } finally {
      if (timer) clearTimeout(timer);
    }
  }

  private wait(run: RunRecord, timeoutMs: number, signal?: AbortSignal): Promise<void> {
    if (this.waiterCount >= maxWaiters) throw new DesktopWorkloadError('capacity');
    if (signal?.aborted) return Promise.reject(new DesktopWorkloadError('unavailable'));
    this.waiterCount++;
    return new Promise<void>((resolve, reject) => {
      let completed = false;
      const complete = (error?: Error) => {
        if (completed) return;
        completed = true;
        clearTimeout(timer);
        signal?.removeEventListener('abort', abort);
        run.waiters.delete(change);
        this.waiterCount--;
        if (error) reject(error);
        else resolve();
      };
      const change = () => complete();
      const abort = () => complete(new DesktopWorkloadError('unavailable'));
      const timer = setTimeout(change, timeoutMs);
      timer.unref();
      run.waiters.add(change);
      signal?.addEventListener('abort', abort, { once: true });
    });
  }

  private notify(run: RunRecord): void {
    for (const waiter of run.waiters) waiter();
  }
}

class WorkloadCancelled extends Error {
  constructor() {
    super('Desktop workload cancellation requested.');
    this.name = 'AbortError';
  }
}

function isCancellation(error: unknown, signal: AbortSignal): boolean {
  return signal.aborted && (error === signal.reason || (error instanceof Error && error.name === 'AbortError'));
}

function createCredential(prefix: 'dmg' | 'dmp'): string {
  return `${prefix}1.${randomBytes(32).toString('base64url')}`;
}

function validCredential(value: unknown, prefix: 'dmg' | 'dmp'): value is string {
  return typeof value === 'string' && value.length === 48 && value.startsWith(`${prefix}1.`) && /^[A-Za-z0-9_-]{43}$/.test(value.slice(5));
}

function hash(value: string): Buffer {
  return createHash('sha256').update(value).digest();
}
