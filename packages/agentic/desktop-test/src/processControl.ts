import net from 'node:net';
import { randomUUID, timingSafeEqual } from 'node:crypto';
import { once } from 'node:events';
import { processLifelineUrl } from '../config/process-path.cjs';
import { createLocalSocketAddress } from './localSocket.js';

export type DesktopServiceReady = {
  tier: 'service-ready';
  service: string;
  descriptor?: string;
};
export type DesktopServiceReadyRecord = DesktopServiceReady & { incarnation: string; processId: number };
/** A Node HTTP listener that must receive the parent's readiness probe after binding its expected port. */
export type DesktopOwnedListener = { service: string; port: number };
type ChildControl = {
  register(dispose: () => Promise<void>): Promise<() => void>;
  ready(readiness: DesktopServiceReady): Promise<void>;
  finish(): void;
};
const controlKey = Symbol.for('furn.desktop.process-control');
export const DESKTOP_PROCESS_CONTROL = 'FURN_DESKTOP_PROCESS_CONTROL';

function childControl(): ChildControl | undefined {
  return (globalThis as typeof globalThis & { [controlKey]?: ChildControl })[controlKey];
}

/** Await registration before acquisition; disposal must await startup and durable settlement. */
export async function registerDesktopProcessDisposal(dispose: () => Promise<void>): Promise<() => void> {
  if (process.env[DESKTOP_PROCESS_CONTROL] && !childControl()) throw new Error('Owned process lifeline preload is missing.');
  return (await childControl()?.register(dispose)) ?? (() => undefined);
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
  const listenerProbe = randomUUID();
  const endpoint = createLocalSocketAddress('process', incarnation);
  const address = endpoint.address;
  const sockets = new Set<net.Socket>();
  const records = new Map<string, DesktopServiceReadyRecord>();
  const probes = new Map<string, DesktopServiceReadyRecord>();
  const listenerServices = new Set<string>();
  const changed = new Set<() => void>();
  let expectedListener: DesktopOwnedListener | undefined;
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
    let disposalRegistered = false;
    let socketError: Error | undefined;
    let socketErrorWasUnexpected = false;
    // 'close' always follows 'error'; defer so producer loss (e.g. ECONNRESET on SIGKILL) keeps its specific diagnosis.
    socket.on('error', (error) => {
      if (!socketError) {
        socketError = error;
        socketErrorWasUnexpected = !stopping;
      }
    });
    socket.on('close', () => {
      sockets.delete(socket);
      let producerLost = false;
      for (const [service, record] of records) {
        if (record.processId !== processId) continue;
        records.delete(service);
        const listener = listenerServices.delete(service);
        if (stopping && (disposed || (listener && !disposalRegistered))) continue;
        producerLost = true;
        fail(new Error(`Owned service "${service}" lost its readiness producer without settled disposal.`));
      }
      if (disposalRegistered && !disposed && !producerLost) {
        producerLost = true;
        fail(new Error(`Owned process "${processId}" lost its disposal producer without settled disposal.`));
      }
      for (const [service, record] of probes) if (record.processId === processId) probes.delete(service);
      if (socketError && socketErrorWasUnexpected && !producerLost) fail(socketError);
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
            if (frame.type === 'disposal-registered') {
              if (disposed || typeof frame.requestId !== 'string') throw new Error('Invalid owned process disposal registration.');
              disposalRegistered = true;
              socket.write(`${JSON.stringify({ type: 'acknowledged', requestId: frame.requestId })}\n`);
              continue;
            }
            if (frame.type === 'listener-closed') {
              const record = typeof frame.service === 'string' ? records.get(frame.service) : undefined;
              if (!record || record.processId !== processId || !listenerServices.has(record.service))
                throw new Error('Invalid owned listener closure.');
              records.delete(record.service);
              probes.delete(record.service);
              listenerServices.delete(record.service);
              if (!stopping) fail(new Error(`Owned service "${record.service}" closed its listener unexpectedly.`));
              for (const notify of changed) notify();
              continue;
            }
            if (stopping) throw new Error('A stopping command cannot publish readiness.');
            if (frame.type === 'listener-probe') {
              const record = typeof frame.service === 'string' ? records.get(frame.service) : undefined;
              if (
                !record ||
                record.processId !== processId ||
                !listenerServices.has(record.service) ||
                typeof frame.requestId !== 'string' ||
                probes.has(record.service)
              )
                throw new Error('Invalid owned listener probe.');
              probes.set(record.service, record);
              socket.write(`${JSON.stringify({ type: 'acknowledged', requestId: frame.requestId })}\n`);
              for (const notify of changed) notify();
              continue;
            }
            if ((frame.type !== 'ready' && frame.type !== 'listener-bound') || typeof frame.requestId !== 'string')
              throw new Error('Invalid service readiness frame.');
            validateReadiness(frame.readiness);
            if (records.has(frame.readiness.service)) throw new Error('Duplicate owned service readiness.');
            if (frame.type === 'listener-bound') {
              if (frame.readiness.service !== expectedListener?.service || frame.readiness.descriptor !== undefined)
                throw new Error('Invalid owned listener readiness.');
              listenerServices.add(frame.readiness.service);
            }
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
  async function waitForRecord(
    source: Map<string, DesktopServiceReadyRecord>,
    expected: DesktopServiceReady,
    timeoutMs = 120_000,
    signal?: AbortSignal,
  ): Promise<DesktopServiceReadyRecord> {
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
        const record = source.get(expected.service);
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
  }
  return {
    nonce,
    listenerProbe,
    environment(nodeOptions = '', listener?: DesktopOwnedListener) {
      if (listener !== undefined) {
        validateReadiness({ tier: 'service-ready', service: listener.service });
        if (!Number.isSafeInteger(listener.port) || listener.port < 1 || listener.port > 65535)
          throw new TypeError('An owned listener requires a valid TCP port.');
      }
      expectedListener = listener;
      return {
        [DESKTOP_PROCESS_CONTROL]: JSON.stringify({ schemaVersion: 1, address, nonce, incarnation }),
        FURN_DESKTOP_OWNED_LISTENER: listener ? JSON.stringify({ ...listener, probe: listenerProbe }) : '',
        NODE_OPTIONS: `${nodeOptions} --import=${processLifelineUrl}`.trim(),
      };
    },
    async waitForReadiness(expected: DesktopServiceReady, timeoutMs = 120_000, signal?: AbortSignal): Promise<DesktopServiceReadyRecord> {
      return waitForRecord(records, expected, timeoutMs, signal);
    },
    async waitForListenerProbe(service: string, timeoutMs = 120_000, signal?: AbortSignal): Promise<DesktopServiceReadyRecord> {
      return waitForRecord(probes, { tier: 'service-ready', service }, timeoutMs, signal);
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
        try {
          await listening;
          for (const socket of sockets) socket.destroy();
          await new Promise<void>((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
        } finally {
          endpoint.dispose();
        }
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
