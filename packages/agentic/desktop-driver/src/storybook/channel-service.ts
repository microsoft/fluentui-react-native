/**
 * Storybook-channel transport for desktop test runs.
 *
 * The application sees only channel events. A hidden loopback run service remains an internal
 * implementation detail so its tested validation, cancellation, and concurrency behavior can be
 * reused without exposing another server or token to clients.
 */

import * as crypto from 'node:crypto';

import { DESKTOP_PROTOCOL_VERSION } from '../protocol.ts';
import type { DesktopServiceRunStatus } from '../types.ts';

export const DESKTOP_HOST_READY_EVENT = 'desktopTestHostReady';
export const DESKTOP_RUN_REQUEST_EVENT = 'desktopTestRunRequest';
export const DESKTOP_RUN_STATUS_EVENT = 'desktopTestRunStatus';
export const DESKTOP_RUN_CANCEL_EVENT = 'desktopTestRunCancel';

export interface DesktopHostReady {
  protocolVersion: number;
  serviceId: string;
  manifestDigest: string;
}

export interface DesktopChannelRunRequest {
  protocolVersion: number;
  serviceId: string;
  requestId: string;
  mode: 'current' | 'selected' | 'all';
  storyIds?: readonly string[];
}

export interface DesktopChannelRunStatus {
  protocolVersion: number;
  serviceId: string;
  requestId: string;
  status: DesktopServiceRunStatus;
}

export interface DesktopChannelRunCancel {
  protocolVersion: number;
  serviceId: string;
  runId: string;
}

export interface ChannelSocketLike {
  on(event: 'message', listener: (data: unknown) => void): unknown;
  off(event: 'message', listener: (data: unknown) => void): unknown;
  send(data: string): void;
}

export interface ChannelServerLike {
  clients: Iterable<ChannelSocketLike>;
  on(event: 'connection', listener: (socket: ChannelSocketLike) => void): unknown;
  off(event: 'connection', listener: (socket: ChannelSocketLike) => void): unknown;
}

export interface DesktopChannelBridgeOptions {
  channel: ChannelServerLike;
  serviceUrl: string;
  token: string;
  manifestDigest: string;
  fetchImpl?: typeof fetch;
  announceIntervalMs?: number;
  pollIntervalMs?: number;
  serviceId?: string;
  onError?: (error: unknown) => void;
}

export interface DesktopChannelBridgeHandle {
  serviceId: string;
  announceNow(): void;
  stop(): void;
}

/** Relays desktop run control and status entirely over the Storybook channel. */
export function startDesktopChannelBridge(options: DesktopChannelBridgeOptions): DesktopChannelBridgeHandle {
  const fetchImpl = options.fetchImpl ?? fetch;
  const serviceId = options.serviceId ?? crypto.randomUUID();
  const pollInterval = options.pollIntervalMs ?? 250;
  const socketListeners = new Map<ChannelSocketLike, (data: unknown) => void>();
  let stopped = false;

  const send = (type: string, payload: unknown, socket?: ChannelSocketLike): void => {
    if (stopped) {
      return;
    }
    const message = JSON.stringify({ type, args: [payload] });
    if (socket) {
      socket.send(message);
      return;
    }
    for (const client of options.channel.clients) {
      client.send(message);
    }
  };

  const ready = (): DesktopHostReady => ({
    protocolVersion: DESKTOP_PROTOCOL_VERSION,
    serviceId,
    manifestDigest: options.manifestDigest,
  });

  const announceNow = (): void => send(DESKTOP_HOST_READY_EVENT, ready());

  const request = async (pathname: string, init?: RequestInit): Promise<unknown> => {
    const response = await fetchImpl(`${options.serviceUrl}${pathname}`, {
      ...init,
      headers: {
        ...init?.headers,
        authorization: `Bearer ${options.token}`,
        'content-type': 'application/json',
      },
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error((body as { error?: string }).error ?? `Desktop run service returned ${response.status}`);
    }
    return body;
  };

  const publishStatus = (requestId: string, status: DesktopServiceRunStatus): void => {
    send(DESKTOP_RUN_STATUS_EVENT, {
      protocolVersion: DESKTOP_PROTOCOL_VERSION,
      serviceId,
      requestId,
      status,
    } satisfies DesktopChannelRunStatus);
  };

  const publishError = (requestId: string, storyIds: readonly string[], error: unknown): void => {
    publishStatus(requestId, {
      runId: requestId,
      protocolVersion: DESKTOP_PROTOCOL_VERSION,
      state: 'error',
      requestedStoryIds: storyIds,
      finishedAt: new Date().toISOString(),
      results: [],
      message: error instanceof Error ? error.message : String(error),
    });
  };

  const startRun = async (payload: DesktopChannelRunRequest): Promise<void> => {
    const storyIds = payload.storyIds ?? [];
    try {
      let status = (await request('/v1/runs', {
        method: 'POST',
        body: JSON.stringify({
          protocolVersion: payload.protocolVersion,
          mode: payload.mode,
          storyIds: payload.mode === 'all' ? undefined : storyIds,
        }),
      })) as DesktopServiceRunStatus;
      publishStatus(payload.requestId, status);
      while (!stopped && status.state === 'running') {
        await new Promise((resolve) => setTimeout(resolve, pollInterval));
        status = (await request(`/v1/runs/${encodeURIComponent(status.runId)}`)) as DesktopServiceRunStatus;
        publishStatus(payload.requestId, status);
      }
    } catch (error) {
      publishError(payload.requestId, storyIds, error);
    }
  };

  const cancelRun = async (payload: DesktopChannelRunCancel): Promise<void> => {
    try {
      await request(`/v1/runs/${encodeURIComponent(payload.runId)}/cancel`, { method: 'POST' });
    } catch (error) {
      options.onError?.(error);
    }
  };

  const onMessage = (data: unknown): void => {
    try {
      const message = JSON.parse(data instanceof Buffer ? data.toString('utf8') : String(data)) as { type?: string; args?: unknown[] };
      const payload = message.args?.[0] as Record<string, unknown> | undefined;
      if (!payload || payload.protocolVersion !== DESKTOP_PROTOCOL_VERSION || payload.serviceId !== serviceId) {
        return;
      }
      if (message.type === DESKTOP_RUN_REQUEST_EVENT && typeof payload.requestId === 'string') {
        void startRun(payload as unknown as DesktopChannelRunRequest);
      } else if (message.type === DESKTOP_RUN_CANCEL_EVENT && typeof payload.runId === 'string') {
        void cancelRun(payload as unknown as DesktopChannelRunCancel);
      }
    } catch (error) {
      options.onError?.(error);
    }
  };

  const attach = (socket: ChannelSocketLike): void => {
    const listener = (data: unknown): void => onMessage(data);
    socketListeners.set(socket, listener);
    socket.on('message', listener);
    send(DESKTOP_HOST_READY_EVENT, ready(), socket);
  };

  for (const socket of options.channel.clients) {
    attach(socket);
  }
  options.channel.on('connection', attach);

  const announceTimer = setInterval(announceNow, options.announceIntervalMs ?? 5000);
  announceTimer.unref();

  return {
    serviceId,
    announceNow,
    stop: () => {
      stopped = true;
      clearInterval(announceTimer);
      options.channel.off('connection', attach);
      for (const [socket, listener] of socketListeners) {
        socket.off('message', listener);
      }
      socketListeners.clear();
    },
  };
}
