import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import type { ChildProcess } from 'node:child_process';
import { once } from 'node:events';
import net from 'node:net';
import { createDesktopProcessControl } from './processControl.js';
import { deadline, NodeDesktopCommandRunner } from './commands.js';
import type { RunningDesktopCommand } from './commands.js';
import { DesktopServiceScope } from './services.js';
import type { DesktopResourceRecord } from './resources.js';

const fixture = path.resolve(__dirname, '../fixtures/process-control/child.mjs');
const parentFixture = path.resolve(__dirname, '../fixtures/process-control/parent.mjs');
const preload = path.resolve(__dirname, '../config/process-lifeline.mjs');
const quiet = { write: () => true };
jest.setTimeout(45_000);

describe('owned process lifelines', () => {
  let root: string;
  const children: ChildProcess[] = [];
  beforeEach(() => {
    root = fs.mkdtempSync(path.join(os.tmpdir(), 'furn-process-contract-'));
  });
  afterEach(async () => {
    for (const child of children.splice(0)) if (child.exitCode === null && child.signalCode === null) child.kill('SIGKILL');
    fs.rmSync(root, { force: true, recursive: true });
  });

  test('correlates service readiness and waits for explicit descriptor withdrawal', async () => {
    const marker = path.join(root, 'descriptor');
    const runner = new NodeDesktopCommandRunner({ logDirectory: root, output: quiet });
    const running = runner.start({ command: process.execPath, args: [fixture, 'service', marker], cwd: root, env: {} });
    try {
      const record = await running.waitForReadiness!({ tier: 'service-ready', service: 'fixture', descriptor: 'fixture.json' }, 5000);
      expect(record).toEqual({
        tier: 'service-ready',
        service: 'fixture',
        descriptor: 'fixture.json',
        incarnation: expect.any(String),
        processId: Number(fs.readFileSync(marker, 'utf8')),
      });
      await expect(
        running.waitForReadiness!({ tier: 'service-ready', service: 'fixture', descriptor: 'stale.json' }, 5000),
      ).rejects.toThrow('different descriptor');
      await running.stop();
      expect(fs.existsSync(marker)).toBe(false);
      expect(await running.completed).toBe(0);
    } finally {
      await runner.close();
    }
  });

  test('records an authenticated process receipt in an owned resource generation', async () => {
    const marker = path.join(root, 'descriptor');
    const runner = new NodeDesktopCommandRunner({ logDirectory: root, output: quiet });
    const scope = new DesktopServiceScope(runner);
    const records: DesktopResourceRecord[] = [];
    scope.setResourceObserver((record) => records.push(record));
    let running: RunningDesktopCommand | undefined;
    try {
      await scope.contribute(
        [
          {
            id: 'fixture',
            ownership: 'owned',
            prepare: () => ({
              identity: 'fixture-service',
              acquire: async (signal) => {
                running = runner.start({ command: process.execPath, args: [fixture, 'service', marker], cwd: root, env: {} });
                if (!running.waitForReadiness) throw new Error('Process readiness is required.');
                return running.waitForReadiness({ tier: 'service-ready', service: 'fixture', descriptor: 'fixture.json' }, 5000, signal);
              },
              dispose: async () => running?.stop(),
            }),
          },
        ],
        { targetId: 'fixture-target', targetInstanceId: 'fixture-instance' },
      );
      expect(records.at(-1)).toMatchObject({
        id: 'desktop:fixture',
        identity: 'fixture-service',
        generation: 1,
        ownership: 'owned',
        readiness: 'ready',
        serviceReady: {
          tier: 'service-ready',
          service: 'fixture',
          descriptor: 'fixture.json',
          incarnation: expect.any(String),
          processId: Number(fs.readFileSync(marker, 'utf8')),
        },
      });
      await scope.close();
      expect(records.at(-1)?.disposal).toBe('settled');
      expect(fs.existsSync(marker)).toBe(false);
    } finally {
      await scope.close();
      await runner.close();
    }
  });

  test.each([
    { mode: 'service', crash: 'parent' },
    { mode: 'wrapper', crash: 'parent' },
    { mode: 'wrapper', crash: 'wrapper' },
  ])('$crash crash disposes surviving $mode and leaves borrowed resources running', async ({ mode, crash }) => {
    const marker = path.join(root, 'descriptor');
    const borrowedMarker = path.join(root, 'borrowed');
    const borrowed = spawn(process.execPath, [fixture, 'borrowed', borrowedMarker], { stdio: 'ignore' });
    children.push(borrowed);
    const parent = spawn(process.execPath, [parentFixture, fixture, mode, marker, root, preload], {
      stdio: ['ignore', 'pipe', 'pipe', 'ipc'],
    });
    children.push(parent);
    let diagnostic = '';
    parent.stderr!.on('data', (text: Buffer) => (diagnostic += text.toString()));
    const ready = await deadline(
      Promise.race([
        once(parent, 'message'),
        once(parent, 'exit').then(() => {
          throw new Error(`Parent fixture failed: ${diagnostic}`);
        }),
      ]),
      20_000,
      'Starting parent fixture',
    );
    const processId = (ready[0] as { processId: number }).processId;
    if (crash === 'parent') parent.kill('SIGKILL');
    else process.kill(Number(fs.readFileSync(`${marker}.wrapper`, 'utf8')), 'SIGKILL');
    await waitUntil(() => !fs.existsSync(marker));
    await waitUntil(() => !alive(processId));
    expect(alive(borrowed.pid!)).toBe(true);
    expect(fs.existsSync(borrowedMarker)).toBe(true);
    if (crash === 'wrapper') {
      expect(alive(parent.pid!)).toBe(true);
      parent.send('close');
      await deadline(once(parent, 'exit'), 5000, 'Closing surviving owner');
    }
    if (process.platform !== 'win32') fs.rmSync(fs.readFileSync(`${marker}.socket`, 'utf8'), { force: true });
  });

  test('late Node spawn cannot execute its entry after parent disappearance', async () => {
    const failures: Error[] = [];
    const control = createDesktopProcessControl((error) => failures.push(error));
    const environment = control.environment();
    await control.close();
    const marker = path.join(root, 'late');
    const child = spawn(process.execPath, [fixture, 'late', marker], {
      env: { ...process.env, ...environment },
      stdio: 'ignore',
    });
    children.push(child);
    const [code, signal] = await deadline(once(child, 'exit'), 15_000, 'Rejecting late child');
    expect(code !== 0 || signal !== null).toBe(true);
    expect(fs.existsSync(marker)).toBe(false);
    expect(failures).toEqual([]);
  });

  test.each(['failed', 'stalled'])('%s disposal is incomplete, never a successful cleanup', async (mode) => {
    const marker = path.join(root, 'descriptor');
    const runner = new NodeDesktopCommandRunner({ logDirectory: root, output: quiet, errorOutput: quiet, shutdownTimeoutMs: 200 });
    const running = runner.start({ command: process.execPath, args: [fixture, mode, marker], cwd: root, env: {} });
    await running.waitForReadiness!({ tier: 'service-ready', service: 'fixture', descriptor: 'fixture.json' }, 5000);
    await expect(running.stop()).rejects.toThrow(/disposal|settle/);
    expect(fs.existsSync(marker)).toBe(true);
    await runner.close();
  });

  test('owned service wrappers cannot certify a failed child disposal', async () => {
    const marker = path.join(root, 'descriptor');
    const descriptor = path.join(root, 'service.json');
    fs.writeFileSync(
      descriptor,
      JSON.stringify({
        label: 'fixture-wrapper',
        stopPath: path.join(root, 'stop'),
        command: { command: process.execPath, args: [fixture, 'failed', marker], cwd: root },
      }),
    );
    const runner = new NodeDesktopCommandRunner({ logDirectory: root, output: quiet, errorOutput: quiet, shutdownTimeoutMs: 15_000 });
    const running = runner.start({
      command: process.execPath,
      args: [path.resolve(__dirname, '../config/service.cjs'), descriptor],
      cwd: root,
      env: {},
    });
    try {
      await waitUntil(() => fs.existsSync(marker));
      await expect(running.stop()).rejects.toThrow();
      expect(fs.existsSync(marker)).toBe(true);
    } finally {
      await runner.close();
    }
  });

  test('producer loss invalidates readiness and cannot certify descriptor withdrawal', async () => {
    const marker = path.join(root, 'descriptor');
    const runner = new NodeDesktopCommandRunner({ logDirectory: root, output: quiet, errorOutput: quiet });
    const running = runner.start({ command: process.execPath, args: [fixture, 'service', marker], cwd: root, env: {} });
    const expected = { tier: 'service-ready', service: 'fixture', descriptor: 'fixture.json' } as const;
    try {
      const record = await running.waitForReadiness!(expected, 5000);
      process.kill(record.processId, 'SIGKILL');
      await running.completed.catch(() => undefined);
      await expect(running.waitForReadiness!(expected, 5000)).rejects.toThrow();
      await expect(running.stop()).rejects.toThrow('without settled disposal');
      expect(fs.existsSync(marker)).toBe(true);
    } finally {
      await runner.close();
    }
  });

  test('a connection reset reports readiness producer loss instead of the transport error', async () => {
    const accepted: net.Socket[] = [];
    const createServer = net.createServer.bind(net);
    const spy = jest.spyOn(net, 'createServer').mockImplementation(((listener: (socket: net.Socket) => void) =>
      createServer((socket) => {
        accepted.push(socket);
        listener(socket);
      })) as typeof net.createServer);
    const failures: Error[] = [];
    const control = createDesktopProcessControl((error) => failures.push(error));
    spy.mockRestore();
    const { address, nonce } = JSON.parse(control.environment().FURN_DESKTOP_PROCESS_CONTROL!) as { address: string; nonce: string };
    const expected = { tier: 'service-ready', service: 'fixture', descriptor: 'fixture.json' } as const;
    const readiness = control.waitForReadiness(expected, 5000);
    const client = net.connect(address);
    try {
      await once(client, 'connect');
      client.write(`${JSON.stringify({ type: 'hello', nonce, processId: process.pid })}\n`);
      client.write(`${JSON.stringify({ type: 'ready', requestId: 'r1', readiness: expected })}\n`);
      await readiness;
      // Linux can surface a peer SIGKILL as ECONNRESET before 'close'; emulate that ordering on any platform.
      const closed = new Promise<void>((resolve) => accepted[0]!.once('close', () => resolve()));
      accepted[0]!.destroy(Object.assign(new Error('read ECONNRESET'), { code: 'ECONNRESET' }));
      await closed;
      expect(failures.map((failure) => failure.message)).toEqual([expect.stringContaining('without settled disposal')]);
    } finally {
      client.destroy();
      await control.close();
    }
  });

  test('stalled readiness and cancellation do not promote another readiness tier', async () => {
    const control = createDesktopProcessControl(() => undefined);
    try {
      await expect(control.waitForReadiness({ tier: 'service-ready', service: 'missing' }, 30)).rejects.toThrow('correlated readiness');
      const controller = new AbortController();
      controller.abort(new Error('Cancelled acquisition'));
      await expect(control.waitForReadiness({ tier: 'service-ready', service: 'missing' }, 1000, controller.signal)).rejects.toThrow(
        'Cancelled acquisition',
      );
      await expect(
        // @ts-expect-error Higher tiers are not process service readiness.
        control.waitForReadiness({ tier: 'application-ready', service: 'missing' }, 1000),
      ).rejects.toThrow('separate verification');
    } finally {
      await control.close();
    }
  });
});

function alive(pid: number): boolean {
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ESRCH') return false;
    throw error;
  }
}

async function waitUntil(check: () => boolean): Promise<void> {
  await deadline(
    (async () => {
      while (!check()) await new Promise((resolve) => setTimeout(resolve, 20));
    })(),
    15_000,
    'Verifying surviving cooperative process cleanup',
  );
}
