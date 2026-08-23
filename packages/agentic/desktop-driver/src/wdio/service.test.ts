import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';

import { ArtifactStore } from '../artifacts.ts';
import { DESKTOP_ENDPOINT_ENV, DesktopWdioService, summarize } from './service.ts';
import type { DesktopBrowserLike } from './commands.ts';
import type { DesktopLifecycle } from '../lifecycle.ts';

function endpoint(artifactsDirectory: string, overrides: Record<string, unknown> = {}): string {
  return JSON.stringify({
    hostname: '127.0.0.1',
    port: 4723,
    path: '/',
    storybookUrl: 'http://127.0.0.1:7007',
    runId: 'service-test',
    artifactsDirectory,
    ...overrides,
  });
}

function browser(windowHandles?: readonly string[], executeResult?: unknown): DesktopBrowserLike {
  return {
    sessionId: 'session-1',
    $: jest.fn(),
    execute: jest.fn().mockResolvedValue(executeResult),
    getPageSource: jest.fn(),
    takeScreenshot: jest.fn(),
    addCommand: jest.fn(),
    getWindowHandles: windowHandles ? jest.fn().mockResolvedValue(windowHandles) : undefined,
  } as unknown as DesktopBrowserLike;
}

describe('WebdriverIO lifecycle service', () => {
  afterEach(() => {
    delete process.env[DESKTOP_ENDPOINT_ENV];
  });

  it('verifies Mac2 readiness through application state instead of unsupported window handles', async () => {
    const artifactsDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'desktop-driver-service-'));
    process.env[DESKTOP_ENDPOINT_ENV] = endpoint(artifactsDirectory);
    const service = new DesktopWdioService({
      platform: 'macos',
      target: { mode: 'attach', identity: 'com.example.Sample' },
      artifactsDirectory,
    });
    const instance = browser(undefined, 4);

    await service.before({}, [], instance);
    expect(instance.execute).toHaveBeenCalledWith('macos: queryAppState', { bundleId: 'com.example.Sample' });
    await service.after();
    const events = fs.readFileSync(path.join(artifactsDirectory, 'service-test', 'events.ndjson'), 'utf8');
    expect(events).toContain('"type":"sessionClosed"');
    expect(events).not.toContain('"type":"shutdownCompleted"');
  });

  it('records observed app processes and accepts a verified window', async () => {
    const artifactsDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'desktop-driver-service-'));
    process.env[DESKTOP_ENDPOINT_ENV] = endpoint(artifactsDirectory, {
      appProcessId: process.pid,
      windowHandle: '0x1234',
      windowMatch: { matchedBy: 'windowHandle', exact: true, processId: process.pid },
    });
    const service = new DesktopWdioService({
      platform: 'windows',
      target: { mode: 'attach', windowHandle: '0x1234' },
      artifactsDirectory,
    });

    await service.before({}, [], browser());
    await service.after();

    const events = fs.readFileSync(path.join(artifactsDirectory, 'service-test', 'events.ndjson'), 'utf8');
    expect(events).toContain('"type":"processStarted"');
    expect(events).toContain(`"processId":${process.pid}`);
    expect(events).toContain('"type":"ready"');
  });

  it('rejects Windows readiness when no window handle or window command is available', async () => {
    const artifactsDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'desktop-driver-service-'));
    process.env[DESKTOP_ENDPOINT_ENV] = endpoint(artifactsDirectory);
    const service = new DesktopWdioService({
      platform: 'windows',
      target: { mode: 'attach', identity: 'Sample' },
      artifactsDirectory,
    });

    await expect(service.before({}, [], browser())).rejects.toMatchObject({ kind: 'capability' });
    await service.after();
    const report = JSON.parse(fs.readFileSync(path.join(artifactsDirectory, 'service-test', 'run.json'), 'utf8')) as {
      results: { status: string }[];
    };
    expect(report.results[0].status).toBe('infrastructureError');
  });

  it('cannot report success after an observed post-readiness host failure', async () => {
    const artifactsDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'desktop-driver-service-'));
    process.env[DESKTOP_ENDPOINT_ENV] = endpoint(artifactsDirectory);
    const service = new DesktopWdioService({
      platform: 'fake',
      target: { mode: 'launch', app: 'fake' },
      artifactsDirectory,
    });
    await service.before({}, [], browser());

    const lifecycle = (service as unknown as { lifecycle: DesktopLifecycle }).lifecycle;
    lifecycle.observeExit('monitorFailure', { processId: 42 });
    await service.afterTest({ title: 'still looked green' }, {}, { passed: true, duration: 1 });

    await expect(service.after()).rejects.toThrow(/lifecycle ended unexpectedly: monitorFailure/);
    const report = JSON.parse(fs.readFileSync(path.join(artifactsDirectory, 'service-test', 'run.json'), 'utf8')) as {
      results: { status: string }[];
    };
    expect(report.results[0].status).toBe('infrastructureError');
  });

  it('writes startup failures before a WebDriver session exists', async () => {
    const artifactsDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'desktop-driver-service-'));
    process.env[DESKTOP_ENDPOINT_ENV] = endpoint(artifactsDirectory, { error: 'backend failed' });
    const service = new DesktopWdioService({
      platform: 'fake',
      target: { mode: 'attach', identity: 'fake' },
      artifactsDirectory,
    });

    await expect(service.beforeSession({})).rejects.toMatchObject({ kind: 'driverHost' });

    const runDirectory = path.join(artifactsDirectory, 'service-test');
    const report = JSON.parse(fs.readFileSync(path.join(runDirectory, 'run.json'), 'utf8')) as {
      results: { status: string; error?: { message: string } }[];
    };
    expect(report.results).toEqual([
      expect.objectContaining({
        status: 'infrastructureError',
        error: expect.objectContaining({ message: expect.stringContaining('backend failed') }),
      }),
    ]);
    expect(fs.existsSync(path.join(runDirectory, 'junit.xml'))).toBe(true);
  });

  it('merges per-spec worker reports into one final run', async () => {
    const artifactsDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'desktop-driver-service-'));
    process.env[DESKTOP_ENDPOINT_ENV] = endpoint(artifactsDirectory);

    for (const [spec, passed] of [
      ['first.desktop.spec.ts', true],
      ['second.desktop.spec.ts', false],
    ] as const) {
      const worker = new DesktopWdioService({
        platform: 'fake',
        target: { mode: 'attach', identity: 'fake' },
        artifactsDirectory,
        sessionStrategy: 'spec',
      });
      await worker.before({}, [spec], browser());
      await worker.afterTest({ title: spec }, {}, { passed, error: passed ? undefined : new Error('assertion failed'), duration: 1 });
      await worker.after();
    }

    const launcher = new DesktopWdioService({
      platform: 'fake',
      target: { mode: 'attach', identity: 'fake' },
      artifactsDirectory,
      sessionStrategy: 'spec',
    });
    (launcher as unknown as { artifacts: ArtifactStore }).artifacts = new ArtifactStore({
      rootDirectory: artifactsDirectory,
      runId: 'service-test',
    });
    await launcher.onComplete();

    const report = JSON.parse(fs.readFileSync(path.join(artifactsDirectory, 'service-test', 'run.json'), 'utf8')) as {
      results: { title: string; status: string }[];
      summary: { passed: number; failed: number };
    };
    expect(report.results).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ title: 'first.desktop.spec.ts', status: 'passed' }),
        expect.objectContaining({ title: 'second.desktop.spec.ts', status: 'failed' }),
      ]),
    );
    expect(report.summary).toMatchObject({ passed: 1, failed: 1 });
  });

  it('preserves root infrastructure failures while merging per-spec workers', async () => {
    const artifactsDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'desktop-driver-service-'));
    const root = new ArtifactStore({ rootDirectory: artifactsDirectory, runId: 'service-test' });
    root.writeRunReport({
      packageVersion: '0.1.0',
      runId: root.runId,
      startedAt: new Date().toISOString(),
      finishedAt: new Date().toISOString(),
      platform: 'fake',
      backend: 'fake',
      target: { mode: 'attach', identity: 'fake' },
      ownership: 'external',
      capabilities: [],
      storyIds: [],
      results: [{ testId: 'startup', title: 'startup', status: 'infrastructureError', durationMs: 0 }],
      summary: summarize([{ testId: 'startup', title: 'startup', status: 'infrastructureError', durationMs: 0 }]),
    });
    root.write(
      'workers/worker-a/run.json',
      JSON.stringify({
        protocolVersion: 1,
        portableCommandMatrixVersion: 2,
        packageVersion: '0.1.0',
        runId: root.runId,
        startedAt: new Date().toISOString(),
        finishedAt: new Date().toISOString(),
        platform: 'fake',
        backend: 'fake',
        target: { mode: 'attach', identity: 'fake' },
        ownership: 'external',
        capabilities: [],
        storyIds: ['components-button--default'],
        results: [
          {
            testId: 'passed',
            storyId: 'components-button--default',
            title: 'passed',
            status: 'passed',
            durationMs: 1,
          },
        ],
        summary: summarize([{ testId: 'passed', storyId: 'components-button--default', title: 'passed', status: 'passed', durationMs: 1 }]),
        artifacts: [],
      }),
    );

    const launcher = new DesktopWdioService({
      platform: 'fake',
      target: { mode: 'attach', identity: 'fake' },
      artifactsDirectory,
      sessionStrategy: 'spec',
    });
    (launcher as unknown as { artifacts: ArtifactStore }).artifacts = root;
    await launcher.onComplete();

    const report = JSON.parse(fs.readFileSync(path.join(root.runDirectory, 'run.json'), 'utf8')) as {
      storyIds: string[];
      results: { status: string }[];
    };
    expect(report.results.map((result) => result.status)).toEqual(expect.arrayContaining(['infrastructureError', 'passed']));
    expect(report.storyIds).toEqual(['components-button--default']);
  });

  it('summarizes cancellation and timeout separately', () => {
    expect(
      summarize([
        { testId: 'cancelled', title: 'cancelled', status: 'cancelled', durationMs: 1 },
        { testId: 'timeout', title: 'timeout', status: 'timed_out', durationMs: 2 },
      ]),
    ).toMatchObject({ cancelled: 1, timedOut: 1, failed: 0, infrastructureError: 0 });
  });
});
