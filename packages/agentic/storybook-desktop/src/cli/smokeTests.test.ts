import path from 'node:path';

import type { DesktopStoryRunResult } from '@fluentui-react-native/desktop-driver/authoring';

import { formatDesktopStorybookSmokeTestSummary, runDesktopStorybookSmokeTests, type DesktopStorybookSmokeConnector } from './smokeTests';

const passedResult: DesktopStoryRunResult = {
  accessibility: {
    nameAssertions: { failed: 0, passed: 0 },
    reachabilityAssertions: { failed: 0, passed: 0 },
    roleAssertions: { failed: 0, passed: 1 },
  },
  endpoint: 'windows',
  finishedAt: '2026-08-30T08:00:01.000Z',
  manifest: {
    catalog: 'catalog-digest',
    platform: 'windows-digest',
    portable: 'portable-digest',
  },
  platformName: 'windows',
  runId: 'smoke-run',
  schemaVersion: 2,
  startedAt: '2026-08-30T08:00:00.000Z',
  status: 'passed',
  summary: { failed: 0, passed: 1, quarantined: 0, selected: 2, skipped: 1 },
  targetId: 'storybook-windows',
  tests: [
    {
      artifacts: [],
      durationMs: 10,
      status: 'passed',
      steps: [],
      storyId: 'components-button--default',
      testId: 'pointer-focus',
      title: 'Pointer focus',
    },
    {
      artifacts: [],
      durationMs: 0,
      skipReason: 'Unsupported capabilities: focus',
      status: 'skipped',
      steps: [],
      storyId: 'components-button--default',
      testId: 'keyboard-focus',
      title: 'Keyboard focus',
    },
  ],
};

describe('runDesktopStorybookSmokeTests', () => {
  test('runs desktop-e2e plans under the platform artifact root and closes the session', async () => {
    const runStoryTests = jest.fn(async () => passedResult);
    const deleteSession = jest.fn(async () => undefined);
    const connect: DesktopStorybookSmokeConnector = jest.fn(async () => ({
      delete: deleteSession,
      runStoryTests,
    }));

    const result = await runDesktopStorybookSmokeTests(
      {
        // eslint-disable-next-line @microsoft/sdl/no-insecure-url -- test-only loopback service
        driverUrl: 'http://127.0.0.1:4444',
        platform: 'windows',
        projectRoot: 'C:\\repo\\storybook',
        targetId: 'storybook-windows',
      },
      connect,
    );

    expect(connect).toHaveBeenCalledWith({
      launchMode: 'attach',
      platformName: 'windows',
      targetId: 'storybook-windows',
      // eslint-disable-next-line @microsoft/sdl/no-insecure-url -- test-only loopback service
      url: 'http://127.0.0.1:4444',
    });
    expect(runStoryTests).toHaveBeenCalledWith({
      artifactsRoot: path.join('C:\\repo\\storybook', 'artifacts', 'windows', 'desktop-driver'),
      requiredCapabilities: [],
      selection: {
        tag: 'desktop-e2e',
      },
    });
    expect(deleteSession).toHaveBeenCalledTimes(1);
    expect(result).toBe(passedResult);
    expect(formatDesktopStorybookSmokeTestSummary(result)).toBe('Ran 2 desktop story tests (1 passed, 1 skipped, 0 quarantined).');
  });

  test('fails the smoke run after preserving a failed result and closing the session', async () => {
    const failedResult: DesktopStoryRunResult = {
      ...passedResult,
      status: 'failed',
      summary: { failed: 1, passed: 0, quarantined: 0, selected: 1, skipped: 0 },
      tests: [
        {
          ...passedResult.tests[0],
          status: 'timed-out',
        },
      ],
    };
    const deleteSession = jest.fn(async () => undefined);
    const connect: DesktopStorybookSmokeConnector = async () => ({
      delete: deleteSession,
      runStoryTests: async () => failedResult,
    });

    await expect(
      runDesktopStorybookSmokeTests(
        {
          // eslint-disable-next-line @microsoft/sdl/no-insecure-url -- test-only loopback service
          driverUrl: 'http://127.0.0.1:4444',
          platform: 'windows',
          projectRoot: 'C:\\repo\\storybook',
          targetId: 'storybook-windows',
        },
        connect,
      ),
    ).rejects.toThrow('Desktop story tests finished with status failed: components-button--default/pointer-focus (timed-out)');
    expect(deleteSession).toHaveBeenCalledTimes(1);
  });

  test('aggregates a failed result with session cleanup failure', async () => {
    const failedResult: DesktopStoryRunResult = {
      ...passedResult,
      status: 'failed',
      summary: { failed: 1, passed: 0, quarantined: 0, selected: 1, skipped: 0 },
      tests: [{ ...passedResult.tests[0], status: 'failed' }],
    };
    const connect: DesktopStorybookSmokeConnector = async () => ({
      delete: async () => {
        throw new Error('cleanup failed');
      },
      runStoryTests: async () => failedResult,
    });

    await expect(
      runDesktopStorybookSmokeTests(
        {
          // eslint-disable-next-line @microsoft/sdl/no-insecure-url -- test-only loopback service
          driverUrl: 'http://127.0.0.1:4444',
          platform: 'windows',
          projectRoot: 'C:\\repo\\storybook',
          targetId: 'storybook-windows',
        },
        connect,
      ),
    ).rejects.toMatchObject({
      errors: [
        expect.objectContaining({ message: expect.stringContaining('status failed') }),
        expect.objectContaining({ message: 'cleanup failed' }),
      ],
    });
  });

  test('rejects incomplete qualification when complete coverage is required', async () => {
    const deleteSession = jest.fn(async () => undefined);
    const connect: DesktopStorybookSmokeConnector = async () => ({
      delete: deleteSession,
      runStoryTests: async () => passedResult,
    });

    await expect(
      runDesktopStorybookSmokeTests(
        {
          // eslint-disable-next-line @microsoft/sdl/no-insecure-url -- test-only loopback service
          driverUrl: 'http://127.0.0.1:4444',
          platform: 'windows',
          projectRoot: 'C:\\repo\\storybook',
          requireComplete: true,
          targetId: 'storybook-windows',
        },
        connect,
      ),
    ).rejects.toThrow('requires complete coverage');
    expect(deleteSession).toHaveBeenCalledTimes(1);
  });
});
