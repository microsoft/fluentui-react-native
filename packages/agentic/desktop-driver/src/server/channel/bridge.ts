/**
 * Storybook-channel transport for desktop test runs.
 *
 * The application sees only versioned channel events. Run validation, concurrency, progress, and
 * cancellation are owned by the transport-free coordinator in the same process.
 */

import * as crypto from 'node:crypto';

import {
  decodeDesktopRunCancel,
  decodeDesktopRunRequest,
  DESKTOP_HOST_CLOSING_EVENT,
  DESKTOP_HOST_READY_EVENT,
  DESKTOP_PROTOCOL_VERSION,
  DESKTOP_RUN_CANCEL_EVENT,
  DESKTOP_RUN_REQUEST_EVENT,
  DESKTOP_RUN_STATUS_EVENT,
  type DesktopChannelRunStatus,
  type DesktopHostReady,
} from '../../protocol/index.ts';
import type { RunCoordinator } from '../coordinator.ts';
import type { DesktopServiceRunStatus, StoryTestManifest } from '../../types.ts';

export {
  DESKTOP_HOST_READY_EVENT,
  DESKTOP_RUN_CANCEL_EVENT,
  DESKTOP_RUN_REQUEST_EVENT,
  DESKTOP_RUN_STATUS_EVENT,
} from '../../protocol/index.ts';
export type { DesktopChannelRunCancel, DesktopChannelRunRequest, DesktopChannelRunStatus, DesktopHostReady } from '../../protocol/index.ts';

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
  coordinator: RunCoordinator;
  manifest: StoryTestManifest;
  announceIntervalMs?: number;
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
  const serviceId = options.serviceId ?? crypto.randomUUID();
  const socketListeners = new Map<ChannelSocketLike, (data: unknown) => void>();
  const sequences = new Map<string, number>();
  const requestByRun = new Map<string, string>();
  let stopped = false;

  const send = (type: string, payload: unknown, socket?: ChannelSocketLike): void => {
    if (stopped) {
      return;
    }
    const message = JSON.stringify({ type, args: [payload] });
    if (socket) {
      try {
        socket.send(message);
      } catch (error) {
        options.onError?.(error);
      }
      return;
    }
    for (const client of options.channel.clients) {
      try {
        client.send(message);
      } catch (error) {
        options.onError?.(error);
      }
    }
  };

  const ready = (): DesktopHostReady => ({
    protocolVersion: DESKTOP_PROTOCOL_VERSION,
    serviceId,
    manifest: {
      schemaVersion: options.manifest.version,
      digest: options.manifest.digest,
      tests: options.manifest.entries.map((entry) => ({
        storyId: entry.storyId,
        planId: entry.plan.id,
        kind: entry.plan.kind,
      })),
    },
    capabilities: {
      runModes: ['selected', 'all'],
      cancellation: true,
      maxConcurrentRuns: 1,
    },
  });

  const announceNow = (): void => send(DESKTOP_HOST_READY_EVENT, ready());

  const publishStatus = (requestId: string, status: DesktopServiceRunStatus): void => {
    const sequence = (sequences.get(requestId) ?? 0) + 1;
    sequences.set(requestId, sequence);
    send(DESKTOP_RUN_STATUS_EVENT, {
      protocolVersion: DESKTOP_PROTOCOL_VERSION,
      serviceId,
      requestId,
      sequence,
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

  const startRun = (payload: NonNullable<ReturnType<typeof decodeDesktopRunRequest>>): void => {
    const storyIds = payload.storyIds ?? [];
    try {
      if (payload.manifestDigest !== options.manifest.digest) {
        throw new Error('The Storybook app and desktop host have different story-test manifests; regenerate and reload the app');
      }
      const status = options.coordinator.start({
        protocolVersion: payload.protocolVersion,
        mode: payload.mode,
        storyIds: payload.mode === 'all' ? undefined : storyIds,
      });
      requestByRun.set(status.runId, payload.requestId);
      publishStatus(payload.requestId, status);
    } catch (error) {
      publishError(payload.requestId, storyIds, error);
    }
  };

  const onMessage = (data: unknown): void => {
    try {
      const message = JSON.parse(data instanceof Buffer ? data.toString('utf8') : String(data)) as { type?: string; args?: unknown[] };
      if (message.type === DESKTOP_RUN_REQUEST_EVENT) {
        const payload = decodeDesktopRunRequest(message.args?.[0]);
        if (payload?.serviceId === serviceId) {
          startRun(payload);
        } else {
          const candidate = message.args?.[0] as Record<string, unknown> | undefined;
          if (candidate?.serviceId === serviceId && typeof candidate.requestId === 'string') {
            publishError(
              candidate.requestId,
              Array.isArray(candidate.storyIds) ? candidate.storyIds.filter((entry): entry is string => typeof entry === 'string') : [],
              new Error('Invalid desktop test run request'),
            );
          }
        }
      } else if (message.type === DESKTOP_RUN_CANCEL_EVENT) {
        const payload = decodeDesktopRunCancel(message.args?.[0]);
        if (payload?.serviceId === serviceId) {
          options.coordinator.cancel(payload.runId);
        }
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
  const removeStatusListener = options.coordinator.onStatus((status) => {
    const requestId = requestByRun.get(status.runId);
    if (requestId) {
      publishStatus(requestId, status);
    }
  });

  const announceTimer = setInterval(announceNow, options.announceIntervalMs ?? 5000);
  announceTimer.unref();

  return {
    serviceId,
    announceNow,
    stop: () => {
      send(DESKTOP_HOST_CLOSING_EVENT, { protocolVersion: DESKTOP_PROTOCOL_VERSION, serviceId });
      stopped = true;
      clearInterval(announceTimer);
      removeStatusListener();
      options.channel.off('connection', attach);
      for (const [socket, listener] of socketListeners) {
        socket.off('message', listener);
      }
      socketListeners.clear();
      requestByRun.clear();
    },
  };
}
