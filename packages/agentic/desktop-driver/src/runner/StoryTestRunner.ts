import { randomUUID } from 'node:crypto';

import type {
  DesktopArtifact,
  DesktopStoryRunResult,
  DesktopStoryStepResult,
  DesktopStoryTestResult,
  DesktopTestStatus,
} from '../authoring/results.js';
import type {
  DesktopStoryCapability,
  DesktopStoryExpectation,
  DesktopStorySelector,
  DesktopStoryStep,
  DesktopStoryTest,
} from '../authoring/storyTests.js';
import { resolveDesktopStoryTests } from '../authoring/storyTests.js';
import type { ArtifactManager } from '../artifacts/ArtifactManager.js';
import type { DesktopElementClient, DesktopSessionClient } from '../client/DesktopDriverClient.js';
import { WebDriverError } from '../protocol/errors.js';
import { webElementIdentifier } from '../protocol/constants.js';
import type { DesktopEndpoint, DesktopPlatformName, WebDriverActionSequence } from '../protocol/types.js';
import type { DesktopStoryManifest, DesktopStoryManifestEntry } from '../storybook.js';

export type DesktopStoryTestSelection = {
  shardCount?: number;
  shardIndex?: number;
  story?: string;
  tag?: string;
  test?: string;
};

export type DesktopStoryTestRunnerOptions = {
  artifacts?: ArtifactManager;
  endpoint: DesktopEndpoint;
  manifest: DesktopStoryManifest;
  platformName: DesktopPlatformName;
  requiredCapabilities?: readonly DesktopStoryCapability[];
  runId?: string;
  selection?: DesktopStoryTestSelection;
  session: DesktopSessionClient;
  signal?: AbortSignal;
  targetId: string;
};

type SelectedTest = {
  entry: DesktopStoryManifestEntry;
  test: DesktopStoryTest;
};

export async function runDesktopStoryTests({
  artifacts,
  endpoint,
  manifest,
  platformName,
  requiredCapabilities = [],
  runId = randomUUID(),
  selection,
  session,
  signal,
  targetId,
}: DesktopStoryTestRunnerOptions): Promise<DesktopStoryRunResult> {
  const startedAt = new Date();
  artifacts?.prepareRun();
  const selected = selectDesktopStoryTests(manifest, endpoint, selection);
  if (selected.length === 0) {
    throw new Error('No desktop story tests matched the requested selection.');
  }
  const results: DesktopStoryTestResult[] = [];
  artifacts?.writeMetadata('host', {
    capabilities: session.capabilities,
    endpoint,
    platformName,
    targetId,
  });

  const unavailableRunCapabilities = missingCapabilities(session.capabilities, requiredCapabilities);
  if (unavailableRunCapabilities.length > 0) {
    const reason = `Required Desktop Driver capabilities are unavailable: ${unavailableRunCapabilities.join(', ')}`;
    results.push(...selected.map((item) => infrastructureResult(item, reason)));
  }

  if (unavailableRunCapabilities.length === 0) {
    for (const [index, item] of selected.entries()) {
      if (signal?.aborted) {
        results.push(cancelledResult(item, 'Run cancelled before the test started.'));
        continue;
      }
      results.push(
        await runTest({
          artifacts,
          item,
          runId: `${runId}-${index + 1}`,
          session,
          signal,
        }),
      );
    }
  }

  const summary = summarize(results);
  const result: DesktopStoryRunResult = {
    accessibility: summarizeAccessibility(selected, results),
    endpoint,
    finishedAt: new Date().toISOString(),
    manifest: {
      catalog: manifest.catalogSetDigest,
      platform: manifest.platformManifestDigest,
      portable: manifest.portablePlanDigest,
    },
    platformName,
    runId,
    schemaVersion: 2,
    startedAt: startedAt.toISOString(),
    status: summary.failed > 0 ? 'failed' : summary.passed > 0 ? 'passed' : 'incomplete',
    summary,
    targetId,
    tests: results,
  };
  artifacts?.writeRunResult(result);
  return result;
}

export function selectDesktopStoryTests(
  manifest: DesktopStoryManifest,
  endpoint: DesktopEndpoint,
  selection: DesktopStoryTestSelection = {},
): SelectedTest[] {
  validateShard(selection);
  const selected = manifest.entries
    .filter((entry) => !selection.story || matchesPattern(entry.id, selection.story))
    .filter((entry) => !selection.tag || entry.tags.includes(selection.tag))
    .flatMap((entry) =>
      (entry.tests ? (resolveDesktopStoryTests(entry.tests, endpoint)?.tests ?? []) : [])
        .filter((test) => !selection.test || matchesPattern(test.id, selection.test))
        .map((test) => ({ entry, test })),
    )
    .sort((left, right) => {
      const traversalOrder = Number(left.entry.traverse === false) - Number(right.entry.traverse === false);
      return traversalOrder || `${left.entry.id}/${left.test.id}`.localeCompare(`${right.entry.id}/${right.test.id}`);
    });

  const shardCount = selection.shardCount;
  const shardIndex = selection.shardIndex;
  if (shardCount === undefined || shardIndex === undefined) {
    return selected;
  }
  return selected.filter((_item, index) => index % shardCount === shardIndex);
}

async function runTest({
  artifacts,
  item,
  runId,
  session,
  signal,
}: {
  artifacts?: ArtifactManager;
  item: SelectedTest;
  runId: string;
  session: DesktopSessionClient;
  signal?: AbortSignal;
}): Promise<DesktopStoryTestResult> {
  const started = Date.now();
  const title = item.test.title ?? item.test.id;
  if (item.test.quarantine) {
    if (item.test.quarantine.expires < new Date().toISOString().slice(0, 10)) {
      return {
        artifacts: [],
        durationMs: Date.now() - started,
        error: `Quarantine expired on ${item.test.quarantine.expires}: ${item.test.quarantine.issue}`,
        quarantine: item.test.quarantine,
        status: 'failed',
        steps: [],
        storyId: item.entry.id,
        testId: item.test.id,
        title,
      };
    }
    return {
      artifacts: [],
      durationMs: Date.now() - started,
      quarantine: item.test.quarantine,
      skipReason: `Quarantined until ${item.test.quarantine.expires}: ${item.test.quarantine.issue}`,
      status: 'quarantined',
      steps: [],
      storyId: item.entry.id,
      testId: item.test.id,
      title,
    };
  }
  const missing = missingCapabilities(session.capabilities, item.test.requires ?? []);
  if (missing.length > 0) {
    return {
      artifacts: [],
      durationMs: Date.now() - started,
      skipReason: `Unsupported capabilities: ${missing.join(', ')}`,
      status: 'skipped',
      steps: [],
      storyId: item.entry.id,
      testId: item.test.id,
      title,
    };
  }

  const steps: DesktopStoryStepResult[] = [];
  const testArtifacts: DesktopArtifact[] = [];
  const testDirectory = artifacts?.testDirectory(item.entry.id, item.test.id) ?? `${item.entry.id}-${item.test.id}`;
  let status: DesktopTestStatus = 'passed';
  let errorMessage: string | undefined;
  try {
    throwIfAborted(signal);
    await withAbort(session.selectStory(item.entry.id, runId), signal);
    for (const [index, step] of item.test.steps.entries()) {
      throwIfAborted(signal);
      const result = await runStep(session, step, index, artifacts, testDirectory, signal);
      steps.push(result);
      testArtifacts.push(...result.artifacts);
      if (result.status === 'failed') {
        status = classifyError(result.errorObject);
        errorMessage = result.error;
        break;
      }
    }
  } catch (error) {
    status = classifyError(error);
    errorMessage = error instanceof Error ? error.message : String(error);
  }
  try {
    await session.releaseActions();
  } catch (error) {
    const cleanupError = error instanceof Error ? error.message : String(error);
    if (status === 'passed') {
      status = 'infrastructure-error';
      errorMessage = `Input cleanup failed: ${cleanupError}`;
    } else {
      errorMessage = `${errorMessage ?? 'Test failed.'} Input cleanup failed: ${cleanupError}`;
    }
  }
  if (signal?.aborted && status === 'passed') {
    status = 'cancelled';
    errorMessage = 'Run cancelled during input cleanup.';
  }

  if (status !== 'passed' && artifacts) {
    const captured = await captureFailureArtifacts(session, artifacts, testDirectory);
    testArtifacts.push(...captured.artifacts);
    if (captured.error) {
      errorMessage = `${errorMessage ?? 'Test failed.'} Evidence capture failed: ${captured.error}`;
    }
  }

  return {
    artifacts: testArtifacts,
    durationMs: Date.now() - started,
    ...(errorMessage ? { error: errorMessage } : {}),
    status,
    steps,
    storyId: item.entry.id,
    testId: item.test.id,
    title,
  };
}

type InternalStepResult = DesktopStoryStepResult & {
  errorObject?: unknown;
};

async function runStep(
  session: DesktopSessionClient,
  step: DesktopStoryStep,
  index: number,
  artifacts: ArtifactManager | undefined,
  testDirectory: string,
  signal?: AbortSignal,
): Promise<InternalStepResult> {
  const started = Date.now();
  const stepArtifacts: DesktopArtifact[] = [];
  try {
    throwIfAborted(signal);
    if ('expect' in step) {
      await withAbort(assertDesktopExpectation(session, step.expect), signal);
    } else {
      await withAbort(performAction(session, step, artifacts, testDirectory, stepArtifacts, signal), signal);
    }
    throwIfAborted(signal);
    return { artifacts: stepArtifacts, durationMs: Date.now() - started, index, status: 'passed' };
  } catch (error) {
    return {
      artifacts: stepArtifacts,
      durationMs: Date.now() - started,
      error: error instanceof Error ? error.message : String(error),
      errorObject: error,
      index,
      status: 'failed',
    };
  }
}

async function performAction(
  session: DesktopSessionClient,
  step: Exclude<DesktopStoryStep, { expect: DesktopStoryExpectation }>,
  artifacts: ArtifactManager | undefined,
  testDirectory: string,
  stepArtifacts: DesktopArtifact[],
  signal?: AbortSignal,
): Promise<void> {
  switch (step.action) {
    case 'actions':
      await session.performActions(step.sequences);
      return;
    case 'clear':
      await (await findDesktopElement(session, step.target)).clear();
      return;
    case 'click':
      await (await findDesktopElement(session, step.target)).click();
      return;
    case 'doubleClick': {
      const element = await findDesktopElement(session, step.target);
      await element.click();
      await element.click();
      return;
    }
    case 'focus':
      await (await findDesktopElement(session, step.target)).focus();
      return;
    case 'keys':
      await session.performActions(keySequences(step.value));
      return;
    case 'note':
      return;
    case 'pause':
      await abortableDelay(step.durationMs, signal);
      return;
    case 'screenshot': {
      const image = step.target ? await (await findDesktopElement(session, step.target)).takeScreenshot() : await session.takeScreenshot();
      if (artifacts) {
        stepArtifacts.push(artifacts.writeScreenshot(testDirectory, step.name, image));
      }
      return;
    }
    case 'scroll': {
      const origin = step.target ? toElementReference(await findDesktopElement(session, step.target)) : 'viewport';
      await session.performActions([
        {
          id: 'desktop-story-wheel',
          type: 'wheel',
          actions: [
            {
              type: 'scroll',
              deltaX: step.deltaX ?? 0,
              deltaY: step.deltaY,
              duration: 0,
              origin,
              x: 0,
              y: 0,
            },
          ],
        },
      ]);
      return;
    }
    case 'setArgs':
      await session.updateStoryArgs(requireCurrentStory(await session.getCurrentStory()), step.args);
      return;
    case 'source': {
      const source = await session.getPageSource();
      if (artifacts) {
        stepArtifacts.push(artifacts.writeSource(testDirectory, step.name, source));
      }
      return;
    }
    case 'type':
      await (await findDesktopElement(session, step.target)).sendKeys(step.text);
      return;
    case 'wait':
      await waitFor(session, step, signal);
      return;
  }
}

export async function assertDesktopExpectation(session: DesktopSessionClient, expectation: DesktopStoryExpectation): Promise<void> {
  const elements = await findDesktopElements(session, expectation.target);
  if (expectation.state === 'count') {
    assertEqual(elements.length, expectation.value, 'count');
    return;
  }
  if (expectation.state === 'exists') {
    assertEqual(elements.length > 0, expectation.value ?? true, 'exists');
    return;
  }
  const element = elements[0];
  if (!element) {
    throw new DesktopAssertionError('Expected element does not exist.');
  }
  let actual: unknown;
  switch (expectation.state) {
    case 'accessibleName':
      actual = await element.getAttribute('name');
      break;
    case 'checked':
      actual = await element.getProperty('checked');
      break;
    case 'displayed':
      actual = await element.isDisplayed();
      break;
    case 'enabled':
      actual = await element.isEnabled();
      break;
    case 'expanded':
      actual = await element.getProperty('expanded');
      break;
    case 'focused':
      actual = await element.getProperty('focused');
      break;
    case 'role':
      actual = await element.getTagName();
      break;
    case 'selected':
      actual = await element.isSelected();
      break;
    case 'text':
      actual = await element.getText();
      break;
    case 'value':
      actual = await element.getProperty('value');
      break;
    default:
      throw new DesktopAssertionError(`Unsupported expectation "${expectation.state}".`);
  }
  assertEqual(actual, expectation.value ?? true, expectation.state);
}

async function waitFor(
  session: DesktopSessionClient,
  step: Extract<DesktopStoryStep, { action: 'wait' }>,
  signal?: AbortSignal,
): Promise<void> {
  const deadline = Date.now() + (step.timeoutMs ?? 5000);
  let lastError: unknown;
  do {
    throwIfAborted(signal);
    try {
      if (step.until) {
        await assertDesktopExpectation(session, step.until);
      } else if (step.target) {
        await findDesktopElement(session, step.target);
      }
      throwIfAborted(signal);
      return;
    } catch (error) {
      if (error instanceof DesktopRunCancelledError) {
        throw error;
      }
      lastError = error;
    }
    await withAbort(delay(Math.min(50, Math.max(1, deadline - Date.now()))), signal);
  } while (Date.now() < deadline);
  throw new WebDriverError('timeout', `Wait condition was not met: ${(lastError as Error)?.message ?? 'unknown condition'}`);
}

export async function findDesktopElement(session: DesktopSessionClient, selector: DesktopStorySelector): Promise<DesktopElementClient> {
  const elements = await findDesktopElements(session, selector);
  if (!elements[0]) {
    throw new WebDriverError('no such element', `No element matched ${JSON.stringify(selector)}.`);
  }
  return elements[0];
}

export async function findDesktopElements(session: DesktopSessionClient, selector: DesktopStorySelector): Promise<DesktopElementClient[]> {
  if ('testId' in selector) {
    return session.findElements('accessibility id', selector.testId);
  }
  if ('accessibleName' in selector) {
    return session.findElements('link text', selector.accessibleName);
  }
  if ('text' in selector) {
    return session.findElements('-furn:text', selector.text);
  }
  const candidates = await session.findElements('tag name', selector.role);
  if (!selector.name) {
    return candidates;
  }
  const matches: DesktopElementClient[] = [];
  for (const candidate of candidates) {
    if ((await candidate.getAttribute('name')) === selector.name) {
      matches.push(candidate);
    }
  }
  return matches;
}

function classifyError(error: unknown): DesktopTestStatus {
  if (error instanceof DesktopRunCancelledError) {
    return 'cancelled';
  }
  if (error instanceof WebDriverError) {
    if (error.code === 'timeout') {
      return 'timed-out';
    }
    if (error.code === 'invalid session id' || error.code === 'session not created' || error.code === 'unknown error') {
      return 'infrastructure-error';
    }
  }
  return error instanceof DesktopAssertionError ? 'failed' : 'failed';
}

async function captureFailureArtifacts(
  session: DesktopSessionClient,
  artifacts: ArtifactManager,
  testDirectory: string,
): Promise<{ artifacts: DesktopArtifact[]; error?: string }> {
  const captured: DesktopArtifact[] = [];
  const errors: string[] = [];
  try {
    captured.push(artifacts.writeScreenshot(testDirectory, 'failure', await session.takeScreenshot()));
  } catch (error) {
    errors.push(error instanceof Error ? error.message : String(error));
  }
  try {
    captured.push(artifacts.writeSource(testDirectory, 'failure-source', await session.getPageSource()));
  } catch (error) {
    errors.push(error instanceof Error ? error.message : String(error));
  }
  try {
    captured.push(artifacts.writeTree(testDirectory, 'failure-tree', await session.getTree()));
  } catch (error) {
    errors.push(error instanceof Error ? error.message : String(error));
  }
  return { artifacts: captured, ...(errors.length > 0 ? { error: errors.join('; ') } : {}) };
}

function missingCapabilities(
  capabilities: Readonly<Record<string, unknown>>,
  required: readonly DesktopStoryCapability[],
): DesktopStoryCapability[] {
  const features = capabilities['furn:features'];
  if (!features || typeof features !== 'object') {
    return [...required];
  }
  const values = features as Record<string, unknown>;
  const mappings: Record<DesktopStoryCapability, string> = {
    'accessibility-click': 'accessibilityClick',
    'element-screenshot': 'elementScreenshot',
    focus: 'focus',
    keyboard: 'keyboard',
    'physical-click': 'physicalClick',
    screenshot: 'screenshot',
    wheel: 'wheel',
  };
  return required.filter((capability) => values[mappings[capability]] !== true);
}

function validateShard(selection: DesktopStoryTestSelection): void {
  if (selection.shardCount === undefined && selection.shardIndex === undefined) {
    return;
  }
  const shardCount = selection.shardCount;
  const shardIndex = selection.shardIndex;
  if (
    !Number.isInteger(shardCount) ||
    !Number.isInteger(shardIndex) ||
    shardCount === undefined ||
    shardIndex === undefined ||
    shardCount < 1 ||
    shardIndex < 0 ||
    shardIndex >= shardCount
  ) {
    throw new TypeError('Shard selection requires 0 <= shardIndex < shardCount.');
  }
}

function matchesPattern(value: string, pattern: string): boolean {
  const expression = new RegExp(`^${pattern.split('*').map(escapeRegExp).join('.*')}$`);
  return expression.test(value);
}

function escapeRegExp(value: string): string {
  return value.replaceAll(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function keySequences(keys: readonly string[]): WebDriverActionSequence[] {
  return [
    {
      id: 'desktop-story-keyboard',
      type: 'key',
      actions: keys.flatMap((value) => [
        { type: 'keyDown', value },
        { type: 'keyUp', value },
      ]),
    },
  ];
}

function toElementReference(element: DesktopElementClient): { [webElementIdentifier]: string } {
  return { [webElementIdentifier]: element.id };
}

function requireCurrentStory(story: { storyId: string } | null): string {
  if (!story) {
    throw new Error('Storybook did not report a current story.');
  }
  return story.storyId;
}

function assertEqual(actual: unknown, expected: unknown, label: string): void {
  if (!Object.is(actual, expected)) {
    throw new DesktopAssertionError(`Expected ${label} to be ${JSON.stringify(expected)}, received ${JSON.stringify(actual)}.`);
  }
}

function cancelledResult(item: SelectedTest, reason: string): DesktopStoryTestResult {
  return {
    artifacts: [],
    durationMs: 0,
    error: reason,
    status: 'cancelled',
    steps: [],
    storyId: item.entry.id,
    testId: item.test.id,
    title: item.test.title ?? item.test.id,
  };
}

function infrastructureResult(item: SelectedTest, reason: string): DesktopStoryTestResult {
  return {
    artifacts: [],
    durationMs: 0,
    error: reason,
    status: 'infrastructure-error',
    steps: [],
    storyId: item.entry.id,
    testId: item.test.id,
    title: item.test.title ?? item.test.id,
  };
}

function summarize(results: readonly DesktopStoryTestResult[]): DesktopStoryRunResult['summary'] {
  return {
    failed: results.filter(({ status }) => !['passed', 'quarantined', 'skipped'].includes(status)).length,
    passed: results.filter(({ status }) => status === 'passed').length,
    quarantined: results.filter(({ status }) => status === 'quarantined').length,
    selected: results.length,
    skipped: results.filter(({ status }) => status === 'skipped').length,
  };
}

function summarizeAccessibility(
  selected: readonly SelectedTest[],
  results: readonly DesktopStoryTestResult[],
): DesktopStoryRunResult['accessibility'] {
  const accessibility: DesktopStoryRunResult['accessibility'] = {
    nameAssertions: { failed: 0, passed: 0 },
    reachabilityAssertions: { failed: 0, passed: 0 },
    roleAssertions: { failed: 0, passed: 0 },
  };
  for (const [testIndex, item] of selected.entries()) {
    const result = results[testIndex];
    if (!result) {
      continue;
    }
    for (const [stepIndex, step] of item.test.steps.entries()) {
      if (!('expect' in step)) {
        continue;
      }
      const bucket =
        step.expect.state === 'accessibleName'
          ? accessibility.nameAssertions
          : step.expect.state === 'focused'
            ? accessibility.reachabilityAssertions
            : step.expect.state === 'role'
              ? accessibility.roleAssertions
              : undefined;
      const stepResult = result.steps.find(({ index }) => index === stepIndex);
      if (!bucket || !stepResult) {
        continue;
      }
      bucket[stepResult.status === 'passed' ? 'passed' : 'failed'] += 1;
    }
  }
  return accessibility;
}

export class DesktopAssertionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DesktopAssertionError';
  }
}

class DesktopRunCancelledError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DesktopRunCancelledError';
  }
}

function throwIfAborted(signal: AbortSignal | undefined): void {
  if (signal?.aborted) {
    throw new DesktopRunCancelledError('Run cancelled during the test.');
  }
}

function withAbort<T>(operation: Promise<T>, signal: AbortSignal | undefined): Promise<T> {
  if (!signal) {
    return operation;
  }
  throwIfAborted(signal);
  return new Promise((resolve, reject) => {
    let aborted = false;
    const onAbort = () => {
      aborted = true;
    };
    signal.addEventListener('abort', onAbort, { once: true });
    operation.then(
      (value) => {
        signal.removeEventListener('abort', onAbort);
        if (aborted) {
          reject(new DesktopRunCancelledError('Run cancelled during the test.'));
        } else {
          resolve(value);
        }
      },
      (error: unknown) => {
        signal.removeEventListener('abort', onAbort);
        reject(aborted ? new DesktopRunCancelledError('Run cancelled during the test.') : error);
      },
    );
  });
}

function delay(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function abortableDelay(milliseconds: number, signal: AbortSignal | undefined): Promise<void> {
  if (!signal) {
    return delay(milliseconds);
  }
  throwIfAborted(signal);
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      signal.removeEventListener('abort', onAbort);
      resolve();
    }, milliseconds);
    const onAbort = () => {
      clearTimeout(timer);
      reject(new DesktopRunCancelledError('Run cancelled during the test.'));
    };
    signal.addEventListener('abort', onAbort, { once: true });
  });
}
