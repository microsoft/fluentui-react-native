import path from 'node:path';

import { makeDesktopStorybookConfig } from '../config/makeDesktopStorybookConfig';
import { FURN_STORYBOOK_BUNDLE_IDENTIFIER, FURN_STORYBOOK_INSTANCE_ID } from '../config/instance';
import { FURN_STORYBOOK_PLATFORM } from '../config/platforms';
import type { DesktopCommandRunner, PreparedDesktopCommand, RunningDesktopCommand } from './commandRunner';
import { createDesktopStorybookCommand } from './createDesktopStorybookCommand';
import { DesktopStorybookCli } from './DesktopStorybookCli';

const storybookRoot = path.resolve(__dirname, '../../../../../apps/storybook');

class RecordingRunner implements DesktopCommandRunner {
  readonly foreground: PreparedDesktopCommand[] = [];
  readonly background: PreparedDesktopCommand[] = [];
  stopped = 0;
  failCommand?: string;

  async run(command: PreparedDesktopCommand): Promise<void> {
    this.foreground.push(command);
    if (command.command === this.failCommand) {
      throw new Error(`${command.command} failed`);
    }
  }

  start(command: PreparedDesktopCommand): RunningDesktopCommand {
    this.background.push(command);
    return {
      completed: new Promise<number>(() => {}),
      stop: async () => {
        this.stopped += 1;
      },
    };
  }
}

function makeConfig(platformOptions = {}) {
  return makeDesktopStorybookConfig({
    projectRoot: storybookRoot,
    storyPackages: [],
    platformOptions,
  });
}

describe('DesktopStorybookCli', () => {
  test('uses shared preparation and rnx-cli bundle defaults', async () => {
    const runner = new RecordingRunner();
    const cli = new DesktopStorybookCli(makeConfig(), { runner });

    await cli.prep('macos');
    await cli.bundle('win32');

    expect(runner.foreground).toMatchObject([
      {
        command: 'pod',
        args: ['install', '--project-directory=macos'],
        cwd: storybookRoot,
        env: { [FURN_STORYBOOK_PLATFORM]: 'macos' },
      },
      {
        command: 'sb-rn-get-stories',
        args: ['--config-path', path.join(storybookRoot, 'src')],
        env: { [FURN_STORYBOOK_PLATFORM]: 'win32' },
      },
      {
        command: 'rnx-cli',
        args: ['bundle', '--dev', 'false', '--platform', 'win32'],
        env: { [FURN_STORYBOOK_PLATFORM]: 'win32' },
      },
    ]);
  });

  test('uses native project defaults and rejects an unconfigured Win32 build', async () => {
    const runner = new RecordingRunner();
    const cli = new DesktopStorybookCli(makeConfig(), { runner });

    await cli.run('windows');

    expect(runner.foreground[0]).toMatchObject({
      command: 'rnx-cli',
      args: ['run', '--platform', 'windows', '--solution', 'windows/AgenticStorybook.sln'],
    });
    await expect(cli.build('win32')).rejects.toThrow('build is not configured for win32');
  });

  test('always runs app and process cleanup when the reusable smoke lifecycle fails', async () => {
    const runner = new RecordingRunner();
    runner.failCommand = 'launch-storybook';
    const cli = new DesktopStorybookCli(
      makeConfig({
        macos: {
          run: { command: 'launch-storybook' },
          smoke: {
            stop: { command: 'stop-storybook' },
          },
        },
      }),
      {
        runner,
        fetch: jest.fn(async () => new Response('{}')),
        isPortAvailable: async () => true,
      },
    );

    await expect(cli.smoke('macos')).rejects.toThrow('launch-storybook failed');

    expect(runner.foreground.map(({ command }) => command)).toEqual(['launch-storybook', 'stop-storybook']);
    expect(runner.background.map(({ command }) => path.basename(command))).toEqual(['node', 'rnx-cli']);
    expect(runner.foreground[0].env).toMatchObject({
      [FURN_STORYBOOK_INSTANCE_ID]: cli.instance.id,
      [FURN_STORYBOOK_BUNDLE_IDENTIFIER]: cli.instance.bundleIdentifier,
      STORYBOOK_WS_PORT: String(cli.instance.storybookPort),
      RCT_METRO_PORT: String(cli.instance.metroPort),
    });
    expect(runner.stopped).toBe(2);
  });

  test('renders every indexed story before cleanup', async () => {
    const runner = new RecordingRunner();
    const output: string[] = [];
    const fetch = jest.fn(async (input: URL | RequestInfo) => {
      const url = input.toString();
      if (url.endsWith('/index.json')) {
        return new Response(
          JSON.stringify({
            entries: {
              first: { id: 'first--story', type: 'story' },
              docs: { id: 'first--docs', type: 'docs' },
              second: { id: 'second--story', type: 'story' },
            },
          }),
        );
      }
      return new Response('{}');
    });
    const blockedPorts = new Set<number>();
    const cli = new DesktopStorybookCli(
      makeConfig({
        macos: {
          run: { command: 'launch-storybook' },
          smoke: {
            stop: { command: 'stop-storybook' },
          },
        },
      }),
      {
        runner,
        fetch,
        isPortAvailable: async (port) => !blockedPorts.has(port),
        output: {
          write: (value) => {
            output.push(value.toString());
            return true;
          },
        },
      },
    );
    blockedPorts.add(cli.instance.storybookPort);
    blockedPorts.add(cli.instance.metroPort);

    await cli.smoke('macos');

    // eslint-disable-next-line @microsoft/sdl/no-insecure-url -- the test exercises the loopback Storybook server
    const serverUrl = `http://127.0.0.1:${cli.instance.storybookPort + 1}`;
    // eslint-disable-next-line @microsoft/sdl/no-insecure-url -- the test exercises the loopback Storybook server
    expect(fetch.mock.calls[0][0]).toBe(`${serverUrl}/index.json`);
    expect(fetch.mock.calls.map(([input]) => input.toString()).filter((url) => url.includes('select-story-sync'))).toEqual([
      `${serverUrl}/select-story-sync/first--story`,
      `${serverUrl}/select-story-sync/second--story`,
    ]);
    expect(output.at(-1)).toBe('Rendered 2 stories.\n');
    expect(runner.background[1].args).toEqual(['start', '--no-interactive', '--port', String(cli.instance.metroPort + 1)]);
    expect(runner.foreground.at(-1)?.command).toBe('stop-storybook');
    expect(runner.stopped).toBe(2);
  });
});

describe('createDesktopStorybookCommand', () => {
  test('honors an explicit platform flag', async () => {
    const runner = new RecordingRunner();
    const program = createDesktopStorybookCommand({ config: makeConfig(), runner });

    await program.parseAsync(['node', 'test', 'bundle', '--windows']);

    expect(runner.foreground.at(-1)).toMatchObject({
      command: 'rnx-cli',
      args: ['bundle', '--dev', 'false', '--platform', 'windows'],
    });
  });

  test('falls back to the configured environment platform', async () => {
    const previousPlatform = process.env[FURN_STORYBOOK_PLATFORM];
    process.env[FURN_STORYBOOK_PLATFORM] = 'win32';
    const runner = new RecordingRunner();
    const program = createDesktopStorybookCommand({ config: makeConfig(), runner });

    try {
      await program.parseAsync(['node', 'test', 'bundle']);
    } finally {
      if (previousPlatform === undefined) {
        delete process.env[FURN_STORYBOOK_PLATFORM];
      } else {
        process.env[FURN_STORYBOOK_PLATFORM] = previousPlatform;
      }
    }

    expect(runner.foreground.at(-1)?.args).toEqual(['bundle', '--dev', 'false', '--platform', 'win32']);
  });

  test('rejects multiple platform flags', async () => {
    const program = createDesktopStorybookCommand({ config: makeConfig(), runner: new RecordingRunner() });
    program.exitOverride();
    program.configureOutput({ writeErr: () => {} });
    program.commands.forEach((command) => {
      command.exitOverride();
      command.configureOutput({ writeErr: () => {} });
    });

    await expect(program.parseAsync(['node', 'test', 'bundle', '--windows', '--macos'])).rejects.toThrow('cannot be used with option');
  });
});
