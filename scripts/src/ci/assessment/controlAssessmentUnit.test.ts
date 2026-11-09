import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { afterEach, describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';

import {
  assessControl,
  formatAssessmentMarkdown,
  object,
  parseNativeReport,
  readControlContract,
  reportDigest,
} from './controlAssessment.ts';
import type { AssessmentOptions } from './controlAssessment.ts';
import {
  assessmentDefinition,
  assessmentMappingPath,
  checkboxNativeAssertionPath,
  checkboxJestFixture,
  componentJestFixture,
  checkboxUnitCases,
  checkboxUnitTestPath,
  parseComponentJest,
  readUnitMappingFrom,
  unitMappingFiles,
} from './controlAssessmentFixtures.ts';
import { specAssessmentFor } from './controlAssessmentSpec.ts';
import { parseUnitContext } from './controlAssessmentUnit.ts';
import { runUnitTests, runJestWithUnitCapture } from './controlAssessmentUnitExecution.ts';
import { parseAssessmentDefinition, readPackageAssessments, unitCaptureDirectory } from './assessmentConfig.ts';
import { readUnitMappingFrom as readConfiguredMapping } from './controlAssessmentUnit.ts';
import { inputDigest } from './controlAssessmentCi.ts';
import { assessUnitCollection, parseUnitCollection, sourceState } from './readinessEvidence.ts';
import type { EvidenceEnvironment } from './readinessEvidence.ts';
import { discoverReadinessControls } from './readinessModel.ts';
import { collectReadinessUnits } from '../readinessCiTask.ts';

const root = fileURLToPath(new URL('../../../../', import.meta.url));
const read = (file: string) => readFileSync(path.join(root, file), 'utf8');
const contract = readControlContract(root);
const mapping = readUnitMappingFrom(read);
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
  it('rejects unsafe paths, unlisted contract sources and unfingerprinted or type-only runtime selections', () => {
    for (const mutate of [
      (value: typeof assessmentDefinition) => {
        value.componentPath = '../outside';
      },
      (value: typeof assessmentDefinition) => {
        value.contract.requirements['CBX-001'].checks[0].source = 'unlisted.md';
      },
      (value: typeof assessmentDefinition) => {
        value.unit.testFiles = ['src/unreviewed.test.tsx'];
      },
      (value: typeof assessmentDefinition) => {
        value.unit.testFiles = ['src/checkbox.types.test.ts'];
      },
    ]) {
      const value = JSON.parse(read(assessmentMappingPath));
      mutate(value);
      assert.throws(() =>
        parseAssessmentDefinition(
          value,
          assessmentDefinition.packagePath,
          assessmentDefinition.packageName,
          `${assessmentDefinition.componentPath}/assessment.mapping.json`,
        ),
      );
    }
  });

  it('requires the checklist to retain every SPEC requirement, including uncovered ones', () => {
    for (const change of ['missing', 'extra'] as const) {
      const definition = structuredClone(assessmentDefinition);
      if (change === 'missing') delete definition.contract.requirements['CBX-006'];
      else definition.contract.requirements['CBX-007'] = definition.contract.requirements['CBX-006'];
      assert.throws(() => readControlContract(root, definition), /every SPEC requirement/);
    }
  });

  it('retains the complete requirement/check set when no tests have been mapped', () => {
    const raw = JSON.parse(read(assessmentMappingPath), (key, value) => (key === 'tests' ? [] : value));
    const definition = parseAssessmentDefinition(
      raw,
      assessmentDefinition.packagePath,
      assessmentDefinition.packageName,
      `${assessmentDefinition.componentPath}/assessment.mapping.json`,
    );
    const report = assessControl({ ...options(), contract: { ...contract, definition } });
    assert.deepEqual(
      report.requirements.map(({ id, checks }) => ({ id, checks: checks.map(({ id }) => id) })),
      Object.entries(assessmentDefinition.contract.requirements).map(([id, { checks }]) => ({ id, checks: checks.map(({ id }) => id) })),
    );
    assert.ok(
      report.requirements.every(
        ({ checks, outcome }) => checks.every(({ outcome }) => outcome === 'uncovered') && outcome === 'insufficient-evidence',
      ),
    );
  });

  it('shows precise shared checks and uncovered checks without turning partial coverage into requirement completion', () => {
    const report = assessControl(options());
    const find = (requirement: string, id: string) =>
      report.requirements.find(({ id }) => id === requirement)!.checks.find((c) => c.id === id)!;
    assert.equal(find('CBX-001', 'default-unchecked').outcome, 'passed');
    assert.deepEqual(find('CBX-001', 'default-unchecked'), find('CBX-004', 'default-unchecked'));
    assert.equal(find('CBX-001', 'default-standard-variant').outcome, 'uncovered');
    assert.equal(find('CBX-001', 'reject-children').outcome, 'uncovered');
    assert.equal(find('CBX-004', 'native-checkbox-role').outcome, 'not-run');
    assert.equal(find('CBX-004', 'native-toggle-dispatch').outcome, 'uncovered');
    assert.ok(report.requirements.every(({ outcome }) => outcome !== 'passed'));
    assert.match(formatAssessmentMarkdown(report), /SPEC requirement \| Specific check/);
    assert.match(formatAssessmentMarkdown(report), /No reviewed test mapping/);
  });

  it('requires every linked test to qualify and does not qualify a multi-test check from one passing case', () => {
    const data = checkboxJestFixture();
    const test = data.testResults[0].assertionResults.find(({ fullName }) => fullName.includes('falls back to the label text'))!;
    test.status = 'pending';
    data.numPassedTests--;
    data.numPendingTests++;
    const report = assessControl(options(data));
    const check = report.requirements.find(({ id }) => id === 'CBX-003')!.checks.find(({ id }) => id === 'hidden-label')!;
    assert.equal(check.tests.length, 2);
    assert.deepEqual(
      check.tests.map(({ evidenceOutcome }) => evidenceOutcome),
      ['passed', 'skipped'],
    );
    assert.equal(check.outcome, 'skipped');
  });

  it('rejects conflicting shared IDs, duplicate links, and JS evidence attached to a native claim', () => {
    for (const mutate of [
      (value: typeof assessmentDefinition) => {
        value.contract.requirements['CBX-004'].checks.find(({ id }) => id === 'default-unchecked')!.description = 'Conflicting definition';
      },
      (value: typeof assessmentDefinition) => {
        const check = value.contract.requirements['CBX-001'].checks[0];
        check.tests.push(check.tests[0]);
      },
      (value: typeof assessmentDefinition) => {
        value.contract.requirements['CBX-001'].checks[0].evidence = 'native';
      },
    ]) {
      const value = JSON.parse(read(assessmentMappingPath));
      mutate(value);
      assert.throws(() =>
        parseAssessmentDefinition(
          value,
          assessmentDefinition.packagePath,
          assessmentDefinition.packageName,
          `${value.componentPath}/assessment.mapping.json`,
        ),
      );
    }
  });

  it('maps Checkbox from a complete existing package report without counting its type suite', () => {
    const parsed = parseComponentJest(JSON.stringify(componentJestFixture()));
    assert.equal(parsed.packageSuites, 2);
    assert.equal(parsed.packageCounts.passed, 43);
    assert.equal(parsed.counts.passed, 42);
    assert.equal(parsed.entries.length, 42);
    const report = assessControl(options(componentJestFixture()));
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
      const report = assessControl(options(data));
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
    const report = assessControl(options(data));
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
    const report = assessControl(options());
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
        readUnitMappingFrom((file) => read(file) + (file === changed ? '\n// changed assertion or configuration\n' : '')).current,
        false,
      );
    }
    assert.equal(readUnitMappingFrom((file) => read(file).replace(/\r?\n/g, '\r\n')).current, true);
    assert.equal(
      readUnitMappingFrom((file) =>
        file.endsWith('/package.json') ? JSON.stringify({ ...JSON.parse(read(file)), furn: { jestPlatform: 'win32' } }) : read(file),
      ).current,
      false,
    );
    const input = options();
    input.unit!.mapping = { ...mapping, current: false };
    const report = assessControl(input);
    assert.equal(report.assessmentHealth, 'stale');
    assert.equal(report.unitEvidence.outcome, 'stale');
    assert.ok(report.unitEvidence.checks.every(({ evidenceOutcome }) => evidenceOutcome === 'stale'));
  });

  it('invalidates reviewed evidence when package-owned assertion scopes change', () => {
    const changed = (file: string) => {
      if (file !== assessmentMappingPath) return read(file);
      const value = JSON.parse(read(file));
      value.contract.requirements['CBX-001'].checks[2].description = 'Changed claim that has not been reviewed.';
      return JSON.stringify(value);
    };
    assert.equal(readUnitMappingFrom(changed).current, false);
  });

  it('keeps a passing suite without execution context unverified', () => {
    const input = options();
    input.unit!.context = undefined;
    const report = assessControl(input);
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
      assert.equal(assessControl(input).unitEvidence.status, 'unverified');
    });
  }

  for (const field of ['sourceCommit', 'buildId', 'contractDigest', 'mappingDigest', 'reportSha256', 'startedAt', 'finishedAt'] as const) {
    it(`blocks mismatched unit ${field}`, () => {
      const input = options();
      const context = input.unit!.context!;
      if (field === 'startedAt') context.startedAt = '2026-10-21T20:00:00.900Z';
      else if (field === 'finishedAt') context.finishedAt = '2026-10-21T20:01:00.000Z';
      else context[field] = field === 'buildId' ? 'different-build' : 'f'.repeat(field === 'sourceCommit' ? 40 : 64);
      const report = assessControl(input);
      assert.equal(report.unitEvidence.status, 'mismatched');
      assert.equal(report.assessmentHealth, 'blocked');
      assert.ok(report.requirements.every(({ outcome }) => outcome === 'insufficient-evidence'));
    });
  }

  it('preserves stale execution and contract mapping state independently', () => {
    const input = options();
    input.now = new Date('2026-10-23T20:00:00.000Z');
    assert.equal(assessControl(input).unitEvidence.status, 'stale');
    input.now = now;
    input.contract = { ...contract, mappingCurrent: false };
    const report = assessControl(input);
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
      const report = assessControl(options(data));
      assert.equal(report.requirements[0].outcome, 'insufficient-evidence');
      assert.equal(report.unitEvidence.checks[0].recordedOutcome, 'not-run');
      assert.equal(report.unitEvidence.unmappedCases.length, replace ? 1 : 0);
    }
  });

  it('keeps skipped and todo assertions distinct from passing execution', () => {
    for (const status of ['pending', 'todo']) {
      const data = checkboxJestFixture();
      data.testResults[0].assertionResults[0].status = status;
      data.testResults[0].status = status === 'pending' ? 'focused' : 'passed';
      data.numPassedTests--;
      if (status === 'todo') data.numTodoTests++;
      else data.numPendingTests++;
      const report = assessControl(options(data));
      assert.equal(report.unitEvidence.caseCounts.skipped, 1);
      assert.equal(report.unitEvidence.checks[0].evidenceOutcome, 'skipped');
      assert.equal(report.requirements[0].outcome, 'insufficient-evidence');
    }
  });

  it('preserves partially skipped unrelated suites using the Jest focused status', () => {
    const data = componentJestFixture();
    const other = data.testResults[1];
    other.status = 'focused';
    other.assertionResults.push({
      fullName: 'Other pending assertion',
      ancestorTitles: ['Other'],
      title: 'pending assertion',
      status: 'pending',
      failureMessages: [],
    });
    data.numTotalTests++;
    data.numPendingTests++;
    const report = assessControl(options(data));
    assert.deepEqual(report.unitEvidence.packageCounts, { passed: 43, failed: 0, skipped: 1 });
    assert.equal(report.unitEvidence.caseCounts.skipped, 0);
    assert.equal(report.unitEvidence.outcome, 'passed');
  });

  it('preserves retry-success history without qualifying its enclosing execution', () => {
    for (const metadata of [
      { invocations: 2, retryReasons: ['Prior synthetic <failure>'] },
      { invocations: 2 },
      { retryReasons: ['Prior synthetic <failure>'] },
    ]) {
      const data = checkboxJestFixture();
      Object.assign(data.testResults[0].assertionResults[0], metadata);
      const report = assessControl(options(data));
      const check = report.unitEvidence.checks[0];
      assert.equal(check.recordedOutcome, 'passed');
      assert.equal(check.evidenceOutcome, 'unverified');
      assert.equal(check.invocations, metadata.invocations ?? null);
      assert.deepEqual(check.retryReasons, metadata.retryReasons ?? []);
      assert.equal(check.retries, 1);
      assert.equal(check.flaky, true);
      assert.deepEqual(report.unitEvidence.retryCounts, { retries: 1, flaky: 1 });
      assert.equal(report.unitEvidence.runFailed, false);
      assert.equal(report.unitEvidence.runRetried, true);
      assert.equal(report.unitEvidence.outcome, 'retried');
      assert.ok(report.requirements.every(({ outcome }) => outcome === 'insufficient-evidence'));
      const markdown = formatAssessmentMarkdown(report);
      assert.match(markdown, /Retried or flaky unit execution/);
      if (metadata.retryReasons) assert.ok(markdown.includes('Prior synthetic \\<failure\\>'));
    }
  });

  it('retains unrelated package retries without attributing them to Checkbox cases', () => {
    const data = componentJestFixture();
    data.testResults[1].assertionResults[0].invocations = 2;
    const report = assessControl(options(data));
    assert.deepEqual(report.unitEvidence.retryCounts, { retries: 0, flaky: 0 });
    assert.deepEqual(report.unitEvidence.packageRetryCounts, { retries: 1, flaky: 1 });
    assert.equal(report.unitEvidence.outcome, 'retried');
    assert.ok(report.unitEvidence.checks.every(({ retries, evidenceOutcome }) => retries === 0 && evidenceOutcome === 'unverified'));
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
    const report = assessControl(options(data));
    assert.equal(report.unitEvidence.outcome, 'skipped');
    assert.ok(report.requirements.every(({ outcome }) => outcome === 'insufficient-evidence'));
  });

  it('blocks mapped failures and never accepts other passes from the enclosing failed unit command', () => {
    const data = checkboxJestFixture();
    const entry = data.testResults[0].assertionResults.find(({ fullName }) => fullName.includes('disables interaction'))!;
    entry.status = 'failed';
    entry.failureMessages = ['Synthetic assertion failure'];
    entry.invocations = 2;
    entry.retryReasons = ['Prior synthetic assertion failure'];
    data.success = false;
    data.testResults[0].status = 'failed';
    data.numPassedTestSuites = 0;
    data.numFailedTestSuites = 1;
    data.numPassedTests--;
    data.numFailedTests++;
    const report = assessControl(options(data));
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
      const report = assessControl(input);
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
    const report = assessControl(input);
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
    const report = assessControl(options(data));
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
        Object.assign(data.testResults[0].assertionResults[0], { invocations: -1 });
      },
      (data: ReturnType<typeof checkboxJestFixture>) => {
        Object.assign(data.testResults[0].assertionResults[0], { retryReasons: 'invalid' });
      },
      (data: ReturnType<typeof checkboxJestFixture>) => {
        Object.assign(data.testResults[0].assertionResults[0], { retryReasons: [null] });
      },
      (data: ReturnType<typeof checkboxJestFixture>) => {
        data.testResults[0].status = 'focused';
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
      assert.throws(() => parseComponentJest(JSON.stringify(data)));
    }
    assert.throws(() => parseComponentJest('{}'));
    assert.throws(() => parseComponentJest(' '.repeat(1_000_001)), /size limit/);
    const input = options();
    assert.throws(() => parseUnitContext({ ...input.unit!.context, platform: 'invalid' }), /platform/);
    assert.throws(() => parseUnitContext({ ...input.unit!.context, exitCode: -1 }), /exit code/);
    assert.throws(() => parseUnitContext({ ...input.unit!.context, finishedAt: '2026-10-20T00:00:00.000Z' }), /before/);
    input.unit!.report = undefined;
    assert.throws(() => assessControl(input), /requires a unit report/);
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
        path.join(root, assessmentDefinition.packagePath),
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
    const directory = path.join(root, 'reports', `furn-unit-capture-${randomUUID()}`);
    mkdirSync(directory, { recursive: true });
    directories.push(directory);
    const put = (file: string, content: string) => {
      mkdirSync(path.dirname(path.join(directory, file)), { recursive: true });
      writeFileSync(path.join(directory, file), content);
    };
    for (const file of [...unitMappingFiles, assessmentMappingPath, 'packages/agentic/components/package.json']) put(file, read(file));
    put(checkboxNativeAssertionPath, read(checkboxNativeAssertionPath));
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
    const definition = readPackageAssessments(directory, path.join(directory, assessmentDefinition.packagePath))[0];
    const metadata = object(JSON.parse(readFileSync(path.join(directory, assessmentMappingPath), 'utf8')), 'Fixture mapping');
    object(metadata.unit, 'Fixture unit inputs').reviewedDigest = readConfiguredMapping(
      (file) => readFileSync(path.join(directory, file), 'utf8'),
      definition,
    ).digest;
    put(assessmentMappingPath, JSON.stringify(metadata));
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

  function ciFixture() {
    const f = fixture();
    const commit = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: f.directory, encoding: 'utf8' }).trim();
    const identity = {
      repository: 'fixture/repo',
      pullRequest: 1,
      headRepository: 'fixture/repo',
      headRef: 'fixture',
      headCommit: 'd'.repeat(40),
      baseCommit: 'e'.repeat(40),
      testedCommit: commit,
      runId: '123',
      runAttempt: 2,
      inputDigest: inputDigest(f.directory, commit),
    };
    const buildId = 'fixture/repo/actions/runs/123/attempts/2';
    const start = { schemaVersion: 1, identity, buildId, startedAt: new Date().toISOString() };
    mkdirSync(f.output, { recursive: true });
    writeFileSync(path.join(f.output, 'unit-collection-start.json'), JSON.stringify(start));
    const env = {
      FURN_ASSESSMENT_UNIT_CAPTURE: f.output,
      GITHUB_ACTIONS: 'true',
      GITHUB_REPOSITORY: identity.repository,
      GITHUB_SHA: commit,
      GITHUB_RUN_ID: '123',
      GITHUB_RUN_ATTEMPT: '2',
      GITHUB_JOB: 'javascript',
      GITHUB_WORKFLOW_REF: 'fixture/repo/.github/workflows/pr.yml@refs/pull/1/merge',
    };
    return { ...f, identity, buildId, start, env };
  }

  async function localFixture() {
    const f = fixture();
    const packageRoot = path.join(f.directory, assessmentDefinition.packagePath);
    let calls = 0;
    let originalStartPath = '';
    const code = await runJestWithUnitCapture(
      packageRoot,
      assessmentDefinition.unit.platform,
      [],
      async (args) => {
        calls++;
        const start = object(JSON.parse(readFileSync(path.join(f.output, 'unit-collection-start.json'), 'utf8')), 'Local collection start');
        assert.equal(start.scope, 'local');
        assert.equal(start.identity, null);
        assert.match(String(start.buildId), /^local-unit\//);
        const reportPath = args[args.indexOf('--outputFile') + 1];
        originalStartPath = path.join(path.dirname(reportPath), 'execution-start.json');
        const original = object(JSON.parse(readFileSync(originalStartPath, 'utf8')), 'Local invocation start');
        assert.equal(original.executionIdentity, null);
        assert.equal(original.scope, 'local');
        const report = checkboxJestFixture();
        const time = Date.now();
        report.startTime = time;
        Object.assign(report.testResults[0], { startTime: time, endTime: time });
        writeFileSync(reportPath, JSON.stringify(report));
        return 0;
      },
      { FURN_ASSESSMENT_UNIT_CAPTURE: f.output },
    );
    assert.equal(code, 0);
    assert.equal(calls, 1);
    const destination = path.join(f.directory, 'apps', 'storybook', 'artifacts', 'readiness', 'local');
    assert.equal(collectReadinessUnits(f.directory, f.output, destination), 0);
    const collected = parseUnitCollection(JSON.parse(readFileSync(path.join(destination, 'unit-0', 'unit-collection.json'), 'utf8')));
    assert.equal(collected.executionStart, readFileSync(originalStartPath, 'utf8'));
    const environment: EvidenceEnvironment = {
      source: sourceState(f.directory),
      identity: null,
      now: new Date(),
      ci: false,
      sourceJobs: new Map(),
    };
    return { ...f, destination, originalStartPath, collected, environment, controls: discoverReadinessControls(f.directory, packageRoot) };
  }

  it('captures one genuine local invocation without GitHub identity and never promotes it to CI proof', async () => {
    const f = await localFixture();
    const evidence = assessUnitCollection(f.directory, f.controls, f.collected, f.environment);
    assert.ok(evidence.observations.length > 0);
    assert.ok(
      evidence.observations.every(({ outcome, scope }) => outcome === 'passed' && scope === 'local'),
      evidence.limitations.join('\n'),
    );
    assert.ok(evidence.limitations.some((reason) => reason.includes('no GitHub job')));
    const ci = assessUnitCollection(f.directory, f.controls, f.collected, { ...f.environment, ci: true });
    assert.ok(ci.observations.every(({ outcome, scope }) => outcome !== 'passed' && scope === 'local'));
    assert.ok(ci.limitations.some((reason) => reason.includes('not same-attempt CI proof')));
  });

  it('rejects tampered original local start bytes and prevents stale or missing local receipts from qualifying', async () => {
    const f = await localFixture();
    const capture = object(JSON.parse(f.collected.capture), 'Local capture');
    const start = object(JSON.parse(f.collected.collectionStart), 'Local collection');
    const stale = new Date(Date.now() - 169 * 3_600_000).toISOString();
    const collectionStart = JSON.stringify({ ...start, startedAt: stale });
    const collectionStartSha256 = reportDigest(collectionStart);
    const executionStart = JSON.stringify({
      ...object(JSON.parse(f.collected.executionStart!), 'Original invocation'),
      collectionStartSha256,
    });
    const executionStartSha256 = reportDigest(executionStart);
    const expired = assessUnitCollection(
      f.directory,
      f.controls,
      {
        ...f.collected,
        collectionStart,
        executionStart,
        execution: JSON.stringify({
          ...object(JSON.parse(f.collected.execution), 'Original execution'),
          collectionStartSha256,
          executionStartSha256,
        }),
        capture: JSON.stringify({ ...capture, collectionStartedAt: stale, collectionStartSha256, executionStartSha256 }),
      },
      f.environment,
    );
    assert.ok(expired.observations.every(({ outcome }) => outcome !== 'passed'));
    assert.ok(expired.limitations.some((reason) => reason.includes('stale')));
    const missing = assessUnitCollection(f.directory, f.controls, { ...f.collected, executionStart: undefined }, f.environment);
    assert.ok(missing.observations.every(({ outcome }) => outcome !== 'passed'));
    writeFileSync(f.originalStartPath, `${readFileSync(f.originalStartPath, 'utf8')}\n`);
    assert.throws(() => collectReadinessUnits(f.directory, f.output, f.destination), /ORIGINAL invocation start bytes/);
  });

  it('records the original CI receipt before the one runner and qualifies its collected runtime suites', async () => {
    const f = ciFixture();
    const packageRoot = path.join(f.directory, assessmentDefinition.packagePath);
    const expected = {
      repository: f.identity.repository,
      workflow: f.env.GITHUB_WORKFLOW_REF,
      runId: '123',
      runAttempt: 2,
      job: 'javascript',
      buildId: f.buildId,
      sourceCommit: f.identity.testedCommit,
      inputDigest: f.identity.inputDigest,
    };
    let calls = 0;
    const args = ['--runInBand'];
    const code = await runJestWithUnitCapture(
      packageRoot,
      assessmentDefinition.unit.platform,
      args,
      async (forwarded) => {
        calls++;
        assert.deepEqual(forwarded.slice(0, args.length), args);
        const reportPath = forwarded[forwarded.indexOf('--outputFile') + 1];
        const originalStart = object(
          JSON.parse(readFileSync(path.join(path.dirname(reportPath), 'execution-start.json'), 'utf8')),
          'Original pre-execution receipt',
        );
        assert.deepEqual(originalStart.executionIdentity, expected);
        const report = checkboxJestFixture();
        const time = Date.now();
        report.startTime = time;
        Object.assign(report.testResults[0], { startTime: time, endTime: time });
        writeFileSync(reportPath, JSON.stringify(report));
        f.env.GITHUB_JOB = 'changed-after-start';
        f.env.GITHUB_RUN_ATTEMPT = '99';
        return 0;
      },
      f.env,
    );
    assert.equal(code, 0);
    assert.equal(calls, 1);
    const definition = readPackageAssessments(f.directory, packageRoot)[0];
    const captured = object(
      JSON.parse(readFileSync(path.join(unitCaptureDirectory(f.output, definition), 'unit-execution.json'), 'utf8')),
      'Completed capture',
    );
    assert.deepEqual(captured.executionIdentity, expected);
    assert.equal(object(captured.context, 'Legacy unit context').schemaVersion, 1);
    const destination = path.join(f.directory, 'apps', 'storybook', 'artifacts', 'readiness', 'unit');
    assert.equal(collectReadinessUnits(f.directory, f.output, destination), 0);
    const collected = parseUnitCollection(JSON.parse(readFileSync(path.join(destination, 'unit-0', 'unit-collection.json'), 'utf8')));
    const controls = discoverReadinessControls(f.directory, packageRoot);
    const evidence = assessUnitCollection(f.directory, controls, collected, {
      source: sourceState(f.directory),
      now: new Date(),
      ci: true,
      identity: { ...expected, job: 'assessment' },
      sourceJobs: new Map([['javascript', 'success']]),
    });
    assert.ok(evidence.observations.length > 0);
    assert.ok(
      evidence.observations.every(({ outcome }) => outcome === 'passed'),
      evidence.limitations.join('\n'),
    );
    const failed = assessUnitCollection(f.directory, controls, collected, {
      source: sourceState(f.directory),
      now: new Date(),
      ci: true,
      identity: { ...expected, job: 'assessment' },
      sourceJobs: new Map([['javascript', 'failure']]),
    });
    assert.ok(failed.observations.every(({ outcome }) => outcome !== 'passed'));
  });

  it('rejects mismatched original CI run, attempt, checkout and global inputs before invoking Jest', async () => {
    const f = ciFixture();
    let calls = 0;
    const run = async () => {
      calls++;
      return 0;
    };
    for (const change of [
      { GITHUB_RUN_ID: '999' },
      { GITHUB_RUN_ATTEMPT: '3' },
      { GITHUB_SHA: 'f'.repeat(40) },
      { GITHUB_REPOSITORY: 'other/repo' },
    ]) {
      await assert.rejects(
        runJestWithUnitCapture(path.join(f.directory, assessmentDefinition.packagePath), assessmentDefinition.unit.platform, [], run, {
          ...f.env,
          ...change,
        }),
        /pre-execution/,
      );
    }
    writeFileSync(
      path.join(f.output, 'unit-collection-start.json'),
      JSON.stringify({
        ...f.start,
        identity: { ...f.identity, inputDigest: 'f'.repeat(64) },
      }),
    );
    await assert.rejects(
      runJestWithUnitCapture(path.join(f.directory, assessmentDefinition.packagePath), assessmentDefinition.unit.platform, [], run, f.env),
      /pre-execution/,
    );
    assert.equal(calls, 0);
  });

  it('discovers a second control from package data and binds both to one unchanged Jest invocation', async () => {
    const f = fixture();
    const packageRoot = path.join(f.directory, assessmentDefinition.packagePath);
    const put = (file: string, value: string) => {
      mkdirSync(path.dirname(path.join(f.directory, file)), { recursive: true });
      writeFileSync(path.join(f.directory, file), value);
    };
    const original = JSON.parse(read(assessmentMappingPath));
    const second = structuredClone(original);
    second.component = 'synthetic-toggle';
    second.displayName = 'Synthetic Toggle';
    second.componentPath = 'src/components/synthetic-toggle';
    second.contract.nativeCheck = {
      storyId: 'components-synthetic-toggle--default',
      testName: 'changes native state',
      requiresPhysicalClick: true,
    };
    second.contract.requirements = Object.fromEntries(
      Object.entries(second.contract.requirements).map(([id, value]) => [id.replace('CBX-', 'TGL-'), value]),
    );
    second.unit.testFiles = ['src/components/synthetic-toggle/toggle.test.tsx'];
    second.unit.inputs[0] = `${assessmentDefinition.packagePath}/${second.unit.testFiles[0]}`;
    for (const requirement of Object.values(second.contract.requirements) as { checks: { tests: unknown[] }[] }[])
      for (const check of requirement.checks) check.tests = [];
    second.contract.requirements['TGL-002'].checks = [
      {
        id: 'synthetic-state',
        description: 'Synthetic JS state assertion.',
        source: 'SPEC.md#requirements',
        evidence: 'unit',
        tests: [{ kind: 'unit', fullName: 'Synthetic Toggle changes state' }],
      },
    ];
    second.unit.excludedCases = [];
    const secondMapping = `${assessmentDefinition.packagePath}/${second.componentPath}/assessment.mapping.json`;
    for (const file of second.contract.files) {
      let content = read(`${assessmentDefinition.packagePath}/${assessmentDefinition.componentPath}/${file}`).replaceAll('CBX-', 'TGL-');
      if (file === 'spec/source.json') content = JSON.stringify({ ...JSON.parse(content), component: second.component });
      put(`${assessmentDefinition.packagePath}/${second.componentPath}/${file}`, content);
    }
    put(second.unit.inputs[0], '// Synthetic test-selection fixture, not a component execution.\n');
    put(secondMapping, JSON.stringify(second));
    const manifestFile = `${assessmentDefinition.packagePath}/package.json`;
    const manifest = JSON.parse(read(manifestFile));
    manifest.furn.assessments.push(`${second.componentPath}/assessment.mapping.json`);
    put(manifestFile, JSON.stringify(manifest));
    let definitions = readPackageAssessments(f.directory, packageRoot);
    const secondDefinition = definitions.find(({ component }) => component === second.component)!;
    second.contract.reviewedDigest = readControlContract(f.directory, secondDefinition).digest;
    second.unit.reviewedDigest = readConfiguredMapping(
      (file) => readFileSync(path.join(f.directory, file), 'utf8'),
      secondDefinition,
    ).digest;
    put(secondMapping, JSON.stringify(second));
    definitions = readPackageAssessments(f.directory, packageRoot);
    execFileSync('git', ['add', '.'], { cwd: f.directory });
    execFileSync('git', ['commit', '-qm', 'Synthetic second control configuration'], { cwd: f.directory });
    const testedCommit = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: f.directory, encoding: 'utf8' }).trim();
    mkdirSync(f.output, { recursive: true });
    writeFileSync(
      path.join(f.output, 'unit-collection-start.json'),
      JSON.stringify({
        schemaVersion: 1,
        identity: { testedCommit },
        buildId: 'synthetic-shared-run',
        startedAt: new Date().toISOString(),
      }),
    );
    const args = ['--runTestsByPath', ...definitions.flatMap(({ unit }) => unit.testFiles)];
    let calls = 0;
    const code = await runJestWithUnitCapture(
      packageRoot,
      'macos',
      args,
      async (forwarded) => {
        calls++;
        assert.deepEqual(forwarded.slice(0, args.length), args);
        const data = checkboxJestFixture();
        const time = Date.now();
        data.startTime = time;
        Object.assign(data.testResults[0], { startTime: time, endTime: time });
        data.testResults.push({
          ...data.testResults[0],
          name: `${assessmentDefinition.packagePath}/${second.unit.testFiles[0]}`,
          assertionResults: [
            {
              fullName: 'Synthetic Toggle changes state',
              ancestorTitles: ['Synthetic Toggle'],
              title: 'changes state',
              status: 'passed',
              failureMessages: [],
            },
          ],
        });
        data.numTotalTestSuites++;
        data.numPassedTestSuites++;
        data.numTotalTests++;
        data.numPassedTests++;
        writeFileSync(forwarded[forwarded.indexOf('--outputFile') + 1], JSON.stringify(data));
        return 0;
      },
      { FURN_ASSESSMENT_UNIT_CAPTURE: f.output },
    );
    assert.equal(code, 0);
    assert.equal(calls, 1);
    for (const definition of definitions) {
      const capture = JSON.parse(readFileSync(path.join(unitCaptureDirectory(f.output, definition), 'unit-execution.json'), 'utf8'));
      const report = assessControl({
        contract: readControlContract(f.directory, definition),
        sourceCommit: testedCommit,
        workingTreeDirty: false,
        now: new Date(),
        maxAgeHours: 24,
        unit: {
          ...capture,
          expectedBuildId: 'synthetic-shared-run',
          mapping: readConfiguredMapping((file) => readFileSync(path.join(f.directory, file), 'utf8'), definition),
        },
      });
      assert.equal(report.component, definition.component);
      assert.equal(report.unitEvidence.status, 'matched');
      assert.equal(report.unitEvidence.outcome, 'passed');
      assert.equal(report.unitEvidence.checks.length, definition.unit.cases.length);
      assert.equal(report.evidenceSupportedStatus, null);
    }
    assert.equal(calls, 1);
  });

  it('captures exact bytes and source before execution, with a fresh output directory for each run', () => {
    const f = fixture();
    const first = runUnitTests(f.directory, f.output);
    const second = runUnitTests(f.directory, f.output);
    assert.equal(first.exitCode, 0);
    assert.equal(first.context!.workingTreeDirty, false);
    assert.equal(first.context!.platform, 'macos');
    assert.equal(first.context!.reportSha256, reportDigest(first.report!));
    assert.notEqual(first.context!.buildId, second.context!.buildId);
    assert.equal(readdirSync(f.output).length, 2);
    const report = assessControl({
      contract: readControlContract(f.directory),
      sourceCommit: first.context!.sourceCommit,
      workingTreeDirty: false,
      now: new Date(),
      maxAgeHours: 24,
      unit: {
        mapping: readUnitMappingFrom((file) => readFileSync(path.join(f.directory, file), 'utf8')),
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
      const result = runUnitTests(f.directory, f.output, 'synthetic-build');
      assert.notEqual(result.exitCode, 0);
      assert.ok(result.executionFailure);
      if (mode === 'missing') assert.equal(result.report, null);
      if (mode === 'changed') assert.equal(result.context?.workingTreeDirty, true);
      if (mode === 'failed') assert.equal(result.context?.exitCode, 1);
    });
  }
});
