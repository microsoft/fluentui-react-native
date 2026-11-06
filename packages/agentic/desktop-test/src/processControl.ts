import net from 'node:net';
import os from 'node:os';
import path from 'node:path';
import { randomUUID, timingSafeEqual } from 'node:crypto';
import { once } from 'node:events';
import { processLifelineUrl } from '../config/process-path.cjs';

export type DesktopServiceReady = {
  tier: 'service-ready';
  service: string;
  descriptor?: string;
};
export type DesktopServiceReadyRecord = DesktopServiceReady & { incarnation: string; processId: number };
type ChildControl = {
  register(dispose: () => Promise<void>): () => void;
  ready(readiness: DesktopServiceReady): Promise<void>;
  finish(): void;
};
const controlKey = Symbol.for('furn.desktop.process-control');
export const DESKTOP_PROCESS_CONTROL = 'FURN_DESKTOP_PROCESS_CONTROL';

function childControl(): ChildControl | undefined {
  return (globalThis as typeof globalThis & { [controlKey]?: ChildControl })[controlKey];
}

/** Register before the first asynchronous acquisition; disposal must await startup and durable settlement. */
export function registerDesktopProcessDisposal(dispose: () => Promise<void>): () => void {
  if (process.env[DESKTOP_PROCESS_CONTROL] && !childControl()) throw new Error('Owned process lifeline preload is missing.');
  return childControl()?.register(dispose) ?? (() => undefined);
}

export async function publishDesktopServiceReady(readiness: DesktopServiceReady): Promise<void> {
  validateReadiness(readiness);
  if (process.env[DESKTOP_PROCESS_CONTROL] && !childControl()) throw new Error('Owned process lifeline preload is missing.');
  await childControl()?.ready(readiness);
}

export function finishDesktopProcess(): void {
  childControl()?.finish();
}

export function createDesktopProcessControl(onFailure: (error: Error) => void) {
  const incarnation = randomUUID();
  const nonce = randomUUID();
  const address =
    process.platform === 'win32' ? `\\\\.\\pipe\\furn-process-${incarnation}` : path.join(os.tmpdir(), `furn-process-${incarnation}.sock`);
  const sockets = new Set<net.Socket>();
  const records = new Map<string, DesktopServiceReadyRecord>();
  const changed = new Set<() => void>();
  let stopping = false;
  let terminal: Error | undefined;
  let closePromise: Promise<void> | undefined;
  const fail = (error: Error) => {
    terminal ??= error;
    for (const notify of changed) notify();
    onFailure(error);
  };
  const server = net.createServer((socket) => {
    sockets.add(socket);
    socket.setEncoding('utf8');
    let buffer = '';
    let processId: number | undefined;
    let disposed = false;
    socket.on('error', fail);
    socket.on('close', () => {
      sockets.delete(socket);
      for (const [service, record] of records) {
        if (record.processId !== processId) continue;
        records.delete(service);
        if (!disposed || !stopping) fail(new Error(`Owned service "${service}" lost its readiness producer without settled disposal.`));
      }
      for (const notify of changed) notify();
    });
    socket.on('data', (text: string) => {
      buffer += text;
      try {
        if (Buffer.byteLength(buffer) > 65536) throw new Error('Oversized owned process control frame.');
        let newline: number;
        while ((newline = buffer.indexOf('\n')) >= 0) {
          const frame: unknown = JSON.parse(buffer.slice(0, newline));
          buffer = buffer.slice(newline + 1);
          if (!isRecord(frame)) throw new TypeError('Invalid owned process control frame.');
          if (!processId) {
            if (
              frame.type !== 'hello' ||
              typeof frame.nonce !== 'string' ||
              !sameSecret(frame.nonce, nonce) ||
              typeof frame.processId !== 'number' ||
              !Number.isSafeInteger(frame.processId) ||
              frame.processId <= 0
            )
              throw new Error('Invalid owned process lifeline handshake.');
            processId = frame.processId;
            socket.write(`${JSON.stringify({ type: stopping ? 'stop' : 'accepted' })}\n`);
          } else {
            if (frame.type === 'disposed') {
              disposed = true;
              continue;
            }
            if (frame.type === 'disposal-failed') throw new Error(`Owned process disposal failed: ${String(frame.message)}`);
            if (stopping) throw new Error('A stopping command cannot publish readiness.');
            if (frame.type !== 'ready' || typeof frame.requestId !== 'string') throw new Error('Invalid service readiness frame.');
            validateReadiness(frame.readiness);
            if (records.has(frame.readiness.service)) throw new Error('Duplicate owned service readiness.');
            records.set(frame.readiness.service, { ...frame.readiness, incarnation, processId });
            socket.write(`${JSON.stringify({ type: 'acknowledged', requestId: frame.requestId })}\n`);
            for (const notify of changed) notify();
          }
        }
      } catch (error) {
        fail(error instanceof Error ? error : new Error(String(error)));
        socket.destroy();
      }
    });
  });
  server.on('error', fail);
  server.listen(address);
  const listening = once(server, 'listening').then(() => undefined);
  void listening.catch(() => undefined);
  return {
    nonce,
    environment(nodeOptions = '') {
      return {
        [DESKTOP_PROCESS_CONTROL]: JSON.stringify({ schemaVersion: 1, address, nonce, incarnation }),
        NODE_OPTIONS: `${nodeOptions} --import=${processLifelineUrl}`.trim(),
      };
    },
    async waitForReadiness(expected: DesktopServiceReady, timeoutMs = 120_000, signal?: AbortSignal): Promise<DesktopServiceReadyRecord> {
      validateReadiness(expected);
      if (!Number.isSafeInteger(timeoutMs) || timeoutMs <= 0) throw new TypeError('Invalid service readiness deadline.');
      await listening;
      return new Promise((resolve, reject) => {
        const cleanup = () => {
          clearTimeout(timer);
          changed.delete(check);
          signal?.removeEventListener('abort', check);
        };
        const check = () => {
          const record = records.get(expected.service);
          const error =
            terminal ??
            (signal?.aborted ? signal.reason : undefined) ??
            (stopping ? new Error('Owned command stopped before readiness.') : undefined);
          if (error !== undefined) {
            cleanup();
            reject(error);
          } else if (record) {
            cleanup();
            if (record.descriptor !== expected.descriptor) reject(new Error('Owned service published a different descriptor.'));
            else resolve(record);
          }
        };
        const timer = setTimeout(() => {
          cleanup();
          reject(new Error(`Owned service "${expected.service}" did not publish correlated readiness within ${timeoutMs}ms.`));
        }, timeoutMs);
        changed.add(check);
        signal?.addEventListener('abort', check, { once: true });
        check();
      });
    },
    stop() {
      stopping = true;
      for (const notify of changed) notify();
      for (const socket of sockets)
        if (!socket.destroyed && !socket.readableEnded && !socket.writableEnded) socket.write('{"type":"stop"}\n');
      return sockets.size;
    },
    async settled(timeoutMs: number) {
      await new Promise<void>((resolve, reject) => {
        const check = () => {
          if (terminal || !sockets.size) {
            clearTimeout(timer);
            changed.delete(check);
            if (terminal) reject(terminal);
            else resolve();
          }
        };
        const timer = setTimeout(() => {
          changed.delete(check);
          reject(new Error('Owned process disposal is incomplete; cooperative children did not settle.'));
        }, timeoutMs);
        changed.add(check);
        check();
      });
    },
    close() {
      return (closePromise ??= (async () => {
        stopping = true;
        for (const notify of changed) notify();
        await listening;
        for (const socket of sockets) socket.destroy();
        await new Promise<void>((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
      })());
    },
  };
}

function validateReadiness(value: unknown): asserts value is DesktopServiceReady {
  if (
    !isRecord(value) ||
    value.tier !== 'service-ready' ||
    typeof value.service !== 'string' ||
    !value.service ||
    (value.descriptor !== undefined && (typeof value.descriptor !== 'string' || !value.descriptor)) ||
    Object.keys(value).some((key) => !['tier', 'service', 'descriptor'].includes(key))
  )
    throw new TypeError('Invalid owned service readiness; application, target and context readiness require separate verification.');
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function sameSecret(actual: string, expected: string): boolean {
  const a = Buffer.from(actual);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}
