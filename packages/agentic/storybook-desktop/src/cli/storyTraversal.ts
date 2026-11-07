import { randomUUID } from 'node:crypto';
import { setTimeout as delay } from 'node:timers/promises';

import { createDesktopDriverClient } from '@fluentui-react-native/desktop-driver/client';

export async function connectStoryTraversal(options: {
  url: string;
  targetId: string;
  platform: 'macos' | 'windows' | 'win32';
  signal: AbortSignal;
  fetch?: typeof globalThis.fetch;
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
  return {
    // Cleanup must remain possible after the traversal's signal is cancelled.
    close: () =>
      createDesktopDriverClient({ url: options.url, fetch: options.fetch }).request<null>(
        'DELETE',
        `/session/${session.id}`,
        undefined,
        AbortSignal.timeout(30_000),
      ),
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
