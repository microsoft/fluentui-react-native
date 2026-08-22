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

import { ArtifactStore } from '../artifacts.ts';
import { buildCapabilities, buildRootSessionCapabilities } from './capability-map.ts';
import { attachDesktopCommands, type DesktopBrowserLike } from './commands.ts';
import { DesktopLifecycle } from '../lifecycle.ts';
import { isAlive, OwnershipManifest } from '../ownership.ts';
import { resolveDesktopOptions } from '../config.ts';
import { StoryController } from '../storybook/controller.ts';
import { appendCleanupFailure, DesktopDriverError } from '../errors.ts';
import { createRootSessionEnumerator, discoverAttachWindow, type DesktopWindowMatch } from './window-discovery.ts';
import { PACKAGE_VERSION } from '../package-version.ts';
import { portableCommandsFor } from '../capabilities.ts';
import type { DriverHostHandle } from '../driver-host/client.ts';
import type {
  DesktopDriverOptions,
  DesktopDriverService as DesktopDriverServiceHandle,
  DesktopTestResult,
  ResolvedDesktopDriverOptions,
} from '../types.ts';

/**
 * The driver-host client is loaded on demand.
 *
 * It resolves the host entry from its own module URL, which only exists under real ESM. Keeping
 * the import dynamic means the neutral parts of this module stay loadable from tooling and tests
 * that never start a host.
 */
async function driverHostClient(): Promise<typeof import('../driver-host/client.ts')> {
  return import('../driver-host/client.ts');
}

/** Environment variable through which the launcher publishes the owned endpoint to workers. */
export const DESKTOP_ENDPOINT_ENV = 'FURN_DESKTOP_DRIVER_ENDPOINT';

export interface PublishedEndpoint {
  hostname: string;
  port: number;
  path: string;
  storybookUrl?: string;
  runId: string;
  artifactsDirectory: string;
  driverHostLog?: string;
  driverHostPid?: number;
  /** Application process observed during attach-mode discovery. */
  appProcessId?: number;
  specDigest?: string;
  /** Native window handle resolved from an attach target, when the backend needs one. */
  windowHandle?: string;
  /** How the window was selected, for the `windowDiscovered` lifecycle event. */
  windowMatch?: { matchedBy: string; exact: boolean; name?: string; processId?: number };
  /** Set instead of the endpoint fields when the driver host failed to start. */
  error?: string;
}

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
}

export class DesktopDriverService {
  private readonly options: ResolvedDesktopDriverOptions;
  private readonly ownership: OwnershipManifest;
  private readonly lifecycle: DesktopLifecycle;
  private readonly results: DesktopTestResult[] = [];
  private readonly startedAt = new Date().toISOString();
  private readonly storyIds = new Set<string>();
  private readonly specDigest?: string;

  private host?: DriverHostHandle;
  private artifacts?: ArtifactStore;
  private browser?: DesktopBrowserLike;
  private endpoint?: PublishedEndpoint;
  private stopMonitor?: () => void;

  constructor(serviceOptions: DesktopServiceOptions) {
    this.options = resolveDesktopOptions(serviceOptions);
    this.specDigest = serviceOptions.specDigest;
    this.ownership = new OwnershipManifest(`desktop-driver-${process.pid}`);
    this.lifecycle = new DesktopLifecycle({
      platform: this.options.platform,
      ownership: this.options.target.mode === 'launch' ? 'self' : 'external',
    });
  }

  // ---------------------------------------------------------------- launcher

  async onPrepare(config: MutableWdioConfig): Promise<void> {
    const artifacts = new ArtifactStore({ rootDirectory: this.options.artifactsDirectory });
    this.artifacts = artifacts;

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
      process.env[DESKTOP_ENDPOINT_ENV] = JSON.stringify({
        error: error instanceof Error ? error.message : String(error),
        artifactsDirectory: this.options.artifactsDirectory,
        runId: artifacts.runId,
      });
      throw error;
    }

    this.ownership.record('driverHost', this.host.pid, 'self', `${this.options.backend} driver host`);
    this.ownership.record('port', this.host.port, 'self');

    const window = await this.resolveAttachWindow(this.host.health.webDriverUrl);
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
        : `http://${this.options.storybook.host}:${this.options.storybook.port}`;

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

    // Workers are forked from this process after `onPrepare`, so the environment carries the
    // endpoint. The config fields are also set because that is the documented service contract.
    process.env[DESKTOP_ENDPOINT_ENV] = JSON.stringify(endpoint);
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

  /**
   * Resolves an attach target to one native window handle.
   *
   * Only the Windows backend needs this: `appium:appTopLevelWindow` is the only way to pin a
   * session to an already running window, and it takes a handle, while a portable target names
   * the application by pid, identity, or title. Mac2 attaches by bundle identifier instead, and
   * the `fake` backend has no windows.
   */
  private async resolveAttachWindow(webDriverUrl: string): Promise<DesktopWindowMatch | undefined> {
    return resolveAttachWindow(this.options, webDriverUrl);
  }

  async onComplete(): Promise<void> {
    if (!this.host) {
      return;
    }
    const failures: unknown[] = [];
    try {
      await this.host.stop();
    } catch (error) {
      failures.push(error);
    }
    failures.push(...(await this.ownership.terminateOwnedProcesses()));
    await this.artifacts?.close();
    delete process.env[DESKTOP_ENDPOINT_ENV];

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
  beforeSession(config: MutableWdioConfig, capabilities?: Record<string, unknown>): void {
    const endpoint = this.readEndpoint();
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
    const raw = process.env[DESKTOP_ENDPOINT_ENV];
    if (!raw) {
      throw new DesktopDriverError('The desktop driver launcher did not publish an endpoint; is the service registered in `services`?', {
        kind: 'configuration',
      });
    }
    this.endpoint = JSON.parse(raw) as PublishedEndpoint;
    if (this.endpoint.error) {
      throw new DesktopDriverError(`The desktop driver host failed to start: ${this.endpoint.error}`, {
        kind: 'driverHost',
        detail: { runId: this.endpoint.runId },
      });
    }
    return this.endpoint;
  }

  async before(_capabilities: unknown, _specs: readonly string[], browser: DesktopBrowserLike): Promise<void> {
    const endpoint = this.readEndpoint();
    this.browser = browser;
    const artifacts = new ArtifactStore({ rootDirectory: endpoint.artifactsDirectory, runId: endpoint.runId });
    this.artifacts = artifacts;

    this.lifecycle.on((event) => artifacts.appendEvent(event));
    this.lifecycle.advance(this.options.target.mode === 'launch' ? 'starting' : 'attaching', 'launchRequested', {
      mode: this.options.target.mode,
    });
    this.lifecycle.emit('driverHostStarted', { url: `http://${endpoint.hostname}:${endpoint.port}` });
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
      baseUrl: endpoint.storybookUrl ?? `http://${this.options.storybook.host}:${this.options.storybook.port}`,
      renderTimeout: this.options.storybook.renderTimeout,
    });

    attachDesktopCommands(browser, {
      options: this.options,
      lifecycle: this.lifecycle,
      artifacts,
      storyController,
      driverHostUrl: `http://${endpoint.hostname}:${endpoint.port}`,
      storybookUrl: endpoint.storybookUrl,
    });

    await this.waitForReadiness(browser, storyController);
    this.throwIfTerminatedBeforeReady();
    this.lifecycle.advance('ready', 'ready');
  }

  private async waitForReadiness(browser: DesktopBrowserLike, storyController: StoryController): Promise<void> {
    const deadline = Date.now() + this.options.readiness.timeout;
    let lastWindowError: unknown;

    if (this.options.readiness.requireWindow) {
      let observed = this.options.platform === 'fake' || Boolean(this.endpoint?.windowHandle);
      while (Date.now() < deadline && !observed) {
        this.throwIfTerminatedBeforeReady();
        if (this.options.backend === 'mac2') {
          const target = this.options.target;
          const application =
            target.mode === 'attach'
              ? { bundleId: target.identity }
              : target.app.endsWith('.app') || target.app.includes('/')
                ? { path: target.app }
                : { bundleId: target.app };
          try {
            const state = Number(await browser.execute('macos: queryAppState', application));
            observed = state >= 3;
          } catch (error) {
            lastWindowError = error;
          }
        } else {
          if (!browser.getWindowHandles) {
            throw new DesktopDriverError('The connected backend cannot verify the required application window', {
              kind: 'capability',
            });
          }
          observed = (await browser.getWindowHandles().catch(() => [])).length > 0;
        }
        if (!observed) {
          await new Promise((resolve) => setTimeout(resolve, 250));
        }
      }
      if (!observed) {
        throw new DesktopDriverError('No application window was observed within the readiness budget', {
          kind: 'lifecycle',
          cause: lastWindowError,
          detail: lastWindowError
            ? { lastError: lastWindowError instanceof Error ? lastWindowError.message : String(lastWindowError) }
            : undefined,
        });
      }
    }

    if (this.options.readiness.requireStorybookChannel) {
      let connected = false;
      while (Date.now() < deadline && !connected) {
        this.throwIfTerminatedBeforeReady();
        connected = await storyController.isConnected();
        if (!connected) {
          await new Promise((resolve) => setTimeout(resolve, 250));
        }
      }
      if (!connected) {
        throw new DesktopDriverError(`Storybook channel at ${storyController.url} did not answer within the readiness budget`, {
          kind: 'storybook',
        });
      }
    }

    if (this.options.readiness.requireTestId) {
      this.throwIfTerminatedBeforeReady();
      if (this.options.backend === 'mac2') {
        // Repeated XCTest snapshots can monopolize the React Native main thread during a cold
        // launch. Leave one idle interval for the app shell to mount before polling.
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
      const element = await browser.$(`~${this.options.readiness.requireTestId}`);
      const displayed = await element
        .waitForDisplayed({ timeout: Math.max(1000, deadline - Date.now()), interval: this.options.backend === 'mac2' ? 1000 : undefined })
        .catch(() => false);
      if (!displayed) {
        throw new DesktopDriverError(`Readiness selector "${this.options.readiness.requireTestId}" never became visible`, {
          kind: 'lifecycle',
        });
      }
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
    test: { title?: string; parent?: string },
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
        ? this.lifecycle.reason === 'monitorFailure'
          ? 'infrastructureError'
          : 'failed'
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
      this.lifecycle.emit('shutdownRequested', { ownership: this.lifecycle.ownership });
      this.lifecycle.observeExit('requestedShutdown');
    }

    artifacts.writeJUnit(`desktop-driver ${this.options.platform}`, this.results);
    artifacts.writeRunReport({
      packageVersion: PACKAGE_VERSION,
      runId: artifacts.runId,
      startedAt: this.startedAt,
      finishedAt: new Date().toISOString(),
      platform: this.options.platform,
      backend: this.options.backend,
      target: this.options.target,
      ownership: this.lifecycle.ownership,
      capabilities: portableCommandsFor(this.options.backend),
      storyIds: [...this.storyIds],
      specDigest: this.endpoint?.specDigest,
      results: this.results,
      summary: summarize(this.results),
    });
    await artifacts.close();
    if (unexpectedExit) {
      throw unexpectedExit;
    }
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

export function summarize(results: readonly DesktopTestResult[]): {
  passed: number;
  failed: number;
  skipped: number;
  infrastructureError: number;
  durationMs: number;
} {
  return {
    passed: results.filter((result) => result.status === 'passed').length,
    failed: results.filter((result) => result.status === 'failed').length,
    skipped: results.filter((result) => result.status === 'skipped').length,
    infrastructureError: results.filter((result) => result.status === 'infrastructureError').length,
    durationMs: results.reduce((total, result) => total + result.durationMs, 0),
  };
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

/**
 * Resolves an attach target to one native window handle.
 *
 * Only the Windows backends need this: `appium:appTopLevelWindow` is the only way to pin a
 * session to an already running window, and it takes a handle, while a portable target names the
 * application by pid, identity, or title. Mac2 attaches by bundle identifier instead, and the
 * `fake` backend has no windows.
 */
export async function resolveAttachWindow(
  options: ResolvedDesktopDriverOptions,
  webDriverUrl: string,
): Promise<DesktopWindowMatch | undefined> {
  const target = options.target;
  if (target.mode !== 'attach' || options.backend !== 'novawindows') {
    return undefined;
  }

  const enumerate = createRootSessionEnumerator({
    webDriverUrl,
    capabilities: buildRootSessionCapabilities(options),
    need: { identity: target.identity !== undefined },
  });

  try {
    return await discoverAttachWindow(target, enumerate);
  } catch (error) {
    throw new DesktopDriverError(`Failed to resolve the attach target to a single top-level window: ${(error as Error).message}`, {
      kind: error instanceof DesktopDriverError ? error.kind : 'ownership',
      cause: error,
      detail: { target, ...(error instanceof DesktopDriverError ? error.detail : undefined) },
    });
  }
}

/**
 * Starts an owned driver host for a standalone session.
 *
 * Lets a consumer use Jest, Vitest, `node:test`, or a plain script without adopting a different
 * test API or backend contract.
 */
export async function startDesktopDriver(options: DesktopDriverOptions): Promise<DesktopDriverServiceHandle> {
  const resolved = resolveDesktopOptions(options);
  const ownership = new OwnershipManifest(`standalone-${process.pid}`);

  const { startDriverHost } = await driverHostClient();
  const host = await startDriverHost({
    backend: resolved.backend,
    host: resolved.host,
    port: resolved.port,
    startupTimeout: resolved.startupTimeout,
    fakeScene: resolved.fakeScene,
  });
  ownership.record('driverHost', host.pid, 'self', `${resolved.backend} driver host`);
  ownership.record('port', host.port, 'self');

  const window = await resolveAttachWindow(resolved, host.health.webDriverUrl).catch(async (error: unknown) => {
    // The host is ours, so a failed discovery must not leak it.
    await host.stop();
    throw error;
  });
  if (window) {
    ownership.record('window', window.candidate.handle, 'external', window.candidate.name);
    if (window.candidate.processId !== undefined) {
      ownership.record('app', window.candidate.processId, 'external', window.candidate.name);
    }
  }

  const capabilities = buildCapabilities(resolved, { windowHandle: window?.candidate.handle });

  return {
    webdriverOptions: {
      protocol: 'http',
      hostname: resolved.host,
      port: host.port,
      path: '/',
      capabilities,
      logLevel: resolved.logLevel,
    },
    options: resolved,
    health: host.health,
    ownedResources: ownership.list(),
    stop: async () => {
      let failure: unknown;
      try {
        await host.stop();
      } catch (error) {
        failure = error;
      }
      for (const cleanupFailure of await ownership.terminateOwnedProcesses()) {
        failure = appendCleanupFailure(failure, cleanupFailure);
      }
      if (failure) {
        throw failure;
      }
    },
  };
}
