import type { DesktopCommandRunner, PreparedDesktopCommand, RunningDesktopCommand } from './commands.js';
import { deadline } from './commands.js';
import type { DesktopServiceReady } from './processControl.js';
import type { DesktopReportWriter } from './reporting/collector.js';
import { orderDesktopResourceContributions, validateDesktopResourcePlan, validateDesktopResourceServiceReady } from './resources.js';
import type {
  DesktopResourceContext,
  DesktopResourceContribution,
  DesktopResourceRecord,
  DesktopResourceServiceReadyRecord,
} from './resources.js';

type ResourceEntry = {
  key: string;
  record: {
    id: string;
    identity: string;
    generation: number;
    ownership: 'owned' | 'borrowed';
    readiness: 'pending' | 'ready' | 'failed';
    disposal: 'pending' | 'settled' | 'failed' | 'not-owned';
    serviceReady?: DesktopResourceServiceReadyRecord;
  };
  dispose?: () => Promise<void>;
  disposalPromise?: Promise<void>;
};

export type DesktopServiceScopeOptions = {
  /**
   * How long close() waits for tracked work (resource acquisitions and guarded operations) to settle after the scope is
   * aborted, before each disposal pass. Work still running then is reported as a cleanup failure and abandoned.
   */
  drainTimeoutMs?: number;
};

export class DesktopStopRequested extends Error {
  constructor() {
    super('Owned desktop service stop requested.');
    this.name = 'DesktopStopRequested';
  }
}

/** Shared resource scope for native applications and integrations, including the transitional channel child. */
export class DesktopServiceScope {
  readonly controller = new AbortController();
  private readonly running: { id: string; command: RunningDesktopCommand }[] = [];
  private readonly resources: ResourceEntry[] = [];
  private readonly work = new Set<Promise<unknown>>();
  private readonly failed: Promise<never>;
  private rejectFailure!: (error: Error) => void;
  private closing = false;
  private closePromise?: Promise<void>;
  private generation = 0;
  private onResource?: (resource: DesktopResourceRecord) => void;
  private observerFailure?: Error;
  private stopFailed = false;
  private readonly runner: DesktopCommandRunner;
  private readonly reporter?: DesktopReportWriter;
  private readonly resourcePrefix: string;
  private readonly drainTimeoutMs: number;

  constructor(
    runner: DesktopCommandRunner,
    reporter?: DesktopReportWriter,
    resourcePrefix = 'desktop',
    options: DesktopServiceScopeOptions = {},
  ) {
    const { drainTimeoutMs = 60_000 } = options;
    if (!Number.isSafeInteger(drainTimeoutMs) || drainTimeoutMs <= 0 || drainTimeoutMs > 2_147_483_647)
      throw new RangeError('Desktop service scope drainTimeoutMs must be a positive integer number of milliseconds.');
    this.runner = runner;
    this.reporter = reporter;
    this.resourcePrefix = resourcePrefix;
    this.drainTimeoutMs = drainTimeoutMs;
    this.failed = new Promise<never>((_resolve, reject) => {
      this.rejectFailure = reject;
    });
    // A failure may arrive between guarded phases; retain it without an unhandled rejection.
    void this.failed.catch(() => undefined);
  }

  setResourceObserver(observer?: (resource: DesktopResourceRecord) => void): void {
    this.onResource = observer;
    if (observer) for (const resource of this.resources) this.publish(resource);
  }

  fail(error: Error): void {
    if (this.closing || this.controller.signal.aborted) return;
    this.reporter?.fail(error);
    this.controller.abort(error);
    this.rejectFailure(error);
  }

  requestStop(): void {
    this.closing = true;
    const reason = new DesktopStopRequested();
    this.controller.abort(reason);
    this.rejectFailure(reason);
  }

  start(id: string, command: PreparedDesktopCommand): RunningDesktopCommand {
    this.controller.signal.throwIfAborted();
    if (this.closing || this.running.some((service) => service.id === id))
      throw new Error(`Cannot start duplicate or closing service ${id}.`);
    const resource = this.createResource({
      id,
      identity: `service:${id}:${this.generation + 1}`,
      ownership: 'owned',
      readiness: 'pending',
      disposal: 'pending',
    });
    let running: RunningDesktopCommand;
    try {
      // A resource observer that failed while recording this service aborts the scope; do not start the process.
      this.controller.signal.throwIfAborted();
      // Services are stopped in reverse acquisition order by close(), not by the scope signal.
      running = this.runner.start({
        ...command,
        label: command.label ?? id,
        category: 'service',
        context: { ...command.context, service: id },
      });
      resource.dispose = () => running.stop({ failed: this.stopFailed });
    } catch (error) {
      resource.record.readiness = 'failed';
      resource.record.disposal = 'settled';
      this.publish(resource);
      throw error;
    }
    this.running.push({ id, command: running });
    void running.completed.then(
      (code) => {
        if (!this.closing)
          this.fail(
            running.failure instanceof Error
              ? running.failure
              : new Error(`Required service "${id}" exited unexpectedly with code ${code}. Log: ${running.logPath ?? 'unavailable'}`),
          );
      },
      (error: unknown) => this.fail(error instanceof Error ? error : new Error(String(error))),
    );
    return running;
  }

  async contribute(resources: readonly DesktopResourceContribution[], context: Omit<DesktopResourceContext, 'signal'>): Promise<void> {
    const ordered = orderDesktopResourceContributions(resources);
    for (const contribution of ordered) {
      if (this.resources.some((resource) => resource.key === contribution.id)) {
        throw new TypeError(`Duplicate desktop resource ID "${contribution.id}".`);
      }
    }
    for (const contribution of ordered) {
      this.controller.signal.throwIfAborted();
      if (this.closing) throw new Error('Cannot acquire desktop resources while the scope is closing.');
      const plan = contribution.prepare({ ...context, signal: this.controller.signal });
      validateDesktopResourcePlan(plan, contribution.id);
      const entry = this.createResource({
        id: contribution.id,
        identity: plan.identity,
        ownership: contribution.ownership,
        readiness: 'pending',
        disposal: contribution.ownership === 'owned' ? 'pending' : 'not-owned',
      });
      entry.dispose = contribution.ownership === 'owned' ? () => plan.dispose() : undefined;

      const acquisition = this.track(
        (async () => {
          try {
            const ready = await plan.acquire(this.controller.signal);
            if (ready !== undefined) {
              validateDesktopResourceServiceReady(ready);
              entry.record.serviceReady = Object.freeze({ ...ready });
            }
            entry.record.readiness = 'ready';
            this.publish(entry);
            if (this.controller.signal.aborted && entry.record.ownership === 'owned') await this.dispose(entry);
          } catch (error) {
            entry.record.readiness = 'failed';
            this.publish(entry);
            if (entry.record.ownership === 'owned') {
              try {
                await this.dispose(entry);
              } catch (cleanup) {
                throw new AggregateError([error, cleanup], `Resource "${contribution.id}" acquisition and cleanup failed.`);
              }
            }
            throw error;
          }
        })(),
      );
      try {
        await this.guard(acquisition);
      } catch (error) {
        this.fail(error instanceof Error ? error : new Error(String(error)));
        throw error;
      }
    }
  }

  waitForStop(): Promise<never> {
    return this.failed;
  }

  async guard<T>(work: Promise<T>): Promise<T> {
    const tracked = this.track(work);
    if (this.controller.signal.aborted) void tracked.catch(() => undefined);
    this.controller.signal.throwIfAborted();
    return Promise.race([tracked, this.failed]);
  }

  async ready(id: string, url: string, timeoutMs = 120_000, fetcher = globalThis.fetch): Promise<void> {
    const timeout = AbortSignal.timeout(timeoutMs);
    const signal = AbortSignal.any([this.controller.signal, timeout]);
    await this.guard(
      (async () => {
        let lastError: unknown;
        while (!signal.aborted) {
          try {
            const response = await fetcher(url, { signal: AbortSignal.any([signal, AbortSignal.timeout(2000)]), redirect: 'error' });
            await response.body?.cancel();
            if (response.ok) {
              const resource = this.resources.find((entry) => entry.key === id);
              if (resource) {
                resource.record.readiness = 'ready';
                this.publish(resource);
              }
              this.reporter?.emit({ kind: 'service-ready', payload: { message: id } }, id, { service: id });
              return;
            }
            lastError = new Error(`Readiness returned HTTP ${response.status}.`);
          } catch (error) {
            lastError = error;
          }
          await new Promise<void>((resolve) => setTimeout(resolve, 100));
        }
        if (this.controller.signal.aborted) throw this.controller.signal.reason;
        throw new Error(`Service "${id}" did not become ready within ${timeoutMs}ms.`, { cause: lastError ?? signal.reason });
      })(),
    );
  }

  async readyProcess(id: string, expected: DesktopServiceReady, timeoutMs = 120_000): Promise<DesktopResourceServiceReadyRecord> {
    validateServiceReadyExpectation(expected);
    if (!Number.isSafeInteger(timeoutMs) || timeoutMs <= 0) throw new TypeError('Invalid service readiness deadline.');
    const service = this.running.find((entry) => entry.id === id);
    if (!service) throw new Error(`Cannot wait for process readiness from unregistered service "${id}".`);
    const resource = this.resources.find((entry) => entry.key === id);
    if (!resource) throw new Error(`Service "${id}" has no registered resource record.`);
    const waitForReadiness = service.command.waitForReadiness;
    if (typeof waitForReadiness !== 'function') {
      resource.record.readiness = 'failed';
      this.publish(resource);
      const error = new Error(`Service "${id}" does not support correlated process readiness.`);
      this.fail(error);
      throw error;
    }

    return this.guard(
      (async () => {
        try {
          const ready = await waitForReadiness.call(service.command, expected, timeoutMs, this.controller.signal);
          validateDesktopResourceServiceReady(ready);
          if (ready.service !== expected.service || ready.descriptor !== expected.descriptor) {
            throw new Error(`Service "${id}" published readiness that does not match the configured expectation.`);
          }
          const record = Object.freeze({ ...ready });
          resource.record.serviceReady = record;
          resource.record.readiness = 'ready';
          this.publish(resource);
          return record;
        } catch (error) {
          resource.record.readiness = 'failed';
          this.publish(resource);
          this.fail(error instanceof Error ? error : new Error(String(error)));
          throw error;
        }
      })(),
    );
  }

  /**
   * Aborts the scope, waits (bounded) for tracked work, then disposes owned services and resources in reverse acquisition
   * order. Never call it from work the scope tracks: close() waits for that work.
   */
  close(): Promise<void> {
    return (this.closePromise ??= (async () => {
      this.closing = true;
      this.stopFailed = this.controller.signal.aborted && !(this.controller.signal.reason instanceof DesktopStopRequested);
      const closingReason = new Error('Desktop service scope is closing.');
      this.controller.abort(closingReason);
      // Work waiting for a stop request (waitForStop) settles too.
      this.rejectFailure(closingReason);
      const failures: unknown[] = [];
      await this.awaitWork(failures);
      for (const resource of [...this.resources].reverse()) {
        if (resource.record.ownership !== 'owned' || resource.record.disposal !== 'pending') continue;
        try {
          await this.dispose(resource);
        } catch (error) {
          failures.push(error);
          this.reporter?.fail(error, 'cleanup', resource.record.id);
        }
      }
      await this.awaitWork(failures);
      if (this.observerFailure) failures.push(this.observerFailure);
      if (failures.length) throw new AggregateError(failures, 'Owned desktop services did not shut down cleanly.');
    })());
  }

  private createResource(record: Omit<ResourceEntry['record'], 'generation'>): ResourceEntry {
    const entry: ResourceEntry = {
      key: record.id,
      record: { ...record, id: `${this.resourcePrefix}:${record.id}`, generation: ++this.generation },
    };
    this.resources.push(entry);
    this.publish(entry);
    return entry;
  }

  private snapshot(entry: ResourceEntry): DesktopResourceRecord {
    return Object.freeze({ ...entry.record });
  }

  // The observer records ownership (the workload claim); a failure there must not interrupt acquisition or disposal.
  private publish(entry: ResourceEntry): void {
    if (!this.onResource) return;
    try {
      this.onResource(this.snapshot(entry));
    } catch (error) {
      const failure = error instanceof Error ? error : new Error(String(error));
      if (this.observerFailure) return;
      this.observerFailure = failure;
      if (this.closing || this.controller.signal.aborted) this.reporter?.fail(failure, 'cleanup', entry.record.id);
      else this.fail(failure);
    }
  }

  private track<T>(work: Promise<T>): Promise<T> {
    this.work.add(work);
    void work.then(
      () => this.work.delete(work),
      () => this.work.delete(work),
    );
    return work;
  }

  private async awaitWork(failures: unknown[]): Promise<void> {
    const until = Date.now() + this.drainTimeoutMs;
    while (this.work.size > 0) {
      let results: PromiseSettledResult<unknown>[];
      try {
        results = await deadline(Promise.allSettled(this.work), Math.max(0, until - Date.now()), 'Draining desktop scope work');
      } catch {
        const error = new Error(
          `${this.work.size} tracked desktop operation(s) did not settle within ${this.drainTimeoutMs}ms after the scope closed; abandoning them.`,
        );
        // Abandoned work keeps its settlement handlers, so a late rejection is still observed.
        this.work.clear();
        failures.push(error);
        this.reporter?.fail(error, 'cleanup');
        return;
      }
      for (const result of results) {
        if (result.status === 'rejected' && result.reason !== this.controller.signal.reason) failures.push(result.reason);
      }
    }
  }

  private dispose(entry: ResourceEntry): Promise<void> {
    if (entry.disposalPromise) return entry.disposalPromise;
    if (!entry.dispose) return Promise.resolve();
    entry.record.disposal = 'pending';
    this.publish(entry);
    entry.disposalPromise = (async () => {
      try {
        await deadline(entry.dispose!(), 45_000, `Disposing resource ${entry.record.id}`);
        entry.record.disposal = 'settled';
        this.publish(entry);
      } catch (error) {
        entry.record.disposal = 'failed';
        this.publish(entry);
        throw error;
      }
    })();
    return entry.disposalPromise;
  }
}

function validateServiceReadyExpectation(value: unknown): asserts value is DesktopServiceReady {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new TypeError('Service readiness expectation must be an object.');
  }
  const expected = value as Record<string, unknown>;
  if (Object.keys(expected).some((key) => !['tier', 'service', 'descriptor'].includes(key))) {
    throw new TypeError('Service readiness expectation contains an unknown field.');
  }
  if (
    expected.tier !== 'service-ready' ||
    typeof expected.service !== 'string' ||
    !expected.service.trim() ||
    expected.service.includes('\0') ||
    (expected.descriptor !== undefined &&
      (typeof expected.descriptor !== 'string' || !expected.descriptor.trim() || expected.descriptor.includes('\0')))
  ) {
    throw new TypeError('Invalid service readiness expectation.');
  }
}
