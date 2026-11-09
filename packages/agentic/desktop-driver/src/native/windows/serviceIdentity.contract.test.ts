/* eslint-disable @microsoft/sdl/no-insecure-url -- The protected service protocol is loopback HTTP, not remote HTTPS. */
// Native contract for the Windows service-identity helper mode behind describeWindowsService and createWindowsServiceVerifier.
// Real node processes serve real loopback listeners, so it proves what the scripted unit tests cannot: that the adapters and
// the helper agree on the wire format, and that a claim verifies only for the process that owns the listener with the
// claimed start time, image, and session. Refusals are read from the helper directly so that each names its reason, and the
// public verifier must agree with every verdict. Opt in with FURN_NATIVE_DRIVER_TEST=1 and run it serially:
// yarn test --runInBand serviceIdentity.contract
import { spawn } from 'node:child_process';
import type { ChildProcess } from 'node:child_process';
import { once } from 'node:events';
import net from 'node:net';
import os from 'node:os';

import type { DesktopServiceIdentity } from '../../authority/connectionDescriptor';
import { createWindowsServiceVerifier, describeWindowsService } from '../../authority/windowsServiceIdentity';
import { runWindowsAuthorityHelper } from './authorityHelper';
import { helperArtifact, required } from './win32FixtureSupport';

jest.setTimeout(240_000);

const nativeContracts = process.platform === 'win32' && process.env.FURN_NATIVE_DRIVER_TEST === '1';
const windowsTest = nativeContracts ? test : test.skip;
const hasIpv6Loopback = Object.values(os.networkInterfaces()).some((entries) => entries?.some((entry) => entry.address === '::1'));
const ipv6Test = nativeContracts && hasIpv6Loopback ? test : test.skip;

const incarnation = 'inc_0123456789abcdef01234567';
const sessionPrefix = 'windows-session:';
const undescribed = 'The Windows service identity could not be determined.';
const idleScript = 'setInterval(() => {}, 1000);';
// The host is passed as an argument so that no value is ever spliced into the script.
const listenerScript =
  "const server = require('node:net').createServer(); server.listen(0, process.argv[1], () => process.stdout.write(`${server.address().port}\\n`));";

const children: ChildProcess[] = [];
const servers: net.Server[] = [];

afterEach(async () => {
  for (const child of children.splice(0)) {
    child.kill();
  }
  await Promise.all(servers.splice(0).map((server) => new Promise<void>((resolve) => server.close(() => resolve()))));
});

const origin = (host: string, port: number): string => `http://${host.includes(':') ? `[${host}]` : host}:${port}`;
const pidOf = (child: ChildProcess): number => required(child.pid, 'the child process to have a process id');

async function claimFor(pid: number): Promise<DesktopServiceIdentity> {
  return { ...(await describeWindowsService({ artifact: await helperArtifact(), pid })), incarnation };
}

// Reads the helper's verdict directly so that a refusal names its reason, then checks that the public verifier agrees.
async function verdict(service: DesktopServiceIdentity, url: string): Promise<{ reason?: unknown; verified: boolean }> {
  const artifact = await helperArtifact();
  const answer = await runWindowsAuthorityHelper(artifact, '--service-identity', { operation: 'verify', service, url });
  const verified = await createWindowsServiceVerifier({ artifact })(service, url);
  expect(verified).toBe(answer.verified === true);
  return answer.verified === true ? { verified } : { reason: answer.reason, verified };
}

async function listenHere(host: string): Promise<string> {
  const server = net.createServer();
  servers.push(server);
  await new Promise<void>((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, host, resolve);
  });
  return origin(host, (server.address() as net.AddressInfo).port);
}

function startIdle(): ChildProcess {
  const child = spawn(process.execPath, ['-e', idleScript], { stdio: 'ignore', windowsHide: true });
  children.push(child);
  return child;
}

async function startListener(host: string): Promise<{ child: ChildProcess; url: string }> {
  const child = spawn(process.execPath, ['-e', listenerScript, host], { stdio: ['ignore', 'pipe', 'ignore'], windowsHide: true });
  children.push(child);
  child.stdout.setEncoding('utf8');
  const port = await new Promise<number>((resolve, reject) => {
    let text = '';
    child.stdout.on('data', (chunk: string) => {
      text += chunk;
      if (text.includes('\n')) {
        resolve(Number(text.trim()));
      }
    });
    child.once('error', reject);
    child.once('exit', () => reject(new Error('The listener exited before it reported its port.')));
  });
  return { child, url: origin(host, port) };
}

// The claimed start time one 100 ns tick later.
const nextTick = (startedAt: string): string => `${startedAt.slice(0, -2)}${(Number(startedAt.at(-2)) + 1) % 10}Z`;

describe('Windows service identity against the helper', () => {
  windowsTest('describes a process the way its supervisor would publish it', async () => {
    const identity = await describeWindowsService({ artifact: await helperArtifact(), pid: process.pid });

    expect(identity).toEqual({
      executablePath: expect.any(String),
      interactiveSession: expect.stringMatching(/^windows-session:[0-9]+$/),
      pid: process.pid,
      platform: 'windows',
      startedAt: expect.stringMatching(/^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}\.[0-9]{7}Z$/),
    });
    expect(identity.executablePath.toLowerCase()).toBe(process.execPath.toLowerCase());
    // The start time is the operating system's, so it agrees with how long this process says it has been running.
    const startedMs = Date.parse(`${identity.startedAt.slice(0, 23)}Z`);
    expect(Math.abs(startedMs - (Date.now() - process.uptime() * 1000))).toBeLessThan(10_000);
  });

  windowsTest('refuses to describe a process that does not exist, has exited, or belongs to another principal', async () => {
    const artifact = await helperArtifact();
    const child = startIdle();
    const exitedPid = pidOf(child);
    child.kill();
    await once(child, 'exit');

    await expect(describeWindowsService({ artifact, pid: 2_000_000_000 })).rejects.toMatchObject({
      message: undescribed,
      reason: 'exited',
    });
    await expect(describeWindowsService({ artifact, pid: exitedPid })).rejects.toMatchObject({ message: undescribed, reason: 'exited' });
    // The System process is never the current user's, so it is refused as a process or as a user.
    await expect(describeWindowsService({ artifact, pid: 4 })).rejects.toMatchObject({
      message: undescribed,
      reason: expect.stringMatching(/^(process|user)$/),
    });
  });

  windowsTest('verifies a claim only for the process that owns the loopback listener', async () => {
    const ownUrl = await listenHere('127.0.0.1');
    const own = await claimFor(process.pid);
    const { child, url: foreignUrl } = await startListener('127.0.0.1');
    const foreign = await claimFor(pidOf(child));

    await expect(verdict(own, ownUrl)).resolves.toEqual({ verified: true });
    await expect(verdict(foreign, foreignUrl)).resolves.toEqual({ verified: true });
    await expect(verdict(own, foreignUrl)).resolves.toEqual({ reason: 'listener', verified: false });
    await expect(verdict(foreign, ownUrl)).resolves.toEqual({ reason: 'listener', verified: false });
  });

  windowsTest('refuses a claim whose start time, image, or session differs from the live process', async () => {
    const url = await listenHere('127.0.0.1');
    const own = await claimFor(process.pid);
    const session = Number(own.interactiveSession.slice(sessionPrefix.length));
    const cases = [
      ['start', { startedAt: nextTick(own.startedAt) }],
      ['image', { executablePath: 'C:\\Windows\\System32\\cmd.exe' }],
      ['session', { interactiveSession: `${sessionPrefix}${session + 1000}` }],
    ] as const;

    for (const [reason, changed] of cases) {
      await expect(verdict({ ...own, ...changed }, url)).resolves.toEqual({ reason, verified: false });
    }
  });

  windowsTest('compares the executable path without regard to case', async () => {
    const url = await listenHere('127.0.0.1');
    const own = await claimFor(process.pid);

    await expect(verdict({ ...own, executablePath: own.executablePath.toUpperCase() }, url)).resolves.toEqual({ verified: true });
    await expect(verdict({ ...own, executablePath: own.executablePath.toLowerCase() }, url)).resolves.toEqual({ verified: true });
  });

  windowsTest('refuses an address that no process serves', async () => {
    const own = await claimFor(process.pid);
    const unused = await listenHere('127.0.0.1');
    const server = servers.pop() as net.Server;
    await new Promise<void>((resolve) => server.close(() => resolve()));

    await expect(verdict(own, unused)).resolves.toEqual({ reason: 'listener', verified: false });
  });

  windowsTest('refuses a process that has exited', async () => {
    const child = startIdle();
    const exited = await claimFor(pidOf(child));
    child.kill();
    await once(child, 'exit');
    const url = await listenHere('127.0.0.1');

    await expect(verdict(exited, url)).resolves.toEqual({ reason: 'exited', verified: false });
  });

  windowsTest.each([
    'http://localhost:49152',
    'http://192.0.2.1:49152',
    'https://127.0.0.1:49152',
    'http://127.0.0.1',
    'http://127.0.0.1:49152/status',
  ])('refuses %s as the service address', async (address) => {
    await expect(verdict(await claimFor(process.pid), address)).resolves.toEqual({ reason: 'url', verified: false });
  });

  ipv6Test('keeps the IPv6 and IPv4 loopback listeners apart', async () => {
    const url = await listenHere('::1');
    const own = await claimFor(process.pid);

    await expect(verdict(own, url)).resolves.toEqual({ verified: true });
    await expect(verdict(own, url.replace('[::1]', '127.0.0.1'))).resolves.toEqual({ reason: 'listener', verified: false });
  });
});
