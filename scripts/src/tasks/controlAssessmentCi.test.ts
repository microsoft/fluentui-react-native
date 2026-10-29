import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';

import {
  assessmentSummaryPath,
  assertFresh,
  assessCiBundle,
  beginCiExecution,
  combineCiEvidence,
  finishCiExecution,
  formatCiSummary,
  formatCiSpec,
  git,
  inputDigest,
  isReportOnlyUpdate,
  parseBundle,
  parseIdentity,
  parseReportReference,
} from './controlAssessmentCi.ts';
import type { CiBundle } from './controlAssessmentCi.ts';
import { readCheckboxContract, reportDigest, win32StorybookTargetId } from './controlAssessment.ts';
import { assessmentPackagePath, assessmentSpecPath, splitSpecAssessment } from './controlAssessmentSpec.ts';
import { checkboxJestFixture, componentJestFixture, desktopEvidenceFixture } from './controlAssessmentFixtures.ts';
import { readCheckboxUnitMappingFrom, unitMappingFiles } from './controlAssessmentUnit.ts';
import { runJestWithUnitCapture } from './controlAssessmentUnitExecution.ts';
import {
  AssessmentGitHub,
  inspectReportUpdate,
  preparePublication,
  publishAssessment,
  verifyReportUpdate,
} from './controlAssessmentGithub.ts';

const repositoryRoot = fileURLToPath(new URL('../../../', import.meta.url));
const contractPath = 'packages/agentic/components/src/components/checkbox';
const now = new Date('2026-10-21T20:00:03.000Z');
const directories: string[] = [];
const reportDirectory = ['apps', 'storybook', 'artifacts', 'win32', 'assessment-ci'];
const desktopDirectory = ['apps', 'storybook', 'artifacts', 'desktop'];
const nativePath = [...desktopDirectory, 'synthetic-desktop-run', 'run.json'];

function put(root: string, file: string, content: string): void {
  const target = path.join(root, file);
  mkdirSync(path.dirname(target), { recursive: true });
  writeFileSync(target, content);
}

function commit(root: string, message: string): string {
  git(root, ['add', '.']);
  git(root, ['commit', '-qm', message]);
  return git(root, ['rev-parse', 'HEAD']);
}

function merge(root: string, base: string, head: string): string {
  git(root, ['checkout', '-q', '--detach', base]);
  git(root, ['merge', '--no-ff', '-qm', 'Synthetic PR merge', head]);
  return git(root, ['rev-parse', 'HEAD']);
}

function fixture() {
  const directory = mkdtempSync(path.join(tmpdir(), 'furn-ci-pilot-'));
  directories.push(directory);
  const root = path.join(directory, 'repo');
  mkdirSync(root);
  mkdirSync(path.join(root, 'apps', 'storybook'), { recursive: true });
  git(root, ['init', '-q', '-b', 'main']);
  git(root, ['config', 'user.name', 'Fixture']);
  git(root, ['config', 'user.email', 'fixture@example.invalid']);
  git(root, ['config', 'core.autocrlf', 'false']);
  git(root, ['config', 'commit.gpgsign', 'false']);
  put(root, '.gitignore', 'apps/storybook/artifacts/\n');
  const originalManifest = JSON.parse(readFileSync(path.join(repositoryRoot, assessmentPackagePath), 'utf8'));
  put(
    root,
    assessmentPackagePath,
    JSON.stringify({
      name: originalManifest.name,
      version: '0.7.0',
      furn: { jestPlatform: originalManifest.furn.jestPlatform },
      scripts: { test: originalManifest.scripts.test },
    }),
  );
  for (const file of unitMappingFiles) put(root, file, readFileSync(path.join(repositoryRoot, file), 'utf8'));
  for (const file of [
    'SPEC.md',
    'spec/source.json',
    'spec/interaction.md',
    'spec/accessibility.md',
    'spec/tokens.yaml',
    'spec/usage.md',
    'checkbox.stories.tsx',
  ]) {
    const target = path.join(root, contractPath, file);
    mkdirSync(path.dirname(target), { recursive: true });
    if (file === 'SPEC.md') {
      writeFileSync(target, splitSpecAssessment(readFileSync(path.join(repositoryRoot, contractPath, file), 'utf8')).contract);
    } else {
      copyFileSync(path.join(repositoryRoot, contractPath, file), target);
    }
  }
  put(root, 'source.ts', 'export const value = 0;\n');
  const baseCommit = commit(root, 'Synthetic base');
  git(root, ['checkout', '-qb', 'pilot/checkbox']);
  put(root, 'source.ts', 'export const value = 1;\n');
  const headCommit = commit(root, 'Synthetic control change');
  const testedCommit = merge(root, baseCommit, headCommit);
  const event = path.join(directory, 'event.json');
  const payload = (head = headCommit, base = baseCommit) => ({
    pull_request: {
      number: 123,
      head: { sha: head, ref: 'pilot/checkbox', repo: { full_name: 'example/furn' } },
      base: { sha: base, ref: 'main', repo: { full_name: 'example/furn' } },
    },
  });
  writeFileSync(event, JSON.stringify(payload()));
  const env: NodeJS.ProcessEnv = {
    GITHUB_EVENT_PATH: event,
    GITHUB_REPOSITORY: 'example/furn',
    GITHUB_SHA: testedCommit,
    GITHUB_RUN_ID: '456',
    GITHUB_RUN_ATTEMPT: '1',
    FURN_DESKTOP_DRIVER_DISABLED_INPUT_FEATURES: 'keyboard,physicalClick,wheel',
    SMOKE_OUTCOME: 'success',
  };
  return { directory, root, baseCommit, headCommit, testedCommit, event, payload, env };
}
type Fixture = ReturnType<typeof fixture>;

function nativeReport(overrides: Record<string, unknown> = {}): string {
  return JSON.stringify({
    schemaVersion: 1,
    endpoint: 'win32',
    platformName: 'windows',
    targetId: 'agenticstorybook-win32',
    runId: 'synthetic-native-run',
    startedAt: '2026-10-21T20:00:01.000Z',
    finishedAt: '2026-10-21T20:00:02.000Z',
    manifest: { platform: 'b'.repeat(64), portable: 'c'.repeat(64) },
    status: 'passed',
    tests: [],
    wdio: [
      {
        storyId: 'components-checkbox--default',
        testName: 'toggles native checked state in both directions',
        status: 'skipped',
        durationMs: 0,
        skipReason: 'This test requires physical pointer input.',
      },
    ],
    ...overrides,
  });
}

function execute(f: Fixture): CiBundle {
  rmSync(path.join(f.root, ...desktopDirectory, 'synthetic-desktop-run'), { recursive: true, force: true });
  beginCiExecution(f.root, f.env, new Date('2026-10-21T20:00:00.000Z'));
  putNative(f.root, nativeReport());
  return finishCiExecution(f.root, f.env, now);
}

function putNative(root: string, smoke: string): void {
  mkdirSync(path.join(root, 'apps', 'storybook'), { recursive: true });
  const capture = path.join(root, ...reportDirectory, 'execution-start.json');
  const targetId = existsSync(capture) ? JSON.parse(readFileSync(capture, 'utf8')).targetId : win32StorybookTargetId(root);
  const boundSmoke = JSON.stringify({ ...JSON.parse(smoke), targetId });
  put(root, path.join(...nativePath), desktopEvidenceFixture(boundSmoke).canonical);
  put(root, path.join(...desktopDirectory, 'synthetic-desktop-run', 'evidence', 'win32', 'static', 'run.json'), boundSmoke);
}

function putUnit(f: Fixture, modify: (capture: Record<string, unknown>) => void = () => {}): void {
  const started = JSON.parse(readFileSync(path.join(f.root, ...reportDirectory, 'execution-start.json'), 'utf8'));
  const report = JSON.stringify(checkboxJestFixture());
  const mapping = readCheckboxUnitMappingFrom((file) => readFileSync(path.join(f.root, file), 'utf8'));
  const capture = {
    schemaVersion: 1,
    identity: started.identity,
    exitCode: 0,
    report,
    executionFailure: null,
    collectionStartedAt: '2026-10-21T20:00:00.000Z',
    context: {
      schemaVersion: 1,
      platform: 'macos',
      sourceCommit: f.testedCommit,
      workingTreeDirty: false,
      buildId: 'example/furn/actions/runs/456/attempts/1',
      contractDigest: readCheckboxContract(f.root).digest,
      mappingDigest: mapping.digest,
      reportSha256: reportDigest(report),
      startedAt: '2026-10-21T20:00:00.100Z',
      finishedAt: '2026-10-21T20:00:01.500Z',
      exitCode: 0,
    },
  };
  modify(capture);
  put(f.root, path.join(...reportDirectory, 'unit-execution.json'), JSON.stringify(capture));
  f.env.UNIT_OUTCOME = 'success';
}

function reportCommit(
  f: Fixture,
  summary: string,
  spec = readFileSync(path.join(f.root, ...reportDirectory, 'SPEC.md'), 'utf8'),
): { head: string; merged: string } {
  git(f.root, ['checkout', '-q', 'pilot/checkbox']);
  put(f.root, assessmentSummaryPath, summary);
  put(f.root, assessmentSpecPath, spec);
  const head = commit(f.root, 'Synthetic generated report');
  const merged = merge(f.root, f.baseCommit, head);
  writeFileSync(f.event, JSON.stringify(f.payload(head, f.baseCommit)));
  f.env.GITHUB_SHA = merged;
  return { head, merged };
}

function fakeApi(f: Fixture, overrides: Record<string, unknown> = {}) {
  const calls: { url: string; options?: RequestInit }[] = [];
  const fetchImplementation: typeof fetch = async (input, options) => {
    const url = String(input);
    calls.push({ url, options });
    const route = url.slice('https://api.github.com'.length);
    const defaults: Record<string, unknown> = {
      '/repos/example/furn/actions/runs/456/attempts/1': {
        id: 456,
        run_attempt: 1,
        event: 'pull_request',
        status: 'completed',
        path: '.github/workflows/pr.yml',
        head_sha: f.headCommit,
        head_branch: 'pilot/checkbox',
        head_repository: { full_name: 'example/furn' },
      },
      '/repos/example/furn/actions/runs/456/attempts/1/jobs?per_page=100&page=1': {
        total_count: 1,
        jobs: [{ name: 'PR source validation', conclusion: 'success' }],
      },
      '/repos/example/furn/actions/runs/456/artifacts?per_page=100&page=1': {
        total_count: 1,
        artifacts: [{ name: 'checkbox-win32-assessment-1', expired: false }],
      },
      '/repos/example/furn/pulls/123': {
        number: 123,
        state: 'open',
        base: { sha: f.baseCommit, ref: 'main', repo: { full_name: 'example/furn' } },
        head: { sha: f.headCommit, ref: 'pilot/checkbox', repo: { full_name: 'example/furn' } },
        merge_commit_sha: f.testedCommit,
      },
      '/graphql': { data: { createCommitOnBranch: { commit: { oid: 'd'.repeat(40) } } } },
    };
    const value = route in overrides ? overrides[route] : defaults[route];
    assert.notEqual(value, undefined, `Unexpected API request: ${route}`);
    return new Response(JSON.stringify(value), { status: 200 });
  };
  return { github: new AssessmentGitHub({ token: 'synthetic-token', fetchImplementation }), calls };
}

afterEach(() => {
  for (const directory of directories.splice(0)) rmSync(directory, { recursive: true, force: true });
});

describe('CI execution binding', () => {
  it('assesses existing units when native execution is unavailable and rejects a different native attempt', () => {
    const f = fixture();
    beginCiExecution(f.root, f.env, new Date('2026-10-21T20:00:00.000Z'));
    putUnit(f);
    put(
      f.root,
      path.join('apps', 'storybook', 'artifacts', 'assessment-unit-ci', 'unit-execution.json'),
      readFileSync(path.join(f.root, ...reportDirectory, 'unit-execution.json'), 'utf8'),
    );
    f.env.NATIVE_OUTCOME = 'failure';
    const bundle = combineCiEvidence(f.root, f.env, now);
    const report = assessCiBundle(f.root, bundle);
    assert.equal(report.evidence.status, 'missing');
    assert.equal(report.unitEvidence.status, 'matched');
    assert.equal(report.requirements[0].outcome, 'partial');
    assert.equal(splitSpecAssessment(formatCiSpec(f.root, bundle)).assessment?.testedCommit, null);
    put(
      f.root,
      path.join(...reportDirectory, 'bundle.json'),
      JSON.stringify({ ...bundle, identity: { ...bundle.identity, runAttempt: 2 } }),
    );
    assert.throws(() => combineCiEvidence(f.root, f.env, now), /different CI inputs/);
  });

  for (const mode of ['passed', 'failed'] as const) {
    it(`reuses exactly one existing package invocation and retains its ${mode} exit status across jobs`, async () => {
      const f = fixture();
      const command = path.join(repositoryRoot, 'scripts', 'src', 'tasks', 'controlAssessmentCiTask.ts');
      const run = (argument: string) =>
        spawnSync(process.execPath, [command, argument], {
          cwd: f.root,
          env: { ...process.env, ...f.env },
          encoding: 'utf8',
        });
      const begin = run('begin-unit');
      assert.equal(begin.status, 0, begin.stderr || begin.stdout);
      const unitDirectory = path.join(f.root, 'apps', 'storybook', 'artifacts', 'assessment-unit-ci');
      let invocations = 0;
      const originalArgs = ['--runTestsByPath', 'checkbox.test.tsx', 'checkbox.types.test.ts'];
      const unit = await runJestWithUnitCapture(
        path.join(f.root, 'packages', 'agentic', 'components'),
        'macos',
        originalArgs,
        async (args) => {
          invocations++;
          assert.deepEqual(args.slice(0, originalArgs.length), originalArgs);
          const data = componentJestFixture();
          const time = Date.now();
          data.startTime = time;
          for (const suite of data.testResults) Object.assign(suite, { startTime: time, endTime: time });
          const outputIndex = args.indexOf('--outputFile');
          assert.ok(outputIndex >= 0, 'Existing invocation must receive its capture output path.');
          writeFileSync(args[outputIndex + 1], JSON.stringify(data));
          return mode === 'passed' ? 0 : 1;
        },
        { ...f.env, FURN_ASSESSMENT_UNIT_CAPTURE: unitDirectory },
      );
      assert.equal(unit, mode === 'passed' ? 0 : 1);
      assert.equal(invocations, 1);
      // Another workspace may fail the aggregate without invalidating this successful component command.
      f.env.UNIT_OUTCOME = 'failure';
      const nativeBegin = run('begin');
      assert.equal(nativeBegin.status, 0, nativeBegin.stderr || nativeBegin.stdout);
      const time = new Date().toISOString();
      putNative(f.root, nativeReport({ startedAt: time, finishedAt: time }));
      const finish = run('finish');
      assert.equal(finish.status, 0, finish.stderr || finish.stdout);
      const combined = run('combine');
      assert.equal(combined.status, 0, combined.stderr || combined.stdout);
      const report = JSON.parse(readFileSync(path.join(f.root, ...reportDirectory, 'assessment.json'), 'utf8'));
      assert.equal(report.unitEvidence.status, 'matched');
      assert.equal(report.unitEvidence.caseCounts.passed, 42);
      assert.equal(report.unitEvidence.packageSuites, 2);
      assert.equal(report.unitEvidence.packageCounts.passed, 43);
      assert.equal(report.unitEvidence.outcome, mode === 'passed' ? 'passed' : 'execution-failed');
      assert.equal(invocations, 1, 'Assessment must never invoke Jest again.');
    });
  }

  it('collects bound unit cases beside a native skip without claiming native qualification', () => {
    const f = fixture();
    beginCiExecution(f.root, f.env, new Date('2026-10-21T20:00:00.000Z'));
    putUnit(f);
    putNative(f.root, nativeReport());
    const bundle = finishCiExecution(f.root, f.env, now);
    const report = assessCiBundle(f.root, bundle);
    assert.equal(bundle.schemaVersion, 2);
    assert.equal(report.unitEvidence.status, 'matched');
    assert.equal(report.unitEvidence.caseCounts.passed, 42);
    assert.equal(report.requirements[1].check?.evidenceOutcome, 'skipped');
    assert.equal(report.requirements[1].outcome, 'partial');
    assert.equal(report.requirements[5].outcome, 'insufficient-evidence');
    assert.equal(report.assessmentOutcome, 'insufficient-evidence');
    assert.equal(report.evidenceSupportedStatus, null);
    assert.match(formatCiSummary(f.root, bundle), /Recorded unit cases: 42 passed/);
    assert.equal(splitSpecAssessment(formatCiSpec(f.root, bundle)).assessment?.testedCommit, f.testedCommit);
    const context = bundle.unit!.context!;
    for (const change of [
      { sourceCommit: f.headCommit },
      { reportSha256: 'f'.repeat(64) },
      { buildId: 'example/furn/actions/runs/456/attempts/2' },
      { finishedAt: '2026-10-22T20:00:00.000Z' },
      { workingTreeDirty: true },
    ]) {
      assert.throws(
        () => assessCiBundle(f.root, { ...bundle, unit: { ...bundle.unit!, context: { ...context, ...change } } }),
        /binding|dirty/,
      );
    }
  });

  it('preserves unit step failure instead of accepting passing JSON from a failed parent command', () => {
    const f = fixture();
    beginCiExecution(f.root, f.env, new Date('2026-10-21T20:00:00.000Z'));
    putUnit(f);
    putNative(f.root, nativeReport());
    f.env.UNIT_OUTCOME = 'failure';
    const report = assessCiBundle(f.root, finishCiExecution(f.root, f.env, now));
    assert.equal(report.unitEvidence.outcome, 'execution-failed');
    assert.equal(report.assessmentOutcome, 'execution-failed');
    assert.equal(report.requirements[1].outcome, 'insufficient-evidence');
  });

  it('keeps absent/skipped unit collection unavailable and accepts old native-only bundles explicitly', () => {
    const f = fixture();
    f.env.UNIT_OUTCOME = 'skipped';
    const bundle = execute(f);
    const report = assessCiBundle(f.root, bundle);
    assert.equal(report.unitEvidence.status, 'missing');
    assert.match(report.unitEvidence.executionFailure ?? '', /skipped/);
    const { unit, ...nativeOnly } = bundle;
    assert.ok(unit);
    const legacy = parseBundle(JSON.stringify({ ...nativeOnly, schemaVersion: 1 }));
    assert.equal(legacy.unit, undefined);
    assert.equal(assessCiBundle(f.root, legacy).unitEvidence.status, 'missing');
    assert.throws(() => parseBundle(JSON.stringify({ ...bundle, schemaVersion: 1 })), /Legacy/);
    assert.throws(
      () => parseBundle(JSON.stringify({ ...bundle, unit: { report: '{}', context: null, executionFailure: null } })),
      /together/,
    );
  });

  it('rejects stale unit captures from a previous interval or workflow attempt', () => {
    const f = fixture();
    beginCiExecution(f.root, f.env, new Date('2026-10-21T20:00:00.000Z'));
    putNative(f.root, nativeReport());
    putUnit(f, (capture) => {
      (capture.context as Record<string, unknown>).startedAt = '2026-10-20T20:00:00.000Z';
    });
    assert.throws(() => finishCiExecution(f.root, f.env, now), /predates/);
    putUnit(f, (capture) => {
      (capture.identity as Record<string, unknown>).runAttempt = 2;
    });
    assert.throws(() => finishCiExecution(f.root, f.env, now), /different CI/);
  });

  it('captures before execution, retains an honest hosted skip, and writes usable reports', () => {
    const f = fixture();
    const bundle = execute(f);
    const report = assessCiBundle(f.root, bundle);
    assert.equal(bundle.identity.testedCommit, f.testedCommit);
    assert.equal(bundle.identity.headCommit, f.headCommit);
    assert.equal(bundle.context?.physicalClick, false);
    assert.equal(report.evidence.status, 'matched');
    assert.equal(report.requirements[1].check?.recordedOutcome, 'skipped');
    assert.equal(report.requirements[1].check?.evidenceOutcome, 'skipped');
    assert.equal(report.evidenceSupportedStatus, null);
    assert.equal(report.assessmentOutcome, 'insufficient-evidence');
    const markdown = readFileSync(path.join(f.root, ...reportDirectory, 'ASSESSMENT.md'), 'utf8');
    assert.match(markdown, /AUTO-GENERATED\. DO NOT EDIT/);
    assert.match(markdown, /physical pointer input/);
    assert.equal(parseReportReference(markdown).inputDigest, inputDigest(f.root, f.testedCommit));
    assert.deepEqual(parseBundle(readFileSync(path.join(f.root, ...reportDirectory, 'bundle.json'), 'utf8')), bundle);
  });

  it('never binds an old report when pre-execution capture did not run', () => {
    const f = fixture();
    putNative(f.root, nativeReport());
    const bundle = finishCiExecution(f.root, { ...f.env, SMOKE_OUTCOME: 'skipped' }, now);
    assert.equal(bundle.nativeReport, null);
    assert.equal(bundle.context, null);
    assert.match(bundle.executionFailure ?? '', /skipped/);
    assert.equal(assessCiBundle(f.root, bundle).evidence.status, 'missing');
  });

  it('preserves but never binds desktop runs that existed before capture', () => {
    const f = fixture();
    putNative(f.root, nativeReport());
    beginCiExecution(f.root, f.env, new Date('2026-10-21T20:00:00.000Z'));
    const bundle = finishCiExecution(f.root, f.env, now);
    assert.equal(bundle.nativeReport, null);
    assert.match(bundle.executionFailure ?? '', /did not produce/);
    assert.equal(JSON.parse(readFileSync(path.join(f.root, ...nativePath), 'utf8')).runId, 'synthetic-desktop-run');
  });

  it('rejects multiple new desktop runs rather than choosing the newest report', () => {
    const f = fixture();
    beginCiExecution(f.root, f.env, new Date('2026-10-21T20:00:00.000Z'));
    putNative(f.root, nativeReport());
    put(f.root, path.join(...desktopDirectory, 'another-run', 'run.json'), desktopEvidenceFixture(nativeReport()).canonical);
    assert.throws(() => finishCiExecution(f.root, f.env, now), /Ambiguous/);
  });

  it('rejects a canonical run ID that differs from its captured artifact directory', () => {
    const f = fixture();
    beginCiExecution(f.root, f.env, new Date('2026-10-21T20:00:00.000Z'));
    putNative(f.root, nativeReport());
    put(f.root, path.join(...nativePath), desktopEvidenceFixture(nativeReport(), { runId: 'different-run' }).canonical);
    assert.throws(() => finishCiExecution(f.root, f.env, now), /artifact directory/);
  });

  it('rejects another generated target instance instead of accepting the Win32 prefix alone', () => {
    const f = fixture();
    beginCiExecution(f.root, f.env, new Date('2026-10-21T20:00:00.000Z'));
    putNative(f.root, nativeReport());
    put(
      f.root,
      path.join(...desktopDirectory, 'synthetic-desktop-run', 'evidence', 'win32', 'static', 'run.json'),
      nativeReport({ targetId: `win32-${'0'.repeat(16)}` }),
    );
    assert.throws(() => finishCiExecution(f.root, f.env, now), /different native instance/);
  });

  for (const missing of ['undeclared companion', 'unwritten companion', 'unfinished canonical run'] as const) {
    it(`reports unavailable evidence for ${missing}`, () => {
      const f = fixture();
      beginCiExecution(f.root, f.env, new Date('2026-10-21T20:00:00.000Z'));
      if (missing === 'unfinished canonical run') {
        put(f.root, path.join(...desktopDirectory, 'synthetic-desktop-run', 'events.jsonl'), '{}\n');
      } else {
        put(
          f.root,
          path.join(...nativePath),
          desktopEvidenceFixture(nativeReport(), missing === 'undeclared companion' ? { artifacts: [] } : {}).canonical,
        );
      }
      const bundle = finishCiExecution(f.root, f.env, now);
      assert.equal(bundle.nativeReport, null);
      assert.equal(bundle.context, null);
      assert.match(bundle.executionFailure ?? '', /evidence|report/);
      assert.equal(assessCiBundle(f.root, bundle).assessmentOutcome, 'insufficient-evidence');
      assert.match(assessCiBundle(f.root, bundle).evidence.runError ?? '', /evidence|report/);
    });
  }

  it('preserves a canonical cleanup failure in the generated assessment', () => {
    const f = fixture();
    beginCiExecution(f.root, f.env, new Date('2026-10-21T20:00:00.000Z'));
    putNative(f.root, nativeReport());
    put(
      f.root,
      path.join(...nativePath),
      desktopEvidenceFixture(nativeReport(), {
        status: 'failed',
        failures: [{ failureId: 'cleanup', kind: 'cleanup', error: { name: 'Error', message: '' } }],
      }).canonical,
    );
    const bundle = finishCiExecution(f.root, f.env, now);
    assert.equal(assessCiBundle(f.root, bundle).assessmentOutcome, 'execution-failed');
    assert.match(assessCiBundle(f.root, bundle).evidence.runError ?? '', /Desktop supervisor status: failed/);
    assert.match(formatCiSummary(f.root, bundle), /Desktop supervisor: failed/);
  });

  it('does not accept passes from a smoke step that failed after writing its report', () => {
    const f = fixture();
    beginCiExecution(f.root, f.env, new Date('2026-10-21T20:00:00.000Z'));
    putNative(f.root, nativeReport());
    const bundle = finishCiExecution(f.root, { ...f.env, SMOKE_OUTCOME: 'failure' }, now);
    assert.equal(assessCiBundle(f.root, bundle).assessmentOutcome, 'execution-failed');
    assert.match(assessCiBundle(f.root, bundle).evidence.runError ?? '', /failure/);
  });

  it('rejects dirty tracked and nonignored inputs instead of inventing a clean execution', () => {
    const f = fixture();
    put(f.root, 'source.ts', 'dirty\n');
    assert.throws(() => beginCiExecution(f.root, f.env, now), /inputs changed/);
    put(f.root, 'source.ts', 'export const value = 1;\n');
    put(f.root, 'extra.ts', 'untracked\n');
    assert.throws(() => finishCiExecution(f.root, f.env, now), /inputs changed/);
  });

  it('requires hosted capability disabling and the real merged checkout', () => {
    const f = fixture();
    assert.throws(() => beginCiExecution(f.root, { ...f.env, FURN_DESKTOP_DRIVER_DISABLED_INPUT_FEATURES: '' }, now), /physicalClick/);
    assert.throws(() => beginCiExecution(f.root, { ...f.env, GITHUB_SHA: f.headCommit }, now), /checkout/);
    const bundle = execute(f);
    assert.throws(
      () => assessCiBundle(f.root, { ...bundle, identity: { ...bundle.identity, testedCommit: f.headCommit } }),
      /merge commit/,
    );
  });

  it('rejects old report timestamps, changed source trees, and incorrect report hashes', () => {
    const f = fixture();
    beginCiExecution(f.root, f.env, new Date('2026-10-21T20:00:00.000Z'));
    putNative(f.root, nativeReport({ startedAt: '2026-10-21T19:00:00.000Z' }));
    assert.throws(() => finishCiExecution(f.root, f.env, now), /predates/);
    const bundle = execute(f);
    assert.throws(() => assessCiBundle(f.root, { ...bundle, identity: { ...bundle.identity, inputDigest: 'a'.repeat(64) } }), /digest/);
    const context = bundle.context;
    assert.ok(context);
    assert.throws(() => assessCiBundle(f.root, { ...bundle, context: { ...context, reportSha256: 'a'.repeat(64) } }), /binding/);
  });

  it('rejects a physical pass on the explicitly noninteractive hosted runner', () => {
    const f = fixture();
    beginCiExecution(f.root, f.env, new Date('2026-10-21T20:00:00.000Z'));
    putNative(
      f.root,
      nativeReport({
        wdio: [
          {
            storyId: 'components-checkbox--default',
            testName: 'toggles native checked state in both directions',
            status: 'passed',
            durationMs: 10,
          },
        ],
      }),
    );
    assert.throws(() => finishCiExecution(f.root, f.env, now), /physical-click/);
  });

  it('runs the actual CI entry point and persists files without dependencies or network writes', () => {
    const f = fixture();
    const command = path.join(repositoryRoot, 'scripts', 'src', 'tasks', 'controlAssessmentCiTask.ts');
    const run = (argument: string) =>
      spawnSync(process.execPath, [command, argument], {
        cwd: f.root,
        env: { ...process.env, ...f.env },
        encoding: 'utf8',
      });
    const begin = run('begin');
    assert.equal(begin.status, 0, begin.stderr || begin.stdout);
    const time = new Date().toISOString();
    putNative(f.root, nativeReport({ startedAt: time, finishedAt: time }));
    const finish = run('finish');
    assert.equal(finish.status, 0, finish.stderr || finish.stdout);
    assert.match(finish.stdout, /No maturity stage assigned/);
    assert.equal(parseBundle(readFileSync(path.join(f.root, ...reportDirectory, 'bundle.json'), 'utf8')).identity.headCommit, f.headCommit);
  });
});

describe('same-PR source fingerprint and evidence reuse', () => {
  it('verifies unit evidence through the same exact two-file publication and follow-up path', async () => {
    const f = fixture();
    beginCiExecution(f.root, f.env, new Date('2026-10-21T20:00:00.000Z'));
    putUnit(f);
    putNative(f.root, nativeReport());
    const bundle = finishCiExecution(f.root, f.env, now);
    const summary = formatCiSummary(f.root, bundle);
    const update = reportCommit(f, summary);
    const { github } = fakeApi(f);
    const candidate = await inspectReportUpdate(f.root, f.env, github, now);
    assert.equal(candidate.reportOnly, true);
    verifyReportUpdate(f.root, candidate, bundle, now);
    assert.equal(inputDigest(f.root, update.merged), bundle.identity.inputDigest);
    const tampered = {
      ...bundle,
      unit: { ...bundle.unit!, report: bundle.unit!.report!.replace('"numPassedTests":42', '"numPassedTests":41') },
    };
    assert.throws(() => verifyReportUpdate(f.root, candidate, tampered, now), /counts|binding/);
  });

  it('preserves the legacy raw tree digest before generated SPEC metadata exists', () => {
    const f = fixture();
    const raw = git(f.root, ['ls-tree', '-rz', '--full-tree', f.testedCommit]);
    assert.equal(inputDigest(f.root, f.testedCommit), createHash('sha256').update(raw).digest('hex'));
  });

  it('verifies the report-only follow-up without relabeling its commit as tested', async () => {
    const f = fixture();
    const bundle = execute(f);
    const summary = formatCiSummary(f.root, bundle);
    const update = reportCommit(f, summary);
    assert.equal(inputDigest(f.root, update.merged), bundle.identity.inputDigest);
    assert.equal(isReportOnlyUpdate(f.root, parseReportReference(summary), update.head, update.merged), true);
    const { github } = fakeApi(f);
    const candidate = await inspectReportUpdate(f.root, f.env, github, now);
    assert.equal(candidate.reportOnly, true);
    verifyReportUpdate(f.root, candidate, bundle, now);
    assert.notEqual(bundle.identity.testedCommit, update.merged);
    assert.notEqual(bundle.identity.headCommit, update.head);
  });

  for (const file of [
    'source.ts',
    'yarn.lock',
    '.github/workflows/pr.yml',
    `${contractPath}/SPEC.md`,
    `${contractPath}/checkbox.test.tsx`,
    `${contractPath}/assessment/not-a-generated-report.ts`,
    assessmentPackagePath,
  ]) {
    it(`does not exclude source input ${file}`, () => {
      const f = fixture();
      const bundle = execute(f);
      git(f.root, ['checkout', '-q', 'pilot/checkbox']);
      put(f.root, file, `${readFileIfPresent(f.root, file)}\n// changed input\n`);
      put(f.root, assessmentSummaryPath, formatCiSummary(f.root, bundle));
      const changed = commit(f.root, 'Synthetic source and report changes');
      const merged = merge(f.root, f.baseCommit, changed);
      assert.notEqual(inputDigest(f.root, merged), bundle.identity.inputDigest);
      assert.equal(isReportOnlyUpdate(f.root, { ...bundle.identity, generatedAt: bundle.generatedAt }, changed, merged), false);
    });
  }

  it('records the tested package version and merge SHA, never the publication SHA', () => {
    const f = fixture();
    const bundle = execute(f);
    const spec = formatCiSpec(f.root, bundle);
    const metadata = splitSpecAssessment(spec).assessment;
    assert.equal(metadata?.packageVersion, '0.7.0');
    assert.equal(metadata?.sourceCommit, f.testedCommit);
    assert.equal(metadata?.testedCommit, f.testedCommit);
    assert.equal(metadata?.dirty, false);
    assert.equal(metadata?.provenance, 'matched');
    const update = reportCommit(f, formatCiSummary(f.root, bundle));
    assert.notEqual(metadata?.testedCommit, update.head);
    assert.notEqual(metadata?.testedCommit, update.merged);
  });

  it('rejects altered generated SPEC fields even though their structural input digest is unchanged', async () => {
    const f = fixture();
    const bundle = execute(f);
    const spec = formatCiSpec(f.root, bundle).replace("assessment-package-version: '0.7.0'", "assessment-package-version: '99.0.0'");
    const update = reportCommit(f, formatCiSummary(f.root, bundle), spec);
    assert.equal(inputDigest(f.root, update.merged), bundle.identity.inputDigest);
    const candidate = await inspectReportUpdate(f.root, f.env, fakeApi(f).github, now);
    assert.ok(candidate.reportOnly);
    assert.throws(() => verifyReportUpdate(f.root, candidate, bundle, now), /SPEC.*trusted rendering/);
  });

  it('falls back to full CI for an old summary-only publication without a SPEC update', async () => {
    const f = fixture();
    const bundle = execute(f);
    git(f.root, ['checkout', '-q', 'pilot/checkbox']);
    put(f.root, assessmentSummaryPath, formatCiSummary(f.root, bundle));
    const head = commit(f.root, 'Legacy summary-only update');
    f.env.GITHUB_SHA = merge(f.root, f.baseCommit, head);
    writeFileSync(f.event, JSON.stringify(f.payload(head)));
    assert.equal((await inspectReportUpdate(f.root, f.env, fakeApi(f).github, now)).reportOnly, false);
  });

  it('does not normalize away executable mode or human contract changes in a two-file publication', () => {
    for (const mode of [false, true]) {
      const f = fixture();
      const bundle = execute(f);
      git(f.root, ['checkout', '-q', 'pilot/checkbox']);
      put(f.root, assessmentSummaryPath, formatCiSummary(f.root, bundle));
      put(f.root, assessmentSpecPath, `${formatCiSpec(f.root, bundle)}${mode ? '' : '\nHuman contract changed.\n'}`);
      if (mode) {
        git(f.root, ['add', '.']);
        git(f.root, ['update-index', '--chmod=+x', assessmentSpecPath]);
      }
      const head = commit(f.root, 'Changed actual SPEC inputs');
      const merged = merge(f.root, f.baseCommit, head);
      assert.notEqual(inputDigest(f.root, merged), bundle.identity.inputDigest);
      assert.equal(isReportOnlyUpdate(f.root, { ...bundle.identity, generatedAt: bundle.generatedAt }, head, merged), false);
    }
  });

  it('renders from original PR head contract bytes but takes the version and assessment from the tested merge', async () => {
    const f = fixture();
    const headSpec = readFileSync(path.join(f.root, assessmentSpecPath), 'utf8');
    git(f.root, ['checkout', '-q', 'main']);
    put(f.root, assessmentSpecPath, `${headSpec}\nBase-only contract note.\n`);
    put(f.root, assessmentPackagePath, JSON.stringify({ version: '0.8.0' }));
    f.baseCommit = commit(f.root, 'New main contract and version');
    f.testedCommit = merge(f.root, f.baseCommit, f.headCommit);
    f.env.GITHUB_SHA = f.testedCommit;
    writeFileSync(f.event, JSON.stringify(f.payload(f.headCommit, f.baseCommit)));
    const bundle = execute(f);
    const spec = formatCiSpec(f.root, bundle);
    assert.equal(splitSpecAssessment(spec).contract, headSpec);
    assert.equal(splitSpecAssessment(spec).assessment?.packageVersion, '0.8.0');
    assert.equal(splitSpecAssessment(spec).assessment?.health, 'stale');
    const update = reportCommit(f, formatCiSummary(f.root, bundle));
    assert.equal(inputDigest(f.root, update.merged), bundle.identity.inputDigest);
    const candidate = await inspectReportUpdate(f.root, f.env, fakeApi(f).github, now);
    verifyReportUpdate(f.root, candidate, bundle, now);
  });

  it('rejects non-UTF-8 SPEC bytes instead of folding distinct source bytes together', () => {
    const f = fixture();
    const bundle = execute(f);
    git(f.root, ['checkout', '-q', 'pilot/checkbox']);
    writeFileSync(path.join(f.root, assessmentSpecPath), Buffer.concat([Buffer.from(formatCiSpec(f.root, bundle)), Buffer.from([0xff])]));
    const head = commit(f.root, 'Invalid SPEC encoding');
    assert.throws(() => inputDigest(f.root, head), /valid UTF-8/);
  });

  it('detects changes in earlier commits, not just the last report commit', () => {
    const f = fixture();
    const bundle = execute(f);
    git(f.root, ['checkout', '-q', 'pilot/checkbox']);
    put(f.root, 'source.ts', 'changed after testing\n');
    commit(f.root, 'Synthetic earlier code commit');
    put(f.root, assessmentSummaryPath, formatCiSummary(f.root, bundle));
    const head = commit(f.root, 'Synthetic latest report-only commit');
    const merged = merge(f.root, f.baseCommit, head);
    assert.equal(isReportOnlyUpdate(f.root, { ...bundle.identity, generatedAt: bundle.generatedAt }, head, merged), false);
  });

  it('invalidates reuse when another control PR changes the base branch', () => {
    const f = fixture();
    const bundle = execute(f);
    const update = reportCommit(f, formatCiSummary(f.root, bundle));
    git(f.root, ['checkout', '-q', 'main']);
    put(f.root, 'other-control.ts', 'another merged change\n');
    const newBase = commit(f.root, 'Synthetic concurrent PR');
    const merged = merge(f.root, newBase, update.head);
    assert.equal(isReportOnlyUpdate(f.root, { ...bundle.identity, generatedAt: bundle.generatedAt }, update.head, merged), false);
  });

  it('recovers from concurrent generated-report conflicts by resolving source and reassessing the combined tree', () => {
    const f = fixture();
    const firstBundle = execute(f);
    const first = reportCommit(f, formatCiSummary(f.root, firstBundle));
    git(f.root, ['checkout', '-q', 'main']);
    git(f.root, ['merge', '--ff-only', first.head]);
    git(f.root, ['checkout', '-qb', 'pilot/second', f.baseCommit]);
    put(f.root, 'other-control.ts', 'second PR source\n');
    const secondHead = commit(f.root, 'Synthetic simultaneous control PR');
    const secondMerge = merge(f.root, f.baseCommit, secondHead);
    const reassess = (head: string, base: string, tested: string) => {
      const event = {
        pull_request: {
          number: 124,
          head: { sha: head, ref: 'pilot/second', repo: { full_name: 'example/furn' } },
          base: { sha: base, ref: 'main', repo: { full_name: 'example/furn' } },
        },
      };
      writeFileSync(f.event, JSON.stringify(event));
      const env = { ...f.env, GITHUB_RUN_ID: '789', GITHUB_SHA: tested };
      rmSync(path.join(f.root, ...desktopDirectory, 'synthetic-desktop-run'), { recursive: true, force: true });
      beginCiExecution(f.root, env, new Date('2026-10-21T20:00:00.000Z'));
      putNative(f.root, nativeReport());
      return finishCiExecution(f.root, env, now);
    };
    const secondBundle = reassess(secondHead, f.baseCommit, secondMerge);
    git(f.root, ['checkout', '-q', 'pilot/second']);
    put(f.root, assessmentSummaryPath, formatCiSummary(f.root, secondBundle));
    put(f.root, assessmentSpecPath, formatCiSpec(f.root, secondBundle));
    commit(f.root, 'Synthetic second generated report');
    const conflict = spawnSync('git', ['merge', '--no-ff', '--no-edit', 'main'], { cwd: f.root, encoding: 'utf8' });
    assert.equal(conflict.status, 1, conflict.stdout || conflict.stderr);
    assert.deepEqual(
      git(f.root, ['diff', '--name-only', '--diff-filter=U']).split('\n').sort(),
      [assessmentSummaryPath, assessmentSpecPath].sort(),
    );
    put(f.root, assessmentSummaryPath, formatCiSummary(f.root, firstBundle));
    put(f.root, assessmentSpecPath, formatCiSpec(f.root, firstBundle));
    const updatedHead = commit(f.root, 'Resolve generated report with main snapshot temporarily');
    const updatedMerge = merge(f.root, first.head, updatedHead);
    const refreshed = reassess(updatedHead, first.head, updatedMerge);
    assert.notEqual(refreshed.identity.inputDigest, secondBundle.identity.inputDigest);
    assert.equal(refreshed.identity.baseCommit, first.head);
    git(f.root, ['checkout', '-q', 'pilot/second']);
    put(f.root, assessmentSummaryPath, formatCiSummary(f.root, refreshed));
    put(f.root, assessmentSpecPath, formatCiSpec(f.root, refreshed));
    const reportHead = commit(f.root, 'Regenerate second PR assessment after integration');
    const reportMerge = merge(f.root, first.head, reportHead);
    assert.equal(isReportOnlyUpdate(f.root, { ...refreshed.identity, generatedAt: refreshed.generatedAt }, reportHead, reportMerge), true);
  });

  it('rejects a manually altered report body even when the embedded source reference is valid', async () => {
    const f = fixture();
    const bundle = execute(f);
    reportCommit(f, `${formatCiSummary(f.root, bundle)}\nManual readiness claim\n`);
    const candidate = await inspectReportUpdate(f.root, f.env, fakeApi(f).github, now);
    assert.equal(candidate.reportOnly, true);
    assert.throws(() => verifyReportUpdate(f.root, candidate, bundle, now), /trusted rendering/);
  });

  it('preserves failed source checks rather than blessing them through skipped jobs', async () => {
    const f = fixture();
    const bundle = execute(f);
    reportCommit(f, formatCiSummary(f.root, bundle));
    const { github } = fakeApi(f, {
      '/repos/example/furn/actions/runs/456/attempts/1/jobs?per_page=100&page=1': {
        total_count: 1,
        jobs: [{ name: 'PR source validation', conclusion: 'failure' }],
      },
    });
    const candidate = await inspectReportUpdate(f.root, f.env, github, now);
    assert.ok(candidate.reportOnly);
    assert.equal(candidate.sourceResult, 'failure');
    verifyReportUpdate(f.root, candidate, bundle, now);
  });

  it('fails closed for a missing artifact or a source attempt with the wrong head', async () => {
    const f = fixture();
    const bundle = execute(f);
    reportCommit(f, formatCiSummary(f.root, bundle));
    await assert.rejects(
      inspectReportUpdate(
        f.root,
        f.env,
        fakeApi(f, {
          '/repos/example/furn/actions/runs/456/artifacts?per_page=100&page=1': { total_count: 0, artifacts: [] },
        }).github,
        now,
      ),
      /missing or expired/,
    );
    await assert.rejects(
      inspectReportUpdate(
        f.root,
        f.env,
        fakeApi(f, {
          '/repos/example/furn/actions/runs/456/attempts/1': {
            id: 456,
            run_attempt: 1,
            event: 'pull_request',
            status: 'completed',
            path: '.github/workflows/pr.yml',
            head_sha: 'a'.repeat(40),
            head_branch: 'pilot/checkbox',
            head_repository: { full_name: 'example/furn' },
          },
        }).github,
        now,
      ),
      /source PR workflow/,
    );
  });

  it('runs full CI when there is no reusable report or its explicit reuse age has expired', async () => {
    const f = fixture();
    assert.equal((await inspectReportUpdate(f.root, f.env, fakeApi(f).github, now)).reportOnly, false);
    const bundle = execute(f);
    reportCommit(f, formatCiSummary(f.root, bundle));
    const later = new Date(now.getTime() + 169 * 3_600_000);
    const candidate = await inspectReportUpdate(f.root, f.env, fakeApi(f).github, later);
    assert.equal(candidate.reportOnly, false);
    assert.throws(() => assertFresh(bundle.generatedAt, later), /reuse limit/);
  });
});

describe('trusted report publication', () => {
  const expected = { repository: 'example/furn', runId: '456', runAttempt: 1, defaultBranch: 'main' };

  it('writes exactly the allowlisted summary and SPEC paths with one atomic expected-head check', async () => {
    const f = fixture();
    const bundle = execute(f);
    const { github, calls } = fakeApi(f);
    const publication = await preparePublication(f.root, bundle, github, expected, now);
    assert.ok(publication.eligible);
    assert.equal(calls.filter(({ options }) => options?.method === 'POST').length, 0);
    const sha = await publishAssessment(publication, github);
    assert.equal(sha, 'd'.repeat(40));
    const mutation = calls.find(({ url }) => url.endsWith('/graphql'));
    assert.ok(mutation);
    const payload = JSON.parse(String(mutation.options?.body));
    assert.equal(payload.variables.input.expectedHeadOid, f.headCommit);
    assert.deepEqual(payload.variables.input.branch, { repositoryNameWithOwner: 'example/furn', branchName: 'pilot/checkbox' });
    assert.equal(payload.variables.input.fileChanges.additions.length, 2);
    assert.equal(payload.variables.input.fileChanges.additions[0].path, assessmentSummaryPath);
    assert.equal(payload.variables.input.fileChanges.additions[1].path, assessmentSpecPath);
    assert.equal(Buffer.from(payload.variables.input.fileChanges.additions[1].contents, 'base64').toString(), formatCiSpec(f.root, bundle));
    assert.equal(payload.variables.input.fileChanges.deletions, undefined);
  });

  for (const [label, overrides] of [
    ['newer source commit', { head: { sha: 'a'.repeat(40), ref: 'pilot/checkbox', repo: { full_name: 'example/furn' } } }],
    ['closed PR', { state: 'closed' }],
    ['fork PR', { head: { sha: 'a'.repeat(40), ref: 'pilot/checkbox', repo: { full_name: 'contributor/furn' } } }],
    ['conflicted PR', { merge_commit_sha: null }],
    ['protected main branch as source', { head: { sha: 'a'.repeat(40), ref: 'main', repo: { full_name: 'example/furn' } } }],
  ] as const) {
    it(`does not write for ${label}`, async () => {
      const f = fixture();
      const bundle = execute(f);
      const pr = {
        number: 123,
        state: 'open',
        base: { sha: f.baseCommit, ref: 'main', repo: { full_name: 'example/furn' } },
        head: { sha: f.headCommit, ref: 'pilot/checkbox', repo: { full_name: 'example/furn' } },
        merge_commit_sha: f.testedCommit,
        ...overrides,
      };
      const { github, calls } = fakeApi(f, { '/repos/example/furn/pulls/123': pr });
      const publication = await preparePublication(f.root, bundle, github, expected, now);
      assert.equal(publication.eligible, false);
      assert.equal(calls.filter(({ options }) => options?.method === 'POST').length, 0);
    });
  }

  it('rejects an artifact from a different source run before requesting a PR or creating a commit', async () => {
    const f = fixture();
    const bundle = execute(f);
    const { github, calls } = fakeApi(f);
    await assert.rejects(preparePublication(f.root, bundle, github, { ...expected, runId: '999' }, now), /triggering workflow/);
    assert.equal(calls.length, 0);
  });

  it('surfaces a branch race rejected by GitHub rather than reporting publication success', async () => {
    const f = fixture();
    const bundle = execute(f);
    const { github } = fakeApi(f, { '/graphql': { errors: [{ message: 'expectedHeadOid mismatch' }] } });
    const publication = await preparePublication(f.root, bundle, github, expected, now);
    await assert.rejects(publishAssessment(publication, github), /rejected the assessment commit/);
  });

  it('surfaces permission errors without logging credentials or returning an empty success', async () => {
    const fetchImplementation: typeof fetch = async () => new Response('{}', { status: 403 });
    const github = new AssessmentGitHub({ token: 'synthetic-token', fetchImplementation });
    await assert.rejects(github.request('/repos/example/furn/pulls/123'), (error: Error) => {
      assert.match(error.message, /403/);
      assert.doesNotMatch(error.message, /synthetic-token/);
      return true;
    });
  });
});

describe('CI input schema and workflow wiring', () => {
  it('rejects invalid IDs, unsafe references, malformed markers, and oversized bundles', () => {
    for (const value of [null, {}, { repository: '../repo' }]) assert.throws(() => parseIdentity(value));
    assert.throws(() => parseReportReference('# Manual report'));
    assert.throws(() => parseReportReference('<!-- furn-checkbox-assessment:! -->'));
    assert.throws(() => parseBundle('x'.repeat(2_000_001)), /size limit/);
    assert.throws(() => assertFresh('2026-10-22T20:00:00.000Z', now), /future/);
  });

  it('keeps required checks alive, captures before smoke, and runs publisher code only from trusted main', () => {
    const workflow = readFileSync(path.join(repositoryRoot, '.github', 'workflows', 'pr.yml'), 'utf8');
    assert.match(workflow, /name: PR\non: pull_request/);
    assert.doesNotMatch(workflow, /paths-ignore:/);
    assert.match(workflow, / {2}pr:\n {4}name: PR\n {4}if: always\(\)/);
    assert.match(workflow, /The original source validation did not pass/);
    const win32 = workflow.slice(workflow.indexOf('  win32-storybook:'), workflow.indexOf('  check-changesets:'));
    assert.ok(win32.indexOf('controlAssessmentCiTask.ts begin') < win32.indexOf('name: Smoke test Win32 Storybook'));
    assert.ok(win32.indexOf('controlAssessmentCiTask.ts finish') > win32.indexOf('name: Smoke test Win32 Storybook'));
    assert.match(win32, /disabled-input-features: keyboard,physicalClick,wheel/);
    assert.match(win32, /checkbox-win32-assessment-\$\{\{ github.run_attempt \}\}/);
    const js = workflow.slice(workflow.indexOf('  js:'), workflow.indexOf('  bundle-size:'));
    assert.match(js, /FURN_ASSESSMENT_UNIT_CAPTURE:/);
    assert.equal(js.match(/run: yarn lage buildci/g)?.length, 1);
    assert.doesNotMatch(workflow, /--run-unit-tests|controlAssessmentCiTask\.ts unit(?:\s|$)/);
    assert.match(workflow, /needs: \[assessment-inputs, js, win32-storybook\]/);
    assert.match(workflow, /run: node scripts\/src\/tasks\/controlAssessmentCiTask\.ts combine/);
    const jest = readFileSync(path.join(repositoryRoot, 'scripts', 'src', 'tasks', 'jest.ts'), 'utf8');
    assert.match(jest, /runJestWithUnitCapture\(\s*context.root/);
    const publisher = readFileSync(path.join(repositoryRoot, '.github', 'workflows', 'pr-control-assessment.yml'), 'utf8');
    assert.match(publisher, /workflow_run:/);
    assert.match(publisher, /ref: \$\{\{ github.event.repository.default_branch \}\}/);
    assert.doesNotMatch(publisher, /pull_request_target|run: yarn|npm install|ref: \$\{\{ github.event.workflow_run.head_sha/);
    assert.ok(
      publisher.indexOf('Validate publication without write credentials') < publisher.indexOf('Create narrowly scoped publisher token'),
    );
    assert.match(publisher, /permission-contents: write/);
    assert.doesNotMatch(publisher, /permission-workflows:|permission-administration:|skip-token-revoke:/);
  });
});

function readFileIfPresent(root: string, file: string): string {
  try {
    return readFileSync(path.join(root, file), 'utf8');
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return '';
    throw error;
  }
}
