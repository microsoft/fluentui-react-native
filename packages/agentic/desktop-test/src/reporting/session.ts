import { randomUUID } from 'node:crypto';
import { DesktopRunReporter, desktopArtifactPath } from './collector.js';
import type { DesktopReportWriter, DesktopRunReporterOptions } from './collector.js';
import { redactDesktopSecrets, sanitizeDesktopReport } from './protocol.js';
import type { EventEmitter, FailureKind } from './protocol.js';
import { DesktopFailureRegistry } from './failures.js';
import { assertReportedWork, connectReportProducer, DESKTOP_REPORT_CONTEXT, startReportTransport } from './transport.js';
import { desktopRunExitCode } from './results.js';
import type { DesktopRunResult } from './results.js';
import { resolveDesktopEventLevel, resolveDesktopReporterMode } from '@fluentui-react-native/desktop-driver/cli/reporter';

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
  const reporterMode =
    options.reporterMode ??
    (options.structured
      ? 'json'
      : resolveDesktopReporterMode({
          environment: process.env.DESKTOP_REPORTER,
          configured: options.reporter ?? options.console,
        }));
  const eventLevel = resolveDesktopEventLevel({
    flag: options.eventLevel,
    environment: process.env.DESKTOP_EVENTS,
    configured: options.events,
  });
  const reportingEnvironment = {
    DESKTOP_REPORTER: reporterMode,
    ...(reporterMode === 'ndjson' ? { DESKTOP_EVENTS: eventLevel } : {}),
  };
  if (!encoded) {
    const reporter = new DesktopRunReporter({ ...options, reporterMode, eventLevel });
    const transport = await startReportTransport(reporter, options.onFatal);
    return {
      reporter,
      delegated: false,
      environment: { ...transport.environment, ...reportingEnvironment },
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
  const redact = (text: string) => redactDesktopSecrets(text, secrets);
  const protect =
    (emit: EventEmitter): EventEmitter =>
    (event, scope, context, parent) =>
      emit(sanitizeDesktopReport(event, redact), scope, sanitizeDesktopReport(context ?? {}, redact), parent);
  const emit = protect(producer.emit);
  const registry = new DesktopFailureRegistry((value) => sanitizeDesktopReport(value, redact));
  const reporter: DesktopReportWriter = {
    runId: context.runId,
    root: context.artifactsRoot,
    emit,
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
      return registry.failure(error, kind);
    },
    fail(error, kind = 'infrastructure', scopeId) {
      return registry.fail(
        error,
        kind,
        (failure) =>
          emit({ kind: 'diagnostic', payload: { level: 'error', message: failure.error.message || failure.error.name, failure } }, scopeId),
        // The collector, which sees the run's status, decides whether an incomplete-run error is a failure or a warning.
        () => false,
      );
    },
  };
  return {
    reporter,
    delegated: true,
    environment: { [DESKTOP_REPORT_CONTEXT]: encoded, ...reportingEnvironment },
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
