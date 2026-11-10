import path from 'node:path';

import type { EventContext, ReportFailure, SelectionExclusions, TestGap, TestInputReport, TestStatus } from './protocol.js';

export type DesktopTestAttempt = {
  attempt: number;
  status: TestStatus;
  durationMs: number;
  reason?: string;
  /** Present only on an `unsupported` attempt the producer declared in advance, never on a missing requirement. */
  gap?: TestGap;
  /** The input the attempt's session delivered, when the producer read its receipts. */
  input?: TestInputReport;
  failure?: ReportFailure;
  context?: EventContext;
};
/**
 * The input lane a run was asked to execute: the request, where it came from, and how it was held. `policyEnforced` means
 * every session confirmed the lane's `furn:inputMode`, so the driver refused input outside the lane; runs recorded before
 * the driver enforced a policy carry `false`. `masking` names host masks that also applied. Neither qualifies a lane.
 */
export const desktopInputLaneSources = ['option', 'environment', 'driver'] as const;
/** `driver` means the lane was read from the attached driver instance's manifest instead of being requested here. */
export type DesktopInputLaneSource = (typeof desktopInputLaneSources)[number];
/** `host-masked`: this command started the host with the lane's masks. `verified-masked`: a pre-enforcement run checked them. */
export type DesktopInputLaneMasking = 'host-masked' | 'verified-masked';
export type DesktopInputLaneReport =
  | { input: 'accessible'; source: DesktopInputLaneSource; masking?: DesktopInputLaneMasking; policyEnforced: boolean }
  | { input: 'physical'; source: DesktopInputLaneSource; policyEnforced: boolean };
export type DesktopSelectionReport = { excluded: SelectionExclusions };
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
  /** Why the collector reports this work as `incomplete` although its producer finished, such as a group that reported no tests. */
  reason?: string;
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
  /** Set when the run executes one input lane. Lane runs treat undeclared skips and unsupported cases as non-success. */
  lane?: DesktopInputLaneReport;
  /** What producers removed from their selection before execution. Excluded cases are not tests. */
  selection?: DesktopSelectionReport;
  counts: {
    selected: number;
    executed: number;
    passed: number;
    failed: number;
    skipped: number;
    /** Every test whose final status is `unsupported`, declared or not. */
    unsupported: number;
    /** The subset of `unsupported` that carries a declared `unsupported` gap. */
    declaredUnsupported: number;
    /** The subset of `unsupported` that carries a declared `quarantine` gap. */
    quarantined: number;
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
  lane?: DesktopInputLaneReport;
  excluded?: SelectionExclusions;
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

/**
 * The status a test reports across its attempts, in the order they arrived. A passing final attempt passes the test, and
 * it is flaky when an earlier attempt failed. Otherwise any failed attempt decides: a retry that was skipped, unsupported,
 * or never finished cannot erase a failure. With no failed attempt the last attempt decides.
 */
export function decideDesktopTestStatus(attempts: readonly Pick<DesktopTestAttempt, 'status'>[]): TestStatus {
  const last = attempts.at(-1);
  if (!last) return 'incomplete';
  if (last.status === 'passed') return 'passed';
  return attempts.some(({ status }) => status === 'failed') ? 'failed' : last.status;
}

/** The latest attempt whose status is the test's decided status: the one a failure message or reason must come from. */
export function decisiveDesktopAttempt<T extends Pick<DesktopTestAttempt, 'status'>>(attempts: readonly T[]): T | undefined {
  const status = decideDesktopTestStatus(attempts);
  for (let index = attempts.length - 1; index >= 0; index--) if (attempts[index].status === status) return attempts[index];
  return undefined;
}

const unfinishedStatuses: readonly TestStatus[] = ['not-run', 'incomplete', 'cancelled'];

/**
 * Selected cases that stopped an `incomplete` run from passing although none failed: every skipped case and every
 * unsupported one nothing declared in a lane run, or all of them when nothing executed.
 */
function unmetTests(result: Pick<DesktopRunResult, 'kind' | 'lane' | 'status' | 'counts' | 'tests'>): DesktopTestResult[] {
  if (result.status !== 'incomplete' || result.kind !== 'tests') return [];
  const nothingExecuted = result.counts.executed === 0;
  if (!nothingExecuted && result.lane === undefined) return [];
  return result.tests.filter(
    (test) =>
      test.status === 'skipped' ||
      (test.status === 'unsupported' && (nothingExecuted || decisiveDesktopAttempt(test.attempts)?.gap === undefined)),
  );
}

/**
 * Why an `incomplete` run is incomplete when no failed, unfinished, or unmet item says so on its own: nothing was
 * reported, a lane left cases unexecuted, or nothing executed.
 */
function incompleteRunReason(result: Pick<DesktopRunResult, 'kind' | 'lane' | 'status' | 'counts' | 'work'>): string | undefined {
  if (
    result.status !== 'incomplete' ||
    result.counts.incomplete > 0 ||
    result.work.some(({ status }) => unfinishedStatuses.includes(status))
  )
    return undefined;
  if (result.kind === 'tests' && result.counts.selected === 0) return 'No tests were reported.';
  const unmet = result.counts.skipped + undeclaredUnsupported(result.counts);
  if (result.lane && unmet > 0)
    return `${unmet} selected ${unmet === 1 ? 'test' : 'tests'} did not execute in the ${result.lane.input} lane: skipped, or unsupported without a declaration.`;
  if (result.kind === 'tests' && result.counts.executed === 0) return 'No required tests executed.';
  return 'A producer did not finish.';
}

/** One line saying why the run is not passing coverage, for the error that a selected-work check throws. */
export function describeDesktopIncompleteRun(result: DesktopRunResult): string {
  const parts = [
    ...result.work
      .filter(({ status }) => unfinishedStatuses.includes(status))
      .slice(0, 3)
      .map((work) => `${work.label}: ${work.reason ?? `work is ${work.status}`}`),
    ...(result.counts.incomplete > 0 ? [`${result.counts.incomplete} tests did not finish`] : []),
    ...(incompleteRunReason(result) ? [incompleteRunReason(result)!] : []),
  ];
  const detail = parts.join('; ') || 'selected work did not produce complete executable results';
  return `Desktop run is ${result.status}; ${detail}${detail.endsWith('.') ? '' : '.'}`;
}

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
        const decisive = decisiveDesktopAttempt(test.attempts);
        return {
          kind: 'test' as const,
          id: clipText(test.testId, 96),
          title: clipText(test.title, 128),
          status: test.status,
          ...(decisive?.failure ? { failureId: clipText(decisive.failure.failureId, 96) } : {}),
          ...(decisive?.failure?.error.message || decisive?.reason
            ? { message: clipText(decisive.failure?.error.message ?? decisive.reason!, 256) }
            : {}),
        };
      }),
    ...unmetTests(result).map((test) => {
      const decisive = decisiveDesktopAttempt(test.attempts);
      return {
        kind: 'test' as const,
        id: clipText(test.testId, 96),
        title: clipText(test.title, 128),
        status: test.status,
        ...(decisive?.reason ? { message: clipText(describeReason(decisive), 256) } : {}),
      };
    }),
    ...result.work
      .filter(({ status }) => unfinishedStatuses.includes(status))
      .map((work) => ({
        kind: 'unfinished' as const,
        id: clipText(work.workId, 96),
        title: clipText(work.label, 128),
        status: work.status,
        ...(work.reason ? { message: clipText(work.reason, 256) } : {}),
      })),
    ...(incompleteRunReason(result) && unmetTests(result).length === 0
      ? [
          {
            kind: 'unfinished' as const,
            id: 'run',
            title: 'Run',
            status: result.status,
            message: clipText(incompleteRunReason(result)!, 256),
          },
        ]
      : []),
  ];
  const skippedReasons = [
    ...new Set(
      result.tests.flatMap((test) =>
        test.attempts.flatMap((attempt) =>
          attempt.reason && ['skipped', 'unsupported'].includes(attempt.status) ? [clipText(describeReason(attempt), 256)] : [],
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
    ...(result.lane ? { lane: result.lane } : {}),
    ...(result.selection ? { excluded: result.selection.excluded } : {}),
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
    declaredUnsupported: 0,
    quarantined: 0,
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
    else if (test.status === 'unsupported') {
      counts.unsupported++;
      const gap = decisiveDesktopAttempt(test.attempts)?.gap;
      if (gap === 'unsupported') counts.declaredUnsupported++;
      else if (gap === 'quarantine') counts.quarantined++;
    }
  }
  const infrastructureFailed = input.failures.some(({ kind }) => kind !== 'test') || input.work.some(({ status }) => status === 'failed');
  const unfinishedWork = input.work.some(({ status }) => unfinishedStatuses.includes(status));
  const noExecution = input.kind === 'tests' && counts.executed === 0;
  // A lane run promised to execute its whole selection. Only a declared gap may leave a selected case unexecuted, and a
  // run that executed nothing is never optional.
  const laneUnmet = input.kind === 'tests' && input.lane !== undefined && counts.skipped + undeclaredUnsupported(counts) > 0;
  const status =
    infrastructureFailed || counts.failed > 0
      ? 'failed'
      : input.incomplete || unfinishedWork || counts.incomplete > 0 || laneUnmet || (input.kind === 'tests' && counts.selected === 0)
        ? 'incomplete'
        : noExecution
          ? input.optional && input.lane === undefined
            ? 'skipped'
            : 'incomplete'
          : 'passed';
  const { optional: _optional, incomplete: _incomplete, ...result } = input;
  return { ...result, status, counts };
}

/** Unsupported cases nothing declared in advance: a requirement the target did not meet. */
function undeclaredUnsupported(counts: Pick<DesktopRunResult['counts'], 'unsupported' | 'declaredUnsupported' | 'quarantined'>): number {
  return counts.unsupported - counts.declaredUnsupported - counts.quarantined;
}

const gapLabels = { unsupported: 'declared unsupported', quarantine: 'quarantined' } as const;

/** A reason with its declared-gap label, so a declared gap never reads like a missing requirement. */
function describeReason(attempt: Pick<DesktopTestAttempt, 'gap' | 'reason'>): string {
  const reason = attempt.reason ?? '';
  return attempt.gap ? `${gapLabels[attempt.gap]}: ${reason}` : reason;
}

/** Names the enforced input policy and any extra host mask; physical remains a pilot, not a qualification claim. */
export function describeDesktopInputLane(lane: DesktopInputLaneReport): string {
  const held = [
    ...(lane.policyEnforced ? ['policy-enforced'] : []),
    ...(lane.input === 'accessible' && lane.masking ? [lane.masking] : []),
  ];
  const name = lane.input === 'physical' ? 'physical pilot' : 'accessible';
  return held.length ? `${name} (${held.join(', ')})` : name;
}

function describeLaneSource(lane: DesktopInputLaneReport): string {
  return lane.source === 'option' ? '--input' : lane.source === 'environment' ? 'DESKTOP_INPUT' : 'the driver instance';
}

/** One line naming the lane and what each producer excluded before execution, or `undefined` when neither applies. */
export function describeDesktopSelection(result: Pick<DesktopRunResult, 'lane' | 'selection'>): string | undefined {
  const parts: string[] = [];
  if (result.lane) parts.push(`input ${describeDesktopInputLane(result.lane)} from ${describeLaneSource(result.lane)}`);
  if (result.selection) {
    const { platform, scope, input } = result.selection.excluded;
    parts.push(`excluded ${platform} by platform, ${scope} by scope, ${input} by input`);
  }
  return parts.length ? parts.join('; ') : undefined;
}

/** The unsupported count with its declared and quarantined subsets, so undeclared gaps stand out. */
export function describeDesktopUnsupported(
  counts: Pick<DesktopRunResult['counts'], 'unsupported' | 'declaredUnsupported' | 'quarantined'>,
): string {
  return `${counts.unsupported} unsupported (${counts.declaredUnsupported} declared, ${counts.quarantined} quarantined)`;
}

export function desktopRunExitCode(result: DesktopRunResult): number {
  return result.status === 'passed' || result.status === 'skipped' ? 0 : 1;
}

export function renderJUnit(result: DesktopRunResult): string {
  const infrastructure = result.failures.filter(({ kind }) => kind !== 'test');
  const unfinishedWork = result.work.filter(({ status }) => unfinishedStatuses.includes(status));
  const incompleteReason = incompleteRunReason(result);
  const cases = result.tests.map((test) => {
    const latest = test.attempts[test.attempts.length - 1];
    const decisive = decisiveDesktopAttempt(test.attempts) ?? latest;
    const history = JSON.stringify(test.attempts);
    const body =
      test.status === 'failed'
        ? `<failure message="${xml(decisive.failure?.error.message ?? 'Test failed')}">${xml(JSON.stringify(decisive.failure))}</failure>`
        : test.status === 'passed'
          ? ''
          : ['skipped', 'unsupported'].includes(test.status)
            ? `<skipped message="${xml(decisive.reason === undefined ? test.status : describeReason(decisive))}"/>`
            : `<error type="${test.status}" message="${xml(decisive.reason ?? 'Missing terminal test result')}"/>`;
    return `<testcase name="${xml(test.title)}" classname="${xml(test.testId)}" time="${decisive.durationMs / 1000}">${body}<system-out>${xml(history)}</system-out></testcase>`;
  });
  for (const failure of infrastructure) {
    cases.push(
      `<testcase name="${xml(failure.kind)}" classname="desktop.infrastructure"><error type="${xml(failure.error.name)}" message="${xml(failure.error.message)}">${xml(JSON.stringify(failure.error))}</error></testcase>`,
    );
  }
  for (const work of unfinishedWork)
    cases.push(
      `<testcase name="${xml(work.label)}" classname="desktop.selection"><error type="${work.status}" message="${xml(work.reason ?? 'Selected work did not finish.')}"/></testcase>`,
    );
  if (incompleteReason !== undefined)
    cases.push(
      `<testcase name="required cohort" classname="desktop.infrastructure"><error type="incomplete" message="${xml(incompleteReason)}"/></testcase>`,
    );
  const properties: [string, string][] = [];
  if (result.lane)
    properties.push(
      ['desktop.input', result.lane.input],
      ['desktop.input.label', describeDesktopInputLane(result.lane)],
      ['desktop.input.source', result.lane.source],
    );
  if (result.selection)
    for (const [reason, count] of Object.entries(result.selection.excluded)) properties.push([`desktop.excluded.${reason}`, String(count)]);
  if (result.counts.declaredUnsupported) properties.push(['desktop.declaredUnsupported', String(result.counts.declaredUnsupported)]);
  if (result.counts.quarantined) properties.push(['desktop.quarantined', String(result.counts.quarantined)]);
  const propertyXml = properties.length
    ? `<properties>${properties.map(([name, value]) => `<property name="${xml(name)}" value="${xml(value)}"/>`).join('')}</properties>`
    : '';
  return `<?xml version="1.0" encoding="UTF-8"?>\n<testsuites><testsuite name="${xml(result.runId)}" tests="${cases.length}" failures="${result.counts.failed}" errors="${infrastructure.length + unfinishedWork.length + result.counts.incomplete + Number(incompleteReason !== undefined)}" skipped="${result.counts.skipped + result.counts.unsupported}" time="${result.durationMs / 1000}">${propertyXml}${cases.join('')}</testsuite></testsuites>\n`;
}

export function renderRunSummary(result: DesktopRunResult): string {
  const c = result.counts;
  const reasons = [
    ...new Set(result.tests.flatMap((test) => test.attempts.flatMap((attempt) => (attempt.reason ? [describeReason(attempt)] : [])))),
  ];
  const selection = describeDesktopSelection(result);
  return (
    `## Desktop tests: ${result.status}\n\n` +
    (result.status === 'incomplete' ? `${markdown(describeDesktopIncompleteRun(result))}\n\n` : '') +
    `Run: \`${result.runId}\`; endpoint: ${result.context?.endpoint ?? 'native'}; renderer: ${result.context?.renderer ?? 'not applicable'}.\n\n` +
    (selection ? `Selection: ${selection}.\n\n` : '') +
    `Selected ${c.selected}; executed ${c.executed}; passed ${c.passed}; failed ${c.failed}; skipped ${c.skipped}; ${describeDesktopUnsupported(c)}; incomplete ${c.incomplete}; retries ${c.retries}; flaky ${c.flaky}.\n\n` +
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
