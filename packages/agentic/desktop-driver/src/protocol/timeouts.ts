import { WebDriverError } from './errors.js';

export async function withCommandTimeout<T>(operation: () => Promise<T>, timeoutMs: number, description: string): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      operation(),
      new Promise<never>((_resolve, reject) => {
        timer = setTimeout(() => {
          reject(new WebDriverError('timeout', `${description} exceeded ${timeoutMs}ms.`));
        }, timeoutMs);
      }),
    ]);
  } finally {
    if (timer) {
      clearTimeout(timer);
    }
  }
}
