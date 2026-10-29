import { execFileSync, spawnSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, realpathSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import { PLATFORM_ENV_VAR } from '../const.mts';
import { object, readCheckboxContract, reportDigest, text, timestamp } from './controlAssessment.ts';
import { checkboxUnitTestPath, parseUnitContext, readCheckboxUnitMappingFrom } from './controlAssessmentUnit.ts';
import type { UnitContext } from './controlAssessmentUnit.ts';

export type UnitExecution = {
  schemaVersion: 1;
  report: string | null;
  context: UnitContext | null;
  executionFailure: string | null;
  exitCode: number;
};

function sourceState(root: string) {
  const sourceCommit = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim();
  const status = execFileSync('git', ['status', '--porcelain', '--untracked-files=all'], { cwd: root, encoding: 'utf8' });
  const diff = execFileSync('git', ['diff', '--binary', 'HEAD'], { cwd: root, maxBuffer: 32_000_000 });
  return { sourceCommit, workingTreeDirty: status.length > 0, fingerprint: reportDigest(`${status}\0${diff.toString('base64')}`) };
}

function beginUnitExecution(root: string, directory: string, expectedBuildId?: string) {
  const initial = sourceState(root);
  const read = (file: string) => readFileSync(path.join(root, file), 'utf8');
  const mapping = readCheckboxUnitMappingFrom(read);
  const contract = readCheckboxContract(root);
  const runId = randomUUID();
  const runDirectory = path.join(directory, `unit-${runId}`);
  mkdirSync(directory, { recursive: true });
  mkdirSync(runDirectory);
  const reportPath = path.join(runDirectory, 'jest.json');
  const startedAt = new Date().toISOString();
  return {
    root,
    initial,
    mapping,
    contract,
    runDirectory,
    reportPath,
    startedAt,
    buildId: expectedBuildId ?? `local-checkbox-unit/${runId}`,
  };
}

function finishUnitExecution(
  capture: ReturnType<typeof beginUnitExecution>,
  status: number | null,
  launchError?: string,
): UnitExecution & { directory: string } {
  const { root, initial, mapping, contract, reportPath, startedAt, runDirectory, buildId } = capture;
  const finishedAt = new Date().toISOString();
  const final = sourceState(root);
  const current = initial.sourceCommit === final.sourceCommit && initial.fingerprint === final.fingerprint;
  const report = existsSync(reportPath) ? readFileSync(reportPath, 'utf8') : null;
  const executionFailure = launchError
    ? `Checkbox unit command could not start: ${launchError}`
    : !current
      ? 'Source inputs changed during Checkbox unit execution; its results cannot qualify.'
      : status !== 0
        ? `Checkbox unit command failed (exit ${status ?? 'none'}).`
        : report === null
          ? `Checkbox unit command produced no fresh ${checkboxUnitTestPath} Jest report.`
          : null;
  const context =
    report === null
      ? null
      : parseUnitContext({
          schemaVersion: 1,
          platform: 'macos',
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
  };
  writeFileSync(path.join(runDirectory, 'execution.json'), `${JSON.stringify(execution, null, 2)}\n`);
  if (context) writeFileSync(path.join(runDirectory, 'context.json'), `${JSON.stringify(context, null, 2)}\n`);
  return { ...execution, directory: runDirectory };
}

export function runCheckboxUnitTests(root: string, directory: string, expectedBuildId?: string): UnitExecution & { directory: string } {
  const manifest = object(JSON.parse(readFileSync(path.join(root, 'package.json'), 'utf8')), 'Root manifest');
  const version = /^yarn@(\d+\.\d+\.\d+)$/.exec(text(manifest.packageManager, 'Package manager'))?.[1];
  if (!version) throw new Error('Unit collection requires the repository-pinned Yarn release.');
  const yarn = path.join(root, '.yarn', 'releases', `yarn-${version}.cjs`);
  if (!existsSync(yarn)) throw new Error(`Pinned Yarn entry point is missing: ${yarn}.`);
  const capture = beginUnitExecution(root, directory, expectedBuildId);
  const env: NodeJS.ProcessEnv = { ...process.env, [PLATFORM_ENV_VAR]: 'macos' };
  delete env.FURN_ASSESSMENT_UNIT_CAPTURE;
  const result = spawnSync(
    process.execPath,
    [
      yarn,
      'workspace',
      '@fluentui-react-native/components',
      'test',
      'src/components/checkbox/checkbox.test.tsx',
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
  if (!directory || platform !== 'macos') return run(args);
  const root = execFileSync('git', ['rev-parse', '--show-toplevel'], { cwd: packageRoot, encoding: 'utf8' }).trim();
  if (path.relative(realpathSync.native(root), realpathSync.native(packageRoot)).replace(/\\/g, '/') !== 'packages/agentic/components') {
    return run(args);
  }
  if (env[PLATFORM_ENV_VAR] !== undefined && env[PLATFORM_ENV_VAR] !== 'macos')
    throw new Error('Unit capture requires the declared macOS Jest mock.');
  if (args.some((arg) => arg === '--outputFile' || arg.startsWith('--outputFile=') || arg === '--listTests')) {
    throw new Error('Assessment capture cannot replace explicit output/list-only Jest options.');
  }
  const destination = path.resolve(directory);
  const start = object(JSON.parse(readFileSync(path.join(destination, 'unit-collection-start.json'), 'utf8')), 'Unit collection start');
  if (start.schemaVersion !== 1) throw new Error('Unsupported unit collection capture schema.');
  const identity = object(start.identity, 'Unit collection identity');
  const began = timestamp(start.startedAt, 'Unit collection start time');
  if (existsSync(path.join(destination, 'unit-execution.json')))
    throw new Error('A unit execution was already collected; refusing replacement.');
  const capture = beginUnitExecution(root, destination, text(start.buildId, 'Unit collection build ID'));
  if (capture.initial.sourceCommit !== identity.testedCommit || Date.parse(capture.startedAt) < Date.parse(began)) {
    throw new Error('Existing unit invocation does not match pre-execution source or interval.');
  }
  let exitCode: number | null = null;
  try {
    exitCode = await run([...args, '--json', '--outputFile', capture.reportPath]);
    return exitCode;
  } finally {
    const execution = finishUnitExecution(capture, exitCode);
    writeFileSync(
      path.join(destination, 'unit-execution.json'),
      `${JSON.stringify(
        {
          ...execution,
          identity,
          collectionStartedAt: began,
        },
        null,
        2,
      )}\n`,
    );
  }
}
