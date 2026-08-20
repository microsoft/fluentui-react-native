#!/usr/bin/env node
/**
 * `desktop-driver` command line.
 *
 * Every command prints JSON so an agent or a CI step can consume it without scraping text, and
 * every command calls the same handlers the WebdriverIO integration and the loopback service use.
 */

import * as path from 'node:path';

import { doctor, generateStories, listRunningStories } from './commands.ts';
import { startDesktopDriver } from '../wdio/service.ts';
import { startDesktopTestServer } from '../storybook/serve.ts';
import { DesktopDriverError } from '../errors.ts';
import { PACKAGE_VERSION } from '../package-version.ts';
import type { DesktopAppTarget, DesktopPlatform } from '../types.ts';

interface ParsedArgs {
  command: string[];
  flags: Record<string, string | boolean>;
  /** Every occurrence of each flag, in order, so a flag can be repeated. */
  repeated: Record<string, string[]>;
}

function parseArgs(argv: readonly string[]): ParsedArgs {
  const command: string[] = [];
  const flags: Record<string, string | boolean> = {};
  const repeated: Record<string, string[]> = {};

  const record = (name: string, value: string | boolean): void => {
    flags[name] = value;
    if (typeof value === 'string') {
      (repeated[name] ??= []).push(value);
    }
  };

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith('--')) {
      command.push(token);
      continue;
    }
    const [name, inline] = token.slice(2).split('=', 2);
    if (inline !== undefined) {
      record(name, inline);
      continue;
    }
    const next = argv[index + 1];
    if (next === undefined || next.startsWith('--')) {
      record(name, true);
      continue;
    }
    record(name, next);
    index += 1;
  }

  return { command, flags, repeated };
}

function requirePlatform(flags: ParsedArgs['flags']): DesktopPlatform {
  const platform = (flags.platform ?? process.env.DESKTOP_TEST_PLATFORM ?? 'fake') as DesktopPlatform;
  if (platform !== 'macos' && platform !== 'windows' && platform !== 'fake') {
    throw new DesktopDriverError(`Unknown --platform "${String(platform)}"; expected macos, windows, or fake`, { kind: 'configuration' });
  }
  return platform;
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
  stories generate           Scan story modules and emit the manifest and generated spec
  stories list               List the stories a running Storybook application reports
  serve                      Run the loopback desktop test service for the on-device controls
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
  --out <dir>                       Output directory for generated story tests
  --storybook-port <port>           Storybook channel server port (default: 7007)

serve options
  --manifest <path>                 Generated story-tests.manifest.json (required)
  --runner <command>                Runner executable (default: yarn)
  --runner-arg <arg>                Runner argument before the spec selection; repeatable
  --cwd <dir>                       Working directory for the runner (default: current directory)
  --port <port>                     Service port (default: 7017)
  --announce-interval <ms>          Channel re-broadcast interval (default: 5000)
`;

export async function main(argv: readonly string[] = process.argv.slice(2)): Promise<number> {
  const { command, flags, repeated } = parseArgs(argv);
  const [first, second] = command;

  if (!first || flags.help === true || first === 'help') {
    process.stdout.write(USAGE);
    return first ? 0 : 2;
  }

  switch (first) {
    case 'version':
      print({ version: PACKAGE_VERSION });
      return 0;

    case 'doctor': {
      const report = doctor(requirePlatform(flags));
      print(report);
      return report.warnings.length > 0 ? 1 : 0;
    }

    case 'stories': {
      if (second === 'generate') {
        const storyRoots = String(flags['story-root'] ?? 'src')
          .split(',')
          .map((entry) => entry.trim())
          .filter(Boolean);
        const result = generateStories({
          storyRoots,
          outputDirectory: String(flags.out ?? path.join('desktop-tests', 'generated')),
          specRoots: typeof flags['spec-root'] === 'string' ? flags['spec-root'].split(',') : undefined,
        });
        print({
          manifestPath: result.manifestPath,
          specPath: result.specPath,
          digest: result.manifest.digest,
          stories: result.manifest.entries.map((entry) => ({ storyId: entry.storyId, kind: entry.plan.kind, planId: entry.plan.id })),
          problems: result.problems,
        });
        return result.problems.length > 0 ? 1 : 0;
      }
      if (second === 'list') {
        print(
          await listRunningStories({
            platform: requirePlatform(flags),
            target: buildTarget(flags),
            storybook: { port: flags['storybook-port'] ? Number(flags['storybook-port']) : undefined },
          }),
        );
        return 0;
      }
      process.stderr.write(`Unknown "stories" subcommand "${String(second)}"\n${USAGE}`);
      return 2;
    }

    case 'serve': {
      if (typeof flags.manifest !== 'string') {
        process.stderr.write('serve requires --manifest <path to story-tests.manifest.json>\n');
        return 2;
      }
      const server = await startDesktopTestServer({
        manifestPath: flags.manifest,
        port: flags.port ? Number(flags.port) : undefined,
        announceIntervalMs: flags['announce-interval'] ? Number(flags['announce-interval']) : undefined,
        storybook: { port: flags['storybook-port'] ? Number(flags['storybook-port']) : undefined },
        runner: {
          command: typeof flags.runner === 'string' ? flags.runner : 'yarn',
          args: repeated['runner-arg'] ?? ['wdio', 'run', 'wdio.conf.ts'],
          cwd: typeof flags.cwd === 'string' ? path.resolve(flags.cwd) : process.cwd(),
        },
        onOutput: (chunk) => process.stdout.write(chunk),
      });

      print({
        url: server.url,
        token: server.token,
        manifestDigest: server.manifest.digest,
        stories: server.manifest.entries.map((entry) => entry.storyId),
        discovery: 'announced over the Storybook channel; the app needs no build-time configuration',
      });

      // The service owns its lifetime; it runs until interrupted.
      await new Promise<void>((resolve) => {
        const stop = (): void => {
          void server.stop().finally(resolve);
        };
        process.on('SIGINT', stop);
        process.on('SIGTERM', stop);
      });
      return 0;
    }

    case 'start': {
      const service = await startDesktopDriver({
        platform: requirePlatform(flags),
        target: buildTarget(flags),
        fakeScene: typeof flags.scene === 'string' ? flags.scene : undefined,
      });
      print({
        webdriverUrl: `http://${service.webdriverOptions.hostname}:${service.webdriverOptions.port}`,
        health: service.health,
        ownedResources: service.ownedResources,
      });
      // The host is owned by this process; stopping here keeps the CLI from leaking a driver.
      await service.stop();
      return 0;
    }

    default:
      process.stderr.write(`Unknown command "${first}"\n${USAGE}`);
      return 2;
  }
}

const invokedDirectly = process.argv[1] !== undefined && import.meta.url === new URL(`file://${process.argv[1]}`).href;

if (invokedDirectly) {
  main()
    .then((code) => {
      process.exitCode = code;
    })
    .catch((error: unknown) => {
      process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
      process.exitCode = 1;
    });
}
