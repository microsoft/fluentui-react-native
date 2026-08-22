import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';

import { ArtifactStore, redact, toArtifactId } from './artifacts.ts';
import { DesktopLifecycle, isTerminalState } from './lifecycle.ts';
import { OwnershipManifest } from './ownership.ts';
import { renderJUnit } from './junit.ts';
import { appendCleanupFailure } from './errors.ts';

function tempDirectory(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'desktop-driver-test-'));
}

describe('lifecycle state machine', () => {
  it('walks the documented happy path', () => {
    const lifecycle = new DesktopLifecycle({ platform: 'fake', ownership: 'self' });

    lifecycle.advance('starting', 'launchRequested');
    lifecycle.advance('connected', 'webDriverSessionCreated');
    lifecycle.advance('ready', 'ready');
    lifecycle.transition('stopping');
    lifecycle.observeExit('requestedShutdown');

    expect(lifecycle.current).toBe('stopped');
    expect(lifecycle.reason).toBe('requestedShutdown');
    expect(lifecycle.events().map((event) => event.type)).toEqual([
      'launchRequested',
      'webDriverSessionCreated',
      'ready',
      'shutdownCompleted',
    ]);
  });

  it('rejects an undefined transition', () => {
    const lifecycle = new DesktopLifecycle({ platform: 'fake', ownership: 'self' });
    expect(() => lifecycle.transition('ready')).toThrow(/Invalid desktop lifecycle transition created -> ready/);
  });

  it('distinguishes a crash from a normal exit', () => {
    const lifecycle = new DesktopLifecycle({ platform: 'macos', ownership: 'external' });
    lifecycle.advance('attaching', 'launchRequested');
    lifecycle.advance('connected', 'webDriverSessionCreated');
    lifecycle.observeExit('crashed', { exitCode: 139 });

    expect(lifecycle.current).toBe('crashed');
    expect(isTerminalState(lifecycle.current)).toBe(true);
    expect(lifecycle.events().at(-1)?.type).toBe('crashObserved');
  });

  it('makes monitor failure terminal and preserves its reason', () => {
    const lifecycle = new DesktopLifecycle({ platform: 'windows', ownership: 'self' });
    lifecycle.advance('starting', 'launchRequested');
    lifecycle.advance('connected', 'webDriverSessionCreated');
    lifecycle.observeExit('monitorFailure', { processId: 42 });

    expect(lifecycle.current).toBe('crashed');
    expect(lifecycle.reason).toBe('monitorFailure');
    expect(lifecycle.events().at(-1)?.type).toBe('monitorError');
  });

  it('bounds the retained event history', () => {
    const lifecycle = new DesktopLifecycle({ platform: 'fake', ownership: 'self', historyLimit: 3 });
    for (let index = 0; index < 10; index += 1) {
      lifecycle.emit('monitorError', { index });
    }
    expect(lifecycle.events()).toHaveLength(3);
  });
});

describe('ownership manifest', () => {
  it('only reports processes it started', () => {
    const manifest = new OwnershipManifest('run-1');
    manifest.record('driverHost', 4242, 'self', 'fake driver host');
    manifest.record('app', 999, 'external', 'already-running Storybook');

    expect(manifest.owns('driverHost', 4242)).toBe(true);
    expect(manifest.owns('app', 999)).toBe(false);
    expect(manifest.ownedProcesses()).toEqual([4242]);
  });

  it('round-trips through disk', () => {
    const directory = tempDirectory();
    const manifest = new OwnershipManifest('run-2');
    manifest.record('port', 7007, 'external');
    const file = manifest.save(directory);

    expect(OwnershipManifest.load(file).list()).toEqual(manifest.list());
  });

  it('never terminates an externally owned process', async () => {
    const manifest = new OwnershipManifest('run-3');
    manifest.record('app', process.pid, 'external', 'this test runner');
    const failures = await manifest.terminateOwnedProcesses(10);

    expect(failures).toEqual([]);
    expect(manifest.ownedProcesses()).toEqual([]);
  });
});

describe('artifacts', () => {
  it('redacts credential-shaped and user-typed values at any depth', () => {
    const redacted = redact({
      token: 'abc',
      nested: { Authorization: 'Bearer x', value: 'typed text', keep: 'visible' },
      list: [{ clipboard: 'secret' }],
    }) as Record<string, Record<string, string>>;

    expect(redacted.token).toBe('[redacted]');
    expect(redacted.nested.Authorization).toBe('[redacted]');
    expect(redacted.nested.value).toBe('[redacted]');
    expect(redacted.nested.keep).toBe('visible');
    expect((redacted.list as unknown as Record<string, string>[])[0].clipboard).toBe('[redacted]');
  });

  it('keeps every artifact path inside the run directory', () => {
    const store = new ArtifactStore({ rootDirectory: tempDirectory() });
    expect(() => store.resolve('../escape.txt')).toThrow(/escapes the run directory/);
  });

  it('writes a run report with the protocol and matrix versions', async () => {
    const store = new ArtifactStore({ rootDirectory: tempDirectory() });
    store.appendEvent({
      type: 'ready',
      timestamp: new Date().toISOString(),
      platform: 'fake',
      ownership: 'self',
      state: 'ready',
    });
    const report = store.writeRunReport({
      packageVersion: '0.1.0',
      runId: store.runId,
      startedAt: new Date().toISOString(),
      finishedAt: new Date().toISOString(),
      platform: 'fake',
      backend: 'fake',
      target: { mode: 'attach', identity: 'x' },
      ownership: 'self',
      capabilities: [],
      storyIds: ['components-button--default'],
      results: [],
      summary: { passed: 0, failed: 0, skipped: 0, infrastructureError: 0, durationMs: 0 },
    });
    await store.close();

    expect(report.protocolVersion).toBe(1);
    expect(report.portableCommandMatrixVersion).toBe(2);
    expect(fs.existsSync(path.join(store.runDirectory, 'run.json'))).toBe(true);
    expect(fs.readFileSync(path.join(store.runDirectory, 'events.ndjson'), 'utf8')).toContain('"type":"ready"');
  });

  it('derives a stable directory name from a test title', () => {
    expect(toArtifactId('[story:components-button--default] presses the button')).toBe(
      'story-components-button-default-presses-the-button',
    );
  });
});

describe('JUnit rendering', () => {
  it('separates infrastructure errors from test failures', () => {
    const xml = renderJUnit('desktop', [
      { testId: 'a', title: 'passes', status: 'passed', durationMs: 10 },
      { testId: 'b', title: 'fails', status: 'failed', durationMs: 20, error: { message: 'boom & <bad>' } },
      { testId: 'c', title: 'broken', status: 'infrastructureError', durationMs: 0, error: { message: 'no driver' } },
      { testId: 'd', title: 'skipped', status: 'skipped', durationMs: 0 },
    ]);

    expect(xml).toContain('failures="1"');
    expect(xml).toContain('errors="1"');
    expect(xml).toContain('skipped="1"');
    expect(xml).toContain('<failure message="boom &amp; &lt;bad&gt;">');
    expect(xml).toContain('<error message="no driver">');
  });
});

describe('cleanup failures', () => {
  it('appends to the primary failure instead of replacing it', () => {
    const primary = new Error('assertion failed');
    const result = appendCleanupFailure(primary, new Error('driver host would not stop')) as Error;

    expect(result).toBe(primary);
    expect(result.message).toContain('assertion failed');
    expect(result.message).toContain('[cleanup failure] driver host would not stop');
  });
});
