import { attachFailureEffect, readFailureEffect } from './settlement';
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

  describe('timeout effect', () => {
    /** Runs an operation that settles only after the deadline aborts it, and returns the timeout it produced. */
    async function timeoutAfterAbort(settle: (resolve: () => void, reject: (reason: unknown) => void) => void): Promise<unknown> {
      jest.useFakeTimers();
      const outcome = withCommandTimeout(
        (signal) =>
          new Promise<void>((resolve, reject) => {
            signal.addEventListener('abort', () => settle(resolve, reject), { once: true });
          }),
        10,
        'Native operation',
      ).then(
        () => {
          throw new Error('Expected the command to time out.');
        },
        (error: unknown) => error,
      );
      await jest.advanceTimersByTimeAsync(10);
      return outcome;
    }

    test('marks a command that completes after the deadline as applied', async () => {
      const failure = await timeoutAfterAbort((resolve) => resolve());

      expect(failure).toMatchObject({ code: 'timeout' });
      expect(readFailureEffect(failure)).toBe('applied');
    });

    test.each(['none', 'partial', 'unknown'] as const)('keeps the %p effect an aborted command reports', async (effect) => {
      const failure = await timeoutAfterAbort((_resolve, reject) => reject(attachFailureEffect(new Error('aborted'), effect)));

      expect(failure).toMatchObject({ code: 'timeout' });
      expect(readFailureEffect(failure)).toBe(effect);
    });

    test('leaves the timeout unannotated when an aborted command reports nothing', async () => {
      const failure = await timeoutAfterAbort((_resolve, reject) => reject(new Error('aborted')));

      expect(failure).toMatchObject({ code: 'timeout' });
      expect(readFailureEffect(failure)).toBeUndefined();
    });
  });
});
