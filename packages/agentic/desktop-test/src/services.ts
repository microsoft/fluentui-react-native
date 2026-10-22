import type { DesktopCommandRunner, PreparedDesktopCommand, RunningDesktopCommand } from './commands.js';
import { deadline } from './commands.js';
import type { DesktopReportWriter } from './reporting/collector.js';

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
  private readonly failed: Promise<never>;
  private rejectFailure!: (error: Error) => void;
  private closing = false;
  private closePromise?: Promise<void>;
  private readonly runner: DesktopCommandRunner;
  private readonly reporter?: DesktopReportWriter;

  constructor(runner: DesktopCommandRunner, reporter?: DesktopReportWriter) {
    this.runner = runner;
    this.reporter = reporter;
    this.failed = new Promise<never>((_resolve, reject) => {
      this.rejectFailure = reject;
    });
    // A failure may arrive between guarded phases; retain it without an unhandled rejection.
    void this.failed.catch(() => undefined);
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
    const running = this.runner.start({ ...command, category: 'service', context: { ...command.context, service: id } });
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

  async guard<T>(work: Promise<T>): Promise<T> {
    if (this.controller.signal.aborted) void work.catch(() => undefined);
    this.controller.signal.throwIfAborted();
    return Promise.race([work, this.failed]);
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
              this.reporter?.emit({ kind: 'service-ready', payload: { message: id } }, id, { service: id });
              return;
            }
            lastError = new Error(`Readiness returned HTTP ${response.status}.`);
          } catch (error) {
            lastError = error;
          }
          await new Promise<void>((resolve) => setTimeout(resolve, 100));
        }
        throw new Error(`Service "${id}" did not become ready within ${timeoutMs}ms.`, { cause: lastError ?? signal.reason });
      })(),
    );
  }

  close(): Promise<void> {
    return (this.closePromise ??= (async () => {
      this.closing = true;
      const failed = this.controller.signal.aborted && !(this.controller.signal.reason instanceof DesktopStopRequested);
      this.controller.abort(new Error('Desktop service scope is closing.'));
      const failures: unknown[] = [];
      for (const { id, command } of [...this.running].reverse()) {
        try {
          await deadline(command.stop({ failed }), 45_000, `Stopping ${id}`);
        } catch (error) {
          failures.push(error);
          this.reporter?.fail(error, 'cleanup', id);
        }
      }
      if (failures.length) throw new AggregateError(failures, 'Owned desktop services did not shut down cleanly.');
    })());
  }
}
