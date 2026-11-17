import fs from 'node:fs';
import { createServer } from 'node:net';
import path from 'node:path';
import {
  defaultAgentDescriptor,
  DesktopServiceScope,
  resolveDesktopApplication,
  resolveDesktopTestScope,
} from '@fluentui-react-native/desktop-test';
import { selectDesktopRenderer } from '@fluentui-react-native/desktop-test/config';
import { connectDesktopRunner, defaultRunnerDescriptor } from '@fluentui-react-native/desktop-test/runner-connection';
import type {
  DesktopHostedDriverReady,
  DesktopSupervisor,
  ResolvedDesktopConfig,
  ResolvedDesktopTarget,
} from '@fluentui-react-native/desktop-test';
import type { DesktopRunnerConnection } from '@fluentui-react-native/desktop-test/runner-connection';
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
import {
  createStorybookPrivateStorage,
  parseStoredDriverManifest,
  readDriverManifest,
  type CreateStorybookPrivateStorage,
} from '../driver/generatedManifest.js';
import { createStorybookMacOSApplicationLeaseResource, waitForStorybookMacOSApplicationLease } from '../driver/applicationLease.js';
import { NodeDesktopCommandRunner, STORYBOOK_VERBOSE } from './commandRunner.js';
import type { DesktopCommandRunner, PreparedDesktopCommand, RunningDesktopCommand } from './commandRunner.js';
import { formatDesktopStorybookSmokeTestSummary, runDesktopStorybookSmokeTests } from './smokeTests.js';
import { runWdioStoryTests, WdioStoryTestRunError, type WdioStoryTestResult } from '../testing/runWdioTests.js';
import { decideWdioSelection, describeWdioExclusions, listWdioSelection } from '../testing/selection.js';
import type { WdioSelectionContext } from '../testing/selection.js';
import { resolveWdioOptions, type DesktopStorybookWdioOptions } from '../config/wdio.js';
import { connectStoryTraversal } from './storyTraversal.js';
import { preparePhysicalWindow } from './physicalWindow.js';

type ResolvedDesktopStorybookInstance = DesktopStorybookInstance & {
  driverManifestPath?: string;
  macosXcconfigPath?: string;
};

type OwnedMacOSApplication = {
  target: ResolvedDesktopTarget;
  application: NativeDesktopApplicationDescriptor & { windowTitle: string };
};

type OwnedWindowsSmokeOptions = Exclude<NonNullable<DesktopSmokeOptions['native']>, { kind: 'macos' }>;

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
  /** Trusted OS storage adapter override for controlled fixtures. */
  createPrivateStorage?: CreateStorybookPrivateStorage;
  /** Resolves a Windows or Win32 desktop target's verified application identity for `driver --agent`. */
  resolveDesktopApplication?: typeof resolveDesktopApplication;
  createMacOSApplicationLeaseResource?: typeof createStorybookMacOSApplicationLeaseResource;
  waitForMacOSApplicationLease?: typeof waitForStorybookMacOSApplicationLease;
  reporter?: DesktopReportWriter;
  reporterMode?: ResolvedDesktopReporterMode;
  services?: DesktopServiceScope;
  /** The neutral owner whose claim and service scope authorize a retained application. */
  supervisor?: DesktopSupervisor;
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
   * Driver MCP adapter reads. An attach-only runner is published separately for protected story tests.
   */
  agent?: {
    /** The descriptor record name. Defaults to `agent-connection.json`. */
    descriptor?: string;
    /** The private storage root. Defaults to the platform location. */
    root?: string;
    /** Runner publication settings. Preemption is disabled unless explicitly authorized. */
    runner?: false | { descriptor?: string; allowPreempt?: boolean };
  };
};

export type DesktopStorybookDriverReady = DesktopHostedDriverReady & {
  integration: {
    name: 'storybook';
    details: {
      services: readonly string[];
      instanceId: string;
      storybookPort: number;
      metroPort: number;
      driverPort: number;
    };
  };
};

export type DesktopStorybookTestOptions = Omit<DesktopStorybookWdioOptions, 'reporter'> & {
  list?: boolean;
  testReporter?: DesktopStorybookWdioOptions['reporter'];
  url?: string;
  target?: string;
  attachAgent?: boolean;
  descriptor?: string;
  root?: string;
  preempt?: boolean;
};

export type ManagedDesktopStorybookTestOptions = {
  connection: DesktopRunnerConnection;
  input: 'accessible' | 'physical';
  storyId?: string;
  addSecret(secret: string): void;
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
  private readonly createPrivateStorage: CreateStorybookPrivateStorage;
  private readonly driverHandoffs = new Map<string, string>();
  private readonly resolveDesktopApplication: typeof resolveDesktopApplication;
  private readonly createMacOSApplicationLeaseResource: typeof createStorybookMacOSApplicationLeaseResource;
  private readonly waitForMacOSApplicationLease: typeof waitForStorybookMacOSApplicationLease;
  private readonly reporter?: DesktopReportWriter;
  private readonly reporterMode?: ResolvedDesktopReporterMode;
  private readonly structuredOutput: Pick<NodeJS.WriteStream, 'write'>;
  private readonly services: DesktopServiceScope;
  private readonly supervisor?: DesktopSupervisor;
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
    this.supervisor = options.supervisor;
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
    this.createPrivateStorage = options.createPrivateStorage ?? createStorybookPrivateStorage;
    this.resolveDesktopApplication = options.resolveDesktopApplication ?? resolveDesktopApplication;
    this.createMacOSApplicationLeaseResource = options.createMacOSApplicationLeaseResource ?? createStorybookMacOSApplicationLeaseResource;
    this.waitForMacOSApplicationLease = options.waitForMacOSApplicationLease ?? waitForStorybookMacOSApplicationLease;
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
    const failures: unknown[] = [];
    try {
      const ready = await this.startDriver(platform, options);
      const { details } = ready.integration;
      if (this.reporterMode === 'json' || this.reporterMode === 'ndjson') {
        this.writeStructured({
          type: 'ready',
          url: ready.url,
          targetId: ready.targetId,
          endpoint: platform,
          renderer: this.renderer(platform),
          runId: this.reporter?.runId,
          ...(ready.agentDescriptor ? { agentDescriptor: ready.agentDescriptor } : {}),
          ...(ready.runnerDescriptor ? { runnerDescriptor: ready.runnerDescriptor } : {}),
          integration: ready.integration,
        });
      } else {
        this.output.write(
          `Storybook instance ${details.instanceId}: channel=${details.storybookPort}, metro=${details.metroPort}, driver=${details.driverPort}` +
            `${ready.agentDescriptor ? `, agent=${ready.agentDescriptor}` : ''}` +
            `${ready.runnerDescriptor ? `, runner=${ready.runnerDescriptor}` : ''}\n`,
        );
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
    if (failures.length > 1) throw new AggregateError(failures, 'Storybook driver execution and cleanup failed.');
  }

  /** Starts the hosted services in the supplied scope without presenting readiness or waiting for shutdown. */
  async startDriver(platform: Platforms, options: DesktopStorybookDriverOptions = {}): Promise<DesktopStorybookDriverReady> {
    validateServerOptions(options);
    validateDriverHost(options.host);
    const target = this.workloadTarget(platform);
    const retained = target.host.ownership === 'supervisor';
    if (retained) {
      if (!this.supervisor || this.supervisor.services !== this.services) {
        throw new Error('A retained Storybook application requires the claimed neutral supervisor and its service scope.');
      }
      this.supervisor.assertWorkloadClaim(target);
    }
    const macApplication = retained && platform === 'macos' ? this.ownedMacOSApplication(this.instance) : undefined;
    const windowsNative = retained && platform !== 'macos' ? this.ownedWindowsSmokeOptions(platform) : undefined;
    const wdio = resolveWdioOptions({ ...this.config.wdio, ...(options.input ? { input: options.input } : {}) });
    const agent = options.agent && {
      descriptor: options.agent.descriptor ?? defaultAgentDescriptor,
      // The channel service runs in another working directory.
      ...(options.agent.root === undefined ? {} : { root: path.resolve(options.agent.root) }),
      ...(options.agent.runner === false
        ? {}
        : {
            runner: {
              descriptor: options.agent.runner?.descriptor ?? defaultRunnerDescriptor,
              allowPreempt: options.agent.runner?.allowPreempt ?? false,
            },
          }),
    };
    const command = this.config.getPlatformOptions(platform).server;
    if (command === false || command === undefined) {
      throw unsupportedAction('server', platform);
    }
    const nativeDriver = await this.resolveDriver(platform);
    const storybookPort = options.port ?? (await findAvailablePort(this.instance.storybookPort, this.isPortAvailable));
    const metroPort = await this.resolveDriverMetroPort(platform, storybookPort);
    const driverPort = await findAvailablePort(this.instance.driverPort, this.isPortAvailable, new Set([storybookPort, metroPort]));
    const resolvedInstance: ResolvedDesktopStorybookInstance = {
      ...this.instance,
      driverPort,
      metroPort,
      storybookPort,
    };
    let ownedApplication: NativeDesktopApplicationDescriptor | undefined;
    let driverManifest: { manifest: DesktopStorybookDriverManifest; path: string };
    if (windowsNative) {
      // The prebuilt bundle embeds this run's private bridge module, so publish it first, then bind the exact launched
      // identity to the same bridge before the channel starts.
      const provisional = await this.writeDriverManifest(platform, resolvedInstance, nativeDriver, agent, wdio);
      const provisionalHandoff = this.driverHandoffs.get(provisional.path);
      resolvedInstance.driverManifestPath = provisional.path;
      ownedApplication = await this.buildOwnedWindowsApplication(platform, windowsNative, resolvedInstance);
      const agentApplication = agent && this.retainedAgentApplication(platform, ownedApplication);
      driverManifest = await this.writeDriverManifest(
        platform,
        resolvedInstance,
        nativeDriver,
        agent && { ...agent, ...(agentApplication ? { application: agentApplication } : {}) },
        wdio,
        provisional.manifest.bridgeNonce,
      );
      const expectedRuntime = runtimeModuleDigest(provisionalHandoff);
      if (!expectedRuntime || expectedRuntime !== runtimeModuleDigest(this.driverHandoffs.get(driverManifest.path))) {
        throw new Error(`The retained ${platform} bundle no longer matches the published Storybook bridge.`);
      }
    } else {
      const agentApplication = agent && platform !== 'macos' ? await this.resolveAgentApplication(platform) : undefined;
      driverManifest = await this.writeDriverManifest(
        platform,
        resolvedInstance,
        nativeDriver,
        agent && { ...agent, ...(agentApplication ? { application: agentApplication } : {}) },
        wdio,
      );
    }
    resolvedInstance.driverManifestPath = driverManifest.path;
    if (macApplication) {
      resolvedInstance.macosXcconfigPath = writeMacOSInstanceConfig(this.config.projectRoot, resolvedInstance);
      await this.executeAction('bundle', platform, resolvedInstance);
      await this.executeAction('build', platform, resolvedInstance);
      ownedApplication = await this.resolveOwnedMacOSApplication(resolvedInstance, macApplication);
    }
    if (platform === 'macos') await this.startMacOSApplicationLease(driverManifest.path);
    // The retained Win32 host loads its prebuilt bundle, as in native smoke, so it needs no Metro.
    const metro =
      windowsNative?.kind === 'win32'
        ? undefined
        : this.services.start('metro', {
            ...this.prepareCommand(defaultMetroCommand(resolvedInstance), platform, resolvedInstance),
            listener: { service: 'metro-listener', port: metroPort },
          });
    const channel = this.services.start('storybook-channel', {
      ...this.prepareCommand(
        {
          ...command,
          env: {
            ...command.env,
            ...(options.host ? { STORYBOOK_WS_HOST: options.host } : {}),
          },
        },
        platform,
        resolvedInstance,
        ownedApplication,
      ),
      listener: { service: 'storybook-channel-listener', port: storybookPort },
    });
    const [, channelListener] = await Promise.all([
      metro && this.waitForOwnedService('metro', 'metro-listener', loopbackUrl(metroPort, '/status'), metro),
      this.waitForOwnedService('storybook-channel', 'storybook-channel-listener', loopbackUrl(storybookPort, '/index.json'), channel),
    ]);
    const agentManifest = driverManifest.manifest.agent;
    const channelReady = await this.services.readyProcess(
      'storybook-channel',
      { tier: 'service-ready', service: 'storybook-channel', ...(agentManifest ? { descriptor: agentManifest.descriptor } : {}) },
      120_000,
    );
    assertSameReadinessProducer(channelListener, channelReady);
    // Windows and Win32 publish the retained app's lease inside the channel before it reports service readiness.
    if (ownedApplication && platform === 'macos') {
      await this.waitForMacOSApplicationLease(driverManifest.path, {
        timeoutMs: 120_000,
        signal: this.services.controller.signal,
        createStorage: this.createPrivateStorage,
      });
    }
    return {
      targetId: this.targetId(platform),
      url: loopbackUrl(driverPort),
      ...(agentManifest ? { agentDescriptor: agentManifest.descriptor } : {}),
      ...(agentManifest?.runner ? { runnerDescriptor: agentManifest.runner.descriptor } : {}),
      ...(agentManifest?.root ? { root: agentManifest.root } : {}),
      serviceReady: channelReady,
      integration: {
        name: 'storybook',
        details: {
          services: metro ? ['metro', 'storybook-channel'] : ['storybook-channel'],
          instanceId: resolvedInstance.id,
          storybookPort,
          metroPort,
          driverPort,
        },
      },
    };
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
    await this.testInternal(platform, options);
  }

  /** Runs a trusted declared suite against the host's verified runner without claiming or starting another driver. */
  async testManaged(platform: Platforms, options: ManagedDesktopStorybookTestOptions): Promise<void> {
    await this.testInternal(
      platform,
      { attachAgent: true, input: options.input, ...(options.storyId ? { story: options.storyId } : {}) },
      options,
    );
  }

  private async testInternal(
    platform: Platforms,
    options: DesktopStorybookTestOptions,
    managed?: ManagedDesktopStorybookTestOptions,
  ): Promise<void> {
    if (!options.attachAgent && (options.descriptor !== undefined || options.root !== undefined || options.preempt)) {
      throw new TypeError('--descriptor, --root and --preempt require --attach-agent.');
    }
    if (options.list && options.attachAgent) throw new TypeError('--list does not attach to an agent.');
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
    if (managed?.storyId && !manifest.entries.some((entry) => entry.id === managed.storyId && entry.wdio)) {
      throw new Error('The requested exact story ID is not an executable story in the current manifest.');
    }
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
    if (managed && managed.connection.url !== activeConnection.url) {
      throw new Error('The hosted Storybook driver no longer matches the verified workload connection.');
    }
    if (platform === 'macos' && !options.url) {
      await this.waitForMacOSApplicationLease(desktopStorybookDriverManifestPath(this.config.projectRoot, 'macos'), {
        timeoutMs: settings.timeoutMs,
        signal: this.services.controller.signal,
        createStorage: this.createPrivateStorage,
      });
    }
    const summarize = (operation: DesktopOperation, wdio: readonly WdioStoryTestResult[]) =>
      operation.summarize(formatDesktopStorybookSmokeTestSummary({ tests: [], wdio }));
    await this.operation('Story tests', async (operation) => {
      try {
        if (activeConnection.runner && !this.reporter) throw new Error('Protected story tests require a report collector.');
        const runner = managed
          ? { connection: managed.connection, addSecret: managed.addSecret }
          : activeConnection.runner
            ? {
                connection: await connectDesktopRunner({
                  ...activeConnection.runner,
                  expect: { targetId: activeConnection.targetId, url: activeConnection.url },
                  addSecret: (secret) => this.reporter!.addSecret(secret),
                }),
                preempt: options.preempt,
              }
            : undefined;
        if (platform === 'macos' && settings.input === 'physical' && !runner) {
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
            targetId: activeConnection.targetId,
            url: activeConnection.url,
            config: this.config,
            manifest,
            platform,
            scope,
            errorOutput: this.errorOutput,
            report: this.reporter,
            signal: this.services.controller.signal,
            input: settings.input,
            ...(runner ? { runner } : {}),
            ...(runner && platform === 'macos' && settings.input === 'physical'
              ? {
                  prepareSession: (session) =>
                    preparePhysicalWindow(session, AbortSignal.any([this.services.controller.signal, AbortSignal.timeout(10_000)])),
                }
              : {}),
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
  ): {
    input?: 'accessible' | 'physical';
    targetId: string;
    url: string;
    runner?: { descriptor: string; root?: string };
  } {
    if (options.url || options.target) {
      if (!options.url || !options.target) {
        throw new Error('Pass --url and --target together, or omit both to use the running Storybook driver instance.');
      }
      return {
        targetId: options.target,
        url: options.url,
        ...(options.attachAgent
          ? { runner: { descriptor: options.descriptor ?? defaultRunnerDescriptor, ...(options.root ? { root: options.root } : {}) } }
          : {}),
      };
    }
    const manifestPath = desktopStorybookDriverManifestPath(this.config.projectRoot, platform);
    if (!fs.existsSync(manifestPath)) {
      throw new Error(`Start storybook driver --${platform} and launch the app before running storybook test.`);
    }
    const manifest = parseStoredDriverManifest(JSON.parse(fs.readFileSync(manifestPath, 'utf8')));
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
    if (manifest.agent && !options.attachAgent) {
      throw new Error(`The Storybook driver instance at ${manifestPath} serves an agent; pass --attach-agent to run storybook test.`);
    }
    if (options.attachAgent && !manifest.agent?.runner) {
      throw new Error(
        `The Storybook driver instance at ${manifestPath} has no runner publication; restart storybook driver --${platform} --agent.`,
      );
    }
    const input = driverManifestInput(manifest);
    const root = options.root ?? manifest.agent?.root;
    return {
      targetId: manifest.targetId,
      url: loopbackUrl(manifest.driverPort),
      ...(input ? { input } : {}),
      ...(options.attachAgent
        ? { runner: { descriptor: options.descriptor ?? manifest.agent!.runner!.descriptor, ...(root ? { root } : {}) } }
        : {}),
    };
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

  /** Returns the registered claim identity, synthesizing a stable target for legacy Storybook configuration. */
  workloadTarget(platform: Platforms): ResolvedDesktopTarget {
    const configured = this.config.getDesktopTarget?.(platform);
    if (configured) {
      return platform === 'macos' ? selectDesktopRenderer(configured, this.renderer(platform)) : configured;
    }

    const id = this.config.appName ? this.targetId(platform) : `storybook-${this.instance.id}-${platform}`;
    const nativeDriver = this.config.getNativeDriverOptions(platform);
    return {
      endpoint: platform,
      id,
      registrationId: id,
      instanceId: this.instance.id,
      projectRoot: this.config.projectRoot,
      configPath: path.join(this.config.projectRoot, 'storybook.config.mts'),
      host: {
        kind: platform === 'win32' ? 'rex' : 'react-native-test-app',
        ownership: 'external',
        renderer: this.renderer(platform),
        ...(nativeDriver && nativeDriver.application ? { application: nativeDriver.application } : {}),
      },
      ...(!nativeDriver
        ? {}
        : {
            nativeDriver: {
              ...(nativeDriver.cacheRoot ? { cacheRoot: nativeDriver.cacheRoot } : {}),
              ...(nativeDriver.helperPath ? { helperPath: nativeDriver.helperPath } : {}),
              ...(nativeDriver.installRoot ? { installRoot: nativeDriver.installRoot } : {}),
            },
          }),
    };
  }

  /** Legacy Storybook configuration has no declared managed suites; retain its real target identity with an empty catalog. */
  managementConfig(platform: Platforms): ResolvedDesktopConfig {
    if (this.config.desktop) return this.config.desktop;
    const target = this.workloadTarget(platform);
    return {
      config: { schemaVersion: 1, targets: { [platform]: { host: target.host } }, suites: {} },
      configPath: target.configPath,
      projectRoot: target.projectRoot,
      targets: { [platform]: target },
      reporting: { artifactsRoot: path.join(target.projectRoot, 'artifacts', 'desktop') },
      testScopes: resolveDesktopScopeDomains(),
    };
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
    if (smoke?.native) {
      if (smoke.native.kind !== platform || smoke.command || smoke.stop) {
        throw new Error('Native smoke requires a matching endpoint and cannot delegate lifecycle commands.');
      }
      const instance = await this.resolveSmokeInstance(platform, smoke, 'stories-and-tests', options.input);
      await this.runNativeSmokeLifecycle(platform, smoke, instance, mode, options.input);
      return;
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

  private ownedMacOSApplication(instance: DesktopStorybookInstance): OwnedMacOSApplication {
    const target = this.workloadTarget('macos');
    const application: NativeDesktopApplicationDescriptor | undefined = this.requireNativeDriverOptions('macos').application;
    if (
      target.host.kind !== 'react-native-test-app' ||
      !application?.windowTitle ||
      application.processIdentity ||
      application.leasePath ||
      application.leaseNonce
    ) {
      throw new Error('An owned macOS Storybook application requires a launchable RN Test App target with an exact window title.');
    }
    if (
      application.bundleIdentifier &&
      application.bundleIdentifier !== this.config.macosBundleIdentifier &&
      application.bundleIdentifier !== instance.bundleIdentifier
    ) {
      throw new Error('The configured macOS bundle identifier conflicts with the instance-specific built product.');
    }
    return { target, application: { ...application, windowTitle: application.windowTitle } };
  }

  private async resolveOwnedMacOSApplication(
    instance: DesktopStorybookInstance,
    { target, application: configured }: OwnedMacOSApplication,
  ): Promise<NativeDesktopApplicationDescriptor> {
    const resolved = await this.services.guard(
      this.resolveDesktopApplication(
        {
          ...target,
          host: {
            ...target.host,
            windowTitle: configured.windowTitle,
            application: { ...configured, bundleIdentifier: undefined, executablePath: undefined },
          },
        },
        this.services.controller.signal,
        { macosBundleIdentifier: instance.bundleIdentifier },
      ),
    );
    if (!resolved.executablePath || !path.isAbsolute(resolved.executablePath)) {
      throw new Error('An owned macOS Storybook application requires the exact built application executable.');
    }
    if (configured.executablePath) {
      const expected = fs.realpathSync.native(configured.executablePath);
      const executable = fs.realpathSync.native(resolved.executablePath);
      const bundle = path.dirname(path.dirname(path.dirname(executable)));
      if (expected !== executable && expected !== bundle) {
        throw new Error('The configured macOS application does not match the verified built product.');
      }
    }
    return { ...resolved, bundleIdentifier: instance.bundleIdentifier };
  }

  /** Bundles, builds, and registers the checkout's Windows app, or bundles the prebuilt Win32 host, then resolves its exact launch identity. */
  private async buildOwnedWindowsApplication(
    platform: Platforms,
    native: OwnedWindowsSmokeOptions,
    instance: ResolvedDesktopStorybookInstance,
  ): Promise<NativeDesktopApplicationDescriptor> {
    const target = this.workloadTarget(platform);
    const windowTitle = native.windowTitle;
    await this.executeAction('bundle', platform, instance);
    if (native.kind === 'windows') {
      await this.executeAction('prep', platform, instance);
      const build = this.config.getCommandPlan('build', platform);
      if (build === false) throw unsupportedAction('build', platform);
      const configuration = native.configuration ?? 'Debug';
      await this.executePlan(
        (Array.isArray(build) ? build : [build]).map((command: DesktopCommand) =>
          command.command === 'rnx-cli' && !command.args?.includes('--configuration')
            ? { ...command, args: [...(command.args ?? []), '--configuration', configuration] }
            : command,
        ),
        platform,
        instance,
      );
      // The script refuses a package identity already registered from another checkout.
      await this.executePlan(
        {
          command: 'pwsh',
          args: [
            '-NoProfile',
            '-NonInteractive',
            '-File',
            path.join(this.config.resolvePackage('@fluentui-react-native/storybook-desktop').root, 'config', 'register-windows.ps1'),
          ],
          env: { STORYBOOK_WINDOWS_CONFIGURATION: configuration },
        },
        platform,
        instance,
      );
    }
    const resolved = await this.services.guard(
      this.resolveDesktopApplication(
        {
          ...target,
          host: {
            ...target.host,
            ...(native.kind === 'win32' ? { kind: 'rex', component: native.component } : {}),
            windowTitle,
            application: { ...target.host.application, windowTitle },
          },
        },
        this.services.controller.signal,
        native.kind === 'windows' ? { configuration: native.configuration ?? 'Debug' } : {},
      ),
    );
    return native.kind === 'win32'
      ? { ...resolved, arguments: [...(resolved.arguments ?? []), 'crashOnRedBox', 'debugBundlePath', 'index'] }
      : resolved;
  }

  /** Validates that a retained Windows or Win32 driver can launch, rather than adopt, an exactly identified application. */
  private ownedWindowsSmokeOptions(platform: Platforms): OwnedWindowsSmokeOptions {
    const smoke = this.config.getPlatformOptions(platform).smoke;
    const native = smoke ? smoke.native : undefined;
    if (!native || native.kind === 'macos' || native.kind !== platform) {
      throw new Error(`A retained ${platform} Storybook application requires the platform's native smoke options.`);
    }
    const configured: NativeDesktopApplicationDescriptor | undefined = this.requireNativeDriverOptions(platform).application;
    if (configured?.processIdentity || configured?.leasePath || configured?.leaseNonce) {
      throw new Error(`A retained ${platform} Storybook application cannot adopt a configured process or lease.`);
    }
    if (configured?.windowTitle && configured.windowTitle !== native.windowTitle) {
      throw new Error(`The configured ${platform} window title conflicts with the retained application's exact window title.`);
    }
    return native;
  }

  /** The attach identity of a retained app is the exact launched identity; a conflicting configured identity fails closed. */
  private retainedAgentApplication(platform: Platforms, owned: NativeDesktopApplicationDescriptor): NativeDesktopApplicationDescriptor {
    const { aumid, executablePath } = this.requireNativeDriverOptions(platform).application ?? {};
    if (!owned.windowTitle || (platform === 'windows' ? !owned.aumid : !owned.executablePath)) {
      throw new Error(`The retained ${platform} application did not resolve an exact attach identity.`);
    }
    if ((aumid && aumid !== owned.aumid) || (executablePath && path.resolve(executablePath) !== path.resolve(owned.executablePath ?? ''))) {
      throw new Error(`The configured ${platform} application identity conflicts with the retained application.`);
    }
    return {
      windowTitle: owned.windowTitle,
      ...(platform === 'windows' ? { aumid: owned.aumid } : { executablePath: owned.executablePath }),
    };
  }

  private async runNativeSmokeLifecycle(
    platform: Platforms,
    smoke: DesktopSmokeOptions,
    instance: ResolvedDesktopStorybookInstance,
    mode: DesktopSmokeMode,
    input?: 'accessible' | 'physical',
  ): Promise<void> {
    const native = smoke.native!;
    const failures: unknown[] = [];
    try {
      const target = this.workloadTarget(platform);
      let application: NativeDesktopApplicationDescriptor;
      if (native.kind === 'macos') {
        const macApplication = this.ownedMacOSApplication(instance);
        await this.executeAction('bundle', platform, instance);
        await this.executeAction('build', platform, instance);
        application = await this.resolveOwnedMacOSApplication(instance, macApplication);
      } else {
        application = await this.buildOwnedWindowsApplication(platform, native, instance);
      }
      const configuredServer = this.config.getPlatformOptions(platform).server;
      const server = smoke.server ?? configuredServer;
      if (!server) throw new Error('Native smoke requires its owned Storybook channel.');
      const serverUrl = smoke.serverUrl ?? loopbackUrl(instance.storybookPort);
      const index = await this.createStoryManifest(this.config, platform);
      if (!index.entries.length) throw new Error('Native smoke selected no stories.');
      if (native.kind === 'win32') {
        for (const id of native.requiredStoryIds ?? [])
          if (!index.entries.some((entry) => entry.id === id)) throw new Error(`The Win32 catalog is missing required story "${id}".`);
      }
      if (native.kind === 'macos') {
        if (!instance.driverManifestPath) throw new Error('Native macOS smoke requires its Desktop Driver manifest.');
        await this.startMacOSApplicationLease(instance.driverManifestPath);
      }
      if (native.kind !== 'win32' && smoke.metro !== false) {
        const metro = this.services.start('metro', {
          ...this.prepareCommand(smoke.metro ?? defaultMetroCommand(instance), platform, instance),
          listener: { service: 'metro-listener', port: instance.metroPort },
        });
        await this.waitForOwnedService(
          'metro',
          'metro-listener',
          smoke.metroUrl ?? loopbackUrl(instance.metroPort, '/status'),
          metro,
          smoke.startupTimeoutMs,
        );
      }
      const startPhase = async (phase: string) => {
        let running: RunningDesktopCommand | undefined;
        let stopping = false;
        let closing: Promise<void> | undefined;
        const close = () =>
          (closing ??= (async () => {
            stopping = true;
            await running?.stop();
          })());
        await this.services.contribute(
          [
            {
              id: `storybook-${phase}`,
              ownership: 'owned',
              prepare: () => ({
                identity: `storybook-smoke:${instance.id}:${phase}`,
                acquire: async () => {
                  running = this.runner.start({
                    ...this.prepareCommand(server, platform, instance, application),
                    label: `Storybook ${phase}`,
                    category: 'service',
                    context: { service: `storybook-${phase}` },
                    listener: { service: 'storybook-channel-listener', port: instance.storybookPort },
                  });
                  void running.completed.then(
                    (code) => {
                      if (!stopping) this.services.fail(new Error(`Required Storybook ${phase} exited with code ${code}.`));
                    },
                    (error: unknown) => this.services.fail(error instanceof Error ? error : new Error(String(error))),
                  );
                  if (!running.waitForReadiness) throw new Error('Native smoke requires correlated channel readiness.');
                  const listener = await running.waitForReadiness(
                    { tier: 'service-ready', service: 'storybook-channel-listener' },
                    smoke.startupTimeoutMs ?? 120_000,
                    this.services.controller.signal,
                  );
                  await this.waitForUrl(new URL('/index.json', serverUrl).href, running, smoke.startupTimeoutMs, {
                    headers: this.listenerProbeHeaders(running),
                  });
                  await this.confirmListenerProbe(running, 'storybook-channel-listener', listener, smoke.startupTimeoutMs);
                  const ready = await running.waitForReadiness(
                    { tier: 'service-ready', service: 'storybook-channel' },
                    smoke.startupTimeoutMs ?? 120_000,
                    this.services.controller.signal,
                  );
                  if (ready.service !== 'storybook-channel' || ready.descriptor !== undefined)
                    throw new Error('Native smoke received mismatched channel readiness.');
                  assertSameReadinessProducer(listener, ready);
                  return ready;
                },
                dispose: close,
              }),
            },
          ],
          { targetId: target.id, targetInstanceId: target.instanceId },
        );
        return close;
      };
      const traverse = async (work: (traversal: Awaited<ReturnType<typeof connectStoryTraversal>>) => Promise<void>) => {
        const traversal = await this.connectStoryTraversal({
          url: loopbackUrl(instance.driverPort),
          platform,
          targetId: this.targetId(platform),
          fetch: this.fetch,
          signal: this.services.controller.signal,
          input,
        });
        let failure: unknown;
        try {
          await this.services.guard(work(traversal));
        } catch (error) {
          failure = error;
        }
        try {
          await traversal.close();
        } catch (cleanup) {
          if (failure !== undefined) throw new AggregateError([failure, cleanup], 'Smoke traversal and session cleanup failed.');
          throw cleanup;
        }
        if (failure !== undefined) throw failure;
      };
      const stopStories = await startPhase('stories');
      if (native.kind === 'macos') {
        await this.waitForMacOSApplicationLease(instance.driverManifestPath!, {
          timeoutMs: smoke.startupTimeoutMs ?? 120_000,
          signal: this.services.controller.signal,
          createStorage: this.createPrivateStorage,
        });
      }
      await traverse(async (traversal) => {
        if (native.kind === 'win32') {
          await this.operation('Verify Win32 native chrome', () =>
            traversal.assertNativeUi(
              ['sidebar-header', 'sidebar-resize', 'addons-panel-header', 'addons-resize', 'addon-storybook-actions-panel'].map(
                (suffix) => `${native.testIDPrefix}-win32-${suffix}`,
              ),
              30_000,
            ),
          );
        }
        await this.operation('Render stories', (operation) =>
          this.renderEveryStory(
            operation,
            serverUrl,
            smoke.settleMs ?? 0,
            smoke.initialRenderTimeoutMs ?? smoke.startupTimeoutMs,
            traversal.select,
            native.kind === 'win32' ? native.requiredStoryIds : undefined,
            native.kind === 'win32',
          ),
        );
        await traversal.assertRunning();
      });
      if (mode === 'stories-and-tests') {
        if (native.kind === 'windows') {
          await stopStories();
          await startPhase('tests');
          await traverse((traversal) =>
            traversal.select(index.entries[0].id, smoke.initialRenderTimeoutMs ?? smoke.startupTimeoutMs ?? 300_000),
          );
        }
        await this.services.guard(
          this.runSmokeTests({
            config: this.config,
            commandRunner: this.runner,
            errorOutput: this.errorOutput,
            driverUrl: loopbackUrl(instance.driverPort),
            manifest: index,
            platform,
            scope: this.scopeContext(platform),
            targetId: this.targetId(platform),
            report: this.reporter,
            signal: this.services.controller.signal,
            input,
          }),
        );
        await traverse((traversal) => traversal.assertRunning());
      }
    } catch (error) {
      failures.push(error);
    } finally {
      if (this.ownsServices) {
        try {
          await this.services.close();
        } catch (cleanup) {
          failures.push(cleanup);
        }
      }
    }
    if (failures.length === 1) throw failures[0];
    if (failures.length) throw new AggregateError(failures, 'Native smoke execution and cleanup failed.');
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
    let applicationStartAttempted = false;
    const serverUrl = smoke.serverUrl ?? loopbackUrl(instance.storybookPort);
    const metroUrl = smoke.metroUrl ?? loopbackUrl(instance.metroPort, '/status');

    try {
      if (platform === 'macos' && instance.driverManifestPath) await this.startMacOSApplicationLease(instance.driverManifestPath);
      const configuredServer = this.config.getPlatformOptions(platform).server;
      const server = smoke.server === false ? undefined : (smoke.server ?? (configuredServer === false ? undefined : configuredServer));
      const metro = smoke.metro === false ? undefined : (smoke.metro ?? defaultMetroCommand(instance));
      const readiness: Promise<void>[] = [];

      if (server) {
        const runningServer = this.services.start('storybook-channel', {
          ...this.prepareCommand(
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
          listener: { service: 'storybook-channel-listener', port: instance.storybookPort },
        });
        readiness.push(
          (async () => {
            const listener = await this.waitForOwnedService(
              'storybook-channel',
              'storybook-channel-listener',
              new URL('/index.json', serverUrl).href,
              runningServer,
              smoke.startupTimeoutMs,
            );
            if (mode === 'stories-and-tests') {
              const ready = await this.services.readyProcess(
                'storybook-channel',
                { tier: 'service-ready', service: 'storybook-channel' },
                smoke.startupTimeoutMs,
              );
              assertSameReadinessProducer(listener, ready);
            }
            if (mode === 'stories-and-tests')
              await this.waitForUrl(loopbackUrl(instance.driverPort, '/status'), runningServer, smoke.startupTimeoutMs);
          })(),
        );
      } else if (mode === 'stories-and-tests') {
        throw new Error('The stories-and-tests smoke mode requires the Storybook server and embedded Desktop Driver.');
      }
      if (metro) {
        const runningMetro = this.services.start('metro', {
          ...this.prepareCommand(metro, platform, instance),
          listener: { service: 'metro-listener', port: instance.metroPort },
        });
        readiness.push(
          this.waitForOwnedService('metro', 'metro-listener', metroUrl, runningMetro, smoke.startupTimeoutMs).then(() => undefined),
        );
      }

      await this.services.guard(Promise.all(readiness));
      applicationStartAttempted = true;
      await this.executeAction('run', platform, instance);
      if (mode === 'stories-and-tests' && platform === 'macos') {
        if (!instance.driverManifestPath) {
          throw new Error('The macOS authored-test lifecycle did not create a Desktop Driver manifest.');
        }
        await this.waitForMacOSApplicationLease(instance.driverManifestPath, {
          timeoutMs: smoke.startupTimeoutMs ?? 120_000,
          signal: this.services.controller.signal,
          createStorage: this.createPrivateStorage,
        });
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
      if (applicationStartAttempted) {
        try {
          await this.executePlan(smoke.stop!, platform, instance, true);
        } catch (error) {
          failures.push(error);
        }
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
    if (smoke.native) {
      for (const port of [...(smoke.serverUrl ? [storybookPort] : []), ...(smoke.metro !== false && smoke.metroUrl ? [metroPort] : [])]) {
        if (!(await this.isPortAvailable(port))) throw new Error(`Native smoke port ${port} is already in use; no ownership was taken.`);
      }
      if (storybookPort === metroPort) throw new Error('Storybook and Metro must use distinct ports.');
    }
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
    bridgeNonce?: string,
  ): Promise<{ manifest: DesktopStorybookDriverManifest; path: string }> {
    const storyManifest = await this.createStoryManifest(this.config, platform);
    const outputPath = desktopStorybookDriverManifestPath(this.config.projectRoot, platform);
    const renderer = this.renderer(platform);
    const driverManifest = createDesktopStorybookDriverManifest({
      ...(agent ? { agent } : {}),
      bridgeNonce:
        bridgeNonce ??
        (await readReusableBridgeNonce(
          outputPath,
          instance,
          storyManifest.platformManifestDigest,
          renderer,
          nativeDriver,
          this.createPrivateStorage,
        )),
      config: this.config,
      instance,
      nativeDriver,
      platform,
      renderer,
      scope: this.scopeContext(platform),
      storyManifest,
      ...(wdio ? { wdio } : {}),
    });
    const handoff = await writeDesktopStorybookDriverManifest(driverManifest, outputPath, this.createPrivateStorage);
    this.driverHandoffs.set(outputPath, handoff);
    return { manifest: driverManifest, path: outputPath };
  }

  private async startMacOSApplicationLease(manifestPath: string): Promise<void> {
    const handoff = this.driverHandoffs.get(manifestPath);
    if (!handoff) throw new Error('The Storybook macOS lease requires its trusted driver manifest handoff.');
    const target = this.workloadTarget('macos');
    await this.services.contribute(
      [
        this.createMacOSApplicationLeaseResource({
          manifestPath,
          handoff,
          createStorage: this.createPrivateStorage,
          addSecret: (secret) => this.reporter?.addSecret(secret),
          onFailure: (error) => this.services.fail(error),
          onWarning: (message) => this.warn(message),
        }),
      ],
      { targetId: target.id, targetInstanceId: target.instanceId },
    );
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
    requiredStoryIds: readonly string[] = [],
    failFast = false,
  ): Promise<void> {
    const storyIndex = await this.getJson(new URL('/index.json', serverUrl));
    const entries = Object.values((storyIndex.entries ?? {}) as Record<string, { id?: string; type?: string }>).filter(
      (entry) => entry.type === 'story' && entry.id,
    );
    if (entries.length === 0) {
      throw new Error('The Storybook index did not contain any stories.');
    }
    for (const id of requiredStoryIds)
      if (!entries.some((entry) => entry.id === id)) throw new Error(`The Storybook index is missing required story "${id}".`);

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
        this.services.controller.signal.throwIfAborted();
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
        if (failFast || entryIndex === 0 || consecutiveFailures >= 3) {
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

  private async waitForUrl(url: string, process: RunningDesktopCommand, timeoutMs = 120_000, init?: RequestInit): Promise<void> {
    const deadline = Date.now() + timeoutMs;
    let lastError: unknown;

    while (Date.now() < deadline) {
      const state = await Promise.race([
        process.completed.then((exitCode) => ({ exitCode })),
        this.fetchWithTimeout(url, init, Math.min(5000, Math.max(1, deadline - Date.now())))
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

  private listenerProbeHeaders(process: RunningDesktopCommand): Record<string, string> {
    if (!process.listenerProbe) throw new Error('Owned HTTP readiness requires a correlated listener probe.');
    return { 'x-furn-desktop-listener-probe': process.listenerProbe };
  }

  private async confirmListenerProbe(
    process: RunningDesktopCommand,
    service: string,
    listener: { processId: number; incarnation: string },
    timeoutMs = 120_000,
  ): Promise<void> {
    if (!process.waitForListenerProbe) throw new Error('Owned HTTP readiness requires a correlated listener probe.');
    const probed = await process.waitForListenerProbe(service, timeoutMs, this.services.controller.signal);
    assertSameReadinessProducer(listener, probed);
  }

  private async waitForOwnedService(id: string, service: string, url: string, process: RunningDesktopCommand, timeoutMs = 120_000) {
    const headers = this.listenerProbeHeaders(process);
    const listener = await this.services.readyProcess(id, { tier: 'service-ready', service }, timeoutMs);
    await this.services.ready(
      id,
      url,
      timeoutMs,
      (input, init) => this.fetch(input, { ...init, headers }),
      () => this.confirmListenerProbe(process, service, listener, timeoutMs),
    );
    return listener;
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
    ownedApplication?: NativeDesktopApplicationDescriptor,
  ): PreparedDesktopCommand {
    return {
      ...command,
      args: command.args ?? [],
      cwd: command.cwd ? resolveFromProject(this.config.projectRoot, command.cwd) : this.config.projectRoot,
      env: {
        ...command.env,
        STORYBOOK_OWNED_APPLICATION: ownedApplication ? JSON.stringify(ownedApplication) : '',
        [FURN_STORYBOOK_PLATFORM]: platform,
        ...(platform === 'macos' ? { RCT_NEW_ARCH_ENABLED: this.paper ? '0' : '1' } : {}),
        [STORYBOOK_VERBOSE]: this.verbose ? '1' : '0',
        ...(instance
          ? {
              [FURN_STORYBOOK_INSTANCE_ID]: instance.id,
              [FURN_STORYBOOK_BUNDLE_IDENTIFIER]: instance.bundleIdentifier,
              STORYBOOK_WS_PORT: String(instance.storybookPort),
              STORYBOOK_DRIVER_PORT: String(instance.driverPort),
              ...(instance.driverManifestPath
                ? {
                    STORYBOOK_DRIVER_MANIFEST: instance.driverManifestPath,
                    STORYBOOK_DRIVER_HANDOFF: this.driverHandoffs.get(instance.driverManifestPath) ?? '',
                    STORYBOOK_GENERATED_CONTRACT: path.join(
                      this.config.resolvePackage('@fluentui-react-native/storybook-desktop').root,
                      'config/generated-contract.cjs',
                    ),
                  }
                : {}),
              RCT_METRO_PORT: String(instance.metroPort),
              ...(instance.macosXcconfigPath ? { XCODE_XCCONFIG_FILE: instance.macosXcconfigPath } : {}),
            }
          : {}),
      },
    };
  }
}

function assertSameReadinessProducer(
  listener: { processId: number; incarnation: string },
  service: { processId: number; incarnation: string },
): void {
  if (listener.processId !== service.processId || listener.incarnation !== service.incarnation) {
    throw new Error('The Storybook channel listener and driver were published by different processes.');
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

function runtimeModuleDigest(handoff: string | undefined): string | undefined {
  if (!handoff) return undefined;
  const digest: unknown = (JSON.parse(handoff) as { runtimeModuleDigest?: unknown }).runtimeModuleDigest;
  return typeof digest === 'string' ? digest : undefined;
}

async function readReusableBridgeNonce(
  manifestPath: string,
  instance: DesktopStorybookInstance,
  platformManifestDigest: string,
  renderer: 'fabric' | 'paper',
  nativeDriver: NativeDriverArtifact,
  createStorage: CreateStorybookPrivateStorage,
): Promise<string | undefined> {
  if (!fs.existsSync(manifestPath)) {
    return undefined;
  }
  try {
    const current = await readDriverManifest(manifestPath, undefined, createStorage, nativeDriver);
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
