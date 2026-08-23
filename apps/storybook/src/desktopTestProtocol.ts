import {
  decodeDesktopHostClosing,
  decodeDesktopHostReady,
  decodeDesktopRunStatus,
  DESKTOP_PROTOCOL_VERSION,
  type DesktopChannelRunCancel,
  type DesktopChannelRunRequest,
  type DesktopChannelRunStatus,
  type DesktopHostReady,
} from '@fluentui-react-native/desktop-driver/protocol';

export type DesktopRuntimeContract = {
  protocolVersion: number;
  manifestDigest: string;
  testedStoryIds: readonly string[];
};

export function resolveHostReady(payload: unknown, runtime: DesktopRuntimeContract): { ready?: DesktopHostReady; error?: string } {
  const candidate = payload as { protocolVersion?: unknown; serviceId?: unknown } | undefined;
  if (
    typeof candidate?.serviceId === 'string' &&
    typeof candidate.protocolVersion === 'number' &&
    candidate.protocolVersion !== runtime.protocolVersion
  ) {
    return { error: `Desktop host protocol ${candidate.protocolVersion} does not match app protocol ${runtime.protocolVersion}` };
  }
  const ready = decodeDesktopHostReady(payload);
  if (!ready) {
    return {};
  }
  if (ready.protocolVersion !== runtime.protocolVersion || ready.manifest.digest !== runtime.manifestDigest) {
    return { error: 'The Storybook app and desktop host use different generated desktop-test manifests' };
  }
  return { ready };
}

export function resolveRunStatus(
  payload: unknown,
  expected: { serviceId?: string; requestId?: string; sequence: number },
): DesktopChannelRunStatus | undefined {
  const status = decodeDesktopRunStatus(payload);
  if (
    !status ||
    status.serviceId !== expected.serviceId ||
    status.requestId !== expected.requestId ||
    status.sequence <= expected.sequence
  ) {
    return undefined;
  }
  return status;
}

export function isHostClosing(payload: unknown, serviceId?: string): boolean {
  return decodeDesktopHostClosing(payload)?.serviceId === serviceId;
}

export function isTestedStory(runtime: DesktopRuntimeContract, storyId?: string): storyId is string {
  return storyId !== undefined && runtime.testedStoryIds.includes(storyId);
}

export function createRunRequest(
  runtime: DesktopRuntimeContract,
  serviceId: string,
  requestId: string,
  mode: 'current' | 'all',
  currentStoryId?: string,
): DesktopChannelRunRequest | undefined {
  if (mode === 'current' && !isTestedStory(runtime, currentStoryId)) {
    return undefined;
  }
  return {
    protocolVersion: DESKTOP_PROTOCOL_VERSION,
    serviceId,
    requestId,
    manifestDigest: runtime.manifestDigest,
    mode: mode === 'all' ? 'all' : 'selected',
    storyIds: mode === 'all' ? undefined : [currentStoryId],
  };
}

export function createCancelRequest(serviceId: string, runId: string): DesktopChannelRunCancel {
  return {
    protocolVersion: DESKTOP_PROTOCOL_VERSION,
    serviceId,
    runId,
  };
}
