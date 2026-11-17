import { randomUUID } from 'node:crypto';
import { setTimeout as delay } from 'node:timers/promises';

import { createDesktopDriverClient } from '@fluentui-react-native/desktop-driver/client';

import { preparePhysicalWindow, type readMacOSVisibleScreenFrames } from './physicalWindow.js';

export async function connectStoryTraversal(options: {
  url: string;
  targetId: string;
  platform: 'macos' | 'windows' | 'win32';
  signal: AbortSignal;
  fetch?: typeof globalThis.fetch;
  input?: 'accessible' | 'physical';
  visibleScreenFrames?: typeof readMacOSVisibleScreenFrames;
}) {
  const client = createDesktopDriverClient({
    url: options.url,
    fetch: (input, init) =>
      (options.fetch ?? globalThis.fetch)(input, {
        ...init,
        signal: AbortSignal.any([options.signal, ...(init?.signal ? [init.signal] : [])]),
      }),
  });
  const session = await client.newSession({
    alwaysMatch: {
      platformName: options.platform === 'macos' ? 'macos' : 'windows',
      'furn:target': options.targetId,
      'furn:launchMode': 'attach',
    },
  });
  // Cleanup must remain possible after setup or traversal is cancelled.
  const close = () =>
    createDesktopDriverClient({ url: options.url, fetch: options.fetch }).request<null>(
      'DELETE',
      `/session/${session.id}`,
      undefined,
      AbortSignal.timeout(30_000),
    );
  try {
    if (options.platform === 'macos' && options.input === 'physical') {
      await preparePhysicalWindow(session, AbortSignal.any([options.signal, AbortSignal.timeout(10_000)]), options.visibleScreenFrames);
    }
  } catch (error) {
    try {
      await close();
    } catch (cleanup) {
      throw new AggregateError([error, cleanup], 'Physical window setup and session cleanup failed.');
    }
    throw error;
  }
  return {
    close,
    assertNativeUi: async (testIds: readonly string[], timeoutMs: number) => {
      for (const testId of testIds) {
        const signal = AbortSignal.any([options.signal, AbortSignal.timeout(timeoutMs)]);
        while (true) {
          signal.throwIfAborted();
          try {
            await session.command('POST', '/element', { using: 'accessibility id', value: testId }, signal);
            break;
          } catch (error) {
            if (!error || typeof error !== 'object' || !('code' in error) || error.code !== 'no such element') throw error;
            await delay(250, undefined, { signal });
          }
        }
      }
    },
    assertRunning: async () => {
      const windows = await session.command<string[]>('GET', '/window/handles', undefined, options.signal);
      if (!windows.length) throw new Error('The native smoke application has no live windows.');
    },
    select: async (storyId: string, timeoutMs: number) => {
      const signal = AbortSignal.any([options.signal, AbortSignal.timeout(timeoutMs)]);
      do {
        signal.throwIfAborted();
        try {
          await session.command('POST', '/furn/story', { storyId, requestId: randomUUID(), runId: randomUUID() }, signal);
          return;
        } catch (error) {
          // Only initial bridge absence proves that nothing was dispatched. Never retry uncertain navigation.
          if (
            !error ||
            typeof error !== 'object' ||
            !('data' in error) ||
            !error.data ||
            typeof error.data !== 'object' ||
            !('reason' in error.data) ||
            error.data.reason !== 'bridge-unavailable'
          )
            throw error;
          await delay(500, undefined, { signal });
        }
      } while (!signal.aborted);
      signal.throwIfAborted();
    },
  };
}
