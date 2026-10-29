import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';

import { assessCheckbox, formatAssessmentMarkdown, parseNativeReport, readCheckboxContract, reportDigest } from './controlAssessment.ts';
import type { AssessmentOptions } from './controlAssessment.ts';
import { checkboxJestFixture, componentJestFixture } from './controlAssessmentFixtures.ts';
import { specAssessmentFor } from './controlAssessmentSpec.ts';
import {
  checkboxUnitCases,
  checkboxUnitTestPath,
  parseCheckboxJest,
  parseUnitContext,
  readCheckboxUnitMappingFrom,
  unitMappingFiles,
} from './controlAssessmentUnit.ts';
import { runCheckboxUnitTests, runJestWithUnitCapture } from './controlAssessmentUnitExecution.ts';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const read = (file: string) => readFileSync(path.join(root, file), 'utf8');
const contract = readCheckboxContract(root);
const mapping = readCheckboxUnitMappingFrom(read);
const sourceCommit = 'a'.repeat(40);
const now = new Date('2026-10-21T20:00:03.000Z');
const directories: string[] = [];

function options(data = checkboxJestFixture()): AssessmentOptions {
  const report = JSON.stringify(data);
  return {
    contract,
    sourceCommit,
    workingTreeDirty: false,
    now,
    maxAgeHours: 24,
    unit: {
      mapping,
      report,
      expectedBuildId: 'synthetic-unit-build',
      context: parseUnitContext({
        schemaVersion: 1,
        platform: 'macos',
        sourceCommit,
        workingTreeDirty: false,
        buildId: 'synthetic-unit-build',
        contractDigest: contract.digest,
        mappingDigest: mapping.digest,
        reportSha256: reportDigest(report),
        startedAt: '2026-10-21T20:00:00.000Z',
        finishedAt: '2026-10-21T20:00:02.000Z',
        exitCode: 0,
      }),
    },
  };
}

afterEach(() => {
  for (const directory of directories.splice(0)) rmSync(directory, { recursive: true, force: true });
});

describe('Checkbox JavaScript unit evidence', () => {
  it('maps Checkbox from a complete existing package report without counting its type suite', () => {
    const parsed = parseCheckboxJest(JSON.stringify(componentJestFixture()));
    assert.equal(parsed.packageSuites, 2);
    assert.equal(parsed.packageCounts.passed, 43);
    assert.equal(parsed.counts.passed, 42);
    assert.equal(parsed.entries.length, 42);
    const report = assessCheckbox(options(componentJestFixture()));
    assert.equal(report.unitEvidence.outcome, 'passed');
    assert.equal(report.requirements[5].outcome, 'insufficient-evidence');
    assert.equal(specAssessmentFor(report, '0.7.0').testedCommit, null);
  });

  it('counts duplicate titles in unrelated parameterized suites without using them as Checkbox identities', () => {
    for (const failed of [false, true]) {
      const data = componentJestFixture();
      const other = data.testResults[1];
      other.name = 'packages/agentic/components/src/components/menu-button/menu-button.test.tsx';
      other.assertionResults.push({ ...other.assertionResults[0], failureMessages: [] });
      data.numTotalTests++;
      data.numPassedTests++;
      if (failed) {
        other.assertionResults[1].status = 'failed';
        other.assertionResults[1].failureMessages.push('Synthetic unrelated duplicate-title failure');
        other.status = 'failed';
        data.success = false;
        data.numPassedTests--;
        data.numFailedTests++;
        data.numPassedTestSuites--;
        data.numFailedTestSuites++;
      }
      const report = assessCheckbox(options(data));
      assert.equal(report.unitEvidence.caseCounts.passed, 42);
      assert.equal(report.unitEvidence.checks.length, 42);
      assert.equal(report.unitEvidence.unmappedCases.length, 0);
      assert.deepEqual(report.unitEvidence.packageCounts, { passed: failed ? 43 : 44, failed: failed ? 1 : 0, skipped: 0 });
      assert.equal(report.unitEvidence.outcome, failed ? 'execution-failed' : 'passed');
    }
  });

  it('retains a failed enclosing package run without attributing another suite failure to Checkbox', () => {
    const data = componentJestFixture();
    data.success = false;
    data.numPassedTests--;
    data.numFailedTests++;
    data.numPassedTestSuites--;
    data.numFailedTestSuites++;
    data.testResults[1].status = 'failed';
    data.testResults[1].assertionResults[0].status = 'failed';
    data.testResults[1].assertionResults[0].failureMessages.push('Synthetic other-suite failure');
    const report = assessCheckbox(options(data));
    assert.equal(report.unitEvidence.packageCounts!.failed, 1);
    assert.equal(report.unitEvidence.caseCounts.failed, 0);
    assert.equal(report.unitEvidence.caseCounts.passed, 42);
    assert.equal(report.unitEvidence.outcome, 'execution-failed');
    assert.ok(report.requirements.every(({ outcome }) => outcome === 'insufficient-evidence'));
  });

  it('reviews all 42 exact cases but excludes other-platform actions and macOS focus from Win32 coverage', () => {
    assert.equal(mapping.current, true);
    assert.equal(checkboxUnitCases.length, 42);
    assert.equal(new Set(checkboxUnitCases.map(({ fullName }) => fullName)).size, 42);
    const report = assessCheckbox(options());
    assert.equal(report.schemaVersion, 2);
    assert.equal(report.unitEvidence.status, 'matched');
    assert.equal(report.unitEvidence.outcome, 'passed');
    assert.equal(report.unitEvidence.caseCounts.passed, 42);
    assert.equal(report.unitEvidence.checks.filter(({ requirements }) => requirements.length === 0).length, 17);
    assert.deepEqual(
      report.requirements.map(({ outcome }) => outcome),
      ['partial', 'partial', 'partial', 'partial', 'partial', 'insufficient-evidence'],
    );
    assert.deepEqual(report.requirements[5].unitChecks, []);
    assert.equal(report.evidence.status, 'missing');
    assert.equal(report.assessmentOutcome, 'insufficient-evidence');
    assert.equal(report.evidenceSupportedStatus, null);
    assert.equal(report.approvedStatus, null);
    assert.equal(specAssessmentFor(report, '0.7.0').testedCommit, null);
    const markdown = formatAssessmentMarkdown(report);
    assert.match(markdown, /macOS Jest mock/);
    assert.match(markdown, /not native Win32/);
    assert.match(markdown, /Not mapped to Win32/);
    assert.match(markdown, /0 \/ 0 mapped/);
  });

  it('pins assertion and mock configuration bytes, not merely familiar test names', () => {
    for (const changed of unitMappingFiles) {
      assert.equal(
        readCheckboxUnitMappingFrom((file) => read(file) + (file === changed ? '\n// changed assertion or configuration\n' : '')).current,
        false,
      );
    }
    assert.equal(readCheckboxUnitMappingFrom((file) => read(file).replace(/\r?\n/g, '\r\n')).current, true);
    assert.equal(
      readCheckboxUnitMappingFrom((file) =>
        file.endsWith('/package.json') ? JSON.stringify({ ...JSON.parse(read(file)), furn: { jestPlatform: 'win32' } }) : read(file),
      ).current,
      false,
    );
    const input = options();
    input.unit!.mapping = { ...mapping, current: false };
    const report = assessCheckbox(input);
    assert.equal(report.assessmentHealth, 'stale');
    assert.equal(report.unitEvidence.outcome, 'stale');
    assert.ok(report.unitEvidence.checks.every(({ evidenceOutcome }) => evidenceOutcome === 'stale'));
  });

  it('keeps a passing suite without execution context unverified', () => {
    const input = options();
    input.unit!.context = undefined;
    const report = assessCheckbox(input);
    assert.equal(report.unitEvidence.status, 'unverified');
    assert.equal(report.unitEvidence.caseCounts.passed, 42);
    assert.ok(report.requirements.every(({ outcome }) => outcome === 'insufficient-evidence'));
  });

  for (const missing of ['dirty target', 'dirty execution', 'build', 'age'] as const) {
    it(`does not qualify unit evidence with ${missing}`, () => {
      const input = options();
      if (missing === 'dirty target') input.workingTreeDirty = true;
      if (missing === 'dirty execution') input.unit!.context!.workingTreeDirty = true;
      if (missing === 'build') input.unit!.expectedBuildId = undefined;
      if (missing === 'age') input.maxAgeHours = undefined;
      assert.equal(assessCheckbox(input).unitEvidence.status, 'unverified');
    });
  }

  for (const field of ['sourceCommit', 'buildId', 'contractDigest', 'mappingDigest', 'reportSha256', 'startedAt', 'finishedAt'] as const) {
    it(`blocks mismatched unit ${field}`, () => {
      const input = options();
      const context = input.unit!.context!;
      if (field === 'startedAt') context.startedAt = '2026-10-21T20:00:00.900Z';
      else if (field === 'finishedAt') context.finishedAt = '2026-10-21T20:01:00.000Z';
      else context[field] = field === 'buildId' ? 'different-build' : 'f'.repeat(field === 'sourceCommit' ? 40 : 64);
      const report = assessCheckbox(input);
      assert.equal(report.unitEvidence.status, 'mismatched');
      assert.equal(report.assessmentHealth, 'blocked');
      assert.ok(report.requirements.every(({ outcome }) => outcome === 'insufficient-evidence'));
    });
  }

  it('preserves stale execution and contract mapping state independently', () => {
    const input = options();
    input.now = new Date('2026-10-23T20:00:00.000Z');
    assert.equal(assessCheckbox(input).unitEvidence.status, 'stale');
    input.now = now;
    input.contract = { ...contract, mappingCurrent: false };
    const report = assessCheckbox(input);
    assert.equal(report.assessmentHealth, 'stale');
    assert.ok(report.unitEvidence.checks.every(({ evidenceOutcome }) => evidenceOutcome === 'stale'));
  });

  it('does not invent a passing default assertion when it is missing or replaced by an unmapped name', () => {
    for (const replace of [false, true]) {
      const data = checkboxJestFixture();
      if (replace) {
        Object.assign(data.testResults[0].assertionResults[0], { fullName: 'Checkbox different assertion', title: 'different assertion' });
      } else {
        data.testResults[0].assertionResults.shift();
        data.numTotalTests--;
        data.numPassedTests--;
      }
      const report = assessCheckbox(options(data));
      assert.equal(report.requirements[0].outcome, 'insufficient-evidence');
      assert.equal(report.unitEvidence.checks[0].recordedOutcome, 'not-run');
      assert.equal(report.unitEvidence.unmappedCases.length, replace ? 1 : 0);
    }
  });

  it('keeps skipped and todo assertions distinct from passing execution', () => {
    for (const status of ['pending', 'todo']) {
      const data = checkboxJestFixture();
      data.testResults[0].assertionResults[0].status = status;
      data.numPassedTests--;
      if (status === 'todo') data.numTodoTests++;
      else data.numPendingTests++;
      const report = assessCheckbox(options(data));
      assert.equal(report.unitEvidence.caseCounts.skipped, 1);
      assert.equal(report.unitEvidence.checks[0].evidenceOutcome, 'skipped');
      assert.equal(report.requirements[0].outcome, 'insufficient-evidence');
    }
  });

  it('does not call an all-skipped suite passed', () => {
    const data = checkboxJestFixture();
    data.testResults[0].status = 'skipped';
    data.numPassedTestSuites = 0;
    data.numPendingTestSuites = 1;
    data.testResults[0].startTime = 0;
    data.testResults[0].endTime = 0;
    for (const entry of data.testResults[0].assertionResults) entry.status = 'pending';
    data.numPassedTests = 0;
    data.numPendingTests = 42;
    const report = assessCheckbox(options(data));
    assert.equal(report.unitEvidence.outcome, 'skipped');
    assert.ok(report.requirements.every(({ outcome }) => outcome === 'insufficient-evidence'));
  });

  it('blocks mapped failures and never accepts other passes from the enclosing failed unit command', () => {
    const data = checkboxJestFixture();
    const entry = data.testResults[0].assertionResults.find(({ fullName }) => fullName.includes('disables interaction'))!;
    entry.status = 'failed';
    entry.failureMessages = ['Synthetic assertion failure'];
    data.success = false;
    data.testResults[0].status = 'failed';
    data.numPassedTestSuites = 0;
    data.numFailedTestSuites = 1;
    data.numPassedTests--;
    data.numFailedTests++;
    const report = assessCheckbox(options(data));
    assert.equal(report.unitEvidence.outcome, 'failed');
    assert.equal(report.assessmentOutcome, 'failed');
    assert.equal(report.requirements[1].outcome, 'blocked-by-failure');
    assert.equal(report.requirements[3].outcome, 'blocked-by-failure');
    assert.equal(report.requirements[4].outcome, 'insufficient-evidence');
    assert.match(formatAssessmentMarkdown(report), /Synthetic assertion failure/);
    assert.equal(specAssessmentFor(report, '0.7.0').outcome, 'failed');
  });

  it('retains runner/parent-command failure even if all recorded assertions passed', () => {
    for (const failure of ['interrupted', 'unsuccessful', 'parent command', 'exit code']) {
      const data = checkboxJestFixture();
      if (failure === 'interrupted') data.wasInterrupted = true;
      if (failure === 'unsuccessful') data.success = false;
      const input = options(data);
      if (failure === 'parent command') input.unit!.executionFailure = 'Declared workspace script failed.';
      if (failure === 'exit code') input.unit!.context!.exitCode = 1;
      const report = assessCheckbox(input);
      assert.equal(report.unitEvidence.outcome, 'execution-failed');
      assert.equal(report.assessmentOutcome, 'execution-failed');
      assert.ok(report.requirements.every(({ outcome }) => outcome === 'insufficient-evidence'));
    }
  });

  it('does not let passing unit evidence hide a bound native failure', () => {
    const input = options();
    const native = JSON.stringify({
      endpoint: 'win32',
      platformManifestDigest: 'b'.repeat(64),
      status: 'failed',
      tests: [
        {
          storyId: 'components-checkbox--default',
          testName: 'toggles native checked state in both directions',
          status: 'failed',
          durationMs: 1,
        },
      ],
    });
    input.report = parseNativeReport(JSON.parse(native));
    input.reportSha256 = reportDigest(native);
    input.expectedBuildId = 'synthetic-native-build';
    input.context = {
      schemaVersion: 1,
      reportSha256: input.reportSha256,
      sourceCommit,
      buildId: input.expectedBuildId,
      contractDigest: contract.digest,
      platformManifestDigest: 'b'.repeat(64),
      endpoint: 'win32',
      renderer: 'paper',
      targetId: 'agenticstorybook-win32',
      finishedAt: '2026-10-21T20:00:02.000Z',
      physicalClick: true,
    };
    const report = assessCheckbox(input);
    assert.equal(report.unitEvidence.outcome, 'passed');
    assert.equal(report.assessmentOutcome, 'failed');
    assert.equal(report.requirements[1].outcome, 'blocked-by-failure');
    assert.equal(report.requirements[3].outcome, 'blocked-by-failure');
    assert.equal(report.requirements[0].outcome, 'partial');
  });

  it('records startup/runtime failure without manufacturing completed assertion timestamps', () => {
    const data = checkboxJestFixture();
    Object.assign(data, {
      success: false,
      numRuntimeErrorTestSuites: 1,
      numPassedTestSuites: 0,
      numFailedTestSuites: 1,
      numTotalTests: 0,
      numPassedTests: 0,
    });
    Object.assign(data.testResults[0], { status: 'failed', startTime: 0, endTime: 0, assertionResults: [] });
    const report = assessCheckbox(options(data));
    assert.equal(report.unitEvidence.outcome, 'execution-failed');
    assert.equal(report.unitEvidence.caseCounts.passed, 0);
    assert.ok(report.requirements.every(({ outcome }) => outcome === 'insufficient-evidence'));
  });

  it('rejects invalid schemas, type-suite substitution, duplicates, contradictory counters, and oversized reports', () => {
    const mutations = [
      (data: ReturnType<typeof checkboxJestFixture>) => {
        data.testResults[0].name = 'checkbox.types.test.ts';
      },
      (data: ReturnType<typeof checkboxJestFixture>) => {
        data.testResults.push(data.testResults[0]);
      },
      (data: ReturnType<typeof checkboxJestFixture>) => {
        data.testResults[0].assertionResults.push(data.testResults[0].assertionResults[0]);
      },
      (data: ReturnType<typeof checkboxJestFixture>) => {
        data.numPassedTests = 900;
      },
      (data: ReturnType<typeof checkboxJestFixture>) => {
        data.testResults[0].assertionResults[0].status = 'unknown';
      },
      (data: ReturnType<typeof checkboxJestFixture>) => {
        data.testResults[0].assertionResults[0].title = 'wrong identity';
      },
      (data: ReturnType<typeof checkboxJestFixture>) => {
        data.testResults[0].assertionResults[0].failureMessages = ['contradiction'];
      },
      (data: ReturnType<typeof checkboxJestFixture>) => {
        data.numRuntimeErrorTestSuites = 1;
      },
      (data: ReturnType<typeof checkboxJestFixture>) => {
        data.testResults[0].endTime = 1;
      },
      (data: ReturnType<typeof checkboxJestFixture>) => {
        data.numFailedTestSuites = 1;
      },
      (data: ReturnType<typeof checkboxJestFixture>) => {
        data.testResults[0].status = 'skipped';
        data.numPassedTestSuites = 0;
        data.numPendingTestSuites = 1;
      },
    ];
    for (const mutate of mutations) {
      const data = checkboxJestFixture();
      mutate(data);
      assert.throws(() => parseCheckboxJest(JSON.stringify(data)));
    }
    assert.throws(() => parseCheckboxJest('{}'));
    assert.throws(() => parseCheckboxJest(' '.repeat(1_000_001)), /size limit/);
    const input = options();
    assert.throws(() => parseUnitContext({ ...input.unit!.context, platform: 'win32' }), /platform/);
    assert.throws(() => parseUnitContext({ ...input.unit!.context, exitCode: -1 }), /exit code/);
    assert.throws(() => parseUnitContext({ ...input.unit!.context, finishedAt: '2026-10-20T00:00:00.000Z' }), /before/);
    input.unit!.report = undefined;
    assert.throws(() => assessCheckbox(input), /requires a unit report/);
  });
});

describe('unit execution capture', () => {
  it('leaves uncaptured and other-platform package execution unchanged and calls the existing runner once', async () => {
    const args = ['--runTestsByPath', 'existing.test.ts'];
    for (const [platform, env] of [
      ['macos', {}],
      ['windows', { FURN_ASSESSMENT_UNIT_CAPTURE: 'unused' }],
    ] as const) {
      let invocations = 0;
      const code = await runJestWithUnitCapture(
        'unused',
        platform,
        args,
        async (forwarded) => {
          invocations++;
          assert.deepEqual(forwarded, args);
          return 7;
        },
        env,
      );
      assert.equal(code, 7);
      assert.equal(invocations, 1);
    }
  });

  function fixture(mode = 'passed') {
    const directory = mkdtempSync(path.join(tmpdir(), 'furn-unit-capture-'));
    directories.push(directory);
    const put = (file: string, content: string) => {
      mkdirSync(path.dirname(path.join(directory, file)), { recursive: true });
      writeFileSync(path.join(directory, file), content);
    };
    for (const file of [...unitMappingFiles, 'packages/agentic/components/package.json']) put(file, read(file));
    for (const file of [
      'SPEC.md',
      'spec/source.json',
      'spec/interaction.md',
      'spec/accessibility.md',
      'spec/tokens.yaml',
      'spec/usage.md',
      'checkbox.stories.tsx',
    ]) {
      const relative = path.posix.join(path.posix.dirname(checkboxUnitTestPath), file);
      put(relative, read(relative));
    }
    put('package.json', '{"packageManager":"yarn@0.0.0"}');
    put('.gitignore', 'apps/storybook/artifacts/\n');
    put('source.ts', 'original\n');
    put('fixture-unit.json', JSON.stringify({ ...checkboxJestFixture(), fixtureMode: mode }));
    // This synthetic package-manager fixture exercises capture, not component execution.
    put(
      '.yarn/releases/yarn-0.0.0.cjs',
      `
const fs = require('node:fs');
const path = require('node:path');
const data = JSON.parse(fs.readFileSync('fixture-unit.json', 'utf8'));
if (data.fixtureMode === 'missing') process.exit(0);
const now = Date.now();
data.startTime = now;
data.testResults[0].startTime = now;
data.testResults[0].endTime = now;
const destination = process.argv[process.argv.indexOf('--outputFile') + 1];
fs.writeFileSync(destination, JSON.stringify(data));
if (data.fixtureMode === 'changed') fs.writeFileSync('source.ts', 'changed\\n');
if (data.fixtureMode === 'failed') process.exitCode = 1;
`,
    );
    const git = (...args: string[]) => execFileSync('git', args, { cwd: directory, encoding: 'utf8' }).trim();
    git('init', '-q');
    git('config', 'user.name', 'Fixture');
    git('config', 'user.email', 'fixture@example.invalid');
    git('config', 'core.autocrlf', 'false');
    git('config', 'commit.gpgsign', 'false');
    git('add', '.');
    git('commit', '-qm', 'Synthetic unit capture inputs');
    return { directory, output: path.join(directory, 'apps', 'storybook', 'artifacts', 'unit') };
  }

  it('captures exact bytes and source before execution, with a fresh output directory for each run', () => {
    const f = fixture();
    const first = runCheckboxUnitTests(f.directory, f.output);
    const second = runCheckboxUnitTests(f.directory, f.output);
    assert.equal(first.exitCode, 0);
    assert.equal(first.context!.workingTreeDirty, false);
    assert.equal(first.context!.platform, 'macos');
    assert.equal(first.context!.reportSha256, reportDigest(first.report!));
    assert.notEqual(first.context!.buildId, second.context!.buildId);
    assert.equal(readdirSync(f.output).length, 2);
    const report = assessCheckbox({
      contract: readCheckboxContract(f.directory),
      sourceCommit: first.context!.sourceCommit,
      workingTreeDirty: false,
      now: new Date(),
      maxAgeHours: 24,
      unit: {
        mapping: readCheckboxUnitMappingFrom((file) => readFileSync(path.join(f.directory, file), 'utf8')),
        report: first.report!,
        context: first.context!,
        expectedBuildId: first.context!.buildId,
      },
    });
    assert.equal(report.unitEvidence.status, 'matched');
  });

  for (const mode of ['missing', 'failed', 'changed']) {
    it(`surfaces ${mode} execution instead of returning a successful capture`, () => {
      const f = fixture(mode);
      const result = runCheckboxUnitTests(f.directory, f.output, 'synthetic-build');
      assert.notEqual(result.exitCode, 0);
      assert.ok(result.executionFailure);
      if (mode === 'missing') assert.equal(result.report, null);
      if (mode === 'changed') assert.equal(result.context?.workingTreeDirty, true);
      if (mode === 'failed') assert.equal(result.context?.exitCode, 1);
    });
  }
});
