import { createHash } from 'node:crypto';

import { hex, object, reportDigest, text, timestamp } from './controlAssessment.ts';

export const checkboxUnitTestPath = 'packages/agentic/components/src/components/checkbox/checkbox.test.tsx';
const packagePath = 'packages/agentic/components/package.json';
export const unitMappingFiles = [
  checkboxUnitTestPath,
  'packages/agentic/components/jest.config.cjs',
  'scripts/configs/jest/jest.config.cjs',
  'scripts/configs/jest/babel.config.cjs',
  'scripts/src/const.mts',
  'scripts/src/tasks/jest.ts',
  'scripts/src/tasks/controlAssessmentUnitExecution.ts',
];
// October 29 review: appended regression cases preserve these 42 assertions; additions remain explicitly unmapped.
const reviewedUnitDigest = 'b12a44cea1897231d43ead2734d32a55e2fea2e5e12921d7e3f4c8bff086e7fa';
const mappingVersion = 'checkbox-jest-macos-mock-v1';
const environment = 'React Native macOS Jest mock; explicit platform tables simulate OS values, not native dispatch';
type Outcome = 'passed' | 'failed' | 'skipped' | 'not-run' | 'unverified' | 'mismatched' | 'stale';
type Status = 'missing' | 'unverified' | 'matched' | 'mismatched' | 'stale';
type UnitCase = { fullName: string; status: 'passed' | 'failed' | 'skipped'; reason: string | null };

const cases: { fullName: string; requirements: string[]; scope: string }[] = [];
function mapped(title: string, requirements: string[], scope: string, group = 'Checkbox'): void {
  cases.push({ fullName: `${group} ${title}`, requirements, scope });
}
mapped('renders default checkbox accessibility and secondary styling', ['CBX-001', 'CBX-004', 'CBX-005'], 'Default JS props and styles.');
mapped(
  'toggles uncontrolled status on press and forwards user handlers',
  ['CBX-002'],
  'JS unchecked-to-checked press and forwarded handler.',
);
mapped('reports presses without changing state when the status is externally driven', ['CBX-002'], 'JS controlled ownership on press.');
for (const platform of ['windows', 'win32', 'macos']) {
  const group = `Checkbox ${platform} accessibility actions`;
  const requirements = platform === 'win32' ? ['CBX-002', 'CBX-004'] : [];
  const scope = `${platform} Platform.OS simulation under the macOS Jest mock; no native accessibility dispatch.`;
  for (const status of ['unchecked', 'checked', 'indeterminate']) {
    mapped(`toggles ${status} once without synthesizing a press`, requirements, scope, group);
  }
  for (const title of [
    'preserves a normalized caller action list and labels',
    'deduplicates legacy and native spellings without losing the caller label or custom actions',
    'reports accessibility toggles without changing externally driven status',
    'blocks disabled accessibility toggles while forwarding the caller handler once',
    'forwards custom, wrong-case, and activate actions without a second activation path',
  ]) {
    mapped(title, requirements, scope, group);
  }
}
mapped('advances indeterminate status to checked on press', ['CBX-002'], 'JS indeterminate-to-checked transition.');
mapped('disables interaction and exposes disabled accessibility state', ['CBX-002', 'CBX-004'], 'JS disabled props and press suppression.');
mapped(
  'renders checked and indeterminate indicator glyphs',
  ['CBX-003', 'CBX-004'],
  'JS glyph sizes and checked/mixed accessibility props.',
);
mapped('shows secondary text and exposes it as a description', ['CBX-003', 'CBX-004'], 'JS secondary text and accessibilityHint.');
mapped('keeps the visible label optional while preserving an accessible name', ['CBX-003', 'CBX-004'], 'JS explicit accessible name.');
mapped('falls back to the label text when the visible label is hidden', ['CBX-003', 'CBX-004'], 'JS hidden-label name fallback.');
mapped('resolves hover and pressed feedback for label, indicator, and status colors', ['CBX-005'], 'Resolved JS hover/pressed tokens.');
mapped('uses native focus visuals without mounting custom rings', [], 'macOS mock focus props, not Win32 dual-ring coverage.');
for (const variant of ['standard', 'circular']) {
  mapped(`resolves the ${variant} variant`, ['CBX-005'], 'Resolved JS variant border radius.');
}
for (const status of ['unchecked', 'checked', 'indeterminate']) {
  mapped(`resolves ${status} status colors`, ['CBX-005'], 'Resolved JS status colors.');
}
mapped('allows constrained label text to wrap', ['CBX-003'], 'JS label flexShrink, not rendered wrapping geometry.');
mapped('applies disabled colors to the label and indicator', ['CBX-005'], 'Resolved JS disabled colors.');
export const checkboxUnitCases: readonly (typeof cases)[number][] = cases;

export type UnitMapping = { digest: string; current: boolean };
export type UnitContext = {
  schemaVersion: 1;
  platform: 'macos';
  sourceCommit: string;
  workingTreeDirty: boolean;
  buildId: string;
  contractDigest: string;
  mappingDigest: string;
  reportSha256: string;
  startedAt: string;
  finishedAt: string;
  exitCode: number | null;
};
export type UnitInput = {
  mapping?: UnitMapping;
  report?: string;
  context?: UnitContext;
  executionFailure?: string;
  expectedBuildId?: string;
};

export function readCheckboxUnitMappingFrom(read: (file: string) => string): UnitMapping {
  const hash = createHash('sha256');
  for (const file of unitMappingFiles) hash.update(`${file}\0${read(file).replace(/\r\n/g, '\n')}\0`);
  const manifest = object(JSON.parse(read(packagePath)), 'Unit package manifest');
  const profile = object(manifest.furn, 'Unit package profile').jestPlatform;
  const script = object(manifest.scripts, 'Unit package scripts').test;
  hash.update(`${packagePath}\0${JSON.stringify({ profile, script })}\0`);
  const digest = hash.digest('hex');
  return { digest, current: digest === reviewedUnitDigest };
}

function count(value: unknown, label: string): number {
  if (!Number.isSafeInteger(value) || Number(value) < 0) throw new Error(`${label} must be a nonnegative integer.`);
  return Number(value);
}

export function parseUnitContext(value: unknown): UnitContext {
  const data = object(value, 'Unit execution context');
  if (data.schemaVersion !== 1 || data.platform !== 'macos' || typeof data.workingTreeDirty !== 'boolean') {
    throw new Error('Unsupported unit context schema, platform, or dirty flag.');
  }
  const startedAt = timestamp(data.startedAt, 'Unit execution start');
  const finishedAt = timestamp(data.finishedAt, 'Unit execution finish');
  if (Date.parse(startedAt) > Date.parse(finishedAt)) throw new Error('Unit execution finished before it started.');
  return {
    schemaVersion: 1,
    platform: 'macos',
    sourceCommit: hex(data.sourceCommit, 40, 'Unit source commit'),
    workingTreeDirty: data.workingTreeDirty,
    buildId: text(data.buildId, 'Unit build ID'),
    contractDigest: hex(data.contractDigest, 64, 'Unit contract digest'),
    mappingDigest: hex(data.mappingDigest, 64, 'Unit mapping digest'),
    reportSha256: hex(data.reportSha256, 64, 'Unit report hash'),
    startedAt,
    finishedAt,
    exitCode: data.exitCode === null ? null : count(data.exitCode, 'Unit exit code'),
  };
}

export function parseCheckboxJest(content: string) {
  if (Buffer.byteLength(content) > 1_000_000) throw new Error('Unit report exceeds its size limit.');
  const data = object(JSON.parse(content), 'Jest report');
  if (typeof data.success !== 'boolean' || typeof data.wasInterrupted !== 'boolean') throw new Error('Invalid Jest execution flags.');
  if (!Array.isArray(data.testResults) || !data.testResults.length) throw new Error('Jest report must contain test suites.');
  const startTime = count(data.startTime, 'Jest start time');
  const parsed = data.testResults.map((value) => parseJestSuite(value, startTime));
  if (new Set(parsed.map(({ name }) => name)).size !== parsed.length) throw new Error('Duplicate Jest suite identity.');
  const selected = parsed.filter(({ name }) => name === checkboxUnitTestPath || name.endsWith(`/${checkboxUnitTestPath}`));
  if (selected.length !== 1) throw new Error('Unit report must contain exactly one Checkbox runtime suite; type tests cannot substitute.');
  const counts = { passed: 0, failed: 0, skipped: 0 };
  const suites = { passed: 0, failed: 0, skipped: 0 };
  for (const suite of parsed) {
    if (suite.status === 'passed') suites.passed++;
    else if (suite.status === 'failed') suites.failed++;
    else suites.skipped++;
    for (const status of ['passed', 'failed', 'skipped'] as const) counts[status] += suite.counts[status];
  }
  if (
    count(data.numTotalTestSuites, 'Jest total suites') !== parsed.length ||
    count(data.numPassedTestSuites, 'Jest passed suites') !== suites.passed ||
    count(data.numFailedTestSuites, 'Jest failed suites') !== suites.failed ||
    count(data.numPendingTestSuites, 'Jest pending suites') !== suites.skipped ||
    count(data.numTotalTests, 'Jest total') !== counts.passed + counts.failed + counts.skipped ||
    count(data.numPassedTests, 'Jest passed') !== counts.passed ||
    count(data.numFailedTests, 'Jest failed') !== counts.failed ||
    count(data.numPendingTests, 'Jest pending') + count(data.numTodoTests, 'Jest todo') !== counts.skipped
  )
    throw new Error('Jest suite/assertion counts disagree with its summary.');
  const runtimeErrors = count(data.numRuntimeErrorTestSuites, 'Jest runtime errors');
  if (runtimeErrors > suites.failed || (data.success && (counts.failed || runtimeErrors || suites.failed))) {
    throw new Error('Jest execution status contradicts its failures.');
  }
  return {
    entries: selected[0].entries,
    counts: selected[0].counts,
    packageCounts: counts,
    packageSuites: parsed.length,
    startTime,
    endTime: Math.max(...parsed.map(({ endTime }) => endTime)),
    failed: !data.success || data.wasInterrupted || runtimeErrors > 0 || suites.failed > 0,
  };
}

function parseJestSuite(value: unknown, startTime: number) {
  const suite = object(value, 'Jest suite');
  const name = text(suite.name, 'Jest suite filename').replace(/\\/g, '/');
  const suiteStatus = suite.status;
  if (suiteStatus !== 'passed' && suiteStatus !== 'failed' && suiteStatus !== 'skipped') {
    throw new Error('Unsupported Jest suite status.');
  }
  if (!Array.isArray(suite.assertionResults)) throw new Error('Jest suite must contain assertionResults.');
  const entries: UnitCase[] = suite.assertionResults.map((value) => {
    const entry = object(value, 'Jest assertion');
    const fullName = text(entry.fullName, 'Jest full name');
    const title = text(entry.title, 'Jest title');
    if (
      !Array.isArray(entry.ancestorTitles) ||
      !entry.ancestorTitles.every((value) => typeof value === 'string') ||
      [...entry.ancestorTitles, title].join(' ') !== fullName
    ) {
      throw new Error('Jest assertion identity is inconsistent.');
    }
    if (!['passed', 'failed', 'pending', 'todo'].includes(String(entry.status))) throw new Error('Unsupported Jest assertion status.');
    if (!Array.isArray(entry.failureMessages) || entry.failureMessages.some((message) => typeof message !== 'string')) {
      throw new Error('Jest failureMessages must be a string array.');
    }
    if (entry.status === 'passed' && entry.failureMessages.length) throw new Error('Passed Jest assertion contains a failure.');
    return {
      fullName,
      status: entry.status === 'passed' || entry.status === 'failed' ? entry.status : 'skipped',
      reason: entry.failureMessages.length ? entry.failureMessages.join('\n').slice(0, 2000) : entry.status === 'todo' ? 'todo' : null,
    };
  });
  if (new Set(entries.map(({ fullName }) => fullName)).size !== entries.length) throw new Error('Duplicate Jest assertion identity.');
  const counts = {
    passed: entries.filter(({ status }) => status === 'passed').length,
    failed: entries.filter(({ status }) => status === 'failed').length,
    skipped: entries.filter(({ status }) => status === 'skipped').length,
  };
  if ((suite.status === 'passed' && counts.failed) || (suite.status === 'skipped' && (counts.passed || counts.failed))) {
    throw new Error('Jest execution status contradicts its failures.');
  }
  const suiteStart = count(suite.startTime, 'Jest suite start time');
  const endTime = count(suite.endTime, 'Jest suite end time');
  const earlyRuntimeFailure = suiteStatus === 'failed' && suiteStart === 0 && endTime === 0 && counts.passed === 0;
  if (suite.status !== 'skipped' && !earlyRuntimeFailure && (suiteStart < startTime || endTime < suiteStart)) {
    throw new Error('Invalid Jest execution interval.');
  }
  return {
    name,
    status: suiteStatus,
    entries,
    counts,
    startTime,
    endTime,
  };
}

export function assessCheckboxUnits(options: {
  input?: UnitInput;
  sourceCommit: string;
  workingTreeDirty: boolean;
  contractDigest: string;
  contractMappingCurrent: boolean;
  now: Date;
  maxAgeHours?: number;
}) {
  const { input } = options;
  const report = input?.report === undefined ? undefined : parseCheckboxJest(input.report);
  if (report && !input?.mapping) throw new Error('Unit report requires the current source mapping fingerprint.');
  const context = input?.context;
  if (context && !report) throw new Error('Unit execution context requires a unit report.');
  const hash = input?.report === undefined ? null : reportDigest(input.report);
  let status: Status = report ? 'matched' : 'missing';
  const reasons: string[] = [];
  if (report) {
    if (
      context &&
      (context.sourceCommit !== options.sourceCommit ||
        context.reportSha256 !== hash ||
        context.contractDigest !== options.contractDigest ||
        context.mappingDigest !== input!.mapping!.digest ||
        (input?.expectedBuildId !== undefined && context.buildId !== input.expectedBuildId) ||
        Date.parse(context.finishedAt) > options.now.getTime() ||
        report.startTime < Date.parse(context.startedAt) ||
        (report.endTime !== 0 && report.endTime > Date.parse(context.finishedAt)))
    ) {
      status = 'mismatched';
      reasons.push('Unit report bytes, source, contract, mapping, build, or execution interval do not match their binding.');
    } else if (
      context &&
      options.maxAgeHours !== undefined &&
      options.now.getTime() - Date.parse(context.finishedAt) > options.maxAgeHours * 3_600_000
    ) {
      status = 'stale';
      reasons.push('Unit evidence exceeds the explicitly requested maximum age.');
    } else if (
      !context ||
      options.workingTreeDirty ||
      context.workingTreeDirty ||
      !input?.expectedBuildId ||
      options.maxAgeHours === undefined
    ) {
      status = 'unverified';
      reasons.push(
        'Unit evidence needs an execution-generated context, expected unit build, age policy, and unchanged clean source inputs.',
      );
    }
  }
  const mappingCurrent = input?.mapping?.current ?? null;
  if (mappingCurrent === false)
    reasons.push('Unit assertions or mock configuration changed since review; update the reviewed mapping before accepting evidence.');
  const current = mappingCurrent === true && options.contractMappingCurrent;
  const runFailed = Boolean(report?.failed || input?.executionFailure || (context && context.exitCode !== 0));
  const checks = checkboxUnitCases.map((mapping) => {
    const recorded = report?.entries.find(({ fullName }) => fullName === mapping.fullName);
    let evidenceOutcome: Outcome = 'not-run';
    if (recorded) {
      if (!current || status === 'stale') evidenceOutcome = 'stale';
      else if (status === 'mismatched') evidenceOutcome = 'mismatched';
      else if (status !== 'matched' || (recorded.status === 'passed' && runFailed)) evidenceOutcome = 'unverified';
      else evidenceOutcome = recorded.status;
    }
    return { ...mapping, recordedOutcome: recorded?.status ?? 'not-run', evidenceOutcome, reason: recorded?.reason ?? null };
  });
  const outcome = checks.some(({ evidenceOutcome }) => evidenceOutcome === 'failed')
    ? 'failed'
    : status === 'matched' && current && runFailed
      ? 'execution-failed'
      : report && !current
        ? 'stale'
        : status !== 'matched'
          ? status === 'missing'
            ? 'not-run'
            : status
          : report!.counts.passed === 0
            ? 'skipped'
            : 'passed';
  return {
    status,
    reasons,
    outcome,
    environment,
    mappingVersion,
    mappingCurrent,
    mappingDigest: input?.mapping?.digest ?? null,
    reportSha256: hash,
    runFailed,
    executionFailure: input?.executionFailure ?? null,
    context: context ?? null,
    caseCounts: report?.counts ?? { passed: 0, failed: 0, skipped: 0 },
    packageCounts: report?.packageCounts ?? null,
    packageSuites: report?.packageSuites ?? null,
    checks,
    unmappedCases: report?.entries.filter(({ fullName }) => !checkboxUnitCases.some((mapping) => mapping.fullName === fullName)) ?? [],
  };
}
