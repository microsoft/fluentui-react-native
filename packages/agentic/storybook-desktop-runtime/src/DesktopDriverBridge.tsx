import * as React from 'react';
import { addons } from 'storybook/preview-api';

import { useDesktopStorybookConfig } from './DesktopStorybookConfig';

export const desktopPrepareStoryEvent = 'furn:desktop:prepare-story';
export const desktopRequestHelloEvent = 'furn:desktop:request-hello';
export const desktopRuntimeHelloEvent = 'furn:desktop:hello';
export const desktopStoryErrorEvent = 'furn:desktop:story-error';
export const desktopStoryReadyEvent = 'furn:desktop:story-ready';

type PrepareStoryPayload = {
  requestId: string;
  runId: string;
  storyId: string;
};

export function DesktopDriverBridge(): null {
  const { prepareStory, runtimeInstance } = useDesktopStorybookConfig();

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
    const emitHello = () => {
      channel.emit(desktopRuntimeHelloEvent, {
        endpoint: runtimeInstance.endpoint,
        instanceId: runtimeInstance.instanceId,
        nonce: runtimeInstance.bridgeNonce,
        platformManifestDigest: runtimeInstance.platformManifestDigest,
        targetId: runtimeInstance.targetId,
        version: 1,
      });
    };
    const onPrepare = (payload: PrepareStoryPayload) => {
      if (isPrepareStoryPayload(payload)) {
        prepareStory(payload);
      }
    };

    channel.on(desktopPrepareStoryEvent, onPrepare);
    channel.on(desktopRequestHelloEvent, emitHello);
    emitHello();
    return () => {
      channel.off(desktopPrepareStoryEvent, onPrepare);
      channel.off(desktopRequestHelloEvent, emitHello);
    };
  }, [prepareStory, runtimeInstance]);

  return null;
}

function isPrepareStoryPayload(value: unknown): value is PrepareStoryPayload {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const payload = value as Record<string, unknown>;
  return typeof payload.requestId === 'string' && typeof payload.runId === 'string' && typeof payload.storyId === 'string';
}
