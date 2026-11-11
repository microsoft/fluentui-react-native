import fs from 'node:fs';
import path from 'node:path';
import { validateCommand } from './config.js';
import { NodeDesktopCommandRunner } from './commands.js';
import type { RunningDesktopCommand } from './commands.js';
import { createDesktopReportSession } from './reporting/session.js';
import { finishDesktopProcess, registerDesktopProcessDisposal } from './processControl.js';
import { handleDesktopInterrupts } from './signals.js';

/** Bridges a generated PowerShell service descriptor into the parent's resource/reporting scope. */
export async function runOwnedDesktopService(descriptorPath: string): Promise<void> {
  const controller = new AbortController();
  const unregister = registerDesktopProcessDisposal(async () => {
    controller.abort();
    await execution;
  });
  const execution = runService(descriptorPath, controller.signal);
  try {
    await execution;
    finishDesktopProcess();
  } finally {
    unregister();
  }
}

async function runService(descriptorPath: string, signal: AbortSignal): Promise<void> {
  const value: unknown = JSON.parse(fs.readFileSync(descriptorPath, 'utf8'));
  if (
    !value ||
    typeof value !== 'object' ||
    !('command' in value) ||
    !('stopPath' in value) ||
    !('label' in value) ||
    typeof value.stopPath !== 'string' ||
    !path.isAbsolute(value.stopPath) ||
    typeof value.label !== 'string' ||
    !value.label
  ) {
    throw new TypeError('Invalid owned desktop service descriptor.');
  }
  validateCommand(value.command);
  const command = value.command;
  const cwd = path.resolve(command.cwd ?? process.cwd());
  const stopPath = value.stopPath;
  const report = await createDesktopReportSession({ artifactsRoot: path.join(cwd, 'artifacts', 'desktop'), kind: 'lifecycle' });
  // Nested service scopes allow 45 seconds for disposal, followed by their reporting/stdio flush.
  const runner = new NodeDesktopCommandRunner({ reporter: report.reporter, environment: report.environment, shutdownTimeoutMs: 60_000 });
  let stop!: () => void;
  const stopped = new Promise<void>((resolve) => {
    stop = resolve;
  });
  signal.addEventListener('abort', stop, { once: true });
  if (signal.aborted) stop();
  const interval = setInterval(() => {
    if (fs.existsSync(stopPath)) stop();
  }, 100);
  report.onStop?.(stop);
  const releaseInterrupts = handleDesktopInterrupts({ stop, terminate: () => runner.terminate() });
  let failure: unknown;
  let running: RunningDesktopCommand | undefined;
  try {
    signal.throwIfAborted();
    running = runner.start({
      ...command,
      cwd,
      args: command.args ?? [],
      env: command.env ?? {},
      category: 'service',
      label: value.label,
      context: { service: value.label },
    });
    const service = running;
    await Promise.race([
      stopped,
      service.completed.then((code) => {
        throw service.failure ?? new Error(`Required service "${value.label}" exited unexpectedly with code ${code}.`);
      }),
    ]);
  } catch (error) {
    failure = error;
    report.reporter.emit({ kind: 'service-failed', payload: { failure: report.reporter.failure(error) } }, value.label);
  } finally {
    clearInterval(interval);
    signal.removeEventListener('abort', stop);
    // A requested stop is this service's normal end; runner.close() would report it as abandoned.
    const failed = failure !== undefined;
    for (const cleanup of [() => running?.stop({ failed }), () => runner.close()]) {
      try {
        await cleanup();
      } catch (error) {
        report.reporter.fail(error, 'cleanup');
        failure = failure === undefined ? error : new AggregateError([failure, error], 'Service execution and cleanup failed.');
      }
    }
    try {
      process.exitCode = await report.close(failure);
    } finally {
      releaseInterrupts();
    }
  }
  if (failure !== undefined) throw failure;
}
