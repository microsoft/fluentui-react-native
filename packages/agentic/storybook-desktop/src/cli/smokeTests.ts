import { randomUUID } from 'node:crypto';
import path from 'node:path';

import type { DesktopStoryManifest } from '@fluentui-react-native/desktop-driver';
import type { DesktopStoryRunResult, DesktopStoryTestResult } from '@fluentui-react-native/desktop-driver/authoring';
import { ArtifactManager } from '@fluentui-react-native/desktop-driver/artifacts';
import { selectDesktopStoryTests } from '@fluentui-react-native/desktop-driver/runner';
import { connectDesktopWebdriver } from '@fluentui-react-native/desktop-driver/wdio';
import type { DesktopReportWriter } from '@fluentui-react-native/desktop-test/reporting';
import type { DesktopWebdriverOptions, DesktopWebdriverSession } from '@fluentui-react-native/desktop-driver/wdio';

import type { DesktopStorybookConfig } from '../config/makeDesktopStorybookConfig.js';
import type { Platforms } from '../config/platforms.js';
import { resolveWdioOptions } from '../config/wdio.js';
import { runWdioStoryTests, selectWdioStories, WdioStoryTestRunError, type WdioStoryTestResult } from '../testing/runWdioTests.js';
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
  storyPattern?: string;
  testTag?: string;
  errorOutput?: DesktopStorybookErrorOutput;
  commandRunner?: DesktopCommandRunner;
  report?: DesktopReportWriter;
  signal?: AbortSignal;
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
  const storyPattern = options.storyPattern ?? process.env.STORYBOOK_SMOKE_STORY;
  const testTag = options.testTag ?? process.env.STORYBOOK_SMOKE_TAG;
  const wdioSettings = resolveWdioOptions({
    ...config.wdio,
    ...(storyPattern !== undefined ? { story: storyPattern } : {}),
    ...(testTag !== undefined ? { tag: testTag } : {}),
  });
  const planStoryIds = new Set(
    selectDesktopStoryTests(manifest, platform, { story: storyPattern, tag: testTag ?? 'desktop-e2e' }).map(({ entry }) => entry.id),
  );
  const wdioStoryIds = new Set(selectWdioStories(manifest, wdioSettings).map(({ id }) => id));
  const storyIds = [...new Set([...planStoryIds, ...wdioStoryIds])].sort();
  if (storyIds.length === 0) {
    throw new Error('No desktop story tests matched the smoke selection.');
  }
  const artifacts = new ArtifactManager(
    options.artifactsRoot ??
      (options.report
        ? options.report.artifactPath(path.join('evidence', platform, 'static'))
        : path.join(config.projectRoot, 'artifacts', platform, 'desktop-driver')),
  );
  const startedAt = new Date().toISOString();
  const tests: DesktopStoryTestResult[] = [];
  const wdio: WdioStoryTestResult[] = [];
  const failures: unknown[] = [];
  const staticFailures = new Map<string, Error>();
  for (const storyId of storyIds) options.report?.emit({ kind: 'work-selected', payload: { workId: `smoke:${storyId}`, label: storyId } });

  for (const storyId of storyIds) {
    const scope = `smoke:${storyId}`;
    options.report?.emit(
      { kind: 'scope-start', payload: { label: storyId, category: 'phase' } },
      scope,
      { story: storyId, endpoint: platform },
      scope,
    );
    try {
      options.signal?.throwIfAborted();
      if (planStoryIds.has(storyId)) {
        const plans = await runStoryPlans(options, storyId, artifacts.root, connect, testTag ?? 'desktop-e2e', staticFailures);
        tests.push(...plans.tests);
        if (plans.status === 'failed' && plans.tests.every(({ status }) => status === 'passed' || status === 'skipped')) {
          throw new Error(`The static test runner failed for "${storyId}" without failed test details.`);
        }
      }
      if (wdioStoryIds.has(storyId)) {
        const started = Date.now();
        try {
          wdio.push(
            ...(await runWdio(
              {
                ...wdioSettings,
                artifactsRoot: path.join(artifacts.root, 'wdio', `story-${encodeURIComponent(storyId)}`),
                config,
                manifest,
                platform,
                story: storyId,
                targetId: options.targetId,
                url: options.driverUrl,
                errorOutput: options.errorOutput,
                report: options.report,
                signal: options.signal,
                optional: true,
              },
              options.commandRunner,
            )),
          );
        } catch (error) {
          writeDesktopStorybookFailure(`smoke story "${storyId}"`, error, options.errorOutput);
          if (error instanceof WdioStoryTestRunError && error.results.length) {
            wdio.push(...error.results);
          } else {
            wdio.push({ storyId, status: 'failed', durationMs: Date.now() - started, error: errorMessage(error) });
          }
          throw error;
        }
      }
    } catch (error) {
      failures.push(new Error(`Smoke tests for "${storyId}" failed: ${errorMessage(error)}`, { cause: error }));
      options.report?.emit({ kind: 'scope-end', payload: { status: 'failed' } }, scope);
      break;
    }
    options.report?.emit({ kind: 'scope-end', payload: { status: 'passed' } }, scope);
  }

  const failedTests = tests.filter(({ status }) => status !== 'passed' && status !== 'skipped');
  if (failedTests.length) {
    failures.push(
      new AggregateError(
        failedTests.map(
          (test) => staticFailures.get(`${test.storyId}/${test.testId}`) ?? new Error(test.error ?? 'Static story test failed.'),
        ),
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
  const allSkipped = tests.length + wdio.length > 0 && [...tests, ...wdio].every(({ status }) => status === 'skipped');
  if (allSkipped && failures.length === 0)
    failures.push(new Error('Required desktop smoke cohort only skipped tests; it is not a passing run.'));
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
    const reportPath = artifacts.writeMetadata('run', {
      ...result,
      ...(failures.length ? { errors: failures.map(errorMessage) } : {}),
    });
    options.report?.emit({
      kind: 'artifact',
      payload: { path: path.relative(options.report.root, reportPath), description: 'Story smoke results' },
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
  tag: string,
  failures: Map<string, Error>,
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
      const key = `${test.storyId}/${test.testId}`;
      if (reported.has(key)) return;
      reported.add(key);
      const failure =
        test.status === 'passed' || test.status === 'skipped' ? undefined : new Error(test.error ?? 'Static story test failed.');
      if (failure) failures.set(key, failure);
      options.report?.emit(
        {
          kind: 'test-result',
          payload: {
            testId: `static:${key}`,
            title: key,
            attempt: 0,
            status: test.status === 'passed' || test.status === 'skipped' ? test.status : 'failed',
            durationMs: test.durationMs,
            ...(test.status === 'skipped' ? { reason: test.skipReason ?? 'Unsupported by the static test runner.' } : {}),
            ...(failure ? { failure: options.report.failure(failure, 'test') } : {}),
          },
        },
        `static:${key}`,
        { story: test.storyId, test: test.testId, endpoint: options.platform },
      );
      for (const artifact of test.artifacts)
        options.report?.emit(
          {
            kind: 'artifact',
            payload: {
              path: path.relative(options.report.root, path.join(artifactsRoot, artifact.path)),
              description: `${key}: ${artifact.kind}`,
            },
          },
          `static:${key}`,
        );
      if (test.status === 'passed' || test.status === 'skipped') {
        return;
      }
      const step = test.steps.find(({ status }) => status === 'failed');
      writeDesktopStorybookFailure(
        `test "${test.storyId}/${test.testId}" (${test.status}${step ? `, step ${step.index + 1}` : ''})`,
        test.error ?? step?.error ?? 'No failure details were returned.',
        options.errorOutput,
      );
    };
    result = await desktop.runStoryTests({ artifactsRoot, selection: { story: storyId, tag }, onTestResult });
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
  if (result.tests.length === 0) {
    throw new Error(`No desktop story tests matched "${storyId}" with tag "${tag}".`);
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
