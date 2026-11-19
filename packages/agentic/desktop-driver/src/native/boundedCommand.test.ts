import { ChildProcess, spawn } from 'node:child_process';
import { once } from 'node:events';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createInterface } from 'node:readline';

import { clipDiagnostic, runBoundedCommand, runBuildCommand } from './boundedCommand';

jest.mock('node:child_process', () => {
  const actual = jest.requireActual<typeof import('node:child_process')>('node:child_process');
  return { ...actual, spawn: jest.fn(actual.spawn) };
});

const node = process.execPath;

describe('bounded child process runner', () => {
  test('keeps only the tail of oversized output and reports the truncation', async () => {
    const result = await runBoundedCommand(node, ['-e', "process.stdout.write('x'.repeat(100000) + 'END')"], {
      maxOutputBytes: 1_000,
      timeoutMs: 30_000,
    });

    expect(result).toMatchObject({ code: 0, stdoutTruncated: true, stderrTruncated: false, timedOut: false });
    expect(result.stdout).toHaveLength(1_000);
    expect(result.stdout.endsWith('END')).toBe(true);
  });

  test('terminates a process that stays alive past its deadline', async () => {
    const script = [
      "process.on('SIGTERM', () => process.stdout.write('term\\n'));",
      "process.stdout.write('ready\\n');",
      'setInterval(() => {}, 1_000);',
    ].join('\n');
    const timeoutMs = 300;
    const killGraceMs = 200;
    // Keep real process/pipe I/O, but do not advance the runner's timers until the child is ready.
    jest.useFakeTimers({ doNotFake: ['nextTick', 'setImmediate', 'queueMicrotask'] });
    jest.mocked(spawn).mockClear();
    const result = runBoundedCommand(node, ['-e', script], { killGraceMs, maxOutputBytes: 1_000, timeoutMs });
    const child = jest.mocked(spawn).mock.results.at(-1)?.value;
    // Handle a spawn error even if we are still waiting for the fixture's first line.
    void result.catch(() => undefined);
    try {
      if (!child?.stdout) throw new Error('Expected the child stdout pipe.');
      const output = createInterface({ input: child.stdout });
      const signal = AbortSignal.timeout(10_000);
      await expect(once(output, 'line', { signal })).resolves.toEqual(['ready']);

      if (process.platform !== 'win32') {
        const terminated = once(output, 'line', { signal });
        jest.advanceTimersByTime(timeoutMs);
        await expect(terminated).resolves.toEqual(['term']);
      }

      const exited = once(child, 'exit', { signal });
      jest.advanceTimersByTime(process.platform === 'win32' ? timeoutMs : killGraceMs);
      await exited;
      const outcome = await result;
      expect(outcome).toMatchObject({ timedOut: true });
      if (process.platform !== 'win32') {
        expect(outcome.terminationSignal).toBe('SIGKILL');
      }
    } finally {
      jest.useRealTimers();
      if (child?.exitCode === null && child.signalCode === null) child.kill('SIGKILL');
      await result.catch(() => undefined);
    }
  }, 20_000);

  test('kills the process and rejects with an abort error when aborted', async () => {
    const controller = new AbortController();
    const running = runBoundedCommand(node, ['-e', 'setInterval(() => {}, 1000);'], {
      killGraceMs: 200,
      maxOutputBytes: 1_000,
      signal: controller.signal,
      timeoutMs: 30_000,
    });
    setTimeout(() => controller.abort(), 200);

    await expect(running).rejects.toMatchObject({ name: 'AbortError' });
  });

  test('does not wait on a descendant that keeps the output pipes open', async () => {
    const script = [
      "const { spawn } = require('node:child_process');",
      "const descendant = spawn(process.execPath, ['-e', 'setInterval(() => {}, 1000)'], { stdio: ['ignore', 'inherit', 'inherit'] });",
      'console.log(descendant.pid);',
      'descendant.unref();',
    ].join('\n');
    const startedAt = Date.now();
    const result = await runBoundedCommand(node, ['-e', script], { closeGraceMs: 200, maxOutputBytes: 1_000, timeoutMs: 30_000 });
    const descendant = Number(result.stdout.trim());
    try {
      expect(result).toMatchObject({ code: 0, timedOut: false });
      expect(Date.now() - startedAt).toBeLessThan(10_000);
    } finally {
      if (Number.isInteger(descendant) && descendant > 0) {
        try {
          process.kill(descendant);
        } catch {
          // The descendant may already have ended.
        }
      }
    }
  });

  test('rejects when the command cannot be started', async () => {
    await expect(
      runBoundedCommand(path.join(os.tmpdir(), 'furn-missing-command'), [], { maxOutputBytes: 1_000, timeoutMs: 1_000 }),
    ).rejects.toMatchObject({ code: 'ENOENT' });
  });

  test('preserves a spawn error when descriptor exhaustion leaves no output pipes', async () => {
    const child = new ChildProcess();
    jest.mocked(spawn).mockReturnValueOnce(child);
    const failure = Object.assign(new Error('Cannot create child pipes.'), { code: 'EMFILE' });
    const pending = runBoundedCommand(node, [], { maxOutputBytes: 1_000, timeoutMs: 1_000 });
    queueMicrotask(() => child.emit('error', failure));

    await expect(pending).rejects.toBe(failure);
  });
});

describe('build command failures', () => {
  test('carry a clipped excerpt in the error and the bounded output in the log', async () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'furn-build-command-'));
    const logPath = path.join(root, 'build.log');
    try {
      const failure = await runBuildCommand(node, ['-e', "console.error('E'.repeat(100000) + 'CAUSE'); process.exitCode = 3;"], {
        exitFailureCode: 'signing-failed',
        logPath,
      }).then(
        () => {
          throw new Error('Expected the build command to fail.');
        },
        (error: Error & { code: string }) => error,
      );

      expect(failure).toMatchObject({ code: 'signing-failed' });
      expect(failure.message).toContain('exited with code 3');
      expect(failure.message).toContain('CAUSE');
      expect(failure.message.length).toBeLessThan(5_000);
      expect(fs.readFileSync(logPath, 'utf8')).toHaveLength(100_000 + 'CAUSE'.length + 1);
    } finally {
      fs.rmSync(root, { force: true, recursive: true });
    }
  });
});

describe('diagnostic clipping', () => {
  test('keeps the end of long text and strips control characters', () => {
    expect(clipDiagnostic(`${'a'.repeat(100)}END`, 10)).toBe('...aaaaaaaEND');
    expect(clipDiagnostic('x\u0000y\u001b[0m\u0007\nz')).toBe('xy[0m\nz');
  });
});
