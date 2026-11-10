import { spawn as spawnNative } from 'node:child_process';
import spawn from 'cross-spawn';
import fs from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { StringDecoder } from 'node:string_decoder';

import type { DesktopCommand } from './config.js';
import { DesktopRunReporter } from './reporting/collector.js';
import type { DesktopReportWriter, ReportOutput } from './reporting/collector.js';
import type { EventContext } from './reporting/protocol.js';
import { DESKTOP_REPORT_CONTEXT, DESKTOP_REPORT_SCOPE, requestReportStop } from './reporting/transport.js';
import { createDesktopProcessControl } from './processControl.js';
import type { DesktopServiceReady, DesktopServiceReadyRecord } from './processControl.js';

export type PreparedDesktopCommand = DesktopCommand & {
  args: readonly string[];
  cwd: string;
  env: Readonly<Record<string, string>>;
  label?: string;
  category?: 'service' | 'worker' | 'phase';
  context?: EventContext;
};
export type RunningDesktopCommand = {
  completed: Promise<number>;
  logPath?: string;
  readonly failure?: unknown;
  waitForReadiness?(expected: DesktopServiceReady, timeoutMs?: number, signal?: AbortSignal): Promise<DesktopServiceReadyRecord>;
  stop(options?: { failed?: boolean }): Promise<void>;
};
/** Cancellation for one command: an abort stops its process tree and reports the command failed. */
export type DesktopCommandRunOptions = { signal?: AbortSignal };
export interface DesktopCommandRunner {
  run(command: PreparedDesktopCommand, options?: DesktopCommandRunOptions): Promise<void>;
  start(command: PreparedDesktopCommand, options?: DesktopCommandRunOptions): RunningDesktopCommand;
}
export type NodeDesktopCommandRunnerOptions = {
  reporter?: DesktopReportWriter;
  environment?: Readonly<Record<string, string>>;
  logDirectory?: string;
  output?: ReportOutput;
  errorOutput?: ReportOutput;
  verbose?: boolean;
  shutdownTimeoutMs?: number;
  maxLogBytes?: number;
};

// Credentials are long. Flags and counters such as `true` or `0` are not, and redacting them rewrites machine-readable
// output (`"delegated":true` becomes `"delegated":[REDACTED]`). Shorter secrets must be registered explicitly with addSecret.
const MIN_ENVIRONMENT_SECRET_LENGTH = 8;

export class NodeDesktopCommandRunner implements DesktopCommandRunner {
  private reporterValue?: DesktopReportWriter;
  private ownedReporter?: DesktopRunReporter;
  private readonly active = new Map<RunningDesktopCommand, () => void>();
  private readonly options: NodeDesktopCommandRunnerOptions;
  constructor(options: NodeDesktopCommandRunnerOptions = {}) {
    this.options = options;
    this.reporterValue = options.reporter;
  }
  get reporter(): DesktopReportWriter | undefined {
    return this.reporterValue;
  }

  async run(command: PreparedDesktopCommand, options: DesktopCommandRunOptions = {}): Promise<void> {
    const running = this.start({ ...command, category: command.category ?? 'phase' }, options);
    let failure: unknown;
    try {
      const code = await running.completed;
      if (options.signal?.aborted) throw options.signal.reason;
      if (code !== 0)
        throw running.failure ?? new Error(`Command "${commandLabel(command)}" exited with code ${code}. Log: ${running.logPath}`);
    } catch (error) {
      failure = options.signal?.aborted ? options.signal.reason : error;
    }
    try {
      await running.stop({ failed: failure !== undefined });
    } catch (error) {
      throw new AggregateError(failure === undefined ? [error] : [failure, error], 'Command execution or cleanup failed.');
    }
    if (failure !== undefined) throw failure;
  }

  start(command: PreparedDesktopCommand, options: DesktopCommandRunOptions = {}): RunningDesktopCommand {
    const { signal } = options;
    signal?.throwIfAborted();
    validatePreparedCommand(command);
    const reporter =
      (this.reporterValue ??=
      this.ownedReporter =
        new DesktopRunReporter({
          artifactsRoot: this.options.logDirectory ?? path.join(command.cwd, 'artifacts', 'desktop-commands'),
          kind: 'lifecycle',
          output: this.options.output,
          errorOutput: this.options.errorOutput,
          verbose: this.options.verbose,
        }));
    for (const [key, value] of Object.entries({ ...process.env, ...command.env, ...this.options.environment })) {
      if (/nonce|token|password|secret|authorization/i.test(key) && value && value.length >= MIN_ENVIRONMENT_SECRET_LENGTH)
        reporter.addSecret(value);
    }
    const timeoutMs = this.options.shutdownTimeoutMs ?? 10_000;
    const id = `command-${randomUUID()}`;
    const label = commandLabel(command);
    const emit = reporter.source(id);
    const relativeLog = `commands/${id}.log`;
    const logPath = reporter.artifactPath(relativeLog);
    fs.mkdirSync(path.dirname(logPath), { recursive: true });
    fs.writeFileSync(logPath, reporter.redact(`$ ${[command.command, ...command.args].map((arg) => JSON.stringify(arg)).join(' ')}\n`), {
      flag: 'wx',
      mode: 0o600,
    });
    emit({ kind: 'scope-start', payload: { label, category: command.category ?? 'service' } }, id, command.context);
    emit({ kind: 'artifact', payload: { path: relativeLog, description: label } }, id, command.context);
    let failed: unknown;
    // Only services publish readiness or cooperate in disposal; one-shot phases and workers need no control channel.
    const processControl =
      command.category === undefined || command.category === 'service'
        ? createDesktopProcessControl((error) => {
            failed ??= error;
            reporter.fail(error, 'infrastructure', id);
          })
        : undefined;
    if (processControl) reporter.addSecret(processControl.nonce);
    const environment = { ...process.env, ...command.env, ...this.options.environment };
    const spawnCommand = needsWindowsCommandShim(command.command) ? spawn : spawnNative;
    const child = (() => {
      try {
        return spawnCommand(command.command, [...command.args], {
          cwd: command.cwd,
          env: {
            ...environment,
            ...(processControl ? processControl.environment(environment.NODE_OPTIONS) : {}),
            [DESKTOP_REPORT_SCOPE]: id,
          },
          detached: process.platform !== 'win32',
          stdio: ['ignore', 'pipe', 'pipe'],
          windowsHide: true,
        });
      } catch (error) {
        // A synchronous spawn failure leaves no process to own: close the scope and the control channel here.
        const summary = describeFailure(error);
        emit(
          { kind: 'scope-end', payload: { status: 'failed', logPath: relativeLog, ...(summary ? { summary } : {}) } },
          id,
          command.context,
        );
        emit({ kind: 'producer-finished', payload: { status: 'failed' } }, id, command.context);
        void processControl?.close().catch(() => undefined);
        throw error;
      }
    })();
    let stopped = false;
    let exited = false;
    let closed = false;
    let drainExpired = false;
    let captureFailed = false;
    let exitFailure: Error | undefined;
    let exitSummary: string | undefined;
    let stopPromise: Promise<void> | undefined;
    let treeStopPromise: Promise<void> | undefined;
    let closeDeadline: ReturnType<typeof setTimeout> | undefined;
    let logBytes = fs.statSync(logPath).size;
    // A POSIX group outlives its leader while descendants remain, and its ID cannot be reused while any member exists.
    // A Windows process ID may be reused once the leader is reaped, so a tree is only addressed while it runs.
    const treeRunning = () => child.pid !== undefined && (process.platform === 'win32' ? !exited : !closed || drainExpired);
    const stopTree = () =>
      (treeStopPromise ??= treeRunning() ? stopProcessTree(child.pid!, settledCompletion, timeoutMs) : Promise.resolve());
    const capture = (stream: 'stdout' | 'stderr') => {
      const decoder = new StringDecoder('utf8');
      let buffered = '';
      const record = (text: string) => {
        const redacted = reporter.redact(text);
        logBytes += Buffer.byteLength(redacted);
        if (logBytes > (this.options.maxLogBytes ?? 64 * 1024 * 1024)) throw new Error(`Command log exceeded its size limit: ${logPath}`);
        // Stream attribution is retained; ordering is the collector's arrival order, not a claim about producer write order.
        fs.appendFileSync(logPath, `[${stream}] ${redacted}`, { mode: 0o600 });
        emit({ kind: 'output', payload: { stream, text: redacted } }, id, command.context);
      };
      const consume = (text: string, flush: boolean) => {
        buffered += text;
        let newline: number;
        while ((newline = buffered.indexOf('\n')) >= 0) {
          record(buffered.slice(0, newline + 1));
          buffered = buffered.slice(newline + 1);
        }
        if (Buffer.byteLength(buffered) > 1024 * 1024)
          throw new Error('Unterminated child output line exceeded 1 MiB; refusing silent truncation.');
        if (flush && buffered) {
          record(buffered + '\n');
          buffered = '';
        }
      };
      // The first capture failure is the diagnosis; later output is drained without recording so the child cannot block.
      const onFailure = (error: unknown) => {
        if (captureFailed) return;
        captureFailed = true;
        buffered = '';
        failed ??= error;
        reporter.fail(error, 'reporting', id);
        void stopTree().catch(() => undefined);
      };
      child[stream].on('data', (chunk: Buffer) => {
        if (captureFailed) return;
        try {
          consume(decoder.write(chunk), false);
        } catch (error) {
          onFailure(error);
        }
      });
      child[stream].on('end', () => {
        if (captureFailed) return;
        try {
          consume(decoder.end(), true);
        } catch (error) {
          onFailure(error);
        }
      });
      child[stream].on('error', onFailure);
    };
    capture('stdout');
    capture('stderr');
    const completion = new Promise<number>((resolve, reject) => {
      child.once('error', (error) => {
        failed ??= error;
      });
      child.once('exit', () => {
        exited = true;
        processControl?.stop();
        closeDeadline = setTimeout(() => {
          drainExpired = true;
          failed ??= new Error(`Child exited but inherited output streams did not close within the drain deadline: ${label}`);
          child.stdout.destroy();
          child.stderr.destroy();
        }, timeoutMs);
      });
      child.once('close', (code, signal) => {
        clearTimeout(closeDeadline);
        closed = true;
        if (code !== 0 && !stopped) {
          exitSummary = code === null ? `terminated by ${signal}` : `exit code ${code}`;
          exitFailure = new Error(`Command "${label}" exited with code ${code ?? signal}. Log: ${logPath}`);
        }
        if (failed !== undefined) reject(failed);
        else resolve(code ?? (signal ? 1 : 0));
      });
    });
    // Waiting for the process does not consume its failure; owners observe that through completed.
    const settledCompletion = completion.then(
      (code) => code,
      () => 1,
    );
    // Owners observe completed; this branch only makes unexpected failures visible immediately.
    void completion.then(
      (code) => {
        if (code !== 0 && !stopped && command.category !== 'worker') reporter.fail(exitFailure, 'infrastructure', id);
      },
      (error: unknown) => reporter.fail(error, 'infrastructure', id),
    );
    const onAbort = () => {
      void running.stop({ failed: true }).catch(() => undefined);
    };
    const running: RunningDesktopCommand = {
      completed: completion,
      logPath,
      ...(processControl
        ? {
            waitForReadiness: (expected: DesktopServiceReady, readinessTimeoutMs?: number, readinessSignal?: AbortSignal) =>
              Promise.race([
                processControl.waitForReadiness(expected, readinessTimeoutMs, readinessSignal),
                completion.then(() => {
                  throw failed ?? exitFailure ?? new Error('Owned command exited before service readiness.');
                }),
              ]),
          }
        : {}),
      get failure() {
        return failed ?? exitFailure;
      },
      stop: (stopOptions = {}) =>
        (stopPromise ??= (async () => {
          stopped = true;
          signal?.removeEventListener('abort', onAbort);
          let cleanupError: unknown;
          const recordCleanup = (error: unknown) => {
            cleanupError ??= error;
            reporter.fail(error, 'cleanup', id);
          };
          const wasRunning = !closed;
          const cooperative = processControl?.stop() ?? 0;
          try {
            const encoded =
              this.options.environment?.[DESKTOP_REPORT_CONTEXT] ??
              command.env[DESKTOP_REPORT_CONTEXT] ??
              process.env[DESKTOP_REPORT_CONTEXT];
            const controlled = await requestReportStop(id, encoded, timeoutMs);
            await processControl?.settled(timeoutMs);
            if ((controlled || cooperative) && !closed)
              await deadline(settledCompletion, timeoutMs, 'Gracefully stopping owned Node services');
          } catch (error) {
            recordCleanup(error);
          }
          try {
            await stopTree();
          } catch (error) {
            recordCleanup(error);
          }
          let code = 1;
          try {
            code = await deadline(settledCompletion, timeoutMs, 'Draining command output');
          } catch (error) {
            failed ??= error;
            cleanupError ??= error;
          }
          const status =
            stopOptions.failed || failed !== undefined || cleanupError !== undefined || (!wasRunning && code !== 0) ? 'failed' : 'passed';
          const reason =
            status === 'failed'
              ? (describeFailure(failed ?? cleanupError) ?? exitSummary ?? (wasRunning ? 'Stopped before it finished.' : undefined))
              : undefined;
          emit(
            { kind: 'scope-end', payload: { status, logPath: relativeLog, ...(reason ? { summary: reason } : {}) } },
            id,
            command.context,
          );
          emit({ kind: 'producer-finished', payload: { status } }, id, command.context);
          this.active.delete(running);
          try {
            await processControl?.close();
          } catch (error) {
            recordCleanup(error);
          }
          if (cleanupError !== undefined) throw cleanupError;
        })()),
    };
    this.active.set(running, () => {
      if (treeRunning()) forceStopProcessTree(child.pid!);
    });
    signal?.addEventListener('abort', onAbort, { once: true });
    return running;
  }

  /**
   * Force-kills every active command's process tree without waiting. Owners still observe completion and stop their
   * commands; this only shortens a graceful shutdown that a repeated interrupt asked to abandon.
   */
  terminate(): void {
    for (const kill of this.active.values()) kill();
  }

  async close(): Promise<void> {
    // A command still active here was abandoned by its owner, so its outcome is not a success.
    const results = await Promise.allSettled([...this.active.keys()].map((command) => command.stop({ failed: true })));
    await this.ownedReporter?.finish();
    const failures = results.flatMap((result) => (result.status === 'rejected' ? [result.reason as unknown] : []));
    if (failures.length) throw new AggregateError(failures, 'Owned commands did not stop cleanly.');
  }
}

// A first argument such as `install` in `pod install` or `lage` in `yarn lage` names the work. Flags, paths and other values do not.
const subcommandPattern = /^[a-z][a-z0-9-]{0,31}$/i;

function commandLabel(command: PreparedDesktopCommand): string {
  if (command.label) return command.label;
  const name = path.basename(command.command);
  const [first] = command.args;
  return first !== undefined && subcommandPattern.test(first) ? `${name} ${first}` : name;
}

function validatePreparedCommand(command: PreparedDesktopCommand): void {
  const values = [command.command, command.cwd, ...command.args, ...Object.entries(command.env).flat()];
  if (values.some((value) => typeof value !== 'string' || value.includes('\0')))
    throw new TypeError(
      `Command "${commandLabel(command)}" has a missing or NUL-containing command, argument, directory, or environment value.`,
    );
}

function describeFailure(error: unknown): string | undefined {
  if (error === undefined) return undefined;
  return (error instanceof Error ? error.message : String(error)).split('\n', 1)[0];
}

function needsWindowsCommandShim(command: string): boolean {
  return (
    process.platform === 'win32' &&
    !['.exe', '.com'].includes(path.extname(command).toLowerCase()) &&
    !['node', 'powershell', 'pwsh'].includes(path.basename(command).toLowerCase())
  );
}

async function stopProcessTree(pid: number, completed: Promise<unknown>, timeoutMs: number): Promise<void> {
  if (process.platform === 'win32') {
    const killer = spawnNative('taskkill.exe', ['/PID', String(pid), '/T', '/F'], { stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true });
    let diagnostic = '';
    killer.stdout.on('data', (data: Buffer) => {
      diagnostic += data.toString();
    });
    killer.stderr.on('data', (data: Buffer) => {
      diagnostic += data.toString();
    });
    const code = await deadline(
      new Promise<number | null>((resolve, reject) => {
        killer.once('error', reject);
        killer.once('close', resolve);
      }),
      timeoutMs,
      `Stopping owned process tree ${pid}`,
    );
    if (code !== 0) {
      try {
        process.kill(pid, 0);
      } catch (error) {
        if (isMissingProcess(error)) return;
        throw error;
      }
      throw new Error(`Could not stop owned process tree ${pid}: ${diagnostic}`);
    }
    await deadline(completed, timeoutMs, `Waiting for owned process tree ${pid}`);
    return;
  }
  // The group is gone only when its leader was reaped and no descendant remains in it.
  const stoppedWithin = async (limitMs: number) => {
    const until = Date.now() + limitMs;
    for (;;) {
      if (!processGroupExists(pid)) return true;
      if (Date.now() >= until) return false;
      await new Promise<void>((resolve) => setTimeout(resolve, 50));
    }
  };
  if (!signalProcessGroup(pid, 'SIGTERM') || (await stoppedWithin(timeoutMs))) return;
  if (!signalProcessGroup(pid, 'SIGKILL') || (await stoppedWithin(timeoutMs))) return;
  throw new Error(`Owned process group ${pid} survived SIGKILL.`);
}

function forceStopProcessTree(pid: number): void {
  if (process.platform === 'win32') {
    const killer = spawnNative('taskkill.exe', ['/PID', String(pid), '/T', '/F'], { stdio: 'ignore', windowsHide: true });
    killer.once('error', () => undefined);
    return;
  }
  try {
    signalProcessGroup(pid, 'SIGKILL');
  } catch {
    // The owner's graceful stop reports a group it cannot signal.
  }
}

function signalProcessGroup(pid: number, signal: NodeJS.Signals): boolean {
  try {
    process.kill(-pid, signal);
    return true;
  } catch (error) {
    if (isMissingProcess(error)) return false;
    throw error;
  }
}

function processGroupExists(pid: number): boolean {
  try {
    process.kill(-pid, 0);
    return true;
  } catch (error) {
    if (isMissingProcess(error)) return false;
    // A group this user cannot signal is not ours to declare stopped.
    return true;
  }
}

function isMissingProcess(error: unknown): boolean {
  // Not instanceof: a system error may come from another realm, such as a test sandbox.
  return typeof error === 'object' && error !== null && 'code' in error && error.code === 'ESRCH';
}

export async function deadline<T>(promise: Promise<T>, timeoutMs: number, label: string): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<never>((_resolve, reject) => {
        timer = setTimeout(() => reject(new Error(`${label} exceeded ${timeoutMs}ms.`)), timeoutMs);
      }),
    ]);
  } finally {
    clearTimeout(timer);
  }
}
