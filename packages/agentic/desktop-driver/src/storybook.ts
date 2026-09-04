import type { DesktopStoryPlatform, DesktopStoryTests } from './authoring/storyTests.js';
import type { DesktopEndpoint } from './protocol/types.js';

export type DesktopStoryManifestEntry = {
  id: string;
  name: string;
  packageName: string;
  sourcePath: string;
  supportedPlatforms: readonly DesktopStoryPlatform[];
  tags: readonly string[];
  title: string;
  traverse?: false;
  tests?: DesktopStoryTests;
};

export type DesktopStoryManifestExclusion = {
  id: string;
  packageName: string;
  reason: 'package-pattern' | 'unsupported-platform';
  sourcePath: string;
  supportedPlatforms: readonly DesktopStoryPlatform[];
};

export type DesktopStoryManifest = {
  catalogSetDigest: string;
  endpoint: DesktopEndpoint;
  entries: readonly DesktopStoryManifestEntry[];
  excluded: readonly DesktopStoryManifestExclusion[];
  platformManifestDigest: string;
  portablePlanDigest: string;
  schemaVersion: 2;
};

export type StorySelectionRequest = {
  requestId: string;
  runId: string;
  storyId: string;
};

export type StoryReadyResult = {
  previewGeneration: number;
  runId: string;
  storyId: string;
};

export interface StoryOrchestrator {
  getManifest(): Promise<DesktopStoryManifest>;
  getCurrentStory(): Promise<StoryReadyResult | null>;
  selectStory(request: StorySelectionRequest): Promise<StoryReadyResult>;
  resetStory(request: StorySelectionRequest): Promise<StoryReadyResult>;
  updateArgs?(storyId: string, args: Readonly<Record<string, unknown>>): Promise<void>;
}
