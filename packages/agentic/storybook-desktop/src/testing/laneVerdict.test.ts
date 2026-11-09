import { assessWdioCohort, hasExecutedWdioCase, describeWdioCounts, type WdioCaseOutcome } from './laneVerdict.js';

const result = (testName: string, status: WdioCaseOutcome['status'], gap?: WdioCaseOutcome['gap']): WdioCaseOutcome => ({
  storyId: 'story',
  testName,
  status,
  ...(gap ? { gap } : {}),
});

describe('WDIO cohort verdict', () => {
  test('a compatibility cohort needs one executed test unless it is optional', () => {
    expect(assessWdioCohort({ results: [result('a', 'passed'), result('b', 'skipped')], selected: 2 })).toMatchObject({
      executed: true,
      incomplete: false,
    });
    expect(assessWdioCohort({ results: [result('a', 'skipped')], selected: 1 })).toMatchObject({
      incomplete: true,
      message: expect.stringContaining('no selected test executed'),
    });
    expect(assessWdioCohort({ results: [result('a', 'unsupported')], selected: 1 })).toMatchObject({ incomplete: true });
    expect(assessWdioCohort({ results: [result('a', 'unsupported')], selected: 1, optional: true })).toMatchObject({ incomplete: false });
    expect(assessWdioCohort({ results: [result('a', 'passed'), result('b', 'unsupported')], selected: 2 })).toMatchObject({
      incomplete: false,
    });
  });

  test('a lane rejects a skip and an undeclared unsupported result, and names them', () => {
    for (const status of ['skipped', 'unsupported'] as const) {
      expect(assessWdioCohort({ results: [result('a', 'passed'), result('b', status)], selected: 2, lane: 'accessible' })).toMatchObject({
        executed: true,
        incomplete: true,
        message: expect.stringContaining('the accessible lane could not run 1 selected tests that have no declared gap (story / b)'),
      });
    }
  });

  test('a lane accepts declared gaps and optional never masks an undeclared one', () => {
    const declared = [result('a', 'passed'), result('b', 'unsupported', 'unsupported'), result('c', 'unsupported', 'quarantine')];
    expect(assessWdioCohort({ results: declared, selected: 3, lane: 'physical' })).toMatchObject({ incomplete: false });
    expect(
      assessWdioCohort({ results: [result('a', 'unsupported', 'unsupported')], selected: 1, lane: 'physical', optional: true }),
    ).toMatchObject({ executed: false, incomplete: false });
    expect(assessWdioCohort({ results: [result('a', 'unsupported')], selected: 1, lane: 'physical', optional: true })).toMatchObject({
      incomplete: true,
    });
    expect(assessWdioCohort({ results: [result('a', 'unsupported', 'unsupported')], selected: 1, lane: 'physical' })).toMatchObject({
      incomplete: true,
      message: expect.stringContaining('no selected test executed'),
    });
  });

  test('selected work that never finished is incomplete in every mode', () => {
    expect(assessWdioCohort({ results: [result('a', 'passed')], selected: 3 })).toMatchObject({
      incomplete: true,
      message: expect.stringContaining('2 of 3 selected tests did not finish'),
    });
  });

  test('counts only passes and failures as executed', () => {
    expect(hasExecutedWdioCase([result('a', 'skipped'), result('b', 'unsupported')])).toBe(false);
    expect(hasExecutedWdioCase([result('a', 'failed')])).toBe(true);
  });

  test('summarizes counts and breaks unsupported down only when present', () => {
    expect(describeWdioCounts([result('a', 'passed'), result('b', 'skipped')])).toBe('1 passed, 0 failed, 1 skipped');
    expect(
      describeWdioCounts([
        result('a', 'passed'),
        result('b', 'unsupported', 'unsupported'),
        result('c', 'unsupported', 'quarantine'),
        result('d', 'unsupported'),
      ]),
    ).toBe('1 passed, 0 failed, 0 skipped, 3 unsupported (1 declared, 1 quarantined)');
  });

  test('counts every status that is not a pass, a skip or unsupported as failed', () => {
    expect(
      describeWdioCounts([
        { status: 'passed' },
        { status: 'failed' },
        { status: 'timed-out' },
        { status: 'cancelled' },
        { status: 'infrastructure-error' },
      ]),
    ).toBe('1 passed, 4 failed, 0 skipped');
  });
});
