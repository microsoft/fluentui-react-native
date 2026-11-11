import { getEventListeners } from 'node:events';

import { attachFailureEffect, readFailureEffect } from './settlement';
import { withCommandTimeout, withDeadline } from './timeouts';
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

  describe('caller cancellation', () => {
    test('aborts the operation, holds the session queue until it settles, and reports a cancellation', async () => {
      let resolveOperation!: () => void;
      let started!: () => void;
      let operationSignal: AbortSignal | undefined;
      let nextCommandStarted = false;
      const operation = new Promise<void>((resolve) => {
        resolveOperation = resolve;
      });
      const operationStarted = new Promise<void>((resolve) => {
        started = resolve;
      });
      const caller = new AbortController();
      const sessions = new SessionManager();
      const result = sessions.runCommand('session-id', () =>
        withCommandTimeout(
          (signal) => {
            operationSignal = signal;
            started();
            return operation;
          },
          60_000,
          'Native operation',
          { signal: caller.signal },
        ),
      );
      const outcome = result.then(
        () => undefined,
        (error: unknown) => error,
      );
      await operationStarted;

      caller.abort();

      expect(operationSignal?.aborted).toBe(true);
      const nextCommand = sessions.runCommand('session-id', async () => {
        nextCommandStarted = true;
      });
      await Promise.resolve();
      expect(nextCommandStarted).toBe(false);

      resolveOperation();
      const failure = await outcome;
      await nextCommand;

      expect(failure).toMatchObject({ code: 'unknown error', data: { reason: 'cancelled' }, message: 'Native operation was cancelled.' });
      expect(readFailureEffect(failure)).toBe('applied');
      expect(nextCommandStarted).toBe(true);
    });

    test('never starts an operation for a signal that is already aborted', async () => {
      const operation = jest.fn(async () => 'ran');
      const caller = new AbortController();
      caller.abort();

      const failure = await withCommandTimeout(operation, 1_000, 'Native operation', { signal: caller.signal }).catch(
        (error: unknown) => error,
      );

      expect(operation).not.toHaveBeenCalled();
      expect(failure).toMatchObject({ code: 'unknown error', data: { reason: 'cancelled' } });
      expect(readFailureEffect(failure)).toBe('none');
    });

    test('keeps the effect an aborted command reports', async () => {
      const caller = new AbortController();
      let started!: () => void;
      const operationStarted = new Promise<void>((resolve) => {
        started = resolve;
      });
      const outcome = withCommandTimeout(
        (signal) =>
          new Promise<void>((_resolve, reject) => {
            signal.addEventListener('abort', () => reject(attachFailureEffect(new Error('aborted'), 'partial')), { once: true });
            started();
          }),
        60_000,
        'Native operation',
        { signal: caller.signal },
      ).catch((error: unknown) => error);

      await operationStarted;
      caller.abort();
      const failure = await outcome;

      expect(failure).toMatchObject({ data: { reason: 'cancelled' } });
      expect(readFailureEffect(failure)).toBe('partial');
    });

    test('reports no effect when the caller leaves before the operation begins', async () => {
      const operation = jest.fn(async () => 'ran');
      const caller = new AbortController();
      const outcome = withCommandTimeout(operation, 60_000, 'Native operation', { signal: caller.signal }).catch((error: unknown) => error);

      caller.abort();
      const failure = await outcome;

      expect(operation).not.toHaveBeenCalled();
      expect(failure).toMatchObject({ data: { reason: 'cancelled' } });
      expect(readFailureEffect(failure)).toBe('none');
    });

    test('stops listening to the caller once the operation finishes', async () => {
      const caller = new AbortController();

      await expect(withCommandTimeout(async () => 'done', 1_000, 'Native operation', { signal: caller.signal })).resolves.toBe('done');

      expect(getEventListeners(caller.signal, 'abort')).toHaveLength(0);
    });
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

describe('withDeadline', () => {
  test('stops waiting for a call that never settles, and ignores its late failure', async () => {
    let rejectLate!: (error: Error) => void;
    const late = new Promise<never>((_resolve, reject) => {
      rejectLate = reject;
    });

    await expect(withDeadline(() => late, 10, 'Native storage')).rejects.toMatchObject({ code: 'timeout' });
    rejectLate(new Error('late'));
    await new Promise((resolve) => setTimeout(resolve, 0));
  });

  test('returns what the call returns, and rethrows a failure of its own', async () => {
    await expect(withDeadline(async () => 'done', 1000, 'Native storage')).resolves.toBe('done');
    await expect(
      withDeadline(
        () => {
          throw new Error('refused');
        },
        1000,
        'Native storage',
      ),
    ).rejects.toThrow('refused');
  });
});
