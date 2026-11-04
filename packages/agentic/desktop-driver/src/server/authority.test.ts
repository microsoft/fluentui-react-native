import { inspect } from 'node:util';

import { DesktopAuthority } from '../authority/grants.js';
import type { IssuedDesktopGrant } from '../authority/grants.js';
import { createDesktopDriverClient } from '../client/DesktopDriverClient.js';
import { FakeDesktopHost } from '../hosts/fake/FakeDesktopHost.js';
import type { FakeDesktopHostOptions } from '../hosts/fake/FakeDesktopHost.js';
import { createDesktopDriverTestHarness } from '../testing/protocolHarness.js';
import type { DesktopDriverTestHarness } from '../testing/protocolHarness.js';

type Response = { body: { value: Record<string, any> }; headers: Headers; status: number };

type Fixture = {
  authority: DesktopAuthority;
  harness: DesktopDriverTestHarness;
  /** The first grant, scoped to the harness target. */
  agent: IssuedDesktopGrant;
  /** A second grant over the same target. */
  other: IssuedDesktopGrant;
  capabilities: { alwaysMatch: Record<string, unknown> };
};

async function withFixture(body: (fixture: Fixture) => Promise<void>, hostOptions: FakeDesktopHostOptions = {}): Promise<void> {
  const authority = new DesktopAuthority();
  const agent = authority.issue({ label: 'agent', targets: ['fake-windows'] });
  const other = authority.issue({ label: 'wdio', targets: ['fake-windows'] });
  const harness = await createDesktopDriverTestHarness(hostOptions, undefined, { authority });
  try {
    await body({
      agent,
      authority,
      capabilities: {
        alwaysMatch: {
          'furn:clickMode': 'accessibility',
          'furn:launchMode': 'launch',
          'furn:target': harness.target.id,
          platformName: 'windows',
        },
      },
      harness,
      other,
    });
  } finally {
    await harness.close();
  }
}

async function call(
  harness: DesktopDriverTestHarness,
  method: string,
  path: string,
  options: { authorization?: string; body?: unknown } = {},
): Promise<Response> {
  const { authorization, body } = options;
  const response = await fetch(`${harness.server.url}${path}`, {
    method,
    ...(body === undefined ? {} : { body: typeof body === 'string' ? body : JSON.stringify(body) }),
    headers: {
      ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
      ...(authorization ? { Authorization: authorization } : {}),
    },
  });
  return { body: (await response.json()) as Response['body'], headers: response.headers, status: response.status };
}

function hasSession(harness: DesktopDriverTestHarness, id: string): boolean {
  try {
    harness.server.sessions.get(id);
    return true;
  } catch {
    return false;
  }
}

const bearer = (grant: IssuedDesktopGrant) => `Bearer ${grant.token}`;

describe('Desktop Driver protected service', () => {
  test('requires a grant on every route, including routes that do not exist', async () => {
    await withFixture(async ({ agent, capabilities, harness }) => {
      const client = createDesktopDriverClient({ grant: agent.token, url: harness.server.url });
      const session = await client.newSession(capabilities);
      const routes: [string, string, unknown?][] = [
        ['GET', '/status'],
        ['POST', '/session', { capabilities }],
        ['GET', `/session/${session.id}/window`],
        ['POST', `/session/${session.id}/element`, { using: 'accessibility id', value: 'button-primary' }],
        ['POST', `/session/${session.id}/actions`, { actions: [] }],
        ['GET', `/session/${session.id}/screenshot`],
        ['GET', `/session/${session.id}/source`],
        ['GET', `/session/${session.id}/furn/tree`],
        ['GET', `/session/${session.id}/furn/ops`],
        ['POST', `/session/${session.id}/furn/ops/observe`, { input: {} }],
        ['DELETE', `/session/${session.id}`],
        ['GET', '/session/no-such-session/window'],
        ['GET', '/nothing/here'],
      ];

      for (const [method, path, body] of routes) {
        const response = await call(harness, method, path, { body });
        expect({ path, status: response.status }).toEqual({ path, status: 401 });
        expect(response.body.value).toEqual({
          error: 'unauthorized',
          message: 'A valid Desktop Driver grant is required.',
          stacktrace: '',
        });
        expect(response.headers.get('www-authenticate')).toBe('Bearer realm="furn-desktop-driver"');
      }
      expect(harness.server.sessions.get(session.id).id).toBe(session.id);
    });
  });

  test('answers a missing, malformed, wrong-secret, revoked, and foreign grant identically', async () => {
    await withFixture(async ({ agent, authority, harness }) => {
      const [scheme, id] = agent.token.split('.');
      const revoked = authority.issue({ label: 'gone', targets: '*' });
      authority.revoke(revoked.id);
      const foreign = new DesktopAuthority().issue({ label: 'agent', targets: '*' });
      const credentials = [
        undefined,
        'Bearer',
        'Basic abc',
        'Bearer not-a-grant',
        `Bearer ${scheme}.${id}.wrong-secret`,
        bearer(revoked),
        bearer(foreign),
      ];

      const responses = await Promise.all(credentials.map((authorization) => call(harness, 'GET', '/status', { authorization })));

      for (const response of responses) {
        expect(response.status).toBe(401);
        expect(response.body).toEqual(responses[0].body);
      }
    });
  });

  test('keeps the grant out of a serialized client and refuses a null authority', async () => {
    const client = createDesktopDriverClient({ grant: 'fdg1.id.secret-value', url: 'https://127.0.0.1:1' });

    expect(JSON.stringify(client)).not.toContain('secret-value');
    expect(inspect(client)).not.toContain('secret-value');
    await expect(createDesktopDriverTestHarness({}, undefined, { authority: null as never })).rejects.toThrow(TypeError);
  });

  test('rejects an unauthenticated caller before reading or validating its body', async () => {
    await withFixture(async ({ agent, harness }) => {
      const unauthenticated = await call(harness, 'POST', '/session', { body: '{not json' });
      const authenticated = await call(harness, 'POST', '/session', { authorization: bearer(agent), body: '{not json' });

      expect(unauthenticated.status).toBe(401);
      expect(authenticated.status).toBe(400);
      expect(authenticated.body.value.error).toBe('invalid argument');
    });
  });

  test('closes the connection after rejecting an unauthenticated caller', async () => {
    await withFixture(async ({ harness }) => {
      const response = await call(harness, 'GET', '/status');

      expect(response.headers.get('connection')).toBe('close');
    });
  });

  test('runs a full session for the grant that opened it', async () => {
    await withFixture(async ({ agent, authority, capabilities, harness }) => {
      const client = createDesktopDriverClient({ grant: agent.token, url: harness.server.url });

      const session = await client.newSession(capabilities);
      const element = await session.findElement('accessibility id', 'button-primary');
      await element.click();
      await expect(session.getWindowHandles()).resolves.toHaveLength(1);

      expect(harness.host.actions.filter(({ type }) => type === 'click')).toHaveLength(1);
      expect(harness.server.sessions.get(session.id).owner).toEqual({ grantId: agent.id, label: 'agent' });
      await session.delete();
      expect(authority.authenticate(bearer(agent))?.id).toBe(agent.id);
    });
  });

  test('reports the service incarnation to authenticated callers only on a protected service', async () => {
    await withFixture(async ({ agent, authority, harness }) => {
      const status = await call(harness, 'GET', '/status', { authorization: bearer(agent) });

      expect(status.body.value.service).toEqual({ incarnation: authority.incarnation });
    });

    const legacy = await createDesktopDriverTestHarness();
    try {
      await expect(createDesktopDriverClient({ url: legacy.server.url }).status()).resolves.not.toHaveProperty('service');
    } finally {
      await legacy.close();
    }
  });

  describe('ownership', () => {
    test('keeps a session invisible and untouchable to every other grant, as if it did not exist', async () => {
      await withFixture(async ({ agent, capabilities, harness, other }) => {
        const owner = createDesktopDriverClient({ grant: agent.token, url: harness.server.url });
        const session = await owner.newSession(capabilities);
        const element = await session.findElement('accessibility id', 'button-primary');
        const missing = await call(harness, 'GET', '/session/no-such-session/window', { authorization: bearer(other) });
        const probes: [string, string, unknown?][] = [
          ['GET', `/session/${session.id}/window`],
          ['POST', `/session/${session.id}/element`, { using: 'accessibility id', value: 'button-primary' }],
          ['POST', `/session/${session.id}/element/${element.id}/click`, {}],
          ['GET', `/session/${session.id}/furn/tree`],
          ['POST', `/session/${session.id}/furn/ops/observe`, { input: {} }],
          ['DELETE', `/session/${session.id}`],
        ];

        for (const [method, path, body] of probes) {
          const response = await call(harness, method, path, { authorization: bearer(other), body });
          expect({ path, status: response.status }).toEqual({ path, status: 404 });
          expect(response.body.value.error).toBe('invalid session id');
          expect(response.body.value.message).toBe(`Session "${session.id}" does not exist.`);
          expect(response.body.value.stacktrace).toBe(missing.body.value.stacktrace);
        }
        expect(missing.body.value).toMatchObject({ error: 'invalid session id', message: 'Session "no-such-session" does not exist.' });

        expect(harness.host.actions.filter(({ type }) => type === 'click')).toHaveLength(0);
        await expect(session.getWindowHandles()).resolves.toHaveLength(1);
        await session.delete();
      });
    });

    test('rejects another grant before it can queue behind the owner’s commands', async () => {
      await withFixture(async ({ agent, capabilities, harness, other }) => {
        const session = await createDesktopDriverClient({ grant: agent.token, url: harness.server.url }).newSession(capabilities);
        let release!: () => void;
        const gate = new Promise<void>((resolve) => {
          release = resolve;
        });
        const blocking = harness.server.sessions.runCommand(session.id, () => gate);

        const response = await call(harness, 'GET', `/session/${session.id}/window`, { authorization: bearer(other) });

        expect(response.status).toBe(404);
        release();
        await blocking;
        await session.delete();
      });
    });

    test('does not hand a session to a different grant that reuses the same label', async () => {
      await withFixture(async ({ agent, authority, capabilities, harness }) => {
        const sameLabel = authority.issue({ label: agent.label, targets: ['fake-windows'] });
        const session = await createDesktopDriverClient({ grant: agent.token, url: harness.server.url }).newSession(capabilities);

        const response = await call(harness, 'GET', `/session/${session.id}/window`, { authorization: bearer(sameLabel) });

        expect(response.status).toBe(404);
        await session.delete();
      });
    });
  });

  describe('target scope', () => {
    async function withTwoTargets(
      body: (fixture: Fixture & { restricted: IssuedDesktopGrant; everything: IssuedDesktopGrant }) => Promise<void>,
    ) {
      await withFixture(async (fixture) => {
        const second = new FakeDesktopHost({});
        fixture.harness.server.targets.register({
          endpoint: 'windows',
          host: second,
          id: 'fake-second',
          platformName: 'windows',
          renderer: 'fabric',
        });
        const restricted = fixture.authority.issue({ label: 'narrow', targets: ['fake-windows'] });
        const everything = fixture.authority.issue({ label: 'broad', targets: '*' });
        await body({ ...fixture, everything, restricted });
      });
    }

    test('lists only the targets a grant names', async () => {
      await withTwoTargets(async ({ everything, harness, restricted }) => {
        const narrow = await call(harness, 'GET', '/status', { authorization: bearer(restricted) });
        const broad = await call(harness, 'GET', '/status', { authorization: bearer(everything) });

        expect(narrow.body.value.targets.map(({ id }: { id: string }) => id)).toEqual(['fake-windows']);
        expect(broad.body.value.targets.map(({ id }: { id: string }) => id)).toEqual(['fake-windows', 'fake-second']);
      });
    });

    test('treats a target outside the grant exactly like a target that is not registered', async () => {
      await withTwoTargets(async ({ capabilities, everything, harness, restricted }) => {
        const outside = { alwaysMatch: { ...capabilities.alwaysMatch, 'furn:target': 'fake-second' } };
        const unregistered = { alwaysMatch: { ...capabilities.alwaysMatch, 'furn:target': 'fake-unknown' } };

        const denied = await call(harness, 'POST', '/session', { authorization: bearer(restricted), body: { capabilities: outside } });
        const missing = await call(harness, 'POST', '/session', {
          authorization: bearer(restricted),
          body: { capabilities: unregistered },
        });
        const allowed = await call(harness, 'POST', '/session', { authorization: bearer(everything), body: { capabilities: outside } });

        expect(denied.status).toBe(500);
        expect(denied.body.value.error).toBe('session not created');
        expect(denied.body.value.message).toBe(missing.body.value.message);
        expect(allowed.status).toBe(200);
        expect(harness.server.sessions.get(allowed.body.value.sessionId).target.id).toBe('fake-second');
      });
    });
  });

  test('refuses to start when a grant names a target the service does not register', async () => {
    const authority = new DesktopAuthority();
    authority.issue({ label: 'agent', targets: ['fake-windows', 'fake-typo'] });

    await expect(createDesktopDriverTestHarness({}, undefined, { authority })).rejects.toThrow('"fake-typo"');
  });

  describe('contention', () => {
    test('tells a contending grant who holds the target without revealing any identifier', async () => {
      await withFixture(async ({ agent, capabilities, harness, other }) => {
        const session = await createDesktopDriverClient({ grant: agent.token, url: harness.server.url }).newSession(capabilities);

        const response = await call(harness, 'POST', '/session', { authorization: bearer(other), body: { capabilities } });

        expect(response.status).toBe(500);
        expect(response.body.value).toMatchObject({
          data: { holder: { label: 'agent', since: expect.any(String) }, reason: 'target-busy' },
          error: 'session not created',
        });
        const serialized = JSON.stringify(response.body);
        for (const secret of [agent.id, agent.token.split('.')[2], session.id, other.token.split('.')[2]]) {
          expect(serialized).not.toContain(secret);
        }
        await session.delete();
      });
    });

    test('reports the same reason without a holder on a service that does not authenticate', async () => {
      const harness = await createDesktopDriverTestHarness();
      try {
        const capabilities = { alwaysMatch: { 'furn:launchMode': 'launch', 'furn:target': harness.target.id, platformName: 'windows' } };
        const client = createDesktopDriverClient({ url: harness.server.url });
        const first = await client.newSession(capabilities);

        await expect(client.newSession(capabilities)).rejects.toMatchObject({
          code: 'session not created',
          data: { reason: 'target-busy' },
        });
        await expect(client.newSession(capabilities)).rejects.not.toHaveProperty('data.holder');
        await first.delete();
      } finally {
        await harness.close();
      }
    });
  });

  test('does not reveal the id of another grant’s session through a quarantine', async () => {
    await withFixture(
      async ({ agent, capabilities, harness, other }) => {
        const session = await createDesktopDriverClient({ grant: agent.token, url: harness.server.url }).newSession(capabilities);
        const element = await session.findElement('accessibility id', 'button-primary');
        harness.server.sessions.get(session.id).desktopTimeouts.nativeCommand = 10;
        await expect(element.click()).rejects.toMatchObject({ code: 'timeout' });

        const status = await call(harness, 'GET', '/status', { authorization: bearer(other) });
        const refused = await call(harness, 'POST', '/session', { authorization: bearer(other), body: { capabilities } });

        expect(status.body.value.targets[0].quarantine).toMatchObject({ effect: 'unknown', targetId: 'fake-windows' });
        expect(refused.body.value.data).toMatchObject({ quarantine: { effect: 'unknown' }, reason: 'target-quarantined' });
        for (const text of [JSON.stringify(status.body), JSON.stringify(refused.body)]) {
          expect(text).not.toContain(session.id);
          expect(text).not.toContain('sessionId');
        }
      },
      { faults: { click: { mode: 'lost-response' } } },
    );
  });

  describe('revocation', () => {
    test('closes the sessions of a revoked grant so they do not hold the target', async () => {
      await withFixture(async ({ agent, authority, capabilities, harness, other }) => {
        const session = await createDesktopDriverClient({ grant: agent.token, url: harness.server.url }).newSession(capabilities);

        authority.revoke(agent.id);
        await waitUntil(() => !hasSession(harness, session.id));

        expect(harness.host.actions.some(({ type }) => type === 'close-application')).toBe(true);
        const response = await call(harness, 'POST', '/session', { authorization: bearer(other), body: { capabilities } });
        expect(response.status).toBe(200);
        const revokedCall = await call(harness, 'GET', '/status', { authorization: bearer(agent) });
        expect(revokedCall.status).toBe(401);
      });
    });

    test('aborts opening a session when its grant is revoked', async () => {
      await withFixture(
        async ({ agent, authority, capabilities, harness, other }) => {
          const launch = jest.spyOn(harness.host, 'launch');
          const opening = call(harness, 'POST', '/session', { authorization: bearer(agent), body: { capabilities } });
          await waitUntil(() => launch.mock.calls.length === 1);

          authority.revoke(agent.id);

          const refused = await opening;
          expect(refused.status).toBe(500);
          expect(harness.host.actions.some(({ type }) => type === 'close-application')).toBe(false);
          const reopened = await call(harness, 'POST', '/session', { authorization: bearer(other), body: { capabilities } });
          expect(reopened.status).toBe(200);
        },
        { launchDelayMs: 1_000 },
      );
    });

    test('cancels active work, rejects queued work, and drains only after native settlement on revocation', async () => {
      await withFixture(async ({ agent, authority, capabilities, harness }) => {
        const client = createDesktopDriverClient({ grant: agent.token, url: harness.server.url });
        const session = await client.newSession(capabilities);
        const element = await session.findElement('accessibility id', 'button-primary');
        harness.host.injectFault('click', { delayMs: 50, mode: 'late-success' });
        const runCommand = jest.spyOn(harness.server.sessions, 'runCommand');

        const running = element.click();
        await waitUntil(() => harness.host.actions.some(({ type }) => type === 'fault'));
        const queued = element.click();
        await waitUntil(() => runCommand.mock.calls.length === 2);

        authority.revoke(agent.id);

        await expect(running).rejects.toMatchObject({ code: 'unknown error' });
        await expect(queued).rejects.toMatchObject({ code: 'unauthorized' });
        await waitUntil(() => !hasSession(harness, session.id));

        const click = harness.host.actions.findIndex(({ type }) => type === 'click');
        const release = harness.host.actions.findIndex(({ type }) => type === 'release-actions');
        const close = harness.host.actions.findIndex(({ type }) => type === 'close-application');
        expect(click).toBeGreaterThanOrEqual(0);
        expect(release).toBeGreaterThan(click);
        expect(close).toBeGreaterThan(release);
        expect(harness.host.actions.filter(({ type }) => type === 'click')).toHaveLength(1);
      });
    });

    test('closes a session that finishes launching after its grant was revoked', async () => {
      await withFixture(
        async ({ agent, authority, capabilities, harness, other }) => {
          const opening = call(harness, 'POST', '/session', { authorization: bearer(agent), body: { capabilities } });
          await waitUntil(() => harness.host.actions.some(({ type }) => type === 'launch'));

          authority.revoke(agent.id);
          const created = await opening;
          await waitUntil(() => !hasSession(harness, created.body.value.sessionId));

          const reopened = await call(harness, 'POST', '/session', { authorization: bearer(other), body: { capabilities } });
          expect(reopened.status).toBe(200);
        },
        { launchDelayMs: 100 },
      );
    });

    test('rejects a create that reaches the session manager after its grant was revoked', async () => {
      await withFixture(async ({ agent, authority, harness, other }) => {
        const target = harness.server.targets.get('fake-windows')!;
        const hostInfo = await target.host.probe(new AbortController().signal);
        authority.revoke(agent.id);
        await harness.server.sessions.waitForCreates();

        await expect(
          harness.server.sessions.create(target, hostInfo, 'auto', 'launch', { grantId: agent.id, label: agent.label }),
        ).rejects.toMatchObject({ code: 'session not created' });
        expect(harness.host.actions.some(({ type }) => type === 'launch')).toBe(false);
        const owned = await harness.server.sessions.create(target, hostInfo, 'auto', 'launch', { grantId: other.id, label: other.label });
        expect(owned.owner?.grantId).toBe(other.id);
      });
    });

    test('leaves the sessions of other grants running', async () => {
      await withFixture(async ({ agent, authority, capabilities, harness, other }) => {
        const second = new FakeDesktopHost({});
        harness.server.targets.register({
          endpoint: 'windows',
          host: second,
          id: 'fake-second',
          platformName: 'windows',
          renderer: 'fabric',
        });
        const wide = authority.issue({ label: 'wide', targets: '*' });
        const kept = await createDesktopDriverClient({ grant: wide.token, url: harness.server.url }).newSession({
          alwaysMatch: { ...capabilities.alwaysMatch, 'furn:target': 'fake-second' },
        });
        await createDesktopDriverClient({ grant: agent.token, url: harness.server.url }).newSession(capabilities);

        authority.revoke(agent.id);
        await waitUntil(() => harness.host.actions.some(({ type }) => type === 'close-application'));

        expect(hasSession(harness, kept.id)).toBe(true);
        await kept.delete();
        expect(other.label).toBe('wdio');
      });
    });
  });
});

describe('Desktop Driver service without an authority', () => {
  test('keeps the documented loopback behavior, including the quarantine session id', async () => {
    const harness = await createDesktopDriverTestHarness({ faults: { click: { mode: 'lost-response' } } });
    try {
      const client = createDesktopDriverClient({ url: harness.server.url });
      const session = await client.newSession({
        alwaysMatch: {
          'furn:clickMode': 'accessibility',
          'furn:launchMode': 'launch',
          'furn:target': harness.target.id,
          platformName: 'windows',
        },
      });
      const element = await session.findElement('accessibility id', 'button-primary');
      harness.server.sessions.get(session.id).desktopTimeouts.nativeCommand = 10;
      await expect(element.click()).rejects.toMatchObject({ code: 'timeout' });

      const status = (await client.status()) as { targets: { quarantine?: { sessionId?: string } }[] };

      expect(status.targets[0].quarantine?.sessionId).toBe(session.id);
      expect(harness.server.sessions.get(session.id).owner).toBeUndefined();
    } finally {
      await harness.close();
    }
  });
});

async function waitUntil(predicate: () => boolean): Promise<void> {
  for (let attempt = 0; attempt < 200; attempt += 1) {
    if (predicate()) {
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 5));
  }
  throw new Error('Timed out waiting for the test condition.');
}
