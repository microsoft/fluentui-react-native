import { spawn } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { once } from 'node:events';
import fs from 'node:fs';
import path from 'node:path';
import { Writable } from 'node:stream';

import type { DesktopCommand } from '../config/commands.js';
import { formatDesktopStorybookError, type DesktopStorybookErrorOutput } from '../../config/diagnostics.cjs';

export const STORYBOOK_VERBOSE = 'STORYBOOK_VERBOSE';

export type PreparedDesktopCommand = DesktopCommand & {
  args: readonly string[];
  cwd: string;
  env: Readonly<Record<string, string>>;
  label?: string;
};

export type RunningDesktopCommand = {
  completed: Promise<number>;
  logPath?: string;
  stop(options?: { failed?: boolean }): Promise<void>;
};

export type NodeDesktopCommandRunnerOptions = {
  errorOutput?: DesktopStorybookErrorOutput;
  logDirectory?: string;
  output?: Pick<NodeJS.WriteStream, 'write'>;
  verbose?: boolean;
};

export interface DesktopCommandRunner {
  run(command: PreparedDesktopCommand): Promise<void>;
  start(command: PreparedDesktopCommand): RunningDesktopCommand;
}

export class NodeDesktopCommandRunner implements DesktopCommandRunner {
  private readonly output: Pick<NodeJS.WriteStream, 'write'>;
  private readonly errorOutput: DesktopStorybookErrorOutput;
  private readonly verbose: boolean;
  private readonly logDirectory?: string;
  private reportQueue = Promise.resolve();

  constructor(options: NodeDesktopCommandRunnerOptions = {}) {
    this.output = options.output ?? process.stdout;
    this.errorOutput = options.errorOutput ?? process.stderr;
    this.verbose = options.verbose ?? process.env[STORYBOOK_VERBOSE] === '1';
    this.logDirectory = options.logDirectory;
  }

  async run(command: PreparedDesktopCommand): Promise<void> {
    const running = this.launch(command, false);
    let failure: unknown;
    try {
      const exitCode = await running.completed;
      if (exitCode !== 0) {
        throw new Error(`${formatCommandFailure(command, exitCode)} Log: ${running.logPath}`);
      }
    } catch (error) {
      failure = error;
    }
    try {
      await running.stop({ failed: failure !== undefined });
    } catch (error) {
      throw new AggregateError(failure === undefined ? [error] : [failure, error], 'Command execution or log reporting failed.');
    }
    if (failure !== undefined) {
      throw failure;
    }
  }

  start(command: PreparedDesktopCommand): RunningDesktopCommand {
    return this.launch(command, true);
  }

  private launch(command: PreparedDesktopCommand, background: boolean): RunningDesktopCommand {
    const directory = this.logDirectory ?? path.join(command.cwd, 'artifacts', 'storybook-commands');
    fs.mkdirSync(directory, { recursive: true });
    const logPath = path.join(directory, `${new Date().toISOString().replaceAll(':', '-')}-${randomUUID()}.log`);
    const label = command.label ?? [command.command, ...command.args].join(' ');
    const descriptor = fs.openSync(logPath, 'ax', 0o600);
    let child: ReturnType<typeof spawn>;
    try {
      fs.writeSync(descriptor, `$ ${[command.command, ...command.args].map((argument) => JSON.stringify(argument)).join(' ')}\n`);
      // A shared descriptor preserves stdout/stderr write order without buffering a whole command in memory.
      child = spawnCommand(command, background, descriptor);
    } finally {
      fs.closeSync(descriptor);
    }
    const completion = completed(child);
    let stopRequested = false;
    let stopPromise: Promise<void> | undefined;
    let exitError: unknown;
    let reportedFailure = false;
    const reports: Promise<void>[] = [];
    const enqueue = (action: () => Promise<void> | void) => {
      const report = this.reportQueue.then(action);
      this.reportQueue = report.catch(() => undefined);
      reports.push(report);
    };
    enqueue(() => writeOutput(this.output, `[storybook] START ${label} (log: ${logPath})\n`));

    const report = (failed: boolean, status: string) => {
      if (reportedFailure) {
        return;
      }
      reportedFailure = failed;
      enqueue(async () => {
        const output = failed ? this.errorOutput : this.output;
        if (failed || this.verbose) {
          await writeOutput(output, `[storybook] BEGIN ${label}\n`);
          await replayCommandLog(logPath, output);
          await writeOutput(output, `\n[storybook] END ${label}\n`);
        }
        await writeOutput(output, `[storybook] ${failed ? 'FAIL' : 'OK'} ${label} (${status}; log: ${logPath})\n`);
        if (exitError !== undefined) {
          await writeOutput(output, `${formatDesktopStorybookError(exitError)}\n`);
        }
      });
    };
    void completion.then(
      (code) => {
        if (!stopRequested && code !== 0) {
          report(true, child.signalCode ? `signal ${child.signalCode}` : `exit ${code}`);
        }
      },
      (error) => {
        exitError = error;
        report(true, 'could not start');
      },
    );

    return {
      completed: completion,
      logPath,
      stop(options = {}) {
        stopPromise ??= (async () => {
          stopRequested = true;
          const running = exitError === undefined && child.exitCode === null && child.signalCode === null;
          try {
            if (running) {
              await stopChildProcess(child.pid, completion, logPath);
            }
          } catch (error) {
            exitError = error;
            report(true, 'could not stop');
            await Promise.all(reports);
            throw error;
          }
          report(
            Boolean(options.failed || exitError !== undefined || (!running && child.exitCode !== 0)),
            running ? 'stopped' : child.signalCode ? `signal ${child.signalCode}` : `exit ${child.exitCode}`,
          );
          await Promise.all(reports);
        })();
        return stopPromise;
      },
    };
  }
}

async function replayCommandLog(logPath: string, output: Pick<NodeJS.WriteStream, 'write'>): Promise<void> {
  for await (const chunk of fs.createReadStream(logPath)) {
    await writeOutput(output, chunk);
  }
}

async function writeOutput(output: Pick<NodeJS.WriteStream, 'write'>, chunk: string | Uint8Array): Promise<void> {
  if (!output.write(chunk) && output instanceof Writable) {
    await once(output, 'drain');
  }
}

function spawnCommand(command: PreparedDesktopCommand, background: boolean, descriptor?: number) {
  return spawn(command.command, [...command.args], {
    cwd: command.cwd,
    detached: background && process.platform !== 'win32',
    env: { ...process.env, ...command.env },
    shell: requiresWindowsShell(command.command),
    stdio: descriptor === undefined ? 'inherit' : ['inherit', descriptor, descriptor],
  });
}

function requiresWindowsShell(command: string): boolean {
  if (process.platform !== 'win32') {
    return false;
  }

  const executable = path.basename(command).toLowerCase();
  return path.extname(executable) !== '.exe' && !['node', 'powershell', 'pwsh'].includes(executable);
}

function completed(child: ReturnType<typeof spawn>): Promise<number> {
  return new Promise((resolve, reject) => {
    child.once('error', reject);
    child.once('exit', (code, signal) => resolve(code ?? (signal ? 1 : 0)));
  });
}

async function stopChildProcess(pid: number | undefined, completion: Promise<number>, logPath: string): Promise<void> {
  if (!pid) {
    return;
  }

  if (process.platform === 'win32') {
    await stopWindowsProcessTree(pid, logPath);
    await completion;
    return;
  }

  try {
    process.kill(-pid, 'SIGTERM');
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ESRCH') {
      throw error;
    }
  }

  let timer: ReturnType<typeof setTimeout> | undefined;
  let stopped: boolean;
  try {
    stopped = await Promise.race([
      completion.then(() => true),
      new Promise<boolean>((resolve) => {
        timer = setTimeout(() => resolve(false), 5000);
      }),
    ]);
  } finally {
    clearTimeout(timer);
  }
  if (!stopped) {
    try {
      process.kill(-pid, 'SIGKILL');
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ESRCH') {
        throw error;
      }
    }
    await completion;
  }
}

async function stopWindowsProcessTree(pid: number, logPath: string): Promise<void> {
  const command: PreparedDesktopCommand = {
    command: process.env.ComSpec ?? 'cmd.exe',
    args: ['/d', '/s', '/c', `taskkill /PID ${pid} /T /F`],
    cwd: path.parse(process.cwd()).root,
    env: {},
  };
  const descriptor = fs.openSync(logPath, 'a');
  let child: ReturnType<typeof spawn>;
  try {
    child = spawnCommand(command, false, descriptor);
  } finally {
    fs.closeSync(descriptor);
  }
  const exitCode = await completed(child);
  if (exitCode !== 0) {
    throw new Error(`Could not stop owned process tree ${pid}.`);
  }
}

function formatCommandFailure(command: PreparedDesktopCommand, exitCode: number): string {
  return `Command "${[command.command, ...command.args].join(' ')}" exited with code ${exitCode}.`;
}
