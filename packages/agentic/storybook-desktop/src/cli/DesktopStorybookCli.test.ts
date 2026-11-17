import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import type { DesktopStoryManifestEntry, NativeDriverArtifact } from '@fluentui-react-native/desktop-driver';
import { validateDesktopCaseOptions } from '@fluentui-react-native/desktop-driver/authoring';
import { DesktopServiceScope, DesktopSupervisor } from '@fluentui-react-native/desktop-test';
import type { ResolvedDesktopConfig, ResolvedDesktopTarget } from '@fluentui-react-native/desktop-test';
import { selectDesktopRenderer } from '@fluentui-react-native/desktop-test/config';
import { DesktopRunReporter } from '@fluentui-react-native/desktop-test/reporting';
import type { DesktopReportWriter } from '@fluentui-react-native/desktop-test/reporting';

import { createWindowsSmokeOptions, createWin32SmokeOptions, STORYBOOK_SMOKE_MODE } from '../config/commands';
import { DesktopStorybookConfig, makeDesktopStorybookConfig } from '../config/makeDesktopStorybookConfig';
import { FURN_STORYBOOK_BUNDLE_IDENTIFIER, FURN_STORYBOOK_INSTANCE_ID } from '../config/instance';
import { FURN_STORYBOOK_PLATFORM } from '../config/platforms';
import { createDesktopStorybookDriverManifest, writeDesktopStorybookDriverManifest } from '../driver/driverManifest';
import { createFixturePrivateStorage } from '../driver/fixtures/privateStorage';
import { readDriverManifest } from '../driver/generatedManifest';
import * as wdioTests from '../testing/runWdioTests';
import type { DesktopCommandRunner, PreparedDesktopCommand, RunningDesktopCommand } from './commandRunner';
import { createDesktopStorybookCommand } from './createDesktopStorybookCommand';
import { DesktopStorybookCli } from './DesktopStorybookCli';

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
  createPrivateStorage: createFixturePrivateStorage,
  buildNativeDriver: async () => nativeDriverArtifact,
  resolveNativeDriver: async ({ platform }: { platform: string }) => nativeDriverFor(platform),
  createMacOSApplicationLeaseResource: ({ manifestPath }: { manifestPath: string }) => ({
    id: 'macos-application-lease',
    ownership: 'owned' as const,
    prepare: () => ({ identity: `fixture-lease:${manifestPath}`, acquire: async () => undefined, dispose: async () => undefined }),
  }),
  waitForMacOSApplicationLease: async () => undefined,
  connectStoryTraversal: async () => ({
    select: async () => undefined,
    close: async () => null,
    assertNativeUi: async () => undefined,
    assertRunning: async () => undefined,
  }),
};
function nativeDriverFor(platform: string): NativeDriverArtifact {
  return platform === 'macos'
    ? { ...nativeDriverArtifact, provider: 'macos', endpoints: ['macos'], signing: { mode: 'adhoc' } }
    : { ...nativeDriverArtifact, endpoints: ['windows', 'win32'] };
}
const createEmptyStoryManifest = async (_config: unknown, platform: 'macos' | 'windows' | 'win32') => ({
  endpoint: platform,
  entries: [],
  platformManifestDigest: `${platform}-digest`,
  portablePlanDigest: 'portable-digest',
  schemaVersion: 1 as const,
});

function declaredStoryEntry(id: string, cases: readonly (readonly [name: string, options: unknown])[]): DesktopStoryManifestEntry {
  return {
    id,
    name: 'Default',
    title: 'Button',
    sourcePath: 'button.stories.tsx',
    packageName: 'fixture',
    tags: [],
    wdio: {
      exportName: 'Default',
      digest: 'declared',
      testNames: cases.map(([name]) => name),
      cases: cases.map(([name, options]) => ({ name, options: validateDesktopCaseOptions(options) })),
    },
  };
}

function storyManifestOf(...entries: DesktopStoryManifestEntry[]) {
  return async () => ({
    endpoint: 'macos' as const,
    schemaVersion: 1 as const,
    platformManifestDigest: 'digest',
    portablePlanDigest: 'portable',
    entries,
  });
}

class RecordingRunner implements DesktopCommandRunner {
  readonly foreground: PreparedDesktopCommand[] = [];
  readonly background: PreparedDesktopCommand[] = [];
  stopped = 0;
  failCommand?: string;
  exitService?: string;
  readiness = jest.fn(async (expected: { tier: 'service-ready'; service: string; descriptor?: string }) => ({
    ...expected,
    incarnation: 'fixture-incarnation',
    processId: 1,
  }));

  async run(command: PreparedDesktopCommand): Promise<void> {
    this.foreground.push(command);
    if (command.command === this.failCommand) {
      throw new Error(`${command.command} failed`);
    }
  }

  start(command: PreparedDesktopCommand): RunningDesktopCommand {
    this.background.push(command);
    return {
      waitForReadiness: this.readiness,
      waitForListenerProbe: (service) => this.readiness({ tier: 'service-ready', service }),
      ...(command.listener ? { listenerProbe: 'fixture-listener-probe' } : {}),
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
  function nativeSmokeFixture(platform: 'macos' | 'windows' | 'win32') {
    const events: string[] = [];
    const runner = new RecordingRunner();
    const start = runner.start.bind(runner);
    runner.start = jest.fn((command) => {
      const service = command.context?.service ?? 'unknown';
      events.push(`start:${service}`);
      const running = start(command);
      return {
        ...running,
        stop: async () => {
          events.push(`stop:${service}`);
          await running.stop();
        },
      };
    });
    const native =
      platform === 'macos'
        ? { native: { kind: 'macos' as const } }
        : platform === 'windows'
          ? createWindowsSmokeOptions({ windowTitle: 'Agentic Components Storybook' })
          : createWin32SmokeOptions({
              component: 'AgenticStorybook',
              windowTitle: 'Agentic Components Storybook (Win32)',
              testIDPrefix: 'fixture',
              requiredStoryIds: ['second--story'],
            });
    const fetch = jest.fn(
      async () =>
        new Response(
          JSON.stringify({
            entries: {
              first: { id: 'first--story', type: 'story' },
              second: { id: 'second--story', type: 'story' },
            },
          }),
        ),
    );
    const tests = jest.fn(async () => {
      events.push('tests');
      return {
        endpoint: platform,
        platformName: platform === 'macos' ? ('macos' as const) : ('windows' as const),
        finishedAt: '2026-11-16T08:00:01.000Z',
        startedAt: '2026-11-16T08:00:00.000Z',
        manifest: { platform: 'digest', portable: 'portable' },
        runId: 'native-smoke',
        schemaVersion: 1 as const,
        status: 'passed' as const,
        targetId: `agenticstorybook-${platform}`,
        tests: [],
      };
    });
    const ui = jest.fn(async () => {
      events.push('ui');
    });
    const running = jest.fn(async () => {
      events.push('running');
    });
    const config = makeConfig({ [platform]: { smoke: { ...native, settleMs: 0 }, build: { command: 'build-native' } } });
    const options = {
      ...nativeDriverTestOptions,
      createMacOSApplicationLeaseResource: ({ manifestPath }: { manifestPath: string }) => ({
        id: 'macos-application-lease',
        ownership: 'owned' as const,
        prepare: () => ({
          identity: `fixture-lease:${manifestPath}`,
          acquire: async () => {
            events.push('lease-ready');
          },
          dispose: async () => {
            events.push('lease-withdrawn');
          },
        }),
      }),
      waitForMacOSApplicationLease: async () => {
        events.push('lease-observed');
      },
      runner,
      fetch,
      output: { write: () => true },
      errorOutput: { write: () => true },
      isPortAvailable: async () => true,
      createStoryManifest: async () => ({
        endpoint: platform,
        entries: ['first--story', 'second--story'].map((id) => ({
          id,
          name: id,
          title: 'Fixture',
          packageName: 'fixture',
          sourcePath: 'fixture.stories.tsx',
          tags: [],
        })),
        platformManifestDigest: 'digest',
        portablePlanDigest: 'portable',
        schemaVersion: 1 as const,
      }),
      resolveDesktopApplication: jest.fn(async () => ({
        windowTitle: platform === 'win32' ? 'Agentic Components Storybook (Win32)' : 'Agentic Components Storybook',
        ...(platform === 'windows'
          ? { aumid: 'Fixture!App' }
          : { executablePath: platform === 'macos' ? '/Fixture/Host.app/Contents/MacOS/Host' : 'C:\\Fixture\\ReactTest.exe' }),
      })),
      runSmokeTests: tests,
      connectStoryTraversal: async () => {
        events.push('attach');
        return {
          select: async (id: string) => {
            events.push(`select:${id}`);
          },
          close: async () => {
            events.push('detach');
            return null;
          },
          assertNativeUi: ui,
          assertRunning: running,
        };
      },
    };
    return { events, runner, options, config, tests, ui, fetch };
  }

  function retainedDriverFixture(platform: 'macos' | 'windows' | 'win32' = 'macos', paper = false) {
    const f = nativeSmokeFixture(platform);
    const base = new DesktopStorybookCli(f.config, { ...f.options, paper }).workloadTarget(platform);
    const retained: ResolvedDesktopTarget = { ...base, host: { ...base.host, ownership: 'supervisor' } };
    const target = platform === 'macos' ? selectDesktopRenderer(retained, paper ? 'paper' : 'fabric') : retained;
    jest.spyOn(f.config, 'getDesktopTarget').mockReturnValue(target);
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'storybook-retained-driver-'));
    const output = { write: () => true };
    const reporter = new DesktopRunReporter({ artifactsRoot: root, output, errorOutput: output, summary: false });
    const supervisor = (selected: ResolvedDesktopTarget = target) =>
      new DesktopSupervisor({
        target: selected,
        reporter,
        reportSession: { reporter, delegated: true, environment: {}, close: async () => 0 },
        lockDirectory: path.join(root, 'locks'),
        runner: f.runner,
        hostFactory: async () => {
          throw new Error('The native host belongs to the channel.');
        },
      });
    const cli = (owner?: DesktopSupervisor) =>
      new DesktopStorybookCli(f.config, {
        ...f.options,
        paper,
        reporter,
        ...(owner ? { services: owner.services, supervisor: owner } : {}),
      });
    return { ...f, target, root, supervisor, cli };
  }

  test('retained Storybook launch requires the supervisor and a live matching claim before any effects', async () => {
    const f = retainedDriverFixture();
    const owner = f.supervisor();
    try {
      await expect(f.cli().startDriver('macos', { agent: {} })).rejects.toThrow('requires the claimed neutral supervisor');
      await owner.open(false);
      await expect(f.cli(owner).startDriver('macos', { agent: {} })).rejects.toThrow('matching desktop workload claim');
      expect(f.runner.foreground).toEqual([]);
      expect(f.runner.background).toEqual([]);
      expect(f.options.resolveDesktopApplication).not.toHaveBeenCalled();
    } finally {
      await owner.close();
      fs.rmSync(f.root, { force: true, recursive: true });
    }
  });

  test('retained Storybook launch rejects a claim belonging to another target instance', async () => {
    const f = retainedDriverFixture();
    const owner = f.supervisor({ ...f.target, instanceId: 'other-instance' });
    try {
      await owner.open();
      await expect(f.cli(owner).startDriver('macos', { agent: {} })).rejects.toThrow('matching desktop workload claim');
      expect(f.runner.foreground).toEqual([]);
      expect(f.runner.background).toEqual([]);
    } finally {
      await owner.close();
      fs.rmSync(f.root, { force: true, recursive: true });
    }
  });

  test.each([false, true])('starts a claimed retained macOS agent with its verified product (paper=%s)', async (paper) => {
    const f = retainedDriverFixture('macos', paper);
    const owner = f.supervisor();
    const api = f.cli(owner);
    try {
      await owner.open();
      const ready = await api.startDriver('macos', { agent: { descriptor: 'agent.json' }, input: 'accessible' });
      const channel = f.runner.background.find((command) => command.context?.service === 'storybook-channel')!;
      expect(ready).toMatchObject({
        targetId: f.target.id,
        agentDescriptor: 'agent.json',
        runnerDescriptor: 'runner-connection.json',
        serviceReady: { service: 'storybook-channel', descriptor: 'agent.json' },
      });
      expect(JSON.parse(channel.env.STORYBOOK_OWNED_APPLICATION)).toEqual({
        bundleIdentifier: api.instance.bundleIdentifier,
        executablePath: '/Fixture/Host.app/Contents/MacOS/Host',
        windowTitle: 'Agentic Components Storybook',
      });
      expect(JSON.parse(fs.readFileSync(channel.env.STORYBOOK_DRIVER_MANIFEST, 'utf8')).agent.descriptor).toBe('agent.json');
      expect(f.options.resolveDesktopApplication).toHaveBeenCalledWith(
        expect.objectContaining({
          id: f.target.id,
          host: expect.objectContaining({
            renderer: paper ? 'paper' : 'fabric',
            application: expect.objectContaining({ bundleIdentifier: undefined, executablePath: undefined }),
          }),
        }),
        expect.any(AbortSignal),
        { macosBundleIdentifier: api.instance.bundleIdentifier },
      );
      expect(f.runner.foreground.map(({ command }) => command)).toContain('build-native');
      expect(f.runner.foreground.every(({ env }) => env.STORYBOOK_OWNED_APPLICATION === '')).toBe(true);
      expect(f.events.indexOf('lease-observed')).toBeGreaterThan(f.events.indexOf('start:storybook-channel'));
    } finally {
      await owner.close();
      expect(f.events.slice(-3)).toEqual(['stop:storybook-channel', 'stop:metro', 'lease-withdrawn']);
      fs.rmSync(f.root, { force: true, recursive: true });
    }
  });

  test('does not start retained services when the macOS product cannot be verified', async () => {
    const f = retainedDriverFixture();
    const owner = f.supervisor();
    f.options.resolveDesktopApplication.mockResolvedValueOnce({ windowTitle: 'Agentic Components Storybook', executablePath: '' });
    try {
      await owner.open();
      await expect(f.cli(owner).startDriver('macos', { agent: {} })).rejects.toThrow('exact built application executable');
      expect(f.runner.background).toEqual([]);
      expect(f.events).toEqual([]);
    } finally {
      await owner.close();
      fs.rmSync(f.root, { force: true, recursive: true });
    }
  });

  test('cancellation while waiting for the retained macOS lease closes the claimed services', async () => {
    const f = retainedDriverFixture();
    const owner = f.supervisor();
    const api = new DesktopStorybookCli(f.config, {
      ...f.options,
      services: owner.services,
      supervisor: owner,
      waitForMacOSApplicationLease: async () => {
        owner.services.requestStop();
        owner.services.controller.signal.throwIfAborted();
      },
    });
    try {
      await owner.open();
      await expect(api.startDriver('macos', { agent: {} })).rejects.toThrow('stop requested');
    } finally {
      await owner.close();
      expect(f.events.slice(-3)).toEqual(['stop:storybook-channel', 'stop:metro', 'lease-withdrawn']);
      fs.rmSync(f.root, { force: true, recursive: true });
    }
  });

  test.each(['windows', 'win32'] as const)('starts a claimed retained %s agent with its exact launched identity', async (platform) => {
    const f = retainedDriverFixture(platform);
    if (platform === 'win32') {
      const options = f.config.getPlatformOptions('win32');
      const nativeDriver = options.nativeDriver || {};
      jest.spyOn(f.config, 'getPlatformOptions').mockReturnValue({
        ...options,
        nativeDriver: {
          ...nativeDriver,
          application: { ...nativeDriver.application, windowTitle: 'Agentic Components Storybook (Win32)' },
        },
      });
    }
    const owner = f.supervisor();
    try {
      await owner.open();
      const ready = await f.cli(owner).startDriver(platform, { agent: { descriptor: 'agent.json' }, input: 'accessible' });
      const channel = f.runner.background.find((command) => command.context?.service === 'storybook-channel')!;
      const owned =
        platform === 'windows'
          ? { windowTitle: 'Agentic Components Storybook', aumid: 'Fixture!App' }
          : {
              windowTitle: 'Agentic Components Storybook (Win32)',
              executablePath: 'C:\\Fixture\\ReactTest.exe',
              arguments: ['crashOnRedBox', 'debugBundlePath', 'index'],
            };
      expect(ready).toMatchObject({ targetId: f.target.id, agentDescriptor: 'agent.json', serviceReady: { service: 'storybook-channel' } });
      expect(ready.integration.details.services).toEqual(platform === 'windows' ? ['metro', 'storybook-channel'] : ['storybook-channel']);
      expect(JSON.parse(channel.env.STORYBOOK_OWNED_APPLICATION)).toEqual(owned);
      const { arguments: _arguments, ...identity } = owned as typeof owned & { arguments?: string[] };
      expect(JSON.parse(fs.readFileSync(channel.env.STORYBOOK_DRIVER_MANIFEST, 'utf8')).agent.application).toEqual(identity);
      expect(f.options.resolveDesktopApplication).toHaveBeenCalledTimes(1);
      expect(f.options.resolveDesktopApplication).toHaveBeenCalledWith(
        expect.objectContaining({
          host: expect.objectContaining(platform === 'win32' ? { kind: 'rex', component: 'AgenticStorybook' } : {}),
        }),
        expect.any(AbortSignal),
        platform === 'windows' ? { configuration: 'Debug' } : {},
      );
      const foreground = f.runner.foreground.map(({ command, args }) => [command, ...(args ?? [])].join(' '));
      expect(foreground.some((command) => command.includes('register-windows.ps1'))).toBe(platform === 'windows');
      expect(f.runner.foreground.every(({ env }) => env.STORYBOOK_OWNED_APPLICATION === '')).toBe(true);
      const bundle = f.runner.foreground.find(({ args }) => args?.includes('bundle'))!;
      const runtimeDigest = (handoff: string) => JSON.parse(handoff).runtimeModuleDigest;
      expect(bundle.env.STORYBOOK_DRIVER_MANIFEST).toBe(channel.env.STORYBOOK_DRIVER_MANIFEST);
      expect(runtimeDigest(bundle.env.STORYBOOK_DRIVER_HANDOFF)).toBe(runtimeDigest(channel.env.STORYBOOK_DRIVER_HANDOFF));
      expect(f.runner.background.some((command) => command.context?.service === 'metro')).toBe(platform === 'windows');
    } finally {
      await owner.close();
      expect(f.events).toContain('stop:storybook-channel');
      fs.rmSync(f.root, { force: true, recursive: true });
    }
  });

  test.each([
    ['a configured lease', { leasePath: 'C:\\lease.json' }, 'cannot adopt a configured process or lease'],
    ['a conflicting window title', { windowTitle: 'Other' }, 'conflicts with the retained application'],
  ])('refuses a retained Windows agent with %s before any effects', async (_name, application, message) => {
    const f = retainedDriverFixture('windows');
    const nativeDriver = f.config.getPlatformOptions('windows').nativeDriver || {};
    jest.spyOn(f.config, 'getPlatformOptions').mockReturnValue({
      ...f.config.getPlatformOptions('windows'),
      nativeDriver: { ...nativeDriver, application: { ...nativeDriver.application, ...application } },
    });
    const owner = f.supervisor();
    try {
      await owner.open();
      await expect(f.cli(owner).startDriver('windows', { agent: {} })).rejects.toThrow(message);
      expect(f.runner.foreground).toEqual([]);
      expect(f.runner.background).toEqual([]);
      expect(f.options.resolveDesktopApplication).not.toHaveBeenCalled();
    } finally {
      await owner.close();
      fs.rmSync(f.root, { force: true, recursive: true });
    }
  });

  test('refuses a retained Windows agent whose configured AUMID differs from the built package', async () => {
    const f = retainedDriverFixture('windows');
    const nativeDriver = f.config.getPlatformOptions('windows').nativeDriver || {};
    jest.spyOn(f.config, 'getPlatformOptions').mockReturnValue({
      ...f.config.getPlatformOptions('windows'),
      nativeDriver: { ...nativeDriver, application: { ...nativeDriver.application, aumid: 'Other!App' } },
    });
    const owner = f.supervisor();
    try {
      await owner.open();
      await expect(f.cli(owner).startDriver('windows', { agent: {} })).rejects.toThrow('conflicts with the retained application');
      expect(f.runner.background).toEqual([]);
    } finally {
      await owner.close();
      fs.rmSync(f.root, { force: true, recursive: true });
    }
  });

  test('an external Storybook driver cannot inherit an owned-application launch request', async () => {
    const runner = new RecordingRunner();
    const services = new DesktopServiceScope(runner);
    const cli = new DesktopStorybookCli(
      makeConfig({ macos: { server: { command: 'channel', env: { STORYBOOK_OWNED_APPLICATION: '{"foreign":true}' } } } }),
      {
        ...nativeDriverTestOptions,
        createStoryManifest: createEmptyStoryManifest,
        fetch: async () => new Response('{}'),
        isPortAvailable: async () => true,
        runner,
        services,
      },
    );
    try {
      await cli.startDriver('macos', { agent: {} });
      expect(runner.background.every(({ env }) => env.STORYBOOK_OWNED_APPLICATION === '')).toBe(true);
      expect(runner.foreground).toEqual([]);
    } finally {
      await services.close();
    }
  });

  test.each(['macos', 'windows', 'win32'] as const)('owns %s smoke phases and releases traversal before tests', async (platform) => {
    const f = nativeSmokeFixture(platform);
    const cli = new DesktopStorybookCli(f.config, f.options);
    await cli.smoke(platform, { mode: 'stories-and-tests' });
    expect(f.events).toEqual(
      platform === 'macos'
        ? [
            'lease-ready',
            'start:metro',
            'start:storybook-stories',
            'lease-observed',
            'attach',
            'select:first--story',
            'select:second--story',
            'running',
            'detach',
            'tests',
            'attach',
            'running',
            'detach',
            'stop:storybook-stories',
            'stop:metro',
            'lease-withdrawn',
          ]
        : platform === 'windows'
          ? [
              'start:metro',
              'start:storybook-stories',
              'attach',
              'select:first--story',
              'select:second--story',
              'running',
              'detach',
              'stop:storybook-stories',
              'start:storybook-tests',
              'attach',
              'select:first--story',
              'detach',
              'tests',
              'attach',
              'running',
              'detach',
              'stop:storybook-tests',
              'stop:metro',
            ]
          : [
              'start:storybook-stories',
              'attach',
              'ui',
              'select:first--story',
              'select:second--story',
              'running',
              'detach',
              'tests',
              'attach',
              'running',
              'detach',
              'stop:storybook-stories',
            ],
    );
    expect(f.runner.foreground.some((command) => command.args.some((arg) => /smoke-(windows|win32)\.ps1$/.test(arg)))).toBe(false);
    const phases = f.runner.background.filter((command) => command.env.STORYBOOK_OWNED_APPLICATION);
    expect(phases).toHaveLength(platform === 'windows' ? 2 : 1);
    expect(phases.every((command) => command.env.STORYBOOK_DRIVER_HANDOFF && command.env.STORYBOOK_DRIVER_MANIFEST)).toBe(true);
    if (platform === 'macos') {
      expect(JSON.parse(phases[0].env.STORYBOOK_OWNED_APPLICATION)).toEqual({
        bundleIdentifier: cli.instance.bundleIdentifier,
        executablePath: '/Fixture/Host.app/Contents/MacOS/Host',
        windowTitle: 'Agentic Components Storybook',
      });
      expect(f.options.resolveDesktopApplication).toHaveBeenCalledWith(
        expect.objectContaining({
          host: expect.objectContaining({
            application: expect.objectContaining({ bundleIdentifier: undefined, executablePath: undefined }),
          }),
        }),
        expect.any(AbortSignal),
        { macosBundleIdentifier: cli.instance.bundleIdentifier },
      );
      expect(f.runner.foreground.map((command) => command.command)).toContain('build-native');
      expect(f.runner.foreground.map((command) => command.command)).not.toContain('osascript');
    }
    if (platform === 'win32') {
      expect(f.ui).toHaveBeenCalledWith(
        ['sidebar-header', 'sidebar-resize', 'addons-panel-header', 'addons-resize', 'addon-storybook-actions-panel'].map(
          (suffix) => `fixture-win32-${suffix}`,
        ),
        30_000,
      );
      expect(JSON.parse(phases[0].env.STORYBOOK_OWNED_APPLICATION).arguments).toContain('crashOnRedBox');
      expect(f.runner.foreground.some((command) => command.command === 'pwsh')).toBe(false);
    }
  });

  test('uses the native driver and exact application owner for render-only macOS smoke', async () => {
    const f = nativeSmokeFixture('macos');
    await new DesktopStorybookCli(f.config, f.options).smoke('macos', { mode: 'stories' });
    expect(f.tests).not.toHaveBeenCalled();
    expect(f.runner.background.some((command) => command.env.STORYBOOK_OWNED_APPLICATION && command.env.STORYBOOK_DRIVER_HANDOFF)).toBe(
      true,
    );
    expect(f.events).toContain('lease-observed');
    expect(f.events.at(-1)).toBe('lease-withdrawn');
  });

  test.each([
    [false, 'accessible'],
    [true, 'physical'],
  ] as const)('preserves the macOS renderer and input lane for native smoke (paper=%s, input=%s)', async (paper, input) => {
    const f = nativeSmokeFixture('macos');
    const connectStoryTraversal = jest.fn(f.options.connectStoryTraversal);
    await new DesktopStorybookCli(f.config, { ...f.options, connectStoryTraversal, paper }).smoke('macos', {
      input,
      mode: 'stories-and-tests',
    });
    expect(f.options.resolveDesktopApplication).toHaveBeenCalledWith(
      expect.objectContaining({ host: expect.objectContaining({ renderer: paper ? 'paper' : 'fabric' }) }),
      expect.any(AbortSignal),
      expect.anything(),
    );
    expect(connectStoryTraversal).toHaveBeenCalledWith(expect.objectContaining({ input }));
    expect(f.tests).toHaveBeenCalledWith(expect.objectContaining({ input }));
  });

  test('does not start macOS services or run a stop command when building the app fails', async () => {
    const f = nativeSmokeFixture('macos');
    f.runner.failCommand = 'build-native';
    await expect(new DesktopStorybookCli(f.config, f.options).smoke('macos')).rejects.toThrow('build-native failed');
    expect(f.runner.background).toHaveLength(0);
    expect(f.runner.foreground.map((command) => command.command)).not.toContain('osascript');
    expect(f.events).toEqual([]);
  });

  test('refuses macOS native smoke without an exact built executable before starting services', async () => {
    const f = nativeSmokeFixture('macos');
    f.options.resolveDesktopApplication.mockResolvedValueOnce({ windowTitle: 'Agentic Components Storybook', executablePath: '' });
    await expect(new DesktopStorybookCli(f.config, f.options).smoke('macos')).rejects.toThrow('exact built application executable');
    expect(f.runner.background).toHaveLength(0);
    expect(f.events).toEqual([]);
  });

  test('refuses a conflicting configured macOS bundle before building or starting services', async () => {
    const f = nativeSmokeFixture('macos');
    const config = makeConfig({
      macos: {
        build: { command: 'build-native' },
        nativeDriver: { application: { bundleIdentifier: 'com.example.foreign' } },
        smoke: { native: { kind: 'macos' }, settleMs: 0 },
      },
    });
    await expect(new DesktopStorybookCli(config, f.options).smoke('macos')).rejects.toThrow(
      'configured macOS bundle identifier conflicts with the instance-specific built product',
    );
    expect(f.runner.foreground).toHaveLength(0);
    expect(f.runner.background).toHaveLength(0);
    expect(f.events).toEqual([]);
  });

  test('refuses a configured macOS application that is not the verified built product', async () => {
    const f = nativeSmokeFixture('macos');
    const config = makeConfig({
      macos: {
        build: { command: 'build-native' },
        nativeDriver: { application: { executablePath: __filename, windowTitle: 'Agentic Components Storybook' } },
        smoke: { native: { kind: 'macos' }, settleMs: 0 },
      },
    });
    f.options.resolveDesktopApplication.mockResolvedValueOnce({
      executablePath: path.join(__dirname, 'DesktopStorybookCli.ts'),
      windowTitle: 'Agentic Components Storybook',
    });
    await expect(new DesktopStorybookCli(config, f.options).smoke('macos')).rejects.toThrow(
      'configured macOS application does not match the verified built product',
    );
    expect(f.runner.background).toHaveLength(0);
    expect(f.events).toEqual([]);
  });

  test('records an unsettled macOS channel as a cleanup failure while withdrawing the read-only lease', async () => {
    const f = nativeSmokeFixture('macos');
    const start = f.runner.start;
    f.runner.start = (command) => {
      const running = start(command);
      return command.context?.service === 'storybook-stories'
        ? {
            ...running,
            stop: async () => {
              throw new Error('application settlement unknown');
            },
          }
        : running;
    };
    const scope = new DesktopServiceScope(f.runner);
    const resources: { id: string; disposal: string }[] = [];
    scope.setResourceObserver((resource) => resources.push(resource));
    await new DesktopStorybookCli(f.config, { ...f.options, services: scope }).smoke('macos', { mode: 'stories' });
    await expect(scope.close()).rejects.toThrow('Owned desktop services did not shut down cleanly');
    expect(resources.filter(({ id }) => id.endsWith(':storybook-stories')).at(-1)).toMatchObject({ disposal: 'failed' });
    expect(f.events).toContain('lease-withdrawn');
  });

  test('refuses occupied Windows Metro before any build, registration, service, or native-helper effect', async () => {
    const f = nativeSmokeFixture('windows');
    const resolveNativeDriver = jest.fn(nativeDriverTestOptions.resolveNativeDriver);
    const cli = new DesktopStorybookCli(f.config, {
      ...f.options,
      resolveNativeDriver,
      isPortAvailable: async (port) => port !== 8081,
    });
    await expect(cli.smoke('windows')).rejects.toThrow('8081 is already in use');
    expect(f.runner.foreground).toHaveLength(0);
    expect(f.runner.background).toHaveLength(0);
    expect(resolveNativeDriver).not.toHaveBeenCalled();
  });

  test('fails closed on a missing Win32 required runtime story and still drains the owned service', async () => {
    const f = nativeSmokeFixture('win32');
    f.fetch.mockImplementation(
      async () =>
        new Response(
          JSON.stringify({
            entries: { first: { id: 'first--story', type: 'story' } },
          }),
        ),
    );
    await expect(new DesktopStorybookCli(f.config, f.options).smoke('win32', { mode: 'stories-and-tests' })).rejects.toThrow(
      'missing required story',
    );
    expect(f.tests).not.toHaveBeenCalled();
    expect(f.events.slice(-2)).toEqual(['detach', 'stop:storybook-stories']);
  });

  test('reports native UI failure and cleanup failure together and never runs authored tests', async () => {
    const f = nativeSmokeFixture('win32');
    f.ui.mockRejectedValueOnce(new Error('missing native addon'));
    const start = f.runner.start;
    f.runner.start = (command) => ({
      ...start(command),
      stop: async () => {
        throw new Error('native cleanup uncertain');
      },
    });
    await expect(new DesktopStorybookCli(f.config, f.options).smoke('win32', { mode: 'stories-and-tests' })).rejects.toMatchObject({
      errors: [expect.objectContaining({ message: 'missing native addon' }), expect.any(AggregateError)],
    });
    expect(f.tests).not.toHaveBeenCalled();
  });

  test('does not continue into authored tests after Windows phase cleanup fails', async () => {
    const f = nativeSmokeFixture('windows');
    const start = f.runner.start;
    f.runner.start = (command) => {
      const running = start(command);
      return command.context?.service === 'storybook-stories'
        ? {
            ...running,
            stop: async () => {
              throw new Error('application settlement unknown');
            },
          }
        : running;
    };
    await expect(new DesktopStorybookCli(f.config, f.options).smoke('windows', { mode: 'stories-and-tests' })).rejects.toBeInstanceOf(
      AggregateError,
    );
    expect(f.events).not.toContain('start:storybook-tests');
    expect(f.tests).not.toHaveBeenCalled();
  });

  test('cancellation during native traversal drains its session and retained application service', async () => {
    const f = nativeSmokeFixture('win32');
    const scope = new DesktopServiceScope(f.runner);
    const cli = new DesktopStorybookCli(f.config, {
      ...f.options,
      services: scope,
      connectStoryTraversal: async () => ({
        ...(await f.options.connectStoryTraversal()),
        select: async () => {
          scope.requestStop();
          scope.controller.signal.throwIfAborted();
        },
      }),
    });
    await expect(scope.guard(cli.smoke('win32', { mode: 'stories-and-tests' }))).rejects.toThrow('stop requested');
    await scope.close();
    expect(f.events.slice(-2)).toEqual(['detach', 'stop:storybook-stories']);
    expect(f.tests).not.toHaveBeenCalled();
  });

  test('resolves a stable real workload target for legacy Storybook configuration', () => {
    const cli = new DesktopStorybookCli(makeConfig());
    const target = cli.workloadTarget('macos');

    expect(target).toMatchObject({
      endpoint: 'macos',
      id: 'agenticstorybook-macos',
      instanceId: cli.instance.id,
      registrationId: 'agenticstorybook-macos',
      host: { kind: 'react-native-test-app', ownership: 'external', renderer: 'fabric' },
    });
    expect(target.id).not.toBe('unregistered');
    expect(target.instanceId).not.toBe('unregistered');
  });

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

  describe('input lane selection', () => {
    const cases = [
      ['adaptive', { requires: ['click'] }],
      ['typing', { requires: ['keyboard'] }],
      ['win32-only', { platforms: ['win32'] }],
      ['paper-only', { scope: { 'rn.renderer': ['paper'] } }],
      ['fabric-only', { scope: { 'rn.renderer': ['fabric'] } }],
    ] as const;
    const config = () => makeDesktopStorybookConfig({ projectRoot: storybookRoot, storyPackages: [] });
    const list = async (flags: string[], ...entries: DesktopStoryManifestEntry[]) => {
      const output = { write: jest.fn() };
      await createDesktopStorybookCommand({ config: config(), createStoryManifest: storyManifestOf(...entries), output }).parseAsync([
        'node',
        'storybook',
        'test',
        '--macos',
        '--list',
        ...flags,
      ]);
      return JSON.parse(output.write.mock.calls[0][0]);
    };
    // An explicit URL and target stand in for a running driver, so selection is what these runs exercise.
    const connection = { url: 'https://127.0.0.1:1234', target: 'fixture' };
    const run = (options: Parameters<DesktopStorybookCli['test']>[1], ...entries: DesktopStoryManifestEntry[]) =>
      new DesktopStorybookCli(config(), { createStoryManifest: storyManifestOf(...entries), output: { write: jest.fn() } }).test('macos', {
        ...connection,
        ...options,
      });
    const legacyEntry = (id: string): DesktopStoryManifestEntry => ({
      ...declaredStoryEntry(id, []),
      wdio: { exportName: 'Default', digest: 'legacy' },
    });

    test.each([
      [
        'accessible',
        ['adaptive', 'fabric-only'],
        [
          ['typing', 'input'],
          ['win32-only', 'platform'],
          ['paper-only', 'scope'],
        ],
      ],
      [
        'physical',
        ['adaptive', 'typing', 'fabric-only'],
        [
          ['win32-only', 'platform'],
          ['paper-only', 'scope'],
        ],
      ],
    ])('lists what the %s lane runs and why each other matching case is left out', async (input, selected, excluded) => {
      const [story] = await list(['--input', input], declaredStoryEntry('button--default', cases));
      expect(story.tests.map(({ name }: { name: string }) => name)).toEqual(selected);
      expect(story.excluded.map(({ name, reason }: { name: string; reason: string }) => [name, reason])).toEqual(excluded);
      expect(story.tests[0]).toEqual({ name: 'adaptive', input: 'both', inputSource: 'derived', requires: ['click'] });
    });

    test('lists every declared case that targets the platform when no lane is selected', async () => {
      const [story] = await list([], declaredStoryEntry('button--default', cases));
      expect(story.tests.map(({ name }: { name: string }) => name)).toEqual(['adaptive', 'typing', 'fabric-only']);
      expect(story.excluded.map(({ reason }: { reason: string }) => reason)).toEqual(['platform', 'scope']);
    });

    test('names every legacy callback a lane cannot run, so they migrate in one pass', async () => {
      await expect(run({ input: 'accessible' }, legacyEntry('a--default'), legacyEntry('b--default'))).rejects.toThrow(
        'Input lane "accessible" cannot run legacy wdio callbacks; declare them with desktopIt: a--default, b--default.',
      );
    });

    test('explains an empty selection by what the target and lane excluded', async () => {
      await expect(run({ input: 'accessible' }, declaredStoryEntry('button--default', cases.slice(1, 3)))).rejects.toThrow(
        'No executable wdio story tests matched the requested selection (excluded 1 by platform, 0 by scope, 1 by input).',
      );
    });

    test('does not blame a narrow filter for cases it never asked for', async () => {
      await expect(run({ input: 'accessible', test: 'typing' }, declaredStoryEntry('button--default', cases))).rejects.toThrow(
        'No executable wdio story tests matched the requested selection (excluded 0 by platform, 0 by scope, 1 by input).',
      );
    });

    test('takes the lane of the running driver instance unless a flag or the environment names one', async () => {
      const manifestPath = path.join(storybookRoot, 'storybook-desktop.generated', 'driver-manifest.macos.json');
      const cli = new DesktopStorybookCli(config(), {
        createStoryManifest: storyManifestOf(declaredStoryEntry('button--default', cases.slice(1, 2))),
        output: { write: jest.fn() },
      });
      fs.mkdirSync(path.dirname(manifestPath), { recursive: true });
      await writeDesktopStorybookDriverManifest(
        createDesktopStorybookDriverManifest({
          config: config(),
          instance: { ...cli.instance, driverPort: 7100 },
          nativeDriver: nativeDriverFor('macos'),
          platform: 'macos',
          storyManifest: await createEmptyStoryManifest(config(), 'macos'),
          wdio: { input: 'accessible' },
        }),
        manifestPath,
        createFixturePrivateStorage,
      );
      try {
        // The only case needs a physical keyboard, so only the inherited accessible lane can leave it out.
        await expect(cli.test('macos', {})).rejects.toThrow('excluded 0 by platform, 0 by scope, 1 by input');
      } finally {
        fs.rmSync(manifestPath, { force: true });
      }
    });

    test.each([undefined, 'accessible', 'physical'] as const)(
      'prepares a window before attached callbacks only for the physical lane (input=%s)',
      async (input) => {
        const order: string[] = [];
        const connectStoryTraversal = jest.fn(async () => {
          order.push('window');
          return {
            assertNativeUi: async () => undefined,
            assertRunning: async () => undefined,
            select: async () => undefined,
            close: async () => {
              order.push('closed');
              return null;
            },
          };
        });
        const runWdio = jest.spyOn(wdioTests, 'runWdioStoryTests').mockImplementation(async () => {
          order.push('tests');
          return [];
        });
        const cli = new DesktopStorybookCli(config(), {
          createStoryManifest: storyManifestOf(declaredStoryEntry('button--default', cases.slice(0, 1))),
          connectStoryTraversal,
          output: { write: () => true },
        });
        try {
          await cli.test('macos', { ...connection, input });
          expect(order).toEqual(input === 'physical' ? ['window', 'closed', 'tests'] : ['tests']);
          if (input === 'physical') {
            expect(connectStoryTraversal).toHaveBeenCalledWith(
              expect.objectContaining({ input: 'physical', platform: 'macos', targetId: 'fixture', url: connection.url }),
            );
          } else {
            expect(connectStoryTraversal).not.toHaveBeenCalled();
          }
        } finally {
          runWdio.mockRestore();
        }
      },
    );
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
      const fabricManifest = await readDriverManifest(manifestPath, undefined, createFixturePrivateStorage);
      await expect(new DesktopStorybookCli(makeConfig(), { ...options, paper: true }).driver('macos')).rejects.toThrow(
        'exited unexpectedly',
      );
      const paperManifest = await readDriverManifest(manifestPath, undefined, createFixturePrivateStorage);
      await expect(new DesktopStorybookCli(makeConfig(), { ...options, paper: true }).driver('macos')).rejects.toThrow(
        'exited unexpectedly',
      );
      const repeatedPaperManifest = await readDriverManifest(manifestPath, undefined, createFixturePrivateStorage);

      expect(fabricManifest.renderer).toBe('fabric');
      expect(paperManifest.renderer).toBe('paper');
      // The control process that runs smoke tests has no desktop configuration, so the manifest carries the scope values.
      expect(fabricManifest.scope.values).toMatchObject({ 'rn.renderer': 'fabric' });
      expect(paperManifest.scope.values).toMatchObject({ 'rn.renderer': 'paper' });
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
    const resourceObserver = jest.fn();
    services.setResourceObserver(resourceObserver);
    const written: string[] = [];
    const maintained: string[] = [];
    let published = false;
    runner.readiness.mockImplementation(async (expected) => {
      expect(written).toEqual([]);
      published = true;
      return { ...expected, incarnation: 'fixture-incarnation', processId: 1 };
    });
    const fetch: typeof globalThis.fetch = async () => new Response('{}');
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
      createMacOSApplicationLeaseResource: ({ manifestPath: leaseManifestPath }) => ({
        id: 'macos-application-lease',
        ownership: 'owned',
        prepare: () => ({
          identity: 'fixture-macos-lease',
          acquire: async () => {
            expect(written).toEqual([]);
            maintained.push(leaseManifestPath);
          },
          dispose: async () => undefined,
        }),
      }),
      output: { write: (chunk: string) => written.push(`${published ? 'published' : 'unpublished'}: ${chunk}`) > 0 },
      runner,
      services,
    });
    try {
      const ready = await cli.startDriver('macos', { agent: { descriptor: 'custom.json', root: 'relative-root' } });
      expect(written).toEqual([]);
      expect(ready).toMatchObject({
        targetId: 'agenticstorybook-macos',
        agentDescriptor: 'custom.json',
        runnerDescriptor: 'runner-connection.json',
        root: path.resolve('relative-root'),
        integration: { name: 'storybook' },
        serviceReady: {
          tier: 'service-ready',
          service: 'storybook-channel',
          descriptor: 'custom.json',
          incarnation: 'fixture-incarnation',
          processId: 1,
        },
      });
      expect(resourceObserver).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'desktop:storybook-channel',
          generation: expect.any(Number),
          ownership: 'owned',
          readiness: 'ready',
          serviceReady: ready.serviceReady,
        }),
      );
      expect(JSON.parse(fs.readFileSync(manifestPath, 'utf8')).agent).toEqual({
        descriptor: 'custom.json',
        readyPath,
        root: path.resolve('relative-root'),
        runner: { descriptor: 'runner-connection.json', allowPreempt: false },
      });
      expect(maintained).toEqual([manifestPath]);
      expect(runner.readiness).toHaveBeenCalledWith(
        { tier: 'service-ready', service: 'storybook-channel', descriptor: 'custom.json' },
        120_000,
        expect.any(AbortSignal),
      );
      expect(fs.existsSync(readyPath)).toBe(false);
      await expect(new DesktopStorybookCli(makeConfig(), { createStoryManifest, runner }).test('macos')).rejects.toThrow('serves an agent');
    } finally {
      await services.close();
      fs.rmSync(manifestPath, { force: true });
      fs.rmSync(readyPath, { force: true });
    }
  });

  test('does not publish readiness when the channel listener and driver have different producers', async () => {
    const runner = new RecordingRunner();
    runner.readiness.mockImplementation(async (expected) => ({
      ...expected,
      incarnation: 'fixture-incarnation',
      processId: expected.service === 'storybook-channel' ? 2 : 1,
    }));
    const onReady = jest.fn();
    const cli = new DesktopStorybookCli(makeConfig(), {
      ...nativeDriverTestOptions,
      runner,
      onReady,
      createStoryManifest: createEmptyStoryManifest,
      fetch: async () => new Response('{}'),
      isPortAvailable: async () => true,
      output: { write: () => true },
    });
    const manifestPath = path.join(storybookRoot, 'storybook-desktop.generated', 'driver-manifest.macos.json');
    try {
      await expect(cli.driver('macos', { agent: {} })).rejects.toThrow('different processes');
      expect(onReady).not.toHaveBeenCalled();
    } finally {
      fs.rmSync(manifestPath, { force: true });
    }
  });

  test('runs an exact managed story only through the verified hosted driver', async () => {
    const config = makeConfig();
    const story = declaredStoryEntry('button--default', [['adaptive', { requires: ['click'] }]]);
    const createStoryManifest = storyManifestOf(story);
    const reporter = { runId: 'run', root: storybookRoot, emit: jest.fn(), addSecret: jest.fn() } as unknown as DesktopReportWriter;
    const cli = new DesktopStorybookCli(config, {
      ...nativeDriverTestOptions,
      createStoryManifest,
      reporter,
      runner: new RecordingRunner(),
      output: { write: () => true },
    });
    const manifestPath = path.join(storybookRoot, 'storybook-desktop.generated', 'driver-manifest.macos.json');
    await writeDesktopStorybookDriverManifest(
      createDesktopStorybookDriverManifest({
        agent: { descriptor: 'agent.json', runner: { descriptor: 'runner.json', allowPreempt: false } },
        config,
        instance: { ...cli.instance, driverPort: 7100 },
        nativeDriver: nativeDriverFor('macos'),
        platform: 'macos',
        storyManifest: await createStoryManifest(),
      }),
      manifestPath,
      createFixturePrivateStorage,
    );
    const run = jest.spyOn(wdioTests, 'runWdioStoryTests').mockResolvedValue([{ storyId: story.id, status: 'passed', durationMs: 1 }]);
    // eslint-disable-next-line @microsoft/sdl/no-insecure-url -- This is a local verified-connection fixture.
    const connection = { url: 'http://127.0.0.1:7100', client: {} } as Parameters<DesktopStorybookCli['testManaged']>[1]['connection'];
    const addSecret = jest.fn();
    try {
      await cli.testManaged('macos', { connection, input: 'accessible', storyId: story.id, addSecret });
      expect(run).toHaveBeenCalledWith(
        expect.objectContaining({ story: story.id, runner: { connection, addSecret }, input: 'accessible' }),
        expect.anything(),
      );
      await expect(cli.testManaged('macos', { connection, input: 'accessible', storyId: 'missing--story', addSecret })).rejects.toThrow(
        'not an executable story',
      );
      const mismatched = new URL(connection.url);
      mismatched.port = '7101';
      await expect(
        cli.testManaged('macos', { connection: { ...connection, url: mismatched.origin }, input: 'accessible', addSecret }),
      ).rejects.toThrow('no longer matches the verified workload connection');
      expect(run).toHaveBeenCalledTimes(1);
    } finally {
      run.mockRestore();
      fs.rmSync(manifestPath, { force: true });
    }
  });

  test('does not trust an agent ready file when correlated readiness fails', async () => {
    const generated = path.join(storybookRoot, 'storybook-desktop.generated');
    const manifestPath = path.join(generated, 'driver-manifest.macos.json');
    const readyPath = path.join(generated, 'agent-ready.macos.json');
    const runner = new RecordingRunner();
    runner.readiness.mockImplementation(async () => {
      fs.writeFileSync(readyPath, JSON.stringify({ descriptor: 'agent.json', processId: 1, schemaVersion: 1 }));
      throw new Error('Uncorrelated service readiness');
    });
    const output = { write: jest.fn(() => true) };
    const cli = new DesktopStorybookCli(makeConfig(), {
      ...nativeDriverTestOptions,
      createStoryManifest: createEmptyStoryManifest,
      fetch: async () => new Response('{}'),
      isPortAvailable: async () => true,
      output,
      runner,
    });
    try {
      await expect(cli.driver('macos', { agent: { descriptor: 'agent.json' } })).rejects.toThrow('Uncorrelated service readiness');
      expect(output.write).not.toHaveBeenCalled();
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
    const fetch: typeof globalThis.fetch = async () => new Response('{}');
    const cli = new DesktopStorybookCli(config, {
      ...nativeDriverTestOptions,
      createStoryManifest: createEmptyStoryManifest,
      fetch,
      isPortAvailable: async () => true,
      createMacOSApplicationLeaseResource: () => {
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

  test('leaves a borrowed scope to the integration that tracks the run in it', async () => {
    const manifestPath = path.join(storybookRoot, 'storybook-desktop.generated', 'driver-manifest.windows.json');
    const runner = new RecordingRunner();
    const services = new DesktopServiceScope(runner);
    const close = jest.spyOn(services, 'close');
    const cli = new DesktopStorybookCli(makeConfig({ windows: { smoke: { metroUrl: fixedWindowsMetroUrl } } }), {
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
      // desktop-test integrations guard their run in the scope they lend; closing it from inside would wait on itself.
      await expect(services.guard(cli.driver('windows'))).rejects.toThrow('Owned desktop service stop requested.');
      expect(close).not.toHaveBeenCalled();
      await expect(services.close()).resolves.toBeUndefined();
    } finally {
      fs.rmSync(manifestPath, { force: true });
    }
  });

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
    expect(output.at(-1)).toBe('2 stories rendered\n');
    expect(runner.background[1].args).toEqual(['start', '--no-interactive', '--port', String(cli.instance.metroPort + 1)]);
    expect(runner.foreground.at(-1)?.command).toBe('stop-storybook');
    expect(runner.stopped).toBe(2);
    expect(resolveNativeDriver).not.toHaveBeenCalled();
  });

  test('does not contact an unowned channel or stop an app that was never launched', async () => {
    const runner = new RecordingRunner();
    runner.readiness.mockImplementation(async (expected) => {
      if (expected.service === 'storybook-channel-listener') throw new Error('Channel listener was not owned.');
      return { ...expected, incarnation: 'fixture-incarnation', processId: 1 };
    });
    const fetch = jest.fn(async (_input: Parameters<typeof globalThis.fetch>[0]) => new Response('{}'));
    const cli = new DesktopStorybookCli(
      makeConfig({ macos: { run: { command: 'launch-storybook' }, smoke: { stop: { command: 'stop-storybook' } } } }),
      { ...nativeDriverTestOptions, runner, fetch, isPortAvailable: async () => true, output: { write: () => true } },
    );

    await expect(cli.smoke('macos')).rejects.toThrow('Channel listener was not owned.');
    expect(fetch.mock.calls.some(([url]) => String(url).endsWith('/index.json'))).toBe(false);
    expect(runner.foreground.map(({ command }) => command)).not.toContain('launch-storybook');
    expect(runner.foreground.map(({ command }) => command)).not.toContain('stop-storybook');
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
        expect(output.write).toHaveBeenCalledWith('1 story rendered\n');
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

  test('retains both authoritative traversal and cleanup failures without starting authored tests', async () => {
    const navigationFailure = new Error('navigation failed');
    const cleanupFailure = new Error('session cleanup failed');
    const runSmokeTests = jest.fn();
    const cli = new DesktopStorybookCli(
      makeConfig({ macos: { run: { command: 'launch-storybook' }, smoke: { stop: { command: 'stop-storybook' } } } }),
      {
        ...nativeDriverTestOptions,
        createStoryManifest: createEmptyStoryManifest,
        runner: new RecordingRunner(),
        isPortAvailable: async () => true,
        output: { write: () => true },
        errorOutput: { write: () => true },
        fetch: async () => new Response(JSON.stringify({ entries: { first: { id: 'first--story', type: 'story' } } })),
        runSmokeTests,
        connectStoryTraversal: async () => ({
          assertNativeUi: async () => undefined,
          assertRunning: async () => undefined,
          select: async () => {
            throw navigationFailure;
          },
          close: async () => {
            throw cleanupFailure;
          },
        }),
      },
    );
    await expect(cli.smoke('macos', { mode: 'stories-and-tests' })).rejects.toMatchObject({
      errors: [{ errors: [expect.objectContaining({ cause: navigationFailure })] }, cleanupFailure],
    });
    expect(runSmokeTests).not.toHaveBeenCalled();
  });

  test.each([
    [undefined, undefined, undefined],
    ['accessible', undefined, 'accessible'],
    ['physical', undefined, 'physical'],
    [undefined, 'physical', 'physical'],
    ['accessible', 'physical', 'accessible'],
  ] as const)(
    'runs authored tests after traversing the complete story index (input=%s, DESKTOP_INPUT=%s)',
    async (input, environmentInput, effectiveInput) => {
      const runner = new RecordingRunner();
      const resolveNativeDriver = jest.fn(async () => nativeDriverFor('macos'));
      const events: string[] = [];
      const waitForMacOSApplicationLease = jest.fn(async () => {
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
          waitForMacOSApplicationLease,
          connectStoryTraversal: async (options) => {
            expect(options.input).toBe(effectiveInput);
            return {
              assertNativeUi: async () => undefined,
              assertRunning: async () => undefined,
              select: async (id) => {
                events.push(`select:${id}`);
              },
              close: async () => {
                events.push('close');
                return null;
              },
            };
          },
        },
      );

      const previousInput = process.env.DESKTOP_INPUT;
      if (environmentInput === undefined) delete process.env.DESKTOP_INPUT;
      else process.env.DESKTOP_INPUT = environmentInput;
      try {
        await cli.smoke('macos', { mode: 'stories-and-tests', ...(input ? { input } : {}) });
      } finally {
        if (previousInput === undefined) delete process.env.DESKTOP_INPUT;
        else process.env.DESKTOP_INPUT = previousInput;
      }

      expect(events).toEqual(['lease', 'select:first--story', 'select:second--story', 'close', 'tests']);
      expect(fetch.mock.calls.some(([input]) => input.toString().includes('select-story-sync'))).toBe(false);
      expect(waitForMacOSApplicationLease).toHaveBeenCalledWith(
        path.join(storybookRoot, 'storybook-desktop.generated', 'driver-manifest.macos.json'),
        { timeoutMs: 120_000, signal: expect.any(AbortSignal), createStorage: createFixturePrivateStorage },
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
        scope: { domains: { 'rn.renderer': ['fabric', 'paper'] }, values: { 'rn.renderer': 'fabric' } },
        signal: expect.any(AbortSignal),
        targetId: 'agenticstorybook-macos',
        input,
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
    },
  );

  describe('outcome headers', () => {
    const stories = { entries: { first: { id: 'first--story', type: 'story' }, second: { id: 'second--story', type: 'story' } } };
    const connection = { url: 'https://127.0.0.1:1234', target: 'fixture' };
    const quiet = { write: () => true };

    const fakeReporter = () => {
      const emit = jest.fn();
      const reporter = { runId: 'run', root: storybookRoot, emit, failure: jest.fn(), fail: jest.fn() } as unknown as DesktopReportWriter;
      return { reporter, emit };
    };
    const events = (emit: jest.Mock) => emit.mock.calls.map(([event]) => event);
    const outcomes = (emit: jest.Mock) => events(emit).filter(({ kind, payload }) => kind === 'scope-end' && payload.summary !== undefined);
    const details = (emit: jest.Mock) => events(emit).flatMap(({ kind, payload }) => (kind === 'output' ? [payload.text] : []));
    const renderingFetch =
      (select: () => Response): typeof globalThis.fetch =>
      async (input) =>
        String(input).includes('select-story-sync') ? select() : new Response(JSON.stringify(stories));
    const smokeCli = (fetch: typeof globalThis.fetch, options: object) =>
      new DesktopStorybookCli(
        makeConfig({
          macos: { run: { command: 'launch-storybook' }, smoke: { stop: { command: 'stop-storybook' }, startupTimeoutMs: 100 } },
        }),
        {
          ...nativeDriverTestOptions,
          createStoryManifest: createEmptyStoryManifest,
          runner: new RecordingRunner(),
          fetch,
          isPortAvailable: async () => true,
          errorOutput: quiet,
          ...options,
        },
      );
    const wdioResult = (
      testName: string,
      status: wdioTests.WdioStoryTestResult['status'],
      gap?: 'unsupported',
    ): wdioTests.WdioStoryTestResult => ({
      storyId: 'button--default',
      testName,
      status,
      durationMs: 1,
      ...(gap ? { gap } : {}),
    });
    const testCli = (options: object) =>
      new DesktopStorybookCli(makeDesktopStorybookConfig({ projectRoot: storybookRoot, storyPackages: [] }), {
        createStoryManifest: storyManifestOf(declaredStoryEntry('button--default', [['adaptive', { requires: ['click'] }]])),
        errorOutput: quiet,
        ...options,
      });

    afterEach(() => jest.restoreAllMocks());

    test('summarizes the rendered stories as the outcome of the render step and keeps each story as verbose-only detail', async () => {
      const { reporter, emit } = fakeReporter();
      const output = { write: jest.fn() };
      await smokeCli(
        renderingFetch(() => new Response('{}')),
        { reporter, output },
      ).smoke('macos');
      expect(outcomes(emit)).toEqual([{ kind: 'scope-end', payload: { status: 'passed', summary: '2 stories rendered' } }]);
      expect(details(emit)).toEqual(['rendered first--story\n', 'rendered second--story\n']);
      expect(output.write).not.toHaveBeenCalledWith(expect.stringContaining('rendered first--story'));
    });

    test('names how many stories failed to render, and that the run stopped early, in the failed outcome', async () => {
      const { reporter, emit } = fakeReporter();
      const fetch = renderingFetch(() => new Response(JSON.stringify({ error: 'render failed' }), { status: 500 }));
      await expect(smokeCli(fetch, { reporter, output: quiet }).smoke('macos')).rejects.toThrow('first--story');
      expect(outcomes(emit)).toEqual([
        { kind: 'scope-end', payload: { status: 'failed', summary: '1 of 2 stories failed to render (stopped early; 1 not attempted)' } },
      ]);
    });

    test('prints the render outcome as a line, also when it failed, when there is no reporter', async () => {
      const output: string[] = [];
      const sink = { write: (text: string | Uint8Array) => !!output.push(String(text)) };
      await expect(
        smokeCli(
          renderingFetch(() => new Response(JSON.stringify({ error: 'render failed' }), { status: 500 })),
          { output: sink },
        ).smoke('macos'),
      ).rejects.toThrow('first--story');
      expect(output).toContain('1 of 2 stories failed to render (stopped early; 1 not attempted)\n');
    });

    test.each([false, true])(
      'writes a line for each rendered story only in verbose mode without a reporter (verbose: %s)',
      async (verbose) => {
        const output: string[] = [];
        const sink = { write: (text: string | Uint8Array) => !!output.push(String(text)) };
        await smokeCli(
          renderingFetch(() => new Response('{}')),
          { output: sink, verbose },
        ).smoke('macos');
        expect(output.includes('rendered first--story\n')).toBe(verbose);
        expect(output).toContain('2 stories rendered\n');
      },
    );

    test('summarizes how many story tests executed and passed as the outcome of the test step', async () => {
      const { reporter, emit } = fakeReporter();
      jest
        .spyOn(wdioTests, 'runWdioStoryTests')
        .mockResolvedValueOnce([wdioResult('adaptive', 'passed'), wdioResult('typing', 'unsupported', 'unsupported')]);
      await testCli({ reporter, output: quiet }).test('macos', connection);
      expect(outcomes(emit)).toEqual([
        {
          kind: 'scope-end',
          payload: {
            status: 'passed',
            summary: '1 of 2 story tests executed: 1 passed, 0 failed, 0 skipped, 1 unsupported (1 declared, 0 quarantined)',
          },
        },
      ]);
    });

    test('summarizes the counts a failed test run left, not only the error', async () => {
      const { reporter, emit } = fakeReporter();
      const failure = new wdioTests.WdioStoryTestRunError(
        [wdioResult('adaptive', 'passed'), wdioResult('typing', 'failed')],
        [new Error('typing failed')],
      );
      jest.spyOn(wdioTests, 'runWdioStoryTests').mockRejectedValueOnce(failure);
      await expect(testCli({ reporter, output: quiet }).test('macos', connection)).rejects.toBe(failure);
      expect(outcomes(emit)).toEqual([
        { kind: 'scope-end', payload: { status: 'failed', summary: '2 of 2 story tests executed: 1 passed, 1 failed, 0 skipped' } },
      ]);
    });

    test('prints the test outcome as a line when there is no reporter', async () => {
      const output: string[] = [];
      const sink = { write: (text: string | Uint8Array) => !!output.push(String(text)) };
      jest.spyOn(wdioTests, 'runWdioStoryTests').mockResolvedValueOnce([wdioResult('adaptive', 'passed')]);
      await testCli({ output: sink }).test('macos', connection);
      expect(output).toEqual(['1 of 1 story tests executed: 1 passed, 0 failed, 0 skipped\n']);
    });
  });
});

describe('createDesktopStorybookCommand', () => {
  test('uses the neutral hosted-driver owner and emits canonical readiness', async () => {
    const config = makeConfig();
    const runner = new RecordingRunner();
    const services = new DesktopServiceScope(runner);
    const target = new DesktopStorybookCli(config).workloadTarget('macos');
    const supervisor = {
      target,
      services,
      runner,
      reporter: { runId: 'shared-run', addSecret: jest.fn() },
      startConfiguredServices: jest.fn(async () => undefined),
    } as unknown as DesktopSupervisor;
    const output = { write: jest.fn((_chunk: string | Uint8Array) => true) };
    // eslint-disable-next-line @microsoft/sdl/no-insecure-url -- The command fixture uses a fake loopback driver.
    const driverUrl = 'http://127.0.0.1:1234';
    const start = jest.spyOn(DesktopStorybookCli.prototype, 'startDriver').mockResolvedValue({
      targetId: target.id,
      url: driverUrl,
      serviceReady: { tier: 'service-ready', service: 'storybook-channel', incarnation: 'fixture', processId: 1 },
      integration: {
        name: 'storybook',
        details: {
          services: ['metro', 'storybook-channel'],
          instanceId: 'storybook-instance',
          storybookPort: 1,
          metroPort: 2,
          driverPort: 1234,
        },
      },
    });
    const command = createDesktopStorybookCommand({
      config,
      output,
      runner,
      services,
      supervisor,
      onReady: () => services.requestStop(),
    });
    try {
      await expect(command.parseAsync(['node', 'storybook', '--json', 'driver', '--macos'])).rejects.toThrow('stop requested');
      expect(start).toHaveBeenCalledTimes(1);
      expect(JSON.parse(String(output.write.mock.calls[0][0]))).toMatchObject({
        type: 'ready',
        url: driverUrl,
        targetId: target.id,
        instanceId: target.instanceId,
        runId: 'shared-run',
        integration: { name: 'storybook', details: { instanceId: 'storybook-instance' } },
      });
    } finally {
      start.mockRestore();
      await services.close();
    }
  });

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
    const createPrivateStorage = jest.fn(createFixturePrivateStorage);
    const program = createDesktopStorybookCommand({
      ...nativeDriverTestOptions,
      createPrivateStorage,
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

      expect(createPrivateStorage).toHaveBeenCalled();
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
      const firstManifest = await readDriverManifest(manifestPath, undefined, createFixturePrivateStorage);
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
      const secondManifest = await readDriverManifest(manifestPath, undefined, createFixturePrivateStorage);
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

  test('requires a neutral supervisor for protected drivers and --agent for publication options', async () => {
    const driver = jest.spyOn(DesktopStorybookCli.prototype, 'driver').mockResolvedValue(undefined);
    try {
      const program = () => createDesktopStorybookCommand({ config: makeConfig(), runner: new RecordingRunner() });
      await expect(program().parseAsync(['node', 'test', 'driver', '--win32', '--agent'])).rejects.toThrow('requires a neutral supervisor');
      await program().parseAsync(['node', 'test', 'driver', '--win32']);
      expect(driver.mock.calls.map(([, options]) => options)).toEqual([{ host: undefined, port: undefined }]);
      await expect(program().parseAsync(['node', 'test', 'driver', '--win32', '--descriptor', 'custom.json'])).rejects.toThrow(
        'Descriptor and runner publication options require --agent.',
      );
      await expect(program().parseAsync(['node', 'test', 'driver', '--win32', '--supervisor-descriptor', 'custom.json'])).rejects.toThrow(
        'Descriptor and runner publication options require --agent.',
      );
      expect(driver).toHaveBeenCalledTimes(1);
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
