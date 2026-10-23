import fs from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

import type { DesktopStoryManifest, DesktopStoryManifestEntry } from '@fluentui-react-native/desktop-driver';
import type { DesktopArtifact } from '@fluentui-react-native/desktop-driver/authoring';
import { ArtifactManager, captureDesktopFailureEvidence } from '@fluentui-react-native/desktop-driver/artifacts';
import { connectDesktopWebdriver } from '@fluentui-react-native/desktop-driver/wdio';
import type { DesktopReportWriter } from '@fluentui-react-native/desktop-test/reporting';
import { DesktopReportedError } from '@fluentui-react-native/desktop-test/reporting';

import type { DesktopStorybookConfig } from '../config/makeDesktopStorybookConfig.js';
import type { Platforms } from '../config/platforms.js';
import { resolveWdioOptions, type DesktopStorybookWdioOptions } from '../config/wdio.js';
import { NodeDesktopCommandRunner, type DesktopCommandRunner, type PreparedDesktopCommand } from '../cli/commandRunner.js';
import { extractWdioTests } from './extractWdioTests.js';
import type { WdioWorkerOptions } from './worker.js';
import { formatDesktopStorybookError, writeDesktopStorybookFailure, type DesktopStorybookErrorOutput } from '../../config/diagnostics.cjs';

export type WdioStoryTestResult = {
  storyId: string;
  testName?: string;
  status: 'passed' | 'failed' | 'skipped';
  durationMs: number;
  error?: string;
  skipReason?: string;
  evidenceErrors?: string[];
  artifacts?: readonly DesktopArtifact[];
};

export type RunWdioStoryTestsOptions = DesktopStorybookWdioOptions & {
  config: DesktopStorybookConfig;
  manifest: DesktopStoryManifest;
  platform: Platforms;
  targetId: string;
  url: string;
  artifactsRoot?: string;
  errorOutput?: DesktopStorybookErrorOutput;
  report?: DesktopReportWriter;
  signal?: AbortSignal;
  optional?: boolean;
};

export class WdioStoryTestRunError extends Error {
  readonly results: readonly WdioStoryTestResult[];

  constructor(results: readonly WdioStoryTestResult[], failures: readonly unknown[]) {
    const cause = failures.length === 1 ? failures[0] : new AggregateError(failures, 'Executable wdio tests and evidence/cleanup failed.');
    super(`Executable wdio stories failed: ${errorMessage(cause)}`, { cause });
    this.name = 'WdioStoryTestRunError';
    this.results = [...results];
  }
}

export function selectWdioStories(
  manifest: DesktopStoryManifest,
  options: DesktopStorybookWdioOptions,
): readonly DesktopStoryManifestEntry[] {
  return manifest.entries
    .filter((entry) => entry.wdio && (!options.story || path.matchesGlob(entry.id, options.story)))
    .filter((entry) => !options.tag || entry.tags.includes(options.tag))
    .filter((entry) => (entry.wdio?.testNames ?? ['default']).some((name) => matchesWdioTest(name, options.test)))
    .sort((left, right) => left.id.localeCompare(right.id));
}

export async function runWdioStoryTests(
  options: RunWdioStoryTestsOptions,
  runner?: DesktopCommandRunner,
): Promise<readonly WdioStoryTestResult[]> {
  const settings = resolveWdioOptions(options);
  const stories = selectWdioStories(options.manifest, settings);
  if (stories.length === 0) {
    throw new Error('No executable wdio story tests matched the requested selection.');
  }
  const cases = stories.flatMap((entry) => {
    const sourceFile = path.join(options.config.resolvePackage(entry.packageName).root, entry.sourcePath);
    const extracted = extractWdioTests(fs.readFileSync(sourceFile, 'utf8'), sourceFile).get(entry.wdio!.exportName);
    if (!extracted || extracted.digest !== entry.wdio!.digest) {
      throw new Error(`Executable test source changed for ${entry.id}; regenerate the Storybook manifest.`);
    }
    return extracted.tests
      .filter(({ name }) => matchesWdioTest(name ?? 'default', settings.test))
      .map(({ name, code }) => ({ entry, code, testName: name }));
  });
  if (cases.length === 0) throw new Error('No executable wdio tests matched the requested selection.');
  const artifacts = new ArtifactManager(
    options.artifactsRoot ??
      (options.report
        ? options.report.artifactPath(path.join('evidence', options.platform, 'wdio'))
        : path.join(options.config.projectRoot, 'artifacts', options.platform, 'wdio')),
  );
  const generatedRoot = path.join(options.config.projectRoot, 'storybook-desktop.generated', 'wdio');
  const workerUrl = pathToFileURL(
    path.join(options.config.resolvePackage('@fluentui-react-native/storybook-desktop').root, 'lib', 'testing', 'worker.js'),
  ).href;
  const results: WdioStoryTestResult[] = [];
  const executionFailures: unknown[] = [];
  for (const { entry, testName } of cases)
    options.report?.emit({
      kind: 'work-selected',
      payload: { workId: csfTestId(entry.id, testName), label: `${entry.id} / ${testName ?? 'default'}` },
    });
  const ownedRunner = runner ? undefined : new NodeDesktopCommandRunner({ reporter: options.report });
  const commands = runner ?? ownedRunner!;
  let directory: string | undefined;
  let infrastructureFailure: unknown;
  let activeStory: string | undefined;
  let phase = 'setup';
  let activeResult: WdioStoryTestResult | undefined;
  let activeStarted = 0;
  try {
    fs.mkdirSync(generatedRoot, { recursive: true });
    directory = fs.mkdtempSync(path.join(generatedRoot, 'run-'));
    for (const [index, { entry, code, testName }] of cases.entries()) {
      options.signal?.throwIfAborted();
      const displayName = testName === undefined ? entry.id : `${entry.id} / ${testName}`;
      const artifactId =
        testName === undefined ? entry.id : `${entry.id}-${createHash('sha256').update(testName).digest('hex').slice(0, 16)}`;
      activeStory = displayName;
      phase = 'connection';
      const started = Date.now();
      activeStarted = started;
      const result: WdioStoryTestResult = {
        storyId: entry.id,
        ...(testName === undefined ? {} : { testName }),
        status: 'failed',
        durationMs: 0,
      };
      activeResult = result;
      const testId = csfTestId(entry.id, testName);
      const context = { story: entry.id, test: testName ?? 'default', endpoint: options.platform };
      options.report?.emit({ kind: 'scope-start', payload: { label: displayName, category: 'worker' } }, testId, context, testId);
      options.report?.emit({ kind: 'test-start', payload: { testId, title: displayName, attempt: 0 } }, testId, context);
      // The supervisor owns the session, so even a crashed or timed-out Node worker cannot strand it.
      const desktop = await connectDesktopWebdriver({
        clickMode: settings.clickMode,
        launchMode: 'attach',
        platformName: options.platform === 'macos' ? 'macos' : 'windows',
        targetId: options.targetId,
        url: options.url,
      });
      let failure: unknown;
      try {
        phase = 'manifest verification';
        const live = await desktop.listStories();
        if (live.endpoint !== options.platform || live.platformManifestDigest !== options.manifest.platformManifestDigest) {
          throw new Error('The running Storybook manifest is stale or targets a different platform. Restart storybook driver and the app.');
        }
        phase = 'navigation';
        await desktop.openStory(entry.id);
        const resultPath = path.join(directory, `${index}.json`);
        const workerOptions: WdioWorkerOptions = {
          attachment: {
            capabilities: desktop.browser.capabilities,
            sessionId: desktop.browser.sessionId,
            url: options.url,
          },
          resultPath,
          storyId: entry.id,
          platform: options.platform,
          testName,
          timeoutMs: settings.timeoutMs,
        };
        const specPath = path.join(directory, `${index}.test.mjs`);
        fs.writeFileSync(
          specPath,
          `import { registerWdioStoryTest } from ${JSON.stringify(workerUrl)};\n` +
            `registerWdioStoryTest(${JSON.stringify(workerOptions)}, (${code}));\n`,
          { mode: 0o600 },
        );
        phase = 'execution';
        const outcome = await runWorker(
          commands,
          {
            command: process.execPath,
            label: `wdio "${displayName}"`,
            // Forced exit races HTTP handle teardown on Windows. The supervisor
            // still bounds and terminates workers that do not exit naturally.
            args: [
              '--test',
              '--test-concurrency=1',
              `--test-timeout=${Math.min(settings.timeoutMs + 5000, 2_147_483_647)}`,
              `--test-reporter=${settings.reporter}`,
              specPath,
            ],
            cwd: options.config.projectRoot,
            env: {},
            category: 'worker',
            context,
          },
          Math.min(settings.timeoutMs + 5000, 2_147_483_647),
          resultPath,
          displayName,
          options.signal,
        );
        result.status = outcome.status;
        if (outcome.status === 'skipped') {
          result.skipReason = outcome.skipReason;
        }
      } catch (error) {
        failure = error;
        executionFailures.push(error);
        result.error = formatDesktopStorybookError(error);
        writeDesktopStorybookFailure(`wdio "${displayName}" during ${phase}`, error, options.errorOutput);
        const evidence = await captureDesktopFailureEvidence(desktop.session, artifacts, artifactId);
        result.artifacts = evidence.artifacts;
        result.evidenceErrors = evidence.errors;
        for (const artifact of result.artifacts)
          options.report?.emit(
            {
              kind: 'artifact',
              payload: {
                path: path.relative(options.report.root, path.join(artifacts.root, artifact.path)),
                description: `${displayName}: ${artifact.kind}`,
              },
            },
            testId,
          );
        for (const evidenceError of result.evidenceErrors) {
          options.report?.fail(new Error(evidenceError), 'evidence', testId);
          writeDesktopStorybookFailure(`evidence for "${displayName}"`, evidenceError, options.errorOutput);
        }
      }
      phase = 'session cleanup';
      try {
        await desktop.delete();
      } catch (cleanupError) {
        options.report?.fail(cleanupError, 'cleanup', testId);
        throw new AggregateError(
          failure === undefined ? [cleanupError] : [failure, cleanupError],
          `Could not release the wdio session for ${displayName}; stopping before another test starts.`,
        );
      }
      result.durationMs = Date.now() - started;
      results.push(result);
      options.report?.emit(
        {
          kind: 'test-result',
          payload: {
            testId,
            title: displayName,
            attempt: 0,
            status: result.status,
            durationMs: result.durationMs,
            ...(result.status === 'skipped' ? { reason: result.skipReason } : {}),
            ...(failure !== undefined ? { failure: options.report.failure(failure, 'test') } : {}),
          },
        },
        testId,
        context,
      );
      options.report?.emit({ kind: 'scope-end', payload: { status: result.status } }, testId);
    }
  } catch (error) {
    infrastructureFailure = error;
    options.report?.fail(error);
    if (activeResult && !results.includes(activeResult)) {
      activeResult.status = 'failed';
      activeResult.error = formatDesktopStorybookError(error);
      activeResult.durationMs = Date.now() - activeStarted;
      results.push(activeResult);
      const testId = csfTestId(activeResult.storyId, activeResult.testName);
      options.report?.emit(
        {
          kind: 'test-result',
          payload: {
            testId,
            title: activeStory!,
            attempt: 0,
            status: 'failed',
            durationMs: activeResult.durationMs,
            failure: options.report.failure(error),
          },
        },
        testId,
        { endpoint: options.platform, story: activeResult.storyId, test: activeResult.testName ?? 'default' },
      );
      options.report?.emit({ kind: 'scope-end', payload: { status: 'failed' } }, testId);
    }
    writeDesktopStorybookFailure(`wdio "${activeStory ?? 'run'}" during ${phase}`, error, options.errorOutput);
  }
  const failures: unknown[] = infrastructureFailure === undefined ? [] : [infrastructureFailure];
  failures.push(...executionFailures);
  const allSkipped = results.every(({ status }) => status === 'skipped');
  const incomplete = results.length !== cases.length || (allSkipped && !options.optional);
  if (incomplete && failures.length === 0)
    failures.push(new Error('Required executable story cohort did not execute any tests or left selected work unfinished.'));
  try {
    const reportPath = artifacts.writeMetadata('run', {
      endpoint: options.platform,
      platformManifestDigest: options.manifest.platformManifestDigest,
      status: failures.length
        ? incomplete && executionFailures.length === 0 && infrastructureFailure === undefined
          ? 'incomplete'
          : 'failed'
        : allSkipped
          ? 'skipped'
          : 'passed',
      ...(infrastructureFailure === undefined ? {} : { error: errorMessage(infrastructureFailure) }),
      tests: results,
    });
    options.report?.emit({
      kind: 'artifact',
      payload: { path: path.relative(options.report.root, reportPath), description: 'Executable story results' },
    });
  } catch (error) {
    failures.push(error);
    writeDesktopStorybookFailure('writing the wdio report', error, options.errorOutput);
  }
  try {
    if (directory) fs.rmSync(directory, { recursive: true, force: true });
  } catch (error) {
    failures.push(error);
    writeDesktopStorybookFailure('cleaning generated wdio files', error, options.errorOutput);
  }
  if (ownedRunner) {
    if (failures.length) ownedRunner.reporter?.fail(new AggregateError(failures, 'Executable story failures.'));
    try {
      await ownedRunner.close();
    } catch (error) {
      failures.push(error);
    }
  }
  if (failures.length) throw new WdioStoryTestRunError(results, failures);
  return results;
}

type WorkerResult = { status: 'passed' } | { status: 'skipped'; skipReason: string };

function isWorkerResult(value: unknown): value is WorkerResult {
  return (
    typeof value === 'object' &&
    value !== null &&
    'status' in value &&
    (value.status === 'passed' || (value.status === 'skipped' && 'skipReason' in value && typeof value.skipReason === 'string'))
  );
}

export function matchesWdioTest(name: string, pattern?: string): boolean {
  return pattern === undefined || path.matchesGlob(name, pattern);
}

function csfTestId(storyId: string, testName?: string): string {
  return `csf-${createHash('sha256')
    .update(JSON.stringify([storyId, testName ?? 'default']))
    .digest('hex')}`;
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

async function runWorker(
  runner: DesktopCommandRunner,
  command: PreparedDesktopCommand,
  timeoutMs: number,
  resultPath: string,
  storyId: string,
  signal?: AbortSignal,
): Promise<WorkerResult> {
  const worker = runner.start(command);
  let timer: ReturnType<typeof setTimeout> | undefined;
  let failure: unknown;
  let result: WorkerResult | undefined;
  let abort: (() => void) | undefined;
  try {
    const exitCode = await Promise.race([
      worker.completed,
      ...(signal
        ? [
            new Promise<never>((_resolve, reject) => {
              abort = () => reject(signal.reason);
              if (signal.aborted) abort();
              else signal.addEventListener('abort', abort, { once: true });
            }),
          ]
        : []),
      new Promise<never>((_resolve, reject) => {
        timer = setTimeout(() => reject(new Error(`Executable wdio worker exceeded its ${timeoutMs}ms process deadline.`)), timeoutMs);
      }),
    ]);
    const outcome: unknown = fs.existsSync(resultPath) ? JSON.parse(fs.readFileSync(resultPath, 'utf8')) : undefined;
    if (
      typeof outcome === 'object' &&
      outcome !== null &&
      'status' in outcome &&
      outcome.status === 'failed' &&
      'error' in outcome &&
      typeof outcome.error === 'string'
    ) {
      if ('failure' in outcome && outcome.failure !== undefined) throw new DesktopReportedError(outcome.failure);
      throw new Error(`Executable wdio callback "${storyId}" failed:\n${outcome.error}`);
    }

    if (exitCode !== 0) {
      throw new Error(`Executable wdio worker for "${storyId}" exited with code ${exitCode}.`);
    }
    if (!isWorkerResult(outcome)) {
      throw new Error(`The wdio worker for "${storyId}" exited without a valid result.`);
    }
    result = outcome;
  } catch (error) {
    failure = error;
  } finally {
    clearTimeout(timer);
    if (abort) signal?.removeEventListener('abort', abort);
  }
  try {
    await worker.stop({ failed: failure !== undefined });
  } catch (error) {
    throw new AggregateError(failure === undefined ? [error] : [failure, error], 'Could not stop the owned wdio worker.');
  }
  if (failure !== undefined) {
    throw failure;
  }
  if (!result) {
    throw new Error(`The wdio worker for "${storyId}" completed without a result.`);
  }
  return result;
}
