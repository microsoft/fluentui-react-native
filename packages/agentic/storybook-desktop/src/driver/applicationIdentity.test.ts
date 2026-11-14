import fs from 'node:fs';
import path from 'node:path';

import { createDesktopDriverClient, createDesktopDriverServer, NativeDriverError } from '@fluentui-react-native/desktop-driver';
import type { DesktopTarget } from '@fluentui-react-native/desktop-driver';
import { FakeDesktopHost } from '@fluentui-react-native/desktop-driver/testing';
import { createDesktopWorkloadClaim } from '@fluentui-react-native/desktop-test';
import { createDesktopApplicationHost } from '@fluentui-react-native/desktop-test/application-ownership';

import { createApplicationIdentityResolver } from './applicationIdentity';
import { BridgeEpochJournal } from './BridgeEpochJournal';

const identity = { processId: 123, processStartedAt: '2026-11-12T00:00:00.123456Z' };

test.each([
  ['macos', 'fabric'],
  ['macos', 'paper'],
  ['windows', 'fabric'],
  ['win32', 'paper'],
] as const)(
  'launch → claim → embedded-driver attach → %s %s epoch inspection retains exact application exclusion',
  async (endpoint, renderer) => {
    const observed =
      endpoint === 'macos'
        ? identity
        : {
            ...identity,
            processStartedAt: '2026-11-12T00:00:00.1234567Z',
            executablePath: 'C:\\apps\\ReactApp.exe',
            interactiveSession: 'windows-session:2',
          };
    const incarnation = { processId: observed.processId, processStartedAt: observed.processStartedAt };
    const directory = fs.mkdtempSync(path.join(process.cwd(), '.application-identity-test-'));
    const registration = {
      endpoint,
      id: 'storybook',
      launchModes: ['attach'],
      platformName: endpoint === 'macos' ? 'macos' : 'windows',
      renderer,
    } satisfies Omit<DesktopTarget, 'host'>;
    const claim = createDesktopWorkloadClaim({
      directory,
      runId: 'bridge-epoch',
      targetId: registration.id,
      targetInstanceId: registration.id,
    });
    const native = new FakeDesktopHost({ endpoint });
    let held = false;
    jest.spyOn(native, 'launch').mockImplementation(async () => {
      held = true;
      return { ...observed, id: 'owned-application', ownership: 'launched', containment: 'uncontained' };
    });
    jest.spyOn(native, 'closeApplication').mockImplementation(async () => {
      held = false;
    });
    const inspectApplication = jest.fn(async (_target: DesktopTarget, signal?: AbortSignal) => {
      signal?.throwIfAborted();
      expect(held).toBe(true);
      return observed;
    });
    const createIdentityHost = jest.fn(() => {
      const foreign = new FakeDesktopHost({ endpoint });
      jest.spyOn(foreign, 'attach').mockImplementation(async () => {
        if (held)
          throw new NativeDriverError('attach-failed', 'Another service controls this incarnation.', { reason: 'application-lock-busy' });
        return { ...observed, id: 'foreign-application', ownership: 'attached' };
      });
      return foreign;
    });
    const host = await createDesktopApplicationHost(Object.assign(native, { inspectApplication }), {
      target: registration,
      lifetime: 'supervisor',
      resourcePrefix: registration.id,
      onResource: (resource) => claim.updateResource(resource),
    });
    let server: Awaited<ReturnType<typeof createDesktopDriverServer>> | undefined;
    try {
      expect(claim.record.resources).toEqual([
        expect.objectContaining({ ownership: 'owned', application: expect.objectContaining(observed) }),
      ]);
      const target = { ...registration, host };
      server = await createDesktopDriverServer({ port: 0, targets: [target] });
      const client = createDesktopDriverClient({ url: server.url });
      const session = await client.newSession({
        alwaysMatch: { platformName: registration.platformName, 'furn:target': registration.id, 'furn:launchMode': 'attach' },
      });
      const before = await session.getWindowHandles();
      const records = new Map<string, string>();
      const journal = new BridgeEpochJournal(
        {
          resolveApplication: createApplicationIdentityResolver({ host: { inspectApplication }, target, createIdentityHost }),
          probeApplication: async () => 'running',
          storage: {
            read: async (name) => records.get(name),
            publish: async (name, value) => {
              records.set(name, value);
            },
            remove: async (name, value) => records.get(name) === value && records.delete(name),
          },
        },
        { endpoint: registration.endpoint, renderer, targetId: registration.id },
      );
      await journal.record('authenticated-epoch');
      await expect(journal.requiresRelaunch()).resolves.toBe(true);
      expect(inspectApplication).toHaveBeenCalledTimes(2);
      expect(createIdentityHost).not.toHaveBeenCalled();
      expect(JSON.parse(records.get('bridge-epoch.json')!)).toMatchObject({ application: incarnation, epoch: 'authenticated-epoch' });
      await expect(session.getWindowHandles()).resolves.toEqual(before);
      const foreign = createIdentityHost();
      await expect(foreign.attach({ ...registration, host: foreign })).rejects.toMatchObject({
        data: { reason: 'application-lock-busy' },
      });
      await foreign.dispose();
      await session.delete();
      expect(held).toBe(true);
    } finally {
      try {
        await server?.close();
        await host.dispose();
        expect(held).toBe(false);
        claim.release();
        expect(fs.existsSync(path.join(directory, 'interactive.lock'))).toBe(false);
      } finally {
        fs.rmSync(directory, { force: true, recursive: true });
      }
    }
  },
);

test.each(['windows', 'win32'] as const)('uses read-only %s inspection without a temporary controlling attachment', async (endpoint) => {
  const host = new FakeDesktopHost({ endpoint });
  const nativeIdentity = {
    ...identity,
    processStartedAt: '2026-11-12T00:00:00.1234567Z',
    executablePath: 'C:\\apps\\ReactTest.exe',
    interactiveSession: 'windows-session:2',
  };
  const inspectApplication = jest.fn().mockResolvedValueOnce(nativeIdentity).mockRejectedValueOnce(new Error('Identity unavailable'));
  const attach = jest.spyOn(host, 'attach');
  const dispose = jest.spyOn(host, 'dispose');
  const resolve = createApplicationIdentityResolver({
    host: { inspectApplication },
    target: { endpoint, host, id: 'storybook', platformName: 'windows' },
    createIdentityHost: () => host,
  });
  attach.mockRejectedValue(new Error('A temporary controlling attachment is not permitted'));
  await expect(resolve()).resolves.toEqual({ processId: nativeIdentity.processId, processStartedAt: nativeIdentity.processStartedAt });
  await expect(resolve()).rejects.toThrow('Identity unavailable');
  expect(inspectApplication).toHaveBeenCalledTimes(2);
  expect(attach).not.toHaveBeenCalled();
  expect(dispose).not.toHaveBeenCalled();
});

test('a failed macOS observation neither falls back to controlling attachment nor disposes the session host', async () => {
  const host = new FakeDesktopHost({ endpoint: 'macos' });
  const dispose = jest.spyOn(host, 'dispose');
  const createIdentityHost = jest.fn(() => host);
  const inspectApplication = jest.fn(async () => {
    throw new Error('Exact identity unavailable');
  });
  const resolve = createApplicationIdentityResolver({
    host: { inspectApplication },
    target: { endpoint: 'macos', host, id: 'storybook', platformName: 'macos' },
    createIdentityHost,
  });
  await expect(resolve()).rejects.toThrow('Exact identity unavailable');
  expect(createIdentityHost).not.toHaveBeenCalled();
  expect(dispose).not.toHaveBeenCalled();
});
