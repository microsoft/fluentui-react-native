import path from 'node:path';

import type { DesktopStoryRunResult } from '@fluentui-react-native/desktop-driver/authoring';
import { connectDesktopWebdriver } from '@fluentui-react-native/desktop-driver/wdio';
import type { DesktopWebdriverOptions, DesktopWebdriverSession } from '@fluentui-react-native/desktop-driver/wdio';

import type { Platforms } from '../config/platforms.js';

type DesktopStorybookSmokeSession = Pick<DesktopWebdriverSession, 'delete' | 'runStoryTests'>;

export type DesktopStorybookSmokeConnector = (options: DesktopWebdriverOptions) => Promise<DesktopStorybookSmokeSession>;

export type DesktopStorybookSmokeTestOptions = {
  artifactsRoot?: string;
  driverUrl: string;
  platform: Platforms;
  projectRoot: string;
  targetId: string;
};

export async function runDesktopStorybookSmokeTests(
  options: DesktopStorybookSmokeTestOptions,
  connect: DesktopStorybookSmokeConnector = connectDesktopWebdriver,
): Promise<DesktopStoryRunResult> {
  const desktop = await connect({
    platformName: options.platform === 'macos' ? 'macos' : 'windows',
    targetId: options.targetId,
    url: options.driverUrl,
  });
  let result: DesktopStoryRunResult | undefined;
  let runFailure: unknown;

  try {
    result = await desktop.runStoryTests({
      artifactsRoot: options.artifactsRoot ?? path.join(options.projectRoot, 'artifacts', options.platform, 'desktop-driver'),
      selection: {
        story: 'components-*--default',
        tag: 'desktop-e2e',
      },
    });
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
  if (result.status !== 'passed') {
    const failedTests = result.tests.filter(({ status }) => status !== 'passed' && status !== 'skipped');
    throw new Error(
      `${failedTests.length} of ${result.tests.length} desktop story tests failed: ${failedTests
        .map(({ status, storyId, testId }) => `${storyId}/${testId} (${status})`)
        .join(', ')}`,
    );
  }
  return result;
}

export function formatDesktopStorybookSmokeTestSummary(result: DesktopStoryRunResult): string {
  const passed = result.tests.filter(({ status }) => status === 'passed').length;
  const skipped = result.tests.filter(({ status }) => status === 'skipped').length;
  return `Ran ${result.tests.length} desktop story tests (${passed} passed, ${skipped} skipped).`;
}
