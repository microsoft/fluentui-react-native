import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { once } from 'node:events';

import { DesktopRunReporter } from './collector.js';
import type { DesktopInputLaneReport } from './results.js';

describe('desktop run reporter input lanes', () => {
  const accessible: DesktopInputLaneReport = { input: 'accessible', source: 'option', masking: 'host-masked', policyEnforced: true };
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
    expect(output()).toContain(
      '[desktop] input accessible (policy-enforced, host-masked) from --input; excluded 0 by platform, 0 by scope, 3 by input',
    );
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
  const platform = process.platform;
  let artifactsRoot: string;

  beforeEach(() => {
    artifactsRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'furn-desktop-collector-'));
  });

  afterEach(() => {
    jest.restoreAllMocks();
    Object.defineProperty(process, 'platform', { value: platform });
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

  function createLifecycleReporter(): DesktopRunReporter {
    return new DesktopRunReporter({
      artifactsRoot,
      kind: 'lifecycle',
      output: { write: () => true },
      errorOutput: { write: () => true },
      reporterMode: 'json',
      summary: false,
    });
  }

  (process.platform === 'win32' ? test : test.skip)(
    'atomic report replacement survives a short Windows reader without delete sharing',
    async () => {
      const reporter = createLifecycleReporter();
      const reader = spawn(
        'pwsh',
        [
          '-NoProfile',
          '-NonInteractive',
          '-Command',
          '$file = [IO.File]::Open($env:DESKTOP_REPORT_LOCK_PATH, [IO.FileMode]::Open, [IO.FileAccess]::Read, [IO.FileShare]::Read); try { [Console]::WriteLine("locked"); Start-Sleep -Milliseconds 100 } finally { $file.Dispose() }',
        ],
        { env: { ...process.env, DESKTOP_REPORT_LOCK_PATH: path.join(reporter.root, 'run.json') } },
      );
      const closed = once(reader, 'close');
      try {
        const [ready] = await Promise.race([
          once(reader.stdout, 'data'),
          closed.then(() => {
            throw new Error('Report reader exited before acquiring its file lock.');
          }),
        ]);
        expect(String(ready).trim()).toBe('locked');
        await expect(reporter.finish()).resolves.toMatchObject({ terminal: true, status: 'passed', failures: [] });
      } finally {
        expect(await closed).toEqual([0, null]);
      }
    },
  );

  test.each(['EPERM', 'EACCES'])('retries transient Windows %s without dropping atomic replacement or diagnostics', async (code) => {
    const reporter = createLifecycleReporter();
    Object.defineProperty(process, 'platform', { value: 'win32' });
    const wait = jest.spyOn(Atomics, 'wait').mockReturnValue('timed-out');
    const rename = fs.renameSync;
    let attempts = 0;
    const file = path.join(reporter.root, 'run.json');
    const previous = fs.readFileSync(file, 'utf8');
    jest.spyOn(fs, 'renameSync').mockImplementation((source, destination) => {
      if (destination === file && attempts++ < 2) {
        expect(fs.readFileSync(file, 'utf8')).toBe(previous);
        throw Object.assign(new Error('Transient sharing conflict'), { code });
      }
      return rename(source, destination);
    });

    await expect(reporter.finish()).resolves.toMatchObject({ terminal: true, status: 'passed', failures: [] });
    expect(wait).toHaveBeenCalledTimes(2);
    expect(fs.readFileSync(path.join(reporter.root, 'events.jsonl'), 'utf8')).toContain('recovered after 2 Windows sharing retries');
    expect(JSON.parse(fs.readFileSync(file, 'utf8'))).toMatchObject({ terminal: true, status: 'passed' });
  });

  test.each([
    ['win32', 'EPERM', 10],
    ['win32', 'EACCES', 10],
    ['win32', 'EIO', 0],
    ['linux', 'EPERM', 0],
  ])('retains failed replacement on %s/%s after %i retries even if later writes recover', async (platform, code, retries) => {
    const reporter = createLifecycleReporter();
    Object.defineProperty(process, 'platform', { value: platform });
    const wait = jest.spyOn(Atomics, 'wait').mockReturnValue('timed-out');
    const rename = fs.renameSync;
    const injected = jest.spyOn(fs, 'renameSync').mockImplementation((source, destination) => {
      if (destination === path.join(reporter.root, 'run.json')) throw Object.assign(new Error('Persistent rename failure'), { code });
      return rename(source, destination);
    });
    reporter.emit({ kind: 'diagnostic', payload: { level: 'info', message: 'Queue an active snapshot.' } });
    await reporter.flush();
    expect(wait).toHaveBeenCalledTimes(retries);
    expect(JSON.parse(fs.readFileSync(path.join(reporter.root, 'run.json'), 'utf8'))).toMatchObject({ terminal: false });
    injected.mockRestore();
    await expect(reporter.finish()).resolves.toMatchObject({
      terminal: true,
      status: 'failed',
      failures: [expect.objectContaining({ kind: 'reporting', error: expect.objectContaining({ message: 'Persistent rename failure' }) })],
    });
  });
});
