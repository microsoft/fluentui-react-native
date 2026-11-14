import type { Rect } from '@fluentui-react-native/desktop-driver';

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

function windowSetup(
  options: {
    platform?: 'macos' | 'windows' | 'win32';
    input?: 'accessible' | 'physical';
    current?: Rect;
    screens?: readonly Rect[];
    reported?: Rect;
  } = {},
) {
  const calls: { method?: string; url: string; body?: unknown }[] = [];
  let rect = options.current ?? { x: 600, y: 600, width: 480, height: 302 };
  const visibleScreenFrames = jest.fn(async () => options.screens ?? [{ x: 0, y: 40, width: 1280, height: 920 }]);
  const fetch: typeof globalThis.fetch = async (input, init) => {
    const url = input.toString();
    const body = init?.body ? JSON.parse(String(init.body)) : undefined;
    calls.push({ method: init?.method, url, body });
    if (url.endsWith('/session')) return new Response(JSON.stringify({ value: { sessionId: 'session', capabilities: {} } }));
    if (init?.method === 'DELETE') {
      expect(init.signal?.aborted).toBe(false);
      return new Response(JSON.stringify({ value: null }));
    }
    if (url.endsWith('/window/rect')) {
      if (init?.method === 'POST') rect = options.reported ?? body;
      return new Response(JSON.stringify({ value: rect }));
    }
    return new Response(JSON.stringify({ value: { storyId: 'accordion--keyboard' } }));
  };
  const settings = {
    url: 'https://driver',
    targetId: 'target',
    platform: options.platform ?? 'macos',
    input: options.input,
    fetch,
    signal: new AbortController().signal,
    visibleScreenFrames,
  };
  return { calls, visibleScreenFrames, connect: () => connectStoryTraversal(settings) };
}

test('physical macOS traversal centers a visible 1024x768 window before selecting a story', async () => {
  const { calls, connect, visibleScreenFrames } = windowSetup({ input: 'physical' });
  const traversal = await connect();
  try {
    await traversal.select('accordion--keyboard', 1000);
    expect(calls.filter(({ url, method }) => url.endsWith('/window/rect') && method === 'POST')).toEqual([
      {
        method: 'POST',
        url: 'https://driver/session/session/window/rect',
        body: { x: 128, y: 116, width: 1024, height: 768 },
      },
    ]);
    expect(calls.findIndex(({ url }) => url.endsWith('/window/rect'))).toBeLessThan(
      calls.findIndex(({ url }) => url.endsWith('/furn/story')),
    );
    expect(visibleScreenFrames).toHaveBeenCalledTimes(1);
  } finally {
    await traversal.close();
  }
});

test('clamps the physical window to a hosted display visible frame', async () => {
  const { calls, connect } = windowSetup({
    input: 'physical',
    screens: [{ x: 0, y: 25, width: 1024, height: 743 }],
  });
  const traversal = await connect();
  await traversal.close();
  expect(calls.find(({ url, method }) => url.endsWith('/window/rect') && method === 'POST')?.body).toEqual({
    x: 1,
    y: 26,
    width: 1022,
    height: 741,
  });
});

test('clamps to Dock-reduced visible bounds and keeps the larger requested width', async () => {
  const { calls, connect } = windowSetup({
    input: 'physical',
    screens: [{ x: 0, y: 24, width: 1440, height: 700 }],
  });
  const traversal = await connect();
  await traversal.close();
  expect(calls.find(({ url, method }) => url.endsWith('/window/rect') && method === 'POST')?.body).toEqual({
    x: 208,
    y: 25,
    width: 1024,
    height: 698,
  });
});

test.each([
  { platform: 'macos' as const, input: undefined },
  { platform: 'macos' as const, input: 'accessible' as const },
  { platform: 'windows' as const, input: 'physical' as const },
  { platform: 'win32' as const, input: 'physical' as const },
])('does not resize $platform input=$input', async (options) => {
  const { calls, connect, visibleScreenFrames } = windowSetup(options);
  const traversal = await connect();
  await traversal.close();
  expect(calls.some(({ url }) => url.endsWith('/window/rect'))).toBe(false);
  expect(visibleScreenFrames).not.toHaveBeenCalled();
});

test('centers within negative-origin visible bounds and can use a fitting secondary screen', async () => {
  const { calls, connect } = windowSetup({
    input: 'physical',
    current: { x: 100, y: 900, width: 480, height: 302 },
    screens: [
      { x: 0, y: 24, width: 800, height: 550 },
      { x: -1920, y: 40, width: 1920, height: 1040 },
    ],
  });
  const traversal = await connect();
  await traversal.close();
  expect(calls.find(({ url, method }) => url.endsWith('/window/rect') && method === 'POST')?.body).toEqual({
    x: -1472,
    y: 176,
    width: 1024,
    height: 768,
  });
});

test('chooses the screen with the largest clamped physical window before considering overlap', async () => {
  const { calls, connect } = windowSetup({
    input: 'physical',
    current: { x: 600, y: 600, width: 480, height: 302 },
    screens: [
      { x: 0, y: 24, width: 1024, height: 700 },
      { x: 1200, y: 30, width: 1600, height: 900 },
    ],
  });
  const traversal = await connect();
  await traversal.close();
  expect(calls.find(({ url, method }) => url.endsWith('/window/rect') && method === 'POST')?.body).toEqual({
    x: 1488,
    y: 96,
    width: 1024,
    height: 768,
  });
});

test('keeps an off-screen persisted window away from the visible screen edges', async () => {
  const { calls, connect } = windowSetup({
    input: 'physical',
    current: { x: 1600, y: 900, width: 480, height: 302 },
    screens: [{ x: 0, y: 33, width: 1728, height: 999 }],
  });
  const traversal = await connect();
  await traversal.close();
  expect(calls.find(({ url, method }) => url.endsWith('/window/rect') && method === 'POST')?.body).toEqual({
    x: 352,
    y: 149,
    width: 1024,
    height: 768,
  });
});

test('clamps a smaller display while keeping the window inside its visible bounds', async () => {
  const { calls, connect } = windowSetup({ input: 'physical', screens: [{ x: 0, y: 24, width: 800, height: 550 }] });
  const traversal = await connect();
  await traversal.close();
  expect(calls.find(({ url, method }) => url.endsWith('/window/rect') && method === 'POST')?.body).toEqual({
    x: 1,
    y: 25,
    width: 798,
    height: 548,
  });
});

test('reports the target and observed frames when no positive physical window fits', async () => {
  const screens = [{ x: 0, y: 24, width: 1, height: 1 }];
  const { calls, connect } = windowSetup({ input: 'physical', screens });
  await expect(connect()).rejects.toThrow(/1024x768.*visible frames.*1.*1/i);
  expect(calls.some(({ url, method }) => url.endsWith('/window/rect') && method === 'POST')).toBe(false);
  expect(calls.at(-1)).toMatchObject({ method: 'DELETE', url: 'https://driver/session/session' });
});

test('reports invalid visible frames instead of ignoring them', async () => {
  const screens = [{ x: 0, y: 24, width: 0, height: 550 }];
  const { connect } = windowSetup({ input: 'physical', screens });
  await expect(connect()).rejects.toThrow(/invalid window bounds.*visible frames.*0.*550/i);
});

test('does not accept a host that leaves the window smaller than requested', async () => {
  const screens = [{ x: 0, y: 24, width: 800, height: 550 }];
  const reported = { x: 1, y: 25, width: 798, height: 547 };
  const { calls, connect } = windowSetup({ input: 'physical', screens, reported });
  await expect(connect()).rejects.toThrow(/requested.*798.*548.*received.*798.*547.*visible frames/i);
  expect(calls.filter(({ url, method }) => url.endsWith('/window/rect') && method === 'POST')).toHaveLength(1);
  expect(calls.at(-1)).toMatchObject({ method: 'DELETE', url: 'https://driver/session/session' });
});
