import { createHash } from 'node:crypto';

import { hex, object, reportDigest, text, timestamp } from './controlAssessment.ts';

import { readMappingContent } from './assessmentConfig.ts';
import type { AssessmentDefinition } from './assessmentConfig.ts';

type Outcome = 'passed' | 'failed' | 'skipped' | 'not-run' | 'unverified' | 'mismatched' | 'stale';
type Status = 'missing' | 'unverified' | 'matched' | 'mismatched' | 'stale';
type UnitCase = {
  fullName: string;
  status: 'passed' | 'failed' | 'skipped';
  reason: string | null;
  invocations: number | null;
  retryReasons: string[];
  retries: number;
  flaky: boolean;
};

export type UnitMapping = { digest: string; current: boolean };
export type UnitContext = {
  schemaVersion: 1;
  platform: string;
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

export function readUnitMappingFrom(read: (file: string) => string, definition: AssessmentDefinition): UnitMapping {
  const hash = createHash('sha256');
  for (const file of definition.unit.inputs) hash.update(`${file}\0${read(file).replace(/\r\n/g, '\n')}\0`);
  const packagePath = `${definition.packagePath}/package.json`;
  const manifest = object(JSON.parse(read(packagePath)), 'Unit package manifest');
  const profile = object(manifest.furn, 'Unit package profile').jestPlatform;
  const script = object(manifest.scripts, 'Unit package scripts').test;
  hash.update(`${packagePath}\0${JSON.stringify({ profile, script })}\0`);
  hash.update(readMappingContent(read, definition));
  const digest = hash.digest('hex');
  return { digest, current: digest === definition.unit.reviewedDigest };
}

function count(value: unknown, label: string): number {
  if (!Number.isSafeInteger(value) || Number(value) < 0) throw new Error(`${label} must be a nonnegative integer.`);
  return Number(value);
}

export function parseUnitContext(value: unknown): UnitContext {
  const data = object(value, 'Unit execution context');
  if (
    data.schemaVersion !== 1 ||
    !['react', 'win32', 'macos', 'ios', 'android', 'windows'].includes(String(data.platform)) ||
    typeof data.workingTreeDirty !== 'boolean'
  ) {
    throw new Error('Unsupported unit context schema, platform, or dirty flag.');
  }
  const startedAt = timestamp(data.startedAt, 'Unit execution start');
  const finishedAt = timestamp(data.finishedAt, 'Unit execution finish');
  if (Date.parse(startedAt) > Date.parse(finishedAt)) throw new Error('Unit execution finished before it started.');
  return {
    schemaVersion: 1,
    platform: text(data.platform, 'Unit platform'),
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

export function parseComponentJest(content: string, definition: AssessmentDefinition) {
  const parsed = parseJestFiles(
    content,
    definition.unit.testFiles.map((file) => `${definition.packagePath}/${file}`),
  );
  if (parsed.ambiguousNames.length) throw new Error('Duplicate Jest assertion identity.');
  return parsed;
}

export function parseJestFiles(content: string, testFiles: readonly string[]) {
  if (!testFiles.length) throw new Error('Unit assessment requires an explicit runtime-suite selection.');
  if (Buffer.byteLength(content) > 1_000_000) throw new Error('Unit report exceeds its size limit.');
  const data = object(JSON.parse(content), 'Jest report');
  if (typeof data.success !== 'boolean' || typeof data.wasInterrupted !== 'boolean') throw new Error('Invalid Jest execution flags.');
  if (!Array.isArray(data.testResults) || !data.testResults.length) throw new Error('Jest report must contain test suites.');
  const startTime = count(data.startTime, 'Jest start time');
  const parsed = data.testResults.map((value) => parseJestSuite(value, startTime));
  if (new Set(parsed.map(({ name }) => name)).size !== parsed.length) throw new Error('Duplicate Jest suite identity.');
  const selected = testFiles.map((expected) => {
    const matches = parsed.filter(({ name }) => name === expected || name.endsWith(`/${expected}`));
    if (matches.length !== 1)
      throw new Error('Unit report must contain each configured runtime suite exactly once; type tests cannot substitute.');
    return matches[0];
  });
  const entries = selected.flatMap(({ entries }) => entries);
  const names = new Set<string>();
  const ambiguousNames = new Set<string>();
  for (const { fullName } of entries) {
    if (names.has(fullName)) ambiguousNames.add(fullName);
    names.add(fullName);
  }
  const counts = { passed: 0, failed: 0, skipped: 0 };
  const suites = { passed: 0, failed: 0, skipped: 0 };
  for (const suite of parsed) {
    if (suite.status === 'passed' || suite.status === 'focused') suites.passed++;
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
  const retryCounts = (entries: UnitCase[]) => ({
    retries: entries.reduce((sum, entry) => sum + entry.retries, 0),
    flaky: entries.filter(({ flaky }) => flaky).length,
  });
  return {
    entries,
    ambiguousNames: [...ambiguousNames],
    counts: selected.reduce(
      (counts, suite) => ({
        passed: counts.passed + suite.counts.passed,
        failed: counts.failed + suite.counts.failed,
        skipped: counts.skipped + suite.counts.skipped,
      }),
      { passed: 0, failed: 0, skipped: 0 },
    ),
    packageCounts: counts,
    packageSuites: parsed.length,
    retryCounts: retryCounts(entries),
    packageRetryCounts: retryCounts(parsed.flatMap(({ entries }) => entries)),
    startTime,
    endTime: Math.max(...parsed.map(({ endTime }) => endTime)),
    failed: !data.success || data.wasInterrupted || runtimeErrors > 0 || suites.failed > 0,
  };
}

function parseJestSuite(value: unknown, startTime: number) {
  const suite = object(value, 'Jest suite');
  const name = text(suite.name, 'Jest suite filename').replace(/\\/g, '/');
  const suiteStatus = suite.status;
  if (suiteStatus !== 'passed' && suiteStatus !== 'failed' && suiteStatus !== 'skipped' && suiteStatus !== 'focused') {
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
    const invocations = entry.invocations === undefined ? null : count(entry.invocations, 'Jest assertion invocations');
    if (
      entry.retryReasons !== undefined &&
      (!Array.isArray(entry.retryReasons) || entry.retryReasons.some((reason) => typeof reason !== 'string'))
    ) {
      throw new Error('Jest retryReasons must be a string array.');
    }
    const retryReasons: string[] = entry.retryReasons ?? [];
    const retries = Math.max(invocations === null ? 0 : invocations - 1, retryReasons.length);
    return {
      fullName,
      status: entry.status === 'passed' || entry.status === 'failed' ? entry.status : 'skipped',
      reason: entry.failureMessages.length ? entry.failureMessages.join('\n').slice(0, 2000) : entry.status === 'todo' ? 'todo' : null,
      invocations,
      retryReasons,
      retries,
      flaky: entry.status === 'passed' && retries > 0,
    };
  });
  const counts = {
    passed: entries.filter(({ status }) => status === 'passed').length,
    failed: entries.filter(({ status }) => status === 'failed').length,
    skipped: entries.filter(({ status }) => status === 'skipped').length,
  };
  if (
    (suiteStatus === 'passed' && counts.failed) ||
    (suiteStatus === 'focused' && (counts.failed || !counts.skipped)) ||
    (suiteStatus === 'skipped' && (counts.passed || counts.failed))
  ) {
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

export function assessControlUnits(options: {
  definition: AssessmentDefinition;
  input?: UnitInput;
  sourceCommit: string;
  workingTreeDirty: boolean;
  contractDigest: string;
  contractMappingCurrent: boolean;
  now: Date;
  maxAgeHours?: number;
}) {
  const { input, definition } = options;
  const report = input?.report === undefined ? undefined : parseComponentJest(input.report, definition);
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
        context.platform !== definition.unit.platform ||
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
  const runRetried = Boolean(report?.packageRetryCounts.retries);
  if (runRetried) reasons.push('Retried or flaky unit execution is not qualifying evidence in this pilot.');
  const checks = definition.unit.cases.map((mapping) => {
    const recorded = report?.entries.find(({ fullName }) => fullName === mapping.fullName);
    let evidenceOutcome: Outcome = 'not-run';
    if (recorded) {
      if (!current || status === 'stale') evidenceOutcome = 'stale';
      else if (status === 'mismatched') evidenceOutcome = 'mismatched';
      else if (status !== 'matched' || (recorded.status === 'passed' && (runFailed || runRetried))) evidenceOutcome = 'unverified';
      else evidenceOutcome = recorded.status;
    }
    return {
      ...mapping,
      recordedOutcome: recorded?.status ?? 'not-run',
      evidenceOutcome,
      reason: recorded?.reason ?? null,
      invocations: recorded?.invocations ?? null,
      retryReasons: recorded?.retryReasons ?? [],
      retries: recorded?.retries ?? 0,
      flaky: recorded?.flaky ?? false,
    };
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
          : runRetried
            ? 'retried'
            : report!.counts.passed === 0
              ? 'skipped'
              : 'passed';
  return {
    status,
    reasons,
    outcome,
    environment: definition.unit.environment,
    mappingVersion: definition.unit.mappingVersion,
    mappingCurrent,
    mappingDigest: input?.mapping?.digest ?? null,
    reportSha256: hash,
    runFailed,
    runRetried,
    executionFailure: input?.executionFailure ?? null,
    context: context ?? null,
    caseCounts: report?.counts ?? { passed: 0, failed: 0, skipped: 0 },
    packageCounts: report?.packageCounts ?? null,
    packageSuites: report?.packageSuites ?? null,
    retryCounts: report?.retryCounts ?? { retries: 0, flaky: 0 },
    packageRetryCounts: report?.packageRetryCounts ?? null,
    checks,
    unmappedCases: report?.entries.filter(({ fullName }) => !definition.unit.cases.some((mapping) => mapping.fullName === fullName)) ?? [],
  };
}
