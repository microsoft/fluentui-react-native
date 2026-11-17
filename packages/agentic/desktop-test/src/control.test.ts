import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { DesktopWorkloadService } from './control.js';
import type { DesktopWorkloadExecution, DesktopWorkloadResponse, DesktopWorkloadRun, DesktopWorkloadServiceOptions } from './control.js';
import { DesktopRunReporter } from './reporting/collector.js';

type PrepareInput = Parameters<DesktopWorkloadServiceOptions['prepare']>[0];
type HarnessOptions = {
  scopes?: DesktopWorkloadServiceOptions['scopes'];
  drainTimeoutMs?: number;
  prepare?: DesktopWorkloadServiceOptions['prepare'];
  addSecret?: DesktopWorkloadServiceOptions['addSecret'];
  preparing?: () => Promise<void>;
  prepared?: (reporter: DesktopRunReporter, addSecret: PrepareInput['addSecret']) => void;
  run?: (reporter: DesktopRunReporter, signal: AbortSignal, addSecret: PrepareInput['addSecret']) => Promise<void>;
  finish?: () => Promise<void>;
};

describe('desktop workload authority', () => {
  let root: string;
  let services: DesktopWorkloadService[];
  let releases: (() => void)[];

  beforeEach(() => {
    root = fs.mkdtempSync(path.join(os.tmpdir(), 'furn-workload-control-'));
    services = [];
    releases = [];
  });

  afterEach(async () => {
    for (const release of releases) release();
    await Promise.all(services.map((service) => service.close().catch(() => undefined)));
    jest.restoreAllMocks();
    fs.rmSync(root, { force: true, recursive: true });
  });

  function gate(): { promise: Promise<void>; release: () => void } {
    let release!: () => void;
    const promise = new Promise<void>((resolve) => {
      release = resolve;
    });
    releases.push(release);
    return { promise, release };
  }

  function harness(options: HarnessOptions = {}) {
    const reporters: DesktopRunReporter[] = [];
    const prepare = jest.fn(
      options.prepare ??
        (async ({ signal, addSecret, bindReporter }: PrepareInput): Promise<DesktopWorkloadExecution> => {
          await options.preparing?.();
          const reporter = new DesktopRunReporter({
            artifactsRoot: root,
            output: { write: () => true },
            errorOutput: { write: () => true },
            reporterMode: 'json',
            summary: false,
          });
          reporters.push(reporter);
          bindReporter(reporter);
          options.prepared?.(reporter, addSecret);
          return {
            runId: reporter.runId,
            root: reporter.root,
            textArtifacts: ['commands/output.log'],
            async run(runSignal) {
              if (options.run) await options.run(reporter, runSignal, addSecret);
              else testResult(reporter, 'passed');
            },
            async finish(failure) {
              if (failure !== undefined && failure !== signal.reason) reporter.fail(failure);
              await reporter.finish();
              await options.finish?.();
            },
          };
        }),
    );
    const service = new DesktopWorkloadService({
      catalog: [
        { id: 'visual', kind: 'wdio', lanes: ['accessible', 'physical'] },
        { id: 'stories', kind: 'csf-wdio', lanes: ['accessible'] },
        { id: 'blocked', kind: 'wdio', lanes: [], unavailable: 'host-input' },
      ],
      prepare,
      addSecret: options.addSecret,
      scopes: options.scopes,
      drainTimeoutMs: options.drainTimeoutMs,
    });
    services.push(service);
    return { service, prepare, reporters, connect: () => service.connect(service.credential) };
  }

  function testResult(reporter: DesktopRunReporter, status: 'passed' | 'failed', title = 'case'): void {
    reporter.emit({
      kind: 'test-result',
      payload: {
        testId: 'case',
        title,
        status,
        attempt: 0,
        durationMs: 1,
        ...(status === 'failed' ? { failure: reporter.failure(new Error('Assertion failed'), 'test') } : {}),
      },
    });
  }

  function run(response: DesktopWorkloadResponse): DesktopWorkloadRun {
    if (!('run' in response) || !response.run) throw new Error('Expected a workload run.');
    return response.run;
  }

  async function until(
    service: DesktopWorkloadService,
    token: string,
    handle: string,
    predicate: (value: DesktopWorkloadRun) => boolean,
  ): Promise<DesktopWorkloadRun> {
    for (let attempt = 0; attempt < 1000; attempt++) {
      const current = run(await service.request(token, { action: 'status', handle }));
      if (predicate(current)) return current;
      await new Promise<void>((resolve) => setTimeout(resolve, 2));
    }
    throw new Error('Workload did not reach the expected state.');
  }

  function abortSignal(signal: AbortSignal): Promise<void> {
    if (signal.aborted) return Promise.reject(signal.reason);
    return new Promise<void>((_resolve, reject) => {
      signal.addEventListener('abort', () => reject(signal.reason), { once: true });
    });
  }

  test('admission binds request IDs before dispatch and reconciles a lost response without replay', async () => {
    const pending = gate();
    const { service, connect, prepare } = harness({
      run: async (reporter) => {
        await pending.promise;
        testResult(reporter, 'passed');
      },
    });
    const token = connect();
    const input = { action: 'run', workload: 'visual', lane: 'accessible', requestId: 'request-1' };
    const first = run(await service.request(token, input));
    const repeated = run(await service.request(token, input));
    expect(repeated.handle).toBe(first.handle);
    expect(run(await service.request(token, { action: 'status', requestId: 'request-1' })).handle).toBe(first.handle);
    await expect(service.request(token, { ...input, lane: 'physical' })).rejects.toMatchObject({ code: 'conflict' });
    await until(service, token, first.handle, (value) => value.phase === 'running');
    expect(prepare).toHaveBeenCalledTimes(1);
    await expect(service.request(token, { ...input, requestId: 'different' })).rejects.toMatchObject({ code: 'busy' });
    pending.release();
    expect(await until(service, token, first.handle, (value) => value.phase === 'settled')).toMatchObject({
      outcome: 'passed',
      cleanup: 'settled',
    });
    expect(run(await service.request(token, input)).handle).toBe(first.handle);
    expect(prepare).toHaveBeenCalledTimes(1);
  });

  test('binds an exact story ID to a CSF admission without allowing it on generic suites', async () => {
    const pending = gate();
    const { service, connect, prepare } = harness({
      run: async (reporter) => {
        await pending.promise;
        testResult(reporter, 'passed');
      },
    });
    const token = connect();
    await expect(
      service.request(token, { action: 'run', workload: 'visual', lane: 'accessible', requestId: 'generic', storyId: 'button--default' }),
    ).rejects.toMatchObject({ code: 'invalid-request' });
    await expect(
      service.request(token, { action: 'run', workload: 'stories', lane: 'accessible', requestId: 'invalid', storyId: '../secret' }),
    ).rejects.toMatchObject({ code: 'invalid-request' });
    const input = {
      action: 'run',
      workload: 'stories',
      lane: 'accessible',
      requestId: 'story-request',
      storyId: 'button--default',
    };
    const accepted = run(await service.request(token, input));
    expect(accepted.storyId).toBe('button--default');
    expect(run(await service.request(token, input)).handle).toBe(accepted.handle);
    await expect(service.request(token, { ...input, storyId: 'button--other' })).rejects.toMatchObject({ code: 'conflict' });
    await until(service, token, accepted.handle, (value) => value.phase === 'running');
    expect(prepare).toHaveBeenCalledWith(expect.objectContaining({ storyId: 'button--default' }));
    pending.release();
    expect(await until(service, token, accepted.handle, (value) => value.phase === 'settled')).toMatchObject({
      outcome: 'passed',
      cleanup: 'settled',
    });
  });

  test('principals cannot inspect or cancel each other, and the published root cannot make workload requests', async () => {
    const pending = gate();
    const { service, connect } = harness({ run: async () => pending.promise });
    const owner = connect();
    const other = connect();
    const first = run(await service.request(owner, { action: 'run', workload: 'visual', lane: 'accessible', requestId: 'owner' }));
    await expect(service.request(service.credential, { action: 'catalog' })).rejects.toMatchObject({ code: 'unavailable' });
    for (const input of [
      { action: 'status', handle: first.handle },
      { action: 'status', requestId: 'owner' },
      { action: 'cancel', handle: first.handle },
      { action: 'results', handle: first.handle, category: 'status' },
    ]) {
      await expect(service.request(other, input)).rejects.toMatchObject({ code: 'unavailable' });
    }
    await expect(service.request(other, { action: 'status', handle: `dwr_${'0'.repeat(32)}` })).rejects.toMatchObject({
      code: 'unavailable',
    });
    pending.release();
  });

  test('bounds retained redaction credentials without blocking existing reads or cleanup', async () => {
    const { service, connect } = harness();
    const token = connect();
    let capacity: unknown;
    for (let index = 0; index < 5000; index++) {
      try {
        service.addSecret(`retired-credential-${index}`);
      } catch (error) {
        capacity = error;
        break;
      }
    }
    expect(capacity).toMatchObject({ code: 'capacity' });
    expect(() => service.addSecret(token)).not.toThrow();
    expect(() => connect()).toThrow(expect.objectContaining({ code: 'capacity' }));
    await expect(service.request(token, { action: 'catalog' })).resolves.toMatchObject({ availability: 'capacity' });
    await expect(
      service.request(token, { action: 'run', workload: 'visual', lane: 'accessible', requestId: 'exhausted' }),
    ).rejects.toMatchObject({ code: 'capacity' });
    await expect(service.dispose(token)).resolves.toBeUndefined();
  });

  test('retries redactor registration when a trusted recipient fails', () => {
    let attempts = 0;
    const addSecret = jest.fn((secret: string) => {
      if (secret === 'retry-credential' && ++attempts === 1) throw new Error('injected redactor failure');
    });
    const { service } = harness({ addSecret });
    expect(() => service.addSecret('retry-credential')).toThrow('injected redactor failure');
    expect(() => service.addSecret('retry-credential')).not.toThrow();
    expect(addSecret.mock.calls.filter(([secret]) => secret === 'retry-credential')).toHaveLength(2);
  });

  test('per-connection scopes and catalog lanes can only attenuate the host policy', async () => {
    const pending = gate();
    const { service } = harness({ run: async () => pending.promise });
    const restricted = service.connect(service.credential, {
      scopes: ['workload-read', 'workload-run'],
      workloads: [{ id: 'visual', lanes: ['accessible'] }],
    });
    expect(await service.request(restricted, { action: 'catalog' })).toMatchObject({
      catalog: [{ id: 'visual', lanes: ['accessible'] }],
    });
    for (const [workload, lane] of [
      ['visual', 'physical'],
      ['stories', 'accessible'],
    ]) {
      await expect(service.request(restricted, { action: 'run', workload, lane, requestId: 'denied' })).rejects.toMatchObject({
        code: 'unavailable',
      });
    }
    const accepted = run(
      await service.request(restricted, { action: 'run', workload: 'visual', lane: 'accessible', requestId: 'allowed' }),
    );
    await expect(service.request(restricted, { action: 'cancel', handle: accepted.handle })).rejects.toMatchObject({
      code: 'unavailable',
    });
    expect(() => service.connect(service.credential, { workloads: [{ id: 'stories', lanes: ['physical'] }] })).toThrow();
    const readOnly = harness({ scopes: ['workload-read'] }).service;
    expect(() => readOnly.connect(readOnly.credential, { scopes: ['workload-run'] })).toThrow();
    pending.release();
  });

  test('cancellation during preparation settles without dispatching the run', async () => {
    const preparing = gate();
    const execute = jest.fn(async () => undefined);
    const { service, connect, prepare } = harness({ preparing: () => preparing.promise, run: execute });
    const token = connect();
    const accepted = run(await service.request(token, { action: 'run', workload: 'visual', lane: 'accessible', requestId: 'cancel' }));
    await service.request(token, { action: 'cancel', handle: accepted.handle });
    preparing.release();
    expect(await until(service, token, accepted.handle, (value) => value.phase === 'settled')).toMatchObject({
      cancellation: 'requested',
      outcome: 'cancelled',
      cleanup: 'settled',
    });
    expect(prepare).toHaveBeenCalledTimes(1);
    expect(execute).not.toHaveBeenCalled();
  });

  test('host shutdown before the admission microtask does not prepare a run', async () => {
    const { service, connect, prepare } = harness();
    const token = connect();
    const admission = service.request(token, { action: 'run', workload: 'visual', lane: 'accessible', requestId: 'close' });
    const closing = service.close();
    await admission;
    await closing;
    expect(prepare).not.toHaveBeenCalled();
  });

  test('in-flight cancellation preserves failures and does not shut down the host authority', async () => {
    const { service, connect } = harness({
      run: async (reporter, signal) => {
        testResult(reporter, 'failed');
        await abortSignal(signal);
      },
    });
    const token = connect();
    const accepted = run(await service.request(token, { action: 'run', workload: 'visual', lane: 'accessible', requestId: 'failure' }));
    await until(service, token, accepted.handle, (value) => value.phase === 'running');
    await service.request(token, { action: 'cancel', handle: accepted.handle });
    expect(await until(service, token, accepted.handle, (value) => value.phase === 'settled')).toMatchObject({
      cancellation: 'requested',
      outcome: 'failed',
      cleanup: 'settled',
    });
    expect(await service.request(token, { action: 'status' })).toMatchObject({ availability: 'available' });
  });

  test('a cancelled runner that returns a passing report remains incomplete', async () => {
    const { service, connect, reporters } = harness({
      run: async (reporter, signal) => {
        await abortSignal(signal).catch(() => undefined);
        testResult(reporter, 'passed');
      },
    });
    const token = connect();
    const accepted = run(await service.request(token, { action: 'run', workload: 'visual', lane: 'accessible', requestId: 'inflight' }));
    await until(service, token, accepted.handle, (value) => value.phase === 'running');
    await service.request(token, { action: 'cancel', handle: accepted.handle });
    expect(await until(service, token, accepted.handle, (value) => value.phase === 'settled')).toMatchObject({
      cancellation: 'requested',
      outcome: 'incomplete',
      cleanup: 'settled',
    });
    expect(await service.request(token, { action: 'results', handle: accepted.handle, category: 'status' })).toMatchObject({
      terminal: true,
      status: 'incomplete',
    });
    expect(JSON.parse(fs.readFileSync(path.join(reporters[0].root, 'run.json'), 'utf8'))).toMatchObject({ status: 'incomplete' });
  });

  test('cancellation after execution completes does not overwrite its terminal outcome', async () => {
    const cleanup = gate();
    const finishing = gate();
    const { service, connect } = harness({
      finish: () => {
        finishing.release();
        return cleanup.promise;
      },
    });
    const token = connect();
    const accepted = run(await service.request(token, { action: 'run', workload: 'visual', lane: 'accessible', requestId: 'late' }));
    await finishing.promise;
    await service.request(token, { action: 'cancel', handle: accepted.handle });
    cleanup.release();
    expect(await until(service, token, accepted.handle, (value) => value.phase === 'settled')).toMatchObject({
      cancellation: 'requested',
      outcome: 'passed',
      cleanup: 'settled',
    });
  });

  test('failed drain fences the host and retains unresolved evidence past normal expiration', async () => {
    const { service, connect } = harness({ finish: async () => Promise.reject(new Error('drain failed')) });
    const token = connect();
    const accepted = run(await service.request(token, { action: 'run', workload: 'visual', lane: 'accessible', requestId: 'fenced' }));
    expect(await until(service, token, accepted.handle, (value) => value.phase === 'settled')).toMatchObject({
      outcome: 'passed',
      cleanup: 'failed',
    });
    jest.spyOn(Date, 'now').mockReturnValue(Date.now() + 2 * 60 * 60 * 1000);
    expect(await service.request(token, { action: 'status', handle: accepted.handle })).toMatchObject({
      availability: 'fenced',
      run: { cleanup: 'failed' },
    });
    await expect(service.request(token, { action: 'run', workload: 'visual', lane: 'accessible', requestId: 'new' })).rejects.toMatchObject(
      { code: 'unavailable' },
    );
    await expect(service.dispose(token)).rejects.toMatchObject({ code: 'unavailable' });
    await expect(service.close()).rejects.toMatchObject({ code: 'unavailable' });
  });

  test('even an undefined factory rejection fences potentially acquired resources', async () => {
    const { service, connect } = harness({ prepare: () => Promise.reject() });
    const token = connect();
    const accepted = run(await service.request(token, { action: 'run', workload: 'visual', lane: 'accessible', requestId: 'factory' }));
    expect(await until(service, token, accepted.handle, (value) => value.phase === 'settled')).toMatchObject({
      outcome: 'failed',
      cleanup: 'failed',
    });
    expect(await service.request(token, { action: 'status' })).toMatchObject({ availability: 'fenced' });
  });

  test('explicit disposal cancels and waits for cleanup before removing the principal', async () => {
    const cleanup = gate();
    const { service, connect } = harness({
      run: async (_reporter, signal) => abortSignal(signal),
      finish: () => cleanup.promise,
    });
    const token = connect();
    const accepted = run(await service.request(token, { action: 'run', workload: 'visual', lane: 'accessible', requestId: 'dispose' }));
    await until(service, token, accepted.handle, (value) => value.phase === 'running');
    let disposed = false;
    const disposal = service.dispose(token).then(() => {
      disposed = true;
    });
    await expect(service.request(token, { action: 'status' })).rejects.toMatchObject({ code: 'unavailable' });
    await new Promise<void>((resolve) => setTimeout(resolve, 10));
    expect(disposed).toBe(false);
    cleanup.release();
    await disposal;
    expect(disposed).toBe(true);
    await expect(service.request(token, { action: 'status', handle: accepted.handle })).rejects.toMatchObject({ code: 'unavailable' });
  });

  test('a drain deadline fences the host rather than acknowledging unresolved cleanup', async () => {
    const cleanup = gate();
    const { service, connect } = harness({
      drainTimeoutMs: 20,
      run: async (_reporter, signal) => abortSignal(signal),
      finish: () => cleanup.promise,
    });
    const token = connect();
    const observer = connect();
    const accepted = run(await service.request(token, { action: 'run', workload: 'visual', lane: 'accessible', requestId: 'stuck' }));
    await until(service, token, accepted.handle, (value) => value.phase === 'running');
    await expect(service.dispose(token)).rejects.toMatchObject({ code: 'unavailable' });
    expect(await service.request(observer, { action: 'status' })).toMatchObject({ availability: 'fenced' });
    cleanup.release();
    await expect(service.close()).rejects.toMatchObject({ code: 'unavailable' });
  });

  test('disposing principals releases their inaccessible settled records without exhausting retention', async () => {
    const { service, connect } = harness();
    for (let index = 0; index < 65; index++) {
      const token = connect();
      const accepted = run(
        await service.request(token, { action: 'run', workload: 'visual', lane: 'accessible', requestId: `run-${index}` }),
      );
      await until(service, token, accepted.handle, (value) => value.phase === 'settled');
      await service.dispose(token);
    }
    expect(await service.request(connect(), { action: 'status' })).toMatchObject({ availability: 'available' });
  });

  test('expired handles leave request tombstones and cannot be replayed', async () => {
    const { service, connect, prepare } = harness();
    const token = connect();
    const input = { action: 'run', workload: 'visual', lane: 'accessible', requestId: 'old' };
    const accepted = run(await service.request(token, input));
    await until(service, token, accepted.handle, (value) => value.phase === 'settled');
    jest.spyOn(Date, 'now').mockReturnValue(Date.now() + 2 * 60 * 60 * 1000);
    await expect(service.request(token, { action: 'status', requestId: 'old' })).rejects.toMatchObject({ code: 'unavailable' });
    await expect(service.request(token, input)).rejects.toMatchObject({ code: 'unavailable' });
    expect(prepare).toHaveBeenCalledTimes(1);
  });

  test('long-poll waiters are bounded and release their capacity on cancellation', async () => {
    const { service, connect } = harness({ run: async (_reporter, signal) => abortSignal(signal) });
    const token = connect();
    const accepted = run(await service.request(token, { action: 'run', workload: 'visual', lane: 'accessible', requestId: 'waiters' }));
    await until(service, token, accepted.handle, (value) => value.phase === 'running');
    const waits = Array.from({ length: 32 }, () => service.request(token, { action: 'status', handle: accepted.handle, waitMs: 10_000 }));
    await expect(service.request(token, { action: 'status', handle: accepted.handle, waitMs: 10_000 })).rejects.toMatchObject({
      code: 'capacity',
    });
    await service.request(token, { action: 'cancel', handle: accepted.handle });
    await expect(Promise.all(waits)).resolves.toHaveLength(32);
    await until(service, token, accepted.handle, (value) => value.phase === 'settled');
  });

  test('aborting a status wait never cancels the accepted workload', async () => {
    const { service, connect } = harness({ run: async (_reporter, signal) => abortSignal(signal) });
    const token = connect();
    const accepted = run(await service.request(token, { action: 'run', workload: 'visual', lane: 'accessible', requestId: 'disconnect' }));
    await until(service, token, accepted.handle, (value) => value.phase === 'running');
    const controller = new AbortController();
    const wait = service.request(token, { action: 'status', handle: accepted.handle, waitMs: 10_000 }, controller.signal);
    controller.abort();
    await expect(wait).rejects.toMatchObject({ code: 'unavailable' });
    expect(run(await service.request(token, { action: 'status', handle: accepted.handle }))).toMatchObject({
      phase: 'running',
      cancellation: 'none',
    });
  });

  test.each([
    { action: 'run', workload: 'visual', lane: 'accessible', requestId: 'x', command: 'arbitrary' },
    { action: 'status', waitMs: 10_001, handle: `dwr_${'0'.repeat(32)}` },
    { action: 'status', waitMs: 1 },
    { action: 'results', handle: `dwr_${'0'.repeat(32)}`, category: 'status', limit: 1 },
  ])('rejects invalid action fields and unbounded requests', async (input) => {
    const { service, connect } = harness();
    await expect(service.request(connect(), input)).rejects.toMatchObject({ code: 'invalid-request' });
  });

  test('F8 projections remove internal run IDs, credentials, paths, and unbounded artifact text', async () => {
    let rootCredential = '';
    let principalCredential = '';
    const driverCredential = 'fixture-driver-grant-secret';
    const { service, connect, reporters } = harness({
      run: async (reporter, _signal, addSecret) => {
        addSecret(driverCredential);
        testResult(reporter, 'passed', `${rootCredential} ${principalCredential} ${driverCredential}`);
        fs.mkdirSync(path.join(reporter.root, 'commands'));
        fs.writeFileSync(
          path.join(reporter.root, 'commands/output.log'),
          `${reporter.root} ${rootCredential} ${principalCredential} ${driverCredential} ${'x'.repeat(5000)}`,
        );
        reporter.emit({ kind: 'artifact', payload: { path: 'commands/output.log', description: 'Command output' } });
      },
    });
    rootCredential = service.credential;
    principalCredential = connect();
    const accepted = run(
      await service.request(principalCredential, { action: 'run', workload: 'visual', lane: 'accessible', requestId: 'projection' }),
    );
    await until(service, principalCredential, accepted.handle, (value) => value.phase === 'settled');
    const tests = await service.request(principalCredential, { action: 'results', handle: accepted.handle, category: 'tests' });
    const artifacts = await service.request(principalCredential, { action: 'results', handle: accepted.handle, category: 'artifacts' });
    if (!('items' in artifacts)) throw new Error('Expected an artifact page.');
    const artifact = await service.request(principalCredential, {
      action: 'artifact',
      handle: accepted.handle,
      artifactId: artifacts.items[0].id,
    });
    if (!('text' in artifact)) throw new Error('Expected a text artifact.');
    const projected = JSON.stringify([tests, artifacts, artifact]);
    for (const secret of [rootCredential, principalCredential, driverCredential, reporters[0].runId, reporters[0].root]) {
      expect(projected).not.toContain(secret);
    }
    expect(projected).toContain('[REDACTED]');
    expect(Buffer.byteLength(artifact.text)).toBeLessThanOrEqual(4096);
    expect(artifact.omissions.bytes).toBeGreaterThan(0);
    expect(fs.readFileSync(path.join(reporters[0].root, 'events.jsonl'), 'utf8')).not.toContain(principalCredential);
  });

  test('the report redactor receives existing and newly issued secrets during preparation', async () => {
    const secret = 'fixture-preparation-credential';
    const { service, connect, reporters } = harness({
      prepared: (reporter, addSecret) => {
        addSecret(secret);
        reporter.emit({ kind: 'diagnostic', payload: { level: 'info', message: `${service.credential} ${secret}` } });
      },
    });
    const token = connect();
    const accepted = run(await service.request(token, { action: 'run', workload: 'visual', lane: 'accessible', requestId: 'redaction' }));
    await until(service, token, accepted.handle, (value) => value.phase === 'settled');
    const events = fs.readFileSync(path.join(reporters[0].root, 'events.jsonl'), 'utf8');
    expect(events).not.toContain(service.credential);
    expect(events).not.toContain(secret);
    expect(events).toContain('[REDACTED]');
  });
});
