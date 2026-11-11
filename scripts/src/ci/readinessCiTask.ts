import { spawn, spawnSync } from 'node:child_process';
import { constants } from 'node:os';
import { existsSync, lstatSync, mkdirSync, readFileSync, readdirSync, realpathSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

import { git } from './assessment/controlAssessmentCi.ts';
import { object, parseNativeReport, readNativeEvidence, reportDigest, text } from './assessment/controlAssessment.ts';
import {
  assessNativeCapture,
  assessTypeCapture,
  assessUnitCollection,
  executionIdentity,
  member,
  parseExecutionCapture,
  parseUnitCollection,
  readArtifact,
  realCompiler,
  sourceState,
} from './assessment/readinessEvidence.ts';
import type { EvidenceEnvironment, ExecutionCapture, ReadinessEvidence, UnitCollection } from './assessment/readinessEvidence.ts';
import { discoverReadinessControls, readinessTargets } from './assessment/readinessModel.ts';
import {
  assessReadinessControl,
  authenticateOwnerRecord,
  parsePreviousReadinessReport,
  parseReadinessPolicy,
} from './assessment/readinessPolicy.ts';
import type { ReadinessControlReport } from './assessment/readinessPolicy.ts';

const policyFile = 'packages/agentic/components/references/assessments/readiness-policy.json';

function inside(root: string, directory: string): string {
  const absolute = path.resolve(root, directory);
  const relative = path.relative(root, absolute);
  if (!relative || relative === '..' || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative))
    throw new Error('Readiness paths must stay inside the repository.');
  let current = root;
  for (const segment of relative.split(path.sep)) {
    current = path.join(current, segment);
    if (existsSync(current) && lstatSync(current).isSymbolicLink()) throw new Error('Readiness paths must not traverse symlinks.');
  }
  return absolute;
}

export function guardReadinessOutput(root: string, directory: string, ci = false): string {
  root = realpathSync(root);
  const absolute = inside(root, directory);
  const relative = path.relative(root, absolute);
  const parts = relative.split(path.sep);
  if (
    !parts.some((part) => part === 'reports' || part === 'artifacts') ||
    parts.some((part) => ['src', '.github', 'references', 'node_modules', '.git'].includes(part))
  )
    throw new Error('Readiness output must be an artifact/report directory, never source or tracked documentation.');
  if (git(root, ['ls-files', '--', relative])) throw new Error('Readiness output contains tracked files.');
  for (const file of ['readiness.json', 'readiness.md', 'execution.json', 'execution-start.json', 'unit-collection.json']) {
    const target = inside(root, path.join(absolute, file));
    if (existsSync(target) && (!lstatSync(target).isFile() || lstatSync(target).isSymbolicLink() || lstatSync(target).nlink !== 1))
      throw new Error('Readiness output file must be a regular, non-symlink artifact.');
    const ignored = spawnSync('git', ['check-ignore', '--quiet', '--no-index', '--', path.relative(root, target)], { cwd: root });
    if (ignored.error) throw ignored.error;
    if (ignored.status !== 0 && ignored.status !== 1) throw new Error('Unable to verify output ignore policy.');
    if (ci && ignored.status !== 0) throw new Error('CI readiness output must be ignored artifacts.');
  }
  mkdirSync(absolute, { recursive: true });
  if (realpathSync(absolute) !== absolute && path.relative(root, realpathSync(absolute)).startsWith('..'))
    throw new Error('Readiness output escaped after directory creation.');
  return absolute;
}

function writeArtifact(directory: string, name: string, value: string): void {
  const file = path.join(directory, name);
  if (existsSync(file) && (lstatSync(file).isSymbolicLink() || !lstatSync(file).isFile() || lstatSync(file).nlink !== 1))
    throw new Error('Refusing to overwrite a nonregular readiness artifact.');
  writeFileSync(file, value, { encoding: 'utf8' });
}

function walk(directory: string, filename: string): string[] {
  if (!existsSync(directory)) return [];
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if (entry.isSymbolicLink()) throw new Error('Evidence directories must not contain symlink entries.');
    const file = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(file, filename) : entry.isFile() && entry.name === filename ? [file] : [];
  });
}

async function observeSourceJobs(environment: EvidenceEnvironment): Promise<Map<string, 'success' | 'failure' | 'incomplete'>> {
  const outcomes = new Map<string, 'success' | 'failure' | 'incomplete'>();
  const identity = environment.identity;
  if (environment.ci && process.env.READINESS_JOB_OUTCOMES !== undefined) {
    const needs = object(JSON.parse(process.env.READINESS_JOB_OUTCOMES), 'Current-attempt workflow needs');
    for (const [job, value] of Object.entries(needs)) {
      const source = object(value, 'Workflow source-job outcome');
      const result = member(source.result, ['success', 'failure', 'cancelled', 'skipped'], 'Source-job result');
      outcomes.set(job, result === 'success' ? 'success' : 'failure');
    }
    return outcomes;
  }
  if (!environment.ci || !identity || !process.env.GITHUB_TOKEN) return outcomes;
  for (let page = 1; page <= 10; page++) {
    const response = await fetch(
      `https://api.github.com/repos/${identity.repository}/actions/runs/${identity.runId}/attempts/${identity.runAttempt}/jobs?per_page=100&page=${page}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
          Accept: 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
        },
        signal: AbortSignal.timeout(30_000),
        redirect: 'error',
      },
    );
    if (!response.ok) throw new Error(`Unable to attest source-job conclusions from GitHub: HTTP ${response.status}.`);
    const result = object(await response.json(), 'GitHub attempt jobs');
    if (!Array.isArray(result.jobs)) throw new Error('GitHub attempt jobs response is invalid.');
    for (const value of result.jobs) {
      const job = object(value, 'GitHub source job');
      if (String(job.run_id) !== identity.runId || job.run_attempt !== identity.runAttempt || job.head_sha !== environment.source.commit)
        throw new Error('Source-job API returned a different workflow run, attempt, or commit.');
      const name = text(job.name, 'Source job display name');
      const outcome = job.status !== 'completed' ? 'incomplete' : job.conclusion === 'success' ? 'success' : 'failure';
      if (outcomes.has(name)) throw new Error('Ambiguous source-job display names; cannot attest evidence.');
      outcomes.set(name, outcome);
    }
    if (result.jobs.length < 100) return outcomes;
  }
  throw new Error('Source-job inventory exceeds the bounded readiness lookup.');
}

function markdownCell(value: string): string {
  return value.replaceAll('|', '\\|').replaceAll('\r', ' ').replaceAll('\n', ' ').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
}

export function formatReadinessMarkdown(controls: ReadinessControlReport[]): string {
  const lines = [
    '# Component readiness evidence',
    '',
    '**PROVISIONAL #4251 — advisory only. Report generation success is not readiness or owner approval.**',
    '',
    '| Control | Kind | Declared | Evidence ceiling | Approved | Mapping |',
    '| --- | --- | --- | --- | --- | --- |',
    ...controls.map(
      (control) =>
        `| ${markdownCell(control.id)} | ${control.kind} | ${control.declaredStatus ?? 'absent'} | ${control.evidenceSupportedStatus ?? 'none'} | ${control.approvedStatus ?? 'absent'} | ${control.mappingState} |`,
    ),
  ];
  for (const control of controls) {
    lines.push(
      '',
      `## ${markdownCell(control.component)} (${control.kind})`,
      '',
      '| Target | Accessible lane | Physical lane | Mixed/all cohort |',
      '| --- | --- | --- | --- |',
    );
    for (const target of control.targets)
      lines.push(
        `| ${target.target} | ${target.lanes[0].outcome} / coverage ${target.lanes[0].requirementCoverage} | ${target.lanes[1].outcome} / coverage ${target.lanes[1].requirementCoverage} | ${target.lanes[2].outcome} / coverage ${target.lanes[2].requirementCoverage} |`,
      );
    lines.push('', '| Dimension | Experimental | Preview | Beta | Stable |', '| --- | --- | --- | --- | --- |');
    for (const dimension of control.dimensions)
      lines.push(
        `| ${dimension.dimension} | ${dimension.gates.experimental} | ${dimension.gates.preview} | ${dimension.gates.beta} | ${dimension.gates.stable} |`,
      );
    lines.push(
      '',
      '### Cumulative acceptance coverage',
      '',
      '| Level | Complete | Unresolved checks |',
      '| --- | --- | --- |',
      ...control.stageCoverage
        .filter(({ level }) => level !== 'experimental')
        .map(({ level, complete, unresolved }) => `| ${level} | ${complete} | ${unresolved.length} |`),
      '',
      `Native contract qualification: ${control.nativeQualification}. Not-applicable is not a native pass.`,
      '',
      ...control.qualifications.map(
        ({ kind, requiredTargets, outcome }) =>
          `${kind}: ${outcome}; required targets: ${requiredTargets.join(', ') || 'none owned by this contract'}.`,
      ),
      '',
      '### Requirement/check outcomes',
      '',
      '| Requirement | Acceptance check | Required from | Outcome | Target scope |',
      '| --- | --- | --- | --- | --- |',
    );
    for (const requirement of control.requirements) {
      if (!requirement.checks.length) lines.push(`| ${requirement.id} | missing mapping | unknown | missing | unknown |`);
      for (const check of requirement.checks)
        lines.push(
          `| ${requirement.id} | ${markdownCell(check.id)} | ${check.requiredFrom} | ${check.outcome} | ${markdownCell(
            check.targetResults
              .map(({ target, outcome, reason, source }) => `${target}: ${outcome}${reason ? ` (${reason}; ${source})` : ''}`)
              .join('; ') || 'platform-neutral',
          )} |`,
        );
    }
    lines.push(
      '',
      '### Blockers',
      '',
      ...control.blockers.map((blocker) => `- ${markdownCell(blocker)}`),
      '',
      '### Limitations',
      '',
      ...[...new Set(control.limitations)].map((limitation) => `- ${markdownCell(limitation)}`),
    );
  }
  return `${lines.join('\n')}\n`;
}

export async function runReadinessAssessment(
  root: string,
  options: {
    packageRoot?: string;
    component?: string;
    evidenceDirectories?: string[];
    outputDirectory: string;
    now?: Date;
    ci?: boolean;
  },
): Promise<{ report: object; markdown: string; exitCode: number }> {
  root = realpathSync(root);
  const ci = options.ci === true || process.env.GITHUB_ACTIONS === 'true';
  const output = guardReadinessOutput(root, options.outputDirectory, ci);
  const policy = parseReadinessPolicy(JSON.parse(readFileSync(path.join(root, ...policyFile.split('/')), 'utf8')));
  const packageRoot = options.packageRoot === undefined ? undefined : inside(root, options.packageRoot);
  const discovered = discoverReadinessControls(root, packageRoot);
  const controls =
    options.component === undefined
      ? discovered
      : discovered.filter((control) => control.component === options.component || control.id === options.component);
  if (!controls.length) throw new Error('No matching readiness controls were discovered.');
  const now = options.now ?? new Date();
  if (!Number.isFinite(now.getTime())) throw new Error('Invalid readiness generation date.');
  const environment: EvidenceEnvironment = { source: sourceState(root), identity: executionIdentity(), now, ci, sourceJobs: new Map() };
  if (ci && (!environment.identity || process.env.GITHUB_SHA !== environment.source.commit))
    throw new Error('CI readiness requires the actual current workflow identity and tested checkout.');
  environment.sourceJobs = await observeSourceJobs(environment);
  const evidence: ReadinessEvidence = { observations: [], limitations: [], nativeSelections: [] };
  if (ci && !environment.sourceJobs.size)
    evidence.limitations.push(
      'CI source-job success is unverified: report needs actions:read and GITHUB_TOKEN; absent attestation never qualifies.',
    );
  const defaultEvidence = path.join(root, 'apps', 'storybook', 'artifacts', 'readiness', 'evidence');
  const directories = [
    ...new Set(
      (options.evidenceDirectories ?? (existsSync(defaultEvidence) ? [defaultEvidence] : [])).map((directory) =>
        realpathSync(inside(root, directory)),
      ),
    ),
  ];
  const records = new Map<string, ReturnType<typeof authenticateOwnerRecord>[]>();
  for (const directory of directories) {
    for (const file of walk(directory, 'execution.json')) {
      const data = object(JSON.parse(readArtifact(path.dirname(file), path.basename(file))), 'Readiness capture input');
      // Legacy originals are only consumed through collect-unit; they must never acquire freshly invented bindings.
      if (data.kind === undefined) {
        if (data.schemaVersion !== 1 || !['report', 'context', 'exitCode', 'executionFailure'].every((key) => key in data))
          throw new Error('Unrecognized execution.json evidence input.');
        evidence.limitations.push(
          'Uncollected legacy unit execution retained; collect-unit with original sidecars is required before it can qualify.',
        );
        continue;
      }
      const capture = parseExecutionCapture(data);
      const assessed =
        capture.kind === 'native' ? assessNativeCapture(capture, environment) : assessTypeCapture(root, controls, capture, environment);
      evidence.observations.push(...assessed.observations);
      evidence.limitations.push(...assessed.limitations);
      evidence.nativeSelections.push(...assessed.nativeSelections);
    }
    for (const file of walk(directory, 'unit-collection.json')) {
      const collected = parseUnitCollection(JSON.parse(readArtifact(path.dirname(file), path.basename(file))));
      const assessed = assessUnitCollection(root, controls, collected, environment);
      evidence.observations.push(...assessed.observations);
      evidence.limitations.push(...assessed.limitations);
    }
    for (const file of walk(directory, 'owner-record.json')) {
      const value = JSON.parse(readArtifact(path.dirname(file), path.basename(file)));
      const payload = object(object(value, 'Signed owner envelope').payload, 'Owner record payload');
      const control = controls.find(({ id }) => id === payload.controlId);
      if (!control) throw new Error('Owner record refers to a control outside the selected assessment.');
      const record = authenticateOwnerRecord(value, path.dirname(file), policy, control, environment);
      records.set(control.id, [...(records.get(control.id) ?? []), record]);
    }
  }
  const previousFile = path.join(output, 'readiness.json');
  const previous = existsSync(previousFile) ? parsePreviousReadinessReport(JSON.parse(readArtifact(output, 'readiness.json'))) : [];
  const reports = controls.map((control) =>
    assessReadinessControl({
      root,
      control,
      policy,
      environment,
      evidence,
      records: records.get(control.id) ?? [],
      previous: previous.find(({ controlId }) => controlId === control.id),
    }),
  );
  const report = {
    schemaVersion: 1,
    generatedAt: now.toISOString(),
    advisory: true,
    policy,
    source: environment.source,
    identity: environment.identity,
    controls: reports,
    limitations: ['Report mode consumes evidence only and never executes tests or writes component contracts or lifecycle metadata.'],
  };
  const markdown = formatReadinessMarkdown(reports);
  writeArtifact(output, 'readiness.json', `${JSON.stringify(report, null, 2)}\n`);
  writeArtifact(output, 'readiness.md', markdown);
  return { report, markdown, exitCode: 0 };
}

function runInventory(directory: string): string[] {
  if (!existsSync(directory)) return [];
  return readdirSync(directory, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !entry.isSymbolicLink())
    .map(({ name }) => name)
    .sort();
}

type ReadinessCaptureOptions = {
  kind: 'native' | 'type';
  target: (typeof readinessTargets)[number];
  input: 'accessible' | 'physical' | 'all';
  output: string;
  reportRoot?: string;
  command: string[];
  cwd?: string;
  advisory?: boolean;
};

function prepareReadinessCapture(root: string, options: ReadinessCaptureOptions) {
  root = realpathSync(root);
  const cwd = realpathSync(options.cwd ?? process.cwd());
  if (cwd !== root) inside(root, cwd);
  const output = guardReadinessOutput(root, options.output, process.env.GITHUB_ACTIONS === 'true');
  if (!options.command.length) throw new Error('Capture requires an existing explicit child invocation.');
  const command = [...options.command];
  if (options.kind === 'type') {
    if (command[0] === 'node' || command[0] === 'node.exe') command[0] = process.execPath;
    if (command[1]) command[1] = path.resolve(cwd, command[1]);
    if (command[2] !== 'workspace')
      for (let index = 2; index < command.length; index++)
        if (!command[index].startsWith('-') && command[index - 1] !== '--pretty') command[index] = path.resolve(cwd, command[index]);
    if (!command.includes('--listFiles')) command.push('--listFiles');
    if (!realCompiler(root, command))
      throw new Error(
        'Type capture requires the pinned Yarn workspace build --force (declared tsc -b), or the actual repository compiler -b --force.',
      );
  }
  const reportRoot = inside(root, options.reportRoot ?? path.join('apps', 'storybook', 'artifacts', 'desktop'));
  const existingRunIds = runInventory(reportRoot);
  const before = sourceState(root);
  const identity = executionIdentity();
  const startedAt = new Date().toISOString();
  const commandSha256 = reportDigest(JSON.stringify(command));
  writeArtifact(
    output,
    'execution-start.json',
    `${JSON.stringify({ schemaVersion: 1, before, identity, startedAt, existingRunIds, command, commandSha256, target: options.target, input: options.input }, null, 2)}\n`,
  );
  return { root, cwd, output, command, reportRoot, before, identity, startedAt, existingRunIds, commandSha256 };
}

export async function runReadinessCapture(root: string, options: ReadinessCaptureOptions): Promise<number> {
  const unavailable = (error: unknown) => {
    if (!options.advisory) throw error;
    console.warn(
      `Readiness capture unavailable: ${error instanceof Error ? error.message : String(error)}. The original command result remains authoritative; missing evidence cannot qualify.`,
    );
  };
  let capture: ReturnType<typeof prepareReadinessCapture> | undefined;
  try {
    capture = prepareReadinessCapture(root, options);
  } catch (error) {
    unavailable(error);
  }
  const command = capture?.command ?? options.command;
  const cwd = capture?.cwd ?? options.cwd ?? process.cwd();
  const outputChunks: Buffer[] = [];
  let outputBytes = 0;
  let outputOverflow = false;
  const status = await new Promise<{ code: number | null; signal: NodeJS.Signals | null }>((resolve, reject) => {
    const child = spawn(command[0], command.slice(1), { cwd, env: process.env, shell: false, stdio: ['inherit', 'pipe', 'pipe'] });
    const record = (data: Buffer) => {
      outputBytes += data.length;
      if (outputBytes <= 8_000_000) outputChunks.push(data);
      else outputOverflow = true;
    };
    child.stdout.on('data', (data: Buffer) => {
      record(data);
      process.stdout.write(data);
    });
    child.stderr.on('data', (data: Buffer) => {
      record(data);
      process.stderr.write(data);
    });
    child.on('error', reject);
    child.on('close', (code, signal) => resolve({ code, signal }));
  });
  try {
    if (capture) finishReadinessCapture(capture, options, status.code, outputChunks, outputBytes, outputOverflow);
  } catch (error) {
    unavailable(error);
  }
  return status.code ?? (status.signal ? 128 + (constants.signals[status.signal] ?? 0) : 1);
}

function finishReadinessCapture(
  prepared: ReturnType<typeof prepareReadinessCapture>,
  options: ReadinessCaptureOptions,
  exitCode: number | null,
  outputChunks: Buffer[],
  outputBytes: number,
  outputOverflow: boolean,
): void {
  const { root, output, command, reportRoot, before, identity, startedAt, existingRunIds, commandSha256 } = prepared;
  const finishedAt = new Date().toISOString();
  const after = sourceState(root);
  let report: string | null = null;
  let selectedRunId: string | null = null;
  let collectionFailure: string | null = null;
  if (options.kind === 'type') {
    if (!outputOverflow && outputBytes > 0) report = Buffer.concat(outputChunks).toString('utf8');
  } else {
    const fresh = runInventory(reportRoot).filter((id) => !existingRunIds.includes(id));
    if (fresh.length === 1) {
      selectedRunId = fresh[0];
      const runFile = path.join(reportRoot, selectedRunId, 'run.json');
      if (existsSync(runFile)) {
        try {
          readArtifact(path.dirname(runFile), 'run.json');
          report = readNativeEvidence(runFile);
          const parsed = parseNativeReport(JSON.parse(report));
          const companion = readArtifact(path.dirname(runFile), `evidence/${parsed.endpoint}/static/run.json`);
          const envelope = object(JSON.parse(report), 'Native exact-byte envelope');
          if (envelope.storyReport !== companion) throw new Error('Native companion bytes were not preserved exactly.');
        } catch (error) {
          report = null;
          collectionFailure = `Native artifact collection failed: ${error instanceof Error ? error.message : String(error)}`;
          process.stderr.write(`${collectionFailure}\n`);
        }
      }
    }
    if (fresh.length !== 1) process.stderr.write(`Native capture found ${fresh.length} new runs; evidence cannot qualify.\n`);
  }
  const capture: ExecutionCapture = {
    schemaVersion: 1,
    kind: options.kind,
    target: options.target,
    input: options.input,
    before,
    after,
    identity,
    startedAt,
    finishedAt,
    exitCode,
    command,
    commandSha256,
    report,
    reportSha256: report === null ? null : reportDigest(report),
    existingRunIds,
    selectedRunId,
    collectionFailure,
  };
  writeArtifact(output, 'execution.json', `${JSON.stringify(capture, null, 2)}\n`);
}

export function collectReadinessUnits(root: string, input: string, destination: string): number {
  root = realpathSync(root);
  const directory = realpathSync(inside(root, input));
  const output = guardReadinessOutput(root, destination, process.env.GITHUB_ACTIONS === 'true');
  const starts = walk(directory, 'unit-collection-start.json');
  if (starts.length !== 1) throw new Error('Unit collection needs exactly one ORIGINAL pre-execution collection sidecar.');
  const collectionStart = readArtifact(path.dirname(starts[0]), path.basename(starts[0]));
  const originals = walk(directory, 'execution.json');
  const captures = walk(directory, 'unit-execution.json');
  if (!captures.length) throw new Error('No original unit capture exists; unit collection never executes Jest.');
  for (const [index, file] of captures.entries()) {
    const capture = readArtifact(path.dirname(file), path.basename(file));
    const value = object(JSON.parse(capture), 'Original collected unit capture');
    const matches = originals.filter((original) => {
      const execution = object(JSON.parse(readArtifact(path.dirname(original), path.basename(original))), 'Original execution sidecar');
      return [
        'report',
        'context',
        'exitCode',
        'executionFailure',
        'executionIdentity',
        'scope',
        'executionStartSha256',
        'collectionStartSha256',
      ].every((key) => JSON.stringify(execution[key]) === JSON.stringify(value[key]));
    });
    if (matches.length !== 1) throw new Error('Unit capture must retain exactly one matching ORIGINAL execution sidecar.');
    const execution = readArtifact(path.dirname(matches[0]), path.basename(matches[0]));
    const startFile = path.join(path.dirname(matches[0]), 'execution-start.json');
    const result: UnitCollection = {
      schemaVersion: 1,
      kind: 'unit',
      capture,
      execution,
      collectionStart,
      ...(existsSync(startFile) ? { executionStart: readArtifact(path.dirname(startFile), path.basename(startFile)) } : {}),
    };
    parseUnitCollection(result);
    if (object(JSON.parse(collectionStart), 'Original collection scope').scope === 'local')
      assessUnitCollection(root, [], result, {
        source: sourceState(root),
        identity: null,
        now: new Date(),
        ci: false,
        sourceJobs: new Map(),
      });
    const target = guardReadinessOutput(root, path.join(output, `unit-${index}`), process.env.GITHUB_ACTIONS === 'true');
    writeArtifact(target, 'unit-collection.json', `${JSON.stringify(result, null, 2)}\n`);
  }
  return 0;
}

export async function readinessMain(args: string[]): Promise<number> {
  const cwd = process.cwd();
  const root = git(process.cwd(), ['rev-parse', '--show-toplevel']);
  const mode = member(args[0], ['run', 'report', 'collect-unit'], 'Readiness command');
  const values = new Map<string, string[]>();
  const separator = args.indexOf('--');
  const options = args.slice(1, separator === -1 ? undefined : separator);
  const allowed =
    mode === 'run'
      ? ['--kind', '--target', '--input', '--output', '--report-root']
      : mode === 'report'
        ? ['--output', '--evidence', '--package']
        : ['--input', '--output'];
  for (let index = 0; index < options.length; index += 2) {
    const key = member(options[index], allowed, 'Readiness option');
    const value = text(options[index + 1], key);
    if (value.startsWith('--')) throw new Error(`Missing value for ${key}.`);
    if (values.has(key) && key !== '--evidence') throw new Error(`Duplicate option ${key}.`);
    values.set(key, [...(values.get(key) ?? []), value]);
  }
  const output = path.resolve(cwd, text(values.get('--output')?.[0], '--output'));
  if (mode === 'run') {
    if (separator === -1) throw new Error('Capture requires -- followed by the real executable and arguments.');
    return runReadinessCapture(root, {
      kind: member(values.get('--kind')?.[0], ['native', 'type'], 'Capture kind'),
      target: member(values.get('--target')?.[0], readinessTargets, 'Target'),
      input: member(values.get('--input')?.[0], ['accessible', 'physical', 'all'], 'Input lane'),
      output,
      reportRoot: values.has('--report-root') ? path.resolve(cwd, values.get('--report-root')![0]) : undefined,
      command: args.slice(separator + 1),
      cwd,
      advisory: process.env.FURN_ASSESSMENT_ADVISORY === 'true',
    });
  }
  if (separator !== -1) throw new Error('Only capture mode accepts a child invocation.');
  if (mode === 'collect-unit') return collectReadinessUnits(root, path.resolve(cwd, text(values.get('--input')?.[0], '--input')), output);
  return (
    await runReadinessAssessment(root, {
      outputDirectory: output,
      packageRoot: values.has('--package') ? path.resolve(cwd, values.get('--package')![0]) : undefined,
      evidenceDirectories: values.get('--evidence')?.map((directory) => path.resolve(cwd, directory)),
    })
  ).exitCode;
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  readinessMain(process.argv.slice(2)).then(
    (code) => {
      process.exitCode = code;
    },
    (error: Error) => {
      process.stderr.write(`Readiness assessment failed: ${error.message}\n`);
      process.exitCode = 1;
    },
  );
}
