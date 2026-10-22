import net from 'node:net';
import os from 'node:os';
import path from 'node:path';
import { randomUUID, timingSafeEqual } from 'node:crypto';
import { once } from 'node:events';

import { createEventEmitter, DesktopReportedError, validateDesktopEvent } from './protocol.js';
import type { DesktopEvent, EventEmitter } from './protocol.js';
import type { DesktopRunReporter } from './collector.js';

export const DESKTOP_REPORT_CONTEXT = 'FURN_DESKTOP_REPORT_CONTEXT';
export const DESKTOP_REPORT_SCOPE = 'FURN_DESKTOP_REPORT_SCOPE';
export type ReportTransportContext = { schemaVersion: 1; address: string; nonce: string; runId: string; artifactsRoot: string };
export type ReportTransport = { environment: Record<string, string>; close(): Promise<void> };
const maxFrame = 1024 * 1024;

/** A dedicated local IPC channel, also usable by WDIO grandchildren without mixing JSON into stdout. */
export async function startReportTransport(reporter: DesktopRunReporter, onFatal?: (error: Error) => void): Promise<ReportTransport> {
  const nonce = randomUUID();
  reporter.addSecret(nonce);
  const address =
    process.platform === 'win32'
      ? `\\\\.\\pipe\\furn-desktop-${reporter.runId}`
      : path.join(os.tmpdir(), `furn-desktop-${reporter.runId}.sock`);
  const context: ReportTransportContext = { schemaVersion: 1, address, nonce, runId: reporter.runId, artifactsRoot: reporter.root };
  const sockets = new Set<net.Socket>();
  const controls = new Map<net.Socket, string>();
  let closing = false;
  const server = net.createServer((socket) => {
    sockets.add(socket);
    socket.setEncoding('utf8');
    let buffered = '';
    let sourceId: string | undefined;
    let finished = false;
    let reported = false;
    const fail = (error: Error) => {
      if (!reported) {
        reported = true;
        reporter.fail(error, 'reporting', sourceId ?? 'transport');
        onFatal?.(error);
      }
      socket.destroy();
    };
    socket.on('data', (chunk: string) => {
      buffered += chunk;
      if (Buffer.byteLength(buffered) > maxFrame) {
        fail(new Error('Desktop reporting IPC frame exceeded 1 MiB.'));
        return;
      }
      let newline: number;
      while ((newline = buffered.indexOf('\n')) >= 0) {
        const line = buffered.slice(0, newline);
        buffered = buffered.slice(newline + 1);
        try {
          const frame: unknown = JSON.parse(line);
          if (!sourceId) {
            if (isContext(frame) && 'type' in frame && frame.type === 'assert') {
              if (frame.runId !== context.runId || !sameSecret(frame.nonce, nonce)) throw new Error('Invalid desktop result request.');
              if (
                !('workIds' in frame) ||
                !Array.isArray(frame.workIds) ||
                !frame.workIds.every((id: unknown) => typeof id === 'string') ||
                !('optional' in frame) ||
                typeof frame.optional !== 'boolean'
              )
                throw new Error('Invalid selected-work result request.');
              try {
                reporter.assertSuccessful(frame.workIds, frame.optional);
                socket.end('{"passed":true}\n');
              } catch (error) {
                socket.end(JSON.stringify({ failure: reporter.failure(error) }) + '\n');
              }
              return;
            }
            if (isContext(frame) && 'type' in frame && frame.type === 'stop' && 'scopeId' in frame && typeof frame.scopeId === 'string') {
              if (frame.runId !== context.runId || !sameSecret(frame.nonce, nonce)) throw new Error('Invalid desktop stop request.');
              if (
                !('timeoutMs' in frame) ||
                typeof frame.timeoutMs !== 'number' ||
                !Number.isSafeInteger(frame.timeoutMs) ||
                frame.timeoutMs <= 0 ||
                frame.timeoutMs > 120_000
              )
                throw new Error('Invalid desktop stop deadline.');
              const children = [...controls].filter(([child, owner]) => owner === frame.scopeId && !child.destroyed);
              const terminal = children.map(([child]) => new Promise<void>((resolve) => child.once('close', resolve)));
              const timer = setTimeout(() => {
                if (!socket.destroyed && !socket.writableEnded)
                  socket.end(
                    JSON.stringify({
                      failure: reporter.failure(new Error('Owned reporting producers did not finish their shutdown handshake.'), 'cleanup'),
                    }) + '\n',
                  );
              }, frame.timeoutMs);
              socket.once('close', () => clearTimeout(timer));
              void Promise.all(terminal).then(() => {
                clearTimeout(timer);
                if (!socket.destroyed && !socket.writableEnded) socket.end(JSON.stringify({ controlled: children.length }) + '\n');
              });
              for (const [child] of children) child.write('{"stop":true}\n');
              return;
            }
            if (!isHello(frame) || frame.runId !== context.runId || !sameSecret(frame.nonce, nonce))
              throw new Error('Invalid desktop reporting IPC handshake.');
            sourceId = frame.sourceId;
            if (frame.canStop === true && typeof frame.ownerScopeId === 'string') controls.set(socket, frame.ownerScopeId);
            reporter.source(sourceId);
            socket.write('{"ready":true}\n');
          } else {
            validateDesktopEvent(frame);
            if (frame.sourceId !== sourceId && !frame.sourceId.startsWith(`${sourceId}/`))
              throw new Error('Reporting source changed after its handshake.');
            reporter.accept(frame);
            if (frame.sourceId === sourceId) finished = frame.kind === 'producer-finished';
            socket.write(JSON.stringify({ acknowledged: frame.eventId }) + '\n');
            if (frame.kind === 'service-failed') onFatal?.(new DesktopReportedError(frame.payload.failure));
          }
        } catch (error) {
          fail(error instanceof Error ? error : new Error(String(error)));
          return;
        }
      }
    });
    socket.on('error', fail);
    socket.on('close', () => {
      sockets.delete(socket);
      controls.delete(socket);
      if (sourceId && !finished && !reported) {
        const error = new Error(`Reporting producer ${sourceId} disconnected without its terminal result/flush handshake.`);
        reporter.fail(error, 'reporting', sourceId);
        if (!closing) onFatal?.(error);
      }
    });
  });
  server.listen(address);
  await once(server, 'listening');
  return {
    environment: { [DESKTOP_REPORT_CONTEXT]: JSON.stringify(context) },
    async close() {
      closing = true;
      const closed = new Promise<void>((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
      const timer = setTimeout(() => {
        for (const socket of sockets) socket.destroy();
      }, 5000);
      try {
        await closed;
      } finally {
        clearTimeout(timer);
      }
    },
  };
}

export type ReportProducer = {
  emit: EventEmitter;
  source(id: string): EventEmitter;
  flush(): Promise<void>;
  finish(status?: 'passed' | 'failed'): Promise<void>;
};

export async function connectReportProducer(
  sourceId: string,
  encoded = process.env[DESKTOP_REPORT_CONTEXT],
  onStop?: () => void | Promise<void>,
): Promise<ReportProducer> {
  if (!encoded) throw new Error('No inherited desktop reporting context.');
  const context: unknown = JSON.parse(encoded);
  if (!isContext(context)) throw new TypeError('Invalid inherited desktop reporting context.');
  const socket = net.createConnection(context.address);
  socket.setEncoding('utf8');
  const acknowledgements = new Map<string, { resolve(): void; reject(error: Error): void; timer: ReturnType<typeof setTimeout> }>();
  let buffer = '';
  let readyResolve: () => void;
  let readyReject: (error: Error) => void;
  const ready = new Promise<void>((resolve, reject) => {
    readyResolve = resolve;
    readyReject = reject;
  });
  const readyTimer = setTimeout(() => fail(new Error('Reporting IPC handshake timed out.')), 5000);
  let transportError: Error | undefined;
  let pending = Promise.resolve();
  let queuedBytes = 0;
  let ended = false;
  function fail(error: Error) {
    transportError ??= error;
    clearTimeout(readyTimer);
    readyReject(error);
    for (const item of acknowledgements.values()) {
      clearTimeout(item.timer);
      item.reject(error);
    }
    acknowledgements.clear();
    socket.destroy();
  }
  socket.on('error', fail);
  socket.on('close', () => {
    if (!ended || acknowledgements.size) fail(new Error('Reporting IPC closed before its flush completed.'));
  });
  socket.on('data', (chunk: string) => {
    buffer += chunk;
    if (Buffer.byteLength(buffer) > maxFrame) {
      fail(new Error('Invalid oversized reporting acknowledgement.'));
      return;
    }
    let newline: number;
    while ((newline = buffer.indexOf('\n')) >= 0) {
      const line = buffer.slice(0, newline);
      buffer = buffer.slice(newline + 1);
      try {
        const reply: unknown = JSON.parse(line);
        if (isRecord(reply) && reply.stop === true && onStop) {
          void Promise.resolve()
            .then(onStop)
            .catch((error: unknown) => fail(error instanceof Error ? error : new Error(String(error))));
        } else if (isRecord(reply) && reply.ready === true) {
          clearTimeout(readyTimer);
          readyResolve();
        } else if (isRecord(reply) && typeof reply.acknowledged === 'string') {
          const item = acknowledgements.get(reply.acknowledged);
          if (!item) throw new Error('Unexpected reporting acknowledgement.');
          clearTimeout(item.timer);
          acknowledgements.delete(reply.acknowledged);
          item.resolve();
        } else throw new Error('Invalid reporting acknowledgement.');
      } catch (error) {
        fail(error instanceof Error ? error : new Error(String(error)));
      }
    }
  });
  socket.on('connect', () =>
    socket.write(
      JSON.stringify({ ...context, sourceId, type: 'hello', canStop: !!onStop, ownerScopeId: process.env[DESKTOP_REPORT_SCOPE] }) + '\n',
    ),
  );
  await ready;
  const send = (event: DesktopEvent) => {
    if (ended) throw new Error('Reporting producer has already finished.');
    const line = JSON.stringify(event) + '\n';
    const bytes = Buffer.byteLength(line);
    if (bytes > maxFrame || queuedBytes + bytes > 4 * maxFrame) throw new Error('Reporting producer exceeded its bounded transport queue.');
    queuedBytes += bytes;
    pending = pending
      .then(async () => {
        if (transportError) throw transportError;
        await new Promise<void>((resolve, reject) => {
          const timer = setTimeout(() => fail(new Error('Timed out awaiting a persisted reporting acknowledgement.')), 5000);
          acknowledgements.set(event.eventId, { resolve, reject, timer });
          socket.write(line);
        });
      })
      .finally(() => {
        queuedBytes -= bytes;
      });
    // The owner observes the rejection through flush()/finish(); prevent an unhandled rejection between synchronous hooks.
    void pending.catch((error: unknown) => {
      transportError ??= error instanceof Error ? error : new Error(String(error));
    });
  };
  const emit = createEventEmitter(context.runId, sourceId, send);
  const sources = new Set<string>();
  return {
    emit,
    source(id) {
      if (!id || sources.has(id)) throw new Error(`Duplicate or empty delegated reporting source ${id}.`);
      sources.add(id);
      return createEventEmitter(context.runId, `${sourceId}/${id}`, send);
    },
    async flush() {
      await pending;
      if (transportError) throw transportError;
    },
    async finish(status = 'passed') {
      if (ended) {
        await pending;
        return;
      }
      emit({ kind: 'producer-finished', payload: { status } });
      ended = true;
      try {
        await pending;
      } finally {
        socket.end();
      }
    },
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}
function isContext(value: unknown): value is ReportTransportContext {
  return (
    isRecord(value) &&
    value.schemaVersion === 1 &&
    typeof value.address === 'string' &&
    typeof value.nonce === 'string' &&
    typeof value.runId === 'string' &&
    typeof value.artifactsRoot === 'string'
  );
}
function isHello(value: unknown): value is ReportTransportContext & { sourceId: string; canStop?: boolean; ownerScopeId?: string } {
  return isContext(value) && 'sourceId' in value && typeof value.sourceId === 'string' && value.sourceId.length > 0;
}

export async function requestReportStop(scopeId: string, encoded?: string, timeoutMs = 10_000): Promise<number> {
  if (!encoded) return 0;
  const value = await requestReportControl({ type: 'stop', scopeId, timeoutMs }, encoded, timeoutMs + 1000);
  if (isRecord(value) && value.failure) throw new DesktopReportedError(value.failure);
  if (!isRecord(value) || typeof value.controlled !== 'number' || !Number.isSafeInteger(value.controlled) || value.controlled < 0)
    throw new Error('Invalid desktop stop acknowledgement.');
  return value.controlled;
}

export async function assertReportedWork(workIds: readonly string[], optional: boolean, encoded: string): Promise<void> {
  const value = await requestReportControl({ type: 'assert', workIds, optional }, encoded);
  if (isRecord(value) && value.passed === true) return;
  if (isRecord(value) && value.failure) throw new DesktopReportedError(value.failure);
  throw new Error('Invalid desktop selected-work result.');
}

async function requestReportControl(request: object, encoded: string, timeoutMs = 5000): Promise<unknown> {
  const context: unknown = JSON.parse(encoded);
  if (!isContext(context)) throw new TypeError('Invalid desktop reporting control context.');
  const socket = net.createConnection(context.address);
  socket.setEncoding('utf8');
  try {
    return await new Promise<unknown>((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('Desktop reporting control request timed out.')), timeoutMs);
      let buffer = '';
      const settle = (error?: Error, result?: unknown) => {
        clearTimeout(timer);
        if (error) reject(error);
        else resolve(result);
      };
      socket.once('error', (error) => settle(error));
      socket.once('end', () => {
        if (!buffer.includes('\n')) settle(new Error('Desktop control acknowledgement was not delivered.'));
      });
      socket.on('connect', () => socket.write(JSON.stringify({ ...context, ...request }) + '\n'));
      socket.on('data', (chunk: string) => {
        buffer += chunk;
        if (Buffer.byteLength(buffer) > maxFrame) {
          settle(new Error('Invalid oversized desktop control acknowledgement.'));
          return;
        }
        if (!buffer.includes('\n')) return;
        try {
          const value: unknown = JSON.parse(buffer.slice(0, buffer.indexOf('\n')));
          settle(undefined, value);
        } catch (error) {
          settle(error instanceof Error ? error : new Error(String(error)));
        }
      });
    });
  } finally {
    socket.destroy();
  }
}
function sameSecret(actual: string, expected: string): boolean {
  const a = Buffer.from(actual);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}
