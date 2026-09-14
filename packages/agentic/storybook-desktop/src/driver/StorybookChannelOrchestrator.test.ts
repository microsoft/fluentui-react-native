import type { DesktopStoryManifest } from '@fluentui-react-native/desktop-driver';

import type { DesktopStorybookDriverManifest } from './driverManifest.js';
import { StorybookChannelOrchestrator } from './StorybookChannelOrchestrator.js';
import type { StorybookChannelServer } from './StorybookChannelOrchestrator.js';

class FakeChannelClient {
  readyState = 1;
  readonly sent: string[] = [];
  private readonly messageListeners: ((data: unknown) => void)[] = [];
  private readonly closeListeners: (() => void)[] = [];

  on(event: 'close', listener: () => void): void;
  on(event: 'message', listener: (data: unknown) => void): void;
  on(event: 'close' | 'message', listener: (() => void) | ((data: unknown) => void)): void {
    if (event === 'close') {
      this.closeListeners.push(listener as () => void);
    } else {
      this.messageListeners.push(listener as (data: unknown) => void);
    }
  }

  send(message: string): void {
    this.sent.push(message);
  }

  receive(type: string, payload: unknown): void {
    const message = JSON.stringify({ type, args: [payload] });
    for (const listener of this.messageListeners) {
      listener(message);
    }
  }

  close(): void {
    for (const listener of this.closeListeners) {
      listener();
    }
  }
}

class FakeChannelServer implements StorybookChannelServer {
  readonly clients = new Set<FakeChannelClient>();
  private readonly connectionListeners: ((client: FakeChannelClient) => void)[] = [];

  on(_event: 'connection', listener: (client: FakeChannelClient) => void): void {
    this.connectionListeners.push(listener);
  }

  connect(client: FakeChannelClient): void {
    this.clients.add(client);
    for (const listener of this.connectionListeners) {
      listener(client);
    }
  }
}

const storyManifest: DesktopStoryManifest = {
  endpoint: 'windows',
  entries: [
    {
      id: 'components-button--default',
      name: 'Default',
      packageName: '@fluentui-react-native/components',
      sourcePath: 'src/components/button/button.stories.tsx',
      tags: ['story'],
      title: 'Components/Button',
    },
  ],
  platformManifestDigest: 'platform-digest',
  portablePlanDigest: 'portable-digest',
  schemaVersion: 1,
};

const driverManifest: DesktopStorybookDriverManifest = {
  application: {
    leaseNonce: 'nonce',
    leasePath: 'application-lease.json',
    windowTitle: 'Agentic Components Storybook',
  },
  appName: 'AgenticStorybook',
  bridgeNonce: 'nonce',
  displayName: 'Agentic Components Storybook',
  driverPort: 4444,
  endpoint: 'windows',
  instanceId: 'instance',
  metroPort: 8081,
  nativeDriver: {
    architecture: 'x64',
    artifactId: 'artifact',
    artifactRoot: 'artifact-root',
    buildFingerprint: 'build',
    buildId: 'build-id',
    compatibilityKey: 'compatibility',
    configuration: 'release',
    endpoints: ['windows', 'win32'],
    executablePath: 'driver.exe',
    features: ['probe'],
    origin: 'cache',
    provider: 'windows',
    schemaVersion: 1,
    signing: { mode: 'none' },
    sourceDigest: 'source',
    wireProtocol: { major: 1, minor: 0 },
  },
  platformManifestDigest: storyManifest.platformManifestDigest,
  portablePlanDigest: storyManifest.portablePlanDigest,
  renderer: 'fabric',
  schemaVersion: 2,
  storyManifest,
  storybookPort: 7007,
  targetId: 'agenticstorybook-windows',
  testIDPrefix: 'agentic-storybook',
};

describe('StorybookChannelOrchestrator', () => {
  const errorOutput = { write: jest.fn() };
  const createOrchestrator = (options: ConstructorParameters<typeof StorybookChannelOrchestrator>[0]) =>
    new StorybookChannelOrchestrator({ ...options, errorOutput });
  beforeEach(() => errorOutput.write.mockClear());

  test('reports the requested story, run and HTTP failure details to the server error output', async () => {
    const channelServer = new FakeChannelServer();
    const client = new FakeChannelClient();
    channelServer.connect(client);
    const orchestrator = createOrchestrator({
      channelServer,
      driverManifest,
      serverUrl: 'https://localhost',
      timeoutMs: 100,
      fetch: jest.fn(async () => new Response('preview module failed to load', { status: 500 })),
    });
    client.receive('furn:desktop:hello', {
      endpoint: 'windows',
      instanceId: 'instance',
      nonce: 'nonce',
      platformManifestDigest: 'platform-digest',
      targetId: 'agenticstorybook-windows',
      version: 1,
    });
    await expect(
      orchestrator.selectStory({ requestId: 'failure', runId: 'pipeline-run', storyId: 'components-button--default' }),
    ).rejects.toThrow('preview module failed to load');
    expect(errorOutput.write).toHaveBeenCalledWith(expect.stringContaining('navigation "components-button--default" (run pipeline-run)'));
    expect(errorOutput.write).toHaveBeenCalledWith(expect.stringContaining('status 500: preview module failed to load'));
  });

  test('reset navigates from a different page, including after manual navigation away from the last prepared story', async () => {
    const channelServer = new FakeChannelServer();
    const client = new FakeChannelClient();
    channelServer.connect(client);
    let page = 'unrelated--story';
    let generation = 0;
    const fetch = jest.fn(async (url: Parameters<typeof globalThis.fetch>[0]) => {
      page = decodeURIComponent(String(url).split('/').at(-1)!);
      const request = JSON.parse(client.sent.at(-1)!).args[0];
      client.receive('furn:desktop:story-ready', {
        ...request,
        storyId: page,
        previewGeneration: ++generation,
        portablePlanDigest: 'portable-digest',
      });
      return new Response('{}');
    });
    const orchestrator = createOrchestrator({
      channelServer,
      driverManifest,
      fetch,
      serverUrl: 'https://localhost',
      timeoutMs: 100,
    });
    client.receive('furn:desktop:hello', {
      endpoint: 'windows',
      instanceId: 'instance',
      nonce: 'nonce',
      platformManifestDigest: 'platform-digest',
      targetId: 'agenticstorybook-windows',
      version: 1,
    });

    await expect(
      orchestrator.resetStory({ requestId: 'first', runId: 'first', storyId: 'components-button--default' }),
    ).resolves.toMatchObject({ storyId: 'components-button--default', previewGeneration: 1 });
    expect(page).toBe('components-button--default');
    page = 'manually-selected--story';
    await expect(
      orchestrator.resetStory({ requestId: 'second', runId: 'second', storyId: 'components-button--default' }),
    ).resolves.toMatchObject({ storyId: 'components-button--default', previewGeneration: 2 });
    expect(page).toBe('components-button--default');
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  test('bounds navigation even when the runtime is ready but the HTTP selection request never completes', async () => {
    const channelServer = new FakeChannelServer();
    const client = new FakeChannelClient();
    channelServer.connect(client);
    let signal: AbortSignal | null | undefined;
    const fetch = jest.fn((_url: Parameters<typeof globalThis.fetch>[0], options?: RequestInit) => {
      signal = options?.signal;
      const request = JSON.parse(client.sent.at(-1)!).args[0];
      client.receive('furn:desktop:story-ready', {
        ...request,
        portablePlanDigest: 'portable-digest',
        previewGeneration: 1,
      });
      return new Promise<Response>(() => {});
    });
    const orchestrator = createOrchestrator({
      channelServer,
      driverManifest,
      fetch,
      serverUrl: 'https://localhost',
      timeoutMs: 10,
    });
    client.receive('furn:desktop:hello', {
      endpoint: 'windows',
      instanceId: 'instance',
      nonce: 'nonce',
      platformManifestDigest: 'platform-digest',
      targetId: 'agenticstorybook-windows',
      version: 1,
    });
    await expect(orchestrator.selectStory({ requestId: 'request', runId: 'run', storyId: 'components-button--default' })).rejects.toThrow(
      'Timed out navigating',
    );
    expect(signal?.aborted).toBe(true);
  });

  test('authenticates the runtime and correlates selection readiness', async () => {
    const channelServer = new FakeChannelServer();
    const client = new FakeChannelClient();
    channelServer.connect(client);
    const orchestrator = createOrchestrator({
      channelServer,
      driverManifest,
      fetch: jest.fn(async () => new Response('{}', { status: 408 })),
      // eslint-disable-next-line @microsoft/sdl/no-insecure-url -- test-only loopback Storybook URL
      serverUrl: 'http://127.0.0.1:7007',
      timeoutMs: 1000,
    });
    client.receive('furn:desktop:hello', {
      endpoint: 'windows',
      instanceId: 'instance',
      nonce: 'nonce',
      platformManifestDigest: 'platform-digest',
      targetId: 'agenticstorybook-windows',
      version: 1,
    });
    expect(JSON.parse(client.sent[0])).toEqual({ type: 'furn:desktop:request-hello', args: [] });
    client.sent.length = 0;

    const selection = orchestrator.selectStory({
      requestId: 'request-1',
      runId: 'run-1',
      storyId: 'components-button--default',
    });
    await Promise.resolve();
    expect(JSON.parse(client.sent[0])).toEqual({
      type: 'furn:desktop:prepare-story',
      args: [{ requestId: 'request-1', runId: 'run-1', storyId: 'components-button--default' }],
    });
    client.receive('furn:desktop:story-ready', {
      portablePlanDigest: 'portable-digest',
      previewGeneration: 1,
      requestId: 'request-1',
      runId: 'run-1',
      storyId: 'components-button--default',
    });

    await expect(selection).resolves.toEqual({
      previewGeneration: 1,
      runId: 'run-1',
      storyId: 'components-button--default',
    });
    await expect(orchestrator.getCurrentStory()).resolves.toMatchObject({ runId: 'run-1' });
  });

  test('observes render errors while the selection request is still pending', async () => {
    const channelServer = new FakeChannelServer();
    const client = new FakeChannelClient();
    const unauthenticatedClient = new FakeChannelClient();
    channelServer.connect(client);
    channelServer.connect(unauthenticatedClient);
    let finishFetch: ((response: Response) => void) | undefined;
    const fetch = jest.fn(() => new Promise<Response>((resolve) => (finishFetch = resolve)));
    const orchestrator = createOrchestrator({
      channelServer,
      driverManifest,
      fetch,
      // eslint-disable-next-line @microsoft/sdl/no-insecure-url -- test-only loopback Storybook URL
      serverUrl: 'http://127.0.0.1:7007',
      timeoutMs: 1000,
    });
    client.receive('furn:desktop:hello', {
      endpoint: 'windows',
      instanceId: 'instance',
      nonce: 'nonce',
      platformManifestDigest: 'platform-digest',
      targetId: 'agenticstorybook-windows',
      version: 1,
    });

    const selection = orchestrator.selectStory({
      requestId: 'request-error',
      runId: 'run-error',
      storyId: 'components-button--default',
    });
    await Promise.resolve();
    let settled = false;
    void selection.then(
      () => {
        settled = true;
      },
      () => {
        settled = true;
      },
    );
    const errorPayload = {
      message: 'render failed',
      requestId: 'request-error',
      runId: 'run-error',
      storyId: 'components-button--default',
    };
    unauthenticatedClient.receive('furn:desktop:story-error', errorPayload);
    await Promise.resolve();
    expect(settled).toBe(false);
    client.receive('furn:desktop:story-error', errorPayload);
    await expect(selection).rejects.toThrow('render failed');
    finishFetch?.(new Response('{}'));
  });

  test('rejects stories outside the exact platform manifest', async () => {
    const orchestrator = createOrchestrator({
      channelServer: new FakeChannelServer(),
      driverManifest,
      fetch: jest.fn(),
      // eslint-disable-next-line @microsoft/sdl/no-insecure-url -- test-only loopback Storybook URL
      serverUrl: 'http://127.0.0.1:7007',
      timeoutMs: 10,
    });

    await expect(orchestrator.selectStory({ requestId: 'request', runId: 'run', storyId: 'missing--story' })).rejects.toThrow(
      'not present',
    );
  });

  test('cancels reset readiness when the authenticated bridge closes', async () => {
    const channelServer = new FakeChannelServer();
    const client = new FakeChannelClient();
    channelServer.connect(client);
    const orchestrator = createOrchestrator({
      channelServer,
      driverManifest,
      fetch: jest.fn(),
      // eslint-disable-next-line @microsoft/sdl/no-insecure-url -- test-only loopback Storybook URL
      serverUrl: 'http://127.0.0.1:7007',
      timeoutMs: 10,
    });
    client.receive('furn:desktop:hello', {
      endpoint: 'windows',
      instanceId: 'instance',
      nonce: 'nonce',
      platformManifestDigest: 'platform-digest',
      targetId: 'agenticstorybook-windows',
      version: 1,
    });
    client.readyState = 3;

    await expect(
      orchestrator.resetStory({
        requestId: 'request-reset',
        runId: 'run-reset',
        storyId: 'components-button--default',
      }),
    ).rejects.toThrow('not connected');
    await new Promise((resolve) => setTimeout(resolve, 20));
  });
});
