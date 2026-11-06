import { EventEmitter } from 'node:events';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { runInNewContext } from 'node:vm';

import { transformSync } from '@babel/core';
import { matchesStoryMarker, type StorySelectionRequest } from '@fluentui-react-native/desktop-driver/storybook';

import type { DesktopStorybookDriverManifest } from './driverManifest.js';
import { StorybookChannelOrchestrator } from './StorybookChannelOrchestrator.js';

class Client extends EventEmitter {
  readyState = 1;
  sent: { type: string; args: Record<string, unknown>[] }[] = [];
  send(message: string): void {
    this.sent.push(JSON.parse(message));
  }
  receive(type: string, payload?: unknown): void {
    this.emit('message', JSON.stringify({ type, args: [payload] }));
  }
  get epoch(): string {
    return this.sent[0].args[0].connectionEpoch as string;
  }
  authenticate(): void {
    this.receive('furn:desktop:hello', {
      connectionEpoch: this.epoch,
      endpoint: manifest.endpoint,
      instanceId: manifest.instanceId,
      nonce: manifest.bridgeNonce,
      platformManifestDigest: manifest.platformManifestDigest,
      targetId: manifest.targetId,
      version: 2,
    });
    this.receive('storyRendered', request.storyId);
  }
  ready(overrides: Record<string, unknown> = {}): void {
    this.receive('furn:desktop:story-ready', {
      ...request,
      connectionEpoch: this.epoch,
      markerVersion: 1,
      portablePlanDigest: manifest.portablePlanDigest,
      previewGeneration: 1,
      ...overrides,
    });
  }
}

const request: StorySelectionRequest = { requestId: 'request', runId: 'run', storyId: 'button--default' };
const manifest: DesktopStorybookDriverManifest = {
  application: { leaseNonce: 'lease', leasePath: 'application-lease.json', windowTitle: 'Storybook' },
  appName: 'Storybook',
  bridgeNonce: 'nonce',
  displayName: 'Storybook',
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
  platformManifestDigest: 'platform',
  portablePlanDigest: 'portable',
  renderer: 'fabric',
  schemaVersion: 2,
  storyManifest: {
    endpoint: 'windows',
    entries: [
      { id: request.storyId, name: 'Default', packageName: 'components', sourcePath: 'button.stories.tsx', tags: [], title: 'Button' },
    ],
    platformManifestDigest: 'platform',
    portablePlanDigest: 'portable',
    schemaVersion: 1,
  },
  storybookPort: 7007,
  targetId: 'target',
  testIDPrefix: 'storybook',
};

function setup(fetch: typeof globalThis.fetch = jest.fn(async () => new Response('{}')), timeoutMs = 100) {
  const server = Object.assign(new EventEmitter(), { clients: new Set<Client>() });
  const client = new Client();
  server.clients.add(client);
  const errorOutput = { write: jest.fn() };
  const orchestrator = new StorybookChannelOrchestrator({
    channelServer: server,
    driverManifest: manifest,
    errorOutput,
    fetch,
    serverUrl: 'https://localhost',
    timeoutMs,
  });
  return { client, errorOutput, fetch, orchestrator, server };
}

describe('StorybookChannelOrchestrator epochs and lifetime', () => {
  test('absent and hello-only bridges reject before dispatch with no effect', async () => {
    const { client, fetch, orchestrator } = setup();
    await expect(orchestrator.selectStory(request)).rejects.toMatchObject({
      data: { endpoint: 'windows', reason: 'bridge-unavailable', renderer: 'fabric' },
      effect: 'none',
    });
    client.receive('furn:desktop:hello', {
      connectionEpoch: client.epoch,
      endpoint: manifest.endpoint,
      instanceId: manifest.instanceId,
      nonce: manifest.bridgeNonce,
      platformManifestDigest: manifest.platformManifestDigest,
      targetId: manifest.targetId,
      version: 2,
    });
    await expect(orchestrator.selectStory(request)).rejects.toHaveProperty('effect', 'none');
    expect(fetch).not.toHaveBeenCalled();
    client.receive('storyRendered', request.storyId);
    const selection = orchestrator.selectStory(request);
    client.ready();
    await expect(selection).resolves.toMatchObject({ connectionEpoch: client.epoch, markerVersion: 1, ...request });
  });

  test('requires the nonce and current epoch on the same initialized socket', async () => {
    const { client, fetch, orchestrator, server } = setup();
    const other = new Client();
    server.emit('connection', other);
    client.receive('storyRendered', request.storyId);
    other.authenticate();
    client.receive('furn:desktop:hello', { version: 2, connectionEpoch: client.epoch, nonce: 'wrong' });
    const selection = orchestrator.selectStory(request);
    client.ready();
    other.ready({ connectionEpoch: client.epoch });
    other.ready();
    await expect(selection).resolves.toMatchObject({ connectionEpoch: other.epoch });
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(client.sent).toHaveLength(1);
  });

  test('ignores old ready and errors, and commits current context only after HTTP completion', async () => {
    let finish!: (response: Response) => void;
    const { client, orchestrator } = setup(
      jest.fn(
        () =>
          new Promise((resolve) => {
            finish = resolve;
          }),
      ),
    );
    client.authenticate();
    const selection = orchestrator.selectStory(request);
    client.ready({ connectionEpoch: 'old-epoch' });
    client.receive('furn:desktop:story-error', { ...request, connectionEpoch: 'old-epoch' });
    client.ready({ requestId: 'old-request' });
    client.ready({ markerVersion: undefined });
    await expect(orchestrator.getCurrentStory()).resolves.toBeNull();
    client.ready();
    await expect(orchestrator.getCurrentStory()).resolves.toBeNull();
    finish(new Response('{}'));
    await expect(selection).resolves.toMatchObject({ runId: request.runId });
    const second = orchestrator.resetStory({ ...request, requestId: 'next', runId: 'next' });
    client.ready();
    await expect(orchestrator.getCurrentStory()).resolves.toBeNull();
    client.ready({ requestId: 'next', runId: 'next', previewGeneration: 2 });
    finish(new Response('{}', { status: 408 }));
    await expect(second).resolves.toMatchObject({ previewGeneration: 2, requestId: 'next' });
  });

  test('disconnect promptly fails pending navigation, aborts HTTP and rejects the closed socket', async () => {
    let signal: AbortSignal | undefined;
    const { client, orchestrator, server } = setup(
      jest.fn((_url, init) => {
        signal = init?.signal ?? undefined;
        return new Promise<Response>(() => {});
      }),
      10_000,
    );
    client.authenticate();
    const selection = orchestrator.selectStory(request);
    client.ready();
    client.readyState = 3;
    client.emit('close');
    await expect(selection).rejects.toMatchObject({ effect: 'unknown', message: expect.stringContaining('disconnected') });
    expect(signal?.aborted).toBe(true);
    await expect(orchestrator.getCurrentStory()).resolves.toBeNull();
    await expect(orchestrator.selectStory(request)).rejects.toMatchObject({
      data: { reason: 'relaunch-required', endpoint: 'windows', renderer: 'fabric' },
      effect: 'none',
    });
    const replacement = new Client();
    server.emit('connection', replacement);
    replacement.authenticate();
    expect(replacement.epoch).not.toBe(client.epoch);
    // The old socket can neither authenticate again nor replace the new epoch.
    client.authenticate();
    client.ready();
    await expect(orchestrator.getCurrentStory()).resolves.toBeNull();
  });

  test('cancellation before dispatch has no effect; after dispatch fences the epoch until relaunch', async () => {
    const controller = new AbortController();
    const { client, fetch, orchestrator } = setup(
      jest.fn(() => new Promise<Response>(() => {})),
      10_000,
    );
    client.authenticate();
    controller.abort();
    await expect(orchestrator.selectStory(request, { lifetimeId: 'session', signal: controller.signal })).rejects.toHaveProperty(
      'effect',
      'none',
    );
    expect(fetch).not.toHaveBeenCalled();
    const live = new AbortController();
    const selection = orchestrator.selectStory(request, { lifetimeId: 'session', signal: live.signal });
    live.abort();
    await expect(selection).rejects.toHaveProperty('effect', 'unknown');
    expect(client.sent.at(-1)).toMatchObject({ type: 'furn:desktop:cancel-story' });
    client.authenticate();
    client.ready();
    await expect(orchestrator.selectStory({ ...request, requestId: 'new' })).rejects.toMatchObject({
      data: { reason: 'relaunch-required' },
      effect: 'none',
    });
  });

  test('a ready event cannot disable the local HTTP deadline', async () => {
    const { client, orchestrator } = setup(
      jest.fn(() => new Promise<Response>(() => {})),
      10,
    );
    client.authenticate();
    const selection = orchestrator.selectStory(request);
    client.ready();
    await expect(selection).rejects.toMatchObject({ effect: 'unknown', message: expect.stringContaining('Timed out') });
  });

  test('render errors stay correlated and HTTP errors retain diagnostic detail', async () => {
    const { client, orchestrator } = setup(jest.fn(() => new Promise<Response>(() => {})));
    client.authenticate();
    const selection = orchestrator.selectStory(request);
    client.receive('furn:desktop:story-error', { ...request, connectionEpoch: client.epoch });
    await expect(selection).rejects.toThrow('failed to render');
    const failed = setup(jest.fn(async () => new Response('module failed to load', { status: 500 })));
    failed.client.authenticate();
    await expect(failed.orchestrator.selectStory(request)).rejects.toThrow('status 500: module failed to load');
    expect(failed.errorOutput.write).toHaveBeenCalledWith(expect.stringContaining('module failed to load'));
  });

  test('rejects unknown stories without dispatch', async () => {
    const { fetch, orchestrator } = setup();
    await expect(orchestrator.selectStory({ ...request, storyId: 'missing' })).rejects.toHaveProperty('effect', 'none');
    expect(fetch).not.toHaveBeenCalled();
  });

  test('malformed messages cannot crash the bridge; duplicate IDs cannot accept an earlier ready result', async () => {
    const { client, orchestrator } = setup();
    for (const raw of ['null', '[]', '{}', '{"args":null}', '{"args":true}', '{']) client.emit('message', raw);
    client.authenticate();
    const selection = orchestrator.selectStory(request);
    client.ready();
    await selection;
    await expect(orchestrator.selectStory(request)).rejects.toHaveProperty('effect', 'none');
    client.receive('furn:desktop:story-error', { ...request, connectionEpoch: client.epoch });
    await expect(orchestrator.getCurrentStory()).resolves.toBeNull();
    await expect(orchestrator.selectStory({ ...request, requestId: 'new' })).rejects.toMatchObject({
      data: { reason: 'relaunch-required' },
      effect: 'none',
    });
  });

  test('a failing cancellation send cannot replace unknown-effect failure evidence', async () => {
    const { client, errorOutput, orchestrator } = setup(jest.fn(() => new Promise<Response>(() => {})));
    client.authenticate();
    const controller = new AbortController();
    const selection = orchestrator.selectStory(request, { lifetimeId: 'session', signal: controller.signal });
    client.send = () => {
      throw new Error('Socket closed during cancel.');
    };
    controller.abort();
    await expect(selection).rejects.toHaveProperty('effect', 'unknown');
    expect(errorOutput.write).toHaveBeenCalledWith(expect.stringContaining('Socket closed during cancel.'));
  });

  test('actual data-only runtime marker producer conforms to the driver verifier', () => {
    const filename = resolve(__dirname, '../../../storybook-desktop-runtime/src/storyMarker.ts');
    const source = readFileSync(filename, 'utf8');
    const code = transformSync(source, {
      babelrc: false,
      configFile: false,
      filename,
      presets: ['module:@react-native/babel-preset'],
    })?.code;
    if (!code) throw new Error('Marker source did not compile.');
    const exports: { createStoryMarker?: (selection: Record<string, unknown>) => Record<string, unknown> } = {};
    // No require, Node, React, or harness globals are available to the on-device producer.
    runInNewContext(code, { exports });
    const expected = { ...request, connectionEpoch: 'epoch', markerVersion: 1 as const, previewGeneration: 3 };
    const produced = exports.createStoryMarker!(expected);
    expect(matchesStoryMarker(JSON.stringify(produced), expected)).toBe(true);
    for (const patch of [
      { connectionEpoch: 'old' },
      { requestId: 'old' },
      { runId: 'old' },
      { storyId: 'old' },
      { previewGeneration: 2 },
      { markerVersion: 2 },
    ])
      expect(matchesStoryMarker(JSON.stringify({ ...produced, ...patch }), expected)).toBe(false);
    expect(matchesStoryMarker(JSON.stringify(produced), { ...expected, connectionEpoch: undefined })).toBe(false);
    expect(matchesStoryMarker(JSON.stringify(produced), { ...expected, requestId: undefined })).toBe(false);
    expect(matchesStoryMarker(JSON.stringify(produced), { ...expected, markerVersion: undefined })).toBe(false);
  });
});
