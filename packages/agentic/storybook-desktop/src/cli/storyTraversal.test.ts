import { connectStoryTraversal } from './storyTraversal.js';

function setup(reason?: string) {
  const calls: { method?: string; url: string; body?: unknown }[] = [];
  let failures = reason === undefined ? 0 : 1;
  const fetch: typeof globalThis.fetch = jest.fn(async (input, init) => {
    const url = input.toString();
    calls.push({ method: init?.method, url, body: init?.body ? JSON.parse(String(init.body)) : undefined });
    if (url.endsWith('/session')) return new Response(JSON.stringify({ value: { sessionId: 'session', capabilities: {} } }));
    if (init?.method === 'DELETE') {
      expect(init.signal?.aborted).toBe(false);
      return new Response(JSON.stringify({ value: null }));
    }
    if (failures-- > 0) {
      return new Response(JSON.stringify({ value: { error: 'unknown error', message: 'Not ready', data: { reason } } }), { status: 500 });
    }
    return new Response(JSON.stringify({ value: { storyId: 'button--default' } }));
  });
  const controller = new AbortController();
  return {
    calls,
    controller,
    connect: () =>
      connectStoryTraversal({ url: 'https://driver', platform: 'macos', targetId: 'target', fetch, signal: controller.signal }),
  };
}

test('manifest-backed traversal owns one driver session and deletes it even after cancellation', async () => {
  const { calls, controller, connect } = setup();
  const traversal = await connect();
  await traversal.select('button--default', 1000);
  controller.abort();
  await traversal.close();
  expect(calls.map(({ method, url }) => [method, url])).toEqual([
    ['POST', 'https://driver/session'],
    ['POST', 'https://driver/session/session/furn/story'],
    ['DELETE', 'https://driver/session/session'],
  ]);
  expect(calls[0].body).toMatchObject({ capabilities: { alwaysMatch: { 'furn:target': 'target', 'furn:launchMode': 'attach' } } });
  expect(calls[1].body).toMatchObject({ storyId: 'button--default', requestId: expect.any(String), runId: expect.any(String) });
});

test('initial bridge absence can be retried, but uncertain or relaunch-required navigation cannot', async () => {
  for (const reason of ['bridge-unavailable', 'story-not-ready', 'relaunch-required']) {
    const { connect, calls } = setup(reason);
    const traversal = await connect();
    try {
      if (reason === 'bridge-unavailable') {
        await expect(traversal.select('button--default', 2000)).resolves.toBeUndefined();
        expect(calls.filter(({ url }) => url.endsWith('/furn/story'))).toHaveLength(2);
      } else {
        await expect(traversal.select('button--default', 2000)).rejects.toMatchObject({ data: { reason } });
        expect(calls.filter(({ url }) => url.endsWith('/furn/story'))).toHaveLength(1);
      }
    } finally {
      await traversal.close();
    }
  }
});
