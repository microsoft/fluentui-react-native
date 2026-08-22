/**
 * Desktop test control over the Storybook channel.
 *
 * The desktop host announces readiness and carries requests, cancellation, progress, and results
 * on the channel the app already uses. No test-service URL, token, or polling endpoint is exposed
 * to the application.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { addons } from 'storybook/preview-api';

import {
  decodeDesktopHostReady,
  decodeDesktopRunStatus,
  DESKTOP_HOST_CLOSING_EVENT,
  DESKTOP_HOST_READY_EVENT,
  DESKTOP_PROTOCOL_VERSION,
  DESKTOP_RUN_CANCEL_EVENT,
  DESKTOP_RUN_REQUEST_EVENT,
  DESKTOP_RUN_STATUS_EVENT,
  type DesktopChannelRunStatus,
  type DesktopHostReady,
} from '@fluentui-react-native/desktop-driver/protocol';

export type DesktopRunStatus = DesktopChannelRunStatus['status'];

export type DesktopTestHost = {
  available: boolean;
  busy: boolean;
  error?: string;
  manifestDigest?: string;
  testedStoryIds: readonly string[];
  status?: DesktopRunStatus;
  start(mode: 'current' | 'all', currentStoryId?: string): void;
  cancel(): void;
};

export type DesktopRuntimeContract = {
  protocolVersion: number;
  manifestDigest: string;
  testedStoryIds: readonly string[];
};

const requestId = (): string => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;

/** Returns the channel-backed desktop host, or an unavailable service until one announces. */
export const useDesktopTestHost = (runtime: DesktopRuntimeContract): DesktopTestHost => {
  const [host, setHost] = useState<DesktopHostReady | undefined>();
  const [status, setStatus] = useState<DesktopRunStatus | undefined>();
  const [error, setError] = useState<string | undefined>();
  const [busy, setBusy] = useState(false);
  const channelRef = useRef<ReturnType<typeof addons.getChannel> | undefined>(undefined);
  const activeRequest = useRef<string | undefined>(undefined);
  const activeSequence = useRef(0);
  const hostRef = useRef<DesktopHostReady | undefined>(undefined);

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
      const ready = decodeDesktopHostReady(payload);
      if (!ready) {
        return;
      }
      if (ready.protocolVersion !== runtime.protocolVersion || ready.manifest.digest !== runtime.manifestDigest) {
        setError('The Storybook app and desktop host use different generated desktop-test manifests');
        setHost(undefined);
        return;
      }
      if (hostRef.current && hostRef.current.serviceId !== ready.serviceId) {
        activeRequest.current = undefined;
        activeSequence.current = 0;
        setStatus(undefined);
        setError(undefined);
        setBusy(false);
      }
      hostRef.current = ready;
      setHost(ready);
      if (expiry) {
        clearTimeout(expiry);
      }
      expiry = setTimeout(() => {
        if (hostRef.current?.serviceId === ready.serviceId) {
          hostRef.current = undefined;
          activeRequest.current = undefined;
          activeSequence.current = 0;
          setHost(undefined);
          setStatus(undefined);
          setError(undefined);
          setBusy(false);
        }
      }, 15_000);
    };
    const onStatus = (payload: unknown) => {
      const next = decodeDesktopRunStatus(payload);
      if (
        !next ||
        next.serviceId !== hostRef.current?.serviceId ||
        next.requestId !== activeRequest.current ||
        next.sequence <= activeSequence.current
      ) {
        return;
      }
      activeSequence.current = next.sequence;
      setStatus(next.status);
      if (next.status.state !== 'running') {
        setBusy(false);
        if (next.status.state === 'error') {
          setError(next.status.message ?? 'Desktop test run failed');
        }
      }
    };
    const onClosing = (payload: unknown) => {
      const candidate = payload as { protocolVersion?: unknown; serviceId?: unknown } | undefined;
      if (candidate?.protocolVersion !== DESKTOP_PROTOCOL_VERSION || candidate.serviceId !== hostRef.current?.serviceId) {
        return;
      }
      hostRef.current = undefined;
      activeRequest.current = undefined;
      activeSequence.current = 0;
      setHost(undefined);
      setStatus(undefined);
      setError(undefined);
      setBusy(false);
    };

    channel.on(DESKTOP_HOST_READY_EVENT, onReady);
    channel.on(DESKTOP_HOST_CLOSING_EVENT, onClosing);
    channel.on(DESKTOP_RUN_STATUS_EVENT, onStatus);
    return () => {
      if (expiry) {
        clearTimeout(expiry);
      }
      channel?.off(DESKTOP_HOST_READY_EVENT, onReady);
      channel?.off(DESKTOP_HOST_CLOSING_EVENT, onClosing);
      channel?.off(DESKTOP_RUN_STATUS_EVENT, onStatus);
      channelRef.current = undefined;
      hostRef.current = undefined;
    };
  }, [runtime.manifestDigest, runtime.protocolVersion]);

  const start = useCallback(
    (mode: 'current' | 'all', currentStoryId?: string): void => {
      const channel = channelRef.current;
      const testedStoryIds = new Set(runtime.testedStoryIds);
      if (!channel || !host || (mode === 'current' && (!currentStoryId || !testedStoryIds.has(currentStoryId)))) {
        return;
      }
      const nextRequestId = requestId();
      activeRequest.current = nextRequestId;
      activeSequence.current = 0;
      setError(undefined);
      setStatus(undefined);
      setBusy(true);
      channel.emit(DESKTOP_RUN_REQUEST_EVENT, {
        protocolVersion: DESKTOP_PROTOCOL_VERSION,
        serviceId: host.serviceId,
        requestId: nextRequestId,
        manifestDigest: runtime.manifestDigest,
        mode: mode === 'all' ? 'all' : 'selected',
        storyIds: mode === 'all' ? undefined : [currentStoryId],
      });
    },
    [host, runtime.manifestDigest, runtime.testedStoryIds],
  );

  const cancel = useCallback((): void => {
    const channel = channelRef.current;
    if (!channel || !host || !status?.runId) {
      return;
    }
    channel.emit(DESKTOP_RUN_CANCEL_EVENT, {
      protocolVersion: DESKTOP_PROTOCOL_VERSION,
      serviceId: host.serviceId,
      runId: status.runId,
    });
  }, [host, status?.runId]);

  return {
    available: Boolean(host),
    busy,
    error,
    manifestDigest: host?.manifest.digest,
    testedStoryIds: host ? runtime.testedStoryIds : [],
    status,
    start,
    cancel,
  };
};
