import { randomUUID } from 'node:crypto';
import path from 'node:path';

import type { DesktopStoryManifest } from '@fluentui-react-native/desktop-driver';
import type { DesktopStoryRunResult, DesktopStoryTestResult } from '@fluentui-react-native/desktop-driver/authoring';
import { ArtifactManager } from '@fluentui-react-native/desktop-driver/artifacts';
import { selectDesktopStoryTests } from '@fluentui-react-native/desktop-driver/runner';
import { connectDesktopWebdriver } from '@fluentui-react-native/desktop-driver/wdio';
import type { DesktopWebdriverOptions, DesktopWebdriverSession } from '@fluentui-react-native/desktop-driver/wdio';

import type { DesktopStorybookConfig } from '../config/makeDesktopStorybookConfig.js';
import type { Platforms } from '../config/platforms.js';
import { runWdioStoryTests, selectWdioStories, type WdioStoryTestResult } from '../testing/runWdioTests.js';
import { writeDesktopStorybookFailure, type DesktopStorybookErrorOutput } from '../../config/diagnostics.cjs';
import type { DesktopCommandRunner } from './commandRunner.js';

type DesktopStorybookSmokeSession = Pick<DesktopWebdriverSession, 'delete' | 'listStories' | 'runStoryTests'>;

export type DesktopStorybookSmokeConnector = (options: DesktopWebdriverOptions) => Promise<DesktopStorybookSmokeSession>;

export type DesktopStorybookSmokeTestOptions = {
  artifactsRoot?: string;
  config: DesktopStorybookConfig;
  driverUrl: string;
  manifest: DesktopStoryManifest;
  platform: Platforms;
  targetId: string;
  errorOutput?: DesktopStorybookErrorOutput;
  commandRunner?: DesktopCommandRunner;
};

export type DesktopStorybookSmokeTestResult = DesktopStoryRunResult & {
  wdio?: readonly WdioStoryTestResult[];
};

export async function runDesktopStorybookSmokeTests(
  options: DesktopStorybookSmokeTestOptions,
  connect: DesktopStorybookSmokeConnector = connectDesktopWebdriver,
  runWdio: typeof runWdioStoryTests = runWdioStoryTests,
): Promise<DesktopStorybookSmokeTestResult> {
  const { config, manifest, platform } = options;
  if (manifest.endpoint !== platform) {
    throw new Error('The smoke test manifest targets a different platform.');
  }
  const planStoryIds = new Set(selectDesktopStoryTests(manifest, platform, { tag: 'desktop-e2e' }).map(({ entry }) => entry.id));
  const wdioStoryIds = new Set(selectWdioStories(manifest, config.wdio).map(({ id }) => id));
  const storyIds = [...new Set([...planStoryIds, ...wdioStoryIds])].sort();
  if (storyIds.length === 0) {
    throw new Error('No desktop story tests matched the smoke selection.');
  }
  const artifacts = new ArtifactManager(options.artifactsRoot ?? path.join(config.projectRoot, 'artifacts', platform, 'desktop-driver'));
  const startedAt = new Date().toISOString();
  const tests: DesktopStoryTestResult[] = [];
  const wdio: WdioStoryTestResult[] = [];
  const failures: unknown[] = [];

  for (const storyId of storyIds) {
    try {
      if (planStoryIds.has(storyId)) {
        const plans = await runStoryPlans(options, storyId, artifacts.root, connect);
        tests.push(...plans.tests);
        if (plans.status !== 'passed' && plans.tests.every(({ status }) => status === 'passed' || status === 'skipped')) {
          throw new Error(`The static test runner failed for "${storyId}" without failed test details.`);
        }
      }
      if (wdioStoryIds.has(storyId)) {
        const started = Date.now();
        try {
          wdio.push(
            ...(await runWdio(
              {
                ...config.wdio,
                artifactsRoot: path.join(artifacts.root, 'wdio', `story-${encodeURIComponent(storyId)}`),
                config,
                manifest,
                platform,
                story: storyId,
                targetId: options.targetId,
                url: options.driverUrl,
                errorOutput: options.errorOutput,
              },
              options.commandRunner,
            )),
          );
        } catch (error) {
          writeDesktopStorybookFailure(`smoke story "${storyId}"`, error, options.errorOutput);
          wdio.push({ storyId, status: 'failed', durationMs: Date.now() - started, error: errorMessage(error) });
          throw error;
        }
      }
    } catch (error) {
      failures.push(new Error(`Smoke tests for "${storyId}" failed: ${errorMessage(error)}`, { cause: error }));
      break;
    }
  }

  const failedTests = tests.filter(({ status }) => status !== 'passed' && status !== 'skipped');
  if (failedTests.length) {
    failures.push(
      new Error(
        `${failedTests.length} of ${tests.length} desktop story tests failed: ${failedTests
          .map(({ status, storyId, testId }) => `${storyId}/${testId} (${status})`)
          .join(', ')}`,
      ),
    );
  }
  if (wdio.some(({ status }) => status === 'failed') && failures.length === 0) {
    for (const test of wdio.filter(({ status }) => status === 'failed')) {
      writeDesktopStorybookFailure(`wdio "${test.storyId}"`, test.error ?? 'No failure details were returned.', options.errorOutput);
    }
    failures.push(new Error('Executable smoke tests reported failures.'));
  }
  const result: DesktopStorybookSmokeTestResult = {
    endpoint: platform,
    finishedAt: new Date().toISOString(),
    manifest: { platform: manifest.platformManifestDigest, portable: manifest.portablePlanDigest },
    platformName: platform === 'macos' ? 'macos' : 'windows',
    runId: randomUUID(),
    schemaVersion: 1,
    startedAt,
    status: failures.length ? 'failed' : 'passed',
    targetId: options.targetId,
    tests,
    wdio,
  };
  try {
    artifacts.writeMetadata('run', {
      ...result,
      ...(failures.length ? { errors: failures.map(errorMessage) } : {}),
    });
  } catch (error) {
    failures.push(error);
    writeDesktopStorybookFailure('writing the smoke report', error, options.errorOutput);
  }
  if (failures.length === 1) {
    throw failures[0];
  }
  if (failures.length > 1) {
    throw new AggregateError(failures, `Desktop smoke tests failed: ${failures.map(errorMessage).join('; ')}`);
  }
  return result;
}

async function runStoryPlans(
  options: DesktopStorybookSmokeTestOptions,
  storyId: string,
  artifactsRoot: string,
  connect: DesktopStorybookSmokeConnector,
): Promise<DesktopStoryRunResult> {
  const desktop = await connect({
    launchMode: 'attach',
    platformName: options.platform === 'macos' ? 'macos' : 'windows',
    targetId: options.targetId,
    url: options.driverUrl,
  });
  let result: DesktopStoryRunResult | undefined;
  let runFailure: unknown;
  try {
    const live = await desktop.listStories();
    if (live.endpoint !== options.platform || live.platformManifestDigest !== options.manifest.platformManifestDigest) {
      throw new Error('The running Storybook manifest is stale or targets a different platform.');
    }
    const reported = new Set<string>();
    const onTestResult = (test: Readonly<DesktopStoryTestResult>) => {
      if (test.status === 'passed' || test.status === 'skipped') {
        return;
      }
      reported.add(`${test.storyId}/${test.testId}`);
      const step = test.steps.find(({ status }) => status === 'failed');
      writeDesktopStorybookFailure(
        `test "${test.storyId}/${test.testId}" (${test.status}${step ? `, step ${step.index + 1}` : ''})`,
        test.error ?? step?.error ?? 'No failure details were returned.',
        options.errorOutput,
      );
    };
    result = await desktop.runStoryTests({ artifactsRoot, selection: { story: storyId, tag: 'desktop-e2e' }, onTestResult });
    for (const test of result.tests) {
      if (!reported.has(`${test.storyId}/${test.testId}`)) {
        onTestResult(test);
      }
    }
  } catch (error) {
    runFailure = error;
  }
  try {
    await desktop.delete();
  } catch (error) {
    if (runFailure !== undefined) {
      throw new AggregateError([runFailure, error], 'Desktop story tests and session cleanup both failed.');
    }
    throw error;
  }
  if (runFailure !== undefined) {
    throw runFailure;
  }
  if (!result) {
    throw new Error('Desktop story tests completed without a result.');
  }
  return result;
}

export function formatDesktopStorybookSmokeTestSummary(result: DesktopStorybookSmokeTestResult): string {
  const results = [...result.tests, ...(result.wdio ?? [])];
  const passed = results.filter(({ status }) => status === 'passed').length;
  const skipped = results.filter(({ status }) => status === 'skipped').length;
  return `Ran ${results.length} desktop story tests (${passed} passed, ${skipped} skipped).`;
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
