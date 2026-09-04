import type { DesktopEndpoint, DesktopPlatformName } from '../protocol/types.js';
import type { DesktopStoryQuarantine } from './storyTests.js';

export type DesktopArtifact = {
  kind: 'screenshot' | 'source' | 'tree';
  name: string;
  path: string;
};

export type DesktopStepStatus = 'failed' | 'passed' | 'skipped';
export type DesktopTestStatus = 'cancelled' | 'failed' | 'infrastructure-error' | 'passed' | 'quarantined' | 'skipped' | 'timed-out';
export type DesktopRunStatus = 'failed' | 'incomplete' | 'passed';

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
  quarantine?: DesktopStoryQuarantine;
  skipReason?: string;
  status: DesktopTestStatus;
  steps: readonly DesktopStoryStepResult[];
  storyId: string;
  testId: string;
  title: string;
};

export type DesktopStoryRunResult = {
  accessibility: {
    nameAssertions: {
      failed: number;
      passed: number;
    };
    reachabilityAssertions: {
      failed: number;
      passed: number;
    };
    roleAssertions: {
      failed: number;
      passed: number;
    };
  };
  endpoint: DesktopEndpoint;
  finishedAt: string;
  manifest: {
    catalog: string;
    platform: string;
    portable: string;
  };
  platformName: DesktopPlatformName;
  runId: string;
  schemaVersion: 2;
  startedAt: string;
  status: DesktopRunStatus;
  summary: {
    failed: number;
    passed: number;
    quarantined: number;
    selected: number;
    skipped: number;
  };
  targetId: string;
  tests: readonly DesktopStoryTestResult[];
};
