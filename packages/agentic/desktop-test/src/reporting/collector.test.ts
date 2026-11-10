import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { Writable } from 'node:stream';

import { DesktopRunReporter } from './collector.js';
import { DesktopIncompleteError, DesktopReportedError } from './protocol.js';
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

describe('desktop run reporter verdicts', () => {
  let artifactsRoot: string;
  let out: string;
  let err: string;

  beforeEach(() => {
    artifactsRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'furn-desktop-verdicts-'));
    out = '';
    err = '';
  });

  afterEach(() => {
    jest.restoreAllMocks();
    delete process.env.GITHUB_STEP_SUMMARY;
    fs.rmSync(artifactsRoot, { force: true, recursive: true });
  });

  type Options = Partial<ConstructorParameters<typeof DesktopRunReporter>[0]>;

  function start(options: Options = {}): DesktopRunReporter {
    return new DesktopRunReporter({
      artifactsRoot,
      output: { write: (chunk: string) => ((out += chunk), true) },
      errorOutput: { write: (chunk: string) => ((err += chunk), true) },
      reporterMode: 'plain',
      summary: false,
      ...options,
    });
  }

  function result(
    reporter: DesktopRunReporter,
    testId: string,
    status: 'passed' | 'failed' | 'skipped' | 'unsupported' | 'incomplete',
    attempt = 0,
    parent?: string,
    scope?: string,
  ): void {
    reporter.emit(
      {
        kind: 'test-result',
        payload: {
          testId,
          title: testId,
          attempt,
          status,
          durationMs: 1,
          ...(status === 'failed' ? { failure: reporter.failure(new Error(`${testId} failed`), 'test') } : {}),
          ...(status === 'passed' ? {} : { reason: `${testId} ${status}` }),
        },
      },
      scope,
      undefined,
      parent,
    );
  }

  /** A WDIO-style producer: selected work whose worker scope reports its tests (or none). */
  function worker(reporter: DesktopRunReporter, workId: string, testIds: string[] = []): void {
    const source = `wdio-${randomUUID()}`;
    const emit = reporter.source(source);
    reporter.emit({ kind: 'work-selected', payload: { workId, label: workId } });
    emit({ kind: 'scope-start', payload: { label: `${workId} worker`, category: 'worker' } }, source, undefined, workId);
    for (const testId of testIds) {
      emit({ kind: 'test-result', payload: { testId, title: testId, attempt: 0, status: 'passed', durationMs: 1 } }, source);
    }
    emit({ kind: 'scope-end', payload: { status: 'passed' } }, source, undefined, workId);
    emit({ kind: 'producer-finished', payload: { status: 'passed' } }, source);
  }

  describe('retried tests', () => {
    test.each(['skipped', 'unsupported', 'incomplete'] as const)(
      'a failed attempt followed only by a %s one stays failed',
      async (status) => {
        const reporter = start({ kind: 'tests' });
        result(reporter, 'one', 'passed');
        result(reporter, 'masked', 'failed', 0);
        result(reporter, 'masked', status, 1);
        const final = await reporter.finish();

        expect(final.tests.find(({ testId }) => testId === 'masked')).toMatchObject({ status: 'failed', flaky: false });
        expect(final.status).toBe('failed');
        expect(final.counts).toMatchObject({ failed: 1, passed: 1, skipped: 0 });
        expect(fs.readFileSync(path.join(reporter.root, 'junit.xml'), 'utf8')).toContain('<failure message="masked failed">');
      },
    );

    test('a retry that passes makes the test flaky and a skipped retry after a pass cannot undo it', async () => {
      const reporter = start({ kind: 'tests' });
      result(reporter, 'flaky', 'failed', 0);
      result(reporter, 'flaky', 'passed', 1);
      const final = await reporter.finish();

      expect(final.tests[0]).toMatchObject({ status: 'passed', flaky: true });
      expect(final.status).toBe('passed');
    });

    test('attempts keep their arrival order whatever numbers the producer gives them', async () => {
      const reporter = start({ kind: 'tests' });
      result(reporter, 'case', 'failed', 3_000_000);
      result(reporter, 'case', 'failed', 1_000_000);
      result(reporter, 'case', 'passed', 2_000_000);
      const final = await reporter.finish();

      expect(final.tests[0].attempts.map(({ attempt }) => attempt)).toEqual([3_000_000, 1_000_000, 2_000_000]);
      expect(final.tests[0]).toMatchObject({ status: 'passed', flaky: true });
    });
  });

  describe('selected work that produced no tests', () => {
    test('an empty worker group is incomplete, with the reason, and cannot be asserted as covered', async () => {
      const reporter = start({ kind: 'tests' });
      worker(reporter, 'covered', ['real-test']);
      worker(reporter, 'empty');
      const final = await reporter.finish();

      expect(final.status).toBe('incomplete');
      expect(final.work.find(({ workId }) => workId === 'empty')).toMatchObject({
        status: 'incomplete',
        reason: 'No tests were reported for this work.',
      });
      expect(final.work.find(({ workId }) => workId === 'covered')).toMatchObject({ status: 'passed' });
      expect(() => reporter.assertSuccessful(['empty'])).toThrow(DesktopIncompleteError);
      expect(() => reporter.assertSuccessful(['covered'])).not.toThrow();
      expect(fs.readFileSync(path.join(reporter.root, 'junit.xml'), 'utf8')).toContain('No tests were reported for this work.');
    });

    test('selected work that never started is a fault, not a coverage gap', async () => {
      const reporter = start({ kind: 'tests' });
      reporter.emit({ kind: 'work-selected', payload: { workId: 'never', label: 'never ran' } });
      worker(reporter, 'covered', ['real-test']);
      await reporter.finish();

      expect(() => reporter.assertSuccessful(['never'])).toThrow('never ran: work is not-run');
      expect(() => reporter.assertSuccessful(['never'])).not.toThrow(DesktopIncompleteError);
    });

    test('a group that declared its exclusions ran what it was asked to, and phase work needs no tests', async () => {
      const reporter = start({ kind: 'tests' });
      worker(reporter, 'covered', ['real-test']);
      worker(reporter, 'filtered');
      reporter.emit({ kind: 'selection', payload: { excluded: { platform: 3, scope: 0, input: 0 }, key: 'filtered' } });
      reporter.emit({ kind: 'work-selected', payload: { workId: 'smoke', label: 'smoke' } });
      const phase = reporter.source('phase');
      phase({ kind: 'scope-start', payload: { label: 'smoke', category: 'phase' } }, 'phase', undefined, 'smoke');
      phase({ kind: 'scope-end', payload: { status: 'passed' } }, 'phase', undefined, 'smoke');
      phase({ kind: 'producer-finished', payload: { status: 'passed' } }, 'phase');
      const final = await reporter.finish();

      expect(final.work.map(({ workId, status }) => [workId, status])).toEqual([
        ['covered', 'passed'],
        ['filtered', 'passed'],
        ['smoke', 'passed'],
      ]);
      expect(final.status).toBe('passed');
    });
  });

  describe('typed incomplete errors', () => {
    test('are the run verdict, not an infrastructure failure, when the run is already incomplete', async () => {
      const reporter = start({ kind: 'tests' });
      worker(reporter, 'empty');
      const error = new DesktopIncompleteError('selected work produced no tests');
      reporter.fail(error);
      reporter.fail(error);
      const final = await reporter.finish();

      expect(final.failures).toEqual([]);
      expect(final.status).toBe('incomplete');
      expect(fs.readFileSync(path.join(reporter.root, 'events.jsonl'), 'utf8')).toContain('selected work produced no tests');
    });

    test('become a failure when nothing else would stop the run from passing', async () => {
      const reporter = start({ kind: 'lifecycle' });
      reporter.fail(new DesktopIncompleteError('a gap nothing else recorded'));
      const final = await reporter.finish();

      expect(final.status).toBe('failed');
      expect(final.failures).toHaveLength(1);
    });

    test('raised while other work is still running do not vanish when that work later passes', async () => {
      const reporter = start({ kind: 'lifecycle' });
      const busy = reporter.source('busy');
      reporter.fail(new DesktopIncompleteError('a gap nothing else recorded'));
      busy({ kind: 'producer-finished', payload: { status: 'passed' } });
      const final = await reporter.finish();

      expect(final.status).toBe('failed');
      expect(final.failures).toHaveLength(1);
    });

    test('are relayed from a delegated reporter by name', async () => {
      const reporter = start({ kind: 'tests' });
      worker(reporter, 'empty');
      const relayed = new DesktopReportedError({
        failureId: randomUUID(),
        kind: 'infrastructure',
        error: { name: 'DesktopIncompleteError', message: 'relayed incomplete' },
      });
      reporter.fail(relayed);
      expect((await reporter.finish()).failures).toEqual([]);
    });

    test('reported by a producer as a failure are a warning only when the run already carries the verdict', async () => {
      const incomplete = (reporter: DesktopRunReporter) => {
        const emit = reporter.source('delegate');
        emit({
          kind: 'diagnostic',
          payload: {
            level: 'error',
            message: 'no coverage',
            failure: { failureId: randomUUID(), kind: 'infrastructure', error: { name: 'DesktopIncompleteError', message: 'no coverage' } },
          },
        });
        emit({ kind: 'producer-finished', payload: { status: 'failed' } });
      };
      const carried = start({ kind: 'tests' });
      worker(carried, 'empty');
      incomplete(carried);
      expect(await carried.finish()).toMatchObject({ status: 'incomplete', failures: [] });

      const alone = start({ kind: 'lifecycle' });
      incomplete(alone);
      expect(await alone.finish()).toMatchObject({ status: 'failed', failures: [{ error: { name: 'DesktopIncompleteError' } }] });
    });
  });

  describe('presentation errors', () => {
    const closedPipe = () =>
      new Writable({
        write(_chunk, _encoding, callback) {
          callback(Object.assign(new Error('write EPIPE'), { code: 'EPIPE' }));
        },
      });
    const stalled = () =>
      new Writable({
        write(_chunk, _encoding, callback) {
          setTimeout(callback, 300);
        },
      });

    test.each(['plain', 'github-actions'] as const)(
      'a %s consumer that closes the pipe cannot fail a passing run',
      async (reporterMode) => {
        const reporter = start({ kind: 'tests', reporterMode, output: closedPipe(), verbose: true });
        result(reporter, 'case', 'passed');
        const final = await reporter.finish();

        expect(final.status).toBe('passed');
        expect(final.failures).toEqual([]);
        expect(JSON.parse(fs.readFileSync(path.join(reporter.root, 'run.json'), 'utf8'))).toMatchObject({
          terminal: true,
          status: 'passed',
        });
        expect(err).toContain('[desktop] WARNING: Console output stopped: the consumer closed the stream (write EPIPE)');
        expect(err).toContain(`authoritative result: ${path.join(reporter.root, 'run.json')}`);
        expect(err).not.toContain('FAILED');
      },
    );

    test.each(['plain', 'github-actions'] as const)('a %s consumer that stalls cannot fail a passing run', async (reporterMode) => {
      const reporter = start({ kind: 'tests', reporterMode, output: stalled(), flushTimeoutMs: 50, verbose: true });
      result(reporter, 'case', 'passed');
      const final = await reporter.finish();

      expect(final.status).toBe('passed');
      expect(final.failures).toEqual([]);
      expect(err).toContain('[desktop] WARNING: Console output stopped: Timed out flushing desktop report output.');
    });

    test('a stall cannot hide a failure from the verdict or the retained report', async () => {
      const reporter = start({ kind: 'tests', output: stalled(), flushTimeoutMs: 50, verbose: true });
      result(reporter, 'case', 'failed');
      const final = await reporter.finish();

      expect(final.status).toBe('failed');
      expect(final.failures.map(({ kind }) => kind)).toEqual(['test']);
      expect(JSON.parse(fs.readFileSync(path.join(reporter.root, 'run.json'), 'utf8'))).toMatchObject({ status: 'failed' });
    });

    test('output past the queue bound is dropped with a warning and never changes the verdict', async () => {
      const reporter = start({ kind: 'lifecycle', output: stalled(), flushTimeoutMs: 1_000, verbose: true });
      const source = reporter.source('noisy');
      const text = 'x'.repeat(256 * 1024) + '\n';
      for (let index = 0; index < 24; index++) source({ kind: 'output', payload: { stream: 'stdout', text } }, 'noisy');
      source({ kind: 'producer-finished', payload: { status: 'passed' } }, 'noisy');
      const final = await reporter.finish();

      expect(final.status).toBe('passed');
      expect(final.failures).toEqual([]);
      expect(err).toMatch(/\[desktop\] WARNING: \d+ console output items were dropped because the output queue exceeded 4 MiB/);
    });

    test('the final line comes from the terminal result, not from presentation state', async () => {
      const reporter = start({ kind: 'tests' });
      result(reporter, 'case', 'passed');
      const final = await reporter.finish();

      expect(final.status).toBe('passed');
      expect(out.split('\n').find((line) => line.startsWith('[desktop] PASSED:'))).toContain(
        `${final.counts.selected} selected, ${final.counts.executed} executed, ${final.counts.passed} passed`,
      );
      expect(out).not.toContain('FAILED');
    });
  });

  describe('milestone events', () => {
    function milestones(): { reporter: DesktopRunReporter; events: () => Record<string, unknown>[] } {
      const reporter = start({ kind: 'tests', reporterMode: 'ndjson', eventLevel: 'milestones' });
      return {
        reporter,
        events: () =>
          out
            .split('\n')
            .filter(Boolean)
            .map((line) => JSON.parse(line) as Record<string, unknown>),
      };
    }
    const results = (events: Record<string, unknown>[], status: string) =>
      events.filter(({ kind, payload }) => kind === 'test-result' && (payload as { status: string }).status === status);

    test('a flood of skips never suppresses a later failure, incomplete result, or cancellation', async () => {
      const { reporter, events } = milestones();
      for (let index = 0; index < 40; index++) result(reporter, `skip-${index}`, 'skipped');
      for (let index = 0; index < 5; index++) result(reporter, `gap-${index}`, 'unsupported');
      result(reporter, 'broken', 'failed');
      result(reporter, 'unfinished', 'incomplete');
      await reporter.finish();

      expect(results(events(), 'skipped')).toHaveLength(25);
      expect(results(events(), 'failed')).toHaveLength(1);
      expect(results(events(), 'incomplete')).toHaveLength(1);
      expect(events().at(-1)).toMatchObject({ type: 'summary', status: 'failed' });
    });
  });

  describe('retained reports', () => {
    function runJsonWrites(): () => number {
      const rename = fs.renameSync;
      let writes = 0;
      jest.spyOn(fs, 'renameSync').mockImplementation((source, destination) => {
        if (String(destination).endsWith('run.json')) writes++;
        return rename(source, destination);
      });
      return () => writes;
    }

    test('events that cannot change the result do not rewrite run.json', async () => {
      const reporter = start({ kind: 'tests' });
      const writes = runJsonWrites();
      const source = reporter.source('noise');
      for (let index = 0; index < 30; index++) {
        source({ kind: 'output', payload: { stream: 'stdout', text: `line ${index}\n` } }, 'noise');
        source({ kind: 'diagnostic', payload: { level: 'info', message: 'progress' } }, 'noise');
        await new Promise((resolve) => setImmediate(resolve));
      }
      await reporter.flush();

      expect(writes()).toBeLessThanOrEqual(1);
    });

    test('a burst of results is throttled, and flush and finish always write the current state', async () => {
      const reporter = start({ kind: 'tests' });
      const writes = runJsonWrites();
      for (let index = 0; index < 40; index++) {
        result(reporter, `case-${index}`, 'passed');
        await new Promise((resolve) => setImmediate(resolve));
      }
      await reporter.flush();

      expect(writes()).toBeLessThanOrEqual(3);
      expect(JSON.parse(fs.readFileSync(path.join(reporter.root, 'run.json'), 'utf8'))).toMatchObject({
        terminal: false,
        counts: { selected: 40 },
      });
      const final = await reporter.finish();
      expect(JSON.parse(fs.readFileSync(path.join(reporter.root, 'run.json'), 'utf8'))).toMatchObject({
        terminal: true,
        counts: { selected: 40 },
      });
      expect(final.status).toBe('passed');
    });

    test('a secret registered after its text was reported is redacted from every retained report', async () => {
      const summary = path.join(artifactsRoot, 'summary.md');
      fs.writeFileSync(summary, '');
      process.env.GITHUB_STEP_SUMMARY = summary;
      const reporter = start({ kind: 'tests', summary: 'auto' });
      reporter.emit({
        kind: 'test-result',
        payload: { testId: 'case', title: 'logs in as late-secret-value', attempt: 0, status: 'passed', durationMs: 1 },
      });
      reporter.fail(new Error('token late-secret-value rejected'), 'test');
      reporter.addSecret('late-secret-value');
      await reporter.finish();

      for (const file of ['run.json', 'junit.xml']) {
        const text = fs.readFileSync(path.join(reporter.root, file), 'utf8');
        expect(text).not.toContain('late-secret-value');
        expect(text).toContain('[REDACTED]');
      }
      expect(fs.readFileSync(summary, 'utf8')).not.toContain('late-secret-value');
    });
  });

  describe('collector-only events', () => {
    test('a producer cannot finish the run for the collector', () => {
      const reporter = start({ kind: 'lifecycle' });
      expect(() =>
        reporter.accept({
          schemaVersion: 1,
          runId: reporter.runId,
          eventId: randomUUID(),
          sourceId: 'rogue',
          sourceSequence: 1,
          scopeId: 'rogue',
          timestamp: new Date().toISOString(),
          kind: 'run-finished',
          payload: { status: 'passed', resultPath: 'run.json' },
        }),
      ).toThrow('A producer cannot report "run-finished".');
    });
  });
});
