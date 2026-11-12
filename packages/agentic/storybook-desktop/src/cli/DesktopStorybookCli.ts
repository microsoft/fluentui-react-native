import { spawn } from 'node:child_process';
import fs from 'node:fs';
import { createServer } from 'node:net';
import path from 'node:path';
import {
  defaultAgentDescriptor,
  DesktopServiceScope,
  resolveDesktopApplication,
  resolveDesktopTestScope,
} from '@fluentui-react-native/desktop-test';
import { runDesktopOperation, type DesktopOperation, type DesktopReportWriter } from '@fluentui-react-native/desktop-test/reporting';
import { resolveDesktopScopeDomains } from '@fluentui-react-native/desktop-driver/authoring';
import { formatDesktopReporterValue } from '@fluentui-react-native/desktop-driver/cli/reporter';
import type { ResolvedDesktopReporterMode } from '@fluentui-react-native/desktop-driver/cli/reporter';

import { writeDesktopStorybookFailure, type DesktopStorybookErrorOutput } from '../../config/diagnostics.cjs';
import {
  buildNativeDesktopDriver,
  resolveNativeDesktopDriver,
  type NativeDesktopApplicationDescriptor,
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
import {
  desktopStorybookDriverManifestPath,
  desktopStorybookTargetId,
  driverManifestInput,
  type CreateDesktopStorybookDriverManifestOptions,
  type DesktopStorybookDriverManifest,
} from '../driver/driverManifest.js';
import { NodeDesktopCommandRunner, STORYBOOK_VERBOSE } from './commandRunner.js';
import type { DesktopCommandRunner, PreparedDesktopCommand, RunningDesktopCommand } from './commandRunner.js';
import { formatDesktopStorybookSmokeTestSummary, runDesktopStorybookSmokeTests } from './smokeTests.js';
import { runWdioStoryTests, WdioStoryTestRunError, type WdioStoryTestResult } from '../testing/runWdioTests.js';
import { decideWdioSelection, describeWdioExclusions, listWdioSelection } from '../testing/selection.js';
import type { WdioSelectionContext } from '../testing/selection.js';
import { resolveWdioOptions, type DesktopStorybookWdioOptions } from '../config/wdio.js';
import { connectStoryTraversal } from './storyTraversal.js';

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
  /** Use the macOS Paper renderer instead of the default Fabric renderer. */
  paper?: boolean;
  buildNativeDriver?: typeof buildNativeDesktopDriver;
  createStoryManifest?: typeof createDesktopStoryManifest;
  runner?: DesktopCommandRunner;
  fetch?: typeof globalThis.fetch;
  output?: Pick<NodeJS.WriteStream, 'write'>;
  errorOutput?: DesktopStorybookErrorOutput;
  verbose?: boolean;
  isPortAvailable?: (port: number) => Promise<boolean>;
  runSmokeTests?: typeof runDesktopStorybookSmokeTests;
  connectStoryTraversal?: typeof connectStoryTraversal;
  resolveNativeDriver?: typeof resolveNativeDesktopDriver;
  /** Resolves a Windows or Win32 desktop target's verified application identity for `driver --agent`. */
  resolveDesktopApplication?: typeof resolveDesktopApplication;
  writeMacOSApplicationLease?: typeof writeMacOSApplicationLease;
  maintainMacOSApplicationLease?: typeof maintainMacOSApplicationLease;
  reporter?: DesktopReportWriter;
  reporterMode?: ResolvedDesktopReporterMode;
  services?: DesktopServiceScope;
  /** Called once `server` or `driver` has written its readiness record. */
  onReady?: () => void;
};

export type DesktopStorybookServerOptions = {
  host?: string;
  port?: number;
};

export type DesktopStorybookDriverOptions = DesktopStorybookServerOptions & {
  input?: 'accessible' | 'physical';
  /**
   * Protects the driver with a grant authority and publishes one agent's connection descriptor, which the Desktop
   * Driver MCP adapter reads. WDIO `storybook test` cannot connect to an agent-served driver.
   */
  agent?: {
    /** The descriptor record name. Defaults to `agent-connection.json`. */
    descriptor?: string;
    /** The private storage root. Defaults to the platform location. */
    root?: string;
  };
};

export type DesktopStorybookTestOptions = Omit<DesktopStorybookWdioOptions, 'reporter'> & {
  list?: boolean;
  testReporter?: DesktopStorybookWdioOptions['reporter'];
  url?: string;
  target?: string;
};

export class DesktopStorybookCli {
  readonly config: DesktopStorybookConfig;
  readonly instance: DesktopStorybookInstance;
  readonly paper: boolean;

  private readonly runner: DesktopCommandRunner;
  private readonly buildNativeDriver: typeof buildNativeDesktopDriver;
  private readonly createStoryManifest: typeof createDesktopStoryManifest;
  private readonly fetch: typeof globalThis.fetch;
  private readonly output: Pick<NodeJS.WriteStream, 'write'>;
  private readonly errorOutput: DesktopStorybookErrorOutput;
  private readonly verbose: boolean;
  private readonly isPortAvailable: (port: number) => Promise<boolean>;
  private readonly runSmokeTests: typeof runDesktopStorybookSmokeTests;
  private readonly connectStoryTraversal: typeof connectStoryTraversal;
  private readonly resolveNativeDriver: typeof resolveNativeDesktopDriver;
  private readonly resolveDesktopApplication: typeof resolveDesktopApplication;
  private readonly writeMacOSApplicationLease: typeof writeMacOSApplicationLease;
  private readonly maintainMacOSApplicationLease: typeof maintainMacOSApplicationLease;
  private readonly reporter?: DesktopReportWriter;
  private readonly reporterMode?: ResolvedDesktopReporterMode;
  private readonly structuredOutput: Pick<NodeJS.WriteStream, 'write'>;
  private readonly services: DesktopServiceScope;
  // A borrowed scope belongs to its caller, which may be awaiting this command inside the scope's tracked work; closing
  // it here would wait on that work. The caller closes it.
  private readonly ownsServices: boolean;
  private readonly onReady?: () => void;

  constructor(config: DesktopStorybookConfig, options: DesktopStorybookCliOptions = {}) {
    this.config = config;
    this.reporter = options.reporter;
    this.reporterMode = options.reporterMode;
    this.onReady = options.onReady;
    this.paper = options.paper ?? config.getDesktopTarget?.('macos')?.host.renderer === 'paper';
    this.instance = createDesktopStorybookInstance({
      projectRoot: config.projectRoot,
      bundleIdentifierPrefix: config.macosBundleIdentifier,
    });
    this.runner =
      options.runner ??
      new NodeDesktopCommandRunner({
        reporter: options.reporter,
        output: options.output,
        errorOutput: options.errorOutput,
        verbose: options.verbose,
      });
    this.services = options.services ?? new DesktopServiceScope(this.runner, this.reporter);
    this.ownsServices = options.services === undefined;
    this.buildNativeDriver = options.buildNativeDriver ?? buildNativeDesktopDriver;
    this.createStoryManifest = options.createStoryManifest ?? createDesktopStoryManifest;
    this.fetch = options.fetch ?? globalThis.fetch;
    const structured = this.reporterMode === 'json' || this.reporterMode === 'ndjson';
    const silentOutput = { write: () => true };
    this.output = options.output ?? (structured ? silentOutput : reportOutput(this.reporter, 'info', process.stdout));
    this.errorOutput = options.errorOutput ?? (structured ? silentOutput : reportOutput(this.reporter, 'warning', process.stderr));
    this.structuredOutput = options.output ?? process.stdout;
    this.verbose = options.verbose ?? process.env[STORYBOOK_VERBOSE] === '1';
    this.isPortAvailable = options.isPortAvailable ?? isLoopbackPortAvailable;
    this.runSmokeTests = options.runSmokeTests ?? runDesktopStorybookSmokeTests;
    this.connectStoryTraversal = options.connectStoryTraversal ?? connectStoryTraversal;
    this.resolveNativeDriver = options.resolveNativeDriver ?? resolveNativeDesktopDriver;
    this.resolveDesktopApplication = options.resolveDesktopApplication ?? resolveDesktopApplication;
    this.writeMacOSApplicationLease = options.writeMacOSApplicationLease ?? writeMacOSApplicationLease;
    this.maintainMacOSApplicationLease = options.maintainMacOSApplicationLease ?? maintainMacOSApplicationLease;
  }

  async server(platform: Platforms, options: DesktopStorybookServerOptions = {}): Promise<void> {
    validateServerOptions(options);
    const command = this.config.getPlatformOptions(platform).server;
    if (command === false || command === undefined) {
      throw unsupportedAction('server', platform);
    }
    const host = options.host ?? command.env?.STORYBOOK_WS_HOST ?? process.env.STORYBOOK_WS_HOST ?? '127.0.0.1';
    const port = options.port ?? Number(command.env?.STORYBOOK_WS_PORT ?? process.env.STORYBOOK_WS_PORT ?? 7007);
    validateServerOptions({ host, port });
    const failures: unknown[] = [];
    try {
      this.services.start(
        'storybook-channel',
        this.prepareCommand(
          {
            ...command,
            env: {
              ...command.env,
              ...(options.host ? { STORYBOOK_WS_HOST: options.host } : {}),
              ...(options.port ? { STORYBOOK_WS_PORT: String(options.port) } : {}),
            },
          },
          platform,
        ),
      );
      await this.services.ready('storybook-channel', loopbackUrl(port, '/index.json'), 120_000, this.fetch);
      if (this.reporterMode === 'json' || this.reporterMode === 'ndjson') {
        this.writeStructured({ type: 'ready', host, port, runId: this.reporter?.runId });
      } else {
        this.output.write(`Storybook server ready: ${host}:${port}\n`);
      }
      this.onReady?.();
      await this.services.guard(this.services.waitForStop());
    } catch (error) {
      failures.push(error);
    }
    try {
      if (this.ownsServices) await this.services.close();
    } catch (error) {
      failures.push(error);
    }
    if (failures.length === 1) throw failures[0];
    if (failures.length > 1) throw new AggregateError(failures, 'Storybook server execution and cleanup failed.');
  }

  async driver(platform: Platforms, options: DesktopStorybookDriverOptions = {}): Promise<void> {
    validateServerOptions(options);
    validateDriverHost(options.host);
    const wdio = resolveWdioOptions({ ...this.config.wdio, ...(options.input ? { input: options.input } : {}) });
    const agent = options.agent && {
      descriptor: options.agent.descriptor ?? defaultAgentDescriptor,
      // The channel service runs in another working directory.
      ...(options.agent.root === undefined ? {} : { root: path.resolve(options.agent.root) }),
    };
    const command = this.config.getPlatformOptions(platform).server;
    if (command === false || command === undefined) {
      throw unsupportedAction('server', platform);
    }
    const nativeDriver = await this.resolveDriver(platform);
    const agentApplication = agent && platform !== 'macos' ? await this.resolveAgentApplication(platform) : undefined;
    const storybookPort = options.port ?? (await findAvailablePort(this.instance.storybookPort, this.isPortAvailable));
    const metroPort = await this.resolveDriverMetroPort(platform, storybookPort);
    const driverPort = await findAvailablePort(this.instance.driverPort, this.isPortAvailable, new Set([storybookPort, metroPort]));
    const resolvedInstance: ResolvedDesktopStorybookInstance = {
      ...this.instance,
      driverPort,
      metroPort,
      storybookPort,
    };
    const driverManifest = await this.writeDriverManifest(
      platform,
      resolvedInstance,
      nativeDriver,
      agent && { ...agent, ...(agentApplication ? { application: agentApplication } : {}) },
      wdio,
    );
    resolvedInstance.driverManifestPath = driverManifest.path;
    this.services.start('metro', this.prepareCommand(defaultMetroCommand(resolvedInstance), platform, resolvedInstance));
    const failures: unknown[] = [];
    try {
      this.services.start(
        'storybook-channel',
        this.prepareCommand(
          {
            ...command,
            env: {
              ...command.env,
              ...(options.host ? { STORYBOOK_WS_HOST: options.host } : {}),
            },
          },
          platform,
          resolvedInstance,
        ),
      );
      await Promise.all([
        this.services.ready('metro', loopbackUrl(metroPort, '/status'), 120_000, this.fetch),
        this.services.ready('storybook-channel', loopbackUrl(storybookPort, '/index.json'), 120_000, this.fetch),
      ]);
      const agentManifest = driverManifest.manifest.agent;
      if (agentManifest) {
        await this.services.readyProcess(
          'storybook-channel',
          { tier: 'service-ready', service: 'storybook-channel', descriptor: agentManifest.descriptor },
          120_000,
        );
      }
      if (this.reporterMode === 'json' || this.reporterMode === 'ndjson') {
        this.writeStructured({
          type: 'ready',
          ...(agentManifest ? { agentDescriptor: agentManifest.descriptor } : {}),
          services: ['metro', 'storybook-channel'],
          instanceId: resolvedInstance.id,
          endpoint: platform,
          renderer: this.renderer(platform),
          storybookPort,
          metroPort,
          driverPort,
          targetId: this.targetId(platform),
          runId: this.reporter?.runId,
        });
      } else {
        this.output.write(
          `Storybook instance ${resolvedInstance.id}: channel=${storybookPort}, metro=${metroPort}, driver=${driverPort}` +
            `${agentManifest ? `, agent=${agentManifest.descriptor}` : ''}\n`,
        );
      }
      this.onReady?.();
      // No WDIO run writes the lease an agent's attach session verifies, so the driver keeps it current.
      await this.services.guard(
        agentManifest && platform === 'macos'
          ? this.maintainMacOSApplicationLease(driverManifest.path, this.services.controller.signal, {
              onWarning: (message) => this.warn(message),
            })
          : this.services.waitForStop(),
      );
    } catch (error) {
      failures.push(error);
    }
    try {
      if (this.ownsServices) await this.services.close();
    } catch (error) {
      failures.push(error);
    }
    if (failures.length === 1) {
      throw failures[0];
    }
    if (failures.length > 1) {
      throw new AggregateError(failures, 'Storybook driver execution and cleanup failed.');
    }
  }

  async manifest(platform: Platforms, outputPath?: string): Promise<string> {
    const manifest = await this.createStoryManifest(this.config, platform);
    const resolvedOutput = resolveFromProject(
      this.config.projectRoot,
      outputPath ?? path.join('storybook-desktop.generated', `story-manifest.${platform}.json`),
    );
    writeDesktopStoryManifest(manifest, resolvedOutput);
    if (this.reporterMode === 'json' || this.reporterMode === 'ndjson') this.writeStructured({ path: resolvedOutput });
    else this.output.write(`${resolvedOutput}\n`);
    return resolvedOutput;
  }

  async test(platform: Platforms, options: DesktopStorybookTestOptions = {}): Promise<void> {
    const overrides: DesktopStorybookWdioOptions = {
      ...(options.clickMode === undefined ? {} : { clickMode: options.clickMode }),
      ...(options.input === undefined ? {} : { input: options.input }),
      ...(options.testReporter === undefined ? {} : { reporter: options.testReporter }),
      ...(options.story === undefined ? {} : { story: options.story }),
      ...(options.tag === undefined ? {} : { tag: options.tag }),
      ...(options.test === undefined ? {} : { test: options.test }),
      ...(options.timeoutMs === undefined ? {} : { timeoutMs: options.timeoutMs }),
    };
    const initialSettings = resolveWdioOptions({
      ...this.config.wdio,
      ...overrides,
    });
    const connection = options.list ? undefined : this.testConnection(platform, options);
    const settings =
      connection?.input && initialSettings.input === undefined
        ? resolveWdioOptions({ ...initialSettings, input: connection.input })
        : initialSettings;
    const manifest = await this.createStoryManifest(this.config, platform);
    const scope = this.scopeContext(platform);
    const selection = decideWdioSelection(manifest, settings, { platform, scope });
    if (selection.stories.length === 0) {
      throw new Error(`No executable wdio story tests matched the requested selection${describeWdioExclusions(selection)}.`);
    }
    if (options.list) {
      const value = listWdioSelection(selection, settings);
      if (this.reporterMode === 'json' || this.reporterMode === 'ndjson') this.writeStructured(value);
      else this.output.write(`${JSON.stringify(value, null, 2)}\n`);
      return;
    }
    const activeConnection = connection ?? this.testConnection(platform, options);
    if (platform === 'macos' && !options.url) {
      await this.writeMacOSApplicationLease(desktopStorybookDriverManifestPath(this.config.projectRoot, 'macos'), settings.timeoutMs);
    }
    const summarize = (operation: DesktopOperation, wdio: readonly WdioStoryTestResult[]) =>
      operation.summarize(formatDesktopStorybookSmokeTestSummary({ tests: [], wdio }));
    await this.operation('Story tests', async (operation) => {
      try {
        if (platform === 'macos' && settings.input === 'physical') {
          const preparation = await this.connectStoryTraversal({
            url: activeConnection.url,
            targetId: activeConnection.targetId,
            platform,
            input: settings.input,
            fetch: this.fetch,
            signal: this.services.controller.signal,
          });
          await preparation.close();
        }
        const results = await runWdioStoryTests(
          {
            ...settings,
            ...activeConnection,
            config: this.config,
            manifest,
            platform,
            scope,
            errorOutput: this.errorOutput,
            report: this.reporter,
            signal: this.services.controller.signal,
            input: settings.input,
          },
          this.runner,
        );
        summarize(operation, results);
      } catch (error) {
        if (error instanceof WdioStoryTestRunError) summarize(operation, error.results);
        throw error;
      }
    });
  }

  /**
   * Runs `work` as one reported operation, which ends with an outcome header. Without a reporter, which only a library
   * caller can lack, the summary is written as a line and detail is written only in verbose mode.
   */
  private async operation<T>(label: string, work: (operation: DesktopOperation) => T | Promise<T>): Promise<T> {
    if (this.reporter) return runDesktopOperation(this.reporter, { label }, work);
    let summary: string | undefined;
    try {
      return await work({
        summarize: (text) => {
          summary = text;
        },
        log: (text) => {
          if (this.verbose) this.output.write(`${text}\n`);
        },
      });
    } finally {
      if (summary) this.output.write(`${summary}\n`);
    }
  }

  /** The scope domains and the values this endpoint's target holds, which declared case `scope` selection reads. */
  private scopeContext(platform: Platforms): NonNullable<WdioSelectionContext['scope']> {
    const domains = this.config.desktop?.testScopes ?? resolveDesktopScopeDomains();
    // This run's renderer wins over the host configuration, since `--paper` switches it.
    return { domains, values: resolveDesktopTestScope(domains, this.config.getDesktopTarget(platform), this.renderer(platform)) };
  }

  private testConnection(
    platform: Platforms,
    options: DesktopStorybookTestOptions,
  ): { input?: 'accessible' | 'physical'; targetId: string; url: string } {
    if (options.url || options.target) {
      if (!options.url || !options.target) {
        throw new Error('Pass --url and --target together, or omit both to use the running Storybook driver instance.');
      }
      return { targetId: options.target, url: options.url };
    }
    const manifestPath = desktopStorybookDriverManifestPath(this.config.projectRoot, platform);
    if (!fs.existsSync(manifestPath)) {
      throw new Error(`Start storybook driver --${platform} and launch the app before running storybook test.`);
    }
    const manifest: unknown = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    if (
      typeof manifest !== 'object' ||
      manifest === null ||
      !('endpoint' in manifest) ||
      manifest.endpoint !== platform ||
      !('instanceId' in manifest) ||
      manifest.instanceId !== this.instance.id ||
      !('renderer' in manifest) ||
      manifest.renderer !== this.renderer(platform) ||
      !('driverPort' in manifest) ||
      typeof manifest.driverPort !== 'number' ||
      !Number.isInteger(manifest.driverPort) ||
      manifest.driverPort < 1 ||
      manifest.driverPort > 65535 ||
      !('targetId' in manifest) ||
      manifest.targetId !== this.targetId(platform)
    ) {
      throw new Error(`Invalid Storybook driver instance at ${manifestPath}; restart storybook driver --${platform}.`);
    }
    if ('agent' in manifest && manifest.agent !== undefined) {
      // Every route of an agent-served driver requires a grant, and WDIO holds none.
      throw new Error(
        `The Storybook driver instance at ${manifestPath} serves an agent; restart storybook driver --${platform} without --agent to run storybook test.`,
      );
    }
    const input = driverManifestInput(manifest);
    return { targetId: manifest.targetId, url: loopbackUrl(manifest.driverPort), ...(input ? { input } : {}) };
  }

  printInstance(platform: Platforms): void {
    const value = {
      ...this.instance,
      endpoint: platform,
      renderer: this.renderer(platform),
      targetId: this.targetId(platform),
      testIDPrefix: this.config.testIDPrefix,
    };
    if (this.reporterMode === 'json' || this.reporterMode === 'ndjson') this.writeStructured(value);
    else this.output.write(`${JSON.stringify(value, null, 2)}\n`);
  }

  async buildDriver(platform: Platforms, options: DesktopStorybookBuildDriverOptions = {}): Promise<NativeDriverArtifact> {
    const nativeOptions = this.requireNativeDriverOptions(platform);
    const artifact = await this.buildNativeDriver({
      ...this.toBuildOptions(platform, nativeOptions),
      force: options.force,
    });
    if (this.reporterMode === 'json' || this.reporterMode === 'ndjson') this.writeStructured(artifact);
    else this.output.write(`${JSON.stringify(artifact, null, 2)}\n`);
    return artifact;
  }

  private writeStructured(value: unknown): void {
    if (this.reporterMode) this.structuredOutput.write(formatDesktopReporterValue(this.reporterMode, value));
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
    if (platform !== 'macos') {
      return this.executeAction('run', platform);
    }
    const instance: ResolvedDesktopStorybookInstance = {
      ...this.instance,
      macosXcconfigPath: writeMacOSInstanceConfig(this.config.projectRoot, this.instance),
    };
    return this.executeAction('run', platform, instance);
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
      const instance = await this.resolveSmokeInstance(platform, smoke, mode, options.input);
      await this.executePlan(
        withEnvironment(smoke.command, {
          [STORYBOOK_SMOKE_MODE]: mode,
          ...(options.input ? { DESKTOP_INPUT: options.input } : {}),
        }),
        platform,
        instance,
      );
      return;
    }
    if (!smoke?.stop) {
      throw new Error(
        `The reusable ${platform} smoke lifecycle requires platformOptions.${platform}.smoke.stop so the native app can be shut down safely.`,
      );
    }

    const instance = await this.resolveSmokeInstance(platform, smoke, mode, options.input);
    await this.runSmokeLifecycle(platform, smoke, instance, mode, options.input);
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
    input?: 'accessible' | 'physical',
  ): Promise<void> {
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
        const runningServer = this.services.start(
          'storybook-channel',
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
        readiness.push(this.waitForUrl(new URL('/index.json', serverUrl).href, runningServer, smoke.startupTimeoutMs));
        if (mode === 'stories-and-tests') {
          readiness.push(this.waitForUrl(loopbackUrl(instance.driverPort, '/status'), runningServer, smoke.startupTimeoutMs));
        }
      } else if (mode === 'stories-and-tests') {
        throw new Error('The stories-and-tests smoke mode requires the Storybook server and embedded Desktop Driver.');
      }
      if (metro) {
        const runningMetro = this.services.start('metro', this.prepareCommand(metro, platform, instance));
        readiness.push(this.waitForUrl(metroUrl, runningMetro, smoke.startupTimeoutMs));
      }

      await this.services.guard(Promise.all(readiness));
      await this.executeAction('run', platform, instance);
      if (mode === 'stories-and-tests' && platform === 'macos') {
        if (!instance.driverManifestPath) {
          throw new Error('The macOS authored-test lifecycle did not create a Desktop Driver manifest.');
        }
        await this.writeMacOSApplicationLease(instance.driverManifestPath, smoke.startupTimeoutMs ?? 120_000);
      }
      const traversal = instance.driverManifestPath
        ? await this.connectStoryTraversal({
            url: loopbackUrl(instance.driverPort),
            platform,
            targetId: this.targetId(platform),
            fetch: this.fetch,
            signal: this.services.controller.signal,
            input: resolveWdioOptions({ ...this.config.wdio, ...(input ? { input } : {}) }).input,
          })
        : undefined;
      let traversalFailure: unknown;
      try {
        await this.services.guard(
          this.operation('Render stories', (operation) =>
            this.renderEveryStory(
              operation,
              serverUrl,
              smoke.settleMs ?? 0,
              smoke.initialRenderTimeoutMs ?? smoke.startupTimeoutMs,
              traversal?.select,
            ),
          ),
        );
      } catch (error) {
        traversalFailure = error;
      }
      try {
        await traversal?.close();
      } catch (error) {
        throw traversalFailure === undefined
          ? error
          : new AggregateError([traversalFailure, error], 'Storybook traversal and cleanup failed.');
      }
      if (traversalFailure !== undefined) throw traversalFailure;
      if (mode === 'stories-and-tests') {
        const result = await this.services.guard(
          this.runSmokeTests({
            config: this.config,
            commandRunner: this.runner,
            errorOutput: this.errorOutput,
            driverUrl: loopbackUrl(instance.driverPort),
            manifest: await this.createStoryManifest(this.config, platform),
            platform,
            scope: this.scopeContext(platform),
            targetId: this.targetId(platform),
            report: this.reporter,
            signal: this.services.controller.signal,
            input,
          }),
        );
        // With a reporter the story tests operation's header already carries the summary.
        if (!this.reporter) this.output.write(`${formatDesktopStorybookSmokeTestSummary(result)}\n`);
      }
    } catch (error) {
      primaryFailure = error;
    } finally {
      try {
        await this.executePlan(smoke.stop!, platform, instance, true);
      } catch (error) {
        failures.push(error);
      }
      try {
        if (this.ownsServices) await this.services.close();
      } catch (error) {
        failures.push(error);
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

  /**
   * A native host whose development build reads Metro from a fixed port, such as React Native Test App's Windows Debug
   * host, declares that port through its smoke Metro URL. The driver must serve Metro there, or the app never loads.
   */
  private async resolveDriverMetroPort(platform: Platforms, storybookPort: number): Promise<number> {
    const smoke = this.config.getPlatformOptions(platform).smoke;
    if (!smoke || !smoke.metroUrl) {
      return findAvailablePort(this.instance.metroPort, this.isPortAvailable, new Set([storybookPort]));
    }
    const port = portFromUrl(smoke.metroUrl);
    if (port === storybookPort || !(await this.isPortAvailable(port))) {
      throw new Error(
        `The ${platform} app loads its development bundle from Metro on port ${port}, which is in use. ` +
          `Stop the process using port ${port}, such as another Metro server, then rerun the driver.`,
      );
    }
    return port;
  }

  private async resolveSmokeInstance(
    platform: Platforms,
    smoke: DesktopSmokeOptions,
    mode: DesktopSmokeMode,
    input?: 'accessible' | 'physical',
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
      const wdio = resolveWdioOptions({ ...this.config.wdio, ...(input ? { input } : {}) });
      resolvedInstance.driverManifestPath = (
        await this.writeDriverManifest(platform, resolvedInstance, nativeDriver, undefined, wdio)
      ).path;
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
    agent?: CreateDesktopStorybookDriverManifestOptions['agent'],
    wdio?: CreateDesktopStorybookDriverManifestOptions['wdio'],
  ): Promise<{ manifest: DesktopStorybookDriverManifest; path: string }> {
    const storyManifest = await this.createStoryManifest(this.config, platform);
    const outputPath = desktopStorybookDriverManifestPath(this.config.projectRoot, platform);
    const renderer = this.renderer(platform);
    const driverManifest = createDesktopStorybookDriverManifest({
      ...(agent ? { agent } : {}),
      bridgeNonce: readReusableBridgeNonce(outputPath, instance, storyManifest.platformManifestDigest, renderer),
      config: this.config,
      instance,
      nativeDriver,
      platform,
      renderer,
      scope: this.scopeContext(platform),
      storyManifest,
      ...(wdio ? { wdio } : {}),
    });
    writeDesktopStorybookDriverManifest(driverManifest, outputPath);
    return { manifest: driverManifest, path: outputPath };
  }

  private warn(message: string): void {
    if (this.reporter) this.reporter.emit({ kind: 'diagnostic', payload: { level: 'warning', message } }, 'storybook');
    else this.errorOutput.write(`Warning: ${message}\n`);
  }

  private targetId(platform: Platforms): string {
    return desktopStorybookTargetId(this.config, platform, this.renderer(platform));
  }

  private renderer(platform: Platforms): 'fabric' | 'paper' {
    return platform === 'win32' || (platform === 'macos' && this.paper) ? 'paper' : 'fabric';
  }

  /**
   * Windows and Win32 have no lease maintainer, so an agent attaches by the exact title qualified with the app's
   * configured or resolved AUMID or canonical executable; a title alone is never accepted as an identity.
   */
  private async resolveAgentApplication(platform: Platforms): Promise<NativeDesktopApplicationDescriptor> {
    const { windowTitle, aumid, executablePath } = this.requireNativeDriverOptions(platform).application ?? {};
    if (windowTitle && (aumid || executablePath)) {
      return { windowTitle, ...(aumid ? { aumid } : {}), ...(executablePath ? { executablePath } : {}) };
    }
    const target = this.config.getDesktopTarget(platform);
    if (!target) {
      throw new Error(
        `An agent attaches to ${platform} by a verified application identity; configure a ${platform} desktop target or the native driver application's aumid or executablePath.`,
      );
    }
    let resolved: NativeDesktopApplicationDescriptor;
    try {
      resolved = await this.resolveDesktopApplication(target, this.services.controller.signal, { attach: true });
    } catch (error) {
      throw new Error(
        `Could not resolve the ${platform} application identity an agent attaches to; build and register the app once before driver --agent: ${errorMessage(error)}`,
        { cause: error },
      );
    }
    if (!resolved.windowTitle || (!resolved.aumid && !resolved.executablePath)) {
      throw new Error(`The ${platform} desktop target does not resolve an AUMID or executable identity for an agent to attach to.`);
    }
    return {
      windowTitle: resolved.windowTitle,
      ...(resolved.aumid ? { aumid: resolved.aumid } : {}),
      ...(resolved.executablePath ? { executablePath: resolved.executablePath } : {}),
    };
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

  private async renderEveryStory(
    operation: DesktopOperation,
    serverUrl: string,
    settleMs: number,
    initialRenderTimeoutMs = 300_000,
    select = (storyId: string, timeoutMs: number) => this.selectStory(serverUrl, storyId, timeoutMs),
  ): Promise<void> {
    const storyIndex = await this.getJson(new URL('/index.json', serverUrl));
    const entries = Object.values((storyIndex.entries ?? {}) as Record<string, { id?: string; type?: string }>).filter(
      (entry) => entry.type === 'story' && entry.id,
    );
    if (entries.length === 0) {
      throw new Error('The Storybook index did not contain any stories.');
    }

    const failures: Error[] = [];
    for (const { id } of entries)
      this.reporter?.emit({ kind: 'work-selected', payload: { workId: `navigation:${id}`, label: `Render ${id}` } });
    let attempted = 0;
    let consecutiveFailures = 0;
    for (const [entryIndex, { id }] of entries.entries()) {
      this.services.controller.signal.throwIfAborted();
      attempted += 1;
      const started = Date.now();
      const testId = `navigation:${id}`;
      this.reporter?.emit({ kind: 'scope-start', payload: { label: `Render ${id}`, category: 'worker' } }, testId, { story: id }, testId);
      this.reporter?.emit({ kind: 'test-start', payload: { testId, title: `Render ${id}`, attempt: 0 } }, testId, { story: id });
      try {
        await select(id!, entryIndex === 0 ? initialRenderTimeoutMs : 15_000);
        consecutiveFailures = 0;
        if (settleMs > 0) {
          await delay(settleMs);
        }
        operation.log(`rendered ${id}`);
        this.reporter?.emit(
          {
            kind: 'test-result',
            payload: { testId, title: `Render ${id}`, attempt: 0, status: 'passed', durationMs: Date.now() - started },
          },
          testId,
          { story: id },
        );
        this.reporter?.emit({ kind: 'scope-end', payload: { status: 'passed' } }, testId);
      } catch (error) {
        this.reporter?.emit(
          {
            kind: 'test-result',
            payload: {
              testId,
              title: `Render ${id}`,
              attempt: 0,
              status: 'failed',
              durationMs: Date.now() - started,
              failure: this.reporter.failure(error, 'test'),
            },
          },
          testId,
          { story: id },
        );
        this.reporter?.emit({ kind: 'scope-end', payload: { status: 'failed' } }, testId);
        writeDesktopStorybookFailure(`navigation "${id}"`, error, this.errorOutput);
        failures.push(new Error(`Story "${id}" failed to render: ${errorMessage(error)}`, { cause: error }));
        consecutiveFailures += 1;
        if (entryIndex === 0 || consecutiveFailures >= 3) {
          break;
        }
      }
    }

    if (failures.length > 0) {
      const notAttempted = entries.length - attempted;
      operation.summarize(
        `${failures.length} of ${entries.length} stories failed to render${notAttempted > 0 ? ` (stopped early; ${notAttempted} not attempted)` : ''}`,
      );
      throw new AggregateError(failures, `${failures.length} stories failed to render:\n${failures.map(errorMessage).join('\n')}`);
    }
    operation.summarize(`${entries.length} ${entries.length === 1 ? 'story' : 'stories'} rendered`);
  }

  private async selectStory(serverUrl: string, storyId: string, timeoutMs: number): Promise<void> {
    const deadline = Date.now() + timeoutMs;
    let lastError: unknown;
    do {
      this.services.controller.signal.throwIfAborted();
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
    throw new Error(`Timed out after ${timeoutMs} ms waiting for Storybook story "${storyId}" to render.`, { cause: lastError });
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
      return await this.fetch(input, { ...init, signal: AbortSignal.any([controller.signal, this.services.controller.signal]) });
    } finally {
      clearTimeout(timeout);
    }
  }

  private async executePlan(
    plan: DesktopCommandPlan,
    platform: Platforms,
    instance?: ResolvedDesktopStorybookInstance,
    cleanup = false,
  ): Promise<void> {
    for (const command of Array.isArray(plan) ? plan : [plan]) {
      // Cleanup runs after the scope has stopped, so only regular steps are cancelled with it.
      if (cleanup) await this.runner.run(this.prepareCommand(command, platform, instance));
      else
        await this.services.guard(
          this.runner.run(this.prepareCommand(command, platform, instance), { signal: this.services.controller.signal }),
        );
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
        ...(platform === 'macos' ? { RCT_NEW_ARCH_ENABLED: this.paper ? '0' : '1' } : {}),
        [STORYBOOK_VERBOSE]: this.verbose ? '1' : '0',
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

function reportOutput(
  reporter: DesktopReportWriter | undefined,
  level: 'info' | 'warning',
  fallback: Pick<NodeJS.WriteStream, 'write'>,
): Pick<NodeJS.WriteStream, 'write'> {
  if (!reporter) return fallback;
  return {
    write(chunk: string | Uint8Array) {
      const message = String(chunk).trim();
      if (message) reporter.emit({ kind: 'diagnostic', payload: { level, message } }, 'storybook');
      return true;
    },
  };
}

function readReusableBridgeNonce(
  manifestPath: string,
  instance: DesktopStorybookInstance,
  platformManifestDigest: string,
  renderer: 'fabric' | 'paper',
): string | undefined {
  if (!fs.existsSync(manifestPath)) {
    return undefined;
  }
  try {
    const current = JSON.parse(fs.readFileSync(manifestPath, 'utf8')) as Record<string, unknown>;
    return current.instanceId === instance.id &&
      current.storybookPort === instance.storybookPort &&
      current.driverPort === instance.driverPort &&
      current.renderer === renderer &&
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

export type MacOSRunningApplication = {
  executablePath: string;
  processId: number;
  processStartedAt: number;
};

export async function writeMacOSApplicationLease(manifestPath: string, timeoutMs = 120_000): Promise<void> {
  if (process.platform !== 'darwin') {
    throw new Error('A macOS application lease can only be written on macOS.');
  }
  const application = readMacOSLeaseApplication(manifestPath);
  const runningApplication = await waitForMacOSApplication(application.bundleIdentifier, timeoutMs);
  writeMacOSApplicationLeaseFile(application, runningApplication);
}

export type MaintainMacOSApplicationLeaseOptions = {
  intervalMs?: number;
  /** Replaces the AppKit query; tests supply it. */
  queryApplications?: (bundleIdentifier: string) => Promise<MacOSRunningApplication[]>;
  /** Receives each distinct query failure once, such as more than one running instance. */
  onWarning?: (message: string) => void;
};

/**
 * Keeps the manifest's application lease naming the one running instance, rewriting it whenever that process changes
 * or the lease disappears. A failed or ambiguous query leaves the lease unchanged. Runs until the signal aborts and then
 * rejects with its reason.
 */
export async function maintainMacOSApplicationLease(
  manifestPath: string,
  signal: AbortSignal,
  { intervalMs = 2000, queryApplications, onWarning }: MaintainMacOSApplicationLeaseOptions = {},
): Promise<never> {
  if (!queryApplications && process.platform !== 'darwin') {
    throw new Error('A macOS application lease can only be written on macOS.');
  }
  const query = queryApplications ?? queryMacOSApplications;
  const application = readMacOSLeaseApplication(manifestPath);
  let leased: string | undefined;
  let warned: string | undefined;
  for (;;) {
    signal.throwIfAborted();
    try {
      const applications = await query(application.bundleIdentifier);
      if (applications.length > 1) {
        throw new Error(`More than one running application has bundle identifier "${application.bundleIdentifier}".`);
      }
      const [running] = applications;
      if (running) {
        const identity = `${running.processId}:${running.processStartedAt}`;
        if (identity !== leased || !fs.existsSync(application.leasePath)) {
          writeMacOSApplicationLeaseFile(application, running);
          leased = identity;
        }
      }
      warned = undefined;
    } catch (error) {
      const message = errorMessage(error);
      if (message !== warned) onWarning?.(message);
      warned = message;
    }
    await delay(intervalMs, signal);
  }
}

function readMacOSLeaseApplication(manifestPath: string): { bundleIdentifier: string; leaseNonce: string; leasePath: string } {
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
  return { bundleIdentifier: application.bundleIdentifier, leaseNonce: application.leaseNonce, leasePath: application.leasePath };
}

export function writeMacOSApplicationLeaseFile(
  application: { bundleIdentifier: string; leaseNonce: string; leasePath: string },
  runningApplication: MacOSRunningApplication,
): void {
  validateMacOSRunningApplication(runningApplication);
  const processStartedAt = new Date(runningApplication.processStartedAt * 1000);
  const temporaryPath = `${application.leasePath}.${process.pid}.tmp`;
  fs.mkdirSync(path.dirname(application.leasePath), { mode: 0o700, recursive: true });
  try {
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
      { mode: 0o600 },
    );
    fs.renameSync(temporaryPath, application.leasePath);
    fs.chmodSync(application.leasePath, 0o600);
  } finally {
    fs.rmSync(temporaryPath, { force: true });
  }
}

async function waitForMacOSApplication(bundleIdentifier: string, timeoutMs: number): Promise<MacOSRunningApplication> {
  const deadline = Date.now() + timeoutMs;
  let lastError: unknown;
  do {
    let output: string;
    try {
      output = await queryMacOSApplicationsOutput(bundleIdentifier);
    } catch (error) {
      lastError = error;
      await delay(250);
      continue;
    }
    const applications = parseMacOSRunningApplications(output, bundleIdentifier);
    if (applications.length === 1) {
      return applications[0];
    }
    await delay(250);
  } while (Date.now() < deadline);
  throw new Error(`Timed out waiting for the macOS application "${bundleIdentifier}"${lastError ? `: ${errorMessage(lastError)}` : '.'}`);
}

async function queryMacOSApplications(bundleIdentifier: string): Promise<MacOSRunningApplication[]> {
  return parseMacOSRunningApplications(await queryMacOSApplicationsOutput(bundleIdentifier), bundleIdentifier);
}

function queryMacOSApplicationsOutput(bundleIdentifier: string): Promise<string> {
  return runProcess('/usr/bin/osascript', [
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
      '    const executableURL = application.executableURL;',
      '    const launchDate = application.launchDate;',
      '    result.push({',
      '      executablePath: executableURL ? ObjC.unwrap(executableURL.path) : null,',
      '      processId: Number(application.processIdentifier),',
      '      processStartedAt: launchDate ? Number(launchDate.timeIntervalSince1970) : null,',
      '    });',
      '  }',
      '  return JSON.stringify(result);',
      '}',
    ].join('\n'),
    bundleIdentifier,
  ]);
}

export function parseMacOSRunningApplications(output: string, bundleIdentifier: string): MacOSRunningApplication[] {
  const value: unknown = JSON.parse(output);
  if (!Array.isArray(value)) {
    throw new Error(`The macOS application query for "${bundleIdentifier}" returned a non-array result.`);
  }
  if (value.length > 1) {
    throw new Error(`More than one running application has bundle identifier "${bundleIdentifier}".`);
  }
  return value.map((entry) => {
    if (!entry || typeof entry !== 'object') {
      throw new Error(`The macOS application query for "${bundleIdentifier}" returned an invalid application record.`);
    }
    const application = entry as Partial<MacOSRunningApplication>;
    validateMacOSRunningApplication(application);
    return application as MacOSRunningApplication;
  });
}

function validateMacOSRunningApplication(application: Partial<MacOSRunningApplication>): void {
  if (typeof application.executablePath !== 'string' || !application.executablePath) {
    throw new Error('The running macOS application does not expose an executable path.');
  }
  if (!Number.isInteger(application.processId) || (application.processId ?? 0) <= 0) {
    throw new Error('The running macOS application does not expose a valid process identifier.');
  }
  if (!Number.isFinite(application.processStartedAt) || (application.processStartedAt ?? 0) <= 0) {
    throw new Error(`Could not determine the start time for macOS process ${String(application.processId ?? 'unknown')}.`);
  }
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
    `Desktop Storybook ${action} is not configured for ${platform}. Set platformOptions.${platform}.${action} in your Storybook integration options.`,
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

function delay(milliseconds: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(signal.reason);
      return;
    }
    const abort = () => {
      clearTimeout(timer);
      reject(signal?.reason);
    };
    const timer = setTimeout(() => {
      signal?.removeEventListener('abort', abort);
      resolve();
    }, milliseconds);
    signal?.addEventListener('abort', abort, { once: true });
  });
}
