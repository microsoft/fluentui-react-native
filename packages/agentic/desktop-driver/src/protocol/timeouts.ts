import { WebDriverError } from './errors.js';
import { attachFailureEffect, readFailureEffect } from './settlement.js';

export type CommandTimeoutOptions = {
  /** Ends the command when the caller no longer needs it, such as a disconnected client. */
  signal?: AbortSignal;
};

function cancelledError(description: string): WebDriverError {
  return new WebDriverError('unknown error', `${description} was cancelled.`, { reason: 'cancelled' });
}

/**
 * Aborts `operation` at the deadline, or when `options.signal` aborts, and waits for it to settle before reporting the
 * failure, so callers never advance their queues while native work may still be running. The failure carries what the
 * settled operation revealed: a command that completed after the abort had its effect applied, and a failure keeps the
 * effect it reported. A signal that is already aborted never starts the operation.
 */
export async function withCommandTimeout<T>(
  operation: (signal: AbortSignal) => Promise<T>,
  timeoutMs: number,
  description: string,
  options: CommandTimeoutOptions = {},
): Promise<T> {
  const parent = options.signal;
  if (parent?.aborted) {
    throw attachFailureEffect(cancelledError(description), 'none');
  }
  let timer: ReturnType<typeof setTimeout> | undefined;
  let onParentAbort: (() => void) | undefined;
  const controller = new AbortController();
  let stopError: WebDriverError | undefined;
  const command = Promise.resolve().then(() => {
    if (controller.signal.aborted) {
      // Stopped before it began, so nothing was dispatched.
      throw attachFailureEffect(new Error(`${description} was stopped before it started.`), 'none');
    }
    return operation(controller.signal);
  });
  try {
    try {
      return await Promise.race([
        command,
        new Promise<never>((_resolve, reject) => {
          const stop = (error: WebDriverError) => {
            stopError ??= error;
            controller.abort(error);
            reject(error);
          };
          timer = setTimeout(() => stop(new WebDriverError('timeout', `${description} exceeded ${timeoutMs}ms.`)), timeoutMs);
          if (parent) {
            onParentAbort = () => stop(cancelledError(description));
            parent.addEventListener('abort', onParentAbort, { once: true });
          }
        }),
      ]);
    } catch (error) {
      if (stopError) {
        let completed = false;
        let failure: unknown;
        await command.then(
          () => {
            completed = true;
          },
          (reason: unknown) => {
            failure = reason;
          },
        );
        throw attachFailureEffect(stopError, completed ? 'applied' : readFailureEffect(failure));
      }
      throw error;
    }
  } finally {
    if (timer) {
      clearTimeout(timer);
    }
    if (parent && onParentAbort) {
      parent.removeEventListener('abort', onParentAbort);
    }
  }
}
