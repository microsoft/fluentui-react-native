/* eslint-disable @microsoft/sdl/no-insecure-url -- The protected service protocol is loopback HTTP, not remote HTTPS. */
import { createServer } from 'node:http';
import type { AddressInfo } from 'node:net';

import { createDesktopDriverClient } from '../client/DesktopDriverClient.js';
import { createDesktopDriverTestHarness } from '../testing/protocolHarness.js';
import { publishConnectionDescriptor, readConnectionDescriptor } from './connectionDescriptor.js';
import type { DesktopConnectionDescriptor } from './connectionDescriptor.js';
import { DesktopAuthority } from './grants.js';
import type { PrivateStorage } from './privateStorage.js';

function storageWith(contents?: string) {
  return {
    read: jest.fn(async () => contents),
    publish: jest.fn(async () => undefined),
    remove: jest.fn(async () => false),
  } satisfies PrivateStorage;
}

function descriptor(url: string, authority: DesktopAuthority): DesktopConnectionDescriptor {
  return {
    version: 1,
    url,
    service: {
      platform: 'macos',
      pid: 123,
      startedAt: 'process-start-identity',
      executablePath: '/trusted/node',
      interactiveSession: 'interactive-session',
      incarnation: authority.incarnation,
    },
    grant: authority.issue({ label: 'descriptor', targets: '*' }).token,
  };
}

test('requires live identity verification before authenticating and accepts only the recorded incarnation', async () => {
  const authority = new DesktopAuthority();
  const harness = await createDesktopDriverTestHarness({}, undefined, { authority });
  const fetchSpy = jest.spyOn(globalThis, 'fetch');
  try {
    const record = descriptor(harness.server.url, authority);
    const storage = storageWith(JSON.stringify(record));
    const verify = jest.fn(async () => true);
    const loaded = await readConnectionDescriptor(storage, 'connection.json', verify);
    expect(verify).toHaveBeenCalledWith(record.service, record.url);
    expect(verify.mock.invocationCallOrder[0]).toBeLessThan(fetchSpy.mock.invocationCallOrder[0]);
    expect(loaded).toEqual(record);
    expect(Object.isFrozen(loaded.service)).toBe(true);

    const restarted = { ...record, service: { ...record.service, incarnation: 'inc_' + '0'.repeat(24) } };
    await expect(readConnectionDescriptor(storageWith(JSON.stringify(restarted)), 'connection.json', verify)).rejects.toThrow(
      'incarnation changed',
    );
  } finally {
    fetchSpy.mockRestore();
    await harness.close();
  }
});

test('rejects missing or unverifiable discovery state without sending a credential', async () => {
  const authority = new DesktopAuthority();
  const record = descriptor('http://127.0.0.1:4444', authority);
  const fetchSpy = jest.spyOn(globalThis, 'fetch');
  try {
    await expect(readConnectionDescriptor(storageWith(), 'connection.json', async () => true)).rejects.toThrow('absent');
    for (const verifier of [async () => false, undefined]) {
      await expect(readConnectionDescriptor(storageWith(JSON.stringify(record)), 'connection.json', verifier!)).rejects.toThrow(
        'could not be verified',
      );
    }
    expect(fetchSpy).not.toHaveBeenCalled();
  } finally {
    fetchSpy.mockRestore();
  }
});

test.each([
  { version: 2 },
  { extra: true },
  { url: 'https://example.com' },
  { url: 'http://localhost:4444' },
  { url: 'http://127.0.0.1:4444/redirect' },
  { url: 'http://user:password@127.0.0.1:4444' },
  { grant: 'not-a-grant' },
  { service: { pid: 123 } },
])('rejects malformed descriptors before publication (%j)', async (override) => {
  const record = { ...descriptor('http://127.0.0.1:4444', new DesktopAuthority()), ...override };
  const storage = storageWith();
  await expect(publishConnectionDescriptor(storage, 'connection.json', record as DesktopConnectionDescriptor)).rejects.toThrow(
    'Invalid Desktop Driver connection descriptor.',
  );
  expect(storage.publish).not.toHaveBeenCalled();
});

test('rejects malformed and oversized stored JSON with no parser-content diagnostics', async () => {
  for (const contents of ['{invalid', ' '.repeat(16 * 1024 + 1)]) {
    await expect(readConnectionDescriptor(storageWith(contents), 'connection.json', async () => true)).rejects.toThrow(
      'Invalid Desktop Driver connection descriptor.',
    );
  }
});

test('publishes a validated record with cleanup bound to exactly the published contents', async () => {
  const storage = storageWith();
  const record = descriptor('http://127.0.0.1:4444', new DesktopAuthority());
  const cleanup = await publishConnectionDescriptor(storage, 'connection.json', record);
  await cleanup();
  expect(storage.publish).toHaveBeenCalledTimes(1);
  expect(storage.remove.mock.calls).toEqual(storage.publish.mock.calls);
});

test('does not forward a protected client credential through a redirect', async () => {
  let redirected = false;
  const server = createServer((request, response) => {
    if (request.url === '/status') response.writeHead(302, { Location: '/redirected' }).end();
    else {
      redirected = true;
      response.end(JSON.stringify({ value: {} }));
    }
  });
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const url = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  const grant = new DesktopAuthority().issue({ label: 'redirect', targets: '*' });
  try {
    await expect(createDesktopDriverClient({ url, grant: grant.token }).status()).rejects.toThrow();
    expect(redirected).toBe(false);
  } finally {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
});
