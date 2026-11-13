import { DesktopAuthority } from '../authority/grants.js';
import { createDesktopDriverClient } from '../client/DesktopDriverClient.js';
import { createDesktopDriverTestHarness } from '../testing/protocolHarness.js';

describe('connection grant routes', () => {
  test('isolates two connections reading the same parent grant and drains descendants', async () => {
    const authority = new DesktopAuthority();
    const parent = authority.issue({
      label: 'agent',
      scopes: ['driver-control', 'declared-workload', 'operator-recovery'],
      targets: '*',
    });
    const harness = await createDesktopDriverTestHarness({}, undefined, { authority });
    const client = createDesktopDriverClient({ grant: parent.token, url: harness.server.url });
    try {
      const first = await client.delegateConnection();
      const second = await client.delegateConnection();
      expect(first.principalId).toMatch(/^[a-f0-9]{32}$/);
      expect(() =>
        authority.delegate(first.principalId ?? '', {
          label: 'escalation',
          scopes: ['operator-recovery'],
          targets: '*',
        }),
      ).toThrow('exceed');
      const session = await first.newSession({ alwaysMatch: { 'furn:target': harness.target.id } });
      await expect(second.request('GET', `/session/${session.id}/window`)).rejects.toMatchObject({ code: 'invalid session id' });
      await expect(client.request('GET', `/session/${session.id}/window`)).rejects.toMatchObject({ code: 'invalid session id' });
      const status = await second.status();
      const output = JSON.stringify(status);
      expect(output).not.toContain(parent.token);
      expect(output).not.toContain(session.id);
      await authority.revokeAndDrain(parent.id);
      expect(() => harness.server.sessions.get(session.id)).toThrow();
      await expect(first.status()).rejects.toMatchObject({ code: 'unauthorized' });
      await expect(second.status()).rejects.toMatchObject({ code: 'unauthorized' });
      await expect(first.request('DELETE', `/furn/grants/${second.principalId}`)).rejects.toMatchObject({ code: 'unauthorized' });
      await expect(first.request('POST', '/session', {})).rejects.toMatchObject({ code: 'unauthorized' });
      await expect(first.revokeConnection()).resolves.toBeNull();
    } finally {
      await harness.close();
    }
  });

  test('child self-revocation is an awaited session drain and cannot revoke its parent', async () => {
    const authority = new DesktopAuthority();
    const parent = authority.issue({ label: 'agent', targets: '*' });
    const harness = await createDesktopDriverTestHarness({}, undefined, { authority });
    const client = createDesktopDriverClient({ grant: parent.token, url: harness.server.url });
    try {
      await expect(client.revokeConnection()).rejects.toMatchObject({ code: 'unauthorized' });
      const child = await client.delegateConnection();
      const session = await child.newSession({ alwaysMatch: { 'furn:target': harness.target.id } });
      await child.revokeConnection();
      expect(() => harness.server.sessions.get(session.id)).toThrow();
      await expect(child.status()).rejects.toMatchObject({ code: 'unauthorized' });
      await expect(client.status()).resolves.toMatchObject({ ready: true });
    } finally {
      await harness.close();
    }
  });

  test.each(['declared-workload', 'operator-recovery'] as const)('does not treat %s as driver authority', async (scope) => {
    const authority = new DesktopAuthority();
    const grant = authority.issue({ label: 'operator', targets: '*', scopes: [scope] });
    const harness = await createDesktopDriverTestHarness({}, undefined, { authority });
    const client = createDesktopDriverClient({ grant: grant.token, url: harness.server.url });
    try {
      await expect(client.status()).rejects.toMatchObject({ code: 'unauthorized' });
      await expect(client.newSession({ alwaysMatch: { 'furn:target': harness.target.id } })).rejects.toMatchObject({
        code: 'unauthorized',
      });
      await expect(client.delegateConnection()).rejects.toMatchObject({ code: 'unauthorized' });
    } finally {
      await harness.close();
    }
  });

  test('retries failed drain and lost revoke responses with terminal-only proof', async () => {
    const authority = new DesktopAuthority();
    const parent = authority.issue({ label: 'agent', targets: '*' });
    const harness = await createDesktopDriverTestHarness({}, undefined, { authority });
    let loseResponse = false;
    const client = createDesktopDriverClient({
      grant: parent.token,
      url: harness.server.url,
      fetch: async (input, init) => {
        const response = await fetch(input, init);
        if (loseResponse && String(input).endsWith('/furn/grants/current')) {
          loseResponse = false;
          await response.body?.cancel();
          throw new Error('injected revoke response loss');
        }
        return response;
      },
    });
    try {
      const child = await client.delegateConnection();
      const session = await child.newSession({ alwaysMatch: { 'furn:target': harness.target.id } });
      jest.spyOn(harness.server.sessions, 'deleteOwnedBy').mockRejectedValueOnce(new Error('injected drain failure'));
      await expect(child.revokeConnection()).rejects.toMatchObject({ code: 'unknown error' });
      await expect(child.status()).rejects.toMatchObject({ code: 'unauthorized' });
      await expect(child.delegateConnection()).rejects.toMatchObject({ code: 'unauthorized' });
      loseResponse = true;
      await expect(child.revokeConnection()).rejects.toThrow('response loss');
      expect(() => harness.server.sessions.get(session.id)).toThrow();
      await expect(child.revokeConnection()).resolves.toBeNull();
      await expect(child.status()).rejects.toMatchObject({ code: 'unauthorized' });
    } finally {
      await harness.close();
    }
  });

  test('rejects arbitrary delegation fields rather than expanding child scope', async () => {
    const authority = new DesktopAuthority();
    const parent = authority.issue({ label: 'agent', targets: '*' });
    const harness = await createDesktopDriverTestHarness({}, undefined, { authority });
    const client = createDesktopDriverClient({ grant: parent.token, url: harness.server.url });
    try {
      for (const body of [{ targets: '*' }, { scopes: ['operator-recovery'] }, { parentId: parent.id }]) {
        await expect(client.request('POST', '/furn/grants/connection', body)).rejects.toMatchObject({ code: 'invalid argument' });
      }
    } finally {
      await harness.close();
    }
  });

  test('awaits child acquisition settlement when the parent is revoked during launch', async () => {
    const authority = new DesktopAuthority();
    const parent = authority.issue({ label: 'agent', targets: '*' });
    const harness = await createDesktopDriverTestHarness({ launchDelayMs: 100 }, undefined, { authority });
    const client = createDesktopDriverClient({ grant: parent.token, url: harness.server.url });
    try {
      const child = await client.delegateConnection();
      const launch = harness.host.launch.bind(harness.host);
      let entered!: () => void;
      const started = new Promise<void>((resolve) => {
        entered = resolve;
      });
      jest.spyOn(harness.host, 'launch').mockImplementation((...args) => {
        entered();
        return launch(...args);
      });
      const opening = expect(
        child.newSession({
          alwaysMatch: { 'furn:target': harness.target.id, 'furn:launchMode': 'launch' },
        }),
      ).rejects.toMatchObject({ code: 'session not created' });
      await started;
      await authority.revokeAndDrain(parent.id);
      await opening;
      const other = authority.issue({ label: 'other', targets: '*' });
      const session = await createDesktopDriverClient({ grant: other.token, url: harness.server.url }).newSession({
        alwaysMatch: { 'furn:target': harness.target.id },
      });
      await session.delete();
    } finally {
      await harness.close();
    }
  });

  test('rejects a request authenticated before its owner drained even when target probing finishes later', async () => {
    const authority = new DesktopAuthority();
    const parent = authority.issue({ label: 'agent', targets: '*' });
    const harness = await createDesktopDriverTestHarness({}, undefined, { authority });
    const client = createDesktopDriverClient({ grant: parent.token, url: harness.server.url });
    let entered!: () => void;
    let finish!: () => void;
    const started = new Promise<void>((resolve) => (entered = resolve));
    const pending = new Promise<void>((resolve) => (finish = resolve));
    const probe = harness.host.probe.bind(harness.host);
    jest.spyOn(harness.host, 'probe').mockImplementationOnce(async (signal) => {
      entered();
      await pending;
      return probe(signal);
    });
    const launch = jest.spyOn(harness.host, 'launch');
    try {
      const child = await client.delegateConnection();
      const opening = expect(child.newSession({ alwaysMatch: { 'furn:target': harness.target.id } })).rejects.toMatchObject({
        code: 'session not created',
      });
      await started;
      await child.revokeConnection();
      finish();
      await opening;
      expect(launch).not.toHaveBeenCalled();
    } finally {
      finish();
      await harness.close();
    }
  });
});
