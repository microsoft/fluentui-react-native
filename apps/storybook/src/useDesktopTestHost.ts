/**
 * Desktop test control over the Storybook channel.
 *
 * The desktop host announces readiness and carries requests, cancellation, progress, and results
 * on the channel the app already uses. No test-service URL, token, or polling endpoint is exposed
 * to the application.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { addons } from 'storybook/preview-api';

const PROTOCOL_VERSION = 1;
const HOST_READY_EVENT = 'desktopTestHostReady';
const RUN_REQUEST_EVENT = 'desktopTestRunRequest';
const RUN_STATUS_EVENT = 'desktopTestRunStatus';
const RUN_CANCEL_EVENT = 'desktopTestRunCancel';

export type DesktopTestResult = {
  testId: string;
  storyId?: string;
  title: string;
  status: 'passed' | 'failed' | 'skipped' | 'infrastructureError';
  durationMs: number;
  error?: { message: string };
};

export type DesktopRunStatus = {
  runId: string;
  state: 'queued' | 'running' | 'passed' | 'failed' | 'cancelled' | 'error';
  results: readonly DesktopTestResult[];
  message?: string;
};

type HostReady = {
  protocolVersion: number;
  serviceId: string;
  manifestDigest: string;
};

type ChannelRunStatus = {
  protocolVersion: number;
  serviceId: string;
  requestId: string;
  status: DesktopRunStatus;
};

export type DesktopTestHost = {
  available: boolean;
  busy: boolean;
  error?: string;
  manifestDigest?: string;
  status?: DesktopRunStatus;
  start(mode: 'current' | 'all', currentStoryId?: string): void;
  cancel(): void;
};

function isHostReady(value: unknown): value is HostReady {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  return (
    candidate.protocolVersion === PROTOCOL_VERSION &&
    typeof candidate.serviceId === 'string' &&
    typeof candidate.manifestDigest === 'string'
  );
}

function isRunStatus(value: unknown): value is ChannelRunStatus {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  return (
    candidate.protocolVersion === PROTOCOL_VERSION &&
    typeof candidate.serviceId === 'string' &&
    typeof candidate.requestId === 'string' &&
    typeof candidate.status === 'object' &&
    candidate.status !== null
  );
}

const requestId = (): string => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;

/** Returns the channel-backed desktop host, or an unavailable service until one announces. */
export const useDesktopTestHost = (): DesktopTestHost => {
  const [host, setHost] = useState<HostReady | undefined>();
  const [status, setStatus] = useState<DesktopRunStatus | undefined>();
  const [error, setError] = useState<string | undefined>();
  const [busy, setBusy] = useState(false);
  const channelRef = useRef<ReturnType<typeof addons.getChannel> | undefined>(undefined);
  const activeRequest = useRef<string | undefined>(undefined);
  const hostRef = useRef<HostReady | undefined>(undefined);

  useEffect(() => {
    let channel: ReturnType<typeof addons.getChannel> | undefined;
    try {
      channel = addons.getChannel();
    } catch {
      return undefined;
    }
    channelRef.current = channel;

    let expiry: ReturnType<typeof setTimeout> | undefined;
    const onReady = (payload: unknown) => {
      if (!isHostReady(payload)) {
        return;
      }
      if (hostRef.current && hostRef.current.serviceId !== payload.serviceId) {
        activeRequest.current = undefined;
        setStatus(undefined);
        setError(undefined);
        setBusy(false);
      }
      hostRef.current = payload;
      setHost(payload);
      if (expiry) {
        clearTimeout(expiry);
      }
      expiry = setTimeout(() => {
        if (hostRef.current?.serviceId === payload.serviceId) {
          hostRef.current = undefined;
          activeRequest.current = undefined;
          setHost(undefined);
          setStatus(undefined);
          setError(undefined);
          setBusy(false);
        }
      }, 15_000);
    };
    const onStatus = (payload: unknown) => {
      if (!isRunStatus(payload) || payload.serviceId !== hostRef.current?.serviceId || payload.requestId !== activeRequest.current) {
        return;
      }
      setStatus(payload.status);
      if (payload.status.state !== 'running' && payload.status.state !== 'queued') {
        setBusy(false);
        if (payload.status.state === 'error') {
          setError(payload.status.message ?? 'Desktop test run failed');
        }
      }
    };

    channel.on(HOST_READY_EVENT, onReady);
    channel.on(RUN_STATUS_EVENT, onStatus);
    return () => {
      if (expiry) {
        clearTimeout(expiry);
      }
      channel?.off(HOST_READY_EVENT, onReady);
      channel?.off(RUN_STATUS_EVENT, onStatus);
      channelRef.current = undefined;
      hostRef.current = undefined;
    };
  }, []);

  const start = useCallback(
    (mode: 'current' | 'all', currentStoryId?: string): void => {
      const channel = channelRef.current;
      if (!channel || !host || (mode === 'current' && !currentStoryId)) {
        return;
      }
      const nextRequestId = requestId();
      activeRequest.current = nextRequestId;
      setError(undefined);
      setStatus(undefined);
      setBusy(true);
      channel.emit(RUN_REQUEST_EVENT, {
        protocolVersion: PROTOCOL_VERSION,
        serviceId: host.serviceId,
        requestId: nextRequestId,
        mode: mode === 'all' ? 'all' : 'selected',
        storyIds: mode === 'all' ? undefined : [currentStoryId],
      });
    },
    [host],
  );

  const cancel = useCallback((): void => {
    const channel = channelRef.current;
    if (!channel || !host || !status?.runId) {
      return;
    }
    channel.emit(RUN_CANCEL_EVENT, {
      protocolVersion: PROTOCOL_VERSION,
      serviceId: host.serviceId,
      runId: status.runId,
    });
  }, [host, status?.runId]);

  return {
    available: Boolean(host),
    busy,
    error,
    manifestDigest: host?.manifestDigest,
    status,
    start,
    cancel,
  };
};
