import fs from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { Writable } from 'node:stream';
import { createReporter } from '@rnx-kit/reporter';

import { createEventEmitter, DesktopReportedError, sanitizeDesktopReport, serializeReportError, validateDesktopEvent } from './protocol.js';
import type {
  CollectedDesktopEvent,
  DesktopEvent,
  EventContext,
  EventEmitter,
  FailureKind,
  ReportError,
  ReportFailure,
} from './protocol.js';
import { renderJUnit, renderRunSummary, summarizeDesktopRun } from './results.js';
import type { DesktopRunResult, DesktopTestResult, DesktopWorkResult } from './results.js';
import type { DesktopReportingConfig } from '../config.js';

export type ReportOutput = Pick<NodeJS.WriteStream, 'write'>;
export type DesktopRunReporterOptions = DesktopReportingConfig & {
  artifactsRoot: string;
  context?: EventContext;
  kind?: 'tests' | 'lifecycle';
  optional?: boolean;
  output?: ReportOutput;
  errorOutput?: ReportOutput;
  structured?: boolean;
  verbose?: boolean;
  secrets?: readonly string[];
  flushTimeoutMs?: number;
  maxJournalBytes?: number;
};
export type DesktopReportWriter = Pick<
  DesktopRunReporter,
  'runId' | 'root' | 'emit' | 'source' | 'addSecret' | 'redact' | 'failure' | 'fail' | 'artifactPath' | 'flush'
> & {
  assertSuccessful(workIds?: readonly string[], optional?: boolean): void | Promise<void>;
};

export class DesktopRunReporter {
  readonly runId: string = randomUUID();
  readonly root: string;
  readonly emit: EventEmitter;
  private readonly startedAt = new Date();
  private readonly sources = new Map<string, { sequence: number; finished: boolean }>();
  private readonly scopes = new Map<
    string,
    { label: string; category: string; finished: boolean; context?: EventContext; workId?: string }
  >();
  private readonly work = new Map<string, DesktopWorkResult>();
  private readonly tests = new Map<string, DesktopTestResult>();
  private readonly testWork = new Map<string, string>();
  private readonly failures = new Map<string, ReportFailure>();
  private readonly failureIds = new WeakMap<object, string>();
  private readonly annotations = new Set<string>();
  private readonly presentedFailures = new Set<string>();
  private readonly secrets = new Set<string>();
  private readonly artifacts = new Map<string, string>();
  private readonly options: DesktopRunReporterOptions;
  private readonly actions: boolean;
  private readonly output: ReportOutput;
  private readonly errors: ReportOutput;
  private readonly logger: ReturnType<typeof createReporter>;
  private queue = Promise.resolve();
  private arrivalSequence = 0;
  private journalBytes = 0;
  private pendingBytes = 0;
  private finishing?: Promise<DesktopRunResult>;
  private finished = false;
  private journalFailed = false;
  private presentationFailed = false;
  private terminal?: DesktopRunResult;

  constructor(options: DesktopRunReporterOptions) {
    this.options = options;
    const root = path.join(path.resolve(options.artifactsRoot), this.runId);
    fs.mkdirSync(root, { recursive: true, mode: 0o700 });
    // Producers report paths relative to canonical artifact roots (macOS temp directories are /var -> /private/var).
    this.root = fs.realpathSync.native(root);
    this.actions =
      !options.structured &&
      (options.console === 'github-actions' || ((!options.console || options.console === 'auto') && process.env.GITHUB_ACTIONS === 'true'));
    this.output = options.structured ? (options.errorOutput ?? process.stderr) : (options.output ?? process.stdout);
    this.errors = options.errorOutput ?? process.stderr;
    for (const secret of options.secrets ?? []) this.addSecret(secret);
    this.emit = createEventEmitter(this.runId, 'supervisor', (event) => this.accept(event));
    this.logger = createReporter({
      name: 'desktop-test',
      prefix: {},
      output: {
        log: (message) => this.enqueue(() => this.writeRaw(this.output, message + '\n'), Buffer.byteLength(message)),
        warn: (message) => this.enqueue(() => this.writeRaw(this.errors, message + '\n'), Buffer.byteLength(message)),
        error: (message) => this.enqueue(() => this.writeRaw(this.errors, message + '\n'), Buffer.byteLength(message)),
      },
    });
    fs.writeFileSync(path.join(this.root, 'events.jsonl'), '', { flag: 'wx', mode: 0o600 });
    this.artifacts.set('events.jsonl', 'Versioned event journal');
    this.artifacts.set('run.json', 'Canonical run result');
    if (options.junit !== false) this.artifacts.set('junit.xml', 'JUnit result');
  }

  source(sourceId: string): EventEmitter {
    if (sourceId === 'supervisor' || this.sources.has(sourceId)) throw new Error(`Report source "${sourceId}" is already registered.`);
    this.sources.set(sourceId, { sequence: 0, finished: false });
    return createEventEmitter(this.runId, sourceId, (event) => this.accept(event));
  }

  addSecret(secret: string): void {
    if (secret.length > 0) this.secrets.add(secret);
  }

  redact(text: string): string {
    let result = text;
    for (const secret of [...this.secrets].sort((a, b) => b.length - a.length)) result = result.replaceAll(secret, '[REDACTED]');
    return result.replace(
      /((?:leaseNonce|bridgeNonce|authorization|password|access[_-]?token)\s*["']?\s*[:=]\s*["']?)[^\s"',;]+/gi,
      '$1[REDACTED]',
    );
  }

  failure(error: unknown, kind: FailureKind = 'infrastructure'): ReportFailure {
    if (error instanceof DesktopReportedError) return this.sanitize(error.failure);
    let failureId = typeof error === 'object' && error !== null ? this.failureIds.get(error) : undefined;
    if (!failureId && error instanceof Error && error.cause instanceof DesktopReportedError) return this.sanitize(error.cause.failure);
    if (!failureId && error instanceof Error && error.cause && typeof error.cause === 'object')
      failureId = this.failureIds.get(error.cause);
    if (!failureId) {
      failureId = randomUUID();
      if (typeof error === 'object' && error !== null) this.failureIds.set(error, failureId);
    }
    const recorded = this.failures.get(failureId);
    if (recorded) return recorded;
    return this.sanitize({ failureId, kind, error: serializeReportError(error) });
  }

  fail(error: unknown, kind: FailureKind = 'infrastructure', scopeId = 'run'): ReportFailure {
    if (error instanceof AggregateError && error.errors.length) {
      const children: unknown[] = error.errors;
      return children.map((child) => this.fail(child, kind, scopeId))[0];
    }
    if (error instanceof Error && error.cause instanceof AggregateError) return this.fail(error.cause, kind, scopeId);
    const failure = this.failure(error, kind);
    if (this.failures.has(failure.failureId)) return failure;
    this.failures.set(failure.failureId, failure);
    try {
      this.emit(
        { kind: 'diagnostic', payload: { level: 'error', message: failure.error.message || failure.error.name, failure } },
        scopeId,
      );
    } catch (reportingError) {
      const reportingFailure = this.failure(reportingError, 'reporting');
      this.failures.set(reportingFailure.failureId, reportingFailure);
      this.logger.error(
        `Desktop reporting failed: ${reportingFailure.error.message}. Original failure: ${failure.error.message}. Reports: ${this.root}`,
      );
    }
    return failure;
  }

  assertSuccessful(workIds?: readonly string[], optional = false): void {
    let result = this.result();
    if (workIds) {
      if (!workIds.length || workIds.some((id) => !this.work.has(id))) throw new Error('Cannot verify unknown or empty selected work.');
      const selected = new Set(workIds);
      result = summarizeDesktopRun({
        ...result,
        kind: 'tests',
        optional,
        tests: result.tests.filter(({ testId }) => selected.has(this.testWork.get(testId) ?? '')),
        work: result.work.filter(({ workId }) => selected.has(workId)),
      });
    }
    if (result.status === 'passed' || result.status === 'skipped') return;
    const failure =
      result.failures.find(({ kind }) => kind !== 'test') ??
      result.tests.find(({ status }) => status === 'failed')?.attempts.at(-1)?.failure;
    if (failure) throw new DesktopReportedError(failure);
    throw new Error(`Desktop run is ${result.status}; selected work did not produce complete executable results.`);
  }

  artifactPath(relative: string): string {
    return desktopArtifactPath(this.root, relative);
  }

  async flush(): Promise<void> {
    await this.queue;
  }

  accept(value: unknown): void {
    if (this.finished) throw new Error('Cannot report after run finalization.');
    validateDesktopEvent(value);
    if (value.runId !== this.runId) throw new Error('Report producer belongs to another run.');
    const source = this.sources.get(value.sourceId) ?? { sequence: 0, finished: false };
    if (value.sourceSequence <= source.sequence) return;
    if (source.finished) throw new Error(`Producer ${value.sourceId} emitted after its terminal event.`);
    if (value.sourceSequence !== source.sequence + 1)
      throw new Error(
        `Missing reporting events from ${value.sourceId}: expected ${source.sequence + 1}, received ${value.sourceSequence}.`,
      );
    source.sequence = value.sourceSequence;
    source.finished = value.kind === 'producer-finished';
    this.sources.set(value.sourceId, source);
    const event: CollectedDesktopEvent = { ...this.sanitize(value), arrivalSequence: ++this.arrivalSequence };
    if (event.kind === 'artifact') this.artifactPath(event.payload.path);
    if (event.kind === 'scope-end' && event.payload.logPath) this.artifactPath(event.payload.logPath);
    const line = JSON.stringify(event) + '\n';
    if (!this.journalFailed) {
      try {
        this.journalBytes += Buffer.byteLength(line);
        if (this.journalBytes > (this.options.maxJournalBytes ?? 64 * 1024 * 1024))
          throw new Error('Desktop event journal exceeded its size limit; run is incomplete.');
        fs.appendFileSync(path.join(this.root, 'events.jsonl'), line, { mode: 0o600 });
      } catch (error) {
        this.journalFailed = true;
        const failure = this.failure(error, 'reporting');
        this.failures.set(failure.failureId, failure);
        throw error;
      }
    }
    this.reduce(event);
    this.present(event);
  }

  private reduce(event: CollectedDesktopEvent): void {
    if ('failure' in event.payload && event.payload.failure) this.failures.set(event.payload.failure.failureId, event.payload.failure);
    if (event.kind === 'work-selected') {
      if (this.work.has(event.payload.workId)) throw new Error(`Work ${event.payload.workId} was selected twice.`);
      this.work.set(event.payload.workId, { ...event.payload, status: 'not-run', context: event.context });
    } else if (event.kind === 'scope-start') {
      if (this.scopes.has(event.scopeId)) throw new Error(`Scope ${event.scopeId} was started twice.`);
      const work = event.parentScopeId ? this.work.get(event.parentScopeId) : undefined;
      if (work) work.status = 'incomplete';
      this.scopes.set(event.scopeId, { ...event.payload, finished: false, context: event.context, workId: work?.workId });
    } else if (event.kind === 'scope-end') {
      const scope = this.scopes.get(event.scopeId);
      if (!scope || scope.finished) throw new Error(`Scope ${event.scopeId} has no outstanding start.`);
      scope.finished = true;
      if (scope.workId) this.work.get(scope.workId)!.status = event.payload.status;
    } else if (event.kind === 'test-start' || event.kind === 'test-result') {
      const p = event.payload;
      const workId = this.scopes.get(event.scopeId)?.workId ?? event.parentScopeId;
      if (workId && this.work.has(workId)) this.testWork.set(p.testId, workId);
      const test = this.tests.get(p.testId) ?? { testId: p.testId, title: p.title, status: 'incomplete', flaky: false, attempts: [] };
      const index = test.attempts.findIndex(({ attempt }) => attempt === p.attempt);
      const result =
        event.kind === 'test-result'
          ? { ...event.payload, context: event.context }
          : {
              attempt: p.attempt,
              status: 'incomplete' as const,
              durationMs: 0,
              reason: 'Worker did not report a terminal result.',
              context: event.context,
            };
      if (index < 0) test.attempts.push(result);
      else {
        if (test.attempts[index].status !== 'incomplete')
          throw new Error(`Duplicate terminal result for ${p.testId}, attempt ${p.attempt}.`);
        test.attempts[index] = result;
      }
      test.attempts.sort((a, b) => a.attempt - b.attempt);
      test.status = test.attempts[test.attempts.length - 1].status;
      test.flaky = test.status === 'passed' && test.attempts.some(({ status }) => status === 'failed');
      this.tests.set(p.testId, test);
    } else if (event.kind === 'artifact') this.artifacts.set(event.payload.path, event.payload.description);
  }

  private present(event: DesktopEvent): void {
    const prefix = `[${event.sourceId}${event.context?.endpoint ? ` ${event.context.endpoint}` : ''}]`;
    const failure = 'failure' in event.payload ? event.payload.failure : undefined;
    const firstFailure = !failure || !this.presentedFailures.has(failure.failureId);
    if (failure) this.presentedFailures.add(failure.failureId);
    switch (event.kind) {
      case 'scope-start':
        this.logger.log(`${prefix} START ${event.payload.label}`);
        break;
      case 'scope-end': {
        const scope = this.scopes.get(event.scopeId)!;
        if (event.payload.logPath && (event.payload.status === 'failed' || this.options.verbose || scope.category === 'worker')) {
          this.enqueue(() => this.replay(scope.label, event.payload.logPath!, event.payload.status === 'failed'), 0);
        }
        this.logger.log(`${prefix} ${event.payload.status.toUpperCase()} ${scope.label}`);
        break;
      }
      case 'service-ready':
        this.logger.log(`${prefix} READY ${event.payload.message}`);
        break;
      case 'output':
        if (event.payload.stream === 'stderr' || this.options.verbose)
          this.logger.warn(`${prefix} ${event.payload.stream}: ${event.payload.text.replace(/\n$/, '')}`);
        break;
      case 'diagnostic':
        if (!firstFailure) break;
        if (event.payload.level === 'info') this.logger.log(`${prefix} ${event.payload.message}`);
        else this.logger.warn(`${prefix} ${event.payload.level}: ${event.payload.message}`);
        break;
      case 'service-failed':
        if (firstFailure) this.logger.error(`${prefix} FAILED ${event.payload.failure.error.message}`);
        break;
      case 'test-start': {
        // Producers may encode attempts sparsely (WDIO combines spec-file and test retries), so label the observed ordinal.
        const ordinal = this.tests.get(event.payload.testId)!.attempts.findIndex(({ attempt }) => attempt === event.payload.attempt) + 1;
        this.logger.log(`${prefix} TEST ${event.payload.title} (attempt ${ordinal})`);
        break;
      }
      case 'test-result':
        this.logger.log(
          `${prefix} ${event.payload.status.toUpperCase()} ${event.payload.title}${event.payload.reason ? `: ${event.payload.reason}` : ''}`,
        );
        if (failure && firstFailure) this.logger.error(`${prefix} ${errorDiagnostic(failure.error)}`);
        break;
      case 'artifact':
        this.logger.log(`${prefix} artifact: ${path.join(this.root, event.payload.path)}`);
        break;
    }
    if ('failure' in event.payload && event.payload.failure) {
      const failure = event.payload.failure;
      if (this.actions && !this.annotations.has(failure.failureId)) {
        this.annotations.add(failure.failureId);
        this.enqueue(
          () =>
            this.write(
              this.errors,
              `::error title=${escapeProperty(`${event.sourceId}: ${failure.kind}`)}::${escapeData(errorDiagnostic(failure.error))}\n`,
            ),
          0,
        );
      }
    }
  }

  private sanitize<T>(value: T): T {
    return sanitizeDesktopReport(value, (text) => this.redact(text));
  }

  private enqueue(action: () => Promise<void>, bytes: number): void {
    if (this.presentationFailed) return;
    this.pendingBytes += bytes;
    if (this.pendingBytes > 4 * 1024 * 1024) {
      this.presentationFailed = true;
      const failure = this.failure(new Error('Presentation queue exceeded 4 MiB; retained journal is authoritative.'), 'reporting');
      this.failures.set(failure.failureId, failure);
      return;
    }
    this.queue = this.queue
      .then(() => (this.presentationFailed ? undefined : action()))
      .catch((error: unknown) => {
        this.presentationFailed = true;
        const failure = this.failure(error, 'reporting');
        this.failures.set(failure.failureId, failure);
      })
      .finally(() => {
        this.pendingBytes -= bytes;
      });
  }

  private async write(output: ReportOutput, text: string): Promise<void> {
    if (!(output instanceof Writable)) {
      output.write(text);
      return;
    }
    await new Promise<void>((resolve, reject) => {
      const timer = setTimeout(() => settle(new Error('Timed out flushing desktop report output.')), this.options.flushTimeoutMs ?? 5000);
      const onError = (error: Error) => settle(error);
      const settle = (error?: Error | null) => {
        clearTimeout(timer);
        output.off('error', onError);
        if (error) reject(error);
        else resolve();
      };
      output.once('error', onError);
      output.write(text, settle);
    });
  }

  private async writeRaw(output: ReportOutput, text: string): Promise<void> {
    if (!this.actions) {
      await this.write(output, text);
      return;
    }
    const token = randomUUID();
    await this.write(output, `::stop-commands::${token}\n`);
    try {
      await this.write(output, text.endsWith('\n') ? text : text + '\n');
    } finally {
      await this.write(output, `::${token}::\n`);
    }
  }

  private async replay(label: string, relative: string, failed: boolean): Promise<void> {
    const output = failed ? this.errors : this.output;
    await this.write(output, this.actions ? `::group::${escapeData(label)}\n` : `[desktop] BEGIN ${label}\n`);
    const token = randomUUID();
    try {
      if (this.actions) await this.write(output, `::stop-commands::${token}\n`);
      try {
        for await (const chunk of fs.createReadStream(this.artifactPath(relative), { encoding: 'utf8' }))
          await this.write(output, this.redact(chunk));
        await this.write(output, '\n');
      } finally {
        if (this.actions) await this.write(output, `::${token}::\n`);
      }
    } finally {
      await this.write(output, this.actions ? '::endgroup::\n' : `[desktop] END ${label}\n`);
    }
  }

  finish(): Promise<DesktopRunResult> {
    this.finishing ??= this.finalize();
    return this.finishing;
  }

  private result(): DesktopRunResult {
    return summarizeDesktopRun({
      schemaVersion: 1,
      runId: this.runId,
      kind: this.options.kind ?? 'tests',
      startedAt: this.startedAt.toISOString(),
      finishedAt: new Date().toISOString(),
      durationMs: Date.now() - this.startedAt.getTime(),
      context: this.options.context,
      optional: this.options.optional,
      incomplete:
        [...this.scopes.values()].some(({ finished }) => !finished) ||
        [...this.sources.entries()].some(([id, source]) => id !== 'supervisor' && !source.finished),
      tests: [...this.tests.values()],
      work: [...this.work.values()],
      failures: [...this.failures.values()],
      artifacts: [...this.artifacts].map(([path, description]) => ({ path, description })),
    });
  }

  private persist(result: DesktopRunResult): void {
    const write = (name: string, data: string) => {
      const temporary = this.artifactPath(`${name}.tmp`);
      fs.writeFileSync(temporary, data, { mode: 0o600 });
      fs.renameSync(temporary, this.artifactPath(name));
    };
    if (this.options.junit !== false) write('junit.xml', renderJUnit(result));
    write('run.json', JSON.stringify(result, null, 2) + '\n');
  }

  private async finalize(): Promise<DesktopRunResult> {
    await this.queue;
    const persist = () => {
      let result = this.result();
      try {
        this.persist(result);
      } catch (error) {
        const failure = this.failure(error, 'reporting');
        this.failures.set(failure.failureId, failure);
        result = this.result();
        try {
          this.persist(result);
        } catch (retryError) {
          throw new AggregateError(
            [error, retryError, ...result.failures.map((failure) => new DesktopReportedError(failure))],
            `Cannot persist required desktop reports under ${this.root}.`,
          );
        }
      }
      return result;
    };
    let result = persist();
    const c = result.counts;
    this.logger.log(
      `[desktop] ${result.status.toUpperCase()}: ${c.selected} selected, ${c.executed} executed, ${c.passed} passed, ${c.failed} failed, ${c.skipped} skipped, ${c.unsupported} unsupported, ${c.incomplete} incomplete, ${c.retries} retries, ${c.flaky} flaky; ${result.work.filter(({ status }) => status === 'not-run').length} groups not run; ${path.join(this.root, 'run.json')}`,
    );
    await this.queue;
    result = persist();
    if (this.presentationFailed) {
      try {
        await this.writeRaw(
          this.errors,
          `[desktop] FAILED: presentation could not be flushed; authoritative result: ${path.join(this.root, 'run.json')}\n`,
        );
      } catch (error) {
        const failure = this.failure(error, 'reporting');
        this.failures.set(failure.failureId, failure);
        result = persist();
      }
    }
    if (this.options.summary !== false && process.env.GITHUB_STEP_SUMMARY && !this.options.structured) {
      try {
        const summary = renderRunSummary(result).slice(0, 64 * 1024);
        const size = fs.existsSync(process.env.GITHUB_STEP_SUMMARY) ? fs.statSync(process.env.GITHUB_STEP_SUMMARY).size : 0;
        if (size + Buffer.byteLength(summary) > 1024 * 1024) throw new Error('GitHub step summary would exceed 1 MiB.');
        fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, summary);
      } catch (error) {
        this.emit({
          kind: 'diagnostic',
          payload: {
            level: 'warning',
            message: `Optional Actions summary failed: ${String(error)}; result retained at ${path.join(this.root, 'run.json')}.`,
          },
        });
      }
    }
    await this.queue;
    result = persist();
    try {
      this.emit({ kind: 'run-finished', payload: { status: result.status, resultPath: 'run.json' } });
    } catch (error) {
      const failure = this.failure(error, 'reporting');
      this.failures.set(failure.failureId, failure);
      result = persist();
    }
    this.finished = true;
    this.terminal = result;
    return result;
  }

  get resultSnapshot(): DesktopRunResult | undefined {
    return this.terminal;
  }
}

function errorDiagnostic(error: ReportError): string {
  const message = `${error.name}: ${error.message}`;
  return error.stack ? (error.stack.includes(error.message) ? error.stack : `${message}\n${error.stack}`) : message;
}
function escapeData(text: string): string {
  return text.replaceAll('%', '%25').replaceAll('\r', '%0D').replaceAll('\n', '%0A');
}
function escapeProperty(text: string): string {
  return escapeData(text).replaceAll(':', '%3A').replaceAll(',', '%2C');
}

export function desktopArtifactPath(directory: string, relative: string): string {
  const resolved = path.resolve(directory, relative);
  if (
    resolved === directory ||
    path.relative(directory, resolved).startsWith('..') ||
    path.isAbsolute(path.relative(directory, resolved))
  ) {
    throw new Error(`Artifact must be confined beneath the run root: ${relative}`);
  }
  let existing = path.dirname(resolved);
  while (!fs.existsSync(existing)) existing = path.dirname(existing);
  const actual = fs.realpathSync(existing);
  const root = fs.realpathSync(directory);
  if (actual !== root && (path.relative(root, actual).startsWith('..') || path.isAbsolute(path.relative(root, actual)))) {
    throw new Error('Artifact directory escapes the run root through a symlink.');
  }
  if (fs.existsSync(resolved) && fs.lstatSync(resolved).isSymbolicLink()) throw new Error('Artifact destination is a symlink.');
  return resolved;
}
