import { execFileSync, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { appendFileSync, existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import {
  assessCheckbox,
  formatAssessmentMarkdown,
  hasStorybookArtifact,
  hex,
  object,
  parseEvidenceContext,
  parseNativeReport,
  readCheckboxContractFrom,
  readNativeEvidence,
  reportDigest,
  text,
  timestamp,
  win32StorybookTargetId,
} from './controlAssessment.ts';
import type { EvidenceContext } from './controlAssessment.ts';
import {
  assessmentPackagePath,
  assessmentSpecPath,
  specAssessmentFor,
  splitSpecAssessment,
  updateSpecAssessment,
} from './controlAssessmentSpec.ts';
import { parseUnitContext, readCheckboxUnitMappingFrom } from './controlAssessmentUnit.ts';
import type { UnitContext } from './controlAssessmentUnit.ts';

export const assessmentSummaryPath = 'packages/agentic/components/src/components/checkbox/assessment/ASSESSMENT.md';
export const assessmentArtifactName = 'checkbox-win32-assessment';
export const assessmentMaxAgeHours = 168;
export const assessmentWorkflowPath = '.github/workflows/pr.yml';
const marker = '<!-- furn-checkbox-assessment:';
const artifactDirectory = ['apps', 'storybook', 'artifacts', 'win32', 'assessment-ci'];
const desktopRunsPath = ['apps', 'storybook', 'artifacts', 'desktop'];
const maximumBundleBytes = 2_000_000;

export type CiIdentity = {
  repository: string;
  pullRequest: number;
  headRepository: string;
  headRef: string;
  headCommit: string;
  baseCommit: string;
  testedCommit: string;
  runId: string;
  runAttempt: number;
  inputDigest: string;
};
export type CiBundle = {
  schemaVersion: 1 | 2;
  identity: CiIdentity;
  generatedAt: string;
  nativeReport: string | null;
  context: EvidenceContext | null;
  executionFailure: string | null;
  unit?: {
    report: string | null;
    context: UnitContext | null;
    executionFailure: string | null;
  };
};
export type ReportReference = CiIdentity & { generatedAt: string };
type ExecutionStart = {
  schemaVersion: 2;
  identity: CiIdentity;
  contractDigest: string;
  startedAt: string;
  existingRuns: string[];
  targetId: string;
};

function desktopRuns(root: string): string[] {
  const directory = path.join(root, ...desktopRunsPath);
  if (!existsSync(directory)) return [];
  return readdirSync(directory, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !entry.isSymbolicLink())
    .map((entry) => entry.name)
    .sort();
}

export function git(root: string, args: string[]): string {
  return execFileSync('git', args, { cwd: root, encoding: 'utf8', maxBuffer: 32_000_000 }).trimEnd();
}

export function gitFile(root: string, commit: string, file: string): string | undefined {
  hex(commit, 40, 'Git revision');
  const result = spawnSync('git', ['show', `${commit}:${file}`], { cwd: root, encoding: 'utf8', maxBuffer: maximumBundleBytes });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    const exists = spawnSync('git', ['cat-file', '-e', commit], { cwd: root, encoding: 'utf8' });
    if (exists.status !== 0) throw new Error(`Git revision is unavailable: ${commit}.`);
    const entry = git(root, ['ls-tree', commit, '--', file]);
    if (entry) throw new Error(`Unable to read ${file} at ${commit}: ${result.stderr}`);
    return undefined;
  }
  return result.stdout;
}

export function ensureCommit(root: string, commit: string): void {
  hex(commit, 40, 'Git revision');
  const exists = spawnSync('git', ['cat-file', '-e', `${commit}^{commit}`], { cwd: root, encoding: 'utf8' });
  if (exists.error) throw exists.error;
  if (exists.status !== 0) git(root, ['fetch', '--no-tags', 'origin', commit]);
}

export function inputDigest(root: string, commit: string): string {
  hex(commit, 40, 'Input revision');
  const tree = execFileSync('git', ['ls-tree', '-rz', '--full-tree', commit], { cwd: root, maxBuffer: 32_000_000 });
  const excluded = Buffer.from(assessmentSummaryPath);
  const hash = createHash('sha256');
  let start = 0;
  for (let end = tree.indexOf(0); end !== -1; end = tree.indexOf(0, start)) {
    const entry = tree.subarray(start, end);
    const name = entry.subarray(entry.indexOf(9) + 1);
    if (!name.equals(excluded)) {
      if (name.toString('utf8') === assessmentSpecPath) {
        const bytes = execFileSync('git', ['show', `${commit}:${assessmentSpecPath}`], { cwd: root, maxBuffer: maximumBundleBytes });
        const spec = bytes.toString('utf8');
        if (!Buffer.from(spec).equals(bytes)) throw new Error('Tested SPEC must contain valid UTF-8.');
        const { contract } = splitSpecAssessment(spec);
        if (contract !== spec) {
          const oid = execFileSync('git', ['hash-object', '--stdin'], { cwd: root, input: contract, encoding: 'utf8' }).trim();
          const prefix = entry.subarray(0, entry.indexOf(9)).toString('utf8').split(' ');
          hash.update(`${prefix[0]} ${prefix[1]} ${oid}\t${assessmentSpecPath}\0`);
        } else {
          hash.update(entry).update('\0');
        }
      } else {
        hash.update(entry).update('\0');
      }
    }
    start = end + 1;
  }
  return hash.digest('hex');
}

export function parseIdentity(value: unknown): CiIdentity {
  const data = object(value, 'CI identity');
  const repository = text(data.repository, 'CI repository');
  const headRepository = text(data.headRepository, 'CI head repository');
  if (![repository, headRepository].every((value) => /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(value))) {
    throw new Error('Invalid CI repository name.');
  }
  if (!Number.isSafeInteger(data.pullRequest) || Number(data.pullRequest) <= 0) throw new Error('Invalid CI pull request number.');
  if (!Number.isSafeInteger(data.runAttempt) || Number(data.runAttempt) <= 0) throw new Error('Invalid CI run attempt.');
  const runId = text(data.runId, 'CI run ID');
  if (!/^[1-9]\d*$/.test(runId)) throw new Error('Invalid CI run ID.');
  const headRef = text(data.headRef, 'CI head branch');
  if (
    headRef.length > 250 ||
    [...headRef].some((character) => character.codePointAt(0)! <= 0x20 || character.codePointAt(0) === 0x7f) ||
    /[~^:?*[\]\\]/.test(headRef)
  ) {
    throw new Error('Invalid CI head branch.');
  }
  return {
    repository,
    headRepository,
    headRef,
    pullRequest: Number(data.pullRequest),
    runAttempt: Number(data.runAttempt),
    runId,
    headCommit: hex(data.headCommit, 40, 'CI head commit'),
    baseCommit: hex(data.baseCommit, 40, 'CI base commit'),
    testedCommit: hex(data.testedCommit, 40, 'CI tested commit'),
    inputDigest: hex(data.inputDigest, 64, 'CI input digest'),
  };
}

export function parseBundle(content: string): CiBundle {
  if (Buffer.byteLength(content) > maximumBundleBytes) throw new Error('Assessment bundle exceeds its size limit.');
  const data = object(JSON.parse(content), 'CI bundle');
  if (data.schemaVersion !== 1 && data.schemaVersion !== 2) throw new Error('Unsupported CI bundle schema.');
  if (data.nativeReport !== null && typeof data.nativeReport !== 'string') throw new Error('Invalid native report bytes.');
  if (data.executionFailure !== null && typeof data.executionFailure !== 'string') throw new Error('Invalid execution failure.');
  const nativeReport = data.nativeReport;
  const context = data.context === null ? null : parseEvidenceContext(data.context);
  if ((nativeReport === null) !== (context === null)) throw new Error('CI native report and context must be supplied together.');
  let unit: CiBundle['unit'];
  if (data.schemaVersion === 1) {
    if (data.unit !== undefined) throw new Error('Legacy CI bundles cannot contain unit evidence.');
  } else {
    const value = object(data.unit, 'CI unit evidence');
    if (value.report !== null && typeof value.report !== 'string') throw new Error('Invalid unit report bytes.');
    if (value.executionFailure !== null && typeof value.executionFailure !== 'string') throw new Error('Invalid unit execution failure.');
    const unitContext = value.context === null ? null : parseUnitContext(value.context);
    if ((value.report === null) !== (unitContext === null)) throw new Error('CI unit report and context must be supplied together.');
    unit = { report: value.report, context: unitContext, executionFailure: value.executionFailure };
  }
  return {
    schemaVersion: data.schemaVersion,
    identity: parseIdentity(data.identity),
    generatedAt: timestamp(data.generatedAt, 'CI generation time'),
    nativeReport,
    context,
    executionFailure: data.executionFailure,
    ...(unit ? { unit } : {}),
  };
}

export function parseReportReference(content: string): ReportReference {
  const first = content.split('\n', 1)[0];
  if (!first.startsWith(marker) || !first.endsWith(' -->') || first.length > 4096) {
    throw new Error('Missing or invalid generated assessment reference.');
  }
  const encoded = first.slice(marker.length, -4);
  if (!/^[A-Za-z0-9+/]+={0,2}$/.test(encoded)) throw new Error('Invalid assessment reference encoding.');
  const data = object(JSON.parse(Buffer.from(encoded, 'base64').toString('utf8')), 'Report reference');
  return { ...parseIdentity(data), generatedAt: timestamp(data.generatedAt, 'Report generation time') };
}

export function assertFresh(generatedAt: string, now: Date): void {
  const age = now.getTime() - Date.parse(timestamp(generatedAt, 'Assessment generation time'));
  if (!Number.isFinite(age) || age < 0 || age > assessmentMaxAgeHours * 3_600_000) {
    throw new Error(`Assessment is from the future or older than the explicit ${assessmentMaxAgeHours}-hour CI reuse limit.`);
  }
}

export function assertTestedInputs(root: string, identity: CiIdentity): void {
  ensureCommit(root, identity.testedCommit);
  const parents = git(root, ['rev-list', '--parents', '-n', '1', identity.testedCommit]).split(' ');
  if (parents.length !== 3 || parents[1] !== identity.baseCommit || parents[2] !== identity.headCommit) {
    throw new Error('CI evidence must identify the actual PR merge commit and both source parents.');
  }
  if (inputDigest(root, identity.testedCommit) !== identity.inputDigest) throw new Error('CI input digest does not match the tested tree.');
}

export function assessCiBundle(root: string, bundle: CiBundle) {
  assertTestedInputs(root, bundle.identity);
  const read = (file: string) => {
    const content = gitFile(root, bundle.identity.testedCommit, file);
    if (content === undefined) throw new Error(`Tested contract file is missing: ${file}.`);
    return content;
  };
  const contract = readCheckboxContractFrom(read);
  if (bundle.context && Date.parse(bundle.context.finishedAt) > Date.parse(bundle.generatedAt)) {
    throw new Error('Native execution finished after its assessment was generated.');
  }
  const expectedBuildId = `${bundle.identity.repository}/actions/runs/${bundle.identity.runId}/attempts/${bundle.identity.runAttempt}`;
  const report = assessCheckbox({
    contract,
    sourceCommit: bundle.identity.testedCommit,
    workingTreeDirty: false,
    now: new Date(bundle.generatedAt),
    expectedBuildId,
    expectedTargetId: bundle.context?.targetId,
    maxAgeHours: assessmentMaxAgeHours,
    report: bundle.nativeReport === null ? undefined : parseNativeReport(JSON.parse(bundle.nativeReport)),
    reportSha256: bundle.nativeReport === null ? undefined : reportDigest(bundle.nativeReport),
    context: bundle.context ?? undefined,
    executionFailure: bundle.executionFailure ?? undefined,
    unit: bundle.unit
      ? {
          mapping: bundle.unit.report === null ? undefined : readCheckboxUnitMappingFrom(read),
          report: bundle.unit.report ?? undefined,
          context: bundle.unit.context ?? undefined,
          executionFailure: bundle.unit.executionFailure ?? undefined,
          expectedBuildId,
        }
      : undefined,
  });
  if (report.evidence.status === 'mismatched' || report.evidence.status === 'stale') {
    throw new Error(`CI evidence binding failed: ${report.evidence.reasons.join(' ')}`);
  }
  if (report.unitEvidence.status === 'mismatched' || report.unitEvidence.status === 'stale') {
    throw new Error(`CI unit evidence binding failed: ${report.unitEvidence.reasons.join(' ')}`);
  }
  if (bundle.unit?.context?.workingTreeDirty) throw new Error('CI unit evidence was captured from dirty source inputs.');
  return report;
}

export function formatCiSummary(root: string, bundle: CiBundle): string {
  const report = assessCiBundle(root, bundle);
  const reference: ReportReference = { ...bundle.identity, generatedAt: bundle.generatedAt };
  const encoded = Buffer.from(JSON.stringify(reference)).toString('base64');
  return [
    `${marker}${encoded} -->`,
    '<!-- AUTO-GENERATED. DO NOT EDIT. Regenerate from the linked CI execution. -->',
    '',
    ...formatAssessmentMarkdown(report).trimEnd().split('\n'),
    '',
    '## CI source and freshness',
    '',
    `Assessed at: ${bundle.generatedAt}.`,
    `Pull request source: \`${bundle.identity.headCommit}\`. Tested base: \`${bundle.identity.baseCommit}\`.`,
    `All tracked input digest: \`${bundle.identity.inputDigest}\`.`,
    `Execution: https://github.com/${bundle.identity.repository}/actions/runs/${bundle.identity.runId}/attempts/${bundle.identity.runAttempt}`,
    '',
    'This is a snapshot of that execution, not a claim that the latest revision has passed.',
    'Only this generated summary and the exact validated assessment block in Checkbox SPEC front matter are excluded from the input digest. All other contract bytes, code, tests, dependencies, workflows, and configuration remain inputs.',
    'A report-only commit is not relabeled as a tested commit. CI may reuse the original results only after checking unchanged inputs and the original required PR result.',
    ...(bundle.executionFailure
      ? ['', `CI execution limitation: ${bundle.executionFailure.replace(/[<>]/g, '').replace(/[\r\n]/g, ' ')}`]
      : []),
    '',
  ].join('\n');
}

export function formatCiSpec(root: string, bundle: CiBundle): string {
  const report = assessCiBundle(root, bundle);
  for (const commit of [bundle.identity.headCommit, bundle.identity.testedCommit]) {
    if (!git(root, ['ls-tree', commit, '--', assessmentSpecPath]).startsWith('100644 blob ')) {
      throw new Error('Assessment publication requires a regular nonexecutable SPEC file.');
    }
  }
  const manifest = gitFile(root, bundle.identity.testedCommit, assessmentPackagePath);
  const spec = gitFile(root, bundle.identity.headCommit, assessmentSpecPath);
  if (manifest === undefined || spec === undefined) throw new Error('Tested component manifest or source SPEC is missing.');
  const version = text(object(JSON.parse(manifest), 'Tested component manifest').version, 'Tested component version');
  return updateSpecAssessment(spec, specAssessmentFor(report, version));
}

function identityFromEnvironment(root: string, env: NodeJS.ProcessEnv): CiIdentity {
  const eventPath = text(env.GITHUB_EVENT_PATH, 'GITHUB_EVENT_PATH');
  const event = object(JSON.parse(readFileSync(eventPath, 'utf8')), 'PR event');
  const pr = object(event.pull_request, 'PR event pull_request');
  const head = object(pr.head, 'PR head');
  const base = object(pr.base, 'PR base');
  const testedCommit = hex(env.GITHUB_SHA, 40, 'GITHUB_SHA');
  const identity = parseIdentity({
    repository: env.GITHUB_REPOSITORY,
    pullRequest: pr.number,
    headRepository: object(head.repo, 'PR head repository').full_name,
    headRef: head.ref,
    headCommit: head.sha,
    baseCommit: base.sha,
    testedCommit,
    runId: env.GITHUB_RUN_ID,
    runAttempt: Number(env.GITHUB_RUN_ATTEMPT),
    inputDigest: inputDigest(root, testedCommit),
  });
  if (git(root, ['rev-parse', 'HEAD']) !== testedCommit) throw new Error('CI checkout does not match GITHUB_SHA.');
  assertTestedInputs(root, identity);
  return identity;
}

function assertCleanInputs(root: string): void {
  if (git(root, ['status', '--porcelain', '--untracked-files=all', '--', '.', `:(exclude)${assessmentSummaryPath}`])) {
    throw new Error('CI tracked or nonignored inputs changed outside the generated assessment summary.');
  }
}

export function beginCiExecution(root: string, env: NodeJS.ProcessEnv, now = new Date()): void {
  const directory = path.join(root, ...artifactDirectory);
  const identity = identityFromEnvironment(root, env);
  assertCleanInputs(root);
  if (
    !(env.FURN_DESKTOP_DRIVER_DISABLED_INPUT_FEATURES ?? '')
      .split(',')
      .map((value) => value.trim())
      .includes('physicalClick')
  ) {
    throw new Error('The hosted pilot requires explicit physicalClick disabling; do not claim interactive-runner qualification.');
  }
  const contract = readCheckboxContractFrom((file) => readFileSync(path.join(root, file), 'utf8'));
  mkdirSync(directory, { recursive: true });
  const start: ExecutionStart = {
    schemaVersion: 2,
    identity,
    contractDigest: contract.digest,
    startedAt: now.toISOString(),
    existingRuns: desktopRuns(root),
    targetId: win32StorybookTargetId(root),
  };
  writeFileSync(path.join(directory, 'execution-start.json'), `${JSON.stringify(start, null, 2)}\n`);
}

export function beginCiUnitCollection(root: string, env: NodeJS.ProcessEnv, now = new Date()): void {
  const directory = path.join(root, 'apps', 'storybook', 'artifacts', 'assessment-unit-ci');
  const identity = identityFromEnvironment(root, env);
  assertCleanInputs(root);
  mkdirSync(directory, { recursive: true });
  if (existsSync(path.join(directory, 'unit-execution.json'))) throw new Error('Unit results already exist before CI collection.');
  writeFileSync(
    path.join(directory, 'unit-collection-start.json'),
    `${JSON.stringify(
      {
        schemaVersion: 1,
        identity,
        startedAt: now.toISOString(),
        buildId: `${identity.repository}/actions/runs/${identity.runId}/attempts/${identity.runAttempt}`,
      },
      null,
      2,
    )}\n`,
  );
}

export function finishCiExecution(root: string, env: NodeJS.ProcessEnv, now = new Date()): CiBundle {
  const directory = path.join(root, ...artifactDirectory);
  mkdirSync(directory, { recursive: true });
  const identity = identityFromEnvironment(root, env);
  assertCleanInputs(root);
  const startPath = path.join(directory, 'execution-start.json');
  const started = existsSync(startPath) ? object(JSON.parse(readFileSync(startPath, 'utf8')), 'Execution start') : undefined;
  if (started && started.schemaVersion !== 2) throw new Error('Unsupported pre-execution capture schema.');
  if (started && JSON.stringify(parseIdentity(started.identity)) !== JSON.stringify(identity)) {
    throw new Error('CI inputs or identity changed during native execution.');
  }
  if (started && (!Array.isArray(started.existingRuns) || started.existingRuns.some((name) => typeof name !== 'string'))) {
    throw new Error('Invalid pre-execution desktop run inventory.');
  }
  const freshRuns = started ? desktopRuns(root).filter((name) => !(started.existingRuns as string[]).includes(name)) : [];
  if (freshRuns.length > 1) throw new Error('Ambiguous native evidence: more than one desktop run started during smoke.');
  const reportPath = freshRuns.length ? path.join(root, ...desktopRunsPath, freshRuns[0], 'run.json') : undefined;
  let nativeReport: string | null = null;
  let collectionFailure: string | undefined;
  if (reportPath && existsSync(reportPath)) {
    const canonical = object(JSON.parse(readFileSync(reportPath, 'utf8')), 'Desktop supervisor report');
    if (hasStorybookArtifact(canonical)) {
      if (existsSync(path.join(path.dirname(reportPath), 'evidence', 'win32', 'static', 'run.json'))) {
        nativeReport = readNativeEvidence(reportPath);
      } else {
        collectionFailure = 'Desktop supervisor declared Win32 Storybook smoke evidence, but the companion report is missing.';
      }
    } else {
      collectionFailure = 'Desktop supervisor produced no Win32 Storybook smoke evidence; native assessment is unavailable.';
    }
  }
  let context: EvidenceContext | null = null;
  if (nativeReport !== null) {
    const parsed = parseNativeReport(JSON.parse(nativeReport));
    if (parsed.format !== 'desktop-test' || !parsed.finishedAt || !parsed.startedAt) {
      throw new Error('CI requires the canonical desktop-test result and its timestamped smoke evidence.');
    }
    const began = timestamp(started?.startedAt, 'Execution start time');
    if (Date.parse(parsed.startedAt) < Date.parse(began)) {
      throw new Error('Desktop report predates this execution.');
    }
    if (parsed.harness?.runId !== freshRuns[0]) throw new Error('Desktop run ID does not match its artifact directory.');
    if (parsed.targetId !== text(started?.targetId, 'Execution target ID'))
      throw new Error('Desktop report targets a different native instance from the pre-execution capture.');
    context = parseEvidenceContext({
      schemaVersion: 1,
      reportSha256: reportDigest(nativeReport),
      sourceCommit: identity.testedCommit,
      buildId: `${identity.repository}/actions/runs/${identity.runId}/attempts/${identity.runAttempt}`,
      contractDigest: hex(started?.contractDigest, 64, 'Execution contract digest'),
      platformManifestDigest: parsed.platformManifestDigest,
      endpoint: 'win32',
      renderer: 'paper',
      targetId: text(started?.targetId, 'Execution target ID'),
      finishedAt: parsed.finishedAt,
      physicalClick: false,
    });
  }
  const outcome = text(env.SMOKE_OUTCOME, 'SMOKE_OUTCOME');
  if (!['success', 'failure', 'cancelled', 'skipped'].includes(outcome)) throw new Error('Unsupported smoke step outcome.');
  const executionFailure =
    outcome !== 'success'
      ? `Win32 smoke step outcome: ${outcome}. Recorded results do not establish successful native execution.`
      : nativeReport === null
        ? (collectionFailure ?? 'Win32 smoke did not produce a current native report.')
        : null;
  const unit = readCiUnitCapture(directory, identity, env.UNIT_OUTCOME);
  const bundle = parseBundle(
    JSON.stringify({ schemaVersion: 2, identity, generatedAt: now.toISOString(), nativeReport, context, executionFailure, unit }),
  );
  writeCiAssessment(root, directory, bundle, env);
  return bundle;
}

function readCiUnitCapture(directory: string, identity: CiIdentity, unitOutcome?: string): NonNullable<CiBundle['unit']> {
  const unitPath = path.join(directory, 'unit-execution.json');
  let unit: NonNullable<CiBundle['unit']> = { report: null, context: null, executionFailure: null };
  if (unitOutcome !== undefined && !['success', 'failure', 'cancelled', 'skipped'].includes(unitOutcome)) {
    throw new Error('Unsupported unit step outcome.');
  }
  if (existsSync(unitPath)) {
    const captured = object(JSON.parse(readFileSync(unitPath, 'utf8')), 'Unit execution capture');
    if (captured.schemaVersion !== 1 || JSON.stringify(parseIdentity(captured.identity)) !== JSON.stringify(identity)) {
      throw new Error('Unit execution capture belongs to different CI inputs or attempt.');
    }
    const context = captured.context === null ? null : parseUnitContext(captured.context);
    if (!Number.isSafeInteger(captured.exitCode) || Number(captured.exitCode) < 0) throw new Error('Invalid unit capture exit code.');
    if (context && Date.parse(context.startedAt) < Date.parse(timestamp(captured.collectionStartedAt, 'Unit collection start time'))) {
      throw new Error('Unit report predates this CI execution.');
    }
    if (captured.report !== null && typeof captured.report !== 'string') throw new Error('Invalid captured unit report.');
    if (captured.executionFailure !== null && typeof captured.executionFailure !== 'string')
      throw new Error('Invalid captured unit failure.');
    unit = {
      report: captured.report,
      context,
      executionFailure:
        unitOutcome !== undefined && unitOutcome !== 'success'
          ? `Checkbox unit step outcome: ${unitOutcome}.`
          : Number(captured.exitCode) !== 0
            ? `Checkbox unit collector failed with exit ${captured.exitCode}.`
            : captured.executionFailure,
    };
  } else if (unitOutcome !== undefined) {
    unit.executionFailure = `Checkbox unit step outcome: ${unitOutcome}; no current execution capture was produced.`;
  }
  return unit;
}

export function combineCiEvidence(root: string, env: NodeJS.ProcessEnv, now = new Date()): CiBundle {
  const directory = path.join(root, ...artifactDirectory);
  mkdirSync(directory, { recursive: true });
  const identity = identityFromEnvironment(root, env);
  assertCleanInputs(root);
  const nativePath = path.join(directory, 'bundle.json');
  const native = existsSync(nativePath) ? parseBundle(readFileSync(nativePath, 'utf8')) : undefined;
  if (native && JSON.stringify(native.identity) !== JSON.stringify(identity))
    throw new Error('Native artifact belongs to different CI inputs or attempt.');
  if (native) assertFresh(native.generatedAt, now);
  const unitDirectory = path.join(root, 'apps', 'storybook', 'artifacts', 'assessment-unit-ci');
  const unit = readCiUnitCapture(
    unitDirectory,
    identity,
    existsSync(path.join(unitDirectory, 'unit-execution.json')) ? undefined : env.UNIT_OUTCOME,
  );
  const bundle = parseBundle(
    JSON.stringify({
      schemaVersion: 2,
      identity,
      generatedAt: now.toISOString(),
      nativeReport: native?.nativeReport ?? null,
      context: native?.context ?? null,
      executionFailure:
        native?.executionFailure ??
        (native ? null : `Native job outcome: ${text(env.NATIVE_OUTCOME, 'NATIVE_OUTCOME')}; no native bundle was collected.`),
      unit,
    }),
  );
  writeCiAssessment(root, directory, bundle, env);
  return bundle;
}

function writeCiAssessment(root: string, directory: string, bundle: CiBundle, env: NodeJS.ProcessEnv): void {
  const report = assessCiBundle(root, bundle);
  const summary = formatCiSummary(root, bundle);
  writeFileSync(path.join(directory, 'bundle.json'), `${JSON.stringify(bundle, null, 2)}\n`);
  writeFileSync(path.join(directory, 'assessment.json'), `${JSON.stringify(report, null, 2)}\n`);
  writeFileSync(path.join(directory, 'ASSESSMENT.md'), summary);
  writeFileSync(path.join(directory, 'SPEC.md'), formatCiSpec(root, bundle));
  if (bundle.unit?.report !== null && bundle.unit?.report !== undefined) {
    writeFileSync(path.join(directory, 'jest.json'), bundle.unit.report);
    writeFileSync(path.join(directory, 'unit-context.json'), `${JSON.stringify(bundle.unit.context, null, 2)}\n`);
  }
  if (env.GITHUB_STEP_SUMMARY) appendFileSync(env.GITHUB_STEP_SUMMARY, summary);
}

export function isReportOnlyUpdate(root: string, reference: ReportReference, head: string, merged: string): boolean {
  ensureCommit(root, reference.headCommit);
  ensureCommit(root, head);
  ensureCommit(root, merged);
  const parents = git(root, ['rev-list', '--parents', '-n', '1', head]).split(' ');
  if (parents.length !== 2 || parents[1] !== reference.headCommit) return false;
  const changed = git(root, ['diff', '--name-only', reference.headCommit, head]).split('\n');
  if (changed.length !== 2 || changed.some((file) => ![assessmentSummaryPath, assessmentSpecPath].includes(file))) return false;
  for (const file of [assessmentSummaryPath, assessmentSpecPath]) {
    if (!git(root, ['ls-tree', merged, '--', file]).startsWith('100644 blob ')) return false;
  }
  const spec = gitFile(root, head, assessmentSpecPath);
  if (spec === undefined || splitSpecAssessment(spec).assessment === undefined) return false;
  assertTestedInputs(root, reference);
  return inputDigest(root, merged) === reference.inputDigest;
}
