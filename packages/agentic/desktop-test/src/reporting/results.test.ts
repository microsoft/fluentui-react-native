import os from 'node:os';
import path from 'node:path';

import {
  describeDesktopSelection,
  describeDesktopUnsupported,
  projectDesktopRunSummary,
  renderJUnit,
  renderRunSummary,
  summarizeDesktopRun,
} from './results.js';
import type { DesktopInputLaneReport, DesktopRunResult, DesktopTestResult } from './results.js';

const accessible: DesktopInputLaneReport = { input: 'accessible', source: 'option', masking: 'host-masked', policyEnforced: true };

function outcome(
  status: DesktopTestResult['status'],
  gap?: 'unsupported' | 'quarantine',
  testId = `${status}-${gap ?? 'plain'}`,
): DesktopTestResult {
  return {
    testId,
    title: testId,
    status,
    flaky: false,
    attempts: [
      {
        attempt: 0,
        status,
        durationMs: 1,
        ...(status === 'passed' ? {} : { reason: 'Not executed.' }),
        ...(gap ? { gap } : {}),
      },
    ],
  };
}

function summarize(
  tests: DesktopTestResult[],
  extra: { lane?: DesktopInputLaneReport; optional?: boolean; kind?: 'tests' | 'lifecycle' } = {},
): DesktopRunResult {
  const { lane, optional, kind = 'tests' } = extra;
  return summarizeDesktopRun({
    schemaVersion: 1,
    runId: 'run-id',
    kind,
    startedAt: new Date(0).toISOString(),
    finishedAt: new Date(1).toISOString(),
    durationMs: 1,
    ...(lane ? { lane } : {}),
    ...(optional !== undefined ? { optional } : {}),
    tests,
    work: [],
    failures: [],
    artifacts: [],
  });
}

describe('input lane verdicts', () => {
  test('compatibility runs keep skipped and unsupported cases non-blocking', () => {
    expect(summarize([outcome('passed'), outcome('skipped'), outcome('unsupported')]).status).toBe('passed');
  });

  test.each([
    ['unsupported', 'declaredUnsupported'],
    ['quarantine', 'quarantined'],
  ] as const)('a declared %s gap is a deliberate gap, not a lane failure', (gap, subset) => {
    const result = summarize([outcome('passed'), outcome('unsupported', gap)], { lane: accessible });

    expect(result.status).toBe('passed');
    expect(result.counts).toMatchObject({
      unsupported: 1,
      declaredUnsupported: Number(gap === 'unsupported'),
      quarantined: Number(gap === 'quarantine'),
    });
    expect(result.counts[subset]).toBe(1);
  });

  test('an undeclared unsupported case means the lane did not cover its selection', () => {
    const result = summarize([outcome('passed'), outcome('unsupported')], { lane: accessible });

    expect(result.status).toBe('incomplete');
    expect(result.counts).toMatchObject({ unsupported: 1, declaredUnsupported: 0, quarantined: 0 });
  });

  test('a skipped case means the lane did not cover its selection', () => {
    expect(summarize([outcome('passed'), outcome('skipped')], { lane: accessible }).status).toBe('incomplete');
  });

  test('optional never masks a lane that skipped or executed nothing', () => {
    expect(summarize([outcome('passed'), outcome('skipped')], { lane: accessible, optional: true }).status).toBe('incomplete');
    expect(summarize([outcome('unsupported', 'unsupported')], { lane: accessible, optional: true }).status).toBe('incomplete');
    expect(summarize([outcome('skipped')], { optional: true }).status).toBe('skipped');
  });

  test('an empty lane selection is incomplete', () => {
    expect(summarize([], { lane: accessible }).status).toBe('incomplete');
  });

  test('failures still fail a lane run', () => {
    const failed = outcome('failed');
    failed.attempts[0].failure = { failureId: 'f', kind: 'test', error: { name: 'Error', message: 'boom' } };

    expect(summarize([outcome('passed'), failed], { lane: accessible }).status).toBe('failed');
  });

  test('lifecycle runs ignore the lane', () => {
    expect(summarize([], { lane: accessible, kind: 'lifecycle' }).status).toBe('passed');
  });
});

describe('input lane and exclusion reporting', () => {
  const selection = { excluded: { platform: 2, scope: 1, input: 7 } };
  const result = (): DesktopRunResult => ({
    ...summarize([outcome('passed'), outcome('unsupported', 'unsupported'), outcome('unsupported', 'quarantine', 'quarantined-case')], {
      lane: accessible,
    }),
    selection,
  });

  test('names the lane, its source and each exclusion on one line', () => {
    expect(describeDesktopSelection(result())).toBe(
      'input accessible (policy-enforced, host-masked) from --input; excluded 2 by platform, 1 by scope, 7 by input',
    );
    expect(describeDesktopSelection({ lane: { input: 'physical', source: 'environment', policyEnforced: true } })).toBe(
      'input physical pilot (policy-enforced) from DESKTOP_INPUT',
    );
    expect(describeDesktopSelection({ lane: { input: 'accessible', source: 'driver', policyEnforced: true } })).toBe(
      'input accessible (policy-enforced) from the driver instance',
    );
    // A report written before enforcement still reads as what it was.
    expect(
      describeDesktopSelection({ lane: { input: 'accessible', source: 'driver', masking: 'verified-masked', policyEnforced: false } }),
    ).toBe('input accessible (verified-masked) from the driver instance');
    expect(describeDesktopSelection({ lane: { input: 'physical', source: 'environment', policyEnforced: false } })).toBe(
      'input physical pilot from DESKTOP_INPUT',
    );
    expect(describeDesktopSelection({})).toBeUndefined();
  });

  test('breaks unsupported cases into declared and quarantined', () => {
    expect(describeDesktopUnsupported(result().counts)).toBe('2 unsupported (1 declared, 1 quarantined)');
  });

  test('JUnit records the lane and exclusions and labels declared gaps', () => {
    const xml = renderJUnit(result());

    expect(xml).toContain('<property name="desktop.input" value="accessible"/>');
    expect(xml).toContain('<property name="desktop.input.label" value="accessible (policy-enforced, host-masked)"/>');
    expect(xml).toContain('<property name="desktop.input.source" value="option"/>');
    expect(xml).toContain('<property name="desktop.excluded.platform" value="2"/>');
    expect(xml).toContain('<property name="desktop.excluded.input" value="7"/>');
    expect(xml).toContain('<skipped message="declared unsupported: Not executed."/>');
    expect(xml).toContain('<skipped message="quarantined: Not executed."/>');
    expect(xml).toContain('skipped="2"');
  });

  test('JUnit stays free of lane properties for compatibility runs', () => {
    expect(renderJUnit(summarize([outcome('passed')]))).not.toContain('<properties>');
  });

  test('the Markdown summary leads with the selection and splits unsupported counts', () => {
    const markdown = renderRunSummary(result());

    expect(markdown).toContain(
      'Selection: input accessible (policy-enforced, host-masked) from --input; excluded 2 by platform, 1 by scope, 7 by input.',
    );
    expect(markdown).toContain('2 unsupported (1 declared, 1 quarantined)');
    expect(markdown).toContain('declared unsupported: Not executed.');
  });

  test('the bounded summary carries the lane and exclusions', () => {
    const summary = projectDesktopRunSummary(result(), path.join(os.tmpdir(), 'desktop-artifacts', 'run-id'));

    expect(summary.lane).toEqual(accessible);
    expect(summary.excluded).toEqual(selection.excluded);
    expect(summary.skippedReasons).toContain('declared unsupported: Not executed.');
    expect(Buffer.byteLength(JSON.stringify(summary))).toBeLessThanOrEqual(4 * 1024);
  });
});

describe('bounded desktop run summary', () => {
  test('keeps large suites and failure messages within the document limit', () => {
    const longMessage = 'failure '.repeat(128 * 1024);
    const tests = Array.from({ length: 10_000 }, (_, index) => ({
      testId: `test-${index}`,
      title: index === 0 ? longMessage : `Test ${index}`,
      status: 'failed' as const,
      flaky: false,
      attempts: [
        {
          attempt: 0,
          status: 'failed' as const,
          durationMs: 1,
          failure: { failureId: `failure-${index}`, kind: 'test' as const, error: { name: 'Error', message: longMessage } },
        },
      ],
    }));
    const result = summarizeDesktopRun({
      schemaVersion: 1,
      runId: 'run-id',
      kind: 'tests',
      startedAt: new Date(0).toISOString(),
      finishedAt: new Date(1).toISOString(),
      durationMs: 1,
      tests,
      work: [],
      failures: Array.from({ length: 1_000 }, (_, index) => ({
        failureId: `infrastructure-${index}`,
        kind: 'infrastructure' as const,
        error: { name: 'Error', message: `Failure ${index}` },
      })),
      artifacts: [
        { path: 'events.jsonl', description: 'event journal' },
        { path: 'run.json', description: 'result' },
        { path: 'junit.xml', description: 'JUnit' },
      ],
    });
    const root = path.join(os.tmpdir(), 'desktop-artifacts', 'run-id');
    const summary = projectDesktopRunSummary(result, root);

    expect(summary.problems.length).toBeLessThanOrEqual(10);
    expect(summary.omissions.problems).toBeGreaterThan(0);
    expect(Buffer.byteLength(JSON.stringify(summary))).toBeLessThanOrEqual(4 * 1024);
    expect(summary.artifacts.runJson).toBe(path.join(root, 'run.json'));
  });
});
