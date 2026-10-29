import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { copyFileSync, linkSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, describe, it } from 'node:test';
import { fileURLToPath, pathToFileURL } from 'node:url';

import {
  assessCheckbox,
  checkboxNativeAssertionPath,
  formatAssessmentMarkdown,
  parseEvidenceContext,
  parseNativeReport,
  readCheckboxContract,
  readCheckboxContractFrom,
  readNativeEvidence,
  reportDigest,
  win32StorybookTargetId,
} from './controlAssessment.ts';
import type { AssessmentOptions, EvidenceContext } from './controlAssessment.ts';
import { checkboxJestFixture, desktopEvidenceFixture } from './controlAssessmentFixtures.ts';
import {
  assessmentPackagePath,
  assessmentSpecPath,
  specAssessmentFor,
  splitSpecAssessment,
  updateSpecAssessment,
} from './controlAssessmentSpec.ts';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const contract = readCheckboxContract(root);
const sourceCommit = 'a'.repeat(40);
const platformManifestDigest = 'b'.repeat(64);
const now = new Date('2026-10-21T21:00:00.000Z');
const nativeCase = {
  storyId: 'components-checkbox--default',
  testName: 'toggles native checked state in both directions',
  status: 'passed',
  durationMs: 3687,
};
const direct = { endpoint: 'win32', platformManifestDigest, status: 'passed', tests: [nativeCase] };
const aggregate = {
  schemaVersion: 1,
  endpoint: 'win32',
  platformName: 'windows',
  targetId: 'agenticstorybook-win32',
  runId: 'synthetic-run',
  startedAt: '2026-10-21T19:59:00.000Z',
  finishedAt: '2026-10-21T20:00:00.000Z',
  manifest: { platform: platformManifestDigest, portable: 'c'.repeat(64) },
  status: 'passed',
  tests: [{ storyId: 'ignored-portable-test', status: 'passed' }],
  wdio: [{ ...nativeCase, status: 'skipped', skipReason: 'This test requires physical pointer input.' }],
};
const raw = JSON.stringify(direct);
const context: EvidenceContext = {
  schemaVersion: 1,
  reportSha256: reportDigest(raw),
  sourceCommit,
  buildId: 'synthetic-build',
  contractDigest: contract.digest,
  platformManifestDigest,
  endpoint: 'win32',
  renderer: 'paper',
  targetId: 'agenticstorybook-win32',
  finishedAt: '2026-10-21T20:00:00.000Z',
  physicalClick: true,
};

function options(overrides: Partial<AssessmentOptions> = {}): AssessmentOptions {
  return {
    contract,
    sourceCommit,
    workingTreeDirty: false,
    now,
    report: parseNativeReport(direct),
    reportSha256: reportDigest(raw),
    context,
    expectedBuildId: context.buildId,
    maxAgeHours: 24,
    ...overrides,
  };
}

const fixtures: string[] = [];
function fixture(): string {
  const directory = mkdtempSync(path.join(tmpdir(), 'furn-assessment-'));
  fixtures.push(directory);
  return directory;
}
afterEach(() => {
  for (const directory of fixtures.splice(0)) rmSync(directory, { recursive: true, force: true });
});

describe('Checkbox advisory assessment', () => {
  it('loads six reviewed requirements without converting implemented/reviewed into a maturity stage', () => {
    assert.equal(contract.mappingCurrent, true);
    assert.deepEqual(
      contract.requirements.map(({ id }) => id),
      ['CBX-001', 'CBX-002', 'CBX-003', 'CBX-004', 'CBX-005', 'CBX-006'],
    );
    const report = assessCheckbox(options());
    assert.equal(report.contract.lifecycle, 'implemented');
    assert.equal(report.contract.conformance, 'reviewed');
    assert.equal(report.declaredStatus, null);
    assert.equal(report.approvedStatus, null);
    assert.equal(report.evidenceSupportedStatus, null);
    assert.equal(report.policyStatus, 'pending');
    assert.equal(report.assessmentOutcome, 'insufficient-evidence');
    assert.deepEqual(
      report.requirements.map(({ outcome }) => outcome),
      ['insufficient-evidence', 'partial', 'insufficient-evidence', 'partial', 'insufficient-evidence', 'insufficient-evidence'],
    );
    assert.equal(report.evidence.caseCounts.passed, 1);
    assert.equal(report.requirements.filter(({ check }) => check).length, 2);
    assert.ok(report.requirements.every(({ remainingCoverage }) => remainingCoverage.length > 0));
  });

  describe('desktop-test canonical evidence', () => {
    const smoke = JSON.stringify(aggregate);
    it('computes the same Win32/Paper target identity as the actual upstream configuration resolver', () => {
      const directory = fixture();
      const appRoot = path.join(directory, 'apps', 'storybook');
      mkdirSync(appRoot, { recursive: true });
      const configPath = path.join(appRoot, 'desktop.config.mts');
      writeFileSync(configPath, 'export default { schemaVersion: 1, targets: { win32: { host: { kind: "rex", renderer: "paper" } } } };');
      const resolver = pathToFileURL(path.join(root, 'packages', 'agentic', 'desktop-test', 'src', 'config.ts')).href;
      const result = spawnSync(
        process.execPath,
        [
          '--input-type=module',
          '-e',
          'const { loadDesktopConfig } = await import(process.argv[1]); const { targets } = await loadDesktopConfig(process.argv[2]); console.log(targets.win32.id);',
          resolver,
          configPath,
        ],
        { encoding: 'utf8' },
      );
      assert.equal(result.status, 0, result.stderr);
      assert.equal(win32StorybookTargetId(directory), result.stdout.trim());
    });

    it('binds generated target IDs without treating an arbitrary Win32 instance as the expected host', () => {
      const targetId = `win32-${'1'.repeat(16)}`;
      const { envelope } = desktopEvidenceFixture(JSON.stringify({ ...aggregate, targetId }));
      const report = parseNativeReport(JSON.parse(envelope));
      const bound = parseEvidenceContext({ ...context, reportSha256: reportDigest(envelope), targetId });
      const input = options({ report, reportSha256: reportDigest(envelope), context: bound, expectedTargetId: targetId });
      assert.equal(assessCheckbox(input).evidence.status, 'matched');
      assert.equal(assessCheckbox({ ...input, expectedTargetId: undefined }).evidence.status, 'unverified');
      assert.equal(assessCheckbox({ ...input, expectedTargetId: `win32-${'2'.repeat(16)}` }).evidence.status, 'mismatched');
      assert.equal(assessCheckbox({ ...input, context: { ...bound, targetId: 'agenticstorybook-win32' } }).evidence.status, 'mismatched');
      assert.equal(assessCheckbox({ ...input, context: undefined, expectedTargetId: undefined }).evidence.status, 'unverified');
    });

    it('combines canonical supervisor and smoke evidence without counting navigation as requirement coverage', () => {
      const result = parseNativeReport(JSON.parse(desktopEvidenceFixture(smoke).envelope));
      assert.equal(result.format, 'desktop-test');
      assert.equal(result.harness?.status, 'passed');
      assert.equal(result.cases.length, 1);
      assert.equal(result.cases[0].status, 'skipped');
      assert.equal(result.harness?.retries, 0);
    });

    it('loads a canonical run with its declared companion, preserving both sets of bytes', () => {
      const directory = fixture();
      const { canonical } = desktopEvidenceFixture(smoke);
      const evidence = path.join(directory, 'evidence', 'win32', 'static');
      mkdirSync(evidence, { recursive: true });
      writeFileSync(path.join(directory, 'run.json'), canonical);
      writeFileSync(path.join(evidence, 'run.json'), smoke);
      const content = readNativeEvidence(path.join(directory, 'run.json'));
      assert.equal(JSON.parse(content).desktopRun, canonical);
      assert.equal(JSON.parse(content).storyReport, smoke);
      assert.equal(parseNativeReport(JSON.parse(content)).format, 'desktop-test');
    });

    it('rejects a missing companion instead of silently accepting supervisor success', () => {
      const directory = fixture();
      writeFileSync(path.join(directory, 'run.json'), desktopEvidenceFixture(smoke).canonical);
      assert.throws(() => readNativeEvidence(path.join(directory, 'run.json')), /ENOENT/);
    });

    it('retains cleanup failure even when the Storybook evidence passed', () => {
      const { envelope } = desktopEvidenceFixture(smoke, {
        status: 'failed',
        failures: [{ failureId: 'cleanup', kind: 'cleanup', error: { name: 'Error', message: 'session cleanup failed' } }],
      });
      const result = parseNativeReport(JSON.parse(envelope));
      assert.equal(result.status, 'failed');
      assert.equal(result.harness?.failureCount, 1);
      assert.match(result.error ?? '', /supervisor status: failed/);
    });

    it('preserves unfinished supervisor execution rather than qualifying its recorded cases', () => {
      const result = parseNativeReport(JSON.parse(desktopEvidenceFixture(smoke, { status: 'incomplete' }).envelope));
      assert.equal(result.status, 'failed');
      assert.equal(result.harness?.status, 'incomplete');
    });

    it('does not accept retry/flaky passes as a clean qualifying execution', () => {
      const passedSmoke = JSON.stringify({ ...aggregate, wdio: [nativeCase] });
      const { run } = desktopEvidenceFixture(passedSmoke);
      const retried = run.tests[1];
      retried.attempts.unshift({ ...retried.attempts[0] });
      retried.attempts[1].attempt = 1;
      run.counts.retries = 1;
      const result = parseNativeReport({
        schemaVersion: 1,
        format: 'desktop-test',
        desktopRun: JSON.stringify(run),
        storyReport: passedSmoke,
      });
      assert.equal(result.harness?.retries, 1);
      assert.equal(result.status, 'failed');
      assert.match(result.error ?? '', /Retried or flaky/);
    });

    for (const [name, mutate] of [
      [
        'counts',
        (run: Record<string, unknown>) => {
          run.counts = {};
        },
      ],
      [
        'duplicated artifact',
        (run: Record<string, unknown>) => {
          run.artifacts = [{ path: 'evidence/win32/static/run.json' }, { path: 'evidence\\win32\\static\\run.json' }];
        },
      ],
      [
        'wrong run kind',
        (run: Record<string, unknown>) => {
          run.kind = 'lifecycle';
        },
      ],
      [
        'outside timestamp',
        (run: Record<string, unknown>) => {
          run.startedAt = '2026-10-22T00:00:00.000Z';
        },
      ],
      [
        'invalid schema',
        (run: Record<string, unknown>) => {
          run.schemaVersion = 2;
        },
      ],
    ] as const) {
      it(`rejects inconsistent ${name}`, () => {
        const run: Record<string, unknown> = JSON.parse(desktopEvidenceFixture(smoke).canonical);
        mutate(run);
        assert.throws(() =>
          parseNativeReport({ schemaVersion: 1, format: 'desktop-test', desktopRun: JSON.stringify(run), storyReport: smoke }),
        );
      });
    }

    it('rejects a callback status that contradicts the canonical result', () => {
      const { canonical } = desktopEvidenceFixture(smoke);
      assert.throws(
        () =>
          parseNativeReport({
            schemaVersion: 1,
            format: 'desktop-test',
            desktopRun: canonical,
            storyReport: JSON.stringify({ ...aggregate, wdio: [nativeCase] }),
          }),
        /does not match/,
      );
    });

    it('rejects a nested evidence envelope instead of recursively trusting it as a companion', () => {
      const { canonical, envelope } = desktopEvidenceFixture(smoke);
      assert.throws(
        () =>
          parseNativeReport({
            schemaVersion: 1,
            format: 'desktop-test',
            desktopRun: canonical,
            storyReport: envelope,
          }),
        /companion/,
      );
    });

    it('rejects successful supervisor status when selected work is unfinished', () => {
      const { envelope } = desktopEvidenceFixture(smoke, {
        work: [{ workId: 'unfinished', label: 'selected test cohort', status: 'not-run' }],
      });
      assert.throws(() => parseNativeReport(JSON.parse(envelope)), /incomplete execution/);
    });

    it('rejects a native identity that is inconsistent with its canonical test ID', () => {
      const { run } = desktopEvidenceFixture(smoke);
      run.tests[1].testId = `csf-${'0'.repeat(64)}`;
      assert.throws(
        () =>
          parseNativeReport({
            schemaVersion: 1,
            format: 'desktop-test',
            desktopRun: JSON.stringify(run),
            storyReport: smoke,
          }),
        /authored callback identity/,
      );
    });

    it('accepts the new direct optional-cohort skipped status without calling it a pass', () => {
      const result = parseNativeReport({
        ...direct,
        status: 'skipped',
        tests: [{ ...nativeCase, status: 'skipped', skipReason: 'physical input disabled' }],
      });
      assert.equal(result.cases[0].status, 'skipped');
      assert.equal(result.status, 'failed');
      assert.match(result.error ?? '', /skipped/);
    });
  });

  it('records a raw historical pass without accepting it as current qualification', () => {
    const report = assessCheckbox(options({ context: undefined, expectedBuildId: undefined, maxAgeHours: undefined }));
    assert.equal(report.evidence.status, 'unverified');
    assert.equal(report.requirements[1].check?.recordedOutcome, 'passed');
    assert.equal(report.requirements[1].check?.evidenceOutcome, 'unverified');
    assert.equal(report.requirements[1].outcome, 'insufficient-evidence');
  });

  it('uses aggregate wdio results, not enclosing success or portable tests', () => {
    const report = assessCheckbox(options({ report: parseNativeReport(aggregate), context: undefined }));
    assert.equal(report.evidence.runStatus, 'passed');
    assert.equal(report.evidence.caseCounts.skipped, 1);
    assert.equal(report.evidence.caseCounts.passed, 0);
    assert.equal(report.requirements[1].check?.recordedOutcome, 'skipped');
    assert.match(report.requirements[1].check?.reason ?? '', /physical pointer/);
    assert.equal(report.assessmentOutcome, 'insufficient-evidence');
  });

  it('keeps a matched skip as a skip and never counts it as a pass', () => {
    const report = assessCheckbox(
      options({
        report: parseNativeReport(aggregate),
        context: { ...context, physicalClick: false },
      }),
    );
    assert.equal(report.evidence.status, 'matched');
    assert.equal(report.requirements[1].check?.evidenceOutcome, 'skipped');
    assert.equal(report.requirements[1].outcome, 'insufficient-evidence');
  });

  it('blocks mapped evidence on a case failure without attributing the precise broken requirement', () => {
    const report = assessCheckbox(
      options({
        report: parseNativeReport({ ...direct, status: 'failed', tests: [{ ...nativeCase, status: 'failed', error: 'assertion failed' }] }),
      }),
    );
    assert.equal(report.assessmentOutcome, 'failed');
    assert.equal(report.requirements[1].outcome, 'blocked-by-failure');
    assert.equal(report.requirements[3].outcome, 'blocked-by-failure');
    assert.equal(report.requirements[1].check?.reason, 'assertion failed');
  });

  it('separates runner errors from product assertion failures and does not accept partial-run passes', () => {
    const report = assessCheckbox(options({ report: parseNativeReport({ ...direct, status: 'failed', error: 'driver disconnected' }) }));
    assert.equal(report.assessmentOutcome, 'execution-failed');
    assert.equal(report.evidence.runError, 'driver disconnected');
    assert.equal(report.requirements[1].check?.recordedOutcome, 'passed');
    assert.equal(report.requirements[1].check?.evidenceOutcome, 'unverified');
  });

  for (const report of [
    undefined,
    parseNativeReport({ ...direct, tests: [] }),
    parseNativeReport({ ...direct, tests: [{ ...nativeCase, storyId: 'components-button--default' }] }),
  ]) {
    it(`reports missing coverage for ${report === undefined ? 'absent report' : report.cases.length ? 'unrelated cases' : 'empty cases'}`, () => {
      const result = assessCheckbox(options({ report, context: undefined }));
      assert.equal(result.requirements[1].check?.recordedOutcome, 'not-run');
      assert.equal(result.requirements[1].outcome, 'insufficient-evidence');
    });
  }

  it('detects endpoint and native-host mismatches even without provenance context', () => {
    const report = assessCheckbox(options({ report: parseNativeReport({ ...direct, endpoint: 'windows' }), context: undefined }));
    assert.equal(report.assessmentHealth, 'blocked');
    assert.equal(report.evidence.status, 'mismatched');
    const host = assessCheckbox(options({ report: parseNativeReport({ ...aggregate, targetId: 'different-host' }), context: undefined }));
    assert.equal(host.evidence.status, 'mismatched');
  });

  for (const [field, value] of Object.entries({
    reportSha256: '1'.repeat(64),
    sourceCommit: '2'.repeat(40),
    contractDigest: '3'.repeat(64),
    platformManifestDigest: '4'.repeat(64),
    buildId: 'another-build',
    finishedAt: '2026-10-22T00:00:00.000Z',
    physicalClick: false,
  })) {
    it(`rejects mismatched ${field} provenance`, () => {
      const report = assessCheckbox(options({ context: parseEvidenceContext({ ...context, [field]: value }) }));
      assert.equal(report.evidence.status, 'mismatched');
      assert.equal(report.requirements[1].check?.evidenceOutcome, 'mismatched');
      assert.equal(report.evidenceSupportedStatus, null);
    });
  }

  it('does not accept a context timestamp that contradicts the aggregate', () => {
    const report = assessCheckbox(
      options({ report: parseNativeReport(aggregate), context: { ...context, finishedAt: '2026-10-21T20:01:00.000Z' } }),
    );
    assert.equal(report.evidence.status, 'mismatched');
  });

  it('requires explicit freshness/build policy and a commit-identifiable working tree', () => {
    for (const missing of [{ maxAgeHours: undefined }, { expectedBuildId: undefined }, { workingTreeDirty: true }]) {
      assert.equal(assessCheckbox(options(missing)).evidence.status, 'unverified');
    }
    assert.equal(assessCheckbox(options({ maxAgeHours: 1 })).evidence.status, 'matched');
    const stale = assessCheckbox(options({ maxAgeHours: 0.5 }));
    assert.equal(stale.assessmentHealth, 'stale');
    assert.equal(stale.requirements[1].check?.evidenceOutcome, 'stale');
    assert.equal(stale.evidenceSupportedStatus, null);
  });

  it('invalidates changed reviewed inputs and never promotes an unmapped requirement', () => {
    const report = assessCheckbox(
      options({
        contract: {
          ...contract,
          mappingCurrent: false,
          requirements: [...contract.requirements, { id: 'CBX-007', summary: 'New contract requirement', declaredEvidence: [] }],
        },
      }),
    );
    assert.equal(report.assessmentHealth, 'stale');
    assert.equal(report.requirements[1].check?.evidenceOutcome, 'stale');
    assert.equal(report.requirements[6].check, null);
    assert.equal(report.requirements[6].outcome, 'insufficient-evidence');
  });

  it('fingerprints normalized contract/story content and detects a changed source file', () => {
    const directory = fixture();
    const component = 'packages/agentic/components/src/components/checkbox';
    for (const file of [
      'SPEC.md',
      'spec/source.json',
      'spec/interaction.md',
      'spec/accessibility.md',
      'spec/tokens.yaml',
      'spec/usage.md',
      'checkbox.stories.tsx',
    ]) {
      const destination = path.join(directory, component, file);
      mkdirSync(path.dirname(destination), { recursive: true });
      copyFileSync(path.join(root, component, file), destination);
      writeFileSync(destination, readFileSync(destination, 'utf8').replace(/\r?\n/g, '\r\n'));
    }
    const helper = path.join(directory, checkboxNativeAssertionPath);
    mkdirSync(path.dirname(helper), { recursive: true });
    writeFileSync(helper, readFileSync(path.join(root, checkboxNativeAssertionPath), 'utf8').replace(/\r?\n/g, '\r\n'));
    assert.equal(readCheckboxContract(directory).mappingCurrent, true);
    writeFileSync(path.join(directory, component, 'checkbox.stories.tsx'), '// changed test\n');
    assert.equal(readCheckboxContract(directory).mappingCurrent, false);
  });

  it('invalidates native mappings when only the assertion-bearing helper changes', () => {
    const changed = readCheckboxContractFrom((file) => {
      const content = readFileSync(path.join(root, file), 'utf8');
      return file === checkboxNativeAssertionPath ? `${content}\n// changed native assertion\n` : content;
    });
    assert.notEqual(changed.digest, contract.digest);
    assert.equal(changed.mappingCurrent, false);
  });

  it('produces deterministic decisions and escapes untrusted Markdown', () => {
    assert.deepEqual(assessCheckbox(options()), assessCheckbox(options()));
    for (const tag of ['script', 'SCRIPT', 'ScRiPt']) {
      const report = assessCheckbox(
        options({
          report: parseNativeReport({
            ...direct,
            tests: [{ ...nativeCase, status: 'skipped', skipReason: `<${tag}>|[link](bad)\nsecond line` }],
          }),
          context: undefined,
        }),
      );
      const output = formatAssessmentMarkdown(report);
      assert.match(output, /not established/);
      assert.ok(output.includes(`\\<${tag}\\>\\|\\[link\\]`));
      assert.equal(output.includes(`<${tag}>`), false);
    }
  });
});

describe('native evidence validation', () => {
  const malformed: [string, unknown][] = [
    ['non-object input', null],
    ['missing case array', { ...direct, tests: undefined }],
    ['unknown case status', { ...direct, tests: [{ ...nativeCase, status: 'pending' }] }],
    ['unknown root status', { ...direct, status: 'success' }],
    ['bad platform digest', { ...direct, platformManifestDigest: 'bad' }],
    ['negative duration', { ...direct, tests: [{ ...nativeCase, durationMs: -1 }] }],
    ['non-finite duration', { ...direct, tests: [{ ...nativeCase, durationMs: Infinity }] }],
    ['missing duration', { ...direct, tests: [{ ...nativeCase, durationMs: undefined }] }],
    ['duplicate native identity', { ...direct, tests: [nativeCase, nativeCase] }],
    ['missing skip reason', { ...direct, tests: [{ ...nativeCase, status: 'skipped' }] }],
    ['invalid error', { ...direct, status: 'failed', error: {} }],
    ['invalid case error', { ...direct, tests: [{ ...nativeCase, error: {} }] }],
    ['passed report with failed case', { ...direct, tests: [{ ...nativeCase, status: 'failed' }] }],
    ['passed report with runner error', { ...direct, error: 'driver failed' }],
    ['passed case with error', { ...direct, tests: [{ ...nativeCase, error: 'failed' }] }],
    ['passed case with evidence error', { ...direct, tests: [{ ...nativeCase, evidenceErrors: ['capture failed'] }] }],
    ['invalid evidence errors', { ...direct, tests: [{ ...nativeCase, evidenceErrors: 'capture failed' }] }],
    ['unknown smoke schema', { ...aggregate, schemaVersion: 2 }],
    ['missing smoke wdio', { ...aggregate, wdio: undefined }],
    ['bad smoke digest', { ...aggregate, manifest: { platform: 'bad', portable: 'c'.repeat(64) } }],
    ['contradictory smoke digest', { ...aggregate, platformManifestDigest: 'd'.repeat(64) }],
    ['smoke time reversal', { ...aggregate, startedAt: '2026-10-22T00:00:00.000Z' }],
    ['impossible date', { ...aggregate, finishedAt: '2026-02-30T20:00:00.000Z' }],
  ];
  for (const [label, value] of malformed) it(`rejects ${label}`, () => assert.throws(() => parseNativeReport(value)));

  for (const [field, value] of Object.entries({
    schemaVersion: 2,
    reportSha256: 'bad',
    sourceCommit: 'HEAD',
    buildId: '',
    contractDigest: 'bad',
    platformManifestDigest: 'bad',
    endpoint: 'windows',
    renderer: 'fabric',
    targetId: 'another-host',
    finishedAt: '2026-02-30T20:00:00.000Z',
    physicalClick: 'true',
  })) {
    it(`rejects invalid context ${field}`, () => assert.throws(() => parseEvidenceContext({ ...context, [field]: value })));
  }
  it('round-trips a valid execution context', () => assert.deepEqual(parseEvidenceContext(context), context));
  it('rejects context without report, invalid target identity, and invalid age options', () => {
    assert.throws(() => assessCheckbox(options({ report: undefined })));
    assert.throws(() => assessCheckbox(options({ sourceCommit: 'HEAD' })));
    for (const maxAgeHours of [0, -1, NaN, Infinity]) assert.throws(() => assessCheckbox(options({ maxAgeHours })));
  });
});

describe('assess-control command', () => {
  function run(args: string[]) {
    return spawnSync(process.execPath, [path.join(root, 'scripts', 'src', 'cli.ts'), 'assess-control', ...args], {
      cwd: root,
      encoding: 'utf8',
    });
  }

  it('consumes runtime unit JSON without inventing provenance, and protects unit inputs from overwrite', () => {
    const directory = fixture();
    const input = path.join(directory, 'jest.json');
    const raw = JSON.stringify(checkboxJestFixture());
    writeFileSync(input, raw);
    const result = run(['--component', 'checkbox', '--unit-evidence', input, '--output', directory]);
    assert.equal(result.status, 0, result.stderr || result.stdout);
    const report = JSON.parse(readFileSync(path.join(directory, 'assessment.json'), 'utf8'));
    assert.equal(report.unitEvidence.caseCounts.passed, 42);
    assert.equal(report.unitEvidence.status, 'unverified');
    assert.equal(report.evidence.status, 'missing');
    assert.equal(report.inputs.unitReport, input);
    const other = fixture();
    linkSync(input, path.join(other, 'assessment.json'));
    assert.notEqual(run(['--component', 'checkbox', '--unit-evidence', input, '--output', other]).status, 0);
    assert.equal(readFileSync(input, 'utf8'), raw);
    assert.notEqual(run(['--component', 'checkbox', '--run-unit-tests', '--unit-evidence', input]).status, 0);
    assert.notEqual(run(['--component', 'checkbox', '--unit-context', input]).status, 0);
    assert.notEqual(run(['--component', 'checkbox', '--unit-build-id', 'missing-report']).status, 0);
  });

  it('persists readable/JSON reports and leaves input bytes unchanged', () => {
    const directory = fixture();
    const input = path.join(directory, 'run.json');
    writeFileSync(input, JSON.stringify(aggregate));
    const before = readFileSync(input, 'utf8');
    const output = path.join(directory, 'reports');
    const result = run(['--component', 'checkbox', '--evidence', input, '--output', output]);
    assert.equal(result.status, 0, result.stderr || result.stdout);
    assert.match(result.stdout, /insufficient-evidence; readiness not established/);
    const report = JSON.parse(readFileSync(path.join(output, 'assessment.json'), 'utf8'));
    assert.equal(report.requirements[1].check.recordedOutcome, 'skipped');
    assert.equal(report.evidenceSupportedStatus, null);
    assert.match(readFileSync(path.join(output, 'assessment.md'), 'utf8'), /physical pointer input/);
    assert.equal(readFileSync(input, 'utf8'), before);
  });

  it('produces an explicit evidence inventory when no report is supplied', () => {
    const directory = fixture();
    const result = run(['--component', 'checkbox', '--output', directory]);
    assert.equal(result.status, 0, result.stderr || result.stdout);
    assert.equal(JSON.parse(readFileSync(path.join(directory, 'assessment.json'), 'utf8')).evidence.status, 'missing');
  });

  it('fails for malformed/missing input, unsupported controls, and attempted input overwrite', () => {
    const directory = fixture();
    const input = path.join(directory, 'assessment.json');
    for (const content of ['{', raw]) {
      writeFileSync(input, content);
      const result = run(['--component', 'checkbox', '--evidence', input, '--output', directory]);
      assert.notEqual(result.status, 0);
      assert.equal(readFileSync(input, 'utf8'), content);
    }
    assert.notEqual(run(['--component', 'checkbox', '--evidence', path.join(directory, 'missing.json'), '--output', directory]).status, 0);
    assert.notEqual(run(['--component', 'button', '--output', directory]).status, 0);
  });

  it('does not overwrite evidence through a different hard-linked filename', () => {
    const directory = fixture();
    const input = path.join(directory, 'run.json');
    writeFileSync(input, raw);
    linkSync(input, path.join(directory, 'assessment.json'));
    const result = run(['--component', 'checkbox', '--evidence', input, '--output', directory]);
    assert.notEqual(result.status, 0);
    assert.equal(readFileSync(input, 'utf8'), raw);
  });

  it('rejects JSON and Markdown outputs that alias one another', () => {
    const directory = fixture();
    const output = path.join(directory, 'assessment.json');
    writeFileSync(output, 'existing report');
    linkSync(output, path.join(directory, 'assessment.md'));
    const result = run(['--component', 'checkbox', '--output', directory]);
    assert.notEqual(result.status, 0);
    assert.equal(readFileSync(output, 'utf8'), 'existing report');
  });

  it('updates SPEC only on explicit opt-in, preserves its contract and records honest local identity', () => {
    const directory = fixture();
    const checkout = path.join(directory, 'repo');
    mkdirSync(checkout);
    const invokeGit = (...args: string[]) => {
      const result = spawnSync('git', args, { cwd: checkout, encoding: 'utf8' });
      assert.equal(result.status, 0, result.stderr || result.stdout);
      return result.stdout.trim();
    };
    invokeGit('init', '-q');
    invokeGit('config', 'core.autocrlf', 'false');
    const component = path.dirname(assessmentSpecPath);
    for (const file of [
      'SPEC.md',
      'spec/source.json',
      'spec/interaction.md',
      'spec/accessibility.md',
      'spec/tokens.yaml',
      'spec/usage.md',
      'checkbox.stories.tsx',
    ]) {
      const target = path.join(checkout, component, file);
      mkdirSync(path.dirname(target), { recursive: true });
      copyFileSync(path.join(root, component, file), target);
    }
    const helper = path.join(checkout, checkboxNativeAssertionPath);
    mkdirSync(path.dirname(helper), { recursive: true });
    copyFileSync(path.join(root, checkboxNativeAssertionPath), helper);
    writeFileSync(path.join(checkout, assessmentPackagePath), JSON.stringify({ version: '1.2.3' }));
    invokeGit('add', '.');
    invokeGit(
      '-c',
      'user.name=Fixture',
      '-c',
      'user.email=fixture@example.invalid',
      '-c',
      'commit.gpgsign=false',
      'commit',
      '-qm',
      'Fixture',
    );
    const revision = invokeGit('rev-parse', 'HEAD');
    const specPath = path.join(checkout, assessmentSpecPath);
    const original = readFileSync(specPath, 'utf8');
    const input = path.join(directory, 'run.json');
    writeFileSync(input, raw);
    const localRun = (extra: string[] = []) =>
      spawnSync(
        process.execPath,
        [
          path.join(root, 'scripts', 'src', 'cli.ts'),
          'assess-control',
          '--component',
          'checkbox',
          '--evidence',
          input,
          '--output',
          path.join(directory, 'output'),
          ...extra,
        ],
        { cwd: checkout, encoding: 'utf8' },
      );
    const ordinary = localRun();
    assert.equal(ordinary.status, 0, ordinary.stderr || ordinary.stdout);
    assert.equal(readFileSync(specPath, 'utf8'), original);
    assert.equal(invokeGit('status', '--porcelain'), '');
    writeFileSync(path.join(checkout, 'uncommitted.txt'), 'Local source is dirty.\n');
    const update = localRun(['--update-spec']);
    assert.equal(update.status, 0, update.stderr || update.stdout);
    const snapshot = splitSpecAssessment(readFileSync(specPath, 'utf8'));
    assert.equal(snapshot.contract, splitSpecAssessment(original).contract);
    assert.equal(snapshot.assessment?.packageVersion, '1.2.3');
    assert.equal(snapshot.assessment?.sourceCommit, revision);
    assert.equal(snapshot.assessment?.testedCommit, null);
    assert.equal(snapshot.assessment?.dirty, true);
    assert.equal(snapshot.assessment?.provenance, 'unverified');
    assert.equal(snapshot.assessment?.outcome, 'insufficient-evidence');
    const summary = path.join(path.dirname(specPath), 'assessment', 'ASSESSMENT.md');
    assert.match(readFileSync(summary, 'utf8'), /Not a bound CI publication/);
    assert.equal(readFileSync(input, 'utf8'), raw);
    linkSync(summary, path.join(directory, 'summary-alias.md'));
    const linked = localRun(['--update-spec']);
    assert.notEqual(linked.status, 0);
    assert.match(linked.stderr || linked.stdout, /regular, unlinked/);
    assert.equal(splitSpecAssessment(readFileSync(specPath, 'utf8')).contract, splitSpecAssessment(original).contract);
  });
});

describe('generated SPEC assessment snapshot', () => {
  const original = splitSpecAssessment(readFileSync(path.join(root, assessmentSpecPath), 'utf8')).contract;
  const snapshot = specAssessmentFor(assessCheckbox(options()), '0.7.0');

  for (const eol of ['\n', '\r\n']) {
    it(`preserves all contract bytes and lifecycle with ${JSON.stringify(eol)} line endings`, () => {
      const spec = original.replace(/\r\n/g, '\n').replace(/\n/g, eol);
      const updated = updateSpecAssessment(spec, snapshot);
      assert.deepEqual(splitSpecAssessment(updated), { contract: spec, assessment: snapshot });
      assert.equal(updateSpecAssessment(updated, snapshot), updated);
      assert.equal((updated.match(/status: implemented/g) ?? []).length, 1);
      assert.match(updated, /assessment-stage: 'not-determined'/);
    });
  }

  it('keeps the reviewed mapping digest stable only for the generated block', () => {
    const read = (spec: string) =>
      readCheckboxContractFrom((file) => (file === assessmentSpecPath ? spec : readFileSync(path.join(root, file), 'utf8')));
    const generated = updateSpecAssessment(original, snapshot);
    assert.equal(read(generated).digest, contract.digest);
    assert.equal(read(generated).mappingCurrent, true);
    assert.notEqual(read(`${generated}\nNew human contract requirement.\n`).digest, contract.digest);
    assert.equal(read(`${generated}\nNew human contract requirement.\n`).mappingCurrent, false);
    assert.notEqual(read(generated.replace('status: implemented', 'status: contract-reviewed')).digest, contract.digest);
  });

  it('does not invent a tested commit from missing, dirty, mismatched, or stale evidence', () => {
    for (const report of [
      assessCheckbox(options({ report: undefined, context: undefined, reportSha256: undefined })),
      assessCheckbox(options({ workingTreeDirty: true })),
      assessCheckbox(options({ context: { ...context, sourceCommit: 'b'.repeat(40) } })),
      assessCheckbox(options({ maxAgeHours: 0.01 })),
    ]) {
      const metadata = specAssessmentFor(report, '0.7.0');
      assert.equal(metadata.testedCommit, null);
      assert.equal(metadata.sourceCommit, sourceCommit);
      assert.equal(metadata.provenance, report.evidence.status);
      assert.equal(metadata.health, report.assessmentHealth);
      assert.equal(metadata.outcome, report.assessmentOutcome);
      assert.match(updateSpecAssessment(original, metadata), /assessment-tested-commit: null/);
    }
    assert.equal(snapshot.testedCommit, sourceCommit);
  });

  it('preserves native assertion and execution failures rather than promoting a maturity stage', () => {
    const failure = { ...direct, status: 'failed', tests: [{ ...nativeCase, status: 'failed', error: 'Native assertion failed.' }] };
    const bytes = JSON.stringify(failure);
    const failed = assessCheckbox(
      options({
        report: parseNativeReport(failure),
        reportSha256: reportDigest(bytes),
        context: { ...context, reportSha256: reportDigest(bytes) },
      }),
    );
    assert.equal(specAssessmentFor(failed, '0.7.0').outcome, 'failed');
    const blocked = assessCheckbox(options({ executionFailure: 'Native helper exited unexpectedly.' }));
    assert.equal(specAssessmentFor(blocked, '0.7.0').outcome, 'execution-failed');
  });

  it('rejects malformed, duplicated, unknown, misplaced, noncanonical and falsely bound metadata', () => {
    const valid = updateSpecAssessment(original, snapshot);
    const malformed = [
      original.replace('status: implemented', 'status: implemented\nassessment-outcome: "failed"'),
      valid.replace('assessment-schema: 1', 'assessment-schema: 2'),
      valid.replace('assessment-schema: 1', 'assessment-schema: 1\nassessment-schema: 1'),
      valid.replace('assessment-schema: 1', 'assessment-schema: 1\nassessment-extra: "arbitrary contract content"'),
      valid.replace("assessment-outcome: 'insufficient-evidence'", "assessment-outcome: 'production-ready'"),
      valid.replace("assessment-stage: 'not-determined'", "assessment-stage: 'beta'"),
      valid.replace("assessment-package-version: '0.7.0'", "assessment-package-version: '0.7.0'\ninjected: true"),
      valid.replace("assessment-generated-at: '2026-10-21T21:00:00.000Z'", "assessment-generated-at: '2026-02-30T21:00:00.000Z'"),
      valid.replace('assessment-dirty: false', 'assessment-dirty: true'),
      valid.replace('assessment-tested-commit:', 'assessment-wrong-commit:'),
      valid.replace('# furn-assessment:end', ''),
      `${valid}\n# furn-assessment:begin\n`,
      `${original}\n# furn-assessment:begin\n# furn-assessment:end\n`,
      valid.replace('assessment-schema: 1', 'assessment-schema:  1'),
      valid.replace("assessment-target: 'win32-paper-storybook'", "assessment-target: 'windows-fabric-storybook'"),
      valid.replace("assessment-report: './assessment/ASSESSMENT.md'", "assessment-report: '../other-file.md'"),
      valid.replace('assessment-schema: 1', 'assessment-schema: 1\n__proto__: {"assessment-schema":1}'),
    ];
    for (const content of malformed) assert.throws(() => splitSpecAssessment(content));
    assert.throws(() => updateSpecAssessment('No front matter', snapshot), /front matter/);
    assert.throws(() => updateSpecAssessment('---\nunterminated', snapshot), /unterminated/);
    assert.throws(() => updateSpecAssessment(original, { ...snapshot, packageVersion: 'not-a-version' }), /identity/);
    assert.throws(() => updateSpecAssessment(original, { ...snapshot, testedCommit: null }), /matched, clean/);
  });
});
