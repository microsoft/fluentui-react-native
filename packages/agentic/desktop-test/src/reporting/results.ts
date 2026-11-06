import path from 'node:path';

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
  /** Only true after collector finalization; absent in legacy reports. */
  terminal?: boolean;
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

export type DesktopRunSummary = {
  schemaVersion: 1;
  type: 'summary';
  runId: string;
  kind: 'tests' | 'lifecycle';
  status: TestStatus;
  durationMs: number;
  context?: Pick<EventContext, 'endpoint' | 'renderer'>;
  counts: DesktopRunResult['counts'];
  problems: {
    kind: 'test' | 'infrastructure' | 'unfinished';
    id: string;
    title: string;
    status: TestStatus;
    failureId?: string;
    message?: string;
  }[];
  skippedReasons: string[];
  artifacts: {
    root: string;
    runJson: string;
    eventsJsonl: string;
    junitXml?: string;
    commandLogs: string;
  };
  omissions: { problems: number; skippedReasons: number };
};

const SUMMARY_MAX_BYTES = 4 * 1024;
const SUMMARY_MAX_PROBLEMS = 10;

export function projectDesktopRunSummary(result: DesktopRunResult, root: string): DesktopRunSummary {
  const problems: DesktopRunSummary['problems'] = [
    ...result.failures
      .filter(({ kind }) => kind !== 'test')
      .map((failure) => ({
        kind: 'infrastructure' as const,
        id: clipText(failure.failureId, 96),
        title: clipText(failure.kind, 64),
        status: 'failed' as const,
        failureId: clipText(failure.failureId, 96),
        message: clipText(failure.error.message, 256),
      })),
    ...result.tests
      .filter(({ status }) => status === 'failed' || ['cancelled', 'not-run', 'incomplete'].includes(status))
      .map((test) => {
        const latest = test.attempts.at(-1);
        return {
          kind: 'test' as const,
          id: clipText(test.testId, 96),
          title: clipText(test.title, 128),
          status: test.status,
          ...(latest?.failure ? { failureId: clipText(latest.failure.failureId, 96) } : {}),
          ...(latest?.failure?.error.message || latest?.reason
            ? { message: clipText(latest.failure?.error.message ?? latest.reason!, 256) }
            : {}),
        };
      }),
    ...result.work
      .filter(({ status }) => ['not-run', 'incomplete', 'cancelled'].includes(status))
      .map((work) => ({
        kind: 'unfinished' as const,
        id: clipText(work.workId, 96),
        title: clipText(work.label, 128),
        status: work.status,
      })),
  ];
  const skippedReasons = [
    ...new Set(
      result.tests.flatMap((test) =>
        test.attempts.flatMap((attempt) =>
          attempt.reason && ['skipped', 'unsupported'].includes(attempt.status) ? [clipText(attempt.reason, 256)] : [],
        ),
      ),
    ),
  ];
  const artifacts = {
    root: clipText(root, 512),
    runJson: clipText(path.join(root, 'run.json'), 512),
    eventsJsonl: clipText(path.join(root, 'events.jsonl'), 512),
    ...(result.artifacts.some(({ path: artifactPath }) => artifactPath === 'junit.xml')
      ? { junitXml: clipText(path.join(root, 'junit.xml'), 512) }
      : {}),
    commandLogs: clipText(path.join(root, 'commands'), 512),
  };
  const summary: DesktopRunSummary = {
    schemaVersion: 1,
    type: 'summary',
    runId: clipText(result.runId, 96),
    kind: result.kind,
    status: result.status,
    durationMs: result.durationMs,
    ...(result.context?.endpoint || result.context?.renderer
      ? {
          context: {
            ...(result.context.endpoint ? { endpoint: result.context.endpoint } : {}),
            ...(result.context.renderer ? { renderer: result.context.renderer } : {}),
          },
        }
      : {}),
    counts: result.counts,
    problems: problems.slice(0, SUMMARY_MAX_PROBLEMS),
    skippedReasons: skippedReasons.slice(0, SUMMARY_MAX_PROBLEMS),
    artifacts,
    omissions: {
      problems: Math.max(0, problems.length - SUMMARY_MAX_PROBLEMS),
      skippedReasons: Math.max(0, skippedReasons.length - SUMMARY_MAX_PROBLEMS),
    },
  };
  while (Buffer.byteLength(JSON.stringify(summary)) > SUMMARY_MAX_BYTES && summary.problems.length > 0) {
    summary.problems.pop();
    summary.omissions.problems++;
  }
  while (Buffer.byteLength(JSON.stringify(summary)) > SUMMARY_MAX_BYTES && summary.skippedReasons.length > 0) {
    summary.skippedReasons.pop();
    summary.omissions.skippedReasons++;
  }
  if (Buffer.byteLength(JSON.stringify(summary)) > SUMMARY_MAX_BYTES) {
    summary.context = undefined;
    summary.artifacts = {
      root: clipText(root, 192),
      runJson: clipText(path.join(root, 'run.json'), 192),
      eventsJsonl: clipText(path.join(root, 'events.jsonl'), 192),
      commandLogs: clipText(path.join(root, 'commands'), 192),
    };
  }
  if (Buffer.byteLength(JSON.stringify(summary)) > SUMMARY_MAX_BYTES) {
    summary.problems = [];
    summary.skippedReasons = [];
    summary.artifacts = {
      root: clipText(root, 64),
      runJson: clipText(path.join(root, 'run.json'), 64),
      eventsJsonl: clipText(path.join(root, 'events.jsonl'), 64),
      commandLogs: clipText(path.join(root, 'commands'), 64),
    };
    summary.omissions.problems = problems.length;
    summary.omissions.skippedReasons = skippedReasons.length;
  }
  if (Buffer.byteLength(JSON.stringify(summary)) > SUMMARY_MAX_BYTES) {
    throw new Error('Desktop run summary cannot fit within the 4 KiB output limit.');
  }
  return summary;
}

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

function clipText(value: string, maximumBytes: number): string {
  if (Buffer.byteLength(value) <= maximumBytes) return value;
  const marker = '…';
  let result = '';
  for (const character of value) {
    if (Buffer.byteLength(result + character + marker) > maximumBytes) break;
    result += character;
  }
  return `${result}${marker}`;
}
