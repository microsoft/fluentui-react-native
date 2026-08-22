import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';

import { DESKTOP_ENDPOINT_ENV, DesktopDriverService } from './service.ts';
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
    const service = new DesktopDriverService({
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
    const service = new DesktopDriverService({
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
    const service = new DesktopDriverService({
      platform: 'windows',
      target: { mode: 'attach', identity: 'Sample' },
      artifactsDirectory,
    });

    await expect(service.before({}, [], browser())).rejects.toMatchObject({ kind: 'capability' });
    await service.after();
  });

  it('cannot report success after an observed post-readiness host failure', async () => {
    const artifactsDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'desktop-driver-service-'));
    process.env[DESKTOP_ENDPOINT_ENV] = endpoint(artifactsDirectory);
    const service = new DesktopDriverService({
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
});
