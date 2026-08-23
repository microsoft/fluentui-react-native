/**
 * The WebdriverIO desktop service.
 *
 * WebdriverIO instantiates an inline service class separately in the launcher process and in each
 * worker, so one class covers both roles: `onPrepare`/`onComplete` own the driver host for the
 * whole run, and `before`/`afterTest`/`after` drive the lifecycle machine, attach the narrow
 * `browser.desktop` augmentation, and capture failure artifacts through ordinary hooks.
 *
 * Ownership is the invariant: the launcher stops only the host it started, and an `attach` target
 * never terminates the application.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';

import { ArtifactStore } from '../artifacts.ts';
import { statusForFailure, summarizeResults } from '../core/reporting.ts';
import { attachDesktopCommands, type DesktopBrowserLike } from './commands.ts';
import { DesktopLifecycle } from '../lifecycle.ts';
import { isAlive, OwnershipManifest } from '../ownership.ts';
import { resolveDesktopOptions } from '../config.ts';
import { StoryController } from '../server/channel/client.ts';
import { appendCleanupFailure, DesktopDriverError } from '../errors.ts';
import type { DesktopWindowMatch } from './window-discovery.ts';
import { PACKAGE_VERSION } from '../package-version.ts';
import { hostForUrl } from '../net.ts';
import { portableCommandsFor } from '../capabilities.ts';
import { DESKTOP_RESULT_STREAM_ENV, encodeDesktopResult } from '../server/runner/reporter-protocol.ts';
import {
  clearPublishedEndpoint,
  DESKTOP_ENDPOINT_ENV,
  publishEndpoint,
  readPublishedEndpoint,
  type PublishedEndpoint,
} from './run-context.ts';
import { waitForDesktopReadiness } from './readiness.ts';
import type { DriverHostHandle } from '../server/webdriver/client.ts';
import type {
  DesktopDriverOptions,
  DesktopExitReason,
  DesktopRunReport,
  DesktopTestResult,
  ResolvedDesktopDriverOptions,
} from '../types.ts';
import { resolveAttachWindow } from './standalone.ts';

/**
 * The driver-host client is loaded on demand.
 *
 * It resolves the host entry from its own module URL, which only exists under real ESM. Keeping
 * the import dynamic means the neutral parts of this module stay loadable from tooling and tests
 * that never start a host.
 */
async function driverHostClient(): Promise<typeof import('../server/webdriver/client.ts')> {
  return import('../server/webdriver/client.ts');
}

export { DESKTOP_ENDPOINT_ENV } from './run-context.ts';
export type { PublishedEndpoint } from './run-context.ts';

interface MutableWdioConfig {
  protocol?: string;
  hostname?: string;
  port?: number;
  path?: string;
  [key: string]: unknown;
}

export interface DesktopServiceOptions extends DesktopDriverOptions {
  /**
   * Digest of the generated story-test manifest.
   *
   * Recorded in `run.json` so a CI job can prove that two platform jobs executed the same story
   * tests. The config factory sets it; `desktopSpecDigest` on the WebdriverIO config overrides it
   * for a hand-written config.
   */
  specDigest?: string;
  sessionStrategy?: 'suite' | 'spec';
}

export class DesktopWdioService {
  private readonly options: ResolvedDesktopDriverOptions;
  private readonly ownership: OwnershipManifest;
  private readonly lifecycle: DesktopLifecycle;
  private readonly results: DesktopTestResult[] = [];
  private readonly startedAt = new Date().toISOString();
  private readonly storyIds = new Set<string>();
  private readonly specDigest?: string;
  private readonly sessionStrategy: 'suite' | 'spec';

  private host?: DriverHostHandle;
  private artifacts?: ArtifactStore;
  private browser?: DesktopBrowserLike;
  private endpoint?: PublishedEndpoint;
  private stopMonitor?: () => void;
  private workerId?: string;
  private finalized = false;

  constructor(serviceOptions: DesktopServiceOptions) {
    this.options = resolveDesktopOptions(serviceOptions);
    this.specDigest = serviceOptions.specDigest;
    this.sessionStrategy = serviceOptions.sessionStrategy ?? 'suite';
    this.ownership = new OwnershipManifest(`desktop-driver-${process.pid}`);
    this.lifecycle = new DesktopLifecycle({
      platform: this.options.platform,
      ownership: this.options.target.mode === 'launch' ? 'self' : 'external',
    });
  }

  // ---------------------------------------------------------------- launcher

  async onPrepare(config: MutableWdioConfig): Promise<void> {
    clearPublishedEndpoint();
    const artifacts = new ArtifactStore({ rootDirectory: this.options.artifactsDirectory });
    this.artifacts = artifacts;
    this.lifecycle.on((event) => artifacts.appendEvent(event));
    this.lifecycle.advance(this.options.target.mode === 'launch' ? 'starting' : 'attaching', 'launchRequested', {
      mode: this.options.target.mode,
      phase: 'launcher',
    });

    try {
      const { startDriverHost } = await driverHostClient();
      this.host = await startDriverHost({
        backend: this.options.backend,
        host: this.options.host,
        port: this.options.port,
        startupTimeout: this.options.startupTimeout,
        fakeScene: this.options.fakeScene,
        logDirectory: artifacts.runDirectory,
      });
    } catch (error) {
      // WebdriverIO continues past a failing `onPrepare`, which would otherwise surface as an
      // opaque "unable to connect" error in every worker. Publishing the real cause makes the
      // run fail as an infrastructure error with the diagnosis attached.
      publishEndpoint({
        hostname: '',
        port: 0,
        path: '/',
        error: error instanceof Error ? error.message : String(error),
        artifactsDirectory: this.options.artifactsDirectory,
        runId: artifacts.runId,
      });
      await this.writeFailureReport(artifacts, error, 'Driver host startup');
      throw error;
    }

    this.ownership.record('driverHost', this.host.pid, 'self', `${this.options.backend} driver host`);
    this.ownership.record('port', this.host.port, 'self');

    let window: DesktopWindowMatch | undefined;
    try {
      window = await resolveAttachWindow(this.options, this.host.health.webDriverUrl);
    } catch (error) {
      await this.host.stop().catch(() => undefined);
      publishEndpoint({
        hostname: '',
        port: 0,
        path: '/',
        error: error instanceof Error ? error.message : String(error),
        artifactsDirectory: this.options.artifactsDirectory,
        runId: artifacts.runId,
      });
      await this.writeFailureReport(artifacts, error, 'Attach-window discovery');
      throw error;
    }
    if (window) {
      // The application and its window belong to whoever launched them; recording them as
      // `external` is what stops cleanup from ever touching them.
      this.ownership.record('window', window.candidate.handle, 'external', window.candidate.name);
      if (window.candidate.processId !== undefined) {
        this.ownership.record('app', window.candidate.processId, 'external', window.candidate.name);
      }
    }
    this.ownership.save(artifacts.runDirectory);

    const storybookUrl =
      this.options.platform === 'fake'
        ? this.host.health.storybookUrl
        : `http://${hostForUrl(this.options.storybook.host)}:${this.options.storybook.port}`;

    const endpoint: PublishedEndpoint = {
      hostname: this.options.host,
      port: this.host.port,
      path: '/',
      storybookUrl,
      runId: artifacts.runId,
      artifactsDirectory: this.options.artifactsDirectory,
      driverHostLog: this.host.logFile,
      driverHostPid: this.host.pid,
      appProcessId: window?.candidate.processId,
      specDigest: typeof config.desktopSpecDigest === 'string' ? config.desktopSpecDigest : this.specDigest,
      windowHandle: window?.candidate.handle,
      windowMatch: window
        ? {
            matchedBy: window.matchedBy,
            exact: window.exact,
            name: window.candidate.name,
            processId: window.candidate.processId,
          }
        : undefined,
    };
    this.endpoint = endpoint;

    // Workers are forked from this process after `onPrepare`, so the environment carries the
    // endpoint. The config fields are also set because that is the documented service contract.
    publishEndpoint(endpoint);
    config.protocol = 'http';
    config.hostname = endpoint.hostname;
    config.port = endpoint.port;
    config.path = endpoint.path;
    if (window && Array.isArray(config.capabilities)) {
      for (const capability of config.capabilities as Record<string, unknown>[]) {
        applyWindowHandle(capability, window.candidate.handle);
      }
    }
  }

  async onComplete(): Promise<void> {
    const failures: unknown[] = [];
    if (this.host) {
      try {
        await this.host.stop();
      } catch (error) {
        failures.push(error);
      }
    }
    failures.push(...(await this.ownership.terminateOwnedProcesses()));
    if (this.artifacts) {
      await this.mergeFinalReports(this.artifacts, failures);
      await this.artifacts.close();
    }
    clearPublishedEndpoint();

    if (failures.length > 0) {
      throw failures.reduce((accumulated, failure) => appendCleanupFailure(accumulated, failure)) as Error;
    }
  }

  // ------------------------------------------------------------------ worker

  /**
   * Applies the owned endpoint before WebdriverIO creates the session.
   *
   * Reading it here rather than relying on the launcher's config mutation surviving worker
   * serialization means the worker always talks to the port that was actually allocated, the
   * session attaches to the window the launcher resolved, and a failed host start surfaces as an
   * infrastructure error instead of a connection refusal.
   */
  async beforeSession(config: MutableWdioConfig, capabilities?: Record<string, unknown>): Promise<void> {
    let endpoint: PublishedEndpoint;
    try {
      endpoint = this.readEndpoint();
    } catch (error) {
      const raw = process.env[DESKTOP_ENDPOINT_ENV];
      let failed: PublishedEndpoint | undefined;
      if (raw) {
        try {
          failed = JSON.parse(raw) as PublishedEndpoint;
        } catch {
          // Preserve the validated endpoint error from readEndpoint.
        }
      }
      if (failed?.runId && failed.artifactsDirectory) {
        const artifacts = new ArtifactStore({ rootDirectory: failed.artifactsDirectory, runId: failed.runId });
        await this.writeFailureReport(artifacts, error, 'WebDriver session setup');
      }
      throw error;
    }
    config.protocol = 'http';
    config.hostname = endpoint.hostname;
    config.port = endpoint.port;
    config.path = endpoint.path;
    if (endpoint.windowHandle && capabilities) {
      applyWindowHandle(capabilities, endpoint.windowHandle);
    }
  }

  private readEndpoint(): PublishedEndpoint {
    if (this.endpoint) {
      return this.endpoint;
    }
    this.endpoint = readPublishedEndpoint();
    return this.endpoint;
  }

  async before(_capabilities: unknown, specs: readonly string[], browser: DesktopBrowserLike): Promise<void> {
    const endpoint = this.readEndpoint();
    this.browser = browser;
    const artifacts = new ArtifactStore({ rootDirectory: endpoint.artifactsDirectory, runId: endpoint.runId });
    this.artifacts = artifacts;
    this.workerId = workerReportId(specs);

    this.lifecycle.on((event) => artifacts.appendEvent(event));
    this.lifecycle.advance(this.options.target.mode === 'launch' ? 'starting' : 'attaching', 'launchRequested', {
      mode: this.options.target.mode,
    });
    this.lifecycle.emit('driverHostStarted', { url: `http://${hostForUrl(endpoint.hostname)}:${endpoint.port}` });
    if (endpoint.appProcessId !== undefined) {
      this.lifecycle.emit('processStarted', { observed: true, mode: this.options.target.mode }, { processId: endpoint.appProcessId });
    }
    if (endpoint.windowHandle) {
      this.lifecycle.emit(
        'windowDiscovered',
        {
          windowHandle: endpoint.windowHandle,
          matchedBy: endpoint.windowMatch?.matchedBy,
          exact: endpoint.windowMatch?.exact,
          title: endpoint.windowMatch?.name,
        },
        { processId: endpoint.windowMatch?.processId },
      );
    }
    this.lifecycle.advance('connected', 'webDriverSessionCreated', undefined, { sessionId: browser.sessionId });
    this.startLivenessMonitor(endpoint);

    const storyController = new StoryController({
      baseUrl: endpoint.storybookUrl ?? `http://${hostForUrl(this.options.storybook.host)}:${this.options.storybook.port}`,
      renderTimeout: this.options.storybook.renderTimeout,
    });

    attachDesktopCommands(browser, {
      options: this.options,
      lifecycle: this.lifecycle,
      artifacts,
      storyController,
      driverHostUrl: `http://${hostForUrl(endpoint.hostname)}:${endpoint.port}`,
      storybookUrl: endpoint.storybookUrl,
    });

    try {
      await waitForDesktopReadiness({
        browser,
        controller: storyController,
        driver: this.options,
        lifecycle: this.lifecycle,
        endpoint: this.endpoint,
      });
      this.throwIfTerminatedBeforeReady();
      this.lifecycle.advance('ready', 'ready');
    } catch (error) {
      this.results.push(failureResult('Desktop readiness', error, this.lifecycle.reason));
      await this.finalizeWorkerArtifacts();
      throw error;
    }
  }

  private startLivenessMonitor(endpoint: PublishedEndpoint): void {
    const checks = [
      endpoint.driverHostPid ? { pid: endpoint.driverHostPid, reason: 'monitorFailure' as const, resource: 'driver host' } : undefined,
      endpoint.appProcessId ? { pid: endpoint.appProcessId, reason: 'lostProcess' as const, resource: 'application' } : undefined,
    ].filter((entry): entry is NonNullable<typeof entry> => entry !== undefined);
    if (checks.length === 0) {
      return;
    }

    let stopped = false;
    const timer = setInterval(() => {
      if (stopped || this.lifecycle.reason) {
        return;
      }
      for (const check of checks) {
        if (!isAlive(check.pid)) {
          this.lifecycle.observeExit(check.reason, { resource: check.resource, processId: check.pid });
          break;
        }
      }
    }, 250);
    timer.unref();
    this.stopMonitor = () => {
      stopped = true;
      clearInterval(timer);
    };
  }

  private throwIfTerminatedBeforeReady(): void {
    if (this.lifecycle.reason) {
      throw new DesktopDriverError(`Application lifecycle ended before readiness: ${this.lifecycle.reason}`, {
        kind: 'lifecycle',
        detail: { state: this.lifecycle.current, reason: this.lifecycle.reason },
      });
    }
  }

  async afterTest(
    test: { title?: string; parent?: string; pending?: boolean },
    _context: unknown,
    result: { passed?: boolean; error?: Error; duration?: number },
  ): Promise<void> {
    const title = [test.parent, test.title].filter(Boolean).join(' ') || 'unknown';
    const storyId = /\[story:([^\]]+)\]/.exec(title)?.[1];
    if (storyId) {
      this.storyIds.add(storyId);
    }

    const unexpectedExit = this.unexpectedLifecycleError();
    const testResult: DesktopTestResult = {
      testId: title,
      storyId,
      title,
      status: unexpectedExit
        ? statusForFailure(unexpectedExit, this.lifecycle.reason)
        : test.pending || (result.passed === undefined && !result.error)
          ? 'skipped'
          : result.passed
            ? 'passed'
            : 'failed',
      durationMs: result.duration ?? 0,
      error: unexpectedExit
        ? {
            message: `${result.error?.message ? `${result.error.message}\n` : ''}${unexpectedExit.message}`,
            stack: result.error?.stack,
          }
        : result.error
          ? { message: result.error.message, stack: result.error.stack }
          : undefined,
    };

    if (!result.passed && this.browser?.desktop) {
      try {
        const manifest = await this.browser.desktop.captureArtifacts(title);
        testResult.artifacts = manifest.files;
      } catch (error) {
        // Artifact capture must never replace the primary failure.
        testResult.error = {
          message: `${testResult.error?.message ?? 'Test failed'}\n[artifact capture failed] ${(error as Error).message}`,
          stack: testResult.error?.stack,
        };
      }
    }

    this.results.push(testResult);
    if (process.env[DESKTOP_RESULT_STREAM_ENV] === '1') {
      process.stdout.write(`${encodeDesktopResult(testResult)}\n`);
    }
  }

  async after(): Promise<void> {
    this.stopMonitor?.();
    this.stopMonitor = undefined;
    const artifacts = this.artifacts;
    if (!artifacts || !this.browser) {
      return;
    }
    const unexpectedExit = this.unexpectedLifecycleError();
    if (!this.lifecycle.reason) {
      this.lifecycle.transition('stopping');
      if (this.options.target.mode === 'attach') {
        this.lifecycle.emit('sessionCloseRequested', { ownership: this.lifecycle.ownership });
        this.lifecycle.transition('stopped');
        this.lifecycle.emit('sessionClosed', { ownership: this.lifecycle.ownership });
      } else {
        this.lifecycle.emit('shutdownRequested', { ownership: this.lifecycle.ownership });
        this.lifecycle.observeExit('requestedShutdown');
      }
    }

    await this.finalizeWorkerArtifacts();
    if (unexpectedExit) {
      throw unexpectedExit;
    }
  }

  private async finalizeWorkerArtifacts(): Promise<void> {
    const artifacts = this.artifacts;
    if (!artifacts || this.finalized) {
      return;
    }
    this.finalized = true;
    const reportBase = this.runReport(this.results, artifacts.runId);
    if (this.sessionStrategy === 'spec') {
      const worker = this.workerId ?? `worker-${process.pid}`;
      artifacts.writeJUnit(`desktop-driver ${this.options.platform}`, this.results, `workers/${worker}/junit.xml`);
      artifacts.writeRunReport(reportBase, `workers/${worker}/run.json`);
    } else {
      artifacts.writeJUnit(`desktop-driver ${this.options.platform}`, this.results);
      artifacts.writeRunReport(reportBase);
    }
    await artifacts.close();
  }

  private runReport(results: readonly DesktopTestResult[], runId: string) {
    return {
      packageVersion: PACKAGE_VERSION,
      runId,
      startedAt: this.startedAt,
      finishedAt: new Date().toISOString(),
      platform: this.options.platform,
      backend: this.options.backend,
      target: this.options.target,
      ownership: this.lifecycle.ownership,
      capabilities: portableCommandsFor(this.options.backend),
      storyIds: [...new Set(results.map((result) => result.storyId).filter((storyId): storyId is string => storyId !== undefined))],
      specDigest: this.endpoint?.specDigest ?? this.specDigest,
      results,
      summary: summarizeResults(results),
    };
  }

  private async writeFailureReport(artifacts: ArtifactStore, error: unknown, title: string): Promise<void> {
    const result = failureResult(title, error, this.lifecycle.reason);
    this.lifecycle.emit('monitorError', { phase: title, message: result.error?.message });
    if (this.sessionStrategy === 'spec' && this.workerId) {
      artifacts.writeJUnit(`desktop-driver ${this.options.platform}`, [result], `workers/${this.workerId}/junit.xml`);
      artifacts.writeRunReport(this.runReport([result], artifacts.runId), `workers/${this.workerId}/run.json`);
    } else {
      artifacts.writeJUnit(`desktop-driver ${this.options.platform}`, [result]);
      artifacts.writeRunReport(this.runReport([result], artifacts.runId));
    }
    await artifacts.close();
  }

  private async mergeFinalReports(artifacts: ArtifactStore, cleanupFailures: readonly unknown[]): Promise<void> {
    const workerReports = readWorkerReports(artifacts.runDirectory);
    const existing = readRunReport(path.join(artifacts.runDirectory, 'run.json'));
    const results = [...(existing?.results ?? []), ...workerReports.flatMap((report) => report.results)];
    const deduplicated = results.filter(
      (result, index, all) =>
        all.findIndex(
          (candidate) =>
            candidate.testId === result.testId &&
            candidate.title === result.title &&
            candidate.status === result.status &&
            candidate.error?.message === result.error?.message,
        ) === index,
    );
    for (const failure of cleanupFailures) {
      deduplicated.push(failureResult('Desktop cleanup', failure));
    }
    if (deduplicated.length === 0) {
      return;
    }
    artifacts.writeJUnit(`desktop-driver ${this.options.platform}`, deduplicated);
    artifacts.writeRunReport(this.runReport(deduplicated, artifacts.runId));
  }

  private unexpectedLifecycleError(): DesktopDriverError | undefined {
    if (!this.lifecycle.reason || this.lifecycle.reason === 'requestedShutdown') {
      return undefined;
    }
    return new DesktopDriverError(`Desktop lifecycle ended unexpectedly: ${this.lifecycle.reason}`, {
      kind: this.lifecycle.reason === 'monitorFailure' ? 'driverHost' : 'lifecycle',
      detail: { state: this.lifecycle.current, reason: this.lifecycle.reason },
    });
  }
}

export const summarize = summarizeResults;

function workerReportId(specs: readonly string[]): string {
  const source = specs.length > 0 ? specs.join('--') : `worker-${process.pid}`;
  const normalized = source
    .replaceAll('\\', '/')
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(-100);
  return normalized || `worker-${process.pid}`;
}

function failureResult(title: string, error: unknown, exitReason?: DesktopExitReason): DesktopTestResult {
  const failure = error instanceof Error ? error : new Error(String(error));
  return {
    testId: title,
    title,
    status: statusForFailure(error, exitReason),
    durationMs: 0,
    error: { message: failure.message, stack: failure.stack },
  };
}

function readRunReport(file: string): DesktopRunReport | undefined {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8')) as DesktopRunReport;
  } catch {
    return undefined;
  }
}

function readWorkerReports(runDirectory: string): DesktopRunReport[] {
  const workers = path.join(runDirectory, 'workers');
  if (!fs.existsSync(workers)) {
    return [];
  }
  return fs
    .readdirSync(workers, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => readRunReport(path.join(workers, entry.name, 'run.json')))
    .filter((report): report is DesktopRunReport => report !== undefined);
}

/**
 * Pins a capability set to one already running window.
 *
 * `appium:app` is removed rather than left alongside the handle because the two routing
 * capabilities are mutually exclusive.
 */
function applyWindowHandle(capabilities: Record<string, unknown>, windowHandle: string): void {
  capabilities['appium:appTopLevelWindow'] = windowHandle;
  delete capabilities['appium:app'];
}
