import { spawn } from 'node:child_process';
import path from 'node:path';

import type { DesktopCommand } from '../config/commands.js';

export type PreparedDesktopCommand = DesktopCommand & {
  args: readonly string[];
  cwd: string;
  env: Readonly<Record<string, string>>;
};

export type RunningDesktopCommand = {
  completed: Promise<number>;
  stop(): Promise<void>;
};

export interface DesktopCommandRunner {
  run(command: PreparedDesktopCommand): Promise<void>;
  start(command: PreparedDesktopCommand): RunningDesktopCommand;
}

export class NodeDesktopCommandRunner implements DesktopCommandRunner {
  async run(command: PreparedDesktopCommand): Promise<void> {
    const child = spawnCommand(command, false);
    const exitCode = await completed(child);
    if (exitCode !== 0) {
      throw new Error(formatCommandFailure(command, exitCode));
    }
  }

  start(command: PreparedDesktopCommand): RunningDesktopCommand {
    const child = spawnCommand(command, true);
    const completion = completed(child);
    let stopped = false;

    return {
      completed: completion,
      async stop() {
        if (stopped || child.exitCode !== null || child.signalCode !== null) {
          return;
        }
        stopped = true;
        await stopChildProcess(child.pid, completion);
      },
    };
  }
}

function spawnCommand(command: PreparedDesktopCommand, background: boolean) {
  return spawn(command.command, [...command.args], {
    cwd: command.cwd,
    detached: background && process.platform !== 'win32',
    env: { ...process.env, ...command.env },
    shell: requiresWindowsShell(command.command),
    stdio: 'inherit',
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

async function stopChildProcess(pid: number | undefined, completion: Promise<number>): Promise<void> {
  if (!pid) {
    return;
  }

  if (process.platform === 'win32') {
    await stopWindowsProcessTree(pid);
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

  const stopped = await Promise.race([completion.then(() => true), delay(5000).then(() => false)]);
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

async function stopWindowsProcessTree(pid: number): Promise<void> {
  const command: PreparedDesktopCommand = {
    command: process.env.ComSpec ?? 'cmd.exe',
    args: ['/d', '/s', '/c', `taskkill /PID ${pid} /T /F`],
    cwd: path.parse(process.cwd()).root,
    env: {},
  };
  const child = spawnCommand(command, false);
  const exitCode = await completed(child);
  if (exitCode !== 0) {
    throw new Error(`Could not stop owned process tree ${pid}.`);
  }
}

function formatCommandFailure(command: PreparedDesktopCommand, exitCode: number): string {
  return `Command "${[command.command, ...command.args].join(' ')}" exited with code ${exitCode}.`;
}

function delay(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}
