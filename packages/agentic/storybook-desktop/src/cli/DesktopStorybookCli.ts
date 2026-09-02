import { spawn } from 'node:child_process';
import fs from 'node:fs';
import { createServer } from 'node:net';
import path from 'node:path';

import {
  buildNativeDesktopDriver,
  resolveNativeDesktopDriver,
  type NativeDriverArtifact,
  type NativeDriverBuildOptions,
} from '@fluentui-react-native/desktop-driver';

import {
  desktopSmokeModes,
  STORYBOOK_SMOKE_MODE,
  type DesktopCommand,
  type DesktopCommandPlan,
  type DesktopSmokeMode,
  type DesktopSmokeOptions,
  type DesktopSmokeRunOptions,
  type DesktopStorybookAction,
} from '../config/commands.js';
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
import { formatDesktopStorybookSmokeTestSummary, runDesktopStorybookSmokeTests } from './smokeTests.js';

type ResolvedDesktopStorybookInstance = DesktopStorybookInstance & {
  driverManifestPath?: string;
  macosXcconfigPath?: string;
};

export type DesktopStorybookBuildDriverOptions = {
  force?: boolean;
};

export type DesktopStorybookPrepOptions = {
  driver?: boolean;
};

export type DesktopStorybookCliOptions = {
  buildNativeDriver?: typeof buildNativeDesktopDriver;
  createStoryManifest?: typeof createDesktopStoryManifest;
  runner?: DesktopCommandRunner;
  fetch?: typeof globalThis.fetch;
  output?: Pick<NodeJS.WriteStream, 'write'>;
  isPortAvailable?: (port: number) => Promise<boolean>;
  runSmokeTests?: typeof runDesktopStorybookSmokeTests;
  resolveNativeDriver?: typeof resolveNativeDesktopDriver;
  writeMacOSApplicationLease?: typeof writeMacOSApplicationLease;
};

export type DesktopStorybookServerOptions = {
  host?: string;
  port?: number;
};

export class DesktopStorybookCli {
  readonly config: DesktopStorybookConfig;
  readonly instance: DesktopStorybookInstance;

  private readonly runner: DesktopCommandRunner;
  private readonly buildNativeDriver: typeof buildNativeDesktopDriver;
  private readonly createStoryManifest: typeof createDesktopStoryManifest;
  private readonly fetch: typeof globalThis.fetch;
  private readonly output: Pick<NodeJS.WriteStream, 'write'>;
  private readonly isPortAvailable: (port: number) => Promise<boolean>;
  private readonly runSmokeTests: typeof runDesktopStorybookSmokeTests;
  private readonly resolveNativeDriver: typeof resolveNativeDesktopDriver;
  private readonly writeMacOSApplicationLease: typeof writeMacOSApplicationLease;

  constructor(config: DesktopStorybookConfig, options: DesktopStorybookCliOptions = {}) {
    this.config = config;
    this.instance = createDesktopStorybookInstance({
      projectRoot: config.projectRoot,
      bundleIdentifierPrefix: config.macosBundleIdentifier,
    });
    this.runner = options.runner ?? new NodeDesktopCommandRunner();
    this.buildNativeDriver = options.buildNativeDriver ?? buildNativeDesktopDriver;
    this.createStoryManifest = options.createStoryManifest ?? createDesktopStoryManifest;
    this.fetch = options.fetch ?? globalThis.fetch;
    this.output = options.output ?? process.stdout;
    this.isPortAvailable = options.isPortAvailable ?? isLoopbackPortAvailable;
    this.runSmokeTests = options.runSmokeTests ?? runDesktopStorybookSmokeTests;
    this.resolveNativeDriver = options.resolveNativeDriver ?? resolveNativeDesktopDriver;
    this.writeMacOSApplicationLease = options.writeMacOSApplicationLease ?? writeMacOSApplicationLease;
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
    const nativeDriver = await this.resolveDriver(platform);
    const storybookPort = options.port ?? (await findAvailablePort(this.instance.storybookPort, this.isPortAvailable));
    const metroPort = await findAvailablePort(this.instance.metroPort, this.isPortAvailable, new Set([storybookPort]));
    const driverPort = await findAvailablePort(this.instance.driverPort, this.isPortAvailable, new Set([storybookPort, metroPort]));
    const resolvedInstance: ResolvedDesktopStorybookInstance = {
      ...this.instance,
      driverPort,
      metroPort,
      storybookPort,
    };
    resolvedInstance.driverManifestPath = await this.writeDriverManifest(platform, resolvedInstance, nativeDriver);
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

  async buildDriver(platform: Platforms, options: DesktopStorybookBuildDriverOptions = {}): Promise<NativeDriverArtifact> {
    const nativeOptions = this.requireNativeDriverOptions(platform);
    const artifact = await this.buildNativeDriver({
      ...this.toBuildOptions(platform, nativeOptions),
      force: options.force,
    });
    this.output.write(`${JSON.stringify(artifact, null, 2)}\n`);
    return artifact;
  }

  async prep(platform: Platforms, options: DesktopStorybookPrepOptions = {}): Promise<void> {
    if (options.driver !== false) {
      await this.resolveDriver(platform);
    }
    await this.executeAction('prep', platform);
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

  async smoke(platform: Platforms, options: DesktopSmokeRunOptions = {}): Promise<void> {
    const mode = resolveSmokeMode(options.mode);
    const smoke = this.config.getSmokeOptions(platform);
    if (smoke === false) {
      throw unsupportedAction('smoke', platform);
    }
    if (smoke?.command) {
      const instance = await this.resolveSmokeInstance(platform, smoke, mode);
      await this.executePlan(withEnvironment(smoke.command, { [STORYBOOK_SMOKE_MODE]: mode }), platform, instance);
      return;
    }
    if (!smoke?.stop) {
      throw new Error(
        `The reusable ${platform} smoke lifecycle requires platformOptions.${platform}.smoke.stop so the native app can be shut down safely.`,
      );
    }

    const instance = await this.resolveSmokeInstance(platform, smoke, mode);
    await this.runSmokeLifecycle(platform, smoke, instance, mode);
  }

  private async executeAction(
    action: Exclude<DesktopStorybookAction, 'build-driver' | 'smoke'>,
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
    mode: DesktopSmokeMode,
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
        const runningServer = this.runner.start(
          this.prepareCommand(
            {
              ...server,
              env: {
                ...server.env,
                [STORYBOOK_SMOKE_MODE]: mode,
              },
            },
            platform,
            instance,
          ),
        );
        backgroundCommands.push(runningServer);
        readiness.push(this.waitForUrl(new URL('/index.json', serverUrl).href, runningServer, smoke.startupTimeoutMs));
        if (mode === 'stories-and-tests') {
          readiness.push(this.waitForUrl(loopbackUrl(instance.driverPort, '/status'), runningServer, smoke.startupTimeoutMs));
        }
      } else if (mode === 'stories-and-tests') {
        throw new Error('The stories-and-tests smoke mode requires the Storybook server and embedded Desktop Driver.');
      }
      if (metro) {
        const runningMetro = this.runner.start(this.prepareCommand(metro, platform, instance));
        backgroundCommands.push(runningMetro);
        readiness.push(this.waitForUrl(metroUrl, runningMetro, smoke.startupTimeoutMs));
      }

      await Promise.all(readiness);
      await this.executeAction('run', platform, instance);
      if (mode === 'stories-and-tests' && platform === 'macos') {
        if (!instance.driverManifestPath) {
          throw new Error('The macOS authored-test lifecycle did not create a Desktop Driver manifest.');
        }
        await this.writeMacOSApplicationLease(instance.driverManifestPath, smoke.startupTimeoutMs ?? 120_000);
      }
      await this.renderEveryStory(serverUrl, smoke.settleMs ?? 0, smoke.startupTimeoutMs);
      if (mode === 'stories-and-tests') {
        const result = await this.runSmokeTests({
          driverUrl: loopbackUrl(instance.driverPort),
          platform,
          projectRoot: this.config.projectRoot,
          targetId: `${this.config.appName}-${platform}`.toLowerCase(),
        });
        this.output.write(`${formatDesktopStorybookSmokeTestSummary(result)}\n`);
      }
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
      throw new AggregateError(failures, `${platform} smoke test failed: ${failures.map((error) => errorMessage(error)).join('; ')}`);
    }
  }

  private async resolveSmokeInstance(
    platform: Platforms,
    smoke: DesktopSmokeOptions,
    mode: DesktopSmokeMode,
  ): Promise<ResolvedDesktopStorybookInstance> {
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

    if (mode === 'stories-and-tests') {
      const nativeDriver = await this.resolveDriver(platform);
      resolvedInstance.driverManifestPath = await this.writeDriverManifest(platform, resolvedInstance, nativeDriver);
    }
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

  private async writeDriverManifest(
    platform: Platforms,
    instance: DesktopStorybookInstance,
    nativeDriver: NativeDriverArtifact,
  ): Promise<string> {
    const storyManifest = await this.createStoryManifest(this.config, platform);
    const outputPath = path.join(this.config.projectRoot, 'storybook-desktop.generated', `driver-manifest.${platform}.json`);
    const driverManifest = createDesktopStorybookDriverManifest({
      bridgeNonce: readReusableBridgeNonce(outputPath, instance, storyManifest.platformManifestDigest),
      config: this.config,
      instance,
      nativeDriver,
      platform,
      storyManifest,
    });
    writeDesktopStorybookDriverManifest(driverManifest, outputPath);
    return outputPath;
  }

  private async resolveDriver(platform: Platforms): Promise<NativeDriverArtifact> {
    const options = this.requireNativeDriverOptions(platform);
    return this.resolveNativeDriver({
      ...this.toBuildOptions(platform, options),
      buildPolicy: options.buildPolicy,
      helperPath: options.helperPath,
      installRoot: options.installRoot,
      macosSigningIdentity: options.macosSigningIdentity,
    });
  }

  private requireNativeDriverOptions(platform: Platforms): Exclude<ReturnType<DesktopStorybookConfig['getNativeDriverOptions']>, false> {
    const options = this.config.getNativeDriverOptions(platform);
    if (options === false) {
      throw new Error(`Native Desktop Driver is disabled for ${platform}.`);
    }
    return options;
  }

  private toBuildOptions(
    platform: Platforms,
    options: Exclude<ReturnType<DesktopStorybookConfig['getNativeDriverOptions']>, false>,
  ): NativeDriverBuildOptions {
    return {
      cacheRoot: options.cacheRoot,
      configuration: options.configuration,
      macosSigningIdentity: options.macosSigningIdentity,
      platform,
    };
  }

  private async renderEveryStory(serverUrl: string, settleMs: number, startupTimeoutMs = 120_000): Promise<void> {
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
        await this.selectStory(serverUrl, id!, entryIndex === 0 ? startupTimeoutMs : 15_000);
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

  private async selectStory(serverUrl: string, storyId: string, timeoutMs: number): Promise<void> {
    const deadline = Date.now() + timeoutMs;
    let lastError: unknown;
    do {
      try {
        await this.getJson(
          new URL(`/select-story-sync/${encodeURIComponent(storyId)}`, serverUrl),
          { method: 'POST' },
          Math.min(5000, Math.max(1, deadline - Date.now())),
        );
        return;
      } catch (error) {
        lastError = error;
        const remainingMs = deadline - Date.now();
        if (remainingMs > 0) {
          await delay(Math.min(500, remainingMs));
        }
      }
    } while (Date.now() < deadline);
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

type MacOSRunningApplication = {
  executablePath: string;
  processId: number;
  processStartedAt: number;
};

async function writeMacOSApplicationLease(manifestPath: string, timeoutMs = 120_000): Promise<void> {
  if (process.platform !== 'darwin') {
    throw new Error('A macOS application lease can only be written on macOS.');
  }
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8')) as {
    application?: {
      bundleIdentifier?: string;
      leaseNonce?: string;
      leasePath?: string;
    };
  };
  const application = manifest.application;
  if (!application?.bundleIdentifier || !application.leaseNonce || !application.leasePath) {
    throw new Error(`The Desktop Driver manifest at "${manifestPath}" does not contain a complete macOS application descriptor.`);
  }

  const runningApplication = await waitForMacOSApplication(application.bundleIdentifier, timeoutMs);
  if (!Number.isFinite(runningApplication.processStartedAt) || runningApplication.processStartedAt <= 0) {
    throw new Error(`Could not determine the start time for macOS process ${runningApplication.processId}.`);
  }
  const processStartedAt = new Date(runningApplication.processStartedAt * 1000);
  const temporaryPath = `${application.leasePath}.${process.pid}.tmp`;
  fs.mkdirSync(path.dirname(application.leasePath), { recursive: true });
  fs.writeFileSync(
    temporaryPath,
    `${JSON.stringify(
      {
        bundleIdentifier: application.bundleIdentifier,
        endpoint: 'macos',
        executablePath: runningApplication.executablePath,
        nonce: application.leaseNonce,
        processId: runningApplication.processId,
        processStartedAt: processStartedAt.toISOString(),
        schemaVersion: 1,
      },
      null,
      2,
    )}\n`,
  );
  fs.renameSync(temporaryPath, application.leasePath);
}

async function waitForMacOSApplication(bundleIdentifier: string, timeoutMs: number): Promise<MacOSRunningApplication> {
  const deadline = Date.now() + timeoutMs;
  let lastError: unknown;
  do {
    try {
      const applications = JSON.parse(
        await runProcess('/usr/bin/osascript', [
          '-l',
          'JavaScript',
          '-e',
          [
            "ObjC.import('AppKit');",
            'function run(argv) {',
            '  const applications = $.NSRunningApplication.runningApplicationsWithBundleIdentifier(argv[0]);',
            '  const result = [];',
            '  for (let index = 0; index < applications.count; index += 1) {',
            '    const application = applications.objectAtIndex(index);',
            '    result.push({',
            '      executablePath: ObjC.unwrap(application.executableURL.path),',
            '      processId: Number(application.processIdentifier),',
            '      processStartedAt: Number(application.launchDate.timeIntervalSince1970),',
            '    });',
            '  }',
            '  return JSON.stringify(result);',
            '}',
          ].join('\n'),
          bundleIdentifier,
        ]),
      ) as MacOSRunningApplication[];
      if (applications.length === 1) {
        return applications[0];
      }
      if (applications.length > 1) {
        throw new Error(`More than one running application has bundle identifier "${bundleIdentifier}".`);
      }
    } catch (error) {
      lastError = error;
    }
    await delay(250);
  } while (Date.now() < deadline);
  throw new Error(`Timed out waiting for the macOS application "${bundleIdentifier}"${lastError ? `: ${errorMessage(lastError)}` : '.'}`);
}

function runProcess(command: string, args: readonly string[]): Promise<string> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, [...args], {
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    const stdout: Buffer[] = [];
    const stderr: Buffer[] = [];
    child.stdout.on('data', (chunk: Buffer) => stdout.push(chunk));
    child.stderr.on('data', (chunk: Buffer) => stderr.push(chunk));
    child.once('error', reject);
    child.once('close', (code) => {
      if (code === 0) {
        resolve(Buffer.concat(stdout).toString('utf8'));
      } else {
        reject(new Error(Buffer.concat(stderr).toString('utf8') || `${command} exited with code ${String(code)}.`));
      }
    });
  });
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

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function resolveSmokeMode(mode: DesktopSmokeMode | undefined): DesktopSmokeMode {
  const resolvedMode = mode ?? 'stories';
  if (!desktopSmokeModes.includes(resolvedMode)) {
    throw new TypeError(`Smoke mode must be one of ${desktopSmokeModes.join(', ')}. Received "${resolvedMode}".`);
  }
  return resolvedMode;
}

function withEnvironment(plan: DesktopCommandPlan, environment: Readonly<Record<string, string>>): DesktopCommandPlan {
  const commands = Array.isArray(plan) ? plan : [plan];
  const prepared = commands.map((command) => ({
    ...command,
    env: {
      ...command.env,
      ...environment,
    },
  }));
  return Array.isArray(plan) ? prepared : prepared[0];
}

function delay(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}
