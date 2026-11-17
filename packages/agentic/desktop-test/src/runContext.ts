import type { ResolvedDesktopTarget } from './config.js';
import type { DesktopReportWriter, DesktopRunReporterOptions } from './reporting/collector.js';
import { createDesktopReportSession } from './reporting/session.js';
import { DesktopStopRequested } from './services.js';
import { handleDesktopInterrupts } from './signals.js';
import { DesktopSupervisor } from './supervisor.js';
import type { DesktopSupervisorOptions } from './supervisor.js';

export type DesktopRunContext = {
  readonly reporter: DesktopReportWriter;
  readonly supervisor: DesktopSupervisor;
  readonly delegated: boolean;
  run<T>(signal: AbortSignal | undefined, work: (supervisor: DesktopSupervisor) => Promise<T>): Promise<T>;
  finish(failure?: unknown): Promise<number>;
};

/**
 * Owns one report, worker scope and supervisor. A borrowed run never claims or closes its host; a managed run has an
 * independent report and observes the host signal. CLI runs may instead inherit a delegated report and handle signals.
 */
export async function createDesktopRunContext(options: {
  target: ResolvedDesktopTarget;
  reporting: DesktopRunReporterOptions;
  hostSignal?: AbortSignal;
  bindReporter?(reporter: DesktopReportWriter): void;
  independent?: boolean;
  claim?: boolean;
  interrupts?: boolean;
  strictCleanup?: boolean;
  supervisor?: Omit<DesktopSupervisorOptions, 'target' | 'reporter' | 'reportSession'>;
}): Promise<DesktopRunContext> {
  let supervisor: DesktopSupervisor | undefined;
  const session = await createDesktopReportSession(
    { ...options.reporting, onFatal: (error) => supervisor?.services.fail(error) },
    { independent: options.independent ?? true },
  );
  const reporter = session.reporter;
  let releaseInterrupts: (() => void) | undefined;
  try {
    options.bindReporter?.(reporter);
    supervisor = new DesktopSupervisor({ ...options.supervisor, target: options.target, reporter, reportSession: session });
    const owner = supervisor;
    session.onStop?.(() => owner.services.requestStop());
    if (options.interrupts) {
      releaseInterrupts = handleDesktopInterrupts({
        stop: () => owner.services.requestStop(),
        terminate: (signal) => {
          reporter.emit({
            kind: 'diagnostic',
            payload: {
              level: 'warning',
              message: `Received ${signal} during shutdown; force-stopping owned commands. Interrupt again to exit without cleanup.`,
            },
          });
          owner.terminate();
        },
      });
    }
  } catch (error) {
    try {
      await supervisor?.close();
      await session.close(error);
    } catch (cleanup) {
      throw new AggregateError([error, cleanup], 'Desktop run preparation and cleanup failed.');
    } finally {
      releaseInterrupts?.();
    }
    throw error;
  }
  const owner = supervisor;
  let running = false;
  let closing: Promise<number> | undefined;
  return {
    reporter,
    supervisor: owner,
    delegated: session.delegated,
    async run(signal, work) {
      if (running || closing) throw new Error('A desktop run context executes only one workload.');
      running = true;
      const stop = () => owner.services.requestStop();
      signal?.addEventListener('abort', stop, { once: true });
      options.hostSignal?.addEventListener('abort', stop, { once: true });
      try {
        signal?.throwIfAborted();
        if (options.hostSignal?.aborted) throw hostStopped();
        await owner.open(options.claim === true && !session.delegated);
        return await owner.services.guard(
          Promise.resolve().then(() => {
            signal?.throwIfAborted();
            if (options.hostSignal?.aborted) throw hostStopped();
            return work(owner);
          }),
        );
      } catch (error) {
        if (error instanceof DesktopStopRequested) {
          if (signal?.aborted) throw signal.reason;
          if (options.hostSignal?.aborted) throw hostStopped();
        }
        throw error;
      } finally {
        signal?.removeEventListener('abort', stop);
        options.hostSignal?.removeEventListener('abort', stop);
      }
    },
    finish(failure) {
      return (closing ??= (async () => {
        const cleanup: unknown[] = [];
        let exitCode = 1;
        try {
          await owner.close();
        } catch (error) {
          reporter.fail(error, 'cleanup');
          cleanup.push(error);
        }
        try {
          exitCode = await session.close(isCancellation(failure) ? undefined : failure);
          if (session.result?.failures.some(({ kind }) => kind === 'cleanup' || kind === 'reporting')) {
            cleanup.push(new Error('Desktop run reporting or cleanup did not settle.'));
          }
        } catch (error) {
          cleanup.push(error);
        } finally {
          releaseInterrupts?.();
        }
        if (cleanup.length && options.strictCleanup !== false) throw new AggregateError(cleanup, 'Desktop run cleanup did not settle.');
        return cleanup.length ? 1 : exitCode;
      })());
    },
  };
}

function isCancellation(value: unknown): boolean {
  return value instanceof Error && value.name === 'AbortError';
}

function hostStopped(): Error {
  const error = new Error('The desktop workload host stopped.');
  error.name = 'AbortError';
  return error;
}
