import { DesktopAuthority } from '../authority/grants.js';
import { createDesktopDriverClient } from '../client/DesktopDriverClient.js';
import type { DesktopDriverClient } from '../client/DesktopDriverClient.js';
import { FakeDesktopHost } from '../hosts/fake/FakeDesktopHost.js';
import { attachFailureEffect } from '../protocol/settlement.js';
import { createDesktopDriverServer } from './createDesktopDriverServer.js';

function barrier() {
  let release!: () => void;
  const pending = new Promise<void>((resolve) => (release = resolve));
  return { pending, release };
}

async function fixture(
  body: (value: {
    authority: DesktopAuthority;
    host: FakeDesktopHost;
    agent: DesktopDriverClient;
    newAgent(): Promise<DesktopDriverClient>;
    runner: DesktopDriverClient;
    operator: DesktopDriverClient;
    url: string;
    capabilities: { alwaysMatch: Record<string, unknown> };
  }) => Promise<void>,
): Promise<void> {
  const authority = new DesktopAuthority();
  const host = new FakeDesktopHost({ features: { boundedObservation: true } });
  const target = { endpoint: 'windows' as const, host, id: 'attached', platformName: 'windows' as const, launchModes: ['attach' as const] };
  const agent = authority.issue({ label: 'agent', targets: [target.id] });
  const runner = authority.issue({ label: 'wdio', targets: [target.id], scopes: ['driver-control', 'declared-workload'] });
  const operator = authority.issue({
    label: 'operator',
    targets: [target.id],
    scopes: ['driver-control', 'declared-workload', 'operator-recovery'],
  });
  const server = await createDesktopDriverServer({ authority, targets: [target] });
  const client = (token: string) => createDesktopDriverClient({ grant: token, url: server.url });
  try {
    await body({
      authority,
      host,
      agent: await client(agent.token).delegateConnection(),
      newAgent: () => client(agent.token).delegateConnection(),
      runner: await runnerConnection(client(runner.token), server.url),
      operator: await runnerConnection(client(operator.token), server.url),
      url: server.url,
      capabilities: { alwaysMatch: { 'furn:target': target.id, 'furn:launchMode': 'attach' } },
    });
  } finally {
    await server.close();
  }
}

async function runnerConnection(client: DesktopDriverClient, url: string): Promise<DesktopDriverClient> {
  const { token } = await client.request<{ token: string }>('POST', '/furn/grants/runner-connection', {});
  return createDesktopDriverClient({ grant: token, url });
}

async function acquire(client: DesktopDriverClient, url: string, handoff?: 'preempt'): Promise<DesktopDriverClient> {
  const { token } = await client.request<{ token: string }>('POST', '/furn/grants/runner', {
    target: 'attached',
    ...(handoff ? { handoff } : {}),
  });
  return createDesktopDriverClient({ grant: token, url });
}

describe('attach-only runner handoff', () => {
  test('rejects unknown runner input without issuing or reserving authority', async () => {
    await fixture(async ({ agent, capabilities, runner }) => {
      await expect(runner.request('POST', '/furn/grants/runner', { target: 'attached', unexpected: true })).rejects.toMatchObject({
        code: 'invalid argument',
      });
      const session = await agent.newSession(capabilities);
      await session.delete();
    });
  });

  test('defaults to bounded busy and never gives the MCP child workload or preemption authority', async () => {
    await fixture(async ({ agent, capabilities, operator, runner, url }) => {
      const session = await agent.newSession(capabilities);
      await expect(acquire(runner, url)).rejects.toMatchObject({ data: { reason: 'target-busy' } });
      await expect(acquire(runner, url, 'preempt')).rejects.toMatchObject({ code: 'unauthorized' });
      await expect(acquire(agent, url, 'preempt')).rejects.toMatchObject({ code: 'unauthorized' });
      await expect(runnerConnection(agent, url)).rejects.toMatchObject({ code: 'unauthorized' });
      await expect(acquire(operator, url, 'preempt')).resolves.toBeDefined();
      await expect(session.getWindowHandles()).rejects.toMatchObject({ code: 'unauthorized' });
    });
  });

  test('refuses preemption of an ancestor rather than joining its own pending handoff drain', async () => {
    await fixture(async ({ capabilities, operator, url }) => {
      const session = await operator.newSession(capabilities);
      await expect(acquire(operator, url, 'preempt')).rejects.toMatchObject({ data: { reason: 'target-busy' } });
      await expect(session.getWindowHandles()).resolves.not.toHaveLength(0);
    });
  });

  test('fences admission across settlement, deletion, reservation, and descendant worker drain', async () => {
    await fixture(async ({ agent, capabilities, host, newAgent, operator, url }) => {
      await agent.newSession(capabilities);
      const entered = barrier();
      const finish = barrier();
      const release = host.releaseActions.bind(host);
      jest.spyOn(host, 'releaseActions').mockImplementationOnce(async (signal) => {
        entered.release();
        await finish.pending;
        return release(signal);
      });
      let completed = false;
      const handoff = acquire(operator, url, 'preempt').then((value) => {
        completed = true;
        return value;
      });
      await entered.pending;
      const contender = await newAgent();
      await expect(contender.newSession(capabilities)).rejects.toMatchObject({ data: { reason: 'target-busy' } });
      expect(completed).toBe(false);
      finish.release();
      const runner = await handoff;
      await expect(contender.newSession(capabilities)).rejects.toMatchObject({ data: { reason: 'target-busy' } });
      const worker = await runner.delegateConnection();
      const session = await worker.newSession(capabilities);
      await expect(contender.request('GET', `/session/${session.id}/window`)).rejects.toMatchObject({ code: 'invalid session id' });
      const workerEntered = barrier();
      const workerFinish = barrier();
      jest.spyOn(host, 'releaseActions').mockImplementationOnce(async (signal) => {
        workerEntered.release();
        await workerFinish.pending;
        return release(signal);
      });
      const drain = operator.revokeConnection();
      await workerEntered.pending;
      await expect(contender.newSession(capabilities)).rejects.toMatchObject({ data: { reason: 'target-busy' } });
      workerFinish.release();
      await drain;
      const next = await contender.newSession(capabilities);
      await next.delete();
      await expect(session.getWindowHandles()).rejects.toMatchObject({ code: 'unauthorized' });
    });
  });

  test('retains failed acquisition cleanup until terminal drain retries it', async () => {
    await fixture(async ({ agent, capabilities, host, runner, url }) => {
      const windows = jest.spyOn(host, 'windows').mockRejectedValueOnce(new Error('injected acquisition failure'));
      const close = jest.spyOn(host, 'closeApplication').mockRejectedValueOnce(new Error('injected lease cleanup failure'));
      await expect(agent.newSession(capabilities)).rejects.toMatchObject({ code: 'session not created' });
      await expect(acquire(runner, url)).rejects.toMatchObject({ data: { reason: 'target-busy' } });
      await agent.revokeConnection();
      const grant = await acquire(runner, url);
      const session = await grant.newSession(capabilities);
      await session.delete();
      expect(close).toHaveBeenCalledTimes(3);
      expect(windows).toHaveBeenCalledTimes(2);
    });
  });

  test('drains a late opening lease and excludes competing handoffs before admitting a worker', async () => {
    await fixture(async ({ agent, capabilities, host, newAgent, operator, runner, url }) => {
      const entered = barrier();
      const finish = barrier();
      const attach = host.attach.bind(host);
      jest.spyOn(host, 'attach').mockImplementationOnce(async (target) => {
        entered.release();
        await finish.pending;
        return attach(target);
      });
      const creating = expect(agent.newSession(capabilities)).rejects.toMatchObject({ code: 'session not created' });
      await entered.pending;
      let completed = false;
      const handoff = acquire(operator, url, 'preempt').then((value) => {
        completed = true;
        return value;
      });
      const contender = await newAgent();
      await expect(acquire(runner, url)).rejects.toMatchObject({ data: { reason: 'target-busy' } });
      await expect(contender.newSession(capabilities)).rejects.toMatchObject({ data: { reason: 'target-busy' } });
      expect(completed).toBe(false);
      finish.release();
      const reservation = await handoff;
      await creating;
      expect(host.actions).toEqual(expect.arrayContaining([expect.objectContaining({ type: 'close-application', ownership: 'attached' })]));
      const worker = await reservation.delegateConnection();
      await expect(worker.newSession({ alwaysMatch: { 'furn:target': 'attached', 'furn:launchMode': 'launch' } })).rejects.toMatchObject({
        code: 'session not created',
      });
      await expect(worker.newSession(capabilities)).resolves.toBeDefined();
    });
  });

  test('failed preemption does not authorize a new controller and its terminal cleanup is retryable', async () => {
    await fixture(async ({ agent, capabilities, host, operator, runner, url }) => {
      await agent.newSession(capabilities);
      jest.spyOn(host, 'releaseActions').mockRejectedValueOnce(attachFailureEffect(new Error('injected release failure'), 'none'));
      await expect(acquire(operator, url, 'preempt')).rejects.toBeDefined();
      await expect(acquire(runner, url)).rejects.toMatchObject({ data: { reason: 'target-busy' } });
      await agent.revokeConnection();
      await expect(acquire(runner, url)).resolves.toBeDefined();
    });
  });
});
