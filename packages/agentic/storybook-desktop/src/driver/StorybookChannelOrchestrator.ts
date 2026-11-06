import { randomUUID } from 'node:crypto';

import type {
  DesktopStoryManifest,
  StoryOrchestrator,
  StoryProviderContext,
  StoryReadyResult,
  StorySelectionRequest,
} from '@fluentui-react-native/desktop-driver/storybook';
import { StoryBridgeUnavailableError, StoryProviderError } from '@fluentui-react-native/desktop-driver/storybook';

import type { DesktopStorybookDriverManifest } from './driverManifest.js';
import { BridgeEpochJournal, type BridgeEpochRecovery } from './BridgeEpochJournal.js';
import { writeDesktopStorybookFailure, type DesktopStorybookErrorOutput } from '../../config/diagnostics.cjs';

type ChannelMessage = { args?: unknown[]; type?: string };
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
  errorOutput?: DesktopStorybookErrorOutput;
  recovery?: BridgeEpochRecovery;
  /** Exclusive transport: dispatch only to the authenticated runtime, never upstream HTTP. */
  controlled?: boolean;
};

type PendingSelection = {
  epoch: string;
  reject(error: Error): void;
  request: StorySelectionRequest;
  resolve(result: StoryReadyResult): void;
};

export class StorybookChannelOrchestrator implements StoryOrchestrator {
  private readonly driverManifest: DesktopStorybookDriverManifest;
  private readonly fetch: typeof globalThis.fetch;
  private readonly serverUrl: string;
  private readonly timeoutMs: number;
  private readonly errorOutput: DesktopStorybookErrorOutput;
  private readonly controlled: boolean;
  private readonly pending = new Map<string, PendingSelection>();
  private readonly epochs = new WeakMap<ChannelClient, string>();
  private readonly usedRequests = new WeakMap<ChannelClient, Set<string>>();
  private readonly initializedClients = new WeakSet<ChannelClient>();
  private readonly fencedClients = new WeakSet<ChannelClient>();
  private readonly recordedClients = new WeakSet<ChannelClient>();
  private readonly recordings = new WeakMap<ChannelClient, Promise<void>>();
  private readonly journal?: BridgeEpochJournal;
  private bridgeClient?: ChannelClient;
  private bridgeConnected = false;
  private needsRelaunch = false;
  private selectionSequence = 0;
  private currentStory: StoryReadyResult | null = null;

  constructor({
    channelServer,
    driverManifest,
    fetch = globalThis.fetch,
    serverUrl,
    timeoutMs = 30_000,
    errorOutput = process.stderr,
    recovery,
    controlled = driverManifest.agent !== undefined,
  }: StorybookChannelOrchestratorOptions) {
    this.driverManifest = driverManifest;
    this.fetch = fetch;
    this.serverUrl = serverUrl.replace(/\/$/, '');
    this.timeoutMs = timeoutMs;
    this.errorOutput = errorOutput;
    this.controlled = driverManifest.agent !== undefined || controlled;
    this.journal = recovery
      ? new BridgeEpochJournal(recovery, {
          endpoint: driverManifest.endpoint,
          renderer: driverManifest.renderer,
          targetId: driverManifest.targetId,
        })
      : undefined;
    channelServer.on('connection', (client) => this.attachClient(client));
    for (const client of channelServer.clients) this.attachClient(client);
  }

  async getManifest(context?: StoryProviderContext): Promise<DesktopStoryManifest> {
    context?.signal.throwIfAborted();
    return this.driverManifest.storyManifest;
  }

  async getCurrentStory(context?: StoryProviderContext): Promise<StoryReadyResult | null> {
    context?.signal.throwIfAborted();
    return this.bridgeConnected ? this.currentStory : null;
  }

  async selectStory(request: StorySelectionRequest, context?: StoryProviderContext): Promise<StoryReadyResult> {
    try {
      return await this.selectAndPrepareStory(request, context);
    } catch (error) {
      writeDesktopStorybookFailure(`navigation "${request.storyId}" (run ${request.runId})`, error, this.errorOutput);
      throw error;
    }
  }

  private async selectAndPrepareStory(request: StorySelectionRequest, context?: StoryProviderContext): Promise<StoryReadyResult> {
    this.requireStory(request.storyId);
    if (context?.signal.aborted) throw new StoryProviderError('Story selection was cancelled before dispatch.', 'none');
    if (this.journal) await this.checkBridgeRecovery();
    if (context?.signal.aborted) throw new StoryProviderError('Story selection was cancelled before dispatch.', 'none');
    const client = this.requireBridge();
    const epoch = this.epochs.get(client)!;
    if (this.pending.size) throw new StoryProviderError('A Storybook selection is already pending.', 'none');
    let used = this.usedRequests.get(client);
    if (!used) {
      used = new Set();
      this.usedRequests.set(client, used);
    }
    if (used.has(request.requestId)) throw new StoryProviderError('Story request IDs cannot be reused within a connection epoch.', 'none');
    used.add(request.requestId);
    const controller = new AbortController();
    let dispatched = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let stop!: (error: Error) => void;
    const failure = new Promise<never>((_resolve, reject) => {
      stop = reject;
    });
    void failure.catch(() => undefined);
    const ready = new Promise<StoryReadyResult>((resolve) => {
      this.pending.set(request.requestId, { epoch, reject: stop, request, resolve });
    });
    const onAbort = () => stop(new Error('Story selection was cancelled.'));
    context?.signal.addEventListener('abort', onAbort, { once: true });
    try {
      timer = setTimeout(() => stop(new Error('Timed out navigating to the Storybook story.')), this.timeoutMs);
      this.currentStory = null;
      dispatched = true;
      client.send(
        JSON.stringify({
          type: 'furn:desktop:prepare-story',
          args: [{ ...request, connectionEpoch: epoch, selectionSequence: ++this.selectionSequence }],
        }),
      );
      const navigation = this.controlled
        ? Promise.resolve(client.send(JSON.stringify({ type: 'setCurrentStory', args: [{ storyId: request.storyId, viewMode: 'story' }] })))
        : this.fetch(`${this.serverUrl}/select-story-sync/${encodeURIComponent(request.storyId)}`, {
            method: 'POST',
            signal: controller.signal,
          }).then(async (response) => {
            if (!response.ok && response.status !== 408) {
              const detail = await response.text();
              throw new Error(
                `Storybook failed to select "${request.storyId}" with status ${response.status}${detail ? `: ${detail}` : '.'}`,
              );
            }
          });
      const [, result] = await Promise.race([Promise.all([navigation, ready]), failure]);
      this.currentStory = result;
      return result;
    } catch (error) {
      this.currentStory = null;
      if (dispatched) {
        // A dispatched setCurrentStory may still render after cancellation, on either transport.
        this.needsRelaunch = true;
        this.bridgeConnected = false;
        this.fencedClients.add(client);
        if (client.readyState === 1) {
          try {
            client.send(JSON.stringify({ type: 'furn:desktop:cancel-story', args: [{ ...request, connectionEpoch: epoch }] }));
          } catch (cancelError) {
            writeDesktopStorybookFailure('cancelling an uncertain selection', cancelError, this.errorOutput);
          }
        }
      }
      throw new StoryProviderError(error instanceof Error ? error.message : 'Story selection failed.', dispatched ? 'unknown' : 'none');
    } finally {
      clearTimeout(timer);
      controller.abort();
      context?.signal.removeEventListener('abort', onAbort);
      this.pending.delete(request.requestId);
    }
  }

  resetStory(request: StorySelectionRequest, context?: StoryProviderContext): Promise<StoryReadyResult> {
    return this.selectStory(request, context);
  }

  async updateArgs(storyId: string, args: Readonly<Record<string, unknown>>, context?: StoryProviderContext): Promise<void> {
    if (this.controlled)
      throw new StoryProviderError('story-args-unsupported: Story args are unsupported on a controlled Storybook service.', 'none');
    if (context?.signal.aborted) throw new StoryProviderError('Story args update was cancelled before dispatch.', 'none');
    this.requireStory(storyId);
    if (this.journal) await this.checkBridgeRecovery();
    if (context?.signal.aborted) throw new StoryProviderError('Story args update was cancelled before dispatch.', 'none');
    const client = this.requireBridge();
    this.currentStory = null;
    client.send(JSON.stringify({ type: 'updateStoryArgs', args: [{ storyId, updatedArgs: args }] }));
  }

  private attachClient(client: ChannelClient): void {
    const epoch = randomUUID();
    this.epochs.set(client, epoch);
    client.on('message', (data) => this.onMessage(client, data));
    client.on('close', () => {
      this.epochs.delete(client);
      this.initializedClients.delete(client);
      if (this.bridgeClient !== client) return;
      this.bridgeClient = undefined;
      this.bridgeConnected = false;
      this.needsRelaunch = true;
      this.currentStory = null;
      for (const pending of this.pending.values()) pending.reject(new Error('The authenticated Storybook runtime bridge disconnected.'));
    });
    if (client.readyState === 1) {
      client.send(JSON.stringify({ type: 'furn:desktop:request-hello', args: [{ connectionEpoch: epoch, version: 2 }] }));
    }
  }

  private onMessage(client: ChannelClient, data: unknown): void {
    if (!this.epochs.has(client) || client.readyState !== 1) return;
    let message: ChannelMessage;
    try {
      const text = typeof data === 'string' ? data : Buffer.isBuffer(data) ? data.toString('utf8') : String(data);
      message = JSON.parse(text) as ChannelMessage;
    } catch {
      return;
    }
    if (!message || typeof message !== 'object' || !Array.isArray(message.args)) return;
    const payload = message.args[0];
    if (message.type === 'furn:desktop:request-challenge') {
      client.send(
        JSON.stringify({
          type: 'furn:desktop:request-hello',
          args: [{ connectionEpoch: this.epochs.get(client), version: 2 }],
        }),
      );
      return;
    }
    if (message.type === 'storyRendered' && typeof payload === 'string') {
      this.initializedClients.add(client);
      this.initializeBridge(client);
      return;
    }
    if (!payload || typeof payload !== 'object') return;
    const fields = payload as Record<string, unknown>;
    if (message.type === 'furn:desktop:hello') this.acceptHello(client, fields);
    else if (message.type === 'furn:desktop:story-ready') this.acceptReady(client, fields);
    else if (message.type === 'furn:desktop:story-error') this.acceptError(client, fields);
  }

  private acceptHello(client: ChannelClient, payload: Record<string, unknown>): void {
    const expected = this.driverManifest;
    if (
      payload.version !== 2 ||
      payload.connectionEpoch !== this.epochs.get(client) ||
      payload.instanceId !== expected.instanceId ||
      payload.endpoint !== expected.endpoint ||
      payload.targetId !== expected.targetId ||
      payload.platformManifestDigest !== expected.platformManifestDigest ||
      payload.nonce !== expected.bridgeNonce ||
      (this.bridgeClient && this.bridgeClient !== client)
    )
      return;
    this.bridgeClient = client;
    if (this.journal) this.recordBridge(client);
    this.initializeBridge(client);
  }

  private recordBridge(client: ChannelClient): Promise<void> {
    const existing = this.recordings.get(client);
    if (existing) return existing;
    const epoch = this.epochs.get(client);
    if (!this.journal || !epoch) return Promise.resolve();
    const recording = this.journal.record(epoch).then(() => {
      this.recordedClients.add(client);
      this.initializeBridge(client);
    });
    this.recordings.set(client, recording);
    void recording.catch((error: unknown) => {
      this.recordings.delete(client);
      writeDesktopStorybookFailure('recording the authenticated bridge epoch', error, this.errorOutput);
    });
    return recording;
  }

  private async checkBridgeRecovery(): Promise<void> {
    const client = this.bridgeClient;
    if (client && client.readyState === 1 && !this.fencedClients.has(client)) {
      try {
        await this.recordBridge(client);
      } catch {
        // The recording path reports the storage/identity failure; it must never enable dispatch.
        throw new StoryBridgeUnavailableError(this.driverManifest.endpoint, this.driverManifest.renderer, 'bridge-unavailable');
      }
      return;
    }
    let relaunch = false;
    try {
      relaunch = await this.journal!.requiresRelaunch();
    } catch (error) {
      writeDesktopStorybookFailure('checking the authenticated bridge incarnation', error, this.errorOutput);
    }
    throw new StoryBridgeUnavailableError(
      this.driverManifest.endpoint,
      this.driverManifest.renderer,
      relaunch ? 'relaunch-required' : 'bridge-unavailable',
    );
  }

  private initializeBridge(client: ChannelClient): void {
    if (
      client !== this.bridgeClient ||
      !this.initializedClients.has(client) ||
      this.pending.size ||
      this.fencedClients.has(client) ||
      (this.journal && !this.recordedClients.has(client))
    )
      return;
    this.bridgeConnected = true;
    this.needsRelaunch = false;
  }

  private correlatedPending(client: ChannelClient, payload: Record<string, unknown>): PendingSelection | undefined {
    if (client !== this.bridgeClient || typeof payload.requestId !== 'string') return undefined;
    const pending = this.pending.get(payload.requestId);
    return pending &&
      payload.connectionEpoch === pending.epoch &&
      payload.runId === pending.request.runId &&
      payload.storyId === pending.request.storyId
      ? pending
      : undefined;
  }

  private acceptReady(client: ChannelClient, payload: Record<string, unknown>): void {
    const pending = this.correlatedPending(client, payload);
    if (
      !pending ||
      payload.markerVersion !== 1 ||
      !Number.isSafeInteger(payload.previewGeneration) ||
      (payload.previewGeneration as number) < 1 ||
      payload.portablePlanDigest !== this.driverManifest.portablePlanDigest
    )
      return;
    pending.resolve({
      connectionEpoch: pending.epoch,
      markerVersion: 1,
      previewGeneration: payload.previewGeneration as number,
      ...pending.request,
    });
  }

  private acceptError(client: ChannelClient, payload: Record<string, unknown>): void {
    this.correlatedPending(client, payload)?.reject(new Error('The Storybook runtime failed to render the story.'));
    if (
      client === this.bridgeClient &&
      this.currentStory &&
      payload.connectionEpoch === this.currentStory.connectionEpoch &&
      payload.requestId === this.currentStory.requestId &&
      payload.runId === this.currentStory.runId &&
      payload.storyId === this.currentStory.storyId
    ) {
      this.currentStory = null;
      this.needsRelaunch = true;
      this.bridgeConnected = false;
      this.fencedClients.add(client);
    }
  }

  private requireStory(storyId: string): void {
    if (!this.driverManifest.storyManifest.entries.some(({ id }) => id === storyId)) {
      throw new StoryProviderError(`Story "${storyId}" is not present in the ${this.driverManifest.endpoint} manifest.`, 'none');
    }
  }

  private requireBridge(): ChannelClient {
    if (!this.bridgeConnected || !this.bridgeClient || this.bridgeClient.readyState !== 1 || this.needsRelaunch) {
      throw new StoryBridgeUnavailableError(
        this.driverManifest.endpoint,
        this.driverManifest.renderer,
        this.needsRelaunch ? 'relaunch-required' : 'bridge-unavailable',
      );
    }
    return this.bridgeClient;
  }
}
