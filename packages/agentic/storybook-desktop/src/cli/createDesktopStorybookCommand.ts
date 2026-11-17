import { Command, InvalidArgumentError, Option } from 'commander';
import { randomUUID } from 'node:crypto';
import path from 'node:path';
import {
  acquireHostedDesktopDriver,
  createDesktopRunContext,
  DesktopStopRequested,
  formatDesktopHostReady,
} from '@fluentui-react-native/desktop-test';
import type { DesktopRunContext, DesktopSupervisor } from '@fluentui-react-native/desktop-test';
import {
  desktopEventLevels,
  desktopReporterModes,
  formatDesktopReporterError,
  resolveDesktopEventLevel,
  resolveDesktopReporterMode,
  resolveDesktopReporterModeFromArgv,
  tolerateClosedDesktopStdout,
} from '@fluentui-react-native/desktop-driver/cli/reporter';
import type { DesktopEventLevel } from '@fluentui-react-native/desktop-test/reporting';
import { desktopSmokeModes, type DesktopSmokeMode } from '../config/commands.js';
import type { DesktopStorybookConfig } from '../config/makeDesktopStorybookConfig.js';
import type { Platforms } from '../config/platforms.js';
import type {
  DesktopStorybookBuildDriverOptions,
  DesktopStorybookCliOptions,
  DesktopStorybookPrepOptions,
  DesktopStorybookServerOptions,
  DesktopStorybookTestOptions,
} from './DesktopStorybookCli.js';
import { DesktopStorybookCli } from './DesktopStorybookCli.js';
import { resolveCommandInputLane, readDriverInstanceInput } from './inputLane.js';
import { loadDesktopStorybookConfig } from './loadConfig.js';

type PlatformFlags = {
  macos?: boolean;
  paper?: boolean;
  win32?: boolean;
  windows?: boolean;
};

type ServerFlags = PlatformFlags & DesktopStorybookServerOptions;
type DriverFlags = ServerFlags & {
  agent?: boolean;
  descriptor?: string;
  supervisorDescriptor?: string;
  root?: string;
  runnerDescriptor?: string;
  allowRunnerPreempt?: boolean;
  input?: 'accessible' | 'physical';
};
type ManifestFlags = PlatformFlags & { out?: string };
type SmokeFlags = PlatformFlags & { mode: DesktopSmokeMode; input?: 'accessible' | 'physical' };
type BuildDriverFlags = PlatformFlags & DesktopStorybookBuildDriverOptions;
type PrepFlags = PlatformFlags & { driver: DesktopStorybookPrepOptions['driver'] };
type GetApi = (flags: PlatformFlags) => Promise<DesktopStorybookCli>;
type ExecuteAction = (work: () => Promise<void>) => Promise<void>;

export type CreateDesktopStorybookCommandOptions = DesktopStorybookCliOptions & {
  config?: DesktopStorybookConfig;
  cwd?: string;
  /** @internal Runs the selected action in the neutral desktop run scope. */
  executeAction?: ExecuteAction;
  /** @internal The neutral owner shared by long-lived driver resources. */
  supervisor?: DesktopSupervisor;
};

export function createDesktopStorybookCommand(options: CreateDesktopStorybookCommandOptions = {}): Command {
  const program = new Command()
    .name('storybook-desktop')
    .description('Serve, prepare, bundle, build, run, and smoke test a React Native desktop Storybook app.')
    .option('-c, --config <path>', 'path to desktop.config.mts (legacy storybook.config files are also accepted)')
    .addOption(new Option('--reporter <mode>', 'output format').choices([...desktopReporterModes]))
    .option('--json', 'alias for --reporter json')
    .addOption(new Option('--events <level>', 'NDJSON event detail').choices([...desktopEventLevels]))
    .option('-v, --verbose', 'stream command output live, with start markers and log paths, instead of only the outcome of each step');
  let apiPromise: Promise<DesktopStorybookCli> | undefined;

  const getApi = (flags: PlatformFlags) =>
    (apiPromise ??= Promise.resolve()
      .then(() => options.config ?? loadDesktopStorybookConfig(program.opts<{ config?: string }>().config, options.cwd))
      .catch((error: unknown) => {
        throw Object.assign(error instanceof Error ? error : new Error(String(error)), { code: 'config' });
      })
      .then((config) => {
        const reporterFlags = program.opts<{ reporter?: string; json?: boolean; events?: DesktopEventLevel }>();
        const reporterMode = resolveDesktopReporterMode({
          flag: reporterFlags.json ? 'json' : reporterFlags.reporter,
          environment: process.env.DESKTOP_REPORTER,
          configured: config.desktop?.reporting?.reporter ?? config.desktop?.reporting?.console,
        });
        const requestedEventLevel = reporterFlags.events ?? (process.env.DESKTOP_EVENTS || undefined) ?? config.desktop?.reporting?.events;
        if (requestedEventLevel && reporterMode !== 'ndjson')
          throw Object.assign(new TypeError('--events requires --reporter ndjson.'), { code: 'config' });
        if (requestedEventLevel)
          resolveDesktopEventLevel({
            flag: reporterFlags.events,
            environment: process.env.DESKTOP_EVENTS,
            configured: config.desktop?.reporting?.events,
          });
        options.reporterMode = reporterMode;
        return new DesktopStorybookCli(config, {
          buildNativeDriver: options.buildNativeDriver,
          runner: options.runner,
          createPrivateStorage: options.createPrivateStorage,
          createStoryManifest: options.createStoryManifest,
          fetch: options.fetch,
          output: options.output,
          errorOutput: options.errorOutput,
          paper: flags.paper ?? options.paper,
          verbose: program.opts<{ verbose?: boolean }>().verbose ?? options.verbose,
          isPortAvailable: options.isPortAvailable,
          runSmokeTests: options.runSmokeTests,
          connectStoryTraversal: options.connectStoryTraversal,
          resolveNativeDriver: options.resolveNativeDriver,
          createMacOSApplicationLeaseResource: options.createMacOSApplicationLeaseResource,
          waitForMacOSApplicationLease: options.waitForMacOSApplicationLease,
          reporter: options.reporter,
          reporterMode,
          services: options.services,
          onReady: options.onReady,
        });
      }));

  const executeAction: ExecuteAction = (work) => (options.executeAction ? options.executeAction(work) : work());
  addServerCommand(program, getApi, executeAction);
  addBuildDriverCommand(program, getApi);
  addDriverCommand(program, getApi, executeAction, options);
  addManifestCommand(program, getApi);
  addInstanceCommand(program, getApi);
  addTestCommand(program, getApi, executeAction);
  addPrepCommand(program, getApi, executeAction);
  addActionCommand(program, 'bundle', 'Generate stories and create the platform JavaScript bundle.', getApi, executeAction);
  addActionCommand(program, 'run', 'Build and launch the native Storybook app.', getApi, executeAction);
  addActionCommand(program, 'build', 'Build the native Storybook app without launching it.', getApi, executeAction);
  addSmokeCommand(program, getApi, executeAction);

  return program;
}

function addTestCommand(program: Command, getApi: GetApi, executeAction: ExecuteAction): void {
  const command = program
    .command('test')
    .description('Run executable wdio story callbacks against the running Storybook app.')
    .option('--list', 'list selected executable stories without connecting')
    .option('--story <glob>', 'filter Storybook IDs')
    .option('--test <glob>', 'filter named wdio tests; single callbacks use the name default')
    .option('--tag <tag>', 'filter story tags')
    .option('--url <url>', 'Desktop Driver URL (requires --target)')
    .option('--target <id>', 'registered target ID (requires --url)')
    .option('--attach-agent', 'reuse the protected Storybook driver through its private runner descriptor')
    .option('--descriptor <name>', 'private runner descriptor record (requires --attach-agent)')
    .option('--root <path>', 'private runner storage root (requires --attach-agent)')
    .option('--preempt', 'request operator-authorized runner preemption (requires --attach-agent)')
    .addOption(new Option('--input <mode>', 'select accessible or physical input tests').choices(['accessible', 'physical']))
    .option('--timeout-ms <milliseconds>', 'timeout per executable test', Number)
    .addOption(new Option('--test-reporter <reporter>', 'Node test reporter').choices(['spec', 'tap', 'dot']))
    .addOption(new Option('--click-mode <mode>', 'native click semantics').choices(['auto', 'physical', 'accessibility']));
  addPlatformOptions(command);
  command.action(async (flags: PlatformFlags & DesktopStorybookTestOptions) => {
    if (flags.input !== undefined && flags.clickMode !== undefined) {
      throw new InvalidArgumentError('--input cannot be combined with --click-mode.');
    }
    const api = await getApi(flags);
    await executeAction(() =>
      api.test(resolvePlatform(flags, api), {
        clickMode: flags.clickMode,
        input: flags.input,
        list: flags.list,
        testReporter: flags.testReporter,
        story: flags.story,
        tag: flags.tag,
        test: flags.test,
        target: flags.target,
        attachAgent: flags.attachAgent,
        descriptor: flags.descriptor,
        root: flags.root,
        preempt: flags.preempt,
        timeoutMs: flags.timeoutMs,
        url: flags.url,
      }),
    );
  });
}

function addPrepCommand(program: Command, getApi: GetApi, executeAction: ExecuteAction): void {
  const command = program
    .command('prep')
    .description('Prepare the native helper, dependencies, and generated projects.')
    .option('--no-driver', 'prepare only the native app project');
  addPlatformOptions(command);
  command.action(async (flags: PrepFlags) => {
    const api = await getApi(flags);
    await executeAction(() => api.prep(resolvePlatform(flags, api), { driver: flags.driver }));
  });
}

function addBuildDriverCommand(program: Command, getApi: GetApi): void {
  const command = program.command('build-driver').description('Build the native Desktop Driver helper without preparing the app.');
  command.option('--force', 'publish a new immutable helper selection');
  addPlatformOptions(command);
  command.action(async (flags: BuildDriverFlags) => {
    const api = await getApi(flags);
    await api.buildDriver(resolvePlatform(flags, api), { force: flags.force });
  });
}

function addDriverCommand(
  program: Command,
  getApi: GetApi,
  executeAction: ExecuteAction,
  options: CreateDesktopStorybookCommandOptions,
): void {
  const command = program
    .command('driver')
    .description('Start the Storybook channel, MCP, and embedded Desktop Driver servers.')
    .option('--host <host>', 'server host; defaults to STORYBOOK_WS_HOST or 127.0.0.1')
    .option('--port <port>', 'Storybook channel port; defaults to the enlistment-specific port', parsePort)
    .option('--agent', 'require a grant on every driver route and publish one agent connection descriptor')
    .option('--descriptor <name>', 'agent connection descriptor record name (default agent-connection.json)')
    .option('--supervisor-descriptor <name>', 'workload supervisor descriptor record (default supervisor-connection.json)')
    .option('--root <path>', 'private storage root for the agent descriptor; defaults to the platform location')
    .option('--runner-descriptor <name>', 'attach-only runner descriptor record (default runner-connection.json)')
    .option('--allow-runner-preempt', 'authorize explicit runner preemption of an existing controller');
  command.addOption(new Option('--input <mode>', 'default input lane for Storybook tests').choices(['accessible', 'physical']));
  addPlatformOptions(command);
  command.action(async (flags: DriverFlags) => {
    if (
      !flags.agent &&
      (flags.descriptor !== undefined ||
        flags.supervisorDescriptor !== undefined ||
        flags.root !== undefined ||
        flags.runnerDescriptor ||
        flags.allowRunnerPreempt)
    ) {
      throw new InvalidArgumentError('Descriptor and runner publication options require --agent.');
    }
    const api = await getApi(flags);
    const platform = resolvePlatform(flags, api);
    const driverOptions = {
      host: flags.host,
      port: flags.port,
      input: flags.input,
      ...(flags.agent
        ? {
            agent: {
              ...(flags.descriptor === undefined ? {} : { descriptor: flags.descriptor }),
              ...(flags.root === undefined ? {} : { root: flags.root }),
              ...(flags.runnerDescriptor === undefined && !flags.allowRunnerPreempt
                ? {}
                : {
                    runner: {
                      ...(flags.runnerDescriptor === undefined ? {} : { descriptor: flags.runnerDescriptor }),
                      ...(flags.allowRunnerPreempt ? { allowPreempt: true } : {}),
                    },
                  }),
            },
          }
        : {}),
    };
    await executeAction(async () => {
      const owner = options.supervisor;
      if (!owner) {
        if (flags.agent) throw new Error('A protected Storybook driver requires a neutral supervisor.');
        return api.driver(platform, driverOptions);
      }
      await owner.startConfiguredServices();
      const config = api.managementConfig(platform);
      const readiness = await acquireHostedDesktopDriver({
        supervisor: owner,
        request: {
          config,
          target: owner.target,
          action: 'serve',
          ...(flags.input ? { input: flags.input } : {}),
          ...(driverOptions.agent ? { agent: driverOptions.agent } : {}),
        },
        driver: { kind: 'hosted', acquire: () => api.startDriver(platform, driverOptions) },
        supervisorDescriptor: flags.supervisorDescriptor,
        managedWorkload: async ({ supervisor, connection, input, storyId, addSecret }) => {
          const worker = new DesktopStorybookCli(api.config, {
            paper: api.paper,
            reporter: supervisor.reporter,
            runner: supervisor.runner,
            services: supervisor.services,
          });
          await worker.testManaged(platform, { connection, input, storyId, addSecret });
        },
      });
      (options.output ?? process.stdout).write(formatDesktopHostReady(options.reporterMode ?? 'plain', readiness));
      options.onReady?.();
      await owner.services.waitForStop();
    });
  });
}

function addManifestCommand(program: Command, getApi: GetApi): void {
  const command = program.command('manifest').description('Generate the platform Story Manifest.').option('--out <path>', 'output path');
  addPlatformOptions(command);
  command.action(async (flags: ManifestFlags) => {
    const api = await getApi(flags);
    await api.manifest(resolvePlatform(flags, api), flags.out);
  });
}

function addInstanceCommand(program: Command, getApi: GetApi): void {
  const command = program.command('instance').description('Print the platform instance identity as JSON.');
  addPlatformOptions(command);
  command.action(async (flags: PlatformFlags) => {
    const api = await getApi(flags);
    api.printInstance(resolvePlatform(flags, api));
  });
}

export async function runDesktopStorybookCli(argv: readonly string[] = process.argv): Promise<void> {
  tolerateClosedDesktopStdout();
  const options: CreateDesktopStorybookCommandOptions = {};
  let ready = false;
  options.onReady = () => {
    ready = true;
  };
  const program = createDesktopStorybookCommand(options);
  let execution: DesktopRunContext | undefined;
  options.executeAction = (work) => (execution ? execution.run(undefined, () => work()) : work());
  let actionName = '';
  let longLived = false;
  let failure: unknown;
  let parseDiagnostics = '';
  const normalized = normalizeLegacyTestReporter(argv);
  let reporterResolutionError: unknown;
  try {
    options.reporterMode = resolveDesktopReporterModeFromArgv(normalized.argv, { environment: process.env.DESKTOP_REPORTER });
  } catch (error) {
    reporterResolutionError = error;
    try {
      options.reporterMode = resolveDesktopReporterMode({ environment: process.env.DESKTOP_REPORTER });
    } catch {
      options.reporterMode = 'plain';
    }
  }
  configureCommandOutput(program, (message) => {
    parseDiagnostics += message;
  });
  program.hook('preAction', async (_program, action) => {
    if (['manifest', 'instance', 'build-driver'].includes(action.name()) || action.opts<{ list?: boolean }>().list) return;
    try {
      options.config = await loadDesktopStorybookConfig(program.opts<{ config?: string }>().config);
    } catch (error) {
      throw Object.assign(error instanceof Error ? error : new Error(String(error)), { code: 'config' });
    }
    const reporterFlags = program.opts<{ reporter?: string; json?: boolean; events?: DesktopEventLevel }>();
    const reporterMode = resolveDesktopReporterMode({
      flag: reporterFlags.json ? 'json' : reporterFlags.reporter,
      environment: process.env.DESKTOP_REPORTER,
      configured: options.config.desktop?.reporting?.reporter ?? options.config.desktop?.reporting?.console,
    });
    const requestedEventLevel =
      reporterFlags.events ?? (process.env.DESKTOP_EVENTS || undefined) ?? options.config.desktop?.reporting?.events;
    if (requestedEventLevel && reporterMode !== 'ndjson')
      throw Object.assign(new TypeError('--events requires --reporter ndjson.'), { code: 'config' });
    const eventLevel = resolveDesktopEventLevel({
      flag: reporterFlags.events,
      environment: process.env.DESKTOP_EVENTS,
      configured: options.config.desktop?.reporting?.events,
    });
    options.reporterMode = reporterMode;
    const actionOptions = action.opts<PlatformFlags & { input?: string; mode?: string; target?: string; url?: string }>();
    const platform = selectedPlatform(actionOptions) ?? options.config.platform;
    const { projectRoot } = options.config;
    const lane =
      action.name() === 'test' || action.name() === 'smoke'
        ? resolveCommandInputLane({
            command: action.name() as 'test' | 'smoke',
            runsTests: action.name() === 'test' || actionOptions.mode === 'stories-and-tests',
            flag: actionOptions.input,
            environment: process.env.DESKTOP_INPUT,
            driverInput:
              action.name() === 'test' && platform && !actionOptions.url && !actionOptions.target
                ? () => readDriverInstanceInput(projectRoot, platform)
                : undefined,
          })
        : undefined;
    actionName = action.name();
    longLived = ['driver', 'server'].includes(actionName);
    if (!platform) {
      throw Object.assign(new Error('Select --windows, --macos, or --win32, or set FURN_STORYBOOK_PLATFORM.'), { code: 'usage' });
    }
    const api = new DesktopStorybookCli(options.config, {
      paper: actionOptions.paper ?? options.paper,
      reporterMode,
    });
    execution = await createDesktopRunContext({
      target: api.workloadTarget(platform),
      reporting: {
        ...options.config.desktop?.reporting,
        artifactsRoot: options.config.desktop?.reporting.artifactsRoot ?? path.join(options.config.projectRoot, 'artifacts', 'desktop'),
        kind: ['test', 'smoke'].includes(action.name()) ? 'tests' : 'lifecycle',
        ...(lane ? { lane } : {}),
        reporterMode,
        eventLevel,
        // A long-lived command's readiness record is its only output; before readiness, a failure reports its summary.
        suppressFinalOutput: longLived ? () => ready : false,
        verbose: program.opts<{ verbose?: boolean }>().verbose,
      },
      independent: false,
      claim: ['driver', 'smoke'].includes(action.name()),
      interrupts: true,
      strictCleanup: false,
    });
    options.reporter = execution.reporter;
    options.runner = execution.supervisor.runner;
    options.services = execution.supervisor.services;
    options.supervisor = execution.supervisor;
    if (normalized.deprecated) {
      if (reporterMode === 'json' || reporterMode === 'ndjson') {
        execution.reporter.emit({
          kind: 'diagnostic',
          payload: { level: 'warning', message: 'test --reporter is deprecated; use --test-reporter instead.' },
        });
      } else {
        process.stderr.write('Warning: test --reporter is deprecated; use --test-reporter instead.\n');
      }
    }
  });
  try {
    await program.parseAsync([...normalized.argv]);
  } catch (error) {
    if (error && typeof error === 'object' && 'exitCode' in error && error.exitCode === 0) return;
    if (!(error instanceof DesktopStopRequested)) failure = reporterResolutionError ?? error;
    else if (execution && !longLived)
      // An interrupted one-shot command did not finish: leave its scope open so the run reports incomplete, not passed.
      execution.reporter.emit(
        { kind: 'scope-start', payload: { label: `${actionName} (interrupted)`, category: 'phase' } },
        `interrupted-${randomUUID()}`,
      );
  } finally {
    if (execution) process.exitCode = await execution.finish(failure);
  }
  if (failure !== undefined) {
    if (options.reporterMode === 'json' || options.reporterMode === 'ndjson') {
      if (!execution) {
        process.stdout.write(formatDesktopReporterError(options.reporterMode, failure));
        process.exitCode = 1;
      }
      return;
    }
    if (!execution && parseDiagnostics) {
      process.stderr.write(parseDiagnostics);
      process.exitCode = 1;
      return;
    }
    throw failure;
  }
}

function configureCommandOutput(command: Command, writeErr: (message: string) => void): void {
  command.exitOverride().configureOutput({
    writeErr,
    writeOut: (message) => process.stdout.write(message),
  });
  for (const child of command.commands) {
    configureCommandOutput(child, writeErr);
  }
}

export function normalizeLegacyTestReporter(argv: readonly string[]): { argv: string[]; deprecated: boolean } {
  const result = [...argv];
  const testIndex = result.indexOf('test');
  if (testIndex < 0) return { argv: result, deprecated: false };
  let deprecated = false;
  for (let index = testIndex + 1; index < result.length; index++) {
    const argument = result[index];
    if (argument === '--reporter' && ['spec', 'tap', 'dot'].includes(result[index + 1] ?? '')) {
      result[index] = '--test-reporter';
      deprecated = true;
      index++;
    } else if (argument.startsWith('--reporter=') && ['spec', 'tap', 'dot'].includes(argument.slice('--reporter='.length))) {
      result[index] = argument.replace('--reporter=', '--test-reporter=');
      deprecated = true;
    }
  }
  return { argv: result, deprecated };
}

function addActionCommand(
  program: Command,
  action: 'bundle' | 'run' | 'build',
  description: string,
  getApi: GetApi,
  executeAction: ExecuteAction,
): void {
  const command = program.command(action).description(description);
  addPlatformOptions(command);
  command.action(async (flags: PlatformFlags) => {
    const api = await getApi(flags);
    const platform = resolvePlatform(flags, api);
    await executeAction(() => api[action](platform));
  });
}

function addSmokeCommand(program: Command, getApi: GetApi, executeAction: ExecuteAction): void {
  const command = program
    .command('smoke')
    .description('Launch the app, traverse every story, optionally run authored tests, and shut the app down.')
    .addOption(
      new Option('--mode <mode>', 'coverage mode: traverse stories only, or traverse stories and run authored tests')
        .choices([...desktopSmokeModes])
        .default('stories'),
    );
  command.addOption(new Option('--input <mode>', 'select accessible or physical input tests').choices(['accessible', 'physical']));
  addPlatformOptions(command);
  command.action(async (flags: SmokeFlags) => {
    if (flags.input !== undefined && flags.mode !== 'stories-and-tests') {
      throw new InvalidArgumentError('--input requires --mode stories-and-tests.');
    }
    const api = await getApi(flags);
    await executeAction(() => api.smoke(resolvePlatform(flags, api), { mode: flags.mode, input: flags.input }));
  });
}

function addServerCommand(program: Command, getApi: GetApi, executeAction: ExecuteAction): void {
  const command = program
    .command('server')
    .description('Start the Storybook channel and MCP server.')
    .option('--host <host>', 'server host; defaults to STORYBOOK_WS_HOST or 127.0.0.1')
    .option('--port <port>', 'server port; defaults to STORYBOOK_WS_PORT or 7007', parsePort);
  addPlatformOptions(command);
  command.action(async (flags: ServerFlags) => {
    const api = await getApi(flags);
    await executeAction(() =>
      api.server(resolvePlatform(flags, api), {
        host: flags.host,
        port: flags.port,
      }),
    );
  });
}

function addPlatformOptions(command: Command): void {
  command
    .addOption(new Option('--windows', 'target React Native Windows').conflicts(['macos', 'win32', 'paper']))
    .addOption(new Option('--macos', 'target React Native macOS').conflicts(['windows', 'win32']))
    .addOption(new Option('--win32', 'target React Native Win32').conflicts(['windows', 'macos', 'paper']))
    .addOption(new Option('--paper', 'use the macOS Paper renderer instead of Fabric').conflicts(['windows', 'win32']));
}

function selectedPlatform(flags: PlatformFlags): Platforms | undefined {
  if (flags.windows) {
    return 'windows';
  }
  if (flags.macos) {
    return 'macos';
  }
  if (flags.win32) {
    return 'win32';
  }
  return undefined;
}

function resolvePlatform(flags: PlatformFlags, api: DesktopStorybookCli): Platforms {
  const platform = selectedPlatform(flags) ?? api.config.platform;
  if (!platform) {
    throw Object.assign(new Error('Select --windows, --macos, or --win32, or set FURN_STORYBOOK_PLATFORM.'), { code: 'usage' });
  }
  if (api.paper && platform !== 'macos') {
    throw Object.assign(new Error('--paper is only supported on macOS. Select --macos --paper.'), { code: 'usage' });
  }
  return platform;
}

function parsePort(value: string): number {
  const port = Number(value);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new InvalidArgumentError(`Server port must be an integer between 1 and 65535. Received "${value}".`);
  }
  return port;
}
