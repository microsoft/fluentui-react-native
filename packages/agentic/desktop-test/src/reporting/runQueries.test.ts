import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { randomUUID } from 'node:crypto';

import { DesktopRunReporter } from './collector.js';
import { DesktopRunQueryService, validateDesktopRunQuery } from './runQueries.js';
import type { DesktopRunPage, DesktopRunQueryClient } from './runQueries.js';
import type { DesktopRunResult } from './results.js';

describe('persisted desktop run queries', () => {
  let root: string;
  let reporter: DesktopRunReporter;
  let service: DesktopRunQueryService;
  let token: string;
  let client: DesktopRunQueryClient;

  beforeEach(() => {
    root = fs.mkdtempSync(path.join(os.tmpdir(), 'furn-run-queries-'));
    reporter = new DesktopRunReporter({
      artifactsRoot: root,
      output: { write: () => true },
      reporterMode: 'json',
      summary: false,
      secrets: ['collector-secret'],
    });
    service = new DesktopRunQueryService(['reader-secret']);
    service.registerRun({
      runId: reporter.runId,
      root: reporter.root,
      expiresAt: Date.now() + 60_000,
      textArtifacts: ['commands/output.log'],
    });
    token = service.issueGrant({ runIds: [reporter.runId], expiresAt: Date.now() + 60_000, artifacts: true });
    client = service.connect(token);
  });

  afterEach(async () => {
    await reporter.finish();
    fs.rmSync(root, { force: true, recursive: true });
  });

  function testResult(status: 'passed' | 'skipped' | 'failed', testId: string = randomUUID(), title = testId): void {
    reporter.emit({
      kind: 'test-result',
      payload: {
        testId,
        title,
        status,
        attempt: 0,
        durationMs: 1,
        ...(status === 'skipped' ? { reason: 'Unsupported endpoint' } : {}),
        ...(status === 'failed' ? { failure: reporter.failure(new Error('Assertion failed'), 'test') } : {}),
      },
    });
  }

  function rewrite(change: (result: DesktopRunResult) => void): void {
    const file = path.join(reporter.root, 'run.json');
    const result = JSON.parse(fs.readFileSync(file, 'utf8')) as DesktopRunResult;
    change(result);
    fs.writeFileSync(file, JSON.stringify(result));
  }

  test('active snapshots are incomplete even after a passing test; reconnect never replays execution', async () => {
    expect(await client.query({ operation: 'status', runId: reporter.runId })).toMatchObject({
      terminal: false,
      status: 'incomplete',
      counts: { selected: 0 },
    });
    testResult('passed');
    await reporter.flush();
    expect(JSON.parse(fs.readFileSync(path.join(reporter.root, 'run.json'), 'utf8'))).toMatchObject({
      terminal: false,
      status: 'incomplete',
    });
    const before = fs.readFileSync(path.join(reporter.root, 'events.jsonl'), 'utf8');
    const next = service.connect(token);
    expect(await next.query({ operation: 'status', runId: reporter.runId })).toMatchObject({
      terminal: false,
      status: 'incomplete',
      counts: { passed: 1 },
    });
    expect(fs.readFileSync(path.join(reporter.root, 'events.jsonl'), 'utf8')).toBe(before);
    await reporter.finish();
    expect(await next.query({ operation: 'status', runId: reporter.runId })).toMatchObject({ terminal: true, status: 'passed' });
  });

  test('reader recreation over retained storage needs no collector or execution callback', async () => {
    testResult('passed');
    await reporter.finish();
    const replacement = new DesktopRunQueryService();
    replacement.registerRun({ runId: reporter.runId, root: reporter.root, expiresAt: Date.now() + 60_000 });
    const credential = replacement.issueGrant({ runIds: [reporter.runId], expiresAt: Date.now() + 60_000 });
    expect(await replacement.connect(credential).query({ operation: 'status', runId: reporter.runId })).toMatchObject({
      terminal: true,
      status: 'passed',
    });
    expect(() => replacement.connect(token)).toThrow('unauthorized');
  });

  test.each(['skipped', 'failed'] as const)('terminal %s work never projects success', async (status) => {
    testResult(status);
    await reporter.finish();
    expect(await client.query({ operation: 'status', runId: reporter.runId })).toMatchObject({
      terminal: true,
      status: status === 'skipped' ? 'incomplete' : 'failed',
    });
  });

  test('mixed pass/skip retains coverage semantics', async () => {
    testResult('passed');
    testResult('skipped');
    await reporter.finish();
    expect(await client.query({ operation: 'status', runId: reporter.runId })).toMatchObject({
      terminal: true,
      status: 'passed',
      counts: { passed: 1, skipped: 1 },
    });
  });

  test('unfinished producers and work remain incomplete after finalization', async () => {
    reporter.source('unfinished-worker');
    reporter.emit({ kind: 'work-selected', payload: { workId: 'unfinished', label: 'Selected work' } });
    testResult('passed');
    await reporter.finish();
    expect(await client.query({ operation: 'status', runId: reporter.runId })).toMatchObject({ terminal: true, status: 'incomplete' });
    expect(await client.query({ operation: 'work', runId: reporter.runId })).toMatchObject({
      items: [{ title: 'Selected work', status: 'not-run' }],
      omissions: { items: 0 },
    });
  });

  test('legacy reports without terminal evidence fail closed, regardless of claimed counts', async () => {
    testResult('passed');
    await reporter.finish();
    rewrite((result) => {
      delete result.terminal;
      result.counts.passed = 9999;
    });
    expect(await client.query({ operation: 'status', runId: reporter.runId })).toMatchObject({
      terminal: false,
      status: 'incomplete',
      counts: { passed: 1 },
    });
  });

  test('large pages cannot hide a late failure and expose exact omission counts within the byte cap', async () => {
    for (let index = 0; index < 200; index++) testResult('passed', `test-${index}`, 'wide title '.repeat(400));
    testResult('failed', 'late-failure');
    await reporter.finish();
    const page = (await client.query({ operation: 'tests', runId: reporter.runId, limit: 25 })) as DesktopRunPage;
    expect(page.status).toBe('failed');
    expect(page.total).toBe(201);
    expect(page.omissions.items).toBe(201 - page.items.length);
    expect(page.omissions.textBytes).toBeGreaterThan(0);
    expect(Buffer.byteLength(JSON.stringify(page))).toBeLessThanOrEqual(16 * 1024);
    const seen = new Set(page.items.map(({ id }) => id));
    let cursor = page.nextCursor;
    while (cursor) {
      const next = (await client.query({ operation: 'tests', runId: reporter.runId, cursor, limit: 25 })) as DesktopRunPage;
      for (const { id } of next.items) {
        expect(seen.has(id)).toBe(false);
        seen.add(id);
      }
      cursor = next.nextCursor;
    }
    expect(seen.size).toBe(201);
  });

  test('cursors are bound to grant, operation, run, and immutable snapshot', async () => {
    testResult('passed');
    testResult('passed');
    await reporter.flush();
    const page = (await client.query({ operation: 'tests', runId: reporter.runId, limit: 1 })) as DesktopRunPage;
    expect(page.nextCursor).toBeDefined();
    await expect(client.query({ operation: 'work', runId: reporter.runId, cursor: page.nextCursor })).rejects.toThrow('cursor');
    const other = service.connect(service.issueGrant({ runIds: [reporter.runId], expiresAt: Date.now() + 60_000 }));
    await expect(other.query({ operation: 'tests', runId: reporter.runId, cursor: page.nextCursor })).rejects.toThrow('cursor');
    testResult('passed');
    await reporter.flush();
    await expect(client.query({ operation: 'tests', runId: reporter.runId, cursor: page.nextCursor })).rejects.toThrow('stale');
  });

  test('revocation and unregistered run scope fail closed for already connected readers', async () => {
    await expect(client.query({ operation: 'status', runId: randomUUID() })).rejects.toThrow('unauthorized');
    service.revokeGrant(token);
    await expect(client.query({ operation: 'status', runId: reporter.runId })).rejects.toThrow('unauthorized');
    expect(() => service.connect(token)).toThrow('unauthorized');
  });

  test('a valid credential cannot read a different registered run', async () => {
    const otherId = randomUUID();
    service.registerRun({ runId: otherId, root: reporter.root, expiresAt: Date.now() + 60_000 });
    await expect(client.query({ operation: 'status', runId: otherId })).rejects.toThrow('unauthorized');
  });

  test('forgetting and re-registering a run cannot restore an old grant', async () => {
    service.forgetRun(reporter.runId);
    service.registerRun({ runId: reporter.runId, root: reporter.root, expiresAt: Date.now() + 60_000 });
    await expect(client.query({ operation: 'status', runId: reporter.runId })).rejects.toThrow('unauthorized');
  });

  test.each(['run.json', './run.json', 'commands/../run.json', '../outside.log'])(
    'trusted artifact registration rejects unsafe or raw canonical projection %s',
    (artifact) => {
      expect(() =>
        service.registerRun({
          runId: randomUUID(),
          root: reporter.root,
          expiresAt: Date.now() + 60_000,
          textArtifacts: [artifact],
        }),
      ).toThrow();
    },
  );

  test.each(['grant', 'retention', 'forget'] as const)('%s invalidation applies before projection', async (kind) => {
    const scoped = new DesktopRunQueryService();
    scoped.registerRun({
      runId: reporter.runId,
      root: reporter.root,
      expiresAt: Date.now() + (kind === 'retention' ? 1000 : 60_000),
    });
    const reader = scoped.connect(
      scoped.issueGrant({ runIds: [reporter.runId], expiresAt: Date.now() + (kind === 'grant' ? 1000 : 60_000) }),
    );
    if (kind === 'forget') scoped.forgetRun(reporter.runId);
    const now = jest.spyOn(Date, 'now').mockReturnValue(Date.now() + 2000);
    try {
      await expect(reader.query({ operation: 'status', runId: reporter.runId })).rejects.toThrow('unauthorized');
    } finally {
      now.mockRestore();
    }
  });

  test('only authorized opaque artifact IDs work; text is redacted before clipping and counted in UTF-8 bytes', async () => {
    fs.mkdirSync(path.join(reporter.root, 'commands'));
    const text = 'reader-secret '.repeat(500) + '😀'.repeat(500);
    fs.writeFileSync(path.join(reporter.root, 'commands/output.log'), text);
    reporter.emit({ kind: 'artifact', payload: { path: 'commands/output.log', description: 'Command output reader-secret' } });
    await reporter.flush();
    const page = (await client.query({ operation: 'artifacts', runId: reporter.runId })) as DesktopRunPage;
    expect(JSON.stringify(page)).not.toContain('reader-secret');
    expect(JSON.stringify(page)).not.toContain(reporter.root);
    expect(JSON.stringify(page)).not.toContain('commands/output.log');
    const artifact = await client.query({ operation: 'artifact', runId: reporter.runId, artifactId: page.items[0].id });
    expect('text' in artifact).toBe(true);
    if (!('text' in artifact)) throw new Error('Expected artifact response.');
    expect(artifact.text).not.toContain('reader-secret');
    expect(artifact.text).toContain('[REDACTED]');
    expect(Buffer.byteLength(artifact.text)).toBeLessThanOrEqual(4096);
    expect(artifact.omissions.bytes + Buffer.byteLength(artifact.text)).toBe(
      Buffer.byteLength(text.replaceAll('reader-secret', '[REDACTED]')),
    );
    const restricted = service.connect(service.issueGrant({ runIds: [reporter.runId], expiresAt: Date.now() + 60_000 }));
    await expect(restricted.query({ operation: 'artifacts', runId: reporter.runId })).rejects.toThrow('unauthorized');
    await expect(restricted.query({ operation: 'artifact', runId: reporter.runId, artifactId: page.items[0].id })).rejects.toThrow(
      'unauthorized',
    );
    await expect(client.query({ operation: 'artifact', runId: reporter.runId, artifactId: randomUUID() })).rejects.toThrow('unauthorized');
  });

  test('collector and read-time secrets never appear in pages, including late registered secrets', async () => {
    testResult('passed', 'sensitive-id', 'collector-secret reader-secret late-secret');
    reporter.addSecret('late-secret');
    await reporter.finish();
    const page = (await client.query({ operation: 'tests', runId: reporter.runId })) as DesktopRunPage;
    expect(page.items[0].title).toBe('[REDACTED] [REDACTED] [REDACTED]');
    expect(JSON.stringify(page)).not.toContain('sensitive-id');
  });

  test('failures are projected without stacks, contexts, or paths', async () => {
    reporter.fail(new Error('Failure reader-secret'));
    await reporter.finish();
    const page = (await client.query({ operation: 'failures', runId: reporter.runId })) as DesktopRunPage;
    expect(page.items[0]).toMatchObject({ title: 'infrastructure', message: 'Failure [REDACTED]' });
    expect(JSON.stringify(page)).not.toContain('stack');
    expect(JSON.stringify(page)).not.toContain(reporter.root);
  });

  (process.platform === 'win32' ? test.skip : test)(
    'symlinked retained results are rejected (file symlinks need Windows privilege)',
    async () => {
      testResult('passed');
      await reporter.finish();
      const file = path.join(reporter.root, 'run.json');
      const retained = path.join(root, 'retained.json');
      fs.renameSync(file, retained);
      fs.symlinkSync(retained, file);
      await expect(client.query({ operation: 'status', runId: reporter.runId })).rejects.toThrow('symlink');
      fs.unlinkSync(file);
      fs.renameSync(retained, file);
    },
  );

  test('hardlinked and oversized retained results are rejected instead of truncated into success', async () => {
    testResult('passed');
    await reporter.finish();
    const file = path.join(reporter.root, 'run.json');
    const linked = path.join(root, 'linked.json');
    fs.linkSync(file, linked);
    await expect(client.query({ operation: 'status', runId: reporter.runId })).rejects.toThrow('private regular file');
    fs.unlinkSync(linked);
    fs.truncateSync(file, 64 * 1024 * 1024 + 1);
    await expect(client.query({ operation: 'status', runId: reporter.runId })).rejects.toThrow('limit');
  });

  test('artifact limits, invalid UTF-8, and missing content fail explicitly', async () => {
    fs.mkdirSync(path.join(reporter.root, 'commands'));
    reporter.emit({ kind: 'artifact', payload: { path: 'commands/output.log', description: 'Output' } });
    await reporter.flush();
    const page = (await client.query({ operation: 'artifacts', runId: reporter.runId })) as DesktopRunPage;
    const query = { operation: 'artifact' as const, runId: reporter.runId, artifactId: page.items[0].id };
    await expect(client.query(query)).rejects.toThrow();
    const file = path.join(reporter.root, 'commands/output.log');
    fs.writeFileSync(file, Buffer.from([0xff]));
    await expect(client.query(query)).rejects.toThrow('encoded data');
    fs.truncateSync(file, 1024 * 1024 + 1);
    await expect(client.query(query)).rejects.toThrow('limit');
  });

  test('malformed/inconsistent persisted data never returns a success-shaped fallback', async () => {
    testResult('passed');
    await reporter.finish();
    rewrite((result) => {
      result.tests[0].status = 'failed';
    });

    await expect(client.query({ operation: 'status', runId: reporter.runId })).rejects.toThrow('disagrees');
    fs.writeFileSync(path.join(reporter.root, 'run.json'), '{');
    await expect(client.query({ operation: 'status', runId: reporter.runId })).rejects.toThrow();
  });

  test('snapshot persistence failures remain reporting failures after the writer recovers', async () => {
    const write = fs.writeFileSync;
    const injected = jest.spyOn(fs, 'writeFileSync').mockImplementation((file, ...args) => {
      if (String(file).endsWith('run.json.tmp')) throw new Error('Injected snapshot persistence failure.');
      return write(file, ...args);
    });
    try {
      testResult('passed');
      await reporter.flush();
    } finally {
      injected.mockRestore();
    }
    await reporter.finish();
    expect(await client.query({ operation: 'status', runId: reporter.runId })).toMatchObject({
      terminal: true,
      status: 'failed',
    });
    expect(await client.query({ operation: 'failures', runId: reporter.runId })).toMatchObject({
      items: [expect.objectContaining({ title: 'reporting', message: 'Injected snapshot persistence failure.' })],
    });
  });

  test.each([
    { operation: 'artifact', artifactId: '../run.json' },
    { operation: 'status', path: '/tmp/run.json' },
    { operation: 'tests', limit: 0 },
    { operation: 'tests', limit: 26 },
    { operation: 'tests', limit: 1.5 },
    { operation: 'tests', cursor: 'model supplied path' },
    { operation: 'restart' },
  ])('rejects invalid request %j', (input) => {
    expect(() => validateDesktopRunQuery({ runId: reporter.runId, ...input })).toThrow();
  });
});
