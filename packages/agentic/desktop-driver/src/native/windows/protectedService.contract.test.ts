// Native contract for a protected Desktop Driver service that serves the real Windows helper. A DesktopAuthority guards
// every route, and the one target is the plain Win32 fixture in fixtures/win32, which win32FixtureSupport builds on
// demand. It proves that grants, session ownership, contention, revocation, and quarantine hold with a native provider
// behind them, which the fake host in src/server cannot show. Lifting a launched application's quarantine takes proof of
// its exit, so the case that closes the application serves with the helper's incarnation probe and private storage, as a
// Windows supervisor does; without them nothing proves the exit and the quarantine stays. Opt in with
// FURN_NATIVE_DRIVER_TEST=1 and run it serially on an interactive desktop: yarn test --runInBand protectedService. The
// fixture stays off every monitor and never takes the foreground.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { DesktopAuthority } from '../../authority/grants';
import type { IssuedDesktopGrant } from '../../authority/grants';
import { createWindowsApplicationProbe } from '../../authority/windowsApplicationProbe';
import { createWindowsPrivateStorage } from '../../authority/windowsPrivateStorage';
import { createDesktopDriverClient } from '../../client/DesktopDriverClient';
import type { DesktopDriverClient, DesktopSessionClient } from '../../client/DesktopDriverClient';
import type { DesktopHost, DesktopTarget } from '../../host/types';
import { NativeDesktopHost } from '../../hosts/native/NativeDesktopHost';
import { createDesktopDriverServer } from '../../server/createDesktopDriverServer';
import type { DesktopDriverServer } from '../../server/createDesktopDriverServer';
import { fixtureExecutable, helperArtifact, required, waitFor } from './win32FixtureSupport';

jest.setTimeout(240_000);

const windowsTest = process.platform === 'win32' && process.env.FURN_NATIVE_DRIVER_TEST === '1' ? test : test.skip;

const targetId = 'win32-fixture';
const capabilities = {
  alwaysMatch: {
    'furn:clickMode': 'accessibility',
    'furn:launchMode': 'launch',
    'furn:target': targetId,
    platformName: 'windows',
  },
};

type Reply = { body: { value: Record<string, any> }; status: number };

type Service = {
  agent: IssuedDesktopGrant;
  authority: DesktopAuthority;
  /** Every method the service has called on the host, in order. */
  hostCalls: string[];
  other: IssuedDesktopGrant;
  server: DesktopDriverServer;
  clientFor(grant: IssuedDesktopGrant): DesktopDriverClient;
};

type ServiceOptions = {
  /** Serves with durable settlement state and the helper's application-incarnation probe, as a Windows supervisor does. */
  recovery?: boolean;
};

async function withService(
  fixtureArguments: string[],
  body: (service: Service) => Promise<void>,
  options: ServiceOptions = {},
): Promise<void> {
  const title = `furn-protected-${process.pid}-${Date.now()}`;
  const artifact = await helperArtifact();
  const host = new NativeDesktopHost({
    application: {
      arguments: ['--title', title, '--offscreen', '1', ...fixtureArguments],
      executablePath: await fixtureExecutable(),
      windowTitle: title,
    },
    artifact,
    endpoint: 'win32',
  });
  const hostCalls: string[] = [];
  const target: DesktopTarget = {
    endpoint: 'win32',
    host: recordCalls(host, hostCalls),
    id: targetId,
    launchModes: ['launch'],
    launchTimeoutMs: 20_000,
    platformName: 'windows',
    renderer: 'paper',
  };
  const authority = new DesktopAuthority();
  const agent = authority.issue({ label: 'agent', targets: [targetId] });
  const other = authority.issue({ label: 'wdio', targets: [targetId] });
  const scratch = options.recovery ? fs.realpathSync.native(fs.mkdtempSync(path.join(os.tmpdir(), 'furn-protected-state-'))) : undefined;
  try {
    const recovery =
      scratch === undefined
        ? {}
        : {
            recovery: {
              probeApplication: createWindowsApplicationProbe({ artifact }),
              storage: await createWindowsPrivateStorage({ artifact, root: path.join(scratch, 'state') }),
            },
          };
    const server = await createDesktopDriverServer({ authority, targets: [target], ...recovery });
    try {
      await body({
        agent,
        authority,
        clientFor: (grant) => createDesktopDriverClient({ grant: grant.token, url: server.url }),
        hostCalls,
        other,
        server,
      });
    } finally {
      await server.close();
    }
  } finally {
    if (scratch !== undefined) {
      fs.rmSync(scratch, { force: true, recursive: true });
    }
  }
}

function withRecoveringService(fixtureArguments: string[], body: (service: Service) => Promise<void>): Promise<void> {
  return withService(fixtureArguments, body, { recovery: true });
}

function recordCalls(host: NativeDesktopHost, calls: string[]): DesktopHost {
  return new Proxy(host, {
    get(target, property) {
      const member = Reflect.get(target, property, target);
      if (typeof member !== 'function') {
        return member;
      }
      return (...args: unknown[]) => {
        calls.push(String(property));
        return member.apply(target, args);
      };
    },
  });
}

async function call(
  server: DesktopDriverServer,
  method: string,
  path: string,
  options: { grant?: IssuedDesktopGrant; body?: unknown } = {},
) {
  const { body, grant } = options;
  const response = await fetch(`${server.url}${path}`, {
    method,
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    headers: {
      ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
      ...(grant ? { Authorization: `Bearer ${grant.token}` } : {}),
    },
  });
  return { body: (await response.json()) as Reply['body'], status: response.status } satisfies Reply;
}

async function statusText(session: DesktopSessionClient): Promise<string> {
  return (await session.findElement('accessibility id', '1004')).getText();
}

function applicationProcessId(server: DesktopDriverServer, session: DesktopSessionClient): number {
  return required(server.sessions.get(session.id).lease.processId, 'the launched application to report its process id');
}

function isRunning(processId: number): boolean {
  try {
    process.kill(processId, 0);
    return true;
  } catch (error) {
    return (error as NodeJS.ErrnoException).code === 'EPERM';
  }
}

function hasSession(server: DesktopDriverServer, id: string): boolean {
  try {
    server.sessions.get(id);
    return true;
  } catch {
    return false;
  }
}

describe('Protected Desktop Driver service against the Windows helper', () => {
  windowsTest('keeps the helper behind the grant and the application behind its owner', async () => {
    await withService([], async ({ agent, clientFor, hostCalls, other, server }) => {
      // An unauthenticated caller reaches no route logic, so nothing is asked of the helper on its behalf.
      for (const [method, path, body] of [
        ['GET', '/status'],
        ['POST', '/session', { capabilities }],
        ['GET', '/session/no-such-session/window'],
        ['DELETE', '/session/no-such-session'],
      ] as const) {
        const response = await call(server, method, path, { body });
        expect({ path, status: response.status }).toEqual({ path, status: 401 });
      }
      expect(hostCalls).toEqual([]);

      const session = await clientFor(agent).newSession(capabilities);
      const processId = applicationProcessId(server, session);
      await (await session.findElement('accessibility id', '1001')).click();
      await waitFor('the click to reach the application', async () => (await statusText(session)) === 'Activated 1 times');
      expect(server.sessions.get(session.id).owner).toEqual({ grantId: agent.id, label: 'agent' });

      // Another grant sees neither the session nor the identifiers that would let it find the application.
      const foreign = await call(server, 'GET', `/session/${session.id}/window`, { grant: other });
      expect(foreign.status).toBe(404);
      expect(foreign.body.value.error).toBe('invalid session id');
      const busy = await call(server, 'POST', '/session', { body: { capabilities }, grant: other });
      expect(busy.body.value).toMatchObject({
        data: { holder: { label: 'agent', since: expect.any(String) }, reason: 'target-busy' },
        error: 'session not created',
      });
      for (const secret of [agent.id, agent.token.split('.')[2], session.id, String(processId)]) {
        expect(JSON.stringify(busy.body)).not.toContain(secret);
      }

      // Deleting the session returns only after the launched application exited, so the target is free for the next grant.
      await session.delete();
      expect(isRunning(processId)).toBe(false);
      const next = await clientFor(other).newSession(capabilities);
      expect(await statusText(next)).toBe('Ready');
      await next.delete();
    });
  });

  windowsTest('closes the application of a revoked grant and hands the target to the next one', async () => {
    await withService([], async ({ agent, authority, clientFor, other, server }) => {
      const session = await clientFor(agent).newSession(capabilities);
      const processId = applicationProcessId(server, session);

      authority.revoke(agent.id);
      await waitFor('the revoked grant to lose its application', async () => !isRunning(processId), {
        intervalMs: 50,
        timeoutMs: 20_000,
      });
      await waitFor('the revoked session to be dropped', async () => !hasSession(server, session.id), { intervalMs: 20 });

      expect((await call(server, 'GET', '/status', { grant: agent })).status).toBe(401);
      const next = await clientFor(other).newSession(capabilities);
      expect(await statusText(next)).toBe('Ready');
      await next.delete();
    });
  });

  windowsTest('quarantines the target for every grant when the provider cannot settle, until the application is closed', async () => {
    await withRecoveringService(['--stuck-ms', '8000'], async ({ agent, clientFor, other, server }) => {
      const session = await clientFor(agent).newSession(capabilities);
      const stuck = await session.findElement('accessibility id', '1009');
      const activate = await session.findElement('accessibility id', '1001');

      await expect(stuck.click()).rejects.toMatchObject({
        code: 'unknown error',
        data: { mutation: { disposition: 'indeterminate', effect: 'unknown', quarantined: true }, nativeCode: 'mutation-indeterminate' },
      });
      await expect(activate.click()).rejects.toMatchObject({
        code: 'unknown error',
        data: { mutation: { disposition: 'rejected', effect: 'none', quarantined: true }, reason: 'target-quarantined' },
      });

      // Another grant can read why the target is blocked, without learning which session raised it.
      const status = await call(server, 'GET', '/status', { grant: other });
      expect(status.body.value.targets[0].quarantine).toMatchObject({ effect: 'unknown', targetId });
      const refused = await call(server, 'POST', '/session', { body: { capabilities }, grant: other });
      expect(refused.body.value).toMatchObject({
        data: { quarantine: { effect: 'unknown' }, reason: 'target-quarantined' },
        error: 'session not created',
      });
      for (const text of [JSON.stringify(status.body), JSON.stringify(refused.body)]) {
        expect(text).not.toContain(session.id);
        expect(text).not.toContain('sessionId');
      }

      // Closing the application is no proof that it exited. The service lifts the quarantine for the next grant only
      // when the helper's incarnation probe reports the exact process the quarantine was raised against gone.
      await session.delete();
      const next = await clientFor(other).newSession(capabilities);
      await expect((await next.findElement('accessibility id', '1001')).click()).resolves.toBeNull();
      await waitFor('the click to reach the new application', async () => (await statusText(next)) === 'Activated 1 times');
      await next.delete();
    });
  });

  windowsTest('keeps the quarantine after the application is closed when nothing can prove it exited', async () => {
    await withService(['--stuck-ms', '8000'], async ({ agent, clientFor, other, server }) => {
      const session = await clientFor(agent).newSession(capabilities);
      await expect((await session.findElement('accessibility id', '1009')).click()).rejects.toMatchObject({
        data: { mutation: { disposition: 'indeterminate', effect: 'unknown', quarantined: true } },
      });

      // Without a probe, closing the application never ends the quarantine; only the operator can.
      await session.delete();
      const refused = await call(server, 'POST', '/session', { body: { capabilities }, grant: other });
      expect(refused.body.value).toMatchObject({
        data: { quarantine: { effect: 'unknown' }, reason: 'target-quarantined' },
        error: 'session not created',
      });
    });
  });
});
