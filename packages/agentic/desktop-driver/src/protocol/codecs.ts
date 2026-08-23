import type {
  DesktopChannelRunCancel,
  DesktopChannelRunRequest,
  DesktopChannelRunStatus,
  DesktopHostClosing,
  DesktopHostReady,
} from './channel-events.ts';
import { DESKTOP_PROTOCOL_VERSION } from './versions.ts';

function record(value: unknown): Record<string, unknown> | undefined {
  return typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : undefined;
}

function stringArray(value: unknown): value is readonly string[] {
  return Array.isArray(value) && value.every((entry) => typeof entry === 'string');
}

function testResult(value: unknown): boolean {
  const candidate = record(value);
  const error = candidate?.error;
  return (
    typeof candidate?.testId === 'string' &&
    (candidate.storyId === undefined || typeof candidate.storyId === 'string') &&
    typeof candidate.title === 'string' &&
    ['passed', 'failed', 'skipped', 'cancelled', 'timed_out', 'infrastructureError'].includes(String(candidate.status)) &&
    typeof candidate.durationMs === 'number' &&
    Number.isFinite(candidate.durationMs) &&
    candidate.durationMs >= 0 &&
    (error === undefined ||
      (typeof error === 'object' &&
        error !== null &&
        typeof (error as Record<string, unknown>).message === 'string' &&
        ((error as Record<string, unknown>).stack === undefined || typeof (error as Record<string, unknown>).stack === 'string')))
  );
}

export function decodeDesktopHostReady(value: unknown): DesktopHostReady | undefined {
  const candidate = record(value);
  const manifest = record(candidate?.manifest);
  const capabilities = record(candidate?.capabilities);
  const tests = manifest?.tests;
  if (
    candidate?.protocolVersion !== DESKTOP_PROTOCOL_VERSION ||
    typeof candidate.serviceId !== 'string' ||
    !Number.isInteger(manifest?.schemaVersion) ||
    typeof manifest?.digest !== 'string' ||
    !Array.isArray(tests) ||
    !tests.every((test) => {
      const entry = record(test);
      return typeof entry?.storyId === 'string' && typeof entry.planId === 'string' && (entry.kind === 'inline' || entry.kind === 'spec');
    }) ||
    !Array.isArray(capabilities?.runModes) ||
    capabilities.runModes.length !== 2 ||
    capabilities.runModes[0] !== 'selected' ||
    capabilities.runModes[1] !== 'all' ||
    capabilities.cancellation !== true ||
    capabilities.maxConcurrentRuns !== 1
  ) {
    return undefined;
  }
  return value as DesktopHostReady;
}

export function decodeDesktopHostClosing(value: unknown): DesktopHostClosing | undefined {
  const candidate = record(value);
  if (candidate?.protocolVersion !== DESKTOP_PROTOCOL_VERSION || typeof candidate.serviceId !== 'string') {
    return undefined;
  }
  return value as DesktopHostClosing;
}

export function decodeDesktopRunRequest(value: unknown): DesktopChannelRunRequest | undefined {
  const candidate = record(value);
  if (
    candidate?.protocolVersion !== DESKTOP_PROTOCOL_VERSION ||
    typeof candidate.serviceId !== 'string' ||
    typeof candidate.requestId !== 'string' ||
    typeof candidate.manifestDigest !== 'string' ||
    (candidate.mode !== 'selected' && candidate.mode !== 'all') ||
    (candidate.storyIds !== undefined && !stringArray(candidate.storyIds)) ||
    (candidate.mode === 'selected' && (!Array.isArray(candidate.storyIds) || candidate.storyIds.length === 0))
  ) {
    return undefined;
  }
  return value as DesktopChannelRunRequest;
}

export function decodeDesktopRunStatus(value: unknown): DesktopChannelRunStatus | undefined {
  const candidate = record(value);
  const status = record(candidate?.status);
  if (
    candidate?.protocolVersion !== DESKTOP_PROTOCOL_VERSION ||
    typeof candidate.serviceId !== 'string' ||
    typeof candidate.requestId !== 'string' ||
    !Number.isInteger(candidate.sequence) ||
    (candidate.sequence as number) < 1 ||
    typeof status?.runId !== 'string' ||
    status.protocolVersion !== DESKTOP_PROTOCOL_VERSION ||
    !['running', 'passed', 'failed', 'cancelled', 'error'].includes(String(status.state)) ||
    !stringArray(status.requestedStoryIds) ||
    !Array.isArray(status.results) ||
    !status.results.every(testResult) ||
    (status.startedAt !== undefined && typeof status.startedAt !== 'string') ||
    (status.finishedAt !== undefined && typeof status.finishedAt !== 'string') ||
    (status.message !== undefined && typeof status.message !== 'string')
  ) {
    return undefined;
  }
  return value as DesktopChannelRunStatus;
}

export function decodeDesktopRunCancel(value: unknown): DesktopChannelRunCancel | undefined {
  const candidate = record(value);
  if (
    candidate?.protocolVersion !== DESKTOP_PROTOCOL_VERSION ||
    typeof candidate.serviceId !== 'string' ||
    typeof candidate.runId !== 'string'
  ) {
    return undefined;
  }
  return value as DesktopChannelRunCancel;
}
