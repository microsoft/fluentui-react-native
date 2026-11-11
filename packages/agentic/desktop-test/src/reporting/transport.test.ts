import fs from 'node:fs';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';
import { once } from 'node:events';

import { DesktopRunReporter } from './collector.js';
import { createEventEmitter } from './protocol.js';
import type { DesktopEvent } from './protocol.js';
import { DESKTOP_REPORT_CONTEXT, requestReportStop, startReportTransport } from './transport.js';
import type { ReportTransport, ReportTransportContext } from './transport.js';

const quiet = { write: () => true };

describe('desktop reporting transport rejects invalid producers', () => {
  let root: string;
  let reporter: DesktopRunReporter;
  let transport: ReportTransport;
  let context: ReportTransportContext;
  let onFatal: jest.Mock;
  beforeEach(async () => {
    root = fs.mkdtempSync(path.join(os.tmpdir(), 'furn-desktop-transport-'));
    reporter = new DesktopRunReporter({ artifactsRoot: root, kind: 'lifecycle', output: quiet, errorOutput: quiet, summary: false });
    onFatal = jest.fn();
    transport = await startReportTransport(reporter, onFatal);
    context = JSON.parse(transport.environment[DESKTOP_REPORT_CONTEXT]);
  });
  afterEach(async () => {
    // One test already closed the transport.
    await transport.close().catch(() => undefined);
    fs.rmSync(root, { force: true, recursive: true });
  });

  async function connect() {
    const socket = net.createConnection(context.address);
    socket.setEncoding('utf8');
    let received = '';
    socket.on('data', (chunk: string) => {
      received += chunk;
    });
    socket.on('error', () => undefined);
    const closed = once(socket, 'close');
    await once(socket, 'connect');
    return {
      socket,
      send: (value: unknown) => socket.write(JSON.stringify(value) + '\n'),
      received: () => received,
      closed: async () => {
        await closed;
        return received;
      },
    };
  }

  async function connectProducer(sourceId: string) {
    const client = await connect();
    client.send({ ...context, type: 'hello', sourceId });
    await waitUntil(() => client.received().includes('"ready":true'));
    return client;
  }

  async function failures(): Promise<string[]> {
    return (await reporter.finish()).failures.map(({ error }) => error.message);
  }

  test('a handshake with the wrong nonce', async () => {
    const client = await connect();
    client.send({ ...context, nonce: 'not-the-nonce', type: 'hello', sourceId: 'producer' });
    expect(await client.closed()).toBe('');
    expect(await failures()).toEqual(['Invalid desktop reporting IPC handshake.']);
    expect(onFatal).toHaveBeenCalledTimes(1);
  });

  test('a frame larger than 1 MiB', async () => {
    const client = await connect();
    client.socket.write('x'.repeat(1024 * 1024 + 1));
    await client.closed();
    expect(await failures()).toEqual(['Desktop reporting IPC frame exceeded 1 MiB.']);
  });

  test.each([0, 1.5, 120_001])('a stop request with deadline %p', async (timeoutMs) => {
    await expect(requestReportStop('scope', transport.environment[DESKTOP_REPORT_CONTEXT], timeoutMs)).rejects.toThrow();
    expect(await failures()).toEqual(['Invalid desktop stop deadline.']);
  });

  test('a result request with malformed or unauthenticated fields', async () => {
    const malformed = await connect();
    malformed.send({ ...context, type: 'assert', workIds: 'work', optional: false });
    await malformed.closed();
    const unauthenticated = await connect();
    unauthenticated.send({ ...context, nonce: 'not-the-nonce', type: 'assert', workIds: [], optional: false });
    await unauthenticated.closed();
    expect(await failures()).toEqual(['Invalid selected-work result request.', 'Invalid desktop result request.']);
  });

  test('an event from another source after the handshake', async () => {
    const client = await connectProducer('producer');
    const events: DesktopEvent[] = [];
    createEventEmitter(context.runId, 'impostor', (event) => events.push(event))({
      kind: 'diagnostic',
      payload: { level: 'warning', message: 'not mine' },
    });
    client.send(events[0]);
    await client.closed();
    expect(await failures()).toEqual(['Reporting source changed after its handshake.']);
  });

  test('a producer that disconnects without finishing', async () => {
    const client = await connectProducer('producer');
    client.socket.end();
    await client.closed();
    await waitUntil(() => onFatal.mock.calls.length > 0);
    expect(await failures()).toEqual(['Reporting producer producer disconnected without its terminal result/flush handshake.']);
  });

  (process.platform === 'win32' ? test.skip : test)('close removes the private socket directory', async () => {
    const directory = path.dirname(context.address);
    expect(fs.statSync(directory).mode & 0o777).toBe(0o700);
    await transport.close();
    expect(fs.existsSync(directory)).toBe(false);
  });
});

async function waitUntil(check: () => boolean): Promise<void> {
  const until = Date.now() + 5000;
  while (!check()) {
    if (Date.now() > until) throw new Error('Timed out waiting for the transport fixture.');
    await new Promise((resolve) => setTimeout(resolve, 10));
  }
}
