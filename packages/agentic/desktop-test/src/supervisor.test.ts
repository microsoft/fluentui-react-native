import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { accessibleLaneMaskedFeatures } from '@fluentui-react-native/desktop-driver/authoring';
import type { DesktopInputLane } from '@fluentui-react-native/desktop-driver/authoring';
import { NativeDesktopHost, NativeDriverError } from '@fluentui-react-native/desktop-driver';
import type { NativeDriverArtifact } from '@fluentui-react-native/desktop-driver';
import { describeWindowsService } from '@fluentui-react-native/desktop-driver/authority';
import { resolveNativeDesktopDriver } from '@fluentui-react-native/desktop-driver/native';
import type { ResolvedDesktopTarget } from './config.js';
import { startNativeDesktopService } from './driverService.js';
import { DesktopRunReporter } from './reporting/collector.js';
import { DesktopSupervisor } from './supervisor.js';
import type { DesktopSupervisorOptions } from './supervisor.js';
import { createDesktopWorkloadClaim } from './ownership.js';

jest.mock('./driverService', () => ({ startDesktopService: jest.fn(), startNativeDesktopService: jest.fn() }));
jest.mock('./adapters', () => ({ resolveDesktopApplication: jest.fn(async () => ({ executablePath: 'Fixture.app' })) }));
jest.mock('@fluentui-react-native/desktop-driver/native', () => ({ resolveNativeDesktopDriver: jest.fn() }));
jest.mock('@fluentui-react-native/desktop-driver/authority', () => ({
  ...jest.requireActual('@fluentui-react-native/desktop-driver/authority'),
  describeWindowsService: jest.fn(),
}));

describe('desktop supervisor input lane', () => {
  const platform = Object.getOwnPropertyDescriptor(process, 'platform')!;
  const startNative = startNativeDesktopService as jest.MockedFunction<typeof startNativeDesktopService>;
  let artifactsRoot: string;

  beforeEach(() => {
    artifactsRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'furn-desktop-supervisor-'));
    // The helper is mocked, so any host can stand in for the macOS machine the endpoint requires.
    Object.defineProperty(process, 'platform', { ...platform, value: 'darwin' });
    startNative.mockReset();
    // eslint-disable-next-line @microsoft/sdl/no-insecure-url -- the mocked service stands in for a loopback Desktop Driver
    startNative.mockResolvedValue({ url: 'http://127.0.0.1:1', close: async () => undefined } as Awaited<
      ReturnType<typeof startNativeDesktopService>
    >);
  });

  afterEach(() => {
    Object.defineProperty(process, 'platform', platform);
    fs.rmSync(artifactsRoot, { force: true, recursive: true });
  });

  async function nativeServiceOptions(input?: DesktopInputLane) {
    const output = { write: () => true };
    const reporter = new DesktopRunReporter({ artifactsRoot, errorOutput: output, output, reporterMode: 'plain', summary: false });
    const target: ResolvedDesktopTarget = {
      endpoint: 'macos',
      id: 'fixture',
      registrationId: 'fixture',
      instanceId: 'fixture-1',
      projectRoot: artifactsRoot,
      configPath: path.join(artifactsRoot, 'desktop.config.mts'),
      host: { kind: 'installed' },
    };
    const supervisor = new DesktopSupervisor({
      target,
      reporter,
      reportSession: { reporter, delegated: true, environment: {}, close: async () => 0 },
      // Never contend for the real per-user workload claim.
      lockDirectory: path.join(artifactsRoot, 'locks'),
      processIdentity: {
        platform: 'macos',
        pid: process.pid,
        startedAt: '2026-11-12T00:00:00.123456Z',
        executablePath: process.execPath,
        interactiveSession: 'macos-session:1',
      },
      ...(input ? { input } : {}),
    });
    try {
      await supervisor.start();
    } finally {
      await supervisor.close();
    }
    expect(startNative).toHaveBeenCalledTimes(1);
    return startNative.mock.calls[0][0];
  }

  test('starts the native host with physical input disabled for an accessible lane', async () => {
    const options = await nativeServiceOptions('accessible');
    expect(options.disabledInputFeatures).toEqual([...accessibleLaneMaskedFeatures]);
  });

  test.each([['physical' as const], [undefined]])('leaves the native host unmasked for %s', async (input) => {
    const options = await nativeServiceOptions(input);
    expect(options).not.toHaveProperty('disabledInputFeatures');
  });
});

describe('Windows supervisor survivor recovery', () => {
  const platform = Object.getOwnPropertyDescriptor(process, 'platform')!;
  const startNative = jest.mocked(startNativeDesktopService);
  const describeOwner = jest.mocked(describeWindowsService);
  const resolveArtifact = jest.mocked(resolveNativeDesktopDriver);
  const artifact: NativeDriverArtifact = {
    architecture: 'x64',
    artifactId: 'artifact',
    artifactRoot: 'artifact-root',
    buildFingerprint: 'build',
    buildId: 'build',
    compatibilityKey: 'compatibility',
    configuration: 'release',
    endpoints: ['windows', 'win32'],
    features: ['inspectApplication', 'recoverApplication'],
    provider: 'windows',
    executablePath: 'C:\\verified\\furn-desktop-driver-host.exe',
    origin: 'cache',
    schemaVersion: 1,
    signing: { mode: 'none' },
    sourceDigest: 'source',
    wireProtocol: { major: 1, minor: 0 },
  };
  const oldOwner = {
    platform: 'windows' as const,
    pid: process.pid,
    startedAt: '2026-11-12T00:00:00.1234567Z',
    executablePath: process.execPath,
    interactiveSession: 'windows-session:2',
  };
  const currentOwner = { ...oldOwner, startedAt: '2026-11-12T00:00:00.1234568Z' };
  const application = {
    processId: 456,
    processStartedAt: '2026-11-12T00:00:00.7654321Z',
    executablePath: 'C:\\apps\\ReactApp.exe',
    interactiveSession: 'windows-session:2',
    aumid: 'package_family!App',
  };
  let directory: string;
  let recover: jest.SpyInstance;
  let dispose: jest.SpyInstance;
  const lockDirectory = () => path.join(directory, 'locks');
  const filename = () => path.join(lockDirectory(), 'interactive.lock');

  beforeEach(() => {
    directory = fs.mkdtempSync(path.join(process.cwd(), '.supervisor-recovery-test-'));
    Object.defineProperty(process, 'platform', { ...platform, value: 'win32' });
    resolveArtifact.mockReset().mockResolvedValue(artifact);
    describeOwner.mockReset().mockResolvedValue(currentOwner);
    recover = jest.spyOn(NativeDesktopHost.prototype, 'recoverApplication').mockResolvedValue(undefined);
    dispose = jest.spyOn(NativeDesktopHost.prototype, 'dispose').mockResolvedValue(undefined);
    startNative.mockReset();
    // eslint-disable-next-line @microsoft/sdl/no-insecure-url -- mocked loopback listener; no socket is opened
    startNative.mockResolvedValue({ url: 'http://127.0.0.1:1', close: async () => undefined } as Awaited<
      ReturnType<typeof startNativeDesktopService>
    >);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    Object.defineProperty(process, 'platform', platform);
    fs.rmSync(directory, { recursive: true, force: true });
  });

  function survivor() {
    const claim = createDesktopWorkloadClaim({
      directory: lockDirectory(),
      runId: 'crashed',
      targetId: 'packaged',
      targetInstanceId: 'packaged-instance',
      processIdentity: oldOwner,
    });
    claim.updateResource({
      id: 'application:1',
      identity: 'exact-packaged-incarnation',
      generation: 1,
      ownership: 'owned',
      readiness: 'ready',
      disposal: 'pending',
      application: {
        ...application,
        endpoint: 'windows',
        leaseId: 'acquired-packaged-lease',
        lifetime: 'session',
        containment: 'uncontained',
        launchKind: 'packaged-activation',
      },
    });
  }

  function supervisor(overrides: Partial<DesktopSupervisorOptions> = {}) {
    const output = { write: () => true };
    const reporter = new DesktopRunReporter({ artifactsRoot: directory, output, errorOutput: output, summary: false });
    return new DesktopSupervisor({
      target: {
        endpoint: 'windows',
        id: 'packaged',
        registrationId: 'packaged',
        instanceId: 'packaged-instance',
        projectRoot: directory,
        configPath: path.join(directory, 'desktop.config.mts'),
        host: { kind: 'installed', application: { aumid: application.aumid, windowTitle: 'Fixture' } },
      },
      reporter,
      reportSession: { reporter, delegated: true, environment: {}, close: async () => 0 },
      lockDirectory: lockDirectory(),
      processIdentity: currentOwner,
      ...overrides,
    });
  }

  test.each([true, false])('a portable scope can open without a prebuilt helper (explicit identity: %s)', async (explicitIdentity) => {
    resolveArtifact.mockRejectedValue(new NativeDriverError('no-verified-prebuilt', 'No verified helper was provisioned.'));
    const next = supervisor({ processIdentity: explicitIdentity ? currentOwner : undefined });
    try {
      await expect(next.open()).resolves.toBeUndefined();
      expect(startNative).not.toHaveBeenCalled();
      expect(recover).not.toHaveBeenCalled();
      expect(JSON.parse(fs.readFileSync(filename(), 'utf8')).owner.processIdentity).toEqual(explicitIdentity ? currentOwner : undefined);
    } finally {
      await next.close();
    }
    expect(fs.existsSync(filename())).toBe(false);
  });

  test('missing native recovery authority leaves an existing application claim fenced', async () => {
    survivor();
    const before = fs.readFileSync(filename(), 'utf8');
    resolveArtifact.mockRejectedValue(new NativeDriverError('no-verified-prebuilt', 'No verified helper was provisioned.'));
    const next = supervisor();
    try {
      await expect(next.open()).rejects.toThrow(/Another desktop workload holds/);
      expect(recover).not.toHaveBeenCalled();
      expect(fs.readFileSync(filename(), 'utf8')).toBe(before);
    } finally {
      await next.close();
    }
  });

  test('helper verification errors still abort before publication without falling back to an unverified claim', async () => {
    resolveArtifact.mockRejectedValue(new Error('Native artifact integrity failed.'));
    const next = supervisor();
    try {
      await expect(next.open()).rejects.toThrow('Native artifact integrity failed.');
      expect(fs.existsSync(filename())).toBe(false);
      expect(recover).not.toHaveBeenCalled();
      expect(startNative).not.toHaveBeenCalled();
    } finally {
      await next.close();
    }
  });

  test('recovers the exact packaged survivor before publishing the replacement owner and listener', async () => {
    survivor();
    recover.mockImplementation(async () => {
      expect(JSON.parse(fs.readFileSync(filename(), 'utf8')).owner.runId).toBe('crashed');
      expect(startNative).not.toHaveBeenCalled();
    });
    const next = supervisor();
    try {
      await expect(next.start()).resolves.toBeUndefined();
      expect(recover).toHaveBeenCalledWith(application, expect.any(AbortSignal));
      expect(dispose).toHaveBeenCalledTimes(1);
      expect(describeOwner).toHaveBeenCalledWith({ artifact, pid: process.pid });
      expect(resolveArtifact).toHaveBeenCalledWith(expect.objectContaining({ platform: 'windows', buildPolicy: 'never' }));
      expect(startNative).toHaveBeenCalledWith(expect.objectContaining({ artifact }));
      expect(JSON.parse(fs.readFileSync(filename(), 'utf8')).owner.processStartedAt).toBe(currentOwner.startedAt);
    } finally {
      await next.close();
    }
    expect(fs.existsSync(filename())).toBe(false);
  });

  test.each(['live', 'unknown'] as const)('leaves a %s owner fenced before any application cleanup or listener start', async (kind) => {
    survivor();
    if (kind === 'live') describeOwner.mockResolvedValue(oldOwner);
    else describeOwner.mockRejectedValue(Object.assign(new Error('Cannot inspect owner'), { reason: 'helper' }));
    const next = supervisor();
    try {
      await expect(next.start()).rejects.toThrow(/owner.*live|owner.*unknown|live or unknown/);
      expect(recover).not.toHaveBeenCalled();
      expect(startNative).not.toHaveBeenCalled();
      expect(fs.existsSync(filename())).toBe(true);
    } finally {
      await next.close();
    }
  });

  test('a refused survivor identity keeps the old claim and disposes the recovery-only helper', async () => {
    survivor();
    recover.mockRejectedValue(new Error('identity-start-mismatch'));
    const before = fs.readFileSync(filename(), 'utf8');
    const next = supervisor();
    try {
      await expect(next.start()).rejects.toThrow('identity-start-mismatch');
      expect(startNative).not.toHaveBeenCalled();
      expect(dispose).toHaveBeenCalledTimes(1);
      expect(fs.readFileSync(filename(), 'utf8')).toBe(before);
    } finally {
      await next.close();
    }
  });
});
