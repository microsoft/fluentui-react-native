import { terminateProcessTree } from './process-supervisor.ts';

describe('owned process supervisor', () => {
  it('escalates a POSIX process group after the grace period', async () => {
    let alive = true;
    const signals: { pid: number; signal: NodeJS.Signals }[] = [];

    await terminateProcessTree({
      pid: 42,
      platform: 'darwin',
      processGroup: true,
      gracePeriodMs: 1,
      isAlive: () => alive,
      signal: (pid, signal) => {
        signals.push({ pid, signal });
        if (signal === 'SIGKILL') {
          alive = false;
        }
      },
    });

    expect(signals).toEqual([
      { pid: -42, signal: 'SIGTERM' },
      { pid: -42, signal: 'SIGKILL' },
    ]);
  });

  it('uses a PID-targeted Windows tree termination and force escalation', async () => {
    let alive = true;
    const invocations: string[][] = [];
    const execFile = ((_file: string, args: readonly string[], _options: unknown, callback: (error: Error | null) => void) => {
      invocations.push([...args]);
      if (args.includes('/F')) {
        alive = false;
      }
      callback(null);
      return undefined;
    }) as unknown as typeof import('node:child_process').execFile;

    await terminateProcessTree({
      pid: 84,
      platform: 'win32',
      gracePeriodMs: 1,
      isAlive: () => alive,
      execFile,
    });

    expect(invocations).toEqual([
      ['/PID', '84', '/T'],
      ['/PID', '84', '/T', '/F'],
    ]);
  });

  it('prefers a protocol-aware graceful shutdown', async () => {
    let alive = true;
    const gracefulShutdown = jest.fn(() => {
      alive = false;
    });

    await terminateProcessTree({ pid: 21, isAlive: () => alive, gracefulShutdown });
    expect(gracefulShutdown).toHaveBeenCalledTimes(1);
  });
});
