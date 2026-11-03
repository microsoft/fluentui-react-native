import { WebDriverError } from './errors.js';
import { attachFailureEffect, readFailureEffect } from './settlement.js';

/**
 * Aborts `operation` at the deadline and waits for it to settle before reporting a timeout, so callers never advance
 * their queues while native work may still be running. The timeout carries what the settled operation revealed: a
 * command that completed after the deadline had its effect applied, and a failure keeps the effect it reported.
 */
export async function withCommandTimeout<T>(
  operation: (signal: AbortSignal) => Promise<T>,
  timeoutMs: number,
  description: string,
): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const controller = new AbortController();
  let timeoutError: WebDriverError | undefined;
  const command = Promise.resolve().then(() => operation(controller.signal));
  try {
    try {
      return await Promise.race([
        command,
        new Promise<never>((_resolve, reject) => {
          timer = setTimeout(() => {
            timeoutError = new WebDriverError('timeout', `${description} exceeded ${timeoutMs}ms.`);
            controller.abort(timeoutError);
            reject(timeoutError);
          }, timeoutMs);
        }),
      ]);
    } catch (error) {
      if (timeoutError) {
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
        throw attachFailureEffect(timeoutError, completed ? 'applied' : readFailureEffect(failure));
      }
      throw error;
    }
  } finally {
    if (timer) {
      clearTimeout(timer);
    }
  }
}
