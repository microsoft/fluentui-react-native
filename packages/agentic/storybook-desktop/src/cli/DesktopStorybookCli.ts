import fs from 'node:fs';
import { createServer } from 'node:net';
import path from 'node:path';

import type { DesktopCommand, DesktopCommandPlan, DesktopSmokeOptions, DesktopStorybookAction } from '../config/commands.js';
import type { DesktopStorybookConfig } from '../config/makeDesktopStorybookConfig.js';
import { createDesktopStorybookInstance, FURN_STORYBOOK_BUNDLE_IDENTIFIER, FURN_STORYBOOK_INSTANCE_ID } from '../config/instance.js';
import type { DesktopStorybookInstance } from '../config/instance.js';
import { FURN_STORYBOOK_PLATFORM } from '../config/platforms.js';
import type { Platforms } from '../config/platforms.js';
import {
  createDesktopStorybookDriverManifest,
  createDesktopStoryManifest,
  writeDesktopStorybookDriverManifest,
  writeDesktopStoryManifest,
} from '../driver/index.js';
import { NodeDesktopCommandRunner } from './commandRunner.js';
import type { DesktopCommandRunner, PreparedDesktopCommand, RunningDesktopCommand } from './commandRunner.js';

type ResolvedDesktopStorybookInstance = DesktopStorybookInstance & {
  driverManifestPath?: string;
  macosXcconfigPath?: string;
};

export type DesktopStorybookCliOptions = {
  createStoryManifest?: typeof createDesktopStoryManifest;
  runner?: DesktopCommandRunner;
  fetch?: typeof globalThis.fetch;
  output?: Pick<NodeJS.WriteStream, 'write'>;
  isPortAvailable?: (port: number) => Promise<boolean>;
};

export type DesktopStorybookServerOptions = {
  host?: string;
  port?: number;
};

export class DesktopStorybookCli {
  readonly config: DesktopStorybookConfig;
  readonly instance: DesktopStorybookInstance;

  private readonly runner: DesktopCommandRunner;
  private readonly createStoryManifest: typeof createDesktopStoryManifest;
  private readonly fetch: typeof globalThis.fetch;
  private readonly output: Pick<NodeJS.WriteStream, 'write'>;
  private readonly isPortAvailable: (port: number) => Promise<boolean>;

  constructor(config: DesktopStorybookConfig, options: DesktopStorybookCliOptions = {}) {
    this.config = config;
    this.instance = createDesktopStorybookInstance({
      projectRoot: config.projectRoot,
      bundleIdentifierPrefix: config.macosBundleIdentifier,
    });
    this.runner = options.runner ?? new NodeDesktopCommandRunner();
    this.createStoryManifest = options.createStoryManifest ?? createDesktopStoryManifest;
    this.fetch = options.fetch ?? globalThis.fetch;
    this.output = options.output ?? process.stdout;
    this.isPortAvailable = options.isPortAvailable ?? isLoopbackPortAvailable;
  }

  async server(platform: Platforms, options: DesktopStorybookServerOptions = {}): Promise<void> {
    validateServerOptions(options);
    const command = this.config.getPlatformOptions(platform).server;
    if (command === false || command === undefined) {
      throw unsupportedAction('server', platform);
    }
    await this.executePlan(
      {
        ...command,
        env: {
          ...command.env,
          ...(options.host ? { STORYBOOK_WS_HOST: options.host } : {}),
          ...(options.port ? { STORYBOOK_WS_PORT: String(options.port) } : {}),
        },
      },
      platform,
    );
  }

  async driver(platform: Platforms, options: DesktopStorybookServerOptions = {}): Promise<void> {
    validateServerOptions(options);
    validateDriverHost(options.host);
    const command = this.config.getPlatformOptions(platform).server;
    if (command === false || command === undefined) {
      throw unsupportedAction('server', platform);
    }
    const storybookPort = options.port ?? (await findAvailablePort(this.instance.storybookPort, this.isPortAvailable));
    const metroPort = await findAvailablePort(this.instance.metroPort, this.isPortAvailable, new Set([storybookPort]));
    const driverPort = await findAvailablePort(this.instance.driverPort, this.isPortAvailable, new Set([storybookPort, metroPort]));
    const resolvedInstance: ResolvedDesktopStorybookInstance = {
      ...this.instance,
      driverPort,
      metroPort,
      storybookPort,
    };
    resolvedInstance.driverManifestPath = await this.writeDriverManifest(platform, resolvedInstance);
    this.output.write(`Storybook instance ${resolvedInstance.id}: channel=${storybookPort}, metro=${metroPort}, driver=${driverPort}\n`);
    const metro = this.runner.start(this.prepareCommand(defaultMetroCommand(resolvedInstance), platform, resolvedInstance));
    try {
      await this.executePlan(
        {
          ...command,
          env: {
            ...command.env,
            ...(options.host ? { STORYBOOK_WS_HOST: options.host } : {}),
          },
        },
        platform,
        resolvedInstance,
      );
    } finally {
      await metro.stop();
    }
  }

  async manifest(platform: Platforms, outputPath?: string): Promise<string> {
    const manifest = await this.createStoryManifest(this.config, platform);
    const resolvedOutput = resolveFromProject(
      this.config.projectRoot,
      outputPath ?? path.join('storybook-desktop.generated', `story-manifest.${platform}.json`),
    );
    writeDesktopStoryManifest(manifest, resolvedOutput);
    this.output.write(`${resolvedOutput}\n`);
    return resolvedOutput;
  }

  printInstance(platform: Platforms): void {
    this.output.write(
      `${JSON.stringify(
        {
          ...this.instance,
          endpoint: platform,
          targetId: `${this.config.appName}-${platform}`.toLowerCase(),
          testIDPrefix: this.config.testIDPrefix,
        },
        null,
        2,
      )}\n`,
    );
  }

  prep(platform: Platforms): Promise<void> {
    return this.executeAction('prep', platform);
  }

  bundle(platform: Platforms): Promise<void> {
    return this.executeAction('bundle', platform);
  }

  run(platform: Platforms): Promise<void> {
    return this.executeAction('run', platform);
  }

  build(platform: Platforms): Promise<void> {
    return this.executeAction('build', platform);
  }

  async smoke(platform: Platforms): Promise<void> {
    const smoke = this.config.getSmokeOptions(platform);
    if (smoke === false) {
      throw unsupportedAction('smoke', platform);
    }
    if (smoke?.command) {
      await this.executePlan(smoke.command, platform);
      return;
    }
    if (!smoke?.stop) {
      throw new Error(
        `The reusable ${platform} smoke lifecycle requires platformOptions.${platform}.smoke.stop so the native app can be shut down safely.`,
      );
    }

    const instance = await this.resolveSmokeInstance(platform, smoke);
    await this.runSmokeLifecycle(platform, smoke, instance);
  }

  private async executeAction(
    action: Exclude<DesktopStorybookAction, 'smoke'>,
    platform: Platforms,
    instance?: ResolvedDesktopStorybookInstance,
  ): Promise<void> {
    const plan = this.config.getCommandPlan(action, platform);
    if (plan === false) {
      throw unsupportedAction(action, platform);
    }
    await this.executePlan(plan, platform, instance);
  }

  private async runSmokeLifecycle(
    platform: Platforms,
    smoke: DesktopSmokeOptions,
    instance: ResolvedDesktopStorybookInstance,
  ): Promise<void> {
    const backgroundCommands: RunningDesktopCommand[] = [];
    const failures: unknown[] = [];
    let primaryFailure: unknown;
    const serverUrl = smoke.serverUrl ?? loopbackUrl(instance.storybookPort);
    const metroUrl = smoke.metroUrl ?? loopbackUrl(instance.metroPort, '/status');

    try {
      const configuredServer = this.config.getPlatformOptions(platform).server;
      const server = smoke.server === false ? undefined : (smoke.server ?? (configuredServer === false ? undefined : configuredServer));
      const metro = smoke.metro === false ? undefined : (smoke.metro ?? defaultMetroCommand(instance));
      const readiness: Promise<void>[] = [];

      if (server) {
        const runningServer = this.runner.start(this.prepareCommand(server, platform, instance));
        backgroundCommands.push(runningServer);
        readiness.push(this.waitForUrl(new URL('/index.json', serverUrl).href, runningServer, smoke.startupTimeoutMs));
      }
      if (metro) {
        const runningMetro = this.runner.start(this.prepareCommand(metro, platform, instance));
        backgroundCommands.push(runningMetro);
        readiness.push(this.waitForUrl(metroUrl, runningMetro, smoke.startupTimeoutMs));
      }

      await Promise.all(readiness);
      await this.executeAction('run', platform, instance);
      await this.renderEveryStory(serverUrl, smoke.settleMs ?? 0);
    } catch (error) {
      primaryFailure = error;
    } finally {
      try {
        await this.executePlan(smoke.stop!, platform, instance);
      } catch (error) {
        failures.push(error);
      }
      for (const backgroundCommand of backgroundCommands.reverse()) {
        try {
          await backgroundCommand.stop();
        } catch (error) {
          failures.push(error);
        }
      }
    }

    if (primaryFailure !== undefined) {
      failures.unshift(primaryFailure);
    }
    if (failures.length === 1) {
      throw failures[0];
    }
    if (failures.length > 1) {
      throw new AggregateError(failures, `${platform} smoke test failed and cleanup reported additional errors.`);
    }
  }

  private async resolveSmokeInstance(platform: Platforms, smoke: DesktopSmokeOptions): Promise<ResolvedDesktopStorybookInstance> {
    const storybookPort = smoke.serverUrl
      ? portFromUrl(smoke.serverUrl)
      : await findAvailablePort(this.instance.storybookPort, this.isPortAvailable);
    const metroPort = smoke.metroUrl
      ? portFromUrl(smoke.metroUrl)
      : await findAvailablePort(this.instance.metroPort, this.isPortAvailable, new Set([storybookPort]));
    const driverPort = await findAvailablePort(this.instance.driverPort, this.isPortAvailable, new Set([storybookPort, metroPort]));
    const resolvedInstance: ResolvedDesktopStorybookInstance = {
      ...this.instance,
      driverPort,
      storybookPort,
      metroPort,
    };

    resolvedInstance.driverManifestPath = await this.writeDriverManifest(platform, resolvedInstance);
    if (platform === 'macos') {
      resolvedInstance.macosXcconfigPath = writeMacOSInstanceConfig(this.config.projectRoot, resolvedInstance);
    }
    this.output.write(
      `Storybook instance ${resolvedInstance.id}: channel=${storybookPort}, metro=${metroPort}, driver=${driverPort}` +
        (platform === 'macos' ? `, bundle=${resolvedInstance.bundleIdentifier}` : '') +
        '\n',
    );
    return Object.freeze(resolvedInstance);
  }

  private async writeDriverManifest(platform: Platforms, instance: DesktopStorybookInstance): Promise<string> {
    const storyManifest = await this.createStoryManifest(this.config, platform);
    const outputPath = path.join(this.config.projectRoot, 'storybook-desktop.generated', `driver-manifest.${platform}.json`);
    const driverManifest = createDesktopStorybookDriverManifest({
      bridgeNonce: readReusableBridgeNonce(outputPath, instance, storyManifest.platformManifestDigest),
      config: this.config,
      instance,
      platform,
      storyManifest,
    });
    writeDesktopStorybookDriverManifest(driverManifest, outputPath);
    return outputPath;
  }

  private async renderEveryStory(serverUrl: string, settleMs: number): Promise<void> {
    const storyIndex = await this.getJson(new URL('/index.json', serverUrl));
    const entries = Object.values((storyIndex.entries ?? {}) as Record<string, { id?: string; type?: string }>).filter(
      (entry) => entry.type === 'story' && entry.id,
    );
    if (entries.length === 0) {
      throw new Error('The Storybook index did not contain any stories.');
    }

    const failures: Error[] = [];
    let consecutiveFailures = 0;
    for (const [entryIndex, { id }] of entries.entries()) {
      try {
        await this.selectStory(serverUrl, id!, entryIndex === 0 ? 12 : 3);
        consecutiveFailures = 0;
        if (settleMs > 0) {
          await delay(settleMs);
        }
        this.output.write(`rendered ${id}\n`);
      } catch (error) {
        failures.push(new Error(`${id}: ${(error as Error).message}`));
        consecutiveFailures += 1;
        if (entryIndex === 0 || consecutiveFailures >= 3) {
          break;
        }
      }
    }

    if (failures.length > 0) {
      throw new AggregateError(failures, `${failures.length} stories failed to render.`);
    }
    this.output.write(`Rendered ${entries.length} stories.\n`);
  }

  private async selectStory(serverUrl: string, storyId: string, attempts: number): Promise<void> {
    let lastError: unknown;
    for (let attempt = 1; attempt <= attempts; attempt += 1) {
      try {
        await this.getJson(new URL(`/select-story-sync/${encodeURIComponent(storyId)}`, serverUrl), { method: 'POST' }, 5000);
        return;
      } catch (error) {
        lastError = error;
        if (attempt < attempts) {
          await delay(500);
        }
      }
    }
    throw lastError;
  }

  private async waitForUrl(url: string, process: RunningDesktopCommand, timeoutMs = 120_000): Promise<void> {
    const deadline = Date.now() + timeoutMs;
    let lastError: unknown;

    while (Date.now() < deadline) {
      const state = await Promise.race([
        process.completed.then((exitCode) => ({ exitCode })),
        this.fetchWithTimeout(url, undefined, Math.min(5000, Math.max(1, deadline - Date.now())))
          .then((response) => {
            if (!response.ok) {
              throw new Error(`${url} returned ${response.status}.`);
            }
            return { ready: true as const };
          })
          .catch((error: unknown) => ({ error })),
      ]);
      if ('exitCode' in state) {
        throw new Error(`Background command exited with code ${state.exitCode} before ${url} became ready.`);
      }
      if ('ready' in state) {
        return;
      }
      lastError = state.error;
      await delay(500);
    }

    throw new Error(`Timed out waiting for ${url}: ${(lastError as Error)?.message ?? 'not ready'}`);
  }

  private async getJson(url: URL, init?: RequestInit, timeoutMs?: number): Promise<Record<string, unknown>> {
    const response = timeoutMs ? await this.fetchWithTimeout(url, init, timeoutMs) : await this.fetch(url, init);
    const body = (await response.json().catch(() => ({}))) as Record<string, unknown>;
    if (!response.ok) {
      throw new Error((body.error as string | undefined) ?? `${url.href} returned ${response.status}.`);
    }
    return body;
  }

  private async fetchWithTimeout(input: string | URL, init: RequestInit | undefined, timeoutMs: number): Promise<Response> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    try {
      return await this.fetch(input, { ...init, signal: controller.signal });
    } finally {
      clearTimeout(timeout);
    }
  }

  private async executePlan(plan: DesktopCommandPlan, platform: Platforms, instance?: ResolvedDesktopStorybookInstance): Promise<void> {
    for (const command of Array.isArray(plan) ? plan : [plan]) {
      await this.runner.run(this.prepareCommand(command, platform, instance));
    }
  }

  private prepareCommand(
    command: DesktopCommand,
    platform: Platforms,
    instance?: ResolvedDesktopStorybookInstance,
  ): PreparedDesktopCommand {
    return {
      ...command,
      args: command.args ?? [],
      cwd: command.cwd ? resolveFromProject(this.config.projectRoot, command.cwd) : this.config.projectRoot,
      env: {
        ...command.env,
        [FURN_STORYBOOK_PLATFORM]: platform,
        ...(instance
          ? {
              [FURN_STORYBOOK_INSTANCE_ID]: instance.id,
              [FURN_STORYBOOK_BUNDLE_IDENTIFIER]: instance.bundleIdentifier,
              STORYBOOK_WS_PORT: String(instance.storybookPort),
              STORYBOOK_DRIVER_PORT: String(instance.driverPort),
              ...(instance.driverManifestPath ? { STORYBOOK_DRIVER_MANIFEST: instance.driverManifestPath } : {}),
              RCT_METRO_PORT: String(instance.metroPort),
              ...(instance.macosXcconfigPath ? { XCODE_XCCONFIG_FILE: instance.macosXcconfigPath } : {}),
            }
          : {}),
      },
    };
  }
}

function readReusableBridgeNonce(
  manifestPath: string,
  instance: DesktopStorybookInstance,
  platformManifestDigest: string,
): string | undefined {
  if (!fs.existsSync(manifestPath)) {
    return undefined;
  }
  try {
    const current = JSON.parse(fs.readFileSync(manifestPath, 'utf8')) as Record<string, unknown>;
    return current.instanceId === instance.id &&
      current.storybookPort === instance.storybookPort &&
      current.driverPort === instance.driverPort &&
      current.platformManifestDigest === platformManifestDigest &&
      typeof current.bridgeNonce === 'string'
      ? current.bridgeNonce
      : undefined;
  } catch {
    return undefined;
  }
}

function defaultMetroCommand(instance: DesktopStorybookInstance): DesktopCommand {
  return {
    command: 'rnx-cli',
    args: ['start', '--no-interactive', '--port', String(instance.metroPort)],
  };
}

function writeMacOSInstanceConfig(projectRoot: string, instance: DesktopStorybookInstance): string {
  const instanceDirectory = path.join(projectRoot, 'macos', '.storybook-desktop');
  const xcconfigPath = path.join(instanceDirectory, `${instance.id}.xcconfig`);
  const content = [
    `PRODUCT_BUNDLE_IDENTIFIER = ${instance.bundleIdentifier}`,
    `GCC_PREPROCESSOR_DEFINITIONS = $(inherited) RCT_METRO_PORT=${instance.metroPort}`,
    '',
  ].join('\n');

  fs.mkdirSync(instanceDirectory, { recursive: true });
  if (!fs.existsSync(xcconfigPath) || fs.readFileSync(xcconfigPath, 'utf8') !== content) {
    fs.writeFileSync(xcconfigPath, content);
  }
  return xcconfigPath;
}

async function findAvailablePort(
  preferredPort: number,
  isPortAvailable: (port: number) => Promise<boolean>,
  excludedPorts: ReadonlySet<number> = new Set(),
): Promise<number> {
  for (let offset = 0; offset < 1000; offset += 1) {
    const port = preferredPort + offset;
    if (!excludedPorts.has(port) && (await isPortAvailable(port))) {
      return port;
    }
  }
  throw new Error(`Could not find an available port near ${preferredPort}.`);
}

function isLoopbackPortAvailable(port: number): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const server = createServer();
    server.unref();
    server.once('error', (error: NodeJS.ErrnoException) => {
      if (error.code === 'EADDRINUSE' || error.code === 'EACCES') {
        resolve(false);
      } else {
        reject(error);
      }
    });
    server.listen(port, '127.0.0.1', () => {
      server.close((error) => (error ? reject(error) : resolve(true)));
    });
  });
}

function portFromUrl(url: string): number {
  const parsedUrl = new URL(url);
  const port = Number(parsedUrl.port);
  if (!port) {
    throw new TypeError(`Smoke service URL "${url}" must include an explicit port.`);
  }
  return port;
}

function loopbackUrl(port: number, pathname = ''): string {
  // eslint-disable-next-line @microsoft/sdl/no-insecure-url -- native Storybook services are loopback-only
  return `http://127.0.0.1:${port}${pathname}`;
}

function unsupportedAction(action: DesktopStorybookAction, platform: Platforms): Error {
  return new Error(
    `Desktop Storybook ${action} is not configured for ${platform}. Set platformOptions.${platform}.${action} in storybook.config.ts.`,
  );
}

function validateServerOptions(options: DesktopStorybookServerOptions): void {
  if (options.host !== undefined && !options.host.trim()) {
    throw new TypeError('Storybook server host cannot be empty.');
  }
  if (options.port !== undefined && (!Number.isInteger(options.port) || options.port < 1 || options.port > 65535)) {
    throw new RangeError(`Storybook server port must be an integer between 1 and 65535. Received "${options.port}".`);
  }
}

function validateDriverHost(host: string | undefined): void {
  if (host !== undefined && host !== '127.0.0.1' && host !== 'localhost') {
    throw new TypeError('The embedded Desktop Driver supports only the 127.0.0.1 and localhost loopback hosts.');
  }
}

function resolveFromProject(projectRoot: string, target: string): string {
  return path.isAbsolute(target) ? target : path.resolve(projectRoot, target);
}

function delay(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}
