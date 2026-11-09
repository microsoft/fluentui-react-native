import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { generateKeyPairSync, randomUUID, sign } from 'node:crypto';
import { copyFileSync, existsSync, linkSync, mkdirSync, readFileSync, realpathSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { afterEach, test } from 'node:test';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { object, reportDigest } from './controlAssessment.ts';
import {
  assessNativeCapture,
  assessTypeCapture,
  assessUnitCollection,
  captureProblems,
  parseExecutionCapture,
  realCompiler,
} from './readinessEvidence.ts';
import type { EvidenceEnvironment, ExecutionCapture, ReadinessEvidence } from './readinessEvidence.ts';
import { discoverReadinessControls } from './readinessModel.ts';
import type { ReadinessControl } from './readinessModel.ts';
import {
  assessReadinessControl,
  authenticateOwnerRecord,
  canonicalPayload,
  compareReadinessStatus,
  parseReadinessPolicy,
  upstreamCurrency,
} from './readinessPolicy.ts';
import type { OwnerRecord } from './readinessPolicy.ts';
import { guardReadinessOutput, runReadinessCapture } from '../readinessCiTask.ts';

const root = fileURLToPath(new URL('../../../../', import.meta.url));
const policyBytes = readFileSync(
  path.join(root, 'packages', 'agentic', 'components', 'references', 'assessments', 'readiness-policy.json'),
  'utf8',
);
const fixtures: string[] = [];

function fixture(): string {
  const directory = path.join(root, 'reports', `readiness-test-${randomUUID()}`);
  mkdirSync(directory, { recursive: true });
  fixtures.push(directory);
  return directory;
}

afterEach(() => {
  for (const directory of fixtures.splice(0)) rmSync(directory, { recursive: true, force: true });
});

function environment(): EvidenceEnvironment {
  return {
    source: { commit: 'a'.repeat(40), inputDigest: 'b'.repeat(64), dirty: false, fingerprint: 'c'.repeat(64) },
    identity: {
      repository: 'test/repo',
      workflow: 'test/repo/.github/workflows/pr.yml@refs/pull/1/merge',
      runId: '123',
      runAttempt: 2,
      job: 'report',
      buildId: 'test/repo/actions/runs/123/attempts/2',
    },
    now: new Date(),
    ci: true,
    sourceJobs: new Map([['native', 'success']]),
  };
}

/** Synthetic supervisor protocol data, never real native qualification. */
function nativeCapture(
  options: {
    endpoint?: 'win32' | 'windows' | 'macos';
    renderer?: 'paper' | 'fabric';
    input?: 'accessible' | 'physical';
    failure?: boolean;
    retried?: boolean;
    mixed?: boolean;
    targetId?: string;
  } = {},
): ExecutionCapture {
  const env = environment();
  const endpoint = options.endpoint ?? 'win32';
  const renderer = options.renderer ?? 'paper';
  const startedAt = new Date(Date.now() - 3_000).toISOString();
  const finishedAt = new Date(Date.now() - 1_000).toISOString();
  const storyId = 'sample--default';
  const testName = 'acts';
  const success = {
    attempt: options.retried ? 1 : 0,
    status: 'passed',
    durationMs: 1,
    context: { endpoint, story: storyId, test: testName },
  };
  const failure = {
    attempt: 0,
    status: 'failed',
    durationMs: 1,
    failure: { failureId: 'failed-attempt', kind: 'test', error: { message: 'initial failure' } },
    context: success.context,
  };
  const run = {
    schemaVersion: 1,
    terminal: true,
    kind: 'tests',
    runId: 'new-run',
    status: options.failure ? 'failed' : 'passed',
    startedAt,
    finishedAt,
    context: { endpoint, renderer, targetId: options.targetId ?? 'actual-resolved-target' },
    ...(options.mixed ? {} : { lane: { input: options.input ?? 'accessible', source: 'option', policyEnforced: true } }),
    selection: { excluded: { platform: 3, scope: 2, input: 5 } },
    tests: [
      {
        testId: `csf-${reportDigest(JSON.stringify([storyId, testName]))}`,
        title: 'sample / acts',
        status: 'passed',
        flaky: options.retried === true,
        attempts: options.retried ? [failure, success] : [success],
      },
    ],
    work: [],
    failures: options.failure ? [{ failureId: 'cleanup', kind: 'cleanup', error: { message: 'cleanup failed' } }] : [],
    counts: {
      selected: 1,
      executed: 1,
      passed: 1,
      failed: 0,
      skipped: 0,
      unsupported: 0,
      incomplete: 0,
      retries: options.retried ? 1 : 0,
      flaky: options.retried ? 1 : 0,
    },
    artifacts: [{ path: `evidence/${endpoint}/static/run.json` }],
  };
  const story = {
    schemaVersion: 1,
    endpoint,
    platformName: endpoint,
    runId: 'story-run',
    targetId: options.targetId ?? 'actual-resolved-target',
    startedAt,
    finishedAt,
    manifest: { platform: 'd'.repeat(64), portable: 'e'.repeat(64) },
    status: 'passed',
    tests: [],
    wdio: [{ storyId, testName, status: 'passed', durationMs: 1 }],
  };
  const report = JSON.stringify({
    schemaVersion: 1,
    format: 'desktop-test',
    desktopRun: JSON.stringify(run),
    storyReport: JSON.stringify(story),
  });
  return {
    schemaVersion: 1,
    kind: 'native',
    target: 'win32-paper',
    input: 'accessible',
    before: env.source,
    after: { ...env.source },
    identity: { ...env.identity!, job: 'native' },
    startedAt,
    finishedAt,
    exitCode: 0,
    command: [process.execPath, 'existing-native-invocation'],
    report,
    reportSha256: reportDigest(report),
    existingRunIds: ['old-run'],
    selectedRunId: 'new-run',
    collectionFailure: null,
  };
}

function control(): ReadinessControl {
  return {
    id: 'packages/sample/src/components/sample',
    component: 'sample',
    kind: 'component',
    packagePath: 'packages/sample',
    directory: 'packages/sample/src/components/sample',
    contractPath: 'packages/sample/src/components/sample/SPEC.md',
    contractDigest: '1'.repeat(64),
    reviewDigest: '2'.repeat(64),
    mappingDigest: '3'.repeat(64),
    mappingCurrent: true,
    mapping: {
      schemaVersion: 1,
      reviewedDigest: '2'.repeat(64),
      reviewKind: 'agent-reviewed',
      reviewInputs: [],
      limitations: [],
      requirements: {
        'SMP-001': {
          checks: [
            {
              id: 'action',
              description: 'action happens',
              source: 'SPEC.md',
              evidence: 'unit',
              tests: [{ kind: 'unit', name: 'Sample acts' }],
            },
          ],
        },
      },
    },
    requirements: [{ id: 'SMP-001', description: 'Sample acts' }],
    files: ['packages/sample/src/components/sample/sample.tsx'],
    unitFiles: ['packages/sample/src/components/sample/sample.test.tsx'],
    typeFiles: ['packages/sample/src/components/sample/sample.types.test.ts'],
    storyFiles: ['packages/sample/src/components/sample/sample.stories.tsx'],
    sources: [],
  };
}

function ownerRecord(kind: OwnerRecord['kind'] = 'approval'): OwnerRecord {
  const selected = control();
  const env = environment();
  return {
    schemaVersion: 1,
    policyVersion: '4251-provisional-v1',
    kind,
    owner: 'test-owner',
    controlId: selected.id,
    contractDigest: selected.contractDigest,
    reviewDigest: selected.reviewDigest,
    mappingDigest: selected.mappingDigest,
    sourceCommit: env.source.commit,
    inputDigest: env.source.inputDigest,
    buildId: env.identity!.buildId,
    target: null,
    observedAt: new Date(Date.now() - 2_000).toISOString(),
    expiresAt: new Date(Date.now() + 60_000).toISOString(),
    observation: 'Synthetic signed fixture; not a real owner endorsement.',
    report: { path: 'report.json', sha256: reportDigest('{}') },
    artifacts: [{ path: 'report.json', sha256: reportDigest('{}') }],
    details: { status: 'stable' },
  };
}

function signingFixture() {
  const directory = fixture();
  writeFileSync(path.join(directory, 'report.json'), '{}');
  const pair = generateKeyPairSync('ed25519');
  const publicKey = pair.publicKey.export({ type: 'spki', format: 'pem' }).toString();
  const policy = parseReadinessPolicy({
    ...object(JSON.parse(policyBytes), 'Default policy'),
    ownerAdoption: true,
    trustedKeys: [
      {
        id: 'test-key',
        owner: 'test-owner',
        publicKey,
        expiresAt: new Date(Date.now() + 120_000).toISOString(),
        controls: [control().id],
        kinds: ['approval', 'maturity-declaration'],
      },
    ],
  });
  const envelope = (payload: OwnerRecord) => ({
    keyId: 'test-key',
    signature: sign(null, Buffer.from(canonicalPayload(payload)), pair.privateKey).toString('base64'),
    payload,
  });
  return { directory, policy, envelope };
}

test('native adapter requires actual endpoint, renderer and enforced lane, not caller labels', () => {
  assert.equal(assessNativeCapture(parseExecutionCapture(nativeCapture()), environment()).observations[0].outcome, 'passed');
  for (const capture of [
    nativeCapture({ endpoint: 'windows' }),
    nativeCapture({ renderer: 'fabric' }),
    nativeCapture({ input: 'physical' }),
  ])
    assert.equal(assessNativeCapture(capture, environment()).observations[0].outcome, 'unverified');
});

test('mixed native cohorts stay mixed and do not silently become accessible', () => {
  const result = assessNativeCapture(
    { ...nativeCapture({ endpoint: 'macos', renderer: 'fabric', mixed: true }), target: 'macos-fabric', input: 'all' },
    environment(),
  );
  assert.equal(result.observations[0].outcome, 'passed');
  assert.equal(result.observations[0].input, 'all');
  assert.deepEqual(result.nativeSelections[0].selection, { excluded: { platform: 3, scope: 2, input: 5 } });
  assert.equal(assessNativeCapture(nativeCapture({ mixed: true }), environment()).observations[0].outcome, 'unverified');
});

test('native adapter consumes actual config registration identities, including explicit macOS Paper selection', () => {
  const directory = fixture();
  const config = path.join(directory, 'desktop.config.mts');
  writeFileSync(
    config,
    `export default {
    schemaVersion: 1,
    targets: {
      win32: { host: { kind: 'rex', renderer: 'paper' } },
      windows: { host: { kind: 'react-native-test-app', renderer: 'fabric' } },
      macos: { host: { kind: 'react-native-test-app', renderer: 'fabric' } }
    }
  };`,
  );
  const result = spawnSync(
    process.execPath,
    [
      '--input-type=module',
      '-e',
      `const { loadDesktopConfig, selectDesktopRenderer } = await import(process.argv[1]);
     const config = await loadDesktopConfig(process.argv[2]);
     console.log(JSON.stringify([
       config.targets.win32, config.targets.windows, config.targets.macos,
       selectDesktopRenderer(config.targets.macos, 'paper')
     ].map(({ endpoint, id, registrationId, instanceId, host }) => ({ endpoint, id, registrationId, instanceId, renderer: host.renderer }))));`,
      pathToFileURL(path.join(root, 'packages', 'agentic', 'desktop-test', 'src', 'config.ts')).href,
      config,
    ],
    { encoding: 'utf8' },
  );
  assert.equal(result.status, 0, result.stderr);
  const targets: unknown = JSON.parse(result.stdout);
  assert.ok(Array.isArray(targets));
  assert.equal(targets.length, 4);
  for (const [index, value] of targets.entries()) {
    const target = object(value, 'Actual resolved desktop target');
    const endpoint = index === 0 ? 'win32' : index === 1 ? 'windows' : 'macos';
    const renderer = index === 0 || index === 3 ? 'paper' : 'fabric';
    assert.equal(target.endpoint, endpoint);
    assert.equal(target.renderer, renderer);
    assert.equal(typeof target.id, 'string');
    assert.notEqual(target.id, target.instanceId);
    if (index === 3) assert.notEqual(target.id, target.registrationId);
    else assert.equal(target.id, target.registrationId);
    const capture = nativeCapture({ endpoint, renderer, targetId: String(target.id), mixed: endpoint === 'macos' });
    capture.target =
      endpoint === 'win32'
        ? 'win32-paper'
        : endpoint === 'windows'
          ? 'windows-fabric'
          : renderer === 'paper'
            ? 'macos-paper'
            : 'macos-fabric';
    if (endpoint === 'macos') capture.input = 'all';
    assert.equal(assessNativeCapture(capture, environment()).observations[0].outcome, 'passed');
  }
});

test('enclosing failures, cleanup failures and retries cannot leave green native checks', () => {
  for (const capture of [nativeCapture({ failure: true }), nativeCapture({ retried: true }), { ...nativeCapture(), exitCode: 7 }])
    assert.equal(assessNativeCapture(capture, environment()).observations[0].outcome, 'unverified');
  const failedJob = { ...environment(), sourceJobs: new Map([['native', 'failure' as const]]) };
  assert.equal(assessNativeCapture(nativeCapture(), failedJob).observations[0].outcome, 'unverified');
});

test('exact bytes, commit, interval, run freshness, attempt and actual wall-clock age are binding', () => {
  const good = nativeCapture();
  const staleDate = new Date(Date.now() - 169 * 3_600_000).toISOString();
  const captures = [
    { ...good, report: `${good.report}\n` },
    { ...good, before: { ...good.before, commit: 'f'.repeat(40) } },
    { ...good, identity: { ...good.identity!, runAttempt: 1 } },
    { ...good, finishedAt: staleDate },
    { ...good, before: { ...good.before, dirty: true } },
  ];
  for (const capture of captures) assert.ok(captureProblems(capture, environment()).length > 0);
  assert.equal(assessNativeCapture({ ...good, existingRunIds: ['new-run'] }, environment()).observations[0].outcome, 'unverified');
  assert.equal(assessNativeCapture({ ...good, startedAt: new Date().toISOString() }, environment()).observations[0].outcome, 'unverified');
  assert.ok(
    captureProblems({ ...good, finishedAt: staleDate }, { ...environment(), now: new Date(staleDate) }).some((reason) =>
      reason.includes('stale'),
    ),
  );
});

test('plain JSON endorsements and self-asserted verified booleans never become owner approval', () => {
  const f = signingFixture();
  assert.throws(
    () => authenticateOwnerRecord({ ...ownerRecord(), verified: true }, f.directory, f.policy, control(), environment()),
    /fields/,
  );
  const noKeys = parseReadinessPolicy(JSON.parse(policyBytes));
  assert.equal(authenticateOwnerRecord(f.envelope(ownerRecord()), f.directory, noKeys, control(), environment()).authenticated, false);
});

test('Ed25519 authenticates canonical payload, exact scope and original reviewed bytes', () => {
  const f = signingFixture();
  const envelope = f.envelope(ownerRecord());
  assert.equal(authenticateOwnerRecord(envelope, f.directory, f.policy, control(), environment()).authenticated, true);
  assert.equal(canonicalPayload({ z: [1, 'a'], a: true }), canonicalPayload({ a: true, z: [1, 'a'] }));
  assert.notEqual(canonicalPayload({ a: 'x', b: 'y' }), canonicalPayload({ a: 'x,b:y' }));
  const tampered = { ...envelope, payload: { ...envelope.payload, observation: 'tampered' } };
  assert.equal(authenticateOwnerRecord(tampered, f.directory, f.policy, control(), environment()).authenticated, false);
  assert.equal(
    authenticateOwnerRecord(envelope, f.directory, f.policy, { ...control(), reviewDigest: 'f'.repeat(64) }, environment()).authenticated,
    false,
  );
  writeFileSync(path.join(f.directory, 'report.json'), '{ "changed": true }');
  assert.equal(authenticateOwnerRecord(envelope, f.directory, f.policy, control(), environment()).authenticated, false);
});

test('expiry is evaluated against actual wall-clock time, not a caller supplied historical date', () => {
  const f = signingFixture();
  const expired = {
    ...ownerRecord(),
    observedAt: new Date(Date.now() - 10_000).toISOString(),
    expiresAt: new Date(Date.now() - 5_000).toISOString(),
  };
  const result = authenticateOwnerRecord(f.envelope(expired), f.directory, f.policy, control(), {
    ...environment(),
    now: new Date(expired.observedAt),
  });
  assert.equal(result.authenticated, false);
  assert.ok(result.reasons.some((reason) => reason.includes('expired')));
});

test('a failed gate demotes the computed ceiling immediately and withdraws a higher prior approval', () => {
  const directory = fixture();
  const selected = control();
  const exported = path.join(directory, 'packages', 'sample', 'src');
  mkdirSync(exported, { recursive: true });
  writeFileSync(path.join(exported, 'index.ts'), "export { Sample } from './components/sample/sample';");
  const f = signingFixture();
  const approved = authenticateOwnerRecord(f.envelope(ownerRecord()), f.directory, f.policy, selected, environment());
  const evidence: ReadinessEvidence = {
    observations: [
      {
        controlId: selected.id,
        kind: 'unit',
        name: 'Sample acts',
        recordedOutcome: 'passed',
        outcome: 'passed',
        reasons: [],
        reportSha256: 'a'.repeat(64),
        buildId: environment().identity!.buildId,
      },
    ],
    nativeSelections: [],
    limitations: [],
  };
  const first = assessReadinessControl({
    root: directory,
    control: selected,
    policy: f.policy,
    environment: environment(),
    evidence,
    records: [approved],
    previous: { controlId: selected.id, evidenceSupportedStatus: 'stable', approvedStatus: 'stable' },
  });
  assert.equal(first.evidenceSupportedStatus, 'experimental');
  assert.equal(first.approvedStatus, null);
  assert.equal(first.change?.evidence, 'demotion');
  assert.equal(first.change?.approvalWithdrawn, true);
  const forged = { ...approved, record: { ...approved.record, details: { status: 'experimental' } }, authenticated: true };
  const withoutTrust = assessReadinessControl({
    root: directory,
    control: selected,
    policy: f.policy,
    environment: environment(),
    evidence,
    records: [forged],
  });
  assert.equal(withoutTrust.approvedStatus, null);
  assert.equal(withoutTrust.evidenceSupportedStatus, 'experimental');
  approved.record.details.status = 'experimental';
  assert.equal(
    assessReadinessControl({
      root: directory,
      control: selected,
      policy: f.policy,
      environment: environment(),
      evidence,
      records: [approved],
    }).approvedStatus,
    null,
  );
  const failed = assessReadinessControl({
    root: directory,
    control: selected,
    policy: f.policy,
    environment: environment(),
    evidence: { ...evidence, observations: evidence.observations.map((observation) => ({ ...observation, outcome: 'failed' })) },
  });
  assert.equal(failed.evidenceSupportedStatus, null);
  assert.equal(failed.targets.length, 4);
  assert.ok(failed.targets.every(({ lanes }) => lanes.every(({ outcome }) => outcome === 'missing')));
  assert.equal(compareReadinessStatus('experimental', null), 'demotion');
});

test('local primitive foundations require no fake external pin; changed normative pins stay blocked', () => {
  const primitive = { ...control(), kind: 'primitive' as const };
  assert.equal(upstreamCurrency(primitive).current, true);
  const external = { ...control(), sources: [{ id: 'normative', lock: 'v1', fingerprint: 'a'.repeat(64) }] };
  assert.equal(upstreamCurrency(external).current, false);
  const observation = {
    ...ownerRecord('upstream-currency'),
    details: {
      sources: [
        {
          id: 'normative',
          sourceLock: 'v1',
          fingerprint: 'a'.repeat(64),
          currentSourceLock: 'v2',
          currentFingerprint: 'b'.repeat(64),
          resolution: 'resolved',
          observedAt: new Date().toISOString(),
          observationLocation: 'https://example.test/current-source',
        },
      ],
    },
  };
  assert.equal(upstreamCurrency(external, observation).current, false);
});

test('a qualifying automated preview ceiling does not require owner adoption, endorsement or approval', () => {
  const directory = fixture();
  const selected = control();
  const exported = path.join(directory, 'packages', 'sample', 'src');
  mkdirSync(exported, { recursive: true });
  writeFileSync(path.join(exported, 'index.ts'), "export { Sample } from './components/sample/sample';");
  assert.ok(selected.mapping);
  selected.mapping.requirements['SMP-001'].checks = [
    {
      id: 'axes',
      description: 'Every declared axis is asserted',
      source: 'SPEC.md#props-and-defaults',
      evidence: 'unit',
      tests: [{ kind: 'unit', name: 'Sample acts' }],
    },
    {
      id: 'accessibility',
      description: 'Accessibility states are asserted',
      source: 'SPEC.md#accessibility',
      evidence: 'unit',
      tests: [{ kind: 'unit', name: 'Sample acts' }],
    },
    {
      id: 'types',
      description: 'Type contract compiles',
      source: 'SPEC.md',
      evidence: 'type',
      tests: [{ kind: 'type', name: selected.typeFiles[0] }],
    },
  ];
  const evidence: ReadinessEvidence = {
    observations: [
      {
        controlId: selected.id,
        kind: 'unit',
        name: 'Sample acts',
        recordedOutcome: 'passed',
        outcome: 'passed',
        reasons: [],
        reportSha256: 'a'.repeat(64),
        buildId: environment().identity!.buildId,
      },
      {
        controlId: selected.id,
        kind: 'type',
        name: selected.typeFiles[0],
        recordedOutcome: 'passed',
        outcome: 'passed',
        reasons: [],
        reportSha256: 'b'.repeat(64),
        buildId: environment().identity!.buildId,
      },
    ],
    nativeSelections: [],
    limitations: [],
  };
  const report = assessReadinessControl({
    root: directory,
    control: selected,
    policy: parseReadinessPolicy(JSON.parse(policyBytes)),
    environment: environment(),
    evidence,
  });
  assert.equal(report.evidenceSupportedStatus, 'preview');
  assert.equal(report.approvedStatus, null);
  assert.equal(report.approvalState.ownerAdoption, false);
  assert.equal(report.declaredStatus, null);
});

test('source outputs and cached/noncompiler substitutes are rejected', () => {
  assert.throws(() => guardReadinessOutput(root, 'scripts/src/reports'), /source/);
  assert.throws(() => guardReadinessOutput(root, '../reports'), /inside/);
  const compiler = [process.execPath, path.join(root, 'node_modules', 'typescript', 'bin', 'tsc'), '-b', '--force', '--listFiles'];
  assert.equal(realCompiler(root, compiler), true);
  assert.equal(
    realCompiler(
      root,
      compiler.filter((arg) => arg !== '--force'),
    ),
    false,
  );
  assert.equal(realCompiler(root, [...compiler, '--noCheck']), false);
  assert.equal(realCompiler(root, [process.execPath, 'jest', '-b', '--force', '--listFiles']), false);
});

test('generic native links require the exact callback separately in each target and lane row', () => {
  const selected = control();
  assert.ok(selected.mapping);
  selected.mapping.requirements['SMP-001'].checks = [
    {
      id: 'native-action',
      description: 'Native action',
      source: 'SPEC.md',
      evidence: 'native',
      tests: [{ kind: 'native', name: 'sample--default::acts' }],
    },
  ];
  const evidence: ReadinessEvidence = {
    observations: [
      {
        kind: 'native',
        name: 'sample--default::acts',
        target: 'win32-paper',
        input: 'all',
        recordedOutcome: 'passed',
        outcome: 'passed',
        reasons: [],
        reportSha256: 'a'.repeat(64),
        buildId: environment().identity!.buildId,
      },
      {
        kind: 'native',
        name: 'unrelated--story::acts',
        target: 'windows-fabric',
        input: 'all',
        recordedOutcome: 'passed',
        outcome: 'passed',
        reasons: [],
        reportSha256: 'b'.repeat(64),
        buildId: environment().identity!.buildId,
      },
    ],
    nativeSelections: [],
    limitations: [],
  };
  const report = assessReadinessControl({
    root: fixture(),
    control: selected,
    policy: parseReadinessPolicy(JSON.parse(policyBytes)),
    environment: environment(),
    evidence,
  });
  assert.equal(report.targets[0].lanes[2].requirementCoverage, 'passed');
  assert.equal(report.targets[0].lanes[0].requirementCoverage, 'missing');
  assert.equal(report.targets[1].lanes[2].requirementCoverage, 'missing');
});

test('artifact output cannot redirect through a junction or overwrite a hardlinked source file', () => {
  const directory = fixture();
  const junction = path.join(directory, 'junction');
  symlinkSync(path.join(root, 'scripts'), junction, 'junction');
  assert.throws(() => guardReadinessOutput(root, path.join(junction, 'artifacts')), /symlink/);
  const output = path.join(directory, 'reports');
  mkdirSync(output);
  const original = path.join(directory, 'source.txt');
  writeFileSync(original, 'untouched');
  linkSync(original, path.join(output, 'readiness.json'));
  assert.throws(() => guardReadinessOutput(root, output), /regular/);
  assert.equal(readFileSync(original, 'utf8'), 'untouched');
});

test('capture wraps the existing command once, preserves caller cwd, and returns its real exit status', async () => {
  const directory = fixture();
  const marker = path.join(directory, 'child-cwd.json');
  const code = await runReadinessCapture(root, {
    kind: 'native',
    target: 'win32-paper',
    input: 'accessible',
    output: path.join(directory, 'reports', 'capture'),
    reportRoot: directory,
    cwd: directory,
    command: [process.execPath, '-e', "require('node:fs').writeFileSync(process.argv[1], process.cwd()); process.exit(7);", marker],
  });
  assert.equal(code, 7);
  assert.equal(readFileSync(marker, 'utf8'), directory);
  const capture = parseExecutionCapture(JSON.parse(readFileSync(path.join(directory, 'reports', 'capture', 'execution.json'), 'utf8')));
  assert.equal(capture.exitCode, 7);
  assert.equal(capture.report, null);
});

test('real forced compiler output selects actual type-test files; ignored custom projects never qualify clean-source claims', async () => {
  const directory = fixture();
  const typeFile = path.join(directory, 'sample.types.test.ts');
  writeFileSync(typeFile, 'export const actualTypeAssertion: number = 1;');
  const project = path.join(directory, 'tsconfig.json');
  writeFileSync(
    project,
    JSON.stringify({
      compilerOptions: { composite: true, noEmit: true, types: [], lib: ['es5'], skipLibCheck: true },
      files: ['./sample.types.test.ts'],
    }),
  );
  const output = path.join(directory, 'reports', 'type');
  const code = await runReadinessCapture(root, {
    kind: 'type',
    target: 'win32-paper',
    input: 'all',
    output,
    cwd: root,
    command: [process.execPath, path.join(root, 'scripts', 'node_modules', 'typescript', 'bin', 'tsc'), '--build', '--force', project],
  });
  assert.equal(code, 0);
  const capture = parseExecutionCapture(JSON.parse(readFileSync(path.join(output, 'execution.json'), 'utf8')));
  const relative = path.relative(root, typeFile).replaceAll('\\', '/');
  const assessed = assessTypeCapture(root, [{ ...control(), typeFiles: [relative] }], capture, {
    ...environment(),
    source: capture.before,
    ci: false,
  });
  assert.equal(assessed.observations.length, 1);
  assert.equal(assessed.observations[0].name, relative);
  assert.equal(assessed.observations[0].recordedOutcome, 'passed');
  assert.equal(assessed.observations[0].outcome, 'unverified');
  assert.ok(assessed.limitations.some((reason) => reason.includes('not a tracked source input')));
  const changedCommand = { ...capture, command: [...capture.command, '--verbose'] };
  assert.equal(
    assessTypeCapture(root, [{ ...control(), typeFiles: [relative] }], changedCommand, {
      ...environment(),
      source: capture.before,
      ci: false,
    }).observations[0].outcome,
    'unverified',
  );
});

test('declared forced Yarn workspace build executes the actual compiler and binds its listed type files', () => {
  const directory = fixture();
  const yarnRelative = path.join('.yarn', 'releases', 'yarn-4.18.0.cjs');
  const output = path.join(directory, 'reports', 'type');
  const command = ['node', yarnRelative, 'workspace', '@fluentui-react-native/components', 'build', '--force'];
  const bootstrap = path.join(directory, 'compiler-bootstrap.mjs');
  writeFileSync(
    bootstrap,
    `import { pathToFileURL } from 'node:url';
    process.chdir(process.argv[2]);
    const { readinessMain } = await import(pathToFileURL(process.argv[3]).href);
    process.exitCode = await readinessMain(process.argv.slice(4));`,
  );
  // The scripts workspace supplies its installed compiler PATH; the captured child command and caller cwd stay unchanged.
  const result = spawnSync(
    process.execPath,
    [
      path.join(root, yarnRelative),
      'workspace',
      '@fluentui-react-native/scripts',
      'exec',
      'node',
      bootstrap,
      root,
      path.join(root, 'scripts', 'src', 'ci', 'readinessCiTask.ts'),
      'run',
      '--kind',
      'type',
      '--target',
      'win32-paper',
      '--input',
      'all',
      '--output',
      output,
      '--',
      ...command,
    ],
    { cwd: root, encoding: 'utf8', maxBuffer: 16_000_000, timeout: 180_000 },
  );
  if (result.error) throw result.error;
  assert.notEqual(result.status, null, result.stderr);
  assert.ok(existsSync(path.join(output, 'execution.json')), `${result.stdout}\n${result.stderr}`);
  const capture = parseExecutionCapture(JSON.parse(readFileSync(path.join(output, 'execution.json'), 'utf8')));
  assert.equal(capture.exitCode, result.status);
  assert.deepEqual(capture.command.slice(2), ['workspace', '@fluentui-react-native/components', 'build', '--force', '--listFiles']);
  assert.equal(capture.commandSha256, reportDigest(JSON.stringify(capture.command)));
  assert.ok(capture.report);
  const controls = discoverReadinessControls(root, path.join(root, 'packages', 'agentic', 'components'));
  const evidence = assessTypeCapture(root, controls, capture, { ...environment(), source: capture.before, ci: false });
  if (capture.exitCode === 0) {
    assert.ok(evidence.observations.length > 0, 'A successful real build must list actual discovered type-test files.');
    assert.ok(evidence.observations.every(({ recordedOutcome }) => recordedOutcome === 'passed'));
  } else {
    assert.match(capture.report, /error TS[0-9]+:/);
    assert.ok(
      evidence.observations.every(({ outcome }) => outcome !== 'passed'),
      'Failed real builds never qualify.',
    );
    process.stdout.write(`Owning compiler exited ${capture.exitCode}; wrapper retained failed compiler evidence, not a passing build.\n`);
  }
  assert.equal(
    realCompiler(
      root,
      capture.command.filter((arg) => arg !== '--force'),
    ),
    false,
  );
  assert.equal(realCompiler(root, [...capture.command, '--noCheck']), false);
  assert.equal(realCompiler(root, [capture.command[0], path.join(root, 'scripts', 'src', 'cli.ts'), ...capture.command.slice(2)]), false);
});

test('a successful offline Yarn workspace forced build qualifies actual type files from its original receipt', async () => {
  const directory = fixture();
  const packageRoot = path.join(directory, 'packages', 'components');
  const compiler = realpathSync(path.join(root, 'scripts', 'node_modules', 'typescript'));
  const nativeName = `@typescript/typescript-${process.platform}-${process.arch}`;
  const nativePackage = path.dirname(createRequire(path.join(compiler, 'package.json')).resolve(`${nativeName}/package.json`));
  const relative = (from: string, to: string) => path.relative(from, to).replaceAll('\\', '/');
  const put = (file: string, bytes: string) => {
    const absolute = path.join(directory, file);
    mkdirSync(path.dirname(absolute), { recursive: true });
    writeFileSync(absolute, bytes);
  };
  put(
    'package.json',
    JSON.stringify({
      name: 'readiness-positive-compiler-fixture',
      private: true,
      packageManager: 'yarn@4.18.0',
      workspaces: ['packages/*'],
      resolutions: { [nativeName]: `portal:${relative(directory, nativePackage)}` },
    }),
  );
  put('yarn.lock', readFileSync(path.join(root, 'yarn.lock'), 'utf8'));
  put(
    '.readiness-yarnrc.yml',
    'nodeLinker: node-modules\nenableNetwork: false\nenableGlobalCache: false\nenableMirror: false\nenableTelemetry: false\n',
  );
  put('.gitignore', 'node_modules/\nreports/\n.yarn/cache/\n.yarn/install-state.gz\n');
  put(
    path.join('packages', 'components', 'package.json'),
    JSON.stringify({
      name: '@fluentui-react-native/components',
      private: true,
      scripts: { build: 'tsc -b' },
      devDependencies: { 'installed-real-compiler': `portal:${relative(packageRoot, compiler)}` },
    }),
  );
  put(
    path.join('packages', 'components', 'tsconfig.json'),
    JSON.stringify({
      compilerOptions: {
        composite: true,
        noEmit: true,
        types: [],
        lib: ['es5'],
        skipLibCheck: true,
        tsBuildInfoFile: 'node_modules/.cache/type.tsbuildinfo',
      },
      files: ['positive.types.test.ts'],
    }),
  );
  put(path.join('packages', 'components', 'positive.types.test.ts'), 'export const typeAssertion: number = 1;');
  const yarn = path.join(directory, '.yarn', 'releases', 'yarn-4.18.0.cjs');
  mkdirSync(path.dirname(yarn), { recursive: true });
  copyFileSync(path.join(root, '.yarn', 'releases', 'yarn-4.18.0.cjs'), yarn);
  const previousRc = process.env.YARN_RC_FILENAME;
  process.env.YARN_RC_FILENAME = '.readiness-yarnrc.yml';
  try {
    const install = spawnSync(process.execPath, [yarn, 'install', '--mode=skip-build'], {
      cwd: directory,
      env: process.env,
      encoding: 'utf8',
      timeout: 60_000,
    });
    if (install.error) throw install.error;
    assert.equal(install.status, 0, `${install.stdout}\n${install.stderr}`);
    // The portal supplies Yarn's tsc binary. This canonical alias exists only in the isolated fixture, never real node_modules.
    mkdirSync(path.join(packageRoot, 'node_modules'), { recursive: true });
    symlinkSync(compiler, path.join(packageRoot, 'node_modules', 'typescript'), 'junction');
    execFileSync('git', ['init', '--quiet'], { cwd: directory });
    execFileSync('git', ['config', 'core.autocrlf', 'false'], { cwd: directory });
    execFileSync('git', ['add', '.'], { cwd: directory });
    execFileSync('git', ['-c', 'user.name=Fixture', '-c', 'user.email=fixture@example.invalid', 'commit', '--quiet', '-m', 'fixture'], {
      cwd: directory,
    });
    const output = path.join(directory, 'reports', 'type');
    assert.equal(
      await runReadinessCapture(directory, {
        kind: 'type',
        target: 'win32-paper',
        input: 'all',
        output,
        cwd: directory,
        command: ['node', path.relative(directory, yarn), 'workspace', '@fluentui-react-native/components', 'build', '--force'],
      }),
      0,
    );
    const capture = parseExecutionCapture(JSON.parse(readFileSync(path.join(output, 'execution.json'), 'utf8')));
    assert.equal(capture.before.dirty, false);
    assert.equal(capture.after.dirty, false);
    assert.equal(capture.commandSha256, reportDigest(JSON.stringify(capture.command)));
    assert.equal(capture.reportSha256, reportDigest(capture.report!));
    const selected = { ...control(), typeFiles: ['packages/components/positive.types.test.ts'] };
    const evidence = assessTypeCapture(directory, [selected], capture, { ...environment(), source: capture.before, ci: false });
    assert.equal(evidence.observations.length, 1);
    assert.equal(evidence.observations[0].name, selected.typeFiles[0]);
    assert.equal(evidence.observations[0].outcome, 'passed', evidence.limitations.join('\n'));
  } finally {
    if (previousRc === undefined) delete process.env.YARN_RC_FILENAME;
    else process.env.YARN_RC_FILENAME = previousRc;
  }
});

test('unit collection retains ORIGINAL failed captures and rejects postexecution provenance replacement', () => {
  const env = environment();
  const identity = {
    repository: 'test/repo',
    pullRequest: 1,
    headRepository: 'test/repo',
    headRef: 'test',
    headCommit: 'd'.repeat(40),
    baseCommit: 'e'.repeat(40),
    testedCommit: env.source.commit,
    runId: '123',
    runAttempt: 2,
    inputDigest: env.source.inputDigest,
  };
  const start = { schemaVersion: 1, identity, startedAt: new Date(Date.now() - 2_000).toISOString(), buildId: env.identity!.buildId };
  const execution = { schemaVersion: 1, report: null, context: null, executionFailure: 'Jest failed before producing JSON', exitCode: 1 };
  const captured = { ...execution, identity, collectionStartedAt: start.startedAt };
  const collected = {
    schemaVersion: 1 as const,
    kind: 'unit' as const,
    capture: JSON.stringify(captured),
    execution: JSON.stringify(execution),
    collectionStart: JSON.stringify(start),
  };
  const assessed = assessUnitCollection(root, [control()], collected, env);
  assert.equal(assessed.observations.length, 0);
  assert.ok(assessed.limitations[0].includes('Jest failed'));
  assert.throws(
    () =>
      assessUnitCollection(
        root,
        [control()],
        {
          ...collected,
          capture: JSON.stringify({ ...captured, context: { sourceCommit: 'f'.repeat(40), verified: true } }),
        },
        env,
      ),
    /ORIGINAL/,
  );
});
