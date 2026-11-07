import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { once } from 'node:events';

import { DesktopRunReporter } from './collector.js';

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
