import { reportDigest } from './controlAssessment.ts';
import { checkboxUnitCases, checkboxUnitTestPath } from './controlAssessmentUnit.ts';

/** Synthetic Jest protocol fixture, not an actual Checkbox test execution. */
export function checkboxJestFixture(overrides: Record<string, unknown> = {}) {
  const assertions: {
    fullName: string;
    ancestorTitles: string[];
    title: string;
    status: string;
    failureMessages: string[];
    invocations?: number;
    retryReasons?: string[];
  }[] = checkboxUnitCases.map(({ fullName }) => {
    const win32 = fullName.includes(' accessibility actions ');
    const words = fullName.split(' ');
    const ancestorTitles = win32 ? ['Checkbox', `${words[1]} accessibility actions`] : ['Checkbox'];
    const title = fullName.slice(ancestorTitles.join(' ').length + 1);
    return { fullName, ancestorTitles, title, status: 'passed', failureMessages: [] };
  });
  return {
    numTotalTestSuites: 1,
    numPassedTestSuites: 1,
    numFailedTestSuites: 0,
    numPendingTestSuites: 0,
    numTotalTests: assertions.length,
    numPassedTests: assertions.length,
    numFailedTests: 0,
    numPendingTests: 0,
    numTodoTests: 0,
    numRuntimeErrorTestSuites: 0,
    startTime: Date.parse('2026-10-21T20:00:00.500Z'),
    success: true,
    wasInterrupted: false,
    testResults: [
      {
        name: `C:\\synthetic\\${checkboxUnitTestPath.replace(/\//g, '\\')}`,
        status: 'passed',
        startTime: Date.parse('2026-10-21T20:00:00.600Z'),
        endTime: Date.parse('2026-10-21T20:00:01.000Z'),
        assertionResults: assertions,
      },
    ],
    ...overrides,
  };
}

/** Synthetic existing-package run, including a type suite that must not qualify runtime/type claims. */
export function componentJestFixture() {
  const data = checkboxJestFixture();
  data.testResults.push({
    ...data.testResults[0],
    name: data.testResults[0].name.replace('checkbox.test.tsx', 'checkbox.types.test.ts'),
    assertionResults: [
      {
        fullName: 'Checkbox slot types accepts the public checkbox contract as a slot prop',
        ancestorTitles: ['Checkbox slot types'],
        title: 'accepts the public checkbox contract as a slot prop',
        status: 'passed',
        failureMessages: [],
      },
    ],
  });
  data.numTotalTestSuites++;
  data.numPassedTestSuites++;
  data.numTotalTests++;
  data.numPassedTests++;
  return data;
}

/** Synthetic collector output; this fixture is not native qualification evidence. */
export function desktopEvidenceFixture(smoke: string, overrides: Record<string, unknown> = {}) {
  const story = JSON.parse(smoke);
  const tests = [
    {
      testId: 'navigation:components-checkbox--default',
      title: 'Navigate components-checkbox--default',
      status: 'passed',
      flaky: false,
      attempts: [{ attempt: 0, status: 'passed', durationMs: 1, context: { story: 'components-checkbox--default' } }],
    },
    ...story.wdio.map(
      (entry: { storyId: string; testName?: string; status: string; durationMs: number; skipReason?: string; error?: string }) => {
        const name = entry.testName ?? 'default';
        return {
          testId: `csf-${reportDigest(JSON.stringify([entry.storyId, name]))}`,
          title: `${entry.storyId} / ${name}`,
          status: entry.status,
          flaky: false,
          attempts: [
            {
              attempt: 0,
              status: entry.status,
              durationMs: entry.durationMs,
              ...(entry.skipReason ? { reason: entry.skipReason } : {}),
              ...(entry.status === 'failed'
                ? {
                    failure: {
                      failureId: 'test-failure',
                      kind: 'test',
                      error: { name: 'Error', message: entry.error ?? 'assertion failed' },
                    },
                  }
                : {}),
              context: { endpoint: story.endpoint, story: entry.storyId, test: name },
            },
          ],
        };
      },
    ),
  ];
  const run = {
    schemaVersion: 1,
    runId: 'synthetic-desktop-run',
    kind: 'tests',
    status: story.status,
    startedAt: story.startedAt,
    finishedAt: story.finishedAt,
    durationMs: 1000,
    tests,
    work: [],
    failures: [],
    counts: {
      selected: tests.length,
      executed: tests.filter(({ status }) => status === 'passed' || status === 'failed').length,
      passed: tests.filter(({ status }) => status === 'passed').length,
      failed: tests.filter(({ status }) => status === 'failed').length,
      skipped: tests.filter(({ status }) => status === 'skipped').length,
      unsupported: 0,
      incomplete: 0,
      retries: 0,
      flaky: 0,
    },
    artifacts: [{ path: 'evidence\\win32\\static\\run.json', description: 'Story smoke results' }],
    ...overrides,
  };
  const canonical = JSON.stringify(run);
  const envelope = JSON.stringify({ schemaVersion: 1, format: 'desktop-test', desktopRun: canonical, storyReport: smoke });
  return { run, canonical, envelope };
}
