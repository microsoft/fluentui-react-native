/* eslint-disable @microsoft/sdl/no-insecure-url -- The protected service protocol is loopback HTTP, not remote HTTPS. */
// Native contract for the macOS service-identity helper mode behind describeMacOSService and createMacOSServiceVerifier.
// Real processes serve real loopback listeners, so it proves what the scripted unit tests cannot: that the adapter and the
// helper agree on the wire format, and that a claim verifies only for the process that alone serves the listener with the
// claimed start time, executable, and audit session. Refusals are read from the helper directly so that each names its
// reason, and the public verifier must agree with every verdict. Opt in with FURN_NATIVE_DRIVER_TEST=1 and run it
// serially: yarn test --runInBand serviceIdentity.contract
import { spawn, spawnSync } from 'node:child_process';
import type { ChildProcess } from 'node:child_process';
import { once } from 'node:events';
import fs from 'node:fs';
import net from 'node:net';

import type { DesktopServiceIdentity } from '../../authority/connectionDescriptor';
import { createMacOSServiceVerifier, describeMacOSService } from '../../authority/macosServiceIdentity';
import { runAuthorityHelper } from '../authorityHelper';
import { buildNativeDesktopDriver } from '../nativeDriver';
import type { NativeDriverArtifact } from '../types';

jest.setTimeout(240_000);

const nativeContracts = process.platform === 'darwin' && process.env.FURN_NATIVE_DRIVER_TEST === '1';
const macosTest = nativeContracts ? test : test.skip;
const hasPython = nativeContracts && spawnSync('python3', ['--version'], { stdio: 'ignore' }).status === 0;
const pythonTest = hasPython ? test : test.skip;

const incarnation = 'inc_0123456789abcdef01234567';
const sessionPrefix = 'macos-session:';
const undescribed = 'The macOS service identity could not be determined.';
const idleScript = 'setInterval(() => {}, 1000);';
// Hosts and ports are passed as arguments so that no value is ever spliced into a script.
const listenerScript =
  "const server = require('node:net').createServer(); server.listen(Number(process.argv[2]), process.argv[1], () => process.stdout.write(`${server.address().port}\\n`));";
const reusePortScript = [
  'import socket, sys',
  'host, port = sys.argv[1], int(sys.argv[2])',
  'server = socket.socket(socket.AF_INET6 if ":" in host else socket.AF_INET)',
  'server.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)',
  'server.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEPORT, 1)',
  'server.bind((host, port))',
  'server.listen()',
  'print(server.getsockname()[1], flush=True)',
  'sys.stdin.read()',
].join('\n');
const closedScript = ['import os, time', 'os.closerange(2, 65536)', 'os.close(0)', 'os.close(1)', 'time.sleep(600)'].join('\n');

let artifactPromise: Promise<NativeDriverArtifact> | undefined;
const helperArtifact = (): Promise<NativeDriverArtifact> => (artifactPromise ??= buildNativeDesktopDriver({ platform: 'macos' }));

const children: ChildProcess[] = [];
const servers: net.Server[] = [];

afterEach(async () => {
  for (const child of children.splice(0)) {
    child.kill();
  }
  await Promise.all(servers.splice(0).map((server) => new Promise<void>((resolve) => server.close(() => resolve()))));
});

const origin = (host: string, port: number): string => `http://${host.includes(':') ? `[${host}]` : host}:${port}`;
const portOf = (url: string): number => Number(url.slice(url.lastIndexOf(':') + 1));

function pidOf(child: ChildProcess): number {
  if (child.pid === undefined) {
    throw new Error('Expected the child process to have a process id.');
  }
  return child.pid;
}

async function claimFor(pid: number): Promise<DesktopServiceIdentity> {
  return { ...(await describeMacOSService({ artifact: await helperArtifact(), pid })), incarnation };
}

// Reads the helper's verdict directly so that a refusal names its reason, then checks that the public verifier agrees.
async function verdict(service: DesktopServiceIdentity, url: string): Promise<{ reason?: unknown; verified: boolean }> {
  const artifact = await helperArtifact();
  const answer = await runAuthorityHelper('macOS', artifact, '--service-identity', { operation: 'verify', service, url });
  const verified = await createMacOSServiceVerifier({ artifact })(service, url);
  expect(verified).toBe(answer.verified === true);
  return answer.verified === true ? { verified } : { reason: answer.reason, verified };
}

async function listenHere(host: string, port = 0): Promise<string> {
  const server = net.createServer();
  servers.push(server);
  await new Promise<void>((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, host, resolve);
  });
  return origin(host, (server.address() as net.AddressInfo).port);
}

function startIdle(): ChildProcess {
  const child = spawn(process.execPath, ['-e', idleScript], { stdio: 'ignore' });
  children.push(child);
  return child;
}

async function startChild(command: string, args: readonly string[], host: string): Promise<{ child: ChildProcess; url: string }> {
  const child = spawn(command, args, { stdio: ['pipe', 'pipe', 'ignore'] });
  children.push(child);
  child.stdout?.setEncoding('utf8');
  const port = await new Promise<number>((resolve, reject) => {
    let text = '';
    child.stdout?.on('data', (chunk: string) => {
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

const startListener = (host: string, port = 0) => startChild(process.execPath, ['-e', listenerScript, host, String(port)], host);
const startReusePortListener = (host: string, port = 0) => startChild('python3', ['-c', reusePortScript, host, String(port)], host);

// The claimed start time one microsecond later.
const nextTick = (startedAt: string): string => `${startedAt.slice(0, -2)}${(Number(startedAt.at(-2)) + 1) % 10}Z`;

describe('macOS service identity against the helper', () => {
  macosTest('describes a process the way its supervisor would publish it', async () => {
    const identity = await describeMacOSService({ artifact: await helperArtifact(), pid: process.pid });

    expect(identity).toEqual({
      executablePath: fs.realpathSync(process.execPath),
      interactiveSession: expect.stringMatching(/^macos-session:[0-9]+$/),
      pid: process.pid,
      platform: 'macos',
      startedAt: expect.stringMatching(/^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}\.[0-9]{6}Z$/),
    });
    // The start time is the operating system's, so it agrees with how long this process says it has been running.
    const startedMs = Date.parse(`${identity.startedAt.slice(0, 23)}Z`);
    expect(Math.abs(startedMs - (Date.now() - process.uptime() * 1000))).toBeLessThan(10_000);
  });

  macosTest('refuses to describe a process that does not exist, has exited, or belongs to another user', async () => {
    const artifact = await helperArtifact();
    const child = startIdle();
    const exitedPid = pidOf(child);
    child.kill();
    await once(child, 'exit');

    await expect(describeMacOSService({ artifact, pid: 2_000_000_000 })).rejects.toMatchObject({ message: undescribed, reason: 'exited' });
    await expect(describeMacOSService({ artifact, pid: exitedPid })).rejects.toMatchObject({ message: undescribed, reason: 'exited' });
    // launchd always runs as root.
    await expect(describeMacOSService({ artifact, pid: 1 })).rejects.toMatchObject({ message: undescribed, reason: 'user' });
  });

  macosTest('verifies a claim only for the process that owns the loopback listener', async () => {
    const ownUrl = await listenHere('127.0.0.1');
    const own = await claimFor(process.pid);
    const { child, url: foreignUrl } = await startListener('127.0.0.1');
    const foreign = await claimFor(pidOf(child));

    await expect(verdict(own, ownUrl)).resolves.toEqual({ verified: true });
    await expect(verdict(foreign, foreignUrl)).resolves.toEqual({ verified: true });
    await expect(verdict(own, foreignUrl)).resolves.toEqual({ reason: 'listener', verified: false });
    await expect(verdict(foreign, ownUrl)).resolves.toEqual({ reason: 'listener', verified: false });
  });

  macosTest('refuses a claim whose start time, executable, or session differs from the live process', async () => {
    const url = await listenHere('127.0.0.1');
    const own = await claimFor(process.pid);
    const session = Number(own.interactiveSession.slice(sessionPrefix.length));
    const cases = [
      ['start', { startedAt: nextTick(own.startedAt) }],
      ['image', { executablePath: '/bin/sh' }],
      // The path names the same file on a case-insensitive volume, but the comparison is exact.
      ['image', { executablePath: own.executablePath.toUpperCase() }],
      ['session', { interactiveSession: `${sessionPrefix}${session + 1000}` }],
    ] as const;

    for (const [reason, changed] of cases) {
      await expect(verdict({ ...own, ...changed }, url)).resolves.toEqual({ reason, verified: false });
    }
  });

  macosTest('refuses an address that no process serves', async () => {
    const own = await claimFor(process.pid);
    const unused = await listenHere('127.0.0.1');
    const server = servers.pop() as net.Server;
    await new Promise<void>((resolve) => server.close(() => resolve()));

    await expect(verdict(own, unused)).resolves.toEqual({ reason: 'listener', verified: false });
  });

  macosTest('refuses a process that has exited', async () => {
    const child = startIdle();
    const exited = await claimFor(pidOf(child));
    child.kill();
    await once(child, 'exit');
    const url = await listenHere('127.0.0.1');

    await expect(verdict(exited, url)).resolves.toEqual({ reason: 'exited', verified: false });
  });

  macosTest.each([
    'http://localhost:49152',
    'http://192.0.2.1:49152',
    'https://127.0.0.1:49152',
    'http://127.0.0.1',
    'http://127.0.0.1:49152/status',
  ])('refuses %s as the service address', async (address) => {
    await expect(verdict(await claimFor(process.pid), address)).resolves.toEqual({ reason: 'url', verified: false });
  });

  macosTest('keeps the IPv6 and IPv4 loopback listeners apart', async () => {
    const url = await listenHere('::1');
    const own = await claimFor(process.pid);

    await expect(verdict(own, url)).resolves.toEqual({ verified: true });
    await expect(verdict(own, url.replace('[::1]', '127.0.0.1'))).resolves.toEqual({ reason: 'listener', verified: false });
  });

  macosTest.each(['0.0.0.0', '::'])('refuses a listener shared with a %s wildcard of the same user', async (wildcard) => {
    const url = await listenHere('127.0.0.1');
    const own = await claimFor(process.pid);
    await expect(verdict(own, url)).resolves.toEqual({ verified: true });

    await startListener(wildcard, portOf(url));

    await expect(verdict(own, url)).resolves.toEqual({ reason: 'listener', verified: false });
  });

  pythonTest('refuses a listener with SO_REUSEPORT, which another user could share', async () => {
    const { child, url } = await startReusePortListener('127.0.0.1');

    await expect(verdict(await claimFor(pidOf(child)), url)).resolves.toEqual({ reason: 'listener', verified: false });
  });

  pythonTest('verifies while another process of the user has no open descriptors', async () => {
    const url = await listenHere('127.0.0.1');
    const own = await claimFor(process.pid);
    // Standard output closes last, so its end means the process holds no descriptors.
    const child = spawn('python3', ['-c', closedScript], { stdio: ['ignore', 'pipe', 'ignore'] });
    children.push(child);
    child.stdout?.resume();
    await once(child.stdout as NodeJS.ReadableStream, 'end');

    await expect(verdict(own, url)).resolves.toEqual({ verified: true });
  });
});
