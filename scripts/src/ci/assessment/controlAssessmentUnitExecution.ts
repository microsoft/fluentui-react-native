import { execFileSync, spawnSync } from 'node:child_process';
import { createHash, randomUUID } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, realpathSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import { PLATFORM_ENV_VAR } from '../../const.mts';
import { hex, object, readControlContract, reportDigest, text, timestamp } from './controlAssessment.ts';
import { git, inputDigest, parseIdentity } from './controlAssessmentCi.ts';
import { parseUnitContext, readUnitMappingFrom } from './controlAssessmentUnit.ts';
import type { UnitContext } from './controlAssessmentUnit.ts';
import { readPackageAssessments, selectAssessment, unitCaptureDirectory } from './assessmentConfig.ts';
import type { AssessmentDefinition } from './assessmentConfig.ts';

export type UnitExecution = {
  schemaVersion: 1;
  report: string | null;
  context: UnitContext | null;
  executionFailure: string | null;
  exitCode: number;
  executionIdentity?: UnitExecutionIdentity | null;
  scope?: 'local' | 'ci';
  executionStartSha256?: string;
  collectionStartSha256?: string;
};

export type UnitExecutionIdentity = {
  repository: string;
  workflow: string;
  runId: string;
  runAttempt: number;
  job: string;
  buildId: string;
  sourceCommit: string;
  inputDigest: string;
};

function originalExecutionIdentity(root: string, start: Record<string, unknown>, env: NodeJS.ProcessEnv): UnitExecutionIdentity | null {
  if (env.GITHUB_ACTIONS !== 'true') return null;
  const identity = parseIdentity(start.identity);
  const commit = hex(env.GITHUB_SHA, 40, 'Unit GITHUB_SHA');
  const runAttempt = Number(env.GITHUB_RUN_ATTEMPT);
  const buildId = `${identity.repository}/actions/runs/${identity.runId}/attempts/${identity.runAttempt}`;
  if (
    identity.repository !== env.GITHUB_REPOSITORY ||
    identity.runId !== env.GITHUB_RUN_ID ||
    identity.runAttempt !== runAttempt ||
    identity.testedCommit !== commit ||
    sourceState(root).sourceCommit !== commit ||
    inputDigest(root, commit) !== identity.inputDigest ||
    start.buildId !== buildId
  )
    throw new Error('Unit pre-execution repository, run, attempt, build, commit or global input binding differs from CI.');
  return {
    repository: identity.repository,
    workflow: text(env.GITHUB_WORKFLOW_REF, 'Unit GITHUB_WORKFLOW_REF'),
    runId: identity.runId,
    runAttempt: identity.runAttempt,
    job: text(env.GITHUB_JOB, 'Unit GITHUB_JOB'),
    buildId,
    sourceCommit: commit,
    inputDigest: identity.inputDigest,
  };
}

function sourceState(root: string) {
  const sourceCommit = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim();
  const status = git(root, ['status', '--porcelain', '--untracked-files=all']);
  const diff = execFileSync('git', ['diff', '--binary', 'HEAD'], { cwd: root, maxBuffer: 32_000_000 });
  return {
    sourceCommit,
    workingTreeDirty: status.length > 0,
    fingerprint: createHash('sha256').update(status).update('\0').update(diff).digest('hex'),
  };
}

function beginUnitExecution(
  root: string,
  directory: string,
  definition: AssessmentDefinition,
  expectedBuildId?: string,
  executionIdentity: UnitExecutionIdentity | null = null,
  provenance?: { scope: 'local' | 'ci'; inputDigest?: string; collectionStartSha256: string },
) {
  const initial = { ...sourceState(root), ...(provenance?.inputDigest ? { inputDigest: provenance.inputDigest } : {}) };
  const read = (file: string) => readFileSync(path.join(root, file), 'utf8');
  const mapping = readUnitMappingFrom(read, definition);
  const contract = readControlContract(root, definition);
  const runId = randomUUID();
  const runDirectory = path.join(directory, `unit-${runId}`);
  mkdirSync(directory, { recursive: true });
  mkdirSync(runDirectory);
  const reportPath = path.join(runDirectory, 'jest.json');
  const startedAt = new Date().toISOString();
  const buildId = expectedBuildId ?? `local-unit/${definition.component}/${runId}`;
  const executionStart = `${JSON.stringify(
    {
      schemaVersion: 1,
      initial,
      executionIdentity,
      startedAt,
      buildId,
      contractDigest: contract.digest,
      mappingDigest: mapping.digest,
      ...(provenance ? { scope: provenance.scope } : {}),
      ...(provenance ? { collectionStartSha256: provenance.collectionStartSha256 } : {}),
    },
    null,
    2,
  )}\n`;
  writeFileSync(path.join(runDirectory, 'execution-start.json'), executionStart);
  return {
    root,
    definition,
    initial,
    mapping,
    contract,
    runDirectory,
    reportPath,
    startedAt,
    buildId,
    executionIdentity,
    scope: provenance?.scope,
    executionStartSha256: reportDigest(executionStart),
    collectionStartSha256: provenance?.collectionStartSha256,
  };
}

function finishUnitExecution(
  capture: ReturnType<typeof beginUnitExecution>,
  status: number | null,
  launchError?: string,
): UnitExecution & { directory: string } {
  const { root, definition, initial, mapping, contract, reportPath, startedAt, runDirectory, buildId } = capture;
  const finishedAt = new Date().toISOString();
  const final = sourceState(root);
  const current = initial.sourceCommit === final.sourceCommit && initial.fingerprint === final.fingerprint;
  const report = existsSync(reportPath) ? readFileSync(reportPath, 'utf8') : null;
  const executionFailure = launchError
    ? `Component unit command could not start: ${launchError}`
    : !current
      ? 'Source inputs changed during component unit execution; its results cannot qualify.'
      : status !== 0
        ? `Component unit command failed (exit ${status ?? 'none'}).`
        : report === null
          ? `Component unit command produced no fresh Jest report.`
          : null;
  const context =
    report === null
      ? null
      : parseUnitContext({
          schemaVersion: 1,
          platform: definition.unit.platform,
          sourceCommit: initial.sourceCommit,
          workingTreeDirty: initial.workingTreeDirty || final.workingTreeDirty || !current,
          buildId,
          contractDigest: contract.digest,
          mappingDigest: mapping.digest,
          reportSha256: reportDigest(report),
          startedAt,
          finishedAt,
          exitCode: status,
        });
  const execution: UnitExecution = {
    schemaVersion: 1,
    report,
    context,
    executionFailure,
    exitCode: executionFailure ? status || 1 : 0,
    executionIdentity: capture.executionIdentity,
    ...(capture.scope ? { scope: capture.scope } : {}),
    executionStartSha256: capture.executionStartSha256,
    ...(capture.collectionStartSha256 ? { collectionStartSha256: capture.collectionStartSha256 } : {}),
  };
  writeFileSync(path.join(runDirectory, 'execution.json'), `${JSON.stringify(execution, null, 2)}\n`);
  if (context) writeFileSync(path.join(runDirectory, 'context.json'), `${JSON.stringify(context, null, 2)}\n`);
  return { ...execution, directory: runDirectory };
}

export function runUnitTests(
  root: string,
  directory: string,
  expectedBuildId?: string,
  definition = selectAssessment(root),
): UnitExecution & { directory: string } {
  const manifest = object(JSON.parse(readFileSync(path.join(root, 'package.json'), 'utf8')), 'Root manifest');
  const version = /^yarn@(\d+\.\d+\.\d+)$/.exec(text(manifest.packageManager, 'Package manager'))?.[1];
  if (!version) throw new Error('Unit collection requires the repository-pinned Yarn release.');
  const yarn = path.join(root, '.yarn', 'releases', `yarn-${version}.cjs`);
  if (!existsSync(yarn)) throw new Error(`Pinned Yarn entry point is missing: ${yarn}.`);
  const capture = beginUnitExecution(root, directory, definition, expectedBuildId);
  const env: NodeJS.ProcessEnv = { ...process.env, [PLATFORM_ENV_VAR]: definition.unit.platform };
  delete env.FURN_ASSESSMENT_UNIT_CAPTURE;
  const result = spawnSync(
    process.execPath,
    [
      yarn,
      'workspace',
      definition.packageName,
      'test',
      ...definition.unit.testFiles,
      '--runInBand',
      '--json',
      '--outputFile',
      capture.reportPath,
    ],
    { cwd: root, env, stdio: 'inherit' },
  );
  return finishUnitExecution(capture, result.status, result.error?.message);
}

/** Decorates the existing package invocation; the supplied runner is called exactly once. */
export async function runJestWithUnitCapture(
  packageRoot: string,
  platform: string,
  args: string[],
  run: (args: string[]) => Promise<number>,
  env: NodeJS.ProcessEnv = process.env,
): Promise<number> {
  const directory = env.FURN_ASSESSMENT_UNIT_CAPTURE;
  if (!directory) return run(args);
  const root = execFileSync('git', ['rev-parse', '--show-toplevel'], { cwd: packageRoot, encoding: 'utf8' }).trim();
  const definitions = readPackageAssessments(realpathSync.native(root), realpathSync.native(packageRoot)).filter(
    (definition) => definition.unit.platform === platform,
  );
  if (!definitions.length) return run(args);
  if (env[PLATFORM_ENV_VAR] !== undefined && env[PLATFORM_ENV_VAR] !== platform)
    throw new Error('Unit capture requires the declared package Jest mock.');
  if (args.some((arg) => arg === '--outputFile' || arg.startsWith('--outputFile=') || arg === '--listTests')) {
    throw new Error('Assessment capture cannot replace explicit output/list-only Jest options.');
  }
  const destination = path.resolve(directory);
  const startFile = path.join(destination, 'unit-collection-start.json');
  if (!existsSync(startFile) && env.GITHUB_ACTIONS !== 'true') {
    const source = sourceState(root);
    mkdirSync(destination, { recursive: true });
    writeFileSync(
      startFile,
      `${JSON.stringify(
        {
          schemaVersion: 1,
          scope: 'local',
          identity: null,
          source: { ...source, inputDigest: inputDigest(root, source.sourceCommit) },
          startedAt: new Date().toISOString(),
          buildId: `local-unit/${randomUUID()}`,
        },
        null,
        2,
      )}\n`,
    );
  }
  const collectionStart = readFileSync(startFile, 'utf8');
  const start = object(JSON.parse(collectionStart), 'Unit collection start');
  if (start.schemaVersion !== 1) throw new Error('Unsupported unit collection capture schema.');
  const local = start.scope === 'local';
  if (local && env.GITHUB_ACTIONS === 'true') throw new Error('Local unit receipts cannot bind a CI execution.');
  const identity = local ? null : object(start.identity, 'Unit collection identity');
  const localSource = local ? object(start.source, 'Original local source') : null;
  const began = timestamp(start.startedAt, 'Unit collection start time');
  if (local) {
    const current = sourceState(root);
    const age = Date.now() - Date.parse(began);
    if (
      start.identity !== null ||
      typeof localSource?.workingTreeDirty !== 'boolean' ||
      localSource.sourceCommit !== current.sourceCommit ||
      localSource.fingerprint !== current.fingerprint ||
      localSource.workingTreeDirty !== current.workingTreeDirty ||
      hex(localSource.inputDigest, 64, 'Local global inputs') !== inputDigest(root, current.sourceCommit) ||
      age < 0 ||
      age > 168 * 3_600_000 ||
      !/^local-unit\/[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(text(start.buildId, 'Local build ID'))
    )
      throw new Error('Local pre-execution source, build, or interval no longer matches.');
  }
  const executionIdentity = originalExecutionIdentity(root, start, env);
  const captures = definitions.map((definition) => {
    const output = unitCaptureDirectory(destination, definition);
    if (existsSync(path.join(output, 'unit-execution.json')))
      throw new Error('A unit execution was already collected; refusing replacement.');
    const provenance = local
      ? {
          scope: 'local' as const,
          inputDigest: hex(localSource?.inputDigest, 64, 'Local global inputs'),
          collectionStartSha256: reportDigest(collectionStart),
        }
      : env.GITHUB_ACTIONS === 'true'
        ? { scope: 'ci' as const, collectionStartSha256: reportDigest(collectionStart) }
        : undefined;
    const capture = beginUnitExecution(
      root,
      output,
      definition,
      text(start.buildId, 'Unit collection build ID'),
      executionIdentity,
      provenance,
    );
    if (
      capture.initial.sourceCommit !== (local ? localSource?.sourceCommit : identity?.testedCommit) ||
      (local && capture.initial.fingerprint !== localSource?.fingerprint) ||
      Date.parse(capture.startedAt) < Date.parse(began)
    )
      throw new Error('Existing unit invocation does not match pre-execution source or interval.');
    return capture;
  });
  const reportPath = captures[0].reportPath;
  let exitCode: number | null = null;
  try {
    exitCode = await run([...args, '--json', '--outputFile', reportPath]);
    return exitCode;
  } finally {
    for (const capture of captures) {
      const execution = finishUnitExecution({ ...capture, reportPath }, exitCode);
      writeFileSync(
        path.join(unitCaptureDirectory(destination, capture.definition), 'unit-execution.json'),
        `${JSON.stringify(
          {
            ...execution,
            identity,
            ...(local ? { scope: 'local', source: localSource } : {}),
            collectionStartedAt: began,
          },
          null,
          2,
        )}\n`,
      );
    }
  }
}
