import { spawn, spawnSync } from 'node:child_process';
import type { ChildProcess } from 'node:child_process';
import { once } from 'node:events';
import fs from 'node:fs';
import path from 'node:path';

import { NativeDesktopHost } from '@fluentui-react-native/desktop-driver';
import type { ApplicationLease, NativeDesktopApplicationDescriptor, NativeDriverArtifact } from '@fluentui-react-native/desktop-driver';
import { createDesktopDriverClient } from '@fluentui-react-native/desktop-driver/client';
import { createMacOSApplicationProbe, describeMacOSService } from '@fluentui-react-native/desktop-driver/authority';
import { buildNativeDesktopDriver } from '@fluentui-react-native/desktop-driver/native';

import {
  captureDesktopApplicationIdentity,
  createDesktopApplicationHost,
  desktopApplicationIdentityDescriptor,
} from './applicationOwnership';
import type { DesktopApplicationIdentity } from './applicationOwnership';
import type { ResolvedDesktopTarget } from './config';
import { createDesktopWorkloadClaim, describeDesktopWorkloadOwner, inspectDesktopWorkloadClaim } from './ownership';
import { DesktopRunReporter } from './reporting/collector';
import type { DesktopResourceRecord } from './resources';
import { DesktopSupervisor } from './supervisor';

jest.setTimeout(300_000);

const enabled = process.platform === 'darwin' && process.env.FURN_NATIVE_DRIVER_TEST === '1';
const target = { endpoint: 'macos', id: 'ownership-fixture', platformName: 'macos', launchTimeoutMs: 15_000 } as const;
const evidence: Record<string, unknown>[] = [];
let artifact: NativeDriverArtifact;
let directory: string;
let fixture: { bundle: string; executable: string; bundleIdentifier: string; windowTitle: string };

function recordNativeCase(name: string, run: () => Promise<void>, physical = false) {
  const selected = enabled && (!physical || process.env.FURN_NATIVE_PHYSICAL_INPUT_TEST === '1');
  (selected ? test : test.skip)(name, async () => {
    try {
      await run();
    } catch (error) {
      const failure = { case: name, state: 'failed', error: errorDetails(error) };
      evidence.push(failure);
      console.error(JSON.stringify(failure));
      throw error;
    }
  });
  if (enabled && !selected) evidence.push({ case: name, state: 'skipped', reason: 'Physical-input opt-in is not enabled.' });
}

function nativeTest(name: string, run: () => Promise<void>) {
  recordNativeCase(name, run);
}

function errorDetails(error: unknown, depth = 0): unknown {
  if (!(error instanceof Error) || depth > 4) return String(error);
  return {
    name: error.name,
    message: error.message,
    ...('data' in error ? { data: error.data } : {}),
    ...(error instanceof AggregateError ? { errors: error.errors.map((entry) => errorDetails(entry, depth + 1)) } : {}),
  };
}

async function withCleanup(run: () => Promise<void>, cleanup: () => Promise<void>): Promise<void> {
  try {
    await run();
  } catch (error) {
    try {
      await cleanup();
    } catch (disposal) {
      throw new AggregateError([error, disposal], 'Native application contract and cleanup failed.');
    }
    throw error;
  }
  await cleanup();
}

beforeAll(async () => {
  if (!enabled) return;
  const artifacts = path.join(process.cwd(), 'artifacts', 'desktop');
  fs.mkdirSync(artifacts, { recursive: true });
  directory = fs.mkdtempSync(path.join(artifacts, 'application-ownership-'));
  artifact = await buildNativeDesktopDriver({ platform: 'macos' });
  const driverRoot = path.dirname(require.resolve('@fluentui-react-native/desktop-driver/package.json'));
  const built = spawnSync(process.execPath, [path.join(driverRoot, 'native/macos/fixtures/build.cjs'), path.join(directory, 'fixture')], {
    encoding: 'utf8',
    timeout: 180_000,
  });
  if (built.error || built.status !== 0) throw built.error ?? new Error(built.stderr);
  fixture = JSON.parse(built.stdout);
});

afterAll(() => {
  if (!directory) return;
  fs.writeFileSync(
    path.join(directory, 'evidence.json'),
    JSON.stringify(
      {
        recordedAt: new Date().toISOString(),
        sourceRevision: spawnSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8', timeout: 5000 }).stdout?.trim() || 'unavailable',
        workingTree: spawnSync('git', ['status', '--porcelain', '--untracked-files=no'], { encoding: 'utf8', timeout: 5000 })
          .stdout?.trim()
          .split('\n')
          .filter(Boolean),
        osVersion: spawnSync('sw_vers', ['-productVersion'], { encoding: 'utf8', timeout: 5000 }).stdout?.trim() || 'unavailable',
        architecture: process.arch,
        platform: 'macos',
        fixture: 'appkit',
        helperArtifactId: artifact?.artifactId,
        helperSourceDigest: artifact?.sourceDigest,
        helperSigning: artifact?.signing,
        cases: evidence,
      },
      null,
      2,
    ),
  );
});

function application(overrides: Partial<NativeDesktopApplicationDescriptor> = {}): NativeDesktopApplicationDescriptor {
  return { executablePath: fixture.bundle, bundleIdentifier: fixture.bundleIdentifier, windowTitle: fixture.windowTitle, ...overrides };
}

function nativeHost(descriptor: NativeDesktopApplicationDescriptor): NativeDesktopHost {
  return new NativeDesktopHost({ artifact, endpoint: 'macos', application: descriptor });
}

async function supervisor(name: string, descriptor: NativeDesktopApplicationDescriptor, lifetime: 'supervisor' | 'external') {
  const output = { write: () => true };
  const reporter = new DesktopRunReporter({ artifactsRoot: path.join(directory, 'reports'), output, errorOutput: output, summary: false });
  const resolved: ResolvedDesktopTarget = {
    ...target,
    id: name,
    registrationId: name,
    instanceId: name,
    projectRoot: directory,
    configPath: path.join(directory, 'desktop.config.mts'),
    host: { kind: 'installed', ownership: lifetime, application: descriptor },
  };
  const lockDirectory = path.join(directory, name);
  const host = nativeHost(descriptor);
  const owner = new DesktopSupervisor({
    target: resolved,
    reporter,
    reportSession: { reporter, delegated: true, environment: {}, close: async () => 0 },
    lockDirectory,
    processIdentity: await describeDesktopWorkloadOwner({ helperPath: artifact.executablePath }),
    hostFactory: async () => host,
    recovery: { root: path.join(directory, `${name}-recovery`), probeApplication: createMacOSApplicationProbe({ artifact }) },
  });
  return { owner, host, lockDirectory, reporter };
}

nativeTest('kernel owner identity inspects the real claim as live without wall-clock conversion', async () => {
  const processIdentity = await describeDesktopWorkloadOwner({ helperPath: artifact.executablePath });
  expect(processIdentity?.startedAt).toMatch(/\.[0-9]{6}Z$/);
  const lockDirectory = path.join(directory, 'native-owner');
  const claim = createDesktopWorkloadClaim({
    runId: 'native-owner',
    targetId: target.id,
    targetInstanceId: target.id,
    directory: lockDirectory,
    processIdentity,
  });
  try {
    const inspection = await inspectDesktopWorkloadClaim(path.join(lockDirectory, 'interactive.lock'), async (owner) => ({
      state: 'alive',
      processStartedAt: (await describeMacOSService({ artifact, pid: owner.processId })).startedAt,
    }));
    expect(inspection.state).toBe('live');
    evidence.push({ case: 'native-owner-identity', state: 'passed', processStartedAt: processIdentity!.startedAt });
  } finally {
    claim.release();
  }
});

nativeTest('failed native pre-spawn and rejected LaunchServices launches release claims for subsequent workloads', async () => {
  const descriptors: NativeDesktopApplicationDescriptor[] = [
    application({ processIdentity: { processId: process.pid, processStartedAt: '2026-11-12T00:00:00.123456Z' } }),
    application({ executablePath: path.join(directory, 'missing-executable'), bundleIdentifier: undefined }),
    application({ executablePath: undefined, bundleIdentifier: `com.microsoft.furn.missing.${path.basename(directory)}` }),
    application({ executablePath: path.join(directory, 'Missing.app'), bundleIdentifier: undefined }),
  ];
  for (const [index, descriptor] of descriptors.entries()) {
    const claimOptions = {
      directory: path.join(directory, `rejected-launch-${index}`),
      runId: 'rejected-launch',
      targetId: target.id,
      targetInstanceId: target.id,
    };
    const claim = createDesktopWorkloadClaim(claimOptions);
    const host = await createDesktopApplicationHost(nativeHost(descriptor), {
      target,
      lifetime: 'session',
      resourcePrefix: `rejected-launch-${index}`,
      onResource: (resource) => claim.updateResource(resource),
    });
    await withCleanup(
      async () => {
        await expect(host.launch({ ...target, host })).rejects.toMatchObject({
          data: { applicationSettlement: 'not-started' },
        });
      },
      () => host.dispose(),
    );
    expect(claim.record.unresolvedEffects).toEqual([]);
    claim.release();
    expect(fs.existsSync(path.join(claimOptions.directory, 'interactive.lock'))).toBe(false);
    createDesktopWorkloadClaim({ ...claimOptions, runId: 'subsequent-workload' }).release();
    evidence.push({ case: 'rejected-launch-claim-release', state: 'passed', descriptorCase: index, settlement: 'not-started' });
  }
});

nativeTest('supervisor launch survives two real sessions, records native owner/application identity, and closes exactly', async () => {
  const { owner, host, lockDirectory, reporter } = await supervisor('retained', application(), 'supervisor');
  const probe = createMacOSApplicationProbe({ artifact });
  let lease: ApplicationLease | undefined;
  try {
    await owner.start();
    const client = createDesktopDriverClient({ url: owner.server.url });
    expect(await client.status()).toMatchObject({ targets: [{ id: 'retained', launchModes: ['launch'] }] });
    const capabilities = { alwaysMatch: { platformName: 'macos', 'furn:target': 'retained' } };
    const first = await client.newSession(capabilities);
    lease = owner.server.sessions.get(first.id).lease;
    expect(lease).toMatchObject({ ownership: 'attached', launchKind: 'launch-services', containment: 'uncontained' });
    expect(captureDesktopApplicationIdentity(lease, 'macos').processStartedAt).toMatch(/\.[0-9]{6}Z$/);
    const windows = await first.getWindowHandles();
    await expect(host.inspectApplication({ ...target, host })).resolves.toEqual({
      processId: lease.processId,
      processStartedAt: lease.processStartedAt,
    });
    await expect(first.getWindowHandles()).resolves.toEqual(windows);
    await first.delete();
    await expect(probe(captureDesktopApplicationIdentity(lease, 'macos'))).resolves.toBe('running');
    const second = await client.newSession(capabilities);
    expect(owner.server.sessions.get(second.id).lease).toEqual(lease);
    const claimFile = path.join(lockDirectory, 'interactive.lock');
    const inspected = await inspectDesktopWorkloadClaim(claimFile, async (identity) => ({
      state: 'alive',
      processStartedAt: (await describeMacOSService({ artifact, pid: identity.processId })).startedAt,
    }));
    expect(inspected.state).toBe('live');
    expect(inspected.record.resources).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          ownership: 'owned',
          disposal: 'pending',
          application: expect.objectContaining({
            processId: lease.processId,
            processStartedAt: lease.processStartedAt,
            lifetime: 'supervisor',
          }),
        }),
      ]),
    );
  } finally {
    await owner.close();
    await reporter.finish();
  }
  await expect(probe(captureDesktopApplicationIdentity(lease!, 'macos'))).resolves.toBe('exited');
  expect(fs.existsSync(path.join(lockDirectory, 'interactive.lock'))).toBe(false);
  evidence.push({
    case: 'supervisor-lifetime-and-owner-identity',
    state: 'passed',
    processId: lease!.processId,
    processStartedAt: lease!.processStartedAt,
  });
});

nativeTest('read-only discovery sees newly launched applications and refuses new duplicate bundle identities', async () => {
  const observer = nativeHost(application());
  let child: ChildProcess | undefined;
  let identity: DesktopApplicationIdentity | undefined;
  let first: NativeDesktopHost | undefined;
  let duplicate: ChildProcess | undefined;
  let duplicateIdentity: DesktopApplicationIdentity | undefined;
  let second: NativeDesktopHost | undefined;
  try {
    await expect(observer.inspectApplication({ ...target, host: observer })).rejects.toMatchObject({
      data: { reason: 'no-matching-application' },
    });
    child = spawn(fixture.executable, [], { stdio: 'ignore' });
    await once(child, 'spawn');
    const childIdentity = await describeMacOSService({ artifact, pid: child.pid! });
    identity = captureDesktopApplicationIdentity(
      { id: 'first', ownership: 'attached', processId: child.pid!, processStartedAt: childIdentity.startedAt },
      'macos',
    );
    first = nativeHost(desktopApplicationIdentityDescriptor(identity, application()));
    await first.attach({ ...target, host: first });
    await expect(observer.inspectApplication({ ...target, host: observer })).resolves.toMatchObject({
      processId: identity.processId,
      processStartedAt: identity.processStartedAt,
    });
    duplicate = spawn(fixture.executable, [], { stdio: 'ignore' });
    await once(duplicate, 'spawn');
    const nativeIdentity = await describeMacOSService({ artifact, pid: duplicate.pid! });
    duplicateIdentity = captureDesktopApplicationIdentity(
      { id: 'duplicate', ownership: 'attached', processId: duplicate.pid!, processStartedAt: nativeIdentity.startedAt },
      'macos',
    );
    second = nativeHost(desktopApplicationIdentityDescriptor(duplicateIdentity, application()));
    await second.attach({ ...target, host: second });
    await expect(observer.inspectApplication({ ...target, host: observer })).rejects.toMatchObject({
      code: 'ambiguous-target',
    });
    await second.dispose();
    await stopFixtureChild(duplicate, duplicateIdentity);
    await expect(observer.inspectApplication({ ...target, host: observer })).resolves.toMatchObject({
      processId: identity.processId,
      processStartedAt: identity.processStartedAt,
    });
    await first.dispose();
    await stopFixtureChild(child, identity);
    await expect(observer.inspectApplication({ ...target, host: observer })).rejects.toMatchObject({
      data: { reason: 'no-matching-application' },
    });
    evidence.push({
      case: 'fresh-read-only-discovery-and-duplicate-bundle-refusal',
      state: 'passed',
      processId: identity.processId,
      processStartedAt: identity.processStartedAt,
      duplicateProcessId: duplicateIdentity.processId,
      duplicateProcessStartedAt: duplicateIdentity.processStartedAt,
    });
  } finally {
    const cleanup = [
      first?.dispose(),
      observer.dispose(),
      duplicate ? cleanupExternalFixture(duplicate, duplicateIdentity, [second?.dispose()]) : second?.dispose(),
    ];
    if (child) await cleanupExternalFixture(child, identity, cleanup);
    else await Promise.all(cleanup);
  }
});

nativeTest('independent services exclude the exact external application and preserve it after both cleanups', async () => {
  const child = spawn(fixture.executable, [], { stdio: 'ignore' });
  let identity: DesktopApplicationIdentity | undefined;
  let first: Awaited<ReturnType<typeof supervisor>> | undefined;
  let second: Awaited<ReturnType<typeof supervisor>> | undefined;
  let stale: NativeDesktopHost | undefined;
  const probe = createMacOSApplicationProbe({ artifact });
  try {
    await once(child, 'spawn');
    const nativeIdentity = await describeMacOSService({ artifact, pid: child.pid! });
    identity = captureDesktopApplicationIdentity(
      { id: 'external', ownership: 'attached', processId: child.pid!, processStartedAt: nativeIdentity.startedAt },
      'macos',
    );
    const descriptor = desktopApplicationIdentityDescriptor(identity, application());
    first = await supervisor('external-first', descriptor, 'external');
    second = await supervisor('external-second', descriptor, 'external');
    stale = nativeHost({
      ...descriptor,
      processIdentity: {
        ...descriptor.processIdentity!,
        processStartedAt: `${identity.processStartedAt.slice(0, -2)}${(Number(identity.processStartedAt.at(-2)) + 1) % 10}Z`,
      },
    });
    await first.owner.start();
    await second.owner.start();
    const firstClient = createDesktopDriverClient({ url: first.owner.server.url });
    const secondClient = createDesktopDriverClient({ url: second.owner.server.url });
    expect(await firstClient.status()).toMatchObject({ targets: [{ id: 'external-first', launchModes: ['attach'] }] });
    const capabilities = (id: string) => ({
      alwaysMatch: { platformName: 'macos', 'furn:target': id, 'furn:launchMode': 'attach' },
    });
    const session = await firstClient.newSession(capabilities('external-first'));
    const windows = await session.getWindowHandles();
    await expect(first.host.inspectApplication({ ...target, host: first.host })).resolves.toMatchObject({
      processId: identity.processId,
      processStartedAt: identity.processStartedAt,
    });
    await expect(second.host.inspectApplication({ ...target, host: second.host })).resolves.toMatchObject({
      processId: identity.processId,
      processStartedAt: identity.processStartedAt,
    });
    await expect(secondClient.newSession(capabilities('external-second'))).rejects.toThrow(/Another desktop service controls/);
    await expect(session.getWindowHandles()).resolves.toEqual(windows);
    await expect(stale.attach({ ...target, host: stale })).rejects.toThrow(/incarnation/);
    await expect(probe(identity)).resolves.toBe('running');
    await session.delete();
    const replacement = await secondClient.newSession(capabilities('external-second'));
    expect(second.owner.server.sessions.get(replacement.id).lease.processId).toBe(identity.processId);
    await replacement.delete();
    await first.owner.close();
    await second.owner.close();
    await expect(probe(identity)).resolves.toBe('running');
    evidence.push({ case: 'external-preservation-exact-service-exclusion-stale-identity', state: 'passed', ...identity });
  } finally {
    await cleanupExternalFixture(child, identity, [
      first?.owner.close(),
      second?.owner.close(),
      stale?.dispose(),
      first?.reporter.finish(),
      second?.reporter.finish(),
    ]);
  }
});

async function cleanupExternalFixture(
  child: ChildProcess,
  identity: DesktopApplicationIdentity | undefined,
  work: readonly (Promise<unknown> | undefined)[],
): Promise<void> {
  const cleanup = await Promise.allSettled(work);
  const failures = cleanup.flatMap((result) => (result.status === 'rejected' ? [result.reason] : []));
  try {
    await stopFixtureChild(child, identity);
  } catch (error) {
    failures.push(error);
  }
  if (failures.length) throw new AggregateError(failures, 'External fixture cleanup failed.');
}

async function stopFixtureChild(child: ChildProcess, identity?: DesktopApplicationIdentity): Promise<void> {
  if (child.exitCode !== null || child.signalCode !== null) return;
  if (!identity) throw new Error(`Fixture ${child.pid} has no verified identity; refusing a guessed cleanup.`);
  const probe = createMacOSApplicationProbe({ artifact });
  for (const signal of ['SIGTERM', 'SIGKILL'] as const) {
    const state = await probe(identity);
    if (state === 'unknown') throw new Error(`Fixture ${child.pid} has an unreadable incarnation; refusing to signal it.`);
    if (state === 'running') child.kill(signal);
    if (await waitForChildExit(child)) return;
  }
  throw new Error(`Fixture ${child.pid} did not exit after exact cleanup.`);
}

function waitForChildExit(child: ChildProcess): Promise<boolean> {
  if (child.exitCode !== null || child.signalCode !== null) return Promise.resolve(true);
  return new Promise((resolve) => {
    const onExit = () => {
      clearTimeout(timer);
      resolve(true);
    };
    const timer = setTimeout(() => {
      child.off('exit', onExit);
      resolve(false);
    }, 5_000);
    child.once('exit', onExit);
  });
}

nativeTest('bare executable launches are direct children, not LaunchServices ownership', async () => {
  const executable = path.join(directory, 'direct-child-fixture');
  fs.copyFileSync(fixture.executable, executable);
  fs.chmodSync(executable, 0o700);
  const records: DesktopResourceRecord[] = [];
  const underlying = nativeHost({ executablePath: executable, windowTitle: fixture.windowTitle });
  const host = await createDesktopApplicationHost(underlying, {
    target,
    lifetime: 'session',
    resourcePrefix: 'direct',
    onResource: (record) => records.push(record),
  });
  let lease: ApplicationLease | undefined;
  try {
    lease = await host.launch({ ...target, host });
    expect(lease).toMatchObject({ ownership: 'launched', launchKind: 'direct-child', containment: 'uncontained' });
  } finally {
    await host.dispose();
  }
  expect(records.at(-1)).toMatchObject({ disposal: 'settled', application: { launchKind: 'direct-child' } });
  await expect(createMacOSApplicationProbe({ artifact })(captureDesktopApplicationIdentity(lease!, 'macos'))).resolves.toBe('exited');
  evidence.push({ case: 'direct-child-causal-ownership', state: 'passed' });
});

nativeTest('failed acquired-record publication retains the durable pending claim until exact cleanup', async () => {
  const root = path.join(directory, 'publication-failure');
  const claim = createDesktopWorkloadClaim({
    directory: root,
    runId: 'publication-failure',
    targetId: target.id,
    targetInstanceId: target.id,
    processIdentity: await describeDesktopWorkloadOwner({ helperPath: artifact.executablePath }),
  });
  let identity: DesktopApplicationIdentity | undefined;
  let refusePublication = true;
  const host = await createDesktopApplicationHost(nativeHost(application()), {
    target,
    lifetime: 'session',
    resourcePrefix: 'publication-failure',
    onResource: (resource) => {
      if (resource.application?.processId) {
        identity = captureDesktopApplicationIdentity(
          {
            id: resource.application.leaseId!,
            ownership: 'launched',
            processId: resource.application.processId,
            processStartedAt: resource.application.processStartedAt,
          },
          'macos',
        );
        if (refusePublication) throw new Error('Injected acquired-record publication failure.');
      }
      claim.updateResource(resource);
    },
  });
  try {
    await expect(host.launch({ ...target, host })).rejects.toThrow(/publication failed/);
    expect(identity).toBeDefined();
    await expect(createMacOSApplicationProbe({ artifact })(identity!)).resolves.toBe('running');
    const persisted = JSON.parse(fs.readFileSync(path.join(root, 'interactive.lock'), 'utf8'));
    expect(persisted).toMatchObject({
      state: 'fenced',
      resources: [expect.objectContaining({ readiness: 'pending', disposal: 'pending' })],
    });
    expect(() => claim.release()).toThrow(/unresolved effects/);
    expect(() =>
      createDesktopWorkloadClaim({ directory: root, runId: 'foreign', targetId: target.id, targetInstanceId: target.id }),
    ).toThrow(/Another desktop workload/);
  } finally {
    refusePublication = false;
    await host.dispose();
    claim.release();
  }
  await expect(createMacOSApplicationProbe({ artifact })(identity!)).resolves.toBe('exited');
  evidence.push({ case: 'native-acquired-publication-failure', state: 'passed', ...identity });
});

for (const phase of ['pending', 'acquired'] as const) {
  nativeTest(`owner death with ${phase} publication preserves native survivors and fences replacement`, async () => {
    const root = path.join(directory, `owner-death-${phase}`);
    fs.mkdirSync(root);
    const configurationFile = path.join(root, 'configuration.json');
    const descendantFile = path.join(root, 'descendant.json');
    fs.writeFileSync(
      configurationFile,
      JSON.stringify({
        artifact,
        application: application({ arguments: ['--descendant-ready-file', descendantFile] }),
        directory: root,
      }),
    );
    const child = spawn(
      process.execPath,
      [path.resolve(__dirname, '../fixtures/application-ownership/crash-owner.mjs'), configurationFile, phase],
      { stdio: 'ignore' },
    );
    const probe = createMacOSApplicationProbe({ artifact });
    let ownerIdentity: DesktopApplicationIdentity | undefined;
    let helperIdentity: DesktopApplicationIdentity | undefined;
    let appIdentity: DesktopApplicationIdentity | undefined;
    let descendantIdentity: DesktopApplicationIdentity | undefined;
    let claimContents: string | undefined;
    const claimFile = path.join(root, 'interactive.lock');
    const identify = async (pid: number, executable: string): Promise<DesktopApplicationIdentity> => {
      const observed = await describeMacOSService({ artifact, pid });
      expect(fs.realpathSync(observed.executablePath)).toBe(fs.realpathSync(executable));
      return captureDesktopApplicationIdentity(
        { id: 'fixture-process', ownership: 'attached', processId: pid, processStartedAt: observed.startedAt },
        'macos',
      );
    };
    try {
      await once(child, 'spawn');
      ownerIdentity = await identify(child.pid!, process.execPath);
      await waitForFixtureFile(path.join(root, 'acquired.json'), child);
      const acquired = JSON.parse(fs.readFileSync(path.join(root, 'acquired.json'), 'utf8'));
      expect(acquired.owner).toMatchObject({ pid: ownerIdentity.processId, startedAt: ownerIdentity.processStartedAt });
      appIdentity = await identify(acquired.resource.application.processId, fixture.executable);
      expect(acquired.resource.application).toMatchObject({
        processStartedAt: appIdentity.processStartedAt,
        containment: 'uncontained',
        launchKind: 'launch-services',
      });
      const children = spawnSync('/usr/bin/pgrep', ['-P', String(child.pid)], { encoding: 'utf8', timeout: 5000 });
      expect(children.status).toBe(0);
      const helperPids = children.stdout.trim().split(/\s+/).map(Number);
      expect(helperPids).toHaveLength(1);
      helperIdentity = await identify(helperPids[0], artifact.executablePath);
      await waitForFixtureFile(descendantFile, child);
      const descendant = JSON.parse(fs.readFileSync(descendantFile, 'utf8'));
      expect(descendant.parentProcessId).toBe(appIdentity.processId);
      descendantIdentity = await identify(descendant.processId, '/bin/sleep');
      const parent = spawnSync('/bin/ps', ['-p', String(descendant.processId), '-o', 'ppid='], { encoding: 'utf8', timeout: 5000 });
      expect(Number(parent.stdout.trim())).toBe(appIdentity.processId);
      claimContents = fs.readFileSync(claimFile, 'utf8');
      expect(JSON.parse(claimContents)).toMatchObject({
        state: 'fenced',
        resources: [expect.objectContaining({ readiness: phase === 'pending' ? 'pending' : 'ready', disposal: 'pending' })],
      });
      if (phase === 'pending') expect(JSON.parse(claimContents).resources[0].application.processId).toBeUndefined();
      else expect(JSON.parse(claimContents).resources[0].application.processStartedAt).toBe(appIdentity.processStartedAt);
      await expect(probe(ownerIdentity)).resolves.toBe('running');
      child.kill('SIGKILL');
      expect(await waitForChildExit(child)).toBe(true);
      await waitForExactExit(helperIdentity);
      await expect(probe(appIdentity)).resolves.toBe('running');
      await expect(probe(descendantIdentity)).resolves.toBe('running');
      await expect(
        inspectDesktopWorkloadClaim(claimFile, async () => ({ state: (await probe(ownerIdentity!)) === 'exited' ? 'exited' : 'unknown' })),
      ).resolves.toMatchObject({ state: 'exited', record: { state: 'fenced' } });
      expect(() =>
        createDesktopWorkloadClaim({ directory: root, runId: 'replacement', targetId: target.id, targetInstanceId: target.id }),
      ).toThrow(/Another desktop workload/);
      expect(fs.readFileSync(claimFile, 'utf8')).toBe(claimContents);
      const observer = nativeHost(desktopApplicationIdentityDescriptor(appIdentity, application()));
      try {
        await expect(observer.inspectApplication({ ...target, host: observer })).resolves.toMatchObject({
          processId: appIdentity.processId,
          processStartedAt: appIdentity.processStartedAt,
        });
      } finally {
        await observer.dispose();
      }
      await stopExactFixtureProcess(appIdentity);
      await expect(probe(descendantIdentity)).resolves.toBe('running');
      evidence.push({
        case: `owner-death-${phase}-publication`,
        state: 'passed',
        ownerIdentity,
        helperIdentity,
        appIdentity,
        descendantIdentity,
        descendantSurvivedPrimaryExit: true,
        automaticRecovery: false,
      });
    } finally {
      if (ownerIdentity) await stopFixtureChild(child, ownerIdentity);
      if (helperIdentity) await stopExactFixtureProcess(helperIdentity);
      if (appIdentity) await stopExactFixtureProcess(appIdentity);
      if (descendantIdentity) await stopExactFixtureProcess(descendantIdentity);
      if (claimContents && fs.readFileSync(claimFile, 'utf8') === claimContents) {
        // Only this fixture's recorded owner, helper, app and descendant have been proven exited.
        fs.unlinkSync(claimFile);
        evidence.push({ case: `owner-death-${phase}-operator-cleanup`, state: 'passed' });
      }
    }
  });
}

async function waitForFixtureFile(filename: string, child: ChildProcess): Promise<void> {
  const deadline = Date.now() + 30_000;
  while (!fs.existsSync(filename)) {
    if (child.exitCode !== null || child.signalCode !== null) throw new Error(`Fixture owner exited before ${path.basename(filename)}.`);
    if (Date.now() >= deadline) throw new Error(`Fixture owner did not publish ${path.basename(filename)}.`);
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
}

async function waitForExactExit(identity: DesktopApplicationIdentity): Promise<void> {
  const probe = createMacOSApplicationProbe({ artifact });
  const deadline = Date.now() + 10_000;
  while ((await probe(identity)) !== 'exited') {
    if (Date.now() >= deadline) throw new Error(`Fixture ${identity.processId} did not prove exact exit.`);
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
}

async function stopExactFixtureProcess(identity: DesktopApplicationIdentity): Promise<void> {
  const probe = createMacOSApplicationProbe({ artifact });
  const state = await probe(identity);
  if (state === 'unknown') throw new Error(`Fixture ${identity.processId} has an unreadable incarnation; refusing cleanup.`);
  if (state === 'running') process.kill(identity.processId, 'SIGKILL');
  await waitForExactExit(identity);
}

nativeTest('post-launch cancellation journals the exact unleased process and its settled exit', async () => {
  const ready = path.join(directory, 'cancelled.ready');
  const records: DesktopResourceRecord[] = [];
  const underlying = nativeHost(application({ windowTitle: 'Deliberately missing title', arguments: ['--ready-file', ready] }));
  const host = await createDesktopApplicationHost(underlying, {
    target,
    lifetime: 'session',
    resourcePrefix: 'cancelled',
    onResource: (record) => records.push(record),
  });
  const controller = new AbortController();
  const launching = host.launch({ ...target, host }, controller.signal).catch((error: unknown) => error);
  try {
    const deadline = Date.now() + 10_000;
    while (!fs.existsSync(ready)) {
      if (Date.now() >= deadline) throw new Error('The application did not publish post-launch readiness.');
      await new Promise((resolve) => setTimeout(resolve, 25));
    }
    controller.abort();
    expect(await launching).toMatchObject({ name: 'AbortError', data: { applicationSettlement: 'exited' } });
    const record = records.at(-1)!;
    expect(record).toMatchObject({
      readiness: 'failed',
      disposal: 'settled',
      application: { processId: Number(fs.readFileSync(ready, 'utf8')), launchKind: 'launch-services' },
    });
    await expect(
      createMacOSApplicationProbe({ artifact })({
        processId: record.application!.processId!,
        processStartedAt: record.application!.processStartedAt!,
      }),
    ).resolves.toBe('exited');
    evidence.push({ case: 'cancelled-unleased-process-journal', state: 'passed', application: record.application });
  } finally {
    controller.abort();
    await launching;
    await host.dispose();
  }
});

for (const launchKind of ['direct-child', 'launch-services'] as const) {
  nativeTest(`failed native ${launchKind} launch records exact primary-process cleanup evidence`, async () => {
    const executable = path.join(directory, 'failed-direct-fixture');
    if (launchKind === 'direct-child') {
      fs.copyFileSync(fixture.executable, executable);
      fs.chmodSync(executable, 0o700);
    }
    const records: DesktopResourceRecord[] = [];
    const host = await createDesktopApplicationHost(
      nativeHost(
        launchKind === 'direct-child'
          ? { executablePath: executable, windowTitle: 'Deliberately missing title' }
          : application({ windowTitle: 'Deliberately missing title' }),
      ),
      {
        target,
        lifetime: 'session',
        resourcePrefix: `failed-${launchKind}`,
        onResource: (record) => records.push(record),
      },
    );
    await withCleanup(
      async () => {
        const failure = await host.launch({ ...target, host }).catch((error: unknown) => error);
        evidence.push({ case: `rejected-${launchKind}-launch`, state: 'observed', failure: errorDetails(failure), records });
        expect(failure).toMatchObject({ code: 'launch-failed', data: { applicationSettlement: 'exited', launchKind } });
        const record = records.at(-1)!;
        expect(record).toMatchObject({ readiness: 'failed', disposal: 'settled', application: { launchKind } });
        const identity = captureDesktopApplicationIdentity(
          {
            id: 'failed-launch',
            ownership: 'launched',
            processId: record.application!.processId,
            processStartedAt: record.application!.processStartedAt,
          },
          'macos',
        );
        await expect(createMacOSApplicationProbe({ artifact })(identity)).resolves.toBe('exited');
        evidence.push({
          case: `failed-${launchKind}-exact-cleanup`,
          state: 'passed',
          application: record.application,
          failure: errorDetails(failure),
        });
      },
      () => host.dispose(),
    );
  });
}

recordNativeCase(
  'two independent helpers serialize physical input across different applications',
  async () => {
    const first = nativeHost(application({ windowTitle: 'Input mutex A', arguments: ['--title', 'Input mutex A'] }));
    const second = nativeHost(application({ windowTitle: 'Input mutex B', arguments: ['--title', 'Input mutex B'] }));
    try {
      expect((await first.probe()).features.keyboard).toBe(true);
      expect((await second.probe()).features.keyboard).toBe(true);
      await first.launch({ ...target, host: first });
      await second.launch({ ...target, host: second });
      const down = [{ type: 'key' as const, id: 'mutex', actions: [{ type: 'keyDown' as const, value: '\uE008' }] }];
      await first.performActions(down);
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 500);
      try {
        await expect(second.performActions(down, controller.signal)).rejects.toMatchObject({ name: 'AbortError' });
      } finally {
        clearTimeout(timeout);
        await first.releaseActions();
      }
      await second.performActions([{ ...down[0], actions: [...down[0].actions, { type: 'keyUp', value: '\uE008' }] }]);
      evidence.push({ case: 'cross-helper-physical-input-mutex', state: 'passed' });
    } finally {
      await Promise.all([first.releaseActions(), second.releaseActions()]);
      await Promise.all([first.dispose(), second.dispose()]);
    }
  },
  true,
);
