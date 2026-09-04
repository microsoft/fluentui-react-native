import type {
  DesktopStoryManifest,
  StoryOrchestrator,
  StoryReadyResult,
  StorySelectionRequest,
} from '@fluentui-react-native/desktop-driver';

import type { DesktopStorybookDriverManifest } from './driverManifest.js';

type ChannelMessage = {
  args?: unknown[];
  type?: string;
};

type ChannelClient = {
  readyState: number;
  on(event: 'close', listener: () => void): void;
  on(event: 'message', listener: (data: unknown) => void): void;
  send(message: string): void;
};

export type StorybookChannelServer = {
  clients: Iterable<ChannelClient>;
  on(event: 'connection', listener: (client: ChannelClient) => void): void;
};

export type StorybookChannelOrchestratorOptions = {
  channelServer: StorybookChannelServer;
  driverManifest: DesktopStorybookDriverManifest;
  fetch?: typeof globalThis.fetch;
  serverUrl: string;
  timeoutMs?: number;
};

type PendingSelection = {
  reject(error: Error): void;
  request: StorySelectionRequest;
  resolve(result: StoryReadyResult): void;
  timer: ReturnType<typeof setTimeout>;
};

export class StorybookChannelOrchestrator implements StoryOrchestrator {
  private readonly driverManifest: DesktopStorybookDriverManifest;
  private readonly fetch: typeof globalThis.fetch;
  private readonly serverUrl: string;
  private readonly timeoutMs: number;
  private readonly pending = new Map<string, PendingSelection>();
  private readonly bridgeWaiters = new Set<() => void>();
  private bridgeConnected = false;
  private bridgeClient?: ChannelClient;
  private currentStory: StoryReadyResult | null = null;

  constructor({
    channelServer,
    driverManifest,
    fetch = globalThis.fetch,
    serverUrl,
    timeoutMs = 60_000,
  }: StorybookChannelOrchestratorOptions) {
    this.driverManifest = driverManifest;
    this.fetch = fetch;
    this.serverUrl = serverUrl.replace(/\/$/, '');
    this.timeoutMs = timeoutMs;
    channelServer.on('connection', (client) => this.attachClient(client));
    for (const client of channelServer.clients) {
      this.attachClient(client);
    }
  }

  async getManifest(): Promise<DesktopStoryManifest> {
    return this.driverManifest.storyManifest;
  }

  async getCurrentStory(): Promise<StoryReadyResult | null> {
    return this.currentStory;
  }

  async selectStory(request: StorySelectionRequest): Promise<StoryReadyResult> {
    this.requireStory(request.storyId);
    await this.waitForBridge();
    const ready = this.waitForReady(request);
    void ready.catch(() => undefined);
    this.broadcast('furn:desktop:prepare-story', request);
    try {
      const response = await this.fetch(`${this.serverUrl}/select-story-sync/${encodeURIComponent(request.storyId)}`, {
        method: 'POST',
      });
      if (!response.ok && response.status !== 408) {
        throw new Error(`Storybook failed to select "${request.storyId}" with status ${response.status}.`);
      }
      return await ready;
    } catch (error) {
      this.cancelPending(request.requestId);
      throw error;
    }
  }

  async resetStory(request: StorySelectionRequest): Promise<StoryReadyResult> {
    this.requireStory(request.storyId);
    await this.waitForBridge();
    const ready = this.waitForReady(request);
    void ready.catch(() => undefined);
    try {
      this.broadcast('furn:desktop:prepare-story', request);
      return ready;
    } catch (error) {
      this.cancelPending(request.requestId);
      throw error;
    }
  }

  async updateArgs(storyId: string, args: Readonly<Record<string, unknown>>): Promise<void> {
    this.requireStory(storyId);
    this.broadcast('updateStoryArgs', { storyId, updatedArgs: args });
  }

  private attachClient(client: ChannelClient): void {
    client.on('message', (data) => this.onMessage(client, data));
    client.on('close', () => {
      if (this.bridgeClient === client) {
        this.bridgeClient = undefined;
        this.bridgeConnected = false;
      }
    });
    if (client.readyState === 1) {
      client.send(JSON.stringify({ type: 'furn:desktop:request-hello', args: [] }));
    }
  }

  private onMessage(client: ChannelClient, data: unknown): void {
    let message: ChannelMessage;
    try {
      const text = typeof data === 'string' ? data : Buffer.isBuffer(data) ? data.toString('utf8') : String(data);
      message = JSON.parse(text) as ChannelMessage;
    } catch {
      return;
    }
    const payload = message.args?.[0];
    if (!payload || typeof payload !== 'object') {
      return;
    }
    if (message.type === 'furn:desktop:hello') {
      this.acceptHello(client, payload as Record<string, unknown>);
    } else if (message.type === 'furn:desktop:story-ready') {
      this.acceptReady(client, payload as Record<string, unknown>);
    } else if (message.type === 'furn:desktop:story-error') {
      this.acceptError(client, payload as Record<string, unknown>);
    }
  }

  private acceptHello(client: ChannelClient, payload: Record<string, unknown>): void {
    const expected = this.driverManifest;
    if (
      payload.version !== 1 ||
      payload.instanceId !== expected.instanceId ||
      payload.endpoint !== expected.endpoint ||
      payload.targetId !== expected.targetId ||
      payload.catalogSetDigest !== expected.catalogSetDigest ||
      payload.platformManifestDigest !== expected.platformManifestDigest ||
      payload.nonce !== expected.bridgeNonce
    ) {
      return;
    }
    if (this.bridgeClient && this.bridgeClient !== client) {
      return;
    }
    this.bridgeClient = client;
    this.bridgeConnected = true;
    for (const resolve of this.bridgeWaiters) {
      resolve();
    }
    this.bridgeWaiters.clear();
  }

  private acceptReady(client: ChannelClient, payload: Record<string, unknown>): void {
    if (client !== this.bridgeClient) {
      return;
    }
    const requestId = payload.requestId;
    if (
      typeof requestId !== 'string' ||
      typeof payload.runId !== 'string' ||
      typeof payload.storyId !== 'string' ||
      typeof payload.previewGeneration !== 'number' ||
      payload.portablePlanDigest !== this.driverManifest.portablePlanDigest
    ) {
      return;
    }
    const pending = this.pending.get(requestId);
    if (!pending) {
      return;
    }
    if (payload.runId !== pending.request.runId || payload.storyId !== pending.request.storyId) {
      return;
    }
    const result = {
      previewGeneration: payload.previewGeneration,
      runId: payload.runId,
      storyId: payload.storyId,
    };
    clearTimeout(pending.timer);
    this.pending.delete(requestId);
    this.currentStory = result;
    pending.resolve(result);
  }

  private acceptError(client: ChannelClient, payload: Record<string, unknown>): void {
    if (
      client !== this.bridgeClient ||
      typeof payload.requestId !== 'string' ||
      typeof payload.runId !== 'string' ||
      typeof payload.storyId !== 'string'
    ) {
      return;
    }
    const pending = this.pending.get(payload.requestId);
    if (!pending || pending.request.runId !== payload.runId || pending.request.storyId !== payload.storyId) {
      return;
    }
    this.rejectPending(
      payload.requestId,
      new Error(typeof payload.message === 'string' ? payload.message : 'The Storybook runtime failed to render the story.'),
    );
  }

  private waitForBridge(): Promise<void> {
    if (this.bridgeConnected) {
      return Promise.resolve();
    }
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.bridgeWaiters.delete(onReady);
        reject(new Error('Timed out waiting for the authenticated Storybook runtime bridge.'));
      }, this.timeoutMs);
      const onReady = () => {
        clearTimeout(timer);
        resolve();
      };
      this.bridgeWaiters.add(onReady);
    });
  }

  private waitForReady(request: StorySelectionRequest): Promise<StoryReadyResult> {
    if (this.pending.has(request.requestId)) {
      throw new Error(`Story selection request "${request.requestId}" is already pending.`);
    }
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(request.requestId);
        reject(new Error(`Timed out waiting for Storybook story "${request.storyId}" run "${request.runId}".`));
      }, this.timeoutMs);
      this.pending.set(request.requestId, { reject, request, resolve, timer });
    });
  }

  private rejectPending(requestId: string, error: Error): void {
    const pending = this.pending.get(requestId);
    if (!pending) {
      return;
    }
    clearTimeout(pending.timer);
    this.pending.delete(requestId);
    pending.reject(error);
  }

  private cancelPending(requestId: string): void {
    const pending = this.pending.get(requestId);
    if (!pending) {
      return;
    }
    clearTimeout(pending.timer);
    this.pending.delete(requestId);
  }

  private requireStory(storyId: string): void {
    if (!this.driverManifest.storyManifest.entries.some(({ id }) => id === storyId)) {
      throw new Error(`Story "${storyId}" is not present in the ${this.driverManifest.endpoint} manifest.`);
    }
  }

  private broadcast(type: string, payload: unknown): void {
    const message = JSON.stringify({ type, args: [payload] });
    if (!this.bridgeClient || this.bridgeClient.readyState !== 1) {
      throw new Error('The authenticated Storybook runtime bridge is not connected.');
    }
    this.bridgeClient.send(message);
  }
}
