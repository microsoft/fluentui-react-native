import { withCommandTimeout } from './timeouts';
import { SessionManager } from '../server/SessionManager';

describe('withCommandTimeout', () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  test('aborts at the deadline but holds the session queue until the operation settles', async () => {
    jest.useFakeTimers();
    let resolveOperation!: () => void;
    let operationSignal: AbortSignal | undefined;
    let nextCommandStarted = false;
    const operation = new Promise<void>((resolve) => {
      resolveOperation = resolve;
    });
    const sessions = new SessionManager();
    const result = sessions.runCommand('session-id', () =>
      withCommandTimeout(
        (signal) => {
          operationSignal = signal;
          return operation;
        },
        10,
        'Native operation',
      ),
    );

    await jest.advanceTimersByTimeAsync(10);

    expect(operationSignal?.aborted).toBe(true);
    let settled = false;
    void result.then(
      () => {
        settled = true;
      },
      () => {
        settled = true;
      },
    );
    await Promise.resolve();
    expect(settled).toBe(false);
    const nextCommand = sessions.runCommand('session-id', async () => {
      nextCommandStarted = true;
    });
    await Promise.resolve();
    expect(nextCommandStarted).toBe(false);

    resolveOperation();
    await expect(result).rejects.toMatchObject({ code: 'timeout', message: 'Native operation exceeded 10ms.' });
    await nextCommand;
    expect(settled).toBe(true);
    expect(nextCommandStarted).toBe(true);
  });
});
