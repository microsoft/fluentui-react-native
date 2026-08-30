import { FakeDesktopHost } from '../hosts/fake/FakeDesktopHost.js';
import type { FakeDesktopHostOptions } from '../hosts/fake/FakeDesktopHost.js';
import type { DesktopTarget } from '../host/types.js';
import { createDesktopDriverServer } from '../server/createDesktopDriverServer.js';
import type { DesktopDriverServer } from '../server/createDesktopDriverServer.js';
import type { StoryOrchestrator } from '../storybook.js';
import type { DesktopStoryManifest } from '../storybook.js';
import { FakeStoryOrchestrator } from './FakeStoryOrchestrator.js';

export type DesktopDriverTestHarness = {
  host: FakeDesktopHost;
  storyOrchestrator?: FakeStoryOrchestrator;
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

export async function createDesktopDriverStoryHarness(
  manifest: DesktopStoryManifest,
  options: FakeDesktopHostOptions = {},
): Promise<DesktopDriverTestHarness> {
  const host = new FakeDesktopHost({ ...options, storyRootTestId: 'story-root' });
  const storyOrchestrator = new FakeStoryOrchestrator(manifest, host);
  const endpoint = options.endpoint ?? manifest.endpoint;
  const target: DesktopTarget = {
    endpoint,
    host,
    id: `fake-${endpoint}`,
    platformName: options.platformName ?? (endpoint === 'macos' ? 'macos' : 'windows'),
    renderer: endpoint === 'win32' ? 'paper' : 'fabric',
    storyOrchestrator,
    storyRootTestId: 'story-root',
  };
  const server = await createDesktopDriverServer({ targets: [target] });
  return {
    host,
    server,
    storyOrchestrator,
    target,
    close: () => server.close(),
  };
}
