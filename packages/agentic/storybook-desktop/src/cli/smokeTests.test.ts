import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import type { DesktopStoryManifest, DesktopStoryManifestEntry } from '@fluentui-react-native/desktop-driver';
import type { DesktopStoryRunResult } from '@fluentui-react-native/desktop-driver/authoring';

import { makeDesktopStorybookConfig } from '../config/makeDesktopStorybookConfig.js';
import type { runWdioStoryTests } from '../testing/runWdioTests.js';
import { WdioStoryTestRunError } from '../testing/runWdioTests.js';
import {
  formatDesktopStorybookSmokeTestSummary,
  runDesktopStorybookSmokeTests,
  type DesktopStorybookSmokeConnector,
  type DesktopStorybookSmokeTestOptions,
} from './smokeTests.js';

const buttonId = 'components-button--default';
const inputId = 'components-input--typing';

function story(id: string, wdio = false): DesktopStoryManifestEntry {
  return {
    id,
    name: id,
    title: 'Components',
    sourcePath: `${id}.stories.ts`,
    packageName: 'fixture',
    tags: ['desktop-e2e'],
    tests: { version: 1, tests: [{ id: 'verify', steps: [{ action: 'wait', target: { testId: id } }] }] },
    ...(wdio ? { wdio: { exportName: 'Default', digest: 'callback' } } : {}),
  };
}

const manifest: DesktopStoryManifest = {
  endpoint: 'windows',
  entries: [story(buttonId)],
  platformManifestDigest: 'windows-digest',
  portablePlanDigest: 'portable-digest',
  schemaVersion: 1,
};

function planResult(storyId = buttonId): DesktopStoryRunResult {
  return {
    endpoint: 'windows',
    finishedAt: '2026-08-30T08:00:01.000Z',
    manifest: { platform: 'windows-digest', portable: 'portable-digest' },
    platformName: 'windows',
    runId: 'smoke-run',
    schemaVersion: 1,
    startedAt: '2026-08-30T08:00:00.000Z',
    status: 'passed',
    targetId: 'storybook-windows',
    tests: [{ artifacts: [], durationMs: 10, status: 'passed', steps: [], storyId, testId: 'verify', title: 'Verify' }],
  };
}

describe('runDesktopStorybookSmokeTests', () => {
  let root: string;
  let options: DesktopStorybookSmokeTestOptions;
  let errorOutput: { write: jest.Mock };
  beforeEach(() => {
    root = fs.realpathSync.native(fs.mkdtempSync(path.join(os.tmpdir(), 'storybook-smoke-tests-')));
    errorOutput = { write: jest.fn() };
    options = {
      errorOutput,
      config: makeDesktopStorybookConfig({ projectRoot: root }),
      driverUrl: 'https://localhost:4444',
      manifest,
      platform: 'windows',
      targetId: 'storybook-windows',
    };
  });
  afterEach(() => fs.rmSync(root, { recursive: true, force: true }));

  test('runs a story-specific plan selection, closes the session, and persists the combined report', async () => {
    const runStoryTests = jest.fn(async () => planResult());
    const deleteSession = jest.fn(async () => undefined);
    const connect: DesktopStorybookSmokeConnector = jest.fn(async () => ({
      delete: deleteSession,
      listStories: async () => manifest,
      runStoryTests,
    }));
    const result = await runDesktopStorybookSmokeTests(options, connect);
    expect(connect).toHaveBeenCalledWith({
      launchMode: 'attach',
      platformName: 'windows',
      targetId: 'storybook-windows',
      url: options.driverUrl,
    });
    expect(runStoryTests).toHaveBeenCalledWith({
      artifactsRoot: path.join(root, 'artifacts', 'windows', 'desktop-driver'),
      selection: { story: buttonId, tag: 'desktop-e2e' },
      onTestResult: expect.any(Function),
    });
    expect(deleteSession).toHaveBeenCalledTimes(1);
    expect(result.tests).toEqual(planResult().tests);
    expect(formatDesktopStorybookSmokeTestSummary(result)).toBe('Ran 1 desktop story tests (1 passed, 0 skipped).');
    expect(JSON.parse(fs.readFileSync(path.join(root, 'artifacts/windows/desktop-driver/run.json'), 'utf8'))).toMatchObject({
      status: 'passed',
      tests: [{ storyId: buttonId }],
    });
  });

  test('groups static plans and inline callbacks by page, including non-default stories', async () => {
    const events: string[] = [];
    options.manifest = { ...manifest, entries: [story(inputId, true), story(buttonId, true)] };
    options.config = makeDesktopStorybookConfig({ projectRoot: root, wdio: { timeoutMs: 1234, reporter: 'tap' } });
    const connect: DesktopStorybookSmokeConnector = async () => {
      let page: string | undefined;
      return {
        listStories: async () => options.manifest,
        runStoryTests: async ({ selection } = {}) => {
          page = selection?.story;
          events.push(`plans:${page}`);
          return planResult(page);
        },
        delete: async () => {
          events.push(`close:${page}`);
        },
      };
    };
    const runWdio: jest.MockedFunction<typeof runWdioStoryTests> = jest.fn(async ({ story }) => {
      events.push(`wdio:${story}`);
      return [{ storyId: story!, status: 'passed' as const, durationMs: 1 }];
    });
    const result = await runDesktopStorybookSmokeTests(options, connect, runWdio);
    expect(events).toEqual([
      `plans:${buttonId}`,
      `close:${buttonId}`,
      `wdio:${buttonId}`,
      `plans:${inputId}`,
      `close:${inputId}`,
      `wdio:${inputId}`,
    ]);
    expect(runWdio).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ story: buttonId, timeoutMs: 1234, reporter: 'tap', errorOutput }),
      undefined,
    );
    expect(result.tests.map(({ storyId }) => storyId)).toEqual([buttonId, inputId]);
    expect(result.wdio?.map(({ storyId }) => storyId)).toEqual([buttonId, inputId]);
    expect(formatDesktopStorybookSmokeTestSummary(result)).toBe('Ran 4 desktop story tests (4 passed, 0 skipped).');
  });

  test('runs inline-only stories and respects configured callback filters', async () => {
    options.manifest = {
      ...manifest,
      entries: [buttonId, inputId].map((id) => ({ ...story(id, true), tests: undefined })),
    };
    options.config = makeDesktopStorybookConfig({ projectRoot: root, wdio: { story: inputId } });
    const connect = jest.fn();
    const runWdio: jest.MockedFunction<typeof runWdioStoryTests> = jest.fn(async ({ story }) => [
      { storyId: story!, status: 'skipped' as const, durationMs: 0, skipReason: 'Capability unavailable' },
    ]);
    const result = await runDesktopStorybookSmokeTests(options, connect, runWdio);
    expect(connect).not.toHaveBeenCalled();
    expect(runWdio).toHaveBeenCalledTimes(1);
    expect(result.wdio).toMatchObject([{ storyId: inputId, status: 'skipped' }]);
    expect(formatDesktopStorybookSmokeTestSummary(result)).toBe('Ran 1 desktop story tests (0 passed, 1 skipped).');
  });

  test('fails after persisting failed plan results and closing the session', async () => {
    const result = planResult();
    const failedResult: DesktopStoryRunResult = {
      ...result,
      status: 'failed',
      tests: [
        {
          ...result.tests[0],
          status: 'timed-out',
          error: 'Timed out waiting for checkbox state',
          steps: [{ artifacts: [], durationMs: 10, index: 2, status: 'failed', error: 'Timed out waiting for checkbox state' }],
        },
      ],
    };
    const deleteSession = jest.fn(async () => undefined);
    const connect: DesktopStorybookSmokeConnector = async () => ({
      delete: deleteSession,
      listStories: async () => manifest,
      runStoryTests: async (runOptions) => {
        runOptions?.onTestResult?.(failedResult.tests[0]);
        expect(errorOutput.write).toHaveBeenCalledWith(expect.stringContaining(`test "${buttonId}/verify" (timed-out, step 3)`));
        return failedResult;
      },
    });
    await expect(runDesktopStorybookSmokeTests(options, connect)).rejects.toThrow(`${buttonId}/verify (timed-out)`);
    expect(deleteSession).toHaveBeenCalledTimes(1);
    expect(errorOutput.write).toHaveBeenCalledTimes(1);
    expect(errorOutput.write).toHaveBeenCalledWith(expect.stringContaining('Timed out waiting for checkbox state'));
    expect(JSON.parse(fs.readFileSync(path.join(root, 'artifacts/windows/desktop-driver/run.json'), 'utf8')).status).toBe('failed');
  });

  test('keeps callback failures in the smoke report and stops before another page', async () => {
    options.manifest = { ...manifest, entries: [buttonId, inputId].map((id) => ({ ...story(id, true), tests: undefined })) };
    const runWdio = jest.fn(async () => {
      throw new Error('callback failed');
    });
    await expect(runDesktopStorybookSmokeTests(options, jest.fn(), runWdio)).rejects.toThrow('callback failed');
    expect(runWdio).toHaveBeenCalledTimes(1);
    expect(errorOutput.write).toHaveBeenCalledWith(expect.stringContaining(`smoke story "${buttonId}"`));
    expect(errorOutput.write).toHaveBeenCalledWith(expect.stringContaining('callback failed'));
    expect(JSON.parse(fs.readFileSync(path.join(root, 'artifacts/windows/desktop-driver/run.json'), 'utf8'))).toMatchObject({
      status: 'failed',
      wdio: [{ storyId: buttonId, status: 'failed', error: 'callback failed' }],
    });
  });

  test('preserves individual named case results when a callback collection fails', async () => {
    options.manifest = { ...manifest, entries: [{ ...story(buttonId, true), tests: undefined }] };
    const results = [
      { storyId: buttonId, testName: 'first', status: 'passed' as const, durationMs: 1 },
      { storyId: buttonId, testName: 'second', status: 'failed' as const, durationMs: 1, error: 'named assertion' },
    ];
    const runWdio = jest.fn(async () => {
      throw new WdioStoryTestRunError(results, [new Error('named assertion')]);
    });
    await expect(runDesktopStorybookSmokeTests(options, jest.fn(), runWdio)).rejects.toThrow('named assertion');
    expect(JSON.parse(fs.readFileSync(path.join(root, 'artifacts/windows/desktop-driver/run.json'), 'utf8'))).toMatchObject({
      status: 'failed',
      wdio: results,
    });
  });
  test('rejects stale manifests before plans execute and still closes the session', async () => {
    const runStoryTests = jest.fn();
    const deleteSession = jest.fn(async () => undefined);
    const connect: DesktopStorybookSmokeConnector = async () => ({
      delete: deleteSession,
      listStories: async () => ({ ...manifest, platformManifestDigest: 'stale' }),
      runStoryTests,
    });
    await expect(runDesktopStorybookSmokeTests(options, connect)).rejects.toThrow('stale');
    expect(runStoryTests).not.toHaveBeenCalled();
    expect(deleteSession).toHaveBeenCalledTimes(1);
  });

  test('does not connect when no authored tests match', async () => {
    options.manifest = { ...manifest, entries: [] };
    const connect = jest.fn();
    await expect(runDesktopStorybookSmokeTests(options, connect)).rejects.toThrow('No desktop story tests');
    expect(connect).not.toHaveBeenCalled();
  });
});
