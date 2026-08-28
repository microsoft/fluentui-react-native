import { FakeDesktopHost } from '../hosts/fake/FakeDesktopHost.js';
import type { FakeDesktopHostOptions } from '../hosts/fake/FakeDesktopHost.js';
import type { DesktopTarget } from '../host/types.js';
import { createDesktopDriverServer } from '../server/createDesktopDriverServer.js';
import type { DesktopDriverServer } from '../server/createDesktopDriverServer.js';
import type { StoryOrchestrator } from '../storybook.js';

export type DesktopDriverTestHarness = {
  host: FakeDesktopHost;
  server: DesktopDriverServer;
  target: DesktopTarget;
  close(): Promise<void>;
};

export async function createDesktopDriverTestHarness(
  options: FakeDesktopHostOptions = {},
  storyOrchestrator?: StoryOrchestrator,
): Promise<DesktopDriverTestHarness> {
  const host = new FakeDesktopHost(options);
  const endpoint = options.endpoint ?? 'windows';
  const target: DesktopTarget = {
    endpoint,
    host,
    id: `fake-${endpoint}`,
    platformName: options.platformName ?? (endpoint === 'macos' ? 'macos' : 'windows'),
    renderer: endpoint === 'win32' ? 'paper' : 'fabric',
    ...(storyOrchestrator ? { storyRootTestId: 'story-root' } : {}),
    storyOrchestrator,
  };
  const server = await createDesktopDriverServer({ targets: [target] });
  return {
    host,
    server,
    target,
    close: () => server.close(),
  };
}
