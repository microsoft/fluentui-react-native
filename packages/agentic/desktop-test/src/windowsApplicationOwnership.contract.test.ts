import { spawn, spawnSync } from 'node:child_process';
import type { ChildProcess } from 'node:child_process';
import { once } from 'node:events';
import fs from 'node:fs';
import path from 'node:path';

import { NativeDesktopHost, createDesktopDriverClient } from '@fluentui-react-native/desktop-driver';
import type { ApplicationLease, NativeApplicationIdentity, NativeDriverArtifact } from '@fluentui-react-native/desktop-driver';
import { describeWindowsService } from '@fluentui-react-native/desktop-driver/authority';
import { resolveNativeDesktopDriver } from '@fluentui-react-native/desktop-driver/native';

import { captureDesktopApplicationIdentity } from './applicationOwnership';
import { validateDesktopConfig } from './config';
import type { ResolvedDesktopTarget } from './config';
import { DesktopRunReporter } from './reporting/collector';
import { DesktopSupervisor } from './supervisor';

jest.setTimeout(300_000);

const enabled =
  process.platform === 'win32' && process.env.FURN_NATIVE_DRIVER_TEST === '1' && process.env.FURN_NATIVE_APPLICATION_OWNERSHIP_TEST === '1';
const endpoints = ['windows', 'win32'] as const;
type Endpoint = (typeof endpoints)[number];
const cases: Record<string, unknown>[] = [];
const targets = new Map<Endpoint, ResolvedDesktopTarget>();
let artifact: NativeDriverArtifact;
let directory: string;

function nativeTest(name: string, run: () => Promise<void>, physical = false) {
  const selected = enabled && (!physical || process.env.FURN_NATIVE_PHYSICAL_INPUT_TEST === '1');
  (selected ? test : test.skip)(name, async () => {
    try {
      await run();
      cases.push({ case: name, state: 'passed' });
    } catch (error) {
      cases.push({ case: name, state: 'failed', error: error instanceof Error ? error.message : String(error) });
      throw error;
    }
  });
  if (enabled && !selected) cases.push({ case: name, state: 'not-run', reason: 'Physical-input opt-in was not enabled.' });
}

async function waitFor<T>(description: string, read: () => Promise<T | undefined>): Promise<T> {
  const expires = Date.now() + 90_000;
  while (Date.now() < expires) {
    const value = await read();
    if (value !== undefined) return value;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error(`Timed out waiting for ${description}.`);
}

async function cleanupAll(label: string, cleanups: (() => Promise<unknown>)[]): Promise<void> {
  const failures: unknown[] = [];
  for (const cleanup of cleanups) {
    try {
      await cleanup();
    } catch (error) {
      failures.push(error);
    }
  }
  if (failures.length) throw new AggregateError(failures, label);
}

function host(endpoint: Endpoint): NativeDesktopHost {
  return new NativeDesktopHost({ artifact, application: targets.get(endpoint)!.host.application!, endpoint });
}

function registration(endpoint: Endpoint) {
  return { endpoint, id: targets.get(endpoint)!.id, launchTimeoutMs: 60_000, platformName: 'windows' } as const;
}

async function ended(identity: NativeApplicationIdentity): Promise<boolean> {
  try {
    const actual = await describeWindowsService({ artifact, pid: identity.processId });
    return actual.startedAt !== identity.processStartedAt;
  } catch (error) {
    if (error !== null && typeof error === 'object' && 'reason' in error && error.reason === 'exited') return true;
    throw error;
  }
}

function supervisor(endpoint: Endpoint, lockDirectory: string, ownership: 'supervisor' | 'external') {
  const output = { write: () => true };
  const reporter = new DesktopRunReporter({ artifactsRoot: path.join(directory, 'reports'), output, errorOutput: output, summary: false });
  return {
    reporter,
    owner: new DesktopSupervisor({
      target: { ...targets.get(endpoint)!, host: { ...targets.get(endpoint)!.host, ownership } },
      reporter,
      reportSession: { reporter, delegated: true, environment: {}, close: async () => 0 },
      lockDirectory,
      recovery: { root: path.join(directory, `${endpoint}-settlement`) },
    }),
  };
}

beforeAll(async () => {
  if (!enabled) return;
  artifact = await resolveNativeDesktopDriver({ platform: 'windows', buildPolicy: 'never' });
  const root = path.join(process.cwd(), 'artifacts', 'desktop');
  fs.mkdirSync(root, { recursive: true });
  directory = fs.mkdtempSync(path.join(root, 'windows-application-ownership-'));
  for (const endpoint of endpoints) {
    const setting = endpoint === 'windows' ? process.env.FURN_OWNERSHIP_WINDOWS_APPLICATION : process.env.FURN_OWNERSHIP_WIN32_APPLICATION;
    if (!setting) throw new Error(`Explicit ${endpoint} application JSON is required for native consumer qualification.`);
    const application: unknown = JSON.parse(setting);
    validateDesktopConfig({ schemaVersion: 1, targets: { [endpoint]: { host: { kind: 'installed', application } } } });
    targets.set(endpoint, {
      endpoint,
      id: `f10w-${endpoint}`,
      registrationId: `f10w-${endpoint}`,
      instanceId: `f10w-consumer-${endpoint}`,
      projectRoot: directory,
      configPath: path.join(directory, 'desktop.config.mts'),
      launchTimeoutMs: 60_000,
      nativeDriver: { helperPath: artifact.executablePath },
      host: {
        kind: 'installed',
        application: application as ResolvedDesktopTarget['host']['application'],
        renderer: endpoint === 'windows' ? 'fabric' : 'paper',
      },
    });
  }
});

afterAll(() => {
  if (!directory) return;
  fs.writeFileSync(
    path.join(directory, 'evidence.json'),
    JSON.stringify(
      {
        recordedAt: new Date().toISOString(),
        sourceRevision: spawnSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8', timeout: 5000 }).stdout?.trim(),
        helperArtifactId: artifact?.artifactId,
        helperSourceDigest: artifact?.sourceDigest,
        endpoints: [...targets].map(([endpoint, target]) => ({
          endpoint,
          renderer: target.host.renderer,
          application: target.host.application,
        })),
        cases,
      },
      null,
      2,
    ),
  );
});

for (const endpoint of endpoints) {
  nativeTest(
    `${endpoint}: five supervisor launches retain exact identity, exclude another service, and tear down without leaks`,
    async () => {
      const incarnations = new Set<string>();
      for (let iteration = 0; iteration < 5; iteration++) {
        const { owner, reporter } = supervisor(endpoint, path.join(directory, `${endpoint}-repeat`), 'supervisor');
        const observer = host(endpoint);
        let identity: NativeApplicationIdentity | undefined;
        try {
          await owner.start();
          const client = createDesktopDriverClient({ url: owner.server.url });
          const capabilities = { alwaysMatch: { platformName: 'windows', 'furn:target': targets.get(endpoint)!.id } };
          const first = await client.newSession(capabilities);
          const lease = owner.server.sessions.get(first.id).lease;
          const { schemaVersion: _schemaVersion, endpoint: _endpoint, ...captured } = captureDesktopApplicationIdentity(lease, endpoint);
          identity = captured;
          expect(lease).toMatchObject({
            ownership: 'attached',
            containment: endpoint === 'windows' ? 'uncontained' : 'job-object',
            launchKind: endpoint === 'windows' ? 'packaged-activation' : 'direct-child',
          });
          if (endpoint === 'windows') expect(identity.aumid).toBe(targets.get(endpoint)!.host.application!.aumid);
          expect(await observer.inspectApplication({ ...registration(endpoint), host: observer })).toEqual(identity);
          const windows = await first.getWindowHandles();
          await expect(observer.attach({ ...registration(endpoint), host: observer })).rejects.toMatchObject({
            data: { reason: 'application-lock-busy' },
          });
          await expect(first.getWindowHandles()).resolves.toEqual(windows);
          await first.delete();
          expect(await ended(identity)).toBe(false);
          const second = await client.newSession(capabilities);
          expect(owner.server.sessions.get(second.id).lease).toEqual(lease);
          await second.delete();
          const claim = JSON.parse(fs.readFileSync(path.join(directory, `${endpoint}-repeat`, 'interactive.lock'), 'utf8'));
          expect(claim.resources).toEqual(
            expect.arrayContaining([
              expect.objectContaining({ ownership: 'owned', disposal: 'pending', application: expect.objectContaining(identity) }),
            ]),
          );
          incarnations.add(JSON.stringify([identity.processId, identity.processStartedAt]));
          cases.push({ case: 'repeat-incarnation', endpoint, iteration, identity, containment: lease.containment, state: 'observed' });
        } finally {
          await cleanupAll('Repeated-launch qualification cleanup failed.', [
            () => observer.dispose(),
            () => owner.close(),
            () => reporter.finish(),
          ]);
        }
        expect(identity).toBeDefined();
        await waitFor('exact application teardown', async () => ((await ended(identity!)) ? true : undefined));
        expect(fs.existsSync(path.join(directory, `${endpoint}-repeat`, 'interactive.lock'))).toBe(false);
      }
      expect(incarnations.size).toBe(5);
    },
  );

  nativeTest(`${endpoint}: native start, session and executable mismatches never acquire the recorded application`, async () => {
    const owner = host(endpoint);
    let lease: ApplicationLease | undefined;
    try {
      lease = await owner.launch({ ...registration(endpoint), host: owner });
      const identity = await owner.inspectApplication({ ...registration(endpoint), host: owner });
      const mismatches = [
        ['identity-start-mismatch', { ...identity, processStartedAt: '2026-01-01T00:00:00.0000000Z' }],
        ['identity-session-mismatch', { ...identity, interactiveSession: 'windows-session:999999' }],
        ['identity-executable-mismatch', { ...identity, executablePath: 'C:\\not-the-recorded-application.exe' }],
      ] as const;
      for (const [reason, processIdentity] of mismatches) {
        const pinned = new NativeDesktopHost({
          artifact,
          endpoint,
          application: { ...targets.get(endpoint)!.host.application, processIdentity },
        });
        try {
          await expect(pinned.inspectApplication({ ...registration(endpoint), host: pinned })).rejects.toMatchObject({ data: { reason } });
          await expect(pinned.recoverApplication(processIdentity)).rejects.toMatchObject({ data: { reason } });
          expect(await ended(identity)).toBe(false);
        } finally {
          await pinned.dispose();
        }
      }
    } finally {
      await cleanupAll('Identity-mismatch qualification cleanup failed.', [
        async () => {
          if (lease) await owner.closeApplication(lease);
        },
        () => owner.dispose(),
      ]);
    }
  });

  nativeTest(`${endpoint}: crashed-owner journal fences a live owner and recovers only its acquired exact application`, async () => {
    const lockDirectory = path.join(directory, `${endpoint}-crash`);
    const requestPath = path.join(directory, `${endpoint}-owner-request.json`);
    const readyPath = path.join(directory, `${endpoint}-owner-ready.json`);
    fs.writeFileSync(requestPath, JSON.stringify({ artifact, lockDirectory, target: targets.get(endpoint) }), { flag: 'wx' });
    const child = spawn(process.execPath, [path.join(__dirname, 'windowsOwnershipOwner.contract.cjs'), requestPath, readyPath], {
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    let childError = '';
    child.stderr!.on('data', (data: Buffer) => {
      childError = (childError + data.toString('utf8')).slice(-16_384);
    });
    let ready:
      | {
          application: NativeApplicationIdentity;
          helper: Awaited<ReturnType<typeof describeWindowsService>>;
          owner: Awaited<ReturnType<typeof describeWindowsService>>;
        }
      | undefined;
    let spawnedOwner: Awaited<ReturnType<typeof describeWindowsService>> | undefined;
    try {
      await once(child, 'spawn');
      spawnedOwner = await describeWindowsService({ artifact, pid: child.pid! });
      ready = await waitFor('the journaled native owner', async () => {
        if (child.exitCode !== null || child.signalCode !== null) throw new Error(`Native owner exited before readiness: ${childError}`);
        return fs.existsSync(readyPath) ? JSON.parse(fs.readFileSync(readyPath, 'utf8')) : undefined;
      });
      expect(ready.owner).toEqual(spawnedOwner);
      await stopExactProcess(ready.helper);
      if (endpoint === 'windows') {
        expect(await ended(ready.application)).toBe(false);
      } else {
        await waitFor('the crashed helper Job Object to drain', async () => ((await ended(ready!.application)) ? true : undefined));
      }
      const live = supervisor(endpoint, lockDirectory, 'external');
      try {
        await expect(live.owner.start()).rejects.toThrow(/live or unknown/);
      } finally {
        await cleanupAll('Live-owner qualification cleanup failed.', [() => live.owner.close(), () => live.reporter.finish()]);
      }
      expect(child.pid).toBe(ready.owner.pid);
      const ownerExited = once(child, 'exit');
      await stopExactProcess(ready.owner);
      await ownerExited;
      const next = supervisor(endpoint, lockDirectory, 'external');
      try {
        await next.owner.start();
        expect(await ended(ready.application)).toBe(true);
      } finally {
        await cleanupAll('Replacement-owner qualification cleanup failed.', [() => next.owner.close(), () => next.reporter.finish()]);
      }
      expect(fs.existsSync(path.join(lockDirectory, 'interactive.lock'))).toBe(false);
      cases.push({
        case: 'crash-recovery',
        endpoint,
        identity: ready.application,
        owner: ready.owner,
        helper: ready.helper,
        state: 'observed',
      });
    } finally {
      await cleanupAll('Crashed-owner qualification cleanup failed.', [
        () => stopChild(child, spawnedOwner),
        async () => {
          if (ready && !(await ended(ready.application))) {
            const cleanup = host(endpoint);
            try {
              await cleanup.recoverApplication(ready.application);
            } finally {
              await cleanup.dispose();
            }
          }
        },
      ]);
    }
  });
}

nativeTest('Windows Fabric: concurrent packaged activations never clean up the winning service application', async () => {
  for (let iteration = 0; iteration < 3; iteration++) {
    const contenders = [host('windows'), host('windows')];
    let identity: NativeApplicationIdentity | undefined;
    try {
      await Promise.all(contenders.map((native) => native.probe()));
      const attempts = await Promise.allSettled(contenders.map((native) => native.launch({ ...registration('windows'), host: native })));
      const winners = attempts.flatMap((attempt, index) => (attempt.status === 'fulfilled' ? [{ lease: attempt.value, index }] : []));
      expect(winners).toHaveLength(1);
      const winner = winners[0];
      identity = await contenders[winner.index].inspectApplication({ ...registration('windows'), host: contenders[winner.index] });
      for (const [index, attempt] of attempts.entries()) {
        if (attempt.status === 'rejected') {
          expect(attempt.reason).toMatchObject({
            data: { reason: expect.stringMatching(/^application-(lock-busy|preexisting)$/) },
          });
          await contenders[index].dispose();
        }
      }
      expect(await ended(identity)).toBe(false);
      expect(await contenders[winner.index].inspectApplication({ ...registration('windows'), host: contenders[winner.index] })).toEqual(
        identity,
      );
      cases.push({ case: 'concurrent-packaged-activation', endpoint: 'windows', iteration, identity, state: 'observed' });
    } finally {
      await cleanupAll(
        'Concurrent packaged activation cleanup failed.',
        contenders.reverse().map((native) => () => native.dispose()),
      );
    }
    if (identity) await waitFor('the concurrent activation winner to exit', async () => ((await ended(identity!)) ? true : undefined));
  }
});

nativeTest(
  'Windows Fabric and Win32 Paper: independent helpers share the physical input mutex',
  async () => {
    const hosts = endpoints.map((endpoint) => host(endpoint));
    const actions = [{ type: 'key' as const, id: 'ownership-shift', actions: [{ type: 'keyDown' as const, value: '\uE008' }] }];
    try {
      for (const [index, endpoint] of endpoints.entries()) await hosts[index].launch({ ...registration(endpoint), host: hosts[index] });
      await hosts[0].performActions(actions);
      await expect(hosts[1].performActions(actions, AbortSignal.timeout(300))).rejects.toMatchObject({
        name: 'AbortError',
        effect: 'none',
      });
      await hosts[0].releaseActions();
      await hosts[1].performActions(actions);
      await hosts[1].releaseActions();
    } finally {
      await cleanupAll(
        'Physical mutex qualification cleanup failed.',
        hosts.reverse().map((native) => () => native.dispose()),
      );
    }
  },
  true,
);

async function stopExactProcess(identity: Awaited<ReturnType<typeof describeWindowsService>>): Promise<void> {
  expect(Number.isSafeInteger(identity.pid) && identity.pid > 0).toBe(true);
  expect(await describeWindowsService({ artifact, pid: identity.pid })).toEqual(identity);
  // Each invocation has one literal numeric PID; no name search, pipeline, wildcard or interpolated script.
  const result = spawnSync(
    'pwsh',
    ['-NoProfile', '-NonInteractive', '-Command', 'Stop-Process', '-Id', String(identity.pid), '-ErrorAction', 'Stop'],
    { encoding: 'utf8', timeout: 30_000, windowsHide: true },
  );
  if (result.error || result.status !== 0) throw result.error ?? new Error('The identity-verified process stop failed.');
}

async function stopChild(child: ChildProcess, identity?: Awaited<ReturnType<typeof describeWindowsService>>): Promise<void> {
  if (child.exitCode !== null || child.signalCode !== null) return;
  const exited = once(child, 'exit');
  child.stdin?.end();
  let timeout: ReturnType<typeof setTimeout>;
  try {
    await Promise.race([
      exited,
      new Promise((resolve) => {
        timeout = setTimeout(resolve, 10_000);
      }),
    ]);
  } finally {
    clearTimeout(timeout!);
  }
  if (child.exitCode === null && child.signalCode === null) {
    if (!identity || child.pid !== identity.pid) throw new Error('Native owner identity was not captured; cleanup remains fenced.');
    await stopExactProcess(identity);
    await exited;
  }
}
