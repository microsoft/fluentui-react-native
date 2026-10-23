import { Command, Option } from 'commander';
import path from 'node:path';
import { claimDesktopWorkload, DesktopServiceScope, DesktopStopRequested } from '@fluentui-react-native/desktop-test';
import { NodeDesktopCommandRunner } from '@fluentui-react-native/desktop-test/commands';
import { createDesktopReportSession } from '@fluentui-react-native/desktop-test/reporting';
import type { DesktopReportSession } from '@fluentui-react-native/desktop-test/reporting';

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
import { loadDesktopStorybookConfig } from './loadConfig.js';

type PlatformFlags = {
  macos?: boolean;
  paper?: boolean;
  win32?: boolean;
  windows?: boolean;
};

type ServerFlags = PlatformFlags & DesktopStorybookServerOptions;
type ManifestFlags = PlatformFlags & { out?: string };
type SmokeFlags = PlatformFlags & { mode: DesktopSmokeMode };
type BuildDriverFlags = PlatformFlags & DesktopStorybookBuildDriverOptions;
type PrepFlags = PlatformFlags & { driver: DesktopStorybookPrepOptions['driver'] };
type GetApi = (flags: PlatformFlags) => Promise<DesktopStorybookCli>;

export type CreateDesktopStorybookCommandOptions = DesktopStorybookCliOptions & {
  config?: DesktopStorybookConfig;
  cwd?: string;
};

export function createDesktopStorybookCommand(options: CreateDesktopStorybookCommandOptions = {}): Command {
  const program = new Command()
    .name('storybook-desktop')
    .description('Serve, prepare, bundle, build, run, and smoke test a React Native desktop Storybook app.')
    .option('-c, --config <path>', 'path to desktop.config.mts (legacy storybook.config files are also accepted)')
    .option('-v, --verbose', 'stream informational output as well as live errors and test progress');
  let apiPromise: Promise<DesktopStorybookCli> | undefined;

  const getApi = (flags: PlatformFlags) =>
    (apiPromise ??= Promise.resolve(
      options.config ?? loadDesktopStorybookConfig(program.opts<{ config?: string }>().config, options.cwd),
    ).then(
      (config) =>
        new DesktopStorybookCli(config, {
          buildNativeDriver: options.buildNativeDriver,
          runner: options.runner,
          createStoryManifest: options.createStoryManifest,
          fetch: options.fetch,
          output: options.output,
          errorOutput: options.errorOutput,
          paper: flags.paper ?? options.paper,
          verbose: program.opts<{ verbose?: boolean }>().verbose ?? options.verbose,
          isPortAvailable: options.isPortAvailable,
          runSmokeTests: options.runSmokeTests,
          resolveNativeDriver: options.resolveNativeDriver,
          writeMacOSApplicationLease: options.writeMacOSApplicationLease,
          reporter: options.reporter,
          services: options.services,
        }),
    ));

  addServerCommand(program, getApi);
  addBuildDriverCommand(program, getApi);
  addDriverCommand(program, getApi);
  addManifestCommand(program, getApi);
  addInstanceCommand(program, getApi);
  addTestCommand(program, getApi);
  addPrepCommand(program, getApi);
  addActionCommand(program, 'bundle', 'Generate stories and create the platform JavaScript bundle.', getApi);
  addActionCommand(program, 'run', 'Build and launch the native Storybook app.', getApi);
  addActionCommand(program, 'build', 'Build the native Storybook app without launching it.', getApi);
  addSmokeCommand(program, getApi);

  return program;
}

function addTestCommand(program: Command, getApi: GetApi): void {
  const command = program
    .command('test')
    .description('Run executable wdio story callbacks against the running Storybook app.')
    .option('--list', 'list selected executable stories without connecting')
    .option('--story <glob>', 'filter Storybook IDs')
    .option('--test <glob>', 'filter named wdio tests; single callbacks use the name default')
    .option('--tag <tag>', 'filter story tags')
    .option('--url <url>', 'Desktop Driver URL (requires --target)')
    .option('--target <id>', 'registered target ID (requires --url)')
    .option('--timeout-ms <milliseconds>', 'timeout per executable test', Number)
    .addOption(new Option('--reporter <reporter>', 'Node test reporter').choices(['spec', 'tap', 'dot']))
    .addOption(new Option('--click-mode <mode>', 'native click semantics').choices(['auto', 'physical', 'accessibility']));
  addPlatformOptions(command);
  command.action(async (flags: PlatformFlags & DesktopStorybookTestOptions) => {
    const api = await getApi(flags);
    await api.test(resolvePlatform(flags, api), {
      clickMode: flags.clickMode,
      list: flags.list,
      reporter: flags.reporter,
      story: flags.story,
      tag: flags.tag,
      test: flags.test,
      target: flags.target,
      timeoutMs: flags.timeoutMs,
      url: flags.url,
    });
  });
}

function addPrepCommand(program: Command, getApi: GetApi): void {
  const command = program
    .command('prep')
    .description('Prepare the native helper, dependencies, and generated projects.')
    .option('--no-driver', 'prepare only the native app project');
  addPlatformOptions(command);
  command.action(async (flags: PrepFlags) => {
    const api = await getApi(flags);
    await api.prep(resolvePlatform(flags, api), { driver: flags.driver });
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

function addDriverCommand(program: Command, getApi: GetApi): void {
  const command = program
    .command('driver')
    .description('Start the Storybook channel, MCP, and embedded Desktop Driver servers.')
    .option('--host <host>', 'server host; defaults to STORYBOOK_WS_HOST or 127.0.0.1')
    .option('--port <port>', 'Storybook channel port; defaults to the enlistment-specific port', parsePort);
  addPlatformOptions(command);
  command.action(async (flags: ServerFlags) => {
    const api = await getApi(flags);
    await api.driver(resolvePlatform(flags, api), { host: flags.host, port: flags.port });
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
  const options: CreateDesktopStorybookCommandOptions = {};
  const program = createDesktopStorybookCommand(options);
  let session: DesktopReportSession | undefined;
  let runner: NodeDesktopCommandRunner | undefined;
  let releaseClaim: (() => void) | undefined;
  let failure: unknown;
  const interrupt = () => options.services?.fail(new Error('Storybook run interrupted.'));
  program.hook('preAction', async (_program, action) => {
    if (['manifest', 'instance'].includes(action.name()) || action.opts<{ list?: boolean }>().list) return;
    options.config = await loadDesktopStorybookConfig(program.opts<{ config?: string }>().config);
    session = await createDesktopReportSession({
      ...options.config.desktop?.reporting,
      artifactsRoot: options.config.desktop?.reporting.artifactsRoot ?? path.join(options.config.projectRoot, 'artifacts', 'desktop'),
      kind: ['test', 'smoke'].includes(action.name()) ? 'tests' : 'lifecycle',
      verbose: program.opts<{ verbose?: boolean }>().verbose,
      onFatal: (error) => options.services?.fail(error),
    });
    if (!session.delegated && ['driver', 'smoke'].includes(action.name())) releaseClaim = claimDesktopWorkload(session.reporter.runId);
    options.reporter = session.reporter;
    runner = new NodeDesktopCommandRunner({ reporter: session.reporter, environment: session.environment });
    options.runner = runner;
    options.services = new DesktopServiceScope(runner, session.reporter);
    session.onStop?.(() => options.services!.requestStop());
    process.once('SIGINT', interrupt);
    process.once('SIGTERM', interrupt);
  });
  try {
    await program.parseAsync([...argv]);
  } catch (error) {
    if (!(error instanceof DesktopStopRequested)) failure = error;
  } finally {
    process.off('SIGINT', interrupt);
    process.off('SIGTERM', interrupt);
    try {
      await options.services?.close();
      await runner?.close();
    } catch (error) {
      options.reporter?.fail(error, 'cleanup');
      failure = failure === undefined ? error : new AggregateError([failure, error], 'Storybook execution and cleanup failed.');
    }
    try {
      releaseClaim?.();
    } catch (error) {
      options.reporter?.fail(error, 'cleanup');
      failure ??= error;
    }
    if (session) process.exitCode = await session.close(failure);
  }
  if (failure !== undefined) throw failure;
}

function addActionCommand(program: Command, action: 'bundle' | 'run' | 'build', description: string, getApi: GetApi): void {
  const command = program.command(action).description(description);
  addPlatformOptions(command);
  command.action(async (flags: PlatformFlags) => {
    const api = await getApi(flags);
    const platform = resolvePlatform(flags, api);
    await api[action](platform);
  });
}

function addSmokeCommand(program: Command, getApi: GetApi): void {
  const command = program
    .command('smoke')
    .description('Launch the app, traverse every story, optionally run authored tests, and shut the app down.')
    .addOption(
      new Option('--mode <mode>', 'coverage mode: traverse stories only, or traverse stories and run authored tests')
        .choices([...desktopSmokeModes])
        .default('stories'),
    );
  addPlatformOptions(command);
  command.action(async (flags: SmokeFlags) => {
    const api = await getApi(flags);
    await api.smoke(resolvePlatform(flags, api), { mode: flags.mode });
  });
}

function addServerCommand(program: Command, getApi: GetApi): void {
  const command = program
    .command('server')
    .description('Start the Storybook channel and MCP server.')
    .option('--host <host>', 'server host; defaults to STORYBOOK_WS_HOST or 127.0.0.1')
    .option('--port <port>', 'server port; defaults to STORYBOOK_WS_PORT or 7007', parsePort);
  addPlatformOptions(command);
  command.action(async (flags: ServerFlags) => {
    const api = await getApi(flags);
    await api.server(resolvePlatform(flags, api), {
      host: flags.host,
      port: flags.port,
    });
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
    throw new Error('Select --windows, --macos, or --win32, or set FURN_STORYBOOK_PLATFORM.');
  }
  if (api.paper && platform !== 'macos') {
    throw new Error('--paper is only supported on macOS. Select --macos --paper.');
  }
  return platform;
}

function parsePort(value: string): number {
  const port = Number(value);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new TypeError(`Server port must be an integer between 1 and 65535. Received "${value}".`);
  }
  return port;
}
