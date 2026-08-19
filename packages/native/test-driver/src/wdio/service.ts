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
import { buildCapabilities } from './capability-map.ts';
import { attachDesktopCommands, type DesktopBrowserLike } from './commands.ts';
import { DesktopLifecycle } from '../lifecycle.ts';
import { OwnershipManifest } from '../ownership.ts';
import { resolveDesktopOptions } from '../config.ts';
import { StoryController } from '../storybook/controller.ts';
import { appendCleanupFailure, DesktopDriverError } from '../errors.ts';
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
  specDigest?: string;
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

export class DesktopDriverService {
  private readonly options: ResolvedDesktopDriverOptions;
  private readonly ownership: OwnershipManifest;
  private readonly lifecycle: DesktopLifecycle;
  private readonly results: DesktopTestResult[] = [];
  private readonly startedAt = new Date().toISOString();
  private readonly storyIds = new Set<string>();

  private host?: DriverHostHandle;
  private artifacts?: ArtifactStore;
  private browser?: DesktopBrowserLike;
  private endpoint?: PublishedEndpoint;

  constructor(serviceOptions: DesktopDriverOptions) {
    this.options = resolveDesktopOptions(serviceOptions);
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
      specDigest: typeof config.desktopSpecDigest === 'string' ? config.desktopSpecDigest : undefined,
    };

    // Workers are forked from this process after `onPrepare`, so the environment carries the
    // endpoint. The config fields are also set because that is the documented service contract.
    process.env[DESKTOP_ENDPOINT_ENV] = JSON.stringify(endpoint);
    config.protocol = 'http';
    config.hostname = endpoint.hostname;
    config.port = endpoint.port;
    config.path = endpoint.path;
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
   * serialization means the worker always talks to the port that was actually allocated, and a
   * failed host start surfaces as an infrastructure error instead of a connection refusal.
   */
  beforeSession(config: MutableWdioConfig): void {
    const endpoint = this.readEndpoint();
    config.protocol = 'http';
    config.hostname = endpoint.hostname;
    config.port = endpoint.port;
    config.path = endpoint.path;
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
    this.lifecycle.advance('connected', 'webDriverSessionCreated', undefined, { sessionId: browser.sessionId });

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
    this.lifecycle.advance('ready', 'ready');
  }

  private async waitForReadiness(browser: DesktopBrowserLike, storyController: StoryController): Promise<void> {
    const deadline = Date.now() + this.options.readiness.timeout;

    if (this.options.readiness.requireStorybookChannel) {
      let connected = false;
      while (Date.now() < deadline && !connected) {
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
      const element = await browser.$(`~${this.options.readiness.requireTestId}`);
      const displayed = await element.waitForDisplayed({ timeout: Math.max(1000, deadline - Date.now()) }).catch(() => false);
      if (!displayed) {
        throw new DesktopDriverError(`Readiness selector "${this.options.readiness.requireTestId}" never became visible`, {
          kind: 'lifecycle',
        });
      }
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

    const testResult: DesktopTestResult = {
      testId: title,
      storyId,
      title,
      status: result.passed ? 'passed' : 'failed',
      durationMs: result.duration ?? 0,
      error: result.error ? { message: result.error.message, stack: result.error.stack } : undefined,
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
    const artifacts = this.artifacts;
    if (!artifacts || !this.browser) {
      return;
    }
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

  return {
    webdriverOptions: {
      protocol: 'http',
      hostname: resolved.host,
      port: host.port,
      path: '/',
      capabilities: buildCapabilities(resolved),
      logLevel: resolved.logLevel,
    },
    options: resolved,
    health: host.health,
    ownedResources: ownership.list(),
    stop: async () => {
      await host.stop();
      await ownership.terminateOwnedProcesses();
    },
  };
}
