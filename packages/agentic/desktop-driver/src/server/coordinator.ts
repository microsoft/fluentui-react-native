import * as crypto from 'node:crypto';

import { DesktopCancelledError, DesktopDriverError, DesktopValidationError } from '../errors.ts';
import { runStateForResults } from '../core/reporting.ts';
import { DESKTOP_PROTOCOL_VERSION } from '../protocol/index.ts';
import type { DesktopServiceRunStatus, DesktopTestResult, StoryTestManifest } from '../types.ts';

/** What the coordinator is asked to run. Only ids present in the manifest are accepted. */
export interface DesktopRunRequest {
  protocolVersion: number;
  mode: 'selected' | 'all';
  storyIds?: readonly string[];
}

/** Executes an allowlisted set of stories. */
export type DesktopRunExecutor = (
  storyIds: readonly string[],
  progress: (result: DesktopTestResult) => void,
  signal: AbortSignal,
) => Promise<readonly DesktopTestResult[]>;

export interface RunCoordinatorOptions {
  manifest: StoryTestManifest;
  execute: DesktopRunExecutor;
  shutdownTimeoutMs?: number;
}

type StatusListener = (status: DesktopServiceRunStatus) => void;

interface RunRecord {
  status: DesktopServiceRunStatus;
  controller: AbortController;
  completion: Promise<void>;
}

/** Owns manifest validation, single-run concurrency, progress, cancellation, and shutdown. */
export class RunCoordinator {
  private readonly manifest: StoryTestManifest;
  private readonly execute: DesktopRunExecutor;
  private readonly shutdownTimeoutMs: number;
  private readonly listeners = new Set<StatusListener>();
  private readonly runs = new Map<string, RunRecord>();
  private activeRunId?: string;
  private stopped = false;

  constructor(options: RunCoordinatorOptions) {
    this.manifest = options.manifest;
    this.execute = options.execute;
    this.shutdownTimeoutMs = options.shutdownTimeoutMs ?? 10_000;
  }

  onStatus(listener: StatusListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  start(request: DesktopRunRequest): DesktopServiceRunStatus {
    if (this.stopped) {
      throw new DesktopDriverError('The desktop run coordinator is stopping', { kind: 'lifecycle' });
    }
    if (this.activeRunId !== undefined) {
      throw new DesktopDriverError('A desktop test run is already in progress', { kind: 'lifecycle' });
    }
    if (request.protocolVersion !== DESKTOP_PROTOCOL_VERSION) {
      throw new DesktopValidationError('Invalid desktop run request', [`protocolVersion must be ${DESKTOP_PROTOCOL_VERSION}`]);
    }

    const known = new Set(this.manifest.entries.map((entry) => entry.storyId));
    const storyIds = request.mode === 'all' ? [...known] : [...(request.storyIds ?? [])];
    const unknown = storyIds.filter((storyId) => !known.has(storyId));
    if (storyIds.length === 0 || unknown.length > 0) {
      throw new DesktopValidationError('Invalid desktop run request', [
        `unknown or missing story ids: ${unknown.join(', ') || '(none supplied)'}`,
      ]);
    }

    const runId = crypto.randomUUID();
    const status: DesktopServiceRunStatus = {
      runId,
      protocolVersion: DESKTOP_PROTOCOL_VERSION,
      state: 'running',
      requestedStoryIds: storyIds,
      startedAt: new Date().toISOString(),
      results: [],
    };
    const record: RunRecord = {
      status,
      controller: new AbortController(),
      completion: Promise.resolve(),
    };
    this.activeRunId = runId;
    this.runs.set(runId, record);
    record.completion = Promise.resolve().then(() => this.run(record, storyIds));
    return status;
  }

  get(runId: string): DesktopServiceRunStatus | undefined {
    return this.runs.get(runId)?.status;
  }

  cancel(runId: string): boolean {
    const run = this.runs.get(runId);
    if (!run) {
      return false;
    }
    run.controller.abort();
    return true;
  }

  async stop(): Promise<void> {
    this.stopped = true;
    const completions: Promise<void>[] = [];
    for (const run of this.runs.values()) {
      run.controller.abort();
      completions.push(run.completion);
    }
    if (completions.length > 0) {
      await withTimeout(Promise.allSettled(completions), this.shutdownTimeoutMs);
    }
    this.listeners.clear();
  }

  private publish(record: RunRecord, status: DesktopServiceRunStatus): void {
    record.status = status;
    for (const listener of this.listeners) {
      try {
        listener(status);
      } catch {
        // Observers are transports; one broken client must not change the run result.
      }
    }
  }

  private async run(record: RunRecord, storyIds: readonly string[]): Promise<void> {
    const results: DesktopTestResult[] = [];
    try {
      const finalResults = await this.execute(
        storyIds,
        (result) => {
          results.push(result);
          this.publish(record, { ...record.status, results: [...results] });
        },
        record.controller.signal,
      );
      if (record.controller.signal.aborted) {
        throw new DesktopCancelledError();
      }
      const merged = finalResults.length > 0 ? finalResults : results;
      this.publish(record, {
        ...record.status,
        state: runStateForResults(merged),
        finishedAt: new Date().toISOString(),
        results: merged,
      });
    } catch (error) {
      const cancelled = error instanceof DesktopCancelledError || record.controller.signal.aborted;
      this.publish(record, {
        ...record.status,
        state: cancelled ? 'cancelled' : 'error',
        finishedAt: new Date().toISOString(),
        results,
        message: error instanceof Error ? error.message : String(error),
      });
    } finally {
      if (this.activeRunId === record.status.runId) {
        this.activeRunId = undefined;
      }
    }
  }
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(
        new DesktopDriverError(`Desktop run shutdown exceeded ${timeoutMs}ms`, {
          kind: 'lifecycle',
        }),
      );
    }, timeoutMs);
    timer.unref();
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}
