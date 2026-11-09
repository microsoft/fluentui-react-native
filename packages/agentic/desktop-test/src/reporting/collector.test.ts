import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
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

describe('desktop run reporter operation output', () => {
  let artifactsRoot: string;
  let out: string;
  let err: string;

  beforeEach(() => {
    artifactsRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'furn-desktop-operations-'));
    out = '';
    err = '';
  });

  afterEach(() => {
    fs.rmSync(artifactsRoot, { force: true, recursive: true });
  });

  function start({
    mode = 'plain',
    verbose = false,
    kind = 'lifecycle',
  }: { mode?: 'plain' | 'github-actions'; verbose?: boolean; kind?: 'tests' | 'lifecycle' } = {}): DesktopRunReporter {
    return new DesktopRunReporter({
      artifactsRoot,
      kind,
      output: { write: (chunk: string) => ((out += chunk), true) },
      errorOutput: { write: (chunk: string) => ((err += chunk), true) },
      reporterMode: mode,
      summary: false,
      verbose,
    });
  }

  // A command as the supervisor reports it: a scope named for the command, with its output kept in a log. Returns the log path.
  function command(
    reporter: DesktopRunReporter,
    label: string,
    log: string,
    { status = 'passed', summary }: { status?: 'passed' | 'failed'; summary?: string } = {},
  ): string {
    const id = `command-${randomUUID()}`;
    const emit = reporter.source(id);
    const relative = `commands/${id}.log`;
    fs.mkdirSync(path.join(reporter.root, 'commands'), { recursive: true });
    fs.writeFileSync(path.join(reporter.root, relative), log);
    emit({ kind: 'scope-start', payload: { label, category: 'phase' } }, id);
    emit({ kind: 'artifact', payload: { path: relative, description: `${label} log` } }, id);
    emit({ kind: 'output', payload: { stream: 'stdout', text: 'compiling\n' } }, id);
    emit({ kind: 'output', payload: { stream: 'stderr', text: 'warning: careful\n' } }, id);
    emit({ kind: 'scope-end', payload: { status, logPath: relative, ...(summary ? { summary } : {}) } }, id);
    emit({ kind: 'producer-finished', payload: { status } }, id);
    return path.join(reporter.root, relative);
  }

  test('a passing command prints one header and keeps its output in the log', async () => {
    const reporter = start();
    command(reporter, 'pod install', '$ pod install\n[stdout] compiling\n');
    await reporter.flush();

    expect(out).toMatch(/^✔ pod install \([^)]+\)\n$/);
    expect(err).toBe('');
  });

  test('a failed command prints its header, the end of its log, and where the whole log is', async () => {
    const reporter = start();
    const file = command(reporter, 'xcodebuild', '$ xcodebuild\n[stdout] compiling\n[stderr] error: boom\n', {
      status: 'failed',
      summary: 'exit code 65',
    });
    await reporter.flush();

    const [header, ...detail] = err.split('\n');
    expect(header).toMatch(/^✖ xcodebuild \([^)]+\): exit code 65$/);
    expect(detail).toEqual(['  $ xcodebuild', '  [stdout] compiling', '  [stderr] error: boom', `  Full log: ${file}`, '']);
    expect(out).toBe('');
  });

  test('a failed command with a long log shows the first line and the last two hundred lines', async () => {
    const reporter = start();
    const log = ['$ build', ...Array.from({ length: 300 }, (_, index) => `[stdout] line ${index}`)].join('\n') + '\n';
    command(reporter, 'build', log, { status: 'failed' });
    await reporter.flush();

    const shown = err.split('\n');
    expect(shown.slice(1, 4)).toEqual(['  $ build', '  earlier output omitted', '  [stdout] line 100']);
    expect(shown).toContain('  [stdout] line 299');
    expect(shown).not.toContain('  [stdout] line 99');
  });

  test('a failed command whose log cannot be read still reports where the log should be', async () => {
    const reporter = start();
    const emit = reporter.source('command-missing');
    emit({ kind: 'scope-start', payload: { label: 'missing', category: 'phase' } }, 'command-missing');
    emit({ kind: 'scope-end', payload: { status: 'failed', logPath: 'commands/missing.log' } }, 'command-missing');
    emit({ kind: 'producer-finished', payload: { status: 'failed' } }, 'command-missing');
    await reporter.flush();

    expect(err).toContain('  log unavailable: ');
    expect(err).toContain(`  Full log: ${path.join(reporter.root, 'commands', 'missing.log')}\n`);
  });

  test('redacts secrets from the log it prints', async () => {
    const reporter = start();
    reporter.addSecret('hunter2');
    command(reporter, 'login', '$ login\n[stderr] bad password hunter2\n', { status: 'failed', summary: 'exit code 1' });
    await reporter.flush();

    expect(err).toContain('  [stderr] bad password [REDACTED]\n');
    expect(err).not.toContain('hunter2');
  });

  test('a verbose run streams a command and then reports only its header', async () => {
    const reporter = start({ verbose: true });
    const file = command(reporter, 'pod install', '$ pod install\n');
    await reporter.flush();

    const lines = out.split('\n');
    expect(lines.slice(0, 3)).toEqual(['▶ pod install', `[pod install] artifact: ${file}`, '[pod install] stdout: compiling']);
    expect(lines[3]).toMatch(/^✔ pod install \([^)]+\)$/);
    expect(lines).toHaveLength(5);
    expect(err).toBe('[pod install] stderr: warning: careful\n');
  });

  test('a verbose run names the log of a failed command without repeating what it streamed', async () => {
    const reporter = start({ verbose: true });
    const file = command(reporter, 'xcodebuild', '$ xcodebuild\n[stdout] compiling\n', { status: 'failed', summary: 'exit code 65' });
    await reporter.flush();

    expect(err).toMatch(/^\[xcodebuild\] stderr: warning: careful\n✖ xcodebuild \([^)]+\): exit code 65\n {2}Full log: /);
    expect(err.endsWith(`  Full log: ${file}\n`)).toBe(true);
    expect(err).not.toContain('[stdout] compiling');
    expect(out + err).not.toContain('[command-');
  });

  test('in GitHub Actions a passing command folds its log into a collapsed group', async () => {
    const reporter = start({ mode: 'github-actions' });
    const file = command(reporter, 'pod install', '$ pod install\n[stdout] compiling\n');
    await reporter.flush();

    const [title, ...body] = out.split('\n');
    expect(title).toMatch(/^::group::✔ pod install \([^)]+\)$/);
    expect(body).toEqual(['$ pod install', '[stdout] compiling', `Full log: ${file}`, '::endgroup::', '']);
    expect(err).toBe('');
  });

  test('in GitHub Actions a failed command is expanded where it can be seen, not grouped', async () => {
    const reporter = start({ mode: 'github-actions' });
    command(reporter, 'xcodebuild', '$ xcodebuild\n[stderr] error: boom\n', { status: 'failed', summary: 'exit code 65' });
    await reporter.flush();

    expect(out).toBe('');
    expect(err).toMatch(/^✖ xcodebuild \([^)]+\): exit code 65\n {2}\$ xcodebuild\n {2}\[stderr\] error: boom\n {2}Full log: /);
    expect(err).not.toContain('::group::');
  });

  test('a collapsed group keeps the first line and the last thousand lines of a long log', async () => {
    const reporter = start({ mode: 'github-actions' });
    const log = ['$ build', ...Array.from({ length: 1200 }, (_, index) => `[stdout] line ${index}`)].join('\n') + '\n';
    command(reporter, 'build', log);
    await reporter.flush();

    const lines = out.split('\n');
    expect(lines.slice(1, 4)).toEqual(['$ build', 'earlier output omitted', '[stdout] line 200']);
    expect(lines.at(-4)).toBe('[stdout] line 1199');
    expect(lines).not.toContain('[stdout] line 199');
  });

  test('a verbose run in GitHub Actions is live and ungrouped', async () => {
    const reporter = start({ mode: 'github-actions', verbose: true });
    command(reporter, 'pod install', '$ pod install\n');
    await reporter.flush();

    expect(out).toContain('[pod install] stdout: compiling\n');
    expect(out).not.toContain('::group::');
  });

  test('output cannot issue workflow commands, so it needs no stop-commands wrapper', async () => {
    const reporter = start({ mode: 'github-actions' });
    command(reporter, 'pod install', '$ pod install\n::warning::from the log\n  ##[error]also from the log\n');
    reporter.emit({ kind: 'diagnostic', payload: { level: 'info', message: '::add-mask::value' } });
    reporter.emit({ kind: 'output', payload: { stream: 'stderr', text: '::set-env name=A::B\n' } });
    await reporter.flush();

    expect(out).toContain(': :add-mask::value\n');
    expect(out).toContain(': :warning::from the log\n');
    expect(out).toContain('  # #[error]also from the log\n');
    expect(err).toBe(': :set-env name=A::B\n');
    expect(out + err).not.toContain('##[');
    // Only the group that the reporter wrote itself remains a command.
    const commands = (out + err).split('\n').filter((line) => line.trimStart().startsWith('::'));
    expect(commands).toHaveLength(2);
    expect(commands[0]).toMatch(/^::group::/);
    expect(commands[1]).toBe('::endgroup::');
  });

  test('a finished run has no stop-commands wrappers, doubled line breaks, or command identifiers', async () => {
    const reporter = start({ mode: 'github-actions', verbose: true });
    command(reporter, 'pod install', '$ pod install\n[stdout] compiling\n');
    command(reporter, 'xcodebuild', '$ xcodebuild\n[stderr] error: boom\n', { status: 'failed', summary: 'exit code 65' });
    reporter.emit({ kind: 'diagnostic', payload: { level: 'warning', message: 'careful' } });
    await reporter.finish();

    expect(out + err).not.toContain('::stop-commands::');
    expect(out + err).not.toContain('\n\n');
    expect(out + err).not.toContain('[command-');
  });

  test('a failure is annotated once in GitHub Actions and titled for the source that reported it', async () => {
    const reporter = start({ mode: 'github-actions' });
    const error = new Error('workload claimed');
    reporter.fail(error);
    reporter.fail(error);
    const emit = reporter.source('command-install');
    emit({ kind: 'scope-start', payload: { label: 'pod install', category: 'phase' } }, 'command-install');
    emit(
      { kind: 'diagnostic', payload: { level: 'error', message: 'exit 1', failure: reporter.failure(new Error('exit 1')) } },
      'command-install',
    );
    await reporter.flush();

    const annotations = err.split('\n').filter((line) => line.startsWith('::error'));
    expect(annotations).toHaveLength(2);
    expect(annotations[0]).toMatch(/^::error title=desktop%3A infrastructure::Error: workload claimed/);
    expect(annotations[1]).toMatch(/^::error title=pod install%3A infrastructure::Error: exit 1/);
    expect(err).toContain('error: workload claimed\n');
    expect(err).toContain('[pod install] error: exit 1\n');
  });

  test('a plain run reports problems and retries but not routine progress', async () => {
    const reporter = start({ kind: 'tests' });
    const failure = reporter.failure(new Error('expected 1'), 'test');
    const begin = (testId: string, attempt: number) => reporter.emit({ kind: 'test-start', payload: { testId, title: testId, attempt } });
    const finish = (testId: string, attempt: number, status: 'passed' | 'failed' | 'skipped', extra: object = {}) =>
      reporter.emit({ kind: 'test-result', payload: { testId, title: testId, attempt, status, durationMs: 1, ...extra } });
    begin('one', 0);
    finish('one', 0, 'passed');
    begin('two', 0);
    finish('two', 0, 'failed', { reason: 'expected 1', failure });
    begin('two', 1);
    finish('two', 1, 'passed');
    finish('three', 0, 'skipped', { reason: 'not on this platform' });
    await reporter.flush();

    expect(out).toBe('FAILED two: expected 1\nTEST two (attempt 2)\nPASSED two\n');
    expect(err).toMatch(/^Error: expected 1/);
  });

  test('a verbose run reports every test', async () => {
    const reporter = start({ kind: 'tests', verbose: true });
    reporter.emit({ kind: 'test-start', payload: { testId: 'one', title: 'one', attempt: 0 } });
    reporter.emit({ kind: 'test-result', payload: { testId: 'one', title: 'one', attempt: 0, status: 'passed', durationMs: 1 } });
    reporter.emit({
      kind: 'test-result',
      payload: { testId: 'three', title: 'three', attempt: 0, status: 'skipped', durationMs: 0, reason: 'not on this platform' },
    });
    await reporter.flush();

    expect(out).toBe('TEST one (attempt 1)\nPASSED one\nSKIPPED three: not on this platform\n');
  });

  test('a service line names the service and endpoint but no identifier', async () => {
    const reporter = start();
    reporter.emit({ kind: 'service-ready', payload: { message: 'listening on 8081' } }, 'metro', { service: 'metro', endpoint: 'macos' });
    await reporter.flush();

    expect(out).toBe('[metro macos] READY listening on 8081\n');
  });

  test('a lifecycle run with no tests ends with one status line', async () => {
    const reporter = start();
    await reporter.finish();

    expect(out).toBe(`[desktop] PASSED: lifecycle (no tests); ${path.join(reporter.root, 'run.json')}\n`);
  });
});
