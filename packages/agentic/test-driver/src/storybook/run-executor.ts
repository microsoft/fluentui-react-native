/**
 * WebdriverIO run executor for the loopback test service.
 *
 * Turns a story id into one ordinary WebdriverIO run. The command line comes entirely from
 * configuration; the only thing a request contributes is a story id, which is looked up in the
 * generated manifest to obtain an already-known spec path and Mocha grep. Nothing an application
 * sends can reach `spawn`.
 */

import { spawn as nodeSpawn, type ChildProcess } from 'node:child_process';

import { DesktopCancelledError, DesktopValidationError } from '../errors.ts';
import { terminateProcessTree } from '../process-supervisor.ts';
import type { DesktopRunExecutor } from './test-service.ts';
import type { DesktopTestResult, StoryTestManifest } from '../types.ts';

/** How the runner is invoked. Fully specified by the consumer, never by a run request. */
export interface DesktopRunnerCommand {
  /** Executable name or path, for example `yarn`. `.cmd` is appended on Windows when bare. */
  command: string;
  /** Arguments placed before the generated spec selection. */
  args?: readonly string[];
  /** Working directory the runner is launched from. */
  cwd: string;
  /** Extra environment entries merged over the current environment. */
  env?: Readonly<Record<string, string>>;
}

export interface RunExecutorOptions {
  manifest: StoryTestManifest;
  runner: DesktopRunnerCommand;
  /** Injected for tests; defaults to `child_process.spawn`. */
  spawnImpl?: typeof nodeSpawn;
  /** Injected for tests; defaults to the current platform. */
  platform?: NodeJS.Platform;
  /** Receives runner stdout/stderr lines for logging. */
  onOutput?: (chunk: string) => void;
  /** Injected for tests; defaults to the owned process-tree supervisor. */
  terminateProcess?: typeof terminateProcessTree;
}

/**
 * Resolves the executable for the current platform.
 *
 * `spawn` without a shell cannot resolve `yarn` on Windows, where the launcher is `yarn.cmd`. A
 * path or an already-suffixed command is left alone.
 */
export function resolveRunnerCommand(command: string, platform: NodeJS.Platform = process.platform): string {
  if (platform !== 'win32') {
    return command;
  }
  if (command.includes('/') || command.includes('\\') || /\.(cmd|bat|exe)$/i.test(command)) {
    return command;
  }
  return `${command}.cmd`;
}

export interface RunnerInvocation {
  command: string;
  args: readonly string[];
  env: Record<string, string | undefined>;
  /** Set when the command line is handed to `cmd.exe` already quoted. */
  windowsVerbatimArguments?: boolean;
}

/** Windows batch launchers, which `spawn` cannot execute directly. */
const WINDOWS_LAUNCHER = /\.(?:cmd|bat)$/i;

/**
 * Characters `cmd.exe` still acts on inside a quoted argument, or that break quoting outright.
 *
 * Every value that reaches this point comes from the consumer's own configuration or from a
 * generated manifest path, never from the application, so rejecting them is a guard against an
 * unquotable command line rather than against a hostile one.
 */
const CMD_UNSAFE = /["%!^&|<>]/;

/**
 * Wraps a Windows launcher in an explicit `cmd.exe` call.
 *
 * Node refuses to `spawn` a `.cmd` or `.bat` file directly — it fails with `EINVAL` — because a
 * batch launcher is only executable through a command interpreter. The obvious fix, `shell: true`,
 * joins the arguments into the command line without quoting any of them, which breaks the moment a
 * spec path contains a space. Building the interpreter call here instead keeps every argument
 * quoted and is exercised by tests on any platform.
 */
function toCommandInterpreterInvocation(command: string, args: readonly string[]): { command: string; args: string[] } {
  for (const value of [command, ...args]) {
    if (CMD_UNSAFE.test(value)) {
      throw new DesktopValidationError('Runner invocation cannot be passed to the Windows command interpreter', [
        `"${value}" contains one of " % ! ^ & | < >`,
      ]);
    }
  }
  // `/d` skips AutoRun scripts, and `/s` makes the interpreter strip exactly the outer quotes.
  const commandLine = [command, ...args].map((value) => `"${value}"`).join(' ');
  return { command: process.env.ComSpec ?? 'cmd.exe', args: ['/d', '/s', '/c', `"${commandLine}"`] };
}

/** Builds the exact invocation for one manifest entry, for logging and for tests. */
export function buildInvocation(
  runner: DesktopRunnerCommand,
  entry: { spec: string; grep: string },
  platform: NodeJS.Platform = process.platform,
): RunnerInvocation {
  const command = resolveRunnerCommand(runner.command, platform);
  const args = [...(runner.args ?? []), '--spec', entry.spec];
  const env = { ...process.env, ...runner.env, DESKTOP_TEST_GREP: entry.grep };

  if (platform === 'win32' && WINDOWS_LAUNCHER.test(command)) {
    return { ...toCommandInterpreterInvocation(command, args), env, windowsVerbatimArguments: true };
  }
  return { command, args, env };
}

/** Creates the executor the loopback test service calls for each requested story. */
export function createWebdriverIoRunExecutor(options: RunExecutorOptions): DesktopRunExecutor {
  const spawnImpl = options.spawnImpl ?? nodeSpawn;
  const platform = options.platform ?? process.platform;
  const terminateProcess = options.terminateProcess ?? terminateProcessTree;

  const runStory = (storyId: string, signal: AbortSignal): Promise<{ ok: boolean; message?: string }> => {
    const entry = options.manifest.entries.find((candidate) => candidate.storyId === storyId);
    if (!entry) {
      // The service validates ids against the manifest first, so this is defence in depth.
      return Promise.resolve({ ok: false, message: `Story "${storyId}" is not in the generated manifest` });
    }

    const invocation = buildInvocation(options.runner, entry, platform);

    return new Promise((resolve) => {
      const child: ChildProcess = spawnImpl(invocation.command, [...invocation.args], {
        cwd: options.runner.cwd,
        env: invocation.env,
        stdio: ['ignore', 'pipe', 'pipe'],
        windowsVerbatimArguments: invocation.windowsVerbatimArguments,
        detached: platform !== 'win32',
      });

      let settled = false;
      let cancelling = false;
      const finish = (result: { ok: boolean; message?: string }): void => {
        if (settled) {
          return;
        }
        settled = true;
        signal.removeEventListener('abort', onAbort);
        resolve(result);
      };

      function onAbort(): void {
        cancelling = true;
        const pid = child.pid;
        if (!pid) {
          finish({ ok: false, message: 'Run cancelled before the test runner started' });
          return;
        }
        void terminateProcess({
          pid,
          platform,
          processGroup: platform !== 'win32',
        }).then(
          () => finish({ ok: false, message: 'Run cancelled' }),
          (error: Error) => finish({ ok: false, message: `Run cancellation failed: ${error.message}` }),
        );
      }
      signal.addEventListener('abort', onAbort, { once: true });

      const forward = (chunk: Buffer): void => options.onOutput?.(chunk.toString('utf8'));
      child.stdout?.on('data', forward);
      child.stderr?.on('data', forward);

      // Without an 'error' listener a spawn failure is an unhandled 'error' event that would kill
      // the service, and 'exit' would never fire, leaving the run reported as running forever.
      child.on('error', (error: Error) => finish({ ok: false, message: `Failed to start the test runner: ${error.message}` }));
      child.on('exit', (code, signalName) => {
        if (cancelling) {
          return;
        }
        finish({
          ok: code === 0,
          message: code === 0 ? undefined : `Test runner exited with ${signalName ? `signal ${signalName}` : `code ${String(code)}`}`,
        });
      });
    });
  };

  return async (storyIds, progress, signal) => {
    const results: DesktopTestResult[] = [];

    for (const storyId of storyIds) {
      if (signal.aborted) {
        throw new DesktopCancelledError();
      }
      const startedAt = Date.now();
      const outcome = await runStory(storyId, signal);
      const result: DesktopTestResult = {
        testId: storyId,
        storyId,
        title: storyId,
        status: outcome.ok ? 'passed' : 'failed',
        durationMs: Date.now() - startedAt,
        error: outcome.message ? { message: outcome.message } : undefined,
      };
      results.push(result);
      progress(result);
    }

    if (signal.aborted) {
      throw new DesktopCancelledError();
    }
    return results;
  };
}
