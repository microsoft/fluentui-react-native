import { execFile as nodeExecFile } from 'node:child_process';

import { DesktopDriverError } from './errors.ts';

export interface ProcessSupervisorOptions {
  pid: number;
  gracePeriodMs?: number;
  platform?: NodeJS.Platform;
  /** Use a POSIX process group whose id is `pid`. The process must have been spawned detached. */
  processGroup?: boolean;
  /** Protocol-aware graceful shutdown, such as an IPC message. */
  gracefulShutdown?: () => void | Promise<void>;
  isAlive?: (pid: number) => boolean;
  signal?: (pid: number, signal: NodeJS.Signals) => void;
  execFile?: typeof nodeExecFile;
}

/** Stops one exactly identified process tree with a bounded graceful phase and forced escalation. */
export async function terminateProcessTree(options: ProcessSupervisorOptions): Promise<void> {
  const gracePeriodMs = options.gracePeriodMs ?? 5000;
  const deadline = Date.now() + gracePeriodMs;
  const platform = options.platform ?? process.platform;
  const isAlive = options.isAlive ?? isProcessAlive;
  const signal = options.signal ?? process.kill;
  const execFile = options.execFile ?? nodeExecFile;
  const monitoredPid = platform !== 'win32' && options.processGroup ? -options.pid : options.pid;

  if (!Number.isInteger(options.pid) || options.pid <= 0 || !isAlive(monitoredPid)) {
    return;
  }

  let gracefulFailure: unknown;
  if (options.gracefulShutdown) {
    const gracefulAttempt = Promise.resolve()
      .then(options.gracefulShutdown)
      .then(
        () => undefined,
        (error) => {
          gracefulFailure = error;
        },
      );
    let timer: NodeJS.Timeout | undefined;
    await Promise.race([
      gracefulAttempt,
      new Promise<void>((resolve) => {
        timer = setTimeout(resolve, gracePeriodMs);
        timer.unref();
      }),
    ]);
    if (timer) {
      clearTimeout(timer);
    }
  } else {
    try {
      if (platform === 'win32') {
        await runTaskkill(execFile, options.pid, false);
      } else {
        signal(options.processGroup ? -options.pid : options.pid, 'SIGTERM');
      }
    } catch (error) {
      gracefulFailure = error;
    }
  }

  while (Date.now() < deadline && isAlive(monitoredPid)) {
    await delay(Math.min(100, Math.max(1, deadline - Date.now())));
  }
  if (!isAlive(monitoredPid)) {
    if (gracefulFailure) {
      throw gracefulFailure;
    }
    return;
  }

  try {
    if (platform === 'win32') {
      await runTaskkill(execFile, options.pid, true);
    } else {
      signal(options.processGroup ? -options.pid : options.pid, 'SIGKILL');
    }
  } catch (error) {
    if (isAlive(monitoredPid)) {
      throw error;
    }
  }

  const forceDeadline = Date.now() + Math.min(1000, gracePeriodMs);
  while (Date.now() < forceDeadline && isAlive(monitoredPid)) {
    await delay(25);
  }
  if (isAlive(monitoredPid)) {
    throw new DesktopDriverError(`Owned process tree ${options.pid} did not exit after forced termination`, {
      kind: 'ownership',
      detail: { pid: options.pid },
    });
  }
  if (gracefulFailure) {
    throw gracefulFailure;
  }
}

/** Returns true when a process id currently exists and is signalable. */
export function isProcessAlive(pid: number): boolean {
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    return (error as NodeJS.ErrnoException).code === 'EPERM';
  }
}

function runTaskkill(execFile: typeof nodeExecFile, pid: number, force: boolean): Promise<void> {
  const args = ['/PID', String(pid), '/T', ...(force ? ['/F'] : [])];
  return new Promise((resolve, reject) => {
    execFile('taskkill.exe', args, { windowsHide: true }, (error) => {
      if (error && (error as NodeJS.ErrnoException).code !== 'ESRCH') {
        reject(
          new DesktopDriverError(`Failed to ${force ? 'force-stop' : 'stop'} owned Windows process tree ${pid}`, {
            kind: 'ownership',
            cause: error,
          }),
        );
        return;
      }
      resolve();
    });
  });
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
