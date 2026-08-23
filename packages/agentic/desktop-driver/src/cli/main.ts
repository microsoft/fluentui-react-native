/**
 * `desktop-driver` command line.
 *
 * Every command prints JSON so an agent or a CI step can consume it without scraping text, and
 * every command calls the same handlers the WebdriverIO integration and the loopback service use.
 */

import * as path from 'node:path';
import * as fs from 'node:fs';

import {
  detectDesktopDriver,
  doctor,
  generateStories,
  listRunningStories,
  selectRunningStory,
  smokeRunningStories,
  updateRunningStoryArgs,
  verifyDesktopDriver,
} from './commands.ts';
import { assertKnownFlags, parseArgs, type ParsedArgs } from './args.ts';
import { loadDesktopConfig, renderDesktopRuntime, serializeResolvedDesktopProject, toDesktopHostOptions } from '../config/node.ts';
import { detectHostPlatform } from '../drivers.ts';
import { hostForUrl } from '../net.ts';
import { startDesktopDriver } from '../wdio/standalone.ts';
import { startDesktopStorybookHost } from '../server/host.ts';
import { DesktopDriverError } from '../errors.ts';
import { PACKAGE_VERSION } from '../package-version.ts';
import type { DesktopAppTarget, DesktopPlatform } from '../types.ts';

function requirePlatform(flags: ParsedArgs['flags']): DesktopPlatform {
  const platform = (flags.platform ?? process.env.DESKTOP_TEST_PLATFORM ?? 'fake') as DesktopPlatform;
  if (platform !== 'macos' && platform !== 'windows' && platform !== 'fake') {
    throw new DesktopDriverError(`Unknown --platform "${String(platform)}"; expected macos, windows, or fake`, { kind: 'configuration' });
  }
  return platform;
}

function driverPlatform(flags: ParsedArgs['flags']): DesktopPlatform {
  return flags.platform === undefined && process.env.DESKTOP_TEST_PLATFORM === undefined ? detectHostPlatform() : requirePlatform(flags);
}

function buildTarget(flags: ParsedArgs['flags']): DesktopAppTarget {
  if (typeof flags.app === 'string') {
    return { mode: 'launch', app: flags.app };
  }
  const attach: Extract<DesktopAppTarget, { mode: 'attach' }> = { mode: 'attach' };
  if (typeof flags.identity === 'string') {
    attach.identity = flags.identity;
  }
  if (typeof flags.pid === 'string') {
    attach.processId = Number(flags.pid);
  }
  if (typeof flags.window === 'string') {
    attach.windowHandle = flags.window;
  }
  if (typeof flags.title === 'string') {
    attach.title = flags.title;
  }
  return attach;
}

function print(value: unknown): void {
  process.stdout.write(`${JSON.stringify(value, null, 2)}\n`);
}

const USAGE = `desktop-driver <command> [options]

Commands
  doctor                     Report backends, portable commands, and platform prerequisites
  driver detect              Detect the embedded platform driver and native runtime
  driver verify              Verify the embedded platform driver installation
  config resolve             Print the fully resolved project configuration
  host                       Run the Storybook channel, MCP, and desktop test coordinator
  stories generate           Scan story modules and emit the manifest and generated spec
  stories list               List the stories a running Storybook application reports
  stories select <id>        Select a story and wait for it to render
  stories args <id> <json>   Update a story's control args
  stories smoke              Select every indexed story and report failures
  start                      Start an owned driver host and print its endpoint
  version                    Print the package version

Common options
  --platform <macos|windows|fake>   Target platform (default: $DESKTOP_TEST_PLATFORM or fake)
  --app <path>                      Launch target; omit to attach
  --identity <id>                   Attach by bundle or package identity
  --pid <number>                    Attach by process id
  --window <handle>                 Attach by native window handle
  --title <text>                    Attach by window title
  --story-root <dir>                Story scan root (repeatable via comma separation)
  --config <file>                   Desktop project config (default: ./desktop.config.ts)
  --out <dir>                       Output directory for generated story tests
  --storybook-port <port>           Storybook channel server port (default: 7007)
  --storybook-host <host>           Storybook channel host (loopback only)

host options
  --config-path <dir>              Storybook config directory (default: src)
  --manifest <path>                 Generated story-tests.manifest.json (required)
  --runner <command>                Runner executable (default: yarn)
  --runner-arg <arg>                Runner argument before the spec selection; repeatable
  --cwd <dir>                       Working directory for the runner (default: current directory)
  --port <port>                     Storybook channel and MCP port (default: 7007)
  --ready-file <path>               Atomically write host-ready JSON
`;

export async function main(argv: readonly string[] = process.argv.slice(2)): Promise<number> {
  const { command, flags, repeated } = parseArgs(argv);
  const [first, rawSecond] = command;
  const second = first === 'stories' && rawSecond === undefined ? 'list' : rawSecond;

  if (!first || flags.help === true || first === 'help') {
    process.stdout.write(USAGE);
    return first ? 0 : 2;
  }
  assertKnownFlags(first, second, flags);

  switch (first) {
    case 'version':
      print({ version: PACKAGE_VERSION });
      return 0;

    case 'doctor': {
      const report = doctor(requirePlatform(flags));
      print(report);
      return report.ready ? 0 : 1;
    }

    case 'config': {
      if (second !== 'resolve' && second !== 'print') {
        process.stderr.write(`Unknown "config" subcommand "${String(second)}"\n${USAGE}`);
        return 2;
      }
      const project = loadDesktopConfig(typeof flags.config === 'string' ? flags.config : undefined, {
        platform: flags.platform === undefined ? undefined : requirePlatform(flags),
      });
      print(serializeResolvedDesktopProject(project));
      return 0;
    }

    case 'driver': {
      const platform = driverPlatform(flags);
      if (second === 'detect') {
        const result = await detectDesktopDriver(platform);
        print(result);
        return result.status === 'ready' ? 0 : 1;
      }
      if (second === 'verify' || second === 'install') {
        try {
          print(await verifyDesktopDriver(platform));
          return 0;
        } catch (error) {
          if (!(error instanceof DesktopDriverError)) {
            throw error;
          }
          print({
            changed: false,
            error: {
              message: error.message,
              kind: error.kind,
              detail: error.detail,
            },
          });
          return 1;
        }
      }
      process.stderr.write(`Unknown "driver" subcommand "${String(second)}"\n${USAGE}`);
      return 2;
    }

    case 'stories': {
      if (second === 'generate') {
        const configFile =
          typeof flags.config === 'string'
            ? flags.config
            : fs.existsSync(path.resolve('desktop.config.ts'))
              ? path.resolve('desktop.config.ts')
              : undefined;
        const project = configFile ? loadDesktopConfig(configFile) : undefined;
        const storyRoots = project
          ? project.storybook.stories.map((entry) => entry.directory)
          : (repeated['story-root'] ?? [String(flags['story-root'] ?? 'src')])
              .flatMap((entry) => entry.split(','))
              .map((entry) => entry.trim())
              .filter(Boolean);
        const result = generateStories({
          storyRoots,
          storyFiles: project
            ? [
                ...new Set(
                  project.storybook.stories.flatMap((entry) =>
                    fs.globSync(entry.files, { cwd: entry.directory }).map((file) => fs.realpathSync(path.resolve(entry.directory, file))),
                  ),
                ),
              ]
            : undefined,
          outputDirectory: project?.tests.generatedDirectory ?? String(flags.out ?? path.join('desktop-tests', 'generated')),
          specRoots: project
            ? project.storybook.stories.map((entry) => entry.directory)
            : typeof flags['spec-root'] === 'string'
              ? flags['spec-root'].split(',')
              : undefined,
          additionalOutputPaths: project ? [project.tests.runtimePath] : undefined,
          additionalOutputs: project
            ? (manifest) => [{ path: project.tests.runtimePath, contents: renderDesktopRuntime(project, manifest) }]
            : undefined,
          configDigest: project?.configFingerprint,
        });
        const runtimePath = project?.tests.runtimePath;
        print({
          manifestPath: result.manifestPath,
          specPath: result.specPath,
          runtimePath,
          digest: result.manifest.digest,
          stories: result.manifest.entries.map((entry) => ({ storyId: entry.storyId, kind: entry.plan.kind, planId: entry.plan.id })),
          problems: result.problems,
        });
        return result.problems.length > 0 ? 1 : 0;
      }
      if (second === 'list' || second === 'select' || second === 'args' || second === 'smoke') {
        const project = loadOptionalProject(flags);
        const connection = {
          host: typeof flags['storybook-host'] === 'string' ? flags['storybook-host'] : project?.storybook.channel.host,
          port: flags['storybook-port'] ? Number(flags['storybook-port']) : project?.storybook.channel.port,
        };
        if (second === 'list') {
          print(await listRunningStories(connection));
          return 0;
        }
        if (second === 'select') {
          const storyId = command[2];
          print(await selectRunningStory(connection, storyId));
          return 0;
        }
        if (second === 'args') {
          const storyId = command[2];
          const json = command[3];
          if (!json) {
            throw new DesktopDriverError('stories args requires <story-id> <json>', { kind: 'configuration' });
          }
          const updatedArgs = JSON.parse(json) as unknown;
          if (typeof updatedArgs !== 'object' || updatedArgs === null || Array.isArray(updatedArgs)) {
            throw new DesktopDriverError('stories args JSON must be an object', { kind: 'configuration' });
          }
          print(await updateRunningStoryArgs(connection, storyId, updatedArgs as Record<string, unknown>));
          return 0;
        }
        print(await smokeRunningStories(connection));
        return 0;
      }
      process.stderr.write(`Unknown "stories" subcommand "${String(second)}"\n${USAGE}`);
      return 2;
    }

    case 'host':
    case 'serve': {
      const project = loadOptionalProject(flags);
      if (!project && typeof flags.manifest !== 'string') {
        process.stderr.write(`${first} requires --manifest <path to story-tests.manifest.json>\n`);
        return 2;
      }
      const shutdownFile = typeof flags['shutdown-file'] === 'string' ? path.resolve(flags['shutdown-file']) : undefined;
      const readyFile = typeof flags['ready-file'] === 'string' ? path.resolve(flags['ready-file']) : undefined;
      if (shutdownFile) {
        fs.rmSync(shutdownFile, { force: true });
      }
      if (readyFile) {
        fs.rmSync(readyFile, { force: true });
      }
      const server = await startDesktopStorybookHost(
        project
          ? {
              ...toDesktopHostOptions(project),
              announceIntervalMs: flags['announce-interval'] ? Number(flags['announce-interval']) : undefined,
              onOutput: (chunk) => process.stdout.write(chunk),
            }
          : {
              configPath: typeof flags['config-path'] === 'string' ? flags['config-path'] : 'src',
              manifestPath: flags.manifest as string,
              port: flags.port
                ? Number(flags.port)
                : flags['storybook-port']
                  ? Number(flags['storybook-port'])
                  : process.env.STORYBOOK_WS_PORT
                    ? Number(process.env.STORYBOOK_WS_PORT)
                    : undefined,
              announceIntervalMs: flags['announce-interval'] ? Number(flags['announce-interval']) : undefined,
              runner: {
                command: typeof flags.runner === 'string' ? flags.runner : 'yarn',
                args: repeated['runner-arg'] ?? ['wdio', 'run', 'wdio.conf.ts'],
                cwd: typeof flags.cwd === 'string' ? path.resolve(flags.cwd) : process.cwd(),
              },
              onOutput: (chunk) => process.stdout.write(chunk),
            },
      );

      const ready = {
        url: server.url,
        serviceId: server.serviceId,
        manifestDigest: server.manifest.digest,
        stories: server.manifest.entries.map((entry) => entry.storyId),
        discovery: 'Storybook channel events; no separate test endpoint is exposed to clients',
      };
      if (readyFile) {
        writeJsonAtomic(readyFile, ready);
      }
      print(ready);

      await waitForHostShutdown(server, shutdownFile);
      return 0;
    }

    case 'start': {
      const service = await startDesktopDriver({
        platform: requirePlatform(flags),
        target: buildTarget(flags),
        fakeScene: typeof flags.scene === 'string' ? flags.scene : undefined,
      });
      print({
        webdriverUrl: `http://${hostForUrl(service.webdriverOptions.hostname)}:${service.webdriverOptions.port}`,
        health: service.health,
        ownedResources: service.ownedResources,
      });
      await waitForHostShutdown(service);
      return 0;
    }

    default:
      process.stderr.write(`Unknown command "${first}"\n${USAGE}`);
      return 2;
  }
}

function loadOptionalProject(flags: ParsedArgs['flags']) {
  const configFile =
    typeof flags.config === 'string'
      ? flags.config
      : fs.existsSync(path.resolve('desktop.config.ts'))
        ? path.resolve('desktop.config.ts')
        : undefined;
  return configFile ? loadDesktopConfig(configFile) : undefined;
}

function writeJsonAtomic(file: string, value: unknown): void {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const temporary = `${file}.${process.pid}-${Date.now()}.tmp`;
  try {
    fs.writeFileSync(temporary, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
    fs.renameSync(temporary, file);
  } catch (error) {
    fs.rmSync(temporary, { force: true });
    throw error;
  }
}

async function waitForHostShutdown(server: { stop(): Promise<void> }, shutdownFile?: string): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    let stopping = false;
    const timer = shutdownFile
      ? setInterval(() => {
          if (fs.existsSync(shutdownFile)) {
            void stop();
          }
        }, 250)
      : undefined;
    timer?.unref();

    const cleanup = (): void => {
      if (timer) {
        clearInterval(timer);
      }
      process.off('SIGINT', stop);
      process.off('SIGTERM', stop);
    };
    const stop = (): void => {
      if (stopping) {
        return;
      }
      stopping = true;
      cleanup();
      void server.stop().then(resolve, reject);
    };
    process.once('SIGINT', stop);
    process.once('SIGTERM', stop);
  });
}
