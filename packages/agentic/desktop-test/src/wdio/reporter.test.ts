import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { PassThrough } from 'node:stream';
import type { RunnerStats, TestStats } from '@wdio/reporter';

import { desktopJasmineRegistry } from '../jasmine/registry.js';
import { DesktopRunReporter } from '../reporting/collector.js';
import type { ReportProducer } from '../reporting/transport.js';
import { connectReportProducer } from '../reporting/transport.js';
import { wdioGroupId } from './identity.js';
import DesktopWdioReporter from './reporter.js';

jest.mock('../reporting/transport', () => ({ connectReportProducer: jest.fn() }));

type FixtureTest = { uid: string; title: string; state: 'passed' | 'failed' | 'pending' | 'skipped'; error?: Error };

describe('desktop WDIO reporter', () => {
  const specs = ['/fixtures/example.spec.ts'];
  const workId = wdioGroupId(specs);
  const retries = 2;
  let artifactsRoot: string;
  let collector: DesktopRunReporter;

  beforeEach(() => {
    artifactsRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'furn-wdio-reporter-'));
    collector = new DesktopRunReporter({ artifactsRoot, output: { write: () => true }, reporterMode: 'json', summary: false });
    collector.emit({ kind: 'work-selected', payload: { workId, label: 'example spec' } });
    jest.mocked(connectReportProducer).mockImplementation(async (sourceId: string): Promise<ReportProducer> => {
      const emit = collector.source(sourceId);
      return {
        emit,
        source: (id) => collector.source(id),
        flush: async () => {},
        finish: async (status = 'passed') => emit({ kind: 'producer-finished', payload: { status } }),
      };
    });
  });

  afterEach(() => {
    const registry = desktopJasmineRegistry();
    registry.entries.clear();
    registry.blocked = false;
    fs.rmSync(artifactsRoot, { force: true, recursive: true });
  });

  /** One worker process: WDIO starts a fresh reporter for every attempt at the spec file. */
  async function runWorker(retry: number | undefined, tests: readonly FixtureTest[]): Promise<void> {
    const reporter = new DesktopWdioReporter({
      writeStream: new PassThrough(),
      desktopContext: { endpoint: 'macos', renderer: 'fabric' },
      specFileRetries: retries,
    } as ConstructorParameters<typeof DesktopWdioReporter>[0]);
    const failures = tests.filter(({ state }) => state === 'failed').length;
    const runner = { cid: '0-0', specs, retry, failures } as unknown as RunnerStats;
    reporter.onRunnerStart(runner);
    for (const fixture of tests) {
      const test = { ...fixture, fullTitle: `suite ${fixture.title}`, duration: 5, retries: 0, errors: [] } as unknown as TestStats;
      reporter.onTestStart(test);
      if (fixture.state === 'pending' || fixture.state === 'skipped') reporter.onTestSkip(test);
      else reporter.onTestEnd(test);
    }
    reporter.onRunnerEnd(runner);
    while (!reporter.isSynchronised) await new Promise((resolve) => setImmediate(resolve));
  }

  const flaky = { uid: 'test00-0', title: 'opens', state: 'failed', error: new Error('boom') } as const;

  test('orders attempts by arrival when WDIO reports N+1 for the first worker and 1..N for its retries', async () => {
    await runWorker(retries + 1, [flaky]);
    await runWorker(1, [flaky]);
    await runWorker(2, [{ ...flaky, state: 'passed' }]);
    const result = await collector.finish();
    expect(result.tests).toHaveLength(1);
    expect(result.tests[0].attempts.map(({ status }) => status)).toEqual(['failed', 'failed', 'passed']);
    const attempts = result.tests[0].attempts.map(({ attempt }) => attempt);
    expect(new Set(attempts).size).toBe(3);
    expect(attempts).toEqual([...attempts].sort((a, b) => a - b));
    expect(result.tests[0]).toMatchObject({ status: 'passed', flaky: true });
    expect(result.work).toMatchObject([{ workId, status: 'passed' }]);
  });

  test('a producer that numbers its first attempt from zero is still ordered and unique', async () => {
    await runWorker(undefined, [flaky]);
    await runWorker(1, [{ ...flaky, state: 'passed' }]);
    const result = await collector.finish();
    expect(result.tests[0].attempts.map(({ attempt }) => attempt)).toEqual([0, 1_000_000]);
    expect(result.tests[0].status).toBe('passed');
  });

  test('a failed attempt followed only by a skipped retry keeps the test failed', async () => {
    await runWorker(retries + 1, [flaky]);
    await runWorker(1, [{ ...flaky, state: 'pending' }]);
    const result = await collector.finish();
    expect(result.tests[0]).toMatchObject({ status: 'failed' });
    expect(result.status).toBe('failed');
  });

  test('a spec that produced no tests is incomplete and says so', async () => {
    await runWorker(1, []);
    const result = await collector.finish();
    expect(result.status).toBe('incomplete');
    expect(result.work[0]).toMatchObject({ status: 'incomplete', reason: expect.stringContaining('No tests') });
    expect(fs.readFileSync(path.join(collector.root, 'events.jsonl'), 'utf8')).toContain('No tests ran for /fixtures/example.spec.ts');
  });

  test('a spec whose cases were all excluded declares them and stays covered', async () => {
    desktopJasmineRegistry().entries.set('suite hidden-0', { kind: 'excluded', reason: 'platform' });
    await runWorker(1, [{ uid: 'suite hidden-0', title: 'hidden', state: 'pending' }]);
    const result = await collector.finish();
    expect(result.tests).toHaveLength(0);
    expect(result.work[0].status).toBe('passed');
    expect(result.selection?.excluded).toMatchObject({ platform: 1 });
    expect(fs.readFileSync(path.join(collector.root, 'events.jsonl'), 'utf8')).not.toContain('No tests ran');
  });

  test('maps framework states to desktop statuses', async () => {
    await runWorker(1, [
      { uid: 'a-0', title: 'passes', state: 'passed' },
      { uid: 'b-0', title: 'fails', state: 'failed', error: new Error('nope') },
      { uid: 'c-0', title: 'pends', state: 'pending' },
      { uid: 'd-0', title: 'skips', state: 'skipped' },
    ]);
    const result = await collector.finish();
    expect(Object.fromEntries(result.tests.map((test) => [test.title, test.status]))).toEqual({
      'suite passes': 'passed',
      'suite fails': 'failed',
      'suite pends': 'skipped',
      'suite skips': 'skipped',
    });
  });
});
