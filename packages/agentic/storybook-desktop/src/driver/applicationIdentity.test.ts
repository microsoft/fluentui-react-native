import fs from 'node:fs';
import path from 'node:path';

import { createDesktopDriverClient, createDesktopDriverServer, NativeDriverError } from '@fluentui-react-native/desktop-driver';
import type { ApplicationLease, DesktopTarget } from '@fluentui-react-native/desktop-driver';
import { FakeDesktopHost } from '@fluentui-react-native/desktop-driver/testing';
import { createDesktopWorkloadClaim } from '@fluentui-react-native/desktop-test';
import { createDesktopApplicationHost } from '@fluentui-react-native/desktop-test/application-ownership';

import { createApplicationIdentityResolver } from './applicationIdentity';
import { BridgeEpochJournal } from './BridgeEpochJournal';

const identity = { processId: 123, processStartedAt: '2026-11-12T00:00:00.123456Z' };

test.each(['fabric', 'paper'] as const)(
  'launch → claim → embedded-driver attach → %s epoch inspection retains exact application exclusion',
  async (renderer) => {
    const directory = fs.mkdtempSync(path.join(process.cwd(), '.application-identity-test-'));
    const registration = {
      endpoint: 'macos',
      id: 'storybook',
      launchModes: ['attach'],
      platformName: 'macos',
      renderer,
    } satisfies Omit<DesktopTarget, 'host'>;
    const claim = createDesktopWorkloadClaim({
      directory,
      runId: 'bridge-epoch',
      targetId: registration.id,
      targetInstanceId: registration.id,
    });
    const native = new FakeDesktopHost({ endpoint: 'macos' });
    let held = false;
    jest.spyOn(native, 'launch').mockImplementation(async () => {
      held = true;
      return { ...identity, id: 'owned-application', ownership: 'launched', containment: 'uncontained' };
    });
    jest.spyOn(native, 'closeApplication').mockImplementation(async () => {
      held = false;
    });
    const inspectApplication = jest.fn(async (_target: DesktopTarget, signal?: AbortSignal) => {
      signal?.throwIfAborted();
      expect(held).toBe(true);
      return identity;
    });
    const createIdentityHost = jest.fn(() => {
      const foreign = new FakeDesktopHost({ endpoint: 'macos' });
      jest.spyOn(foreign, 'attach').mockImplementation(async () => {
        if (held)
          throw new NativeDriverError('attach-failed', 'Another service controls this incarnation.', { reason: 'application-lock-busy' });
        return { ...identity, id: 'foreign-application', ownership: 'attached' };
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
        expect.objectContaining({ ownership: 'owned', application: expect.objectContaining(identity) }),
      ]);
      const target = { ...registration, host };
      server = await createDesktopDriverServer({ port: 0, targets: [target] });
      const client = createDesktopDriverClient({ url: server.url });
      const session = await client.newSession({
        alwaysMatch: { platformName: 'macos', 'furn:target': registration.id, 'furn:launchMode': 'attach' },
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
      expect(JSON.parse(records.get('bridge-epoch.json')!)).toMatchObject({ application: identity, epoch: 'authenticated-epoch' });
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

test.each(['windows', 'win32'] as const)('keeps %s identity attachments isolated and disposes them on failure', async (endpoint) => {
  const host = new FakeDesktopHost({ endpoint });
  const inspectApplication = jest.fn();
  const attach = jest.spyOn(host, 'attach');
  const dispose = jest.spyOn(host, 'dispose');
  const resolve = createApplicationIdentityResolver({
    host: { inspectApplication },
    target: { endpoint, host, id: 'storybook', platformName: 'windows' },
    createIdentityHost: () => host,
  });
  const lease: ApplicationLease = { ...identity, id: 'external-application', ownership: 'attached' };
  attach.mockResolvedValueOnce(lease).mockRejectedValueOnce(new Error('Identity unavailable'));
  await expect(resolve()).resolves.toEqual(identity);
  await expect(resolve()).rejects.toThrow('Identity unavailable');
  expect(inspectApplication).not.toHaveBeenCalled();
  expect(dispose).toHaveBeenCalledTimes(2);
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
