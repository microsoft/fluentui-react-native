import assert from 'node:assert/strict';
import { test } from 'node:test';

import { parseInputCatalog, readInputMode, selectedInputTests, verifyInputReport } from './input-test-modes.mts';

const discovery: { id: string; tests: string[]; inputModes: Record<string, { win32: string }> }[] = [
  {
    id: 'fixture--default',
    tests: ['semantics', 'native action', 'keyboard'],
    inputModes: { semantics: { win32: 'both' }, 'native action': { win32: 'accessibility' }, keyboard: { win32: 'physical' } },
  },
  {
    id: 'fixture--second',
    tests: ['semantics', 'quarantined'],
    inputModes: { semantics: { win32: 'physical' }, quarantined: { win32: 'physical' } },
  },
];
const quarantines = [{ storyId: 'fixture--second', testName: 'quarantined', reason: 'Existing issue #4373.' }];

function report(mode: 'accessibility' | 'physical') {
  const selected = selectedInputTests(mode, parseInputCatalog(discovery, quarantines));
  const tests = selected.map((entry, index) => {
    const status = entry.quarantineReason ? 'skipped' : 'passed';
    return {
      testId: `csf-${index}`,
      title: `${entry.storyId} / ${entry.testName}`,
      status,
      flaky: false,
      attempts: [{ attempt: 0, status, durationMs: 1, ...(entry.quarantineReason ? { reason: entry.quarantineReason } : {}) }],
    };
  });
  const skipped = tests.filter((entry) => entry.status === 'skipped').length;
  return {
    schemaVersion: 1,
    kind: 'tests',
    status: 'passed',
    context: { endpoint: 'win32', renderer: 'paper' },
    startedAt: '2026-11-05T20:00:00.000Z',
    finishedAt: '2026-11-05T20:01:00.000Z',
    counts: {
      selected: tests.length,
      executed: tests.length - skipped,
      passed: tests.length - skipped,
      failed: 0,
      skipped,
      unsupported: 0,
      incomplete: 0,
      retries: 0,
      flaky: 0,
    },
    tests,
    failures: [],
    work: [],
  };
}

test('routes exact identities into accessibility, physical, and both lanes', () => {
  const parsed = parseInputCatalog(discovery, quarantines);
  assert.deepEqual(
    selectedInputTests('accessibility', parsed).map(({ testName }) => testName),
    ['semantics', 'native action'],
  );
  assert.deepEqual(
    selectedInputTests('physical', parsed).map(({ testName }) => testName),
    ['semantics', 'keyboard', 'semantics', 'quarantined'],
  );
  assert.throws(() => readInputMode('automatic'), /STORYBOOK_INPUT_MODE/);
});

test('rejects duplicate, unknown-mode, missing and stale discovered classifications', () => {
  const duplicate = structuredClone(discovery);
  duplicate[0].tests.push('semantics');
  assert.throws(() => parseInputCatalog(duplicate, quarantines), /unique callback/);
  assert.throws(() => parseInputCatalog([...discovery, discovery[0]], quarantines), /Duplicate discovered story/);
  const invalid = structuredClone(discovery);
  invalid[0].inputModes.semantics.win32 = 'automatic';
  assert.throws(() => parseInputCatalog(invalid, quarantines), /Unclassified or invalid/);
  const missing = structuredClone(discovery);
  delete missing[0].inputModes.semantics;
  assert.throws(() => parseInputCatalog(missing, quarantines), /Unclassified/);
  const stale = structuredClone(discovery);
  stale[0].inputModes.removed = { win32: 'both' };
  assert.throws(() => parseInputCatalog(stale, quarantines), /not discovered/);
});

test('derives renamed and removed tests from discovery without a second inventory', () => {
  const changed = structuredClone(discovery);
  changed[0].tests[0] = 'renamed semantics';
  changed[0].inputModes['renamed semantics'] = changed[0].inputModes.semantics;
  delete changed[0].inputModes.semantics;
  changed[0].tests.splice(1, 1);
  delete changed[0].inputModes['native action'];
  assert.deepEqual(
    selectedInputTests('accessibility', parseInputCatalog(changed, quarantines)).map(({ testName }) => testName),
    ['renamed semantics'],
  );
});

test('accepts complete execution and reports the existing exact quarantine as unvalidated', () => {
  const parsed = parseInputCatalog(discovery, quarantines);
  assert.deepEqual(verifyInputReport(report('accessibility'), selectedInputTests('accessibility', parsed), 0), {
    passed: 2,
    quarantined: [],
  });
  assert.deepEqual(verifyInputReport(report('physical'), selectedInputTests('physical', parsed), 0), {
    passed: 3,
    quarantined: ['fixture--second / quarantined'],
  });
});

test('rejects missing, duplicate, unexpected-lane, and skipped expected results', () => {
  const selected = selectedInputTests('accessibility', parseInputCatalog(discovery, quarantines));
  const missing = report('accessibility');
  missing.tests.pop();
  missing.counts.selected--;
  assert.throws(() => verifyInputReport(missing, selected, 0), /Expected one result/);
  const duplicate = report('accessibility');
  duplicate.tests.push(duplicate.tests[0]);
  duplicate.counts.selected++;
  assert.throws(() => verifyInputReport(duplicate, selected, 0), /duplicate/);
  const unexpected = report('accessibility');
  unexpected.tests[0].title = 'fixture--default / keyboard';
  assert.throws(() => verifyInputReport(unexpected, selected, 0), /outside its declared lane/);
  const skipped = report('accessibility');
  skipped.tests[0].status = 'skipped';
  skipped.tests[0].attempts[0].status = 'skipped';
  assert.throws(() => verifyInputReport(skipped, selected, 0), /did not execute and pass/);
});

test('rejects changed quarantine reasons, stale/wrong-target reports, retry passes, and unfinished work', () => {
  const selected = selectedInputTests('physical', parseInputCatalog(discovery, quarantines));
  const changed = report('physical');
  changed.tests[3].attempts[0].reason = 'Physical input unavailable.';
  assert.throws(() => verifyInputReport(changed, selected, 0), /did not execute and pass/);
  assert.throws(() => verifyInputReport(report('physical'), selected, Date.parse('2026-11-06T00:00:00Z')), /fresh/);
  const wrongTarget = report('physical');
  wrongTarget.context.endpoint = 'windows';
  assert.throws(() => verifyInputReport(wrongTarget, selected, 0), /Win32\/Paper/);
  assert.throws(() => verifyInputReport({ ...report('physical'), kind: 'lifecycle' }, selected, 0), /test report/);
  assert.throws(() => verifyInputReport({ ...report('physical'), context: undefined }, selected, 0), /input-coverage object/);
  const retried = report('physical');
  retried.tests[0].attempts.push(retried.tests[0].attempts[0]);
  assert.throws(() => verifyInputReport(retried, selected, 0), /one clean attempt/);
  assert.throws(() => verifyInputReport({ ...report('physical'), work: [{ status: 'not-run' }] }, selected, 0), /did not finish/);
});
