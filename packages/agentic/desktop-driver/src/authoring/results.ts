import type { DesktopEndpoint, DesktopPlatformName } from '../protocol/types.js';

export type DesktopArtifact = {
  kind: 'screenshot' | 'source' | 'tree';
  name: string;
  path: string;
};

export type DesktopStepStatus = 'failed' | 'passed' | 'skipped';
export type DesktopTestStatus = 'cancelled' | 'failed' | 'infrastructure-error' | 'passed' | 'skipped' | 'timed-out';
export type DesktopRunStatus = 'failed' | 'passed';

export type DesktopStoryStepResult = {
  artifacts: readonly DesktopArtifact[];
  durationMs: number;
  error?: string;
  index: number;
  status: DesktopStepStatus;
};

export type DesktopStoryTestResult = {
  artifacts: readonly DesktopArtifact[];
  durationMs: number;
  error?: string;
  skipReason?: string;
  status: DesktopTestStatus;
  steps: readonly DesktopStoryStepResult[];
  storyId: string;
  testId: string;
  title: string;
};

export type DesktopStoryRunResult = {
  endpoint: DesktopEndpoint;
  finishedAt: string;
  manifest: {
    platform: string;
    portable: string;
  };
  platformName: DesktopPlatformName;
  runId: string;
  schemaVersion: 1;
  startedAt: string;
  status: DesktopRunStatus;
  targetId: string;
  tests: readonly DesktopStoryTestResult[];
};
