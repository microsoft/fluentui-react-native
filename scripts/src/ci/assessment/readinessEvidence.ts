import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, globSync, lstatSync, readFileSync, realpathSync } from 'node:fs';
import path from 'node:path';
import { API } from 'typescript/unstable/sync';
import { SyntaxKind } from 'typescript/unstable/ast';
import { createScanner } from 'typescript/unstable/ast/scanner';

import { discoverAssessments } from './assessmentConfig.ts';
import { hex, object, parseNativeReport, readControlContractFrom, reportDigest, text, timestamp } from './controlAssessment.ts';
import { git, gitFile, inputDigest, parseIdentity } from './controlAssessmentCi.ts';
import { parseJestFiles, parseUnitContext, readUnitMappingFrom } from './controlAssessmentUnit.ts';
import type { ReadinessControl, ReadinessKind, ReadinessTarget } from './readinessModel.ts';

export type EvidenceOutcome = 'passed' | 'failed' | 'skipped' | 'missing' | 'unsupported' | 'stale' | 'mismatched' | 'unverified';
export type InputLane = 'accessible' | 'physical' | 'all';
export type SourceState = { commit: string; inputDigest: string; dirty: boolean; fingerprint: string };
export type ExecutionIdentity = {
  repository: string;
  workflow: string;
  runId: string;
  runAttempt: number;
  job: string;
  buildId: string;
};
export type ExecutionCapture = {
  schemaVersion: 1;
  kind: 'native' | 'type';
  target: ReadinessTarget;
  input: InputLane;
  before: SourceState;
  after: SourceState;
  identity: ExecutionIdentity | null;
  startedAt: string;
  finishedAt: string;
  exitCode: number | null;
  command: string[];
  commandSha256?: string;
  report: string | null;
  reportSha256: string | null;
  existingRunIds: string[];
  selectedRunId: string | null;
  collectionFailure: string | null;
};
export type UnitCollection = {
  schemaVersion: 1;
  kind: 'unit';
  capture: string;
  execution: string;
  collectionStart: string;
  executionStart?: string;
};
export type TestObservation = {
  scope?: 'local' | 'ci';
  controlId?: string;
  kind: ReadinessKind;
  qualification?: 'keyboard' | 'screen-reader';
  name: string;
  target?: ReadinessTarget;
  input?: InputLane;
  recordedOutcome: EvidenceOutcome;
  outcome: EvidenceOutcome;
  reasons: string[];
  reportSha256: string | null;
  buildId: string | null;
};
export type ReadinessEvidence = {
  observations: TestObservation[];
  limitations: string[];
  nativeSelections: {
    target: ReadinessTarget;
    input: InputLane;
    selection: Record<string, unknown> | null;
    outcome: EvidenceOutcome;
    reasons: string[];
  }[];
};
export const evidenceMaxAgeMs = 168 * 3_600_000;

export function strings(value: unknown, label: string): string[] {
  if (!Array.isArray(value)) throw new Error(`${label} must be an array.`);
  return value.map((entry) => text(entry, label));
}

export function member<T extends string>(value: unknown, choices: readonly T[], label: string): T {
  const found = choices.find((entry) => entry === value);
  if (found === undefined) throw new Error(`Invalid ${label}.`);
  return found;
}

export function integer(value: unknown, label: string, minimum = 0): number {
  if (!Number.isSafeInteger(value) || Number(value) < minimum) throw new Error(`Invalid ${label}.`);
  return Number(value);
}

export function safeArtifactFile(directory: string, relative: string): string {
  if (
    relative.includes('\\') ||
    path.posix.isAbsolute(relative) ||
    path.win32.isAbsolute(relative) ||
    relative.split('/').some((part) => !part || part === '..' || part === '.')
  )
    throw new Error('Artifact path must be a normalized relative path.');
  const root = realpathSync(directory);
  const absolute = path.join(root, ...relative.split('/'));
  let current = root;
  for (const segment of relative.split('/')) {
    current = path.join(current, segment);
    if (lstatSync(current).isSymbolicLink()) throw new Error('Artifact paths must not traverse symlinks.');
  }
  const result = realpathSync(absolute);
  const inside = path.relative(root, result);
  if (inside.startsWith('..') || path.isAbsolute(inside)) throw new Error('Artifact escaped its directory.');
  if (!lstatSync(result).isFile()) throw new Error('Expected an artifact file.');
  return result;
}

export function readArtifact(directory: string, relative: string): string {
  const file = safeArtifactFile(directory, relative);
  if (lstatSync(file).size > 8_000_000) throw new Error('Readiness artifact exceeds 8 MB.');
  const bytes = readFileSync(file);
  const content = bytes.toString('utf8');
  if (!Buffer.from(content).equals(bytes)) throw new Error('Readiness artifacts must be valid UTF-8.');
  return content;
}

export function sourceState(root: string): SourceState {
  const commit = hex(git(root, ['rev-parse', 'HEAD']), 40, 'Source commit');
  const status = git(root, ['status', '--porcelain', '--untracked-files=all']);
  const diff = execFileSync('git', ['diff', '--binary', 'HEAD'], { cwd: root, maxBuffer: 32_000_000 });
  return {
    commit,
    inputDigest: inputDigest(root, commit),
    dirty: status.length > 0,
    fingerprint: createHash('sha256').update(status).update('\0').update(diff).digest('hex'),
  };
}

export function executionIdentity(env: NodeJS.ProcessEnv = process.env): ExecutionIdentity | null {
  if (env.GITHUB_ACTIONS !== 'true') return null;
  const repository = text(env.GITHUB_REPOSITORY, 'GITHUB_REPOSITORY');
  if (!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repository)) throw new Error('Invalid execution repository.');
  const runId = text(env.GITHUB_RUN_ID, 'GITHUB_RUN_ID');
  if (!/^[1-9]\d*$/.test(runId)) throw new Error('Invalid workflow run ID.');
  const runAttempt = integer(Number(env.GITHUB_RUN_ATTEMPT), 'Workflow run attempt', 1);
  return {
    repository,
    workflow: text(env.GITHUB_WORKFLOW_REF, 'GITHUB_WORKFLOW_REF'),
    runId,
    runAttempt,
    job: text(env.FURN_READINESS_SOURCE_JOB_NAME ?? env.GITHUB_JOB, 'GITHUB_JOB'),
    buildId: `${repository}/actions/runs/${runId}/attempts/${runAttempt}`,
  };
}

function parseSource(value: unknown): SourceState {
  const data = object(value, 'Execution source state');
  if (typeof data.dirty !== 'boolean') throw new Error('Source dirty state must be boolean.');
  return {
    commit: hex(data.commit, 40, 'Execution commit'),
    inputDigest: hex(data.inputDigest, 64, 'Execution input digest'),
    dirty: data.dirty,
    fingerprint: hex(data.fingerprint, 64, 'Execution source fingerprint'),
  };
}

function parseExecutionIdentity(value: unknown): ExecutionIdentity | null {
  if (value === null) return null;
  const data = object(value, 'Execution identity');
  const identity = executionIdentity({
    GITHUB_ACTIONS: 'true',
    GITHUB_REPOSITORY: text(data.repository, 'Repository'),
    GITHUB_WORKFLOW_REF: text(data.workflow, 'Workflow ref'),
    GITHUB_RUN_ID: text(data.runId, 'Run ID'),
    GITHUB_RUN_ATTEMPT: String(integer(data.runAttempt, 'Run attempt', 1)),
    GITHUB_JOB: text(data.job, 'Source job'),
  });
  if (!identity || identity.buildId !== data.buildId) throw new Error('Inconsistent build identity.');
  return identity;
}

const targets = ['win32-paper', 'windows-fabric', 'macos-fabric', 'macos-paper'] as const;
export function parseExecutionCapture(value: unknown): ExecutionCapture {
  const data = object(value, 'Readiness execution');
  if (data.schemaVersion !== 1) throw new Error('Unsupported readiness execution schema.');
  const report = data.report === null ? null : text(data.report, 'Exact report bytes');
  const digest = data.reportSha256 === null ? null : hex(data.reportSha256, 64, 'Report hash');
  if ((report === null) !== (digest === null)) throw new Error('Report bytes and hash must be supplied together.');
  const startedAt = timestamp(data.startedAt, 'Execution start');
  const finishedAt = timestamp(data.finishedAt, 'Execution finish');
  if (Date.parse(finishedAt) < Date.parse(startedAt)) throw new Error('Execution interval is reversed.');
  const command = strings(data.command, 'Executed command');
  if (!command.length) throw new Error('Execution requires its actual command.');
  return {
    schemaVersion: 1,
    kind: member(data.kind, ['native', 'type'], 'Execution kind'),
    target: member(data.target, targets, 'Native target'),
    input: member(data.input, ['accessible', 'physical', 'all'], 'Input lane'),
    before: parseSource(data.before),
    after: parseSource(data.after),
    identity: parseExecutionIdentity(data.identity),
    startedAt,
    finishedAt,
    exitCode: data.exitCode === null ? null : integer(data.exitCode, 'Execution exit code'),
    command,
    ...(data.commandSha256 === undefined ? {} : { commandSha256: hex(data.commandSha256, 64, 'Executed command hash') }),
    report,
    reportSha256: digest,
    existingRunIds: strings(data.existingRunIds, 'Pre-execution run inventory'),
    selectedRunId: data.selectedRunId === null ? null : text(data.selectedRunId, 'Selected run ID'),
    collectionFailure: data.collectionFailure === null ? null : text(data.collectionFailure, 'Collection failure'),
  };
}

export type EvidenceEnvironment = {
  source: SourceState;
  identity: ExecutionIdentity | null;
  now: Date;
  ci: boolean;
  sourceJobs: ReadonlyMap<string, 'success' | 'failure' | 'incomplete'>;
};

export function captureProblems(capture: ExecutionCapture, environment: EvidenceEnvironment): string[] {
  const reasons: string[] = [];
  if (capture.report !== null && reportDigest(capture.report) !== capture.reportSha256)
    reasons.push('Report bytes changed after execution.');
  if (
    capture.before.commit !== environment.source.commit ||
    capture.before.inputDigest !== environment.source.inputDigest ||
    JSON.stringify(capture.before) !== JSON.stringify(capture.after)
  )
    reasons.push('Source commit or tracked inputs changed.');
  if (capture.before.dirty || capture.after.dirty || environment.source.dirty) reasons.push('Dirty source inputs do not qualify.');
  const age = Math.max(environment.now.getTime(), Date.now()) - Date.parse(capture.finishedAt);
  if (age < 0 || age > evidenceMaxAgeMs) reasons.push('Execution evidence is stale or future-dated.');
  if (capture.exitCode !== 0) reasons.push('Enclosing command failed or did not finish.');
  if (capture.report === null) reasons.push('Execution produced no fresh report.');
  if (capture.collectionFailure) reasons.push(capture.collectionFailure);
  if (environment.ci) {
    const identity = capture.identity;
    const expected = environment.identity;
    if (
      !identity ||
      !expected ||
      identity.repository !== expected.repository ||
      identity.workflow !== expected.workflow ||
      identity.runId !== expected.runId ||
      identity.runAttempt !== expected.runAttempt ||
      identity.buildId !== expected.buildId
    )
      reasons.push('Evidence belongs to a different repository, workflow run, attempt, or build.');
    if (!identity || environment.sourceJobs.get(identity.job) !== 'success')
      reasons.push('Source job success has not been independently observed from the current workflow attempt.');
  }
  return reasons;
}

export function assessNativeCapture(capture: ExecutionCapture, environment: EvidenceEnvironment): ReadinessEvidence {
  if (capture.kind !== 'native') throw new Error('Expected native execution capture.');
  const reasons = captureProblems(capture, environment);
  if (capture.report === null)
    return {
      observations: [],
      limitations: reasons,
      nativeSelections: [{ target: capture.target, input: capture.input, selection: null, outcome: 'missing', reasons }],
    };
  const report = parseNativeReport(JSON.parse(capture.report));
  if (report.format !== 'desktop-test' || !report.harness) throw new Error('Native readiness requires a supervisor envelope.');
  const envelope = object(JSON.parse(capture.report), 'Native envelope');
  const run = object(JSON.parse(text(envelope.desktopRun, 'Supervisor bytes')), 'Supervisor');
  const context = run.context === undefined ? {} : object(run.context, 'Resolved target context');
  const lane = run.lane === undefined ? {} : object(run.lane, 'Executed input lane');
  const [endpoint, renderer] = capture.target.split('-');
  if (report.endpoint !== endpoint || context.endpoint !== endpoint || context.renderer !== renderer)
    reasons.push('Actual endpoint or renderer does not attest the requested target.');
  const actualInput = lane.input === 'accessible' || lane.input === 'physical' ? lane.input : null;
  const effectiveInput = capture.input === 'all' ? (actualInput ?? 'all') : capture.input;
  if (
    (capture.input !== 'all' && actualInput !== capture.input) ||
    (actualInput !== null && lane.policyEnforced !== true) ||
    (capture.input !== 'all' && lane.policyEnforced !== true)
  )
    reasons.push('Actual enforced input lane does not attest the requested lane.');
  if (run.terminal !== true) reasons.push('Supervisor has not persisted a terminal report.');
  if (!capture.selectedRunId || capture.selectedRunId !== report.harness.runId || capture.existingRunIds.includes(capture.selectedRunId))
    reasons.push('Native run was not uniquely fresh relative to the pre-execution inventory.');
  if (
    !report.startedAt ||
    !report.finishedAt ||
    Date.parse(report.startedAt) < Date.parse(capture.startedAt) ||
    Date.parse(report.finishedAt) > Date.parse(capture.finishedAt)
  )
    reasons.push('Native report is outside its captured execution interval.');
  if (
    report.status !== 'passed' ||
    report.harness.status !== 'passed' ||
    report.harness.retries ||
    report.harness.flaky ||
    report.harness.failureCount ||
    report.harness.incomplete ||
    report.harness.unsupported ||
    !report.cases.length ||
    report.cases.some(({ status }) => status !== 'passed')
  )
    reasons.push('Enclosing native run failed, retried, was flaky, or left selected story gaps.');
  const observations = report.cases.map(
    (entry): TestObservation => ({
      kind: 'native',
      name: `${entry.storyId}::${entry.testName}`,
      target: capture.target,
      input: effectiveInput,
      recordedOutcome: entry.status,
      outcome: entry.status === 'passed' && reasons.length ? 'unverified' : entry.status,
      reasons: [...reasons, ...(entry.reason ? [entry.reason] : [])],
      reportSha256: capture.reportSha256,
      buildId: capture.identity?.buildId ?? null,
    }),
  );
  return {
    observations,
    limitations: reasons,
    nativeSelections: [
      {
        target: capture.target,
        input: effectiveInput,
        selection: run.selection === undefined ? null : object(run.selection, 'Native exclusions'),
        outcome: report.harness.unsupported ? 'unsupported' : reasons.length ? 'unverified' : 'passed',
        reasons,
      },
    ],
  };
}

export function realCompiler(root: string, command: readonly string[]): boolean {
  return compilerInvocation(root, command) !== null;
}

function compilerInvocation(root: string, command: readonly string[]): { projects: string[]; workspace: string | null } | null {
  const executable = command[0];
  const compiler = command[1];
  if (
    !executable ||
    !compiler ||
    !existsSync(executable) ||
    !existsSync(compiler) ||
    realpathSync(executable) !== realpathSync(process.execPath)
  )
    return null;
  if (command[2] === 'workspace') {
    if (command.length !== 7 || command[4] !== 'build' || command[5] !== '--force' || command[6] !== '--listFiles') return null;
    const rootManifest = object(JSON.parse(readFileSync(path.join(root, 'package.json'), 'utf8')), 'Compiler root manifest');
    const version = /^yarn@(\d+\.\d+\.\d+)$/.exec(text(rootManifest.packageManager, 'Pinned Yarn release'))?.[1];
    if (!version) return null;
    const yarn = path.join(root, '.yarn', 'releases', `yarn-${version}.cjs`);
    if (!existsSync(yarn) || realpathSync(compiler) !== realpathSync(yarn)) return null;
    const patterns = strings(rootManifest.workspaces, 'Compiler workspaces');
    for (const pattern of patterns)
      if (pattern.includes('\\') || pattern.startsWith('/') || pattern.split('/').includes('..'))
        throw new Error('Compiler workspace patterns must stay inside the repository.');
    const manifests = [
      ...new Set(
        patterns.flatMap((pattern) =>
          globSync(pattern === '.' ? 'package.json' : `${pattern}/package.json`, {
            cwd: root,
            exclude: ['**/node_modules/**', '**/lib/**', '**/dist/**'],
          }),
        ),
      ),
    ];
    const matches = manifests
      .map((file) => {
        const absolute = realpathSync(path.join(root, file));
        const relative = path.relative(root, absolute);
        if (relative.startsWith('..') || path.isAbsolute(relative)) throw new Error('Compiler workspace escaped the repository.');
        return { file: absolute, data: object(JSON.parse(readFileSync(absolute, 'utf8')), 'Compiler workspace manifest') };
      })
      .filter(({ data }) => data.name === command[3]);
    if (matches.length !== 1) return null;
    const workspace = matches[0];
    const scripts = object(workspace.data.scripts, 'Compiler workspace scripts');
    if (scripts.build !== 'tsc -b') return null;
    const packageRoot = path.dirname(workspace.file);
    const installed = [
      path.join(packageRoot, 'node_modules', 'typescript', 'bin', 'tsc'),
      path.join(root, 'node_modules', 'typescript', 'bin', 'tsc'),
    ];
    if (!installed.some((file) => existsSync(file))) return null;
    return { projects: [path.join(packageRoot, 'tsconfig.json')], workspace: text(workspace.data.name, 'Compiler workspace name') };
  }
  const expected = [
    path.join(root, 'node_modules', 'typescript', 'bin', 'tsc'),
    path.join(root, 'scripts', 'node_modules', 'typescript', 'bin', 'tsc'),
  ];
  if (
    !expected.some((file) => existsSync(file) && realpathSync(compiler) === realpathSync(file)) ||
    !command.some((arg) => arg === '-b' || arg === '--build') ||
    !command.includes('--force') ||
    !command.includes('--listFiles') ||
    !command
      .slice(2)
      .every((arg) => !arg.startsWith('-') || ['-b', '--build', '--force', '--listFiles', '--pretty', '--verbose'].includes(arg))
  )
    return null;
  return {
    projects: command.slice(2).filter((arg, index, args) => !arg.startsWith('-') && !(index > 0 && args[index - 1] === '--pretty')),
    workspace: null,
  };
}

function compiledProjectFiles(root: string, command: readonly string[]): { files: Set<string>; reasons: string[] } {
  const invocation = compilerInvocation(root, command);
  if (!invocation) throw new Error('Unsupported forced compiler invocation.');
  const projects = invocation.projects;
  const files = new Set<string>();
  const visited = new Set<string>();
  const api = new API({ cwd: root });
  const tracked = new Set(
    git(root, ['ls-files', '-z'])
      .split('\0')
      .map((file) => path.normalize(path.join(root, file))),
  );
  const reasons: string[] = [];
  function visit(project: string): void {
    let file = path.resolve(root, project);
    if (!file.endsWith('.json')) file = path.join(file, 'tsconfig.json');
    const relative = path.relative(root, file);
    if (relative.startsWith('..') || path.isAbsolute(relative)) throw new Error('Compiler project must stay inside the repository.');
    if (visited.has(file)) return;
    visited.add(file);
    if (!tracked.has(path.normalize(file))) reasons.push(`Compiler project was not a tracked source input: ${relative}.`);
    const config = api.parseConfigFile(file);
    if (config.options.noCheck === true) throw new Error('Compiler projects with noCheck cannot establish type-test execution.');
    for (const name of config.fileNames) files.add(path.normalize(name));
    const scanner = createScanner(true, undefined, readFileSync(file, 'utf8'));
    const tokens: { kind: SyntaxKind; text: string }[] = [];
    for (let kind = scanner.scan(); kind !== SyntaxKind.EndOfFile; kind = scanner.scan()) {
      if (scanner.isUnterminated()) throw new Error('Unterminated compiler configuration token.');
      tokens.push({ kind, text: scanner.getTokenText() });
    }
    const json = tokens
      .filter(
        (token, index) =>
          token.kind !== SyntaxKind.CommaToken ||
          ![SyntaxKind.CloseBraceToken, SyntaxKind.CloseBracketToken].includes(tokens[index + 1]?.kind),
      )
      .map(({ text }) => text)
      .join(' ');
    const raw = object(JSON.parse(json), 'Compiler project references');
    if (raw.references !== undefined && !Array.isArray(raw.references)) throw new Error('Compiler references must be an array.');
    for (const value of Array.isArray(raw.references) ? raw.references : []) {
      const reference = text(object(value, 'Compiler reference').path, 'Compiler reference path');
      visit(path.resolve(path.dirname(file), reference));
    }
  }
  try {
    for (const project of projects.length ? projects : ['tsconfig.json']) visit(project);
  } finally {
    api.close();
  }
  return { files, reasons };
}

export function assessTypeCapture(
  root: string,
  controls: ReadinessControl[],
  capture: ExecutionCapture,
  environment: EvidenceEnvironment,
): ReadinessEvidence {
  if (capture.kind !== 'type') throw new Error('Expected compiler execution capture.');
  if (!realCompiler(root, capture.command))
    throw new Error('Type capture did not execute the repository compiler with -b --force --listFiles.');
  const reasons = captureProblems(capture, environment);
  if (capture.commandSha256 !== reportDigest(JSON.stringify(capture.command)))
    reasons.push('Compiler command does not match its original execution binding.');
  const compiled = new Set((capture.report ?? '').split(/\r?\n/).map((line) => path.normalize(line.trim())));
  const project = compiledProjectFiles(root, capture.command);
  reasons.push(...project.reasons);
  const observations = controls.flatMap((control) =>
    control.typeFiles
      .filter((file) => compiled.has(path.normalize(path.join(root, file))) && project.files.has(path.normalize(path.join(root, file))))
      .map(
        (file): TestObservation => ({
          kind: 'type',
          controlId: control.id,
          name: file,
          recordedOutcome: capture.exitCode === 0 ? 'passed' : 'failed',
          outcome: capture.exitCode === 0 ? (reasons.length ? 'unverified' : 'passed') : 'failed',
          reasons,
          reportSha256: capture.reportSha256,
          buildId: capture.identity?.buildId ?? null,
        }),
      ),
  );
  return {
    observations,
    limitations: [...reasons, ...(!observations.length ? ['Compiler output contains no discovered type-test files.'] : [])],
    nativeSelections: [],
  };
}

export function parseUnitCollection(value: unknown): UnitCollection {
  const data = object(value, 'Collected original unit execution');
  if (data.schemaVersion !== 1 || data.kind !== 'unit') throw new Error('Unsupported collected unit schema.');
  return {
    schemaVersion: 1,
    kind: 'unit',
    capture: text(data.capture, 'Original CI capture bytes'),
    execution: text(data.execution, 'Original execution bytes'),
    collectionStart: text(data.collectionStart, 'Original pre-execution collection bytes'),
    ...(data.executionStart === undefined ? {} : { executionStart: text(data.executionStart, 'Original invocation start bytes') }),
  };
}

export function assessUnitCollection(
  root: string,
  controls: ReadinessControl[],
  collected: UnitCollection,
  environment: EvidenceEnvironment,
): ReadinessEvidence {
  const capture = object(JSON.parse(collected.capture), 'Original CI unit capture');
  const execution = object(JSON.parse(collected.execution), 'Original unit execution');
  const start = object(JSON.parse(collected.collectionStart), 'Original unit collection start');
  if (capture.schemaVersion !== 1 || execution.schemaVersion !== 1 || start.schemaVersion !== 1)
    throw new Error('Unsupported original unit capture schema.');
  const local = start.scope === 'local';
  const localSource = local ? object(start.source, 'Original local source inputs') : null;
  const identity = local ? null : parseIdentity(capture.identity);
  if (
    local &&
    (start.identity !== null ||
      capture.identity !== null ||
      execution.executionIdentity !== null ||
      capture.scope !== 'local' ||
      execution.scope !== 'local' ||
      JSON.stringify(capture.source) !== JSON.stringify(start.source))
  )
    throw new Error('Local unit ORIGINAL source or scope differs from its capture.');
  if (!local && (capture.scope === 'local' || execution.scope === 'local'))
    throw new Error('Local unit capture cannot replace an ORIGINAL CI collection.');
  if (!local && JSON.stringify(identity) !== JSON.stringify(parseIdentity(start.identity)))
    throw new Error('Original unit identity differs from collection start.');
  for (const key of [
    'report',
    'context',
    'exitCode',
    'executionFailure',
    'scope',
    'executionIdentity',
    'executionStartSha256',
    'collectionStartSha256',
  ])
    if (JSON.stringify(capture[key]) !== JSON.stringify(execution[key]))
      throw new Error('Unit collector differs from its ORIGINAL execution sidecar.');
  const reasons: string[] = [];
  if (
    (local || execution.collectionStartSha256 !== undefined) &&
    hex(execution.collectionStartSha256, 64, 'Original collection bytes digest') !== reportDigest(collected.collectionStart)
  )
    throw new Error('Unit ORIGINAL collection start bytes differ from their pre-Jest binding.');
  if (
    collected.executionStart !== undefined &&
    (local || execution.executionStartSha256 !== undefined) &&
    hex(execution.executionStartSha256, 64, 'Original invocation bytes digest') !== reportDigest(collected.executionStart)
  )
    throw new Error('Unit ORIGINAL invocation start bytes differ from their pre-Jest binding.');
  const sourceCommit = local ? hex(localSource?.sourceCommit, 40, 'Local source commit') : identity!.testedCommit;
  const sourceInputs = local ? hex(localSource?.inputDigest, 64, 'Local source input digest') : identity!.inputDigest;
  if (local) hex(localSource?.fingerprint, 64, 'Local source fingerprint');
  if (local && (typeof localSource?.workingTreeDirty !== 'boolean' || typeof localSource.fingerprint !== 'string'))
    throw new Error('Invalid original local source state.');
  if (sourceCommit !== environment.source.commit || sourceInputs !== environment.source.inputDigest)
    reasons.push('Original unit execution belongs to different source inputs.');
  if (local && (localSource?.fingerprint !== environment.source.fingerprint || localSource.workingTreeDirty === true))
    reasons.push('Original local source fingerprint differs or contains dirty inputs.');
  if (local && environment.ci) reasons.push('Local unit execution is not same-attempt CI proof.');
  if (capture.executionFailure !== null) text(capture.executionFailure, 'Original unit execution failure');
  if (capture.report === null && capture.context === null) {
    return {
      observations: [],
      nativeSelections: [],
      limitations: [
        ...reasons,
        `Original unit execution produced no report (collector exit ${integer(capture.exitCode, 'Unit collector exit')}); ${capture.executionFailure ?? 'runtime evidence is missing'}.`,
      ],
    };
  }
  const context = parseUnitContext(capture.context);
  const report = text(capture.report, 'Original Jest bytes');
  const buildId = local
    ? text(start.buildId, 'Local build ID')
    : `${identity!.repository}/actions/runs/${identity!.runId}/attempts/${identity!.runAttempt}`;
  if (local && !/^local-unit\/[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(buildId))
    throw new Error('Invalid original local build ID.');
  if (
    context.sourceCommit !== sourceCommit ||
    context.buildId !== buildId ||
    start.buildId !== buildId ||
    context.reportSha256 !== reportDigest(report)
  )
    reasons.push('Unit report bytes, commit, or original build binding differ.');
  const began = timestamp(start.startedAt, 'Original collection start');
  if (local && (Date.now() - Date.parse(began) > evidenceMaxAgeMs || Date.parse(began) > Date.now()))
    reasons.push('Original local collection receipt is stale or future-dated.');
  if (capture.collectionStartedAt !== began || Date.parse(context.startedAt) < Date.parse(began))
    throw new Error('Unit report predates its original collection.');
  if (context.workingTreeDirty || environment.source.dirty) reasons.push('Dirty unit source inputs do not qualify.');
  const age = Math.max(environment.now.getTime(), Date.now()) - Date.parse(context.finishedAt);
  if (age < 0 || age > evidenceMaxAgeMs) reasons.push('Unit execution is stale or future-dated.');
  if (context.exitCode !== 0 || integer(capture.exitCode, 'Unit collector exit') !== 0 || capture.executionFailure !== null)
    reasons.push('Enclosing unit execution failed.');
  const expected = environment.identity;
  if (
    environment.ci &&
    !local &&
    (!expected ||
      expected.repository !== identity!.repository ||
      expected.runId !== identity!.runId ||
      expected.runAttempt !== identity!.runAttempt)
  )
    reasons.push('Unit evidence belongs to a different workflow run or attempt.');
  if (!local && (capture.executionIdentity !== undefined || execution.executionIdentity !== undefined)) {
    if (JSON.stringify(capture.executionIdentity) !== JSON.stringify(execution.executionIdentity))
      throw new Error('Unit ORIGINAL execution identity differs from its collector.');
    const originalIdentity = parseExecutionIdentity(execution.executionIdentity);
    const binding = originalIdentity === null ? null : object(execution.executionIdentity, 'Original unit source binding');
    if (
      !originalIdentity ||
      originalIdentity.repository !== identity!.repository ||
      originalIdentity.runId !== identity!.runId ||
      originalIdentity.runAttempt !== identity!.runAttempt ||
      originalIdentity.buildId !== buildId ||
      binding?.sourceCommit !== context.sourceCommit ||
      binding?.inputDigest !== sourceInputs ||
      (environment.ci && originalIdentity.workflow !== expected?.workflow) ||
      (environment.ci && environment.sourceJobs.get(originalIdentity.job) !== 'success')
    )
      reasons.push('Original unit source job, workflow, run, attempt, or successful conclusion does not match.');
  } else if (!local && environment.ci) {
    reasons.push('Legacy unit sidecars lack source-job/workflow attestation; CI job success cannot be authenticated.');
  }
  if (collected.executionStart !== undefined) {
    const began = object(JSON.parse(collected.executionStart), 'Original invocation start');
    if (execution.collectionStartSha256 !== undefined && began.collectionStartSha256 !== execution.collectionStartSha256)
      throw new Error('Unit ORIGINAL invocation refers to different collection bytes.');
    const initial = object(began.initial, 'Original pre-execution source state');
    hex(initial.fingerprint, 64, 'Original pre-execution source fingerprint');
    if (typeof initial.workingTreeDirty !== 'boolean') throw new Error('Original pre-execution dirty state must be boolean.');
    if (
      local &&
      (began.scope !== 'local' ||
        initial.inputDigest !== sourceInputs ||
        initial.fingerprint !== localSource?.fingerprint ||
        initial.workingTreeDirty !== localSource?.workingTreeDirty)
    )
      throw new Error('Local ORIGINAL invocation source binding differs from collection start.');
    if (
      began.schemaVersion !== 1 ||
      JSON.stringify(began.executionIdentity) !== JSON.stringify(execution.executionIdentity) ||
      began.startedAt !== context.startedAt ||
      began.buildId !== context.buildId ||
      initial.sourceCommit !== context.sourceCommit ||
      (initial.workingTreeDirty && !context.workingTreeDirty) ||
      began.contractDigest !== context.contractDigest ||
      began.mappingDigest !== context.mappingDigest
    )
      throw new Error('Unit ORIGINAL pre-execution receipt differs from its completed execution.');
  } else if (environment.ci || local) {
    reasons.push('Original pre-execution unit receipt is missing.');
  }
  const read = (file: string): string => {
    const content = gitFile(root, context.sourceCommit, file);
    if (content === undefined) throw new Error(`Original unit source input is absent: ${file}.`);
    return content;
  };
  const definitions = discoverAssessments(root);
  const matching =
    context.sourceCommit !== environment.source.commit || sourceCommit !== environment.source.commit
      ? []
      : definitions.filter((definition) => {
          const mapping = readUnitMappingFrom(read, definition);
          const contract = readControlContractFrom(read, definition);
          return (
            definition.unit.platform === context.platform &&
            mapping.digest === context.mappingDigest &&
            mapping.current &&
            contract.digest === context.contractDigest &&
            contract.mappingCurrent
          );
        });
  if (!matching.length) reasons.push('Original reviewed unit source-input/mocking fingerprint is not current.');
  const observations: TestObservation[] = [];
  const limitations = [...reasons];
  const raw = object(JSON.parse(report), 'Original Jest report');
  if (!Array.isArray(raw.testResults)) throw new Error('Original Jest report has no suite inventory.');
  const suiteNames = raw.testResults.map((suite) => text(object(suite, 'Jest suite').name, 'Suite path').replaceAll('\\', '/'));
  for (const control of controls) {
    const files = control.unitFiles.filter((file) => suiteNames.some((suite) => suite === file || suite.endsWith(`/${file}`)));
    if (!files.length) continue;
    const parsed = parseJestFiles(report, files);
    const ambiguousNames = new Set(parsed.ambiguousNames);
    if (ambiguousNames.size)
      limitations.push(
        `Ambiguous Jest assertion identities for ${control.id} cannot qualify evidence: ${parsed.ambiguousNames.join('; ')}.`,
      );
    const controlReasons = [...reasons];
    if (parsed.failed || parsed.packageRetryCounts.retries || !parsed.counts.passed || parsed.counts.skipped)
      controlReasons.push('Whole-package Jest failed, retried, or selected no passing runtime assertions.');
    if (parsed.startTime < Date.parse(context.startedAt) || parsed.endTime > Date.parse(context.finishedAt))
      controlReasons.push('Jest interval differs from ORIGINAL execution.');
    for (const entry of parsed.entries) {
      const entryReasons = [
        ...controlReasons,
        ...(ambiguousNames.has(entry.fullName) ? [`Jest assertion identity is ambiguous: ${entry.fullName}.`] : []),
        ...(entry.reason ? [entry.reason] : []),
      ];
      observations.push({
        scope: local ? 'local' : 'ci',
        kind: 'unit',
        controlId: control.id,
        name: entry.fullName,
        recordedOutcome: entry.status,
        outcome: entry.status === 'passed' && (controlReasons.length || ambiguousNames.has(entry.fullName)) ? 'unverified' : entry.status,
        reasons: entryReasons,
        reportSha256: context.reportSha256,
        buildId,
      });
    }
  }
  return {
    observations,
    limitations: [
      ...limitations,
      ...(local ? ['Local unit receipt has no GitHub job or same-attempt CI attestation.'] : []),
      'Jest executes a mocked React Native environment; it never qualifies native, keyboard, or screen-reader behavior.',
    ],
    nativeSelections: [],
  };
}
