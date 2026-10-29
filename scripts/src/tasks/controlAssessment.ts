import { createHash } from 'node:crypto';
import { readFileSync, realpathSync } from 'node:fs';
import path from 'node:path';

import { splitSpecAssessment } from './controlAssessmentSpec.ts';
import { assessCheckboxUnits } from './controlAssessmentUnit.ts';
import type { UnitInput } from './controlAssessmentUnit.ts';

const componentPath = 'packages/agentic/components/src/components/checkbox';
export const checkboxNativeAssertionPath = 'packages/agentic/components/src/common/desktopFocus.wdio.ts';
const contractFiles = [
  'SPEC.md',
  'spec/source.json',
  'spec/interaction.md',
  'spec/accessibility.md',
  'spec/tokens.yaml',
  'spec/usage.md',
  'checkbox.stories.tsx',
];
// October 29 review: the mapped default callback delegates checked-state assertions to the fingerprinted native helper.
const reviewedDigest = '8e05597cabf63743066b9dc9dd929d11e8c48fad89e3a7eabb853efbc6c58b6a';
const storyId = 'components-checkbox--default';
const testName = 'toggles native checked state in both directions';

const coverage: Record<string, { observed?: string; remaining: string }> = {
  'CBX-001': {
    remaining:
      'Map the additional existing defaults/root-prop assertions and ingest the existing compiler/type result; no native duplicate is inherently required.',
  },
  'CBX-002': {
    observed: 'Uncontrolled unchecked -> checked -> unchecked through physical clicks.',
    remaining:
      'Map the additional existing JS controlled/uncontrolled press and callback-count assertions, including defaultStatus precedence; native duplication is not required for state logic.',
  },
  'CBX-003': {
    remaining:
      'Map the additional existing anatomy/order, text-gating and warning assertions and native wrapping cases; rendered geometry needs layout evidence.',
  },
  'CBX-004': {
    observed: 'Native checkbox role (not the complete accessibility requirement).',
    remaining:
      'Map the additional existing inner-node and JS semantics assertions and native naming cases; actual native action dispatch needs platform evidence when claimed.',
  },
  'CBX-005': {
    remaining:
      'Map the additional existing secondary-text/state, interaction/status and caller-style assertions; resolved styles can be established by unit tests.',
  },
  'CBX-006': { remaining: 'Win32 focus modality, disabled/detached targets, and dual-ring geometry; collect focus/visual evidence.' },
};

type Requirement = { id: string; summary: string; declaredEvidence: string[] };
export type CheckboxContract = {
  digest: string;
  mappingCurrent: boolean;
  lifecycle: string;
  conformance: string;
  requirements: Requirement[];
};
type CaseStatus = 'passed' | 'failed' | 'skipped';
type NativeCase = { storyId: string; testName: string; status: CaseStatus; durationMs: number; reason?: string };
export type NativeReport = {
  endpoint: 'win32' | 'windows' | 'macos';
  platformManifestDigest: string;
  status: 'passed' | 'failed';
  error?: string;
  targetId?: string;
  startedAt?: string;
  finishedAt?: string;
  cases: NativeCase[];
  format: 'wdio' | 'storybook-smoke' | 'desktop-test';
  harness?: {
    runId: string;
    status: string;
    retries: number;
    flaky: number;
    unsupported: number;
    incomplete: number;
    failureCount: number;
  };
};
export type EvidenceContext = {
  schemaVersion: 1;
  reportSha256: string;
  sourceCommit: string;
  buildId: string;
  contractDigest: string;
  platformManifestDigest: string;
  endpoint: 'win32';
  renderer: 'paper';
  targetId: string;
  finishedAt: string;
  physicalClick: boolean;
};
type Provenance = { status: 'missing' | 'unverified' | 'matched' | 'mismatched' | 'stale'; reasons: string[] };
type CheckOutcome = CaseStatus | 'not-run' | 'unverified' | 'mismatched' | 'stale';
export type AssessmentOptions = {
  contract: CheckboxContract;
  sourceCommit: string;
  workingTreeDirty: boolean;
  now: Date;
  report?: NativeReport;
  reportSha256?: string;
  context?: EvidenceContext;
  expectedBuildId?: string;
  expectedTargetId?: string;
  maxAgeHours?: number;
  executionFailure?: string;
  unit?: UnitInput;
};

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function object(value: unknown, label: string): Record<string, unknown> {
  if (!isObject(value)) throw new Error(`${label} must be an object.`);
  return value;
}

export function text(value: unknown, label: string): string {
  if (typeof value !== 'string' || !value.trim()) throw new Error(`${label} must be a nonempty string.`);
  return value;
}

export function hex(value: unknown, length: number, label: string): string {
  const result = text(value, label);
  if (!new RegExp(`^[0-9a-f]{${length}}$`).test(result)) throw new Error(`${label} must be ${length} lowercase hex characters.`);
  return result;
}

function choice<T extends string>(value: unknown, choices: readonly T[], label: string): T {
  const result = choices.find((entry) => entry === value);
  if (result === undefined) throw new Error(`${label} must be one of: ${choices.join(', ')}.`);
  return result;
}

export function timestamp(value: unknown, label: string): string {
  const result = text(value, label);
  const time = Date.parse(result);
  if (
    !/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d{1,3})?Z$/.test(result) ||
    !Number.isFinite(time) ||
    new Date(time).toISOString().slice(0, 19) !== result.slice(0, 19)
  ) {
    throw new Error(`${label} must be a valid UTC ISO timestamp.`);
  }
  return result;
}

export function reportDigest(content: string): string {
  return createHash('sha256').update(content).digest('hex');
}

export function win32StorybookTargetId(root: string): string {
  // Mirror desktop-test's target identity protocol without loading PR configuration in the trusted publisher.
  const appRoot = realpathSync(path.join(root, 'apps', 'storybook'));
  return `win32-${reportDigest(`${appRoot}\0win32\0paper`).slice(0, 16)}`;
}

function isWin32StorybookTarget(value: string): boolean {
  return value === 'agenticstorybook-win32' || /^win32-[0-9a-f]{16}$/.test(value);
}

export function readCheckboxContract(root: string): CheckboxContract {
  return readCheckboxContractFrom((file) => readFileSync(path.join(root, file), 'utf8'));
}

export function readCheckboxContractFrom(read: (file: string) => string): CheckboxContract {
  const files = new Map(
    contractFiles.map((file) => {
      const content = read(`${componentPath}/${file}`).replace(/\r\n/g, '\n');
      return [file, file === 'SPEC.md' ? splitSpecAssessment(content).contract : content];
    }),
  );
  const hash = createHash('sha256');
  for (const [file, content] of files) hash.update(`${file}\0${content}\0`);
  hash.update(`${checkboxNativeAssertionPath}\0${read(checkboxNativeAssertionPath).replace(/\r\n/g, '\n')}\0`);
  const digest = hash.digest('hex');
  const source = object(JSON.parse(files.get('spec/source.json')!), 'Checkbox source metadata');
  if (source.component !== 'checkbox' || source.schemaVersion !== 2 || !Array.isArray(source.requirements)) {
    throw new Error('Expected Checkbox source metadata schemaVersion 2 and a requirements array.');
  }
  const summaries = new Map(
    [...files.get('SPEC.md')!.matchAll(/^- \*\*(CBX-\d{3}):\*\* (.+(?:\n {2}.+)*)/gm)].map((match) => [
      match[1],
      match[2].replace(/\s+/g, ' ').trim(),
    ]),
  );
  const requirements = source.requirements.map((value) => {
    const entry = object(value, 'Requirement');
    const id = text(entry.id, 'Requirement id');
    const summary = summaries.get(id);
    if (!summary || !Array.isArray(entry.evidence)) throw new Error(`Missing SPEC requirement or evidence list for ${id}.`);
    return { id, summary, declaredEvidence: entry.evidence.map((file) => text(file, `${id} evidence file`)) };
  });
  if (new Set(requirements.map(({ id }) => id)).size !== requirements.length || summaries.size !== requirements.length) {
    throw new Error('Checkbox SPEC and metadata must contain the same unique requirement IDs.');
  }
  return {
    digest,
    mappingCurrent: digest === reviewedDigest,
    lifecycle: text(source.lifecycle, 'Contract lifecycle'),
    conformance: text(source.conformance, 'Contract conformance'),
    requirements,
  };
}

export function parseNativeReport(value: unknown): NativeReport {
  const data = object(value, 'Native report');
  if (data.format === 'desktop-test') return parseDesktopEvidence(data);
  const format = 'wdio' in data || 'schemaVersion' in data || 'manifest' in data ? 'storybook-smoke' : 'wdio';
  const entries = format === 'storybook-smoke' ? data.wdio : data.tests;
  if (!Array.isArray(entries)) throw new Error('Native report must contain a tests or wdio array.');
  const error = data.error;
  if (error !== undefined && typeof error !== 'string') throw new Error('Native report error must be a string.');
  const rawStatus = choice(data.status, ['passed', 'failed', 'skipped', 'incomplete'], 'Report status');
  const status = rawStatus === 'passed' ? 'passed' : 'failed';
  if (status === 'passed' && error !== undefined) throw new Error('Passed report cannot contain a runner error.');
  let platformManifestDigest: string;
  let targetId: string | undefined;
  let startedAt: string | undefined;
  let finishedAt: string | undefined;
  if (format === 'storybook-smoke') {
    if (data.schemaVersion !== 1 || !Array.isArray(data.tests))
      throw new Error('Storybook smoke report requires schemaVersion 1 and a tests array.');
    const manifest = object(data.manifest, 'Smoke manifest');
    platformManifestDigest = hex(manifest.platform, 64, 'Smoke platform manifest');
    hex(manifest.portable, 64, 'Smoke portable manifest');
    if (data.platformManifestDigest !== undefined && data.platformManifestDigest !== platformManifestDigest)
      throw new Error('Conflicting report platform digests.');
    targetId = text(data.targetId, 'Smoke targetId');
    text(data.runId, 'Smoke runId');
    text(data.platformName, 'Smoke platformName');
    finishedAt = timestamp(data.finishedAt, 'Smoke finishedAt');
    startedAt = timestamp(data.startedAt, 'Smoke startedAt');
    if (Date.parse(startedAt) > Date.parse(finishedAt)) throw new Error('Smoke report finished before it started.');
  } else {
    platformManifestDigest = hex(data.platformManifestDigest, 64, 'Report platformManifestDigest');
  }
  const identities = new Set<string>();
  const cases = entries.map((value, index): NativeCase => {
    const entry = object(value, `Native case ${index}`);
    const id = text(entry.storyId, 'Case storyId');
    const name = entry.testName === undefined ? 'default' : text(entry.testName, 'Case testName');
    const identity = JSON.stringify([id, name]);
    if (identities.has(identity)) throw new Error(`Duplicate native case: ${id} / ${name}.`);
    identities.add(identity);
    const caseStatus = choice(entry.status, ['passed', 'failed', 'skipped'], 'Case status');
    if (typeof entry.durationMs !== 'number' || !Number.isFinite(entry.durationMs) || entry.durationMs < 0) {
      throw new Error(`Invalid durationMs for ${id} / ${name}.`);
    }
    const caseError = entry.error;
    if (caseError !== undefined && typeof caseError !== 'string') throw new Error('Case error must be a string.');
    if (
      entry.evidenceErrors !== undefined &&
      (!Array.isArray(entry.evidenceErrors) || entry.evidenceErrors.some((value) => typeof value !== 'string'))
    )
      throw new Error('Case evidenceErrors must be a string array.');
    if (caseStatus === 'passed' && (caseError !== undefined || (Array.isArray(entry.evidenceErrors) && entry.evidenceErrors.length)))
      throw new Error('Passed case cannot contain execution or evidence errors.');
    if (status === 'passed' && caseStatus === 'failed') throw new Error('Passed report cannot contain a failed case.');
    return {
      storyId: id,
      testName: name,
      status: caseStatus,
      durationMs: entry.durationMs,
      reason: caseStatus === 'skipped' ? text(entry.skipReason, 'Skipped case reason') : caseError,
    };
  });
  return {
    endpoint: choice(data.endpoint, ['win32', 'windows', 'macos'], 'Report endpoint'),
    platformManifestDigest,
    targetId,
    finishedAt,
    status,
    error: error ?? (rawStatus === 'skipped' || rawStatus === 'incomplete' ? `Native execution is ${rawStatus}.` : undefined),
    cases,
    format,
    startedAt,
  };
}

const desktopStatuses = ['passed', 'failed', 'skipped', 'unsupported', 'cancelled', 'not-run', 'incomplete'] as const;
const smokeArtifact = 'evidence/win32/static/run.json';

export function hasStorybookArtifact(run: Record<string, unknown>): boolean {
  if (!Array.isArray(run.artifacts)) throw new Error('Desktop supervisor report has no artifact inventory.');
  return run.artifacts.some(
    (value) => text(object(value, 'Desktop artifact').path, 'Artifact path').replaceAll('\\', '/') === smokeArtifact,
  );
}

/** Keep the canonical supervisor result and its Storybook assertions together, including their exact bytes. */
export function readNativeEvidence(file: string): string {
  const content = readFileSync(file, 'utf8');
  const data = object(JSON.parse(content), 'Native evidence');
  if (data.kind !== 'tests' && data.kind !== 'lifecycle') return content;
  const root = realpathSync(path.dirname(file));
  const companion = realpathSync(path.join(root, ...smokeArtifact.split('/')));
  const relative = path.relative(root, companion);
  if (relative.startsWith('..') || path.isAbsolute(relative)) throw new Error('Storybook evidence must remain inside its desktop run.');
  return JSON.stringify({ schemaVersion: 1, format: 'desktop-test', desktopRun: content, storyReport: readFileSync(companion, 'utf8') });
}

function parseDesktopEvidence(data: Record<string, unknown>): NativeReport {
  if (data.schemaVersion !== 1) throw new Error('Unsupported desktop evidence envelope.');
  const run = object(JSON.parse(text(data.desktopRun, 'Desktop run bytes')), 'Desktop run');
  if (run.schemaVersion !== 1 || run.kind !== 'tests') throw new Error('Expected a desktop-test schemaVersion 1 test run.');
  const runId = text(run.runId, 'Desktop run ID');
  const startedAt = timestamp(run.startedAt, 'Desktop startedAt');
  const finishedAt = timestamp(run.finishedAt, 'Desktop finishedAt');
  if (Date.parse(startedAt) > Date.parse(finishedAt)) throw new Error('Desktop run finished before it started.');
  const status = choice(run.status, desktopStatuses, 'Desktop status');
  if (!Array.isArray(run.tests) || !Array.isArray(run.work) || !Array.isArray(run.failures) || !Array.isArray(run.artifacts)) {
    throw new Error('Desktop run requires tests, work, failures and artifacts arrays.');
  }
  const artifactMatches = run.artifacts.filter(
    (value) => text(object(value, 'Desktop artifact').path, 'Artifact path').replaceAll('\\', '/') === smokeArtifact,
  );
  if (artifactMatches.length !== 1) throw new Error('Desktop run must declare exactly one Win32 Storybook smoke artifact.');
  const storyData = object(JSON.parse(text(data.storyReport, 'Storybook report bytes')), 'Storybook smoke evidence');
  if (!('manifest' in storyData) || storyData.format === 'desktop-test') throw new Error('Expected a Storybook smoke companion.');
  const report = parseNativeReport(storyData);
  if (report.format !== 'storybook-smoke' || report.endpoint !== 'win32') throw new Error('Expected Win32 Storybook smoke evidence.');
  if (Date.parse(report.startedAt!) < Date.parse(startedAt) || Date.parse(report.finishedAt!) > Date.parse(finishedAt)) {
    throw new Error('Storybook evidence is outside its enclosing desktop execution.');
  }
  const counts = { selected: 0, executed: 0, passed: 0, failed: 0, skipped: 0, unsupported: 0, incomplete: 0, retries: 0, flaky: 0 };
  const cases = new Map<string, string>();
  const ids = new Set<string>();
  for (const value of run.tests) {
    const test = object(value, 'Desktop test');
    const id = text(test.testId, 'Desktop test ID');
    if (ids.has(id)) throw new Error('Duplicate desktop test ID.');
    ids.add(id);
    text(test.title, 'Desktop test title');
    const testStatus = choice(test.status, desktopStatuses, 'Desktop test status');
    if (!Array.isArray(test.attempts) || !test.attempts.length) throw new Error('Desktop test needs recorded attempts.');
    let previous = -1;
    let failedAttempt = false;
    let executed = false;
    let identity: string | undefined;
    const attempts = test.attempts.map((value) => {
      const attempt = object(value, 'Desktop attempt');
      if (!Number.isSafeInteger(attempt.attempt) || Number(attempt.attempt) <= previous) throw new Error('Invalid desktop attempt order.');
      previous = Number(attempt.attempt);
      const result = choice(attempt.status, desktopStatuses, 'Desktop attempt status');
      if (typeof attempt.durationMs !== 'number' || !Number.isFinite(attempt.durationMs) || attempt.durationMs < 0) {
        throw new Error('Invalid desktop attempt duration.');
      }
      if (!['passed', 'failed'].includes(result)) text(attempt.reason, 'Desktop nonexecution reason');
      if (result === 'failed') object(attempt.failure, 'Desktop failed attempt');
      if (result === 'passed' && attempt.failure !== undefined) throw new Error('Passed desktop attempt contains a failure.');
      failedAttempt ||= result === 'failed';
      executed ||= result === 'passed' || result === 'failed';
      if (attempt.context !== undefined) {
        const context = object(attempt.context, 'Desktop attempt context');
        if (id.startsWith('csf-')) {
          const key = JSON.stringify([text(context.story, 'Desktop story'), text(context.test, 'Desktop test name')]);
          if (identity !== undefined && identity !== key) throw new Error('Desktop test identity changed across attempts.');
          identity = key;
          if (id !== `csf-${reportDigest(key)}`) throw new Error('Desktop test ID does not match the authored callback identity.');
          if (context.endpoint !== report.endpoint) throw new Error('Desktop attempt endpoint differs from Storybook evidence.');
        }
      }
      return result;
    });
    if (attempts.at(-1) !== testStatus) throw new Error('Desktop final status disagrees with its last attempt.');
    const flaky = testStatus === 'passed' && failedAttempt;
    if (test.flaky !== flaky) throw new Error('Desktop flaky flag disagrees with recorded attempts.');
    if (identity !== undefined) {
      if (cases.has(identity)) throw new Error('Duplicate desktop story/test identity.');
      cases.set(identity, testStatus);
    }
    counts.selected++;
    counts.executed += Number(executed);
    counts.retries += test.attempts.length - 1;
    counts.flaky += Number(flaky);
    if (testStatus === 'passed' || testStatus === 'failed' || testStatus === 'skipped' || testStatus === 'unsupported')
      counts[testStatus]++;
    else counts.incomplete++;
  }
  const declaredCounts = object(run.counts, 'Desktop counts');
  for (const [name, value] of Object.entries(counts)) {
    if (declaredCounts[name] !== value) throw new Error(`Desktop ${name} count disagrees with recorded attempts.`);
  }
  const work = run.work.map((value) => choice(object(value, 'Desktop selected work').status, desktopStatuses, 'Desktop work status'));
  let infrastructureFailed = false;
  for (const value of run.failures) {
    const failure = object(value, 'Desktop failure');
    text(failure.failureId, 'Desktop failure ID');
    const kind = choice(failure.kind, ['test', 'infrastructure', 'cleanup', 'evidence', 'reporting'], 'Desktop failure kind');
    if (typeof object(failure.error, 'Desktop error').message !== 'string') throw new Error('Desktop error message must be a string.');
    infrastructureFailed ||= kind !== 'test';
  }
  if (
    status === 'passed' &&
    (infrastructureFailed ||
      counts.failed ||
      counts.incomplete ||
      !counts.executed ||
      work.some((value) => ['failed', 'not-run', 'incomplete', 'cancelled'].includes(value)))
  )
    throw new Error('Passed desktop run contains failures or incomplete execution.');
  for (const entry of report.cases) {
    const recorded = cases.get(JSON.stringify([entry.storyId, entry.testName]));
    if (recorded !== entry.status) throw new Error('Storybook case does not match canonical desktop results.');
  }
  const issues = [
    ...(report.error ? [report.error] : []),
    ...(status !== 'passed' ? [`Desktop supervisor status: ${status}.`] : []),
    ...(run.failures.length ? [`Desktop run recorded ${run.failures.length} failure(s), including prior attempts.`] : []),
    ...(counts.retries || counts.flaky ? ['Retried or flaky desktop execution is not qualifying evidence in this pilot.'] : []),
  ];
  return {
    ...report,
    format: 'desktop-test',
    startedAt,
    finishedAt,
    status: status === 'passed' && report.status === 'passed' && !issues.length ? 'passed' : 'failed',
    error: issues.length ? issues.join(' ') : undefined,
    harness: {
      runId,
      status,
      retries: counts.retries,
      flaky: counts.flaky,
      unsupported: counts.unsupported,
      incomplete: counts.incomplete,
      failureCount: run.failures.length,
    },
  };
}

export function parseEvidenceContext(value: unknown): EvidenceContext {
  const data = object(value, 'Evidence context');
  if (data.schemaVersion !== 1) throw new Error('Evidence context schemaVersion must be 1.');
  if (typeof data.physicalClick !== 'boolean') throw new Error('Evidence context physicalClick must be boolean.');
  const targetId = text(data.targetId, 'Context targetId');
  if (!isWin32StorybookTarget(targetId)) throw new Error('Context targetId is not a supported Win32 Storybook target.');
  return {
    schemaVersion: 1,
    reportSha256: hex(data.reportSha256, 64, 'Context reportSha256'),
    sourceCommit: hex(data.sourceCommit, 40, 'Context sourceCommit'),
    buildId: text(data.buildId, 'Context buildId'),
    contractDigest: hex(data.contractDigest, 64, 'Context contractDigest'),
    platformManifestDigest: hex(data.platformManifestDigest, 64, 'Context platformManifestDigest'),
    endpoint: choice(data.endpoint, ['win32'], 'Context endpoint'),
    renderer: choice(data.renderer, ['paper'], 'Context renderer'),
    targetId,
    finishedAt: timestamp(data.finishedAt, 'Context finishedAt'),
    physicalClick: data.physicalClick,
  };
}

function provenance(options: AssessmentOptions): Provenance {
  const { report, context, contract } = options;
  if (!report) return { status: 'missing', reasons: ['No native execution report supplied.'] };
  const mismatches: string[] = [];
  if (report.endpoint !== 'win32') mismatches.push(`Report endpoint is ${report.endpoint}, not win32.`);
  if (report.targetId !== undefined && !isWin32StorybookTarget(report.targetId)) mismatches.push('Report targets a different native host.');
  if (report.targetId !== undefined && options.expectedTargetId !== undefined && report.targetId !== options.expectedTargetId)
    mismatches.push('Report target does not match the expected native instance.');
  if (context) {
    if (context.reportSha256 !== options.reportSha256) mismatches.push('Execution context is bound to different report bytes.');
    if (context.sourceCommit !== options.sourceCommit) mismatches.push('Execution source revision does not match the target revision.');
    if (context.contractDigest !== contract.digest) mismatches.push('Execution contract/mapping inputs do not match the current inputs.');
    if (context.platformManifestDigest !== report.platformManifestDigest)
      mismatches.push('Execution platform manifest does not match the report.');
    if (report.targetId !== undefined && context.targetId !== report.targetId)
      mismatches.push('Execution target does not match the report.');
    if (options.expectedTargetId !== undefined && context.targetId !== options.expectedTargetId)
      mismatches.push('Execution target does not match the expected native instance.');
    if (report.finishedAt !== undefined && Date.parse(report.finishedAt) !== Date.parse(context.finishedAt))
      mismatches.push('Execution timestamp does not match the report.');
    if (options.expectedBuildId !== undefined && context.buildId !== options.expectedBuildId)
      mismatches.push('Execution build ID does not match the requested build.');
    if (Date.parse(context.finishedAt) > options.now.getTime()) mismatches.push('Execution timestamp is in the future.');
    if (
      !context.physicalClick &&
      report.cases.some((entry) => entry.storyId === storyId && entry.testName === testName && entry.status === 'passed')
    ) {
      mismatches.push('Recorded Checkbox pass contradicts the execution physical-click capability.');
    }
  }
  if (mismatches.length) return { status: 'mismatched', reasons: mismatches };
  if (
    context &&
    options.maxAgeHours !== undefined &&
    options.now.getTime() - Date.parse(context.finishedAt) > options.maxAgeHours * 3_600_000
  ) {
    return { status: 'stale', reasons: ['Execution evidence exceeds the explicitly requested maximum age.'] };
  }
  const reasons: string[] = [];
  if (!context) reasons.push('Report has no bound execution context; source/build/freshness cannot be established.');
  if (context?.targetId !== 'agenticstorybook-win32' && context && options.expectedTargetId === undefined)
    reasons.push('No expected native target instance was supplied.');
  if (options.workingTreeDirty) reasons.push('Target working tree has uncommitted changes; a commit alone does not identify these inputs.');
  if (options.expectedBuildId === undefined) reasons.push('No expected build ID was supplied.');
  if (options.maxAgeHours === undefined) reasons.push('No evidence-age policy was supplied.');
  return { status: reasons.length ? 'unverified' : 'matched', reasons };
}

export function assessCheckbox(options: AssessmentOptions) {
  hex(options.sourceCommit, 40, 'Target sourceCommit');
  if (!Number.isFinite(options.now.getTime())) throw new Error('Assessment time is invalid.');
  if (options.maxAgeHours !== undefined && (!Number.isFinite(options.maxAgeHours) || options.maxAgeHours <= 0)) {
    throw new Error('Maximum evidence age must be a positive finite number.');
  }
  if (options.context && !options.report) throw new Error('Execution context requires a native report.');
  if (options.report) hex(options.reportSha256, 64, 'Supplied report content hash');
  if (options.expectedBuildId !== undefined) text(options.expectedBuildId, 'Expected build ID');
  if (options.expectedTargetId !== undefined && !isWin32StorybookTarget(options.expectedTargetId))
    throw new Error('Expected target ID is not a supported Win32 Storybook target.');
  const evidence = provenance(options);
  const mappingCurrent = options.contract.mappingCurrent;
  const unitEvidence = assessCheckboxUnits({
    input: options.unit,
    sourceCommit: options.sourceCommit,
    workingTreeDirty: options.workingTreeDirty,
    contractDigest: options.contract.digest,
    contractMappingCurrent: mappingCurrent,
    now: options.now,
    maxAgeHours: options.maxAgeHours,
  });
  const runFailed = options.report?.status === 'failed' || Boolean(options.report?.error) || Boolean(options.executionFailure);
  const observed = options.report?.cases.find((entry) => entry.storyId === storyId && entry.testName === testName);
  const eligible = evidence.status === 'matched' && mappingCurrent;
  const requirements = options.contract.requirements.map((requirement) => {
    const mapping = coverage[requirement.id];
    const mapped = Boolean(mapping?.observed);
    let outcome: CheckOutcome = 'not-run';
    if (mapped && observed) {
      if (!mappingCurrent || evidence.status === 'stale') outcome = 'stale';
      else if (evidence.status === 'mismatched') outcome = 'mismatched';
      else if (!eligible) outcome = 'unverified';
      else if (observed.status === 'passed' && runFailed) outcome = 'unverified';
      else outcome = observed.status;
    }
    const check = mapped
      ? {
          storyId,
          testName,
          scope: mapping.observed!,
          coverage: 'partial' as const,
          recordedOutcome: observed?.status ?? 'not-run',
          evidenceOutcome: outcome,
          reason: observed?.reason,
        }
      : null;
    const unitChecks = unitEvidence.checks.filter(({ requirements }) => requirements.includes(requirement.id));
    const failed = outcome === 'failed' || unitChecks.some(({ evidenceOutcome }) => evidenceOutcome === 'failed');
    const partial = outcome === 'passed' || unitChecks.some(({ evidenceOutcome }) => evidenceOutcome === 'passed');
    return {
      ...requirement,
      outcome: failed ? 'blocked-by-failure' : partial ? 'partial' : 'insufficient-evidence',
      check,
      unitChecks,
      remainingCoverage: mapping?.remaining ?? 'No reviewed executable mapping exists for this requirement.',
    };
  });
  return {
    schemaVersion: 2,
    component: 'checkbox',
    generation: 'agentic',
    target: {
      endpoint: 'win32',
      renderer: 'paper',
      host: 'storybook',
      sourceCommit: options.sourceCommit,
      workingTreeDirty: options.workingTreeDirty,
      expectedBuildId: options.expectedBuildId ?? null,
    },
    generatedAt: options.now.toISOString(),
    advisory: true,
    declaredStatus: null,
    evidenceSupportedStatus: null,
    approvedStatus: null,
    policyStatus: 'pending',
    assessmentHealth:
      !mappingCurrent || evidence.status === 'stale' || unitEvidence.status === 'stale' || unitEvidence.mappingCurrent === false
        ? 'stale'
        : evidence.status === 'mismatched' || unitEvidence.status === 'mismatched'
          ? 'blocked'
          : 'complete',
    assessmentOutcome:
      requirements.some(({ outcome }) => outcome === 'blocked-by-failure') || unitEvidence.outcome === 'failed'
        ? 'failed'
        : (eligible && runFailed) || unitEvidence.outcome === 'execution-failed'
          ? 'execution-failed'
          : 'insufficient-evidence',
    contract: {
      path: `${componentPath}/SPEC.md`,
      digest: options.contract.digest,
      lifecycle: options.contract.lifecycle,
      conformance: options.contract.conformance,
      mappingVersion: 'checkbox-win32-v1',
      mappingCurrent,
    },
    evidence: {
      ...evidence,
      reportSha256: options.reportSha256 ?? null,
      platformManifestDigest: options.report?.platformManifestDigest ?? null,
      runStatus: options.report?.status ?? null,
      runError: options.executionFailure ?? options.report?.error ?? null,
      finishedAt: options.report?.finishedAt ?? null,
      format: options.report?.format ?? null,
      harness: options.report?.harness ?? null,
      context: options.context ?? null,
      caseCounts: {
        passed: options.report?.cases.filter(({ status }) => status === 'passed').length ?? 0,
        failed: options.report?.cases.filter(({ status }) => status === 'failed').length ?? 0,
        skipped: options.report?.cases.filter(({ status }) => status === 'skipped').length ?? 0,
      },
    },
    unitEvidence,
    requirements,
    limitations: [
      'Only the existing named native Checkbox case is mapped; passing it covers parts of CBX-002 and CBX-004, not either full requirement.',
      'Unit evidence is mocked JavaScript execution, not native Win32 UIA, focus, visual, or physical-input qualification.',
      'Evidence requirements follow the claim: unit/type checks can suffice for logic/API/style requirements; native tests are not mandatory duplicates for every requirement.',
      'The macOS focus case and non-Win32 platform tables are recorded but do not map to Win32 SPEC coverage.',
      'Type/build/visual/manual result adapters are not implemented. A Jest pass of a types test would not prove type checking.',
      'Maturity gates and release approvals are not defined by this pilot. No lifecycle status is inferred or changed.',
      'A multi-assertion native case failure blocks its mapped evidence; it does not identify which individual requirement assertion failed.',
      ...(!mappingCurrent
        ? ['Contract or story inputs changed since mapping review; review the mapping before accepting its evidence.']
        : []),
      ...(runFailed
        ? ['The enclosing execution failed or reported an error; recorded passes are not accepted as qualifying evidence.']
        : []),
      ...(unitEvidence.runFailed ? ['The enclosing unit command failed; its recorded passes cannot qualify.'] : []),
    ],
  };
}

export type ControlAssessment = ReturnType<typeof assessCheckbox>;

function markdown(value: string): string {
  return value.replace(/[\\|`*_[\]<>]/g, '\\$&').replace(/[\r\n]+/g, ' ');
}

export function formatAssessmentMarkdown(report: ControlAssessment): string {
  return [
    '# Checkbox / Win32 advisory assessment',
    '',
    '**Readiness: not established.** Maturity policy is pending; no stage is assigned.',
    '',
    `Assessment health: ${report.assessmentHealth}. Outcome: ${report.assessmentOutcome}.`,
    `Target source: \`${report.target.sourceCommit}\`. Working tree dirty: ${report.target.workingTreeDirty}.`,
    `Native execution provenance: ${report.evidence.status}. Mapping current: ${report.contract.mappingCurrent}.`,
    `Recorded native cases across the input report: ${report.evidence.caseCounts.passed} passed, ${report.evidence.caseCounts.failed} failed, ${report.evidence.caseCounts.skipped} skipped.`,
    ...(report.evidence.harness
      ? [
          `Desktop supervisor: ${report.evidence.harness.status}; retries: ${report.evidence.harness.retries}; flaky: ${report.evidence.harness.flaky}; unsupported: ${report.evidence.harness.unsupported}; incomplete: ${report.evidence.harness.incomplete}; failures: ${report.evidence.harness.failureCount}.`,
        ]
      : []),
    '',
    `Unit execution provenance: ${report.unitEvidence.status}. Outcome: ${report.unitEvidence.outcome}. Mapping current: ${report.unitEvidence.mappingCurrent ?? 'not collected'}.`,
    `Unit environment: ${report.unitEvidence.environment}.`,
    `Recorded unit cases: ${report.unitEvidence.caseCounts.passed} passed, ${report.unitEvidence.caseCounts.failed} failed, ${report.unitEvidence.caseCounts.skipped} skipped.`,
    `Recorded unit retries: ${report.unitEvidence.retryCounts.retries}; retry-success cases: ${report.unitEvidence.retryCounts.flaky}. Enclosing package retries: ${report.unitEvidence.packageRetryCounts?.retries ?? 0}.`,
    ...(report.unitEvidence.packageSuites !== null
      ? [
          `Unit input contained ${report.unitEvidence.packageSuites} package suites; only the Checkbox runtime suite is mapped. Type-suite Jest passes are not type-check evidence.`,
        ]
      : []),
    '',
    '| Requirement | Evidence outcome | Recorded native case | Qualifying partial unit cases | Remaining coverage |',
    '| --- | --- | --- | --- | --- |',
    ...report.requirements.map(
      (entry) =>
        `| ${markdown(entry.id)} | ${entry.outcome} | ${entry.check ? `${entry.check.recordedOutcome} (partial mapping; ${entry.check.evidenceOutcome})` : 'No executable mapping'} | ${entry.unitChecks.filter(({ evidenceOutcome }) => evidenceOutcome === 'passed').length} / ${entry.unitChecks.length} mapped | ${markdown(entry.remainingCoverage)} |`,
    ),
    '',
    '## Execution evidence',
    '',
    ...report.requirements
      .filter(({ check }) => check)
      .map(
        (entry) =>
          `- ${entry.id}: ${markdown(entry.check!.scope)} Recorded: ${entry.check!.recordedOutcome}.${entry.check!.reason ? ` Reason: ${markdown(entry.check!.reason!)}` : ''}`,
      ),
    ...report.evidence.reasons.map((reason) => `- ${markdown(reason)}`),
    '',
    '## JavaScript unit evidence',
    '',
    ...report.unitEvidence.reasons.map((reason) => `- ${markdown(reason)}`),
    ...(report.unitEvidence.executionFailure ? [`- ${markdown(report.unitEvidence.executionFailure)}`] : []),
    '| Test | Win32 requirement mapping | Recorded | Evidence outcome | Retries | Scope |',
    '| --- | --- | --- | --- | --- | --- |',
    ...report.unitEvidence.checks.map(
      (check) =>
        `| ${markdown(check.fullName)} | ${check.requirements.join(', ') || 'Not mapped to Win32'} | ${check.recordedOutcome} | ${check.evidenceOutcome} | ${check.retries} | ${markdown(check.scope)}${check.reason ? ` ${markdown(check.reason)}` : ''}${check.retryReasons.length ? ` Prior retry failures: ${markdown(check.retryReasons.join('\n'))}` : ''} |`,
    ),
    ...report.unitEvidence.unmappedCases.map((check) => `- Unmapped recorded unit case: ${markdown(check.fullName)} (${check.status}).`),
    '',
    '## Limitations',
    '',
    ...report.limitations.map((limitation) => `- ${markdown(limitation)}`),
    '',
  ].join('\n');
}
