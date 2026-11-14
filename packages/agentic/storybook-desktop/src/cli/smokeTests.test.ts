import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import type { DesktopStoryManifest, DesktopStoryManifestEntry } from '@fluentui-react-native/desktop-driver';
import type { DesktopStoryRunResult } from '@fluentui-react-native/desktop-driver/authoring';
import { validateDesktopCaseOptions } from '@fluentui-react-native/desktop-driver/authoring';
import type { DesktopReportWriter } from '@fluentui-react-native/desktop-test/reporting';

import { makeDesktopStorybookConfig } from '../config/makeDesktopStorybookConfig.js';
import type { runWdioStoryTests } from '../testing/runWdioTests.js';
import { WdioStoryTestRunError } from '../testing/runWdioTests.js';
import { csfTestId } from '../testing/selection.js';
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

function declaredStory(id: string, cases: readonly (readonly [name: string, options: unknown])[]): DesktopStoryManifestEntry {
  return {
    ...story(id),
    tests: undefined,
    wdio: {
      exportName: 'Default',
      digest: 'callback',
      testNames: cases.map(([name]) => name),
      cases: cases.map(([name, descriptor]) => ({ name, options: validateDesktopCaseOptions(descriptor) })),
    },
  };
}

function fakeReport(root: string) {
  const emit = jest.fn();
  const report = {
    runId: 'run',
    root,
    emit,
    artifactPath: (name: string) => path.join(root, name),
    failure: jest.fn(),
    fail: jest.fn(),
  } as unknown as DesktopReportWriter;
  return { report, emit };
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
    expect(formatDesktopStorybookSmokeTestSummary(result)).toBe('1 of 1 story tests executed: 1 passed, 0 failed, 0 skipped');
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
    expect(formatDesktopStorybookSmokeTestSummary(result)).toBe('4 of 4 story tests executed: 4 passed, 0 failed, 0 skipped');
  });

  test('applies focused smoke selectors to both plans and WDIO while preserving owned sessions', async () => {
    const focusId = 'components-button--focus-management';
    options.manifest = { ...manifest, entries: [story(buttonId, true), { ...story(focusId, true), tags: ['desktop-focus'] }] };
    options.storyPattern = 'components-*--focus-management';
    options.testTag = 'desktop-focus';
    const runStoryTests = jest.fn(async () => planResult(focusId));
    const deleteSession = jest.fn(async () => undefined);
    const runWdio = jest.fn(async () => [{ storyId: focusId, status: 'passed' as const, durationMs: 1 }]);
    const connect: DesktopStorybookSmokeConnector = jest.fn(async () => ({
      listStories: async () => options.manifest,
      runStoryTests,
      delete: deleteSession,
    }));

    await runDesktopStorybookSmokeTests(options, connect, runWdio);

    expect(connect).toHaveBeenCalledWith(expect.objectContaining({ launchMode: 'attach' }));
    expect(runStoryTests).toHaveBeenCalledWith(expect.objectContaining({ selection: { story: focusId, tag: 'desktop-focus' } }));
    expect(runWdio).toHaveBeenCalledTimes(1);
    expect(runWdio).toHaveBeenCalledWith(expect.objectContaining({ story: focusId, tag: 'desktop-focus' }), undefined);
    expect(deleteSession).toHaveBeenCalledTimes(1);
  });

  test('shares one extraction cache across per-story calls, but not across separate smoke runs', async () => {
    options.manifest = {
      ...manifest,
      entries: [buttonId, inputId].map((id) => ({ ...story(id, true), tests: undefined })),
    };
    const connect = jest.fn();
    const runWdio: jest.MockedFunction<typeof runWdioStoryTests> = jest.fn(async ({ story }) => [
      { storyId: story!, status: 'passed' as const, durationMs: 1 },
    ]);
    await runDesktopStorybookSmokeTests(options, connect, runWdio);
    const first = runWdio.mock.calls[0][0].extractionCache;
    expect(first).toBeDefined();
    expect(runWdio.mock.calls[1][0].extractionCache).toBe(first);
    await runDesktopStorybookSmokeTests(options, connect, runWdio);
    expect(runWdio.mock.calls[2][0].extractionCache).not.toBe(first);
    expect(runWdio.mock.calls[3][0].extractionCache).toBe(runWdio.mock.calls[2][0].extractionCache);
    expect(connect).not.toHaveBeenCalled();
  });

  test.each(['storyPattern', 'testTag'] as const)('rejects an empty %s before connecting', async (key) => {
    options[key] = ' ';
    const connect = jest.fn();
    await expect(runDesktopStorybookSmokeTests(options, connect)).rejects.toThrow('non-empty string');
    expect(connect).not.toHaveBeenCalled();
  });

  test('rejects unmatched focused selections before connecting', async () => {
    options.testTag = 'desktop-focus';
    const connect = jest.fn();
    await expect(runDesktopStorybookSmokeTests(options, connect)).rejects.toThrow('No desktop story tests matched');
    expect(connect).not.toHaveBeenCalled();
  });

  test('rejects a stale empty plan result after closing the session', async () => {
    const deleteSession = jest.fn(async () => undefined);
    await expect(
      runDesktopStorybookSmokeTests(options, async () => ({
        listStories: async () => manifest,
        runStoryTests: async () => ({ ...planResult(), tests: [] }),
        delete: deleteSession,
      })),
    ).rejects.toThrow('No desktop story tests matched');
    expect(deleteSession).toHaveBeenCalledTimes(1);
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
    await expect(runDesktopStorybookSmokeTests(options, connect, runWdio)).rejects.toThrow('only skipped');
    expect(connect).not.toHaveBeenCalled();
    expect(runWdio).toHaveBeenCalledTimes(1);
    expect(JSON.parse(fs.readFileSync(path.join(root, 'artifacts/windows/desktop-driver/run.json'), 'utf8'))).toMatchObject({
      status: 'failed',
      wdio: [{ storyId: inputId, status: 'skipped' }],
    });
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

  describe('input lanes', () => {
    test('announces every selected case up front and runs each story against that announcement', async () => {
      const { report, emit } = fakeReport(root);
      options.report = report;
      options.input = 'accessible';
      options.scope = { domains: { 'rn.renderer': ['fabric', 'paper'] }, values: { 'rn.renderer': 'fabric' } };
      options.manifest = {
        ...manifest,
        entries: [
          declaredStory(buttonId, [
            ['plain', {}],
            ['typed', { requires: ['keyboard'] }],
          ]),
          declaredStory(inputId, [['typing', { requires: ['accessibility-click'] }]]),
        ],
      };
      const runWdio: jest.MockedFunction<typeof runWdioStoryTests> = jest.fn(async ({ story }) => [
        { storyId: story!, testName: 'ran', status: 'passed' as const, durationMs: 1 },
      ]);

      await runDesktopStorybookSmokeTests(options, jest.fn(), runWdio);

      const events = emit.mock.calls.map(([event]) => event);
      expect(events.filter(({ kind }) => kind === 'selection')).toEqual([
        { kind: 'selection', payload: { excluded: { platform: 0, scope: 0, input: 1 } } },
      ]);
      expect(events.filter(({ kind }) => kind === 'work-selected').map(({ payload }) => payload.workId)).toEqual([
        `smoke:${buttonId}`,
        `smoke:${inputId}`,
        csfTestId(buttonId, 'plain'),
        csfTestId(inputId, 'typing'),
      ]);
      expect(runWdio).toHaveBeenCalledWith(
        expect.objectContaining({ story: buttonId, input: 'accessible', scope: options.scope, announced: true, optional: true }),
        undefined,
      );
    });

    test('rejects legacy callbacks before connecting', async () => {
      options.input = 'physical';
      options.manifest = { ...manifest, entries: [{ ...story(buttonId, true), tests: undefined }] };
      const connect = jest.fn();
      await expect(runDesktopStorybookSmokeTests(options, connect)).rejects.toThrow(
        `Input lane "physical" cannot run legacy wdio callbacks; declare them with desktopIt: ${buttonId}.`,
      );
      expect(connect).not.toHaveBeenCalled();
    });

    test('states a lane selection that left every case out and explains why', async () => {
      const { report, emit } = fakeReport(root);
      options.report = report;
      options.input = 'accessible';
      options.manifest = { ...manifest, entries: [declaredStory(buttonId, [['typed', { requires: ['keyboard'] }]])] };
      await expect(runDesktopStorybookSmokeTests(options, jest.fn())).rejects.toThrow(
        'No desktop story tests matched the smoke selection (excluded 0 by platform, 0 by scope, 1 by input).',
      );
      expect(emit).toHaveBeenCalledWith({ kind: 'selection', payload: { excluded: { platform: 0, scope: 0, input: 1 } } });
    });

    test('a lane that executed no wdio test is not a passing run even when static plans passed', async () => {
      options.input = 'accessible';
      options.manifest = { ...manifest, entries: [{ ...story(buttonId), wdio: declaredStory(buttonId, [['plain', {}]]).wdio }] };
      const connect: DesktopStorybookSmokeConnector = async () => ({
        delete: async () => undefined,
        listStories: async () => options.manifest,
        runStoryTests: async () => planResult(),
      });
      const runWdio = jest.fn(async () => [
        { storyId: buttonId, testName: 'plain', status: 'unsupported' as const, gap: 'unsupported' as const, durationMs: 0 },
      ]);
      await expect(runDesktopStorybookSmokeTests(options, connect, runWdio)).rejects.toThrow(
        'Input lane "accessible" executed no wdio story tests; it is not a passing run.',
      );
    });
  });

  test('does not pass a cohort that only skipped or was unsupported', async () => {
    options.manifest = { ...manifest, entries: [{ ...story(buttonId, true), tests: undefined }] };
    const runWdio = jest.fn(async () => [
      { storyId: buttonId, status: 'unsupported' as const, gap: 'unsupported' as const, durationMs: 0 },
    ]);
    await expect(runDesktopStorybookSmokeTests(options, jest.fn(), runWdio)).rejects.toThrow('only skipped or unsupported');
  });

  test('counts what executed against what was selected, and says so when nothing executed', () => {
    const wdio = [{ storyId: buttonId, status: 'passed' as const, durationMs: 1 }];
    expect(formatDesktopStorybookSmokeTestSummary({ ...planResult(), wdio })).toBe(
      '2 of 2 story tests executed: 2 passed, 0 failed, 0 skipped',
    );
    expect(
      formatDesktopStorybookSmokeTestSummary({
        ...planResult(),
        wdio: [...wdio, { storyId: inputId, status: 'unsupported' as const, gap: 'unsupported' as const, durationMs: 0 }],
      }),
    ).toBe('2 of 3 story tests executed: 2 passed, 0 failed, 0 skipped, 1 unsupported (1 declared, 0 quarantined)');
    expect(
      formatDesktopStorybookSmokeTestSummary({
        ...planResult(),
        tests: [],
        wdio: [{ storyId: inputId, status: 'unsupported' as const, gap: 'quarantine' as const, durationMs: 0 }],
      }),
    ).toBe('no story tests executed (0 of 1): 0 passed, 0 failed, 0 skipped, 1 unsupported (0 declared, 1 quarantined)');
  });

  describe('outcome header', () => {
    const outcomes = (emit: jest.Mock) =>
      emit.mock.calls.map(([event]) => event).filter(({ kind, payload }) => kind === 'scope-end' && payload.summary !== undefined);

    test('summarizes a passing run with the count of tests that executed', async () => {
      const { report, emit } = fakeReport(root);
      options.report = report;
      const connect: DesktopStorybookSmokeConnector = async () => ({
        delete: async () => undefined,
        listStories: async () => manifest,
        runStoryTests: async () => planResult(),
      });
      await runDesktopStorybookSmokeTests(options, connect);
      expect(outcomes(emit)).toEqual([
        { kind: 'scope-end', payload: { status: 'passed', summary: '1 of 1 story tests executed: 1 passed, 0 failed, 0 skipped' } },
      ]);
    });

    test('summarizes a failing run with the counts the failure left, not only the error', async () => {
      const { report, emit } = fakeReport(root);
      options.report = report;
      options.manifest = { ...manifest, entries: [{ ...story(buttonId, true), tests: undefined }] };
      const runWdio = jest.fn(async () => {
        throw new Error('callback failed');
      });
      await expect(runDesktopStorybookSmokeTests(options, jest.fn(), runWdio)).rejects.toThrow('callback failed');
      expect(outcomes(emit)).toEqual([
        { kind: 'scope-end', payload: { status: 'failed', summary: '1 of 1 story tests executed: 0 passed, 1 failed, 0 skipped' } },
      ]);
    });

    test('says how many stories were not run when a failure stops the run early', async () => {
      const { report, emit } = fakeReport(root);
      options.report = report;
      options.manifest = { ...manifest, entries: [buttonId, inputId].map((id) => ({ ...story(id, true), tests: undefined })) };
      const runWdio = jest.fn(async () => {
        throw new Error('callback failed');
      });
      await expect(runDesktopStorybookSmokeTests(options, jest.fn(), runWdio)).rejects.toThrow('callback failed');
      expect(outcomes(emit)).toEqual([
        {
          kind: 'scope-end',
          payload: {
            status: 'failed',
            summary: '1 of 1 story tests executed: 0 passed, 1 failed, 0 skipped (stopped early; 1 of 2 stories not run)',
          },
        },
      ]);
    });

    test('names the error when the run fails before any test is counted', async () => {
      const { report, emit } = fakeReport(root);
      options.report = report;
      options.manifest = { ...manifest, entries: [] };
      await expect(runDesktopStorybookSmokeTests(options, jest.fn())).rejects.toThrow('No desktop story tests');
      expect(outcomes(emit)).toEqual([
        { kind: 'scope-end', payload: { status: 'failed', summary: expect.stringContaining('No desktop story tests') } },
      ]);
    });
  });
});
