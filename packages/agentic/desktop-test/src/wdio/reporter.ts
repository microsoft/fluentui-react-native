import { createHash, randomUUID } from 'node:crypto';
import WDIOReporter from '@wdio/reporter';
import type { HookStats, RunnerStats, TestStats } from '@wdio/reporter';
import { desktopJasmineRegistry, excludedSpecCounts } from '../jasmine/registry.js';
import type { DesktopSpecEntry } from '../jasmine/registry.js';
import { connectReportProducer } from '../reporting/transport.js';
import type { ReportProducer } from '../reporting/transport.js';
import { serializeReportError } from '../reporting/protocol.js';
import type { EventContext, EventData, ReportFailure } from '../reporting/protocol.js';
import { wdioGroupId } from './identity.js';

type ReporterOptions = ConstructorParameters<typeof WDIOReporter>[0] & { desktopContext?: EventContext; specFileRetries?: number };

export default class DesktopWdioReporter extends WDIOReporter {
  private readonly producer: Promise<ReportProducer>;
  private queue = Promise.resolve();
  private pending = 0;
  private context: EventContext;
  private scopeId = '';
  private groupId = '';
  private workerAttempt = 0;
  private readonly specFileRetries: number;
  private readonly endedTests = new Set<string>();

  constructor(options: ReporterOptions) {
    super({ ...options, stdout: false });
    this.context = options.desktopContext ?? {};
    this.specFileRetries = options.specFileRetries ?? 0;
    this.producer = connectReportProducer(`wdio-${randomUUID()}`);
    void this.producer.catch((error: unknown) => {
      process.stderr.write(`Desktop WDIO reporting connection failed: ${String(error)}\n`);
      process.exitCode = 1;
    });
  }

  override get isSynchronised(): boolean {
    return this.pending === 0;
  }

  private schedule(action: (producer: ReportProducer) => void | Promise<void>): void {
    this.pending++;
    this.queue = this.queue
      .then(async () => action(await this.producer))
      .catch((error: unknown) => {
        process.stderr.write(`Desktop WDIO reporting failed: ${String(error)}\n`);
        process.exitCode = 1;
      })
      .finally(() => {
        this.pending--;
      });
  }

  private report(event: EventData, context = this.context): void {
    this.schedule(async (producer) => {
      producer.emit(event, this.scopeId, context, this.groupId);
      await producer.flush();
    });
  }

  override onRunnerStart(runner: RunnerStats): void {
    this.groupId = wdioGroupId(runner.specs);
    // WDIO reports the remaining spec attempts (including the current worker), not an increasing attempt index.
    this.workerAttempt = this.specFileRetries + 1 - (runner.retry ?? 1);
    this.scopeId = `${this.groupId}-${this.workerAttempt}`;
    this.context = { ...this.context, worker: runner.cid, spec: runner.specs.join(' + '), attempt: this.workerAttempt };
    this.report({
      kind: 'scope-start',
      payload: {
        label: `${this.context.endpoint ?? 'native'} ${this.context.renderer ?? ''} ${runner.specs.join(' + ')} (attempt ${this.workerAttempt + 1})`,
        category: 'worker',
      },
    });
  }

  override onTestStart(test: TestStats): void {
    if (this.hidden(test)) return;
    this.report(
      { kind: 'test-start', payload: { testId: this.testId(test), title: test.fullTitle, attempt: this.attempt(test) } },
      { ...this.context, test: test.uid },
    );
  }

  override onTestEnd(test: TestStats): void {
    this.testResult(test);
  }
  override onTestSkip(test: TestStats): void {
    this.testResult(test);
  }
  override onTestPending(test: TestStats): void {
    this.testResult(test);
  }
  override onTestRetry(test: TestStats): void {
    this.testResult(test);
  }

  /** The spec the Jasmine adapter registered for a test, when `desktopIt` declared it. */
  private entry(test: TestStats): DesktopSpecEntry | undefined {
    return desktopJasmineRegistry().entries.get(test.uid);
  }

  /** An excluded case is not a test, and a blocked run reports its fault rather than every spec it disabled. */
  private hidden(test: TestStats): boolean {
    return desktopJasmineRegistry().blocked || this.entry(test)?.kind === 'excluded';
  }

  private testResult(test: TestStats): void {
    if (this.hidden(test)) return;
    const testId = this.testId(test);
    const attempt = this.attempt(test);
    const key = `${testId}/${attempt}`;
    if (this.endedTests.has(key)) return;
    this.endedTests.add(key);
    const entry = this.entry(test);
    // A spec the adapter replaced or filtered out finishes as skipped or pending and never ran, whichever the framework calls it.
    const notExecuted = test.state === 'pending' || test.state === 'skipped';
    const gap = notExecuted && entry?.kind === 'gap' ? entry.gap : undefined;
    const missing = notExecuted && entry?.kind === 'run' ? entry.missing : undefined;
    const status = gap || missing?.length ? 'unsupported' : test.state === 'pending' ? 'skipped' : test.state;
    this.report(
      {
        kind: 'test-result',
        payload: {
          testId,
          title: test.fullTitle,
          attempt,
          status,
          durationMs: test.duration,
          ...(gap ? { gap: gap.kind, reason: gap.reason } : {}),
          ...(missing?.length ? { reason: `Missing desktop requirements: ${missing.join(', ')}.` } : {}),
          ...(status === 'skipped' ? { reason: test.pendingReason || 'Skipped by the test framework.' } : {}),
          ...(status === 'failed'
            ? { failure: this.failure(`${key}/failure`, test.error ?? new AggregateError(test.errors ?? [], 'WDIO test failed.'), 'test') }
            : {}),
        },
      },
      { ...this.context, test: test.uid, attempt },
    );
  }

  override onHookEnd(hook: HookStats): void {
    if (hook.error || hook.errors?.length || hook.state === 'failed') {
      this.report({
        kind: 'diagnostic',
        payload: {
          level: 'error',
          message: `Hook failed: ${hook.title}`,
          failure: this.failure(
            `${this.scopeId}/hook/${hook.uid}`,
            hook.error ?? new AggregateError(hook.errors ?? [], hook.title),
            'infrastructure',
          ),
        },
      });
    }
  }

  override onRunnerEnd(runner: RunnerStats): void {
    if (runner.error)
      this.report({
        kind: 'diagnostic',
        payload: {
          level: 'error',
          message: runner.error,
          failure: this.failure(`${this.scopeId}/runner`, new Error(runner.error), 'infrastructure'),
        },
      });
    const excluded = excludedSpecCounts(desktopJasmineRegistry());
    // Keyed by the spec group, so a retried attempt that announces the same exclusions again is counted once.
    if (excluded.platform + excluded.scope + excluded.input > 0) {
      this.report({ kind: 'selection', payload: { excluded, key: this.groupId } });
    }
    this.report({ kind: 'scope-end', payload: { status: runner.failures || runner.error ? 'failed' : 'passed' } });
    this.schedule((producer) => producer.finish(runner.failures || runner.error ? 'failed' : 'passed'));
  }

  private testId(test: TestStats): string {
    return createHash('sha256')
      .update(JSON.stringify([this.groupId, test.uid, test.fullTitle]))
      .digest('hex');
  }
  private attempt(test: TestStats): number {
    return this.workerAttempt * 1_000_000 + (test.retries ?? 0);
  }
  private failure(id: string, error: unknown, kind: ReportFailure['kind']): ReportFailure {
    return { failureId: createHash('sha256').update(id).digest('hex'), kind, error: serializeReportError(error) };
  }
}
