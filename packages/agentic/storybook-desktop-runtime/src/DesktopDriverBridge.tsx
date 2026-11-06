import * as React from 'react';
import { addons } from 'storybook/preview-api';
import { CHANNEL_WS_DISCONNECT } from 'storybook/internal/core-events';

import { useDesktopStorybookConfig } from './DesktopStorybookConfig';

export const desktopPrepareStoryEvent = 'furn:desktop:prepare-story';
export const desktopRequestHelloEvent = 'furn:desktop:request-hello';
export const desktopRuntimeHelloEvent = 'furn:desktop:hello';
export const desktopStoryErrorEvent = 'furn:desktop:story-error';
export const desktopStoryReadyEvent = 'furn:desktop:story-ready';

type PrepareStoryPayload = {
  connectionEpoch: string;
  requestId: string;
  runId: string;
  selectionSequence: number;
  storyId: string;
};

export function DesktopDriverBridge(): null {
  const { cancelStory, connectBridge, prepareStory, runtimeInstance } = useDesktopStorybookConfig();

  React.useEffect(() => {
    if (
      !runtimeInstance?.bridgeNonce ||
      !runtimeInstance.endpoint ||
      !runtimeInstance.instanceId ||
      !runtimeInstance.platformManifestDigest ||
      !runtimeInstance.targetId
    ) {
      return undefined;
    }
    const channel = addons.getChannel();
    let epoch: string | undefined;
    const emitHello = (challenge: unknown) => {
      if (!challenge || typeof challenge !== 'object') return;
      const fields = challenge as Record<string, unknown>;
      if (fields.version !== 2 || typeof fields.connectionEpoch !== 'string' || fields.connectionEpoch.length === 0) return;
      epoch = fields.connectionEpoch;
      connectBridge(epoch);
      channel.emit(desktopRuntimeHelloEvent, {
        connectionEpoch: epoch,
        endpoint: runtimeInstance.endpoint,
        instanceId: runtimeInstance.instanceId,
        nonce: runtimeInstance.bridgeNonce,
        platformManifestDigest: runtimeInstance.platformManifestDigest,
        targetId: runtimeInstance.targetId,
        version: 2,
      });
    };
    const onPrepare = (payload: PrepareStoryPayload) => {
      if (isPrepareStoryPayload(payload) && payload.connectionEpoch === epoch) {
        prepareStory(payload);
      }
    };
    const onCancel = (payload: unknown) => {
      if (!payload || typeof payload !== 'object') return;
      const fields = payload as Record<string, unknown>;
      if (fields.connectionEpoch === epoch && typeof fields.requestId === 'string') cancelStory(fields.requestId);
    };
    const onDisconnect = () => {
      epoch = undefined;
      cancelStory();
    };

    channel.on(desktopPrepareStoryEvent, onPrepare);
    channel.on('furn:desktop:cancel-story', onCancel);
    channel.on(CHANNEL_WS_DISCONNECT, onDisconnect);
    channel.on(desktopRequestHelloEvent, emitHello);
    // The first challenge may precede the React effect installing its listener.
    channel.emit('furn:desktop:request-challenge');
    return () => {
      channel.off(desktopPrepareStoryEvent, onPrepare);
      channel.off('furn:desktop:cancel-story', onCancel);
      channel.off(CHANNEL_WS_DISCONNECT, onDisconnect);
      channel.off(desktopRequestHelloEvent, emitHello);
    };
  }, [cancelStory, connectBridge, prepareStory, runtimeInstance]);

  return null;
}

function isPrepareStoryPayload(value: unknown): value is PrepareStoryPayload {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const payload = value as Record<string, unknown>;
  return (
    typeof payload.connectionEpoch === 'string' &&
    Number.isSafeInteger(payload.selectionSequence) &&
    (payload.selectionSequence as number) > 0 &&
    typeof payload.requestId === 'string' &&
    typeof payload.runId === 'string' &&
    typeof payload.storyId === 'string'
  );
}
