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
  DESKTOP_HOST_CLOSING_EVENT,
  DESKTOP_HOST_READY_EVENT,
  DESKTOP_RUN_CANCEL_EVENT,
  DESKTOP_RUN_REQUEST_EVENT,
  DESKTOP_RUN_STATUS_EVENT,
  type DesktopHostReady,
} from '@fluentui-react-native/desktop-driver/protocol';
import {
  createCancelRequest,
  createRunRequest,
  isHostClosing,
  resolveHostReady,
  resolveRunStatus,
  type DesktopRuntimeContract,
} from './desktopTestProtocol';

export type DesktopRunStatus = NonNullable<ReturnType<typeof resolveRunStatus>>['status'];

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
      const decision = resolveHostReady(payload, runtime);
      const ready = decision.ready;
      if (decision.error) {
        hostRef.current = undefined;
        activeRequest.current = undefined;
        activeSequence.current = 0;
        setError(decision.error);
        setHost(undefined);
        setStatus(undefined);
        setBusy(false);
        return;
      }
      if (!ready) {
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
      const next = resolveRunStatus(payload, {
        serviceId: hostRef.current?.serviceId,
        requestId: activeRequest.current,
        sequence: activeSequence.current,
      });
      if (!next) {
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
      if (!isHostClosing(payload, hostRef.current?.serviceId)) {
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
  }, [runtime]);

  const start = useCallback(
    (mode: 'current' | 'all', currentStoryId?: string): void => {
      const channel = channelRef.current;
      if (!channel || !host) {
        return;
      }
      const nextRequestId = requestId();
      const request = createRunRequest(runtime, host.serviceId, nextRequestId, mode, currentStoryId);
      if (!request) {
        return;
      }
      activeRequest.current = nextRequestId;
      activeSequence.current = 0;
      setError(undefined);
      setStatus(undefined);
      setBusy(true);
      channel.emit(DESKTOP_RUN_REQUEST_EVENT, request);
    },
    [host, runtime],
  );

  const cancel = useCallback((): void => {
    const channel = channelRef.current;
    if (!channel || !host || !status?.runId) {
      return;
    }
    channel.emit(DESKTOP_RUN_CANCEL_EVENT, createCancelRequest(host.serviceId, status.runId));
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
