import type { DesktopStoryTests } from './authoring/storyTests.js';
import type { ResolvedDesktopCaseOptions } from './authoring/input.js';
import type { DesktopEndpoint } from './protocol/types.js';
import { WebDriverError } from './protocol/errors.js';
import { attachFailureEffect } from './protocol/settlement.js';

export type DesktopStoryManifestEntry = {
  id: string;
  name: string;
  packageName: string;
  sourcePath: string;
  tags: readonly string[];
  title: string;
  tests?: DesktopStoryTests;
  wdio?: {
    digest: string;
    exportName: string;
    testNames?: readonly string[];
    cases?: readonly { name: string; options: ResolvedDesktopCaseOptions }[];
  };
};

export type DesktopStoryManifest = {
  endpoint: DesktopEndpoint;
  entries: readonly DesktopStoryManifestEntry[];
  platformManifestDigest: string;
  portablePlanDigest: string;
  schemaVersion: 1;
};

export type StorySelectionRequest = {
  requestId: string;
  runId: string;
  storyId: string;
};

export type StoryReadyResult = {
  connectionEpoch?: string;
  markerVersion?: 1;
  previewGeneration: number;
  requestId?: string;
  runId: string;
  storyId: string;
  /** Service-local observations, not part of the authenticated runtime marker or readiness decision. */
  diagnostics?: StorySelectionDiagnostics & {
    application?: { processId: number; processStartedAt: string };
  };
};

export type StorySelectionDiagnostics = {
  preparationMs?: number;
  httpMs?: number;
  runtimeReadyMs?: number;
  nativeVerificationMs?: number;
  nativeMarkerPolls?: number;
  authenticatedHellos?: number;
  bridgeConnections?: number;
};

/** Local provider lifetime; never included in channel messages or serialized operation inputs. */
export type StoryProviderContext = {
  lifetimeId: string;
  signal: AbortSignal;
  /** Optional, fixed numeric observations. Never include runtime payloads or credentials here. */
  diagnostics?: StorySelectionDiagnostics;
};

export class StoryProviderError extends Error {
  readonly effect: 'none' | 'unknown';

  constructor(message: string, effect: 'none' | 'unknown') {
    super(message);
    this.effect = effect;
  }
}

export class StoryBridgeUnavailableError extends WebDriverError {
  constructor(endpoint: DesktopEndpoint, renderer: 'fabric' | 'paper', reason: 'bridge-unavailable' | 'relaunch-required') {
    super('unknown error', 'The authenticated Storybook bridge is unavailable. Relaunch the application before selecting a story.', {
      endpoint,
      reason,
      renderer,
    });
    attachFailureEffect(this, 'none');
  }
}

/** Versioned markers bind readiness to the exact connection and request, not just the story name. */
export function matchesStoryMarker(value: string, expected: StoryReadyResult): boolean {
  const marker = parseStoryMarker(value);
  if (!Number.isSafeInteger(expected.previewGeneration) || expected.previewGeneration < 1 || !expected.runId || !expected.storyId)
    return false;
  if (expected.markerVersion === 1 && (!expected.connectionEpoch || !expected.requestId)) return false;
  if (expected.markerVersion === undefined && (expected.connectionEpoch !== undefined || expected.requestId !== undefined)) return false;
  return (
    marker !== undefined &&
    marker.storyId === expected.storyId &&
    marker.runId === expected.runId &&
    marker.previewGeneration === expected.previewGeneration &&
    (expected.markerVersion === undefined ||
      (marker.markerVersion === 1 && marker.connectionEpoch === expected.connectionEpoch && marker.requestId === expected.requestId))
  );
}

export function parseStoryMarker(value: string): Record<string, unknown> | undefined {
  try {
    const marker: unknown = JSON.parse(value);
    if (typeof marker !== 'object' || marker === null) {
      return undefined;
    }
    const fields = marker as Record<string, unknown>;
    return typeof fields.storyId === 'string' ? fields : undefined;
  } catch {
    return undefined;
  }
}

export interface StoryOrchestrator {
  getManifest(context?: StoryProviderContext): Promise<DesktopStoryManifest>;
  getCurrentStory(context?: StoryProviderContext): Promise<StoryReadyResult | null>;
  selectStory(request: StorySelectionRequest, context?: StoryProviderContext): Promise<StoryReadyResult>;
  resetStory(request: StorySelectionRequest, context?: StoryProviderContext): Promise<StoryReadyResult>;
  updateArgs?(storyId: string, args: Readonly<Record<string, unknown>>, context?: StoryProviderContext): Promise<void>;
}
