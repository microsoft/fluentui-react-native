import * as http from 'node:http';
import { Server as NetServer } from 'node:net';
import type { AddressInfo } from 'node:net';

import { FakeDesktopHost } from '../hosts/fake/FakeDesktopHost.js';
import { createDesktopDriverTestHarness } from '../testing/protocolHarness.js';
import type { DesktopDriverTestHarness } from '../testing/protocolHarness.js';
import { createDesktopDriverServer } from './createDesktopDriverServer.js';
import type { DesktopDriverServerOptions } from './createDesktopDriverServer.js';

type RawResponse = { body: { value: { error?: string; message?: string } }; status: number };

/** Sends one request with exactly the headers given, which `fetch` would not allow a test to forge. */
function rawRequest(harness: DesktopDriverTestHarness, path: string, headers: Record<string, string> = {}): Promise<RawResponse> {
  return new Promise((resolve, reject) => {
    const request = http.request({ headers, host: '127.0.0.1', path, port: harness.server.port }, (response) => {
      const chunks: Buffer[] = [];
      response.on('data', (chunk: Buffer) => chunks.push(chunk));
      response.on('end', () => resolve({ body: JSON.parse(Buffer.concat(chunks).toString('utf8')), status: response.statusCode ?? 0 }));
    });
    request.on('error', reject);
    request.end();
  });
}

describe('Desktop Driver request boundary', () => {
  let harness: DesktopDriverTestHarness;

  beforeEach(async () => {
    harness = await createDesktopDriverTestHarness();
  });

  afterEach(async () => {
    await harness.close();
  });

  test.each([
    ['its own address', (port: number) => `127.0.0.1:${port}`],
    ['localhost', (port: number) => `localhost:${port}`],
    ['an IPv6 loopback name', (port: number) => `[::1]:${port}`],
  ])('serves a request addressed to %s', async (_name, host) => {
    const response = await rawRequest(harness, '/status', { Host: host(harness.server.port) });

    expect(response.status).toBe(200);
  });

  test.each([
    ['a foreign name, as in DNS rebinding', (port: number) => `rebound.example:${port}`],
    ['a name that only starts like localhost', (port: number) => `localhost.example:${port}`],
    ['no port', () => '127.0.0.1'],
    ['another port', (port: number) => `127.0.0.1:${port + 1}`],
    ['a trailing path in place of the port', (port: number) => `127.0.0.1:${port}/x`],
  ])('refuses a request addressed to %s before it reads anything', async (_name, host) => {
    const response = await rawRequest(harness, '/status', { Host: host(harness.server.port) });

    expect(response.status).toBe(500);
    expect(response.body.value).toMatchObject({ error: 'unknown error', message: expect.stringMatching(/own loopback host and port/) });
    expect(JSON.stringify(response.body)).not.toContain('targets');
  });

  test.each([
    ['an Origin', { Origin: 'https://rebound.example' }],
    ['a cross-site Fetch Metadata request', { 'Sec-Fetch-Site': 'cross-site' }],
    ['a Fetch Metadata destination', { 'Sec-Fetch-Dest': 'empty' }],
    ['a navigation', { 'Sec-Fetch-Mode': 'navigate' }],
  ])('refuses a browser request that carries %s', async (_name, headers) => {
    const response = await rawRequest(harness, '/status', headers);

    expect(response.status).toBe(500);
    expect(response.body.value).toMatchObject({ error: 'unknown error', message: expect.stringMatching(/Browser-origin/) });
  });

  test('serves the Fetch Metadata that Node fetch adds', async () => {
    const response = await rawRequest(harness, '/status', { 'Sec-Fetch-Mode': 'cors' });

    expect(response.status).toBe(200);
  });

  test.each(['/session/%E0%A4%A/timeouts', '/%'])('answers the malformed path %s with invalid argument', async (path) => {
    const response = await rawRequest(harness, path);

    expect(response.status).toBe(400);
    expect(response.body.value.error).toBe('invalid argument');
  });
});

describe('Desktop Driver listener', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('keeps running when the listener later reports an accept error', async () => {
    const created: NetServer[] = [];
    const listen = NetServer.prototype.listen;
    jest.spyOn(NetServer.prototype, 'listen').mockImplementation(function (this: NetServer, ...args: never[]) {
      created.push(this);
      return (listen as (...listenArgs: never[]) => NetServer).apply(this, args);
    } as typeof NetServer.prototype.listen);
    const harness = await createDesktopDriverTestHarness();
    try {
      expect(created).toHaveLength(1);
      expect(() => created[0].emit('error', new Error('accept failed'))).not.toThrow();
      expect((await rawRequest(harness, '/status')).status).toBe(200);
    } finally {
      await harness.close();
    }
  });

  test('refuses to serve from an address that is not loopback', async () => {
    const address = jest
      .spyOn(NetServer.prototype, 'address')
      .mockReturnValue({ address: '0.0.0.0', family: 'IPv4', port: 1 } as AddressInfo);

    await expect(createDesktopDriverServer({ targets: [] })).rejects.toThrow(/did not bind to a loopback address/);
    expect(address).toHaveBeenCalled();
  });
});

describe('Desktop Driver startup options', () => {
  test.each([
    ['a misspelled content policy', { operations: { content: 'Deny' } }],
    ['a null content policy', { operations: { content: null } }],
    ['a misspelled operations key', { operations: { contnet: 'deny' } }],
    ['a misspelled option', { operation: { content: 'deny' } }],
    ['a body limit that is not a number', { maxBodyBytes: NaN }],
    ['a body limit that is not finite', { maxBodyBytes: Infinity }],
    ['a body limit of zero', { maxBodyBytes: 0 }],
    ['a body limit given as text', { maxBodyBytes: '1024' }],
    ['a negative port', { port: -1 }],
    ['a port beyond the range', { port: 65_536 }],
    ['a port given as text', { port: '8080' }],
    ['a null host', { host: null }],
    ['a recovery without storage', { recovery: {} }],
    ['a probe that is not a function', { recovery: { probeApplication: 'probe', storage: {} } }],
    ['a null set of options', null],
  ])('refuses to start with %s', async (_name, options) => {
    await expect(createDesktopDriverServer(options as unknown as DesktopDriverServerOptions)).rejects.toThrow(
      /must be|Unknown|not a supported/,
    );
  });

  test('refuses to start without the host a target needs to be addressed', async () => {
    await expect(createDesktopDriverServer({ host: '0.0.0.0', targets: [] })).rejects.toThrow(/not a supported loopback host/);
  });

  test('starts with explicit, valid options', async () => {
    const server = await createDesktopDriverServer({
      maxBodyBytes: 2048,
      operations: { content: 'deny' },
      port: 0,
      targets: [{ endpoint: 'windows', host: new FakeDesktopHost(), id: 'fake-windows', platformName: 'windows', renderer: 'fabric' }],
    });
    await server.close();
  });
});
