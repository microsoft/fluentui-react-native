import { spawn, spawnSync } from 'node:child_process';
import type { ChildProcess } from 'node:child_process';
import { once } from 'node:events';

import { describeWindowsService } from '../../authority/windowsServiceIdentity';
import type { ApplicationLease } from '../../host/types';
import { NativeHostProcess } from '../../hosts/native/NativeHostProcess';
import type { NativeApplicationIdentity } from '../types';
import { fixtureExecutable, helperArtifact, required, waitFor, windowsContractTest } from './win32FixtureSupport';

jest.setTimeout(240_000);

const windowsTest = windowsContractTest();
const physicalTest = process.env.FURN_NATIVE_PHYSICAL_INPUT_TEST === '1' ? windowsContractTest('keyboard') : test.skip;
const externalIdentities = new WeakMap<ChildProcess, Awaited<ReturnType<typeof describeWindowsService>>>();

function oneTickMismatch(startedAt: string): string {
  const fraction = Number(startedAt.slice(-8, -1));
  const changed = fraction === 9_999_999 ? fraction - 1 : fraction + 1;
  return `${startedAt.slice(0, -8)}${String(changed).padStart(7, '0')}Z`;
}

async function cleanupAll(cleanups: (() => Promise<unknown>)[]): Promise<void> {
  const failures: unknown[] = [];
  for (const cleanup of cleanups) {
    try {
      await cleanup();
    } catch (error) {
      failures.push(error);
    }
  }
  if (failures.length) throw new AggregateError(failures, 'Native ownership fixture cleanup failed.');
}

async function external(title: string): Promise<ChildProcess> {
  const executable = await fixtureExecutable();
  const artifact = await helperArtifact();
  const child = spawn(executable, ['--title', title, '--offscreen', '1', '--lifetime-ms', '90000'], {
    stdio: 'ignore',
    windowsHide: true,
  });
  await once(child, 'spawn');
  try {
    const identity = await describeWindowsService({ artifact, pid: required(child.pid, 'fixture PID') });
    expect(identity.executablePath.toLowerCase()).toBe(executable.toLowerCase());
    externalIdentities.set(child, identity);
  } catch (error) {
    await waitFor(
      'the unverified fixture lifetime to expire',
      async () => (child.exitCode !== null || child.signalCode !== null ? true : undefined),
      { timeoutMs: 100_000 },
    );
    throw error;
  }
  return child;
}

async function closeExternal(child: ChildProcess): Promise<void> {
  if (child.exitCode !== null || child.signalCode !== null) return;
  const identity = required(externalIdentities.get(child), 'the externally launched fixture identity');
  expect(Number.isSafeInteger(identity.pid) && identity.pid > 0).toBe(true);
  expect(await describeWindowsService({ artifact: await helperArtifact(), pid: identity.pid })).toEqual(identity);
  const exited = once(child, 'exit');
  const result = spawnSync(
    'pwsh',
    ['-NoProfile', '-NonInteractive', '-Command', 'Stop-Process', '-Id', String(identity.pid), '-ErrorAction', 'Stop'],
    { encoding: 'utf8', timeout: 30_000, windowsHide: true },
  );
  if (result.error || result.status !== 0) throw result.error ?? new Error('The identity-verified fixture stop failed.');
  await exited;
}

async function inspect(host: NativeHostProcess, title: string) {
  return (
    await host.request<NativeApplicationIdentity>('inspectApplication', {
      application: { executablePath: await fixtureExecutable(), windowTitle: title },
      endpoint: 'win32',
    })
  ).result;
}

describe('Windows exact application ownership', () => {
  windowsTest('inspects without taking control and excludes a second independent helper until release', async () => {
    const title = `furn-ownership-external-${process.pid}-${Date.now()}`;
    const child = await external(title);
    const params = { application: { executablePath: await fixtureExecutable(), windowTitle: title }, endpoint: 'win32' };
    const cleanups = [() => closeExternal(child)];
    try {
      const first = await NativeHostProcess.start({ artifact: await helperArtifact() });
      cleanups.unshift(() => first.dispose());
      const second = await NativeHostProcess.start({ artifact: await helperArtifact() });
      cleanups.unshift(() => second.dispose());
      const observed = await waitFor('the external fixture identity', async () => inspect(first, title).catch(() => undefined), {
        intervalMs: 100,
        timeoutMs: 20_000,
      });
      const native = await describeWindowsService({ artifact: await helperArtifact(), pid: required(child.pid, 'fixture PID') });
      expect(observed).toEqual({
        processId: child.pid,
        processStartedAt: native.startedAt,
        executablePath: native.executablePath,
        interactiveSession: native.interactiveSession,
      });
      const { result: lease } = await first.request<ApplicationLease>('attach', params);
      expect(lease).toMatchObject({ ...observed, ownership: 'attached', containment: 'external' });
      const before = (await first.request('windows', { lease })).result;
      expect(await inspect(second, title)).toEqual(observed);
      expect((await first.request('windows', { lease })).result).toEqual(before);
      await expect(second.request('attach', params)).rejects.toMatchObject({
        code: 'attach-failed',
        data: { reason: 'application-lock-busy' },
      });
      await first.request('closeApplication', { lease });
      const borrowed = (await second.request<ApplicationLease>('attach', params)).result;
      await second.request('closeApplication', { lease: borrowed });
      expect(child.exitCode).toBeNull();
    } finally {
      await cleanupAll(cleanups);
    }
  });

  windowsTest('refuses one-tick PID reuse, a different session and executable before acquiring a lease', async () => {
    const title = `furn-ownership-stale-${process.pid}-${Date.now()}`;
    const host = await NativeHostProcess.start({ artifact: await helperArtifact() });
    const application = {
      executablePath: await fixtureExecutable(),
      windowTitle: title,
      arguments: ['--title', title, '--offscreen', '1'],
    };
    let lease: ApplicationLease | undefined;
    try {
      lease = (await host.request<ApplicationLease>('launch', { application, endpoint: 'win32', launchTimeoutMs: 20_000 })).result;
      const observed = await inspect(host, title);
      const cases = [
        ['identity-start-mismatch', { ...observed, processStartedAt: oneTickMismatch(observed.processStartedAt) }],
        ['identity-session-mismatch', { ...observed, interactiveSession: 'windows-session:999999' }],
        ['identity-executable-mismatch', { ...observed, executablePath: 'C:\\not-the-fixture.exe' }],
      ] as const;
      for (const [reason, identity] of cases) {
        await expect(
          host.request('inspectApplication', { application: { ...application, processIdentity: identity }, endpoint: 'win32' }),
        ).rejects.toMatchObject({ data: { reason } });
      }
      expect(await inspect(host, title)).toEqual(observed);
    } finally {
      await cleanupAll([
        async () => {
          if (lease) await host.request('closeApplication', { lease });
        },
        () => host.dispose(),
      ]);
    }
  });

  windowsTest('rejects two matching process/window candidates rather than selecting the first', async () => {
    const title = `furn-ownership-ambiguous-${process.pid}-${Date.now()}`;
    const host = await NativeHostProcess.start({ artifact: await helperArtifact() });
    const cleanups = [() => host.dispose()];
    try {
      const first = await external(title);
      cleanups.push(() => closeExternal(first));
      await waitFor('the first external fixture', async () => inspect(host, title).catch(() => undefined), {
        intervalMs: 100,
        timeoutMs: 20_000,
      });
      const second = await external(title);
      cleanups.push(() => closeExternal(second));
      await waitFor(
        'two matching external windows',
        async () =>
          host
            .request('inspectApplication', {
              application: { executablePath: await fixtureExecutable(), windowTitle: title },
              endpoint: 'win32',
            })
            .then(
              () => false,
              (error: { code?: string; data?: { reason?: string } }) =>
                error.code === 'ambiguous-target' && error.data?.reason === 'application-identity-ambiguous',
            ),
        { intervalMs: 100, timeoutMs: 20_000 },
      );
    } finally {
      await cleanupAll(cleanups);
    }
  });

  windowsTest('records exact contained identity across five consecutive launch/close cycles without reuse', async () => {
    const host = await NativeHostProcess.start({ artifact: await helperArtifact() });
    const incarnations = new Set<string>();
    try {
      for (let iteration = 0; iteration < 5; iteration++) {
        const title = `furn-ownership-repeat-${process.pid}-${iteration}-${Date.now()}`;
        const lease = (
          await host.request<ApplicationLease>('launch', {
            application: {
              executablePath: await fixtureExecutable(),
              windowTitle: title,
              arguments: ['--title', title, '--offscreen', '1'],
            },
            endpoint: 'win32',
            launchTimeoutMs: 20_000,
          })
        ).result;
        expect(lease).toMatchObject({
          containment: 'job-object',
          launchKind: 'direct-child',
          interactiveSession: expect.stringMatching(/^windows-session:[0-9]+$/),
          processStartedAt: expect.stringMatching(/\.[0-9]{7}Z$/),
        });
        const observed = await inspect(host, title);
        incarnations.add(JSON.stringify([observed.processId, observed.processStartedAt]));
        await host.request('closeApplication', { lease });
        await host.request('recoverApplication', { identity: observed, endpoint: 'win32' });
      }
      expect(incarnations.size).toBe(5);
    } finally {
      await host.dispose();
    }
  });

  physicalTest('serializes independent applications through the native input mutex until release', async () => {
    const cleanups: (() => Promise<unknown>)[] = [];
    const actions = (down: boolean) => [
      { type: 'key', id: 'ownership-shift', actions: [{ type: down ? 'keyDown' : 'keyUp', value: '\uE008' }] },
    ];
    try {
      const first = await NativeHostProcess.start({ artifact: await helperArtifact() });
      cleanups.unshift(() => first.dispose());
      const second = await NativeHostProcess.start({ artifact: await helperArtifact() });
      cleanups.unshift(() => second.dispose());
      for (const [index, host] of [first, second].entries()) {
        const title = `furn-ownership-input-${process.pid}-${index}-${Date.now()}`;
        await host.request('launch', {
          application: {
            executablePath: await fixtureExecutable(),
            windowTitle: title,
            arguments: ['--title', title, '--offscreen', '0'],
          },
          launchTimeoutMs: 20_000,
          endpoint: 'win32',
        });
      }
      await first.request('performActions', { actions: actions(true) });
      await expect(second.request('performActions', { actions: actions(true) }, AbortSignal.timeout(300))).rejects.toMatchObject({
        name: 'AbortError',
        effect: 'none',
      });
      await first.request('releaseActions');
      await second.request('performActions', { actions: actions(true) });
      await second.request('releaseActions');
    } finally {
      await cleanupAll(cleanups);
    }
  });
});
