import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import type { NativeDriverArtifact } from '@fluentui-react-native/desktop-driver';

import { STORYBOOK_SMOKE_MODE } from '../config/commands';
import { makeDesktopStorybookConfig } from '../config/makeDesktopStorybookConfig';
import { FURN_STORYBOOK_BUNDLE_IDENTIFIER, FURN_STORYBOOK_INSTANCE_ID } from '../config/instance';
import { FURN_STORYBOOK_PLATFORM } from '../config/platforms';
import type { DesktopCommandRunner, PreparedDesktopCommand, RunningDesktopCommand } from './commandRunner';
import { createDesktopStorybookCommand } from './createDesktopStorybookCommand';
import { DesktopStorybookCli, parseMacOSRunningApplications, writeMacOSApplicationLeaseFile } from './DesktopStorybookCli';

const storybookRoot = path.resolve(__dirname, '../../../../../apps/storybook');
const nativeDriverArtifact: NativeDriverArtifact = {
  architecture: 'x64',
  artifactId: 'artifact',
  artifactRoot: 'artifact-root',
  buildFingerprint: 'build',
  buildId: 'build-id',
  compatibilityKey: 'compatibility',
  configuration: 'release',
  endpoints: ['windows', 'win32', 'macos'],
  executablePath: 'driver.exe',
  features: ['probe'],
  origin: 'cache',
  provider: 'windows',
  schemaVersion: 1,
  signing: { mode: 'none' },
  sourceDigest: 'source',
  wireProtocol: { major: 1, minor: 0 },
};
const nativeDriverTestOptions = {
  buildNativeDriver: async () => nativeDriverArtifact,
  resolveNativeDriver: async () => nativeDriverArtifact,
  writeMacOSApplicationLease: async () => undefined,
};
const createEmptyStoryManifest = async (_config: unknown, platform: 'macos' | 'windows' | 'win32') => ({
  endpoint: platform,
  entries: [],
  platformManifestDigest: `${platform}-digest`,
  portablePlanDigest: 'portable-digest',
  schemaVersion: 1 as const,
});

describe('macOS application leases', () => {
  test('validates exact running application records and rejects ambiguity', () => {
    expect(
      parseMacOSRunningApplications(
        JSON.stringify([{ executablePath: '/Applications/Storybook.app/Contents/MacOS/Storybook', processId: 42, processStartedAt: 1 }]),
        'com.example.storybook',
      ),
    ).toEqual([{ executablePath: '/Applications/Storybook.app/Contents/MacOS/Storybook', processId: 42, processStartedAt: 1 }]);
    expect(() =>
      parseMacOSRunningApplications(
        JSON.stringify([
          { executablePath: '/Applications/First.app/Contents/MacOS/First', processId: 1, processStartedAt: 1 },
          { executablePath: '/Applications/Second.app/Contents/MacOS/Second', processId: 2, processStartedAt: 2 },
        ]),
        'com.example.storybook',
      ),
    ).toThrow('More than one running application');
    expect(() =>
      parseMacOSRunningApplications(
        JSON.stringify([{ executablePath: null, processId: 42, processStartedAt: null }]),
        'com.example.storybook',
      ),
    ).toThrow('does not expose an executable path');
  });

  test('writes an atomic owner-only lease', () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'furn-storybook-macos-lease-'));
    const leasePath = path.join(root, 'state', 'application.json');
    try {
      writeMacOSApplicationLeaseFile(
        {
          bundleIdentifier: 'com.example.storybook',
          leaseNonce: 'nonce',
          leasePath,
        },
        {
          executablePath: '/Applications/Storybook.app/Contents/MacOS/Storybook',
          processId: 42,
          processStartedAt: 1,
        },
      );
      expect(JSON.parse(fs.readFileSync(leasePath, 'utf8'))).toMatchObject({
        bundleIdentifier: 'com.example.storybook',
        nonce: 'nonce',
        processId: 42,
        schemaVersion: 1,
      });
      if (process.platform !== 'win32') {
        expect(fs.statSync(leasePath).mode & 0o777).toBe(0o600);
      }
    } finally {
      fs.rmSync(root, { force: true, recursive: true });
    }
  });
});

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
  test('starts the config-owned server with platform and connection options', async () => {
    const runner = new RecordingRunner();
    const cli = new DesktopStorybookCli(makeConfig(), { ...nativeDriverTestOptions, runner });

    await cli.server('win32', { host: '0.0.0.0', port: 7100 });

    expect(runner.foreground[0]).toMatchObject({
      command: process.execPath,
      args: [path.resolve(storybookRoot, '../../packages/agentic/storybook-desktop/config/server-runner.cjs')],
      cwd: storybookRoot,
      env: {
        [FURN_STORYBOOK_PLATFORM]: 'win32',
        STORYBOOK_CONFIG_PATH: path.join(storybookRoot, 'src'),
        STORYBOOK_WS_HOST: '0.0.0.0',
        STORYBOOK_WS_PORT: '7100',
      },
    });
  });

  test('uses shared preparation and rnx-cli bundle defaults', async () => {
    const runner = new RecordingRunner();
    const cli = new DesktopStorybookCli(makeConfig(), { ...nativeDriverTestOptions, runner });

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
    const cli = new DesktopStorybookCli(makeConfig(), { ...nativeDriverTestOptions, runner });

    await cli.run('windows');

    expect(runner.foreground[0]).toMatchObject({
      command: 'rnx-cli',
      args: ['run', '--platform', 'windows', '--solution', 'windows/AgenticStorybook.sln'],
    });
    await expect(cli.build('win32')).rejects.toThrow('build is not configured for win32');
  });

  test('runs the standalone macOS app with the enlistment-specific identity', async () => {
    const runner = new RecordingRunner();
    const cli = new DesktopStorybookCli(makeConfig({ macos: { run: { command: 'launch-storybook' } } }), {
      ...nativeDriverTestOptions,
      runner,
    });

    await cli.run('macos');

    expect(runner.foreground[0]).toMatchObject({
      command: 'launch-storybook',
      env: {
        [FURN_STORYBOOK_BUNDLE_IDENTIFIER]: cli.instance.bundleIdentifier,
        [FURN_STORYBOOK_INSTANCE_ID]: cli.instance.id,
        XCODE_XCCONFIG_FILE: path.join(storybookRoot, 'macos', '.storybook-desktop', `${cli.instance.id}.xcconfig`),
      },
    });
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
        ...nativeDriverTestOptions,
        createStoryManifest: createEmptyStoryManifest,
        runner,
        fetch: jest.fn(async () => new Response('{}')),
        isPortAvailable: async () => true,
      },
    );

    await expect(cli.smoke('macos')).rejects.toThrow('launch-storybook failed');

    expect(runner.foreground.map(({ command }) => command)).toEqual(['launch-storybook', 'stop-storybook']);
    expect(runner.background.map(({ command }) => path.basename(command))).toEqual([path.basename(process.execPath), 'rnx-cli']);
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
    const resolveNativeDriver = jest.fn(async () => nativeDriverArtifact);
    const output: string[] = [];
    const fetch = jest.fn(async (input: Parameters<typeof globalThis.fetch>[0]) => {
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
        ...nativeDriverTestOptions,
        createStoryManifest: createEmptyStoryManifest,
        runner,
        fetch,
        isPortAvailable: async (port) => !blockedPorts.has(port),
        output: {
          write: (value) => {
            output.push(value.toString());
            return true;
          },
        },
        resolveNativeDriver,
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
    expect(resolveNativeDriver).not.toHaveBeenCalled();
  });

  test('keeps retrying the first story while the initial Metro bundle is compiling', async () => {
    jest.useFakeTimers();
    try {
      const runner = new RecordingRunner();
      let selectionAttempts = 0;
      const fetch = jest.fn(async (input: Parameters<typeof globalThis.fetch>[0]) => {
        const url = input.toString();
        if (url.endsWith('/index.json')) {
          return new Response(
            JSON.stringify({
              entries: {
                first: { id: 'first--story', type: 'story' },
              },
            }),
          );
        }
        if (url.includes('select-story-sync')) {
          selectionAttempts += 1;
          if (selectionAttempts <= 12) {
            return new Response(JSON.stringify({ error: 'Storybook runtime is not connected yet.' }), { status: 408 });
          }
        }
        return new Response('{}');
      });
      const cli = new DesktopStorybookCli(
        makeConfig({
          macos: {
            run: { command: 'launch-storybook' },
            smoke: {
              startupTimeoutMs: 10_000,
              stop: { command: 'stop-storybook' },
            },
          },
        }),
        {
          ...nativeDriverTestOptions,
          createStoryManifest: createEmptyStoryManifest,
          fetch,
          isPortAvailable: async () => true,
          runner,
        },
      );

      const smoke = cli.smoke('macos');
      await jest.advanceTimersByTimeAsync(7000);
      await smoke;

      expect(selectionAttempts).toBe(13);
    } finally {
      jest.useRealTimers();
    }
  });

  test('runs authored tests after traversing the complete story index', async () => {
    const runner = new RecordingRunner();
    const resolveNativeDriver = jest.fn(async () => nativeDriverArtifact);
    const events: string[] = [];
    const writeMacOSApplicationLease = jest.fn(async () => {
      events.push('lease');
    });
    const fetch = jest.fn(async (input: Parameters<typeof globalThis.fetch>[0]) => {
      const url = input.toString();
      if (url.endsWith('/index.json')) {
        return new Response(
          JSON.stringify({
            entries: {
              first: { id: 'first--story', type: 'story' },
              second: { id: 'second--story', type: 'story' },
            },
          }),
        );
      }
      if (url.includes('select-story-sync')) {
        events.push(`select:${url.split('/').at(-1)}`);
      }
      return new Response('{}');
    });
    const runSmokeTests = jest.fn(async () => {
      events.push('tests');
      return {
        endpoint: 'macos' as const,
        finishedAt: '2026-08-30T08:00:01.000Z',
        manifest: {
          platform: 'macos-digest',
          portable: 'portable-digest',
        },
        platformName: 'macos' as const,
        runId: 'smoke-run',
        schemaVersion: 1 as const,
        startedAt: '2026-08-30T08:00:00.000Z',
        status: 'passed' as const,
        targetId: 'agenticstorybook-macos',
        tests: [],
      };
    });
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
        ...nativeDriverTestOptions,
        createStoryManifest: createEmptyStoryManifest,
        fetch,
        isPortAvailable: async () => true,
        runSmokeTests,
        runner,
        resolveNativeDriver,
        writeMacOSApplicationLease,
      },
    );

    await cli.smoke('macos', { mode: 'stories-and-tests' });

    expect(events).toEqual(['lease', 'select:first--story', 'select:second--story', 'tests']);
    expect(writeMacOSApplicationLease).toHaveBeenCalledWith(
      path.join(storybookRoot, 'storybook-desktop.generated', 'driver-manifest.macos.json'),
      120_000,
    );
    expect(runSmokeTests).toHaveBeenCalledWith({
      // eslint-disable-next-line @microsoft/sdl/no-insecure-url -- the test exercises the loopback Desktop Driver
      driverUrl: `http://127.0.0.1:${cli.instance.driverPort}`,
      platform: 'macos',
      projectRoot: storybookRoot,
      targetId: 'agenticstorybook-macos',
    });
    expect(fetch.mock.calls.map(([input]) => input.toString())).toContain(
      // eslint-disable-next-line @microsoft/sdl/no-insecure-url -- the test exercises the loopback Desktop Driver
      `http://127.0.0.1:${cli.instance.driverPort}/status`,
    );
    expect(runner.background[0].env).toMatchObject({
      [STORYBOOK_SMOKE_MODE]: 'stories-and-tests',
    });
    expect(resolveNativeDriver).toHaveBeenCalledWith({
      buildPolicy: 'if-missing',
      cacheRoot: undefined,
      configuration: 'release',
      helperPath: undefined,
      installRoot: undefined,
      macosSigningIdentity: undefined,
      platform: 'macos',
    });
  });
});

describe('createDesktopStorybookCommand', () => {
  test('builds the native helper without running app preparation', async () => {
    const runner = new RecordingRunner();
    const buildNativeDriver = jest.fn(async () => nativeDriverArtifact);
    const program = createDesktopStorybookCommand({
      ...nativeDriverTestOptions,
      buildNativeDriver,
      config: makeConfig(),
      output: { write: () => true },
      runner,
    });

    await program.parseAsync(['node', 'test', 'build-driver', '--windows', '--force']);

    expect(buildNativeDriver).toHaveBeenCalledWith({
      cacheRoot: undefined,
      configuration: 'release',
      force: true,
      macosSigningIdentity: undefined,
      platform: 'windows',
    });
    expect(runner.foreground).toEqual([]);
    expect(runner.background).toEqual([]);
  });

  test('forwards the selected smoke mode and isolated instance to a package-owned lifecycle', async () => {
    const runner = new RecordingRunner();
    const program = createDesktopStorybookCommand({
      ...nativeDriverTestOptions,
      config: makeConfig({
        windows: {
          smoke: {
            command: { command: 'smoke-windows' },
          },
        },
      }),
      createStoryManifest: createEmptyStoryManifest,
      isPortAvailable: async () => true,
      runner,
    });
    const manifestPath = path.join(storybookRoot, 'storybook-desktop.generated', 'driver-manifest.windows.json');

    try {
      await program.parseAsync(['node', 'test', 'smoke', '--windows', '--mode', 'stories-and-tests']);

      expect(runner.foreground[0]).toMatchObject({
        command: 'smoke-windows',
        env: {
          [FURN_STORYBOOK_INSTANCE_ID]: expect.any(String),
          [STORYBOOK_SMOKE_MODE]: 'stories-and-tests',
          STORYBOOK_DRIVER_MANIFEST: manifestPath,
          STORYBOOK_DRIVER_PORT: expect.any(String),
          STORYBOOK_WS_PORT: expect.any(String),
          RCT_METRO_PORT: expect.any(String),
        },
      });
    } finally {
      fs.rmSync(manifestPath, { force: true });
    }
  });

  test('starts the channel and embedded driver from one server command', async () => {
    const runner = new RecordingRunner();
    const program = createDesktopStorybookCommand({
      ...nativeDriverTestOptions,
      config: makeConfig(),
      createStoryManifest: createEmptyStoryManifest,
      isPortAvailable: async () => true,
      runner,
    });
    const manifestPath = path.join(storybookRoot, 'storybook-desktop.generated', 'driver-manifest.win32.json');

    try {
      await program.parseAsync(['node', 'test', 'driver', '--win32', '--host', 'localhost', '--port', '7102']);

      expect(runner.foreground[0]).toMatchObject({
        args: [path.resolve(storybookRoot, '../../packages/agentic/storybook-desktop/config/server-runner.cjs')],
        env: {
          [FURN_STORYBOOK_PLATFORM]: 'win32',
          STORYBOOK_DRIVER_MANIFEST: manifestPath,
          STORYBOOK_DRIVER_PORT: expect.any(String),
          STORYBOOK_WS_HOST: 'localhost',
          STORYBOOK_WS_PORT: '7102',
        },
      });
      expect(runner.background[0]).toMatchObject({
        command: 'rnx-cli',
        args: ['start', '--no-interactive', '--port', expect.any(String)],
        env: { STORYBOOK_DRIVER_MANIFEST: manifestPath },
      });
      const firstManifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8')) as Record<string, unknown>;
      expect(firstManifest).toMatchObject({
        endpoint: 'win32',
        targetId: 'agenticstorybook-win32',
        testIDPrefix: 'agentic-storybook',
      });

      const secondRunner = new RecordingRunner();
      const secondProgram = createDesktopStorybookCommand({
        ...nativeDriverTestOptions,
        config: makeConfig(),
        createStoryManifest: createEmptyStoryManifest,
        isPortAvailable: async () => true,
        runner: secondRunner,
      });
      await secondProgram.parseAsync(['node', 'test', 'driver', '--win32', '--host', 'localhost', '--port', '7102']);
      const secondManifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8')) as Record<string, unknown>;
      expect(secondManifest.bridgeNonce).toBe(firstManifest.bridgeNonce);
    } finally {
      fs.rmSync(manifestPath, { force: true });
    }
  });

  test('forwards server platform and connection options', async () => {
    const runner = new RecordingRunner();
    const program = createDesktopStorybookCommand({ ...nativeDriverTestOptions, config: makeConfig(), runner });

    await program.parseAsync(['node', 'test', 'server', '--win32', '--host', 'localhost', '--port', '7101']);

    expect(runner.foreground[0]).toMatchObject({
      args: [path.resolve(storybookRoot, '../../packages/agentic/storybook-desktop/config/server-runner.cjs')],
      env: {
        [FURN_STORYBOOK_PLATFORM]: 'win32',
        STORYBOOK_WS_HOST: 'localhost',
        STORYBOOK_WS_PORT: '7101',
      },
    });
  });

  test('honors an explicit platform flag', async () => {
    const runner = new RecordingRunner();
    const program = createDesktopStorybookCommand({ ...nativeDriverTestOptions, config: makeConfig(), runner });

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
    const program = createDesktopStorybookCommand({ ...nativeDriverTestOptions, config: makeConfig(), runner });

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
    const program = createDesktopStorybookCommand({
      ...nativeDriverTestOptions,
      config: makeConfig(),
      runner: new RecordingRunner(),
    });
    program.exitOverride();
    program.configureOutput({ writeErr: () => {} });
    program.commands.forEach((command) => {
      command.exitOverride();
      command.configureOutput({ writeErr: () => {} });
    });

    await expect(program.parseAsync(['node', 'test', 'bundle', '--windows', '--macos'])).rejects.toThrow('cannot be used with option');
  });
});
