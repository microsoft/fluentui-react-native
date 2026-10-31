import type { EventContext, ReportFailure, TestStatus } from './protocol.js';

export type DesktopTestAttempt = {
  attempt: number;
  status: TestStatus;
  durationMs: number;
  reason?: string;
  failure?: ReportFailure;
  context?: EventContext;
};
export type DesktopTestResult = {
  testId: string;
  title: string;
  status: TestStatus;
  flaky: boolean;
  attempts: DesktopTestAttempt[];
};
export type DesktopWorkResult = {
  workId: string;
  label: string;
  status: TestStatus;
  context?: EventContext;
};
export type DesktopRunResult = {
  schemaVersion: 1;
  runId: string;
  kind: 'tests' | 'lifecycle';
  status: TestStatus;
  startedAt: string;
  finishedAt: string;
  durationMs: number;
  context?: EventContext;
  counts: {
    selected: number;
    executed: number;
    passed: number;
    failed: number;
    skipped: number;
    unsupported: number;
    incomplete: number;
    retries: number;
    flaky: number;
  };
  tests: DesktopTestResult[];
  work: DesktopWorkResult[];
  failures: ReportFailure[];
  artifacts: { path: string; description: string }[];
};

export function summarizeDesktopRun(
  input: Omit<DesktopRunResult, 'status' | 'counts'> & { optional?: boolean; incomplete?: boolean },
): DesktopRunResult {
  const counts = {
    selected: input.tests.length,
    executed: 0,
    passed: 0,
    failed: 0,
    skipped: 0,
    unsupported: 0,
    incomplete: 0,
    retries: 0,
    flaky: 0,
  };
  for (const test of input.tests) {
    counts.retries += Math.max(0, test.attempts.length - 1);
    if (test.flaky) counts.flaky++;
    if (test.attempts.some(({ status }) => status === 'passed' || status === 'failed')) counts.executed++;
    if (['cancelled', 'not-run', 'incomplete'].includes(test.status)) counts.incomplete++;
    else if (test.status === 'passed') counts.passed++;
    else if (test.status === 'failed') counts.failed++;
    else if (test.status === 'skipped') counts.skipped++;
    else if (test.status === 'unsupported') counts.unsupported++;
  }
  const infrastructureFailed = input.failures.some(({ kind }) => kind !== 'test') || input.work.some(({ status }) => status === 'failed');
  const unfinishedWork = input.work.some(({ status }) => ['not-run', 'incomplete', 'cancelled'].includes(status));
  const noExecution = input.kind === 'tests' && counts.executed === 0;
  const status =
    infrastructureFailed || counts.failed > 0
      ? 'failed'
      : input.incomplete || unfinishedWork || counts.incomplete > 0 || (input.kind === 'tests' && counts.selected === 0)
        ? 'incomplete'
        : noExecution
          ? input.optional
            ? 'skipped'
            : 'incomplete'
          : 'passed';
  const { optional: _optional, incomplete: _incomplete, ...result } = input;
  return { ...result, status, counts };
}

export function desktopRunExitCode(result: DesktopRunResult): number {
  return result.status === 'passed' || result.status === 'skipped' ? 0 : 1;
}

export function renderJUnit(result: DesktopRunResult): string {
  const infrastructure = result.failures.filter(({ kind }) => kind !== 'test');
  const unfinishedWork = result.work.filter(({ status }) => ['not-run', 'incomplete', 'cancelled'].includes(status));
  const incomplete = result.status === 'incomplete' && result.counts.incomplete === 0;
  const cases = result.tests.map((test) => {
    const latest = test.attempts[test.attempts.length - 1];
    const history = JSON.stringify(test.attempts);
    const body =
      test.status === 'failed'
        ? `<failure message="${xml(latest.failure?.error.message ?? 'Test failed')}">${xml(JSON.stringify(latest.failure))}</failure>`
        : test.status === 'passed'
          ? ''
          : ['skipped', 'unsupported'].includes(test.status)
            ? `<skipped message="${xml(latest.reason ?? test.status)}"/>`
            : `<error type="${test.status}" message="${xml(latest.reason ?? 'Missing terminal test result')}"/>`;
    return `<testcase name="${xml(test.title)}" classname="${xml(test.testId)}" time="${latest.durationMs / 1000}">${body}<system-out>${xml(history)}</system-out></testcase>`;
  });
  for (const failure of infrastructure) {
    cases.push(
      `<testcase name="${xml(failure.kind)}" classname="desktop.infrastructure"><error type="${xml(failure.error.name)}" message="${xml(failure.error.message)}">${xml(JSON.stringify(failure.error))}</error></testcase>`,
    );
  }
  for (const work of unfinishedWork)
    cases.push(
      `<testcase name="${xml(work.label)}" classname="desktop.selection"><error type="${work.status}" message="Selected work did not finish."/></testcase>`,
    );
  if (incomplete)
    cases.push(
      '<testcase name="required cohort" classname="desktop.infrastructure"><error type="incomplete" message="No required tests executed or a producer did not finish."/></testcase>',
    );
  return `<?xml version="1.0" encoding="UTF-8"?>\n<testsuites><testsuite name="${xml(result.runId)}" tests="${cases.length}" failures="${result.counts.failed}" errors="${infrastructure.length + unfinishedWork.length + result.counts.incomplete + Number(incomplete)}" skipped="${result.counts.skipped + result.counts.unsupported}" time="${result.durationMs / 1000}">${cases.join('')}</testsuite></testsuites>\n`;
}

export function renderRunSummary(result: DesktopRunResult): string {
  const c = result.counts;
  const reasons = [
    ...new Set(result.tests.flatMap((test) => test.attempts.flatMap((attempt) => (attempt.reason ? [attempt.reason] : [])))),
  ];
  return (
    `## Desktop tests: ${result.status}\n\n` +
    `Run: \`${result.runId}\`; endpoint: ${result.context?.endpoint ?? 'native'}; renderer: ${result.context?.renderer ?? 'not applicable'}.\n\n` +
    `Selected ${c.selected}; executed ${c.executed}; passed ${c.passed}; failed ${c.failed}; skipped ${c.skipped}; unsupported ${c.unsupported}; incomplete ${c.incomplete}; retries ${c.retries}; flaky ${c.flaky}.\n\n` +
    `Selected groups ${result.work.length}; not run ${result.work.filter(({ status }) => status === 'not-run').length}; incomplete ${result.work.filter(({ status }) => status === 'incomplete').length}.\n\n` +
    `Infrastructure/evidence/cleanup failures: ${result.failures.filter(({ kind }) => kind !== 'test').length}.\n\n` +
    (reasons.length
      ? `Reasons:\n${reasons
          .slice(0, 50)
          .map((reason) => `- ${markdown(reason).slice(0, 1000)}`)
          .join('\n')}\n\n`
      : '') +
    `Artifacts (filesystem paths, not upload URLs):\n${result.artifacts
      .slice(0, 50)
      .map((artifact) => `- \`${markdown(artifact.path)}\``)
      .join('\n')}\n`
  );
}

function xml(value: string): string {
  return (
    value
      // eslint-disable-next-line no-control-regex -- XML 1.0 permits only these control characters.
      .replaceAll(/[^\u0009\u000a\u000d\u0020-\ud7ff\ue000-\ufffd\u{10000}-\u{10ffff}]/gu, '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&apos;')
  );
}
function markdown(value: string): string {
  return value.replaceAll(/[\r\n`<>]/g, ' ');
}
