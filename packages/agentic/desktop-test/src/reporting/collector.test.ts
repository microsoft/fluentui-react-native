import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { DesktopRunReporter } from './collector.js';
import type { DesktopInputLaneReport } from './results.js';

describe('desktop run reporter input lanes', () => {
  const accessible: DesktopInputLaneReport = { input: 'accessible', source: 'option', masking: 'host-masked', policyEnforced: false };
  let artifactsRoot: string;

  beforeEach(() => {
    artifactsRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'furn-desktop-lane-'));
  });

  afterEach(() => {
    fs.rmSync(artifactsRoot, { force: true, recursive: true });
  });

  function start(reporterMode: 'plain' | 'ndjson', lane?: DesktopInputLaneReport) {
    let written = '';
    const output = {
      write: (chunk: string) => {
        written += chunk;
        return true;
      },
    };
    const reporter = new DesktopRunReporter({
      artifactsRoot,
      errorOutput: output,
      output,
      reporterMode,
      summary: false,
      ...(lane ? { lane } : {}),
    });
    return { reporter, output: () => written };
  }

  function unsupported(reporter: DesktopRunReporter, testId: string, gap?: 'unsupported' | 'quarantine'): void {
    reporter.emit({
      kind: 'test-result',
      payload: {
        testId,
        title: testId,
        attempt: 0,
        status: 'unsupported',
        durationMs: 0,
        reason: 'Not available.',
        ...(gap ? { gap } : {}),
      },
    });
  }

  function passed(reporter: DesktopRunReporter, testId: string): void {
    reporter.emit({ kind: 'test-result', payload: { testId, title: testId, attempt: 0, status: 'passed', durationMs: 1 } });
  }

  test('persists the lane and sums exclusions from every producer without selecting them as tests', async () => {
    const { reporter } = start('plain', accessible);
    reporter.emit({ kind: 'selection', payload: { excluded: { platform: 2, scope: 0, input: 5 } } });
    reporter.emit({ kind: 'selection', payload: { excluded: { platform: 1, scope: 1, input: 4 } } });
    passed(reporter, 'case');
    const result = await reporter.finish();

    expect(result).toMatchObject({
      status: 'passed',
      lane: accessible,
      selection: { excluded: { platform: 3, scope: 1, input: 9 } },
      counts: { selected: 1, passed: 1 },
    });
    expect(JSON.parse(fs.readFileSync(path.join(reporter.root, 'run.json'), 'utf8'))).toMatchObject({
      lane: accessible,
      selection: { excluded: { platform: 3, scope: 1, input: 9 } },
    });
  });

  test('counts a keyed selection once, so a retried worker does not double its exclusions', async () => {
    const { reporter } = start('plain', accessible);
    const excluded = { platform: 1, scope: 2, input: 3 };
    reporter.emit({ kind: 'selection', payload: { excluded, key: 'wdio-group' } });
    reporter.emit({ kind: 'selection', payload: { excluded, key: 'wdio-group' } });
    reporter.emit({ kind: 'selection', payload: { excluded: { platform: 0, scope: 0, input: 1 }, key: 'another-group' } });
    passed(reporter, 'case');

    expect(await reporter.finish()).toMatchObject({ selection: { excluded: { platform: 1, scope: 2, input: 4 } } });
  });

  test('omits the selection when no producer reported one', async () => {
    const { reporter } = start('plain', accessible);
    passed(reporter, 'case');

    expect(await reporter.finish()).not.toHaveProperty('selection');
  });

  test('a lane run is incomplete when a case was unsupported without a declaration', async () => {
    const { reporter, output } = start('plain', accessible);
    passed(reporter, 'case');
    unsupported(reporter, 'declared', 'unsupported');
    unsupported(reporter, 'missing');
    reporter.emit({ kind: 'selection', payload: { excluded: { platform: 0, scope: 0, input: 3 } } });
    const result = await reporter.finish();

    expect(result.status).toBe('incomplete');
    expect(output()).toContain('2 unsupported (1 declared, 0 quarantined)');
    expect(output()).toContain('[desktop] input accessible (host-masked) from --input; excluded 0 by platform, 0 by scope, 3 by input');
  });

  test('the same unsupported case does not fail a compatibility run', async () => {
    const { reporter, output } = start('plain');
    passed(reporter, 'case');
    unsupported(reporter, 'missing');
    const result = await reporter.finish();

    expect(result.status).toBe('passed');
    expect(result).not.toHaveProperty('lane');
    expect(output()).not.toContain('excluded');
  });

  test('the ndjson start message names the lane', async () => {
    const { reporter, output } = start('ndjson', accessible);
    passed(reporter, 'case');
    await reporter.finish();

    expect(JSON.parse(output().split('\n')[0])).toMatchObject({ type: 'start', lane: accessible });
  });
});

describe('desktop run reporter final output', () => {
  let artifactsRoot: string;

  beforeEach(() => {
    artifactsRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'furn-desktop-collector-'));
  });

  afterEach(() => {
    fs.rmSync(artifactsRoot, { force: true, recursive: true });
  });

  async function finishFailedRun(ready: boolean): Promise<string> {
    let written = '';
    const output = {
      write: (chunk: string) => {
        written += chunk;
        return true;
      },
    };
    const reporter = new DesktopRunReporter({
      artifactsRoot,
      errorOutput: output,
      kind: 'lifecycle',
      output,
      reporterMode: 'json',
      summary: false,
      suppressFinalOutput: () => ready,
    });
    reporter.fail(new Error('The workload is already claimed.'));
    await reporter.finish();
    return written;
  }

  test('a long-lived command that fails before readiness still writes its summary', async () => {
    const summary = JSON.parse(await finishFailedRun(false));

    expect(summary).toMatchObject({ status: 'failed' });
  });

  test('a ready long-lived command keeps its readiness document as the only output', async () => {
    expect(await finishFailedRun(true)).toBe('');
  });
});
