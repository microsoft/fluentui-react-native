import { randomUUID } from 'node:crypto';
import { DesktopRunReporter, desktopArtifactPath } from './collector.js';
import type { DesktopReportWriter, DesktopRunReporterOptions } from './collector.js';
import { DesktopReportedError, redactDesktopSecrets, sanitizeDesktopReport, serializeReportError } from './protocol.js';
import type { EventEmitter, FailureKind, ReportFailure } from './protocol.js';
import { assertReportedWork, connectReportProducer, DESKTOP_REPORT_CONTEXT, startReportTransport } from './transport.js';
import { desktopRunExitCode } from './results.js';
import type { DesktopRunResult } from './results.js';

export type DesktopReportSession = {
  reporter: DesktopReportWriter;
  delegated: boolean;
  environment: Record<string, string>;
  readonly result?: DesktopRunResult;
  onStop?(callback: () => void | Promise<void>): void;
  close(error?: unknown): Promise<number>;
};

/** Delegated CLIs inherit the collector rather than opening a competing console or result directory. */
export async function createDesktopReportSession(
  options: DesktopRunReporterOptions & { onFatal?: (error: Error) => void },
): Promise<DesktopReportSession> {
  const encoded = process.env[DESKTOP_REPORT_CONTEXT];
  if (!encoded) {
    const reporter = new DesktopRunReporter(options);
    const transport = await startReportTransport(reporter, options.onFatal);
    return {
      reporter,
      delegated: false,
      environment: transport.environment,
      get result() {
        return reporter.resultSnapshot;
      },
      async close(error) {
        if (error !== undefined) reporter.fail(error);
        try {
          await transport.close();
        } catch (failure) {
          reporter.fail(failure, 'cleanup');
        }
        return desktopRunExitCode(await reporter.finish());
      },
    };
  }
  let stop: (() => void | Promise<void>) | undefined;
  let stopping = false;
  const producer = await connectReportProducer(`delegated-${randomUUID()}`, encoded, async () => {
    stopping = true;
    await stop?.();
  });
  // connectReportProducer has already validated this inherited context.
  const context = JSON.parse(encoded) as { runId: string; artifactsRoot: string; nonce: string };
  const secrets = new Set([context.nonce]);
  const failures = new WeakMap<object, ReportFailure>();
  const redact = (text: string) => redactDesktopSecrets(text, secrets);
  const protect =
    (emit: EventEmitter): EventEmitter =>
    (event, scope, context, parent) =>
      emit(sanitizeDesktopReport(event, redact), scope, sanitizeDesktopReport(context ?? {}, redact), parent);
  const reporter: DesktopReportWriter = {
    runId: context.runId,
    root: context.artifactsRoot,
    emit: protect(producer.emit),
    source: (id) => protect(producer.source(id)),
    addSecret(secret) {
      if (secret) secrets.add(secret);
    },
    redact,
    artifactPath(relative) {
      return desktopArtifactPath(context.artifactsRoot, relative);
    },
    flush: () => producer.flush(),
    async assertSuccessful(workIds, optional = false) {
      if (!workIds) throw new Error('Delegated result checks require their exact selected work.');
      await producer.flush();
      await assertReportedWork(workIds, optional, encoded);
    },
    failure(error, kind: FailureKind = 'infrastructure') {
      if (error instanceof DesktopReportedError) return sanitizeDesktopReport(error.failure, redact);
      if (error instanceof Error && error.cause instanceof DesktopReportedError) return sanitizeDesktopReport(error.cause.failure, redact);
      const object = error !== null && typeof error === 'object' ? error : undefined;
      const prior =
        (object && failures.get(object)) ||
        (error instanceof Error && error.cause && typeof error.cause === 'object' ? failures.get(error.cause) : undefined);
      if (prior) return prior;
      const failure = {
        failureId: randomUUID(),
        kind,
        error: JSON.parse(redact(JSON.stringify(serializeReportError(error)))) as ReportFailure['error'],
      };
      if (object) failures.set(object, failure);
      return failure;
    },
    fail(error, kind, scopeId) {
      if (error instanceof AggregateError && error.errors.length) {
        const children: unknown[] = error.errors;
        return children.map((child) => reporter.fail(child, kind, scopeId))[0];
      }
      if (error instanceof Error && error.cause instanceof AggregateError) return reporter.fail(error.cause, kind, scopeId);
      const failure = reporter.failure(error, kind);
      producer.emit(
        { kind: 'diagnostic', payload: { level: 'error', message: failure.error.message || failure.error.name, failure } },
        scopeId,
      );
      return failure;
    },
  };
  return {
    reporter,
    delegated: true,
    environment: { [DESKTOP_REPORT_CONTEXT]: encoded },
    onStop(callback) {
      stop = callback;
      if (stopping)
        void Promise.resolve()
          .then(callback)
          .catch((error: unknown) => reporter.fail(error, 'cleanup'));
    },
    async close(error) {
      if (error !== undefined) reporter.fail(error);
      await producer.finish(error === undefined ? 'passed' : 'failed');
      return error === undefined ? 0 : 1;
    },
  };
}
