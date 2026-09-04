import { spawn } from 'node:child_process';
import fs from 'node:fs';

import { Command, Option } from 'commander';

import { connectDesktopAgent } from '../agent/DesktopAgent.js';
import { validateDesktopStoryTests } from '../authoring/storyTests.js';
import { FakeDesktopHost } from '../hosts/fake/FakeDesktopHost.js';
import { buildNativeDesktopDriver, resolveNativeDesktopDriver } from '../native/nativeDriver.js';
import type {
  NativeDriverArchitecture,
  NativeDriverBuildOptions,
  NativeDriverBuildPolicy,
  NativeDriverConfiguration,
  NativeDriverResolveOptions,
  NativeDriverArtifact,
} from '../native/types.js';
import type { DesktopEndpoint, DesktopPlatformName, DesktopRenderer } from '../protocol/types.js';
import { createDesktopDriverServer } from '../server/createDesktopDriverServer.js';
import type { DesktopStoryManifest } from '../storybook.js';
import { FakeStoryOrchestrator } from '../testing/FakeStoryOrchestrator.js';
import { createFakeStoryWindows } from '../testing/fakeStoryElements.js';
import { connectDesktopWebdriver } from '../wdio/DesktopWebdriver.js';

type ConnectionFlags = {
  artifacts?: string;
  platform: DesktopPlatformName;
  target: string;
  url: string;
};

type SelectionFlags = ConnectionFlags & {
  shardCount?: number;
  shardIndex?: number;
  story?: string;
  tag?: string;
  test?: string;
};

export type CreateDesktopDriverCommandOptions = {
  buildDriver?: typeof buildNativeDesktopDriver;
  permissionProbe?: NativePermissionProbe;
  resolveDriver?: typeof resolveNativeDesktopDriver;
  stderr?: Pick<NodeJS.WriteStream, 'write'>;
  stdout?: Pick<NodeJS.WriteStream, 'write'>;
};

type NativePermissionProbe = (artifact: NativeDriverArtifact, options: { prompt: boolean }) => Promise<Record<string, unknown>>;

export function createDesktopDriverCommand(options: CreateDesktopDriverCommandOptions = {}): Command {
  const buildDriver = options.buildDriver ?? buildNativeDesktopDriver;
  const permissionProbe = options.permissionProbe ?? runNativePermissionProbe;
  const resolveDriver = options.resolveDriver ?? resolveNativeDesktopDriver;
  const stdout = options.stdout ?? process.stdout;
  const stderr = options.stderr ?? process.stderr;
  const program = new Command()
    .name('desktop-driver')
    .description('Drive React Native desktop applications through W3C WebDriver without Appium.')
    .configureOutput({
      writeErr: (value) => stderr.write(value),
      writeOut: (value) => stdout.write(value),
    });

  addNativeBuildCommand(program, buildDriver, stdout);
  addNativeResolveCommand(program, resolveDriver, stdout);
  addNativeDoctorCommand(program, resolveDriver, permissionProbe, stdout);

  program
    .command('serve')
    .description('Start a deterministic fake Desktop Driver target.')
    .option('--host <host>', 'loopback host', '127.0.0.1')
    .option('--port <port>', 'listener port; defaults to an available port', parsePort)
    .option('--target <id>', 'registered target id', 'desktop-driver-fake')
    .addOption(new Option('--platform <name>', 'WebDriver platform name').choices(['macos', 'windows']).default('windows'))
    .addOption(new Option('--endpoint <name>', 'desktop endpoint').choices(['macos', 'windows', 'win32']).default('windows'))
    .addOption(new Option('--renderer <name>', 'React Native renderer').choices(['fabric', 'paper']).default('fabric'))
    .option('--manifest <path>', 'optional Story Manifest for fake story orchestration')
    .action(async (flags) => {
      const manifest = flags.manifest ? readManifest(flags.manifest) : undefined;
      const host = new FakeDesktopHost({
        endpoint: flags.endpoint as DesktopEndpoint,
        platformName: flags.platform as DesktopPlatformName,
        ...(manifest ? { storyRootTestId: 'story-root' } : {}),
        ...(manifest ? { windows: createFakeStoryWindows(manifest) } : {}),
      });
      const storyOrchestrator = manifest ? new FakeStoryOrchestrator(manifest, host) : undefined;
      const server = await createDesktopDriverServer({
        host: flags.host,
        port: flags.port,
        targets: [
          {
            endpoint: flags.endpoint as DesktopEndpoint,
            host,
            id: flags.target,
            platformName: flags.platform as DesktopPlatformName,
            renderer: flags.renderer as DesktopRenderer,
            ...(storyOrchestrator ? { storyOrchestrator, storyRootTestId: 'story-root' } : {}),
          },
        ],
      });
      writeJson(stdout, { server: server.url, targetId: flags.target });
      try {
        await waitForSignal();
      } finally {
        await server.close();
      }
    });

  const stories = program.command('stories').description('Inspect or run authored desktop story tests.');
  addConnectionOptions(
    stories
      .command('list')
      .description('List stories and tests from the active platform manifest.')
      .action(async (flags: ConnectionFlags) => {
        const desktop = await connect(flags);
        try {
          writeJson(stdout, await desktop.listStories());
        } finally {
          await desktop.delete();
        }
      }),
  );
  addConnectionOptions(
    stories
      .command('explain')
      .description('Print one story and its authored test plans.')
      .argument('<storyId>')
      .action(async (storyId: string, flags: ConnectionFlags) => {
        const desktop = await connect(flags);
        try {
          const story = (await desktop.listStories()).entries.find(({ id }) => id === storyId);
          if (!story) {
            throw new Error(`Story "${storyId}" is not present in the active manifest.`);
          }
          writeJson(stdout, story);
        } finally {
          await desktop.delete();
        }
      }),
  );
  addSelectionOptions(
    addConnectionOptions(
      stories
        .command('run')
        .description('Run selected authored plans through WebdriverIO.')
        .requiredOption('--artifacts <path>', 'artifact and report root')
        .action(async (flags: SelectionFlags) => {
          const artifactsRoot = requireOption(flags.artifacts, '--artifacts');
          const desktop = await connect(flags);
          try {
            const result = await desktop.runStoryTests({
              artifactsRoot,
              selection: {
                shardCount: flags.shardCount,
                shardIndex: flags.shardIndex,
                story: flags.story,
                tag: flags.tag,
                test: flags.test,
              },
            });
            writeJson(stdout, result);
            if (result.status !== 'passed') {
              process.exitCode = 1;
            }
          } finally {
            await desktop.delete();
          }
        }),
    ),
  );

  const agent = program.command('agent').description('Use bounded JSON-safe agent operations.');
  addConnectionOptions(
    agent
      .command('describe')
      .description('Print a bounded accessibility-tree projection.')
      .requiredOption('--artifacts <path>', 'artifact root')
      .option('--depth <depth>', 'maximum tree depth', parseNonNegativeInteger, 3)
      .option('--max-nodes <count>', 'maximum returned nodes', parsePositiveInteger, 100)
      .addOption(new Option('--scope <scope>', 'tree scope').choices(['application', 'story']).default('story'))
      .action(async (flags: ConnectionFlags & { depth: number; maxNodes: number; scope: 'application' | 'story' }) => {
        const artifactsRoot = requireOption(flags.artifacts, '--artifacts');
        const desktopAgent = await connectDesktopAgent({
          artifactsRoot,
          platformName: flags.platform,
          targetId: flags.target,
          url: flags.url,
        });
        try {
          writeJson(stdout, await desktopAgent.describe({ depth: flags.depth, maxNodes: flags.maxNodes, scope: flags.scope }));
        } finally {
          await desktopAgent.delete();
        }
      }),
  );
  addConnectionOptions(
    agent
      .command('screenshot')
      .description('Capture a named screenshot artifact.')
      .requiredOption('--artifacts <path>', 'artifact root')
      .requiredOption('--name <name>', 'artifact name')
      .action(async (flags: ConnectionFlags & { name: string }) => {
        const artifactsRoot = requireOption(flags.artifacts, '--artifacts');
        const desktopAgent = await connectDesktopAgent({
          artifactsRoot,
          platformName: flags.platform,
          targetId: flags.target,
          url: flags.url,
        });
        try {
          writeJson(stdout, await desktopAgent.screenshot(flags.name));
        } finally {
          await desktopAgent.delete();
        }
      }),
  );

  return program;
}

function addNativeBuildCommand(
  program: Command,
  buildDriver: typeof buildNativeDesktopDriver,
  stdout: Pick<NodeJS.WriteStream, 'write'>,
): void {
  const command = program.command('build-driver').description('Build the native desktop helper for the selected platform.');
  addNativePlatformOptions(command)
    .addOption(new Option('--architecture <architecture>', 'native architecture').choices(['arm64', 'x64']))
    .addOption(new Option('--configuration <configuration>', 'native build configuration').choices(['debug', 'release']).default('release'))
    .option('--cache-root <path>', 'native helper cache root')
    .option('--force', 'build and publish a new immutable selection even when a compatible artifact exists')
    .option('--macos-signing-identity <identity>', 'macOS code-signing certificate name or SHA-1 hash')
    .action(async (flags: NativeBuildFlags) => {
      const result = await buildDriver(toBuildOptions(flags));
      writeJson(stdout, result);
    });
}

function addNativeResolveCommand(
  program: Command,
  resolveDriver: typeof resolveNativeDesktopDriver,
  stdout: Pick<NodeJS.WriteStream, 'write'>,
): void {
  const command = program.command('resolve-driver').description('Resolve and verify a native desktop helper.');
  addNativePlatformOptions(command)
    .addOption(new Option('--architecture <architecture>', 'native architecture').choices(['arm64', 'x64']))
    .addOption(new Option('--configuration <configuration>', 'native build configuration').choices(['debug', 'release']).default('release'))
    .addOption(new Option('--build-policy <policy>', 'source build policy').choices(['if-missing', 'never']).default('if-missing'))
    .option('--cache-root <path>', 'native helper cache root')
    .option('--helper-path <path>', 'exact prebuilt helper executable')
    .option('--install-root <path>', 'managed native helper install root')
    .option('--macos-signing-identity <identity>', 'macOS code-signing certificate name or SHA-1 hash')
    .action(async (flags: NativeResolveFlags) => {
      const result = await resolveDriver(toResolveOptions(flags));
      writeJson(stdout, result);
    });
}

function addNativeDoctorCommand(
  program: Command,
  resolveDriver: typeof resolveNativeDesktopDriver,
  permissionProbe: NativePermissionProbe,
  stdout: Pick<NodeJS.WriteStream, 'write'>,
): void {
  const command = program.command('doctor').description('Report the selected native helper or an actionable readiness failure.');
  addNativePlatformOptions(command)
    .addOption(new Option('--architecture <architecture>', 'native architecture').choices(['arm64', 'x64']))
    .addOption(new Option('--configuration <configuration>', 'native build configuration').choices(['debug', 'release']).default('release'))
    .option('--cache-root <path>', 'native helper cache root')
    .option('--helper-path <path>', 'exact prebuilt helper executable')
    .option('--install-root <path>', 'managed native helper install root')
    .option('--macos-signing-identity <identity>', 'expected macOS code-signing certificate name or SHA-1 hash')
    .option('--permissions', 'run the verified macOS helper in noninteractive permission-diagnostic mode')
    .option('--prompt', 'allow the permission diagnostic to request Accessibility and Screen Recording access')
    .action(async (flags: NativeDoctorFlags) => {
      try {
        if (flags.prompt && !flags.permissions) {
          throw cliError('invalid-params', '--prompt requires --permissions.');
        }
        if (flags.permissions && flags.platform !== 'macos') {
          throw cliError('unsupported-operation', 'Permission diagnostics are available only for the macOS helper.');
        }
        const result = await resolveDriver({ ...toResolveOptions(flags), buildPolicy: 'never' });
        const permissions = flags.permissions ? await permissionProbe(result, { prompt: flags.prompt === true }) : undefined;
        writeJson(stdout, { ...(permissions ? { permissions } : {}), ready: true, result });
      } catch (error) {
        writeJson(stdout, {
          error: {
            code: error instanceof Error && 'code' in error ? String(error.code) : 'unknown',
            message: error instanceof Error ? error.message : String(error),
          },
          ready: false,
        });
        process.exitCode = 1;
      }
    });
}

export async function runDesktopDriverCli(argv: readonly string[] = process.argv): Promise<void> {
  await createDesktopDriverCommand().parseAsync([...argv]);
}

function addConnectionOptions<T extends Command>(command: T): T {
  return command
    .requiredOption('--url <url>', 'Desktop Driver server URL')
    .requiredOption('--target <id>', 'registered target id')
    .addOption(new Option('--platform <name>', 'WebDriver platform name').choices(['macos', 'windows']).default('windows')) as T;
}

type NativePlatformFlags = {
  platform: DesktopEndpoint;
};

type NativeBuildFlags = NativePlatformFlags & {
  architecture?: NativeDriverArchitecture;
  cacheRoot?: string;
  configuration: NativeDriverConfiguration;
  force?: boolean;
  macosSigningIdentity?: string;
};

type NativeResolveFlags = NativeBuildFlags & {
  buildPolicy?: NativeDriverBuildPolicy;
  helperPath?: string;
  installRoot?: string;
};

type NativeDoctorFlags = NativeResolveFlags & {
  permissions?: boolean;
  prompt?: boolean;
};

function addNativePlatformOptions<T extends Command>(command: T): T {
  return command.requiredOption('--platform <platform>', 'native endpoint', (value: string) =>
    parseChoice(value, ['macos', 'windows', 'win32'] as const, 'platform'),
  ) as T;
}

function toBuildOptions(flags: NativeBuildFlags): NativeDriverBuildOptions {
  return {
    architecture: flags.architecture,
    cacheRoot: flags.cacheRoot,
    configuration: flags.configuration,
    force: flags.force,
    macosSigningIdentity: flags.macosSigningIdentity,
    platform: flags.platform,
  };
}

function toResolveOptions(flags: NativeResolveFlags): NativeDriverResolveOptions {
  return {
    ...toBuildOptions(flags),
    buildPolicy: flags.buildPolicy,
    helperPath: flags.helperPath,
    installRoot: flags.installRoot,
  };
}

function parseChoice<T extends string>(value: string, choices: readonly T[], name: string): T {
  if (!choices.includes(value as T)) {
    throw new TypeError(`${name} must be one of ${choices.join(', ')}. Received "${value}".`);
  }
  return value as T;
}

function addSelectionOptions<T extends Command>(command: T): T {
  return command
    .option('--story <pattern>', 'story id glob')
    .option('--test <pattern>', 'test id glob')
    .option('--tag <tag>', 'required story tag')
    .option('--shard-index <index>', 'zero-based shard index', parseNonNegativeInteger)
    .option('--shard-count <count>', 'number of shards', parsePositiveInteger) as T;
}

function connect(flags: ConnectionFlags) {
  return connectDesktopWebdriver({
    platformName: flags.platform,
    targetId: flags.target,
    url: flags.url,
  });
}

function readManifest(manifestPath: string): DesktopStoryManifest {
  const value = JSON.parse(fs.readFileSync(manifestPath, 'utf8')) as DesktopStoryManifest;
  if (
    value.schemaVersion !== 1 ||
    !Array.isArray(value.entries) ||
    (value.endpoint !== 'macos' && value.endpoint !== 'windows' && value.endpoint !== 'win32') ||
    typeof value.platformManifestDigest !== 'string' ||
    typeof value.portablePlanDigest !== 'string'
  ) {
    throw new Error(`Invalid Desktop Story Manifest at ${manifestPath}.`);
  }
  for (const entry of value.entries) {
    if (!entry || typeof entry.id !== 'string' || !Array.isArray(entry.tags)) {
      throw new Error(`Invalid Desktop Story Manifest entry at ${manifestPath}.`);
    }
    if (entry.tests) {
      validateDesktopStoryTests(entry.tests, `${manifestPath}#${entry.id}`);
    }
  }
  return value;
}

function writeJson(output: Pick<NodeJS.WriteStream, 'write'>, value: unknown): void {
  output.write(`${JSON.stringify(value, null, 2)}\n`);
}

function waitForSignal(): Promise<void> {
  return new Promise((resolve) => {
    process.once('SIGINT', resolve);
    process.once('SIGTERM', resolve);
  });
}

function parsePort(value: string): number {
  const port = Number(value);
  if (!Number.isInteger(port) || port < 0 || port > 65_535) {
    throw new TypeError(`Port must be an integer between 0 and 65535. Received "${value}".`);
  }

  return port;
}

function requireOption(value: string | undefined, name: string): string {
  if (!value) {
    throw new TypeError(`${name} requires a non-empty value.`);
  }
  return value;
}

function parseNonNegativeInteger(value: string): number {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 0) {
    throw new TypeError(`Expected a non-negative integer. Received "${value}".`);
  }
  return parsed;
}

function parsePositiveInteger(value: string): number {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) {
    throw new TypeError(`Expected a positive integer. Received "${value}".`);
  }
  return parsed;
}

function cliError(code: string, message: string): Error & { code: string } {
  return Object.assign(new Error(message), { code });
}

async function runNativePermissionProbe(artifact: NativeDriverArtifact, options: { prompt: boolean }): Promise<Record<string, unknown>> {
  const maximumOutputBytes = 1024 * 1024;
  return new Promise((resolve, reject) => {
    let settled = false;
    let outputBytes = 0;
    let errorBytes = 0;
    const stdout: Buffer[] = [];
    const stderr: Buffer[] = [];
    const args = options.prompt ? ['--permissions', '--prompt'] : ['--permissions'];
    const child = spawn(artifact.executablePath, args, {
      stdio: ['ignore', 'pipe', 'pipe'],
      windowsHide: true,
    });
    const timeout = setTimeout(() => {
      child.kill();
      settleReject(cliError('permission-probe-timeout', 'The native helper did not complete its permission diagnostic within 30 seconds.'));
    }, 30_000);

    const settleReject = (error: Error) => {
      if (settled) {
        return;
      }
      settled = true;
      clearTimeout(timeout);
      reject(error);
    };
    child.stdout.on('data', (chunk: Buffer) => {
      outputBytes += chunk.length;
      if (outputBytes > maximumOutputBytes) {
        child.kill();
        settleReject(cliError('permission-probe-failed', 'The native helper permission diagnostic exceeded the 1 MiB output limit.'));
        return;
      }
      stdout.push(chunk);
    });
    child.stderr.on('data', (chunk: Buffer) => {
      errorBytes += chunk.length;
      if (errorBytes > maximumOutputBytes) {
        child.kill();
        settleReject(cliError('permission-probe-failed', 'The native helper permission diagnostic exceeded the 1 MiB error limit.'));
        return;
      }
      stderr.push(chunk);
    });
    child.once('error', (error) => settleReject(error));
    child.once('close', (code) => {
      if (settled) {
        return;
      }
      settled = true;
      clearTimeout(timeout);
      if (code !== 0) {
        reject(
          cliError(
            'permission-probe-failed',
            `The native helper exited with code ${String(code)} during permission diagnostics: ${Buffer.concat(stderr).toString('utf8')}`,
          ),
        );
        return;
      }
      try {
        const value = JSON.parse(Buffer.concat(stdout).toString('utf8')) as Record<string, unknown>;
        if (value.schemaVersion !== 1 || value.type !== 'permissions') {
          throw new Error('The native helper returned an unsupported permission-diagnostic document.');
        }
        resolve(value);
      } catch (error) {
        reject(
          cliError(
            'permission-probe-failed',
            error instanceof Error ? error.message : 'The native helper returned invalid permission-diagnostic JSON.',
          ),
        );
      }
    });
  });
}
