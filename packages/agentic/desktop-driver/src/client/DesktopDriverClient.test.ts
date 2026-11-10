import { WebDriverError } from '../protocol/errors.js';
import { webElementIdentifier } from '../protocol/constants.js';
import { DesktopDriverClient, DesktopDriverClientError, DesktopElementClient, DesktopSessionClient } from './DesktopDriverClient.js';

type Reply = { body: string; status?: number };

function clientFor(reply: Reply | (() => Promise<Response>)) {
  const calls: { init: RequestInit | undefined; url: string }[] = [];
  const fetch = (async (url: string | URL | Request, init?: RequestInit) => {
    calls.push({ init, url: String(url) });
    if (typeof reply === 'function') return reply();
    return new Response(reply.body, { status: reply.status ?? 200 });
  }) as typeof globalThis.fetch;
  // eslint-disable-next-line @microsoft/sdl/no-insecure-url -- test-only loopback service; the injected fetch never connects
  return { calls, client: new DesktopDriverClient({ fetch, url: 'http://127.0.0.1:1/' }) };
}

describe('DesktopDriverClient responses', () => {
  test('describes a body that is not JSON without echoing it', async () => {
    const { client } = clientFor({ body: '<html>secret-token-9f3 gateway</html>', status: 502 });
    const error = await client.status().catch((caught: unknown) => caught);
    expect(error).toBeInstanceOf(DesktopDriverClientError);
    expect(error).toMatchObject({ reason: 'invalid-response', status: 502 });
    expect((error as Error).message).toContain('HTTP 502');
    expect((error as Error).message).not.toContain('secret-token-9f3');
    expect((error as Error).cause).toBeInstanceOf(SyntaxError);
  });

  test('rejects a response without a WebDriver value instead of returning undefined', async () => {
    const { client } = clientFor({ body: '{}' });
    await expect(client.status()).rejects.toMatchObject({ name: 'DesktopDriverClientError', reason: 'invalid-response', status: 200 });
  });

  test('rejects a failed response whose error is malformed', async () => {
    const { client } = clientFor({ body: JSON.stringify({ value: { message: 'no code' } }), status: 500 });
    await expect(client.status()).rejects.toMatchObject({ reason: 'invalid-response', status: 500 });
  });

  test('rejects an element reference that is not an element instead of throwing a TypeError', async () => {
    const { client } = clientFor({ body: JSON.stringify({ value: null }) });
    const session = new DesktopSessionClient(client, 's1', {});
    await expect(session.findElement('css selector', 'x')).rejects.toBeInstanceOf(DesktopDriverClientError);
    await expect(session.findElements('css selector', 'x')).rejects.toBeInstanceOf(DesktopDriverClientError);
  });

  test('builds elements from a valid reference', async () => {
    const { client } = clientFor({ body: JSON.stringify({ value: { [webElementIdentifier]: 'e1' } }) });
    const element = await new DesktopSessionClient(client, 's1', {}).findElement('css selector', 'x');
    expect(element.id).toBe('e1');
  });

  test('keeps a reported WebDriver error as it is', async () => {
    const { client } = clientFor({
      body: JSON.stringify({ value: { error: 'no such element', message: 'Missing.', data: { why: 'gone' } } }),
      status: 404,
    });
    const error = await client.status().catch((caught: unknown) => caught);
    expect(error).toBeInstanceOf(WebDriverError);
    expect(error).toMatchObject({ code: 'no such element', status: 404, data: { why: 'gone' } });
  });

  test('turns an error code it does not know into an unknown error that names the code', async () => {
    const { client } = clientFor({ body: JSON.stringify({ value: { error: 'brand new code', message: 'Hm.' } }), status: 500 });
    const error = await client.status().catch((caught: unknown) => caught);
    expect(error).toBeInstanceOf(WebDriverError);
    expect(error).toMatchObject({ code: 'unknown error', status: 500, data: { code: 'brand new code' } });
  });
});

describe('DesktopDriverClient transport', () => {
  test('wraps a failed request in a typed transport error that never carries the URL', async () => {
    const { client } = clientFor(() => Promise.reject(new TypeError('fetch failed')));
    const error = await client.status().catch((caught: unknown) => caught);
    expect(error).toBeInstanceOf(DesktopDriverClientError);
    expect(error).toMatchObject({ reason: 'transport' });
    expect((error as DesktopDriverClientError).status).toBeUndefined();
    expect((error as Error).message).toBe('The Desktop Driver service could not be reached for GET: fetch failed.');
    expect((error as Error).message).not.toContain('127.0.0.1');
    expect((error as Error).cause).toBeInstanceOf(TypeError);
  });

  test('lets a cancelled call surface its own abort', async () => {
    const controller = new AbortController();
    const reason = new Error('Run cancelled.');
    const { client } = clientFor(() => {
      controller.abort(reason);
      return Promise.reject(reason);
    });
    await expect(new DesktopSessionClient(client, 's1', {}).getTree({ signal: controller.signal })).rejects.toBe(reason);
    const aborted = new DOMException('The operation was aborted.', 'AbortError');
    await expect(clientFor(() => Promise.reject(aborted)).client.status()).rejects.toBe(aborted);
  });

  test('forwards a signal from session and element methods', async () => {
    const { calls, client } = clientFor({ body: JSON.stringify({ value: null }) });
    const session = new DesktopSessionClient(client, 's1', {});
    const { signal } = new AbortController();
    await session.releaseActions({ signal });
    await session.selectStory('story', 'run', { signal });
    await new DesktopElementClient(session, 'e1').click({ signal });
    expect(calls.map(({ init }) => init?.signal)).toEqual([signal, signal, signal]);
  });
});
