import type { DesktopStoryTests } from './authoring/storyTests.js';
import type { DesktopEndpoint } from './protocol/types.js';

export type DesktopStoryManifestEntry = {
  id: string;
  name: string;
  packageName: string;
  sourcePath: string;
  tags: readonly string[];
  title: string;
  tests?: DesktopStoryTests;
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
