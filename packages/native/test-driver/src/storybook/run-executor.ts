/**
 * WebdriverIO run executor for the loopback test service.
 *
 * Turns a story id into one ordinary WebdriverIO run. The command line comes entirely from
 * configuration; the only thing a request contributes is a story id, which is looked up in the
 * generated manifest to obtain an already-known spec path and Mocha grep. Nothing an application
 * sends can reach `spawn`.
 */

import { spawn as nodeSpawn, type ChildProcess } from 'node:child_process';

import { DesktopCancelledError } from '../errors.ts';
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
  /** Receives runner stdout/stderr lines for logging. */
  onOutput?: (chunk: string) => void;
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
}

/** Builds the exact invocation for one manifest entry, for logging and for tests. */
export function buildInvocation(
  runner: DesktopRunnerCommand,
  entry: { spec: string; grep: string },
  platform: NodeJS.Platform = process.platform,
): RunnerInvocation {
  return {
    command: resolveRunnerCommand(runner.command, platform),
    args: [...(runner.args ?? []), '--spec', entry.spec],
    env: { ...process.env, ...runner.env, DESKTOP_TEST_GREP: entry.grep },
  };
}

/** Creates the executor the loopback test service calls for each requested story. */
export function createWebdriverIoRunExecutor(options: RunExecutorOptions): DesktopRunExecutor {
  const spawnImpl = options.spawnImpl ?? nodeSpawn;

  const runStory = (storyId: string, signal: AbortSignal): Promise<{ ok: boolean; message?: string }> => {
    const entry = options.manifest.entries.find((candidate) => candidate.storyId === storyId);
    if (!entry) {
      // The service validates ids against the manifest first, so this is defence in depth.
      return Promise.resolve({ ok: false, message: `Story "${storyId}" is not in the generated manifest` });
    }

    const invocation = buildInvocation(options.runner, entry);

    return new Promise((resolve) => {
      const child: ChildProcess = spawnImpl(invocation.command, [...invocation.args], {
        cwd: options.runner.cwd,
        env: invocation.env,
        stdio: ['ignore', 'pipe', 'pipe'],
      });

      let settled = false;
      const finish = (result: { ok: boolean; message?: string }): void => {
        if (settled) {
          return;
        }
        settled = true;
        signal.removeEventListener('abort', onAbort);
        resolve(result);
      };

      function onAbort(): void {
        child.kill('SIGTERM');
      }
      signal.addEventListener('abort', onAbort, { once: true });

      const forward = (chunk: Buffer): void => options.onOutput?.(chunk.toString('utf8'));
      child.stdout?.on('data', forward);
      child.stderr?.on('data', forward);

      // Without an 'error' listener a spawn failure is an unhandled 'error' event that would kill
      // the service, and 'exit' would never fire, leaving the run reported as running forever.
      child.on('error', (error: Error) => finish({ ok: false, message: `Failed to start the test runner: ${error.message}` }));
      child.on('exit', (code, signalName) => {
        if (signal.aborted) {
          finish({ ok: false, message: 'Run cancelled' });
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
