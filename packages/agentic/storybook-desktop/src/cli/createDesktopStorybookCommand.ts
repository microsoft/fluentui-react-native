import { Command, Option } from 'commander';

import { desktopSmokeModes, type DesktopSmokeMode } from '../config/commands.js';
import type { DesktopStorybookConfig } from '../config/makeDesktopStorybookConfig.js';
import type { Platforms } from '../config/platforms.js';
import type {
  DesktopStorybookBuildDriverOptions,
  DesktopStorybookCliOptions,
  DesktopStorybookPrepOptions,
  DesktopStorybookServerOptions,
} from './DesktopStorybookCli.js';
import { DesktopStorybookCli } from './DesktopStorybookCli.js';
import { loadDesktopStorybookConfig } from './loadConfig.js';

type PlatformFlags = {
  macos?: boolean;
  win32?: boolean;
  windows?: boolean;
};

type ServerFlags = PlatformFlags & DesktopStorybookServerOptions;
type ManifestFlags = PlatformFlags & { all?: boolean; out?: string };
type SmokeFlags = PlatformFlags & { mode: DesktopSmokeMode };
type BuildDriverFlags = PlatformFlags & DesktopStorybookBuildDriverOptions;
type PrepFlags = PlatformFlags & { driver: DesktopStorybookPrepOptions['driver'] };

export type CreateDesktopStorybookCommandOptions = DesktopStorybookCliOptions & {
  config?: DesktopStorybookConfig;
  cwd?: string;
};

export function createDesktopStorybookCommand(options: CreateDesktopStorybookCommandOptions = {}): Command {
  const program = new Command()
    .name('storybook-desktop')
    .description('Serve, prepare, bundle, build, run, and smoke test a React Native desktop Storybook app.')
    .option('-c, --config <path>', 'path to storybook.config.ts');
  let apiPromise: Promise<DesktopStorybookCli> | undefined;

  const getApi = () =>
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
          isPortAvailable: options.isPortAvailable,
          runSmokeTests: options.runSmokeTests,
          resolveNativeDriver: options.resolveNativeDriver,
        }),
    ));

  addServerCommand(program, getApi);
  addBuildDriverCommand(program, getApi);
  addDriverCommand(program, getApi);
  addManifestCommand(program, getApi);
  addInstanceCommand(program, getApi);
  addPrepCommand(program, getApi);
  addActionCommand(program, 'bundle', 'Generate stories and create the platform JavaScript bundle.', getApi);
  addActionCommand(program, 'run', 'Build and launch the native Storybook app.', getApi);
  addActionCommand(program, 'build', 'Build the native Storybook app without launching it.', getApi);
  addSmokeCommand(program, getApi);

  return program;
}

function addPrepCommand(program: Command, getApi: () => Promise<DesktopStorybookCli>): void {
  const command = program
    .command('prep')
    .description('Prepare the native helper, dependencies, and generated projects.')
    .option('--no-driver', 'prepare only the native app project');
  addPlatformOptions(command);
  command.action(async (flags: PrepFlags) => {
    const api = await getApi();
    await api.prep(resolvePlatform(flags, api), { driver: flags.driver });
  });
}

function addBuildDriverCommand(program: Command, getApi: () => Promise<DesktopStorybookCli>): void {
  const command = program.command('build-driver').description('Build the native Desktop Driver helper without preparing the app.');
  command.option('--force', 'publish a new immutable helper selection');
  addPlatformOptions(command);
  command.action(async (flags: BuildDriverFlags) => {
    const api = await getApi();
    await api.buildDriver(resolvePlatform(flags, api), { force: flags.force });
  });
}

function addDriverCommand(program: Command, getApi: () => Promise<DesktopStorybookCli>): void {
  const command = program
    .command('driver')
    .description('Start the Storybook channel, MCP, and embedded Desktop Driver servers.')
    .option('--host <host>', 'server host; defaults to STORYBOOK_WS_HOST or 127.0.0.1')
    .option('--port <port>', 'Storybook channel port; defaults to the enlistment-specific port', parsePort);
  addPlatformOptions(command);
  command.action(async (flags: ServerFlags) => {
    const api = await getApi();
    await api.driver(resolvePlatform(flags, api), { host: flags.host, port: flags.port });
  });
}

function addManifestCommand(program: Command, getApi: () => Promise<DesktopStorybookCli>): void {
  const command = program
    .command('manifest')
    .description('Generate one platform Story Manifest or the reconciled manifest set.')
    .option('--all', 'generate manifests for every configured desktop platform')
    .option('--out <path>', 'output file, or output directory with --all');
  addPlatformOptions(command);
  command.action(async (flags: ManifestFlags) => {
    const api = await getApi();
    if (flags.all) {
      if (selectedPlatform(flags)) {
        throw new Error('--all cannot be combined with --macos, --windows, or --win32.');
      }
      await api.manifests(flags.out);
    } else {
      await api.manifest(resolvePlatform(flags, api), flags.out);
    }
  });
}

function addInstanceCommand(program: Command, getApi: () => Promise<DesktopStorybookCli>): void {
  const command = program.command('instance').description('Print the platform instance identity as JSON.');
  addPlatformOptions(command);
  command.action(async (flags: PlatformFlags) => {
    const api = await getApi();
    api.printInstance(resolvePlatform(flags, api));
  });
}

export async function runDesktopStorybookCli(argv: readonly string[] = process.argv): Promise<void> {
  await createDesktopStorybookCommand().parseAsync([...argv]);
}

function addActionCommand(
  program: Command,
  action: 'bundle' | 'run' | 'build',
  description: string,
  getApi: () => Promise<DesktopStorybookCli>,
): void {
  const command = program.command(action).description(description);
  addPlatformOptions(command);
  command.action(async (flags: PlatformFlags) => {
    const api = await getApi();
    const platform = resolvePlatform(flags, api);
    await api[action](platform);
  });
}

function addSmokeCommand(program: Command, getApi: () => Promise<DesktopStorybookCli>): void {
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
    const api = await getApi();
    await api.smoke(resolvePlatform(flags, api), { mode: flags.mode });
  });
}

function addServerCommand(program: Command, getApi: () => Promise<DesktopStorybookCli>): void {
  const command = program
    .command('server')
    .description('Start the Storybook channel and MCP server.')
    .option('--host <host>', 'server host; defaults to STORYBOOK_WS_HOST or 127.0.0.1')
    .option('--port <port>', 'server port; defaults to STORYBOOK_WS_PORT or 7007', parsePort);
  addPlatformOptions(command);
  command.action(async (flags: ServerFlags) => {
    const api = await getApi();
    await api.server(resolvePlatform(flags, api), {
      host: flags.host,
      port: flags.port,
    });
  });
}

function addPlatformOptions(command: Command): void {
  command
    .addOption(new Option('--windows', 'target React Native Windows').conflicts(['macos', 'win32']))
    .addOption(new Option('--macos', 'target React Native macOS').conflicts(['windows', 'win32']))
    .addOption(new Option('--win32', 'target React Native Win32').conflicts(['windows', 'macos']));
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
  return platform;
}

function parsePort(value: string): number {
  const port = Number(value);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new TypeError(`Server port must be an integer between 1 and 65535. Received "${value}".`);
  }
  return port;
}
