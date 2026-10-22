import fs from 'node:fs';
import path from 'node:path';
import { validateCommand } from './config.js';
import { NodeDesktopCommandRunner } from './commands.js';
import { createDesktopReportSession } from './reporting/session.js';

/** Bridges a generated PowerShell service descriptor into the parent's resource/reporting scope. */
export async function runOwnedDesktopService(descriptorPath: string): Promise<void> {
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
  const runner = new NodeDesktopCommandRunner({ reporter: report.reporter, environment: report.environment });
  let stop!: () => void;
  const stopped = new Promise<void>((resolve) => {
    stop = resolve;
  });
  const interval = setInterval(() => {
    if (fs.existsSync(stopPath)) stop();
  }, 100);
  report.onStop?.(stop);
  process.once('SIGINT', stop);
  process.once('SIGTERM', stop);
  let failure: unknown;
  try {
    const running = runner.start({
      ...command,
      cwd,
      args: command.args ?? [],
      env: command.env ?? {},
      category: 'service',
      label: value.label,
      context: { service: value.label },
    });
    await Promise.race([
      stopped,
      running.completed.then((code) => {
        throw running.failure ?? new Error(`Required service "${value.label}" exited unexpectedly with code ${code}.`);
      }),
    ]);
  } catch (error) {
    failure = error;
    report.reporter.emit({ kind: 'service-failed', payload: { failure: report.reporter.failure(error) } }, value.label);
  } finally {
    clearInterval(interval);
    process.off('SIGINT', stop);
    process.off('SIGTERM', stop);
    try {
      await runner.close();
    } catch (error) {
      report.reporter.fail(error, 'cleanup');
      failure = failure === undefined ? error : new AggregateError([failure, error], 'Service execution and cleanup failed.');
    }
    process.exitCode = await report.close(failure);
  }
}
