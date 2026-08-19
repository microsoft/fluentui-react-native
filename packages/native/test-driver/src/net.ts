/**
 * Loopback networking helpers shared by the driver host, the CLI, and the test service.
 */

import * as net from 'node:net';

import { DesktopDriverError } from './errors.ts';

/** Reserves a free loopback port by binding and immediately releasing it. */
export async function allocatePort(host = '127.0.0.1'): Promise<number> {
  return new Promise<number>((resolve, reject) => {
    const server = net.createServer();
    server.unref();
    server.on('error', reject);
    server.listen({ host, port: 0 }, () => {
      const address = server.address();
      if (typeof address === 'string' || address === null) {
        server.close(() => reject(new DesktopDriverError('Failed to allocate a loopback port', { kind: 'driverHost' })));
        return;
      }
      const { port } = address;
      server.close(() => resolve(port));
    });
  });
}

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export interface WaitForHttpOptions {
  timeout: number;
  intervalMs?: number;
  signal?: AbortSignal;
  /** Returns true when the response body means "ready". */
  accept?: (body: unknown, response: Response) => boolean;
}

/** Polls an HTTP endpoint until it answers acceptably or the budget expires. */
export async function waitForHttp(url: string, options: WaitForHttpOptions): Promise<unknown> {
  const interval = options.intervalMs ?? 200;
  const deadline = Date.now() + options.timeout;
  let lastError: unknown;

  while (Date.now() < deadline) {
    if (options.signal?.aborted) {
      throw new DesktopDriverError(`Aborted while waiting for ${url}`, { kind: 'cancelled' });
    }
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(Math.min(5000, options.timeout)) });
      const body = await response.json().catch(() => undefined);
      if (response.ok && (options.accept ? options.accept(body, response) : true)) {
        return body;
      }
      lastError = new Error(`${url} responded with ${response.status}`);
    } catch (error) {
      lastError = error;
    }
    await delay(interval);
  }

  throw new DesktopDriverError(`Timed out after ${options.timeout}ms waiting for ${url}`, {
    kind: 'driverHost',
    cause: lastError,
    detail: { url, timeout: options.timeout },
  });
}
