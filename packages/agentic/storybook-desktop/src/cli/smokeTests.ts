import path from 'node:path';

import {
  desktopStoryCapabilities,
  type DesktopStoryCapability,
  type DesktopStoryRunResult,
} from '@fluentui-react-native/desktop-driver/authoring';
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
  requireComplete?: boolean;
  requiredCapabilities?: readonly DesktopStoryCapability[];
  targetId: string;
};

export async function runDesktopStorybookSmokeTests(
  options: DesktopStorybookSmokeTestOptions,
  connect: DesktopStorybookSmokeConnector = connectDesktopWebdriver,
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
    result = await desktop.runStoryTests({
      artifactsRoot: options.artifactsRoot ?? path.join(options.projectRoot, 'artifacts', options.platform, 'desktop-driver'),
      requiredCapabilities: options.requiredCapabilities ?? parseRequiredCapabilities(process.env.FURN_STORYBOOK_REQUIRED_CAPABILITIES),
      selection: {
        tag: 'desktop-e2e',
      },
    });
    runFailure = getSmokeTestFailure(result, options);
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
  return result!;
}

export function formatDesktopStorybookSmokeTestSummary(result: DesktopStoryRunResult): string {
  return `Ran ${result.summary.selected} desktop story tests (${result.summary.passed} passed, ${result.summary.skipped} skipped, ${result.summary.quarantined} quarantined).`;
}

function parseRequiredCapabilities(value: string | undefined): DesktopStoryCapability[] {
  if (!value) {
    return [];
  }
  const capabilities = [
    ...new Set(
      value
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  ];
  const unsupported = capabilities.find(
    (capability): capability is string => !desktopStoryCapabilities.includes(capability as DesktopStoryCapability),
  );
  if (unsupported) {
    throw new Error(`FURN_STORYBOOK_REQUIRED_CAPABILITIES contains unsupported capability "${unsupported}".`);
  }
  return capabilities as DesktopStoryCapability[];
}

function getSmokeTestFailure(result: DesktopStoryRunResult | undefined, options: DesktopStorybookSmokeTestOptions): Error | undefined {
  if (!result) {
    return new Error('Desktop story tests completed without a result.');
  }
  if (result.status !== 'passed') {
    const failedTests = result.tests.filter(({ status }) => !['passed', 'quarantined', 'skipped'].includes(status));
    const failureDetail =
      failedTests.length > 0
        ? failedTests.map(({ status, storyId, testId }) => `${storyId}/${testId} (${status})`).join(', ')
        : `${result.summary.skipped} skipped and ${result.summary.quarantined} quarantined`;
    return new Error(`Desktop story tests finished with status ${result.status}: ${failureDetail}`);
  }
  const requireComplete = options.requireComplete ?? process.env.FURN_STORYBOOK_REQUIRE_COMPLETE_TESTS === '1';
  return requireComplete && (result.summary.skipped > 0 || result.summary.quarantined > 0)
    ? new Error(
        `Desktop story test qualification requires complete coverage, but ${result.summary.skipped} tests skipped and ${result.summary.quarantined} are quarantined.`,
      )
    : undefined;
}
