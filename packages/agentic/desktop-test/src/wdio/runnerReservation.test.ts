import { DesktopAuthority } from '@fluentui-react-native/desktop-driver/authority';
import { createDesktopDriverClient, DesktopDriverClient } from '@fluentui-react-native/desktop-driver/client';
import { createDesktopDriverServer } from '@fluentui-react-native/desktop-driver/server';
import { FakeDesktopHost } from '@fluentui-react-native/desktop-driver/testing';

import { acquireDesktopRunnerReservation } from './runnerConnection.js';
import type { DesktopRunnerConnection } from './runnerConnection.js';

async function fixture(
  work: (context: { connection: DesktopRunnerConnection; contender: DesktopDriverClient; secrets: string[] }) => Promise<void>,
): Promise<void> {
  const authority = new DesktopAuthority();
  const host = new FakeDesktopHost();
  const target = { endpoint: 'windows' as const, host, id: 'fixture', platformName: 'windows' as const, launchModes: ['attach' as const] };
  const runner = authority.issue({ label: 'wdio', targets: [target.id], scopes: ['driver-control', 'declared-workload'] });
  const agent = authority.issue({ label: 'agent', targets: [target.id] });
  const server = await createDesktopDriverServer({ authority, targets: [target] });
  try {
    await work({
      connection: { client: createDesktopDriverClient({ grant: runner.token, url: server.url }), url: server.url },
      contender: createDesktopDriverClient({ grant: agent.token, url: server.url }),
      secrets: [],
    });
  } finally {
    jest.restoreAllMocks();
    await server.close();
  }
}

const capabilities = { alwaysMatch: { 'furn:target': 'fixture', 'furn:launchMode': 'attach' } };

describe('in-process desktop runner reservation', () => {
  test('holds the target across separately redacted worker grants and drains a crashed worker', async () => {
    await fixture(async ({ connection, contender, secrets }) => {
      const reservation = await acquireDesktopRunnerReservation({ connection, targetId: 'fixture', addSecret: (s) => secrets.push(s) });
      expect(secrets).toHaveLength(2);
      const first = await reservation.acquireWorker();
      expect(secrets).toContain(first.grant);
      const session = await first.client.newSession(capabilities);
      await expect(reservation.acquireWorker()).rejects.toThrow('previous worker has not drained');
      await expect(contender.newSession(capabilities)).rejects.toMatchObject({ data: { reason: 'target-busy' } });

      await first.close();
      await expect(session.getWindowHandles()).rejects.toMatchObject({ code: 'unauthorized' });
      await expect(contender.newSession(capabilities)).rejects.toMatchObject({ data: { reason: 'target-busy' } });
      const second = await reservation.acquireWorker();
      expect(second.grant).not.toBe(first.grant);
      expect(secrets).toContain(second.grant);
      await second.close();
      await reservation.close();
      const next = await contender.newSession(capabilities);
      await next.delete();
    });
  });

  test('keeps worker admission fenced after a failed drain until that drain is confirmed', async () => {
    await fixture(async ({ connection, contender, secrets }) => {
      const reservation = await acquireDesktopRunnerReservation({ connection, targetId: 'fixture', addSecret: (s) => secrets.push(s) });
      const worker = await reservation.acquireWorker();
      await worker.client.newSession(capabilities);
      const revoke = DesktopDriverClient.prototype.revokeConnection;
      let fail = true;
      jest.spyOn(DesktopDriverClient.prototype, 'revokeConnection').mockImplementation(async function (this: DesktopDriverClient) {
        if (this.principalId === worker.client.principalId && fail) {
          fail = false;
          throw new Error('injected drain failure');
        }
        return revoke.call(this);
      });

      await expect(worker.close()).rejects.toThrow('injected drain failure');
      await expect(reservation.acquireWorker()).rejects.toThrow('previous worker has not drained');
      await expect(contender.newSession(capabilities)).rejects.toMatchObject({ data: { reason: 'target-busy' } });
      await worker.close();
      const next = await reservation.acquireWorker();
      await next.close();
      await reservation.close();
    });
  });

  test('does not reissue an ambiguous worker acquisition and drains its unknown child on close', async () => {
    await fixture(async ({ connection, contender, secrets }) => {
      const fetch = globalThis.fetch;
      let loseResponse = false;
      let deliveries = 0;
      jest.spyOn(globalThis, 'fetch').mockImplementation(async (input, init) => {
        const response = await fetch(input, init);
        if (loseResponse && typeof input === 'string' && input.endsWith('/furn/grants/connection')) {
          deliveries++;
          await response.arrayBuffer();
          throw new Error('injected lost response');
        }
        return response;
      });
      const reservation = await acquireDesktopRunnerReservation({ connection, targetId: 'fixture', addSecret: (s) => secrets.push(s) });
      loseResponse = true;
      await expect(reservation.acquireWorker()).rejects.toMatchObject({ reason: 'transport' });
      await expect(reservation.acquireWorker()).rejects.toThrow('reservation is unavailable');
      expect(deliveries).toBe(1);
      await expect(contender.newSession(capabilities)).rejects.toMatchObject({ data: { reason: 'target-busy' } });
      await reservation.close();
      const next = await contender.newSession(capabilities);
      await next.delete();
    });
  });

  test('does not return a worker when reservation close starts during acquisition', async () => {
    await fixture(async ({ connection, contender, secrets }) => {
      const fetch = globalThis.fetch;
      let release!: () => void;
      let entered!: () => void;
      const pending = new Promise<void>((resolve) => (release = resolve));
      const started = new Promise<void>((resolve) => (entered = resolve));
      let hold = false;
      jest.spyOn(globalThis, 'fetch').mockImplementation(async (input, init) => {
        const response = await fetch(input, init);
        if (hold && typeof input === 'string' && input.endsWith('/furn/grants/connection')) {
          entered();
          await pending;
        }
        return response;
      });
      const reservation = await acquireDesktopRunnerReservation({ connection, targetId: 'fixture', addSecret: (s) => secrets.push(s) });
      hold = true;
      const acquisition = reservation.acquireWorker();
      await started;
      const closing = reservation.close();
      release();
      await expect(acquisition).rejects.toThrow('reservation is closing');
      await closing;
      const next = await contender.newSession(capabilities);
      await next.delete();
    });
  });
});
