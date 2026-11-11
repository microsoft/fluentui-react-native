import { spawn, spawnSync } from 'node:child_process';
import type { SpawnSyncReturns } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { deadline, NodeDesktopCommandRunner } from './commands.js';
import type { PreparedDesktopCommand } from './commands.js';
import { DesktopRunReporter } from './reporting/collector.js';

jest.mock('node:child_process', () => {
  const actual = jest.requireActual<typeof import('node:child_process')>('node:child_process');
  return { ...actual, spawn: jest.fn(actual.spawn), spawnSync: jest.fn(actual.spawnSync) };
});

const quiet = { write: () => true };
jest.setTimeout(30_000);

describe('desktop command cancellation and failure', () => {
  let root: string;
  let reporter: DesktopRunReporter;
  let runner: NodeDesktopCommandRunner;
  beforeEach(() => {
    root = fs.mkdtempSync(path.join(os.tmpdir(), 'furn-desktop-commands-'));
    reporter = new DesktopRunReporter({ artifactsRoot: root, kind: 'lifecycle', output: quiet, errorOutput: quiet, summary: false });
    runner = new NodeDesktopCommandRunner({ reporter, shutdownTimeoutMs: 2000 });
  });
  afterEach(async () => {
    runner.terminate();
    await runner.close().catch(() => undefined);
    fs.rmSync(root, { force: true, recursive: true, maxRetries: 20, retryDelay: 100 });
  });

  // Fixture code is constant; the marker path reaches it through process.argv (R-SCAN-002).
  const node = (source: string, ...values: string[]): PreparedDesktopCommand => ({
    command: process.execPath,
    args: ['-e', source, ...values],
    cwd: root,
    env: {},
    label: 'fixture',
  });

  function events(): { kind: string; payload: Record<string, unknown> }[] {
    return fs
      .readFileSync(path.join(reporter.root, 'events.jsonl'), 'utf8')
      .trim()
      .split('\n')
      .map((line) => JSON.parse(line));
  }

  test('an aborted run stops its process group, including a grandchild, and reports the command failed', async () => {
    const marker = path.join(root, 'grandchild.pid');
    const controller = new AbortController();
    const started = Date.now();
    const run = runner.run(
      node(
        "const { spawn } = require('node:child_process');" +
          "const grandchild = spawn(process.execPath, ['-e', 'setInterval(() => {}, 1000)'], { stdio: 'ignore' });" +
          "require('node:fs').writeFileSync(process.argv[1], String(grandchild.pid));" +
          'setInterval(() => {}, 1000);',
        marker,
      ),
      { signal: controller.signal },
    );
    await waitUntil(() => fs.existsSync(marker) && fs.readFileSync(marker, 'utf8').length > 0);
    const grandchild = Number(fs.readFileSync(marker, 'utf8'));
    controller.abort(new Error('Stage cancelled'));
    await expect(run).rejects.toThrow('Stage cancelled');
    expect(Date.now() - started).toBeLessThan(10_000);
    await waitUntil(() => !alive(grandchild));
    await reporter.finish();
    expect(events().filter((event) => event.kind === 'scope-end')).toEqual([
      expect.objectContaining({ payload: expect.objectContaining({ status: 'failed', summary: 'Stopped before it finished.' }) }),
    ]);
  });

  test('an aborted signal refuses to spawn', async () => {
    const marker = path.join(root, 'spawned');
    const controller = new AbortController();
    controller.abort(new Error('Already cancelled'));
    const command = node("require('node:fs').writeFileSync(process.argv[1], 'spawned');", marker);
    expect(() => runner.start(command, { signal: controller.signal })).toThrow('Already cancelled');
    await expect(runner.run(command, { signal: controller.signal })).rejects.toThrow('Already cancelled');
    await new Promise((resolve) => setTimeout(resolve, 200));
    expect(fs.existsSync(marker)).toBe(false);
  });

  test('rejects NUL bytes before spawning anything', () => {
    expect(() => runner.start(node('', 'bad\0argument'))).toThrow('NUL');
    expect(() => runner.start({ ...node(''), env: { VALUE: 'bad\0value' } })).toThrow('NUL');
    expect(fs.existsSync(path.join(reporter.root, 'commands'))).toBe(false);
  });

  test('a command that never spawned stops without a cleanup failure', async () => {
    const running = runner.start({
      command: path.join(root, process.platform === 'win32' ? 'missing.exe' : 'missing'),
      args: [],
      cwd: root,
      env: {},
      category: 'phase',
    });
    await expect(running.completed).rejects.toMatchObject({ code: 'ENOENT' });
    await expect(running.stop({ failed: true })).resolves.toBeUndefined();
    const result = await reporter.finish();
    expect(result.failures.filter(({ kind }) => kind === 'cleanup')).toEqual([]);
  });

  test('output past the log limit is reported once and stops the command', async () => {
    const limited = new NodeDesktopCommandRunner({ reporter, shutdownTimeoutMs: 2000, maxLogBytes: 4096 });
    await expect(
      limited.run(node("const line = 'x'.repeat(99) + '\\n'; setInterval(() => process.stdout.write(line.repeat(50)), 5);")),
    ).rejects.toThrow('size limit');
    await limited.close();
    const result = await reporter.finish();
    expect(result.failures.filter(({ error }) => error.message.includes('size limit'))).toHaveLength(1);
  });

  test('terminate() force-stops a command that ignores a graceful stop', async () => {
    const marker = path.join(root, 'ready');
    const running = runner.start(
      node(
        "process.on('SIGTERM', () => {}); require('node:fs').writeFileSync(process.argv[1], 'ready'); setInterval(() => {}, 1000);",
        marker,
      ),
    );
    await waitUntil(() => fs.existsSync(marker));
    runner.terminate();
    await deadline(
      running.completed.catch(() => 1),
      5000,
      'Force-stopping the fixture',
    );
    await running.stop({ failed: true });
  });

  describe('on Windows', () => {
    // Emulated: the POSIX fixture starts normally, then stops through the Windows path against a mocked taskkill.
    let restorePlatform: (() => void) | undefined;
    const taskkill = jest.mocked(spawnSync);
    const taskkillCalls = () => taskkill.mock.calls.filter(([command]) => command === 'taskkill.exe');
    const emulateWindows = () => {
      const descriptor = Object.getOwnPropertyDescriptor(process, 'platform')!;
      Object.defineProperty(process, 'platform', { ...descriptor, value: 'win32' });
      restorePlatform = () => Object.defineProperty(process, 'platform', descriptor);
    };
    const respond = (status: number, stderr = ''): SpawnSyncReturns<string> =>
      ({ pid: 0, output: [], stdout: '', stderr, status, signal: null }) as SpawnSyncReturns<string>;
    const worker = (source: string, ...values: string[]) => runner.start({ ...node(source, ...values), category: 'worker' });
    const leader = async () => {
      const marker = path.join(root, 'leader.pid');
      const running = worker(
        "require('node:fs').writeFileSync(process.argv[1], String(process.pid)); setInterval(() => {}, 1000);",
        marker,
      );
      await waitUntil(() => fs.existsSync(marker) && fs.readFileSync(marker, 'utf8').length > 0);
      return { running, pid: Number(fs.readFileSync(marker, 'utf8')) };
    };
    afterEach(() => {
      restorePlatform?.();
      restorePlatform = undefined;
      taskkill.mockReset().mockImplementation(jest.requireActual<typeof import('node:child_process')>('node:child_process').spawnSync);
    });

    test('never addresses a process ID after the leader exit is recorded, even while a descendant holds its output open', async () => {
      const marker = path.join(root, 'pids.json');
      const running = worker(
        "const { spawn } = require('node:child_process');" +
          "const grandchild = spawn(process.execPath, ['-e', 'setInterval(() => {}, 1000)'], { stdio: 'inherit' });" +
          'grandchild.unref();' +
          "require('node:fs').writeFileSync(process.argv[1], JSON.stringify([process.pid, grandchild.pid]));",
        marker,
      );
      await waitUntil(() => fs.existsSync(marker) && fs.readFileSync(marker, 'utf8').length > 0);
      const [leaderPid, grandchildPid] = JSON.parse(fs.readFileSync(marker, 'utf8')) as [number, number];
      const child = jest.mocked(spawn).mock.results.at(-1)?.value;
      if (!child || child.pid !== leaderPid) throw new Error('The runner did not spawn the expected fixture leader.');
      try {
        // Once the leader is reaped, its exit is recorded while the grandchild still holds the output pipes open.
        await waitUntil(() => child.exitCode !== null || child.signalCode !== null);
        taskkill.mockImplementation((() => respond(0)) as unknown as typeof spawnSync);
        emulateWindows();
        runner.terminate();
        await running.stop({ failed: true }).catch(() => undefined);
        expect(taskkillCalls()).toEqual([]);
      } finally {
        restorePlatform?.();
        if (alive(grandchildPid)) {
          process.kill(grandchildPid, 'SIGKILL');
          await waitUntil(() => !alive(grandchildPid));
        }
      }
    });

    test('resolves the leader before this loop can record its exit, and trusts that record over a failed taskkill', async () => {
      const { running, pid } = await leader();
      emulateWindows();
      // The leader exits just before taskkill resolves it, so taskkill reports that it found nothing.
      taskkill.mockImplementation(((command: string) => {
        if (command !== 'taskkill.exe') throw new Error(`Unexpected synchronous spawn: ${command}`);
        if (alive(pid)) process.kill(pid, 'SIGKILL');
        return respond(128, 'ERROR: The process was not found.');
      }) as unknown as typeof spawnSync);
      runner.terminate();
      // Synchronous: the exit could not have been recorded, so the process ID was still bound to the owned leader.
      expect(taskkillCalls()).toEqual([
        ['taskkill.exe', ['/PID', String(pid), '/T', '/F'], expect.objectContaining({ windowsHide: true })],
      ]);
      await running.stop({ failed: true });
    });

    test('a failed taskkill for a leader that keeps running fails the stop with its diagnostic', async () => {
      const { running, pid } = await leader();
      emulateWindows();
      taskkill.mockImplementation((() => respond(1, 'ERROR: Access is denied.')) as unknown as typeof spawnSync);
      try {
        await expect(running.stop()).rejects.toThrow(`Could not stop owned process tree ${pid}: ERROR: Access is denied.`);
      } finally {
        restorePlatform?.();
        if (alive(pid)) {
          process.kill(process.platform === 'win32' ? pid : -pid, 'SIGKILL');
          await waitUntil(() => !alive(pid));
        }
      }
    });
  });
});

function alive(pid: number): boolean {
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ESRCH') return false;
    throw error;
  }
}

async function waitUntil(check: () => boolean): Promise<void> {
  await deadline(
    (async () => {
      while (!check()) await new Promise((resolve) => setTimeout(resolve, 20));
    })(),
    10_000,
    'Waiting for the fixture',
  );
}
