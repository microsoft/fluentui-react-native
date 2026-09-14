import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

import type { DesktopStoryManifest, DesktopStoryManifestEntry } from '@fluentui-react-native/desktop-driver';
import { ArtifactManager } from '@fluentui-react-native/desktop-driver/artifacts';
import { connectDesktopWebdriver } from '@fluentui-react-native/desktop-driver/wdio';
import type { DesktopWebdriverSession } from '@fluentui-react-native/desktop-driver/wdio';

import type { DesktopStorybookConfig } from '../config/makeDesktopStorybookConfig.js';
import type { Platforms } from '../config/platforms.js';
import { resolveWdioOptions, type DesktopStorybookWdioOptions } from '../config/wdio.js';
import { NodeDesktopCommandRunner, type DesktopCommandRunner, type PreparedDesktopCommand } from '../cli/commandRunner.js';
import { extractWdioTests } from './extractWdioTests.js';
import type { WdioWorkerOptions } from './worker.js';

export type WdioStoryTestResult = {
  storyId: string;
  status: 'passed' | 'failed' | 'skipped';
  durationMs: number;
  error?: string;
  skipReason?: string;
  evidenceErrors?: string[];
};

export type RunWdioStoryTestsOptions = DesktopStorybookWdioOptions & {
  config: DesktopStorybookConfig;
  manifest: DesktopStoryManifest;
  platform: Platforms;
  targetId: string;
  url: string;
  artifactsRoot?: string;
};

export function selectWdioStories(
  manifest: DesktopStoryManifest,
  options: DesktopStorybookWdioOptions,
): readonly DesktopStoryManifestEntry[] {
  return manifest.entries
    .filter((entry) => entry.wdio && (!options.story || path.matchesGlob(entry.id, options.story)))
    .filter((entry) => !options.tag || entry.tags.includes(options.tag))
    .sort((left, right) => left.id.localeCompare(right.id));
}

export async function runWdioStoryTests(
  options: RunWdioStoryTestsOptions,
  runner: DesktopCommandRunner = new NodeDesktopCommandRunner(),
): Promise<readonly WdioStoryTestResult[]> {
  const settings = resolveWdioOptions(options);
  const stories = selectWdioStories(options.manifest, settings);
  if (stories.length === 0) {
    throw new Error('No executable wdio story tests matched the requested selection.');
  }
  const cases = stories.map((entry) => {
    const sourceFile = path.join(options.config.resolvePackage(entry.packageName).root, entry.sourcePath);
    const extracted = extractWdioTests(fs.readFileSync(sourceFile, 'utf8'), sourceFile).get(entry.wdio!.exportName);
    if (!extracted || extracted.digest !== entry.wdio!.digest) {
      throw new Error(`Executable test source changed for ${entry.id}; regenerate the Storybook manifest.`);
    }
    return { entry, code: extracted.code };
  });
  const artifacts = new ArtifactManager(
    options.artifactsRoot ?? path.join(options.config.projectRoot, 'artifacts', options.platform, 'wdio'),
  );
  const generatedRoot = path.join(options.config.projectRoot, 'storybook-desktop.generated', 'wdio');
  fs.mkdirSync(generatedRoot, { recursive: true });
  const directory = fs.mkdtempSync(path.join(generatedRoot, 'run-'));
  const workerUrl = pathToFileURL(
    path.join(options.config.resolvePackage('@fluentui-react-native/storybook-desktop').root, 'lib', 'testing', 'worker.js'),
  ).href;
  const results: WdioStoryTestResult[] = [];
  let infrastructureFailure: unknown;
  try {
    for (const [index, { entry, code }] of cases.entries()) {
      const started = Date.now();
      // The supervisor owns the session, so even a crashed or timed-out Node worker cannot strand it.
      const desktop = await connectDesktopWebdriver({
        clickMode: settings.clickMode,
        launchMode: 'attach',
        platformName: options.platform === 'macos' ? 'macos' : 'windows',
        targetId: options.targetId,
        url: options.url,
      });
      const result: WdioStoryTestResult = { storyId: entry.id, status: 'failed', durationMs: 0 };
      let failure: unknown;
      try {
        const live = await desktop.listStories();
        if (live.endpoint !== options.platform || live.platformManifestDigest !== options.manifest.platformManifestDigest) {
          throw new Error('The running Storybook manifest is stale or targets a different platform. Restart storybook driver and the app.');
        }
        await desktop.resetStory(entry.id);
        const resultPath = path.join(directory, `${index}.json`);
        const workerOptions: WdioWorkerOptions = {
          attachment: {
            capabilities: desktop.browser.capabilities,
            sessionId: desktop.browser.sessionId,
            url: options.url,
          },
          resultPath,
          storyId: entry.id,
          timeoutMs: settings.timeoutMs,
        };
        const specPath = path.join(directory, `${index}.test.mjs`);
        fs.writeFileSync(
          specPath,
          `import { registerWdioStoryTest } from ${JSON.stringify(workerUrl)};\n` +
            `registerWdioStoryTest(${JSON.stringify(workerOptions)}, (${code}));\n`,
          { mode: 0o600 },
        );
        await runWorker(
          runner,
          {
            command: process.execPath,
            args: [
              '--test',
              '--test-concurrency=1',
              '--test-force-exit',
              `--test-timeout=${Math.min(settings.timeoutMs + 5000, 2_147_483_647)}`,
              `--test-reporter=${settings.reporter}`,
              specPath,
            ],
            cwd: options.config.projectRoot,
            env: {},
          },
          Math.min(settings.timeoutMs + 5000, 2_147_483_647),
        );
        const outcome: unknown = JSON.parse(fs.readFileSync(resultPath, 'utf8'));
        if (!isWorkerResult(outcome)) {
          throw new Error(`The wdio worker for ${entry.id} exited without a valid result.`);
        }
        result.status = outcome.status;
        if (outcome.status === 'skipped') {
          result.skipReason = outcome.skipReason;
        }
      } catch (error) {
        failure = error;
        result.error = errorMessage(error);
        result.evidenceErrors = await captureFailure(desktop, artifacts, entry.id);
      }
      try {
        await desktop.delete();
      } catch (cleanupError) {
        throw new AggregateError(
          failure === undefined ? [cleanupError] : [failure, cleanupError],
          `Could not release the wdio session for ${entry.id}; stopping before another test starts.`,
        );
      }
      result.durationMs = Date.now() - started;
      results.push(result);
    }
  } catch (error) {
    infrastructureFailure = error;
  }
  const failures: unknown[] = infrastructureFailure === undefined ? [] : [infrastructureFailure];
  if (results.some(({ status }) => status === 'failed')) {
    failures.push(
      new Error(
        `Executable wdio stories failed: ${results
          .filter(({ status }) => status === 'failed')
          .map(({ storyId }) => storyId)
          .join(', ')}. ` + `See ${path.join(artifacts.root, 'run.json')}.`,
      ),
    );
  }
  try {
    artifacts.writeMetadata('run', {
      endpoint: options.platform,
      platformManifestDigest: options.manifest.platformManifestDigest,
      status: failures.length ? 'failed' : 'passed',
      ...(infrastructureFailure === undefined ? {} : { error: errorMessage(infrastructureFailure) }),
      tests: results,
    });
  } catch (error) {
    failures.push(error);
  }
  try {
    fs.rmSync(directory, { recursive: true, force: true });
  } catch (error) {
    failures.push(error);
  }
  if (failures.length === 1) {
    throw failures[0];
  }
  if (failures.length > 1) {
    throw new AggregateError(failures, 'Executable wdio tests and evidence/cleanup failed.');
  }
  return results;
}

function isWorkerResult(value: unknown): value is { status: 'passed' } | { status: 'skipped'; skipReason: string } {
  return (
    typeof value === 'object' &&
    value !== null &&
    'status' in value &&
    (value.status === 'passed' || (value.status === 'skipped' && 'skipReason' in value && typeof value.skipReason === 'string'))
  );
}

async function captureFailure(desktop: DesktopWebdriverSession, artifacts: ArtifactManager, storyId: string): Promise<string[]> {
  const errors: string[] = [];
  for (const capture of [
    async () => artifacts.writeSource(storyId, 'failure-source', await desktop.session.getPageSource()),
    async () => artifacts.writeTree(storyId, 'failure-tree', await desktop.session.getTree()),
  ]) {
    try {
      await capture();
    } catch (error) {
      errors.push(errorMessage(error));
    }
  }
  return errors;
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

async function runWorker(runner: DesktopCommandRunner, command: PreparedDesktopCommand, timeoutMs: number): Promise<void> {
  const worker = runner.start(command);
  let timer: ReturnType<typeof setTimeout> | undefined;
  let failure: unknown;
  try {
    const exitCode = await Promise.race([
      worker.completed,
      new Promise<never>((_resolve, reject) => {
        timer = setTimeout(() => reject(new Error(`Executable wdio worker exceeded its ${timeoutMs}ms process deadline.`)), timeoutMs);
      }),
    ]);
    if (exitCode !== 0) {
      throw new Error(`Executable wdio worker exited with code ${exitCode}; see the test reporter for assertion details.`);
    }
  } catch (error) {
    failure = error;
  } finally {
    clearTimeout(timer);
  }
  try {
    await worker.stop();
  } catch (error) {
    throw new AggregateError(failure === undefined ? [error] : [failure, error], 'Could not stop the owned wdio worker.');
  }
  if (failure !== undefined) {
    throw failure;
  }
}
