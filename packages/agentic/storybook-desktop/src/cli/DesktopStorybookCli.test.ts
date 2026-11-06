import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import type { NativeDriverArtifact } from '@fluentui-react-native/desktop-driver';
import { DesktopServiceScope } from '@fluentui-react-native/desktop-test';
import type { ResolvedDesktopConfig, ResolvedDesktopTarget } from '@fluentui-react-native/desktop-test';
import { selectDesktopRenderer } from '@fluentui-react-native/desktop-test/config';

import { STORYBOOK_SMOKE_MODE } from '../config/commands';
import { DesktopStorybookConfig, makeDesktopStorybookConfig } from '../config/makeDesktopStorybookConfig';
import { FURN_STORYBOOK_BUNDLE_IDENTIFIER, FURN_STORYBOOK_INSTANCE_ID } from '../config/instance';
import { FURN_STORYBOOK_PLATFORM } from '../config/platforms';
import type { DesktopCommandRunner, PreparedDesktopCommand, RunningDesktopCommand } from './commandRunner';
import { createDesktopStorybookCommand } from './createDesktopStorybookCommand';
import {
  DesktopStorybookCli,
  maintainMacOSApplicationLease,
  parseMacOSRunningApplications,
  writeMacOSApplicationLeaseFile,
  type MacOSRunningApplication,
} from './DesktopStorybookCli';

const appRoot = path.resolve(__dirname, '../../../../../apps/storybook');
const linkedAppDirectories = ['node_modules', 'src'];
// CLI commands replace driver manifests, leases, and agent readiness records under the project root, so they run
// against a copy that cannot disturb a live Storybook instance of the real app.
const storybookRoot = createIsolatedStorybookRoot();
afterAll(() => removeIsolatedStorybookRoot(storybookRoot));

function createIsolatedStorybookRoot(): string {
  const root = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'furn-storybook-cli-')));
  for (const file of ['app.json', 'package.json']) fs.copyFileSync(path.join(appRoot, file), path.join(root, file));
  for (const directory of linkedAppDirectories) fs.symlinkSync(path.join(appRoot, directory), path.join(root, directory), 'junction');
  return root;
}

function removeIsolatedStorybookRoot(root: string): void {
  // Remove the links themselves first so cleanup can never recurse into the real app.
  for (const directory of linkedAppDirectories) {
    const link = path.join(root, directory);
    if (process.platform === 'win32') fs.rmdirSync(link);
    else fs.unlinkSync(link);
  }
  fs.rmSync(root, { force: true, recursive: true });
}

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

  test('keeps the lease naming the one running application', async () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'furn-storybook-macos-lease-'));
    const leasePath = path.join(root, 'application.json');
    const manifestPath = path.join(root, 'driver-manifest.json');
    fs.writeFileSync(
      manifestPath,
      JSON.stringify({ application: { bundleIdentifier: 'com.example.storybook', leaseNonce: 'nonce', leasePath } }),
    );
    const running = (processId: number): MacOSRunningApplication => ({
      executablePath: '/Applications/Storybook.app/Contents/MacOS/Storybook',
      processId,
      processStartedAt: processId,
    });
    const answers: (() => MacOSRunningApplication[])[] = [
      () => [],
      () => [running(42)],
      () => {
        fs.rmSync(leasePath);
        return [running(42)];
      },
      () => {
        throw new Error('query failed');
      },
      () => {
        throw new Error('query failed');
      },
      () => [running(42), running(43)],
      () => [running(43)],
    ];
    const leased: (number | undefined)[] = [];
    const warnings: string[] = [];
    const controller = new AbortController();
    try {
      await expect(
        maintainMacOSApplicationLease(manifestPath, controller.signal, {
          intervalMs: 1,
          onWarning: (message) => warnings.push(message),
          queryApplications: async (bundleIdentifier) => {
            expect(bundleIdentifier).toBe('com.example.storybook');
            leased.push(fs.existsSync(leasePath) ? JSON.parse(fs.readFileSync(leasePath, 'utf8')).processId : undefined);
            const answer = answers.shift();
            if (!answer) controller.abort(new Error('maintenance stopped'));
            return answer?.() ?? [];
          },
        }),
      ).rejects.toThrow('maintenance stopped');
      expect(leased).toEqual([undefined, undefined, 42, 42, 42, 42, 42, 43]);
      expect(warnings).toEqual(['query failed', 'More than one running application has bundle identifier "com.example.storybook".']);
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
  exitService?: string;

  async run(command: PreparedDesktopCommand): Promise<void> {
    this.foreground.push(command);
    if (command.command === this.failCommand) {
      throw new Error(`${command.command} failed`);
    }
  }

  start(command: PreparedDesktopCommand): RunningDesktopCommand {
    this.background.push(command);
    return {
      completed: command.context?.service === this.exitService && this.exitService ? Promise.resolve(7) : new Promise<number>(() => {}),
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
  test('discovers classifications, selects both lanes, and rejects unclassified callbacks before filters hide them', async () => {
    const output = { write: jest.fn() };
    const config = makeDesktopStorybookConfig({ projectRoot: storybookRoot });
    const inputModes = {
      semantics: { win32: 'both' as const },
      pointer: { win32: 'physical' as const },
      action: { win32: 'accessibility' as const },
    };
    const manifest = {
      endpoint: 'win32' as const,
      schemaVersion: 1 as const,
      platformManifestDigest: 'digest',
      portablePlanDigest: 'portable',
      entries: [
        {
          id: 'button--default',
          name: 'Default',
          title: 'Button',
          sourcePath: 'button.stories.tsx',
          packageName: 'fixture',
          tags: [],
          wdio: { exportName: 'Default', digest: 'callback', testNames: ['semantics', 'pointer', 'action'], inputModes },
        },
      ],
    };
    const cli = new DesktopStorybookCli(config, { createStoryManifest: async () => manifest, output });
    await cli.test('win32', { list: true });
    expect(JSON.parse(output.write.mock.calls[0][0])[0].inputModes).toEqual(inputModes);
    for (const inputMode of ['accessibility', 'physical'] as const) {
      output.write.mockClear();
      await cli.test('win32', { list: true, inputMode });
      expect(JSON.parse(output.write.mock.calls[0][0])[0].tests).toEqual(['semantics', inputMode === 'physical' ? 'pointer' : 'action']);
    }
    manifest.entries[0].wdio.testNames.push('unclassified');
    await expect(cli.test('win32', { list: true, inputMode: 'physical', test: 'pointer' })).rejects.toThrow(
      /Unclassified win32 wdio callback: button--default \/ unclassified/,
    );
  });

  test.each(['plain', 'json', 'ndjson'] as const)(
    'lists exact callback pairs without a story/name cross-product with the %s reporter',
    async (reporterMode) => {
      const output = { write: jest.fn() };
      const config = makeDesktopStorybookConfig({
        projectRoot: storybookRoot,
        wdio: {
          testCases: [
            { storyId: 'button--first', testName: 'physical' },
            { storyId: 'button--second', testName: 'accessibility' },
          ],
        },
      });
      const createStoryManifest = async () => ({
        endpoint: 'win32' as const,
        schemaVersion: 1 as const,
        platformManifestDigest: 'digest',
        portablePlanDigest: 'portable',
        entries: ['first', 'second'].map((name) => ({
          id: `button--${name}`,
          name,
          title: 'Button',
          sourcePath: 'button.stories.tsx',
          packageName: 'fixture',
          tags: [],
          wdio: { exportName: name, digest: 'callback', testNames: ['physical', 'accessibility'] },
        })),
      });
      const cli = new DesktopStorybookCli(config, { createStoryManifest, output, reporterMode });
      await cli.test('win32', { list: true });
      const actual = JSON.parse(output.write.mock.calls[0][0]);
      expect(reporterMode === 'ndjson' ? actual.result : actual).toEqual([
        { id: 'button--first', sourcePath: 'button.stories.tsx', tests: ['physical'] },
        { id: 'button--second', sourcePath: 'button.stories.tsx', tests: ['accessibility'] },
      ]);
      await expect(
        cli.test('win32', {
          list: true,
          testCases: [
            { storyId: 'button--first', testName: 'physical' },
            { storyId: 'button--second', testName: 'missing' },
          ],
        }),
      ).rejects.toThrow('No executable wdio callback matches declared identity');
    },
  );

  test('discovers and filters named callbacks without connecting to an app', async () => {
    const output = { write: jest.fn() };
    const config = makeDesktopStorybookConfig({ projectRoot: storybookRoot, wdio: { test: 'semantics' } });
    const createStoryManifest = async () => ({
      endpoint: 'macos' as const,
      schemaVersion: 1 as const,
      platformManifestDigest: 'digest',
      portablePlanDigest: 'portable',
      entries: [
        {
          id: 'button--default',
          name: 'Default',
          title: 'Button',
          sourcePath: 'button.stories.tsx',
          packageName: 'fixture',
          tags: [],
          wdio: { exportName: 'Default', digest: 'callback', testNames: ['semantics', 'native activation'] },
        },
      ],
    });
    const command = createDesktopStorybookCommand({ config, createStoryManifest, output });
    await command.parseAsync(['node', 'storybook', 'test', '--macos', '--list', '--test', '*activation*']);
    expect(JSON.parse(output.write.mock.calls[0][0])).toEqual([
      { id: 'button--default', sourcePath: 'button.stories.tsx', tests: ['native activation'] },
    ]);
    const cli = new DesktopStorybookCli(config, { createStoryManifest, output });
    await expect(cli.test('macos', { list: true, test: 'missing' })).rejects.toThrow('No executable');
  });

  test('supports structured reporter output and rejects event levels outside NDJSON mode', async () => {
    const output = { write: jest.fn() };
    const config = makeDesktopStorybookConfig({ projectRoot: storybookRoot, storyPackages: [] });
    const createStoryManifest = async () => ({
      endpoint: 'macos' as const,
      schemaVersion: 1 as const,
      platformManifestDigest: 'digest',
      portablePlanDigest: 'portable',
      entries: [
        {
          id: 'button--default',
          name: 'Default',
          title: 'Button',
          sourcePath: 'button.stories.tsx',
          packageName: 'fixture',
          tags: [],
          wdio: { exportName: 'Default', digest: 'callback' },
        },
      ],
    });

    await createDesktopStorybookCommand({ config, createStoryManifest, output }).parseAsync([
      'node',
      'storybook',
      'test',
      '--macos',
      '--list',
      '--reporter',
      'json',
    ]);
    expect(JSON.parse(output.write.mock.calls[0][0])).toEqual([{ id: 'button--default', sourcePath: 'button.stories.tsx' }]);

    await expect(
      createDesktopStorybookCommand({ config, createStoryManifest, output }).parseAsync([
        'node',
        'storybook',
        'test',
        '--macos',
        '--list',
        '--events',
        'progress',
      ]),
    ).rejects.toThrow('--events requires --reporter ndjson.');
  });

  test('prints story navigation failures before throwing the smoke summary', async () => {
    const runner = new RecordingRunner();
    const errorOutput = { write: jest.fn() };
    const fetch: typeof globalThis.fetch = async (input) => {
      const url = String(input);
      if (url.includes('select-story-sync')) {
        return new Response(JSON.stringify({ error: 'render failed while mounting the preview' }), { status: 500 });
      }
      return new Response(JSON.stringify({ entries: { broken: { id: 'components-button--broken', type: 'story' } } }));
    };
    const cli = new DesktopStorybookCli(
      makeConfig({
        macos: { run: { command: 'launch-storybook' }, smoke: { stop: { command: 'stop-storybook' }, startupTimeoutMs: 100 } },
      }),
      { ...nativeDriverTestOptions, runner, fetch, errorOutput, output: { write: () => true }, isPortAvailable: async () => true },
    );
    await expect(cli.smoke('macos')).rejects.toThrow('components-button--broken');
    expect(errorOutput.write).toHaveBeenCalledWith(expect.stringContaining('[storybook] FAIL navigation "components-button--broken"'));
    expect(errorOutput.write).toHaveBeenCalledWith(expect.stringContaining('render failed while mounting the preview'));
    expect(runner.stopped).toBe(2);
  });

  test('discovers executable callbacks with config filters and no native connection', async () => {
    const runner = new RecordingRunner();
    const output = { write: jest.fn() };
    const config = makeDesktopStorybookConfig({
      projectRoot: storybookRoot,
      storyPackages: [],
      wdio: { tag: 'inline' },
    });
    const createStoryManifest = async () => ({
      endpoint: 'macos' as const,
      schemaVersion: 1 as const,
      platformManifestDigest: 'digest',
      portablePlanDigest: 'portable',
      entries: [
        {
          id: 'button--default',
          name: 'Default',
          title: 'Button',
          sourcePath: 'button.stories.tsx',
          packageName: 'fixture',
          tags: ['inline'],
          wdio: { digest: 'callback', exportName: 'Default' },
        },
        {
          id: 'button--other',
          name: 'Other',
          title: 'Button',
          sourcePath: 'button.stories.tsx',
          packageName: 'fixture',
          tags: [],
          wdio: { digest: 'other', exportName: 'Other' },
        },
      ],
    });
    const command = createDesktopStorybookCommand({ config, runner, createStoryManifest, output });
    await command.parseAsync(['node', 'storybook', 'test', '--macos', '--list']);
    expect(JSON.parse(output.write.mock.calls[0][0])).toEqual([{ id: 'button--default', sourcePath: 'button.stories.tsx' }]);
    expect(runner.foreground).toEqual([]);

    const cli = new DesktopStorybookCli(config, { runner, createStoryManifest, output });
    await expect(cli.test('macos', { list: true, story: 'missing--*' })).rejects.toThrow('No executable');
    await expect(cli.test('macos', { url: 'https://127.0.0.1:1234' })).rejects.toThrow('Pass --url and --target together');
    await expect(cli.test('macos', { timeoutMs: 0 })).rejects.toThrow('wdio.timeoutMs');
  });

  test('starts the config-owned server with platform and connection options', async () => {
    const runner = new RecordingRunner();
    const services = new DesktopServiceScope(runner);
    const output = { write: jest.fn() };
    const onReady = jest.fn(() => expect(output.write).toHaveBeenCalledTimes(1));
    const fetch: typeof globalThis.fetch = async () => {
      setTimeout(() => services.requestStop(), 0);
      return new Response('{}');
    };
    const cli = new DesktopStorybookCli(makeConfig(), {
      ...nativeDriverTestOptions,
      fetch,
      onReady,
      output,
      reporterMode: 'json',
      runner,
      services,
    });

    await expect(cli.server('win32', { host: '0.0.0.0', port: 7100 })).rejects.toThrow('Owned desktop service stop requested.');

    expect(runner.background[0]).toMatchObject({
      command: process.execPath,
      args: [path.resolve(__dirname, '../../config/server-runner.cjs')],
      cwd: storybookRoot,
      env: {
        [FURN_STORYBOOK_PLATFORM]: 'win32',
        STORYBOOK_CONFIG_PATH: path.join(storybookRoot, 'src'),
        STORYBOOK_WS_HOST: '0.0.0.0',
        STORYBOOK_WS_PORT: '7100',
      },
    });
    expect(output.write).toHaveBeenCalledWith('{"type":"ready","host":"0.0.0.0","port":7100}\n');
    expect(onReady).toHaveBeenCalledTimes(1);
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
    expect(runner.foreground[0].env).not.toHaveProperty('RCT_NEW_ARCH_ENABLED');
  });

  test.each([true, false])('applies the macOS renderer to every command with paper=%s', async (paper) => {
    const runner = new RecordingRunner();
    const cli = new DesktopStorybookCli(makeConfig(), { ...nativeDriverTestOptions, paper, runner });

    await cli.prep('macos', { driver: false });
    await cli.bundle('macos');
    await cli.build('macos');
    await cli.run('macos');

    expect(runner.foreground.map(({ command }) => command)).toEqual(['pod', 'sb-rn-get-stories', 'rnx-cli', 'rnx-cli', 'rnx-cli']);
    expect(runner.foreground.every(({ env }) => env.RCT_NEW_ARCH_ENABLED === (paper ? '0' : '1'))).toBe(true);
  });

  test('switches back to Fabric explicitly after Paper preparation', async () => {
    const runner = new RecordingRunner();
    const paper = new DesktopStorybookCli(makeConfig(), { ...nativeDriverTestOptions, paper: true, runner });
    const fabric = new DesktopStorybookCli(makeConfig(), { ...nativeDriverTestOptions, runner });

    await paper.prep('macos', { driver: false });
    await fabric.prep('macos', { driver: false });

    expect(runner.foreground.map(({ env }) => env.RCT_NEW_ARCH_ENABLED)).toEqual(['0', '1']);
  });

  test('rotates the authenticated bridge nonce when switching macOS renderers', async () => {
    const options = {
      ...nativeDriverTestOptions,
      createStoryManifest: createEmptyStoryManifest,
      isPortAvailable: async () => true,
      output: { write: () => true },
      runner: new RecordingRunner(),
    };
    options.runner.exitService = 'storybook-channel';
    const manifestPath = path.join(storybookRoot, 'storybook-desktop.generated', 'driver-manifest.macos.json');

    try {
      await expect(new DesktopStorybookCli(makeConfig(), options).driver('macos')).rejects.toThrow('exited unexpectedly');
      const fabricManifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
      await expect(new DesktopStorybookCli(makeConfig(), { ...options, paper: true }).driver('macos')).rejects.toThrow(
        'exited unexpectedly',
      );
      const paperManifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
      await expect(new DesktopStorybookCli(makeConfig(), { ...options, paper: true }).driver('macos')).rejects.toThrow(
        'exited unexpectedly',
      );
      const repeatedPaperManifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

      expect(fabricManifest.renderer).toBe('fabric');
      expect(paperManifest.renderer).toBe('paper');
      expect(paperManifest.bridgeNonce).not.toBe(fabricManifest.bridgeNonce);
      expect(repeatedPaperManifest.bridgeNonce).toBe(paperManifest.bridgeNonce);
    } finally {
      fs.rmSync(manifestPath, { force: true });
    }
  });

  test('reports readiness only after the agent connection is published, then keeps the macOS lease', async () => {
    const generated = path.join(storybookRoot, 'storybook-desktop.generated');
    const manifestPath = path.join(generated, 'driver-manifest.macos.json');
    const readyPath = path.join(generated, 'agent-ready.macos.json');
    const runner = new RecordingRunner();
    const services = new DesktopServiceScope(runner);
    const written: string[] = [];
    const maintained: string[] = [];
    const fetch: typeof globalThis.fetch = async (input) => {
      if (String(input).endsWith('/index.json')) {
        setTimeout(() => fs.writeFileSync(readyPath, JSON.stringify({ descriptor: 'custom.json', processId: 1, schemaVersion: 1 })), 300);
      }
      return new Response('{}');
    };
    const createStoryManifest = async () => ({
      ...(await createEmptyStoryManifest(undefined, 'macos')),
      entries: [
        {
          id: 'button--default',
          name: 'Default',
          title: 'Button',
          sourcePath: 'button.stories.tsx',
          packageName: 'fixture',
          tags: [],
          wdio: { digest: 'callback', exportName: 'Default' },
        },
      ],
    });
    const cli = new DesktopStorybookCli(makeConfig(), {
      ...nativeDriverTestOptions,
      createStoryManifest,
      fetch,
      isPortAvailable: async () => true,
      maintainMacOSApplicationLease: async (leaseManifestPath, signal) => {
        expect(written).toEqual([expect.stringMatching(/^published: Storybook instance .*, agent=custom\.json\n$/), 'onReady']);
        maintained.push(leaseManifestPath);
        services.requestStop();
        signal.throwIfAborted();
        throw new Error('unreachable');
      },
      onReady: () => written.push('onReady'),
      output: { write: (chunk: string) => written.push(`${fs.existsSync(readyPath) ? 'published' : 'unpublished'}: ${chunk}`) > 0 },
      runner,
      services,
    });
    try {
      await expect(cli.driver('macos', { agent: { descriptor: 'custom.json', root: 'relative-root' } })).rejects.toThrow(
        'Owned desktop service stop requested.',
      );
      expect(JSON.parse(fs.readFileSync(manifestPath, 'utf8')).agent).toEqual({
        descriptor: 'custom.json',
        readyPath,
        root: path.resolve('relative-root'),
      });
      expect(maintained).toEqual([manifestPath]);
      await expect(new DesktopStorybookCli(makeConfig(), { createStoryManifest, runner }).test('macos')).rejects.toThrow('serves an agent');
    } finally {
      fs.rmSync(manifestPath, { force: true });
      fs.rmSync(readyPath, { force: true });
    }
  });

  test.each([
    {
      name: 'a configured AUMID',
      platform: 'windows' as const,
      configure: { windows: { nativeDriver: { application: { aumid: 'Fixture_abc!App' } } } },
      expected: { aumid: 'Fixture_abc!App' },
      resolved: false,
    },
    {
      name: 'the desktop target identity without launch fields',
      platform: 'win32' as const,
      configure: {},
      expected: { executablePath: 'ReactTest.exe' },
      resolved: true,
    },
  ])('gives a $platform agent $name instead of a lease nothing maintains', async ({ platform, configure, expected, resolved }) => {
    const generated = path.join(storybookRoot, 'storybook-desktop.generated');
    const manifestPath = path.join(generated, `driver-manifest.${platform}.json`);
    const readyPath = path.join(generated, `agent-ready.${platform}.json`);
    const runner = new RecordingRunner();
    const services = new DesktopServiceScope(runner);
    const config = makeConfig(configure);
    const target = { endpoint: platform, projectRoot: storybookRoot, host: { kind: 'rex', windowTitle: 'Fixture' } };
    jest.spyOn(config, 'getDesktopTarget').mockReturnValue(target as unknown as ReturnType<typeof config.getDesktopTarget>);
    const resolveDesktopApplication = jest.fn(async () => ({
      arguments: ['basePath', 'dist'],
      executablePath: 'ReactTest.exe',
      windowTitle: 'Fixture',
      workingDirectory: 'rex',
    }));
    const fetch: typeof globalThis.fetch = async (input) => {
      if (String(input).endsWith('/index.json')) {
        setTimeout(() => fs.writeFileSync(readyPath, JSON.stringify({ descriptor: 'agent.json', processId: 1, schemaVersion: 1 })), 50);
      }
      return new Response('{}');
    };
    const cli = new DesktopStorybookCli(config, {
      ...nativeDriverTestOptions,
      createStoryManifest: createEmptyStoryManifest,
      fetch,
      isPortAvailable: async () => true,
      maintainMacOSApplicationLease: async () => {
        throw new Error('Windows agents must not maintain a macOS lease.');
      },
      onReady: () => services.requestStop(),
      output: { write: () => true },
      resolveDesktopApplication,
      runner,
      services,
    });
    try {
      await expect(cli.driver(platform, { agent: { descriptor: 'agent.json' } })).rejects.toThrow('Owned desktop service stop requested.');
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
      expect(manifest.agent.application).toEqual({ windowTitle: expect.any(String), ...expected });
      expect(manifest.application.leasePath).toEqual(expect.any(String));
      expect(resolveDesktopApplication).toHaveBeenCalledTimes(resolved ? 1 : 0);
      if (resolved) expect(resolveDesktopApplication).toHaveBeenCalledWith(target, expect.any(AbortSignal), { attach: true });
    } finally {
      fs.rmSync(manifestPath, { force: true });
      fs.rmSync(readyPath, { force: true });
    }
  });

  test('refuses a Windows agent without a verifiable application identity', async () => {
    const config = makeConfig();
    jest.spyOn(config, 'getDesktopTarget').mockReturnValue(undefined);
    const runner = new RecordingRunner();
    const cli = new DesktopStorybookCli(config, {
      ...nativeDriverTestOptions,
      createStoryManifest: createEmptyStoryManifest,
      isPortAvailable: async () => true,
      runner,
    });
    await expect(cli.driver('windows', { agent: {} })).rejects.toThrow('verified application identity');
    expect(runner.background).toEqual([]);
  });

  // eslint-disable-next-line @microsoft/sdl/no-insecure-url -- React Native Test App connects to loopback Metro
  const fixedWindowsMetroUrl = 'http://127.0.0.1:8081/status';

  test('serves Metro on the fixed port a Windows Debug host reads', async () => {
    const manifestPath = path.join(storybookRoot, 'storybook-desktop.generated', 'driver-manifest.windows.json');
    const runner = new RecordingRunner();
    const services = new DesktopServiceScope(runner);
    const config = makeConfig({ windows: { smoke: { metroUrl: fixedWindowsMetroUrl } } });
    const cli = new DesktopStorybookCli(config, {
      ...nativeDriverTestOptions,
      createStoryManifest: createEmptyStoryManifest,
      fetch: async () => new Response('{}'),
      isPortAvailable: async () => true,
      onReady: () => services.requestStop(),
      output: { write: () => true },
      runner,
      services,
    });
    try {
      await expect(cli.driver('windows')).rejects.toThrow('Owned desktop service stop requested.');
      expect(runner.background[0].args).toEqual(['start', '--no-interactive', '--port', '8081']);
      expect(runner.background[1].env.RCT_METRO_PORT).toBe('8081');
      expect(JSON.parse(fs.readFileSync(manifestPath, 'utf8')).metroPort).toBe(8081);
    } finally {
      fs.rmSync(manifestPath, { force: true });
    }
  });

  test('refuses to move Metro off the fixed port a Windows Debug host reads', async () => {
    const runner = new RecordingRunner();
    const cli = new DesktopStorybookCli(makeConfig({ windows: { smoke: { metroUrl: fixedWindowsMetroUrl } } }), {
      ...nativeDriverTestOptions,
      createStoryManifest: createEmptyStoryManifest,
      isPortAvailable: async (port) => port !== 8081,
      runner,
    });
    await expect(cli.driver('windows')).rejects.toThrow('Metro on port 8081, which is in use');
    expect(runner.background).toEqual([]);
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

  test.each([undefined, 150_000])(
    'allows a cold development bundle to take longer than the service startup timeout (initialRenderTimeoutMs: %s)',
    async (initialRenderTimeoutMs) => {
      jest.useFakeTimers();
      try {
        const runner = new RecordingRunner();
        const readyAt = Date.now() + 130_000;
        const output = { write: jest.fn() };
        const fetch: typeof globalThis.fetch = async (input) => {
          if (String(input).includes('select-story-sync')) {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            if (Date.now() < readyAt) {
              return new Response(JSON.stringify({ error: 'Storybook runtime is not connected yet.' }), { status: 408 });
            }
            return new Response('{}');
          }
          return new Response(JSON.stringify({ entries: { first: { id: 'first--story', type: 'story' } } }));
        };
        const cli = new DesktopStorybookCli(
          makeConfig({
            macos: { run: { command: 'launch-storybook' }, smoke: { initialRenderTimeoutMs, stop: { command: 'stop-storybook' } } },
          }),
          { ...nativeDriverTestOptions, runner, fetch, output, errorOutput: { write: () => true }, isPortAvailable: async () => true },
        );

        const result = cli.smoke('macos').catch((error: unknown) => error);
        await jest.advanceTimersByTimeAsync(131_000);
        expect(await result).toBeUndefined();
        expect(output.write).toHaveBeenCalledWith('Rendered 1 stories.\n');
        expect(runner.stopped).toBe(2);
      } finally {
        jest.useRealTimers();
      }
    },
  );

  test.each([
    { smokeOptions: {}, firstRenders: false, timeoutMs: 300_000 },
    { smokeOptions: { startupTimeoutMs: 2000 }, firstRenders: false, timeoutMs: 2000 },
    { smokeOptions: { startupTimeoutMs: 10_000, initialRenderTimeoutMs: 2000 }, firstRenders: false, timeoutMs: 2000 },
    { smokeOptions: { initialRenderTimeoutMs: 60_000 }, firstRenders: true, timeoutMs: 15_000 },
  ])('bounds navigation and preserves the cause (%j)', async ({ smokeOptions, firstRenders, timeoutMs }) => {
    jest.useFakeTimers();
    try {
      const runner = new RecordingRunner();
      const fetch: typeof globalThis.fetch = async (input, init) => {
        const url = String(input);
        if (url.includes('select-story-sync')) {
          if (firstRenders && url.endsWith('first--story')) {
            return new Response('{}');
          }
          return new Promise((_resolve, reject) => {
            init!.signal!.addEventListener('abort', () => reject(init!.signal!.reason), { once: true });
          });
        }
        return new Response(
          JSON.stringify({
            entries: {
              first: { id: 'first--story', type: 'story' },
              second: { id: 'second--story', type: 'story' },
            },
          }),
        );
      };
      const cli = new DesktopStorybookCli(
        makeConfig({
          macos: { run: { command: 'launch-storybook' }, smoke: { ...smokeOptions, stop: { command: 'stop-storybook' } } },
        }),
        {
          ...nativeDriverTestOptions,
          runner,
          fetch,
          output: { write: () => true },
          errorOutput: { write: () => true },
          isPortAvailable: async () => true,
        },
      );

      const result = cli.smoke('macos').catch((error: unknown) => error);
      await jest.advanceTimersByTimeAsync(timeoutMs);
      const error = await result;
      expect(error).toBeInstanceOf(AggregateError);
      if (!(error instanceof AggregateError)) {
        throw new Error('Expected smoke to report a navigation failure.');
      }
      expect(error.errors).toHaveLength(1);
      expect(error.errors[0].cause).toMatchObject({
        message: `Timed out after ${timeoutMs} ms waiting for Storybook story "${firstRenders ? 'second' : 'first'}--story" to render.`,
        cause: { name: 'AbortError' },
      });
      expect(runner.foreground.at(-1)?.command).toBe('stop-storybook');
      expect(runner.stopped).toBe(2);
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
      config: cli.config,
      commandRunner: runner,
      errorOutput: process.stderr,
      // eslint-disable-next-line @microsoft/sdl/no-insecure-url -- the test exercises the loopback Desktop Driver
      driverUrl: `http://127.0.0.1:${cli.instance.driverPort}`,
      manifest: await createEmptyStoryManifest(cli.config, 'macos'),
      platform: 'macos',
      report: undefined,
      signal: expect.any(AbortSignal),
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
      buildPolicy: undefined,
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
  test.each(['prep', 'bundle', 'build', 'run'] as const)('forwards --paper to macOS %s', async (action) => {
    const runner = new RecordingRunner();
    const program = createDesktopStorybookCommand({ ...nativeDriverTestOptions, config: makeConfig(), runner });

    await program.parseAsync(['node', 'storybook', action, '--macos', '--paper', ...(action === 'prep' ? ['--no-driver'] : [])]);

    expect(runner.foreground.length).toBeGreaterThan(0);
    expect(runner.foreground.every(({ env }) => env.RCT_NEW_ARCH_ENABLED === '0' && env[FURN_STORYBOOK_PLATFORM] === 'macos')).toBe(true);
  });

  test('keeps the Paper smoke endpoint and propagates the renderer through launch and cleanup', async () => {
    const runner = new RecordingRunner();
    const runSmokeTests = jest.fn(async () => ({
      endpoint: 'macos' as const,
      finishedAt: '2026-10-02T08:00:01.000Z',
      manifest: { platform: 'macos-digest', portable: 'portable-digest' },
      platformName: 'macos' as const,
      runId: 'paper-smoke',
      schemaVersion: 1 as const,
      startedAt: '2026-10-02T08:00:00.000Z',
      status: 'passed' as const,
      targetId: 'agenticstorybook-macos',
      tests: [],
    }));
    const program = createDesktopStorybookCommand({
      ...nativeDriverTestOptions,
      config: makeConfig({ macos: { run: { command: 'launch-storybook' }, smoke: { stop: { command: 'stop-storybook' } } } }),
      createStoryManifest: createEmptyStoryManifest,
      fetch: async () => new Response(JSON.stringify({ entries: { story: { id: 'first--story', type: 'story' } } })),
      isPortAvailable: async () => true,
      output: { write: () => true },
      runner,
      runSmokeTests,
    });

    await program.parseAsync(['node', 'storybook', 'smoke', '--macos', '--paper', '--mode', 'stories-and-tests']);

    expect(runner.foreground.map(({ command }) => command)).toEqual(['launch-storybook', 'stop-storybook']);
    expect([...runner.foreground, ...runner.background].every(({ env }) => env.RCT_NEW_ARCH_ENABLED === '0')).toBe(true);
    expect(runSmokeTests).toHaveBeenCalledWith(expect.objectContaining({ platform: 'macos', targetId: 'agenticstorybook-macos' }));
    expect(
      JSON.parse(fs.readFileSync(path.join(storybookRoot, 'storybook-desktop.generated', 'driver-manifest.macos.json'), 'utf8')),
    ).toMatchObject({
      endpoint: 'macos',
      renderer: 'paper',
    });
    expect(runner.stopped).toBe(2);
  });

  test.each([[[]], [['--paper']]])('requests the canonical target registered by the driver manifest (%j)', async (flags) => {
    const runner = new RecordingRunner();
    const runSmokeTests = jest.fn(async ({ targetId }: { targetId: string }) => ({
      endpoint: 'macos' as const,
      finishedAt: '2026-10-02T08:00:01.000Z',
      manifest: { platform: 'macos-digest', portable: 'portable-digest' },
      platformName: 'macos' as const,
      runId: 'canonical-smoke',
      schemaVersion: 1 as const,
      startedAt: '2026-10-02T08:00:00.000Z',
      status: 'passed' as const,
      targetId,
      tests: [],
    }));
    const target = {
      configPath: path.join(storybookRoot, 'desktop.config.mts'),
      endpoint: 'macos',
      host: { kind: 'react-native-test-app', renderer: 'fabric' },
      id: 'macos-configured',
      instanceId: 'configured',
      projectRoot: storybookRoot,
    } as unknown as ResolvedDesktopTarget;
    const config = new DesktopStorybookConfig(
      {
        projectRoot: storybookRoot,
        storyPackages: [],
        platformOptions: { macos: { run: { command: 'launch-storybook' }, smoke: { stop: { command: 'stop-storybook' } } } },
      },
      { targets: { macos: target } } as unknown as ResolvedDesktopConfig,
    );
    const program = createDesktopStorybookCommand({
      ...nativeDriverTestOptions,
      config,
      createStoryManifest: createEmptyStoryManifest,
      fetch: async () => new Response(JSON.stringify({ entries: { story: { id: 'first--story', type: 'story' } } })),
      isPortAvailable: async () => true,
      output: { write: () => true },
      runner,
      runSmokeTests,
    });

    await program.parseAsync(['node', 'storybook', 'smoke', '--macos', ...flags, '--mode', 'stories-and-tests']);

    const manifest = JSON.parse(
      fs.readFileSync(path.join(storybookRoot, 'storybook-desktop.generated', 'driver-manifest.macos.json'), 'utf8'),
    );
    expect(manifest.targetId).toBe(selectDesktopRenderer(target, flags.length ? 'paper' : 'fabric').id);
    expect(runSmokeTests).toHaveBeenCalledWith(expect.objectContaining({ platform: 'macos', targetId: manifest.targetId }));
  });

  test.each(['windows', 'win32'])('rejects --paper with explicit --%s', async (platform) => {
    const runner = new RecordingRunner();
    const program = createDesktopStorybookCommand({ config: makeConfig(), runner });
    program.commands.forEach((command) => {
      command.exitOverride();
      command.configureOutput({ writeErr: () => {} });
    });

    await expect(program.parseAsync(['node', 'storybook', 'build', `--${platform}`, '--paper'])).rejects.toThrow(
      'cannot be used with option',
    );
    expect(runner.foreground).toEqual([]);
  });

  test.each(['windows', 'win32'])('rejects --paper with the implicit %s endpoint', async (platform) => {
    const previousPlatform = process.env[FURN_STORYBOOK_PLATFORM];
    process.env[FURN_STORYBOOK_PLATFORM] = platform;
    const runner = new RecordingRunner();
    const program = createDesktopStorybookCommand({ config: makeConfig(), runner });

    try {
      await expect(program.parseAsync(['node', 'storybook', 'build', '--paper'])).rejects.toThrow('--paper is only supported on macOS');
      expect(runner.foreground).toEqual([]);
    } finally {
      if (previousPlatform === undefined) {
        delete process.env[FURN_STORYBOOK_PLATFORM];
      } else {
        process.env[FURN_STORYBOOK_PLATFORM] = previousPlatform;
      }
    }
  });

  test('forwards verbose logging through nested lifecycle commands', async () => {
    const runner = new RecordingRunner();
    const command = createDesktopStorybookCommand({ config: makeConfig(), runner });
    await command.parseAsync(['node', 'storybook', '--verbose', 'bundle', '--macos']);
    expect(runner.foreground.every(({ env }) => env.STORYBOOK_VERBOSE === '1')).toBe(true);
  });

  test.each(['windows', 'win32'] as const)('builds the %s native helper without running app preparation', async (platform) => {
    const runner = new RecordingRunner();
    const buildNativeDriver = jest.fn(async () => nativeDriverArtifact);
    const program = createDesktopStorybookCommand({
      ...nativeDriverTestOptions,
      buildNativeDriver,
      config: makeConfig(),
      output: { write: () => true },
      runner,
    });

    await program.parseAsync(['node', 'test', 'build-driver', `--${platform}`, '--force']);

    expect(buildNativeDriver).toHaveBeenCalledWith({
      cacheRoot: undefined,
      configuration: 'release',
      force: true,
      macosSigningIdentity: undefined,
      platform,
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
    runner.exitService = 'storybook-channel';
    const program = createDesktopStorybookCommand({
      ...nativeDriverTestOptions,
      config: makeConfig(),
      createStoryManifest: createEmptyStoryManifest,
      isPortAvailable: async () => true,
      runner,
    });
    const manifestPath = path.join(storybookRoot, 'storybook-desktop.generated', 'driver-manifest.win32.json');

    try {
      await expect(program.parseAsync(['node', 'test', 'driver', '--win32', '--host', 'localhost', '--port', '7102'])).rejects.toThrow(
        'exited unexpectedly',
      );

      expect(runner.background[1]).toMatchObject({
        args: [path.resolve(__dirname, '../../config/server-runner.cjs')],
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
      secondRunner.exitService = 'storybook-channel';
      const secondProgram = createDesktopStorybookCommand({
        ...nativeDriverTestOptions,
        config: makeConfig(),
        createStoryManifest: createEmptyStoryManifest,
        isPortAvailable: async () => true,
        runner: secondRunner,
      });
      await expect(
        secondProgram.parseAsync(['node', 'test', 'driver', '--win32', '--host', 'localhost', '--port', '7102']),
      ).rejects.toThrow('exited unexpectedly');
      const secondManifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8')) as Record<string, unknown>;
      expect(secondManifest.bridgeNonce).toBe(firstManifest.bridgeNonce);
    } finally {
      fs.rmSync(manifestPath, { force: true });
    }
  });

  test('forwards server platform and connection options', async () => {
    const runner = new RecordingRunner();
    const services = new DesktopServiceScope(runner);
    const fetch: typeof globalThis.fetch = async () => {
      setTimeout(() => services.requestStop(), 0);
      return new Response('{}');
    };
    const program = createDesktopStorybookCommand({ ...nativeDriverTestOptions, config: makeConfig(), fetch, runner, services });

    await expect(program.parseAsync(['node', 'test', 'server', '--win32', '--host', 'localhost', '--port', '7101'])).rejects.toThrow(
      'Owned desktop service stop requested.',
    );

    expect(runner.background[0]).toMatchObject({
      args: [path.resolve(__dirname, '../../config/server-runner.cjs')],
      env: {
        [FURN_STORYBOOK_PLATFORM]: 'win32',
        STORYBOOK_WS_HOST: 'localhost',
        STORYBOOK_WS_PORT: '7101',
      },
    });
  });

  test('forwards agent options to the driver and requires --agent for its options', async () => {
    const driver = jest.spyOn(DesktopStorybookCli.prototype, 'driver').mockResolvedValue(undefined);
    try {
      const program = () => createDesktopStorybookCommand({ config: makeConfig(), runner: new RecordingRunner() });
      await program().parseAsync(['node', 'test', 'driver', '--win32', '--agent', '--descriptor', 'custom.json', '--root', 'state']);
      await program().parseAsync(['node', 'test', 'driver', '--win32', '--agent']);
      await program().parseAsync(['node', 'test', 'driver', '--win32']);
      expect(driver.mock.calls.map(([, options]) => options)).toEqual([
        { host: undefined, port: undefined, agent: { descriptor: 'custom.json', root: 'state' } },
        { host: undefined, port: undefined, agent: {} },
        { host: undefined, port: undefined },
      ]);
      await expect(program().parseAsync(['node', 'test', 'driver', '--win32', '--descriptor', 'custom.json'])).rejects.toThrow(
        '--descriptor and --root require --agent.',
      );
      expect(driver).toHaveBeenCalledTimes(3);
    } finally {
      driver.mockRestore();
    }
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
