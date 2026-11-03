import { WebDriverError } from './errors.js';

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
        await command.then(
          () => undefined,
          () => undefined,
        );
        throw timeoutError;
      }
      throw error;
    }
  } finally {
    if (timer) {
      clearTimeout(timer);
    }
  }
}
