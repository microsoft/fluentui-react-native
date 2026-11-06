import assert from 'node:assert/strict';
import { test } from 'node:test';

import { assertCatalogMatches, parseInputCatalog, readInputMode, selectedInputTests, verifyInputReport } from './input-test-modes.mts';

const catalog = {
  schemaVersion: 1,
  endpoint: 'win32',
  stories: [
    { storyId: 'fixture--default', both: ['semantics'], accessibility: ['native action'], physical: ['keyboard'] },
    { storyId: 'fixture--second', physical: ['semantics', 'quarantined'] },
  ],
  quarantines: [{ storyId: 'fixture--second', testName: 'quarantined', reason: 'Existing issue #4373.' }],
};

function report(mode: 'accessibility' | 'physical') {
  const selected = selectedInputTests(mode, parseInputCatalog(catalog));
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
  const parsed = parseInputCatalog(catalog);
  assert.deepEqual(
    selectedInputTests('accessibility', parsed).map(({ testName }) => testName),
    ['native action', 'semantics'],
  );
  assert.deepEqual(
    selectedInputTests('physical', parsed).map(({ testName }) => testName),
    ['keyboard', 'semantics', 'semantics', 'quarantined'],
  );
  assert.throws(() => readInputMode('automatic'), /STORYBOOK_INPUT_MODE/);
});

test('rejects duplicate, unknown-mode, and unclassified or stale callback declarations', () => {
  const duplicate = structuredClone(catalog);
  duplicate.stories[0].physical.push('semantics');
  assert.throws(() => parseInputCatalog(duplicate), /unique callback/);
  assert.throws(() => parseInputCatalog({ ...catalog, stories: [{ storyId: 'fixture', accidental: ['case'] }] }), /Unknown input-mode/);
  const discovery = [
    { id: 'fixture--default', tests: ['semantics', 'native action', 'keyboard'] },
    { id: 'fixture--second', tests: ['semantics', 'quarantined'] },
  ];
  assert.doesNotThrow(() => assertCatalogMatches(discovery, parseInputCatalog(catalog)));
  assert.throws(
    () => assertCatalogMatches([...discovery, { id: 'new', tests: ['unclassified'] }], parseInputCatalog(catalog)),
    /Unclassified/,
  );
  assert.throws(() => assertCatalogMatches(discovery.slice(0, 1), parseInputCatalog(catalog)), /Stale declarations/);
});

test('accepts complete execution and reports the existing exact quarantine as unvalidated', () => {
  const parsed = parseInputCatalog(catalog);
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
  const selected = selectedInputTests('accessibility', parseInputCatalog(catalog));
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
  const selected = selectedInputTests('physical', parseInputCatalog(catalog));
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
